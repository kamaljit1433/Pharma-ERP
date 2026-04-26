import { PFService } from '../pfService';
import { PFRepository } from '../../repositories/pfRepository';
import { EmployeeRepository } from '../../repositories/employeeRepository';
import { SalaryStructureRepository } from '../../repositories/salaryStructureRepository';
import { Knex } from 'knex';

describe('PFService', () => {
  let pfService: PFService;
  let mockKnex: Knex;
  let mockPFRepository: jest.Mocked<PFRepository> & { getPFContribution: jest.Mock; getPFContributionsByPeriod: jest.Mock };
  let mockEmployeeRepository: jest.Mocked<EmployeeRepository>;
  let mockSalaryStructureRepository: jest.Mocked<SalaryStructureRepository>;

  const mockEmployee = {
    id: 'emp-1',
    employee_id: 'EMP001',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    date_of_joining: new Date('2020-01-15'),
    status: 'active',
  };

  const mockPFAccount = {
    id: 'pf-1',
    employee_id: 'emp-1',
    pf_number: 'PF123456789ABC',
    employee_contribution_rate: 12,
    employer_contribution_rate: 12,
    account_status: 'active',
    current_balance: 50000,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockPFContribution = {
    id: 'contrib-1',
    pf_account_id: 'pf-1',
    employee_id: 'emp-1',
    month: 1,
    year: 2024,
    basic_salary: 50000,
    employee_contribution: 6000,
    employer_contribution: 6000,
    total_contribution: 12000,
    employee_contribution_rate: 12,
    employer_contribution_rate: 12,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    mockKnex = {} as Knex;
    mockPFRepository = {
      createPFAccount: jest.fn(),
      getPFAccount: jest.fn(),
      getPFAccountByEmployee: jest.fn(),
      getPFAccountByNumber: jest.fn(),
      recordPFContribution: jest.fn(),
      getPFContribution: jest.fn(),
      getPFContributionsByEmployee: jest.fn(),
      getPFContributionsByPeriod: jest.fn(),
      getContributions: jest.fn(),
      updatePFAccountBalance: jest.fn(),
      getTotalPFContribution: jest.fn(),
    } as any;

    mockEmployeeRepository = {
      getEmployee: jest.fn(),
    } as any;

    mockSalaryStructureRepository = {} as any;

    pfService = new PFService(mockKnex);
    (pfService as any).pfRepository = mockPFRepository;
    (pfService as any).employeeRepository = mockEmployeeRepository;
    (pfService as any).salaryStructureRepository = mockSalaryStructureRepository;
  });

  describe('initializePFAccount', () => {
    it('should create a new PF account if it does not exist', async () => {
      mockPFRepository.getPFAccount.mockResolvedValue(null);
      mockPFRepository.createPFAccount.mockResolvedValue(mockPFAccount);

      const result = await pfService.initializePFAccount('emp-1');

      expect(mockPFRepository.getPFAccount).toHaveBeenCalledWith('emp-1');
      expect(mockPFRepository.createPFAccount).toHaveBeenCalled();
      expect(result).toEqual(mockPFAccount);
    });

    it('should return existing PF account if it already exists', async () => {
      mockPFRepository.getPFAccount.mockResolvedValue(mockPFAccount);

      const result = await pfService.initializePFAccount('emp-1');

      expect(mockPFRepository.getPFAccount).toHaveBeenCalledWith('emp-1');
      expect(mockPFRepository.createPFAccount).not.toHaveBeenCalled();
      expect(result).toEqual(mockPFAccount);
    });
  });

  describe('calculateAndRecordPFContribution', () => {
    it('should calculate and record PF contribution with default rates', async () => {
      mockPFRepository.getPFAccount.mockResolvedValue(null);
      mockPFRepository.getPFAccountByEmployee.mockResolvedValue(mockPFAccount);
      mockPFRepository.getContributions.mockResolvedValue([]);
      mockPFRepository.createPFAccount.mockResolvedValue(mockPFAccount);
      mockPFRepository.recordPFContribution.mockResolvedValue(mockPFContribution);

      const result = await pfService.calculateAndRecordPFContribution('emp-1', 1, 2024, 50000);

      expect(mockPFRepository.recordPFContribution).toHaveBeenCalled();
      expect(result.employee_contribution).toBe(6000);
      expect(result.employer_contribution).toBe(6000);
      expect(result.total_contribution).toBe(12000);
    });

    it('should not record duplicate contribution for same month', async () => {
      mockPFRepository.getPFAccountByEmployee.mockResolvedValue(mockPFAccount);
      mockPFRepository.getContributions.mockResolvedValue([mockPFContribution]);

      const result = await pfService.calculateAndRecordPFContribution('emp-1', 1, 2024, 50000);

      expect(mockPFRepository.recordPFContribution).not.toHaveBeenCalled();
      expect(result).toEqual(mockPFContribution);
    });

    it('should calculate contributions with custom rates', async () => {
      const customContribution = {
        ...mockPFContribution,
        employee_contribution_rate: 10,
        employer_contribution_rate: 15,
        employee_contribution: 5000,
        employer_contribution: 7500,
        total_contribution: 12500,
      };

      mockPFRepository.getPFAccount.mockResolvedValue(null);
      mockPFRepository.getPFAccountByEmployee.mockResolvedValue(mockPFAccount);
      mockPFRepository.getContributions.mockResolvedValue([]);
      mockPFRepository.createPFAccount.mockResolvedValue(mockPFAccount);
      mockPFRepository.recordPFContribution.mockResolvedValue(customContribution);

      const result = await pfService.calculateAndRecordPFContribution('emp-1', 1, 2024, 50000, 10, 15);

      expect(result.employee_contribution).toBe(5000);
      expect(result.employer_contribution).toBe(7500);
    });
  });

  describe('getPFAccount', () => {
    it('should return PF account for an employee', async () => {
      mockPFRepository.getPFAccountByEmployee.mockResolvedValue(mockPFAccount);

      const result = await pfService.getPFAccount('emp-1');

      expect(mockPFRepository.getPFAccountByEmployee).toHaveBeenCalledWith('emp-1');
      expect(result).toEqual(mockPFAccount);
    });

    it('should return null if PF account does not exist', async () => {
      mockPFRepository.getPFAccountByEmployee.mockResolvedValue(null);

      const result = await pfService.getPFAccount('emp-1');

      expect(result).toBeNull();
    });
  });

  describe('getPFContribution', () => {
    it('should return PF contribution for a specific month', async () => {
      mockPFRepository.getPFAccountByEmployee.mockResolvedValue(mockPFAccount);
      mockPFRepository.getContributions.mockResolvedValue([mockPFContribution]);

      const result = await pfService.getPFContribution('emp-1', 1, 2024);

      expect(mockPFRepository.getPFAccountByEmployee).toHaveBeenCalledWith('emp-1');
      expect(result).toEqual(mockPFContribution);
    });
  });

  describe('getPFContributions', () => {
    it('should return all PF contributions for an employee', async () => {
      const contributions = [mockPFContribution];
      mockPFRepository.getPFContributionsByEmployee.mockResolvedValue(contributions);
      mockPFRepository.getPFAccountByEmployee.mockResolvedValue(mockPFAccount);
      mockPFRepository.getContributions.mockResolvedValue(contributions);

      const result = await pfService.getPFContributions('emp-1');

      expect(mockPFRepository.getPFContributionsByEmployee).toHaveBeenCalledWith('emp-1');
      expect(result).toEqual(contributions);
    });
  });

  describe('generatePFStatement', () => {
    it('should generate PF statement for a period', async () => {
      mockEmployeeRepository.getEmployee.mockResolvedValue(mockEmployee as any);
      mockPFRepository.getPFAccountByEmployee.mockResolvedValue(mockPFAccount);
      mockPFRepository.getContributions.mockResolvedValue([mockPFContribution]);

      const result = await pfService.generatePFStatement('emp-1', 1, 2024, 3, 2024);

      expect(result.employee_id).toBe('emp-1');
      expect(result.employee_name).toBe('John Doe');
      expect(result.pf_account_number).toBe('PF123456789ABC');
      expect(result.contributions).toHaveLength(1);
      expect(result.total_employee_contribution).toBe(6000);
      expect(result.total_employer_contribution).toBe(6000);
    });

    it('should throw error if employee not found', async () => {
      mockEmployeeRepository.getEmployee.mockResolvedValue(null);

      await expect(pfService.generatePFStatement('emp-1', 1, 2024, 3, 2024)).rejects.toThrow(
        'Employee with ID emp-1 not found'
      );
    });

    it('should throw error if PF account not found', async () => {
      mockEmployeeRepository.getEmployee.mockResolvedValue(mockEmployee as any);
      mockPFRepository.getPFAccountByEmployee.mockResolvedValue(null);
      mockPFRepository.getPFAccount.mockResolvedValue(null);

      await expect(pfService.generatePFStatement('emp-1', 1, 2024, 3, 2024)).rejects.toThrow(
        'PF account not found for employee emp-1'
      );
    });
  });

  describe('getPFBalance', () => {
    it('should return current PF balance', async () => {
      mockPFRepository.getPFAccount.mockResolvedValue(mockPFAccount);

      const result = await pfService.getPFBalance('emp-1');

      expect(result).toBe(50000);
    });

    it('should return 0 if no PF account exists', async () => {
      mockPFRepository.getPFAccount.mockResolvedValue(null);

      const result = await pfService.getPFBalance('emp-1');

      expect(result).toBe(0);
    });
  });

  describe('getTotalPFContribution', () => {
    it('should return total PF contributions', async () => {
      mockPFRepository.getTotalPFContribution.mockResolvedValue(50000);

      const result = await pfService.getTotalPFContribution('emp-1');

      expect(result).toBe(50000);
    });
  });
});
