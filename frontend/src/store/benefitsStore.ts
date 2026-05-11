import { create } from 'zustand';
import { benefitsService } from '../services/benefitsService';

interface InsurancePlan {
  id: string;
  name: string;
  provider: string;
  coverage_type: string;
  premium_amount: number;
  is_active: boolean;
}

interface ReimbursementClaim {
  id: string;
  employee_id: string;
  type: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  submitted_date: string;
}

interface Reward {
  id: string;
  employee_id: string;
  title: string;
  description: string;
  amount?: number;
  awarded_date: string;
}

interface BenefitsState {
  // Data
  insurancePlans: InsurancePlan[];
  reimbursements: ReimbursementClaim[];
  rewards: Reward[];
  pfDetails: any;

  // UI State
  loading: boolean;
  error: string | null;

  // Actions
  fetchInsurancePlans: () => Promise<void>;
  enrollInInsurance: (data: any) => Promise<void>;
  fetchPFDetails: (employeeId: string) => Promise<void>;
  submitReimbursement: (data: any) => Promise<void>;
  fetchReimbursements: (employeeId: string) => Promise<void>;
  approveReimbursement: (id: string, approverId: string) => Promise<void>;
  rejectReimbursement: (id: string, approverId: string, notes: string) => Promise<void>;
  fetchRewards: (employeeId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  insurancePlans: [],
  reimbursements: [],
  rewards: [],
  pfDetails: null,
  loading: false,
  error: null,
};

export const useBenefitsStore = create<BenefitsState>((set, get) => ({
  ...initialState,

  fetchInsurancePlans: async () => {
    set({ loading: true, error: null });
    try {
      const plans = await benefitsService.getInsurancePlans(true);
      set({ insurancePlans: plans, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  enrollInInsurance: async (data) => {
    set({ loading: true, error: null });
    try {
      await benefitsService.enrollInInsurance(data);
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  fetchPFDetails: async (employeeId) => {
    set({ loading: true, error: null });
    try {
      const pfDetails = await benefitsService.getPFDetails(employeeId);
      set({ pfDetails, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  submitReimbursement: async (data) => {
    set({ loading: true, error: null });
    try {
      const claim = await benefitsService.submitReimbursementClaim(data);
      set((state) => ({ reimbursements: [claim, ...state.reimbursements], loading: false }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  fetchReimbursements: async (employeeId) => {
    set({ loading: true, error: null });
    try {
      const reimbursements = await benefitsService.getEmployeeClaims(employeeId);
      set({ reimbursements, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  approveReimbursement: async (id, approverId) => {
    set({ loading: true, error: null });
    try {
      await benefitsService.approveClaim(id, approverId);
      set((state) => ({
        reimbursements: state.reimbursements.map((r) =>
          r.id === id ? { ...r, status: 'approved' as const } : r
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  rejectReimbursement: async (id, approverId, notes) => {
    set({ loading: true, error: null });
    try {
      await benefitsService.rejectClaim(id, approverId, notes);
      set((state) => ({
        reimbursements: state.reimbursements.map((r) =>
          r.id === id ? { ...r, status: 'rejected' as const } : r
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  fetchRewards: async (employeeId) => {
    set({ loading: true, error: null });
    try {
      const rewards = await benefitsService.getEmployeeRewards(employeeId);
      set({ rewards, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));
