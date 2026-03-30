import { Knex } from 'knex';
import { TrainingEnrollment, CreateTrainingEnrollmentDTO, UpdateTrainingEnrollmentDTO } from '../types/training';
import { v4 as uuidv4 } from 'uuid';

export class TrainingEnrollmentRepository {
  constructor(private db: Knex) {}

  async createTrainingEnrollment(data: CreateTrainingEnrollmentDTO): Promise<TrainingEnrollment> {
    const id = uuidv4();

    const [enrollment] = await this.db('training_enrollments')
      .insert({
        id,
        employee_id: data.employee_id,
        training_program_id: data.training_program_id,
        enrollment_date: data.enrollment_date,
        status: 'enrolled',
      })
      .returning('*');

    return this.mapToTrainingEnrollment(enrollment);
  }

  async getTrainingEnrollmentById(id: string): Promise<TrainingEnrollment | null> {
    const enrollment = await this.db('training_enrollments').where('id', id).first();
    return enrollment ? this.mapToTrainingEnrollment(enrollment) : null;
  }

  async getEmployeeEnrollments(employeeId: string): Promise<TrainingEnrollment[]> {
    const enrollments = await this.db('training_enrollments')
      .where('employee_id', employeeId)
      .orderBy('enrollment_date', 'desc');

    return enrollments.map((e) => this.mapToTrainingEnrollment(e));
  }

  async getProgramEnrollments(programId: string): Promise<TrainingEnrollment[]> {
    const enrollments = await this.db('training_enrollments')
      .where('training_program_id', programId)
      .orderBy('enrollment_date', 'asc');

    return enrollments.map((e) => this.mapToTrainingEnrollment(e));
  }

  async getEnrollmentsByStatus(status: string): Promise<TrainingEnrollment[]> {
    const enrollments = await this.db('training_enrollments')
      .where('status', status)
      .orderBy('enrollment_date', 'desc');

    return enrollments.map((e) => this.mapToTrainingEnrollment(e));
  }

  async updateTrainingEnrollment(id: string, data: UpdateTrainingEnrollmentDTO): Promise<TrainingEnrollment> {
    const [enrollment] = await this.db('training_enrollments')
      .where('id', id)
      .update({
        ...data,
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return this.mapToTrainingEnrollment(enrollment);
  }

  async deleteTrainingEnrollment(id: string): Promise<void> {
    await this.db('training_enrollments').where('id', id).delete();
  }

  async checkEnrollmentExists(employeeId: string, programId: string): Promise<boolean> {
    const enrollment = await this.db('training_enrollments')
      .where('employee_id', employeeId)
      .where('training_program_id', programId)
      .first();

    return !!enrollment;
  }

  private mapToTrainingEnrollment(row: any): TrainingEnrollment {
    return {
      id: row.id,
      employee_id: row.employee_id,
      training_program_id: row.training_program_id,
      status: row.status,
      enrollment_date: new Date(row.enrollment_date),
      completion_date: row.completion_date ? new Date(row.completion_date) : undefined,
      score: row.score,
      passed: row.passed,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    } as TrainingEnrollment;
  }
}
