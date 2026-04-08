import { EmployeeService } from '../employeeService';
import { EmployeeRepository } from '../../repositories/employeeRepository';
import * as validation from '../../utils/validation';
import * as auditLog from '../../utils/auditLog';
import { Knex } from 'knex';

jest.mock('../../repositories/employeeRepository');
jest.mock('../../utils/validation');
jest.mock('../../utils/auditLog');

describe('EmployeeService', () => {
  let employeeService: EmployeeService;
  let mockDb: jest.Mocked<Knex>;
  let mockEmployeeRepository: jest.Mocked<EmployeeRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = {} as jest.Mocked<Knex>;
    mockEmployeeRepository = new EmployeeRepository(mockDb) as jest.Mocked<EmployeeRepository>;
    employeeService = new EmployeeService(mockDb);
    (employeeService as any).employeeRepository = mockEmployeeRepository;
  });

  describe('createEmployee', () => {
    it('should create employee with valid data', async () => {
      const createData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        date_of_joining: '2024-01-01',
        employment_type: 'permanent' as const,
      };

      const mockEmployee = {
        id: 'emp-1',
        ...createData,
        status: 'active',
      };

      (validation.isValidEmail as jest.Mock).mockReturnValue(true);
      (mockEmployeeRepository.getEmployeeByEmail as jest.Mock).mockResolvedValue(null);
      (mockEmployeeRepository.createEmployee as jest.Mock).mockResolvedValue(mockEmployee);

      const result = await employeeService.createEmployee(createData);

      expect(result).toEqual(mockEmployee);
      expect(mockEmployeeRepository.createEmployee).toHaveBeenCalledWith(createData);
    });

    it('should throw error for missing required fields', async () => {
      const createData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        // Missing date_of_joining
      };

      await expect(employeeService.createEmployee(createData as any)).rejects.toThrow(
        'Missing required fields'
      );
    });

    it('should throw error for invalid email', async () => {
      const createData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'invalid-email',
        date_of_joining: '2024-01-01',
        employment_type: 'permanent' as const,
      };

      (validation.isValidEmail as jest.Mock).mockReturnValue(false);

      await expect(employeeService.createEmployee(createData)).rejects.toThrow(
        'Invalid email format'
      );
    });

    it('should throw error if email already exists', async () => {
      const createData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'existing@example.com',
        date_of_joining: '2024-01-01',
        employment_type: 'permanent' as const,
      };

      (validation.isValidEmail as jest.Mock).mockReturnValue(true);
      (mockEmployeeRepository.getEmployeeByEmail as jest.Mock).mockResolvedValue({
        id: 'emp-1',
        email: createData.email,
      });

      await expect(employeeService.createEmployee(createData)).rejects.toThrow(
        'Employee with this email already exists'
      );
    });
  });

  describe('getEmployee', () => {
    it('should get employee by id', async () => {
      const employeeId = 'emp-1';
      const mockEmployee = {
        id: employeeId,
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
      };

      (mockEmployeeRepository.getEmployee as jest.Mock).mockResolvedValue(mockEmployee);

      const result = await employeeService.getEmployee(employeeId);

      expect(result).toEqual(mockEmployee);
    });

    it('should throw error if employee not found', async () => {
      const employeeId = 'emp-1';

      (mockEmployeeRepository.getEmployee as jest.Mock).mockResolvedValue(null);

      await expect(employeeService.getEmployee(employeeId)).rejects.toThrow(
        'Employee not found'
      );
    });
  });

  describe('updateEmployee', () => {
    it('should update employee with valid data', async () => {
      const employeeId = 'emp-1';
      const updateData = {
        first_name: 'Jane',
      };

      const mockEmployee = {
        id: employeeId,
        first_name: 'John',
        last_name: 'Doe',
      };

      const updatedEmployee = {
        ...mockEmployee,
        ...updateData,
      };

      (mockEmployeeRepository.getEmployee as jest.Mock).mockResolvedValue(mockEmployee);
      (mockEmployeeRepository.updateEmployee as jest.Mock).mockResolvedValue(updatedEmployee);

      const result = await employeeService.updateEmployee(employeeId, updateData);

      expect(result).toEqual(updatedEmployee);
    });

    it('should throw error if employee not found', async () => {
      const employeeId = 'emp-1';
      const updateData = { first_name: 'Jane' };

      (mockEmployeeRepository.getEmployee as jest.Mock).mockResolvedValue(null);

      await expect(employeeService.updateEmployee(employeeId, updateData)).rejects.toThrow(
        'Employee not found'
      );
    });
  });

  describe('updateEmployeeStatus', () => {
    it('should update employee status with valid status', async () => {
      const employeeId = 'emp-1';
      const newStatus = 'on_leave';

      const mockEmployee = {
        id: employeeId,
        status: 'active',
      };

      const updatedEmployee = {
        ...mockEmployee,
        status: newStatus,
      };

      (mockEmployeeRepository.getEmployee as jest.Mock).mockResolvedValue(mockEmployee);
      (mockEmployeeRepository.updateEmployeeStatus as jest.Mock).mockResolvedValue(
        updatedEmployee
      );
      (auditLog.logAuditEvent as jest.Mock).mockResolvedValue(undefined);

      const result = await employeeService.updateEmployeeStatus(employeeId, newStatus as any);

      expect(result).toEqual(updatedEmployee);
      expect(auditLog.logAuditEvent).toHaveBeenCalled();
    });

    it('should throw error for invalid status', async () => {
      const employeeId = 'emp-1';
      const invalidStatus = 'invalid_status';

      const mockEmployee = {
        id: employeeId,
        status: 'active',
      };

      (mockEmployeeRepository.getEmployee as jest.Mock).mockResolvedValue(mockEmployee);

      await expect(
        employeeService.updateEmployeeStatus(employeeId, invalidStatus as any)
      ).rejects.toThrow('Invalid status');
    });

    it('should throw error if employee not found', async () => {
      const employeeId = 'emp-1';

      (mockEmployeeRepository.getEmployee as jest.Mock).mockResolvedValue(null);

      await expect(
        employeeService.updateEmployeeStatus(employeeId, 'active' as any)
      ).rejects.toThrow('Employee not found');
    });
  });

  describe('searchEmployees', () => {
    it('should search employees with filters', async () => {
      const filters = { status: 'active' as const };
      const mockEmployees = [
        { id: 'emp-1', status: 'active' },
        { id: 'emp-2', status: 'active' },
      ];

      (mockEmployeeRepository.searchEmployees as jest.Mock).mockResolvedValue(mockEmployees);

      const result = await employeeService.searchEmployees(filters);

      expect(result).toEqual(mockEmployees);
      expect(mockEmployeeRepository.searchEmployees).toHaveBeenCalledWith(filters);
    });
  });

  describe('getAllEmployees', () => {
    it('should get all employees with pagination', async () => {
      const mockEmployees = [
        { id: 'emp-1' },
        { id: 'emp-2' },
      ];

      (mockEmployeeRepository.getAllEmployees as jest.Mock).mockResolvedValue(mockEmployees);

      const result = await employeeService.getAllEmployees(50, 0);

      expect(result).toEqual(mockEmployees);
      expect(mockEmployeeRepository.getAllEmployees).toHaveBeenCalledWith(50, 0);
    });
  });

  describe('getEmployeeCount', () => {
    it('should get employee count', async () => {
      (mockEmployeeRepository.getEmployeeCount as jest.Mock).mockResolvedValue(10);

      const result = await employeeService.getEmployeeCount();

      expect(result).toBe(10);
    });

    it('should get employee count with filters', async () => {
      const filters = { status: 'active' as const };

      (mockEmployeeRepository.getEmployeeCount as jest.Mock).mockResolvedValue(8);

      const result = await employeeService.getEmployeeCount(filters);

      expect(result).toBe(8);
      expect(mockEmployeeRepository.getEmployeeCount).toHaveBeenCalledWith(filters);
    });
  });

  describe('addEmergencyContact', () => {
    it('should add emergency contact with valid data', async () => {
      const employeeId = 'emp-1';
      const contactData = {
        name: 'Jane Doe',
        relationship: 'spouse',
        phone: '+1234567890',
      };

      const mockEmployee = { id: employeeId };
      const mockContact = { id: 'contact-1', ...contactData };

      (mockEmployeeRepository.getEmployee as jest.Mock).mockResolvedValue(mockEmployee);
      (mockEmployeeRepository.getEmergencyContactCount as jest.Mock).mockResolvedValue(1);
      (validation.isValidPhone as jest.Mock).mockReturnValue(true);
      (mockEmployeeRepository.addEmergencyContact as jest.Mock).mockResolvedValue(mockContact);

      const result = await employeeService.addEmergencyContact(employeeId, contactData);

      expect(result).toEqual(mockContact);
    });

    it('should throw error if max emergency contacts reached', async () => {
      const employeeId = 'emp-1';
      const contactData = {
        name: 'Jane Doe',
        relationship: 'spouse',
        phone: '+1234567890',
      };

      const mockEmployee = { id: employeeId };

      (mockEmployeeRepository.getEmployee as jest.Mock).mockResolvedValue(mockEmployee);
      (mockEmployeeRepository.getEmergencyContactCount as jest.Mock).mockResolvedValue(3);

      await expect(
        employeeService.addEmergencyContact(employeeId, contactData)
      ).rejects.toThrow('Maximum 3 emergency contacts allowed');
    });

    it('should throw error for invalid phone', async () => {
      const employeeId = 'emp-1';
      const contactData = {
        name: 'Jane Doe',
        relationship: 'spouse',
        phone: 'invalid-phone',
      };

      const mockEmployee = { id: employeeId };

      (mockEmployeeRepository.getEmployee as jest.Mock).mockResolvedValue(mockEmployee);
      (mockEmployeeRepository.getEmergencyContactCount as jest.Mock).mockResolvedValue(1);
      (validation.isValidPhone as jest.Mock).mockReturnValue(false);

      await expect(
        employeeService.addEmergencyContact(employeeId, contactData)
      ).rejects.toThrow('Invalid phone number format');
    });

    it('should throw error if employee not found', async () => {
      const employeeId = 'emp-1';
      const contactData = {
        name: 'Jane Doe',
        relationship: 'spouse',
        phone: '+1234567890',
      };

      (mockEmployeeRepository.getEmployee as jest.Mock).mockResolvedValue(null);

      await expect(
        employeeService.addEmergencyContact(employeeId, contactData)
      ).rejects.toThrow('Employee not found');
    });
  });

  describe('getEmergencyContacts', () => {
    it('should get emergency contacts for employee', async () => {
      const employeeId = 'emp-1';
      const mockContacts = [
        { id: 'contact-1', name: 'Jane Doe' },
        { id: 'contact-2', name: 'John Smith' },
      ];

      const mockEmployee = { id: employeeId };

      (mockEmployeeRepository.getEmployee as jest.Mock).mockResolvedValue(mockEmployee);
      (mockEmployeeRepository.getEmergencyContacts as jest.Mock).mockResolvedValue(mockContacts);

      const result = await employeeService.getEmergencyContacts(employeeId);

      expect(result).toEqual(mockContacts);
    });

    it('should throw error if employee not found', async () => {
      const employeeId = 'emp-1';

      (mockEmployeeRepository.getEmployee as jest.Mock).mockResolvedValue(null);

      await expect(employeeService.getEmergencyContacts(employeeId)).rejects.toThrow(
        'Employee not found'
      );
    });
  });

  describe('updateEmergencyContact', () => {
    it('should update emergency contact', async () => {
      const employeeId = 'emp-1';
      const contactId = 'contact-1';
      const updateData = { name: 'Jane Smith' };

      const mockContact = {
        id: contactId,
        employee_id: employeeId,
        name: 'Jane Doe',
      };

      const updatedContact = { ...mockContact, ...updateData };

      (mockEmployeeRepository.getEmergencyContactById as jest.Mock).mockResolvedValue(
        mockContact
      );
      (mockEmployeeRepository.updateEmergencyContact as jest.Mock).mockResolvedValue(
        updatedContact
      );

      const result = await employeeService.updateEmergencyContact(
        employeeId,
        contactId,
        updateData
      );

      expect(result).toEqual(updatedContact);
    });

    it('should throw error if contact not found', async () => {
      const employeeId = 'emp-1';
      const contactId = 'contact-1';
      const updateData = { name: 'Jane Smith' };

      (mockEmployeeRepository.getEmergencyContactById as jest.Mock).mockResolvedValue(null);

      await expect(
        employeeService.updateEmergencyContact(employeeId, contactId, updateData)
      ).rejects.toThrow('Emergency contact not found');
    });

    it('should throw error if contact does not belong to employee', async () => {
      const employeeId = 'emp-1';
      const contactId = 'contact-1';
      const updateData = { name: 'Jane Smith' };

      const mockContact = {
        id: contactId,
        employee_id: 'emp-2', // Different employee
      };

      (mockEmployeeRepository.getEmergencyContactById as jest.Mock).mockResolvedValue(
        mockContact
      );

      await expect(
        employeeService.updateEmergencyContact(employeeId, contactId, updateData)
      ).rejects.toThrow('Emergency contact does not belong to the specified employee');
    });
  });

  describe('deleteEmergencyContact', () => {
    it('should delete emergency contact', async () => {
      const employeeId = 'emp-1';
      const contactId = 'contact-1';

      const mockContact = {
        id: contactId,
        employee_id: employeeId,
      };

      (mockEmployeeRepository.getEmergencyContactById as jest.Mock).mockResolvedValue(
        mockContact
      );
      (mockEmployeeRepository.deleteEmergencyContact as jest.Mock).mockResolvedValue(undefined);

      await employeeService.deleteEmergencyContact(employeeId, contactId);

      expect(mockEmployeeRepository.deleteEmergencyContact).toHaveBeenCalledWith(contactId);
    });

    it('should throw error if contact not found', async () => {
      const employeeId = 'emp-1';
      const contactId = 'contact-1';

      (mockEmployeeRepository.getEmergencyContactById as jest.Mock).mockResolvedValue(null);

      await expect(
        employeeService.deleteEmergencyContact(employeeId, contactId)
      ).rejects.toThrow('Emergency contact not found');
    });
  });

  describe('addEmploymentHistory', () => {
    it('should add employment history', async () => {
      const employeeId = 'emp-1';
      const historyData = {
        from_date: '2020-01-01',
        to_date: '2023-12-31',
        designation: 'Developer',
      };

      const mockEmployee = { id: employeeId };
      const mockHistory = { id: 'history-1', ...historyData };

      (mockEmployeeRepository.getEmployee as jest.Mock).mockResolvedValue(mockEmployee);
      (mockEmployeeRepository.addEmploymentHistory as jest.Mock).mockResolvedValue(mockHistory);

      const result = await employeeService.addEmploymentHistory(employeeId, historyData);

      expect(result).toEqual(mockHistory);
    });

    it('should throw error if employee not found', async () => {
      const employeeId = 'emp-1';
      const historyData = {
        from_date: '2020-01-01',
      };

      (mockEmployeeRepository.getEmployee as jest.Mock).mockResolvedValue(null);

      await expect(
        employeeService.addEmploymentHistory(employeeId, historyData)
      ).rejects.toThrow('Employee not found');
    });
  });

  describe('getEmploymentHistory', () => {
    it('should get employment history for employee', async () => {
      const employeeId = 'emp-1';
      const mockHistory = [
        { id: 'history-1', from_date: '2020-01-01' },
        { id: 'history-2', from_date: '2023-01-01' },
      ];

      const mockEmployee = { id: employeeId };

      (mockEmployeeRepository.getEmployee as jest.Mock).mockResolvedValue(mockEmployee);
      (mockEmployeeRepository.getEmploymentHistory as jest.Mock).mockResolvedValue(mockHistory);

      const result = await employeeService.getEmploymentHistory(employeeId);

      expect(result).toEqual(mockHistory);
    });

    it('should throw error if employee not found', async () => {
      const employeeId = 'emp-1';

      (mockEmployeeRepository.getEmployee as jest.Mock).mockResolvedValue(null);

      await expect(employeeService.getEmploymentHistory(employeeId)).rejects.toThrow(
        'Employee not found'
      );
    });
  });
});
