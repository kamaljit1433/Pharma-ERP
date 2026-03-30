import request from 'supertest';
import app from '../../index';
import { createTestHelpers } from '../utils/test-helpers';

describe('Bank Details API Integration Tests', () => {
  const helpers = createTestHelpers();
  let authToken: string;
  let employeeId: string;
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
    const employee = await factories.employees().create();
    await factories.employees().create(); // financeUser

    employeeId = employee.id;

    // Mock auth tokens
    authToken = 'test-token-employee';
    financeToken = 'test-token-finance';
  });

  describe('POST /api/v1/bank-details - Add Bank Account', () => {
    it('should add a new bank account with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/bank-details')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          account_holder_name: 'John Doe',
          bank_name: 'HDFC Bank',
          account_number: '123456789012345',
          ifsc_code: 'HDFC0001234',
          account_type: 'savings',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.account_holder_name).toBe('John Doe');
      expect(response.body.data.bank_name).toBe('HDFC Bank');
      expect(response.body.data.account_number_masked).toBeDefined();
      expect(response.body.data.account_number_masked).toMatch(/^\*+\d{4}$/);
    });

    it('should reject invalid IFSC code format', async () => {
      const response = await request(app)
        .post('/api/v1/bank-details')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          account_holder_name: 'John Doe',
          bank_name: 'HDFC Bank',
          account_number: '123456789012345',
          ifsc_code: 'INVALID',
          account_type: 'savings',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('IFSC');
    });

    it('should reject invalid account number length', async () => {
      const response = await request(app)
        .post('/api/v1/bank-details')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          account_holder_name: 'John Doe',
          bank_name: 'HDFC Bank',
          account_number: '12345',
          ifsc_code: 'HDFC0001234',
          account_type: 'savings',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('account number');
    });

    it('should reject missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/bank-details')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          account_holder_name: 'John Doe',
          bank_name: 'HDFC Bank',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should enforce maximum 2 accounts per employee', async () => {
      // Add first account
      await request(app)
        .post('/api/v1/bank-details')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          account_holder_name: 'John Doe',
          bank_name: 'HDFC Bank',
          account_number: '123456789012345',
          ifsc_code: 'HDFC0001234',
          account_type: 'savings',
        });

      // Add second account
      await request(app)
        .post('/api/v1/bank-details')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          account_holder_name: 'John Doe',
          bank_name: 'ICICI Bank',
          account_number: '987654321098765',
          ifsc_code: 'ICIC0001234',
          account_type: 'current',
        });

      // Try to add third account (should fail)
      const response = await request(app)
        .post('/api/v1/bank-details')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          account_holder_name: 'John Doe',
          bank_name: 'Axis Bank',
          account_number: '555555555555555',
          ifsc_code: 'AXIS0001234',
          account_type: 'salary',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Maximum');
    });
  });

  describe('PUT /api/v1/bank-details/:id - Update Bank Account', () => {
    let accountId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/bank-details')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          account_holder_name: 'John Doe',
          bank_name: 'HDFC Bank',
          account_number: '123456789012345',
          ifsc_code: 'HDFC0001234',
          account_type: 'savings',
        });

      accountId = response.body.data.id;
    });

    it('should update bank account with valid data', async () => {
      const response = await request(app)
        .put(`/api/v1/bank-details/${accountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          account_holder_name: 'Jane Doe',
          bank_name: 'ICICI Bank',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.account_holder_name).toBe('Jane Doe');
      expect(response.body.data.bank_name).toBe('ICICI Bank');
    });

    it('should reject update with invalid IFSC code', async () => {
      const response = await request(app)
        .put(`/api/v1/bank-details/${accountId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ifsc_code: 'INVALID',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent account', async () => {
      const response = await request(app)
        .put('/api/v1/bank-details/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          account_holder_name: 'Jane Doe',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/bank-details/:id/set-primary - Set Primary Account', () => {
    let accountId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/bank-details')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          account_holder_name: 'John Doe',
          bank_name: 'HDFC Bank',
          account_number: '123456789012345',
          ifsc_code: 'HDFC0001234',
          account_type: 'savings',
        });

      accountId = response.body.data.id;
    });

    it('should reject setting unverified account as primary', async () => {
      const response = await request(app)
        .put(`/api/v1/bank-details/${accountId}/set-primary`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('verified');
    });

    it('should set verified account as primary', async () => {
      // First verify the account
      await request(app)
        .put(`/api/v1/bank-details/${accountId}/verify`)
        .set('Authorization', `Bearer ${financeToken}`)
        .send({});

      // Then set as primary
      const response = await request(app)
        .put(`/api/v1/bank-details/${accountId}/set-primary`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.is_primary).toBe(true);
    });
  });

  describe('PUT /api/v1/bank-details/:id/verify - Verify Bank Account', () => {
    let accountId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/v1/bank-details')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          account_holder_name: 'John Doe',
          bank_name: 'HDFC Bank',
          account_number: '123456789012345',
          ifsc_code: 'HDFC0001234',
          account_type: 'savings',
        });

      accountId = response.body.data.id;
    });

    it('should verify bank account (Finance only)', async () => {
      const response = await request(app)
        .put(`/api/v1/bank-details/${accountId}/verify`)
        .set('Authorization', `Bearer ${financeToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.verification_status).toBe('verified');
    });

    it('should return 404 for non-existent account', async () => {
      const response = await request(app)
        .put('/api/v1/bank-details/non-existent-id/verify')
        .set('Authorization', `Bearer ${financeToken}`)
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/bank-details/:employeeId - Get Bank Accounts', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/bank-details')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          account_holder_name: 'John Doe',
          bank_name: 'HDFC Bank',
          account_number: '123456789012345',
          ifsc_code: 'HDFC0001234',
          account_type: 'savings',
        });
    });

    it('should get employee bank accounts', async () => {
      const response = await request(app)
        .get(`/api/v1/bank-details/${employeeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].account_number_masked).toBeDefined();
    });

    it('should mask account numbers in response', async () => {
      const response = await request(app)
        .get(`/api/v1/bank-details/${employeeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      response.body.data.forEach((account: any) => {
        expect(account.account_number_masked).toMatch(/^\*+\d{4}$/);
        expect(account.account_number_encrypted).toBeUndefined();
      });
    });

    it('should prevent employee from viewing other employee accounts', async () => {
      const response = await request(app)
        .get(`/api/v1/bank-details/other-employee-id`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should allow Finance to view any employee accounts', async () => {
      const response = await request(app)
        .get(`/api/v1/bank-details/${employeeId}`)
        .set('Authorization', `Bearer ${financeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Authorization Tests', () => {
    it('should require authentication for all endpoints', async () => {
      const response = await request(app)
        .post('/api/v1/bank-details')
        .send({
          account_holder_name: 'John Doe',
          bank_name: 'HDFC Bank',
          account_number: '123456789012345',
          ifsc_code: 'HDFC0001234',
          account_type: 'savings',
        });

      expect(response.status).toBe(401);
    });
  });
});
