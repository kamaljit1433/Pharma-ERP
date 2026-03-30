import request from 'supertest';
import app from '../../index';
import { createTestHelpers } from '../utils/test-helpers';

describe('Hierarchy API Integration Tests', () => {
  const helpers = createTestHelpers();
  let authToken: string;
  let employeeId: string;
  let managerId: string;

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
    const manager = await factories.employees().create();

    employeeId = employee.id;
    managerId = manager.id;

    // Mock auth token
    authToken = 'test-token';
  });

  describe('Department Management', () => {
    it('should create a department', async () => {
      const response = await request(app)
        .post('/api/v1/hierarchy/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Engineering',
          description: 'Engineering Department',
          head_id: managerId,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Engineering');
      const deptId = response.body.data.id;
    });

    it('should get all departments', async () => {
      // Create a department first
      await request(app)
        .post('/api/v1/hierarchy/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Engineering',
          description: 'Engineering Department',
          head_id: managerId,
        });

      const response = await request(app)
        .get('/api/v1/hierarchy/departments')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get a specific department', async () => {
      // Create a department first
      const createResponse = await request(app)
        .post('/api/v1/hierarchy/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Engineering',
          description: 'Engineering Department',
          head_id: managerId,
        });

      const deptId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/v1/hierarchy/departments/${deptId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Engineering');
    });

    it('should update a department', async () => {
      // Create a department first
      const createResponse = await request(app)
        .post('/api/v1/hierarchy/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Engineering',
          description: 'Engineering Department',
          head_id: managerId,
        });

      const deptId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/v1/hierarchy/departments/${deptId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated Engineering Department',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe('Updated Engineering Department');
    });

    it('should delete a department', async () => {
      // Create a department first
      const createResponse = await request(app)
        .post('/api/v1/hierarchy/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Engineering',
          description: 'Engineering Department',
          head_id: managerId,
        });

      const deptId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/v1/hierarchy/departments/${deptId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Designation Management', () => {
    it('should create a designation', async () => {
      const response = await request(app)
        .post('/api/v1/hierarchy/designations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Senior Engineer',
          description: 'Senior Software Engineer',
          level: 'Senior',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Senior Engineer');
      const desigId = response.body.data.id;
    });

    it('should get all designations', async () => {
      // Create a designation first
      await request(app)
        .post('/api/v1/hierarchy/designations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Senior Engineer',
          description: 'Senior Software Engineer',
          level: 'Senior',
        });

      const response = await request(app)
        .get('/api/v1/hierarchy/designations')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get a specific designation', async () => {
      // Create a designation first
      const createResponse = await request(app)
        .post('/api/v1/hierarchy/designations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Senior Engineer',
          description: 'Senior Software Engineer',
          level: 'Senior',
        });

      const desigId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/v1/hierarchy/designations/${desigId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Senior Engineer');
    });

    it('should update a designation', async () => {
      // Create a designation first
      const createResponse = await request(app)
        .post('/api/v1/hierarchy/designations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Senior Engineer',
          description: 'Senior Software Engineer',
          level: 'Senior',
        });

      const desigId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/v1/hierarchy/designations/${desigId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated Senior Software Engineer',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe('Updated Senior Software Engineer');
    });

    it('should delete a designation', async () => {
      // Create a designation first
      const createResponse = await request(app)
        .post('/api/v1/hierarchy/designations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Senior Engineer',
          description: 'Senior Software Engineer',
          level: 'Senior',
        });

      const desigId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/v1/hierarchy/designations/${desigId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Employee Position Assignment', () => {
    it('should assign employee position', async () => {
      // Create department and designation first
      const deptResponse = await request(app)
        .post('/api/v1/hierarchy/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Engineering',
          description: 'Engineering Department',
          head_id: managerId,
        });

      const desigResponse = await request(app)
        .post('/api/v1/hierarchy/designations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Senior Engineer',
          description: 'Senior Software Engineer',
          level: 'Senior',
        });

      const deptId = deptResponse.body.data.id;
      const desigId = desigResponse.body.data.id;

      const response = await request(app)
        .put('/api/v1/hierarchy/assign')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          employee_id: employeeId,
          designation_id: desigId,
          department_id: deptId,
          manager_id: managerId,
          is_primary: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.employee_id).toBe(employeeId);
    });
  });

  describe('Hierarchy Queries', () => {
    it('should get reporting chain for employee', async () => {
      const response = await request(app)
        .get(`/api/v1/hierarchy/reporting-chain/${employeeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get direct reports for manager', async () => {
      const response = await request(app)
        .get(`/api/v1/hierarchy/direct-reports/${managerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get org chart', async () => {
      const response = await request(app)
        .get('/api/v1/hierarchy/org-chart')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should get org chart with root employee', async () => {
      const response = await request(app)
        .get(`/api/v1/hierarchy/org-chart?rootEmployeeId=${managerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Hierarchy Audit Logs', () => {
    it('should get hierarchy audit logs', async () => {
      const response = await request(app)
        .get(`/api/v1/hierarchy/audit-logs/${employeeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
