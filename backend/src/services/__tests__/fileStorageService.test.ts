import { FileStorageService } from '../fileStorageService';
import { FileCategory } from '../../types/fileStorage';

// Mock the S3StorageProvider
jest.mock('../storage/s3StorageProvider', () => ({
  S3StorageProvider: jest.fn().mockImplementation(() => ({
    uploadFile: jest.fn(),
    downloadFile: jest.fn(),
    deleteFile: jest.fn(),
    getSignedUrl: jest.fn(),
    fileExists: jest.fn(),
    listFiles: jest.fn(),
    initiateMultipartUpload: jest.fn(),
    uploadPart: jest.fn(),
    completeMultipartUpload: jest.fn(),
    abortMultipartUpload: jest.fn(),
  })),
}));

// Mock config
jest.mock('../../config', () => ({
  default: {
    fileStorage: {
      provider: 's3',
    },
    upload: {
      maxFileSize: 10485760, // 10MB
      allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    },
    logging: { level: 'info' },
  },
}));

describe('FileStorageService', () => {
  let fileStorageService: FileStorageService;
  let mockProvider: any;

  beforeEach(() => {
    fileStorageService = new FileStorageService();
    mockProvider = (fileStorageService as any).provider;
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload a valid file successfully', async () => {
      const fileBuffer = Buffer.from('test file content');
      const originalName = 'test.pdf';
      const options = {
        employeeId: 'emp-123',
        category: FileCategory.DOCUMENT,
        isPublic: false,
      };

      const expectedResult = {
        id: 'file-123',
        url: 'https://example.com/file.pdf',
        key: 'employees/emp-123/document/2024-01-01/uuid_test.pdf',
        metadata: {
          id: 'file-123',
          originalName: 'test.pdf',
          fileName: 'test.pdf',
          mimeType: 'application/pdf',
          size: fileBuffer.length,
          category: FileCategory.DOCUMENT,
          employeeId: 'emp-123',
          isPublic: false,
          key: 'employees/emp-123/document/2024-01-01/uuid_test.pdf',
          uploadedAt: expect.any(Date),
          uploadedBy: 'emp-123',
        },
      };

      mockProvider.uploadFile.mockResolvedValue(expectedResult);

      const result = await fileStorageService.uploadFile(fileBuffer, originalName, options);

      expect(mockProvider.uploadFile).toHaveBeenCalledWith(
        fileBuffer,
        expect.stringContaining('employees/emp-123/document/'),
        options
      );
      expect(result).toEqual(expectedResult);
    });

    it('should reject files that are too large', async () => {
      const largeFileBuffer = Buffer.alloc(20 * 1024 * 1024); // 20MB
      const originalName = 'large-file.pdf';
      const options = {
        employeeId: 'emp-123',
        category: FileCategory.DOCUMENT,
      };

      await expect(
        fileStorageService.uploadFile(largeFileBuffer, originalName, options)
      ).rejects.toThrow('File validation failed');
    });

    it('should reject files with invalid types', async () => {
      const fileBuffer = Buffer.from('test content');
      const originalName = 'test.exe';
      const options = {
        employeeId: 'emp-123',
        category: FileCategory.DOCUMENT,
      };

      await expect(
        fileStorageService.uploadFile(fileBuffer, originalName, options)
      ).rejects.toThrow('File validation failed');
    });

    it('should reject empty files', async () => {
      const emptyFileBuffer = Buffer.alloc(0);
      const originalName = 'empty.pdf';
      const options = {
        employeeId: 'emp-123',
        category: FileCategory.DOCUMENT,
      };

      await expect(
        fileStorageService.uploadFile(emptyFileBuffer, originalName, options)
      ).rejects.toThrow('File validation failed');
    });

    it('should reject files with dangerous filenames', async () => {
      const fileBuffer = Buffer.from('test content');
      const originalName = '../../../etc/passwd';
      const options = {
        employeeId: 'emp-123',
        category: FileCategory.DOCUMENT,
      };

      await expect(
        fileStorageService.uploadFile(fileBuffer, originalName, options)
      ).rejects.toThrow('File validation failed');
    });
  });

  describe('uploadFiles', () => {
    it('should upload multiple valid files successfully', async () => {
      const files = [
        { buffer: Buffer.from('file 1'), originalName: 'file1.pdf' },
        { buffer: Buffer.from('file 2'), originalName: 'file2.jpg' },
      ];
      const options = {
        employeeId: 'emp-123',
        category: FileCategory.DOCUMENT,
      };

      const expectedResults = [
        {
          id: 'file-1',
          url: 'https://example.com/file1.pdf',
          key: 'key1',
          metadata: {} as any,
        },
        {
          id: 'file-2',
          url: 'https://example.com/file2.jpg',
          key: 'key2',
          metadata: {} as any,
        },
      ];

      mockProvider.uploadFile
        .mockResolvedValueOnce(expectedResults[0])
        .mockResolvedValueOnce(expectedResults[1]);

      const results = await fileStorageService.uploadFiles(files, options);

      expect(results).toHaveLength(2);
      expect(mockProvider.uploadFile).toHaveBeenCalledTimes(2);
    });

    it('should handle partial failures gracefully', async () => {
      const files = [
        { buffer: Buffer.from('file 1'), originalName: 'file1.pdf' },
        { buffer: Buffer.from('file 2'), originalName: 'file2.exe' }, // Invalid type
      ];
      const options = {
        employeeId: 'emp-123',
        category: FileCategory.DOCUMENT,
      };

      const expectedResult = {
        id: 'file-1',
        url: 'https://example.com/file1.pdf',
        key: 'key1',
        metadata: {} as any,
      };

      mockProvider.uploadFile.mockResolvedValueOnce(expectedResult);

      const results = await fileStorageService.uploadFiles(files, options);

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(expectedResult);
    });
  });

  describe('downloadFile', () => {
    it('should download a file successfully', async () => {
      const key = 'test-key';
      const expectedBuffer = Buffer.from('file content');

      mockProvider.downloadFile.mockResolvedValue(expectedBuffer);

      const result = await fileStorageService.downloadFile(key);

      expect(mockProvider.downloadFile).toHaveBeenCalledWith(key);
      expect(result).toEqual(expectedBuffer);
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      const key = 'test-key';

      mockProvider.deleteFile.mockResolvedValue(undefined);

      await fileStorageService.deleteFile(key);

      expect(mockProvider.deleteFile).toHaveBeenCalledWith(key);
    });
  });

  describe('deleteFiles', () => {
    it('should delete multiple files successfully', async () => {
      const keys = ['key1', 'key2', 'key3'];

      mockProvider.deleteFile.mockResolvedValue(undefined);

      const result = await fileStorageService.deleteFiles(keys);

      expect(result.deleted).toEqual(keys);
      expect(result.failed).toHaveLength(0);
      expect(mockProvider.deleteFile).toHaveBeenCalledTimes(3);
    });

    it('should handle partial failures', async () => {
      const keys = ['key1', 'key2', 'key3'];

      mockProvider.deleteFile
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Delete failed'))
        .mockResolvedValueOnce(undefined);

      const result = await fileStorageService.deleteFiles(keys);

      expect(result.deleted).toEqual(['key1', 'key3']);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0]).toEqual({
        key: 'key2',
        error: 'Delete failed',
      });
    });
  });

  describe('getSignedUrl', () => {
    it('should generate a signed URL successfully', async () => {
      const key = 'test-key';
      const expectedUrl = 'https://signed-url.com';

      mockProvider.getSignedUrl.mockResolvedValue(expectedUrl);

      const result = await fileStorageService.getSignedUrl(key);

      expect(mockProvider.getSignedUrl).toHaveBeenCalledWith(key, 'getObject', undefined);
      expect(result).toBe(expectedUrl);
    });

    it('should generate a signed URL with custom options', async () => {
      const key = 'test-key';
      const operation = 'putObject';
      const options = { expiresIn: 7200 };
      const expectedUrl = 'https://signed-url.com';

      mockProvider.getSignedUrl.mockResolvedValue(expectedUrl);

      const result = await fileStorageService.getSignedUrl(key, operation, options);

      expect(mockProvider.getSignedUrl).toHaveBeenCalledWith(key, operation, options);
      expect(result).toBe(expectedUrl);
    });
  });

  describe('fileExists', () => {
    it('should return true if file exists', async () => {
      const key = 'test-key';

      mockProvider.fileExists.mockResolvedValue(true);

      const result = await fileStorageService.fileExists(key);

      expect(mockProvider.fileExists).toHaveBeenCalledWith(key);
      expect(result).toBe(true);
    });

    it('should return false if file does not exist', async () => {
      const key = 'test-key';

      mockProvider.fileExists.mockResolvedValue(false);

      const result = await fileStorageService.fileExists(key);

      expect(mockProvider.fileExists).toHaveBeenCalledWith(key);
      expect(result).toBe(false);
    });
  });

  describe('listFiles', () => {
    it('should list files with prefix', async () => {
      const prefix = 'employees/emp-123/';
      const expectedFiles = [
        {
          id: 'file-1',
          key: 'employees/emp-123/document/file1.pdf',
          originalName: 'file1.pdf',
          fileName: 'file1.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          category: FileCategory.DOCUMENT,
          employeeId: 'emp-123',
          isPublic: false,
          uploadedAt: new Date(),
          uploadedBy: 'emp-123',
        },
      ];

      mockProvider.listFiles.mockResolvedValue(expectedFiles);

      const result = await fileStorageService.listFiles(prefix);

      expect(mockProvider.listFiles).toHaveBeenCalledWith(prefix);
      expect(result).toEqual(expectedFiles);
    });
  });

  describe('listFilesByEmployee', () => {
    it('should list files for a specific employee', async () => {
      const employeeId = 'emp-123';
      const category = FileCategory.DOCUMENT;
      const expectedFiles = [
        {
          id: 'file-1',
          key: 'employees/emp-123/document/file1.pdf',
          originalName: 'file1.pdf',
          fileName: 'file1.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          category: FileCategory.DOCUMENT,
          employeeId: 'emp-123',
          isPublic: false,
          uploadedAt: new Date(),
          uploadedBy: 'emp-123',
        },
      ];

      mockProvider.listFiles.mockResolvedValue(expectedFiles);

      const result = await fileStorageService.listFilesByEmployee(employeeId, category);

      expect(mockProvider.listFiles).toHaveBeenCalledWith('employees/emp-123/document/');
      expect(result).toEqual(expectedFiles);
    });
  });

  describe('multipart upload', () => {
    it('should initiate multipart upload successfully', async () => {
      const originalName = 'large-file.pdf';
      const options = {
        employeeId: 'emp-123',
        category: FileCategory.DOCUMENT,
      };
      const expectedUploadId = 'upload-123';

      mockProvider.initiateMultipartUpload.mockResolvedValue(expectedUploadId);

      const result = await fileStorageService.initiateMultipartUpload(originalName, options);

      expect(result.uploadId).toBe(expectedUploadId);
      expect(result.key).toContain('employees/emp-123/document/');
      expect(mockProvider.initiateMultipartUpload).toHaveBeenCalledWith(
        result.key,
        options
      );
    });

    it('should upload part successfully', async () => {
      const uploadId = 'upload-123';
      const key = 'test-key';
      const partNumber = 1;
      const body = Buffer.from('part content');
      const expectedEtag = 'etag-123';

      mockProvider.uploadPart.mockResolvedValue(expectedEtag);

      const result = await fileStorageService.uploadPart(uploadId, key, partNumber, body);

      expect(mockProvider.uploadPart).toHaveBeenCalledWith(uploadId, key, partNumber, body);
      expect(result).toBe(expectedEtag);
    });

    it('should complete multipart upload successfully', async () => {
      const uploadId = 'upload-123';
      const key = 'test-key';
      const parts = [
        { partNumber: 1, etag: 'etag-1' },
        { partNumber: 2, etag: 'etag-2' },
      ];
      const expectedResult = {
        id: 'file-123',
        url: 'https://example.com/file.pdf',
        key,
        metadata: {} as any,
      };

      mockProvider.completeMultipartUpload.mockResolvedValue(expectedResult);

      const result = await fileStorageService.completeMultipartUpload(uploadId, key, parts);

      expect(mockProvider.completeMultipartUpload).toHaveBeenCalledWith(uploadId, key, parts);
      expect(result).toEqual(expectedResult);
    });

    it('should abort multipart upload successfully', async () => {
      const uploadId = 'upload-123';
      const key = 'test-key';

      mockProvider.abortMultipartUpload.mockResolvedValue(undefined);

      await fileStorageService.abortMultipartUpload(uploadId, key);

      expect(mockProvider.abortMultipartUpload).toHaveBeenCalledWith(uploadId, key);
    });
  });

  describe('cleanupFiles', () => {
    it('should perform dry run cleanup', async () => {
      const options = {
        olderThan: new Date('2023-01-01'),
        dryRun: true,
      };

      const mockFiles = [
        {
          id: 'file-1',
          key: 'old-file-1',
          uploadedAt: new Date('2022-12-01'),
          category: FileCategory.DOCUMENT,
          employeeId: 'emp-123',
          originalName: 'old1.pdf',
          fileName: 'old1.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          isPublic: false,
          uploadedBy: 'emp-123',
        },
        {
          id: 'file-2',
          key: 'new-file-1',
          uploadedAt: new Date('2024-01-01'),
          category: FileCategory.DOCUMENT,
          employeeId: 'emp-123',
          originalName: 'new1.pdf',
          fileName: 'new1.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          isPublic: false,
          uploadedBy: 'emp-123',
        },
      ];

      mockProvider.listFiles.mockResolvedValue(mockFiles);

      const result = await fileStorageService.cleanupFiles(options);

      expect(result.deletedCount).toBe(1);
      expect(result.deletedFiles).toEqual(['old-file-1']);
      expect(result.errors).toHaveLength(0);
      expect(mockProvider.deleteFile).not.toHaveBeenCalled();
    });

    it('should perform actual cleanup', async () => {
      const options = {
        olderThan: new Date('2023-01-01'),
        dryRun: false,
      };

      const mockFiles = [
        {
          id: 'file-1',
          key: 'old-file-1',
          uploadedAt: new Date('2022-12-01'),
          category: FileCategory.DOCUMENT,
          employeeId: 'emp-123',
          originalName: 'old1.pdf',
          fileName: 'old1.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          isPublic: false,
          uploadedBy: 'emp-123',
        },
      ];

      mockProvider.listFiles.mockResolvedValue(mockFiles);
      mockProvider.deleteFile.mockResolvedValue(undefined);

      const result = await fileStorageService.cleanupFiles(options);

      expect(result.deletedCount).toBe(1);
      expect(result.deletedFiles).toEqual(['old-file-1']);
      expect(result.errors).toHaveLength(0);
      expect(mockProvider.deleteFile).toHaveBeenCalledWith('old-file-1');
    });
  });

  describe('static methods', () => {
    it('should get category from mime type', () => {
      expect(FileStorageService.getCategoryFromMimeType('image/jpeg')).toBe(FileCategory.PROFILE_PHOTO);
      expect(FileStorageService.getCategoryFromMimeType('application/pdf')).toBe(FileCategory.DOCUMENT);
      expect(FileStorageService.getCategoryFromMimeType('application/msword')).toBe(FileCategory.DOCUMENT);
      expect(FileStorageService.getCategoryFromMimeType('text/plain')).toBe(FileCategory.OTHER);
    });

    it('should format file size correctly', () => {
      expect(FileStorageService.formatFileSize(0)).toBe('0 Bytes');
      expect(FileStorageService.formatFileSize(1024)).toBe('1 KB');
      expect(FileStorageService.formatFileSize(1048576)).toBe('1 MB');
      expect(FileStorageService.formatFileSize(1073741824)).toBe('1 GB');
    });
  });
});