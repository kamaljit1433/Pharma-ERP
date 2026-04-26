/**
 * Leave API Integration Tests
 * 
 * Tests for leave management endpoints including:
 * - Leave type management
 * - Holiday management
 * - Leave application and approval
 * - Leave balance tracking
 * - Team leave calendar
 */

import request from 'supertest';
import express, { Express } from 'express';
import { createLeaveRoutes } from '../../routes/leave';
import db from '../../config/knex';
import { v4 as uuidv4 } from 'uuid';
import { generateTokenPair } from '../../utils/jwt';

describe('Leave API Integration Tests', () => {
  let app: Express;
  let employeeId: string;
  let managerId: string;
  let leaveTypeId: string;
  let holidayId: string;
  let leaveRequestId: string;
  let accessToken: string;
  let managerToken: string;

  beforeAll(async () => {
    // Setup Express app
    app = express();
    app.use(express.json());
    app.use('/api/v1/leave', createLeaveRoutes(db));

    // Clean up test data
    await db('leaves').del();
    await db('leave_balances').del();
    await db('leave_types').del();
    await db('company_holidays').del();
    await db('employees').where('email', 'like', '%leave-test%').del();

    // Create test employees
    employeeId = uuidv4();
    managerId = uuidv4();

    await db('employees').insert([
      {
        id: employeeId,
        employee_id: 'EMP-LEAVE-001',
        first_name: 'Leave',
        last_name: 'Employee',
        email: 'leave-test-employee@example.com',
        phone: '1234567890',
        date_of_joining: '2024-01-01',
        employment_type: 'permanent',
        status: 'active',
      },
      {
        id: managerId,
        employee_id: 'EMP-LEAVE-MGR',
        first_name: 'Leave',
        last_name: 'Manager',
        email: 'leave-test-manager@example.com',
        phone: '1234567891',
        date_of_joining: '2024-01-01',
        employment_type: 'permanent',
        status: 'active',
      },
    ]);

    // Generate tokens
    const employeeTokens = generateTokenPair({
      userId: uuidv4(),
      employeeId,
      email: 'leave-test-employee@example.com',
      role: 'employee',
    });
    accessToken = employeeTokens.accessToken;

    const managerTokens = generateTokenPair({
      userId: uuidv4(),
      employeeId: managerId,
      email: 'leave-test-manager@example.com',
      role: 'manager',
    });
    managerToken = managerTokens.accessToken;
  });

  afterAll(async () => {
    // Clean up test data
    await db('leaves').del();
    await db('leave_balances').del();
    await db('leave_types').del();
    await db('company_holidays').del();
    await db('employees').where('email', 'like', '%leave-test%').del();
    await db.destroy();
  });

  describe('POST /api/v1/leave/leave-types', () => {
    it('should create a new leave type', async () => {
      const response = await request(app)
        .post('/api/v1/leave/leave-types')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Annual Leave',
          code: 'AL',
          days_per_year: 20,
          carry_forward_allowed: true,
          max_carry_forward_days: 5,
          description: 'Annual paid leave',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Annual Leave');
      expect(response.body.days_per_year).toBe(20);

      leaveTypeId = response.body.id;
    });

    it('should reject duplicate leave type code', async () => {
      const response = await request(app)
        .post('/api/v1/leave/leave-types')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'Another Annual Leave',
          code: 'AL',
          days_per_year: 15,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject leave type creation without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/leave/leave-types')
        .send({
          name: 'Sick Leave',
          code: 'SL',
          days_per_year: 10,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/leave/leave-types', () => {
    it('should retrieve all leave types', async () => {
      const response = await request(app)
        .get('/api/v1/leave/leave-types')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app).get('/api/v1/leave/leave-types');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/leave/leave-types/:id', () => {
    it('should retrieve a specific leave type', async () => {
      const response = await request(app)
        .get(`/api/v1/leave/leave-types/${leaveTypeId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(leaveTypeId);
      expect(response.body.name).toBe('Annual Leave');
    });

    it('should return 404 for non-existent leave type', async () => {
      const response = await request(app)
        .get(`/api/v1/leave/leave-types/${uuidv4()}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/leave/leave-types/:id', () => {
    it('should update a leave type', async () => {
      const response = await request(app)
        .put(`/api/v1/leave/leave-types/${leaveTypeId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          days_per_year: 22,
          max_carry_forward_days: 7,
        });

      expect(response.status).toBe(200);
      expect(response.body.days_per_year).toBe(22);
      expect(response.body.max_carry_forward_days).toBe(7);
    });

    it('should return 404 for non-existent leave type', async () => {
      const response = await request(app)
        .put(`/api/v1/leave/leave-types/${uuidv4()}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          days_per_year: 25,
        });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/v1/leave/holidays', () => {
    it('should create a new holiday', async () => {
      const response = await request(app)
        .post('/api/v1/leave/holidays')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          name: 'New Year',
          date: '2025-01-01',
          type: 'national',
          description: 'New Year celebration',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('New Year');

      holidayId = response.body.id;
    });

    it('should reject holiday creation without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/leave/holidays')
        .send({
          name: 'Independence Day',
          date: '2025-08-15',
          type: 'national',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/leave/holidays', () => {
    it('should retrieve all holidays', async () => {
      const response = await request(app)
        .get('/api/v1/leave/holidays')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter holidays by year', async () => {
      const response = await request(app)
        .get('/api/v1/leave/holidays?year=2025')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/v1/leave/leaves', () => {
    beforeAll(async () => {
      // Create leave balance for employee
      await db('leave_balances').insert({
        id: uuidv4(),
        employee_id: employeeId,
        leave_type_id: leaveTypeId,
        year: 2025,
        total_days: 20,
        used_days: 0,
        remaining_days: 20,
      });
    });

    it('should apply for leave successfully', async () => {
      const response = await request(app)
        .post('/api/v1/leave/leaves')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          employeeId,
          leaveTypeId,
          startDate: '2025-03-01',
          endDate: '2025-03-05',
          reason: 'Family vacation',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('pending');

      leaveRequestId = response.body.id;
    });

    it('should reject leave application with insufficient balance', async () => {
      const response = await request(app)
        .post('/api/v1/leave/leaves')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          employeeId,
          leaveTypeId,
          startDate: '2025-04-01',
          endDate: '2025-04-30',
          reason: 'Extended vacation',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject leave application with invalid date range', async () => {
      const response = await request(app)
        .post('/api/v1/leave/leaves')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          employeeId,
          leaveTypeId,
          startDate: '2025-05-10',
          endDate: '2025-05-05',
          reason: 'Invalid dates',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/v1/leave/leaves/:id/approve', () => {
    it('should approve leave request', async () => {
      const response = await request(app)
        .put(`/api/v1/leave/leaves/${leaveRequestId}/approve`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          approverId: managerId,
          comments: 'Approved for vacation',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('approved');
    });

    it('should return 404 for non-existent leave request', async () => {
      const response = await request(app)
        .put(`/api/v1/leave/leaves/${uuidv4()}/approve`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          approverId: managerId,
        });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/v1/leave/leaves/:id/reject', () => {
    beforeAll(async () => {
      // Create another leave request for rejection
      const [leave] = await db('leaves')
        .insert({
          id: uuidv4(),
          employee_id: employeeId,
          leave_type_id: leaveTypeId,
          start_date: '2025-06-01',
          end_date: '2025-06-03',
          total_days: 3,
          reason: 'Personal work',
          status: 'pending',
        })
        .returning('*');

      leaveRequestId = leave.id;
    });

    it('should reject leave request', async () => {
      const response = await request(app)
        .put(`/api/v1/leave/leaves/${leaveRequestId}/reject`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          approverId: managerId,
          comments: 'Insufficient staffing',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('rejected');
    });
  });

  describe('GET /api/v1/leave/leaves/balance/:employeeId', () => {
    it('should retrieve leave balance for employee', async () => {
      const response = await request(app)
        .get(`/api/v1/leave/leaves/balance/${employeeId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter balance by year', async () => {
      const response = await request(app)
        .get(`/api/v1/leave/leaves/balance/${employeeId}?year=2025`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/v1/leave/leaves/team-calendar', () => {
    it('should retrieve team leave calendar', async () => {
      const response = await request(app)
        .get('/api/v1/leave/leaves/team-calendar')
        .set('Authorization', `Bearer ${managerToken}`)
        .query({
          managerId,
          startDate: '2025-01-01',
          endDate: '2025-12-31',
        });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject request without manager authentication', async () => {
      const response = await request(app)
        .get('/api/v1/leave/leaves/team-calendar')
        .query({
          managerId,
          startDate: '2025-01-01',
          endDate: '2025-12-31',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/leave/leave-types/:id', () => {
    it('should delete a leave type', async () => {
      // Create a new leave type for deletion
      const [newLeaveType] = await db('leave_types')
        .insert({
          id: uuidv4(),
          name: 'Temporary Leave',
          code: 'TL',
          days_per_year: 5,
        })
        .returning('*');

      const response = await request(app)
        .delete(`/api/v1/leave/leave-types/${newLeaveType.id}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent leave type', async () => {
      const response = await request(app)
        .delete(`/api/v1/leave/leave-types/${uuidv4()}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/leave/holidays/:id', () => {
    it('should delete a holiday', async () => {
      const response = await request(app)
        .delete(`/api/v1/leave/holidays/${holidayId}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent holiday', async () => {
      const response = await request(app)
        .delete(`/api/v1/leave/holidays/${uuidv4()}`)
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(404);
    });
  });
});
