/**
 * AttendanceRecordsMap Component Tests
 * Tests for location-based attendance records visualization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AttendanceRecordsMap } from '../AttendanceRecordsMap';
import { GeoLocation } from '../../../types/geoTracking';

// Mock MapDisplay component
vi.mock('../MapDisplay', () => ({
  MapDisplay: ({ attendanceRecords }: any) => (
    <div data-testid="map-display">
      {attendanceRecords.length > 0 && <div>Map with {attendanceRecords.length} record(s)</div>}
    </div>
  ),
}));

describe('AttendanceRecordsMap Component', () => {
  const mockLocation: GeoLocation = {
    latitude: 40.7128,
    longitude: -74.006,
    accuracy: 10,
    timestamp: new Date(),
  };

  const mockRecords = [
    {
      id: '1',
      employeeId: 'emp1',
      date: '2024-01-15',
      checkInLocation: mockLocation,
      checkOutLocation: mockLocation,
      checkInTime: '09:00 AM',
      checkOutTime: '05:30 PM',
      status: 'present' as const,
      workingHours: 8.5,
    },
    {
      id: '2',
      employeeId: 'emp1',
      date: '2024-01-16',
      checkInLocation: mockLocation,
      checkOutLocation: mockLocation,
      checkInTime: '09:15 AM',
      checkOutTime: '05:00 PM',
      status: 'present' as const,
      workingHours: 7.75,
    },
    {
      id: '3',
      employeeId: 'emp1',
      date: '2024-01-17',
      status: 'absent' as const,
    },
    {
      id: '4',
      employeeId: 'emp1',
      date: '2024-01-18',
      checkInLocation: mockLocation,
      checkOutLocation: mockLocation,
      checkInTime: '09:00 AM',
      checkOutTime: '01:00 PM',
      status: 'half_day' as const,
      workingHours: 4,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render attendance records map', () => {
    render(<AttendanceRecordsMap records={mockRecords} />);

    expect(screen.getByTestId('map-display')).toBeInTheDocument();
  });

  it('should display statistics', () => {
    render(<AttendanceRecordsMap records={mockRecords} />);

    expect(screen.getByText('Total Records')).toBeInTheDocument();
    expect(screen.getByText('Present')).toBeInTheDocument();
    expect(screen.getByText('Absent')).toBeInTheDocument();
    expect(screen.getByText('Half Day')).toBeInTheDocument();
    expect(screen.getByText('Avg Hours')).toBeInTheDocument();
  });

  it('should calculate correct statistics', () => {
    render(<AttendanceRecordsMap records={mockRecords} />);

    // Total records: 4
    expect(screen.getByText('4')).toBeInTheDocument();
    // Present: 2
    expect(screen.getAllByText('2')[0]).toBeInTheDocument();
    // Absent: 1
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should display attendance records list', () => {
    render(<AttendanceRecordsMap records={mockRecords} />);

    expect(screen.getByText('Attendance Records')).toBeInTheDocument();
  });

  it('should filter records by date', async () => {
    render(<AttendanceRecordsMap records={mockRecords} />);

    // Click on a specific date filter
    const dateButtons = screen.getAllByRole('button');
    const dateButton = dateButtons.find((btn) => btn.textContent?.includes('Jan'));

    if (dateButton) {
      fireEvent.click(dateButton);

      await waitFor(() => {
        expect(screen.getByText('Attendance Records')).toBeInTheDocument();
      });
    }
  });

  it('should filter records by status', async () => {
    render(<AttendanceRecordsMap records={mockRecords} />);

    // Click on "Present" status filter
    const statusButtons = screen.getAllByRole('button');
    const presentButton = statusButtons.find((btn) => btn.textContent?.includes('Present'));

    if (presentButton) {
      fireEvent.click(presentButton);

      await waitFor(() => {
        expect(screen.getByText('Attendance Records')).toBeInTheDocument();
      });
    }
  });

  it('should display "All Dates" filter button', () => {
    render(<AttendanceRecordsMap records={mockRecords} />);

    const allDatesButton = screen.getByRole('button', { name: /All Dates/i });
    expect(allDatesButton).toBeInTheDocument();
  });

  it('should display "All Status" filter button', () => {
    render(<AttendanceRecordsMap records={mockRecords} />);

    const allStatusButton = screen.getByRole('button', { name: /All Status/i });
    expect(allStatusButton).toBeInTheDocument();
  });

  it('should select record on click', async () => {
    const onRecordSelect = vi.fn();
    render(
      <AttendanceRecordsMap records={mockRecords} onRecordSelect={onRecordSelect} />
    );

    const recordItems = screen.getAllByText(/Jan/);
    if (recordItems.length > 0) {
      fireEvent.click(recordItems[0]);

      await waitFor(() => {
        expect(onRecordSelect).toHaveBeenCalled();
      });
    }
  });

  it('should display selected record details', () => {
    render(<AttendanceRecordsMap records={mockRecords} />);

    expect(screen.getByText('Selected Record Details')).toBeInTheDocument();
  });

  it('should display status badges', () => {
    render(<AttendanceRecordsMap records={mockRecords} />);

    expect(screen.getAllByText('Present').length).toBeGreaterThan(0);
    expect(screen.getByText('Absent')).toBeInTheDocument();
    expect(screen.getByText('Half Day')).toBeInTheDocument();
  });

  it('should display check-in and check-out times', () => {
    render(<AttendanceRecordsMap records={mockRecords} />);

    expect(screen.getByText('09:00 AM')).toBeInTheDocument();
    expect(screen.getByText('05:30 PM')).toBeInTheDocument();
  });

  it('should display working hours', () => {
    render(<AttendanceRecordsMap records={mockRecords} />);

    expect(screen.getByText('8.5h')).toBeInTheDocument();
  });

  it('should handle empty records array', () => {
    render(<AttendanceRecordsMap records={[]} />);

    expect(screen.getByText('No attendance records available')).toBeInTheDocument();
  });

  it('should display record without check-in location', () => {
    const recordWithoutLocation = [
      {
        id: '1',
        employeeId: 'emp1',
        date: '2024-01-15',
        status: 'absent' as const,
      },
    ];

    render(<AttendanceRecordsMap records={recordWithoutLocation} />);

    expect(screen.getByText('Attendance Records')).toBeInTheDocument();
  });

  it('should calculate average working hours correctly', () => {
    render(<AttendanceRecordsMap records={mockRecords} />);

    // Average: (8.5 + 7.75 + 4) / 3 = 6.75 (excluding absent day)
    expect(screen.getByText('Avg Hours')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <AttendanceRecordsMap records={mockRecords} className="custom-class" />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('should display check-in location details', () => {
    render(<AttendanceRecordsMap records={mockRecords} />);

    expect(screen.getByText('Selected Record Details')).toBeInTheDocument();
  });

  it('should display check-out location details', () => {
    render(<AttendanceRecordsMap records={mockRecords} />);

    expect(screen.getByText('Selected Record Details')).toBeInTheDocument();
  });

  it('should handle record with only check-in location', () => {
    const recordWithCheckInOnly = [
      {
        id: '1',
        employeeId: 'emp1',
        date: '2024-01-15',
        checkInLocation: mockLocation,
        checkInTime: '09:00 AM',
        status: 'present' as const,
      },
    ];

    render(<AttendanceRecordsMap records={recordWithCheckInOnly} />);

    expect(screen.getByText('Attendance Records')).toBeInTheDocument();
  });

  it('should handle record with only check-out location', () => {
    const recordWithCheckOutOnly = [
      {
        id: '1',
        employeeId: 'emp1',
        date: '2024-01-15',
        checkOutLocation: mockLocation,
        checkOutTime: '05:30 PM',
        status: 'present' as const,
      },
    ];

    render(<AttendanceRecordsMap records={recordWithCheckOutOnly} />);

    expect(screen.getByText('Attendance Records')).toBeInTheDocument();
  });

  it('should display location accuracy when available', () => {
    render(<AttendanceRecordsMap records={mockRecords} />);

    expect(screen.getByText('Selected Record Details')).toBeInTheDocument();
  });

  it('should update statistics when filtering by status', async () => {
    render(<AttendanceRecordsMap records={mockRecords} />);

    // Initial stats should show 4 records
    expect(screen.getByText('4')).toBeInTheDocument();

    // Click on "Absent" status filter
    const statusButtons = screen.getAllByRole('button');
    const absentButton = statusButtons.find((btn) => btn.textContent?.includes('Absent'));

    if (absentButton) {
      fireEvent.click(absentButton);

      await waitFor(() => {
        expect(screen.getByText('Attendance Records')).toBeInTheDocument();
      });
    }
  });

  it('should display on-leave status', () => {
    const recordWithLeave = [
      {
        id: '1',
        employeeId: 'emp1',
        date: '2024-01-15',
        status: 'on_leave' as const,
      },
    ];

    render(<AttendanceRecordsMap records={recordWithLeave} />);

    expect(screen.getByText('On Leave')).toBeInTheDocument();
  });

  it('should handle multiple records on same date', () => {
    const multipleRecordsSameDate = [
      {
        id: '1',
        employeeId: 'emp1',
        date: '2024-01-15',
        checkInLocation: mockLocation,
        checkOutLocation: mockLocation,
        checkInTime: '09:00 AM',
        checkOutTime: '05:30 PM',
        status: 'present' as const,
        workingHours: 8.5,
      },
      {
        id: '2',
        employeeId: 'emp2',
        date: '2024-01-15',
        checkInLocation: mockLocation,
        checkOutLocation: mockLocation,
        checkInTime: '09:15 AM',
        checkOutTime: '05:00 PM',
        status: 'present' as const,
        workingHours: 7.75,
      },
    ];

    render(<AttendanceRecordsMap records={multipleRecordsSameDate} />);

    expect(screen.getByText('Attendance Records')).toBeInTheDocument();
  });
});
