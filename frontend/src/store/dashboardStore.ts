import { create } from 'zustand';
import { DashboardStats } from '../types/dashboard';
import { dashboardService } from '../services/dashboardService';

interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  autoRefreshEnabled: boolean;
  refreshInterval: number; // in milliseconds

  // Actions
  fetchStats: () => Promise<void>;
  setAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (interval: number) => void;
  reset: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: null,
  loading: false,
  error: null,
  lastRefresh: null,
  autoRefreshEnabled: true,
  refreshInterval: 5 * 60 * 1000, // 5 minutes default

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const data = await dashboardService.getDashboardStats();
      set({
        stats: data,
        loading: false,
        lastRefresh: new Date(),
        error: null,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard stats';
      set({
        loading: false,
        error: errorMessage,
      });
      console.error('Dashboard fetch error:', err);
    }
  },

  setAutoRefresh: (enabled: boolean) => {
    set({ autoRefreshEnabled: enabled });
  },

  setRefreshInterval: (interval: number) => {
    set({ refreshInterval: interval });
  },

  reset: () => {
    set({
      stats: null,
      loading: false,
      error: null,
      lastRefresh: null,
      autoRefreshEnabled: true,
      refreshInterval: 5 * 60 * 1000,
    });
  },
}));
