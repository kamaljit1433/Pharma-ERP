import { Knex } from 'knex';
import { Payslip, CreatePayslipDTO, UpdatePayslipDTO } from '../types/payroll';

export class PayslipRepository {
  constructor(private knex: Knex) {}

  async createPayslip(data: CreatePayslipDTO): Promise<Payslip> {
    const payslipNumber = data.payslip_number ||
      `PS-${data.employee_id.slice(0, 8)}-${data.year}${String(data.month).padStart(2, '0')}-${Date.now()}`;

    const [payslip] = await this.knex('payslips')
      .insert({
        payroll_id: data.payroll_id,
        employee_id: data.employee_id,
        month: data.month,
        year: data.year,
        payslip_number: payslipNumber,
        file_url: data.file_url || null,
        earnings: data.earnings ? JSON.stringify(data.earnings) : null,
        deductions: data.deductions ? JSON.stringify(data.deductions) : null,
        gross_salary: data.gross_salary,
        net_salary: data.net_salary,
        generated_at: this.knex.fn.now(),
        created_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.mapToPayslip(payslip);
  }

  async getPayslip(id: string): Promise<Payslip | null> {
    return this.getPayslipById(id);
  }

  async getPayslipById(id: string): Promise<Payslip | null> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) return null;
    const payslip = await this.knex('payslips').where({ id }).first();
    return payslip ? this.mapToPayslip(payslip) : null;
  }

  async getPayslipByNumber(payslipNumber: string): Promise<Payslip | null> {
    const payslip = await this.knex('payslips').where({ payslip_number: payslipNumber }).first();
    return payslip ? this.mapToPayslip(payslip) : null;
  }

  async getEmployeePayslips(employeeId: string, year?: number): Promise<Payslip[]> {
    let query = this.knex('payslips').where({ employee_id: employeeId });
    if (year !== undefined) query = query.where({ year });
    const payslips = await query.orderBy('year', 'desc').orderBy('month', 'desc');
    return payslips.map((p: any) => this.mapToPayslip(p));
  }

  async getPayslipsByEmployee(employeeId: string): Promise<Payslip[]> {
    return this.getEmployeePayslips(employeeId);
  }

  async getPayslipByMonth(employeeId: string, month: number, year: number): Promise<Payslip | null> {
    const payslip = await this.knex('payslips')
      .where({ employee_id: employeeId, month, year })
      .first();
    return payslip ? this.mapToPayslip(payslip) : null;
  }

  async getPayslipByEmployeeAndMonth(employeeId: string, month: number, year: number): Promise<Payslip | null> {
    return this.getPayslipByMonth(employeeId, month, year);
  }

  async getPayslipsByMonth(month: number, year: number): Promise<Payslip[]> {
    return this.getMonthlyPayslips(month, year);
  }

  async getMonthlyPayslips(month: number, year: number): Promise<Payslip[]> {
    const payslips = await this.knex('payslips')
      .where({ month, year })
      .orderBy('created_at', 'desc');
    return payslips.map((p: any) => this.mapToPayslip(p));
  }

  async getPayslipsByYear(employeeId: string, year: number): Promise<Payslip[]> {
    const payslips = await this.knex('payslips')
      .where({ employee_id: employeeId, year })
      .orderBy('month', 'desc');
    return payslips.map((p: any) => this.mapToPayslip(p));
  }

  async getPayslipCount(employeeId: string, year?: number): Promise<number> {
    let query = this.knex('payslips').where({ employee_id: employeeId });
    if (year !== undefined) query = query.where({ year });
    const result = await query.count('id as count').first();
    return parseInt(String(result?.['count'] || 0), 10);
  }

  async updatePayslip(id: string, data: UpdatePayslipDTO): Promise<Payslip> {
    const updateData: any = {};
    if (data.file_url !== undefined) updateData.file_url = data.file_url;
    if (data.earnings !== undefined) updateData.earnings = JSON.stringify(data.earnings);
    if (data.deductions !== undefined) updateData.deductions = JSON.stringify(data.deductions);
    if (data.gross_salary !== undefined) updateData.gross_salary = data.gross_salary;
    if (data.net_salary !== undefined) updateData.net_salary = data.net_salary;

    const [updated] = await this.knex('payslips')
      .where({ id })
      .update(updateData)
      .returning('*');

    if (!updated) throw new Error(`Payslip with ID ${id} not found`);
    return this.mapToPayslip(updated);
  }

  async updatePayslipFileUrl(id: string, fileUrl: string): Promise<Payslip> {
    return this.updatePayslip(id, { file_url: fileUrl });
  }

  async deletePayslip(id: string): Promise<void> {
    await this.knex('payslips').where({ id }).delete();
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
      earnings: row.earnings
        ? (typeof row.earnings === 'string' ? JSON.parse(row.earnings) : row.earnings)
        : {},
      deductions: row.deductions
        ? (typeof row.deductions === 'string' ? JSON.parse(row.deductions) : row.deductions)
        : {},
      gross_salary: parseFloat(row.gross_salary),
      net_salary: parseFloat(row.net_salary),
      generated_at: new Date(row.generated_at),
      created_at: new Date(row.created_at),
    };
  }
}
