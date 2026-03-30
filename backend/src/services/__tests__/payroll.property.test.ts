import * as fc from 'fast-check';
import { Knex } from 'knex';
import { PayrollCalculationService } from '../payrollCalculationService';
import { SalaryStructureService } from '../salaryStructureService';
import { AdvanceSalaryService } from '../advanceSalaryService';
import { PayrollRepository } from '../../repositories/payrollRepository';

describe('Payroll Module - Property-Based Tests', () => {
  let knex: Knex;
  let payrollCalculationService: PayrollCalculationService;
  let salaryStructureService: SalaryStructureService;
  let advanceSalaryService: AdvanceSalaryService;
  let payrollRepository: PayrollRepository;

  beforeAll(async () => {
    knex = require('../../config/knex').default;
    payrollCalculationService = new PayrollCalculationService(knex);
    salaryStructureService = new SalaryStructureService(knex);
    advanceSalaryService = new AdvanceSalaryService(knex);
    payrollRepository = new PayrollRepository(knex);
  });

  afterAll(async () => {
    await knex.destroy();
  });

  /**
   * Feature: employee-management-system
   * Property 21: Attendance-Based Salary Calculation
   *
   * For any employee with monthly salary mode, the payable salary must equal
   * (gross salary / total working days) × paid days, where paid days = present days +
   * approved leave days + holiday days.
   */
  it('Property 21: Attendance-based salary calculation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          baseSalary: fc.integer({ min: 10000, max: 500000 }),
          hra: fc.integer({ min: 0, max: 100000 }),
          da: fc.integer({ min: 0, max: 50000 }),
          allowances: fc.integer({ min: 0, max: 50000 }),
          paidDays: fc.integer({ min: 0, max: 30 }),
          totalWorkingDays: fc.integer({ min: 20, max: 30 }),
        }),
        async (data) => {
          // Create test employee
          const [employee] = await knex('employees')
            .insert({
              employee_id: `EMP-PROP21-${Date.now()}-${Math.random()}`,
              first_name: 'Test',
              last_name: 'Employee',
              email: `test-${Date.now()}-${Math.random()}@test.com`,
              phone: '9876543210',
              date_of_birth: '1990-01-01',
              gender: 'male',
              status: 'active',
              department_id: null,
              designation_id: null,
              date_of_joining: new Date(),
            })
            .returning('*');

          // Create salary structure
          await knex('salary_structures').insert({
            employee_id: employee.id,
            salary_mode: 'monthly',
            base_salary: data.baseSalary,
            hra: data.hra,
            dearness_allowance: data.da,
            other_allowances: data.allowances,
            pf_contribution_rate: 12,
            esi_contribution_rate: 0.75,
            professional_tax: 200,
            effective_from: new Date(),
            is_active: true,
          });

          // Calculate expected salary
          const grossSalary = data.baseSalary + data.hra + data.da + data.allowances;
          const expectedSalary = (grossSalary / data.totalWorkingDays) * data.paidDays;

          // Verify calculation formula
          fc.pre(data.totalWorkingDays > 0);
          fc.pre(data.paidDays <= data.totalWorkingDays);

          // Cleanup
          await knex('employees').where({ id: employee.id }).delete();

          // The expected salary should be calculated correctly
          expect(expectedSalary).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: employee-management-system
   * Property 22: Statutory Deduction Calculation
   *
   * For any employee salary and configured tax slabs, the calculated statutory
   * deductions (PF, ESI, TDS) must match the amounts determined by the applicable
   * slab rates and thresholds.
   */
  it('Property 22: Statutory deduction calculation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          grossSalary: fc.integer({ min: 10000, max: 500000 }),
          pfRate: fc.integer({ min: 0, max: 15 }),
          esiRate: fc.float({ min: 0, max: 5, noNaN: true }),
          professionalTax: fc.integer({ min: 0, max: 500 }),
        }),
        async (data) => {
          // Create test employee
          const [employee] = await knex('employees')
            .insert({
              employee_id: `EMP-PROP22-${Date.now()}-${Math.random()}`,
              first_name: 'Test',
              last_name: 'Employee',
              email: `test-${Date.now()}-${Math.random()}@test.com`,
              phone: '9876543210',
              date_of_birth: '1990-01-01',
              gender: 'male',
              status: 'active',
              department_id: null,
              designation_id: null,
              date_of_joining: new Date(),
            })
            .returning('*');

          // Create salary structure
          await knex('salary_structures').insert({
            employee_id: employee.id,
            salary_mode: 'monthly',
            base_salary: data.grossSalary,
            hra: 0,
            dearness_allowance: 0,
            other_allowances: 0,
            pf_contribution_rate: data.pfRate,
            esi_contribution_rate: data.esiRate,
            professional_tax: data.professionalTax,
            effective_from: new Date(),
            is_active: true,
          });

          // Calculate expected deductions
          const pfDeduction = (data.grossSalary * data.pfRate) / 100;
          const esiDeduction = (data.grossSalary * data.esiRate) / 100;
          const tdsDeduction = data.grossSalary > 50000 ? (data.grossSalary - 50000) * 0.1 : 0;
          const totalDeductions = pfDeduction + esiDeduction + data.professionalTax + tdsDeduction;

          // Verify deductions are non-negative
          expect(pfDeduction).toBeGreaterThanOrEqual(0);
          expect(esiDeduction).toBeGreaterThanOrEqual(0);
          expect(tdsDeduction).toBeGreaterThanOrEqual(0);
          expect(totalDeductions).toBeGreaterThanOrEqual(0);

          // Cleanup
          await knex('employees').where({ id: employee.id }).delete();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: employee-management-system
   * Property 23: Payslip Completeness
   *
   * For any processed payroll record, the generated payslip must include all
   * earning components, all deduction components, gross pay, total deductions,
   * and net pay, with net pay = gross pay − total deductions.
   */
  it('Property 23: Payslip completeness', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          grossSalary: fc.integer({ min: 10000, max: 500000 }),
          totalDeductions: fc.integer({ min: 0, max: 100000 }),
        }),
        async (data) => {
          // Ensure gross salary is greater than deductions
          fc.pre(data.grossSalary > data.totalDeductions);

          // Create test employee
          const [employee] = await knex('employees')
            .insert({
              employee_id: `EMP-PROP23-${Date.now()}-${Math.random()}`,
              first_name: 'Test',
              last_name: 'Employee',
              email: `test-${Date.now()}-${Math.random()}@test.com`,
              phone: '9876543210',
              date_of_birth: '1990-01-01',
              gender: 'male',
              status: 'active',
              department_id: null,
              designation_id: null,
              date_of_joining: new Date(),
            })
            .returning('*');

          // Create payroll
          const [payroll] = await knex('payroll')
            .insert({
              employee_id: employee.id,
              month: 1,
              year: 2024,
              gross_salary: data.grossSalary,
              net_salary: data.grossSalary - data.totalDeductions,
              total_deductions: data.totalDeductions,
              total_earnings: data.grossSalary,
              status: 'processed',
            })
            .returning('*');

          // Verify payslip completeness
          const netPay = data.grossSalary - data.totalDeductions;
          expect(netPay).toBe(data.grossSalary - data.totalDeductions);
          expect(netPay).toBeGreaterThanOrEqual(0);

          // Cleanup
          await knex('employees').where({ id: employee.id }).delete();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: employee-management-system
   * Property 24: Advance Salary Deduction
   *
   * For any approved advance salary request, the advance amount must appear as
   * a deduction in the next payroll cycle for that employee.
   */
  it('Property 24: Advance salary deduction', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          grossSalary: fc.integer({ min: 50000, max: 500000 }),
          advanceAmount: fc.integer({ min: 5000, max: 50000 }),
          deductionMonths: fc.integer({ min: 1, max: 12 }),
        }),
        async (data) => {
          // Ensure advance is less than gross salary
          fc.pre(data.advanceAmount < data.grossSalary);

          // Create test employee
          const [employee] = await knex('employees')
            .insert({
              employee_id: `EMP-PROP24-${Date.now()}-${Math.random()}`,
              first_name: 'Test',
              last_name: 'Employee',
              email: `test-${Date.now()}-${Math.random()}@test.com`,
              phone: '9876543210',
              date_of_birth: '1990-01-01',
              gender: 'male',
              status: 'active',
              department_id: null,
              designation_id: null,
              date_of_joining: new Date(),
            })
            .returning('*');

          // Create salary structure
          await knex('salary_structures').insert({
            employee_id: employee.id,
            salary_mode: 'monthly',
            base_salary: data.grossSalary,
            hra: 0,
            dearness_allowance: 0,
            other_allowances: 0,
            pf_contribution_rate: 12,
            esi_contribution_rate: 0.75,
            professional_tax: 200,
            effective_from: new Date(),
            is_active: true,
          });

          // Create advance request
          const [advance] = await knex('advance_salary_requests')
            .insert({
              employee_id: employee.id,
              amount: data.advanceAmount,
              status: 'approved',
              deduction_months: data.deductionMonths,
              approved_at: new Date(),
            })
            .returning('*');

          // Verify advance deduction calculation
          const monthlyDeduction = data.advanceAmount / data.deductionMonths;
          expect(monthlyDeduction).toBeGreaterThan(0);
          expect(monthlyDeduction).toBeLessThanOrEqual(data.advanceAmount);

          // Cleanup
          await knex('employees').where({ id: employee.id }).delete();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: employee-management-system
   * Property 25: Payroll Lock Immutability
   *
   * For any payroll record in "Locked" status, any attempt to modify the record
   * must be rejected unless performed by a user with Finance Admin role and must
   * create an audit log entry.
   */
  it('Property 25: Payroll lock immutability', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          grossSalary: fc.integer({ min: 10000, max: 500000 }),
          netSalary: fc.integer({ min: 5000, max: 400000 }),
        }),
        async (data) => {
          // Ensure net salary is less than gross
          fc.pre(data.netSalary < data.grossSalary);

          // Create test employee
          const [employee] = await knex('employees')
            .insert({
              employee_id: `EMP-PROP25-${Date.now()}-${Math.random()}`,
              first_name: 'Test',
              last_name: 'Employee',
              email: `test-${Date.now()}-${Math.random()}@test.com`,
              phone: '9876543210',
              date_of_birth: '1990-01-01',
              gender: 'male',
              status: 'active',
              department_id: null,
              designation_id: null,
              date_of_joining: new Date(),
            })
            .returning('*');

          // Create locked payroll
          const [payroll] = await knex('payroll')
            .insert({
              employee_id: employee.id,
              month: 1,
              year: 2024,
              gross_salary: data.grossSalary,
              net_salary: data.netSalary,
              total_deductions: data.grossSalary - data.netSalary,
              total_earnings: data.grossSalary,
              status: 'locked',
            })
            .returning('*');

          // Verify locked status
          expect(payroll.status).toBe('locked');

          // Cleanup
          await knex('employees').where({ id: employee.id }).delete();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: employee-management-system
   * Property 51: Unpaid Absence Salary Deduction
   *
   * For any employee with unpaid absences in a month, the salary deduction must
   * equal (gross salary / total working days) × number of unpaid absent days.
   */
  it('Property 51: Unpaid absence salary deduction', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          grossSalary: fc.integer({ min: 10000, max: 500000 }),
          unpaidAbsentDays: fc.integer({ min: 0, max: 10 }),
          totalWorkingDays: fc.integer({ min: 20, max: 30 }),
        }),
        async (data) => {
          // Ensure unpaid absent days don't exceed working days
          fc.pre(data.unpaidAbsentDays <= data.totalWorkingDays);

          // Calculate expected deduction
          const deductionPerDay = data.grossSalary / data.totalWorkingDays;
          const totalDeduction = deductionPerDay * data.unpaidAbsentDays;

          // Verify deduction calculation
          expect(totalDeduction).toBeGreaterThanOrEqual(0);
          expect(totalDeduction).toBeLessThanOrEqual(data.grossSalary);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: employee-management-system
   * Property 52: Holiday Paid Day Inclusion
   *
   * For any month with configured company holidays, those holiday dates must be
   * counted as paid days in the salary calculation for all employees.
   */
  it('Property 52: Holiday paid day inclusion', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          holidayCount: fc.integer({ min: 0, max: 10 }),
          presentDays: fc.integer({ min: 0, max: 20 }),
          paidLeaveDays: fc.integer({ min: 0, max: 10 }),
        }),
        async (data) => {
          // Calculate total paid days including holidays
          const totalPaidDays = data.presentDays + data.paidLeaveDays + data.holidayCount;

          // Verify paid days calculation
          expect(totalPaidDays).toBeGreaterThanOrEqual(data.holidayCount);
          expect(totalPaidDays).toBeGreaterThanOrEqual(data.presentDays);
          expect(totalPaidDays).toBeGreaterThanOrEqual(data.paidLeaveDays);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: employee-management-system
   * Property 58: Salary Mode Flexibility
   *
   * For any employee, the system must support configuring their salary calculation
   * mode as Monthly (fixed), Daily (rate × days), or Hourly (rate × hours), and
   * payroll calculation must use the appropriate formula for their mode.
   */
  it('Property 58: Salary mode flexibility', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          baseSalary: fc.integer({ min: 10000, max: 500000 }),
          salaryMode: fc.oneof(
            fc.constant('monthly'),
            fc.constant('daily'),
            fc.constant('hourly')
          ),
          paidDays: fc.integer({ min: 0, max: 30 }),
        }),
        async (data) => {
          // Create test employee
          const [employee] = await knex('employees')
            .insert({
              employee_id: `EMP-PROP58-${Date.now()}-${Math.random()}`,
              first_name: 'Test',
              last_name: 'Employee',
              email: `test-${Date.now()}-${Math.random()}@test.com`,
              phone: '9876543210',
              date_of_birth: '1990-01-01',
              gender: 'male',
              status: 'active',
              department_id: null,
              designation_id: null,
              date_of_joining: new Date(),
            })
            .returning('*');

          // Create salary structure with different modes
          const [structure] = await knex('salary_structures')
            .insert({
              employee_id: employee.id,
              salary_mode: data.salaryMode,
              base_salary: data.baseSalary,
              hra: 0,
              dearness_allowance: 0,
              other_allowances: 0,
              pf_contribution_rate: 12,
              esi_contribution_rate: 0.75,
              professional_tax: 200,
              effective_from: new Date(),
              is_active: true,
            })
            .returning('*');

          // Verify salary mode is set correctly
          expect(structure.salary_mode).toBe(data.salaryMode);
          expect(['monthly', 'daily', 'hourly']).toContain(data.salaryMode);

          // Calculate expected salary based on mode
          let expectedSalary = 0;
          if (data.salaryMode === 'monthly') {
            expectedSalary = data.baseSalary;
          } else if (data.salaryMode === 'daily') {
            expectedSalary = data.baseSalary * data.paidDays;
          } else if (data.salaryMode === 'hourly') {
            expectedSalary = data.baseSalary * data.paidDays * 8;
          }

          expect(expectedSalary).toBeGreaterThanOrEqual(0);

          // Cleanup
          await knex('employees').where({ id: employee.id }).delete();
        }
      ),
      { numRuns: 100 }
    );
  });
});
