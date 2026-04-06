import { FeedbackRepository } from '../repositories/feedbackRepository';
import { Feedback } from '../types/performance';

import { Knex } from 'knex';

export class FeedbackService {
  private feedbackRepository: FeedbackRepository;

  constructor(private knex: Knex) {
    this.feedbackRepository = new FeedbackRepository(knex);
  }

  async provideFeedback(
    data: any,
    fromEmployeeId: string
  ): Promise<Feedback> {
    // Validate input
    if (!data.toEmployeeId || !data.content) {
      throw new Error('Employee ID and feedback content are required');
    }

    if (data.content.trim().length < 10) {
      throw new Error('Feedback content must be at least 10 characters');
    }

    if (data.content.trim().length > 5000) {
      throw new Error('Feedback content must not exceed 5000 characters');
    }

    // Prevent self-feedback
    if (data.toEmployeeId === fromEmployeeId && !data.isAnonymous) {
      throw new Error('Cannot provide non-anonymous feedback to yourself');
    }

    return this.feedbackRepository.createFeedback({
      toEmployeeId: data.toEmployeeId,
      type: data.type,
      content: data.content,
      isAnonymous: data.isAnonymous,
      visibility: data.visibility,
      fromEmployeeId,
    });
  }

  async getEmployeeFeedback(employeeId: string): Promise<Feedback[]> {
    return this.feedbackRepository.getFeedbackForEmployee(employeeId);
  }

  async getFeedbackFromEmployee(employeeId: string): Promise<Feedback[]> {
    return this.feedbackRepository.getFeedbackFromEmployee(employeeId);
  }

  /**
   * Get visible feedback for an employee based on visibility rules
   * - Employee can see all their feedback
   * - Manager can see manager-only and public feedback
   * - Others can only see public feedback
   */
  async getVisibleFeedback(employeeId: string, requesterId: string): Promise<Feedback[]> {
    return this.feedbackRepository.getVisibleFeedback(employeeId, requesterId);
  }

  async getFeedbackByType(employeeId: string, type: string): Promise<Feedback[]> {
    const validTypes = ['Positive', 'Constructive', 'Neutral'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid feedback type. Must be one of: ${validTypes.join(', ')}`);
    }

    return this.feedbackRepository.getFeedbackByType(employeeId, type);
  }

  async getFeedbackSummary(employeeId: string): Promise<any> {
    const allFeedback = await this.getEmployeeFeedback(employeeId);

    const summary = {
      total: allFeedback.length,
      positive: 0,
      constructive: 0,
      neutral: 0,
      byVisibility: {
        private: 0,
        managerOnly: 0,
        public: 0,
      },
    };

    for (const feedback of allFeedback) {
      if (feedback.type === 'Positive') summary.positive++;
      else if (feedback.type === 'Constructive') summary.constructive++;
      else if (feedback.type === 'Neutral') summary.neutral++;

      if (feedback.visibility === 'Private') summary.byVisibility.private++;
      else if (feedback.visibility === 'Manager Only') summary.byVisibility.managerOnly++;
      else if (feedback.visibility === 'Public') summary.byVisibility.public++;
    }

    return summary;
  }

  async deleteFeedback(feedbackId: string): Promise<void> {
    await this.feedbackRepository.deleteFeedback(feedbackId);
  }
}
