import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { ReportController } from '../controllers/reportController';
import { authenticateToken } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();

// Dashboard endpoints - require authentication and Super Admin or HR Manager role
router.get('/stats', authenticateToken as any, requirePermission('view_dashboard' as any) as any, DashboardController.getDashboardStats as any);
router.get('/employees', authenticateToken as any, requirePermission('view_dashboard' as any) as any, DashboardController.getEmployeeStats as any);
router.get('/attendance', authenticateToken as any, requirePermission('view_dashboard' as any) as any, DashboardController.getAttendanceStats as any);
router.get('/leaves', authenticateToken as any, requirePermission('view_dashboard' as any) as any, DashboardController.getLeaveStats as any);
router.get('/payroll', authenticateToken as any, requirePermission('view_dashboard' as any) as any, DashboardController.getPayrollStats as any);
router.get('/recruitment', authenticateToken as any, requirePermission('view_dashboard' as any) as any, DashboardController.getRecruitmentStats as any);

// Report endpoints - require authentication and appropriate permissions
router.get('/reports/employees', authenticateToken as any, requirePermission('generate_reports' as any) as any, ReportController.generateEmployeeReport as any);
router.get('/reports/attendance', authenticateToken as any, requirePermission('generate_reports' as any) as any, ReportController.generateAttendanceReport as any);
router.get('/reports/leaves', authenticateToken as any, requirePermission('generate_reports' as any) as any, ReportController.generateLeaveReport as any);
router.get('/reports/payroll', authenticateToken as any, requirePermission('generate_reports' as any) as any, ReportController.generatePayrollReport as any);
router.get('/reports/performance', authenticateToken as any, requirePermission('generate_reports' as any) as any, ReportController.generatePerformanceReport as any);
router.get('/reports/training', authenticateToken as any, requirePermission('generate_reports' as any) as any, ReportController.generateTrainingReport as any);

export default router;
