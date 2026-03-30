import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { geoTrackingService, TravelLogResponse, GeoFenceResponse } from '../services/geoTrackingService';
import { GeoTrackingStats } from '../types/geoTracking';

interface GeoTrackingState {
  // Travel Logs
  travelLogs: TravelLogResponse[];
  loadingTravelLogs: boolean;
  fetchDailyJourney: (employeeId: string, date: string) => Promise<void>;
  fetchJourneysByDateRange: (
    employeeId: string,
    startDate: string,
    endDate: string
  ) => Promise<void>;
  approveJourney: (journeyId: string, approverId: string, notes?: string) => Promise<void>;
  rejectJourney: (journeyId: string, approverId: string, reason: string) => Promise<void>;
  exportJourneyData: (
    employeeId: string,
    startDate: string,
    endDate: string,
    format?: 'csv' | 'pdf'
  ) => Promise<Blob>;

  // Travel Allowance
  monthlyAllowance: {
    totalDistance: number;
    totalAllowance: number;
    journeyCount: number;
    rate: number;
    currency: string;
    journeys: TravelLogResponse[];
  } | null;
  loadingAllowance: boolean;
  fetchMonthlyAllowance: (employeeId: string, month: number, year: number) => Promise<void>;

  // Yearly Stats
  yearlyStats: GeoTrackingStats | null;
  loadingStats: boolean;
  fetchYearlyStats: (employeeId: string, year: number) => Promise<void>;

  // Geo-fences
  geoFences: GeoFenceResponse[];
  loadingGeoFences: boolean;
  fetchGeoFences: (type?: string) => Promise<void>;
  createGeoFence: (data: any) => Promise<void>;
  updateGeoFence: (id: string, data: any) => Promise<void>;
  deleteGeoFence: (id: string) => Promise<void>;
  toggleGeoFence: (id: string, enabled: boolean) => Promise<void>;

  // Pending Approvals
  pendingApprovals: TravelLogResponse[];
  loadingApprovals: boolean;
  fetchPendingApprovals: () => Promise<void>;

  // Team Journeys
  teamJourneys: TravelLogResponse[];
  loadingTeamJourneys: boolean;
  fetchTeamJourneys: (managerId: string, startDate: string, endDate: string) => Promise<void>;

  // Error handling
  error: string | null;
  clearError: () => void;
}

export const useGeoTrackingStore = create<GeoTrackingState>()(
  persist(
    (set) => ({
      // Travel Logs
      travelLogs: [],
      loadingTravelLogs: false,
      fetchDailyJourney: async (employeeId, date) => {
        set({ loadingTravelLogs: true, error: null });
        try {
          const data = await geoTrackingService.getDailyJourney(employeeId, date);
          set({ travelLogs: data });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingTravelLogs: false });
        }
      },

      fetchJourneysByDateRange: async (employeeId, startDate, endDate) => {
        set({ loadingTravelLogs: true, error: null });
        try {
          const data = await geoTrackingService.getJourneysByDateRange(
            employeeId,
            startDate,
            endDate
          );
          set({ travelLogs: data });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingTravelLogs: false });
        }
      },

      approveJourney: async (journeyId, approverId, notes) => {
        set({ error: null });
        try {
          await geoTrackingService.approveJourney(journeyId, approverId, notes);
          set((state) => ({
            travelLogs: state.travelLogs.map((log) =>
              log.id === journeyId ? { ...log, status: 'Approved' } : log
            ),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      rejectJourney: async (journeyId, approverId, reason) => {
        set({ error: null });
        try {
          await geoTrackingService.rejectJourney(journeyId, approverId, reason);
          set((state) => ({
            travelLogs: state.travelLogs.map((log) =>
              log.id === journeyId ? { ...log, status: 'Rejected' } : log
            ),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      exportJourneyData: async (employeeId, startDate, endDate, format = 'csv') => {
        set({ error: null });
        try {
          return await geoTrackingService.exportJourneyData(
            employeeId,
            startDate,
            endDate,
            format
          );
        } catch (error) {
          set({ error: (error as Error).message });
          throw error;
        }
      },

      // Travel Allowance
      monthlyAllowance: null,
      loadingAllowance: false,
      fetchMonthlyAllowance: async (employeeId, month, year) => {
        set({ loadingAllowance: true, error: null });
        try {
          const data = await geoTrackingService.getMonthlyAllowance(employeeId, month, year);
          set({ monthlyAllowance: data });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingAllowance: false });
        }
      },

      // Yearly Stats
      yearlyStats: null,
      loadingStats: false,
      fetchYearlyStats: async (employeeId, year) => {
        set({ loadingStats: true, error: null });
        try {
          const data = await geoTrackingService.getYearlyStats(employeeId, year);
          set({ yearlyStats: data });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingStats: false });
        }
      },

      // Geo-fences
      geoFences: [],
      loadingGeoFences: false,
      fetchGeoFences: async (type) => {
        set({ loadingGeoFences: true, error: null });
        try {
          const data = await geoTrackingService.getGeoFences(type);
          set({ geoFences: data });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingGeoFences: false });
        }
      },

      createGeoFence: async (data) => {
        set({ error: null });
        try {
          const newFence = await geoTrackingService.createGeoFence(data);
          set((state) => ({
            geoFences: [...state.geoFences, newFence],
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      updateGeoFence: async (id, data) => {
        set({ error: null });
        try {
          const updated = await geoTrackingService.updateGeoFence(id, data);
          set((state) => ({
            geoFences: state.geoFences.map((fence) =>
              fence.id === id ? updated : fence
            ),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      deleteGeoFence: async (id) => {
        set({ error: null });
        try {
          await geoTrackingService.deleteGeoFence(id);
          set((state) => ({
            geoFences: state.geoFences.filter((fence) => fence.id !== id),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      toggleGeoFence: async (id, enabled) => {
        set({ error: null });
        try {
          const updated = await geoTrackingService.toggleGeoFence(id, enabled);
          set((state) => ({
            geoFences: state.geoFences.map((fence) =>
              fence.id === id ? updated : fence
            ),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      // Pending Approvals
      pendingApprovals: [],
      loadingApprovals: false,
      fetchPendingApprovals: async () => {
        set({ loadingApprovals: true, error: null });
        try {
          const data = await geoTrackingService.getPendingApprovals();
          set({ pendingApprovals: data });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingApprovals: false });
        }
      },

      // Team Journeys
      teamJourneys: [],
      loadingTeamJourneys: false,
      fetchTeamJourneys: async (managerId, startDate, endDate) => {
        set({ loadingTeamJourneys: true, error: null });
        try {
          const data = await geoTrackingService.getTeamJourneys(managerId, startDate, endDate);
          set({ teamJourneys: data });
        } catch (error) {
          set({ error: (error as Error).message });
        } finally {
          set({ loadingTeamJourneys: false });
        }
      },

      // Error handling
      error: null,
      clearError: () => set({ error: null }),
    }),
    {
      name: 'geo-tracking-store',
      partialize: (state) => ({
        geoFences: state.geoFences,
      }),
    }
  )
);
