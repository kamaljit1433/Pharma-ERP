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

  async getDesignation(id: string): Promise<Designation | null> {
    const row = await this.db('designations').where('id', id).first();
    return row || null;
  }

  async getDesignationById(id: string): Promise<Designation | null> {
    return this.getDesignation(id);
  }

  async getDesignationByName(name: string): Promise<Designation | null> {
    const row = await this.db('designations').where('name', name).first();
    return row || null;
  }

  async getAllDesignations(): Promise<Designation[]> {
    return this.db('designations').orderBy('name', 'asc');
  }

  async updateDesignation(id: string, data: UpdateDesignationDTO): Promise<Designation> {
    const updateData: Record<string, any> = { updated_at: new Date() };
    if (data.name !== undefined) updateData['name'] = data.name;
    if (data.description !== undefined) updateData['description'] = data.description;
    if (data.level !== undefined) updateData['level'] = data.level;

    const [designation] = await this.db('designations')
      .where('id', id)
      .update(updateData)
      .returning('*');

    if (!designation) throw new Error('Designation not found');
    return designation;
  }

  async deleteDesignation(id: string): Promise<void> {
    await this.db('designations').where('id', id).delete();
  }

  async getDesignationsByLevel(level: string): Promise<Designation[]> {
    return this.db('designations')
      .where('level', level)
      .orderBy('name', 'asc');
  }

  async getDesignationCount(): Promise<number> {
    const result = await this.db('designations').count('* as count').first();
    return Number(result?.['count'] || 0);
  }

  async searchDesignations(query: string): Promise<Designation[]> {
    return this.db('designations')
      .where('name', 'ilike', `%${query}%`)
      .orderBy('name', 'asc');
  }
}
