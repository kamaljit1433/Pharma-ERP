import { Knex } from 'knex';
import { GratuityRepository } from '../repositories/gratuityRepository';
import { EmployeeRepository } from '../repositories/employeeRepository';
import { Gratuity, GratuityReport } from '../types/benefits';

export class GratuityService {
  private gratuityRepository: GratuityRepository;
  private employeeRepository: EmployeeRepository;

  constructor(knex: Knex) {
    this.gratuityRepository = new GratuityRepository(knex);
    this.employeeRepository = new EmployeeRepository(knex);
  }

  /**
   * Calculate years of service for an employee
   * Returns the number of complete years from date of joining to today (or a specified date)
   */
  private calculateYearsOfService(dateOfJoining: Date, asOfDate: Date = new Date()): number {
    const joiningDate = new Date(dateOfJoining);
    const currentDate = new Date(asOfDate);

    let years = currentDate.getFullYear() - joiningDate.getFullYear();
    const monthDiff = currentDate.getMonth() - joiningDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < joiningDate.getDate())) {
      years--;
    }

    return Math.max(0, years);
  }

  /**
   * Check if an employee is eligible for gratuity
   * Eligibility: Minimum 5 years of service
   */
  private isEligibleForGratuity(yearsOfService: number): boolean {
    return yearsOfService >= 5;
  }

  /**
   * Calculate gratuity amount
   * Formula: (Last drawn salary × Years of service × 15) / 26
   * If years of service < 5, gratuity = 0
   */
  private calculateGratuityAmount(lastDrawnSalary: number, yearsOfService: number): number {
    if (!this.isEligibleForGratuity(yearsOfService)) {
      return 0;
    }

    return (lastDrawnSalary * yearsOfService * 15) / 26;
  }

  /**
   * Calculate gratuity for an employee
   */
  async calculateGratuity(employeeId: string, lastDrawnSalary: number, asOfDate?: Date): Promise<Gratuity> {
    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    const calculationDate = asOfDate || new Date();
    const yearsOfService = this.calculateYearsOfService(new Date(employee.date_of_joining), calculationDate);
    const isEligible = this.isEligibleForGratuity(yearsOfService);
    const gratuityAmount = this.calculateGratuityAmount(lastDrawnSalary, yearsOfService);

    const gratuityData = {
      employee_id: employeeId,
      last_drawn_salary: lastDrawnSalary,
      years_of_service: yearsOfService,
      gratuity_amount: gratuityAmount,
      is_eligible: isEligible,
    };

    return this.gratuityRepository.createGratuity(gratuityData);
  }

  /**
   * Get gratuity details for an employee
   */
  async getGratuity(employeeId: string): Promise<Gratuity | null> {
    return this.gratuityRepository.getGratuity(employeeId);
  }

  /**
   * Get gratuity history for an employee
   */
  async getGratuityHistory(employeeId: string): Promise<Gratuity[]> {
    return this.gratuityRepository.getGratuityHistory(employeeId);
  }

  /**
   * Generate gratuity report for an employee
   */
  async generateGratuityReport(employeeId: string, lastDrawnSalary: number): Promise<GratuityReport> {
    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    const yearsOfService = this.calculateYearsOfService(new Date(employee.date_of_joining));
    const isEligible = this.isEligibleForGratuity(yearsOfService);
    const gratuityAmount = this.calculateGratuityAmount(lastDrawnSalary, yearsOfService);

    return {
      employee_id: employeeId,
      employee_name: `${employee.first_name} ${employee.last_name}`,
      employee_id_number: employee.employee_id,
      date_of_joining: new Date(employee.date_of_joining),
      date_of_separation: employee.date_of_exit ? new Date(employee.date_of_exit) : (undefined as any),
      years_of_service: yearsOfService,
      is_eligible: isEligible,
      last_drawn_salary: lastDrawnSalary,
      gratuity_amount: gratuityAmount,
      calculation_date: new Date(),
      remarks: isEligible ? `Eligible for gratuity after ${yearsOfService} years of service` : 'Not eligible - less than 5 years of service',
    };
  }

  /**
   * Get gratuity amount for an employee
   */
  async getGratuityAmount(employeeId: string, lastDrawnSalary: number): Promise<number> {
    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    const yearsOfService = this.calculateYearsOfService(new Date(employee.date_of_joining));
    return this.calculateGratuityAmount(lastDrawnSalary, yearsOfService);
  }

  /**
   * Check if an employee is eligible for gratuity
   */
  async isEligible(employeeId: string): Promise<boolean> {
    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    const yearsOfService = this.calculateYearsOfService(new Date(employee.date_of_joining));
    return this.isEligibleForGratuity(yearsOfService);
  }

  /**
   * Get years of service for an employee
   */
  async getYearsOfService(employeeId: string): Promise<number> {
    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error(`Employee with ID ${employeeId} not found`);
    }

    return this.calculateYearsOfService(new Date(employee.date_of_joining));
  }
}
