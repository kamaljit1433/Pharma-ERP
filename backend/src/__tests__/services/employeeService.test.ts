import { EmployeeService } from '../../services/employeeService';
import { Knex } from 'knex';

describe('EmployeeService', () => {
  let employeeService: EmployeeService;
  let mockDb: jest.Mocked<Knex>;

  beforeEach(() => {
    mockDb = {} as jest.Mocked<Knex>;
    employeeService = new EmployeeService(mockDb);
  });

  describe('createEmployee', () => {
    it('should create an employee with valid data', async () => {
      const createData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        date_of_joining: '2026-01-01',
        employment_type: 'permanent' as const,
      };

      const mockEmployee = {
        id: '123',
        employee_id: 'EMP001',
        ...createData,
        status: 'active',
        created_at: '2026-03-05',
        updated_at: '2026-03-05',
      };

      // We need to manually set up the mock since we're testing the service
      const mockGetByEmail = jest.fn().mockResolvedValue(null);
      const mockCreate = jest.fn().mockResolvedValue(mockEmployee);

      // Patch the service's repository methods
      (employeeService as any).employeeRepository = {
        getEmployeeByEmail: mockGetByEmail,
        createEmployee: mockCreate,
      };

      const result = await employeeService.createEmployee(createData);

      expect(mockGetByEmail).toHaveBeenCalledWith(createData.email);
      expect(mockCreate).toHaveBeenCalledWith(createData);
      expect(result).toEqual(mockEmployee);
    });

    it('should throw error if email already exists', async () => {
      const createData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        date_of_joining: '2026-01-01',
        employment_type: 'permanent' as const,
      };

      const mockGetByEmail = jest.fn().mockResolvedValue({ id: '456', email: 'john@example.com' });

      (employeeService as any).employeeRepository = {
        getEmployeeByEmail: mockGetByEmail,
      };

      await expect(employeeService.createEmployee(createData)).rejects.toThrow(
        'Employee with this email already exists'
      );
    });

    it('should throw error if required fields are missing', async () => {
      const createData = {
        first_name: 'John',
        last_name: 'Doe',
        email: '',
        date_of_joining: '2026-01-01',
        employment_type: 'permanent' as const,
      };

      await expect(employeeService.createEmployee(createData)).rejects.toThrow(
        'Missing required fields'
      );
    });
  });

  describe('getEmployee', () => {
    it('should return employee if found', async () => {
      const mockEmployee = {
        id: '123',
        employee_id: 'EMP001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        status: 'active',
      };

      const mockGet = jest.fn().mockResolvedValue(mockEmployee);

      (employeeService as any).employeeRepository = {
        getEmployee: mockGet,
      };

      const result = await employeeService.getEmployee('123');

      expect(mockGet).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockEmployee);
    });

    it('should throw error if employee not found', async () => {
      const mockGet = jest.fn().mockResolvedValue(null);

      (employeeService as any).employeeRepository = {
        getEmployee: mockGet,
      };

      await expect(employeeService.getEmployee('999')).rejects.toThrow('Employee not found');
    });
  });

  describe('updateEmployeeStatus', () => {
    it('should update employee status', async () => {
      const mockEmployee = {
        id: '123',
        employee_id: 'EMP001',
        first_name: 'John',
        status: 'resigned',
      };

      const mockGet = jest.fn().mockResolvedValue({ id: '123' });
      const mockUpdateStatus = jest.fn().mockResolvedValue(mockEmployee);

      (employeeService as any).employeeRepository = {
        getEmployee: mockGet,
        updateEmployeeStatus: mockUpdateStatus,
      };

      const result = await employeeService.updateEmployeeStatus('123', 'resigned');

      expect(mockGet).toHaveBeenCalledWith('123');
      expect(mockUpdateStatus).toHaveBeenCalledWith('123', 'resigned');
      expect(result).toEqual(mockEmployee);
    });
  });

  describe('addEmergencyContact', () => {
    it('should add emergency contact if count < 3', async () => {
      const contactData = {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '9876543210',
      };

      const mockContact = {
        id: '456',
        employee_id: '123',
        ...contactData,
        priority: 1,
      };

      const mockGet = jest.fn().mockResolvedValue({ id: '123' });
      const mockGetCount = jest.fn().mockResolvedValue(1);
      const mockAdd = jest.fn().mockResolvedValue(mockContact);

      (employeeService as any).employeeRepository = {
        getEmployee: mockGet,
        getEmergencyContactCount: mockGetCount,
        addEmergencyContact: mockAdd,
      };

      const result = await employeeService.addEmergencyContact('123', contactData);

      expect(mockGet).toHaveBeenCalledWith('123');
      expect(mockGetCount).toHaveBeenCalledWith('123');
      expect(mockAdd).toHaveBeenCalledWith('123', contactData);
      expect(result).toEqual(mockContact);
    });

    it('should throw error if max 3 contacts reached', async () => {
      const contactData = {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '9876543210',
      };

      const mockGet = jest.fn().mockResolvedValue({ id: '123' });
      const mockGetCount = jest.fn().mockResolvedValue(3);

      (employeeService as any).employeeRepository = {
        getEmployee: mockGet,
        getEmergencyContactCount: mockGetCount,
      };

      await expect(employeeService.addEmergencyContact('123', contactData)).rejects.toThrow(
        'Maximum 3 emergency contacts allowed'
      );
    });
  });

  describe('searchEmployees', () => {
    it('should search employees with filters', async () => {
      const mockEmployees = [
        { id: '123', first_name: 'John', status: 'active' },
        { id: '124', first_name: 'Jane', status: 'active' },
      ];

      const mockSearch = jest.fn().mockResolvedValue(mockEmployees);

      (employeeService as any).employeeRepository = {
        searchEmployees: mockSearch,
      };

      const filters = { status: 'active' as const, limit: 50, offset: 0 };
      const result = await employeeService.searchEmployees(filters);

      expect(mockSearch).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockEmployees);
    });
  });
});
