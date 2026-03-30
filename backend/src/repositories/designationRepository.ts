import { Knex } from 'knex';
import { Designation, CreateDesignationDTO, UpdateDesignationDTO } from '../types/hierarchy';

export class DesignationRepository {
  constructor(private db: Knex) {}

  async createDesignation(data: CreateDesignationDTO): Promise<Designation> {
    const [designation] = await this.db('designations')
      .insert({
        name: data.name,
        description: data.description || null,
        level: data.level || null,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    return designation;
  }

  async getDesignationById(id: string): Promise<Designation | null> {
    return this.db('designations').where('id', id).first();
  }

  async getDesignationByName(name: string): Promise<Designation | null> {
    return this.db('designations').where('name', name).first();
  }

  async getAllDesignations(): Promise<Designation[]> {
    return this.db('designations').orderBy('level', 'asc').orderBy('name', 'asc');
  }

  async updateDesignation(id: string, data: UpdateDesignationDTO): Promise<Designation> {
    const [designation] = await this.db('designations')
      .where('id', id)
      .update({
        name: data.name,
        description: data.description,
        level: data.level,
        updated_at: new Date(),
      })
      .returning('*');

    return designation;
  }

  async deleteDesignation(id: string): Promise<void> {
    await this.db('designations').where('id', id).delete();
  }

  async getDesignationsByLevel(level: number): Promise<Designation[]> {
    return this.db('designations')
      .where('level', level)
      .orderBy('name', 'asc');
  }
}
