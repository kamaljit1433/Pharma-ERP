import apiClient from './api';
import {
  JobPosting,
  Applicant,
  Interview,
  InterviewFeedback,
  OfferLetter,
  OnboardingChecklist,
  CandidateCommunication,
  SendCommunicationDTO,
} from '../types/recruitment';

export const recruitmentService = {
  // Job Postings
  createJobPosting: async (data: Partial<JobPosting>) => {
    const response = await apiClient.post('/recruitment/jobs', data);
    return response.data;
  },

  getJobPostings: async (filters?: { department_id?: string; status?: string; search?: string }) => {
    const response = await apiClient.get('/recruitment/jobs', { params: filters });
    return response.data;
  },

  getJobPosting: async (id: string) => {
    const response = await apiClient.get(`/recruitment/jobs/${id}`);
    return response.data;
  },

  // Applicants
  addApplicant: async (jobPostingId: string, data: Partial<Applicant>) => {
    const response = await apiClient.post(`/recruitment/jobs/${jobPostingId}/applicants`, data);
    return response.data;
  },

  getApplicants: async (filters?: { job_posting_id?: string; stage?: string; search?: string }) => {
    const response = await apiClient.get('/recruitment/applicants', { params: filters });
    return response.data;
  },

  moveApplicantStage: async (applicantId: string, stage: string) => {
    const response = await apiClient.put(`/recruitment/applicants/${applicantId}/stage`, { stage });
    return response.data;
  },

  // Interviews
  scheduleInterview: async (data: Partial<Interview>) => {
    const response = await apiClient.post('/recruitment/interviews', data);
    return response.data;
  },

  getInterviews: async (filters?: { applicant_id?: string; status?: string }) => {
    const response = await apiClient.get('/recruitment/interviews', { params: filters });
    return response.data;
  },

  getInterview: async (id: string) => {
    const response = await apiClient.get(`/recruitment/interviews/${id}`);
    return response.data;
  },

  cancelInterview: async (interviewId: string) => {
    const response = await apiClient.put(`/recruitment/interviews/${interviewId}/cancel`);
    return response.data;
  },

  submitInterviewFeedback: async (interviewId: string, data: Partial<InterviewFeedback>) => {
    const response = await apiClient.post(`/recruitment/interviews/${interviewId}/feedback`, data);
    return response.data;
  },

  getInterviewFeedback: async (interviewId: string) => {
    const response = await apiClient.get(`/recruitment/interviews/${interviewId}/feedback`);
    return response.data;
  },

  // Offer Letters
  generateOfferLetter: async (data: Partial<OfferLetter>) => {
    const response = await apiClient.post('/recruitment/offer-letters', data);
    return response.data;
  },

  sendOfferLetter: async (offerLetterId: string) => {
    const response = await apiClient.post(`/recruitment/offer-letters/${offerLetterId}/send`);
    return response.data;
  },

  acceptOfferLetter: async (offerLetterId: string) => {
    const response = await apiClient.post(`/recruitment/offer-letters/${offerLetterId}/accept`);
    return response.data;
  },

  // Onboarding
  createOnboardingChecklist: async (data: Partial<OnboardingChecklist>) => {
    const response = await apiClient.post('/recruitment/onboarding', data);
    return response.data;
  },

  completeChecklistItem: async (itemId: string) => {
    const response = await apiClient.put(`/recruitment/onboarding/items/${itemId}/complete`);
    return response.data;
  },

  getOnboardingChecklist: async (employeeId: string) => {
    const response = await apiClient.get(`/recruitment/onboarding/${employeeId}`);
    return response.data;
  },

  // Candidate Communication
  sendCommunication: async (data: SendCommunicationDTO) => {
    const response = await apiClient.post('/recruitment/communications', data);
    return response.data;
  },

  getCommunicationHistory: async (applicantId: string) => {
    const response = await apiClient.get(`/recruitment/communications/${applicantId}`);
    return response.data;
  },

  markCommunicationAsRead: async (communicationId: string) => {
    const response = await apiClient.put(`/recruitment/communications/${communicationId}/read`);
    return response.data;
  },
};
