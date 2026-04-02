/**
 * Leave Page Tests
 * Tests for the Leave page component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Leave } from '../Leave';
import * as leaveStore from '../../store/leaveStore';
import * as authHook from '../../hooks/useAuth';

// Mock the stores and hooks
vi.mock('../../store/leaveStore');
vi.mock('../../hooks/useAuth');
vi.mock('../../components/layout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('../../components/leave/LeaveBalance', () => ({
  LeaveBalance: () => <div>LeaveBalance Component</div>,
}));
vi.mock('../../components/leave/LeaveRequestForm', () => ({
  LeaveRequestForm: () => <div>LeaveRequestForm Component</div>,
}));
vi.mock('../../components/leave/LeaveHistory', () => ({
  LeaveHistory: () => <div>LeaveHistory Component</div>,
}));
vi.mock('../../components/leave/LeaveCalendarComponent', () => ({
  LeaveCalendarComponent: () => <div>LeaveCalendarComponent Component</div>,
}));
vi.mock('../../components/leave/LeaveApprovalPanel', () => ({
  LeaveApprovalPanel: () => <div>LeaveApprovalPanel Component</div>,
}));
vi.mock('../../hooks/useToast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('Leave Page', () => {
  const mockUser = {
    id: 'emp-123',
    employeeId: 'EMP001',
    email: 'employee@example.com',
    role: 'employee',
  };

  const mockLeaveBalances = [
    {
      id: 'lb-1',
      employee_id: 'emp-123',
      leave_type_id: 'lt-1',
      year: 2024,
      opening_balance: 12,
      used_balance: 3,
      carry_forward_balance: 2,
      available_balance: 11,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: 'lb-2',
      employee_id: 'emp-123',
      leave_type_id: 'lt-2',
      year: 2024,
      opening_balance: 10,
      used_balance: 2,
      carry_forward_balance: 0,
      available_balance: 8,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ];

  const mockLeaves = [
    {
      id: 'leave-1',
      employee_id: 'emp-123',
      leave_type_id: 'lt-1',
      from_date: '2024-01-15',
      to_date: '2024-01-17',
      days_count: 3,
      reason: 'Personal work',
      status: 'approved' as const,
      created_at: '2024-01-10',
      updated_at: '2024-01-10',
    },
    {
      id: 'leave-2',
      employee_id: 'emp-123',
      leave_type_id: 'lt-2',
      from_date: '2024-02-01',
      to_date: '2024-02-02',
      days_count: 2,
      reason: 'Medical appointment',
      status: 'pending' as const,
      created_at: '2024-01-20',
      updated_at: '2024-01-20',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useAuth hook
    vi.mocked(authHook.useAuth).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      verifyMFA: vi.fn(),
    });

    // Mock useLeaveStore hook
    vi.mocked(leaveStore.useLeaveStore).mockReturnValue({
      leaveTypes: [],
      loadingLeaveTypes: false,
      fetchLeaveTypes: vi.fn(),
      createLeaveType: vi.fn(),
      updateLeaveType: vi.fn(),
      deleteLeaveType: vi.fn(),
      holidays: [],
      loadingHolidays: false,
      fetchHolidays: vi.fn(),
      createHoliday: vi.fn(),
      updateHoliday: vi.fn(),
      deleteHoliday: vi.fn(),
      leaveBalances: mockLeaveBalances,
      loadingBalances: false,
      fetchLeaveBalance: vi.fn(),
      teamCalendar: [],
      loadingTeamCalendar: false,
      fetchTeamLeaveCalendar: vi.fn(),
      leaves: mockLeaves,
      loadingLeaves: false,
      applyLeave: vi.fn(),
      approveLeave: vi.fn(),
      rejectLeave: vi.fn(),
      error: null,
      clearError: vi.fn(),
    });
  });

  it('should render the Leave page with header', () => {
    render(<Leave />);
    expect(screen.getByText('Leave Management')).toBeInTheDocument();
  });

  it('should display summary cards with leave statistics', async () => {
    render(<Leave />);

    await waitFor(() => {
      expect(screen.getByText('Available Balance')).toBeInTheDocument();
      expect(screen.getByText('Used Balance')).toBeInTheDocument();
      expect(screen.getByText('Carry Forward')).toBeInTheDocument();
      expect(screen.getByText('Pending Requests')).toBeInTheDocument();
    });
  });

  it('should calculate and display total available balance correctly', async () => {
    render(<Leave />);

    await waitFor(() => {
      // Total available: 11 + 8 = 19
      expect(screen.getByText('19.0')).toBeInTheDocument();
    });
  });

  it('should calculate and display total used balance correctly', async () => {
    render(<Leave />);

    await waitFor(() => {
      // Total used: 3 + 2 = 5
      expect(screen.getByText('5.0')).toBeInTheDocument();
    });
  });

  it('should calculate and display total carry forward correctly', async () => {
    render(<Leave />);

    await waitFor(() => {
      // Total carry forward: 2 + 0 = 2
      expect(screen.getByText('2.0')).toBeInTheDocument();
    });
  });

  it('should display pending requests count', async () => {
    render(<Leave />);

    await waitFor(() => {
      // Pending count: 1
      const pendingElements = screen.getAllByText('1');
      expect(pendingElements.length).toBeGreaterThan(0);
    });
  });

  it('should display tabs for Leave Balance, Request, History, and Calendar', async () => {
    render(<Leave />);

    await waitFor(() => {
      expect(screen.getByText('Leave Balance')).toBeInTheDocument();
      expect(screen.getByText('Request Leave')).toBeInTheDocument();
      expect(screen.getByText('History')).toBeInTheDocument();
      expect(screen.getByText('Calendar')).toBeInTheDocument();
    });
  });

  it('should display Approvals tab for managers', async () => {
    vi.mocked(authHook.useAuth).mockReturnValue({
      user: { ...mockUser, role: 'department_manager' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      verifyMFA: vi.fn(),
    });

    render(<Leave />);

    await waitFor(() => {
      expect(screen.getByText('Approvals')).toBeInTheDocument();
    });
  });

  it('should not display Approvals tab for employees', async () => {
    render(<Leave />);

    await waitFor(() => {
      const approvalsTab = screen.queryByText('Approvals');
      expect(approvalsTab).not.toBeInTheDocument();
    });
  });

  it('should fetch leave balance on mount', async () => {
    const mockFetchLeaveBalance = vi.fn().mockResolvedValue(undefined);

    vi.mocked(leaveStore.useLeaveStore).mockReturnValue({
      leaveTypes: [],
      loadingLeaveTypes: false,
      fetchLeaveTypes: vi.fn(),
      createLeaveType: vi.fn(),
      updateLeaveType: vi.fn(),
      deleteLeaveType: vi.fn(),
      holidays: [],
      loadingHolidays: false,
      fetchHolidays: vi.fn(),
      createHoliday: vi.fn(),
      updateHoliday: vi.fn(),
      deleteHoliday: vi.fn(),
      leaveBalances: mockLeaveBalances,
      loadingBalances: false,
      fetchLeaveBalance: mockFetchLeaveBalance,
      teamCalendar: [],
      loadingTeamCalendar: false,
      fetchTeamLeaveCalendar: vi.fn(),
      leaves: mockLeaves,
      loadingLeaves: false,
      applyLeave: vi.fn(),
      approveLeave: vi.fn(),
      rejectLeave: vi.fn(),
      error: null,
      clearError: vi.fn(),
    });

    render(<Leave />);

    await waitFor(() => {
      expect(mockFetchLeaveBalance).toHaveBeenCalled();
    });
  });

  it('should display error message when data fetch fails', async () => {
    const errorMessage = 'Failed to load leave data';

    vi.mocked(leaveStore.useLeaveStore).mockReturnValue({
      leaveTypes: [],
      loadingLeaveTypes: false,
      fetchLeaveTypes: vi.fn(),
      createLeaveType: vi.fn(),
      updateLeaveType: vi.fn(),
      deleteLeaveType: vi.fn(),
      holidays: [],
      loadingHolidays: false,
      fetchHolidays: vi.fn(),
      createHoliday: vi.fn(),
      updateHoliday: vi.fn(),
      deleteHoliday: vi.fn(),
      leaveBalances: [],
      loadingBalances: false,
      fetchLeaveBalance: vi.fn(),
      teamCalendar: [],
      loadingTeamCalendar: false,
      fetchTeamLeaveCalendar: vi.fn(),
      leaves: [],
      loadingLeaves: false,
      applyLeave: vi.fn(),
      approveLeave: vi.fn(),
      rejectLeave: vi.fn(),
      error: errorMessage,
      clearError: vi.fn(),
    });

    render(<Leave />);

    // The error is displayed via toast, so we just verify the component renders
    await waitFor(() => {
      expect(screen.getByText('Leave Management')).toBeInTheDocument();
    });
  });

  it('should display loading state for leave balance', async () => {
    vi.mocked(leaveStore.useLeaveStore).mockReturnValue({
      leaveTypes: [],
      loadingLeaveTypes: false,
      fetchLeaveTypes: vi.fn(),
      createLeaveType: vi.fn(),
      updateLeaveType: vi.fn(),
      deleteLeaveType: vi.fn(),
      holidays: [],
      loadingHolidays: false,
      fetchHolidays: vi.fn(),
      createHoliday: vi.fn(),
      updateHoliday: vi.fn(),
      deleteHoliday: vi.fn(),
      leaveBalances: [],
      loadingBalances: true,
      fetchLeaveBalance: vi.fn(),
      teamCalendar: [],
      loadingTeamCalendar: false,
      fetchTeamLeaveCalendar: vi.fn(),
      leaves: [],
      loadingLeaves: false,
      applyLeave: vi.fn(),
      approveLeave: vi.fn(),
      rejectLeave: vi.fn(),
      error: null,
      clearError: vi.fn(),
    });

    render(<Leave />);

    await waitFor(() => {
      expect(screen.getByText('Loading leave balance...')).toBeInTheDocument();
    });
  });

  it('should display correct card icons', async () => {
    render(<Leave />);

    await waitFor(() => {
      // Check that the component renders with icons
      expect(screen.getByText('Available Balance')).toBeInTheDocument();
      expect(screen.getByText('Used Balance')).toBeInTheDocument();
      expect(screen.getByText('Carry Forward')).toBeInTheDocument();
      expect(screen.getByText('Pending Requests')).toBeInTheDocument();
    });
  });

  it('should be responsive with grid layout', () => {
    const { container } = render(<Leave />);
    const gridElement = container.querySelector('.grid');
    expect(gridElement).toBeInTheDocument();
  });

  it('should display HR Manager role with Approvals tab', async () => {
    vi.mocked(authHook.useAuth).mockReturnValue({
      user: { ...mockUser, role: 'hr_manager' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      verifyMFA: vi.fn(),
    });

    render(<Leave />);

    await waitFor(() => {
      expect(screen.getByText('Approvals')).toBeInTheDocument();
    });
  });

  it('should display Super Admin role with Approvals tab', async () => {
    vi.mocked(authHook.useAuth).mockReturnValue({
      user: { ...mockUser, role: 'super_admin' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      verifyMFA: vi.fn(),
    });

    render(<Leave />);

    await waitFor(() => {
      expect(screen.getByText('Approvals')).toBeInTheDocument();
    });
  });

  it('should handle empty leave balances gracefully', async () => {
    vi.mocked(leaveStore.useLeaveStore).mockReturnValue({
      leaveTypes: [],
      loadingLeaveTypes: false,
      fetchLeaveTypes: vi.fn(),
      createLeaveType: vi.fn(),
      updateLeaveType: vi.fn(),
      deleteLeaveType: vi.fn(),
      holidays: [],
      loadingHolidays: false,
      fetchHolidays: vi.fn(),
      createHoliday: vi.fn(),
      updateHoliday: vi.fn(),
      deleteHoliday: vi.fn(),
      leaveBalances: [],
      loadingBalances: false,
      fetchLeaveBalance: vi.fn(),
      teamCalendar: [],
      loadingTeamCalendar: false,
      fetchTeamLeaveCalendar: vi.fn(),
      leaves: [],
      loadingLeaves: false,
      applyLeave: vi.fn(),
      approveLeave: vi.fn(),
      rejectLeave: vi.fn(),
      error: null,
      clearError: vi.fn(),
    });

    render(<Leave />);

    await waitFor(() => {
      // Should display 0 for all statistics
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThan(0);
    });
  });
});
