import { Knex } from 'knex';
import { Skill, CreateSkillDTO, UpdateSkillDTO } from '../types/training';
import { v4 as uuidv4 } from 'uuid';

export class SkillRepository {
  constructor(private db: Knex) {}

  async createSkill(data: CreateSkillDTO): Promise<Skill> {
    const id = uuidv4();

    const [row] = await this.db('skills')
      .insert({
        id,
        name: data.name,
        category: data.category,
        description: data.description,
        proficiency_levels: data.proficiency_levels ? JSON.stringify(data.proficiency_levels) : JSON.stringify([]),
      })
      .returning('*');

    return this.mapRow(row);
  }

  async getSkillById(id: string): Promise<Skill | null> {
    const row = await this.db('skills').where('id', id).first();
    return row ? this.mapRow(row) : null;
  }

  async getSkillByName(name: string): Promise<Skill | null> {
    const row = await this.db('skills').where('name', name).first();
    return row ? this.mapRow(row) : null;
  }

  async getAllSkills(): Promise<Skill[]> {
    const rows = await this.db('skills').orderBy('name', 'asc');
    return rows.map((r: any) => this.mapRow(r));
  }

  async getSkillsByCategory(category: string): Promise<Skill[]> {
    const rows = await this.db('skills')
      .where('category', category)
      .orderBy('name', 'asc');
    return rows.map((r: any) => this.mapRow(r));
  }

  async updateSkill(id: string, data: UpdateSkillDTO): Promise<Skill> {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData['name'] = data.name;
    if (data.category !== undefined) updateData['category'] = data.category;
    if (data.description !== undefined) updateData['description'] = data.description;
    if (data.proficiency_levels !== undefined) updateData['proficiency_levels'] = JSON.stringify(data.proficiency_levels);
    updateData['updated_at'] = this.db.fn.now();

    const [row] = await this.db('skills')
      .where('id', id)
      .update(updateData)
      .returning('*');

    return this.mapRow(row);
  }

  async deleteSkill(id: string): Promise<void> {
    await this.db('skills').where('id', id).delete();
  }

  private mapRow(row: any): Skill {
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      description: row.description,
      proficiency_levels: Array.isArray(row.proficiency_levels)
        ? row.proficiency_levels
        : (row.proficiency_levels ? JSON.parse(row.proficiency_levels) : []),
      created_at: new Date(row.created_at),
      updated_at: row.updated_at ? new Date(row.updated_at) : undefined,
    };
  }
}
