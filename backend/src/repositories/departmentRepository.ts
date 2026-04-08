import { Knex } from 'knex';
import { Department, CreateDepartmentDTO, UpdateDepartmentDTO } from '../types/hierarchy';

export class DepartmentRepository {
  constructor(private db: Knex) {}

  private mapRow(row: any): Department {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      parent_department_id: row.parent_department_id,
      head_id: row.head_employee_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  async createDepartment(data: CreateDepartmentDTO): Promise<Department> {
    const [department] = await this.db('departments')
      .insert({
        name: data.name,
        description: data.description || null,
        parent_department_id: data.parent_department_id || null,
        head_employee_id: data.head_id || null,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    return this.mapRow(department);
  }

  async getDepartment(id: string): Promise<Department | null> {
    const row = await this.db('departments').where('id', id).first();
    return row ? this.mapRow(row) : null;
  }

  async getDepartmentById(id: string): Promise<Department | null> {
    return this.getDepartment(id);
  }

  async getDepartmentByName(name: string): Promise<Department | null> {
    const row = await this.db('departments').where('name', name).first();
    return row ? this.mapRow(row) : null;
  }

  async getAllDepartments(): Promise<Department[]> {
    const rows = await this.db('departments').orderBy('name', 'asc');
    return rows.map((r: any) => this.mapRow(r));
  }

  async updateDepartment(id: string, data: UpdateDepartmentDTO): Promise<Department> {
    const updateData: Record<string, any> = { updated_at: new Date() };
    if (data.name !== undefined) updateData['name'] = data.name;
    if (data.description !== undefined) updateData['description'] = data.description;
    if (data.parent_department_id !== undefined) updateData['parent_department_id'] = data.parent_department_id;
    if (data.head_id !== undefined) updateData['head_employee_id'] = data.head_id;

    const [department] = await this.db('departments')
      .where('id', id)
      .update(updateData)
      .returning('*');

    if (!department) throw new Error('Department not found');
    return this.mapRow(department);
  }

  async deleteDepartment(id: string): Promise<void> {
    await this.db('departments').where('id', id).delete();
  }

  async getDepartmentsByParent(parentId: string): Promise<Department[]> {
    const rows = await this.db('departments')
      .where('parent_department_id', parentId)
      .orderBy('name', 'asc');
    return rows.map((r: any) => this.mapRow(r));
  }

  async getDepartmentHierarchy(parentId?: string): Promise<Department[]> {
    let query = this.db('departments');
    if (parentId) {
      query = query.where('parent_department_id', parentId);
    } else {
      query = query.whereNull('parent_department_id');
    }
    const rows = await query.orderBy('name', 'asc');
    return rows.map((r: any) => this.mapRow(r));
  }

  async getDepartmentCount(): Promise<number> {
    const result = await this.db('departments').count('* as count').first();
    return Number(result?.['count'] || 0);
  }

  async getDepartmentEmployees(departmentId: string): Promise<any[]> {
    return this.db('employees')
      .where('department_id', departmentId)
      .orderBy('first_name', 'asc');
  }

  async getDepartmentEmployeeCount(departmentId: string): Promise<number> {
    const result = await this.db('employees')
      .where('department_id', departmentId)
      .count('* as count')
      .first();
    return Number(result?.['count'] || 0);
  }

  async searchDepartments(query: string): Promise<Department[]> {
    const rows = await this.db('departments')
      .where('name', 'ilike', `%${query}%`)
      .orderBy('name', 'asc');
    return rows.map((r: any) => this.mapRow(r));
  }
}
