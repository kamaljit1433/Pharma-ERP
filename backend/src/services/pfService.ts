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
      return existingAccount;
    }

    // Generate PF account number (format: PF + timestamp + random)
    const pfAccountNumber = `PF${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    return this.pfRepository.createPFAccount(employeeId, pfAccountNumber);
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
    // Check if contribution already exists for this month
    const existingContribution = await this.pfRepository.getPFContribution(employeeId, month, year);
    if (existingContribution) {
      return existingContribution;
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

    return this.pfRepository.recordPFContribution(contributionData);
  }

  /**
   * Get PF account details for an employee
   */
  async getPFAccount(employeeId: string): Promise<PFAccount | null> {
    return this.pfRepository.getPFAccount(employeeId);
  }

  /**
   * Get PF contribution for a specific month
   */
  async getPFContribution(employeeId: string, month: number, year: number): Promise<PFContribution | null> {
    return this.pfRepository.getPFContribution(employeeId, month, year);
  }

  /**
   * Get all PF contributions for an employee
   */
  async getPFContributions(employeeId: string): Promise<PFContribution[]> {
    return this.pfRepository.getPFContributionsByEmployee(employeeId);
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

    const pfAccount = await this.pfRepository.getPFAccount(employeeId);
    if (!pfAccount) {
      throw new Error(`PF account not found for employee ${employeeId}`);
    }

    const contributions = await this.pfRepository.getPFContributionsByPeriod(
      employeeId,
      fromMonth,
      fromYear,
      toMonth,
      toYear
    );

    const totalEmployeeContribution = contributions.reduce((sum, c) => sum + c.employee_contribution, 0);
    const totalEmployerContribution = contributions.reduce((sum, c) => sum + c.employer_contribution, 0);

    const periodFrom = new Date(fromYear, fromMonth - 1, 1);
    const periodTo = new Date(toYear, toMonth, 0);

    return {
      employee_id: employeeId,
      employee_name: `${employee.first_name} ${employee.last_name}`,
      pf_account_number: pfAccount.pf_account_number,
      opening_balance: pfAccount.opening_balance,
      contributions,
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
