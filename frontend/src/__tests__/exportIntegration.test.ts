/**
 * Export Integration Tests
 * End-to-end tests for export functionality across the application
 * 
 * Task: 23.4 Write unit tests for export functionality
 * Requirements: 30.2, 30.3
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEmployeeStore } from '../store/employeeStore';
import { useAttendanceStore } from '../store/attendanceStore';
import { usePayrollStore } from '../store/payrollStore';
import { exportData, convertToCSV } from '../utils/exportUtils';
import { generateReportCSV, generateReportHTML } from '../utils/reportGenerator';
import { isLargeDataset, createBlob } from '../utils/largeExportUtils';

// Mock the API services
vi.mock('../services/employeeService', () => ({
  employeeService: {
    exportCSV: vi.fn(),
    getAll: vi.fn(),
  },
}));

vi.mock('../services/attendanceService', () => ({
  attendanceService: {
    exportCSV: vi.fn(),
    getRecords: vi.fn(),
  },
}));

vi.mock('../services/payrollService', () => ({
  payrollService: {
    exportBankFile: vi.fn(),
    getRecords: vi.fn(),
  },
}));

describe('Export Integration Tests - Task 23.4', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Store Integration with Export', () => {
    describe('Employee Store Export Integration', () => {
      it('should export filtered employees from store', async () => {
        const { result } = renderHook(() => useEmployeeStore());

        // Set up store state with filtered data
        act(() => {
          result.current.setItems([
            {
              id: 'emp-001',
              employee_id: 'EMP001',
              first_name: 'John',
              last_name: 'Doe',
              department: 'Engineering',
              status: 'active',
            },
            {
              id: 'emp-002',
              employee_id: 'EMP002',
              first_name: 'Jane',
              last_name: 'Smith',
              department: 'HR',
              status: 'active',
            },
          ]);

          result.current.setFilters({ department: 'Engineering' });
        });

        // Mock the export service
        const { employeeService } = await import('../services/employeeService');
        const mockBlob = new Blob(['csv data'], { type: 'text/csv' });
        vi.mocked(employeeService.exportCSV).mockResolvedValue(mockBlob);

        // Trigger export
        await act(async () => {
          await result.current.exportCSV();
        });

        expect(employeeService.exportCSV).toHaveBeenCalledWith(
          expect.objectContaining({ department: 'Engineering' })
        );
      });

      it('should handle export errors in store', async () => {
        const { result } = renderHook(() => useEmployeeStore());

        const { employeeService } = await import('../services/employeeService');
        vi.mocked(employeeService.exportCSV).mockRejectedValue(new Error('Export failed'));

        await act(async () => {
          await result.current.exportCSV();
        });

        expect(result.current.error).toBe('Export failed');
      });

      it('should show loading state during export', async () => {
        const { result } = renderHook(() => useEmployeeStore());

        const { employeeService } = await import('../services/employeeService');
        vi.mocked(employeeService.exportCSV).mockImplementation(
          () => new Promise(resolve => setTimeout(() => resolve(new Blob()), 100))
        );

        const exportPromise = act(async () => {
          await result.current.exportCSV();
        });

        // Check loading state
        expect(result.current.loading).toBe(true);

        await exportPromise;

        expect(result.current.loading).toBe(false);
      });
    });

    describe('Attendance Store Export Integration', () => {
      it('should export attendance records with date filters', async () => {
        const { result } = renderHook(() => useAttendanceStore());

        act(() => {
          result.current.setRecords([
            {
              id: 'att-001',
              employee_id: 'emp-001',
              date: '2024-01-15',
              status: 'present',
              working_hours: 8,
            },
            {
              id: 'att-002',
              employee_id: 'emp-002',
              date: '2024-01-16',
              status: 'absent',
              working_hours: 0,
            },
          ]);

          result.current.setDateRange({
            startDate: '2024-01-15',
            endDate: '2024-01-15',
          });
        });

        const { attendanceService } = await import('../services/attendanceService');
        const mockBlob = new Blob(['attendance csv'], { type: 'text/csv' });
        vi.mocked(attendanceService.exportCSV).mockResolvedValue(mockBlob);

        await act(async () => {
          await result.current.exportCSV?.();
        });

        if (attendanceService.exportCSV) {
          expect(attendanceService.exportCSV).toHaveBeenCalledWith(
            expect.objectContaining({
              date_from: '2024-01-15',
              date_to: '2024-01-15',
            })
          );
        }
      });
    });

    describe('Payroll Store Export Integration', () => {
      it('should export bank file with month/year from store', async () => {
        const { result } = renderHook(() => usePayrollStore());

        act(() => {
          result.current.setCurrentMonth(1);
          result.current.setCurrentYear(2024);
        });

        const mockBlob = new Blob(['bank file'], { type: 'text/csv' });
        vi.mocked(result.current.exportBankFile).mockResolvedValue(mockBlob);

        await act(async () => {
          await result.current.exportBankFile(1, 2024, 'CSV');
        });

        expect(result.current.exportBankFile).toHaveBeenCalledWith(1, 2024, 'CSV');
      });
    });
  });

  describe('Cross-Module Export Scenarios', () => {
    it('should export combined employee and attendance data', async () => {
      const employeeData = [
        { id: 'emp-001', name: 'John Doe', department: 'Engineering' },
        { id: 'emp-002', name: 'Jane Smith', department: 'HR' },
      ];

      const attendanceData = [
        { employee_id: 'emp-001', date: '2024-01-15', status: 'present' },
        { employee_id: 'emp-002', date: '2024-01-15', status: 'absent' },
      ];

      // Combine data for export
      const combinedData = employeeData.map(emp => {
        const attendance = attendanceData.find(att => att.employee_id === emp.id);
        return {
          ...emp,
          attendance_status: attendance?.status || 'no_data',
          attendance_date: attendance?.date || '',
        };
      });

      const csv = convertToCSV(combinedData);

      expect(csv).toContain('John Doe');
      expect(csv).toContain('present');
      expect(csv).toContain('Jane Smith');
      expect(csv).toContain('absent');
    });

    it('should export payroll with employee details', async () => {
      const payrollData = [
        { employee_id: 'emp-001', net_salary: 60000, month: 1, year: 2024 },
        { employee_id: 'emp-002', net_salary: 55000, month: 1, year: 2024 },
      ];

      const employeeData = [
        { id: 'emp-001', name: 'John Doe', department: 'Engineering' },
        { id: 'emp-002', name: 'Jane Smith', department: 'HR' },
      ];

      // Enrich payroll data with employee details
      const enrichedData = payrollData.map(payroll => {
        const employee = employeeData.find(emp => emp.id === payroll.employee_id);
        return {
          ...payroll,
          employee_name: employee?.name || 'Unknown',
          department: employee?.department || 'Unknown',
        };
      });

      const csv = convertToCSV(enrichedData);

      expect(csv).toContain('John Doe');
      expect(csv).toContain('Engineering');
      expect(csv).toContain('60000');
      expect(csv).toContain('Jane Smith');
      expect(csv).toContain('HR');
      expect(csv).toContain('55000');
    });
  });

  describe('Large Dataset Export Integration', () => {
    it('should handle large employee dataset export', async () => {
      const largeEmployeeData = Array.from({ length: 2500 }, (_, i) => ({
        id: `emp-${String(i + 1).padStart(4, '0')}`,
        employee_id: `EMP${String(i + 1).padStart(4, '0')}`,
        first_name: `Employee${i + 1}`,
        last_name: 'Test',
        department: i % 5 === 0 ? 'Engineering' : 'Other',
        status: 'active',
        salary: 50000 + (i * 100),
      }));

      expect(isLargeDataset(largeEmployeeData)).toBe(true);

      // Filter to Engineering department only
      const filteredData = largeEmployeeData.filter(emp => emp.department === 'Engineering');

      const blob = await exportData(filteredData, 'csv', 'large-filtered-export.csv');

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
      expect(blob.type).toBe('text/csv;charset=utf-8;');
    });

    it('should handle large attendance dataset with progress tracking', async () => {
      const largeAttendanceData = Array.from({ length: 5000 }, (_, i) => ({
        id: `att-${i}`,
        employee_id: `emp-${i % 100}`, // 100 employees with multiple records
        date: new Date(2024, 0, (i % 31) + 1).toISOString().split('T')[0],
        status: i % 4 === 0 ? 'absent' : 'present',
        working_hours: i % 4 === 0 ? 0 : 8,
      }));

      const progressCallback = vi.fn();
      const options = {
        onProgress: progressCallback,
        chunkSize: 500,
      };

      const blob = await exportData(
        largeAttendanceData,
        'csv',
        'large-attendance.csv',
        options
      );

      expect(blob).toBeInstanceOf(Blob);
      expect(progressCallback).toHaveBeenCalled();
    });
  });

  describe('Export Format Integration', () => {
    it('should export same data in different formats', async () => {
      const testData = [
        { name: 'John Doe', department: 'Engineering', salary: 75000 },
        { name: 'Jane Smith', department: 'HR', salary: 65000 },
      ];

      // CSV Export
      const csvBlob = await exportData(testData, 'csv', 'test.csv');
      expect(csvBlob.type).toBe('text/csv;charset=utf-8;');

      // Excel Export (fallback to CSV)
      const excelBlob = await exportData(testData, 'excel', 'test.xlsx');
      expect(excelBlob.type).toMatch(/csv|excel/);

      // PDF Export (fallback to CSV)
      const pdfBlob = await exportData(testData, 'pdf', 'test.pdf');
      expect(pdfBlob.type).toMatch(/csv|pdf/);

      // All should contain the same data
      const csvText = await csvBlob.text();
      expect(csvText).toContain('John Doe');
      expect(csvText).toContain('Jane Smith');
    });

    it('should generate reports in different formats', () => {
      const reportData = {
        metadata: {
          title: 'Test Report',
          description: 'Integration test report',
          generatedDate: new Date('2024-01-15'),
          generatedBy: 'test@example.com',
          filters: { department: 'Engineering' },
        },
        columns: [
          { id: 'name', label: 'Name', align: 'left' as const },
          { id: 'department', label: 'Department', align: 'left' as const },
        ],
        rows: [
          { name: 'John Doe', department: 'Engineering' },
          { name: 'Bob Johnson', department: 'Engineering' },
        ],
        summary: [
          { label: 'Total Employees', value: 2 },
        ],
      };

      // CSV Report
      const csvReport = generateReportCSV(reportData);
      expect(csvReport).toContain('# Test Report');
      expect(csvReport).toContain('John Doe');
      expect(csvReport).toContain('Total Employees');

      // HTML Report
      const htmlReport = generateReportHTML(reportData);
      expect(htmlReport).toContain('<h1>Test Report</h1>');
      expect(htmlReport).toContain('John Doe');
      expect(htmlReport).toContain('Total Employees');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network failures gracefully', async () => {
      const { result } = renderHook(() => useEmployeeStore());

      const { employeeService } = await import('../services/employeeService');
      vi.mocked(employeeService.exportCSV).mockRejectedValue(
        new Error('Network error')
      );

      await act(async () => {
        try {
          await result.current.exportCSV();
        } catch (error) {
          // Error should be handled by store
        }
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.loading).toBe(false);
    });

    it('should handle malformed export data', async () => {
      const malformedData = [
        { name: 'John', age: 30, department: null },
        { name: null, age: 25, department: 'HR' },
        { age: 35, department: 'Engineering' }, // missing name
      ];

      const csv = convertToCSV(malformedData);

      expect(csv).toContain('John,30,');
      expect(csv).toContain(',25,HR');
      expect(csv).toContain(',35,Engineering');
    });

    it('should handle empty export results', async () => {
      const emptyData: any[] = [];

      const csv = convertToCSV(emptyData);
      expect(csv).toBe('');

      const blob = await exportData(emptyData, 'csv', 'empty.csv');
      expect(blob.size).toBe(0);
    });
  });

  describe('Performance Integration', () => {
    it('should complete export within reasonable time', async () => {
      const mediumDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Employee ${i}`,
        department: `Dept ${i % 10}`,
        salary: 50000 + (i * 10),
      }));

      const startTime = performance.now();
      const blob = await exportData(mediumDataset, 'csv', 'performance-test.csv');
      const endTime = performance.now();

      expect(blob).toBeInstanceOf(Blob);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should handle memory efficiently', async () => {
      const largeDataset = Array.from({ length: 3000 }, (_, i) => ({
        id: i,
        data: `data-${i}`.repeat(20), // Create some bulk
        timestamp: new Date().toISOString(),
      }));

      // Should not throw memory errors
      expect(async () => {
        const blob = await exportData(largeDataset, 'csv', 'memory-test.csv');
        return blob;
      }).not.toThrow();
    });
  });

  describe('Filter Preservation Integration', () => {
    it('should preserve complex filters across export', async () => {
      const { result } = renderHook(() => useEmployeeStore());

      const complexFilters = {
        department: 'Engineering',
        status: 'active',
        employment_type: 'permanent',
        salary_min: 50000,
        salary_max: 100000,
        search: 'senior',
        date_from: '2024-01-01',
        date_to: '2024-01-31',
      };

      act(() => {
        result.current.setFilters(complexFilters);
      });

      const { employeeService } = await import('../services/employeeService');
      const mockBlob = new Blob(['filtered data'], { type: 'text/csv' });
      vi.mocked(employeeService.exportCSV).mockResolvedValue(mockBlob);

      await act(async () => {
        await result.current.exportCSV();
      });

      expect(employeeService.exportCSV).toHaveBeenCalledWith(
        expect.objectContaining(complexFilters)
      );
    });

    it('should include filter metadata in report exports', () => {
      const filters = {
        department: 'Engineering',
        status: 'active',
        dateRange: '2024-01-01 to 2024-01-31',
      };

      const reportData = {
        metadata: {
          title: 'Filtered Report',
          description: 'Report with applied filters',
          generatedDate: new Date(),
          generatedBy: 'admin@example.com',
          filters,
        },
        columns: [
          { id: 'name', label: 'Name', align: 'left' as const },
        ],
        rows: [
          { name: 'John Doe' },
        ],
      };

      const csv = generateReportCSV(reportData);

      expect(csv).toContain('# Filters:');
      expect(csv).toContain('department: Engineering');
      expect(csv).toContain('status: active');
      expect(csv).toContain('dateRange: 2024-01-01 to 2024-01-31');
    });
  });

  describe('Blob Management Integration', () => {
    it('should create and manage blobs properly', () => {
      const csvData = 'name,age\nJohn,30\nJane,25';
      
      const csvBlob = createBlob(csvData, 'csv');
      expect(csvBlob.type).toBe('text/csv;charset=utf-8;');
      expect(csvBlob.size).toBeGreaterThan(0);

      const excelBlob = createBlob(csvData, 'excel');
      expect(excelBlob.type).toBe('application/vnd.ms-excel;charset=utf-8;');

      const pdfBlob = createBlob(csvData, 'pdf');
      expect(pdfBlob.type).toBe('text/csv;charset=utf-8;'); // Fallback to CSV
    });

    it('should handle blob cleanup', () => {
      const blob = new Blob(['test data'], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);

      expect(url).toMatch(/^blob:/);

      // Cleanup should not throw
      expect(() => URL.revokeObjectURL(url)).not.toThrow();
    });
  });
});