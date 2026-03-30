import { FileStorageService } from '../../services/fileStorageService';
import { S3StorageProvider } from '../../services/storage/s3StorageProvider';
import { FileCategory } from '../../types/fileStorage';

// Mock the S3StorageProvider
jest.mock('../../services/storage/s3StorageProvider');
jest.mock('../../config', () => ({
  fileStorage: {
    provider: 's3',
  },
}));

describe('FileStorageService - Deletion and Cleanup', () => {
  let fileStorageService: FileStorageService;
  let mockProvider: jest.Mocked<S3StorageProvider>;

  beforeEach(() => {
    jest.clearAllMocks();
    fileStorageService = new FileStorageService();
    mockProvider = (fileStorageService as any).provider as jest.Mocked<S3StorageProvider>;
  });

  describe('deleteFile', () => {
    it('should delete a file successfully with audit logging', async () => {
      const key = 'employees/emp1/document/2024-01-01/test.pdf';
      const userContext = {
        userId: 'user1',
        role: 'employee',
        employeeId: 'emp1',
      };

      mockProvider.fileExists.mockResolvedValue(true);
      mockProvider.deleteFile.mockResolvedValue();

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await fileStorageService.deleteFile(key, userContext);

      expect(mockProvider.fileExists).toHaveBeenCalledWith(key);
      expect(mockProvider.deleteFile).toHaveBeenCalledWith(key);
      expect(consoleSpy).toHaveBeenCalledWith('File Deletion:', expect.objectContaining({
        userId: 'user1',
        role: 'employee',
        employeeId: 'emp1',
        fileKey: key,
        action: 'delete',
      }));

      consoleSpy.mockRestore();
    });

    it('should throw error if file does not exist', async () => {
      const key = 'nonexistent/file.pdf';
      const userContext = {
        userId: 'user1',
        role: 'employee',
        employeeId: 'emp1',
      };

      mockProvider.fileExists.mockResolvedValue(false);

      await expect(fileStorageService.deleteFile(key, userContext))
        .rejects.toThrow('File not found');

      expect(mockProvider.deleteFile).not.toHaveBeenCalled();
    });

    it('should work without user context', async () => {
      const key = 'employees/emp1/document/2024-01-01/test.pdf';

      mockProvider.fileExists.mockResolvedValue(true);
      mockProvider.deleteFile.mockResolvedValue();

      await fileStorageService.deleteFile(key);

      expect(mockProvider.fileExists).toHaveBeenCalledWith(key);
      expect(mockProvider.deleteFile).toHaveBeenCalledWith(key);
    });
  });

  describe('deleteFiles', () => {
    it('should use provider bulk delete when available', async () => {
      const keys = ['file1.pdf', 'file2.pdf', 'file3.pdf'];
      const userContext = {
        userId: 'user1',
        role: 'admin',
        employeeId: 'emp1',
      };

      const mockResult = {
        deleted: ['file1.pdf', 'file2.pdf'],
        failed: [{ key: 'file3.pdf', error: 'Access denied' }],
      };

      mockProvider.deleteFiles = jest.fn().mockResolvedValue(mockResult);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await fileStorageService.deleteFiles(keys, userContext);

      expect(mockProvider.deleteFiles).toHaveBeenCalledWith(keys);
      expect(result).toEqual(mockResult);
      expect(consoleSpy).toHaveBeenCalledWith('Bulk File Deletion:', expect.objectContaining({
        userId: 'user1',
        role: 'admin',
        fileCount: 3,
        action: 'bulk_delete',
      }));

      consoleSpy.mockRestore();
    });

    it('should fall back to individual deletions when bulk delete not available', async () => {
      const keys = ['file1.pdf', 'file2.pdf'];
      const userContext = {
        userId: 'user1',
        role: 'admin',
        employeeId: 'emp1',
      };

      // Don't set deleteFiles method to simulate fallback
      mockProvider.deleteFiles = undefined;
      mockProvider.fileExists.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
      mockProvider.deleteFile.mockResolvedValue();

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await fileStorageService.deleteFiles(keys, userContext);

      expect(result.deleted).toEqual(['file1.pdf']);
      expect(result.failed).toEqual([{ key: 'file2.pdf', error: 'File not found' }]);
      expect(mockProvider.deleteFile).toHaveBeenCalledWith('file1.pdf');

      consoleSpy.mockRestore();
    });

    it('should handle deletion errors gracefully', async () => {
      const keys = ['file1.pdf', 'file2.pdf'];
      const userContext = {
        userId: 'user1',
        role: 'admin',
        employeeId: 'emp1',
      };

      mockProvider.deleteFiles = undefined;
      mockProvider.fileExists.mockResolvedValue(true);
      mockProvider.deleteFile
        .mockResolvedValueOnce()
        .mockRejectedValueOnce(new Error('S3 error'));

      const result = await fileStorageService.deleteFiles(keys, userContext);

      expect(result.deleted).toEqual(['file1.pdf']);
      expect(result.failed).toEqual([{ key: 'file2.pdf', error: 'S3 error' }]);
    });
  });

  describe('cleanupFiles', () => {
    it('should clean up files based on criteria with audit logging', async () => {
      const options = {
        olderThan: new Date('2023-01-01'),
        category: FileCategory.DOCUMENT,
        dryRun: false,
      };
      const userContext = {
        userId: 'admin1',
        role: 'super_admin',
        employeeId: 'admin1',
      };

      const mockFiles = [
        {
          id: '1',
          key: 'employees/emp1/document/2022-12-01/old.pdf',
          category: FileCategory.DOCUMENT,
          uploadedAt: new Date('2022-12-01'),
          employeeId: 'emp1',
        },
        {
          id: '2',
          key: 'employees/emp1/document/2023-06-01/new.pdf',
          category: FileCategory.DOCUMENT,
          uploadedAt: new Date('2023-06-01'),
          employeeId: 'emp1',
        },
      ] as any;

      mockProvider.listFiles.mockResolvedValue(mockFiles);
      mockProvider.deleteFile.mockResolvedValue();

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await fileStorageService.cleanupFiles(options, userContext);

      expect(result.deletedCount).toBe(1);
      expect(result.deletedFiles).toEqual(['employees/emp1/document/2022-12-01/old.pdf']);
      expect(result.errors).toEqual([]);
      expect(mockProvider.deleteFile).toHaveBeenCalledWith('employees/emp1/document/2022-12-01/old.pdf');
      expect(consoleSpy).toHaveBeenCalledWith('File Cleanup Started:', expect.objectContaining({
        userId: 'admin1',
        role: 'super_admin',
        action: 'cleanup_start',
      }));

      consoleSpy.mockRestore();
    });

    it('should perform dry run without deleting files', async () => {
      const options = {
        olderThan: new Date('2023-01-01'),
        dryRun: true,
      };
      const userContext = {
        userId: 'admin1',
        role: 'super_admin',
        employeeId: 'admin1',
      };

      const mockFiles = [
        {
          id: '1',
          key: 'employees/emp1/document/2022-12-01/old.pdf',
          category: FileCategory.DOCUMENT,
          uploadedAt: new Date('2022-12-01'),
          employeeId: 'emp1',
        },
      ] as any;

      mockProvider.listFiles.mockResolvedValue(mockFiles);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await fileStorageService.cleanupFiles(options, userContext);

      expect(result.deletedCount).toBe(1);
      expect(result.deletedFiles).toEqual(['employees/emp1/document/2022-12-01/old.pdf']);
      expect(mockProvider.deleteFile).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('File Cleanup Dry Run:', expect.objectContaining({
        wouldDeleteCount: 1,
        action: 'cleanup_dry_run',
      }));

      consoleSpy.mockRestore();
    });

    it('should filter files by employee ID', async () => {
      const options = {
        employeeId: 'emp1',
        dryRun: true,
      };

      const mockFiles = [
        {
          id: '1',
          key: 'employees/emp1/document/2022-12-01/file1.pdf',
          category: FileCategory.DOCUMENT,
          uploadedAt: new Date('2022-12-01'),
          employeeId: 'emp1',
        },
        {
          id: '2',
          key: 'employees/emp2/document/2022-12-01/file2.pdf',
          category: FileCategory.DOCUMENT,
          uploadedAt: new Date('2022-12-01'),
          employeeId: 'emp2',
        },
      ] as any;

      mockProvider.listFiles.mockResolvedValue(mockFiles);

      const result = await fileStorageService.cleanupFiles(options);

      expect(result.deletedCount).toBe(1);
      expect(result.deletedFiles).toEqual(['employees/emp1/document/2022-12-01/file1.pdf']);
    });

    it('should handle cleanup errors gracefully', async () => {
      const options = {
        olderThan: new Date('2023-01-01'),
        dryRun: false,
      };

      const mockFiles = [
        {
          id: '1',
          key: 'employees/emp1/document/2022-12-01/old.pdf',
          category: FileCategory.DOCUMENT,
          uploadedAt: new Date('2022-12-01'),
          employeeId: 'emp1',
        },
      ] as any;

      mockProvider.listFiles.mockResolvedValue(mockFiles);
      mockProvider.deleteFile.mockRejectedValue(new Error('Delete failed'));

      const result = await fileStorageService.cleanupFiles(options);

      expect(result.deletedCount).toBe(0);
      expect(result.deletedFiles).toEqual([]);
      expect(result.errors).toEqual([{
        key: 'employees/emp1/document/2022-12-01/old.pdf',
        error: 'Delete failed',
      }]);
    });
  });

  describe('cleanupOrphanedMultipartUploads', () => {
    it('should use provider cleanup method when available', async () => {
      const olderThanHours = 48;
      const userContext = {
        userId: 'admin1',
        role: 'super_admin',
        employeeId: 'admin1',
      };

      const mockResult = {
        abortedCount: 3,
        errors: [{ uploadId: 'upload1', error: 'Failed to abort' }],
      };

      mockProvider.cleanupOrphanedMultipartUploads = jest.fn().mockResolvedValue(mockResult);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await fileStorageService.cleanupOrphanedMultipartUploads(olderThanHours, userContext);

      expect(mockProvider.cleanupOrphanedMultipartUploads).toHaveBeenCalledWith(olderThanHours);
      expect(result).toEqual(mockResult);
      expect(consoleSpy).toHaveBeenCalledWith('Multipart Cleanup Started:', expect.objectContaining({
        userId: 'admin1',
        role: 'super_admin',
        olderThanHours: 48,
        action: 'multipart_cleanup_start',
      }));

      consoleSpy.mockRestore();
    });

    it('should return empty result when provider method not available', async () => {
      const userContext = {
        userId: 'admin1',
        role: 'super_admin',
        employeeId: 'admin1',
      };

      // Don't set the cleanup method
      mockProvider.cleanupOrphanedMultipartUploads = undefined;

      const result = await fileStorageService.cleanupOrphanedMultipartUploads(24, userContext);

      expect(result).toEqual({
        abortedCount: 0,
        errors: [],
      });
    });
  });

  describe('cleanupOrphanedFiles', () => {
    it('should identify potential orphaned files', async () => {
      const userContext = {
        userId: 'admin1',
        role: 'super_admin',
        employeeId: 'admin1',
      };

      const thirtyOneDaysAgo = new Date();
      thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

      const mockFiles = [
        {
          id: '1',
          key: 'employees/emp1/document/old/orphaned.pdf',
          category: FileCategory.DOCUMENT,
          uploadedAt: thirtyOneDaysAgo,
          employeeId: 'emp1',
          metadata: {}, // Empty metadata suggests orphaned file
        },
        {
          id: '2',
          key: 'employees/emp1/document/recent/normal.pdf',
          category: FileCategory.DOCUMENT,
          uploadedAt: new Date(),
          employeeId: 'emp1',
          metadata: { documentId: 'doc123' },
        },
      ] as any;

      mockProvider.listFiles.mockResolvedValue(mockFiles);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await fileStorageService.cleanupOrphanedFiles(userContext, true);

      expect(result.orphanedCount).toBe(1);
      expect(result.deletedCount).toBe(0); // Dry run
      expect(result.errors).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Orphaned File Cleanup Started:', expect.objectContaining({
        userId: 'admin1',
        role: 'super_admin',
        dryRun: true,
        action: 'orphaned_cleanup_start',
      }));

      consoleSpy.mockRestore();
    });

    it('should delete orphaned files when not in dry run mode', async () => {
      const userContext = {
        userId: 'admin1',
        role: 'super_admin',
        employeeId: 'admin1',
      };

      const thirtyOneDaysAgo = new Date();
      thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

      const mockFiles = [
        {
          id: '1',
          key: 'employees/emp1/document/old/orphaned.pdf',
          category: FileCategory.DOCUMENT,
          uploadedAt: thirtyOneDaysAgo,
          employeeId: 'emp1',
          metadata: {},
        },
      ] as any;

      mockProvider.listFiles.mockResolvedValue(mockFiles);
      mockProvider.deleteFile.mockResolvedValue();

      const result = await fileStorageService.cleanupOrphanedFiles(userContext, false);

      expect(result.orphanedCount).toBe(1);
      expect(result.deletedCount).toBe(1);
      expect(result.errors).toEqual([]);
      expect(mockProvider.deleteFile).toHaveBeenCalledWith('employees/emp1/document/old/orphaned.pdf');
    });

    it('should handle deletion errors during orphaned file cleanup', async () => {
      const userContext = {
        userId: 'admin1',
        role: 'super_admin',
        employeeId: 'admin1',
      };

      const thirtyOneDaysAgo = new Date();
      thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

      const mockFiles = [
        {
          id: '1',
          key: 'employees/emp1/document/old/orphaned.pdf',
          category: FileCategory.DOCUMENT,
          uploadedAt: thirtyOneDaysAgo,
          employeeId: 'emp1',
          metadata: {},
        },
      ] as any;

      mockProvider.listFiles.mockResolvedValue(mockFiles);
      mockProvider.deleteFile.mockRejectedValue(new Error('Delete failed'));

      const result = await fileStorageService.cleanupOrphanedFiles(userContext, false);

      expect(result.orphanedCount).toBe(1);
      expect(result.deletedCount).toBe(0);
      expect(result.errors).toEqual([{
        key: 'employees/emp1/document/old/orphaned.pdf',
        error: 'Delete failed',
      }]);
    });
  });
});