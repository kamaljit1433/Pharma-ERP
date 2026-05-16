import { Knex } from 'knex';
import { InterviewRepository } from '../repositories/interviewRepository';
import { ApplicantRepository } from '../repositories/applicantRepository';
import { JobPostingRepository } from '../repositories/jobPostingRepository';
import { Interview, InterviewFeedback, CreateInterviewDTO, CreateInterviewFeedbackDTO } from '../types/recruitment';
import { EmailService } from './emailService';
import { EmailTemplateType } from '../types/email';

export class InterviewManagementService {
  private interviewRepository: InterviewRepository;
  private applicantRepository: ApplicantRepository;
  private jobPostingRepository: JobPostingRepository;
  private emailService: EmailService;

  constructor(knex: Knex) {
    this.interviewRepository = new InterviewRepository(knex);
    this.applicantRepository = new ApplicantRepository(knex);
    this.jobPostingRepository = new JobPostingRepository(knex);
    this.emailService = new EmailService();
  }

  async scheduleInterview(data: CreateInterviewDTO): Promise<Interview> {
    const applicant = await this.applicantRepository.getApplicantById(data.applicant_id);
    if (!applicant) {
      throw new Error('Applicant not found');
    }

    const interview = await this.interviewRepository.createInterview(data);

    const jobPosting = applicant.job_posting_id
      ? await this.jobPostingRepository.getJobPostingById(applicant.job_posting_id)
      : null;
    const jobTitle = jobPosting?.title ?? 'the position';

    try {
      await this.emailService.sendWithTemplate(
        EmailTemplateType.INTERVIEW_SCHEDULED,
        applicant.email,
        'Interview Scheduled',
        {
          candidateName: `${applicant.first_name} ${applicant.last_name}`,
          jobTitle,
          interviewDate: new Date(interview.scheduled_at).toLocaleDateString(),
          interviewTime: new Date(interview.scheduled_at).toLocaleTimeString(),
          interviewMode: interview.type,
          interviewerName: 'your interviewer',
        }
      );
    } catch (error) {
      console.error('Failed to send interview invite email:', error);
    }

    return interview;
  }

  async submitFeedback(data: CreateInterviewFeedbackDTO): Promise<InterviewFeedback> {
    const interview = await this.interviewRepository.getInterviewById(data.interview_id);
    if (!interview) {
      throw new Error('Interview not found');
    }

    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const feedback = await this.interviewRepository.addFeedback(data);

    // Only mark as completed if the interview was actually scheduled (not cancelled/rescheduled)
    if (interview.status === 'scheduled') {
      await this.interviewRepository.updateInterviewStatus(data.interview_id, 'completed');
    }

    return feedback;
  }

  async getFeedback(interviewId: string): Promise<InterviewFeedback[]> {
    return this.interviewRepository.getFeedbackByInterview(interviewId);
  }

  async getInterview(id: string): Promise<Interview> {
    const interview = await this.interviewRepository.getInterviewById(id);
    if (!interview) {
      throw new Error('Interview not found');
    }
    return interview;
  }

  async getInterviewsByApplicant(applicantId: string): Promise<Interview[]> {
    return this.interviewRepository.getInterviewsByApplicant(applicantId);
  }

  async getAllInterviews(): Promise<Interview[]> {
    return this.interviewRepository.getAllInterviews();
  }

  async cancelInterview(interviewId: string): Promise<Interview> {
    const interview = await this.interviewRepository.updateInterviewStatus(interviewId, 'cancelled');

    const applicant = await this.applicantRepository.getApplicantById(interview.applicant_id);
    if (applicant) {
      try {
        await this.emailService.sendWithTemplate(
          EmailTemplateType.SYSTEM_NOTIFICATION,
          applicant.email,
          'Interview Cancelled',
          {
            employeeName: `${applicant.first_name} ${applicant.last_name}`,
            title: 'Interview Cancelled',
            message: `Your interview scheduled for ${new Date(interview.scheduled_at).toLocaleString()} has been cancelled.`,
          }
        );
      } catch (error) {
        console.error('Failed to send cancellation email:', error);
      }
    }

    return interview;
  }

  async deleteInterview(id: string): Promise<void> {
    const interview = await this.interviewRepository.getInterviewById(id);
    if (!interview) throw new Error('Interview not found');
    await this.interviewRepository.deleteInterview(id);
  }

  async updateInterview(id: string, data: {
    scheduled_at?: Date;
    type?: 'phone' | 'video' | 'in_person';
    duration_minutes?: number;
    notes?: string;
  }): Promise<Interview> {
    const interview = await this.interviewRepository.getInterviewById(id);
    if (!interview) throw new Error('Interview not found');
    return this.interviewRepository.updateInterview(id, data);
  }

  async getScheduledInterviews(startDate: Date, endDate: Date): Promise<Interview[]> {
    return this.interviewRepository.getScheduledInterviews(startDate, endDate);
  }
}
