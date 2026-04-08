import { Knex } from 'knex';
import {
  SalaryStructure,
  SalaryStructureRevision,
  CreateSalaryStructureDTO,
  UpdateSalaryStructureDTO,
} from '../types/payroll';

export class SalaryStructureRepository {
  constructor(private knex: Knex) {}

  async createSalaryStructure(data: CreateSalaryStructureDTO): Promise<SalaryStructure> {
    const [row] = await this.knex('salary_structures')
      .insert({
        employee_id: data.employee_id,
        salary_mode: data.salary_mode,
        base_salary: data.base_salary ?? data.basic_salary ?? null,
        basic_salary: data.basic_salary ?? data.base_salary ?? null,
        hra: data.hra ?? null,
        dearness_allowance: data.dearness_allowance ?? null,
        other_allowances: data.other_allowances ?? null,
        pf_contribution_rate: data.pf_contribution_rate ?? data.pf_percentage ?? null,
        pf_percentage: data.pf_percentage ?? data.pf_contribution_rate ?? null,
        esi_contribution_rate: data.esi_contribution_rate ?? data.esi_percentage ?? null,
        esi_percentage: data.esi_percentage ?? data.esi_contribution_rate ?? null,
        professional_tax: data.professional_tax ?? null,
        daily_rate: data.daily_rate ?? null,
        hourly_rate: data.hourly_rate ?? null,
        deductions: data.deductions ?? null,
        effective_from: data.effective_from,
        is_active: true,
      })
      .returning('*');

    return this.mapRow(row);
  }

  async getSalaryStructure(id: string): Promise<SalaryStructure | null> {
    const row = await this.knex('salary_structures').where({ id }).first();
    return row ? this.mapRow(row) : null;
  }

  async getSalaryStructureById(id: string): Promise<SalaryStructure | null> {
    return this.getSalaryStructure(id);
  }

  async getEmployeeSalaryStructure(employeeId: string): Promise<SalaryStructure | null> {
    const row = await this.knex('salary_structures')
      .where({ employee_id: employeeId, is_active: true })
      .orderBy('effective_from', 'desc')
      .first();
    return row ? this.mapRow(row) : null;
  }

  async getSalaryStructureByEmployeeId(employeeId: string): Promise<SalaryStructure | null> {
    return this.getEmployeeSalaryStructure(employeeId);
  }

  async getSalaryStructureHistory(employeeId: string): Promise<SalaryStructure[]> {
    const rows = await this.knex('salary_structures')
      .where({ employee_id: employeeId })
      .orderBy('effective_from', 'desc');
    return rows.map((r: any) => this.mapRow(r));
  }

  async getSalaryStructureByDate(employeeId: string, date: string): Promise<SalaryStructure | null> {
    const row = await this.knex('salary_structures')
      .where({ employee_id: employeeId })
      .where('effective_from', '<=', date)
      .where((q) => {
        q.whereNull('effective_to').orWhere('effective_to', '>=', date);
      })
      .orderBy('effective_from', 'desc')
      .first();
    return row ? this.mapRow(row) : null;
  }

  async updateSalaryStructure(id: string, data: UpdateSalaryStructureDTO, updatedBy?: string): Promise<SalaryStructure> {
    const updateData: Record<string, unknown> = { updated_at: this.knex.fn.now() };

    if (data.basic_salary !== undefined) { updateData['basic_salary'] = data.basic_salary; updateData['base_salary'] = data.basic_salary; }
    if (data.base_salary !== undefined) { updateData['base_salary'] = data.base_salary; updateData['basic_salary'] = data.basic_salary ?? data.base_salary; }
    if (data.hra !== undefined) updateData['hra'] = data.hra;
    if (data.dearness_allowance !== undefined) updateData['dearness_allowance'] = data.dearness_allowance;
    if (data.other_allowances !== undefined) updateData['other_allowances'] = data.other_allowances;
    if (data.pf_percentage !== undefined) { updateData['pf_percentage'] = data.pf_percentage; updateData['pf_contribution_rate'] = data.pf_percentage; }
    if (data.pf_contribution_rate !== undefined) { updateData['pf_contribution_rate'] = data.pf_contribution_rate; updateData['pf_percentage'] = data.pf_contribution_rate; }
    if (data.esi_percentage !== undefined) { updateData['esi_percentage'] = data.esi_percentage; updateData['esi_contribution_rate'] = data.esi_percentage; }
    if (data.esi_contribution_rate !== undefined) { updateData['esi_contribution_rate'] = data.esi_contribution_rate; updateData['esi_percentage'] = data.esi_contribution_rate; }
    if (data.professional_tax !== undefined) updateData['professional_tax'] = data.professional_tax;
    if (data.daily_rate !== undefined) updateData['daily_rate'] = data.daily_rate;
    if (data.hourly_rate !== undefined) updateData['hourly_rate'] = data.hourly_rate;
    if (data.deductions !== undefined) updateData['deductions'] = data.deductions;
    if (data.effective_to !== undefined) updateData['effective_to'] = data.effective_to;
    if (data.is_active !== undefined) updateData['is_active'] = data.is_active;
    if (updatedBy) updateData['updated_by'] = updatedBy;

    const [row] = await this.knex('salary_structures')
      .where({ id })
      .update(updateData)
      .returning('*');

    if (!row) throw new Error('Salary structure not found');
    return this.mapRow(row);
  }

  async deactivateSalaryStructure(id: string): Promise<SalaryStructure> {
    const [row] = await this.knex('salary_structures')
      .where({ id })
      .update({ is_active: false, effective_to: this.knex.fn.now(), updated_at: this.knex.fn.now() })
      .returning('*');
    return this.mapRow(row);
  }

  async deleteSalaryStructure(id: string): Promise<void> {
    await this.knex('salary_structures').where({ id }).delete();
  }

  async getActiveSalaryStructures(): Promise<SalaryStructure[]> {
    const rows = await this.knex('salary_structures')
      .where({ is_active: true })
      .orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapRow(r));
  }

  async calculateGrossSalary(structureId: string): Promise<number> {
    const row = await this.knex('salary_structures').where({ id: structureId }).first();
    if (!row) throw new Error('Salary structure not found');

    const basic = parseFloat(row.basic_salary ?? row.base_salary ?? 0);
    const hra = parseFloat(row.hra ?? 0);
    const da = parseFloat(row.dearness_allowance ?? 0);
    const other = parseFloat(row.other_allowances ?? 0);
    return basic + hra + da + other;
  }

  async calculateNetSalary(structureId: string): Promise<number> {
    const gross = await this.calculateGrossSalary(structureId);
    const pf = await this.calculatePFContribution(structureId);
    const esi = await this.calculateESIContribution(structureId);

    const row = await this.knex('salary_structures').where({ id: structureId }).first();
    const pt = parseFloat(row?.professional_tax ?? 0);

    return gross - pf - esi - pt;
  }

  async calculatePFContribution(structureId: string): Promise<number> {
    const row = await this.knex('salary_structures').where({ id: structureId }).first();
    if (!row) throw new Error('Salary structure not found');

    const basic = parseFloat(row.basic_salary ?? row.base_salary ?? 0);
    const rate = parseFloat(row.pf_percentage ?? row.pf_contribution_rate ?? 0);
    return (basic * rate) / 100;
  }

  async calculateESIContribution(structureId: string): Promise<number> {
    const row = await this.knex('salary_structures').where({ id: structureId }).first();
    if (!row) throw new Error('Salary structure not found');

    const basic = parseFloat(row.basic_salary ?? row.base_salary ?? 0);
    const rate = parseFloat(row.esi_percentage ?? row.esi_contribution_rate ?? 0);
    return (basic * rate) / 100;
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
    return this.mapRevision(revision);
  }

  async getRevisionHistory(employeeId: string): Promise<SalaryStructureRevision[]> {
    const rows = await this.knex('salary_structure_revisions')
      .where({ employee_id: employeeId })
      .orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapRevision(r));
  }

  private mapRow(row: any): SalaryStructure {
    const toNum = (v: any) => (v != null ? parseFloat(v) : undefined);
    return {
      id: row.id,
      employee_id: row.employee_id,
      salary_mode: row.salary_mode,
      base_salary: toNum(row.base_salary),
      basic_salary: toNum(row.basic_salary),
      hra: toNum(row.hra),
      dearness_allowance: toNum(row.dearness_allowance),
      other_allowances: toNum(row.other_allowances),
      pf_contribution_rate: toNum(row.pf_contribution_rate),
      pf_percentage: toNum(row.pf_percentage),
      esi_contribution_rate: toNum(row.esi_contribution_rate),
      esi_percentage: toNum(row.esi_percentage),
      professional_tax: toNum(row.professional_tax),
      daily_rate: toNum(row.daily_rate),
      hourly_rate: toNum(row.hourly_rate),
      deductions: row.deductions ?? {},
      effective_from: row.effective_from,
      effective_to: row.effective_to ? new Date(row.effective_to) : undefined,
      is_active: row.is_active,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  private mapRevision(row: any): SalaryStructureRevision {
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
