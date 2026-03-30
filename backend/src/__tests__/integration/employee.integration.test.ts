import { EmployeeService } from '../../services/employeeService';
import db from '../../config/knex';
import { v4 as uuidv4 } from 'uuid';

describe('Employee API Endpoints - Integration Tests', () => {
  let employeeService: EmployeeService;
  let employeeId: string;
  const deptId = uuidv4();

  beforeAll(async () => {
    employeeService = new EmployeeService(db);
    await db('emergency_contacts').del();
    await db('employment_history').del();
    await db('employees').del();
  });

  afterAll(async () => {
    await db('emergency_contacts').del();
    await db('employment_history').del();
    await db('employees').del();
  });

  describe('Create employee', () => {
    it('should create a new employee with valid data', async () => {
      const employeeData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '9876543210',
        date_of_joining: '2024-01-01',
        employment_type: 'permanent' as const,
      };

      const employee = await employeeService.createEmployee(employeeData as any);

      expect(employee).toHaveProperty('id');
      expect(employee).toHaveProperty('employee_id');
      expect(employee.first_name).toBe('John');
      expect(employee.status).toBe('active');

      employeeId = employee.id;
    });

    it('should reject employee creation with missing required fields', async () => {
      const invalidData = {
        first_name: 'Jane',
      };

      await expect(employeeService.createEmployee(invalidData as any)).rejects.toThrow();
    });

    it('should reject duplicate email', async () => {
      const employeeData = {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'john.doe@example.com',
        phone: '9876543211',
        date_of_joining: '2024-01-01',
        employment_type: 'permanent' as const,
      };

      await expect(employeeService.createEmployee(employeeData as any)).rejects.toThrow();
    });
  });

  describe('Get employee', () => {
    it('should retrieve employee by ID', async () => {
      const employee = await employeeService.getEmployee(employeeId);

      expect(employee).toBeDefined();
      expect(employee.id).toBe(employeeId);
      expect(employee.first_name).toBe('John');
    });

    it('should throw error for non-existent employee', async () => {
      await expect(employeeService.getEmployee('non-existent-id')).rejects.toThrow();
    });
  });

  describe('Update employee', () => {
    it('should update employee details', async () => {
      const updateData = {
        first_name: 'Jonathan',
        phone: '9876543220',
      };

      const employee = await employeeService.updateEmployee(employeeId, updateData);

      expect(employee.first_name).toBe('Jonathan');
      expect(employee.phone).toBe('9876543220');
    });

    it('should throw error for non-existent employee', async () => {
      await expect(
        employeeService.updateEmployee('non-existent-id', { first_name: 'Test' })
      ).rejects.toThrow();
    });
  });

  describe('Search employees', () => {
    beforeAll(async () => {
      await employeeService.createEmployee({
        first_name: 'Alice',
        last_name: 'Johnson',
        email: 'alice@example.com',
        phone: '9876543212',
        date_of_joining: '2024-01-01',
        employment_type: 'permanent' as const,
      } as any);

      await employeeService.createEmployee({
        first_name: 'Bob',
        last_name: 'Williams',
        email: 'bob@example.com',
        phone: '9876543213',
        date_of_joining: '2024-01-01',
        employment_type: 'contract' as const,
      } as any);
    });

    it('should retrieve all employees with pagination', async () => {
      const employees = await employeeService.getAllEmployees(10, 0);

      expect(Array.isArray(employees)).toBe(true);
      expect(employees.length).toBeGreaterThan(0);
    });

    it('should search employees by name', async () => {
      const employees = await employeeService.searchEmployees({
        search: 'John',
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(employees)).toBe(true);
    });

    it('should filter employees by department', async () => {
      const employees = await employeeService.searchEmployees({
        department_id: deptId,
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(employees)).toBe(true);
    });

    it('should filter employees by employment type', async () => {
      const employees = await employeeService.searchEmployees({
        employment_type: 'permanent',
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(employees)).toBe(true);
    });

    it('should filter employees by status', async () => {
      const employees = await employeeService.searchEmployees({
        status: 'active',
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(employees)).toBe(true);
    });
  });

  describe('Update employee status', () => {
    it('should update employee status', async () => {
      const employee = await employeeService.updateEmployeeStatus(employeeId, 'suspended');

      expect(employee.status).toBe('suspended');
    });

    it('should throw error for non-existent employee', async () => {
      await expect(
        employeeService.updateEmployeeStatus('non-existent-id', 'active')
      ).rejects.toThrow();
    });
  });

  describe('Emergency contacts', () => {
    it('should add emergency contact to employee', async () => {
      const contactData = {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '9876543230',
        email: 'jane@example.com',
        priority: 1,
      };

      const contact = await employeeService.addEmergencyContact(employeeId, contactData as any);

      expect(contact).toHaveProperty('id');
      expect(contact.name).toBe('Jane Doe');
    });

    it('should reject adding more than 3 emergency contacts', async () => {
      for (let i = 0; i < 2; i++) {
        await employeeService.addEmergencyContact(employeeId, {
          name: `Contact ${i + 2}`,
          relationship: 'Friend',
          phone: `987654323${i}`,
        } as any);
      }

      await expect(
        employeeService.addEmergencyContact(employeeId, {
          name: 'Contact 4',
          relationship: 'Friend',
          phone: '9876543234',
        } as any)
      ).rejects.toThrow();
    });

    it('should retrieve emergency contacts for employee', async () => {
      const contacts = await employeeService.getEmergencyContacts(employeeId);

      expect(Array.isArray(contacts)).toBe(true);
      expect(contacts.length).toBeGreaterThan(0);
    });
  });

  describe('Employment history', () => {
    it('should add employment history', async () => {
      const historyData = {
        from_date: '2024-01-01',
        to_date: '2024-06-30',
        reason: 'Promotion',
      };

      const history = await employeeService.addEmploymentHistory(employeeId, historyData as any);

      expect(history).toHaveProperty('id');
      expect(history.reason).toBe('Promotion');
    });

    it('should retrieve employment history for employee', async () => {
      const history = await employeeService.getEmploymentHistory(employeeId);

      expect(Array.isArray(history)).toBe(true);
    });
  });
});
