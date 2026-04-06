import { Knex } from 'knex';
import { PFContribution, PFAccount, CreatePFContributionDTO } from '../types/benefits';
import { v4 as uuidv4 } from 'uuid';

export class PFRepository {
  constructor(private knex: Knex) {}

  async createPFAccount(employeeId: string, pfAccountNumber: string): Promise<PFAccount> {
    const id = uuidv4();

    const [account] = await this.knex('pf_accounts')
      .insert({
        id,
        employee_id: employeeId,
        pf_account_number: pfAccountNumber,
        opening_balance: 0,
        current_balance: 0,
        total_contributions: 0,
        is_active: true,
      })
      .returning('*');

    return this.mapToPFAccount(account);
  }

  async getPFAccount(employeeId: string): Promise<PFAccount | null> {
    const account = await this.knex('pf_accounts')
      .where('employee_id', employeeId)
      .first();

    return account ? this.mapToPFAccount(account) : null;
  }

  async getPFAccountByNumber(pfAccountNumber: string): Promise<PFAccount | null> {
    const account = await this.knex('pf_accounts')
      .where('pf_account_number', pfAccountNumber)
      .first();

    return account ? this.mapToPFAccount(account) : null;
  }

  async recordPFContribution(data: CreatePFContributionDTO): Promise<PFContribution> {
    const id = uuidv4();
    const employeeContribution = (data.basic_salary * data.employee_contribution_rate) / 100;
    const employerContribution = (data.basic_salary * data.employer_contribution_rate) / 100;
    const totalContribution = employeeContribution + employerContribution;

    // Wrap PF increment + update in transaction to prevent out-of-sync balances
    const contribution = await this.knex.transaction(async (trx) => {
      const [newContribution] = await trx('pf_contributions')
        .insert({
          id,
          employee_id: data.employee_id,
          month: data.month,
          year: data.year,
          basic_salary: data.basic_salary,
          employee_contribution: employeeContribution,
          employer_contribution: employerContribution,
          total_contribution: totalContribution,
          employee_contribution_rate: data.employee_contribution_rate,
          employer_contribution_rate: data.employer_contribution_rate,
        })
        .returning('*');

      // Update PF account balance
      await trx('pf_accounts')
        .where('employee_id', data.employee_id)
        .increment('current_balance', totalContribution)
        .increment('total_contributions', totalContribution)
        .update({
          last_contribution_date: this.knex.fn.now(),
          updated_at: this.knex.fn.now(),
        });

      return newContribution;
    });

    return this.mapToPFContribution(contribution);
  }

  async getPFContribution(
    employeeId: string,
    month: number,
    year: number
  ): Promise<PFContribution | null> {
    const contribution = await this.knex('pf_contributions')
      .where({
        employee_id: employeeId,
        month,
        year,
      })
      .first();

    return contribution ? this.mapToPFContribution(contribution) : null;
  }

  async getPFContributionsByEmployee(employeeId: string): Promise<PFContribution[]> {
    const contributions = await this.knex('pf_contributions')
      .where('employee_id', employeeId)
      .orderBy('year', 'desc')
      .orderBy('month', 'desc');

    return contributions.map((c) => this.mapToPFContribution(c));
  }

  async getPFContributionsByPeriod(
    employeeId: string,
    fromMonth: number,
    fromYear: number,
    toMonth: number,
    toYear: number
  ): Promise<PFContribution[]> {
    const contributions = await this.knex('pf_contributions')
      .where('employee_id', employeeId)
      .where((q) => {
        q.where((q2) => {
          q2.where('year', '>', fromYear).orWhere((q3) => {
            q3.where('year', fromYear).andWhere('month', '>=', fromMonth);
          });
        }).andWhere((q2) => {
          q2.where('year', '<', toYear).orWhere((q3) => {
            q3.where('year', toYear).andWhere('month', '<=', toMonth);
          });
        });
      })
      .orderBy('year', 'asc')
      .orderBy('month', 'asc');

    return contributions.map((c) => this.mapToPFContribution(c));
  }

  async updatePFAccountBalance(employeeId: string, amount: number): Promise<PFAccount> {
    const [account] = await this.knex('pf_accounts')
      .where('employee_id', employeeId)
      .update({
        current_balance: this.knex.raw('current_balance + ?', [amount]),
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.mapToPFAccount(account);
  }

  async getTotalPFContribution(employeeId: string): Promise<number> {
    const result = await this.knex('pf_contributions')
      .where('employee_id', employeeId)
      .sum('total_contribution as total')
      .first();

    return parseFloat(result?.['total'] || 0);
  }

  private mapToPFAccount(row: any): PFAccount {
    return {
      id: row.id,
      employee_id: row.employee_id,
      pf_account_number: row.pf_account_number,
      opening_balance: parseFloat(row.opening_balance),
      current_balance: parseFloat(row.current_balance),
      total_contributions: parseFloat(row.total_contributions),
      last_contribution_date: row.last_contribution_date ? new Date(row.last_contribution_date) : (undefined as any),
      is_active: row.is_active,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  private mapToPFContribution(row: any): PFContribution {
    return {
      id: row.id,
      employee_id: row.employee_id,
      month: row.month,
      year: row.year,
      basic_salary: parseFloat(row.basic_salary),
      employee_contribution: parseFloat(row.employee_contribution),
      employer_contribution: parseFloat(row.employer_contribution),
      total_contribution: parseFloat(row.total_contribution),
      employee_contribution_rate: parseFloat(row.employee_contribution_rate),
      employer_contribution_rate: parseFloat(row.employer_contribution_rate),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
