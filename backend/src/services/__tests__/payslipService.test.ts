import { Knex } from 'knex';
import { PayslipService } from '../payslipService';

describe('PayslipService', () => {
  let service: PayslipService;
  let knex: Knex;
  let employeeId: string;
  let payrollId: string;

  beforeAll(async () => {
    knex = require('../../config/knex').default;
    service = new PayslipService(knex);
  });

  beforeEach(async () => {
    // Create test employee
    const [employee] = await knex('employees')
      .insert({
        employee_id: `EMP-PAYSLIP-${Date.now()}`,
        first_name: 'Test',
        last_name: 'Employee',
        email: `test-payslip-${Date.now()}@test.com`,
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

    payrollId = payroll.id;
  });

  afterEach(async () => {
    // Cleanup
    await knex('employees').where({ id: employeeId }).delete();
  });

  afterAll(async () => {
    await knex.destroy();
  });

  describe('generatePayslip', () => {
    it('should generate a payslip for processed payroll', async () => {
      const result = await service.generatePayslip(
        payrollId,
        employeeId,
        1,
        2024
      );

      expect(result).toBeDefined();
      expect(result.payroll_id).toBe(payrollId);
      expect(result.employee_id).toBe(employeeId);
      expect(result.month).toBe(1);
      expect(result.year).toBe(2024);
      expect(result.gross_salary).toBe(50000);
      expect(result.net_salary).toBe(45000);
      expect(result.payslip_number).toBeDefined();
    });

    it('should generate unique payslip numbers', async () => {
      const payslip1 = await service.generatePayslip(
        payrollId,
        employeeId,
        1,
        2024
      );

      // Create another payroll for different month
      const [payroll2] = await knex('payroll')
        .insert({
          employee_id: employeeId,
          month: 2,
          year: 2024,
          gross_salary: 50000,
          net_salary: 45000,
          total_deductions: 5000,
          total_earnings: 50000,
          status: 'processed',
        })
        .returning('*');

      const payslip2 = await service.generatePayslip(
        payroll2.id,
        employeeId,
        2,
        2024
      );

      expect(payslip1.payslip_number).not.toBe(payslip2.payslip_number);
    });

    it('should return existing payslip if already generated', async () => {
      const payslip1 = await service.generatePayslip(
        payrollId,
        employeeId,
        1,
        2024
      );

      const payslip2 = await service.generatePayslip(
        payrollId,
        employeeId,
        1,
        2024
      );

      expect(payslip1.id).toBe(payslip2.id);
      expect(payslip1.payslip_number).toBe(payslip2.payslip_number);
    });

    it('should reject if payroll not found', async () => {
      await expect(
        service.generatePayslip('non-existent-id', employeeId, 1, 2024)
      ).rejects.toThrow('Payroll record with ID non-existent-id not found');
    });

    it('should reject if payroll does not belong to employee', async () => {
      // Create another employee
      const [otherEmployee] = await knex('employees')
        .insert({
          employee_id: `EMP-OTHER-${Date.now()}`,
          first_name: 'Other',
          last_name: 'Employee',
          email: `other-${Date.now()}@test.com`,
          phone: '9876543211',
          date_of_birth: '1990-01-01',
          gender: 'female',
          status: 'active',
          department_id: null,
          designation_id: null,
          date_of_joining: new Date(),
        })
        .returning('*');

      await expect(
        service.generatePayslip(payrollId, otherEmployee.id, 1, 2024)
      ).rejects.toThrow('Payroll does not belong to the specified employee');

      // Cleanup
      await knex('employees').where({ id: otherEmployee.id }).delete();
    });
  });

  describe('getPayslip', () => {
    it('should retrieve a payslip by ID', async () => {
      const generated = await service.generatePayslip(
        payrollId,
        employeeId,
        1,
        2024
      );

      const result = await service.getPayslip(generated.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(generated.id);
      expect(result?.payslip_number).toBe(generated.payslip_number);
    });

    it('should return null if payslip not found', async () => {
      const result = await service.getPayslip('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('getPayslipsByEmployee', () => {
    it('should retrieve all payslips for an employee', async () => {
      // Generate payslip for month 1
      await service.generatePayslip(payrollId, employeeId, 1, 2024);

      // Create and generate payslip for month 2
      const [payroll2] = await knex('payroll')
        .insert({
          employee_id: employeeId,
          month: 2,
          year: 2024,
          gross_salary: 50000,
          net_salary: 45000,
          total_deductions: 5000,
          total_earnings: 50000,
          status: 'processed',
        })
        .returning('*');

      await service.generatePayslip(payroll2.id, employeeId, 2, 2024);

      const result = await service.getPayslipsByEmployee(employeeId);

      expect(result.length).toBe(2);
      expect(result[0]!.employee_id).toBe(employeeId);
      expect(result[1]!.employee_id).toBe(employeeId);
    });
  });

  describe('getPayslipByEmployeeAndMonth', () => {
    it('should retrieve payslip for specific employee and month', async () => {
      const generated = await service.generatePayslip(
        payrollId,
        employeeId,
        1,
        2024
      );

      const result = await service.getPayslipByEmployeeAndMonth(
        employeeId,
        1,
        2024
      );

      expect(result).toBeDefined();
      expect(result?.id).toBe(generated.id);
      expect(result?.month).toBe(1);
      expect(result?.year).toBe(2024);
    });

    it('should return null if payslip not found for month', async () => {
      const result = await service.getPayslipByEmployeeAndMonth(
        employeeId,
        12,
        2024
      );

      expect(result).toBeNull();
    });
  });
});
