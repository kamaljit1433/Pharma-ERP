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

const TYPE_TO_MODE: Record<string, string> = {
  in_person: 'In-Person',
  video: 'Video',
  phone: 'Phone',
};

const normalizeInterview = (i: any) => ({
  ...i,
  mode: TYPE_TO_MODE[i.type as string] ?? i.mode ?? i.type ?? '',
  interviewers: i.interviewer_id ? [i.interviewer_id] : (i.interviewers ?? []),
  status: i.status ? i.status.charAt(0).toUpperCase() + i.status.slice(1) : 'Scheduled',
});

export const recruitmentService = {
  // Job Postings
  createJobPosting: async (data: Partial<JobPosting>) => {
    const response = await apiClient.post('/recruitment/jobs', data);
    return response.data;
  },

  getJobPostings: async (filters?: { department_id?: string; status?: string; search?: string }) => {
    const response = await apiClient.get('/recruitment/jobs', { params: filters });
    return response.data.data || [];
  },

  getJobPosting: async (id: string) => {
    const response = await apiClient.get(`/recruitment/jobs/${id}`);
    return response.data.data;
  },

  deleteJobPosting: async (id: string) => {
    const response = await apiClient.delete(`/recruitment/jobs/${id}`);
    return response.data;
  },

  updateJobPostingStatus: async (id: string, status: 'draft' | 'open' | 'closed' | 'on_hold') => {
    const response = await apiClient.put(`/recruitment/jobs/${id}/status`, { status });
    return response.data.data;
  },

  // Applicants
  addApplicant: async (jobPostingId: string, data: Partial<Applicant>) => {
    const response = await apiClient.post(`/recruitment/jobs/${jobPostingId}/applicants`, data);
    return response.data;
  },

  getApplicants: async (filters?: { job_posting_id?: string; stage?: string; search?: string }) => {
    const response = await apiClient.get('/recruitment/applicants', { params: filters });
    return response.data.data || [];
  },

  moveApplicantStage: async (applicantId: string, stage: string) => {
    const response = await apiClient.put(`/recruitment/applicants/${applicantId}/stage`, { stage });
    return response.data;
  },

  // Interviews
  scheduleInterview: async (data: Partial<Interview>) => {
    const response = await apiClient.post('/recruitment/interviews', data);
    return normalizeInterview(response.data.data ?? response.data);
  },

  getInterviews: async (filters?: { applicant_id?: string; status?: string }) => {
    const response = await apiClient.get('/recruitment/interviews', { params: filters });
    return (response.data.data || []).map(normalizeInterview);
  },

  getInterview: async (id: string) => {
    const response = await apiClient.get(`/recruitment/interviews/${id}`);
    return normalizeInterview(response.data.data);
  },

  cancelInterview: async (interviewId: string) => {
    const response = await apiClient.put(`/recruitment/interviews/${interviewId}/cancel`);
    return response.data;
  },

  deleteInterview: async (interviewId: string) => {
    const response = await apiClient.delete(`/recruitment/interviews/${interviewId}`);
    return response.data;
  },

  updateInterview: async (interviewId: string, data: any) => {
    const response = await apiClient.put(`/recruitment/interviews/${interviewId}`, data);
    return normalizeInterview(response.data.data);
  },

  submitInterviewFeedback: async (interviewId: string, data: Partial<InterviewFeedback>) => {
    const response = await apiClient.post(`/recruitment/interviews/${interviewId}/feedback`, data);
    return response.data;
  },

  getInterviewFeedback: async (interviewId: string) => {
    const response = await apiClient.get(`/recruitment/interviews/${interviewId}/feedback`);
    return response.data.data;
  },

  // Offer Letters
  getOfferLetters: async () => {
    const response = await apiClient.get('/recruitment/offer-letters');
    return response.data.data || [];
  },

  generateOfferLetter: async (data: Partial<OfferLetter>) => {
    const response = await apiClient.post('/recruitment/offer-letters', data);
    return response.data.data;
  },

  sendOfferLetter: async (offerLetterId: string) => {
    const response = await apiClient.post(`/recruitment/offer-letters/${offerLetterId}/send`);
    return response.data;
  },

  acceptOfferLetter: async (offerLetterId: string) => {
    const response = await apiClient.post(`/recruitment/offer-letters/${offerLetterId}/accept`);
    return response.data;
  },

  deleteOfferLetter: async (offerLetterId: string) => {
    const response = await apiClient.delete(`/recruitment/offer-letters/${offerLetterId}`);
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
    return response.data.data;
  },

  // Candidate Communication
  sendCommunication: async (data: SendCommunicationDTO) => {
    const response = await apiClient.post('/recruitment/communications', data);
    return response.data;
  },

  getCommunicationHistory: async (applicantId: string) => {
    const response = await apiClient.get(`/recruitment/communications/${applicantId}`);
    return response.data.data || [];
  },

  markCommunicationAsRead: async (communicationId: string) => {
    const response = await apiClient.put(`/recruitment/communications/${communicationId}/read`);
    return response.data;
  },

  syncFormResponses: async () => {
    const response = await apiClient.post('/recruitment/forms/sync');
    return response.data;
  },
};
