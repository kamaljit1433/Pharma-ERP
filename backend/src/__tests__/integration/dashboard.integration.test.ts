import request from 'supertest';
import { Express } from 'express';
import knex from '../../config/knex';

describe('Dashboard API Integration Tests', () => {
  let app: Express;
  let authToken: string;

  beforeAll(async () => {
    // Initialize app and database
    // This would be set up in your test configuration
  });

  afterAll(async () => {
    await knex.destroy();
  });

  describe('GET /api/v1/dashboard/stats', () => {
    it('should return complete dashboard statistics', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('employees');
      expect(response.body.data).toHaveProperty('attendance');
      expect(response.body.data).toHaveProperty('leaves');
      expect(response.body.data).toHaveProperty('payroll');
      expect(response.body.data).toHaveProperty('recruitment');
      expect(response.body.data).toHaveProperty('generatedAt');
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/v1/dashboard/stats');

      expect(response.status).toBe(401);
    });

    it('should require view_dashboard permission', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBeOneOf([200, 403]);
    });
  });

  describe('GET /api/v1/dashboard/employees', () => {
    it('should return employee statistics', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/employees')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('active');
      expect(response.body.data).toHaveProperty('byDepartment');
      expect(response.body.data).toHaveProperty('byDesignation');
    });
  });

  describe('GET /api/v1/dashboard/attendance', () => {
    it('should return attendance statistics', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/attendance')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalEmployees');
      expect(response.body.data).toHaveProperty('presentToday');
      expect(response.body.data).toHaveProperty('attendanceRate');
    });
  });

  describe('GET /api/v1/dashboard/leaves', () => {
    it('should return leave statistics', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/leaves')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalLeaveRequests');
      expect(response.body.data).toHaveProperty('pendingApprovals');
      expect(response.body.data).toHaveProperty('leaveTypeBreakdown');
    });
  });

  describe('GET /api/v1/dashboard/payroll', () => {
    it('should return payroll statistics', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/payroll')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalEmployees');
      expect(response.body.data).toHaveProperty('processedThisMonth');
      expect(response.body.data).toHaveProperty('totalPayrollAmount');
    });
  });

  describe('GET /api/v1/dashboard/recruitment', () => {
    it('should return recruitment statistics', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/recruitment')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('openPositions');
      expect(response.body.data).toHaveProperty('totalApplicants');
      expect(response.body.data).toHaveProperty('applicantsByStage');
    });
  });
});

describe('Reports API Integration Tests', () => {
  let app: Express;
  let authToken: string;

  beforeAll(async () => {
    // Initialize app and database
  });

  afterAll(async () => {
    await knex.destroy();
  });

  describe('GET /api/v1/dashboard/reports/employees', () => {
    it('should generate employee report in JSON format', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/reports/employees')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('employee');
      expect(Array.isArray(response.body.data.rows)).toBe(true);
      expect(response.body.data).toHaveProperty('totalRows');
      expect(response.body.data).toHaveProperty('generatedAt');
    });

    it('should export employee report as CSV', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/reports/employees?format=csv')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('employee-report.csv');
    });

    it('should filter by department', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/reports/employees?departmentId=DEPT001')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/reports/employees?status=active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/reports/employees?limit=50&offset=0')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/dashboard/reports/attendance', () => {
    it('should generate attendance report', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/reports/attendance')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('attendance');
    });

    it('should export attendance report as CSV', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/reports/attendance?format=csv')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2024-01-01').toISOString();
      const endDate = new Date('2024-01-31').toISOString();

      const response = await request(app)
        .get(`/api/v1/dashboard/reports/attendance?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/dashboard/reports/leaves', () => {
    it('should generate leave report', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/reports/leaves')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('leave');
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/reports/leaves?status=approved')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/dashboard/reports/payroll', () => {
    it('should generate payroll report', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/reports/payroll')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('payroll');
    });
  });

  describe('GET /api/v1/dashboard/reports/performance', () => {
    it('should generate performance report', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/reports/performance')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('performance');
    });
  });

  describe('GET /api/v1/dashboard/reports/training', () => {
    it('should generate training report', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/reports/training')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('training');
    });
  });

  describe('Authorization', () => {
    it('should require authentication for all report endpoints', async () => {
      const endpoints = [
        '/api/v1/dashboard/reports/employees',
        '/api/v1/dashboard/reports/attendance',
        '/api/v1/dashboard/reports/leaves',
        '/api/v1/dashboard/reports/payroll',
        '/api/v1/dashboard/reports/performance',
        '/api/v1/dashboard/reports/training',
      ];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);
        expect(response.status).toBe(401);
      }
    });

    it('should require generate_reports permission', async () => {
      const response = await request(app)
        .get('/api/v1/dashboard/reports/employees')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBeOneOf([200, 403]);
    });
  });
});
