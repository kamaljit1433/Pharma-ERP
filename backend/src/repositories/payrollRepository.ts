import { Knex } from 'knex';
import { Payroll } from '../types/payroll';

export class PayrollRepository {
  constructor(private knex: Knex) {}

  async createPayroll(data: {
    employee_id: string;
    month: number;
    year: number;
    gross_salary: number;
    net_salary: number;
    total_deductions: number;
    total_earnings: number;
  }): Promise<Payroll> {
    const [payroll] = await this.knex('payroll')
      .insert({
        ...data,
        status: 'draft',
      })
      .returning('*');

    return this.mapToPayroll(payroll);
  }

  async getPayrollById(id: string): Promise<Payroll | null> {
    const payroll = await this.knex('payroll').where({ id }).first();
    return payroll ? this.mapToPayroll(payroll) : null;
  }

  async getPayrollByEmployeeAndMonth(
    employeeId: string,
    month: number,
    year: number
  ): Promise<Payroll | null> {
    const payroll = await this.knex('payroll')
      .where({ employee_id: employeeId, month, year })
      .first();

    return payroll ? this.mapToPayroll(payroll) : null;
  }

  async getPayrollsByMonth(month: number, year: number): Promise<Payroll[]> {
    const payrolls = await this.knex('payroll')
      .where({ month, year })
      .orderBy('created_at', 'desc');

    return payrolls.map((p) => this.mapToPayroll(p));
  }

  async getPayrollsByEmployee(employeeId: string): Promise<Payroll[]> {
    const payrolls = await this.knex('payroll')
      .where({ employee_id: employeeId })
      .orderBy('year', 'desc')
      .orderBy('month', 'desc');

    return payrolls.map((p) => this.mapToPayroll(p));
  }

  async updatePayrollStatus(
    id: string,
    status: 'draft' | 'processed' | 'paid' | 'locked',
    processedBy?: string
  ): Promise<Payroll> {
    const updateData: any = {
      status,
      updated_at: this.knex.fn.now(),
    };

    if (status === 'processed' && processedBy) {
      updateData.processed_by = processedBy;
      updateData.processed_at = this.knex.fn.now();
    }

    if (status === 'paid') {
      updateData.paid_at = this.knex.fn.now();
    }

    const [updated] = await this.knex('payroll')
      .where({ id })
      .update(updateData)
      .returning('*');

    return this.mapToPayroll(updated);
  }

  async updatePayroll(
    id: string,
    data: Partial<{
      gross_salary: number;
      net_salary: number;
      total_deductions: number;
      total_earnings: number;
    }>
  ): Promise<Payroll> {
    const [updated] = await this.knex('payroll')
      .where({ id })
      .update({
        ...data,
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.mapToPayroll(updated);
  }

  async lockPayroll(id: string): Promise<Payroll> {
    const [updated] = await this.knex('payroll')
      .where({ id })
      .update({
        status: 'locked',
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.mapToPayroll(updated);
  }

  async getPayrollSummary(month: number, year: number) {
    const result = await this.knex('payroll')
      .where({ month, year })
      .select(
        this.knex.raw('COUNT(*) as total_employees'),
        this.knex.raw('SUM(gross_salary) as total_gross_salary'),
        this.knex.raw('SUM(total_deductions) as total_deductions'),
        this.knex.raw('SUM(net_salary) as total_net_salary'),
        this.knex.raw("COUNT(CASE WHEN status = 'processed' THEN 1 END) as processed_count"),
        this.knex.raw("COUNT(CASE WHEN status = 'draft' THEN 1 END) as pending_count")
      )
      .first();

    return {
      total_employees: parseInt(result.total_employees) || 0,
      total_gross_salary: parseFloat(result.total_gross_salary) || 0,
      total_deductions: parseFloat(result.total_deductions) || 0,
      total_net_salary: parseFloat(result.total_net_salary) || 0,
      processed_count: parseInt(result.processed_count) || 0,
      pending_count: parseInt(result.pending_count) || 0,
      month,
      year,
    };
  }

  private mapToPayroll(row: any): Payroll {
    return {
      id: row.id,
      employee_id: row.employee_id,
      month: row.month,
      year: row.year,
      gross_salary: parseFloat(row.gross_salary),
      net_salary: parseFloat(row.net_salary),
      total_deductions: parseFloat(row.total_deductions),
      total_earnings: parseFloat(row.total_earnings),
      status: row.status,
      processed_by: row.processed_by,
      processed_at: row.processed_at ? new Date(row.processed_at) : (undefined as any),
      paid_at: row.paid_at ? new Date(row.paid_at) : (undefined as any),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
