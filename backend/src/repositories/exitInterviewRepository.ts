import { Knex } from 'knex';
import {
  ExitInterview,
  CreateExitInterviewDTO,
  UpdateExitInterviewDTO,
} from '../types/separation';

export class ExitInterviewRepository {
  constructor(private knex: Knex) {}

  async createExitInterview(
    employeeId: string,
    data: CreateExitInterviewDTO
  ): Promise<ExitInterview> {
    const [exitInterview] = await this.knex('exit_interviews')
      .insert({
        employee_id: employeeId,
        scheduled_at: data.scheduled_at,
        questionnaire_template_id: data.questionnaire_template_id,
        status: 'scheduled',
      })
      .returning('*');

    return this.mapToExitInterview(exitInterview);
  }

  async getExitInterviewById(id: string): Promise<ExitInterview | null> {
    const exitInterview = await this.knex('exit_interviews')
      .where({ id })
      .first();

    return exitInterview ? this.mapToExitInterview(exitInterview) : null;
  }

  async getExitInterviewByEmployeeId(
    employeeId: string
  ): Promise<ExitInterview | null> {
    const exitInterview = await this.knex('exit_interviews')
      .where({ employee_id: employeeId })
      .orderBy('created_at', 'desc')
      .first();

    return exitInterview ? this.mapToExitInterview(exitInterview) : null;
  }

  async getAllByEmployeeId(employeeId: string): Promise<ExitInterview[]> {
    const rows = await this.knex('exit_interviews')
      .where({ employee_id: employeeId })
      .orderBy('created_at', 'desc');
    return rows.map((r) => this.mapToExitInterview(r));
  }

  async getExitInterviewsByStatus(
    status: 'scheduled' | 'completed' | 'cancelled'
  ): Promise<ExitInterview[]> {
    const exitInterviews = await this.knex('exit_interviews')
      .where({ status })
      .orderBy('scheduled_at', 'asc');

    return exitInterviews.map((ei) => this.mapToExitInterview(ei));
  }

  async getScheduledExitInterviews(): Promise<ExitInterview[]> {
    const exitInterviews = await this.knex('exit_interviews')
      .where({ status: 'scheduled' })
      .orderBy('scheduled_at', 'asc');

    return exitInterviews.map((ei) => this.mapToExitInterview(ei));
  }

  async updateExitInterview(
    id: string,
    data: UpdateExitInterviewDTO
  ): Promise<ExitInterview> {
    const updateData: any = {
      updated_at: this.knex.fn.now(),
    };

    if (data.conducted_by !== undefined) {
      updateData.conducted_by = data.conducted_by;
    }
    if (data.conducted_at !== undefined) {
      updateData.conducted_at = data.conducted_at;
    }
    if (data.questionnaire_responses !== undefined) {
      updateData.questionnaire_responses = JSON.stringify(
        data.questionnaire_responses
      );
    }
    if (data.feedback !== undefined) {
      updateData.feedback = data.feedback;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    const [updated] = await this.knex('exit_interviews')
      .where({ id })
      .update(updateData)
      .returning('*');

    return this.mapToExitInterview(updated);
  }

  async completeExitInterview(
    id: string,
    conductedBy: string,
    questionnairResponses: Record<string, any>,
    feedback?: string
  ): Promise<ExitInterview> {
    const [updated] = await this.knex('exit_interviews')
      .where({ id })
      .update({
        status: 'completed',
        conducted_by: conductedBy,
        conducted_at: this.knex.fn.now(),
        questionnaire_responses: JSON.stringify(questionnairResponses),
        feedback: feedback || null,
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.mapToExitInterview(updated);
  }

  async cancelExitInterview(id: string): Promise<ExitInterview> {
    const [updated] = await this.knex('exit_interviews')
      .where({ id })
      .update({
        status: 'cancelled',
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.mapToExitInterview(updated);
  }

  async getExitInterviewsByTemplateId(
    templateId: string
  ): Promise<ExitInterview[]> {
    const exitInterviews = await this.knex('exit_interviews')
      .where({ questionnaire_template_id: templateId })
      .orderBy('created_at', 'desc');

    return exitInterviews.map((ei) => this.mapToExitInterview(ei));
  }

  async getExitInterviewsByConductor(
    conductedBy: string
  ): Promise<ExitInterview[]> {
    const exitInterviews = await this.knex('exit_interviews')
      .where({ conducted_by: conductedBy })
      .orderBy('conducted_at', 'desc');

    return exitInterviews.map((ei) => this.mapToExitInterview(ei));
  }

  private mapToExitInterview(row: any): ExitInterview {
    const result: ExitInterview = {
      id: row.id,
      employee_id: row.employee_id,
      status: row.status,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };

    if (row.questionnaire_template_id) {
      result.questionnaire_template_id = row.questionnaire_template_id;
    }
    if (row.conducted_by) {
      result.conducted_by = row.conducted_by;
    }
    if (row.scheduled_at) {
      result.scheduled_at = new Date(row.scheduled_at);
    }
    if (row.conducted_at) {
      result.conducted_at = new Date(row.conducted_at);
    }
    if (row.questionnaire_responses) {
      result.questionnaire_responses =
        typeof row.questionnaire_responses === 'string'
          ? JSON.parse(row.questionnaire_responses)
          : row.questionnaire_responses;
    }
    if (row.feedback) {
      result.feedback = row.feedback;
    }

    return result;
  }
}
