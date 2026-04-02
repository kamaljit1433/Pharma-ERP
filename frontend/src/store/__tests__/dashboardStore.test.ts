import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useDashboardStore } from '../dashboardStore';
import { dashboardService } from '../../services/dashboardService';
import { DashboardStats } from '../../types/dashboard';

// Mock the dashboard service
vi.mock('../../services/dashboardService', () => ({
  dashboardService: {
    getDashboardStats: vi.fn(),
  },
}));

describe('dashboardStore', () => {
  const mockStats: DashboardStats = {
    employees: {
      total: 100,
      active: 85,
      onLeave: 10,
      suspended: 2,
      resigned: 2,
      terminated: 1,
      byDepartment: {},
      byDesignation: {},
      newHiresThisMonth: 5,
      separationsThisMonth: 1,
    },
    attendance: {
      totalEmployees: 100,
      presentToday: 85,
      absentToday: 10,
      onLeaveToday: 5,
      halfDayToday: 0,
      attendanceRate: 85,
      monthlyAttendanceRate: 88,
      lateCheckIns: 5,
      incompleteCheckOuts: 3,
      topAbsentees: [],
    },
    leaves: {
      totalLeaveRequests: 50,
      pendingApprovals: 5,
      approvedThisMonth: 20,
      rejectedThisMonth: 2,
      cancelledThisMonth: 1,
      leaveTypeBreakdown: {},
      employeesOnLeaveToday: 5,
      upcomingLeaves: [],
    },
    payroll: {
      totalEmployees: 100,
      processedThisMonth: 95,
      pendingProcessing: 5,
      totalPayrollAmount: 500000,
      averageSalary: 5000,
      totalDeductions: 50000,
      totalEarnings: 500000,
      payrollByStatus: {},
      advanceSalaryRequests: 2,
      reimbursementClaims: 3,
    },
    recruitment: {
      openPositions: 5,
      totalApplicants: 50,
      applicantsByStage: {},
      offersExtended: 5,
      offersAccepted: 3,
      offersRejected: 1,
      averageTimeToHire: 30,
      topSourceOfApplicants: {},
      recentHires: [],
    },
    generatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useDashboardStore.setState({
      stats: null,
      loading: false,
      error: null,
      lastRefresh: null,
      autoRefreshEnabled: true,
      refreshInterval: 5 * 60 * 1000,
    });
  });

  it('has initial state', () => {
    const state = useDashboardStore.getState();

    expect(state.stats).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.lastRefresh).toBeNull();
    expect(state.autoRefreshEnabled).toBe(true);
    expect(state.refreshInterval).toBe(5 * 60 * 1000);
  });

  it('fetches stats successfully', async () => {
    (dashboardService.getDashboardStats as any).mockResolvedValue(mockStats);

    const store = useDashboardStore.getState();
    await store.fetchStats();

    const state = useDashboardStore.getState();
    expect(state.stats).toEqual(mockStats);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.lastRefresh).not.toBeNull();
  });

  it('handles fetch error', async () => {
    const error = new Error('Network error');
    (dashboardService.getDashboardStats as any).mockRejectedValue(error);

    const store = useDashboardStore.getState();
    await store.fetchStats();

    const state = useDashboardStore.getState();
    expect(state.stats).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Network error');
  });

  it('sets loading state during fetch', async () => {
    (dashboardService.getDashboardStats as any).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockStats), 100))
    );

    const store = useDashboardStore.getState();
    const fetchPromise = store.fetchStats();

    // Check loading state immediately
    let state = useDashboardStore.getState();
    expect(state.loading).toBe(true);

    await fetchPromise;

    // Check loading state after fetch
    state = useDashboardStore.getState();
    expect(state.loading).toBe(false);
  });

  it('toggles auto refresh', () => {
    let state = useDashboardStore.getState();
    expect(state.autoRefreshEnabled).toBe(true);

    state.setAutoRefresh(false);
    state = useDashboardStore.getState();
    expect(state.autoRefreshEnabled).toBe(false);

    state.setAutoRefresh(true);
    state = useDashboardStore.getState();
    expect(state.autoRefreshEnabled).toBe(true);
  });

  it('sets refresh interval', () => {
    const newInterval = 10 * 60 * 1000; // 10 minutes
    const store = useDashboardStore.getState();
    store.setRefreshInterval(newInterval);

    const state = useDashboardStore.getState();
    expect(state.refreshInterval).toBe(newInterval);
  });

  it('resets store to initial state', async () => {
    // Set some data first
    (dashboardService.getDashboardStats as any).mockResolvedValue(mockStats);
    const store = useDashboardStore.getState();
    await store.fetchStats();

    // Verify data is set
    let state = useDashboardStore.getState();
    expect(state.stats).not.toBeNull();

    // Reset
    store.reset();

    // Verify reset
    state = useDashboardStore.getState();
    expect(state.stats).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.lastRefresh).toBeNull();
    expect(state.autoRefreshEnabled).toBe(true);
    expect(state.refreshInterval).toBe(5 * 60 * 1000);
  });

  it('updates lastRefresh timestamp on successful fetch', async () => {
    (dashboardService.getDashboardStats as any).mockResolvedValue(mockStats);

    const store = useDashboardStore.getState();
    const beforeFetch = new Date();
    await store.fetchStats();
    const afterFetch = new Date();

    const state = useDashboardStore.getState();
    expect(state.lastRefresh).not.toBeNull();
    expect(state.lastRefresh!.getTime()).toBeGreaterThanOrEqual(beforeFetch.getTime());
    expect(state.lastRefresh!.getTime()).toBeLessThanOrEqual(afterFetch.getTime());
  });

  it('clears error on successful fetch', async () => {
    // Set an error first
    useDashboardStore.setState({ error: 'Previous error' });

    (dashboardService.getDashboardStats as any).mockResolvedValue(mockStats);

    const store = useDashboardStore.getState();
    await store.fetchStats();

    const state = useDashboardStore.getState();
    expect(state.error).toBeNull();
  });
});
