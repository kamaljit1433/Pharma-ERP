/**
 * Export Utilities Tests
 * Tests for data export functionality (CSV, Excel, PDF)
 * Requirements: 26.1, 26.2, 26.3
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  convertToCSV,
  formatAttendanceForExport,
  getFileExtension,
  generateFilename,
  downloadBlob,
  exportData,
} from '../exportUtils';

describe('Export Utilities', () => {
  describe('convertToCSV', () => {
    it('should convert data to CSV format', () => {
      const data = [
        { name: 'John', age: 30, city: 'New York' },
        { name: 'Jane', age: 25, city: 'Los Angeles' },
      ];

      const csv = convertToCSV(data);

      // Headers are quoted in CSV format
      expect(csv).toContain('"name"');
      expect(csv).toContain('"age"');
      expect(csv).toContain('"city"');
      expect(csv).toContain('John,30,New York');
      expect(csv).toContain('Jane,25,Los Angeles');
    });

    it('should handle empty data', () => {
      const csv = convertToCSV([]);
      expect(csv).toBe('');
    });

    it('should escape quotes in CSV values', () => {
      const data = [{ name: 'John "Johnny" Doe', age: 30 }];

      const csv = convertToCSV(data);

      expect(csv).toContain('"John ""Johnny"" Doe"');
    });

    it('should quote values containing commas', () => {
      const data = [{ name: 'Doe, John', age: 30 }];

      const csv = convertToCSV(data);

      expect(csv).toContain('"Doe, John"');
    });

    it('should quote values containing newlines', () => {
      const data = [{ name: 'John\nDoe', age: 30 }];

      const csv = convertToCSV(data);

      expect(csv).toContain('"John\nDoe"');
    });

    it('should use custom headers if provided', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ];

      const csv = convertToCSV(data, ['name', 'age']);

      // Headers are quoted in CSV format
      expect(csv).toContain('"name"');
      expect(csv).toContain('"age"');
    });

    it('should handle null and undefined values', () => {
      const data = [
        { name: 'John', age: null, city: undefined },
        { name: 'Jane', age: 25, city: 'LA' },
      ];

      const csv = convertToCSV(data);

      expect(csv).toContain('John,,');
      expect(csv).toContain('Jane,25,LA');
    });
  });

  describe('formatAttendanceForExport', () => {
    it('should format attendance records for export', () => {
      const records = [
        {
          employee_id: 'emp-001',
          date: '2024-01-01',
          check_in_time: '2024-01-01T09:00:00Z',
          check_out_time: '2024-01-01T17:30:00Z',
          working_hours: 8.5,
          status: 'present',
          remarks: 'Regular day',
        },
      ];

      const formatted = formatAttendanceForExport(records);

      expect(formatted[0]['Employee ID']).toBe('emp-001');
      expect(formatted[0]['Status']).toBe('present');
      expect(formatted[0]['Working Hours']).toContain('8.50h');
    });

    it('should format dates correctly', () => {
      const records = [
        {
          employee_id: 'emp-001',
          date: '2024-01-15',
          status: 'present',
        },
      ];

      const formatted = formatAttendanceForExport(records);

      expect(formatted[0]['Date']).toMatch(/\d+\/\d+\/\d+/);
    });

    it('should format times correctly', () => {
      const records = [
        {
          employee_id: 'emp-001',
          date: '2024-01-01',
          check_in_time: '2024-01-01T09:00:00Z',
          check_out_time: '2024-01-01T17:30:00Z',
          status: 'present',
        },
      ];

      const formatted = formatAttendanceForExport(records);

      expect(formatted[0]['Check-in Time']).toMatch(/\d+:\d+:\d+/);
      expect(formatted[0]['Check-out Time']).toMatch(/\d+:\d+:\d+/);
    });

    it('should handle missing times', () => {
      const records = [
        {
          employee_id: 'emp-001',
          date: '2024-01-01',
          status: 'absent',
        },
      ];

      const formatted = formatAttendanceForExport(records);

      expect(formatted[0]['Check-in Time']).toBe('-');
      expect(formatted[0]['Check-out Time']).toBe('-');
      expect(formatted[0]['Working Hours']).toBe('-');
    });

    it('should handle missing remarks', () => {
      const records = [
        {
          employee_id: 'emp-001',
          date: '2024-01-01',
          status: 'present',
        },
      ];

      const formatted = formatAttendanceForExport(records);

      expect(formatted[0]['Remarks']).toBe('-');
    });
  });

  describe('getFileExtension', () => {
    it('should return csv extension for csv format', () => {
      expect(getFileExtension('csv')).toBe('csv');
    });

    it('should return xlsx extension for excel format', () => {
      expect(getFileExtension('excel')).toBe('xlsx');
    });

    it('should return pdf extension for pdf format', () => {
      expect(getFileExtension('pdf')).toBe('pdf');
    });
  });

  describe('generateFilename', () => {
    it('should generate filename with prefix and extension', () => {
      const filename = generateFilename('attendance-report', 'csv', false);
      expect(filename).toBe('attendance-report.csv');
    });

    it('should include timestamp in filename by default', () => {
      const filename = generateFilename('attendance-report', 'csv');
      expect(filename).toMatch(/attendance-report-\d{4}-\d{2}-\d{2}\.csv/);
    });

    it('should generate Excel filename', () => {
      const filename = generateFilename('attendance-report', 'excel', false);
      expect(filename).toBe('attendance-report.xlsx');
    });

    it('should generate PDF filename', () => {
      const filename = generateFilename('attendance-report', 'pdf', false);
      expect(filename).toBe('attendance-report.pdf');
    });
  });

  describe('downloadBlob', () => {
    it('should create a download link', () => {
      const blob = new Blob(['test data'], { type: 'text/plain' });
      const createElementSpy = vi.spyOn(document, 'createElement');

      // Mock URL methods to avoid test environment issues
      const originalCreateObjectURL = window.URL.createObjectURL;
      const originalRevokeObjectURL = window.URL.revokeObjectURL;
      window.URL.createObjectURL = vi.fn(() => 'blob:mock');
      window.URL.revokeObjectURL = vi.fn();

      try {
        downloadBlob(blob, 'test.txt');
        expect(createElementSpy).toHaveBeenCalledWith('a');
      } finally {
        window.URL.createObjectURL = originalCreateObjectURL;
        window.URL.revokeObjectURL = originalRevokeObjectURL;
        createElementSpy.mockRestore();
      }
    });
  });

  describe('exportData', () => {
    it('should export data as CSV', async () => {
      const data = [{ name: 'John', age: 30 }];

      const blob = await exportData(data, 'csv', 'test.csv');

      expect(blob).toBeInstanceOf(Blob);
      expect(blob!.type).toBe('text/csv;charset=utf-8;');
    });

    it('should throw error for unsupported format', async () => {
      const data = [{ name: 'John', age: 30 }];

      await expect(
        exportData(data, 'unsupported' as any, 'test.txt')
      ).rejects.toThrow('Unsupported export format');
    });

    it('should pass options to export functions', async () => {
      const data = [{ name: 'John', age: 30 }];
      const options = {
        headers: ['name', 'age'],
        title: 'Test Report',
      };

      const blob = await exportData(data, 'csv', 'test.csv', options);

      expect(blob).not.toBeNull();
    });
  });

  describe('CSV Export - Requirement 26.1', () => {
    it('should provide export functionality for data tables', () => {
      const data = [
        { id: '1', name: 'John', status: 'active' },
        { id: '2', name: 'Jane', status: 'inactive' },
      ];

      const csv = convertToCSV(data);

      // Headers are quoted in CSV format
      expect(csv).toContain('"id"');
      expect(csv).toContain('"name"');
      expect(csv).toContain('"status"');
      expect(csv).toContain('1,John,active');
      expect(csv).toContain('2,Jane,inactive');
    });
  });

  describe('Excel Export - Requirement 26.2', () => {
    it('should support Excel export format', async () => {
      const data = [{ name: 'John', age: 30 }];

      const blob = await exportData(data, 'excel', 'test.xlsx');

      expect(blob).toBeInstanceOf(Blob);
      expect(blob!.type).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    });
  });

  describe('PDF Export - Requirement 26.2', () => {
    it('should support PDF export format (opens print window, returns null)', async () => {
      const data = [{ name: 'John', age: 30 }];

      // PDF export opens a print window instead of returning a blob
      const blob = await exportData(data, 'pdf', 'test.pdf');

      expect(blob).toBeNull();
    });
  });

  describe('Filtered Data Export - Requirement 26.3', () => {
    it('should include filtered data in exports', async () => {
      const allRecords = [
        { id: '1', name: 'John', status: 'present' },
        { id: '2', name: 'Jane', status: 'absent' },
        { id: '3', name: 'Bob', status: 'present' },
      ];

      // Filter to only present records
      const filteredRecords = allRecords.filter((r) => r.status === 'present');

      const csv = convertToCSV(filteredRecords);

      expect(csv).toContain('John');
      expect(csv).toContain('Bob');
      expect(csv).not.toContain('Jane');
    });

    it('should export attendance records with date filters', () => {
      const records = [
        {
          employee_id: 'emp-001',
          date: '2024-01-01',
          status: 'present',
        },
        {
          employee_id: 'emp-001',
          date: '2024-01-02',
          status: 'absent',
        },
        {
          employee_id: 'emp-001',
          date: '2024-01-03',
          status: 'present',
        },
      ];

      // Filter records between dates
      const filtered = records.filter(
        (r) => r.date >= '2024-01-01' && r.date <= '2024-01-02'
      );

      const formatted = formatAttendanceForExport(filtered);

      expect(formatted).toHaveLength(2);
      expect(formatted[0]['Status']).toBe('present');
      expect(formatted[1]['Status']).toBe('absent');
    });
  });
});
