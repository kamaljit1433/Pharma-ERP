import request from 'supertest';
import app from '../../index';
import { getKnexInstance } from '../../config/knex';

const db = getKnexInstance();

describe('Separation API Integration Tests', () => {
  let employeeId: string;
  let resignationId: string;
  let exitInterviewId: string;
  let fnfSettlementId: string;

  beforeAll(async () => {
    // Create test employee
    const [employee] = await db('employees')
      .insert({
        id: '00000000-0000-0000-0000-000000000001',
        employee_id: 'EMP-SEP-001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@test.com',
        phone: '9876543210',
        date_of_birth: '1990-01-01',
        gender: 'Male',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'USA',
        date_of_joining: '2020-01-01',
        employment_type: 'Full-time',
        status: 'active',
      })
      .returning('*');

    employeeId = employee.id;
  });

  afterAll(async () => {
    // Clean up test data
    await db('resignations').where('employee_id', employeeId).delete();
    await db('exit_interviews').where('employee_id', employeeId).delete();
    await db('fnf_settlements').where('employee_id', employeeId).delete();
    await db('asset_recovery_checklists').where('employee_id', employeeId).delete();
    await db('employees').where('id', employeeId).delete();
  });

  describe('POST /api/v1/separation/resignation', () => {
    it('should submit resignation successfully', async () => {
      const resignationDate = new Date('2026-03-15');
      const lastWorkingDay = new Date('2026-04-15');

      const response = await request(app)
        .post('/api/v1/separation/resignation')
        .send({
          employeeId,
          resignation_date: resignationDate,
          last_working_day: lastWorkingDay,
          reason: 'Better opportunity',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.employee_id).toBe(employeeId);
      expect(response.body.data.status).toBe('pending');

      resignationId = response.body.data.id;
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/separation/resignation')
        .send({
          reason: 'Better opportunity',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/separation/termination', () => {
    it('should initiate termination successfully', async () => {
      const terminationDate = new Date('2026-03-20');

      const response = await request(app)
        .post('/api/v1/separation/termination')
        .send({
          employeeId,
          termination_date: terminationDate,
          reason: 'Performance issues',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.employee_id).toBe(employeeId);
      expect(response.body.data.status).toBe('pending');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/v1/separation/termination')
        .send({
          employeeId,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/separation/resignation/:resignationId', () => {
    it('should get resignation by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/separation/resignation/${resignationId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(resignationId);
      expect(response.body.data.employee_id).toBe(employeeId);
    });

    it('should return 404 if resignation not found', async () => {
      const response = await request(app)
        .get('/api/v1/separation/resignation/invalid-id')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/separation/resignation/:resignationId/accept', () => {
    it('should accept resignation successfully', async () => {
      const response = await request(app)
        .put(`/api/v1/separation/resignation/${resignationId}/accept`)
        .send({
          acceptedBy: 'hr-emp-001',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('accepted');
      expect(response.body.data.accepted_by).toBe('hr-emp-001');
    });

    it('should return 400 if acceptedBy is missing', async () => {
      // Create another resignation for this test
      const [newResignation] = await db('resignations')
        .insert({
          id: '00000000-0000-0000-0000-000000000002',
          employee_id: employeeId,
          resignation_date: new Date('2026-03-20'),
          last_working_day: new Date('2026-04-20'),
          reason: 'Test',
          status: 'pending',
        })
        .returning('*');

      const response = await request(app)
        .put(`/api/v1/separation/resignation/${newResignation.id}/accept`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);

      // Clean up
      await db('resignations').where('id', newResignation.id).delete();
    });
  });

  describe('POST /api/v1/separation/exit-interview', () => {
    it('should schedule exit interview successfully', async () => {
      const scheduledAt = new Date('2026-04-20');

      const response = await request(app)
        .post('/api/v1/separation/exit-interview')
        .send({
          employeeId,
          scheduled_at: scheduledAt,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.employee_id).toBe(employeeId);
      expect(response.body.data.status).toBe('scheduled');

      exitInterviewId = response.body.data.id;
    });

    it('should return 400 if scheduled_at is missing', async () => {
      const response = await request(app)
        .post('/api/v1/separation/exit-interview')
        .send({
          employeeId,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/separation/exit-interview/:exitInterviewId/complete', () => {
    it('should complete exit interview successfully', async () => {
      const response = await request(app)
        .put(`/api/v1/separation/exit-interview/${exitInterviewId}/complete`)
        .send({
          conducted_by: 'hr-emp-001',
          questionnaire_responses: {
            question1: 'Good experience',
            question2: 'Supportive team',
          },
          feedback: 'Employee had positive experience',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.conducted_by).toBe('hr-emp-001');
    });

    it('should return 400 if required fields are missing', async () => {
      // Create another exit interview for this test
      const [newExitInterview] = await db('exit_interviews')
        .insert({
          id: '00000000-0000-0000-0000-000000000003',
          employee_id: employeeId,
          scheduled_at: new Date('2026-04-25'),
          status: 'scheduled',
        })
        .returning('*');

      const response = await request(app)
        .put(`/api/v1/separation/exit-interview/${newExitInterview.id}/complete`)
        .send({
          conducted_by: 'hr-emp-001',
        })
        .expect(400);

      expect(response.body.success).toBe(false);

      // Clean up
      await db('exit_interviews').where('id', newExitInterview.id).delete();
    });
  });

  describe('GET /api/v1/separation/fnf/:employeeId', () => {
    it('should calculate F&F settlement successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/separation/fnf/${employeeId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.employee_id).toBe(employeeId);
      expect(response.body.data.status).toBe('draft');
      expect(response.body.data).toHaveProperty('total_earnings');
      expect(response.body.data).toHaveProperty('total_deductions');
      expect(response.body.data).toHaveProperty('net_settlement');

      fnfSettlementId = response.body.data.id;
    });
  });

  describe('PUT /api/v1/separation/fnf/:id/approve', () => {
    it('should approve F&F settlement successfully', async () => {
      const response = await request(app)
        .put(`/api/v1/separation/fnf/${fnfSettlementId}/approve`)
        .send({
          approvedBy: 'finance-emp-001',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('approved');
      expect(response.body.data.approved_by).toBe('finance-emp-001');
    });

    it('should return 400 if approvedBy is missing', async () => {
      // Create another F&F settlement for this test
      const [newFnF] = await db('fnf_settlements')
        .insert({
          id: '00000000-0000-0000-0000-000000000004',
          employee_id: employeeId,
          pending_salary: 0,
          leave_encashment: 0,
          gratuity: 0,
          total_earnings: 0,
          total_deductions: 0,
          net_settlement: 0,
          status: 'draft',
        })
        .returning('*');

      const response = await request(app)
        .put(`/api/v1/separation/fnf/${newFnF.id}/approve`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);

      // Clean up
      await db('fnf_settlements').where('id', newFnF.id).delete();
    });
  });

  describe('GET /api/v1/separation/asset-recovery/:employeeId', () => {
    it('should get asset recovery checklist successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/separation/asset-recovery/${employeeId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('PUT /api/v1/separation/asset-recovery/:assetRecoveryId', () => {
    it('should update asset recovery status successfully', async () => {
      // Create an asset recovery record for this test
      const [assetRecovery] = await db('asset_recovery_checklists')
        .insert({
          id: '00000000-0000-0000-0000-000000000005',
          employee_id: employeeId,
          asset_id: '00000000-0000-0000-0000-000000000006',
          status: 'pending',
        })
        .returning('*');

      const response = await request(app)
        .put(`/api/v1/separation/asset-recovery/${assetRecovery.id}`)
        .send({
          status: 'returned',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('returned');

      // Clean up
      await db('asset_recovery_checklists').where('id', assetRecovery.id).delete();
    });

    it('should return 400 if status is missing', async () => {
      const response = await request(app)
        .put('/api/v1/separation/asset-recovery/invalid-id')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/separation/:employeeId/offboarding-check', () => {
    it('should check offboarding preconditions successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/separation/${employeeId}/offboarding-check`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('canDeactivate');
      expect(response.body.data).toHaveProperty('missingItems');
      expect(Array.isArray(response.body.data.missingItems)).toBe(true);
    });
  });

  describe('PUT /api/v1/separation/deactivate/:employeeId', () => {
    it('should return error if preconditions not met', async () => {
      const response = await request(app)
        .put(`/api/v1/separation/deactivate/${employeeId}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
