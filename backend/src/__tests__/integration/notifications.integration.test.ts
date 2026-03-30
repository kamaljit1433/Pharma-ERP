import request from 'supertest';
import app from '../../index';
import { getKnexInstance } from '../../config/knex';
import { Knex } from 'knex';

describe('Notification API Integration Tests', () => {
  let knex: Knex;
  let employeeId: string;
  let adminId: string;
  let employeeToken: string;
  let adminToken: string;
  let notificationId: string;
  let templateId: string;

  beforeAll(async () => {
    knex = getKnexInstance();

    // Create test employees
    const employees = await knex('employees').insert(
      [
        {
          employee_id: 'EMP-TEST-001',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@test.com',
          work_email: 'john.doe@company.com',
          date_of_birth: new Date('1990-01-01'),
          gender: 'Male',
          nationality: 'Indian',
          contact_number: '9876543210',
          personal_email: 'john@test.com',
          department_id: null,
          designation_id: null,
          employment_type: 'Full-Time',
          date_of_joining: new Date(),
          status: 'Active',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          employee_id: 'EMP-TEST-ADMIN',
          first_name: 'Admin',
          last_name: 'User',
          email: 'admin@test.com',
          work_email: 'admin@company.com',
          date_of_birth: new Date('1985-01-01'),
          gender: 'Male',
          nationality: 'Indian',
          contact_number: '9876543211',
          personal_email: 'admin@test.com',
          department_id: null,
          designation_id: null,
          employment_type: 'Full-Time',
          date_of_joining: new Date(),
          status: 'Active',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      ['id']
    );

    employeeId = employees[0];
    adminId = employees[1];

    // Create auth records
    await knex('auth').insert([
      {
        employee_id: employeeId,
        password_hash: 'hashed_password',
        role: 'Employee',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        employee_id: adminId,
        password_hash: 'hashed_password',
        role: 'Super Admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Generate tokens (mock JWT tokens for testing)
    employeeToken = `Bearer employee_token_${employeeId}`;
    adminToken = `Bearer admin_token_${adminId}`;
  });

  afterAll(async () => {
    // Clean up test data
    await knex('notifications').del();
    await knex('notification_templates').del();
    await knex('auth').del();
    await knex('employees').del();
    await knex.destroy();
  });

  describe('GET /api/v1/notifications', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/v1/notifications');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('should return empty notifications list for new employee', async () => {
      const response = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', employeeToken);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.unreadCount).toBe(0);
    });

    it('should return notifications with pagination', async () => {
      // Create test notifications
      const notifications = await knex('notifications').insert(
        [
          {
            employee_id: employeeId,
            title: 'Test Notification 1',
            message: 'This is a test notification',
            type: 'info',
            channel: 'in_app',
            is_read: false,
            created_at: new Date(),
          },
          {
            employee_id: employeeId,
            title: 'Test Notification 2',
            message: 'This is another test notification',
            type: 'success',
            channel: 'in_app',
            is_read: false,
            created_at: new Date(),
          },
        ],
        ['id']
      );

      notificationId = notifications[0];

      const response = await request(app)
        .get('/api/v1/notifications?limit=10&offset=0')
        .set('Authorization', employeeToken);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination.unreadCount).toBe(2);
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.pagination.offset).toBe(0);
    });
  });

  describe('PUT /api/v1/notifications/:id/read', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app).put(`/api/v1/notifications/${notificationId}/read`);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent notification', async () => {
      const response = await request(app)
        .put('/api/v1/notifications/non-existent-id/read')
        .set('Authorization', employeeToken);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 403 when marking another employee\'s notification', async () => {
      // Create notification for admin
      const [adminNotifId] = await knex('notifications').insert(
        {
          employee_id: adminId,
          title: 'Admin Notification',
          message: 'This is for admin',
          type: 'info',
          channel: 'in_app',
          is_read: false,
          created_at: new Date(),
        },
        ['id']
      );

      const response = await request(app)
        .put(`/api/v1/notifications/${adminNotifId}/read`)
        .set('Authorization', employeeToken);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should mark notification as read', async () => {
      const response = await request(app)
        .put(`/api/v1/notifications/${notificationId}/read`)
        .set('Authorization', employeeToken);

      expect(response.status).toBe(200);
      expect(response.body.is_read).toBe(true);
      expect(response.body.read_at).toBeDefined();
    });

    it('should update unread count after marking as read', async () => {
      const response = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', employeeToken);

      expect(response.status).toBe(200);
      expect(response.body.pagination.unreadCount).toBe(1);
    });
  });

  describe('POST /api/v1/notifications/templates', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/notifications/templates')
        .send({
          name: 'Test Template',
          subject: 'Test Subject',
          body: 'Test Body',
          channel: 'in_app',
        });

      expect(response.status).toBe(401);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/api/v1/notifications/templates')
        .set('Authorization', employeeToken)
        .send({
          name: 'Test Template',
          subject: 'Test Subject',
          body: 'Test Body',
          channel: 'in_app',
        });

      expect(response.status).toBe(403);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/notifications/templates')
        .set('Authorization', adminToken)
        .send({
          name: 'Test Template',
          // Missing subject, body, channel
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should create a notification template', async () => {
      const response = await request(app)
        .post('/api/v1/notifications/templates')
        .set('Authorization', adminToken)
        .send({
          name: 'Leave Approved Template',
          subject: 'Your leave has been approved',
          body: 'Your leave request for {{date}} has been approved',
          channel: 'in_app',
          variables: {
            date: 'string',
            approver: 'string',
          },
          is_active: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe('Leave Approved Template');
      expect(response.body.is_active).toBe(true);

      templateId = response.body.id;
    });

    it('should return 409 for duplicate template name', async () => {
      const response = await request(app)
        .post('/api/v1/notifications/templates')
        .set('Authorization', adminToken)
        .send({
          name: 'Leave Approved Template',
          subject: 'Different Subject',
          body: 'Different Body',
          channel: 'email',
        });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('CONFLICT');
    });
  });

  describe('GET /api/v1/notifications/templates', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/v1/notifications/templates');

      expect(response.status).toBe(401);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/v1/notifications/templates')
        .set('Authorization', employeeToken);

      expect(response.status).toBe(403);
    });

    it('should list all active templates', async () => {
      const response = await request(app)
        .get('/api/v1/notifications/templates?activeOnly=true')
        .set('Authorization', adminToken);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should list all templates including inactive', async () => {
      const response = await request(app)
        .get('/api/v1/notifications/templates?activeOnly=false')
        .set('Authorization', adminToken);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/v1/notifications/templates/:id', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app).get(`/api/v1/notifications/templates/${templateId}`);

      expect(response.status).toBe(401);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get(`/api/v1/notifications/templates/${templateId}`)
        .set('Authorization', employeeToken);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent template', async () => {
      const response = await request(app)
        .get('/api/v1/notifications/templates/non-existent-id')
        .set('Authorization', adminToken);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should get a specific template', async () => {
      const response = await request(app)
        .get(`/api/v1/notifications/templates/${templateId}`)
        .set('Authorization', adminToken);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(templateId);
      expect(response.body.name).toBe('Leave Approved Template');
    });
  });

  describe('PUT /api/v1/notifications/templates/:id', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put(`/api/v1/notifications/templates/${templateId}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(401);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .put(`/api/v1/notifications/templates/${templateId}`)
        .set('Authorization', employeeToken)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent template', async () => {
      const response = await request(app)
        .put('/api/v1/notifications/templates/non-existent-id')
        .set('Authorization', adminToken)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(404);
    });

    it('should update a template', async () => {
      const response = await request(app)
        .put(`/api/v1/notifications/templates/${templateId}`)
        .set('Authorization', adminToken)
        .send({
          subject: 'Updated Subject',
          body: 'Updated Body',
          is_active: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.subject).toBe('Updated Subject');
      expect(response.body.body).toBe('Updated Body');
      expect(response.body.is_active).toBe(false);
    });

    it('should return 409 when updating to duplicate name', async () => {
      // Create another template
      await request(app)
        .post('/api/v1/notifications/templates')
        .set('Authorization', adminToken)
        .send({
          name: 'Another Template',
          subject: 'Subject',
          body: 'Body',
          channel: 'email',
        });

      // Try to update first template to have same name
      const response = await request(app)
        .put(`/api/v1/notifications/templates/${templateId}`)
        .set('Authorization', adminToken)
        .send({ name: 'Another Template' });

      expect(response.status).toBe(409);
      expect(response.body.error.code).toBe('CONFLICT');
    });
  });

  describe('DELETE /api/v1/notifications/templates/:id', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app).delete(
        `/api/v1/notifications/templates/${templateId}`
      );

      expect(response.status).toBe(401);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .delete(`/api/v1/notifications/templates/${templateId}`)
        .set('Authorization', employeeToken);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent template', async () => {
      const response = await request(app)
        .delete('/api/v1/notifications/templates/non-existent-id')
        .set('Authorization', adminToken);

      expect(response.status).toBe(404);
    });

    it('should delete a template', async () => {
      const response = await request(app)
        .delete(`/api/v1/notifications/templates/${templateId}`)
        .set('Authorization', adminToken);

      expect(response.status).toBe(204);

      // Verify deletion
      const getResponse = await request(app)
        .get(`/api/v1/notifications/templates/${templateId}`)
        .set('Authorization', adminToken);

      expect(getResponse.status).toBe(404);
    });
  });
});
