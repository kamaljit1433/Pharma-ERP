import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ResignationData {
  resignation_date: Date;
  last_working_day: Date;
  reason?: string;
}

export interface TerminationData {
  termination_date: Date;
  reason: string;
  termination_type: 'voluntary' | 'involuntary' | 'retirement' | 'contract_end';
  final_settlement_date?: Date;
}

export interface ExitInterviewData {
  conducted_by: string;
  questionnaire_responses: Record<string, string>;
  feedback: string;
}

export interface FnFSettlement {
  id: string;
  employee_id: string;
  pending_salary: number;
  leave_encashment: number;
  gratuity: number;
  bonus: number;
  other_benefits: number;
  total_earnings: number;
  advance_deduction: number;
  asset_damage_deduction: number;
  other_deductions: number;
  total_deductions: number;
  net_settlement: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'paid';
  approved_by?: string;
  approved_at?: Date;
  paid_at?: Date;
}

export interface AssetRecoveryItem {
  id: string;
  employee_id: string;
  asset_id: string;
  status: 'pending' | 'returned' | 'damaged' | 'missing';
  damage_cost?: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OffboardingStatus {
  canDeactivate: boolean;
  missingItems: string[];
  exitInterviewCompleted: boolean;
  fnfSettlementApproved: boolean;
  assetsRecovered: boolean;
  systemAccessRevoked: boolean;
  dataArchived: boolean;
}

interface SeparationState {
  // Resignation
  resignation: ResignationData | null;
  setResignation: (data: ResignationData) => void;
  clearResignation: () => void;

  // Termination
  termination: TerminationData | null;
  setTermination: (data: TerminationData) => void;
  clearTermination: () => void;

  // Exit Interview
  exitInterview: ExitInterviewData | null;
  setExitInterview: (data: ExitInterviewData) => void;
  clearExitInterview: () => void;

  // F&F Settlement
  fnfSettlement: FnFSettlement | null;
  setFnFSettlement: (data: FnFSettlement) => void;
  clearFnFSettlement: () => void;

  // Asset Recovery
  assetRecovery: AssetRecoveryItem[];
  setAssetRecovery: (items: AssetRecoveryItem[]) => void;
  updateAssetRecoveryItem: (id: string, item: Partial<AssetRecoveryItem>) => void;
  clearAssetRecovery: () => void;

  // Offboarding Status
  offboardingStatus: OffboardingStatus | null;
  setOffboardingStatus: (status: OffboardingStatus) => void;
  clearOffboardingStatus: () => void;

  // Loading and error states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;

  // Clear all
  clearAll: () => void;
}

export const useSeparationStore = create<SeparationState>()(
  persist(
    (set) => ({
      // Resignation
      resignation: null,
      setResignation: (data) => set({ resignation: data }),
      clearResignation: () => set({ resignation: null }),

      // Termination
      termination: null,
      setTermination: (data) => set({ termination: data }),
      clearTermination: () => set({ termination: null }),

      // Exit Interview
      exitInterview: null,
      setExitInterview: (data) => set({ exitInterview: data }),
      clearExitInterview: () => set({ exitInterview: null }),

      // F&F Settlement
      fnfSettlement: null,
      setFnFSettlement: (data) => set({ fnfSettlement: data }),
      clearFnFSettlement: () => set({ fnfSettlement: null }),

      // Asset Recovery
      assetRecovery: [],
      setAssetRecovery: (items) => set({ assetRecovery: items }),
      updateAssetRecoveryItem: (id, item) =>
        set((state) => ({
          assetRecovery: state.assetRecovery.map((a) =>
            a.id === id ? { ...a, ...item } : a
          ),
        })),
      clearAssetRecovery: () => set({ assetRecovery: [] }),

      // Offboarding Status
      offboardingStatus: null,
      setOffboardingStatus: (status) => set({ offboardingStatus: status }),
      clearOffboardingStatus: () => set({ offboardingStatus: null }),

      // Loading and error states
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      error: null,
      setError: (error) => set({ error }),

      // Clear all
      clearAll: () =>
        set({
          resignation: null,
          termination: null,
          exitInterview: null,
          fnfSettlement: null,
          assetRecovery: [],
          offboardingStatus: null,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: 'separation-store',
    }
  )
);
