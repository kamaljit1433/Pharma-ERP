import { Knex } from 'knex';
import { ExitInterview, CreateExitInterviewDTO, UpdateExitInterviewDTO } from '../types/separation';
import { v4 as uuidv4 } from 'uuid';

export class ExitInterviewRepository {
  constructor(private db: Knex) {}

  async createExitInterview(employeeId: string, data: CreateExitInterviewDTO): Promise<ExitInterview> {
    const id = uuidv4();

    const [exitInterview] = await this.db('exit_interviews')
      .insert({
        id,
        employee_id: employeeId,
        questionnaire_template_id: data.questionnaire_template_id,
        scheduled_at: data.scheduled_at,
        status: 'scheduled',
      })
      .returning('*');

    return this.parseExitInterview(exitInterview);
  }

  async getExitInterview(id: string): Promise<ExitInterview | null> {
    const exitInterview = await this.db('exit_interviews').where('id', id).first();
    return exitInterview ? this.parseExitInterview(exitInterview) : null;
  }

  async getExitInterviewByEmployeeId(employeeId: string): Promise<ExitInterview | null> {
    const exitInterview = await this.db('exit_interviews')
      .where('employee_id', employeeId)
      .orderBy('created_at', 'desc')
      .first();
    return exitInterview ? this.parseExitInterview(exitInterview) : null;
  }

  async updateExitInterview(id: string, data: UpdateExitInterviewDTO): Promise<ExitInterview> {
    const updateData: any = {
      updated_at: this.db.fn.now(),
    };

    if (data.conducted_by !== undefined) updateData.conducted_by = data.conducted_by;
    if (data.conducted_at !== undefined) updateData.conducted_at = data.conducted_at;
    if (data.questionnaire_responses !== undefined) updateData.questionnaire_responses = JSON.stringify(data.questionnaire_responses);
    if (data.feedback !== undefined) updateData.feedback = data.feedback;
    if (data.status !== undefined) updateData.status = data.status;

    const [exitInterview] = await this.db('exit_interviews')
      .where('id', id)
      .update(updateData)
      .returning('*');

    return this.parseExitInterview(exitInterview);
  }

  async completeExitInterview(
    id: string,
    conductedBy: string,
    responses: Record<string, any>,
    feedback: string
  ): Promise<ExitInterview> {
    const [exitInterview] = await this.db('exit_interviews')
      .where('id', id)
      .update({
        conducted_by: conductedBy,
        conducted_at: this.db.fn.now(),
        questionnaire_responses: JSON.stringify(responses),
        feedback,
        status: 'completed',
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return this.parseExitInterview(exitInterview);
  }

  async cancelExitInterview(id: string): Promise<ExitInterview> {
    const [exitInterview] = await this.db('exit_interviews')
      .where('id', id)
      .update({
        status: 'cancelled',
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return this.parseExitInterview(exitInterview);
  }

  async getExitInterviewsByStatus(status: string): Promise<ExitInterview[]> {
    const exitInterviews = await this.db('exit_interviews')
      .where('status', status)
      .orderBy('created_at', 'desc');
    return exitInterviews.map(ei => this.parseExitInterview(ei));
  }

  async getAllExitInterviews(limit: number = 50, offset: number = 0): Promise<ExitInterview[]> {
    const exitInterviews = await this.db('exit_interviews')
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');
    return exitInterviews.map(ei => this.parseExitInterview(ei));
  }

  async getExitInterviewCount(): Promise<number> {
    const result = await this.db('exit_interviews')
      .count('id as count')
      .first();
    return Number(result?.['count'] || 0);
  }

  private parseExitInterview(exitInterview: any): ExitInterview {
    return {
      ...exitInterview,
      questionnaire_responses: exitInterview.questionnaire_responses 
        ? (typeof exitInterview.questionnaire_responses === 'string' 
          ? JSON.parse(exitInterview.questionnaire_responses) 
          : exitInterview.questionnaire_responses)
        : undefined,
    };
  }
}
