import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { performanceService } from '../services/performanceService';

interface Goal {
  id: string;
  employeeId: string;
  cycleId: string;
  type: 'OKR' | 'KPI';
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  weight: number;
  dueDate: string;
  status: 'On Track' | 'At Risk' | 'Behind' | 'Completed';
  createdAt: string;
  updatedAt: string;
}

interface ReviewCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Planning' | 'Active' | 'Closed' | 'Finalized';
  createdAt: string;
}

interface PerformanceReview {
  id: string;
  employeeId: string;
  cycleId: string;
  selfRating?: number;
  managerRating?: number;
  peerRatings: number[];
  finalRating: number;
  comments: string;
  status: 'Pending' | 'Self-Assessment Complete' | 'Manager Review Complete' | 'Finalized';
  completedAt?: string;
}

interface Feedback {
  id: string;
  toEmployeeId: string;
  fromEmployeeId: string;
  type: 'Positive' | 'Constructive' | 'Neutral';
  content: string;
  isAnonymous: boolean;
  visibility: 'Private' | 'Manager Only' | 'Public';
  createdAt: string;
}

interface PIP {
  id: string;
  employeeId: string;
  initiatedBy: string;
  goals: string[];
  startDate: string;
  endDate: string;
  status: 'Active' | 'Completed';
  outcome?: 'Completed' | 'Extended' | 'Escalated';
  createdAt: string;
}

interface PerformanceState {
  // Goals
  goals: Goal[];
  loadingGoals: boolean;
  fetchAllGoals: () => Promise<void>;
  fetchEmployeeGoals: (employeeId: string, cycleId?: string) => Promise<void>;
  createGoal: (data: any) => Promise<void>;
  updateGoal: (id: string, data: any) => Promise<void>;
  updateGoalProgress: (id: string, currentValue: number, comment?: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Review Cycles
  reviewCycles: ReviewCycle[];
  loadingCycles: boolean;
  fetchReviewCycles: (status?: string) => Promise<void>;
  createReviewCycle: (data: any) => Promise<void>;
  updateReviewCycle: (id: string, data: any) => Promise<void>;
  transitionCycleStatus: (id: string, newStatus: string) => Promise<void>;
  deleteReviewCycle: (id: string) => Promise<void>;

  // Reviews
  reviews: PerformanceReview[];
  loadingReviews: boolean;
  fetchAllReviews: () => Promise<void>;
  fetchEmployeeReviews: (employeeId: string, cycleId?: string) => Promise<void>;
  submitReview: (data: any) => Promise<void>;
  updateReview: (id: string, data: any) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;

  // Feedback
  feedback: Feedback[];
  loadingFeedback: boolean;
  fetchAllFeedback: () => Promise<void>;
  fetchEmployeeFeedback: (employeeId: string) => Promise<void>;
  provideFeedback: (data: any) => Promise<void>;
  updateFeedback: (id: string, data: any) => Promise<void>;
  deleteFeedback: (id: string) => Promise<void>;

  // PIPs
  pips: PIP[];
  loadingPIPs: boolean;
  fetchActivePIPs: () => Promise<void>;
  fetchEmployeePIPs: (employeeId: string) => Promise<void>;
  initiatePIP: (data: any) => Promise<void>;
  recordPIPCheckIn: (pipId: string, data: any) => Promise<void>;
  recordPIPOutcome: (pipId: string, outcome: string, notes?: string) => Promise<void>;

  // Dashboard
  dashboardStats: any;
  loadingDashboard: boolean;
  fetchDashboardStats: () => Promise<void>;

  // Error handling
  error: string | null;
  clearError: () => void;
}

export const usePerformanceStore = create<PerformanceState>()(
  persist(
    (set) => ({
      // Goals
      goals: [],
      loadingGoals: false,
      fetchAllGoals: async () => {
        set({ loadingGoals: true, error: null });
        try {
          const data = await performanceService.getAllGoals();
          set({ goals: data });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingGoals: false });
        }
      },
      fetchEmployeeGoals: async (employeeId, cycleId) => {
        set({ loadingGoals: true, error: null });
        try {
          const data = await performanceService.getEmployeeGoals(employeeId, cycleId);
          set({ goals: data });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingGoals: false });
        }
      },
      createGoal: async (data) => {
        set({ error: null });
        try {
          await performanceService.createGoal(data);
          const fresh = await performanceService.getAllGoals();
          set({ goals: fresh });
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },
      updateGoal: async (id, data) => {
        set({ error: null });
        try {
          await performanceService.updateGoal(id, data);
          const fresh = await performanceService.getAllGoals();
          set({ goals: fresh });
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },
      updateGoalProgress: async (id, currentValue, comment) => {
        set({ error: null });
        try {
          await performanceService.updateGoalProgress(id, currentValue, comment);
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
      deleteGoal: async (id) => {
        set({ error: null });
        try {
          await performanceService.deleteGoal(id);
          set((state) => ({
            goals: state.goals.filter((g) => g.id !== id),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Review Cycles
      reviewCycles: [],
      loadingCycles: false,
      fetchReviewCycles: async (status) => {
        set({ loadingCycles: true, error: null });
        try {
          const data = await performanceService.getReviewCycles(status);
          // API returns snake_case — normalise to camelCase for the store
          const mapped = (data as any[]).map((c) => ({
            id: c.id,
            name: c.name,
            startDate: c.startDate ?? c.start_date,
            endDate: c.endDate ?? c.end_date,
            status: c.status,
            createdAt: c.createdAt ?? c.created_at,
          }));
          set({ reviewCycles: mapped });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingCycles: false });
        }
      },
      createReviewCycle: async (data) => {
        set({ error: null });
        try {
          await performanceService.createReviewCycle(data);
          // Refresh the list so the new cycle appears immediately
          const fresh = await performanceService.getReviewCycles();
          const mapped = (fresh as any[]).map((c) => ({
            id: c.id,
            name: c.name,
            startDate: c.startDate ?? c.start_date,
            endDate: c.endDate ?? c.end_date,
            status: c.status,
            createdAt: c.createdAt ?? c.created_at,
          }));
          set({ reviewCycles: mapped });
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },
      updateReviewCycle: async (id, data) => {
        set({ error: null });
        try {
          await performanceService.updateReviewCycle(id, data);
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },
      transitionCycleStatus: async (id, newStatus) => {
        set({ error: null });
        try {
          await performanceService.transitionCycleStatus(id, newStatus);
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },
      deleteReviewCycle: async (id) => {
        set({ error: null });
        try {
          await performanceService.deleteReviewCycle(id);
          set((state) => ({
            reviewCycles: state.reviewCycles.filter((c) => c.id !== id),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Reviews
      reviews: [],
      loadingReviews: false,
      fetchAllReviews: async () => {
        set({ loadingReviews: true, error: null });
        try {
          const data = await performanceService.getAllReviews();
          set({ reviews: Array.isArray(data) ? data : (data.data ?? []) });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingReviews: false });
        }
      },
      fetchEmployeeReviews: async (employeeId, cycleId) => {
        set({ loadingReviews: true, error: null });
        try {
          const data = await performanceService.getEmployeeReviews(employeeId, cycleId);
          set({ reviews: data });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingReviews: false });
        }
      },
      submitReview: async (data) => {
        set({ error: null });
        try {
          await performanceService.submitReview(data);
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },
      updateReview: async (id, data) => {
        set({ error: null });
        try {
          await performanceService.updateReview(id, data);
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
      deleteReview: async (id) => {
        set({ error: null });
        try {
          await performanceService.deleteReview(id);
          set((state) => ({ reviews: state.reviews.filter((r: any) => r.id !== id) }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Feedback
      feedback: [],
      loadingFeedback: false,
      fetchAllFeedback: async () => {
        set({ loadingFeedback: true, error: null });
        try {
          const data = await performanceService.getAllFeedback();
          set({ feedback: Array.isArray(data) ? data : (data.data ?? []) });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingFeedback: false });
        }
      },
      fetchEmployeeFeedback: async (employeeId) => {
        set({ loadingFeedback: true, error: null });
        try {
          const data = await performanceService.getEmployeeFeedback(employeeId);
          set({ feedback: data });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingFeedback: false });
        }
      },
      provideFeedback: async (data) => {
        set({ error: null });
        try {
          await performanceService.provideFeedback(data);
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },
      updateFeedback: async (id, data) => {
        set({ error: null });
        try {
          const updated = await performanceService.updateFeedback(id, data);
          set((state) => ({
            feedback: state.feedback.map((f: any) => (f.id === id ? { ...f, ...updated } : f)),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
      deleteFeedback: async (id) => {
        set({ error: null });
        try {
          await performanceService.deleteFeedback(id);
          set((state) => ({ feedback: state.feedback.filter((f: any) => f.id !== id) }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // PIPs
      pips: [],
      loadingPIPs: false,
      fetchActivePIPs: async () => {
        set({ loadingPIPs: true, error: null });
        try {
          const data = await performanceService.getActivePIPs();
          set({ pips: data });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingPIPs: false });
        }
      },
      fetchEmployeePIPs: async (employeeId) => {
        set({ loadingPIPs: true, error: null });
        try {
          const data = await performanceService.getEmployeePIPs(employeeId);
          set({ pips: data });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingPIPs: false });
        }
      },
      initiatePIP: async (data) => {
        set({ error: null });
        try {
          await performanceService.initiatePIP(data);
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
      recordPIPCheckIn: async (pipId, data) => {
        set({ error: null });
        try {
          await performanceService.recordPIPCheckIn(pipId, data);
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
      recordPIPOutcome: async (pipId, outcome, notes) => {
        set({ error: null });
        try {
          await performanceService.recordPIPOutcome(pipId, outcome, notes);
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Dashboard
      dashboardStats: null,
      loadingDashboard: false,
      fetchDashboardStats: async () => {
        set({ loadingDashboard: true, error: null });
        try {
          const data = await performanceService.getPerformanceDashboard();
          set({ dashboardStats: data });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingDashboard: false });
        }
      },

      // Error handling
      error: null,
      clearError: () => set({ error: null }),
    }),
    {
      name: 'performance-store',
      partialize: (state) => ({
        goals: state.goals,
        reviewCycles: state.reviewCycles,
        reviews: state.reviews,
        feedback: state.feedback,
        pips: state.pips,
      }),
    }
  )
);
