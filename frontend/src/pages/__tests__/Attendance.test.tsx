/**
 * Attendance Page Tests
 * Tests for the Attendance page component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Attendance } from '../Attendance';
import * as attendanceStore from '../../store/attendanceStore';
import * as authHook from '../../hooks/useAuth';

// Mock the stores and hooks
vi.mock('../../store/attendanceStore');
vi.mock('../../hooks/useAuth');

describe('Attendance Page', () => {
  const mockUser = {
    id: 'emp-123',
    email: 'employee@example.com',
    role: 'employee',
  };

  const mockCurrentStatus = {
    id: 'att-123',
    employee_id: 'emp-123',
    date: '2024-01-15',
    check_in_time: '2024-01-15T09:00:00Z',
    check_out_time: '2024-01-15T17:30:00Z',
    working_hours: 8.5,
    status: 'present' as const,
  };

  const mockStats = {
    total_days: 20,
    present_days: 18,
    absent_days: 1,
    half_days: 1,
    on_leave_days: 0,
    late_arrivals: 2,
    average_working_hours: 8.2,
  };

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

    // Mock useAttendanceStore hook
    vi.mocked(attendanceStore.useAttendanceStore).mockReturnValue({
      records: [],
      currentStatus: mockCurrentStatus,
      stats: mockStats,
      teamRecords: [],
      loading: false,
      error: null,
      markAttendance: vi.fn(),
      fetchRecords: vi.fn().mockResolvedValue(undefined),
      fetchCurrentStatus: vi.fn().mockResolvedValue(undefined),
      fetchStats: vi.fn().mockResolvedValue(undefined),
      requestRegularization: vi.fn(),
      fetchTeamAttendance: vi.fn(),
      exportRecords: vi.fn(),
      clearError: vi.fn(),
      reset: vi.fn(),
    });
  });

  it('should render the Attendance page with header', () => {
    render(<Attendance />);
    expect(screen.getByText('Attendance')).toBeInTheDocument();
  });

  it('should display current status card with today\'s information', async () => {
    render(<Attendance />);

    await waitFor(() => {
      expect(screen.getByText("Today's Status")).toBeInTheDocument();
      const statusBadges = screen.getAllByText('Present');
      expect(statusBadges.length).toBeGreaterThan(0);
    });
  });

  it('should display check-in time in readable format', async () => {
    render(<Attendance />);

    await waitFor(() => {
      // Check-in time should be formatted as HH:MM AM/PM
      expect(screen.getByText(/09:00/)).toBeInTheDocument();
    });
  });

  it('should display check-out time in readable format', async () => {
    render(<Attendance />);

    await waitFor(() => {
      // Check-out time should be formatted as HH:MM AM/PM
      expect(screen.getByText(/05:30/)).toBeInTheDocument();
    });
  });

  it('should display working hours for the day', async () => {
    render(<Attendance />);

    await waitFor(() => {
      expect(screen.getByText('8.5h')).toBeInTheDocument();
    });
  });

  it('should display attendance statistics', async () => {
    render(<Attendance />);

    await waitFor(() => {
      const presentDaysLabels = screen.getAllByText('Present Days');
      expect(presentDaysLabels.length).toBeGreaterThan(0);
      const presentDaysValues = screen.getAllByText('18');
      expect(presentDaysValues.length).toBeGreaterThan(0);
      const absentDaysLabels = screen.getAllByText('Absent Days');
      expect(absentDaysLabels.length).toBeGreaterThan(0);
      const lateArrivalsLabels = screen.getAllByText('Late Arrivals');
      expect(lateArrivalsLabels.length).toBeGreaterThan(0);
    });
  });

  it('should display Mark Attendance button', async () => {
    render(<Attendance />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Mark Attendance/i })).toBeInTheDocument();
    });
  });

  it('should display tabs for History and Regularization', async () => {
    render(<Attendance />);

    await waitFor(() => {
      expect(screen.getByText('History')).toBeInTheDocument();
      expect(screen.getByText('Regularization')).toBeInTheDocument();
    });
  });

  it('should fetch attendance data on mount', async () => {
    const mockFetchCurrentStatus = vi.fn().mockResolvedValue(undefined);
    const mockFetchStats = vi.fn().mockResolvedValue(undefined);

    vi.mocked(attendanceStore.useAttendanceStore).mockReturnValue({
      records: [],
      currentStatus: mockCurrentStatus,
      stats: mockStats,
      teamRecords: [],
      loading: false,
      error: null,
      markAttendance: vi.fn(),
      fetchRecords: vi.fn().mockResolvedValue(undefined),
      fetchCurrentStatus: mockFetchCurrentStatus,
      fetchStats: mockFetchStats,
      requestRegularization: vi.fn(),
      fetchTeamAttendance: vi.fn(),
      exportRecords: vi.fn(),
      clearError: vi.fn(),
      reset: vi.fn(),
    });

    render(<Attendance />);

    await waitFor(() => {
      expect(mockFetchCurrentStatus).toHaveBeenCalledWith('emp-123');
      expect(mockFetchStats).toHaveBeenCalledWith('emp-123');
    });
  });

  it('should display error message when data fetch fails', async () => {
    const errorMessage = 'Failed to load attendance data';

    vi.mocked(attendanceStore.useAttendanceStore).mockReturnValue({
      records: [],
      currentStatus: null,
      stats: null,
      teamRecords: [],
      loading: false,
      error: errorMessage,
      markAttendance: vi.fn(),
      fetchRecords: vi.fn().mockResolvedValue(undefined),
      fetchCurrentStatus: vi.fn().mockRejectedValue(new Error(errorMessage)),
      fetchStats: vi.fn().mockResolvedValue(undefined),
      requestRegularization: vi.fn(),
      fetchTeamAttendance: vi.fn(),
      exportRecords: vi.fn(),
      clearError: vi.fn(),
      reset: vi.fn(),
    });

    render(<Attendance />);

    await waitFor(() => {
      const errorMessages = screen.getAllByText(errorMessage);
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it('should display loading state initially', () => {
    vi.mocked(attendanceStore.useAttendanceStore).mockReturnValue({
      records: [],
      currentStatus: null,
      stats: null,
      teamRecords: [],
      loading: true,
      error: null,
      markAttendance: vi.fn(),
      fetchRecords: vi.fn().mockResolvedValue(undefined),
      fetchCurrentStatus: vi.fn().mockResolvedValue(undefined),
      fetchStats: vi.fn().mockResolvedValue(undefined),
      requestRegularization: vi.fn(),
      fetchTeamAttendance: vi.fn(),
      exportRecords: vi.fn(),
      clearError: vi.fn(),
      reset: vi.fn(),
    });

    render(<Attendance />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display correct status badge for present status', async () => {
    render(<Attendance />);

    await waitFor(() => {
      const badges = screen.getAllByText('Present');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it('should display correct status badge for absent status', async () => {
    const absentStatus = {
      ...mockCurrentStatus,
      status: 'absent' as const,
    };

    vi.mocked(attendanceStore.useAttendanceStore).mockReturnValue({
      records: [],
      currentStatus: absentStatus,
      stats: mockStats,
      teamRecords: [],
      loading: false,
      error: null,
      markAttendance: vi.fn(),
      fetchRecords: vi.fn().mockResolvedValue(undefined),
      fetchCurrentStatus: vi.fn().mockResolvedValue(undefined),
      fetchStats: vi.fn().mockResolvedValue(undefined),
      requestRegularization: vi.fn(),
      fetchTeamAttendance: vi.fn(),
      exportRecords: vi.fn(),
      clearError: vi.fn(),
      reset: vi.fn(),
    });

    render(<Attendance />);

    await waitFor(() => {
      const absentBadges = screen.getAllByText('Absent');
      expect(absentBadges.length).toBeGreaterThan(0);
    });
  });

  it('should display correct status badge for half day status', async () => {
    const halfDayStatus = {
      ...mockCurrentStatus,
      status: 'half_day' as const,
    };

    vi.mocked(attendanceStore.useAttendanceStore).mockReturnValue({
      records: [],
      currentStatus: halfDayStatus,
      stats: mockStats,
      teamRecords: [],
      loading: false,
      error: null,
      markAttendance: vi.fn(),
      fetchRecords: vi.fn().mockResolvedValue(undefined),
      fetchCurrentStatus: vi.fn().mockResolvedValue(undefined),
      fetchStats: vi.fn().mockResolvedValue(undefined),
      requestRegularization: vi.fn(),
      fetchTeamAttendance: vi.fn(),
      exportRecords: vi.fn(),
      clearError: vi.fn(),
      reset: vi.fn(),
    });

    render(<Attendance />);

    await waitFor(() => {
      const halfDayBadges = screen.getAllByText('Half Day');
      expect(halfDayBadges.length).toBeGreaterThan(0);
    });
  });

  it('should display dash when check-in time is not available', async () => {
    const noCheckInStatus = {
      ...mockCurrentStatus,
      check_in_time: undefined,
    };

    vi.mocked(attendanceStore.useAttendanceStore).mockReturnValue({
      records: [],
      currentStatus: noCheckInStatus,
      stats: mockStats,
      teamRecords: [],
      loading: false,
      error: null,
      markAttendance: vi.fn(),
      fetchRecords: vi.fn().mockResolvedValue(undefined),
      fetchCurrentStatus: vi.fn().mockResolvedValue(undefined),
      fetchStats: vi.fn().mockResolvedValue(undefined),
      requestRegularization: vi.fn(),
      fetchTeamAttendance: vi.fn(),
      exportRecords: vi.fn(),
      clearError: vi.fn(),
      reset: vi.fn(),
    });

    render(<Attendance />);

    await waitFor(() => {
      const checkInElements = screen.getAllByText('-');
      expect(checkInElements.length).toBeGreaterThan(0);
    });
  });

  it('should display statistics with correct values', async () => {
    render(<Attendance />);

    await waitFor(() => {
      const presentDaysValues = screen.getAllByText('18');
      expect(presentDaysValues.length).toBeGreaterThan(0); // present_days
      const absentDaysValues = screen.getAllByText('1');
      expect(absentDaysValues.length).toBeGreaterThan(0); // absent_days
      const lateArrivalsValues = screen.getAllByText('2');
      expect(lateArrivalsValues.length).toBeGreaterThan(0); // late_arrivals
    });
  });

  it('should be responsive and display grid layout', () => {
    const { container } = render(<Attendance />);
    const gridElement = container.querySelector('.grid');
    expect(gridElement).toBeTruthy();
  });
});
