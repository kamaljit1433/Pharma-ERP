import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { ReportController } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';
import { requirePermission } from '../middleware/rbac';

const router = Router();

// Dashboard endpoints - require authentication and Super Admin or HR Manager role
router.get('/stats', authenticate, requirePermission('view_dashboard'), DashboardController.getDashboardStats);
router.get('/employees', authenticate, requirePermission('view_dashboard'), DashboardController.getEmployeeStats);
router.get('/attendance', authenticate, requirePermission('view_dashboard'), DashboardController.getAttendanceStats);
router.get('/leaves', authenticate, requirePermission('view_dashboard'), DashboardController.getLeaveStats);
router.get('/payroll', authenticate, requirePermission('view_dashboard'), DashboardController.getPayrollStats);
router.get('/recruitment', authenticate, requirePermission('view_dashboard'), DashboardController.getRecruitmentStats);

// Report endpoints - require authentication and appropriate permissions
router.get('/reports/employees', authenticate, requirePermission('generate_reports'), ReportController.generateEmployeeReport);
router.get('/reports/attendance', authenticate, requirePermission('generate_reports'), ReportController.generateAttendanceReport);
router.get('/reports/leaves', authenticate, requirePermission('generate_reports'), ReportController.generateLeaveReport);
router.get('/reports/payroll', authenticate, requirePermission('generate_reports'), ReportController.generatePayrollReport);
router.get('/reports/performance', authenticate, requirePermission('generate_reports'), ReportController.generatePerformanceReport);
router.get('/reports/training', authenticate, requirePermission('generate_reports'), ReportController.generateTrainingReport);

export default router;
