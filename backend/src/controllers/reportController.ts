import { Request, Response } from 'express';
import { ReportService } from '../services/reportService';
import { ReportFilter } from '../types/dashboard';
import { knex } from '../config/knex';

const reportService = new ReportService(knex);

export class ReportController {
  static async generateEmployeeReport(req: Request, res: Response): Promise<void> {
    try {
      const filter: ReportFilter = {
        departmentId: req.query.departmentId as string,
        designationId: req.query.designationId as string,
        status: req.query.status as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 1000,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const report = await reportService.generateEmployeeReport(filter, req.user?.id || 'system');

      const format = req.query.format as string || 'json';
      if (format === 'csv') {
        const csv = reportService.exportToCSV(report);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="employee-report.csv"');
        res.send(csv);
      } else {
        res.json({
          success: true,
          data: report,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate employee report',
      });
    }
  }

  static async generateAttendanceReport(req: Request, res: Response): Promise<void> {
    try {
      const filter: ReportFilter = {
        employeeId: req.query.employeeId as string,
        departmentId: req.query.departmentId as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10000,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const report = await reportService.generateAttendanceReport(filter, req.user?.id || 'system');

      const format = req.query.format as string || 'json';
      if (format === 'csv') {
        const csv = reportService.exportToCSV(report);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="attendance-report.csv"');
        res.send(csv);
      } else {
        res.json({
          success: true,
          data: report,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate attendance report',
      });
    }
  }

  static async generateLeaveReport(req: Request, res: Response): Promise<void> {
    try {
      const filter: ReportFilter = {
        employeeId: req.query.employeeId as string,
        departmentId: req.query.departmentId as string,
        status: req.query.status as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10000,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const report = await reportService.generateLeaveReport(filter, req.user?.id || 'system');

      const format = req.query.format as string || 'json';
      if (format === 'csv') {
        const csv = reportService.exportToCSV(report);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="leave-report.csv"');
        res.send(csv);
      } else {
        res.json({
          success: true,
          data: report,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate leave report',
      });
    }
  }

  static async generatePayrollReport(req: Request, res: Response): Promise<void> {
    try {
      const filter: ReportFilter = {
        employeeId: req.query.employeeId as string,
        departmentId: req.query.departmentId as string,
        status: req.query.status as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10000,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const report = await reportService.generatePayrollReport(filter, req.user?.id || 'system');

      const format = req.query.format as string || 'json';
      if (format === 'csv') {
        const csv = reportService.exportToCSV(report);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="payroll-report.csv"');
        res.send(csv);
      } else {
        res.json({
          success: true,
          data: report,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate payroll report',
      });
    }
  }

  static async generatePerformanceReport(req: Request, res: Response): Promise<void> {
    try {
      const filter: ReportFilter = {
        employeeId: req.query.employeeId as string,
        departmentId: req.query.departmentId as string,
        status: req.query.status as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10000,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const report = await reportService.generatePerformanceReport(filter, req.user?.id || 'system');

      const format = req.query.format as string || 'json';
      if (format === 'csv') {
        const csv = reportService.exportToCSV(report);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="performance-report.csv"');
        res.send(csv);
      } else {
        res.json({
          success: true,
          data: report,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate performance report',
      });
    }
  }

  static async generateTrainingReport(req: Request, res: Response): Promise<void> {
    try {
      const filter: ReportFilter = {
        employeeId: req.query.employeeId as string,
        departmentId: req.query.departmentId as string,
        status: req.query.status as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10000,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
      };

      const report = await reportService.generateTrainingReport(filter, req.user?.id || 'system');

      const format = req.query.format as string || 'json';
      if (format === 'csv') {
        const csv = reportService.exportToCSV(report);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="training-report.csv"');
        res.send(csv);
      } else {
        res.json({
          success: true,
          data: report,
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate training report',
      });
    }
  }
}
