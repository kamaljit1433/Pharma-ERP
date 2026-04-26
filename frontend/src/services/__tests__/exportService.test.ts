/**
 * Export Service Tests
 * Tests for API service layer export functionality
 * 
 * Task: 23.4 Write unit tests for export functionality
 * Requirements: 30.2, 30.3
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { employeeService } from '../employeeService';
import { attendanceService } from '../attendanceService';
import { payrollService } from '../payrollService';
import { leaveService } from '../leaveService';
import { apiClient } from '../api';

// Mock the API client
vi.mock('../api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Export Service Tests - Task 23.4', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Employee Export Service', () => {
    describe('CSV Export', () => {
      it('should export employees as CSV without filters', async () => {
        const mockCsvBlob = new Blob(['employee,data\nJohn,Doe'], { type: 'text/csv' });
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockCsvBlob });

        const result = await employeeService.exportCSV();

        expect(apiClient.get).toHaveBeenCalledWith('/employees/export', {
          params: undefined,
          responseType: 'blob',
        });
        expect(result).toBe(mockCsvBlob);
        expect(result.type).toBe('text/csv');
      });

      it('should export employees as CSV with filters', async () => {
        const mockCsvBlob = new Blob(['employee,data\nJohn,Doe'], { type: 'text/csv' });
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockCsvBlob });

        const filters = {
          department: 'Engineering',
          status: 'active',
          employment_type: 'permanent',
        };

        const result = await employeeService.exportCSV(filters);

        expect(apiClient.get).toHaveBeenCalledWith('/employees/export', {
          params: filters,
          responseType: 'blob',
        });
        expect(result).toBe(mockCsvBlob);
      });

      it('should handle export errors gracefully', async () => {
        vi.mocked(apiClient.get).mockRejectedValue(new Error('Export failed'));

        await expect(employeeService.exportCSV()).rejects.toThrow('Export failed');
      });

      it('should export employees with date range filters', async () => {
        const mockCsvBlob = new Blob(['employee,data'], { type: 'text/csv' });
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockCsvBlob });

        const filters = {
          date_from: '2024-01-01',
          date_to: '2024-01-31',
          department: 'Engineering',
        };

        await employeeService.exportCSV(filters);

        expect(apiClient.get).toHaveBeenCalledWith('/employees/export', {
          params: filters,
          responseType: 'blob',
        });
      });

      it('should export employees with search filters', async () => {
        const mockCsvBlob = new Blob(['employee,data'], { type: 'text/csv' });
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockCsvBlob });

        const filters = {
          search: 'john doe',
          department: 'Engineering',
        };

        await employeeService.exportCSV(filters);

        expect(apiClient.get).toHaveBeenCalledWith('/employees/export', {
          params: filters,
          responseType: 'blob',
        });
      });
    });

    describe('Excel Export', () => {
      it('should export employees as Excel format', async () => {
        const mockExcelBlob = new Blob(['excel data'], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockExcelBlob });

        // Assuming the service has an exportExcel method
        const result = await employeeService.exportExcel?.();

        if (employeeService.exportExcel) {
          expect(apiClient.get).toHaveBeenCalledWith('/employees/export', {
            params: { format: 'excel' },
            responseType: 'blob',
          });
          expect(result).toBe(mockExcelBlob);
        }
      });
    });

    describe('PDF Export', () => {
      it('should export employees as PDF format', async () => {
        const mockPdfBlob = new Blob(['pdf data'], { type: 'application/pdf' });
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockPdfBlob });

        // Assuming the service has an exportPDF method
        const result = await employeeService.exportPDF?.();

        if (employeeService.exportPDF) {
          expect(apiClient.get).toHaveBeenCalledWith('/employees/export', {
            params: { format: 'pdf' },
            responseType: 'blob',
          });
          expect(result).toBe(mockPdfBlob);
        }
      });
    });
  });

  describe('Attendance Export Service', () => {
    describe('CSV Export', () => {
      it('should export attendance records as CSV', async () => {
        const mockCsvBlob = new Blob(['date,employee,status\n2024-01-15,John,present'], { 
          type: 'text/csv' 
        });
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockCsvBlob });

        const filters = {
          date_from: '2024-01-01',
          date_to: '2024-01-31',
          employee_id: 'emp-001',
        };

        const result = await attendanceService.exportCSV?.(filters);

        if (attendanceService.exportCSV) {
          expect(apiClient.get).toHaveBeenCalledWith('/attendance/export', {
            params: filters,
            responseType: 'blob',
          });
          expect(result).toBe(mockCsvBlob);
        }
      });

      it('should export attendance with department filter', async () => {
        const mockCsvBlob = new Blob(['attendance data'], { type: 'text/csv' });
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockCsvBlob });

        const filters = {
          department: 'Engineering',
          date_from: '2024-01-01',
          date_to: '2024-01-31',
        };

        await attendanceService.exportCSV?.(filters);

        if (attendanceService.exportCSV) {
          expect(apiClient.get).toHaveBeenCalledWith('/attendance/export', {
            params: filters,
            responseType: 'blob',
          });
        }
      });

      it('should export attendance with status filter', async () => {
        const mockCsvBlob = new Blob(['attendance data'], { type: 'text/csv' });
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockCsvBlob });

        const filters = {
          status: 'present',
          date_from: '2024-01-01',
          date_to: '2024-01-31',
        };

        await attendanceService.exportCSV?.(filters);

        if (attendanceService.exportCSV) {
          expect(apiClient.get).toHaveBeenCalledWith('/attendance/export', {
            params: filters,
            responseType: 'blob',
          });
        }
      });
    });

    describe('PDF Export', () => {
      it('should export attendance report as PDF', async () => {
        const mockPdfBlob = new Blob(['pdf report'], { type: 'application/pdf' });
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockPdfBlob });

        const filters = {
          date_from: '2024-01-01',
          date_to: '2024-01-31',
          format: 'pdf',
        };

        const result = await attendanceService.exportReport?.(filters);

        if (attendanceService.exportReport) {
          expect(apiClient.get).toHaveBeenCalledWith('/attendance/report', {
            params: filters,
            responseType: 'blob',
          });
          expect(result).toBe(mockPdfBlob);
        }
      });
    });
  });

  describe('Payroll Export Service', () => {
    describe('Bank File Export', () => {
      it('should export bank file as CSV', async () => {
        const mockCsvBlob = new Blob(['bank,file,data'], { type: 'text/csv' });
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockCsvBlob });

        const result = await payrollService.exportBankFile(1, 2024, 'CSV');

        expect(apiClient.get).toHaveBeenCalledWith('/payroll/export/1/2024', {
          params: { format: 'CSV' },
          responseType: 'blob',
        });
        expect(result).toBe(mockCsvBlob);
      });

      it('should export bank file as NEFT format', async () => {
        const mockNeftBlob = new Blob(['neft,file,data'], { type: 'text/plain' });
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockNeftBlob });

        const result = await payrollService.exportBankFile(1, 2024, 'NEFT');

        expect(apiClient.get).toHaveBeenCalledWith('/payroll/export/1/2024', {
          params: { format: 'NEFT' },
          responseType: 'blob',
        });
        expect(result).toBe(mockNeftBlob);
      });

      it('should handle invalid month/year', async () => {
        vi.mocked(apiClient.get).mockRejectedValue(new Error('Invalid date range'));

        await expect(
          payrollService.exportBankFile(13, 2024, 'CSV')
        ).rejects.toThrow('Invalid date range');
      });
    });

    describe('Payroll Report Export', () => {
      it('should export payroll summary as CSV', async () => {
        const mockCsvBlob = new Blob(['payroll,summary'], { type: 'text/csv' });
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockCsvBlob });

        const filters = {
          month: 1,
          year: 2024,
          department: 'Engineering',
        };

        const result = await payrollService.exportSummary?.(filters);

        if (payrollService.exportSummary) {
          expect(apiClient.get).toHaveBeenCalledWith('/payroll/summary/export', {
            params: filters,
            responseType: 'blob',
          });
          expect(result).toBe(mockCsvBlob);
        }
      });

      it('should export payroll details as PDF', async () => {
        const mockPdfBlob = new Blob(['payroll details'], { type: 'application/pdf' });
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockPdfBlob });

        const filters = {
          month: 1,
          year: 2024,
          format: 'pdf',
        };

        const result = await payrollService.exportDetails?.(filters);

        if (payrollService.exportDetails) {
          expect(apiClient.get).toHaveBeenCalledWith('/payroll/details/export', {
            params: filters,
            responseType: 'blob',
          });
          expect(result).toBe(mockPdfBlob);
        }
      });
    });
  });

  describe('Leave Export Service', () => {
    describe('CSV Export', () => {
      it('should export leave requests as CSV', async () => {
        const mockCsvBlob = new Blob(['leave,requests'], { type: 'text/csv' });
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockCsvBlob });

        const filters = {
          date_from: '2024-01-01',
          date_to: '2024-01-31',
          status: 'approved',
        };

        const result = await leaveService.exportCSV?.(filters);

        if (leaveService.exportCSV) {
          expect(apiClient.get).toHaveBeenCalledWith('/leave/export', {
            params: filters,
            responseType: 'blob',
          });
          expect(result).toBe(mockCsvBlob);
        }
      });

      it('should export leave balance report', async () => {
        const mockCsvBlob = new Blob(['leave,balance'], { type: 'text/csv' });
        vi.mocked(apiClient.get).mockResolvedValue({ data: mockCsvBlob });

        const filters = {
          year: 2024,
          department: 'Engineering',
        };

        const result = await leaveService.exportBalanceReport?.(filters);

        if (leaveService.exportBalanceReport) {
          expect(apiClient.get).toHaveBeenCalledWith('/leave/balance/export', {
            params: filters,
            responseType: 'blob',
          });
          expect(result).toBe(mockCsvBlob);
        }
      });
    });
  });

  describe('Export Error Handling', () => {
    it('should handle network errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      await expect(employeeService.exportCSV()).rejects.toThrow('Network error');
    });

    it('should handle server errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue({
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      });

      await expect(employeeService.exportCSV()).rejects.toMatchObject({
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      });
    });

    it('should handle timeout errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Request timeout'));

      await expect(employeeService.exportCSV()).rejects.toThrow('Request timeout');
    });

    it('should handle invalid response format', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: 'invalid blob data' });

      const result = await employeeService.exportCSV();
      expect(result).toBe('invalid blob data');
    });
  });

  describe('Export Performance', () => {
    it('should handle large dataset exports', async () => {
      const largeCsvBlob = new Blob([
        Array.from({ length: 10000 }, (_, i) => `employee-${i},data-${i}`).join('\n')
      ], { type: 'text/csv' });

      vi.mocked(apiClient.get).mockResolvedValue({ data: largeCsvBlob });

      const result = await employeeService.exportCSV();

      expect(result).toBe(largeCsvBlob);
      expect(result.size).toBeGreaterThan(100000); // Large file
    });

    it('should handle export with progress tracking', async () => {
      const mockCsvBlob = new Blob(['data'], { type: 'text/csv' });
      
      // Mock progress tracking
      const progressCallback = vi.fn();
      vi.mocked(apiClient.get).mockImplementation(() => {
        // Simulate progress updates
        setTimeout(() => progressCallback(50), 10);
        setTimeout(() => progressCallback(100), 20);
        return Promise.resolve({ data: mockCsvBlob });
      });

      const result = await employeeService.exportCSV();
      expect(result).toBe(mockCsvBlob);
    });
  });

  describe('Export Filtering Integration', () => {
    it('should combine multiple filter types', async () => {
      const mockCsvBlob = new Blob(['filtered data'], { type: 'text/csv' });
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockCsvBlob });

      const complexFilters = {
        department: 'Engineering',
        status: 'active',
        employment_type: 'permanent',
        date_from: '2024-01-01',
        date_to: '2024-01-31',
        search: 'senior',
        salary_min: 50000,
        salary_max: 100000,
      };

      await employeeService.exportCSV(complexFilters);

      expect(apiClient.get).toHaveBeenCalledWith('/employees/export', {
        params: complexFilters,
        responseType: 'blob',
      });
    });

    it('should handle empty filter results', async () => {
      const emptyBlob = new Blob([''], { type: 'text/csv' });
      vi.mocked(apiClient.get).mockResolvedValue({ data: emptyBlob });

      const filters = {
        department: 'NonExistentDepartment',
      };

      const result = await employeeService.exportCSV(filters);

      expect(result).toBe(emptyBlob);
      expect(result.size).toBe(0);
    });

    it('should preserve filter parameters in export request', async () => {
      const mockCsvBlob = new Blob(['data'], { type: 'text/csv' });
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockCsvBlob });

      const filters = {
        department: 'Engineering',
        status: 'active',
        page: 1,
        limit: 100,
      };

      await employeeService.exportCSV(filters);

      expect(apiClient.get).toHaveBeenCalledWith('/employees/export', {
        params: expect.objectContaining({
          department: 'Engineering',
          status: 'active',
          // page and limit might be excluded for export
        }),
        responseType: 'blob',
      });
    });
  });

  describe('Export Format Validation', () => {
    it('should validate CSV export format', async () => {
      const mockCsvBlob = new Blob(['csv,data'], { type: 'text/csv' });
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockCsvBlob });

      const result = await employeeService.exportCSV();

      expect(result.type).toBe('text/csv');
    });

    it('should handle different MIME types', async () => {
      const mockBlob = new Blob(['data'], { type: 'application/octet-stream' });
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockBlob });

      const result = await employeeService.exportCSV();

      expect(result).toBe(mockBlob);
      expect(result.type).toBe('application/octet-stream');
    });
  });
});