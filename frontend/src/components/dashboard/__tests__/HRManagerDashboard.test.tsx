import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HRManagerDashboard from '../HRManagerDashboard';
import { useDashboardStore } from '../../../store/dashboardStore';
import { DashboardStats } from '../../../types/dashboard';

// Mock the dashboard store
vi.mock('../../../store/dashboardStore', () => ({
  useDashboardStore: vi.fn(),
}));

// Mock the dashboard refresh hook
vi.mock('../../../hooks/useDashboardRefresh', () => ({
  useDashboardRefresh: () => ({
    fetchStats: vi.fn(),
  }),
}));

describe('HRManagerDashboard', () => {
  const mockStats: DashboardStats = {
    employees: {
      total: 100,
      active: 85,
      onLeave: 10,
      suspended: 2,
      resigned: 2,
      terminated: 1,
      byDepartment: { HR: 5, IT: 20, Sales: 30 },
      byDesignation: { Manager: 10, Developer: 40, Analyst: 50 },
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
      leaveTypeBreakdown: {
        Casual: { total: 20, approved: 15, pending: 3, rejected: 2 },
        Sick: { total: 15, approved: 12, pending: 2, rejected: 1 },
      },
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
      payrollByStatus: { Processed: 95, Pending: 5 },
      advanceSalaryRequests: 2,
      reimbursementClaims: 3,
    },
    recruitment: {
      openPositions: 5,
      totalApplicants: 50,
      applicantsByStage: { Applied: 20, Shortlisted: 15 },
      offersExtended: 5,
      offersAccepted: 3,
      offersRejected: 1,
      averageTimeToHire: 30,
      topSourceOfApplicants: { LinkedIn: 20 },
      recentHires: [],
    },
    generatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard title', async () => {
    (useDashboardStore as any).mockReturnValue({
      stats: mockStats,
      loading: false,
      error: null,
    });

    render(<HRManagerDashboard />);

    expect(screen.getByText('HR Manager Dashboard')).toBeInTheDocument();
  });

  it('renders quick action buttons', async () => {
    (useDashboardStore as any).mockReturnValue({
      stats: mockStats,
      loading: false,
      error: null,
    });

    render(<HRManagerDashboard />);

    expect(screen.getByLabelText('Add new employee')).toBeInTheDocument();
    expect(screen.getByLabelText('Approve pending leave requests')).toBeInTheDocument();
    expect(screen.getByLabelText('Process payroll')).toBeInTheDocument();
    expect(screen.getByLabelText('View recruitment dashboard')).toBeInTheDocument();
  });

  it('renders main stat cards', async () => {
    (useDashboardStore as any).mockReturnValue({
      stats: mockStats,
      loading: false,
      error: null,
    });

    render(<HRManagerDashboard />);

    expect(screen.getByText('Total Employees')).toBeInTheDocument();
    expect(screen.getByText('Pending Leaves')).toBeInTheDocument();
    expect(screen.getByText('Payroll Pending')).toBeInTheDocument();
    expect(screen.getByText('New Hires')).toBeInTheDocument();
  });

  it('displays correct stat values', async () => {
    (useDashboardStore as any).mockReturnValue({
      stats: mockStats,
      loading: false,
      error: null,
    });

    render(<HRManagerDashboard />);

    expect(screen.getByText('100')).toBeInTheDocument(); // Total employees
    expect(screen.getByText('5')).toBeInTheDocument(); // Pending leaves
  });

  it('renders tabs for different sections', async () => {
    (useDashboardStore as any).mockReturnValue({
      stats: mockStats,
      loading: false,
      error: null,
    });

    render(<HRManagerDashboard />);

    expect(screen.getByRole('tab', { name: 'Employees' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Leaves' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Payroll' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Recruitment' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Charts' })).toBeInTheDocument();
  });

  it('shows loading state when loading is true', async () => {
    (useDashboardStore as any).mockReturnValue({
      stats: null,
      loading: true,
      error: null,
    });

    render(<HRManagerDashboard />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error message when error occurs', async () => {
    (useDashboardStore as any).mockReturnValue({
      stats: null,
      loading: false,
      error: 'Failed to load dashboard',
    });

    render(<HRManagerDashboard />);

    expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Failed to load dashboard')).toBeInTheDocument();
  });

  it('renders refresh button', async () => {
    (useDashboardStore as any).mockReturnValue({
      stats: mockStats,
      loading: false,
      error: null,
    });

    render(<HRManagerDashboard />);

    const refreshButton = screen.getByLabelText('Refresh dashboard');
    expect(refreshButton).toBeInTheDocument();
  });

  it('displays last update time', async () => {
    (useDashboardStore as any).mockReturnValue({
      stats: mockStats,
      loading: false,
      error: null,
    });

    render(<HRManagerDashboard />);

    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
  });

  it('renders null when stats is null and not loading', async () => {
    (useDashboardStore as any).mockReturnValue({
      stats: null,
      loading: false,
      error: null,
    });

    const { container } = render(<HRManagerDashboard />);

    // Should render error or loading state, not null
    expect(container.firstChild).not.toBeNull();
  });
});
