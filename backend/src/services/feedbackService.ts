import { FeedbackRepository } from '../repositories/feedbackRepository';
import { Feedback } from '../types/performance';

export class FeedbackService {
  constructor(private feedbackRepository: FeedbackRepository) {}

  async provideFeedback(
    toEmployeeId: string,
    type: string,
    content: string,
    isAnonymous: boolean,
    visibility: string,
    fromEmployeeId: string
  ): Promise<Feedback> {
    // Validate input
    if (!toEmployeeId || !content) {
      throw new Error('Employee ID and feedback content are required');
    }

    if (content.trim().length < 10) {
      throw new Error('Feedback content must be at least 10 characters');
    }

    if (content.trim().length > 5000) {
      throw new Error('Feedback content must not exceed 5000 characters');
    }

    // Prevent self-feedback
    if (toEmployeeId === fromEmployeeId && !isAnonymous) {
      throw new Error('Cannot provide non-anonymous feedback to yourself');
    }

    return this.feedbackRepository.createFeedback({
      toEmployeeId,
      type: type as 'Positive' | 'Constructive' | 'Neutral',
      content,
      isAnonymous,
      visibility: visibility as 'Private' | 'Manager Only' | 'Public',
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

  async getAllFeedback(): Promise<Feedback[]> {
    return this.feedbackRepository.listAllFeedback();
  }

  async updateFeedback(id: string, data: { type?: string; content?: string; visibility?: string }): Promise<Feedback> {
    return this.feedbackRepository.updateFeedback(id, data);
  }

  async deleteFeedback(feedbackId: string): Promise<void> {
    await this.feedbackRepository.deleteFeedback(feedbackId);
  }
}
