import { Knex } from 'knex';
import { resolveEmployeeUUID } from '../utils/resolveEmployeeId';

export interface PFAccount {
  id: string;
  employee_id: string;
  pf_number: string;
  employee_contribution_rate: number;
  employer_contribution_rate: number;
  account_status: string;
  current_balance: number;
  created_at: Date;
  updated_at: Date;
}

export interface PFContribution {
  id: string;
  pf_account_id: string;
  month: number;
  year: number;
  basic_salary: number;
  employee_contribution: number;
  employer_contribution: number;
  total_contribution: number;
  created_at: Date;
}

export interface CreatePFAccountInput {
  employee_id: string;
  pf_number: string;
  employee_contribution_rate: number;
  employer_contribution_rate: number;
  account_status?: string;
}

export interface UpdatePFAccountInput {
  pf_number?: string;
  employee_contribution_rate?: number;
  employer_contribution_rate?: number;
  account_status?: string;
}

export interface CreateContributionInput {
  month: number;
  year: number;
  basic_salary: number;
  employee_contribution: number;
  employer_contribution: number;
  total_contribution: number;
}

export class PFRepository {
  constructor(private knex: Knex) {}

  async createPFAccount(data: CreatePFAccountInput): Promise<PFAccount> {
    const resolvedId = await resolveEmployeeUUID(this.knex, data.employee_id);
    if (!resolvedId) throw new Error(`Employee not found: ${data.employee_id}`);

    const [row] = await this.knex('pf_accounts')
      .insert({
        employee_id: resolvedId,
        pf_account_number: data.pf_number,
        employee_contribution_rate: data.employee_contribution_rate,
        employer_contribution_rate: data.employer_contribution_rate,
        account_status: data.account_status || 'active',
        current_balance: 0,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    return this.mapAccount(row);
  }

  async getPFAccountById(id: string): Promise<PFAccount | null> {
    const row = await this.knex('pf_accounts').where({ id }).first();
    return row ? this.mapAccount(row) : null;
  }

  async getPFAccountByEmployee(employeeId: string): Promise<PFAccount | null> {
    const resolvedId = await resolveEmployeeUUID(this.knex, employeeId);
    if (!resolvedId) return null;
    const row = await this.knex('pf_accounts')
      .where({ employee_id: resolvedId })
      .orderBy('created_at', 'desc')
      .first();
    return row ? this.mapAccount(row) : null;
  }

  // Legacy alias
  async getPFAccount(employeeId: string): Promise<PFAccount | null> {
    return this.getPFAccountByEmployee(employeeId);
  }

  async updatePFAccount(id: string, data: UpdatePFAccountInput): Promise<PFAccount> {
    const updateData: any = { updated_at: new Date() };
    if (data.pf_number !== undefined) updateData.pf_account_number = data.pf_number;
    if (data.employee_contribution_rate !== undefined) updateData.employee_contribution_rate = data.employee_contribution_rate;
    if (data.employer_contribution_rate !== undefined) updateData.employer_contribution_rate = data.employer_contribution_rate;
    if (data.account_status !== undefined) updateData.account_status = data.account_status;

    const [row] = await this.knex('pf_accounts')
      .where({ id })
      .update(updateData)
      .returning('*');

    return this.mapAccount(row);
  }

  async recordContribution(pfAccountId: string, data: CreateContributionInput): Promise<PFContribution> {
    const [row] = await this.knex('pf_contributions')
      .insert({
        pf_account_id: pfAccountId,
        month: data.month,
        year: data.year,
        basic_salary: data.basic_salary,
        employee_contribution: data.employee_contribution,
        employer_contribution: data.employer_contribution,
        total_contribution: data.total_contribution,
        created_at: new Date(),
      })
      .returning('*');

    await this.knex('pf_accounts')
      .where({ id: pfAccountId })
      .update({
        current_balance: this.knex.raw('current_balance + ?', [data.total_contribution]),
        updated_at: new Date(),
      });

    return this.mapContribution(row);
  }

  async getContributions(pfAccountId: string): Promise<PFContribution[]> {
    const rows = await this.knex('pf_contributions')
      .where({ pf_account_id: pfAccountId })
      .orderBy('year', 'desc')
      .orderBy('month', 'desc');
    return rows.map((r: any) => this.mapContribution(r));
  }

  async getBalance(pfAccountId: string): Promise<number> {
    const row = await this.knex('pf_accounts').where({ id: pfAccountId }).first();
    return row ? parseFloat(row.current_balance) : 0;
  }

  async deletePFAccount(id: string): Promise<void> {
    await this.knex('pf_contributions').where({ pf_account_id: id }).delete();
    await this.knex('pf_accounts').where({ id }).delete();
  }

  async recordPFContribution(data: {
    employee_id: string;
    month: number;
    year: number;
    basic_salary: number;
    employee_contribution_rate: number;
    employer_contribution_rate: number;
  }): Promise<PFContribution> {
    const account = await this.getPFAccountByEmployee(data.employee_id);
    if (!account) throw new Error('PF account not found for employee');
    const emp = (data.employee_contribution_rate / 100) * data.basic_salary;
    const emr = (data.employer_contribution_rate / 100) * data.basic_salary;
    return this.recordContribution(account.id, {
      month: data.month,
      year: data.year,
      basic_salary: data.basic_salary,
      employee_contribution: emp,
      employer_contribution: emr,
      total_contribution: emp + emr,
    });
  }

  async getPFContributionsByEmployee(employeeId: string): Promise<PFContribution[]> {
    const account = await this.getPFAccountByEmployee(employeeId);
    if (!account) return [];
    return this.getContributions(account.id);
  }

  async getTotalPFContribution(employeeId: string): Promise<number> {
    const account = await this.getPFAccountByEmployee(employeeId);
    if (!account) return 0;
    return this.getBalance(account.id);
  }

  private mapAccount(row: any): PFAccount {
    return {
      id: row.id,
      employee_id: row.employee_id,
      pf_number: row.pf_account_number,
      employee_contribution_rate: parseFloat(row.employee_contribution_rate),
      employer_contribution_rate: parseFloat(row.employer_contribution_rate),
      account_status: row.account_status,
      current_balance: parseFloat(row.current_balance),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  private mapContribution(row: any): PFContribution {
    return {
      id: row.id,
      pf_account_id: row.pf_account_id,
      month: row.month,
      year: row.year,
      basic_salary: parseFloat(row.basic_salary ?? 0),
      employee_contribution: parseFloat(row.employee_contribution),
      employer_contribution: parseFloat(row.employer_contribution),
      total_contribution: parseFloat(row.total_contribution),
      created_at: new Date(row.created_at),
    };
  }
}
