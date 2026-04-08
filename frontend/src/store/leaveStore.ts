import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Leave,
  LeaveBalance,
  LeaveType,
  CompanyHoliday,
  LeaveCalendarEntry,
} from '../types/leave';
import { leaveService } from '../services/leaveService';

interface LeaveState {
  // Leave Types
  leaveTypes: LeaveType[];
  loadingLeaveTypes: boolean;
  fetchLeaveTypes: (activeOnly?: boolean) => Promise<void>;
  createLeaveType: (data: any) => Promise<void>;
  updateLeaveType: (id: string, data: any) => Promise<void>;
  deleteLeaveType: (id: string) => Promise<void>;

  // Holidays
  holidays: CompanyHoliday[];
  loadingHolidays: boolean;
  fetchHolidays: (year?: number, type?: string) => Promise<void>;
  createHoliday: (data: any) => Promise<void>;
  updateHoliday: (id: string, data: any) => Promise<void>;
  deleteHoliday: (id: string) => Promise<void>;

  // Leave Balances
  leaveBalances: LeaveBalance[];
  loadingBalances: boolean;
  fetchLeaveBalance: (employeeId: string, year?: number) => Promise<void>;

  // Team Calendar
  teamCalendar: LeaveCalendarEntry[];
  loadingTeamCalendar: boolean;
  fetchTeamLeaveCalendar: () => Promise<void>;

  // Leave Requests
  leaves: Leave[];
  loadingLeaves: boolean;
  fetchLeaves: (filters?: any) => Promise<void>;
  fetchPendingLeaves: () => Promise<void>;
  applyLeave: (data: any) => Promise<void>;
  approveLeave: (id: string) => Promise<void>;
  rejectLeave: (id: string, reason: string) => Promise<void>;
  cancelLeave: (id: string) => Promise<void>;

  // Error handling
  error: string | null;
  clearError: () => void;
}

export const useLeaveStore = create<LeaveState>()(
  persist(
    (set) => ({
      // Leave Types
      leaveTypes: [],
      loadingLeaveTypes: false,
      fetchLeaveTypes: async (activeOnly = true) => {
        set({ loadingLeaveTypes: true, error: null });
        try {
          const data = await leaveService.getLeaveTypes(activeOnly);
          set({ leaveTypes: data });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingLeaveTypes: false });
        }
      },
      createLeaveType: async (data) => {
        set({ error: null });
        try {
          await leaveService.createLeaveType(data);
          const types = await leaveService.getLeaveTypes();
          set({ leaveTypes: types });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
      updateLeaveType: async (id, data) => {
        set({ error: null });
        try {
          await leaveService.updateLeaveType(id, data);
          const types = await leaveService.getLeaveTypes(false);
          set({ leaveTypes: types });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
      deleteLeaveType: async (id) => {
        set({ error: null });
        try {
          await leaveService.deleteLeaveType(id);
          set((state) => ({
            leaveTypes: state.leaveTypes.filter((lt) => lt.id !== id),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Holidays
      holidays: [],
      loadingHolidays: false,
      fetchHolidays: async (year, type) => {
        set({ loadingHolidays: true, error: null });
        try {
          const data = await leaveService.getHolidays(year, type as any);
          set({ holidays: data });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingHolidays: false });
        }
      },
      createHoliday: async (data) => {
        set({ error: null });
        try {
          await leaveService.createHoliday(data);
          const holidays = await leaveService.getHolidays();
          set({ holidays });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
      updateHoliday: async (id, data) => {
        set({ error: null });
        try {
          await leaveService.updateHoliday(id, data);
          const holidays = await leaveService.getHolidays();
          set({ holidays });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
      deleteHoliday: async (id) => {
        set({ error: null });
        try {
          await leaveService.deleteHoliday(id);
          set((state) => ({
            holidays: state.holidays.filter((h) => h.id !== id),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Leave Balances
      leaveBalances: [],
      loadingBalances: false,
      fetchLeaveBalance: async (employeeId, year) => {
        set({ loadingBalances: true, error: null });
        try {
          const data = await leaveService.getLeaveBalance(employeeId, year);
          set({ leaveBalances: data });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingBalances: false });
        }
      },

      // Team Calendar
      teamCalendar: [],
      loadingTeamCalendar: false,
      fetchTeamLeaveCalendar: async () => {
        set({ loadingTeamCalendar: true, error: null });
        try {
          const data = await leaveService.getTeamLeaveCalendar();
          set({ teamCalendar: data });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingTeamCalendar: false });
        }
      },

      // Leave Requests
      leaves: [],
      loadingLeaves: false,
      fetchLeaves: async (filters) => {
        set({ loadingLeaves: true, error: null });
        try {
          const data = await leaveService.getLeaves(filters);
          set({ leaves: data });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingLeaves: false });
        }
      },
      fetchPendingLeaves: async () => {
        set({ loadingLeaves: true, error: null });
        try {
          const data = await leaveService.getPendingLeaves();
          set({ leaves: data });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingLeaves: false });
        }
      },
      applyLeave: async (data) => {
        set({ error: null });
        try {
          await leaveService.applyLeave(data);
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
      approveLeave: async (id) => {
        set({ error: null });
        try {
          await leaveService.approveLeave(id);
          // Refresh leaves after approval
          const data = await leaveService.getLeaves();
          set({ leaves: data });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
      rejectLeave: async (id, reason) => {
        set({ error: null });
        try {
          await leaveService.rejectLeave(id, reason);
          // Refresh leaves after rejection
          const data = await leaveService.getLeaves();
          set({ leaves: data });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },
      cancelLeave: async (id) => {
        set({ error: null });
        try {
          await leaveService.cancelLeave(id);
          // Refresh leaves after cancellation
          const data = await leaveService.getLeaves();
          set({ leaves: data });
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Error handling
      error: null,
      clearError: () => set({ error: null }),
    }),
    {
      name: 'leave-store',
      partialize: (state) => ({
        leaveTypes: state.leaveTypes,
        holidays: state.holidays,
      }),
    }
  )
);
