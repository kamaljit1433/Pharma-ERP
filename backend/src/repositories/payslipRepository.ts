import { Knex } from 'knex';
import { Payslip } from '../types/payroll';

export class PayslipRepository {
  constructor(private knex: Knex) {}

  async createPayslip(data: {
    payroll_id: string;
    employee_id: string;
    month: number;
    year: number;
    payslip_number: string;
    file_url?: string;
    earnings?: Record<string, number>;
    deductions?: Record<string, number>;
    gross_salary: number;
    net_salary: number;
  }): Promise<Payslip> {
    const [payslip] = await this.knex('payslips')
      .insert({
        ...data,
        generated_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.mapToPayslip(payslip);
  }

  async getPayslipById(id: string): Promise<Payslip | null> {
    const payslip = await this.knex('payslips').where({ id }).first();
    return payslip ? this.mapToPayslip(payslip) : null;
  }

  async getPayslipByNumber(payslipNumber: string): Promise<Payslip | null> {
    const payslip = await this.knex('payslips')
      .where({ payslip_number: payslipNumber })
      .first();

    return payslip ? this.mapToPayslip(payslip) : null;
  }

  async getPayslipsByEmployee(employeeId: string): Promise<Payslip[]> {
    const payslips = await this.knex('payslips')
      .where({ employee_id: employeeId })
      .orderBy('year', 'desc')
      .orderBy('month', 'desc');

    return payslips.map((p) => this.mapToPayslip(p));
  }

  async getPayslipsByMonth(
    month: number,
    year: number
  ): Promise<Payslip[]> {
    const payslips = await this.knex('payslips')
      .where({ month, year })
      .orderBy('created_at', 'desc');

    return payslips.map((p) => this.mapToPayslip(p));
  }

  async getPayslipByEmployeeAndMonth(
    employeeId: string,
    month: number,
    year: number
  ): Promise<Payslip | null> {
    const payslip = await this.knex('payslips')
      .where({ employee_id: employeeId, month, year })
      .first();

    return payslip ? this.mapToPayslip(payslip) : null;
  }

  async updatePayslipFileUrl(id: string, fileUrl: string): Promise<Payslip> {
    const [updated] = await this.knex('payslips')
      .where({ id })
      .update({ file_url: fileUrl })
      .returning('*');

    return this.mapToPayslip(updated);
  }

  private mapToPayslip(row: any): Payslip {
    return {
      id: row.id,
      payroll_id: row.payroll_id,
      employee_id: row.employee_id,
      month: row.month,
      year: row.year,
      payslip_number: row.payslip_number,
      file_url: row.file_url,
      earnings: row.earnings || {},
      deductions: row.deductions || {},
      gross_salary: parseFloat(row.gross_salary),
      net_salary: parseFloat(row.net_salary),
      generated_at: new Date(row.generated_at),
      created_at: new Date(row.created_at),
    };
  }
}
