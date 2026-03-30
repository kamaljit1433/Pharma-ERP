import { Knex } from 'knex';
import { Skill, CreateSkillDTO } from '../types/training';
import { v4 as uuidv4 } from 'uuid';

export class SkillRepository {
  constructor(private db: Knex) {}

  async createSkill(data: CreateSkillDTO): Promise<Skill> {
    const id = uuidv4();

    const [skill] = await this.db('skills')
      .insert({
        id,
        name: data.name,
        category: data.category,
        description: data.description,
      })
      .returning('*');

    return this.mapToSkill(skill);
  }

  async getSkillById(id: string): Promise<Skill | null> {
    const skill = await this.db('skills').where('id', id).first();
    return skill ? this.mapToSkill(skill) : null;
  }

  async getSkillByName(name: string): Promise<Skill | null> {
    const skill = await this.db('skills').where('name', name).first();
    return skill ? this.mapToSkill(skill) : null;
  }

  async getAllSkills(): Promise<Skill[]> {
    const skills = await this.db('skills').orderBy('name', 'asc');
    return skills.map((s) => this.mapToSkill(s));
  }

  async getSkillsByCategory(category: string): Promise<Skill[]> {
    const skills = await this.db('skills')
      .where('category', category)
      .orderBy('name', 'asc');

    return skills.map((s) => this.mapToSkill(s));
  }

  async deleteSkill(id: string): Promise<void> {
    await this.db('skills').where('id', id).delete();
  }

  private mapToSkill(row: any): Skill {
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      description: row.description,
      created_at: new Date(row.created_at),
    };
  }
}
