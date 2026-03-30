import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import fileStorageRoutes from '../../routes/fileStorageRoutes';
import config from '../../config';
import { FileCategory } from '../../types/fileStorage';

// Mock the file storage service
jest.mock('../../services/fileStorageService');

const app = express();
app.use(express.json());
app.use('/api/v1/files', fileStorageRoutes);

// Helper function to generate JWT token
const generateToken = (payload: any) => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: '1h' });
};

describe('File Storage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/files/signed-url/:key', () => {
    it('should generate signed URL for authorized user', async () => {
      const token = generateToken({
        id: '1',
        email: 'user@example.com',
        role: 'employee',
        employeeId: 'emp1'
      });

      const fileKey = 'employees/emp1/document/2024-01-01/test.pdf';

      // Mock the file storage service
      const mockFileStorageService = require('../../services/fileStorageService').default;
      mockFileStorageService.getSignedUrl.mockResolvedValue('https://example.com/signed-url');

      const response = await request(app)
        .get(`/api/v1/files/signed-url/${encodeURIComponent(fileKey)}`)
        .set('Authorization', `Bearer ${token}`)
        .query({ operation: 'getObject', expiresIn: '3600' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.url).toBe('https://example.com/signed-url');
      expect(response.body.data.key).toBe(fileKey);
      expect(response.body.data.operation).toBe('getObject');
      expect(response.body.data.expiresIn).toBe(3600);
    });

    it('should deny access to unauthorized user', async () => {
      const token = generateToken({
        id: '1',
        email: 'user@example.com',
        role: 'employee',
        employeeId: 'emp1'
      });

      const fileKey = 'employees/emp2/document/2024-01-01/test.pdf'; // Different employee

      const response = await request(app)
        .get(`/api/v1/files/signed-url/${encodeURIComponent(fileKey)}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('ACCESS_DENIED');
    });

    it('should validate expiresIn parameter', async () => {
      const token = generateToken({
        id: '1',
        email: 'user@example.com',
        role: 'employee',
        employeeId: 'emp1'
      });

      const fileKey = 'employees/emp1/document/2024-01-01/test.pdf';

      const response = await request(app)
        .get(`/api/v1/files/signed-url/${encodeURIComponent(fileKey)}`)
        .set('Authorization', `Bearer ${token}`)
        .query({ expiresIn: '86401' }); // More than 24 hours

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_EXPIRES_IN');
    });

    it('should validate operation parameter', async () => {
      const token = generateToken({
        id: '1',
        email: 'user@example.com',
        role: 'employee',
        employeeId: 'emp1'
      });

      const fileKey = 'employees/emp1/document/2024-01-01/test.pdf';

      const response = await request(app)
        .get(`/api/v1/files/signed-url/${encodeURIComponent(fileKey)}`)
        .set('Authorization', `Bearer ${token}`)
        .query({ operation: 'invalidOperation' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_OPERATION');
    });

    it('should require authentication', async () => {
      const fileKey = 'employees/emp1/document/2024-01-01/test.pdf';

      const response = await request(app)
        .get(`/api/v1/files/signed-url/${encodeURIComponent(fileKey)}`);

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });
  });

  describe('POST /api/v1/files/upload', () => {
    it('should allow employee to upload their own files', async () => {
      const token = generateToken({
        id: '1',
        email: 'user@example.com',
        role: 'employee',
        employeeId: 'emp1'
      });

      // Mock the file storage service
      const mockFileStorageService = require('../../services/fileStorageService').default;
      mockFileStorageService.uploadFile.mockResolvedValue({
        id: '1',
        url: 'https://example.com/file.pdf',
        key: 'employees/emp1/document/2024-01-01/test.pdf',
        metadata: {
          id: '1',
          originalName: 'test.pdf',
          fileName: 'test.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          category: FileCategory.DOCUMENT,
          employeeId: 'emp1',
          isPublic: false,
          key: 'employees/emp1/document/2024-01-01/test.pdf',
          uploadedAt: new Date(),
          uploadedBy: 'emp1',
        }
      });

      const response = await request(app)
        .post('/api/v1/files/upload')
        .set('Authorization', `Bearer ${token}`)
        .field('employeeId', 'emp1')
        .field('category', FileCategory.DOCUMENT)
        .attach('file', Buffer.from('test file content'), 'test.pdf');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.key).toBe('employees/emp1/document/2024-01-01/test.pdf');
    });

    it('should deny employee from uploading payslips', async () => {
      const token = generateToken({
        id: '1',
        email: 'user@example.com',
        role: 'employee',
        employeeId: 'emp1'
      });

      const response = await request(app)
        .post('/api/v1/files/upload')
        .set('Authorization', `Bearer ${token}`)
        .field('employeeId', 'emp1')
        .field('category', FileCategory.PAYSLIP)
        .attach('file', Buffer.from('test file content'), 'payslip.pdf');

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('ACCESS_DENIED');
    });

    it('should allow finance role to upload payslips', async () => {
      const token = generateToken({
        id: '1',
        email: 'finance@example.com',
        role: 'finance',
        employeeId: 'emp1'
      });

      // Mock the file storage service
      const mockFileStorageService = require('../../services/fileStorageService').default;
      mockFileStorageService.uploadFile.mockResolvedValue({
        id: '1',
        url: 'https://example.com/payslip.pdf',
        key: 'employees/emp2/payslip/2024-01-01/payslip.pdf',
        metadata: {
          id: '1',
          originalName: 'payslip.pdf',
          fileName: 'payslip.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          category: FileCategory.PAYSLIP,
          employeeId: 'emp2',
          isPublic: false,
          key: 'employees/emp2/payslip/2024-01-01/payslip.pdf',
          uploadedAt: new Date(),
          uploadedBy: 'emp1',
        }
      });

      const response = await request(app)
        .post('/api/v1/files/upload')
        .set('Authorization', `Bearer ${token}`)
        .field('employeeId', 'emp2')
        .field('category', FileCategory.PAYSLIP)
        .attach('file', Buffer.from('payslip content'), 'payslip.pdf');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should deny employee from uploading files for other employees', async () => {
      const token = generateToken({
        id: '1',
        email: 'user@example.com',
        role: 'employee',
        employeeId: 'emp1'
      });

      const response = await request(app)
        .post('/api/v1/files/upload')
        .set('Authorization', `Bearer ${token}`)
        .field('employeeId', 'emp2') // Different employee
        .field('category', FileCategory.DOCUMENT)
        .attach('file', Buffer.from('test file content'), 'test.pdf');

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('ACCESS_DENIED');
    });
  });

  describe('GET /api/v1/files/download/:key', () => {
    it('should allow employee to download their own files', async () => {
      const token = generateToken({
        id: '1',
        email: 'user@example.com',
        role: 'employee',
        employeeId: 'emp1'
      });

      const fileKey = 'employees/emp1/document/2024-01-01/test.pdf';

      // Mock the file storage service
      const mockFileStorageService = require('../../services/fileStorageService').default;
      mockFileStorageService.fileExists.mockResolvedValue(true);
      mockFileStorageService.downloadFile.mockResolvedValue(Buffer.from('test file content'));

      const response = await request(app)
        .get(`/api/v1/files/download/${encodeURIComponent(fileKey)}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.body.toString()).toBe('test file content');
    });

    it('should deny employee from downloading other employee files', async () => {
      const token = generateToken({
        id: '1',
        email: 'user@example.com',
        role: 'employee',
        employeeId: 'emp1'
      });

      const fileKey = 'employees/emp2/document/2024-01-01/test.pdf'; // Different employee

      const response = await request(app)
        .get(`/api/v1/files/download/${encodeURIComponent(fileKey)}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('ACCESS_DENIED');
    });

    it('should allow all users to download system files', async () => {
      const token = generateToken({
        id: '1',
        email: 'user@example.com',
        role: 'employee',
        employeeId: 'emp1'
      });

      const fileKey = 'system/training-material/2024-01-01/training.pdf';

      // Mock the file storage service
      const mockFileStorageService = require('../../services/fileStorageService').default;
      mockFileStorageService.fileExists.mockResolvedValue(true);
      mockFileStorageService.downloadFile.mockResolvedValue(Buffer.from('training content'));

      const response = await request(app)
        .get(`/api/v1/files/download/${encodeURIComponent(fileKey)}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.toString()).toBe('training content');
    });
  });

  describe('DELETE /api/v1/files/:key', () => {
    it('should allow employee to delete their own files (except restricted)', async () => {
      const token = generateToken({
        id: '1',
        email: 'user@example.com',
        role: 'employee',
        employeeId: 'emp1'
      });

      const fileKey = 'employees/emp1/document/2024-01-01/test.pdf';

      // Mock the file storage service
      const mockFileStorageService = require('../../services/fileStorageService').default;
      mockFileStorageService.fileExists.mockResolvedValue(true);
      mockFileStorageService.deleteFile.mockResolvedValue(undefined);

      const response = await request(app)
        .delete(`/api/v1/files/${encodeURIComponent(fileKey)}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('File deleted successfully');
    });

    it('should deny employee from deleting payslips', async () => {
      const token = generateToken({
        id: '1',
        email: 'user@example.com',
        role: 'employee',
        employeeId: 'emp1'
      });

      const fileKey = 'employees/emp1/payslip/2024-01-01/payslip.pdf';

      const response = await request(app)
        .delete(`/api/v1/files/${encodeURIComponent(fileKey)}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('ACCESS_DENIED');
    });

    it('should allow super admin to delete any file', async () => {
      const token = generateToken({
        id: '1',
        email: 'admin@example.com',
        role: 'super_admin',
        employeeId: 'emp1'
      });

      const fileKey = 'employees/emp2/document/2024-01-01/test.pdf';

      // Mock the file storage service
      const mockFileStorageService = require('../../services/fileStorageService').default;
      mockFileStorageService.fileExists.mockResolvedValue(true);
      mockFileStorageService.deleteFile.mockResolvedValue(undefined);

      const response = await request(app)
        .delete(`/api/v1/files/${encodeURIComponent(fileKey)}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/files/list', () => {
    it('should allow employee to list their own files', async () => {
      const token = generateToken({
        id: '1',
        email: 'user@example.com',
        role: 'employee',
        employeeId: 'emp1'
      });

      // Mock the file storage service
      const mockFileStorageService = require('../../services/fileStorageService').default;
      mockFileStorageService.listFilesByEmployee.mockResolvedValue([
        {
          id: '1',
          originalName: 'test.pdf',
          fileName: 'test.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          category: FileCategory.DOCUMENT,
          employeeId: 'emp1',
          isPublic: false,
          key: 'employees/emp1/document/2024-01-01/test.pdf',
          uploadedAt: new Date(),
          uploadedBy: 'emp1',
        }
      ]);

      const response = await request(app)
        .get('/api/v1/files/list')
        .set('Authorization', `Bearer ${token}`)
        .query({ employeeId: 'emp1' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.count).toBe(1);
    });

    it('should deny employee from listing other employee files', async () => {
      const token = generateToken({
        id: '1',
        email: 'user@example.com',
        role: 'employee',
        employeeId: 'emp1'
      });

      const response = await request(app)
        .get('/api/v1/files/list')
        .set('Authorization', `Bearer ${token}`)
        .query({ employeeId: 'emp2' }); // Different employee

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('ACCESS_DENIED');
    });

    it('should allow HR manager to list all employee files', async () => {
      const token = generateToken({
        id: '1',
        email: 'hr@example.com',
        role: 'hr_manager',
        employeeId: 'emp1'
      });

      // Mock the file storage service
      const mockFileStorageService = require('../../services/fileStorageService').default;
      mockFileStorageService.listFilesByEmployee.mockResolvedValue([
        {
          id: '1',
          originalName: 'test.pdf',
          fileName: 'test.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          category: FileCategory.DOCUMENT,
          employeeId: 'emp2',
          isPublic: false,
          key: 'employees/emp2/document/2024-01-01/test.pdf',
          uploadedAt: new Date(),
          uploadedBy: 'emp2',
        }
      ]);

      const response = await request(app)
        .get('/api/v1/files/list')
        .set('Authorization', `Bearer ${token}`)
        .query({ employeeId: 'emp2' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });
});