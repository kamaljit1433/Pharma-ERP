import { Knex } from 'knex';
import {
  SalaryStructure,
  SalaryStructureRevision,
  CreateSalaryStructureDTO,
  UpdateSalaryStructureDTO,
} from '../types/payroll';

export class SalaryStructureRepository {
  constructor(private knex: Knex) {}

  async createSalaryStructure(
    data: CreateSalaryStructureDTO
  ): Promise<SalaryStructure> {
    const [salaryStructure] = await this.knex('salary_structures')
      .insert({
        employee_id: data.employee_id,
        salary_mode: data.salary_mode,
        base_salary: data.base_salary,
        hra: data.hra,
        dearness_allowance: data.dearness_allowance,
        other_allowances: data.other_allowances,
        pf_contribution_rate: data.pf_contribution_rate,
        esi_contribution_rate: data.esi_contribution_rate,
        professional_tax: data.professional_tax,
        deductions: data.deductions || {},
        effective_from: data.effective_from,
        is_active: true,
      })
      .returning('*');

    return this.mapToSalaryStructure(salaryStructure);
  }

  async getSalaryStructureByEmployeeId(
    employeeId: string
  ): Promise<SalaryStructure | null> {
    const structure = await this.knex('salary_structures')
      .where({ employee_id: employeeId, is_active: true })
      .orderBy('effective_from', 'desc')
      .first();

    return structure ? this.mapToSalaryStructure(structure) : null;
  }

  async getSalaryStructureById(id: string): Promise<SalaryStructure | null> {
    const structure = await this.knex('salary_structures')
      .where({ id })
      .first();

    return structure ? this.mapToSalaryStructure(structure) : null;
  }

  async getSalaryStructureHistory(
    employeeId: string
  ): Promise<SalaryStructure[]> {
    const structures = await this.knex('salary_structures')
      .where({ employee_id: employeeId })
      .orderBy('effective_from', 'desc');

    return structures.map((s) => this.mapToSalaryStructure(s));
  }

  async updateSalaryStructure(
    id: string,
    data: UpdateSalaryStructureDTO,
    updatedBy?: string
  ): Promise<SalaryStructure> {
    const [updated] = await this.knex('salary_structures')
      .where({ id })
      .update({
        ...data,
        ...(updatedBy && { updated_by: updatedBy }),
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.mapToSalaryStructure(updated);
  }

  async deactivateSalaryStructure(id: string): Promise<void> {
    await this.knex('salary_structures')
      .where({ id })
      .update({
        is_active: false,
        effective_to: this.knex.fn.now(),
        updated_at: this.knex.fn.now(),
      });
  }

  async createRevision(
    employeeId: string,
    salaryStructureId: string,
    previousSalary: number,
    newSalary: number,
    reason: string,
    createdBy: string
  ): Promise<SalaryStructureRevision> {
    const [revision] = await this.knex('salary_structure_revisions')
      .insert({
        salary_structure_id: salaryStructureId,
        employee_id: employeeId,
        previous_salary: previousSalary,
        new_salary: newSalary,
        effective_from: this.knex.fn.now(),
        reason,
        created_by: createdBy,
      })
      .returning('*');

    return this.mapToRevision(revision);
  }

  async getRevisionHistory(employeeId: string): Promise<SalaryStructureRevision[]> {
    const revisions = await this.knex('salary_structure_revisions')
      .where({ employee_id: employeeId })
      .orderBy('created_at', 'desc');

    return revisions.map((r) => this.mapToRevision(r));
  }

  private mapToSalaryStructure(row: any): SalaryStructure {
    return {
      id: row.id,
      employee_id: row.employee_id,
      salary_mode: row.salary_mode,
      base_salary: parseFloat(row.base_salary),
      hra: parseFloat(row.hra),
      dearness_allowance: parseFloat(row.dearness_allowance),
      other_allowances: parseFloat(row.other_allowances),
      pf_contribution_rate: parseFloat(row.pf_contribution_rate),
      esi_contribution_rate: parseFloat(row.esi_contribution_rate),
      professional_tax: parseFloat(row.professional_tax),
      deductions: row.deductions || {},
      effective_from: new Date(row.effective_from),
      effective_to: row.effective_to ? new Date(row.effective_to) : (undefined as any),
      is_active: row.is_active,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  private mapToRevision(row: any): SalaryStructureRevision {
    return {
      id: row.id,
      salary_structure_id: row.salary_structure_id,
      employee_id: row.employee_id,
      previous_salary: parseFloat(row.previous_salary),
      new_salary: parseFloat(row.new_salary),
      effective_from: new Date(row.effective_from),
      reason: row.reason,
      created_by: row.created_by,
      created_at: new Date(row.created_at),
    };
  }
}
