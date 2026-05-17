import { Knex } from 'knex';
import { Feedback, CreateFeedbackDTO } from '../types/performance';

export class FeedbackRepository {
  constructor(private db: Knex) {}

  async createFeedback(
    data: CreateFeedbackDTO & { fromEmployeeId: string }
  ): Promise<Feedback> {
    const [row] = await this.db('feedback').insert({
      to_employee_id: data.toEmployeeId,
      from_employee_id: data.fromEmployeeId,
      type: data.type,
      content: data.content,
      is_anonymous: data.isAnonymous,
      visibility: data.visibility,
      created_at: new Date(),
    }).returning('id');

    const id = typeof row === 'object' ? row.id : row;
    if (!id) {
      throw new Error('Failed to create feedback');
    }
    return this.getFeedbackById(id) as Promise<Feedback>;
  }

  async getFeedbackById(id: string): Promise<Feedback | null> {
    const feedback = await this.db('feedback').where('id', id).first();

    if (!feedback) {
      return null;
    }

    return this.mapFeedback(feedback);
  }

  async getFeedbackForEmployee(employeeId: string): Promise<Feedback[]> {
    const feedbacks = await this.db('feedback')
      .where('to_employee_id', employeeId)
      .orderBy('created_at', 'desc');
    return feedbacks.map((feedback) => this.mapFeedback(feedback));
  }

  async getFeedbackFromEmployee(employeeId: string): Promise<Feedback[]> {
    const feedbacks = await this.db('feedback')
      .where('from_employee_id', employeeId)
      .orderBy('created_at', 'desc');
    return feedbacks.map((feedback) => this.mapFeedback(feedback));
  }

  async getFeedbackByType(employeeId: string, type: string): Promise<Feedback[]> {
    const feedbacks = await this.db('feedback')
      .where('to_employee_id', employeeId)
      .where('type', type)
      .orderBy('created_at', 'desc');
    return feedbacks.map((feedback) => this.mapFeedback(feedback));
  }

  async getFeedbackByVisibility(employeeId: string, visibility: string): Promise<Feedback[]> {
    const feedbacks = await this.db('feedback')
      .where('to_employee_id', employeeId)
      .where('visibility', visibility)
      .orderBy('created_at', 'desc');
    return feedbacks.map((feedback) => this.mapFeedback(feedback));
  }

  async getVisibleFeedback(employeeId: string, requesterId: string): Promise<Feedback[]> {
    // Get all feedback for the employee
    const feedbacks = await this.db('feedback')
      .where('to_employee_id', employeeId)
      .orderBy('created_at', 'desc');

    // Filter based on visibility rules
    return feedbacks
      .map((feedback) => this.mapFeedback(feedback))
      .filter((feedback) => {
        // Employee can see all their feedback
        if (employeeId === requesterId) {
          return true;
        }

        // Manager can see manager-only and public feedback
        if (feedback.visibility === 'Manager Only') {
          return true;
        }

        // Others can only see public feedback
        return feedback.visibility === 'Public';
      });
  }

  async listAllFeedback(): Promise<Feedback[]> {
    const rows = await this.db('feedback').orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapFeedback(r));
  }

  async updateFeedback(id: string, data: { type?: string; content?: string; visibility?: string }): Promise<Feedback> {
    await this.db('feedback').where('id', id).update(data);
    return this.getFeedbackById(id) as Promise<Feedback>;
  }

  async deleteFeedback(id: string): Promise<void> {
    await this.db('feedback').where('id', id).delete();
  }

  private mapFeedback(dbFeedback: any): Feedback {
    return {
      id: dbFeedback.id,
      toEmployeeId: dbFeedback.to_employee_id,
      fromEmployeeId: dbFeedback.from_employee_id,
      type: dbFeedback.type,
      content: dbFeedback.content,
      isAnonymous: dbFeedback.is_anonymous,
      visibility: dbFeedback.visibility,
      createdAt: new Date(dbFeedback.created_at),
    };
  }
}
