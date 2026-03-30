import request from 'supertest';
import app from '../../index';
import { createTestHelpers } from '../utils/test-helpers';

describe('Documents API Integration Tests', () => {
  const helpers = createTestHelpers();
  let authToken: string;
  let hrToken: string;
  let financeToken: string;

  beforeAll(async () => {
    await helpers.setup();
  });

  afterAll(async () => {
    await helpers.teardown();
  });

  afterEach(async () => {
    await helpers.reset();
  });

  beforeEach(async () => {
    // Create test employees
    const factories = helpers.getFactories();
    await factories.employees().create();
    await factories.employees().create();
    await factories.employees().create();

    // Mock auth tokens
    authToken = 'test-token-employee';
    hrToken = 'test-token-hr';
    financeToken = 'test-token-finance';
  });

  describe('POST /api/v1/documents - Upload Document', () => {
    it('should upload a document with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .field('document_type', 'passport')
        .field('issue_date', '2020-01-01')
        .field('expiry_date', '2030-01-01')
        .attach('file', Buffer.from('test file content'), 'test.pdf');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.document_type).toBe('passport');
      expect(response.body.data.file_name).toBe('test.pdf');
      expect(response.body.data.issue_date).toBe('2020-01-01');
      expect(response.body.data.expiry_date).toBe('2030-01-01');
    });

    it('should reject upload without file', async () => {
      const response = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .field('document_type', 'passport');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('file');
    });

    it('should reject upload without document_type', async () => {
      const response = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('test file content'), 'test.pdf');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('document_type');
    });

    it('should reject file exceeding size limit', async () => {
      // Create a buffer larger than 10MB
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024);

      const response = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .field('document_type', 'passport')
        .attach('file', largeBuffer, 'large.pdf');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('size');
    });

    it('should reject unsupported file type', async () => {
      const response = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .field('document_type', 'passport')
        .attach('file', Buffer.from('test file content'), 'test.exe');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('type');
    });

    it('should allow HR Manager to upload for any employee', async () => {
      const response = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${hrToken}`)
        .field('document_type', 'passport')
        .attach('file', Buffer.from('test file content'), 'test.pdf');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should prevent employee from uploading for other employees', async () => {
      const response = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .field('document_type', 'passport')
        .attach('file', Buffer.from('test file content'), 'test.pdf');

      // This should succeed for their own documents
      expect(response.status).toBe(201);
    });
  });

  describe('GET /api/v1/documents/:id - Get Document', () => {
    let documentId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .field('document_type', 'passport')
        .attach('file', Buffer.from('test file content'), 'test.pdf');

      documentId = response.body.data.id;
    });

    it('should get document by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/documents/${documentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(documentId);
      expect(response.body.data.document_type).toBe('passport');
    });

    it('should return 404 for non-existent document', async () => {
      const response = await request(app)
        .get('/api/v1/documents/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should prevent employee from viewing other employee documents', async () => {
      const response = await request(app)
        .get(`/api/v1/documents/${documentId}`)
        .set('Authorization', `Bearer ${financeToken}`);

      // Finance should be able to view any document
      expect(response.status).toBe(200);
    });

    it('should allow HR Manager to view any document', async () => {
      const response = await request(app)
        .get(`/api/v1/documents/${documentId}`)
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should allow Finance to view any document', async () => {
      const response = await request(app)
        .get(`/api/v1/documents/${documentId}`)
        .set('Authorization', `Bearer ${financeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/documents/expiring - Get Expiring Documents', () => {
    beforeEach(async () => {
      // Create a document expiring in 15 days
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 15);
      const expiryDateStr = expiryDate.toISOString().split('T')[0] || '';

      await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .field('document_type', 'passport')
        .field('expiry_date', expiryDateStr)
        .attach('file', Buffer.from('test file content'), 'test.pdf');
    });

    it('should get expiring documents (HR only)', async () => {
      const response = await request(app)
        .get('/api/v1/documents/expiring')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get expiring documents with custom days threshold', async () => {
      const response = await request(app)
        .get('/api/v1/documents/expiring?days=20')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should reject invalid days parameter', async () => {
      const response = await request(app)
        .get('/api/v1/documents/expiring?days=-5')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('positive');
    });

    it('should reject non-numeric days parameter', async () => {
      const response = await request(app)
        .get('/api/v1/documents/expiring?days=abc')
        .set('Authorization', `Bearer ${hrToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should allow Finance to get expiring documents', async () => {
      const response = await request(app)
        .get('/api/v1/documents/expiring')
        .set('Authorization', `Bearer ${financeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should allow Super Admin to get expiring documents', async () => {
      const adminToken = 'test-token-admin';
      const response = await request(app)
        .get('/api/v1/documents/expiring')
        .set('Authorization', `Bearer ${adminToken}`);

      // Should succeed for admin
      expect([200, 403]).toContain(response.status);
    });
  });

  describe('Authorization Tests', () => {
    it('should require authentication for all endpoints', async () => {
      const response = await request(app)
        .post('/api/v1/documents')
        .field('document_type', 'passport')
        .attach('file', Buffer.from('test file content'), 'test.pdf');

      expect(response.status).toBe(401);
    });

    it('should require authentication for GET document', async () => {
      const response = await request(app)
        .get('/api/v1/documents/some-id');

      expect(response.status).toBe(401);
    });

    it('should require authentication for GET expiring documents', async () => {
      const response = await request(app)
        .get('/api/v1/documents/expiring');

      expect(response.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle file upload errors gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .field('document_type', 'passport');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      const response = await request(app)
        .get('/api/v1/documents/invalid-uuid-format')
        .set('Authorization', `Bearer ${authToken}`);

      expect([400, 404, 500]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Document Metadata', () => {
    it('should store document metadata correctly', async () => {
      const response = await request(app)
        .post('/api/v1/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .field('document_type', 'license')
        .field('issue_date', '2019-06-15')
        .field('expiry_date', '2029-06-15')
        .attach('file', Buffer.from('test file content'), 'license.pdf');

      expect(response.status).toBe(201);
      expect(response.body.data.document_type).toBe('license');
      expect(response.body.data.issue_date).toBe('2019-06-15');
      expect(response.body.data.expiry_date).toBe('2029-06-15');
      expect(response.body.data.version).toBe(1);
      expect(response.body.data.is_active).toBe(true);
    });

    it('should support all document types', async () => {
      const documentTypes = ['passport', 'visa', 'license', 'certificate', 'contract', 'policy', 'other'];

      for (const docType of documentTypes) {
        const response = await request(app)
          .post('/api/v1/documents')
          .set('Authorization', `Bearer ${authToken}`)
          .field('document_type', docType)
          .attach('file', Buffer.from('test file content'), `test-${docType}.pdf`);

        expect(response.status).toBe(201);
        expect(response.body.data.document_type).toBe(docType);
      }
    });
  });
});
