import { Request, Response } from 'express';
import knex from '../config/knex';
import { JobPostingRepository } from '../repositories/jobPostingRepository';
import { ApplicantTrackingService } from '../services/applicantTrackingService';
import { InterviewManagementService } from '../services/interviewManagementService';
import { OfferLetterService } from '../services/offerLetterService';
import { OnboardingService } from '../services/onboardingService';

export class RecruitmentController {
  private jobPostingRepository: JobPostingRepository;
  private applicantTrackingService: ApplicantTrackingService;
  private interviewManagementService: InterviewManagementService;
  private offerLetterService: OfferLetterService;
  private onboardingService: OnboardingService;

  constructor() {
    this.jobPostingRepository = new JobPostingRepository(knex);
    this.applicantTrackingService = new ApplicantTrackingService(knex);
    this.interviewManagementService = new InterviewManagementService(knex);
    this.offerLetterService = new OfferLetterService(knex);
    this.onboardingService = new OnboardingService(knex);
  }

  // Job Posting endpoints
  async createJobPosting(req: Request, res: Response): Promise<void> {
    try {
      const { title, department_id, designation_id, description, positions_count, application_deadline, closing_date } = req.body;
      const userId = (req as any).user?.id;

      const jobPosting = await this.jobPostingRepository.createJobPosting({
        title,
        department_id,
        designation_id,
        description,
        positions_count,
        closing_date: closing_date ? new Date(closing_date) : application_deadline ? new Date(application_deadline) : undefined,
      });

      res.status(201).json({ success: true, data: jobPosting });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  }

  async getJobPostings(req: Request, res: Response): Promise<void> {
    try {
      const { department_id, status, search, limit = 10, offset = 0 } = req.query;

      const jobPostings = await this.jobPostingRepository.searchJobPostings({
        department_id: department_id as string,
        status: status as 'draft' | 'open' | 'closed' | 'on_hold' | undefined,
        search: search as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      res.status(200).json({ success: true, data: jobPostings });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  }

  async getJobPosting(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const jobPosting = await this.jobPostingRepository.getJobPostingById(id);

      if (!jobPosting) {
        res.status(404).json({ success: false, error: 'Job posting not found' });
        return;
      }

      res.status(200).json({ success: true, data: jobPosting });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  }

  // Applicant endpoints
  async addApplicant(req: Request, res: Response): Promise<void> {
    try {
      const job_posting_id = req.params['job_posting_id'] as string;
      const { name, email, contact_number, resume_url } = req.body;

      const applicant = await this.applicantTrackingService.addApplicant(job_posting_id, {
        name,
        email,
        contact_number,
        resume_url,
      });

      res.status(201).json({ success: true, data: applicant });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  }

  async getApplicants(req: Request, res: Response): Promise<void> {
    try {
      const { job_posting_id, stage, search } = req.query;

      const applicants = await this.applicantTrackingService.searchApplicants({
        jobPostingId: job_posting_id as string,
        stage: stage as string,
        search: search as string,
      });

      res.status(200).json({ success: true, data: applicants });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  }

  async moveApplicantStage(req: Request, res: Response): Promise<void> {
    try {
      const applicant_id = req.params['applicant_id'] as string;
      const { stage } = req.body;

      const applicant = await this.applicantTrackingService.moveApplicantStage(applicant_id, stage);

      res.status(200).json({ success: true, data: applicant });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  }

  // Interview endpoints
  async scheduleInterview(req: Request, res: Response): Promise<void> {
    try {
      const { applicant_id, scheduled_at, mode, interviewers } = req.body;

      const interview = await this.interviewManagementService.scheduleInterview({
        applicant_id,
        scheduled_at: new Date(scheduled_at),
        mode,
        interviewers,
      });

      res.status(201).json({ success: true, data: interview });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  }

  async submitInterviewFeedback(req: Request, res: Response): Promise<void> {
    try {
      const interview_id = req.params['interview_id'] as string;
      const { interviewer_id, rating, comments, recommendation } = req.body;

      const feedback = await this.interviewManagementService.submitFeedback({
        interview_id,
        interviewer_id,
        rating,
        comments,
        recommendation,
      });

      res.status(201).json({ success: true, data: feedback });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  }

  async getInterviewFeedback(req: Request, res: Response): Promise<void> {
    try {
      const interview_id = req.params['interview_id'] as string;

      const feedback = await this.interviewManagementService.getFeedback(interview_id);

      res.status(200).json({ success: true, data: feedback });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  }

  // Offer Letter endpoints
  async generateOfferLetter(req: Request, res: Response): Promise<void> {
    try {
      const { applicant_id, position, department, salary, start_date, terms } = req.body;

      const offerLetter = await this.offerLetterService.generateOfferLetter({
        applicant_id,
        position,
        department,
        salary,
        start_date: new Date(start_date),
        terms,
      });

      res.status(201).json({ success: true, data: offerLetter });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  }

  async sendOfferLetter(req: Request, res: Response): Promise<void> {
    try {
      const offer_letter_id = req.params['offer_letter_id'] as string;

      const offerLetter = await this.offerLetterService.sendOfferLetter(offer_letter_id);

      res.status(200).json({ success: true, data: offerLetter });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  }

  async acceptOfferLetter(req: Request, res: Response): Promise<void> {
    try {
      const offer_letter_id = req.params['offer_letter_id'] as string;

      const offerLetter = await this.offerLetterService.acceptOfferLetter(offer_letter_id);

      res.status(200).json({ success: true, data: offerLetter });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  }

  // Onboarding endpoints
  async createOnboardingChecklist(req: Request, res: Response): Promise<void> {
    try {
      const { employee_id, items } = req.body;

      const checklist = await this.onboardingService.createOnboardingChecklist({
        employee_id,
        items,
      });

      res.status(201).json({ success: true, data: checklist });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  }

  async completeChecklistItem(req: Request, res: Response): Promise<void> {
    try {
      const item_id = req.params['item_id'] as string;
      const userId = (req as any).user?.id;

      const item = await this.onboardingService.completeChecklistItem(item_id, userId);

      res.status(200).json({ success: true, data: item });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  }

  async getOnboardingChecklist(req: Request, res: Response): Promise<void> {
    try {
      const employee_id = req.params['employee_id'] as string;

      const checklist = await this.onboardingService.getOnboardingChecklistByEmployee(employee_id);

      if (!checklist) {
        res.status(404).json({ success: false, error: 'Onboarding checklist not found' });
        return;
      }

      res.status(200).json({ success: true, data: checklist });
    } catch (error) {
      res.status(400).json({ success: false, error: (error as Error).message });
    }
  }
}
