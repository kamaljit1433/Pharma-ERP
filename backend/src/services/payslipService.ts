import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import { PayslipRepository } from '../repositories/payslipRepository';
import { PayrollRepository } from '../repositories/payrollRepository';
import { Payslip, SalaryComponent } from '../types/payroll';

export class PayslipService {
  private payslipRepository: PayslipRepository;
  private payrollRepository: PayrollRepository;

  constructor(private knex: Knex) {
    this.payslipRepository = new PayslipRepository(knex);
    this.payrollRepository = new PayrollRepository(knex);
  }

  async generatePayslip(
    payrollId: string,
    employeeId: string,
    month: number,
    year: number,
    earningsComponents?: SalaryComponent[],
    deductionsComponents?: SalaryComponent[]
  ): Promise<Payslip> {
    // Get payroll record
    const payroll = await this.payrollRepository.getPayrollById(payrollId);

    if (!payroll) {
      throw new Error(`Payroll record with ID ${payrollId} not found`);
    }

    if (payroll.employee_id !== employeeId) {
      throw new Error('Payroll does not belong to the specified employee');
    }

    // Get employee details
    const employee = await this.knex('employees')
      .where({ id: employeeId })
      .first();

    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    // Generate payslip number
    const payslipNumber = this.generatePayslipNumber(
      employee.employee_id,
      month,
      year
    );

    // Check if payslip already exists — update it with fresh values rather than returning stale data
    const existingPayslip =
      await this.payslipRepository.getPayslipByEmployeeAndMonth(
        employeeId,
        month,
        year
      );

    if (existingPayslip) {
      return this.payslipRepository.updatePayslip(existingPayslip.id, {
        earnings: this.extractEarnings(payroll, earningsComponents),
        deductions: this.extractDeductions({ total_deductions: payroll.total_deductions || 0 }, deductionsComponents),
        gross_salary: payroll.gross_salary,
        net_salary: payroll.net_salary,
      });
    }

    // Create payslip — use component arrays if provided, otherwise fall back to totals
    const payslip = await this.payslipRepository.createPayslip({
      payroll_id: payrollId,
      employee_id: employeeId,
      month,
      year,
      payslip_number: payslipNumber,
      earnings: this.extractEarnings(payroll, earningsComponents),
      deductions: this.extractDeductions({ total_deductions: payroll.total_deductions || 0 }, deductionsComponents),
      gross_salary: payroll.gross_salary,
      net_salary: payroll.net_salary,
    });

    return payslip;
  }

  async getPayslip(id: string): Promise<Payslip | null> {
    return this.payslipRepository.getPayslipById(id);
  }

  async getPayslipsByEmployee(employeeId: string): Promise<Payslip[]> {
    return this.payslipRepository.getPayslipsByEmployee(employeeId);
  }

  async getPayslipsByMonth(month: number, year: number): Promise<Payslip[]> {
    return this.payslipRepository.getPayslipsByMonth(month, year);
  }

  async getPayslipByEmployeeAndMonth(
    employeeId: string,
    month: number,
    year: number
  ): Promise<Payslip | null> {
    return this.payslipRepository.getPayslipByEmployeeAndMonth(
      employeeId,
      month,
      year
    );
  }

  async updatePayslipFileUrl(id: string, fileUrl: string): Promise<Payslip> {
    return this.payslipRepository.updatePayslipFileUrl(id, fileUrl);
  }

  private generatePayslipNumber(
    employeeId: string,
    month: number,
    year: number
  ): string {
    const monthStr = String(month).padStart(2, '0');
    // Use a UUID suffix to guarantee uniqueness even under concurrent generation
    return `PS-${employeeId}-${year}${monthStr}-${uuidv4().slice(0, 8).toUpperCase()}`;
  }

  private extractEarnings(
    payroll: { gross_salary: number },
    components?: SalaryComponent[]
  ): Record<string, number> {
    if (components && components.length > 0) {
      // Serialize full component breakdown so employees can verify each line item
      return components.reduce<Record<string, number>>((acc, c) => {
        acc[c.name] = c.amount;
        return acc;
      }, {});
    }

    // Fallback when component detail is unavailable
    return { gross_salary: payroll.gross_salary };
  }

  private extractDeductions(
    payroll: { total_deductions: number },
    components?: SalaryComponent[]
  ): Record<string, number> {
    if (components && components.length > 0) {
      // Serialize full component breakdown so employees can verify each deduction
      return components.reduce<Record<string, number>>((acc, c) => {
        acc[c.name] = c.amount;
        return acc;
      }, {});
    }

    // Fallback when component detail is unavailable
    return { total_deductions: payroll.total_deductions };
  }
}
