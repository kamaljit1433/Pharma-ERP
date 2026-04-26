import { Knex } from 'knex';
import { Interview, InterviewFeedback, CreateInterviewDTO, CreateInterviewFeedbackDTO } from '../types/recruitment';
import { v4 as uuidv4 } from 'uuid';

export class InterviewRepository {
  constructor(private knex: Knex) {}

  async createInterview(data: CreateInterviewDTO): Promise<Interview> {
    const type: 'phone' | 'video' | 'in_person' = data.type ?? 'in_person';

    const interview: any = {
      id: uuidv4(),
      applicant_id: data.applicant_id,
      scheduled_at: data.scheduled_at,
      type,
      duration_minutes: data.duration_minutes || 30,
      status: 'scheduled',
      created_at: new Date(),
      updated_at: new Date(),
    };

    if (data.interviewer_id) {
      interview.interviewer_id = data.interviewer_id;
    } else if (data.interviewers && data.interviewers.length > 0) {
      interview.interviewer_id = data.interviewers[0]!;
    }

    await this.knex('interviews').insert(interview);
    return interview as Interview;
  }

  async getInterviewById(id: string): Promise<Interview | null> {
    return (await this.knex('interviews').where({ id }).first()) ?? null;
  }

  async getInterviewsByApplicant(applicantId: string): Promise<Interview[]> {
    return this.knex('interviews').where({ applicant_id: applicantId });
  }

  async getAllInterviews(): Promise<Interview[]> {
    return this.knex('interviews').orderBy('scheduled_at', 'desc');
  }

  async updateInterviewStatus(id: string, status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'): Promise<Interview> {
    await this.knex('interviews').where({ id }).update({
      status,
      updated_at: new Date(),
    });

    const interview = await this.getInterviewById(id);
    if (!interview) throw new Error('Interview not found');
    return interview;
  }

  async addFeedback(data: CreateInterviewFeedbackDTO): Promise<InterviewFeedback> {
    const feedback: any = {
      id: uuidv4(),
      interview_id: data.interview_id,
      interviewer_id: data.interviewer_id,
      rating: data.rating,
      recommendation: data.recommendation,
      created_at: new Date(),
    };

    if (data.comments) {
      feedback.comments = data.comments;
    }

    await this.knex('interview_feedback').insert(feedback);
    return feedback as InterviewFeedback;
  }

  async getFeedbackByInterview(interviewId: string): Promise<InterviewFeedback[]> {
    return this.knex('interview_feedback').where({ interview_id: interviewId });
  }

  async getFeedbackById(id: string): Promise<InterviewFeedback | null> {
    return this.knex('interview_feedback').where({ id }).first();
  }

  async getScheduledInterviews(startDate: Date, endDate: Date): Promise<Interview[]> {
    // Convert dates to ISO strings for SQLite compatibility
    const startDateStr = startDate.toISOString().substring(0, 10);
    const endDateStr = endDate.toISOString().substring(0, 10);
    
    return this.knex('interviews')
      .whereBetween('scheduled_at', [startDateStr, `${endDateStr} 23:59:59`])
      .where({ status: 'scheduled' });
  }
}
