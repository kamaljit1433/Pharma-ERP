import { Knex } from 'knex';
import { EmployeeSkill, CreateEmployeeSkillDTO, UpdateEmployeeSkillDTO } from '../types/training';
import { v4 as uuidv4 } from 'uuid';

export class EmployeeSkillRepository {
  constructor(private db: Knex) {}

  async createEmployeeSkill(data: CreateEmployeeSkillDTO): Promise<EmployeeSkill> {
    const id = uuidv4();

    const [employeeSkill] = await this.db('employee_skills')
      .insert({
        id,
        employee_id: data.employee_id,
        skill_id: data.skill_id,
        proficiency_level: data.proficiency_level,
        years_of_experience: data.years_of_experience,
      })
      .returning('*');

    return this.mapToEmployeeSkill(employeeSkill);
  }

  async getEmployeeSkillById(id: string): Promise<EmployeeSkill | null> {
    const employeeSkill = await this.db('employee_skills').where('id', id).first();
    return employeeSkill ? this.mapToEmployeeSkill(employeeSkill) : null;
  }

  async getEmployeeSkills(employeeId: string): Promise<EmployeeSkill[]> {
    const employeeSkills = await this.db('employee_skills')
      .where('employee_id', employeeId)
      .orderBy('created_at', 'desc');

    return employeeSkills.map((es) => this.mapToEmployeeSkill(es));
  }

  async getEmployeeSkillBySkillId(employeeId: string, skillId: string): Promise<EmployeeSkill | null> {
    const employeeSkill = await this.db('employee_skills')
      .where('employee_id', employeeId)
      .where('skill_id', skillId)
      .first();

    return employeeSkill ? this.mapToEmployeeSkill(employeeSkill) : null;
  }

  async getEmployeesWithSkill(skillId: string): Promise<EmployeeSkill[]> {
    const employeeSkills = await this.db('employee_skills')
      .where('skill_id', skillId)
      .orderBy('proficiency_level', 'desc');

    return employeeSkills.map((es) => this.mapToEmployeeSkill(es));
  }

  async updateEmployeeSkill(id: string, data: UpdateEmployeeSkillDTO): Promise<EmployeeSkill> {
    const [employeeSkill] = await this.db('employee_skills')
      .where('id', id)
      .update({
        ...data,
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return this.mapToEmployeeSkill(employeeSkill);
  }

  async deleteEmployeeSkill(id: string): Promise<void> {
    await this.db('employee_skills').where('id', id).delete();
  }

  async deleteEmployeeSkillBySkillId(employeeId: string, skillId: string): Promise<void> {
    await this.db('employee_skills')
      .where('employee_id', employeeId)
      .where('skill_id', skillId)
      .delete();
  }

  private mapToEmployeeSkill(row: any): EmployeeSkill {
    return {
      id: row.id,
      employee_id: row.employee_id,
      skill_id: row.skill_id,
      proficiency_level: row.proficiency_level,
      years_of_experience: row.years_of_experience,
      last_used_date: row.last_used_date ? new Date(row.last_used_date) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    } as EmployeeSkill;
  }
}
