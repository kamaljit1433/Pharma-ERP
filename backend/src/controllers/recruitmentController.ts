import { Request, Response } from 'express';
import knex from '../config/knex';
import { JobPostingRepository } from '../repositories/jobPostingRepository';
import { ApplicantTrackingService } from '../services/applicantTrackingService';
import { InterviewManagementService } from '../services/interviewManagementService';
import { OfferLetterService } from '../services/offerLetterService';
import { OnboardingService } from '../services/onboardingService';
import { AuthenticatedRequest } from '../middleware/auth';
import { googleFormsService } from '../services/googleFormsService';
import { FormResponseSyncService } from '../services/formResponseSyncService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_STAGES = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'] as const;
const VALID_RECOMMENDATIONS = ['hire', 'maybe', 'reject'] as const;

function handleError(res: Response, error: unknown): void {
  const msg = error instanceof Error ? error.message : 'An unexpected error occurred';
  const lower = msg.toLowerCase();
  if (lower.includes('not found')) {
    res.status(404).json({ success: false, error: msg });
  } else if (lower.includes('already') || lower.includes('conflict')) {
    res.status(409).json({ success: false, error: msg });
  } else if (
    lower.includes('invalid') ||
    lower.includes('required') ||
    lower.includes('must be') ||
    lower.includes('missing') ||
    lower.includes('future') ||
    lower.includes('positive')
  ) {
    res.status(400).json({ success: false, error: msg });
  } else {
    res.status(500).json({ success: false, error: msg });
  }
}

export class RecruitmentController {
  private jobPostingRepository: JobPostingRepository;
  private applicantTrackingService: ApplicantTrackingService;
  private interviewManagementService: InterviewManagementService;
  private offerLetterService: OfferLetterService;
  private onboardingService: OnboardingService;
  private formSyncService: FormResponseSyncService;

  constructor() {
    this.jobPostingRepository = new JobPostingRepository(knex);
    this.applicantTrackingService = new ApplicantTrackingService(knex);
    this.interviewManagementService = new InterviewManagementService(knex);
    this.offerLetterService = new OfferLetterService(knex);
    this.onboardingService = new OnboardingService(knex);
    this.formSyncService = new FormResponseSyncService(knex);
  }

  // Job Posting endpoints
  async createJobPosting(req: Request, res: Response): Promise<void> {
    try {
      const { title, department_id, designation_id, description, positions_count, application_deadline, closing_date, status } = req.body;

      if (!title || typeof title !== 'string' || !title.trim()) {
        res.status(400).json({ success: false, error: 'Job title is required' });
        return;
      }
      const positionsNum = Number(positions_count);
      if (!positions_count || !Number.isInteger(positionsNum) || positionsNum < 1) {
        res.status(400).json({ success: false, error: 'positions_count must be a positive integer' });
        return;
      }

      const jobPosting = await this.jobPostingRepository.createJobPosting({
        title: title.trim(),
        department_id,
        designation_id,
        description,
        positions_count: positionsNum,
        closing_date: closing_date ? new Date(closing_date) : application_deadline ? new Date(application_deadline) : undefined,
        status: status === 'draft' ? 'draft' : 'open',
      });

      // Respond immediately — form generation runs in the background
      res.status(201).json({ success: true, data: jobPosting });

      // Fire-and-forget: generate Google Form after responding to client
      if (googleFormsService.isEnabled()) {
        googleFormsService
          .createApplicationForm(jobPosting.id, jobPosting.title)
          .then(({ formId, formUrl }) =>
            this.jobPostingRepository.updateFormData(jobPosting.id, {
              form_id: formId,
              form_url: formUrl,
              form_status: 'generated',
            })
          )
          .catch((err) => {
            const detail = err?.response?.data ?? err?.errors ?? err?.message ?? err;
            console.error('[Forms] Failed to create form for job', jobPosting.id, JSON.stringify(detail));
            this.jobPostingRepository
              .updateFormData(jobPosting.id, { form_status: 'failed' })
              .catch(() => {});
          });
      }
    } catch (error) {
      handleError(res, error);
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
      handleError(res, error);
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
      handleError(res, error);
    }
  }

  // Applicant endpoints
  async addApplicant(req: Request, res: Response): Promise<void> {
    try {
      const job_posting_id = req.params['job_posting_id'] as string;
      const { name, email, contact_number, resume_url } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        res.status(400).json({ success: false, error: 'Applicant name is required' });
        return;
      }
      if (!email || !EMAIL_REGEX.test(String(email))) {
        res.status(400).json({ success: false, error: 'A valid email address is required' });
        return;
      }
      if (!contact_number || typeof contact_number !== 'string' || !contact_number.trim()) {
        res.status(400).json({ success: false, error: 'Contact number is required' });
        return;
      }

      const applicant = await this.applicantTrackingService.addApplicant(job_posting_id, {
        name: name.trim(),
        email: String(email).trim().toLowerCase(),
        contact_number: contact_number.trim(),
        resume_url,
      });

      res.status(201).json({ success: true, data: applicant });
    } catch (error) {
      handleError(res, error);
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
      handleError(res, error);
    }
  }

  async moveApplicantStage(req: Request, res: Response): Promise<void> {
    try {
      const applicant_id = req.params['applicant_id'] as string;
      const { stage } = req.body;

      if (!stage || !(VALID_STAGES as readonly string[]).includes(stage)) {
        res.status(400).json({ success: false, error: `stage must be one of: ${VALID_STAGES.join(', ')}` });
        return;
      }

      const applicant = await this.applicantTrackingService.moveApplicantStage(applicant_id, stage);
      res.status(200).json({ success: true, data: applicant });
    } catch (error) {
      handleError(res, error);
    }
  }

  // Interview endpoints
  async scheduleInterview(req: Request, res: Response): Promise<void> {
    try {
      const { applicant_id, scheduled_at, type, interviewers, duration_minutes } = req.body;

      if (!applicant_id) {
        res.status(400).json({ success: false, error: 'applicant_id is required' });
        return;
      }
      if (!scheduled_at) {
        res.status(400).json({ success: false, error: 'scheduled_at is required' });
        return;
      }
      const scheduledDate = new Date(scheduled_at);
      if (isNaN(scheduledDate.getTime())) {
        res.status(400).json({ success: false, error: 'scheduled_at must be a valid date' });
        return;
      }
      if (scheduledDate <= new Date()) {
        res.status(400).json({ success: false, error: 'Interview must be scheduled for a future date' });
        return;
      }

      const interview = await this.interviewManagementService.scheduleInterview({
        applicant_id,
        scheduled_at: scheduledDate,
        type,
        interviewers,
        duration_minutes,
      });

      res.status(201).json({ success: true, data: interview });
    } catch (error) {
      handleError(res, error);
    }
  }

  async getInterview(req: Request, res: Response): Promise<void> {
    try {
      const interview_id = req.params['interview_id'] as string;
      const interview = await this.interviewManagementService.getInterview(interview_id);
      res.status(200).json({ success: true, data: interview });
    } catch (error) {
      handleError(res, error);
    }
  }

  async getInterviews(req: Request, res: Response): Promise<void> {
    try {
      const { applicant_id, status } = req.query;

      let interviews;
      if (applicant_id) {
        interviews = await this.interviewManagementService.getInterviewsByApplicant(applicant_id as string);
      } else {
        interviews = await this.interviewManagementService.getAllInterviews();
      }

      if (status && interviews) {
        interviews = interviews.filter((i: any) => i.status === status);
      }

      res.status(200).json({ success: true, data: interviews || [] });
    } catch (error) {
      handleError(res, error);
    }
  }

  async cancelInterview(req: Request, res: Response): Promise<void> {
    try {
      const interview_id = req.params['interview_id'] as string;
      const interview = await this.interviewManagementService.cancelInterview(interview_id);
      res.status(200).json({ success: true, data: interview });
    } catch (error) {
      handleError(res, error);
    }
  }

  async deleteInterview(req: Request, res: Response): Promise<void> {
    try {
      const interview_id = req.params['interview_id'] as string;
      await this.interviewManagementService.deleteInterview(interview_id);
      res.status(200).json({ success: true });
    } catch (error) {
      handleError(res, error);
    }
  }

  async updateInterview(req: Request, res: Response): Promise<void> {
    try {
      const interview_id = req.params['interview_id'] as string;
      const { scheduled_at, type, duration_minutes, notes } = req.body;
      const interview = await this.interviewManagementService.updateInterview(interview_id, {
        ...(scheduled_at && { scheduled_at: new Date(scheduled_at) }),
        ...(type && { type }),
        ...(duration_minutes && { duration_minutes: Number(duration_minutes) }),
        ...(notes !== undefined && { notes }),
      });
      res.status(200).json({ success: true, data: interview });
    } catch (error) {
      handleError(res, error);
    }
  }

  async submitInterviewFeedback(req: Request, res: Response): Promise<void> {
    try {
      const interview_id = req.params['interview_id'] as string;
      const { interviewer_id, rating, comments, recommendation } = req.body;

      if (!interviewer_id) {
        res.status(400).json({ success: false, error: 'interviewer_id is required' });
        return;
      }
      const ratingNum = Number(rating);
      if (!rating || !Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        res.status(400).json({ success: false, error: 'rating must be an integer between 1 and 5' });
        return;
      }
      if (!recommendation || !(VALID_RECOMMENDATIONS as readonly string[]).includes(recommendation)) {
        res.status(400).json({ success: false, error: `recommendation must be one of: ${VALID_RECOMMENDATIONS.join(', ')}` });
        return;
      }

      const feedback = await this.interviewManagementService.submitFeedback({
        interview_id,
        interviewer_id,
        rating: ratingNum,
        comments,
        recommendation,
      });

      res.status(201).json({ success: true, data: feedback });
    } catch (error) {
      handleError(res, error);
    }
  }

  async getInterviewFeedback(req: Request, res: Response): Promise<void> {
    try {
      const interview_id = req.params['interview_id'] as string;
      const feedback = await this.interviewManagementService.getFeedback(interview_id);
      res.status(200).json({ success: true, data: feedback });
    } catch (error) {
      handleError(res, error);
    }
  }

  // Offer Letter endpoints
  async getOfferLetters(req: Request, res: Response): Promise<void> {
    try {
      const offerLetters = await this.offerLetterService.getOfferLetters();
      res.status(200).json({ success: true, data: offerLetters });
    } catch (error) {
      handleError(res, error);
    }
  }

  async generateOfferLetter(req: Request, res: Response): Promise<void> {
    try {
      const { applicant_id, position, department, salary, start_date, terms } = req.body;

      if (!applicant_id) {
        res.status(400).json({ success: false, error: 'applicant_id is required' });
        return;
      }
      if (!position || typeof position !== 'string' || !position.trim()) {
        res.status(400).json({ success: false, error: 'position is required' });
        return;
      }
      const salaryNum = Number(salary);
      if (!salary || isNaN(salaryNum) || salaryNum <= 0) {
        res.status(400).json({ success: false, error: 'salary must be a positive number' });
        return;
      }
      if (!start_date) {
        res.status(400).json({ success: false, error: 'start_date is required' });
        return;
      }

      const offerLetter = await this.offerLetterService.generateOfferLetter({
        applicant_id,
        position: position.trim(),
        department,
        salary: salaryNum,
        start_date: new Date(start_date),
        terms,
      });

      res.status(201).json({ success: true, data: offerLetter });
    } catch (error) {
      handleError(res, error);
    }
  }

  async sendOfferLetter(req: Request, res: Response): Promise<void> {
    try {
      const offer_letter_id = req.params['offer_letter_id'] as string;
      const offerLetter = await this.offerLetterService.sendOfferLetter(offer_letter_id);
      res.status(200).json({ success: true, data: offerLetter });
    } catch (error) {
      handleError(res, error);
    }
  }

  async deleteOfferLetter(req: Request, res: Response): Promise<void> {
    try {
      const offer_letter_id = req.params['offer_letter_id'] as string;
      await this.offerLetterService.deleteOfferLetter(offer_letter_id);
      res.status(200).json({ success: true });
    } catch (error) {
      handleError(res, error);
    }
  }

  async acceptOfferLetter(req: Request, res: Response): Promise<void> {
    try {
      const offer_letter_id = req.params['offer_letter_id'] as string;
      const offerLetter = await this.offerLetterService.acceptOfferLetter(offer_letter_id);
      res.status(200).json({ success: true, data: offerLetter });
    } catch (error) {
      handleError(res, error);
    }
  }

  // Onboarding endpoints
  async createOnboardingChecklist(req: Request, res: Response): Promise<void> {
    try {
      const { employee_id, items } = req.body;

      if (!employee_id) {
        res.status(400).json({ success: false, error: 'employee_id is required' });
        return;
      }
      if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({ success: false, error: 'items must be a non-empty array' });
        return;
      }

      const checklist = await this.onboardingService.createOnboardingChecklist({
        employee_id,
        items,
      });

      res.status(201).json({ success: true, data: checklist });
    } catch (error) {
      handleError(res, error);
    }
  }

  async completeChecklistItem(req: Request, res: Response): Promise<void> {
    try {
      const item_id = req.params['item_id'] as string;
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, error: 'Authentication required' });
        return;
      }

      const item = await this.onboardingService.completeChecklistItem(item_id, userId);
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      handleError(res, error);
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
      handleError(res, error);
    }
  }

  async deleteJobPosting(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const existing = await this.jobPostingRepository.getJobPostingById(id);
      if (!existing) {
        res.status(404).json({ success: false, error: 'Job posting not found' });
        return;
      }
      await this.jobPostingRepository.deleteJobPosting(id);
      res.status(200).json({ success: true, message: 'Job posting deleted' });
    } catch (error) {
      handleError(res, error);
    }
  }

  async updateJobPostingStatus(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const { status } = req.body;
      const validStatuses = ['draft', 'open', 'closed', 'on_hold'];
      if (!status || !validStatuses.includes(status)) {
        res.status(400).json({ success: false, error: `status must be one of: ${validStatuses.join(', ')}` });
        return;
      }
      const existing = await this.jobPostingRepository.getJobPostingById(id);
      if (!existing) {
        res.status(404).json({ success: false, error: 'Job posting not found' });
        return;
      }
      const updated = await this.jobPostingRepository.updateJobPostingStatus(id, status);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      handleError(res, error);
    }
  }

  // Manually trigger a form response sync (HR can call this on-demand)
  async syncFormResponses(req: Request, res: Response): Promise<void> {
    try {
      if (!googleFormsService.isEnabled()) {
        res.status(503).json({ success: false, error: 'Google Forms integration is not configured' });
        return;
      }
      const result = await this.formSyncService.syncNow();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error);
    }
  }
}
