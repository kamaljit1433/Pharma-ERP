/**
 * Attendance Reports Component Tests
 * Tests for attendance report display and export functionality
 * Requirements: 7.10, 26.1, 26.2, 26.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AttendanceReports } from '../AttendanceReports';
import attendanceService from '../../../services/attendanceService';
import * as exportUtils from '../../../utils/exportUtils';

// Mock the attendance service
vi.mock('../../../services/attendanceService', () => ({
  default: {
    getRecords: vi.fn(),
  },
}));

// Mock the export utilities
vi.mock('../../../utils/exportUtils', () => ({
  exportData: vi.fn(),
  formatAttendanceForExport: vi.fn(),
  downloadBlob: vi.fn(),
  generateFilename: vi.fn(),
}));

// Mock the attendance store
vi.mock('../../../store/attendanceStore', () => ({
  useAttendanceStore: () => ({
    stats: {
      total_days: 20,
      present_days: 18,
      absent_days: 2,
      half_days: 0,
      on_leave_days: 0,
      late_arrivals: 3,
      average_working_hours: 8.5,
    },
  }),
}));

describe('AttendanceReports', () => {
  const mockEmployeeId = 'emp-123';
  const mockFromDate = '2024-01-01';
  const mockToDate = '2024-01-31';

  const mockAttendanceRecords = [
    {
      id: '1',
      employee_id: mockEmployeeId,
      date: '2024-01-01',
      check_in_time: '2024-01-01T09:00:00Z',
      check_out_time: '2024-01-01T17:30:00Z',
      working_hours: 8.5,
      status: 'present' as const,
      remarks: 'Regular day',
    },
    {
      id: '2',
      employee_id: mockEmployeeId,
      date: '2024-01-02',
      check_in_time: '2024-01-02T09:15:00Z',
      check_out_time: '2024-01-02T17:45:00Z',
      working_hours: 8.5,
      status: 'present' as const,
      remarks: 'Regular day',
    },
    {
      id: '3',
      employee_id: mockEmployeeId,
      date: '2024-01-03',
      status: 'absent' as const,
      remarks: 'Sick leave',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(attendanceService.getRecords).mockResolvedValue(mockAttendanceRecords);
    vi.mocked(exportUtils.formatAttendanceForExport).mockReturnValue([
      {
        'Employee ID': mockEmployeeId,
        Date: '1/1/2024',
        'Check-in Time': '9:00:00 AM',
        'Check-out Time': '5:30:00 PM',
        'Working Hours': '8.50h',
        Status: 'present',
        Remarks: 'Regular day',
      },
    ]);
    vi.mocked(exportUtils.generateFilename).mockReturnValue('attendance-report-2024-01-31.csv');
    vi.mocked(exportUtils.exportData).mockResolvedValue(new Blob(['test']));
  });

  it('should render date filter inputs', () => {
    render(<AttendanceReports employeeId={mockEmployeeId} />);

    expect(screen.getByLabelText('From Date')).toBeInTheDocument();
    expect(screen.getByLabelText('To Date')).toBeInTheDocument();
  });

  it('should display export buttons', () => {
    render(<AttendanceReports employeeId={mockEmployeeId} />);

    expect(screen.getByRole('button', { name: /Export as CSV/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export as Excel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export as PDF/i })).toBeInTheDocument();
  });

  it('should display print button', () => {
    render(<AttendanceReports employeeId={mockEmployeeId} />);

    expect(screen.getByRole('button', { name: /Print Report/i })).toBeInTheDocument();
  });

  it('should load records when dates are selected', async () => {
    render(<AttendanceReports employeeId={mockEmployeeId} />);

    const fromDateInput = screen.getByLabelText('From Date') as HTMLInputElement;
    const toDateInput = screen.getByLabelText('To Date') as HTMLInputElement;

    fireEvent.change(fromDateInput, { target: { value: mockFromDate } });
    fireEvent.change(toDateInput, { target: { value: mockToDate } });

    await waitFor(() => {
      expect(vi.mocked(attendanceService.getRecords)).toHaveBeenCalledWith({
        employee_id: mockEmployeeId,
        from_date: mockFromDate,
        to_date: mockToDate,
      });
    });
  });

  it('should display record count after loading', async () => {
    render(<AttendanceReports employeeId={mockEmployeeId} />);

    const fromDateInput = screen.getByLabelText('From Date') as HTMLInputElement;
    const toDateInput = screen.getByLabelText('To Date') as HTMLInputElement;

    fireEvent.change(fromDateInput, { target: { value: mockFromDate } });
    fireEvent.change(toDateInput, { target: { value: mockToDate } });

    await waitFor(() => {
      expect(screen.getByText(/Showing 3 attendance records/i)).toBeInTheDocument();
    });
  });

  it('should enable export buttons when records are loaded', async () => {
    render(<AttendanceReports employeeId={mockEmployeeId} />);

    const fromDateInput = screen.getByLabelText('From Date') as HTMLInputElement;
    const toDateInput = screen.getByLabelText('To Date') as HTMLInputElement;

    fireEvent.change(fromDateInput, { target: { value: mockFromDate } });
    fireEvent.change(toDateInput, { target: { value: mockToDate } });

    await waitFor(() => {
      const csvButton = screen.getByRole('button', { name: /Export as CSV/i });
      expect(csvButton).not.toBeDisabled();
    });
  });

  it('should export as CSV format', async () => {
    render(<AttendanceReports employeeId={mockEmployeeId} />);

    const fromDateInput = screen.getByLabelText('From Date') as HTMLInputElement;
    const toDateInput = screen.getByLabelText('To Date') as HTMLInputElement;

    fireEvent.change(fromDateInput, { target: { value: mockFromDate } });
    fireEvent.change(toDateInput, { target: { value: mockToDate } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Export as CSV/i })).not.toBeDisabled();
    });

    const csvButton = screen.getByRole('button', { name: /Export as CSV/i });
    fireEvent.click(csvButton);

    await waitFor(() => {
      expect(vi.mocked(exportUtils.exportData)).toHaveBeenCalledWith(
        expect.any(Array),
        'csv',
        expect.any(String),
        expect.objectContaining({
          title: expect.stringContaining('Attendance Report'),
          sheetName: 'Attendance',
        })
      );
    });
  });

  it('should export as Excel format', async () => {
    render(<AttendanceReports employeeId={mockEmployeeId} />);

    const fromDateInput = screen.getByLabelText('From Date') as HTMLInputElement;
    const toDateInput = screen.getByLabelText('To Date') as HTMLInputElement;

    fireEvent.change(fromDateInput, { target: { value: mockFromDate } });
    fireEvent.change(toDateInput, { target: { value: mockToDate } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Export as Excel/i })).not.toBeDisabled();
    });

    const excelButton = screen.getByRole('button', { name: /Export as Excel/i });
    fireEvent.click(excelButton);

    await waitFor(() => {
      expect(vi.mocked(exportUtils.exportData)).toHaveBeenCalledWith(
        expect.any(Array),
        'excel',
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  it('should export as PDF format', async () => {
    render(<AttendanceReports employeeId={mockEmployeeId} />);

    const fromDateInput = screen.getByLabelText('From Date') as HTMLInputElement;
    const toDateInput = screen.getByLabelText('To Date') as HTMLInputElement;

    fireEvent.change(fromDateInput, { target: { value: mockFromDate } });
    fireEvent.change(toDateInput, { target: { value: mockToDate } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Export as PDF/i })).not.toBeDisabled();
    });

    const pdfButton = screen.getByRole('button', { name: /Export as PDF/i });
    fireEvent.click(pdfButton);

    await waitFor(() => {
      expect(vi.mocked(exportUtils.exportData)).toHaveBeenCalledWith(
        expect.any(Array),
        'pdf',
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  it('should download file after export', async () => {
    render(<AttendanceReports employeeId={mockEmployeeId} />);

    const fromDateInput = screen.getByLabelText('From Date') as HTMLInputElement;
    const toDateInput = screen.getByLabelText('To Date') as HTMLInputElement;

    fireEvent.change(fromDateInput, { target: { value: mockFromDate } });
    fireEvent.change(toDateInput, { target: { value: mockToDate } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Export as CSV/i })).not.toBeDisabled();
    });

    const csvButton = screen.getByRole('button', { name: /Export as CSV/i });
    fireEvent.click(csvButton);

    await waitFor(() => {
      expect(vi.mocked(exportUtils.downloadBlob)).toHaveBeenCalled();
    });
  });

  it('should display error message on export failure', async () => {
    const errorMessage = 'Export failed';
    vi.mocked(exportUtils.exportData).mockRejectedValueOnce(new Error(errorMessage));

    render(<AttendanceReports employeeId={mockEmployeeId} />);

    const fromDateInput = screen.getByLabelText('From Date') as HTMLInputElement;
    const toDateInput = screen.getByLabelText('To Date') as HTMLInputElement;

    fireEvent.change(fromDateInput, { target: { value: mockFromDate } });
    fireEvent.change(toDateInput, { target: { value: mockToDate } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Export as CSV/i })).not.toBeDisabled();
    });

    const csvButton = screen.getByRole('button', { name: /Export as CSV/i });
    fireEvent.click(csvButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should display error message on record load failure', async () => {
    const errorMessage = 'Failed to load attendance records';
    vi.mocked(attendanceService.getRecords).mockRejectedValueOnce(new Error(errorMessage));

    render(<AttendanceReports employeeId={mockEmployeeId} />);

    const fromDateInput = screen.getByLabelText('From Date') as HTMLInputElement;
    const toDateInput = screen.getByLabelText('To Date') as HTMLInputElement;

    fireEvent.change(fromDateInput, { target: { value: mockFromDate } });
    fireEvent.change(toDateInput, { target: { value: mockToDate } });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should disable export buttons when no records are loaded', () => {
    render(<AttendanceReports employeeId={mockEmployeeId} />);

    const csvButton = screen.getByRole('button', { name: /Export as CSV/i });
    const excelButton = screen.getByRole('button', { name: /Export as Excel/i });
    const pdfButton = screen.getByRole('button', { name: /Export as PDF/i });

    expect(csvButton).toBeDisabled();
    expect(excelButton).toBeDisabled();
    expect(pdfButton).toBeDisabled();
  });

  it('should display report summary when stats are available', async () => {
    render(<AttendanceReports employeeId={mockEmployeeId} />);

    const fromDateInput = screen.getByLabelText('From Date') as HTMLInputElement;
    const toDateInput = screen.getByLabelText('To Date') as HTMLInputElement;

    fireEvent.change(fromDateInput, { target: { value: mockFromDate } });
    fireEvent.change(toDateInput, { target: { value: mockToDate } });

    await waitFor(() => {
      expect(screen.getByText('Report Summary')).toBeInTheDocument();
      expect(screen.getByText('Total Working Days')).toBeInTheDocument();
      expect(screen.getByText('Present')).toBeInTheDocument();
      expect(screen.getByText('Absent')).toBeInTheDocument();
    });
  });

  it('should display attendance percentage', async () => {
    render(<AttendanceReports employeeId={mockEmployeeId} />);

    const fromDateInput = screen.getByLabelText('From Date') as HTMLInputElement;
    const toDateInput = screen.getByLabelText('To Date') as HTMLInputElement;

    fireEvent.change(fromDateInput, { target: { value: mockFromDate } });
    fireEvent.change(toDateInput, { target: { value: mockToDate } });

    await waitFor(() => {
      expect(screen.getByText(/Attendance Percentage/i)).toBeInTheDocument();
      expect(screen.getByText(/90\.0% attendance/i)).toBeInTheDocument();
    });
  });

  it('should format attendance data for export', async () => {
    render(<AttendanceReports employeeId={mockEmployeeId} />);

    const fromDateInput = screen.getByLabelText('From Date') as HTMLInputElement;
    const toDateInput = screen.getByLabelText('To Date') as HTMLInputElement;

    fireEvent.change(fromDateInput, { target: { value: mockFromDate } });
    fireEvent.change(toDateInput, { target: { value: mockToDate } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Export as CSV/i })).not.toBeDisabled();
    });

    const csvButton = screen.getByRole('button', { name: /Export as CSV/i });
    fireEvent.click(csvButton);

    await waitFor(() => {
      expect(vi.mocked(exportUtils.formatAttendanceForExport)).toHaveBeenCalledWith(
        mockAttendanceRecords
      );
    });
  });

  it('should include filtered data in export', async () => {
    render(<AttendanceReports employeeId={mockEmployeeId} />);

    const fromDateInput = screen.getByLabelText('From Date') as HTMLInputElement;
    const toDateInput = screen.getByLabelText('To Date') as HTMLInputElement;

    fireEvent.change(fromDateInput, { target: { value: mockFromDate } });
    fireEvent.change(toDateInput, { target: { value: mockToDate } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Export as CSV/i })).not.toBeDisabled();
    });

    const csvButton = screen.getByRole('button', { name: /Export as CSV/i });
    fireEvent.click(csvButton);

    await waitFor(() => {
      // Verify that the export includes the filtered records
      expect(vi.mocked(exportUtils.exportData)).toHaveBeenCalledWith(
        expect.any(Array),
        'csv',
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  it('should display export format information', () => {
    render(<AttendanceReports employeeId={mockEmployeeId} />);

    expect(screen.getByText('CSV Format')).toBeInTheDocument();
    expect(screen.getByText('Excel Format')).toBeInTheDocument();
    expect(screen.getByText('PDF Format')).toBeInTheDocument();
  });

  it('should call print function when print button is clicked', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(<AttendanceReports employeeId={mockEmployeeId} />);

    const fromDateInput = screen.getByLabelText('From Date') as HTMLInputElement;
    const toDateInput = screen.getByLabelText('To Date') as HTMLInputElement;

    fireEvent.change(fromDateInput, { target: { value: mockFromDate } });
    fireEvent.change(toDateInput, { target: { value: mockToDate } });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Print Report/i })).not.toBeDisabled();
    });

    const printButton = screen.getByRole('button', { name: /Print Report/i });
    fireEvent.click(printButton);

    expect(printSpy).toHaveBeenCalled();

    printSpy.mockRestore();
  });

  it('should handle empty records gracefully', async () => {
    vi.mocked(attendanceService.getRecords).mockResolvedValueOnce([]);

    render(<AttendanceReports employeeId={mockEmployeeId} />);

    const fromDateInput = screen.getByLabelText('From Date') as HTMLInputElement;
    const toDateInput = screen.getByLabelText('To Date') as HTMLInputElement;

    fireEvent.change(fromDateInput, { target: { value: mockFromDate } });
    fireEvent.change(toDateInput, { target: { value: mockToDate } });

    // Wait for the records to be loaded (empty)
    await waitFor(() => {
      const csvButton = screen.getByRole('button', { name: /Export as CSV/i });
      expect(csvButton).toBeDisabled();
    });
  });
});
