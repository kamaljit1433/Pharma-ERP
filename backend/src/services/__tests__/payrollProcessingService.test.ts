import { Knex } from 'knex';
import { PayrollProcessingService } from '../payrollProcessingService';

describe('PayrollProcessingService', () => {
  let service: PayrollProcessingService;
  let knex: Knex;
  let employeeId: string;

  beforeAll(async () => {
    knex = require('../../config/knex').default;
    service = new PayrollProcessingService(knex);
  });

  beforeEach(async () => {
    // Create test employee
    const [employee] = await knex('employees')
      .insert({
        employee_id: `EMP-PROC-${Date.now()}`,
        first_name: 'Test',
        last_name: 'Employee',
        email: `test-proc-${Date.now()}@test.com`,
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

  describe('processMonthlyPayroll', () => {
    it('should process monthly payroll for all active employees', async () => {
      const month = 1;
      const year = 2024;

      const result = await service.processMonthlyPayroll(
        month,
        year,
        employeeId
      );

      expect(result).toBeDefined();
      expect(result.month).toBe(month);
      expect(result.year).toBe(year);
      expect(result.total_employees).toBeGreaterThan(0);
      expect(result.processed_count).toBeGreaterThan(0);
      expect(result.total_gross_salary).toBeGreaterThan(0);
    });

    it('should reject invalid month', async () => {
      await expect(
        service.processMonthlyPayroll(13, 2024, employeeId)
      ).rejects.toThrow('Invalid month');
    });

    it('should reject invalid year', async () => {
      await expect(
        service.processMonthlyPayroll(1, 1999, employeeId)
      ).rejects.toThrow('Invalid year');
    });

    it('should create payroll records for each employee', async () => {
      const month = 2;
      const year = 2024;

      await service.processMonthlyPayroll(month, year, employeeId);

      const payroll = await knex('payroll')
        .where({
          employee_id: employeeId,
          month,
          year,
        })
        .first();

      expect(payroll).toBeDefined();
      expect(payroll.status).toBe('processed');
    });
  });

  describe('lockPayroll', () => {
    it('should lock a processed payroll', async () => {
      // Create payroll
      const [payroll] = await knex('payroll')
        .insert({
          employee_id: employeeId,
          month: 1,
          year: 2024,
          gross_salary: 50000,
          net_salary: 45000,
          total_deductions: 5000,
          total_earnings: 50000,
          status: 'processed',
        })
        .returning('*');

      await service.lockPayroll(payroll.id, employeeId);

      const updated = await knex('payroll')
        .where({ id: payroll.id })
        .first();

      expect(updated.status).toBe('locked');
    });

    it('should reject locking already locked payroll', async () => {
      // Create locked payroll
      const [payroll] = await knex('payroll')
        .insert({
          employee_id: employeeId,
          month: 1,
          year: 2024,
          gross_salary: 50000,
          net_salary: 45000,
          total_deductions: 5000,
          total_earnings: 50000,
          status: 'locked',
        })
        .returning('*');

      await expect(
        service.lockPayroll(payroll.id, employeeId)
      ).rejects.toThrow('Payroll is already locked');
    });

    it('should reject locking draft payroll', async () => {
      // Create draft payroll
      const [payroll] = await knex('payroll')
        .insert({
          employee_id: employeeId,
          month: 1,
          year: 2024,
          gross_salary: 50000,
          net_salary: 45000,
          total_deductions: 5000,
          total_earnings: 50000,
          status: 'draft',
        })
        .returning('*');

      await expect(
        service.lockPayroll(payroll.id, employeeId)
      ).rejects.toThrow('Only processed payroll can be locked');
    });
  });

  describe('markPayrollAsPaid', () => {
    it('should mark payroll as paid', async () => {
      // Create processed payroll
      const [payroll] = await knex('payroll')
        .insert({
          employee_id: employeeId,
          month: 1,
          year: 2024,
          gross_salary: 50000,
          net_salary: 45000,
          total_deductions: 5000,
          total_earnings: 50000,
          status: 'processed',
        })
        .returning('*');

      await service.markPayrollAsPaid(payroll.id, employeeId);

      const updated = await knex('payroll')
        .where({ id: payroll.id })
        .first();

      expect(updated.status).toBe('paid');
      expect(updated.paid_at).toBeDefined();
    });

    it('should reject marking already paid payroll', async () => {
      // Create paid payroll
      const [payroll] = await knex('payroll')
        .insert({
          employee_id: employeeId,
          month: 1,
          year: 2024,
          gross_salary: 50000,
          net_salary: 45000,
          total_deductions: 5000,
          total_earnings: 50000,
          status: 'paid',
        })
        .returning('*');

      await expect(
        service.markPayrollAsPaid(payroll.id, employeeId)
      ).rejects.toThrow('Payroll is already marked as paid');
    });
  });

  describe('getPayrollSummary', () => {
    it('should get payroll summary for a month', async () => {
      const month = 1;
      const year = 2024;

      // Create payroll
      await knex('payroll').insert({
        employee_id: employeeId,
        month,
        year,
        gross_salary: 50000,
        net_salary: 45000,
        total_deductions: 5000,
        total_earnings: 50000,
        status: 'processed',
      });

      const result = await service.getPayrollSummary(month, year);

      expect(result).toBeDefined();
      expect(result.month).toBe(month);
      expect(result.year).toBe(year);
      expect(result.total_employees).toBeGreaterThan(0);
      expect(result.total_gross_salary).toBeGreaterThan(0);
    });
  });

  describe('exportBankFile', () => {
    it('should export payroll as CSV', async () => {
      const month = 1;
      const year = 2024;

      // Create payroll
      await knex('payroll').insert({
        employee_id: employeeId,
        month,
        year,
        gross_salary: 50000,
        net_salary: 45000,
        total_deductions: 5000,
        total_earnings: 50000,
        status: 'processed',
      });

      const buffer = await service.exportBankFile(month, year, 'CSV');

      expect(buffer).toBeDefined();
      expect(buffer.length).toBeGreaterThan(0);
      expect(buffer.toString()).toContain('Employee ID');
    });

    it('should export payroll as NEFT', async () => {
      const month = 1;
      const year = 2024;

      // Create payroll
      await knex('payroll').insert({
        employee_id: employeeId,
        month,
        year,
        gross_salary: 50000,
        net_salary: 45000,
        total_deductions: 5000,
        total_earnings: 50000,
        status: 'processed',
      });

      const buffer = await service.exportBankFile(month, year, 'NEFT');

      expect(buffer).toBeDefined();
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should reject export if no payroll found', async () => {
      await expect(
        service.exportBankFile(12, 2025, 'CSV')
      ).rejects.toThrow('No payroll records found');
    });
  });
});
