/**
 * Payroll API Integration Tests
 * 
 * Tests for payroll management endpoints including:
 * - Salary structure configuration
 * - Monthly payroll processing
 * - Payslip generation
 * - Advance salary requests
 * - Payroll locking
 * - Bank file export
 */

import request from 'supertest';
import express, { Express } from 'express';
import { createPayrollRoutes } from '../../routes/payroll';
import db from '../../config/knex';
import { v4 as uuidv4 } from 'uuid';
import { generateTokenPair } from '../../utils/jwt';

describe('Payroll API Integration Tests', () => {
  let app: Express;
  let employeeId: string;
  let financeToken: string;
  let employeeToken: string;
  let salaryStructureId: string;
  let payrollId: string;
  let payslipId: string;

  beforeAll(async () => {
    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/api/v1/payroll', createPayrollRoutes(db));

    // Clean up test data
    await db('payslips').del();
    await db('payroll').del();
    await db('advance_salary_requests').del();
    await db('salary_structures').del();
    await db('employees').where('email', 'like', '%payroll-test%').del();

    // Create test employee
    employeeId = uuidv4();
    await db('employees').insert({
      id: employeeId,
      employee_id: 'EMP-PAY-001',
      first_name: 'Payroll',
      last_name: 'Employee',
      email: 'payroll-test@example.com',
      phone: '1234567890',
      date_of_joining: '2024-01-01',
      employment_type: 'permanent',
      status: 'active',
    });

    // Generate tokens
    const financeTokens = generateTokenPair({
      userId: uuidv4(),
      employeeId: uuidv4(),
      email: 'finance@example.com',
      role: 'finance',
    });
    financeToken = financeTokens.accessToken;

    const empTokens = generateTokenPair({
      userId: uuidv4(),
      employeeId,
      email: 'payroll-test@example.com',
      role: 'employee',
    });
    employeeToken = empTokens.accessToken;
  });

  afterAll(async () => {
    // Clean up test data
    await db('payslips').del();
    await db('payroll').del();
    await db('advance_salary_requests').del();
    await db('salary_structures').del();
    await db('employees').where('email', 'like', '%payroll-test%').del();
    await db.destroy();
  });

  describe('POST /api/v1/payroll/salary-structure', () => {
    it('should configure salary structure for employee', async () => {
      const response = await request(app)
        .post('/api/v1/payroll/salary-structure')
        .set('Authorization', `Bearer ${financeToken}`)
        .send({
          employeeId,
          basicSalary: 50000,
          hra: 20000,
          specialAllowance: 10000,
          transportAllowance: 2000,
          medicalAllowance: 1500,
          pfContribution: 6000,
          esiContribution: 750,
          effectiveFrom: '2024-01-01',
          salaryMode: 'monthly',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.basic_salary).toBe(50000);
      expect(response.body.salary_mode).toBe('monthly');

      salaryStructureId = response.body.id;
    });

    it('should reject salary structure without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/payroll/salary-structure')
        .send({
          employeeId,
          basicSalary: 50000,
        });

      expect(response.status).toBe(401);
    });

    it('should reject salary structure with invalid data', async () => {
      const response = await request(app)
        .post('/api/v1/payroll/salary-structure')
        .set('Authorization', `Bearer ${financeToken}`)
        .send({
          employeeId,
          basicSalary: -1000,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/payroll/salary-structure/:employeeId', () => {
    it('should retrieve salary structure for employee', async () => {
      const response = await request(app)
        .get(`/api/v1/payroll/salary-structure/${employeeId}`)
        .set('Authorization', `Bearer ${financeToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.employee_id).toBe(employeeId);
      expect(response.body.basic_salary).toBe(50000);
    });

    it('should allow employee to view their own salary structure', async () => {
      const response = await request(app)
        .get(`/api/v1/payroll/salary-structure/${employeeId}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.employee_id).toBe(employeeId);
    });

    it('should return 404 for non-existent employee', async () => {
      const response = await request(app)
        .get(`/api/v1/payroll/salary-structure/${uuidv4()}`)
        .set('Authorization', `Bearer ${financeToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/v1/payroll/process', () => {
    beforeAll(async () => {
      // Create attendance records for payroll calculation
      const attendanceId = uuidv4();
      await db('attendance').insert({
        id: attendanceId,
        employee_id: employeeId,
        date: '2024-03-15',
        check_in_time: '09:00:00',
        check_out_time: '18:00:00',
        working_hours: 8,
        status: 'present',
      });
    });

    it('should process monthly payroll', async () => {
      const response = await request(app)
        .post('/api/v1/payroll/process')
        .set('Authorization', `Bearer ${financeToken}`)
        .send({
          month: 3,
          year: 2024,
          employeeIds: [employeeId],
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');
      expect(response.body.summary).toHaveProperty('totalProcessed');
      expect(response.body.summary.totalProcessed).toBeGreaterThan(0);

      // Store payroll ID for later tests
      if (response.body.payrolls && response.body.payrolls.length > 0) {
        payrollId = response.body.payrolls[0].id;
      }
    });

    it('should reject payroll processing without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/payroll/process')
        .send({
          month: 3,
          year: 2024,
        });

      expect(response.status).toBe(401);
    });

    it('should reject payroll processing with invalid month', async () => {
      const response = await request(app)
        .post('/api/v1/payroll/process')
        .set('Authorization', `Bearer ${financeToken}`)
        .send({
          month: 13,
          year: 2024,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/v1/payroll/:employeeId/:month/:year', () => {
    it('should retrieve payroll details for employee', async () => {
      const response = await request(app)
        .get(`/api/v1/payroll/${employeeId}/3/2024`)
        .set('Authorization', `Bearer ${financeToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('employee_id');
      expect(response.body.employee_id).toBe(employeeId);
      expect(response.body.month).toBe(3);
      expect(response.body.year).toBe(2024);
    });

    it('should allow employee to view their own payroll', async () => {
      const response = await request(app)
        .get(`/api/v1/payroll/${employeeId}/3/2024`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.employee_id).toBe(employeeId);
    });

    it('should return 404 for non-existent payroll', async () => {
      const response = await request(app)
        .get(`/api/v1/payroll/${employeeId}/12/2023`)
        .set('Authorization', `Bearer ${financeToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/v1/payroll/payslip/:id', () => {
    beforeAll(async () => {
      // Create a payslip for testing
      if (!payrollId) {
        const [payroll] = await db('payroll')
          .where({ employee_id: employeeId, month: 3, year: 2024 })
          .select('id');
        payrollId = payroll?.id;
      }

      if (payrollId) {
        const [payslip] = await db('payslips')
          .insert({
            id: uuidv4(),
            payroll_id: payrollId,
            employee_id: employeeId,
            month: 3,
            year: 2024,
            file_url: 'https://example.com/payslip.pdf',
          })
          .returning('*');
        payslipId = payslip.id;
      }
    });

    it('should retrieve payslip by ID', async () => {
      if (!payslipId) {
        console.log('Skipping test: payslipId not available');
        return;
      }

      const response = await request(app)
        .get(`/api/v1/payroll/payslip/${payslipId}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(payslipId);
    });

    it('should return 404 for non-existent payslip', async () => {
      const response = await request(app)
        .get(`/api/v1/payroll/payslip/${uuidv4()}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/v1/payroll/advance', () => {
    it('should request advance salary', async () => {
      const response = await request(app)
        .post('/api/v1/payroll/advance')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          employeeId,
          amount: 10000,
          reason: 'Medical emergency',
          requestedDate: '2024-03-20',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.amount).toBe(10000);
      expect(response.body.status).toBe('pending');
    });

    it('should reject advance request exceeding limit', async () => {
      const response = await request(app)
        .post('/api/v1/payroll/advance')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          employeeId,
          amount: 100000,
          reason: 'Large amount',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject advance request without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/payroll/advance')
        .send({
          employeeId,
          amount: 5000,
          reason: 'Personal',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/payroll/:id/lock', () => {
    it('should lock payroll', async () => {
      if (!payrollId) {
        console.log('Skipping test: payrollId not available');
        return;
      }

      const response = await request(app)
        .put(`/api/v1/payroll/${payrollId}/lock`)
        .set('Authorization', `Bearer ${financeToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.payroll.is_locked).toBe(true);
    });

    it('should reject locking without finance role', async () => {
      if (!payrollId) {
        console.log('Skipping test: payrollId not available');
        return;
      }

      const response = await request(app)
        .put(`/api/v1/payroll/${payrollId}/lock`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent payroll', async () => {
      const response = await request(app)
        .put(`/api/v1/payroll/${uuidv4()}/lock`)
        .set('Authorization', `Bearer ${financeToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/v1/payroll/export/:month/:year', () => {
    it('should export bank file for payroll', async () => {
      const response = await request(app)
        .get('/api/v1/payroll/export/3/2024')
        .set('Authorization', `Bearer ${financeToken}`)
        .query({ format: 'CSV' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
    });

    it('should support NEFT format export', async () => {
      const response = await request(app)
        .get('/api/v1/payroll/export/3/2024')
        .set('Authorization', `Bearer ${financeToken}`)
        .query({ format: 'NEFT' });

      expect(response.status).toBe(200);
    });

    it('should reject export without finance role', async () => {
      const response = await request(app)
        .get('/api/v1/payroll/export/3/2024')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent payroll period', async () => {
      const response = await request(app)
        .get('/api/v1/payroll/export/12/2020')
        .set('Authorization', `Bearer ${financeToken}`);

      expect(response.status).toBe(404);
    });
  });
});
