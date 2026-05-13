import { Knex } from 'knex';
import { PFRepository } from '../repositories/pfRepository';
import { EmployeeRepository } from '../repositories/employeeRepository';
import { PFContribution, PFAccount, PFStatement, CreatePFContributionDTO } from '../types/benefits';

export class PFService {
  private pfRepository: PFRepository;
  private employeeRepository: EmployeeRepository;

  constructor(knex: Knex) {
    this.pfRepository = new PFRepository(knex);
    this.employeeRepository = new EmployeeRepository(knex);
  }

  /**
   * Initialize PF account for an employee
   */
  async initializePFAccount(employeeId: string): Promise<PFAccount> {
    // Check if account already exists
    const existingAccount = await this.pfRepository.getPFAccount(employeeId);
    if (existingAccount) {
      return existingAccount as any;
    }

    const pfAccountNumber = `PF${Date.now()}${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    return this.pfRepository.createPFAccount({
      employee_id: employeeId,
      pf_number: pfAccountNumber,
      employee_contribution_rate: 12,
      employer_contribution_rate: 3.67,
    }) as any;
  }

  /**
   * Calculate and record PF contribution for an employee in a given month
   * PF Contribution = (Employee Share + Employer Share) where each share is a percentage of basic salary
   * Typically: Employee 12% + Employer 12% = 24% total
   */
  async calculateAndRecordPFContribution(
    employeeId: string,
    month: number,
    year: number,
    basicSalary: number,
    employeeContributionRate: number = 12,
    employerContributionRate: number = 12
  ): Promise<PFContribution> {
    if (!basicSalary || basicSalary <= 0) {
      throw new Error('Valid basic_salary is required to calculate PF contribution');
    }

    // Check if contribution already exists for this month
    const pfAccount = await this.pfRepository.getPFAccountByEmployee(employeeId);
    if (!pfAccount) throw new Error('PF account not found');
    const contributions = await this.pfRepository.getContributions(pfAccount.id);
    const existingContribution = contributions.find(c => c.month === month && c.year === year);
    if (existingContribution) {
      return existingContribution as any;
    }

    // Ensure PF account exists
    await this.initializePFAccount(employeeId);

    // Create contribution record
    const contributionData: CreatePFContributionDTO = {
      employee_id: employeeId,
      month,
      year,
      basic_salary: basicSalary,
      employee_contribution_rate: employeeContributionRate,
      employer_contribution_rate: employerContributionRate,
    };

    return this.pfRepository.recordPFContribution(contributionData) as any;
  }

  /**
   * Get PF account details for an employee
   */
  async getPFAccount(employeeId: string): Promise<PFAccount | null> {
    return this.pfRepository.getPFAccountByEmployee(employeeId) as any;
  }

  /**
   * Get PF contribution for a specific month
   */
  async getPFContribution(employeeId: string, month: number, year: number): Promise<PFContribution | null> {
    const pfAccount = await this.pfRepository.getPFAccountByEmployee(employeeId);
    if (!pfAccount) return null;
    const contributions = await this.pfRepository.getContributions(pfAccount.id);
    return contributions.find(c => c.month === month && c.year === year) as any || null;
  }

  /**
   * Get all PF contributions for an employee
   */
  async getPFContributions(employeeId: string): Promise<PFContribution[]> {
    return this.pfRepository.getPFContributionsByEmployee(employeeId) as any;
  }

  /**
   * Generate PF statement for an employee for a given period
   */
  async generatePFStatement(
    employeeId: string,
    fromMonth: number,
    fromYear: number,
    toMonth: number,
    toYear: number
  ): Promise<PFStatement> {
    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    const pfAccount = await this.pfRepository.getPFAccountByEmployee(employeeId);
    if (!pfAccount) {
      throw new Error(`PF account not found for employee ${employeeId}`);
    }

    const allContributions = await this.pfRepository.getContributions(pfAccount.id);
    const contributions = allContributions.filter(c => {
      const isAfterStart = c.year > fromYear || (c.year === fromYear && c.month >= fromMonth);
      const isBeforeEnd = c.year < toYear || (c.year === toYear && c.month <= toMonth);
      return isAfterStart && isBeforeEnd;
    });

    const totalEmployeeContribution = contributions.reduce((sum: number, c: any) => sum + c.employee_contribution, 0);
    const totalEmployerContribution = contributions.reduce((sum: number, c: any) => sum + c.employer_contribution, 0);

    const periodFrom = new Date(fromYear, fromMonth - 1, 1);
    const periodTo = new Date(toYear, toMonth, 0);

    return {
      employee_id: employeeId,
      employee_name: `${employee.first_name} ${employee.last_name}`,
      pf_account_number: pfAccount.pf_number,
      opening_balance: pfAccount.current_balance,
      contributions: contributions as any,
      closing_balance: pfAccount.current_balance,
      total_employee_contribution: totalEmployeeContribution,
      total_employer_contribution: totalEmployerContribution,
      period_from: periodFrom,
      period_to: periodTo,
    };
  }

  /**
   * Get total PF balance for an employee
   */
  async getPFBalance(employeeId: string): Promise<number> {
    const account = await this.pfRepository.getPFAccount(employeeId);
    return account ? account.current_balance : 0;
  }

  /**
   * Get total PF contributions made by an employee
   */
  async getTotalPFContribution(employeeId: string): Promise<number> {
    return this.pfRepository.getTotalPFContribution(employeeId);
  }
}
