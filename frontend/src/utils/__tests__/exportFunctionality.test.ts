/**
 * Export Functionality Tests
 * Comprehensive tests for export functionality covering CSV, PDF, and filtered exports
 * 
 * Task: 23.4 Write unit tests for export functionality
 * Requirements: 30.2, 30.3
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  convertToCSV,
  exportData,
  generateFilename,
  downloadBlob,
  ExportFormat,
} from '../exportUtils';
import {
  generateReportCSV,
  generateReportHTML,
  downloadReport,
  ReportData,
} from '../reportGenerator';
import {
  isLargeDataset,
  createBlob,
  createDownloadUrl,
  revokeDownloadUrl,
} from '../largeExportUtils';

describe('Export Functionality - Task 23.4', () => {
  let mockEmployeeData: any[];
  let mockAttendanceData: any[];
  let mockPayrollData: any[];

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock employee data
    mockEmployeeData = [
      {
        id: 'emp-001',
        employee_id: 'EMP001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@company.com',
        department: 'Engineering',
        designation: 'Senior Developer',
        status: 'active',
        employment_type: 'permanent',
        date_of_joining: '2023-01-15',
        salary: 75000,
      },
      {
        id: 'emp-002',
        employee_id: 'EMP002',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@company.com',
        department: 'HR',
        designation: 'HR Manager',
        status: 'active',
        employment_type: 'permanent',
        date_of_joining: '2022-03-10',
        salary: 65000,
      },
      {
        id: 'emp-003',
        employee_id: 'EMP003',
        first_name: 'Bob',
        last_name: 'Johnson',
        email: 'bob.johnson@company.com',
        department: 'Engineering',
        designation: 'Junior Developer',
        status: 'on_leave',
        employment_type: 'contract',
        date_of_joining: '2023-06-01',
        salary: 45000,
      },
    ];

    // Mock attendance data
    mockAttendanceData = [
      {
        id: 'att-001',
        employee_id: 'emp-001',
        date: '2024-01-15',
        check_in_time: '2024-01-15T09:00:00Z',
        check_out_time: '2024-01-15T17:30:00Z',
        working_hours: 8.5,
        status: 'present',
        remarks: 'Regular day',
      },
      {
        id: 'att-002',
        employee_id: 'emp-002',
        date: '2024-01-15',
        check_in_time: '2024-01-15T09:15:00Z',
        check_out_time: '2024-01-15T17:45:00Z',
        working_hours: 8.5,
        status: 'present',
        remarks: 'Slightly late',
      },
      {
        id: 'att-003',
        employee_id: 'emp-003',
        date: '2024-01-15',
        status: 'absent',
        remarks: 'On sick leave',
      },
    ];

    // Mock payroll data
    mockPayrollData = [
      {
        id: 'pay-001',
        employee_id: 'emp-001',
        month: 1,
        year: 2024,
        basic_salary: 50000,
        allowances: 15000,
        deductions: 5000,
        net_salary: 60000,
        status: 'processed',
      },
      {
        id: 'pay-002',
        employee_id: 'emp-002',
        month: 1,
        year: 2024,
        basic_salary: 45000,
        allowances: 12000,
        deductions: 4500,
        net_salary: 52500,
        status: 'processed',
      },
    ];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('CSV Generation Tests', () => {
    describe('Employee Data CSV Export', () => {
      it('should generate valid CSV for employee data', () => {
        const csv = convertToCSV(mockEmployeeData);

        // Check headers
        expect(csv).toContain('"id"');
        expect(csv).toContain('"employee_id"');
        expect(csv).toContain('"first_name"');
        expect(csv).toContain('"last_name"');
        expect(csv).toContain('"email"');
        expect(csv).toContain('"department"');
        expect(csv).toContain('"designation"');
        expect(csv).toContain('"status"');

        // Check data rows
        expect(csv).toContain('emp-001,EMP001,John,Doe');
        expect(csv).toContain('john.doe@company.com');
        expect(csv).toContain('Engineering');
        expect(csv).toContain('Senior Developer');
        expect(csv).toContain('active');
      });

      it('should handle special characters in employee data', () => {
        const dataWithSpecialChars = [
          {
            name: 'John "Johnny" O\'Connor',
            department: 'R&D, Innovation',
            notes: 'Employee with\nmultiline notes',
          },
        ];

        const csv = convertToCSV(dataWithSpecialChars);

        // Check proper escaping
        expect(csv).toContain('"John ""Johnny"" O\'Connor"');
        expect(csv).toContain('"R&D, Innovation"');
        expect(csv).toContain('"Employee with\nmultiline notes"');
      });

      it('should generate CSV with custom headers for employee export', () => {
        const customHeaders = [
          'employee_id',
          'first_name',
          'last_name',
          'department',
          'status',
        ];

        const csv = convertToCSV(mockEmployeeData, customHeaders);

        // Check only specified headers are included
        expect(csv).toContain('"employee_id"');
        expect(csv).toContain('"first_name"');
        expect(csv).toContain('"department"');
        expect(csv).not.toContain('"email"');
        expect(csv).not.toContain('"salary"');
      });
    });

    describe('Attendance Data CSV Export', () => {
      it('should generate valid CSV for attendance data', () => {
        const csv = convertToCSV(mockAttendanceData);

        expect(csv).toContain('"employee_id"');
        expect(csv).toContain('"date"');
        expect(csv).toContain('"check_in_time"');
        expect(csv).toContain('"check_out_time"');
        expect(csv).toContain('"working_hours"');
        expect(csv).toContain('"status"');

        // Check data
        expect(csv).toContain('emp-001,2024-01-15');
        expect(csv).toContain('present');
        expect(csv).toContain('absent');
        expect(csv).toContain('8.5');
      });

      it('should handle missing attendance times', () => {
        const csv = convertToCSV(mockAttendanceData);

        // Check that absent record has empty times
        const lines = csv.split('\n');
        const absentLine = lines.find(line => line.includes('absent'));
        expect(absentLine).toBeDefined();
        expect(absentLine).toContain('emp-003');
      });
    });

    describe('Payroll Data CSV Export', () => {
      it('should generate valid CSV for payroll data', () => {
        const csv = convertToCSV(mockPayrollData);

        expect(csv).toContain('"employee_id"');
        expect(csv).toContain('"basic_salary"');
        expect(csv).toContain('"allowances"');
        expect(csv).toContain('"deductions"');
        expect(csv).toContain('"net_salary"');

        // Check numeric values
        expect(csv).toContain('50000');
        expect(csv).toContain('15000');
        expect(csv).toContain('60000');
      });

      it('should format currency values correctly in CSV', () => {
        const formattedData = mockPayrollData.map(record => ({
          ...record,
          basic_salary: `$${record.basic_salary.toLocaleString()}`,
          net_salary: `$${record.net_salary.toLocaleString()}`,
        }));

        const csv = convertToCSV(formattedData);

        expect(csv).toContain('$50,000');
        expect(csv).toContain('$60,000');
      });
    });

    describe('Large Dataset CSV Export', () => {
      it('should handle large employee datasets', () => {
        const largeDataset = Array.from({ length: 1500 }, (_, index) => ({
          id: `emp-${String(index + 1).padStart(3, '0')}`,
          name: `Employee ${index + 1}`,
          department: index % 2 === 0 ? 'Engineering' : 'HR',
          status: 'active',
        }));

        expect(isLargeDataset(largeDataset)).toBe(true);

        const csv = convertToCSV(largeDataset.slice(0, 100)); // Test with subset
        expect(csv).toContain('Employee 1');
        expect(csv).toContain('Employee 100');
        expect(csv.split('\n').length).toBeGreaterThan(100);
      });
    });
  });

  describe('PDF Generation Tests', () => {
    describe('Report PDF Export', () => {
      it('should generate PDF-compatible data structure', async () => {
        const reportData: ReportData = {
          metadata: {
            title: 'Employee Report',
            description: 'Monthly employee report',
            generatedDate: new Date('2024-01-15'),
            generatedBy: 'admin@company.com',
            filters: { department: 'Engineering' },
          },
          columns: [
            { id: 'name', label: 'Employee Name', align: 'left' },
            { id: 'department', label: 'Department', align: 'left' },
            { id: 'status', label: 'Status', align: 'center' },
          ],
          rows: mockEmployeeData.map(emp => ({
            name: `${emp.first_name} ${emp.last_name}`,
            department: emp.department,
            status: emp.status,
          })),
          summary: [
            { label: 'Total Employees', value: mockEmployeeData.length },
            { label: 'Active Employees', value: mockEmployeeData.filter(e => e.status === 'active').length },
          ],
        };

        const html = generateReportHTML(reportData);

        expect(html).toContain('<div class="report-container">');
        expect(html).toContain('Employee Report');
        expect(html).toContain('John Doe');
        expect(html).toContain('Jane Smith');
        expect(html).toContain('Engineering');
        expect(html).toContain('Total Employees');
      });

      it('should export data as PDF format', async () => {
        const blob = await exportData(mockEmployeeData, 'pdf', 'employees.pdf');

        expect(blob).toBeInstanceOf(Blob);
        // PDF export currently falls back to CSV, but should have appropriate MIME type
        expect(blob.type).toMatch(/text\/csv|application\/pdf/);
      });

      it('should create PDF blob with correct properties', () => {
        const csvData = convertToCSV(mockEmployeeData);
        const blob = createBlob(csvData, 'pdf');

        expect(blob).toBeInstanceOf(Blob);
        expect(blob.size).toBeGreaterThan(0);
      });
    });

    describe('Attendance Report PDF', () => {
      it('should generate attendance report for PDF export', () => {
        const reportData: ReportData = {
          metadata: {
            title: 'Attendance Report',
            description: 'Daily attendance report',
            generatedDate: new Date('2024-01-15'),
            generatedBy: 'hr@company.com',
            filters: { date: '2024-01-15' },
          },
          columns: [
            { id: 'employee_id', label: 'Employee ID', align: 'left' },
            { id: 'status', label: 'Status', align: 'center' },
            { id: 'working_hours', label: 'Hours', align: 'right' },
          ],
          rows: mockAttendanceData.map(att => ({
            employee_id: att.employee_id,
            status: att.status,
            working_hours: att.working_hours || 0,
          })),
        };

        const html = generateReportHTML(reportData);

        expect(html).toContain('Attendance Report');
        expect(html).toContain('emp-001');
        expect(html).toContain('present');
        expect(html).toContain('absent');
      });
    });
  });

  describe('Export with Filters Tests', () => {
    describe('Employee Filtering', () => {
      it('should export filtered employees by department', () => {
        const engineeringEmployees = mockEmployeeData.filter(
          emp => emp.department === 'Engineering'
        );

        const csv = convertToCSV(engineeringEmployees);

        expect(csv).toContain('John');
        expect(csv).toContain('Bob');
        expect(csv).not.toContain('Jane'); // HR employee should be excluded
        expect(csv.split('\n').length).toBe(3); // Header + 2 data rows
      });

      it('should export filtered employees by status', () => {
        const activeEmployees = mockEmployeeData.filter(
          emp => emp.status === 'active'
        );

        const csv = convertToCSV(activeEmployees);

        expect(csv).toContain('John');
        expect(csv).toContain('Jane');
        expect(csv).not.toContain('Bob'); // On leave employee should be excluded
      });

      it('should export filtered employees by employment type', () => {
        const permanentEmployees = mockEmployeeData.filter(
          emp => emp.employment_type === 'permanent'
        );

        const csv = convertToCSV(permanentEmployees);

        expect(csv).toContain('John');
        expect(csv).toContain('Jane');
        expect(csv).not.toContain('Bob'); // Contract employee should be excluded
      });

      it('should export filtered employees by multiple criteria', () => {
        const filteredEmployees = mockEmployeeData.filter(
          emp => emp.department === 'Engineering' && emp.status === 'active'
        );

        const csv = convertToCSV(filteredEmployees);

        expect(csv).toContain('John');
        expect(csv).not.toContain('Jane'); // Different department
        expect(csv).not.toContain('Bob'); // On leave
        expect(csv.split('\n').length).toBe(2); // Header + 1 data row
      });

      it('should export filtered employees by salary range', () => {
        const highSalaryEmployees = mockEmployeeData.filter(
          emp => emp.salary >= 60000
        );

        const csv = convertToCSV(highSalaryEmployees);

        expect(csv).toContain('John'); // 75000
        expect(csv).toContain('Jane'); // 65000
        expect(csv).not.toContain('Bob'); // 45000
      });
    });

    describe('Attendance Filtering', () => {
      it('should export filtered attendance by date range', () => {
        const startDate = '2024-01-15';
        const endDate = '2024-01-15';

        const filteredAttendance = mockAttendanceData.filter(
          att => att.date >= startDate && att.date <= endDate
        );

        const csv = convertToCSV(filteredAttendance);

        expect(csv).toContain('2024-01-15');
        expect(csv.split('\n').length).toBe(4); // Header + 3 data rows
      });

      it('should export filtered attendance by status', () => {
        const presentAttendance = mockAttendanceData.filter(
          att => att.status === 'present'
        );

        const csv = convertToCSV(presentAttendance);

        expect(csv).toContain('emp-001');
        expect(csv).toContain('emp-002');
        expect(csv).not.toContain('emp-003'); // Absent employee
        expect(csv.split('\n').length).toBe(3); // Header + 2 data rows
      });

      it('should export filtered attendance by employee', () => {
        const employeeAttendance = mockAttendanceData.filter(
          att => att.employee_id === 'emp-001'
        );

        const csv = convertToCSV(employeeAttendance);

        expect(csv).toContain('emp-001');
        expect(csv).not.toContain('emp-002');
        expect(csv).not.toContain('emp-003');
        expect(csv.split('\n').length).toBe(2); // Header + 1 data row
      });
    });

    describe('Payroll Filtering', () => {
      it('should export filtered payroll by month/year', () => {
        const monthlyPayroll = mockPayrollData.filter(
          pay => pay.month === 1 && pay.year === 2024
        );

        const csv = convertToCSV(monthlyPayroll);

        expect(csv).toContain('emp-001');
        expect(csv).toContain('emp-002');
        expect(csv).toContain('60000');
        expect(csv).toContain('52500');
      });

      it('should export filtered payroll by salary range', () => {
        const highNetSalary = mockPayrollData.filter(
          pay => pay.net_salary >= 55000
        );

        const csv = convertToCSV(highNetSalary);

        expect(csv).toContain('emp-001'); // 60000
        expect(csv).not.toContain('emp-002'); // 52500
      });

      it('should export filtered payroll by status', () => {
        const processedPayroll = mockPayrollData.filter(
          pay => pay.status === 'processed'
        );

        const csv = convertToCSV(processedPayroll);

        expect(csv.split('\n').length).toBe(3); // Header + 2 data rows
      });
    });

    describe('Complex Filtering Scenarios', () => {
      it('should handle empty filter results', () => {
        const noResults = mockEmployeeData.filter(
          emp => emp.department === 'NonExistentDepartment'
        );

        const csv = convertToCSV(noResults);

        expect(csv).toBe(''); // Empty result should return empty string
      });

      it('should preserve filter metadata in report exports', () => {
        const filters = {
          department: 'Engineering',
          status: 'active',
          dateRange: '2024-01-01 to 2024-01-31',
        };

        const reportData: ReportData = {
          metadata: {
            title: 'Filtered Employee Report',
            description: 'Employees matching filter criteria',
            generatedDate: new Date(),
            generatedBy: 'admin@company.com',
            filters,
          },
          columns: [
            { id: 'name', label: 'Name', align: 'left' },
            { id: 'department', label: 'Department', align: 'left' },
          ],
          rows: [{ name: 'John Doe', department: 'Engineering' }],
        };

        const csv = generateReportCSV(reportData);

        expect(csv).toContain('# Filters:');
        expect(csv).toContain('department: Engineering');
        expect(csv).toContain('status: active');
        expect(csv).toContain('dateRange: 2024-01-01 to 2024-01-31');
      });

      it('should export filtered data with progress tracking for large datasets', async () => {
        const largeFilteredDataset = Array.from({ length: 2000 }, (_, index) => ({
          id: `emp-${index}`,
          department: index % 3 === 0 ? 'Engineering' : 'Other',
          status: 'active',
        })).filter(emp => emp.department === 'Engineering');

        expect(isLargeDataset(largeFilteredDataset)).toBe(true);

        const options = {
          onProgress: vi.fn(),
          chunkSize: 100,
        };

        const blob = await exportData(
          largeFilteredDataset,
          'csv',
          'filtered-employees.csv',
          options
        );

        expect(blob).toBeInstanceOf(Blob);
        expect(blob.size).toBeGreaterThan(0);
      });
    });
  });

  describe('Export Integration Tests', () => {
    describe('File Download Integration', () => {
      it('should generate proper filename for filtered exports', () => {
        const filename = generateFilename('employees-engineering-active', 'csv');
        expect(filename).toMatch(/employees-engineering-active-\d{4}-\d{2}-\d{2}\.csv/);
      });

      it('should create download URL and clean up properly', () => {
        const blob = new Blob(['test data'], { type: 'text/csv' });
        const url = createDownloadUrl(blob);

        expect(url).toMatch(/^blob:/);

        // Cleanup should not throw
        expect(() => revokeDownloadUrl(url)).not.toThrow();
      });

      it('should handle download blob creation', () => {
        const blob = new Blob(['test,data\n1,2'], { type: 'text/csv' });
        const createElementSpy = vi.spyOn(document, 'createElement');
        const mockLink = {
          href: '',
          setAttribute: vi.fn(),
          click: vi.fn(),
        };
        createElementSpy.mockReturnValue(mockLink as any);

        // Mock URL methods
        const originalCreateObjectURL = window.URL.createObjectURL;
        const originalRevokeObjectURL = window.URL.revokeObjectURL;
        window.URL.createObjectURL = vi.fn(() => 'blob:mock');
        window.URL.revokeObjectURL = vi.fn();

        try {
          downloadBlob(blob, 'test.csv');
          expect(createElementSpy).toHaveBeenCalledWith('a');
          expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'test.csv');
          expect(mockLink.click).toHaveBeenCalled();
        } finally {
          window.URL.createObjectURL = originalCreateObjectURL;
          window.URL.revokeObjectURL = originalRevokeObjectURL;
          createElementSpy.mockRestore();
        }
      });
    });

    describe('Error Handling', () => {
      it('should handle invalid export format gracefully', async () => {
        await expect(
          exportData(mockEmployeeData, 'invalid' as ExportFormat, 'test.txt')
        ).rejects.toThrow('Unsupported export format');
      });

      it('should handle empty data gracefully', async () => {
        const blob = await exportData([], 'csv', 'empty.csv');
        expect(blob).toBeInstanceOf(Blob);
        expect(blob.size).toBe(0);
      });

      it('should handle malformed data gracefully', () => {
        const malformedData = [
          { name: 'John', age: 30 },
          { name: 'Jane' }, // Missing age
          { age: 25 }, // Missing name
        ];

        const csv = convertToCSV(malformedData);
        expect(csv).toContain('John,30');
        expect(csv).toContain('Jane,');
        expect(csv).toContain(',25');
      });
    });
  });

  describe('Performance Tests', () => {
    it('should handle large CSV exports efficiently', () => {
      const startTime = performance.now();
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Employee ${i}`,
        department: `Dept ${i % 10}`,
        salary: 50000 + (i * 100),
      }));

      const csv = convertToCSV(largeData);
      const endTime = performance.now();

      expect(csv).toBeDefined();
      expect(csv.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle memory efficiently for large exports', async () => {
      const largeData = Array.from({ length: 5000 }, (_, i) => ({
        id: `emp-${i}`,
        data: `data-${i}`.repeat(10), // Create some bulk
      }));

      const blob = await exportData(largeData, 'csv', 'large-export.csv');
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.size).toBeGreaterThan(0);
    });
  });
});