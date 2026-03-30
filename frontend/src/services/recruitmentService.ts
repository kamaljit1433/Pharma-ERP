import { api } from './api';
import {
  JobPosting,
  Applicant,
  Interview,
  InterviewFeedback,
  OfferLetter,
  OnboardingChecklist,
} from '../types/recruitment';

export const recruitmentService = {
  // Job Postings
  createJobPosting: async (data: Partial<JobPosting>) => {
    const response = await api.post('/recruitment/jobs', data);
    return response.data;
  },

  getJobPostings: async (filters?: { department_id?: string; status?: string; search?: string }) => {
    const response = await api.get('/recruitment/jobs', { params: filters });
    return response.data;
  },

  getJobPosting: async (id: string) => {
    const response = await api.get(`/recruitment/jobs/${id}`);
    return response.data;
  },

  // Applicants
  addApplicant: async (jobPostingId: string, data: Partial<Applicant>) => {
    const response = await api.post(`/recruitment/jobs/${jobPostingId}/applicants`, data);
    return response.data;
  },

  getApplicants: async (filters?: { job_posting_id?: string; stage?: string; search?: string }) => {
    const response = await api.get('/recruitment/applicants', { params: filters });
    return response.data;
  },

  moveApplicantStage: async (applicantId: string, stage: string) => {
    const response = await api.put(`/recruitment/applicants/${applicantId}/stage`, { stage });
    return response.data;
  },

  // Interviews
  scheduleInterview: async (data: Partial<Interview>) => {
    const response = await api.post('/recruitment/interviews', data);
    return response.data;
  },

  submitInterviewFeedback: async (interviewId: string, data: Partial<InterviewFeedback>) => {
    const response = await api.post(`/recruitment/interviews/${interviewId}/feedback`, data);
    return response.data;
  },

  getInterviewFeedback: async (interviewId: string) => {
    const response = await api.get(`/recruitment/interviews/${interviewId}/feedback`);
    return response.data;
  },

  // Offer Letters
  generateOfferLetter: async (data: Partial<OfferLetter>) => {
    const response = await api.post('/recruitment/offer-letters', data);
    return response.data;
  },

  sendOfferLetter: async (offerLetterId: string) => {
    const response = await api.post(`/recruitment/offer-letters/${offerLetterId}/send`);
    return response.data;
  },

  acceptOfferLetter: async (offerLetterId: string) => {
    const response = await api.post(`/recruitment/offer-letters/${offerLetterId}/accept`);
    return response.data;
  },

  // Onboarding
  createOnboardingChecklist: async (data: Partial<OnboardingChecklist>) => {
    const response = await api.post('/recruitment/onboarding', data);
    return response.data;
  },

  completeChecklistItem: async (itemId: string) => {
    const response = await api.put(`/recruitment/onboarding/items/${itemId}/complete`);
    return response.data;
  },

  getOnboardingChecklist: async (employeeId: string) => {
    const response = await api.get(`/recruitment/onboarding/${employeeId}`);
    return response.data;
  },
};
