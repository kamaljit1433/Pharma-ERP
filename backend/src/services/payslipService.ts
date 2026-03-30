import { Knex } from 'knex';
import { PayslipRepository } from '../repositories/payslipRepository';
import { PayrollRepository } from '../repositories/payrollRepository';
import { Payslip } from '../types/payroll';

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
    year: number
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

    // Check if payslip already exists
    const existingPayslip =
      await this.payslipRepository.getPayslipByEmployeeAndMonth(
        employeeId,
        month,
        year
      );

    if (existingPayslip) {
      return existingPayslip;
    }

    // Create payslip
    const payslip = await this.payslipRepository.createPayslip({
      payroll_id: payrollId,
      employee_id: employeeId,
      month,
      year,
      payslip_number: payslipNumber,
      earnings: this.extractEarnings(payroll),
      deductions: this.extractDeductions(payroll),
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
    return `PS-${employeeId}-${year}${monthStr}-${Date.now()}`;
  }

  private extractEarnings(payroll: any): Record<string, number> {
    const earnings: Record<string, number> = {};

    // This would be populated from the payroll calculation
    // For now, we'll calculate from gross salary and deductions
    earnings['gross_salary'] = payroll.gross_salary;

    return earnings;
  }

  private extractDeductions(payroll: any): Record<string, number> {
    const deductions: Record<string, number> = {};

    // This would be populated from the payroll calculation
    deductions['total_deductions'] = payroll.total_deductions;

    return deductions;
  }
}
