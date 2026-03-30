import { Knex } from 'knex';
import { TrainingProgram, CreateTrainingProgramDTO, UpdateTrainingProgramDTO } from '../types/training';
import { v4 as uuidv4 } from 'uuid';

export class TrainingProgramRepository {
  constructor(private db: Knex) {}

  async createTrainingProgram(data: CreateTrainingProgramDTO): Promise<TrainingProgram> {
    const id = uuidv4();

    const [program] = await this.db('training_programs')
      .insert({
        id,
        name: data.name,
        description: data.description,
        provider: data.provider,
        start_date: data.start_date,
        end_date: data.end_date,
        duration_hours: data.duration_hours,
        max_participants: data.max_participants,
        status: 'draft',
      })
      .returning('*');

    return this.mapToTrainingProgram(program);
  }

  async getTrainingProgramById(id: string): Promise<TrainingProgram | null> {
    const program = await this.db('training_programs').where('id', id).first();
    return program ? this.mapToTrainingProgram(program) : null;
  }

  async getAllTrainingPrograms(status?: string): Promise<TrainingProgram[]> {
    let query = this.db('training_programs');

    if (status) {
      query = query.where('status', status);
    }

    const programs = await query.orderBy('start_date', 'desc');
    return programs.map((p) => this.mapToTrainingProgram(p));
  }

  async getActiveTrainingPrograms(): Promise<TrainingProgram[]> {
    const programs = await this.db('training_programs')
      .where('status', 'active')
      .orderBy('start_date', 'asc');

    return programs.map((p) => this.mapToTrainingProgram(p));
  }

  async updateTrainingProgram(id: string, data: UpdateTrainingProgramDTO): Promise<TrainingProgram> {
    const [program] = await this.db('training_programs')
      .where('id', id)
      .update({
        ...data,
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return this.mapToTrainingProgram(program);
  }

  async deleteTrainingProgram(id: string): Promise<void> {
    await this.db('training_programs').where('id', id).delete();
  }

  private mapToTrainingProgram(row: any): TrainingProgram {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      provider: row.provider,
      start_date: new Date(row.start_date),
      end_date: new Date(row.end_date),
      duration_hours: row.duration_hours,
      status: row.status,
      max_participants: row.max_participants,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
