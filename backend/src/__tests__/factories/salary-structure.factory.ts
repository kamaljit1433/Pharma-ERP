import { Knex } from 'knex';
import { BaseFactory } from './base.factory';

export interface SalaryStructure {
  id: string;
  employee_id: string;
  salary_mode: 'monthly' | 'daily' | 'hourly' | 'half_day';
  base_salary: number;
  hra: number;
  dearness_allowance: number;
  conveyance_allowance: number;
  medical_allowance: number;
  other_allowances: number;
  pf_contribution: number;
  esi_contribution: number;
  professional_tax: number;
  other_deductions: number;
  effective_from: Date;
  effective_to: Date | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Factory for generating SalaryStructure test data
 */
export class SalaryStructureFactory extends BaseFactory<SalaryStructure> {
  constructor(knex: Knex) {
    super(knex, 'salary_structures');
  }

  /**
   * Create a single salary structure
   */
  async create(overrides?: Partial<SalaryStructure>): Promise<SalaryStructure> {
    const baseSalary = 50000 + Math.floor(Math.random() * 100000);
    const hra = Math.floor(baseSalary * 0.2);
    const da = Math.floor(baseSalary * 0.1);
    const conveyance = 2000;
    const medical = 1500;
    const pf = Math.floor(baseSalary * 0.12);
    const esi = Math.floor(baseSalary * 0.0475);
    const pt = 200;

    const data: any = {
      id: this.generateId(),
      employee_id: this.generateId(), // Will be overridden
      salary_mode: 'monthly',
      base_salary: baseSalary,
      hra,
      dearness_allowance: da,
      conveyance_allowance: conveyance,
      medical_allowance: medical,
      other_allowances: 0,
      pf_contribution: pf,
      esi_contribution: esi,
      professional_tax: pt,
      other_deductions: 0,
      effective_from: new Date(),
      effective_to: null,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };

    return this.insert(data);
  }

  /**
   * Create a salary structure for a specific employee
   */
  async createForEmployee(employeeId: string, overrides?: Partial<SalaryStructure>): Promise<SalaryStructure> {
    return this.create({
      employee_id: employeeId,
      ...overrides,
    });
  }

  /**
   * Create a salary structure with custom salary mode
   */
  async createWithMode(
    employeeId: string,
    mode: 'monthly' | 'daily' | 'hourly' | 'half_day',
    overrides?: Partial<SalaryStructure>
  ): Promise<SalaryStructure> {
    return this.create({
      employee_id: employeeId,
      salary_mode: mode,
      ...overrides,
    });
  }
}
