import { create } from 'zustand';
import { recruitmentService } from '../services/recruitmentService';
import {
  JobPosting,
  Applicant,
  Interview,
  OfferLetter,
  OnboardingChecklist,
} from '../types/recruitment';

interface RecruitmentState {
  // Data
  jobs: JobPosting[];
  currentJob: JobPosting | null;
  candidates: Applicant[];
  interviews: Interview[];
  currentInterview: Interview | null;
  offers: OfferLetter[];
  onboardingChecklists: OnboardingChecklist[];

  // UI State
  loading: boolean;
  error: string | null;

  // Actions
  fetchJobs: (filters?: any) => Promise<void>;
  fetchJob: (id: string) => Promise<void>;
  createJob: (data: Partial<JobPosting>) => Promise<void>;
  fetchCandidates: (filters?: any) => Promise<void>;
  addCandidate: (jobPostingId: string, data: Partial<Applicant>) => Promise<void>;
  moveCandidateStage: (applicantId: string, stage: string) => Promise<void>;
  fetchInterviews: (filters?: any) => Promise<void>;
  scheduleInterview: (data: Partial<Interview>) => Promise<void>;
  cancelInterview: (interviewId: string) => Promise<void>;
  submitFeedback: (interviewId: string, data: any) => Promise<void>;
  generateOffer: (data: Partial<OfferLetter>) => Promise<void>;
  sendOffer: (offerLetterId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  jobs: [],
  currentJob: null,
  candidates: [],
  interviews: [],
  currentInterview: null,
  offers: [],
  onboardingChecklists: [],
  loading: false,
  error: null,
};

export const useRecruitmentStore = create<RecruitmentState>((set, get) => ({
  ...initialState,

  fetchJobs: async (filters) => {
    set({ loading: true, error: null });
    try {
      const jobs = await recruitmentService.getJobPostings(filters);
      set({ jobs: Array.isArray(jobs) ? jobs : [], loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false, jobs: [] });
    }
  },

  fetchJob: async (id) => {
    set({ loading: true, error: null });
    try {
      const job = await recruitmentService.getJobPosting(id);
      set({ currentJob: job, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createJob: async (data) => {
    set({ loading: true, error: null });
    try {
      const job = await recruitmentService.createJobPosting(data);
      set((state) => ({ jobs: [job, ...state.jobs], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  fetchCandidates: async (filters) => {
    set({ loading: true, error: null });
    try {
      const candidates = await recruitmentService.getApplicants(filters);
      set({ candidates: Array.isArray(candidates) ? candidates : [], loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false, candidates: [] });
    }
  },

  addCandidate: async (jobPostingId, data) => {
    set({ loading: true, error: null });
    try {
      const candidate = await recruitmentService.addApplicant(jobPostingId, data);
      set((state) => ({ candidates: [candidate, ...state.candidates], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  moveCandidateStage: async (applicantId, stage) => {
    set({ loading: true, error: null });
    try {
      await recruitmentService.moveApplicantStage(applicantId, stage);
      set((state) => ({
        candidates: state.candidates.map((c) =>
          c.id === applicantId ? { ...c, stage } : c
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  scheduleInterview: async (data) => {
    set({ loading: true, error: null });
    try {
      const interview = await recruitmentService.scheduleInterview(data);
      set((state) => ({ interviews: [interview, ...state.interviews], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  fetchInterviews: async (filters) => {
    set({ loading: true, error: null });
    try {
      const interviews = await recruitmentService.getInterviews(filters);
      set({ interviews: Array.isArray(interviews) ? interviews : [], loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false, interviews: [] });
    }
  },

  cancelInterview: async (interviewId) => {
    set({ loading: true, error: null });
    try {
      await recruitmentService.cancelInterview(interviewId);
      set((state) => ({
        interviews: state.interviews.map((i) =>
          i.id === interviewId ? { ...i, status: 'Cancelled' } : i
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  submitFeedback: async (interviewId, data) => {
    set({ loading: true, error: null });
    try {
      await recruitmentService.submitInterviewFeedback(interviewId, data);
      set((state) => ({
        interviews: state.interviews.map((i) =>
          i.id === interviewId ? { ...i, status: 'Completed' } : i
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  generateOffer: async (data) => {
    set({ loading: true, error: null });
    try {
      const offer = await recruitmentService.generateOfferLetter(data);
      set((state) => ({ offers: [offer, ...state.offers], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  sendOffer: async (offerLetterId) => {
    set({ loading: true, error: null });
    try {
      await recruitmentService.sendOfferLetter(offerLetterId);
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));
