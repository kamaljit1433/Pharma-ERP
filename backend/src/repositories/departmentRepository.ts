import { Knex } from 'knex';
import { Department, CreateDepartmentDTO, UpdateDepartmentDTO } from '../types/hierarchy';

export class DepartmentRepository {
  constructor(private db: Knex) {}

  async createDepartment(data: CreateDepartmentDTO): Promise<Department> {
    const [department] = await this.db('departments')
      .insert({
        name: data.name,
        description: data.description || null,
        parent_department_id: data.parent_department_id || null,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    return department;
  }

  async getDepartmentById(id: string): Promise<Department | null> {
    return this.db('departments').where('id', id).first();
  }

  async getDepartmentByName(name: string): Promise<Department | null> {
    return this.db('departments').where('name', name).first();
  }

  async getAllDepartments(): Promise<Department[]> {
    return this.db('departments').orderBy('name', 'asc');
  }

  async updateDepartment(id: string, data: UpdateDepartmentDTO): Promise<Department> {
    const [department] = await this.db('departments')
      .where('id', id)
      .update({
        name: data.name,
        description: data.description,
        parent_department_id: data.parent_department_id,
        updated_at: new Date(),
      })
      .returning('*');

    return department;
  }

  async deleteDepartment(id: string): Promise<void> {
    await this.db('departments').where('id', id).delete();
  }

  async getDepartmentsByParent(parentId: string): Promise<Department[]> {
    return this.db('departments')
      .where('parent_department_id', parentId)
      .orderBy('name', 'asc');
  }

  async getDepartmentHierarchy(parentId?: string): Promise<Department[]> {
    let query = this.db('departments');
    if (parentId) {
      query = query.where('parent_department_id', parentId);
    } else {
      query = query.whereNull('parent_department_id');
    }
    return query.orderBy('name', 'asc');
  }
}
