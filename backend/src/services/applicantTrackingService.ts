import { Knex } from 'knex';
import { ApplicantRepository } from '../repositories/applicantRepository';
import { JobPostingRepository } from '../repositories/jobPostingRepository';
import { Applicant, CreateApplicantDTO } from '../types/recruitment';
import { EmailService } from './emailService';

export class ApplicantTrackingService {
  private applicantRepository: ApplicantRepository;
  private jobPostingRepository: JobPostingRepository;
  private emailService: EmailService;

  constructor(knex: Knex) {
    this.applicantRepository = new ApplicantRepository(knex);
    this.jobPostingRepository = new JobPostingRepository(knex);
    this.emailService = new EmailService();
  }

  async addApplicant(jobPostingId: string, data: CreateApplicantDTO): Promise<Applicant> {
    // Verify job posting exists
    const jobPosting = await this.jobPostingRepository.getJobPostingById(jobPostingId);
    if (!jobPosting) {
      throw new Error('Job posting not found');
    }

    // Create applicant
    const applicant = await this.applicantRepository.createApplicant(jobPostingId, data);

    // Send confirmation email (optional - may fail if template not configured)
    try {
      await this.emailService.sendSystemNotification(
        applicant.email,
        `${applicant.first_name} ${applicant.last_name}`,
        'Application Received',
        `Your application for ${jobPosting.title} has been received.`
      );
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    }

    return applicant;
  }

  async moveApplicantStage(
    applicantId: string,
    newStage: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected'
  ): Promise<Applicant> {
    const applicant = await this.applicantRepository.getApplicantById(applicantId);
    if (!applicant) {
      throw new Error('Applicant not found');
    }

    // Validate stage transition
    const validTransitions: Record<string, string[]> = {
      applied: ['screening', 'rejected'],
      screening: ['interview', 'rejected'],
      interview: ['offer', 'rejected'],
      offer: ['hired', 'rejected'],
      hired: [],
      rejected: [],
    };

    if (!validTransitions[applicant.stage]?.includes(newStage)) {
      throw new Error(`Invalid stage transition from ${applicant.stage} to ${newStage}`);
    }

    // Update applicant stage
    const updated = await this.applicantRepository.updateApplicant(applicantId, {
      stage: newStage,
    });

    // Send notification email (optional - may fail if template not configured)
    const stageMessages: Record<string, string> = {
      screening: 'Your application is under review',
      interview: 'You have been selected for an interview',
      offer: 'We are pleased to extend an offer',
      hired: 'Welcome to our team!',
      rejected: 'Thank you for your interest',
    };

    try {
      await this.emailService.sendSystemNotification(
        applicant.email,
        `${applicant.first_name} ${applicant.last_name}`,
        `Application Status Update: ${newStage}`,
        stageMessages[newStage] || 'Your application status has been updated'
      );
    } catch (error) {
      console.error('Failed to send status update email:', error);
    }

    return updated;
  }

  async getApplicantsByJobPosting(jobPostingId: string): Promise<Applicant[]> {
    return this.applicantRepository.getApplicantsByJobPosting(jobPostingId);
  }

  async getApplicantsByStage(stage: string): Promise<Applicant[]> {
    return this.applicantRepository.getApplicantsByStage(stage);
  }

  async searchApplicants(filters: {
    jobPostingId?: string;
    stage?: string;
    search?: string;
  }): Promise<Applicant[]> {
    return this.applicantRepository.searchApplicants(filters);
  }

  async getApplicant(id: string): Promise<Applicant> {
    const applicant = await this.applicantRepository.getApplicantById(id);
    if (!applicant) {
      throw new Error('Applicant not found');
    }
    return applicant;
  }
}
