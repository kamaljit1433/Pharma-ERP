import { GratuityService } from '../gratuityService';
import { GratuityRepository } from '../../repositories/gratuityRepository';
import { EmployeeRepository } from '../../repositories/employeeRepository';
import { Knex } from 'knex';

describe('GratuityService', () => {
  let gratuityService: GratuityService;
  let mockKnex: Knex;
  let mockGratuityRepository: jest.Mocked<GratuityRepository>;
  let mockEmployeeRepository: jest.Mocked<EmployeeRepository>;

  const mockEmployee = {
    id: 'emp-1',
    employee_id: 'EMP001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    date_of_joining: new Date('2019-01-15'),
    date_of_exit: null,
    status: 'active',
  };

  const mockGratuity = {
    id: 'grat-1',
    employee_id: 'emp-1',
    eligibility_date: new Date(),
    years_of_service: 5,
    last_drawn_salary: 100000,
    gratuity_amount: 28846.15,
    is_eligible: true,
    calculation_date: new Date(),
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    mockKnex = {} as Knex;
    mockGratuityRepository = {
      createGratuity: jest.fn(),
      getGratuity: jest.fn(),
      getGratuityById: jest.fn(),
      updateGratuity: jest.fn(),
      getGratuityByEmployeeAndDate: jest.fn(),
      getEligibleGratuities: jest.fn(),
      getGratuityHistory: jest.fn(),
    } as any;

    mockEmployeeRepository = {
      getEmployee: jest.fn(),
    } as any;

    gratuityService = new GratuityService(mockKnex);
    (gratuityService as any).gratuityRepository = mockGratuityRepository;
    (gratuityService as any).employeeRepository = mockEmployeeRepository;
  });

  describe('calculateGratuity', () => {
    it('should calculate gratuity for eligible employee (5+ years)', async () => {
      mockEmployeeRepository.getEmployee.mockResolvedValue(mockEmployee as any);
      mockGratuityRepository.createGratuity.mockResolvedValue(mockGratuity);

      const result = await gratuityService.calculateGratuity('emp-1', 100000);

      expect(mockEmployeeRepository.getEmployee).toHaveBeenCalledWith('emp-1');
      expect(mockGratuityRepository.createGratuity).toHaveBeenCalled();
      expect(result.is_eligible).toBe(true);
      expect(result.gratuity_amount).toBeGreaterThan(0);
    });

    it('should return 0 gratuity for employee with less than 5 years', async () => {
      const newEmployee = {
        ...mockEmployee,
        date_of_joining: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 365),
      };

      mockEmployeeRepository.getEmployee.mockResolvedValue(newEmployee as any);
      const ineligibleGratuity = {
        ...mockGratuity,
        years_of_service: 1,
        gratuity_amount: 0,
        is_eligible: false,
      };
      mockGratuityRepository.createGratuity.mockResolvedValue(ineligibleGratuity);

      const result = await gratuityService.calculateGratuity('emp-1', 100000);

      expect(result.is_eligible).toBe(false);
      expect(result.gratuity_amount).toBe(0);
    });

    it('should throw error if employee not found', async () => {
      mockEmployeeRepository.getEmployee.mockResolvedValue(null);

      await expect(gratuityService.calculateGratuity('emp-1', 100000)).rejects.toThrow(
        'Employee with ID emp-1 not found'
      );
    });

    it('should calculate gratuity using formula: (salary × years × 15) / 26', async () => {
      mockEmployeeRepository.getEmployee.mockResolvedValue(mockEmployee as any);
      mockGratuityRepository.createGratuity.mockResolvedValue(mockGratuity);

      await gratuityService.calculateGratuity('emp-1', 100000);

      const calls = mockGratuityRepository.createGratuity.mock.calls;
      expect(calls.length).toBeGreaterThan(0);
      const callArgs = calls[0]?.[0];
      // The mock employee joined in 2019, so years of service is ~5 years
      // Formula: (100000 * years * 15) / 26
      expect(callArgs?.gratuity_amount).toBeGreaterThan(0);
      if (callArgs?.years_of_service) {
        expect(callArgs.gratuity_amount).toBe((100000 * callArgs.years_of_service * 15) / 26);
      }
    });
  });

  describe('getGratuity', () => {
    it('should return gratuity for an employee', async () => {
      mockGratuityRepository.getGratuity.mockResolvedValue(mockGratuity);

      const result = await gratuityService.getGratuity('emp-1');

      expect(mockGratuityRepository.getGratuity).toHaveBeenCalledWith('emp-1');
      expect(result).toEqual(mockGratuity);
    });

    it('should return null if no gratuity record exists', async () => {
      mockGratuityRepository.getGratuity.mockResolvedValue(null);

      const result = await gratuityService.getGratuity('emp-1');

      expect(result).toBeNull();
    });
  });

  describe('getGratuityHistory', () => {
    it('should return gratuity history for an employee', async () => {
      const history = [mockGratuity];
      mockGratuityRepository.getGratuityHistory.mockResolvedValue(history);

      const result = await gratuityService.getGratuityHistory('emp-1');

      expect(mockGratuityRepository.getGratuityHistory).toHaveBeenCalledWith('emp-1');
      expect(result).toEqual(history);
    });
  });

  describe('generateGratuityReport', () => {
    it('should generate gratuity report for an employee', async () => {
      mockEmployeeRepository.getEmployee.mockResolvedValue(mockEmployee as any);

      const result = await gratuityService.generateGratuityReport('emp-1', 100000);

      expect(result.employee_id).toBe('emp-1');
      expect(result.employee_name).toBe('John Doe');
      expect(result.employee_id_number).toBe('EMP001');
      expect(result.is_eligible).toBe(true);
      expect(result.gratuity_amount).toBeGreaterThan(0);
    });

    it('should include separation date in report if employee has exited', async () => {
      const exitedEmployee = {
        ...mockEmployee,
        date_of_exit: new Date('2024-01-15'),
      };

      mockEmployeeRepository.getEmployee.mockResolvedValue(exitedEmployee as any);

      const result = await gratuityService.generateGratuityReport('emp-1', 100000);

      expect(result.date_of_separation).toBeDefined();
    });

    it('should throw error if employee not found', async () => {
      mockEmployeeRepository.getEmployee.mockResolvedValue(null);

      await expect(gratuityService.generateGratuityReport('emp-1', 100000)).rejects.toThrow(
        'Employee with ID emp-1 not found'
      );
    });
  });

  describe('getGratuityAmount', () => {
    it('should return gratuity amount for eligible employee', async () => {
      mockEmployeeRepository.getEmployee.mockResolvedValue(mockEmployee as any);

      const result = await gratuityService.getGratuityAmount('emp-1', 100000);

      expect(result).toBeGreaterThan(0);
      // The mock employee joined in 2019, so years of service is ~5 years
      // Just verify it's calculated correctly
      const yearsOfService = new Date().getFullYear() - 2019;
      const expected = (100000 * yearsOfService * 15) / 26;
      expect(result).toBeCloseTo(expected, 0);
    });

    it('should return 0 for ineligible employee', async () => {
      const newEmployee = {
        ...mockEmployee,
        date_of_joining: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 365),
      };

      mockEmployeeRepository.getEmployee.mockResolvedValue(newEmployee as any);

      const result = await gratuityService.getGratuityAmount('emp-1', 100000);

      expect(result).toBe(0);
    });
  });

  describe('isEligible', () => {
    it('should return true for employee with 5+ years of service', async () => {
      mockEmployeeRepository.getEmployee.mockResolvedValue(mockEmployee as any);

      const result = await gratuityService.isEligible('emp-1');

      expect(result).toBe(true);
    });

    it('should return false for employee with less than 5 years', async () => {
      const newEmployee = {
        ...mockEmployee,
        date_of_joining: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 365),
      };

      mockEmployeeRepository.getEmployee.mockResolvedValue(newEmployee as any);

      const result = await gratuityService.isEligible('emp-1');

      expect(result).toBe(false);
    });

    it('should throw error if employee not found', async () => {
      mockEmployeeRepository.getEmployee.mockResolvedValue(null);

      await expect(gratuityService.isEligible('emp-1')).rejects.toThrow(
        'Employee with ID emp-1 not found'
      );
    });
  });

  describe('getYearsOfService', () => {
    it('should calculate years of service correctly', async () => {
      mockEmployeeRepository.getEmployee.mockResolvedValue(mockEmployee as any);

      const result = await gratuityService.getYearsOfService('emp-1');

      expect(result).toBeGreaterThanOrEqual(5);
    });

    it('should return 0 for newly joined employee', async () => {
      const newEmployee = {
        ...mockEmployee,
        date_of_joining: new Date(),
      };

      mockEmployeeRepository.getEmployee.mockResolvedValue(newEmployee as any);

      const result = await gratuityService.getYearsOfService('emp-1');

      expect(result).toBe(0);
    });

    it('should throw error if employee not found', async () => {
      mockEmployeeRepository.getEmployee.mockResolvedValue(null);

      await expect(gratuityService.getYearsOfService('emp-1')).rejects.toThrow(
        'Employee with ID emp-1 not found'
      );
    });
  });
});
