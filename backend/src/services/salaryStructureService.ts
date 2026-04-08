import { Knex } from 'knex';
import { SalaryStructureRepository } from '../repositories/salaryStructureRepository';
import {
  SalaryStructure,
  CreateSalaryStructureDTO,
  UpdateSalaryStructureDTO,
} from '../types/payroll';

export class SalaryStructureService {
  private salaryStructureRepository: SalaryStructureRepository;

  constructor(private knex: Knex) {
    this.salaryStructureRepository = new SalaryStructureRepository(knex);
  }

  async configureSalaryStructure(
    data: CreateSalaryStructureDTO,
    createdBy: string
  ): Promise<SalaryStructure> {
    // Validate employee exists
    const employee = await this.knex('employees')
      .where({ id: data.employee_id })
      .first();

    if (!employee) {
      throw new Error(`Employee with ID ${data.employee_id} not found`);
    }

    // Validate salary mode
    if (!['monthly', 'daily', 'hourly'].includes(data.salary_mode)) {
      throw new Error('Invalid salary mode. Must be monthly, daily, or hourly');
    }

    // Validate salary amounts
    if (data.base_salary <= 0) {
      throw new Error('Base salary must be greater than 0');
    }

    if (data.pf_contribution_rate < 0 || data.pf_contribution_rate > 100) {
      throw new Error('PF contribution rate must be between 0 and 100');
    }

    if (data.esi_contribution_rate < 0 || data.esi_contribution_rate > 100) {
      throw new Error('ESI contribution rate must be between 0 and 100');
    }

    // Deactivate previous active structure
    const previousStructure =
      await this.salaryStructureRepository.getSalaryStructureByEmployeeId(
        data.employee_id
      );

    if (previousStructure) {
      await this.salaryStructureRepository.deactivateSalaryStructure(
        previousStructure.id
      );

      // Create revision record
      const grossSalary =
        data.base_salary +
        data.hra +
        data.dearness_allowance +
        data.other_allowances;

      const previousGrossSalary =
        previousStructure.base_salary +
        previousStructure.hra +
        previousStructure.dearness_allowance +
        previousStructure.other_allowances;

      try {
        await this.salaryStructureRepository.createRevision(
          data.employee_id,
          previousStructure.id,
          previousGrossSalary,
          grossSalary,
          'Salary structure update',
          createdBy
        );
      } catch {
        // Revision table may not exist in all environments; do not block the update
      }
    }

    return this.salaryStructureRepository.createSalaryStructure(data);
  }

  async getSalaryStructure(employeeId: string): Promise<SalaryStructure | null> {
    return this.salaryStructureRepository.getSalaryStructureByEmployeeId(
      employeeId
    );
  }

  async getSalaryStructureHistory(employeeId: string): Promise<SalaryStructure[]> {
    return this.salaryStructureRepository.getSalaryStructureHistory(employeeId);
  }

  async updateSalaryStructure(
    id: string,
    data: UpdateSalaryStructureDTO,
    updatedBy: string
  ): Promise<SalaryStructure> {
    const structure = await this.salaryStructureRepository.getSalaryStructureById(id);

    if (!structure) {
      throw new Error(`Salary structure with ID ${id} not found`);
    }

    // Validate rates if provided
    if (
      data.pf_contribution_rate !== undefined &&
      (data.pf_contribution_rate < 0 || data.pf_contribution_rate > 100)
    ) {
      throw new Error('PF contribution rate must be between 0 and 100');
    }

    if (
      data.esi_contribution_rate !== undefined &&
      (data.esi_contribution_rate < 0 || data.esi_contribution_rate > 100)
    ) {
      throw new Error('ESI contribution rate must be between 0 and 100');
    }

    if (data.base_salary !== undefined && data.base_salary <= 0) {
      throw new Error('Base salary must be greater than 0');
    }

    return this.salaryStructureRepository.updateSalaryStructure(id, data, updatedBy);
  }

  async calculateGrossSalary(employeeId: string): Promise<number> {
    const structure = await this.getSalaryStructure(employeeId);

    if (!structure) {
      throw new Error(`No salary structure found for employee ${employeeId}`);
    }

    return (
      structure.base_salary +
      structure.hra +
      structure.dearness_allowance +
      structure.other_allowances
    );
  }

  async getRevisionHistory(employeeId: string) {
    return this.salaryStructureRepository.getRevisionHistory(employeeId);
  }
}
