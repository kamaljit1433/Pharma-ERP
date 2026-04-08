import { Knex } from 'knex';
import { Payroll, CreatePayrollDTO, UpdatePayrollDTO } from '../types/payroll';

export class PayrollRepository {
  constructor(private knex: Knex) {}

  async createPayroll(data: CreatePayrollDTO): Promise<Payroll> {
    const [payroll] = await this.knex('payroll')
      .insert({
        total_earnings: data.gross_salary,
        total_deductions: 0,
        ...data,
        status: data.status ?? 'draft',
      })
      .returning('*');

    return this.mapToPayroll(payroll);
  }

  async getPayroll(id: string): Promise<Payroll | null> {
    return this.getPayrollById(id);
  }

  async getPayrollById(id: string): Promise<Payroll | null> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) return null;
    const payroll = await this.knex('payroll').where({ id }).first();
    return payroll ? this.mapToPayroll(payroll) : null;
  }

  async getEmployeePayroll(
    employeeId: string,
    month: number,
    year: number
  ): Promise<Payroll | null> {
    const payroll = await this.knex('payroll')
      .where({ employee_id: employeeId, month, year })
      .first();

    return payroll ? this.mapToPayroll(payroll) : null;
  }

  async getPayrollByEmployeeAndMonth(
    employeeId: string,
    month: number,
    year: number
  ): Promise<Payroll | null> {
    return this.getEmployeePayroll(employeeId, month, year);
  }

  async getEmployeePayrollHistory(employeeId: string, year?: number): Promise<Payroll[]> {
    const query = this.knex('payroll')
      .where({ employee_id: employeeId })
      .orderBy('year', 'desc')
      .orderBy('month', 'desc');

    if (year !== undefined) {
      query.andWhere({ year });
    }

    const payrolls = await query;
    return payrolls.map((p) => this.mapToPayroll(p));
  }

  async getMonthlyPayroll(month: number, year: number): Promise<Payroll[]> {
    const payrolls = await this.knex('payroll')
      .where({ month, year })
      .orderBy('created_at', 'desc');

    return payrolls.map((p) => this.mapToPayroll(p));
  }

  async getPayrollsByMonth(month: number, year: number): Promise<Payroll[]> {
    return this.getMonthlyPayroll(month, year);
  }

  async getPayrollsByEmployee(employeeId: string): Promise<Payroll[]> {
    return this.getEmployeePayrollHistory(employeeId);
  }

  async getPayrollByStatus(
    status: 'draft' | 'processed' | 'paid' | 'locked',
    month?: number,
    year?: number
  ): Promise<Payroll[]> {
    const query = this.knex('payroll').where({ status });

    if (month !== undefined) query.andWhere({ month });
    if (year !== undefined) query.andWhere({ year });

    const payrolls = await query.orderBy('created_at', 'desc');
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

  async updatePayroll(id: string, data: UpdatePayrollDTO): Promise<Payroll> {
    const { processed_date, ...rest } = data;
    const updateData: any = {
      ...rest,
      updated_at: this.knex.fn.now(),
    };

    if (processed_date) {
      updateData.processed_at = processed_date;
    }

    const [updated] = await this.knex('payroll')
      .where({ id })
      .update(updateData)
      .returning('*');

    if (!updated) {
      throw new Error(`Payroll with id ${id} not found`);
    }

    return this.mapToPayroll(updated);
  }

  async lockPayroll(id: string): Promise<Payroll> {
    const [updated] = await this.knex('payroll')
      .where({ id })
      .update({
        status: 'locked',
        is_locked: true,
        locked_at: this.knex.fn.now(),
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.mapToPayroll(updated);
  }

  async unlockPayroll(id: string): Promise<Payroll> {
    const [updated] = await this.knex('payroll')
      .where({ id })
      .update({
        status: 'processed',
        is_locked: false,
        locked_at: null,
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.mapToPayroll(updated);
  }

  async getPayrollCount(month: number, year: number, status?: string): Promise<number> {
    const query = this.knex('payroll').where({ month, year });
    if (status) query.andWhere({ status });

    const result = await query.count('* as count').first();
    return parseInt(String(result?.['count'] ?? 0), 10);
  }

  async getTotalPayrollAmount(month: number, year: number): Promise<number> {
    const result = await this.knex('payroll')
      .where({ month, year })
      .sum('net_salary as total')
      .first();

    return parseFloat(String(result?.['total'] ?? 0));
  }

  async deletePayroll(id: string): Promise<void> {
    await this.knex('payroll').where({ id }).del();
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
    const payroll: Payroll = {
      id: row.id,
      employee_id: row.employee_id,
      month: row.month,
      year: row.year,
      gross_salary: parseFloat(row.gross_salary),
      net_salary: parseFloat(row.net_salary),
      status: row.status,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };

    if (row.basic_salary != null) payroll.basic_salary = parseFloat(row.basic_salary);
    if (row.total_deductions != null) payroll.total_deductions = parseFloat(row.total_deductions);
    if (row.total_earnings != null) payroll.total_earnings = parseFloat(row.total_earnings);
    if (row.pf_deduction != null) payroll.pf_deduction = parseFloat(row.pf_deduction);
    if (row.esi_deduction != null) payroll.esi_deduction = parseFloat(row.esi_deduction);
    if (row.tds_deduction != null) payroll.tds_deduction = parseFloat(row.tds_deduction);
    if (row.processed_by) payroll.processed_by = row.processed_by;
    if (row.processed_at) {
      payroll.processed_at = new Date(row.processed_at);
      payroll.processed_date = payroll.processed_at;
    }
    if (row.paid_at) payroll.paid_at = new Date(row.paid_at);
    if (row.is_locked != null) payroll.is_locked = Boolean(row.is_locked);
    if (row.locked_at) payroll.locked_at = new Date(row.locked_at);

    return payroll;
  }
}
