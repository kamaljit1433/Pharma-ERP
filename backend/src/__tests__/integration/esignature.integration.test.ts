import request from 'supertest';
import app from '../../index';
import { createTestHelpers } from '../utils/test-helpers';
import { v4 as uuidv4 } from 'uuid';

describe('e-Signature API Integration Tests', () => {
  const helpers = createTestHelpers();
  let authToken: string;
  let hrToken: string;
  let employeeId: string;
  let hrManagerId: string;
  let documentId: string;
  let signatureRequestId: string;

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
    employeeId = uuidv4();
    hrManagerId = uuidv4();

    // Create test document
    documentId = uuidv4();
    await helpers.insert('documents', {
      id: documentId,
      employee_id: employeeId,
      document_type: 'contract',
      file_name: 'test-contract.pdf',
      file_url: 's3://bucket/test-contract.pdf',
      mime_type: 'application/pdf',
      file_size: 1024,
      version: 1,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Mock auth tokens
    authToken = 'test-token-employee';
    hrToken = 'test-token-hr';
  });

  describe('POST /api/v1/esignature/requests - Create Signature Request', () => {
    it('should create a signature request successfully', async () => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      const response = await request(app)
        .post('/api/v1/esignature/requests')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({
          document_id: documentId,
          signer_id: employeeId,
          document_title: 'Employment Contract',
          expires_in_days: 7,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.document_title).toBe('Employment Contract');
      expect(response.body.data.signer_id).toBe(employeeId);

      signatureRequestId = response.body.data.id;
    });

    it('should reject request with missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/esignature/requests')
        .set('Authorization', `Bearer ${hrToken}`)
        .send({
          // Missing signer_id, document_title, expires_at
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Missing required fields');
    });

    it('should reject request with past expiry date', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const response = await request(app)
        .post('/api/v1/esignature/requests')
        .set('Authorization', `Bearer ${hrManagerToken}`)
        .send({
          document_id: documentId,
          signer_id: employeeId,
          document_title: 'Employment Contract',
          expires_at: pastDate.toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Expiry date must be in the future');
    });

    it('should reject request with non-existent document', async () => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      const response = await request(app)
        .post('/api/v1/esignature/requests')
        .set('Authorization', `Bearer ${hrManagerToken}`)
        .send({
          document_id: uuidv4(),
          signer_id: employeeId,
          document_title: 'Employment Contract',
          expires_at: expiryDate.toISOString(),
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should require HR Manager role', async () => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      const response = await request(app)
        .post('/api/v1/esignature/requests')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
     