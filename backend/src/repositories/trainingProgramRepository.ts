import { Knex } from 'knex';
import { TrainingProgram, CreateTrainingProgramDTO, UpdateTrainingProgramDTO } from '../types/training';
import { v4 as uuidv4 } from 'uuid';

export class TrainingProgramRepository {
  constructor(private db: Knex) {}

  async createProgram(data: CreateTrainingProgramDTO): Promise<TrainingProgram> {
    const id = uuidv4();

    const [row] = await this.db('training_programs')
      .insert({
        id,
        name: data.name,
        description: data.description,
        provider: data.provider,
        start_date: data.start_date,
        end_date: data.end_date,
        duration_hours: data.duration_hours,
        duration_days: data.duration_days,
        max_participants: data.max_participants,
        status: data.status ?? 'draft',
      })
      .returning('*');

    if (!row) {
      throw new Error('Failed to create training program');
    }

    return this.mapRow(row);
  }

  async createTrainingProgram(data: CreateTrainingProgramDTO): Promise<TrainingProgram> {
    return this.createProgram(data);
  }

  async getProgramById(id: string): Promise<TrainingProgram | null> {
    const row = await this.db('training_programs').where('id', id).first();
    return row ? this.mapRow(row) : null;
  }

  async getTrainingProgramById(id: string): Promise<TrainingProgram | null> {
    return this.getProgramById(id);
  }

  async getProgramByName(name: string): Promise<TrainingProgram | null> {
    const row = await this.db('training_programs').where('name', name).first();
    return row ? this.mapRow(row) : null;
  }

  async getAllPrograms(): Promise<TrainingProgram[]> {
    const rows = await this.db('training_programs').orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapRow(r));
  }

  async getAllTrainingPrograms(status?: string): Promise<TrainingProgram[]> {
    let query = this.db('training_programs');
    if (status) {
      query = query.where('status', status);
    }
    const rows = await query.orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapRow(r));
  }

  async getActivePrograms(): Promise<TrainingProgram[]> {
    const rows = await this.db('training_programs')
      .where('status', 'active')
      .orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapRow(r));
  }

  async getActiveTrainingPrograms(): Promise<TrainingProgram[]> {
    return this.getActivePrograms();
  }

  async getProgramsByStatus(status: string): Promise<TrainingProgram[]> {
    const rows = await this.db('training_programs')
      .where('status', status)
      .orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapRow(r));
  }

  async updateProgram(id: string, data: UpdateTrainingProgramDTO): Promise<TrainingProgram> {
    const [row] = await this.db('training_programs')
      .where('id', id)
      .update({ ...data, updated_at: this.db.fn.now() })
      .returning('*');

    if (!row) {
      throw new Error('Training program not found or update failed');
    }

    return this.mapRow(row);
  }

  async updateTrainingProgram(id: string, data: UpdateTrainingProgramDTO): Promise<TrainingProgram> {
    return this.updateProgram(id, data);
  }

  async deleteProgram(id: string): Promise<void> {
    await this.db('training_programs').where('id', id).delete();
  }

  async deleteTrainingProgram(id: string): Promise<void> {
    return this.deleteProgram(id);
  }

  private mapRow(row: any): TrainingProgram {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      provider: row.provider,
      start_date: row.start_date ? new Date(row.start_date) : undefined,
      end_date: row.end_date ? new Date(row.end_date) : undefined,
      duration_hours: row.duration_hours,
      duration_days: row.duration_days,
      status: row.status,
      max_participants: row.max_participants,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
