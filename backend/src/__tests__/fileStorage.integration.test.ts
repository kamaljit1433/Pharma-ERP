import request from 'supertest';
import app from '../index';
import { FileCategory } from '../types/fileStorage';

// Mock the file storage service
jest.mock('../services/fileStorageService', () => ({
  default: {
    uploadFile: jest.fn(),
    uploadFiles: jest.fn(),
    downloadFile: jest.fn(),
    deleteFile: jest.fn(),
    getSignedUrl: jest.fn(),
    fileExists: jest.fn(),
    listFiles: jest.fn(),
    listFilesByEmployee: jest.fn(),
    listFilesByCategory: jest.fn(),
    initiateMultipartUpload: jest.fn(),
    completeMultipartUpload: jest.fn(),
    abortMultipartUpload: jest.fn(),
    cleanupFiles: jest.fn(),
  },
}));

// Mock authentication middleware
jest.mock('../middleware/auth', () => ({
  authenticateToken: function(req: any, res: any, next: any) {
    req.user = {
      id: 'user-123',
      email: 'test@example.com',
      role: 'employee',
      employeeId: 'emp-123',
    };
    next();
  },
}));

import fileStorageService from '../services/fileStorageService';

const mockFileStorageService = fileStorageService as jest.Mocked<typeof fileStorageService>;

describe('File Storage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/files/upload', () => {
    it('should upload a single file successfully', async () => {
      const mockResult = {
        id: 'file-123',
        url: 'https://example.com/file.pdf',
        key: 'employees/emp-123/document/2024-01-01/uuid_test.pdf',
        metadata: {
          id: 'file-123',
          originalName: 'test.pdf',
          fileName: 'test.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          category: FileCategory.DOCUMENT,
          employeeId: 'emp-123',
          isPublic: false,
          key: 'employees/emp-123/document/2024-01-01/uuid_test.pdf',
          uploadedAt: new Date(),
          uploadedBy: 'emp-123',
        },
      };

      mockFileStorageService.uploadFile.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/files/upload')
        .attach('file', Buffer.from('test file content'), 'test.pdf')
        .field('employeeId', 'emp-123')
        .field('category', FileCategory.DOCUMENT)
        .field('isPublic', 'false');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResult);
      expect(mockFileStorageService.uploadFile).toHaveBeenCalledWith(
        expect.any(Buffer),
        'test.pdf',
        {
          employeeId: 'emp-123',
          category: FileCategory.DOCUMENT,
          isPublic: false,
          metadata: {},
        }
      );
    });

    it('should return 400 for missing file', async () => {
      const response = await request(app)
        .post('/api/v1/files/upload')
        .field('employeeId', 'emp-123')
        .field('category', FileCategory.DOCUMENT);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('NO_FILE');
    });

    it('should return 400 for invalid category', async () => {
      const response = await request(app)
        .post('/api/v1/files/upload')
        .attach('file', Buffer.from('test content'), 'test.pdf')
        .field('category', 'invalid-category');

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_CATEGORY');
    });
  });

  describe('POST /api/v1/files/upload-multiple', () => {
    it('should upload multiple files successfully', async () => {
      const mockResults = [
        {
          id: 'file-1',
          url: 'https://example.com/file1.pdf',
          key: 'key1',
          metadata: {} as any,
        },
        {
          id: 'file-2',
          url: 'https://example.com/file2.pdf',
          key: 'key2',
          metadata: {} as any,
        },
      ];

      mockFileStorageService.uploadFiles.mockResolvedValue(mockResults);

      const response = await request(app)
        .post('/api/v1/files/upload-multiple')
        .attach('files', Buffer.from('file 1 content'), 'file1.pdf')
        .attach('files', Buffer.from('file 2 content'), 'file2.pdf')
        .field('employeeId', 'emp-123')
        .field('category', FileCategory.DOCUMENT);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResults);
      expect(mockFileStorageService.uploadFiles).toHaveBeenCalledWith(
        [
          { buffer: expect.any(Buffer), originalName: 'file1.pdf' },
          { buffer: expect.any(Buffer), originalName: 'file2.pdf' },
        ],
        {
          employeeId: 'emp-123',
          category: FileCategory.DOCUMENT,
          isPublic: false,
          metadata: {},
        }
      );
    });
  });

  describe('GET /api/v1/files/download/:key', () => {
    it('should download a file successfully', async () => {
      const fileBuffer = Buffer.from('file content');
      const key = 'test-key';

      mockFileStorageService.fileExists.mockResolvedValue(true);
      mockFileStorageService.downloadFile.mockResolvedValue(fileBuffer);

      const response = await request(app)
        .get(`/api/v1/files/download/${key}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(fileBuffer);
      expect(mockFileStorageService.fileExists).toHaveBeenCalledWith(key);
      expect(mockFileStorageService.downloadFile).toHaveBeenCalledWith(key);
    });

    it('should return 404 for non-existent file', async () => {
      const key = 'non-existent-key';

      mockFileStorageService.fileExists.mockResolvedValue(false);

      const response = await request(app)
        .get(`/api/v1/files/download/${key}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('FILE_NOT_FOUND');
    });
  });

  describe('DELETE /api/v1/files/:key', () => {
    it('should delete a file successfully', async () => {
      const key = 'test-key';

      mockFileStorageService.fileExists.mockResolvedValue(true);
      mockFileStorageService.deleteFile.mockResolvedValue(undefined);

      const response = await request(app)
        .delete(`/api/v1/files/${key}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockFileStorageService.fileExists).toHaveBeenCalledWith(key);
      expect(mockFileStorageService.deleteFile).toHaveBeenCalledWith(key);
    });

    it('should return 404 for non-existent file', async () => {
      const key = 'non-existent-key';

      mockFileStorageService.fileExists.mockResolvedValue(false);

      const response = await request(app)
        .delete(`/api/v1/files/${key}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('FILE_NOT_FOUND');
    });
  });

  describe('GET /api/v1/files/signed-url/:key', () => {
    it('should generate signed URL successfully', async () => {
      const key = 'test-key';
      const signedUrl = 'https://signed-url.com';

      mockFileStorageService.getSignedUrl.mockResolvedValue(signedUrl);

      const response = await request(app)
        .get(`/api/v1/files/signed-url/${key}`)
        .query({ operation: 'getObject', expiresIn: '3600' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.url).toBe(signedUrl);
      expect(mockFileStorageService.getSignedUrl).toHaveBeenCalledWith(
        key,
        'getObject',
        { expiresIn: 3600 }
      );
    });

    it('should return 400 for invalid operation', async () => {
      const key = 'test-key';

      const response = await request(app)
        .get(`/api/v1/files/signed-url/${key}`)
        .query({ operation: 'invalidOperation' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_OPERATION');
    });
  });

  describe('GET /api/v1/files/list', () => {
    it('should list files with prefix', async () => {
      const mockFiles = [
        {
          id: 'file-1',
          key: 'test-key-1',
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

      mockFileStorageService.listFiles.mockResolvedValue(mockFiles);

      const response = await request(app)
        .get('/api/v1/files/list')
        .query({ prefix: 'employees/emp-123/' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockFiles);
      expect(response.body.count).toBe(1);
      expect(mockFileStorageService.listFiles).toHaveBeenCalledWith('employees/emp-123/');
    });

    it('should list files by employee', async () => {
      const mockFiles = [
        {
          id: 'file-1',
          key: 'test-key-1',
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

      mockFileStorageService.listFilesByEmployee.mockResolvedValue(mockFiles);

      const response = await request(app)
        .get('/api/v1/files/list')
        .query({ employeeId: 'emp-123', category: FileCategory.DOCUMENT });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockFiles);
      expect(mockFileStorageService.listFilesByEmployee).toHaveBeenCalledWith(
        'emp-123',
        FileCategory.DOCUMENT
      );
    });
  });

  describe('POST /api/v1/files/multipart/initiate', () => {
    it('should initiate multipart upload successfully', async () => {
      const mockResult = {
        uploadId: 'upload-123',
        key: 'test-key',
      };

      mockFileStorageService.initiateMultipartUpload.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/files/multipart/initiate')
        .send({
          originalName: 'large-file.pdf',
          employeeId: 'emp-123',
          category: FileCategory.DOCUMENT,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResult);
      expect(mockFileStorageService.initiateMultipartUpload).toHaveBeenCalledWith(
        'large-file.pdf',
        {
          employeeId: 'emp-123',
          category: FileCategory.DOCUMENT,
          isPublic: false,
          metadata: {},
        }
      );
    });

    it('should return 400 for missing filename', async () => {
      const response = await request(app)
        .post('/api/v1/files/multipart/initiate')
        .send({
          employeeId: 'emp-123',
          category: FileCategory.DOCUMENT,
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_FILENAME');
    });
  });

  describe('POST /api/v1/files/multipart/complete', () => {
    it('should complete multipart upload successfully', async () => {
      const mockResult = {
        id: 'file-123',
        url: 'https://example.com/file.pdf',
        key: 'test-key',
        metadata: {} as any,
      };

      mockFileStorageService.completeMultipartUpload.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/files/multipart/complete')
        .send({
          uploadId: 'upload-123',
          key: 'test-key',
          parts: [
            { partNumber: 1, etag: 'etag-1' },
            { partNumber: 2, etag: 'etag-2' },
          ],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResult);
      expect(mockFileStorageService.completeMultipartUpload).toHaveBeenCalledWith(
        'upload-123',
        'test-key',
        [
          { partNumber: 1, etag: 'etag-1' },
          { partNumber: 2, etag: 'etag-2' },
        ]
      );
    });

    it('should return 400 for missing parameters', async () => {
      const response = await request(app)
        .post('/api/v1/files/multipart/complete')
        .send({
          uploadId: 'upload-123',
          // Missing key and parts
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_PARAMETERS');
    });
  });

  describe('POST /api/v1/files/multipart/abort', () => {
    it('should abort multipart upload successfully', async () => {
      mockFileStorageService.abortMultipartUpload.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/v1/files/multipart/abort')
        .send({
          uploadId: 'upload-123',
          key: 'test-key',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockFileStorageService.abortMultipartUpload).toHaveBeenCalledWith(
        'upload-123',
        'test-key'
      );
    });
  });

  describe('POST /api/v1/files/cleanup', () => {
    it('should perform file cleanup successfully', async () => {
      const mockResult = {
        deletedCount: 2,
        deletedFiles: ['old-file-1', 'old-file-2'],
        errors: [],
      };

      mockFileStorageService.cleanupFiles.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/v1/files/cleanup')
        .send({
          olderThan: '2023-01-01T00:00:00.000Z',
          category: FileCategory.DOCUMENT,
          dryRun: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResult);
      expect(mockFileStorageService.cleanupFiles).toHaveBeenCalledWith({
        olderThan: new Date('2023-01-01T00:00:00.000Z'),
        category: FileCategory.DOCUMENT,
        dryRun: true,
      });
    });
  });
});