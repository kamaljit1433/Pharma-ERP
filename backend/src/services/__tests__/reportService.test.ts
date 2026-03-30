import { ReportService } from '../reportService';
import { Knex } from 'knex';
import { ReportFilter } from '../../types/dashboard';

describe('ReportService', () => {
  let reportService: ReportService;
  let mockKnex: any;

  beforeEach(() => {
    mockKnex = {
      select: jest.fn().mockReturnThis(),
      join: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      count: jest.fn().mockReturnThis(),
      first: jest.fn(),
      clone: jest.fn().mockReturnThis(),
      raw: jest.fn((sql: string) => sql),
    };

    reportService = new ReportService(mockKnex as Knex);
  });

  describe('generateEmployeeReport', () => {
    it('should generate employee report with all fields', async () => {
      const mockRows = [
        {
          employeeId: 'EMP001',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '1234567890',
          department: 'Engineering',
          designation: 'Senior Developer',
          status: 'active',
          joinDate: new Date('2020-01-15'),
          dateOfBirth: new Date('1990-05-20'),
          gender: 'M',
          address: '123 Main St',
        },
      ];

      mockKnex.first.mockResolvedValueOnce({ count: 1 });
      mockKnex.first.mockResolvedValueOnce(undefined);

      const report = await reportService.generateEmployeeReport({}, 'user123');

      expect(report.type).toBe('employee');
      expect(report.totalRows).toBe(1);
      expect(report.generatedBy).toBe('user123');
      expect(report.generatedAt).toBeInstanceOf(Date);
    });

    it('should apply department filter', async () => {
      const filter: ReportFilter = { departmentId: 'DEPT001' };

      mockKnex.first.mockResolvedValueOnce({ count: 5 });
      mockKnex.first.mockResolvedValueOnce(undefined);

      await reportService.generateEmployeeReport(filter, 'user123');

      expect(mockKnex.where).toHaveBeenCalled();
    });

    it('should apply status filter', async () => {
      const filter: ReportFilter = { status: 'active' };

      mockKnex.first.mockResolvedValueOnce({ count: 10 });
      mockKnex.first.mockResolvedValueOnce(undefined);

      await reportService.generateEmployeeReport(filter, 'user123');

      expect(mockKnex.where).toHaveBeenCalled();
    });

    it('should apply date range filter', async () => {
      const filter: ReportFilter = {
        startDate: new Date('2020-01-01'),
        endDate: new Date('2020-12-31'),
      };

      mockKnex.first.mockResolvedValueOnce({ count: 3 });
      mockKnex.first.mockResolvedValueOnce(undefined);

      await reportService.generateEmployeeReport(filter, 'user123');

      expect(mockKnex.where).toHaveBeenCalled();
    });

    it('should apply pagination', async () => {
      const filter: ReportFilter = { limit: 50, offset: 100 };

      mockKnex.first.mockResolvedValueOnce({ count: 500 });
      mockKnex.first.mockResolvedValueOnce(undefined);

      await reportService.generateEmployeeReport(filter, 'user123');

      expect(mockKnex.limit).toHaveBeenCalledWith(50);
      expect(mockKnex.offset).toHaveBeenCalledWith(100);
    });
  });

  describe('generateAttendanceReport', () => {
    it('should generate attendance report', async () => {
      mockKnex.first.mockResolvedValueOnce({ count: 100 });
      mockKnex.first.mockResolvedValueOnce(undefined);

      const report = await reportService.generateAttendanceReport({}, 'user123');

      expect(report.type).toBe('attendance');
      expect(report.generatedAt).toBeInstanceOf(Date);
    });

    it('should filter by employee', async () => {
      const filter: ReportFilter = { employeeId: 'EMP001' };

      mockKnex.first.mockResolvedValueOnce({ count: 20 });
      mockKnex.first.mockResolvedValueOnce(undefined);

      await reportService.generateAttendanceReport(filter, 'user123');

      expect(mockKnex.where).toHaveBeenCalled();
    });
  });

  describe('generateLeaveReport', () => {
    it('should generate leave report', async () => {
      mockKnex.first.mockResolvedValueOnce({ count: 50 });
      mockKnex.first.mockResolvedValueOnce(undefined);

      const report = await reportService.generateLeaveReport({}, 'user123');

      expect(report.type).toBe('leave');
      expect(report.generatedAt).toBeInstanceOf(Date);
    });

    it('should filter by status', async () => {
      const filter: ReportFilter = { status: 'approved' };

      mockKnex.first.mockResolvedValueOnce({ count: 30 });
      mockKnex.first.mockResolvedValueOnce(undefined);

      await reportService.generateLeaveReport(filter, 'user123');

      expect(mockKnex.where).toHaveBeenCalled();
    });
  });

  describe('generatePayrollReport', () => {
    it('should generate payroll report', async () => {
      mockKnex.first.mockResolvedValueOnce({ count: 100 });
      mockKnex.first.mockResolvedValueOnce(undefined);

      const report = await reportService.generatePayrollReport({}, 'user123');

      expect(report.type).toBe('payroll');
      expect(report.generatedAt).toBeInstanceOf(Date);
    });
  });

  describe('generatePerformanceReport', () => {
    it('should generate performance report', async () => {
      mockKnex.first.mockResolvedValueOnce({ count: 80 });
      mockKnex.first.mockResolvedValueOnce(undefined);

      const report = await reportService.generatePerformanceReport({}, 'user123');

      expect(report.type).toBe('performance');
      expect(report.generatedAt).toBeInstanceOf(Date);
    });
  });

  describe('generateTrainingReport', () => {
    it('should generate training report', async () => {
      mockKnex.first.mockResolvedValueOnce({ count: 60 });
      mockKnex.first.mockResolvedValueOnce(undefined);

      const report = await reportService.generateTrainingReport({}, 'user123');

      expect(report.type).toBe('training');
      expect(report.generatedAt).toBeInstanceOf(Date);
    });
  });

  describe('exportToCSV', () => {
    it('should export report to CSV format', () => {
      const reportData = {
        type: 'employee' as const,
        rows: [
          {
            employeeId: 'EMP001',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
            department: 'Engineering',
            designation: 'Senior Developer',
            status: 'active',
            joinDate: new Date('2020-01-15'),
            dateOfBirth: new Date('1990-05-20'),
            gender: 'M',
            address: '123 Main St',
          },
        ],
        totalRows: 1,
        generatedAt: new Date(),
        generatedBy: 'user123',
      };

      const csv = reportService.exportToCSV(reportData);

      expect(csv).toContain('employeeId');
      expect(csv).toContain('EMP001');
      expect(csv).toContain('John');
    });

    it('should handle empty reports', () => {
      const reportData = {
        type: 'employee' as const,
        rows: [],
        totalRows: 0,
        generatedAt: new Date(),
        generatedBy: 'user123',
      };

      const csv = reportService.exportToCSV(reportData);

      expect(csv).toBe('');
    });

    it('should escape commas in CSV values', () => {
      const reportData = {
        type: 'employee' as const,
        rows: [
          {
            employeeId: 'EMP001',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
            department: 'Engineering, IT',
            designation: 'Senior Developer',
            status: 'active',
            joinDate: new Date('2020-01-15'),
            dateOfBirth: new Date('1990-05-20'),
            gender: 'M',
            address: '123 Main St',
          },
        ],
        totalRows: 1,
        generatedAt: new Date(),
        generatedBy: 'user123',
      };

      const csv = reportService.exportToCSV(reportData);

      expect(csv).toContain('"Engineering, IT"');
    });
  });

  describe('exportToJSON', () => {
    it('should export report to JSON format', () => {
      const reportData = {
        type: 'employee' as const,
        rows: [
          {
            employeeId: 'EMP001',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
            department: 'Engineering',
            designation: 'Senior Developer',
            status: 'active',
            joinDate: new Date('2020-01-15'),
            dateOfBirth: new Date('1990-05-20'),
            gender: 'M',
            address: '123 Main St',
          },
        ],
        totalRows: 1,
        generatedAt: new Date(),
        generatedBy: 'user123',
      };

      const json = reportService.exportToJSON(reportData);
      const parsed = JSON.parse(json);

      expect(parsed.type).toBe('employee');
      expect(parsed.rows).toHaveLength(1);
      expect(parsed.totalRows).toBe(1);
    });
  });
});
