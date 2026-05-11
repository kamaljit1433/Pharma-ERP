import { Router, Request, Response, NextFunction } from 'express';
import { Knex } from 'knex';
import { PerformanceController } from '../controllers/performanceController';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../types/auth';

export function createPerformanceRoutes(knex: Knex): Router {
  const router = Router();
  const controller = new PerformanceController(knex);

  router.use(authenticateToken as any);

  // Dashboard
  router.get('/dashboard', (req: Request, res: Response, next: NextFunction) =>
    controller.getDashboard(req, res, next)
  );

  // ============ Goals ============

  router.post(
    '/goals',
    authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any,
    (req: Request, res: Response, next: NextFunction) => controller.createGoal(req, res, next)
  );

  router.get('/goals/:id', (req: Request, res: Response, next: NextFunction) =>
    controller.getGoal(req, res, next)
  );

  router.get('/goals/employee/:employeeId', (req: Request, res: Response, next: NextFunction) =>
    controller.getEmployeeGoals(req, res, next)
  );

  router.put(
    '/goals/:id/progress',
    authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER, UserRole.EMPLOYEE]) as any,
    (req: Request, res: Response, next: NextFunction) => controller.updateGoalProgress(req, res, next)
  );

  router.put(
    '/goals/:id',
    authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any,
    (req: Request, res: Response, next: NextFunction) => controller.updateGoal(req, res, next)
  );

  router.delete(
    '/goals/:id',
    authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any,
    (req: Request, res: Response, next: NextFunction) => controller.deleteGoal(req, res, next)
  );

  // ============ Review Cycles ============

  router.get('/review-cycles', (req: Request, res: Response, next: NextFunction) =>
    controller.listReviewCycles(req, res, next)
  );

  router.post(
    '/review-cycles',
    authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any,
    (req: Request, res: Response, next: NextFunction) => controller.createReviewCycle(req, res, next)
  );

  router.get('/review-cycles/:id', (req: Request, res: Response, next: NextFunction) =>
    controller.getReviewCycle(req, res, next)
  );

  router.put(
    '/review-cycles/:id',
    authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any,
    (req: Request, res: Response, next: NextFunction) => controller.updateReviewCycle(req, res, next)
  );

  router.put(
    '/review-cycles/:id/status',
    authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any,
    (req: Request, res: Response, next: NextFunction) => controller.transitionCycleStatus(req, res, next)
  );

  router.delete(
    '/review-cycles/:id',
    authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any,
    (req: Request, res: Response, next: NextFunction) => controller.deleteReviewCycle(req, res, next)
  );

  // ============ Performance Reviews ============

  router.post(
    '/reviews',
    authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER, UserRole.EMPLOYEE]) as any,
    (req: Request, res: Response, next: NextFunction) => controller.submitReview(req, res, next)
  );

  router.get('/reviews/:id', (req: Request, res: Response, next: NextFunction) =>
    controller.getReview(req, res, next)
  );

  router.get('/reviews/employee/:employeeId', (req: Request, res: Response, next: NextFunction) =>
    controller.getEmployeeReviews(req, res, next)
  );

  router.put(
    '/reviews/:id',
    authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER]) as any,
    (req: Request, res: Response, next: NextFunction) => controller.updateReview(req, res, next)
  );

  // ============ Feedback ============

  router.post('/feedback', (req: Request, res: Response, next: NextFunction) =>
    controller.provideFeedback(req, res, next)
  );

  router.get('/feedback/:employeeId', (req: Request, res: Response, next: NextFunction) =>
    controller.getFeedback(req, res, next)
  );

  // ============ PIP ============

  router.post(
    '/pip',
    authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER]) as any,
    (req: Request, res: Response, next: NextFunction) => controller.initiatePIP(req, res, next)
  );

  router.get('/pip/active', (req: Request, res: Response, next: NextFunction) =>
    controller.getActivePIPs(req, res, next)
  );

  router.get('/pip/:id', (req: Request, res: Response, next: NextFunction) =>
    controller.getPIP(req, res, next)
  );

  router.get('/pip/employee/:employeeId', (req: Request, res: Response, next: NextFunction) =>
    controller.getEmployeePIPs(req, res, next)
  );

  router.put(
    '/pip/:id/check-in',
    authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER]) as any,
    (req: Request, res: Response, next: NextFunction) => controller.recordPIPCheckIn(req, res, next)
  );

  router.put(
    '/pip/:id/outcome',
    authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any,
    (req: Request, res: Response, next: NextFunction) => controller.recordPIPOutcome(req, res, next)
  );

  // ============ Reports ============

  router.get(
    '/reports',
    authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER, UserRole.DEPARTMENT_MANAGER]) as any,
    (req: Request, res: Response, next: NextFunction) => controller.generatePerformanceReports(req, res, next)
  );

  return router;
}
