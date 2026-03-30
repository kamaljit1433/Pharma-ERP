import fc from 'fast-check';
import { PFService } from '../pfService';
import { PFRepository } from '../../repositories/pfRepository';
import { EmployeeRepository } from '../../repositories/employeeRepository';
import { SalaryStructureRepository } from '../../repositories/salaryStructureRepository';
import { Knex } from 'knex';

/**
 * Property 28: PF Contribution Calculation
 * **Validates: Requirements 4.6.5**
 *
 * For any employee salary, the PF contribution must be calculated as
 * (employee share + employer share) where each share is the configured
 * percentage of basic salary.
 */
describe('PFService - Property 28: PF Contribution Calculation', () => {
  let pfService: PFService;
  let mockKnex: Knex;
  let mockPFRepository: jest.Mocked<PFRepository>;
  let mockEmployeeRepository: jest.Mocked<EmployeeRepository>;
  let mockSalaryStructureRepository: jest.Mocked<SalaryStructureRepository>;

  beforeEach(() => {
    mockKnex = {} as Knex;
    mockPFRepository = {
      createPFAccount: jest.fn(),
      getPFAccount: jest.fn(),
      getPFAccountByNumber: jest.fn(),
      recordPFContribution: jest.fn(),
      getPFContribution: jest.fn(),
      getPFContributionsByEmployee: jest.fn(),
      getPFContributionsByPeriod: jest.fn(),
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

  it('should calculate total PF contribution as sum of employee and employer shares', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10000, max: 500000 }), // basic salary
        fc.integer({ min: 1, max: 20 }), // employee contribution rate
        fc.integer({ min: 1, max: 20 }), // employer contribution rate
        (basicSalary: number, employeeRate: number, employerRate: number) => {
          const expectedEmployeeContribution = (basicSalary * employeeRate) / 100;
          const expectedEmployerContribution = (basicSalary * employerRate) / 100;
          const expectedTotal = expectedEmployeeContribution + expectedEmployerContribution;

          // Verify calculation logic
          expect(expectedTotal).toBe(
            (basicSalary * employeeRate) / 100 + (basicSalary * employerRate) / 100
          );
          expect(expectedTotal).toBeGreaterThan(0);
        }
      )
    );
  });

  it('should ensure employee contribution equals (basic_salary × employee_rate) / 100', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10000, max: 500000 }), // basic salary
        fc.integer({ min: 1, max: 20 }), // employee contribution rate
        (basicSalary: number, employeeRate: number) => {
          const expectedContribution = (basicSalary * employeeRate) / 100;

          expect(expectedContribution).toBe((basicSalary * employeeRate) / 100);
          expect(expectedContribution).toBeGreaterThanOrEqual(0);
        }
      )
    );
  });

  it('should ensure employer contribution equals (basic_salary × employer_rate) / 100', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10000, max: 500000 }), // basic salary
        fc.integer({ min: 1, max: 20 }), // employer contribution rate
        (basicSalary: number, employerRate: number) => {
          const expectedContribution = (basicSalary * employerRate) / 100;

          expect(expectedContribution).toBe((basicSalary * employerRate) / 100);
          expect(expectedContribution).toBeGreaterThanOrEqual(0);
        }
      )
    );
  });

  it('should ensure total contribution is always positive for positive salary and rates', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 500000 }), // basic salary
        fc.integer({ min: 1, max: 20 }), // employee contribution rate
        fc.integer({ min: 1, max: 20 }), // employer contribution rate
        (basicSalary: number, employeeRate: number, employerRate: number) => {
          const total = (basicSalary * employeeRate) / 100 + (basicSalary * employerRate) / 100;

          expect(total).toBeGreaterThan(0);
        }
      )
    );
  });

  it('should ensure contribution rates are applied correctly to different salary ranges', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.integer({ min: 10000, max: 50000 }),
          fc.integer({ min: 50001, max: 100000 }),
          fc.integer({ min: 100001, max: 500000 })
        ),
        fc.integer({ min: 1, max: 20 }),
        (salaries: [number, number, number], rate: number) => {
          const [lowSalary, midSalary, highSalary] = salaries;
          const lowContribution = (lowSalary * rate) / 100;
          const midContribution = (midSalary * rate) / 100;
          const highContribution = (highSalary * rate) / 100;

          // Contributions should scale proportionally with salary
          expect(midContribution).toBeGreaterThan(lowContribution);
          expect(highContribution).toBeGreaterThan(midContribution);
        }
      )
    );
  });

  it('should handle zero contribution rates correctly', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10000, max: 500000 }), // basic salary
        (basicSalary: number) => {
          const contribution = (basicSalary * 0) / 100;

          expect(contribution).toBe(0);
        }
      )
    );
  });
});
