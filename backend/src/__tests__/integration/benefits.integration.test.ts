import request from 'supertest';
import app from '../../index';
import { createTestHelpers } from '../utils/test-helpers';

describe('Benefits API Integration Tests', () => {
  const helpers = createTestHelpers();
  let authToken: string;
  let employeeId: string;
  let approverId: string;

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
    const approver = await factories.employees().create();

    employeeId = employee.id;
    approverId = approver.id;

    // Mock auth token (in real tests, this would be generated properly)
    authToken = 'test-token';
  });

  describe('Insurance Plans', () => {
    it('should create an insurance plan', async () => {
      const response = await request(app)
        .post('/api/v1/benefits/insurance-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Health Insurance Plan',
          provider: 'ICICI Lombard',
          coverage_type: 'Health',
          premium_amount: 5000,
          enrollment_start_date: new Date(),
          enrollment_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Health Insurance Plan');
    });

    it('should get all insurance plans', async () => {
      // Create a plan first
      await request(app)
        .post('/api/v1/benefits/insurance-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Health Insurance Plan',
          provider: 'ICICI Lombard',
          coverage_type: 'Health',
          premium_amount: 5000,
          enrollment_start_date: new Date(),
          enrollment_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

      const response = await request(app)
        .get('/api/v1/benefits/insurance-plans')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should update an insurance plan', async () => {
      // Create a plan first
      const createResponse = await request(app)
        .post('/api/v1/benefits/insurance-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Health Insurance Plan',
          provider: 'ICICI Lombard',
          coverage_type: 'Health',
          premium_amount: 5000,
          enrollment_start_date: new Date(),
          enrollment_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

      const planId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/v1/benefits/insurance-plans/${planId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          premium_amount: 6000,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.premium_amount).toBe(6000);
    });

    it('should delete an insurance plan', async () => {
      // Create a plan first
      const createResponse = await request(app)
        .post('/api/v1/benefits/insurance-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Health Insurance Plan',
          provider: 'ICICI Lombard',
          coverage_type: 'Health',
          premium_amount: 5000,
          enrollment_start_date: new Date(),
          enrollment_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

      const planId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/v1/benefits/insurance-plans/${planId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Insurance Enrollment', () => {
    it('should enroll employee in insurance plan', async () => {
      // Create a plan first
      const planResponse = await request(app)
        .post('/api/v1/benefits/insurance-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Health Insurance Plan',
          provider: 'ICICI Lombard',
          coverage_type: 'Health',
          premium_amount: 5000,
          enrollment_start_date: new Date(),
          enrollment_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

      const planId = planResponse.body.data.id;

      const response = await request(app)
        .post('/api/v1/benefits/insurance/enroll')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          employee_id: employeeId,
          insurance_plan_id: planId,
          enrollment_date: new Date(),
          effective_from: new Date(),
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.employee_id).toBe(employeeId);
    });

    it('should get employee enrollments', async () => {
      const response = await request(app)
        .get(`/api/v1/benefits/insurance/enrollments/${employeeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('PF Details', () => {
    it('should get PF details for employee', async () => {
      const response = await request(app)
        .get(`/api/v1/benefits/pf/${employeeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('account');
      expect(response.body.data).toHaveProperty('contributions');
      expect(response.body.data).toHaveProperty('balance');
    });

    it('should get PF statement', async () => {
      const response = await request(app)
        .get(`/api/v1/benefits/pf/${employeeId}/statement`)
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          fromMonth: 1,
          fromYear: 2024,
          toMonth: 12,
          toYear: 2024,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Gratuity', () => {
    it('should calculate gratuity for employee', async () => {
      const response = await request(app)
        .post(`/api/v1/benefits/gratuity/${employeeId}/calculate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lastDrawnSalary: 50000,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('gratuity_amount');
      expect(response.body.data).toHaveProperty('is_eligible');
      expect(response.body.data).toHaveProperty('years_of_service');
    });

    it('should generate gratuity report', async () => {
      const response = await request(app)
        .post(`/api/v1/benefits/gratuity/${employeeId}/report`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lastDrawnSalary: 50000,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Reimbursement Claims', () => {
    it('should submit reimbursement claim', async () => {
      const response = await request(app)
        .post('/api/v1/benefits/reimbursements')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          employee_id: employeeId,
          claim_type: 'Travel',
          amount: 5000,
          description: 'Travel to client site',
          claim_date: new Date(),
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('pending');
    });

    it('should get employee claims', async () => {
      const response = await request(app)
        .get(`/api/v1/benefits/reimbursements/employee/${employeeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should approve reimbursement claim', async () => {
      // Submit a claim first
      const submitResponse = await request(app)
        .post('/api/v1/benefits/reimbursements')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          employee_id: employeeId,
          claim_type: 'Travel',
          amount: 5000,
          description: 'Travel to client site',
          claim_date: new Date(),
        });

      const claimId = submitResponse.body.data.id;

      const response = await request(app)
        .put(`/api/v1/benefits/reimbursements/${claimId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          approverId,
          approvalNotes: 'Approved',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('approved');
    });

    it('should reject reimbursement claim', async () => {
      // Submit a claim first
      const submitResponse = await request(app)
        .post('/api/v1/benefits/reimbursements')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          employee_id: employeeId,
          claim_type: 'Travel',
          amount: 5000,
          description: 'Travel to client site',
          claim_date: new Date(),
        });

      const claimId = submitResponse.body.data.id;

      const response = await request(app)
        .put(`/api/v1/benefits/reimbursements/${claimId}/reject`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          approverId,
          approvalNotes: 'Insufficient documentation',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('rejected');
    });
  });

  describe('Rewards', () => {
    it('should award reward to employee', async () => {
      const response = await request(app)
        .post('/api/v1/benefits/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          employee_id: employeeId,
          category: 'performance',
          title: 'Outstanding Performance',
          description: 'Excellent work on project X',
          awarded_date: new Date(),
          is_public: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.category).toBe('performance');
    });

    it('should get employee rewards', async () => {
      const response = await request(app)
        .get(`/api/v1/benefits/rewards/employee/${employeeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get public rewards', async () => {
      const response = await request(app)
        .get('/api/v1/benefits/rewards/public/all')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should update reward', async () => {
      // Award a reward first
      const awardResponse = await request(app)
        .post('/api/v1/benefits/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          employee_id: employeeId,
          category: 'performance',
          title: 'Outstanding Performance',
          description: 'Excellent work on project X',
          awarded_date: new Date(),
          is_public: true,
        });

      const rewardId = awardResponse.body.data.id;

      const response = await request(app)
        .put(`/api/v1/benefits/rewards/${rewardId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Exceptional Performance',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Exceptional Performance');
    });

    it('should delete reward', async () => {
      // Award a reward first
      const awardResponse = await request(app)
        .post('/api/v1/benefits/rewards')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          employee_id: employeeId,
          category: 'performance',
          title: 'Outstanding Performance',
          description: 'Excellent work on project X',
          awarded_date: new Date(),
          is_public: true,
        });

      const rewardId = awardResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/v1/benefits/rewards/${rewardId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
