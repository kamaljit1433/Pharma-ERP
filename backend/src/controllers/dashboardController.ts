import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService';
import { knex } from '../config/knex';

const dashboardService = new DashboardService(knex);

export class DashboardController {
  static async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await dashboardService.getDashboardStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard statistics',
      });
    }
  }

  static async getEmployeeStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await dashboardService['getEmployeeStatistics']();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch employee statistics',
      });
    }
  }

  static async getAttendanceStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await dashboardService['getAttendanceStatistics']();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch attendance statistics',
      });
    }
  }

  static async getLeaveStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await dashboardService['getLeaveStatistics']();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch leave statistics',
      });
    }
  }

  static async getPayrollStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await dashboardService['getPayrollStatistics']();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payroll statistics',
      });
    }
  }

  static async getRecruitmentStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await dashboardService['getRecruitmentStatistics']();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch recruitment statistics',
      });
    }
  }
}
