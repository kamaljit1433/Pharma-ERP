import { Knex } from 'knex';
import { InterviewRepository } from '../repositories/interviewRepository';
import { ApplicantRepository } from '../repositories/applicantRepository';
import { Interview, InterviewFeedback, CreateInterviewDTO, CreateInterviewFeedbackDTO } from '../types/recruitment';
import { EmailService } from './emailService';
import { EmailTemplateType } from '../types/email';

export class InterviewManagementService {
  private interviewRepository: InterviewRepository;
  private applicantRepository: ApplicantRepository;
  private emailService: EmailService;

  constructor(knex: Knex) {
    this.interviewRepository = new InterviewRepository(knex);
    this.applicantRepository = new ApplicantRepository(knex);
    this.emailService = new EmailService();
  }

  async scheduleInterview(data: CreateInterviewDTO): Promise<Interview> {
    // Verify applicant exists
    const applicant = await this.applicantRepository.getApplicantById(data.applicant_id);
    if (!applicant) {
      throw new Error('Applicant not found');
    }

    // Create interview
    const interview = await this.interviewRepository.createInterview(data);

    // Send interview invite to applicant
    await this.emailService.sendWithTemplate(
      EmailTemplateType.INTERVIEW_SCHEDULED,
      applicant.email,
      'Interview Scheduled',
      {
        candidateName: `${applicant.first_name} ${applicant.last_name}`,
        jobTitle: 'Position',
        interviewDate: new Date(interview.scheduled_at).toLocaleDateString(),
        interviewTime: new Date(interview.scheduled_at).toLocaleTimeString(),
        interviewMode: interview.type,
        interviewerName: 'HR Team',
      }
    );

    return interview;
  }

  async submitFeedback(data: CreateInterviewFeedbackDTO): Promise<InterviewFeedback> {
    // Verify interview exists
    const interview = await this.interviewRepository.getInterviewById(data.interview_id);
    if (!interview) {
      throw new Error('Interview not found');
    }

    // Validate rating
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Add feedback
    const feedback = await this.interviewRepository.addFeedback(data);

    // Update interview status if feedback submitted
    await this.interviewRepository.updateInterviewStatus(data.interview_id, 'completed');

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

  async cancelInterview(interviewId: string): Promise<Interview> {
    const interview = await this.interviewRepository.updateInterviewStatus(interviewId, 'cancelled');

    // Notify applicant and interviewers
    const applicant = await this.applicantRepository.getApplicantById(interview.applicant_id);
    if (applicant) {
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
    }

    return interview;
  }

  async getScheduledInterviews(startDate: Date, endDate: Date): Promise<Interview[]> {
    return this.interviewRepository.getScheduledInterviews(startDate, endDate);
  }
}
