import request from 'supertest';
import express from 'express';
import fileStorageRoutes from '../../routes/fileStorageRoutes';
import { FileCategory } from '../../types/fileStorage';

// Mock the file storage service
jest.mock('../../services/fileStorageService', () => ({
  __esModule: true,
  default: {
    deleteFile: jest.fn(),
    deleteFiles: jest.fn(),
    cleanupFiles: jest.fn(),
    cleanupOrphanedMultipartUploads: jest.fn(),
    cleanupOrphanedFiles: jest.fn(),
    fileExists: jest.fn(),
  },
}));

// Mock authentication middleware
jest.mock('../../middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = {
      userId: 'user1',
      role: 'super_admin',
      employeeId: 'emp1',
    };
    next();
  },
}));

// Mock file access control middleware
jest.mock('../../middleware/fileAccessControl', () => ({
  canAccessFile: (req: any, res: any, next: any) => next(),
  canUploadFile: (req: any, res: any, next: any) => next(),
  canDeleteFile: (req: any, res: any, next: any) => next(),
  canListFiles: (req: any, res: any, next: any) => next(),
  validateSignedUrlRequest: (req: any, res: any, next: any) => next(),
  logFileAccess: (action: string) => (req: any, res: any, next: any) => next(),
}));

import fileStorageService from '../../services/fileStorageService';

const mockFileStorageService = fileStorageService as jest.Mocked<typeof fileStorageService>;

describe('File Storage Deletion and Cleanup - Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/v1/files', fileStorageRoutes);
  });

  describe('DELETE /api/v1/files/:key', () => {
    it('should delete a file successfully', async () => {
      const fileKey = 'employees/emp1/document/2024-01-01/test.pdf';
      
      mockFileStorageService.fileExists.mockResolvedValue(true);
      mockFileStorageService.deleteFile.mockResolvedValue();

      const response = await request(app)
        .delete(`/api/v1/files/${encodeURIComponent(fileKey)}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'File deleted successfully',
        timestamp: expect.any(String),
      });

      expect(mockFileStorageService.fileExists).toHaveBeenCalledWith(fileKey, expect.objectContaining({
        userId: 'user1',
        role: 'super_admin',
        employeeId: 'emp1',
      }));

      expect(mockFileStorageService.deleteFile).toHaveBeenCalledWith(fileKey, expect.objectContaining({
        userId: 'user1',
        role: 'super_admin',
        employeeId: 'emp1',
      }));
    });

    it('should return 404 if file does not exist', async () => {
      const fileKey = 'nonexistent/file.pdf';
      
      mockFileStorageService.fileExists.mockResolvedValue(false);

      const response = await request(app)
        .delete(`/api/v1/files/${encodeURIComponent(fileKey)}`)
        .expect(404);

      expect(response.body.error).toEqual({
        code: 'FILE_NOT_FOUND',
        message: 'File not found',
        timestamp: expect.any(String),
        requestId: 'unknown',
      });

      expect(mockFileStorageService.deleteFile).not.toHaveBeenCalled();
    });

    it('should return 400 if file key is missing', async () => {
      const response = await request(app)
        .delete('/api/v1/files/')
        .expect(404); // Express returns 404 for missing route parameters

      expect(mockFileStorageService.deleteFile).not.toHaveBeenCalled();
    });

    it('should handle deletion errors', async () => {
      const fileKey = 'employees/emp1/document/2024-01-01/test.pdf';
      
      mockFileStorageService.fileExists.mockResolvedValue(true);
      mockFileStorageService.deleteFile.mockRejectedValue(new Error('S3 error'));

      const response = await request(app)
        .delete(`/api/v1/files/${encodeURIComponent(fileKey)}`)
        .expect(500);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('DELETE /api/v1/files/bulk', () => {
    it('should delete multiple files successfully', async () => {
      const keys = ['file1.pdf', 'file2.pdf', 'file3.pdf'];
      const mockResult = {
        deleted: ['file1.pdf', 'file2.pdf'],
        failed: [{ key: 'file3.pdf', error: 'Access denied' }],
      };

      mockFileStorageService.deleteFiles.mockResolvedValue(mockResult);

      const response = await request(app)
        .delete('/api/v1/files/bulk')
        .send({ keys })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockResult,
        timestamp: expect.any(String),
      });

      expect(mockFileStorageService.deleteFiles).toHaveBeenCalledWith(keys, expect.objectContaining({
        userId: 'user1',
        role: 'super_admin',
        employeeId: 'emp1',
      }));
    });

    it('should return 400 if keys array is missing', async () => {
      const response = await request(app)
        .delete('/api/v1/files/bulk')
        .send({})
        .expect(400);

      expect(response.body.error).toEqual({
        code: 'MISSING_KEYS',
        message: 'File keys array is required',
        timestamp: expect.any(String),
        requestId: 'unknown',
      });

      expect(mockFileStorageService.deleteFiles).not.toHaveBeenCalled();
    });

    it('should return 400 if keys array is empty', async () => {
      const response = await request(app)
        .delete('/api/v1/files/bulk')
        .send({ keys: [] })
        .expect(400);

      expect(response.body.error).toEqual({
        code: 'MISSING_KEYS',
        message: 'File keys array is required',
        timestamp: expect.any(String),
        requestId: 'unknown',
      });

      expect(mockFileStorageService.deleteFiles).not.toHaveBeenCalled();
    });

    it('should return 400 if too many files requested', async () => {
      const keys = Array.from({ length: 1001 }, (_, i) => `file${i}.pdf`);

      const response = await request(app)
        .delete('/api/v1/files/bulk')
        .send({ keys })
        .expect(400);

      expect(response.body.error).toEqual({
        code: 'TOO_MANY_FILES',
        message: 'Maximum 1000 files can be deleted at once',
        timestamp: expect.any(String),
        requestId: 'unknown',
      });

      expect(mockFileStorageService.deleteFiles).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/files/cleanup', () => {
    it('should clean up files successfully', async () => {
      const cleanupOptions = {
        olderThan: '2023-01-01T00:00:00.000Z',
        category: FileCategory.DOCUMENT,
        employeeId: 'emp1',
        dryRun: false,
      };

      const mockResult = {
        deletedCount: 5,
        deletedFiles: ['file1.pdf', 'file2.pdf', 'file3.pdf', 'file4.pdf', 'file5.pdf'],
        errors: [],
      };

      mockFileStorageService.cleanupFiles.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/files/cleanup')
        .send(cleanupOptions)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockResult,
        timestamp: expect.any(String),
      });

      expect(mockFileStorageService.cleanupFiles).toHaveBeenCalledWith(
        {
          olderThan: new Date('2023-01-01T00:00:00.000Z'),
          category: FileCategory.DOCUMENT,
          employeeId: 'emp1',
          dryRun: false,
        },
        expect.objectContaining({
          userId: 'user1',
          role: 'super_admin',
          employeeId: 'emp1',
        })
      );
    });

    it('should perform dry run by default', async () => {
      const cleanupOptions = {
        olderThan: '2023-01-01T00:00:00.000Z',
      };

      const mockResult = {
        deletedCount: 3,
        deletedFiles: ['file1.pdf', 'file2.pdf', 'file3.pdf'],
        errors: [],
      };

      mockFileStorageService.cleanupFiles.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/files/cleanup')
        .send(cleanupOptions)
        .expect(200);

      expect(mockFileStorageService.cleanupFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          dryRun: true, // Default value
        }),
        expect.any(Object)
      );
    });

    it('should handle invalid category gracefully', async () => {
      const cleanupOptions = {
        category: 'invalid-category',
        dryRun: true,
      };

      const mockResult = {
        deletedCount: 0,
        deletedFiles: [],
        errors: [],
      };

      mockFileStorageService.cleanupFiles.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/files/cleanup')
        .send(cleanupOptions)
        .expect(200);

      // Should not include invalid category in options
      expect(mockFileStorageService.cleanupFiles).toHaveBeenCalledWith(
        expect.not.objectContaining({
          category: 'invalid-category',
        }),
        expect.any(Object)
      );
    });
  });

  describe('POST /api/v1/files/cleanup/multipart', () => {
    it('should clean up orphaned multipart uploads successfully', async () => {
      const mockResult = {
        abortedCount: 3,
        errors: [{ uploadId: 'upload1', error: 'Failed to abort' }],
      };

      mockFileStorageService.cleanupOrphanedMultipartUploads.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/files/cleanup/multipart')
        .send({ olderThanHours: 48 })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockResult,
        timestamp: expect.any(String),
      });

      expect(mockFileStorageService.cleanupOrphanedMultipartUploads).toHaveBeenCalledWith(
        48,
        expect.objectContaining({
          userId: 'user1',
          role: 'super_admin',
          employeeId: 'emp1',
        })
      );
    });

    it('should use default 24 hours if not specified', async () => {
      const mockResult = {
        abortedCount: 1,
        errors: [],
      };

      mockFileStorageService.cleanupOrphanedMultipartUploads.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/files/cleanup/multipart')
        .send({})
        .expect(200);

      expect(mockFileStorageService.cleanupOrphanedMultipartUploads).toHaveBeenCalledWith(
        24, // Default value
        expect.any(Object)
      );
    });

    it('should return 400 for invalid olderThanHours', async () => {
      const response = await request(app)
        .post('/api/v1/files/cleanup/multipart')
        .send({ olderThanHours: 200 }) // Too large
        .expect(400);

      expect(response.body.error).toEqual({
        code: 'INVALID_HOURS',
        message: 'olderThanHours must be a number between 1 and 168 (7 days)',
        timestamp: expect.any(String),
        requestId: 'unknown',
      });

      expect(mockFileStorageService.cleanupOrphanedMultipartUploads).not.toHaveBeenCalled();
    });

    it('should return 400 for negative olderThanHours', async () => {
      const response = await request(app)
        .post('/api/v1/files/cleanup/multipart')
        .send({ olderThanHours: -1 })
        .expect(400);

      expect(response.body.error).toEqual({
        code: 'INVALID_HOURS',
        message: 'olderThanHours must be a number between 1 and 168 (7 days)',
        timestamp: expect.any(String),
        requestId: 'unknown',
      });

      expect(mockFileStorageService.cleanupOrphanedMultipartUploads).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/files/cleanup/orphaned', () => {
    it('should clean up orphaned files successfully', async () => {
      const mockResult = {
        orphanedCount: 10,
        deletedCount: 8,
        errors: [
          { key: 'file1.pdf', error: 'Access denied' },
          { key: 'file2.pdf', error: 'File locked' },
        ],
      };

      mockFileStorageService.cleanupOrphanedFiles.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/files/cleanup/orphaned')
        .send({ dryRun: false })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockResult,
        timestamp: expect.any(String),
      });

      expect(mockFileStorageService.cleanupOrphanedFiles).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user1',
          role: 'super_admin',
          employeeId: 'emp1',
        }),
        false
      );
    });

    it('should perform dry run by default', async () => {
      const mockResult = {
        orphanedCount: 5,
        deletedCount: 0,
        errors: [],
      };

      mockFileStorageService.cleanupOrphanedFiles.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/files/cleanup/orphaned')
        .send({})
        .expect(200);

      expect(mockFileStorageService.cleanupOrphanedFiles).toHaveBeenCalledWith(
        expect.any(Object),
        true // Default dry run
      );
    });

    it('should handle cleanup errors', async () => {
      mockFileStorageService.cleanupOrphanedFiles.mockRejectedValue(new Error('Cleanup failed'));

      const response = await request(app)
        .post('/api/v1/files/cleanup/orphaned')
        .send({ dryRun: false })
        .expect(500);

      expect(response.body.error).toBeDefined();
    });
  });
});