import { Knex } from 'knex';
import { TrainingEnrollment, CreateTrainingEnrollmentDTO, UpdateTrainingEnrollmentDTO } from '../types/training';
import { v4 as uuidv4 } from 'uuid';

export class TrainingEnrollmentRepository {
  constructor(private db: Knex) {}

  async createEnrollment(data: CreateTrainingEnrollmentDTO): Promise<TrainingEnrollment> {
    const id = uuidv4();
    const programId = data.program_id ?? data.training_program_id;

    const [row] = await this.db('training_enrollments')
      .insert({
        id,
        employee_id: data.employee_id,
        program_id: programId,
        training_program_id: programId,
        enrollment_date: data.enrollment_date,
        status: data.status ?? 'enrolled',
      })
      .returning('*');

    return this.mapRow(row);
  }

  async createTrainingEnrollment(data: CreateTrainingEnrollmentDTO): Promise<TrainingEnrollment> {
    return this.createEnrollment(data);
  }

  async getEnrollmentById(id: string): Promise<TrainingEnrollment | null> {
    const row = await this.db('training_enrollments').where('id', id).first();
    return row ? this.mapRow(row) : null;
  }

  async getTrainingEnrollmentById(id: string): Promise<TrainingEnrollment | null> {
    return this.getEnrollmentById(id);
  }

  async getEnrollmentsByEmployee(employeeId: string): Promise<TrainingEnrollment[]> {
    const rows = await this.db('training_enrollments')
      .where('employee_id', employeeId)
      .orderBy('enrollment_date', 'desc');
    return rows.map((r: any) => this.mapRow(r));
  }

  async getEmployeeEnrollments(employeeId: string): Promise<TrainingEnrollment[]> {
    return this.getEnrollmentsByEmployee(employeeId);
  }

  async getEnrollmentsByProgram(programId: string): Promise<TrainingEnrollment[]> {
    const rows = await this.db('training_enrollments')
      .where('program_id', programId)
      .orderBy('enrollment_date', 'asc');
    return rows.map((r: any) => this.mapRow(r));
  }

  async getProgramEnrollments(programId: string): Promise<TrainingEnrollment[]> {
    return this.getEnrollmentsByProgram(programId);
  }

  async getActiveEnrollments(): Promise<TrainingEnrollment[]> {
    const rows = await this.db('training_enrollments')
      .whereIn('status', ['enrolled', 'in_progress'])
      .orderBy('enrollment_date', 'desc');
    return rows.map((r: any) => this.mapRow(r));
  }

  async getEnrollmentsByStatus(status: string): Promise<TrainingEnrollment[]> {
    const rows = await this.db('training_enrollments')
      .where('status', status)
      .orderBy('enrollment_date', 'desc');
    return rows.map((r: any) => this.mapRow(r));
  }

  async updateEnrollment(id: string, data: UpdateTrainingEnrollmentDTO): Promise<TrainingEnrollment> {
    const [row] = await this.db('training_enrollments')
      .where('id', id)
      .update({ ...data, updated_at: this.db.fn.now() })
      .returning('*');

    return this.mapRow(row);
  }

  async updateTrainingEnrollment(id: string, data: UpdateTrainingEnrollmentDTO): Promise<TrainingEnrollment> {
    return this.updateEnrollment(id, data);
  }

  async markCompleted(id: string): Promise<TrainingEnrollment> {
    return this.updateEnrollment(id, {
      status: 'completed',
      completion_date: new Date(),
    });
  }

  async deleteEnrollment(id: string): Promise<void> {
    await this.db('training_enrollments').where('id', id).delete();
  }

  async deleteTrainingEnrollment(id: string): Promise<void> {
    return this.deleteEnrollment(id);
  }

  async checkEnrollmentExists(employeeId: string, programId: string): Promise<boolean> {
    const row = await this.db('training_enrollments')
      .where('employee_id', employeeId)
      .where('program_id', programId)
      .first();
    return !!row;
  }

  private mapRow(row: any): TrainingEnrollment {
    return {
      id: row.id,
      employee_id: row.employee_id,
      program_id: row.program_id ?? row.training_program_id,
      training_program_id: row.training_program_id,
      status: row.status,
      enrollment_date: new Date(row.enrollment_date),
      completion_date: row.completion_date ? new Date(row.completion_date) : undefined,
      score: row.score,
      passed: row.passed,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
