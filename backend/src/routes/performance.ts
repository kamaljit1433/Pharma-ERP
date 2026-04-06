import { Router, Request, Response } from 'express';
import { Knex } from 'knex';
import { PerformanceController } from '../controllers/performanceController';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

export function createPerformanceRoutes(knex: Knex): Router {
  const router = Router();
  const controller = new PerformanceController(knex);

  // Middleware
  router.use(authenticateToken as any);

  // ============ Goals ============

  // Create goal (HR Manager, Super Admin)
  router.post('/goals', authorize(['Super Admin', 'HR Manager']) as any, (req: Request, res: Response) =>
    controller.createGoal(req, res, () => {})
  );

  // Get goal details
  router.get('/goals/:id', (req: Request, res: Response) =>
    controller.getGoal(req, res, () => {})
  );

  // Get employee goals
  router.get('/goals/employee/:employeeId', (req: Request, res: Response) =>
    controller.getEmployeeGoals(req, res, () => {})
  );

  // Update goal progress (Employee, Manager, HR Manager)
  router.put('/goals/:id/progress', authorize(['Super Admin', 'HR Manager', 'Department Manager', 'Employee']) as any, (req: Request, res: Response) =>
    controller.updateGoalProgress(req, res, () => {})
  );

  // ============ Review Cycles ============

  // Create review cycle (HR Manager, Super Admin)
  router.post('/review-cycles', authorize(['Super Admin', 'HR Manager']) as any, (req: Request, res: Response) =>
    controller.createReviewCycle(req, res, () => {})
  );

  // ============ Performance Reviews ============

  // Submit review (Employee, Manager, Peer)
  router.post('/reviews', authorize(['Super Admin', 'HR Manager', 'Department Manager', 'Employee']) as any, (req: Request, res: Response) =>
    controller.submitReview(req, res, () => {})
  );

  // Get review details
  router.get('/reviews/:id', (req: Request, res: Response) =>
    controller.getReview(req, res, () => {})
  );

  // Get employee reviews
  router.get('/reviews/employee/:employeeId', (req: Request, res: Response) =>
    controller.getEmployeeReviews(req, res, () => {})
  );

  // ============ Feedback ============

  // Provide feedback (All authenticated users)
  router.post('/feedback', (req: Request, res: Response) =>
    controller.provideFeedback(req, res, () => {})
  );

  // Get feedback for employee
  router.get('/feedback/:employeeId', (req: Request, res: Response) =>
    controller.getFeedback(req, res, () => {})
  );

  // ============ PIP ============

  // Initiate PIP (HR Manager, Department Manager, Super Admin)
  router.post('/pip', authorize(['Super Admin', 'HR Manager', 'Department Manager']) as any, (req: Request, res: Response) =>
    controller.initiatePIP(req, res, () => {})
  );

  // Get PIP details
  router.get('/pip/:id', (req: Request, res: Response) =>
    controller.getPIP(req, res, () => {})
  );

  // Get employee PIPs
  router.get('/pip/employee/:employeeId', (req: Request, res: Response) =>
    controller.getEmployeePIPs(req, res, () => {})
  );

  // Record PIP check-in (HR Manager, Department Manager, Super Admin)
  router.put('/pip/:id/check-in', authorize(['Super Admin', 'HR Manager', 'Department Manager']) as any, (req: Request, res: Response) =>
    controller.recordPIPCheckIn(req, res, () => {})
  );

  // Record PIP outcome (HR Manager, Super Admin)
  router.put('/pip/:id/outcome', authorize(['Super Admin', 'HR Manager']) as any, (req: Request, res: Response) =>
    controller.recordPIPOutcome(req, res, () => {})
  );

  // ============ Reports ============

  // Generate performance reports (HR Manager, Department Manager, Super Admin)
  router.get('/reports', authorize(['Super Admin', 'HR Manager', 'Department Manager']) as any, (req: Request, res: Response) =>
    controller.generatePerformanceReports(req, res, () => {})
  );

  return router;
}
