import request from 'supertest';
import { Knex } from 'knex';

// Mock session middleware before importing app
jest.mock('../../middleware/session', () => {
  return (_options: any) => (_req: any, _res: any, next: any) => {
    next();
  };
});

// Mock authentication middleware
jest.mock('../../middleware/auth', () => ({
  authenticateToken: function(req: any, _res: any, next: any) {
    req.user = {
      id: 'user-123',
      email: 'admin@example.com',
      role: 'hr_manager',
      employeeId: 'emp-admin',
    };
    next();
  },
  requireRole: (roles: string[]) => (req: any, res: any, next: any) => {
    if (roles.includes(req.user?.role)) {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Forbidden' });
    }
  },
}));

// Mock Redis client
jest.mock('../../config/redis', () => ({
  default: {
    getClient: () => ({}),
    testConnection: async () => true,
    close: async () => {},
  },
}));

// Import app after mocking dependencies
import app from '../../index';
import { getKnexInstance } from '../../config/knex';

describe('Employee API - POST /api/v1/employees', () => {
  let db: Knex;

  beforeAll(async () => {
    db = getKnexInstance();
    // Clean up employees table before tests
    await db('employees').del();
  });

  afterEach(async () => {
    // Clean up after each test
    await db('employees').del();
  });

  afterAll(async () => {
    // Close database connection
    await db.destroy();
  });

  describe('Successful Employee Creation', () => {
    it('should create an employee with required fields only', async () => {
      const employeeData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        date_of_joining: '2024-01-15',
        employment_type: 'permanent',
      };

      const response = await request(app)
        .post('/api/v1/employees')
        .send(employeeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        date_of_joining: '2024-01-15',
        employment_type: 'permanent',
        status: 'active',
      });
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.employee_id).toBeDefined();
      expect(response.body.data.employee_id).toMatch(/^EMP\d+$/);
      expect(response.body.message).toBe('Employee created successfully');
    });

    it('should create an employee with all optional fields', async () => {
      const employeeData = {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0123',
        personal_email: 'jane.personal@example.com',
        date_of_birth: '1990-05-20',
        gender: 'female',
        blood_group: 'O+',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'USA',
        pan: 'ABCDE1234F',
        aadhar: '123456789012',
        department_id: 'dept-001',
        designation_id: 'des-001',
        reporting_manager_id: 'emp-manager',
        date_of_joining: '2024-02-01',
        employment_type: 'contract',
      };

      const response = await request(app)
        .post('/api/v1/employees')
        .send(employeeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0123',
        personal_email: 'jane.personal@example.com',
        date_of_birth: '1990-05-20',
        gender: 'female',
        blood_group: 'O+',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'USA',
        pan: 'ABCDE1234F',
        aadhar: '123456789012',
        department_id: 'dept-001',
        designation_id: 'des-001',
        reporting_manager_id: 'emp-manager',
        date_of_joining: '2024-02-01',
        employment_type: 'contract',
        status: 'active',
      });
    });

    it('should auto-generate unique employee IDs', async () => {
      const employee1Data = {
        first_name: 'Alice',
        last_name: 'Johnson',
        email: 'alice@example.com',
        date_of_joining: '2024-01-10',
        employment_type: 'permanent',
      };

      const employee2Data = {
        first_name: 'Bob',
        last_name: 'Wilson',
        email: 'bob@example.com',
        date_of_joining: '2024-01-11',
        employment_type: 'permanent',
      };

      const response1 = await request(app)
        .post('/api/v1/employees')
        .send(employee1Data)
        .expect(201);

      const response2 = await request(app)
        .post('/api/v1/employees')
        .send(employee2Data)
        .expect(201);

      expect(response1.body.data.employee_id).not.toBe(response2.body.data.employee_id);
      expect(response1.body.data.id).not.toBe(response2.body.data.id);
    });

    it('should set status to active by default', async () => {
      const employeeData = {
        first_name: 'Charlie',
        last_name: 'Brown',
        email: 'charlie@example.com',
        date_of_joining: '2024-01-12',
        employment_type: 'temporary',
      };

      const response = await request(app)
        .post('/api/v1/employees')
        .send(employeeData)
        .expect(201);

      expect(response.body.data.status).toBe('active');
    });
  });

  describe('Validation Errors', () => {
    it('should return 400 when first_name is missing', async () => {
      const employeeData = {
        last_name: 'Doe',
        email: 'john@example.com',
        date_of_joining: '2024-01-15',
        employment_type: 'permanent',
      };

      const response = await request(app)
        .post('/api/v1/employees')
        .send(employeeData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('first_name');
    });

    it('should return 400 when last_name is missing', async () => {
      const employeeData = {
        first_name: 'John',
        email: 'john@example.com',
        date_of_joining: '2024-01-15',
        employment_type: 'permanent',
      };

      const response = await request(app)
        .post('/api/v1/employees')
        .send(employeeData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('last_name');
    });

    it('should return 400 when email is missing', async () => {
      const employeeData = {
        first_name: 'John',
        last_name: 'Doe',
        date_of_joining: '2024-01-15',
        employment_type: 'permanent',
      };

      const response = await request(app)
        .post('/api/v1/employees')
        .send(employeeData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    it('should return 400 when date_of_joining is missing', async () => {
      const employeeData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        employment_type: 'permanent',
      };

      const response = await request(app)
        .post('/api/v1/employees')
        .send(employeeData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('date_of_joining');
    });

    it('should return 400 when employment_type is missing', async () => {
      const employeeData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        date_of_joining: '2024-01-15',
      };

      const response = await request(app)
        .post('/api/v1/employees')
        .send(employeeData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when employment_type is invalid', async () => {
      const employeeData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        date_of_joining: '2024-01-15',
        employment_type: 'invalid_type',
      };

      const response = await request(app)
        .post('/api/v1/employees')
        .send(employeeData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 when gender is invalid', async () => {
      const employeeData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        date_of_joining: '2024-01-15',
        employment_type: 'permanent',
        gender: 'invalid_gender',
      };

      const response = await request(app)
        .post('/api/v1/employees')
        .send(employeeData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Duplicate Email Handling', () => {
    it('should return 400 when email already exists', async () => {
      const employeeData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'duplicate@example.com',
        date_of_joining: '2024-01-15',
        employment_type: 'permanent',
      };

      // Create first employee
      await request(app)
        .post('/api/v1/employees')
        .send(employeeData)
        .expect(201);

      // Try to create second employee with same email
      const response = await request(app)
        .post('/api/v1/employees')
        .send(employeeData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    it('should allow different emails for different employees', async () => {
      const employee1Data = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john1@example.com',
        date_of_joining: '2024-01-15',
        employment_type: 'permanent',
      };

      const employee2Data = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john2@example.com',
        date_of_joining: '2024-01-15',
        employment_type: 'permanent',
      };

      const response1 = await request(app)
        .post('/api/v1/employees')
        .send(employee1Data)
        .expect(201);

      const response2 = await request(app)
        .post('/api/v1/employees')
        .send(employee2Data)
        .expect(201);

      expect(response1.body.data.email).toBe('john1@example.com');
      expect(response2.body.data.email).toBe('john2@example.com');
    });
  });

  describe('Response Format', () => {
    it('should return correct response structure', async () => {
      const employeeData = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        date_of_joining: '2024-01-15',
        employment_type: 'permanent',
      };

      const response = await request(app)
        .post('/api/v1/employees')
        .send(employeeData)
        .expect(201);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message');
      expect(response.body.success).toBe(true);
      expect(typeof response.body.data).toBe('object');
      expect(typeof response.body.message).toBe('string');
    });

    it('should include timestamps in response', async () => {
      const employeeData = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        date_of_joining: '2024-01-15',
        employment_type: 'permanent',
      };

      const response = await request(app)
        .post('/api/v1/employees')
        .send(employeeData)
        .expect(201);

      expect(response.body.data.created_at).toBeDefined();
      expect(response.body.data.updated_at).toBeDefined();
    });

    it('should include all employee fields in response', async () => {
      const employeeData = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        phone: '+1-555-0100',
        date_of_joining: '2024-01-15',
        employment_type: 'permanent',
      };

      const response = await request(app)
        .post('/api/v1/employees')
        .send(employeeData)
        .expect(201);

      const employee = response.body.data;
      expect(employee.id).toBeDefined();
      expect(employee.employee_id).toBeDefined();
      expect(employee.first_name).toBe('Test');
      expect(employee.last_name).toBe('User');
      expect(employee.email).toBe('test@example.com');
      expect(employee.phone).toBe('+1-555-0100');
      expect(employee.date_of_joining).toBe('2024-01-15');
      expect(employee.employment_type).toBe('permanent');
      expect(employee.status).toBe('active');
    });
  });

  describe('HTTP Status Codes', () => {
    it('should return 201 Created on successful creation', async () => {
      const employeeData = {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        date_of_joining: '2024-01-15',
        employment_type: 'permanent',
      };

      const response = await request(app)
        .post('/api/v1/employees')
        .send(employeeData);

      expect(response.status).toBe(201);
    });

    it('should return 400 Bad Request on validation error', async () => {
      const employeeData = {
        first_name: 'Test',
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/v1/employees')
        .send(employeeData);

      expect(response.status).toBe(400);
    });
  });

  describe('Data Persistence', () => {
    it('should persist employee data in database', async () => {
      const employeeData = {
        first_name: 'Persistent',
        last_name: 'Employee',
        email: 'persistent@example.com',
        date_of_joining: '2024-01-15',
        employment_type: 'permanent',
      };

      const response = await request(app)
        .post('/api/v1/employees')
        .send(employeeData)
        .expect(201);

      const employeeId = response.body.data.id;

      // Verify data in database
      const dbEmployee = await db('employees').where('id', employeeId).first();
      expect(dbEmployee).toBeDefined();
      expect(dbEmployee.first_name).toBe('Persistent');
      expect(dbEmployee.last_name).toBe('Employee');
      expect(dbEmployee.email).toBe('persistent@example.com');
    });

    it('should retrieve created employee via GET endpoint', async () => {
      const employeeData = {
        first_name: 'Retrievable',
        last_name: 'Employee',
        email: 'retrievable@example.com',
        date_of_joining: '2024-01-15',
        employment_type: 'permanent',
      };

      const createResponse = await request(app)
        .post('/api/v1/employees')
        .send(employeeData)
        .expect(201);

      const employeeId = createResponse.body.data.id;

      const getResponse = await request(app)
        .get(`/api/v1/employees/${employeeId}`)
        .expect(200);

      expect(getResponse.body.data.first_name).toBe('Retrievable');
      expect(getResponse.body.data.email).toBe('retrievable@example.com');
    });
  });

  describe('Edge Cases', () => {
    it('should handle whitespace in names', async () => {
      const employeeData = {
        first_name: '  John  ',
        last_name: '  Doe  ',
        email: 'john@example.com',
        date_of_joining: '2024-01-15',
        employment_type: 'permanent',
      };

      const response = await request(app)
        .post('/api/v1/employees')
        .send(employeeData)
        .expect(201);

      expect(response.body.data.first_name).toBe('  John  ');
      expect(response.body.data.last_name).toBe('  Doe  ');
    });

    it('should handle special characters in names', async () => {
      const employeeData = {
        first_name: "O'Brien",
        last_name: "D'Angelo",
        email: 'special@example.com',
        date_of_joining: '2024-01-15',
        employment_type: 'permanent',
      };

      const response = await request(app)
        .post('/api/v1/employees')
        .send(employeeData)
        .expect(201);

      expect(response.body.data.first_name).toBe("O'Brien");
      expect(response.body.data.last_name).toBe("D'Angelo");
    });

    it('should handle long names', async () => {
      const employeeData = {
        first_name: 'A'.repeat(100),
        last_name: 'B'.repeat(100),
        email: 'long@example.com',
        date_of_joining: '2024-01-15',
        employment_type: 'permanent',
      };

      const response = await request(app)
        .post('/api/v1/employees')
        .send(employeeData)
        .expect(201);

      expect(response.body.data.first_name).toBe('A'.repeat(100));
      expect(response.body.data.last_name).toBe('B'.repeat(100));
    });

    it('should handle all employment types', async () => {
      const employmentTypes = ['permanent', 'contract', 'temporary', 'intern'];

      for (const empType of employmentTypes) {
        const employeeData = {
          first_name: 'Test',
          last_name: 'User',
          email: `test-${empType}@example.com`,
          date_of_joining: '2024-01-15',
          employment_type: empType,
        };

        const response = await request(app)
          .post('/api/v1/employees')
          .send(employeeData)
          .expect(201);

        expect(response.body.data.employment_type).toBe(empType);
      }
    });

    it('should handle all gender values', async () => {
      const genders = ['male', 'female', 'other'];

      for (const gender of genders) {
        const employeeData = {
          first_name: 'Test',
          last_name: 'User',
          email: `test-${gender}@example.com`,
          date_of_joining: '2024-01-15',
          employment_type: 'permanent',
          gender,
        };

        const response = await request(app)
          .post('/api/v1/employees')
          .send(employeeData)
          .expect(201);

        expect(response.body.data.gender).toBe(gender);
      }
    });
  });
});
