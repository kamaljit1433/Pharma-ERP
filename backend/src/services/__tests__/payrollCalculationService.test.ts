import { Knex } from 'knex';
import { PayrollCalculationService } from '../payrollCalculationService';

describe('PayrollCalculationService', () => {
  let service: PayrollCalculationService;
  let knex: Knex;
  let employeeId: string;

  beforeAll(async () => {
    knex = require('../../config/knex').default;
    service = new PayrollCalculationService(knex);
  });

  beforeEach(async () => {
    // Create test employee
    const [employee] = await knex('employees')
      .insert({
        employee_id: `EMP-TEST-${Date.now()}`,
        first_name: 'Test',
        last_name: 'Employee',
        email: `test-${Date.now()}@test.com`,
        phone: '9876543210',
        date_of_birth: '1990-01-01',
        gender: 'male',
        status: 'active',
        department_id: null,
        designation_id: null,
        date_of_joining: new Date(),
      })
      .returning('*');

    employeeId = employee.id;

    // Create salary structure
    await knex('salary_structures').insert({
      employee_id: employeeId,
      salary_mode: 'monthly',
      base_salary: 50000,
      hra: 10000,
      dearness_allowance: 5000,
      other_allowances: 2000,
      pf_contribution_rate: 12,
      esi_contribution_rate: 0.75,
      professional_tax: 200,
      effective_from: new Date(),
      is_active: true,
    });
  });

  afterEach(async () => {
    // Cleanup
    await knex('employees').where({ id: employeeId }).delete();
  });

  afterAll(async () => {
    await knex.destroy();
  });

  describe('calculateSalary', () => {
    it('should calculate salary for monthly mode', async () => {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      const result = await service.calculateSalary(employeeId, month, year);

      expect(result).toBeDefined();
      expect(result.employee_id).toBe(employeeId);
      expect(result.month).toBe(month);
      expect(result.year).toBe(year);
      expect(result.gross_pay).toBeGreaterThan(0);
      expect(result.net_pay).toBeGreaterThan(0);
      expect(result.earnings.length).toBeGreaterThan(0);
      expect(result.deductions.length).toBeGreaterThan(0);
    });

    it('should include PF deduction in calculations', async () => {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      const result = await service.calculateSalary(employeeId, month, year);

      const pfDeduction = result.deductions.find(
        (d) => d.name === 'Provident Fund (PF)'
      );
      expect(pfDeduction).toBeDefined();
      expect(pfDeduction?.amount).toBeGreaterThan(0);
    });

    it('should include ESI deduction in calculations', async () => {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      const result = await service.calculateSalary(employeeId, month, year);

      const esiDeduction = result.deductions.find(
        (d) => d.name === 'Employee State Insurance (ESI)'
      );
      expect(esiDeduction).toBeDefined();
      expect(esiDeduction?.amount).toBeGreaterThan(0);
    });

    it('should include professional tax in deductions', async () => {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      const result = await service.calculateSalary(employeeId, month, year);

      const ptDeduction = result.deductions.find(
        (d) => d.name === 'Professional Tax'
      );
      expect(ptDeduction).toBeDefined();
      expect(ptDeduction?.amount).toBe(200);
    });

    it('should calculate net pay as gross pay minus deductions', async () => {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      const result = await service.calculateSalary(employeeId, month, year);

      const expectedNetPay = result.gross_pay - result.total_deductions;
      expect(result.net_pay).toBeCloseTo(expectedNetPay, 2);
    });

    it('should throw error if no salary structure found', async () => {
      const [newEmployee] = await knex('employees')
        .insert({
          employee_id: `EMP-NO-STRUCT-${Date.now()}`,
          first_name: 'No',
          last_name: 'Structure',
          email: `nostruct-${Date.now()}@test.com`,
          phone: '9876543211',
          date_of_birth: '1990-01-01',
          gender: 'female',
          status: 'active',
          department_id: null,
          designation_id: null,
          date_of_joining: new Date(),
        })
        .returning('*');

      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      await expect(
        service.calculateSalary(newEmployee.id, month, year)
      ).rejects.toThrow('No salary structure found');

      // Cleanup
      await knex('employees').where({ id: newEmployee.id }).delete();
    });
  });

  describe('Salary calculation formulas', () => {
    it('should calculate earnings based on paid days', async () => {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      const result = await service.calculateSalary(employeeId, month, year);

      // Verify earnings are calculated
      const baseSalaryEarning = result.earnings.find(
        (e) => e.name === 'Base Salary'
      );
      expect(baseSalaryEarning).toBeDefined();
      expect(baseSalaryEarning?.amount).toBeGreaterThan(0);
    });

    it('should include all salary components in gross pay', async () => {
      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      const result = await service.calculateSalary(employeeId, month, year);

      const totalEarnings = result.earnings.reduce((sum, e) => sum + e.amount, 0);
      expect(result.gross_pay).toBeCloseTo(totalEarnings, 2);
    });
  });
});
