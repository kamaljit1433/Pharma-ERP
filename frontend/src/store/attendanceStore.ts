import { create } from 'zustand';
import attendanceService, {
  AttendanceRecord,
  MarkAttendanceDTO,
  AttendanceStats,
  RegularizationRequest,
  AttendanceFilters,
} from '../services/attendanceService';

interface AttendanceState {
  // Data
  records: AttendanceRecord[];
  currentStatus: AttendanceRecord | null;
  stats: AttendanceStats | null;
  teamRecords: AttendanceRecord[];

  // UI State
  loading: boolean;
  error: string | null;

  // Actions
  markAttendance: (data: MarkAttendanceDTO) => Promise<AttendanceRecord>;
  fetchRecords: (filters?: AttendanceFilters) => Promise<void>;
  fetchCurrentStatus: (employeeId: string) => Promise<void>;
  fetchStats: (employeeId: string, fromDate?: string, toDate?: string) => Promise<void>;
  requestRegularization: (data: RegularizationRequest) => Promise<void>;
  fetchTeamAttendance: (date?: string) => Promise<void>;
  exportRecords: (filters?: AttendanceFilters) => Promise<Blob>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  records: [],
  currentStatus: null,
  stats: null,
  teamRecords: [],
  loading: false,
  error: null,
};

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  ...initialState,

  // Mark attendance
  markAttendance: async (data) => {
    set({ loading: true, error: null });
    try {
      const record = await attendanceService.markAttendance(data);
      set({
        currentStatus: record,
        loading: false,
      });
      // Refresh records
      await get().fetchRecords({ employee_id: data.employee_id });
      return record;
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
      throw error;
    }
  },

  // Fetch attendance records
  fetchRecords: async (filters) => {
    set({ loading: true, error: null });
    try {
      const records = await attendanceService.getRecords(filters);
      set({
        records,
        loading: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
    }
  },

  // Fetch current status
  fetchCurrentStatus: async (employeeId) => {
    set({ loading: true, error: null });
    try {
      const status = await attendanceService.getCurrentStatus(employeeId);
      set({
        currentStatus: status,
        loading: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
    }
  },

  // Fetch stats
  fetchStats: async (employeeId, fromDate, toDate) => {
    set({ loading: true, error: null });
    try {
      const stats = await attendanceService.getStats(employeeId, fromDate, toDate);
      set({
        stats,
        loading: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
    }
  },

  // Request regularization
  requestRegularization: async (data) => {
    set({ loading: true, error: null });
    try {
      await attendanceService.requestRegularization(data);
      set({ loading: false });
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
      throw error;
    }
  },

  // Fetch team attendance
  fetchTeamAttendance: async (date) => {
    set({ loading: true, error: null });
    try {
      const teamRecords = await attendanceService.getTeamAttendance(date);
      set({
        teamRecords,
        loading: false,
      });
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
    }
  },

  // Export records
  exportRecords: async (filters) => {
    set({ loading: true, error: null });
    try {
      const blob = await attendanceService.exportRecords(filters);
      set({ loading: false });
      return blob;
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set(initialState),
}));
