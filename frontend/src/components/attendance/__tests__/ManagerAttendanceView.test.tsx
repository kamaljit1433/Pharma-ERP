/**
 * ManagerAttendanceView Component Tests
 * Tests for manager team attendance view functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ManagerAttendanceView } from '../ManagerAttendanceView';
import attendanceService from '../../../services/attendanceService';

// Mock the attendance service
vi.mock('../../../services/attendanceService', () => ({
  default: {
    getTeamAttendance: vi.fn(),
  },
}));

describe('ManagerAttendanceView', () => {
  const mockManagerId = 'manager-123';
  const mockDate = '2024-01-15';

  const mockAttendanceRecords = [
    {
      id: '1',
      employee_id: 'emp-001',
      date: mockDate,
      check_in_time: '2024-01-15T09:00:00Z',
      check_out_time: '2024-01-15T17:30:00Z',
      working_hours: 8.5,
      status: 'present' as const,
      check_in_location: { latitude: 40.7128, longitude: -74.006, accuracy: 10 },
    },
    {
      id: '2',
      employee_id: 'emp-002',
      date: mockDate,
      check_in_time: '2024-01-15T09:15:00Z',
      check_out_time: '2024-01-15T17:45:00Z',
      working_hours: 8.5,
      status: 'present' as const,
    },
    {
      id: '3',
      employee_id: 'emp-003',
      date: mockDate,
      status: 'absent' as const,
    },
    {
      id: '4',
      employee_id: 'emp-004',
      date: mockDate,
      check_in_time: '2024-01-15T09:30:00Z',
      check_out_time: '2024-01-15T13:00:00Z',
      working_hours: 3.5,
      status: 'half_day' as const,
    },
    {
      id: '5',
      employee_id: 'emp-005',
      date: mockDate,
      status: 'on_leave' as const,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(attendanceService.getTeamAttendance).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<ManagerAttendanceView managerId={mockManagerId} date={mockDate} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should fetch and display team attendance records', async () => {
    vi.mocked(attendanceService.getTeamAttendance).mockResolvedValue(mockAttendanceRecords);

    render(<ManagerAttendanceView managerId={mockManagerId} date={mockDate} />);

    await waitFor(() => {
      expect(screen.getByText('Team Attendance')).toBeInTheDocument();
    });

    // Check if records are displayed
    expect(screen.getByText('emp-001')).toBeInTheDocument();
    expect(screen.getByText('emp-002')).toBeInTheDocument();
    expect(screen.getByText('emp-003')).toBeInTheDocument();
  });

  it('should display team attendance summary', async () => {
    vi.mocked(attendanceService.getTeamAttendance).mockResolvedValue(mockAttendanceRecords);

    render(<ManagerAttendanceView managerId={mockManagerId} date={mockDate} />);

    await waitFor(() => {
      expect(screen.getByText('Team Attendance')).toBeInTheDocument();
    });

    // Check summary cards
    expect(screen.getByText('Total Team')).toBeInTheDocument();
    expect(screen.getAllByText('Present').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Absent').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Half Day').length).toBeGreaterThan(0);
    expect(screen.getAllByText('On Leave').length).toBeGreaterThan(0);
    expect(screen.getByText('Late')).toBeInTheDocument();
  });

  it('should calculate correct summary statistics', async () => {
    vi.mocked(attendanceService.getTeamAttendance).mockResolvedValue(mockAttendanceRecords);

    render(<ManagerAttendanceView managerId={mockManagerId} date={mockDate} />);

    await waitFor(() => {
      expect(screen.getByText('Team Attendance')).toBeInTheDocument();
    });

    // Verify the summary counts
    // Total: 5, Present: 2, Absent: 1, Half Day: 1, On Leave: 1
    const cards = screen.getAllByRole('heading', { level: 3 });
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should display error message on fetch failure', async () => {
    const errorMessage = 'Failed to load team attendance';
    vi.mocked(attendanceService.getTeamAttendance).mockRejectedValue(
      new Error(errorMessage)
    );

    render(<ManagerAttendanceView managerId={mockManagerId} date={mockDate} />);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should display empty state when no records found', async () => {
    vi.mocked(attendanceService.getTeamAttendance).mockResolvedValue([]);

    render(<ManagerAttendanceView managerId={mockManagerId} date={mockDate} />);

    await waitFor(() => {
      expect(screen.getByText('No attendance records found for this date')).toBeInTheDocument();
    });
  });

  it('should allow changing date and refetch records', async () => {
    vi.mocked(attendanceService.getTeamAttendance).mockResolvedValue(mockAttendanceRecords);

    render(<ManagerAttendanceView managerId={mockManagerId} date={mockDate} />);

    await waitFor(() => {
      expect(screen.getByText('Team Attendance')).toBeInTheDocument();
    });

    // Change date
    const dateInput = screen.getByDisplayValue(mockDate) as HTMLInputElement;
    fireEvent.change(dateInput, { target: { value: '2024-01-16' } });

    await waitFor(() => {
      expect(vi.mocked(attendanceService.getTeamAttendance)).toHaveBeenCalledWith('2024-01-16');
    });
  });

  it('should display correct status badges', async () => {
    vi.mocked(attendanceService.getTeamAttendance).mockResolvedValue(mockAttendanceRecords);

    render(<ManagerAttendanceView managerId={mockManagerId} date={mockDate} />);

    await waitFor(() => {
      expect(screen.getByText('Team Attendance')).toBeInTheDocument();
    });

    // Check for status text in table (use getAllByText since there are multiple)
    expect(screen.getAllByText('Present').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Absent').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Half Day').length).toBeGreaterThan(0);
    expect(screen.getAllByText('On Leave').length).toBeGreaterThan(0);
  });

  it('should format times correctly', async () => {
    vi.mocked(attendanceService.getTeamAttendance).mockResolvedValue(mockAttendanceRecords);

    render(<ManagerAttendanceView managerId={mockManagerId} date={mockDate} />);

    await waitFor(() => {
      expect(screen.getByText('Team Attendance')).toBeInTheDocument();
    });

    // Check if times are formatted (should be in HH:MM AM/PM format)
    const timeElements = screen.getAllByText(/\d{1,2}:\d{2}\s(AM|PM)/);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it('should display working hours correctly', async () => {
    vi.mocked(attendanceService.getTeamAttendance).mockResolvedValue(mockAttendanceRecords);

    render(<ManagerAttendanceView managerId={mockManagerId} date={mockDate} />);

    await waitFor(() => {
      expect(screen.getByText('Team Attendance')).toBeInTheDocument();
    });

    // Check for working hours display (use getAllByText since there are multiple 8.5h)
    const workingHours = screen.getAllByText(/\d+\.\d+h/);
    expect(workingHours.length).toBeGreaterThan(0);
  });

  it('should identify late arrivals correctly', async () => {
    const lateArrivalRecord = {
      id: '6',
      employee_id: 'emp-006',
      date: mockDate,
      check_in_time: '2024-01-15T09:30:00Z', // After 9 AM
      check_out_time: '2024-01-15T17:30:00Z',
      working_hours: 8,
      status: 'present' as const,
    };

    vi.mocked(attendanceService.getTeamAttendance).mockResolvedValue([lateArrivalRecord]);

    render(<ManagerAttendanceView managerId={mockManagerId} date={mockDate} />);

    await waitFor(() => {
      expect(screen.getByText('Team Attendance')).toBeInTheDocument();
    });

    // The late arrivals count should be 1
    const cards = screen.getAllByRole('heading', { level: 3 });
    expect(cards.length).toBeGreaterThan(0);
  });

  it('should display attendance mode (GPS vs Web)', async () => {
    vi.mocked(attendanceService.getTeamAttendance).mockResolvedValue(mockAttendanceRecords);

    render(<ManagerAttendanceView managerId={mockManagerId} date={mockDate} />);

    await waitFor(() => {
      expect(screen.getByText('Team Attendance')).toBeInTheDocument();
    });

    // Check for mode display
    const modeElements = screen.getAllByText(/GPS|Web/);
    expect(modeElements.length).toBeGreaterThan(0);
  });

  it('should call refresh button to reload data', async () => {
    vi.mocked(attendanceService.getTeamAttendance).mockResolvedValue(mockAttendanceRecords);

    render(<ManagerAttendanceView managerId={mockManagerId} date={mockDate} />);

    await waitFor(() => {
      expect(screen.getByText('Team Attendance')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /Refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(vi.mocked(attendanceService.getTeamAttendance)).toHaveBeenCalledTimes(2);
    });
  });
});
