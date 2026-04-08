import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { recruitmentService } from '../recruitmentService';
import apiClient from '../api';
import {
  JobPosting,
  Applicant,
  Interview,
  InterviewFeedback,
  OfferLetter,
} from '../../types/recruitment';

// Mock the API client
vi.mock('../api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('recruitmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Job Postings', () => {
    describe('createJobPosting', () => {
      it('should call POST /recruitment/jobs with job data', async () => {
        const jobData: Partial<JobPosting> = {
          title: 'Senior Developer',
          location: 'New York',
          department_id: 'eng-1',
          description: 'Develop backend services',
          required_skills: ['Node.js', 'TypeScript'],
          experience_min: 3,
          experience_max: 8,
          application_deadline: new Date('2025-12-31'),
        };

        const mockResponse = { id: 'job-1', ...jobData };
        vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

        const result = await recruitmentService.createJobPosting(jobData);

        expect(apiClient.post).toHaveBeenCalledWith('/recruitment/jobs', jobData);
        expect(result).toEqual(mockResponse);
      });

      it('should handle API errors when creating job posting', async () => {
        const jobData: Partial<JobPosting> = { title: 'Developer' };
        const error = new Error('API Error');

        vi.mocked(apiClient.post).mockRejectedValue(error);

        await expect(recruitmentService.createJobPosting(jobData)).rejects.toThrow('API Error');
      });
    });

    describe('getJobPostings', () => {
      it('should call GET /recruitment/jobs without filters', async () => {
        const mockJobs: JobPosting[] = [
          {
            id: 'job-1',
            title: 'Developer',
            location: 'NYC',
            department_id: 'eng-1',
            description: 'Develop',
            required_skills: ['JS'],
            experience_min: 2,
            experience_max: 5,
            application_deadline: new Date(),
            status: 'Open',
            created_by: 'user-1',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ];

        vi.mocked(apiClient.get).mockResolvedValue({ data: mockJobs });

        const result = await recruitmentService.getJobPostings();

        expect(apiClient.get).toHaveBeenCalledWith('/recruitment/jobs', { params: undefined });
        expect(result).toEqual(mockJobs);
      });

      it('should call GET /recruitment/jobs with filters', async () => {
        const filters = { department_id: 'eng-1', status: 'Open' };
        const mockJobs: JobPosting[] = [];

        vi.mocked(apiClient.get).mockResolvedValue({ data: mockJobs });

        await recruitmentService.getJobPostings(filters);

        expect(apiClient.get).toHaveBeenCalledWith('/recruitment/jobs', { params: filters });
      });
    });

    describe('getJobPosting', () => {
      it('should call GET /recruitment/jobs/:id', async () => {
        const jobId = 'job-1';
        const mockJob: JobPosting = {
          id: jobId,
          title: 'Developer',
          location: 'NYC',
          department_id: 'eng-1',
          description: 'Develop',
          required_skills: ['JS'],
          experience_min: 2,
          experience_max: 5,
          application_deadline: new Date(),
          status: 'Open',
          created_by: 'user-1',
          created_at: new Date(),
          updated_at: new Date(),
        };

        vi.mocked(apiClient.get).mockResolvedValue({ data: mockJob });

        const result = await recruitmentService.getJobPosting(jobId);

        expect(apiClient.get).toHaveBeenCalledWith(`/recruitment/jobs/${jobId}`);
        expect(result).toEqual(mockJob);
      });
    });
  });

  describe('Applicants', () => {
    describe('addApplicant', () => {
      it('should call POST /recruitment/jobs/:jobPostingId/applicants', async () => {
        const jobPostingId = 'job-1';
        const applicantData: Partial<Applicant> = {
          name: 'John Doe',
          email: 'john@example.com',
          contact_number: '555-1234',
          resume_url: 'https://example.com/resume.pdf',
        };

        const mockResponse = { id: 'app-1', job_posting_id: jobPostingId, ...applicantData };
        vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

        const result = await recruitmentService.addApplicant(jobPostingId, applicantData);

        expect(apiClient.post).toHaveBeenCalledWith(
          `/recruitment/jobs/${jobPostingId}/applicants`,
          applicantData
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getApplicants', () => {
      it('should call GET /recruitment/applicants with filters', async () => {
        const filters = { job_posting_id: 'job-1', stage: 'Interview' };
        const mockApplicants: Applicant[] = [];

        vi.mocked(apiClient.get).mockResolvedValue({ data: mockApplicants });

        await recruitmentService.getApplicants(filters);

        expect(apiClient.get).toHaveBeenCalledWith('/recruitment/applicants', { params: filters });
      });
    });

    describe('moveApplicantStage', () => {
      it('should call PUT /recruitment/applicants/:applicantId/stage', async () => {
        const applicantId = 'app-1';
        const stage = 'Interview';
        const mockResponse = { id: applicantId, current_stage: stage };

        vi.mocked(apiClient.put).mockResolvedValue({ data: mockResponse });

        const result = await recruitmentService.moveApplicantStage(applicantId, stage);

        expect(apiClient.put).toHaveBeenCalledWith(
          `/recruitment/applicants/${applicantId}/stage`,
          { stage }
        );
        expect(result).toEqual(mockResponse);
      });

      it('should handle invalid stage transitions', async () => {
        const applicantId = 'app-1';
        const stage = 'InvalidStage';
        const error = new Error('Invalid stage');

        vi.mocked(apiClient.put).mockRejectedValue(error);

        await expect(recruitmentService.moveApplicantStage(applicantId, stage)).rejects.toThrow(
          'Invalid stage'
        );
      });
    });
  });

  describe('Interviews', () => {
    describe('scheduleInterview', () => {
      it('should call POST /recruitment/interviews', async () => {
        const interviewData: Partial<Interview> = {
          applicant_id: 'app-1',
          scheduled_at: new Date('2025-02-15T10:00:00'),
          mode: 'Video',
          interviewers: ['user-1', 'user-2'],
        };

        const mockResponse = { id: 'int-1', ...interviewData };
        vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

        const result = await recruitmentService.scheduleInterview(interviewData);

        expect(apiClient.post).toHaveBeenCalledWith('/recruitment/interviews', interviewData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getInterviews', () => {
      it('should call GET /recruitment/interviews with filters', async () => {
        const filters = { applicant_id: 'app-1', status: 'Scheduled' };
        const mockInterviews: Interview[] = [];

        vi.mocked(apiClient.get).mockResolvedValue({ data: mockInterviews });

        await recruitmentService.getInterviews(filters);

        expect(apiClient.get).toHaveBeenCalledWith('/recruitment/interviews', { params: filters });
      });
    });

    describe('getInterview', () => {
      it('should call GET /recruitment/interviews/:id', async () => {
        const interviewId = 'int-1';
        const mockInterview: Interview = {
          id: interviewId,
          applicant_id: 'app-1',
          scheduled_at: new Date(),
          mode: 'Video',
          interviewers: ['user-1'],
          status: 'Scheduled',
          created_at: new Date(),
          updated_at: new Date(),
        };

        vi.mocked(apiClient.get).mockResolvedValue({ data: mockInterview });

        const result = await recruitmentService.getInterview(interviewId);

        expect(apiClient.get).toHaveBeenCalledWith(`/recruitment/interviews/${interviewId}`);
        expect(result).toEqual(mockInterview);
      });
    });

    describe('cancelInterview', () => {
      it('should call PUT /recruitment/interviews/:interviewId/cancel', async () => {
        const interviewId = 'int-1';
        const mockResponse = { id: interviewId, status: 'Cancelled' };

        vi.mocked(apiClient.put).mockResolvedValue({ data: mockResponse });

        const result = await recruitmentService.cancelInterview(interviewId);

        expect(apiClient.put).toHaveBeenCalledWith(
          `/recruitment/interviews/${interviewId}/cancel`
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('submitInterviewFeedback', () => {
      it('should call POST /recruitment/interviews/:interviewId/feedback', async () => {
        const interviewId = 'int-1';
        const feedbackData: Partial<InterviewFeedback> = {
          rating: 4,
          technical_score: 85,
          communication_score: 90,
          cultural_fit_score: 88,
          overall_impression: 'Strong candidate',
          recommendation: 'Strong Hire',
        };

        const mockResponse = { id: 'feedback-1', interview_id: interviewId, ...feedbackData };
        vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

        const result = await recruitmentService.submitInterviewFeedback(interviewId, feedbackData);

        expect(apiClient.post).toHaveBeenCalledWith(
          `/recruitment/interviews/${interviewId}/feedback`,
          feedbackData
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getInterviewFeedback', () => {
      it('should call GET /recruitment/interviews/:interviewId/feedback', async () => {
        const interviewId = 'int-1';
        const mockFeedback: InterviewFeedback = {
          id: 'feedback-1',
          interview_id: interviewId,
          interviewer_id: 'user-1',
          rating: 4,
          technical_score: 85,
          communication_score: 90,
          cultural_fit_score: 88,
          overall_impression: 'Strong candidate',
          recommendation: 'Strong Hire',
          submitted_at: new Date(),
        };

        vi.mocked(apiClient.get).mockResolvedValue({ data: mockFeedback });

        const result = await recruitmentService.getInterviewFeedback(interviewId);

        expect(apiClient.get).toHaveBeenCalledWith(
          `/recruitment/interviews/${interviewId}/feedback`
        );
        expect(result).toEqual(mockFeedback);
      });
    });
  });

  describe('Offer Letters', () => {
    describe('generateOfferLetter', () => {
      it('should call POST /recruitment/offer-letters', async () => {
        const offerData: Partial<OfferLetter> = {
          applicant_id: 'app-1',
          position: 'Senior Developer',
          department: 'Engineering',
          salary: 120000,
          start_date: new Date('2025-03-01'),
          terms: 'Full-time',
        };

        const mockResponse = { id: 'offer-1', status: 'Draft', ...offerData };
        vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

        const result = await recruitmentService.generateOfferLetter(offerData);

        expect(apiClient.post).toHaveBeenCalledWith('/recruitment/offer-letters', offerData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('sendOfferLetter', () => {
      it('should call POST /recruitment/offer-letters/:offerLetterId/send', async () => {
        const offerLetterId = 'offer-1';
        const mockResponse = { id: offerLetterId, status: 'Sent' };

        vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

        const result = await recruitmentService.sendOfferLetter(offerLetterId);

        expect(apiClient.post).toHaveBeenCalledWith(
          `/recruitment/offer-letters/${offerLetterId}/send`
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('acceptOfferLetter', () => {
      it('should call POST /recruitment/offer-letters/:offerLetterId/accept', async () => {
        const offerLetterId = 'offer-1';
        const mockResponse = { id: offerLetterId, status: 'Accepted' };

        vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

        const result = await recruitmentService.acceptOfferLetter(offerLetterId);

        expect(apiClient.post).toHaveBeenCalledWith(
          `/recruitment/offer-letters/${offerLetterId}/accept`
        );
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Candidate Communication', () => {
    describe('sendCommunication', () => {
      it('should call POST /recruitment/communications', async () => {
        const communicationData = {
          applicant_id: 'app-1',
          subject: 'Interview Scheduled',
          body: 'Your interview is scheduled for tomorrow',
        };

        const mockResponse = { id: 'comm-1', ...communicationData };
        vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

        const result = await recruitmentService.sendCommunication(communicationData);

        expect(apiClient.post).toHaveBeenCalledWith('/recruitment/communications', communicationData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getCommunicationHistory', () => {
      it('should call GET /recruitment/communications/:applicantId', async () => {
        const applicantId = 'app-1';
        const mockHistory = [];

        vi.mocked(apiClient.get).mockResolvedValue({ data: mockHistory });

        const result = await recruitmentService.getCommunicationHistory(applicantId);

        expect(apiClient.get).toHaveBeenCalledWith(`/recruitment/communications/${applicantId}`);
        expect(result).toEqual(mockHistory);
      });
    });

    describe('markCommunicationAsRead', () => {
      it('should call PUT /recruitment/communications/:communicationId/read', async () => {
        const communicationId = 'comm-1';
        const mockResponse = { id: communicationId, read_at: new Date() };

        vi.mocked(apiClient.put).mockResolvedValue({ data: mockResponse });

        const result = await recruitmentService.markCommunicationAsRead(communicationId);

        expect(apiClient.put).toHaveBeenCalledWith(
          `/recruitment/communications/${communicationId}/read`
        );
        expect(result).toEqual(mockResponse);
      });
    });
  });
});
