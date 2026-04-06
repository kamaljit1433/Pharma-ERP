import { Router, Request, Response } from 'express';
import { Knex } from 'knex';
import { BenefitsController } from '../controllers/benefitsController';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

export function createBenefitsRoutes(knex: Knex): Router {
  const router = Router();
  const controller = new BenefitsController(knex);

  // Middleware
  router.use(authenticateToken as any);

  // ============ Insurance Plans ============

  // Create insurance plan (Admin only)
  router.post('/insurance-plans', authorize(['Super Admin', 'HR Manager']) as any, (req: Request, res: Response) =>
    controller.createInsurancePlan(req, res)
  );

  // Get all insurance plans
  router.get('/insurance-plans', (req: Request, res: Response) =>
    controller.getInsurancePlans(req, res)
  );

  // Get specific insurance plan
  router.get('/insurance-plans/:id', (req: Request, res: Response) =>
    controller.getInsurancePlan(req, res)
  );

  // Update insurance plan (Admin only)
  router.put('/insurance-plans/:id', authorize(['Super Admin', 'HR Manager']) as any, (req: Request, res: Response) =>
    controller.updateInsurancePlan(req, res)
  );

  // Delete insurance plan (Admin only)
  router.delete('/insurance-plans/:id', authorize(['Super Admin', 'HR Manager']) as any, (req: Request, res: Response) =>
    controller.deleteInsurancePlan(req, res)
  );

  // ============ Insurance Enrollment ============

  // Enroll in insurance plan
  router.post('/insurance/enroll', (req: Request, res: Response) =>
    controller.enrollInInsurance(req, res)
  );

  // Get employee enrollments
  router.get('/insurance/enrollments/:employeeId', (req: Request, res: Response) =>
    controller.getEmployeeEnrollments(req, res)
  );

  // ============ PF Details ============

  // Get PF details for employee
  router.get('/pf/:employeeId', (req: Request, res: Response) =>
    controller.getPFDetails(req, res)
  );

  // Get PF statement
  router.get('/pf/:employeeId/statement', (req: Request, res: Response) =>
    controller.getPFStatement(req, res)
  );

  // ============ Gratuity ============

  // Calculate gratuity for employee
  router.post('/gratuity/:employeeId/calculate', (req: Request, res: Response) =>
    controller.calculateGratuity(req, res)
  );

  // Get gratuity report
  router.post('/gratuity/:employeeId/report', (req: Request, res: Response) =>
    controller.getGratuityReport(req, res)
  );

  // ============ Reimbursement Claims ============

  // Submit reimbursement claim
  router.post('/reimbursements', (req: Request, res: Response) =>
    controller.submitReimbursementClaim(req, res)
  );

  // Get specific reimbursement claim
  router.get('/reimbursements/:id', (req: Request, res: Response) =>
    controller.getReimbursementClaim(req, res)
  );

  // Get employee claims
  router.get('/reimbursements/employee/:employeeId', (req: Request, res: Response) =>
    controller.getEmployeeClaims(req, res)
  );

  // Approve reimbursement claim (Manager/Finance)
  router.put('/reimbursements/:id/approve', authorize(['Department Manager', 'Finance / Payroll', 'HR Manager']) as any, (req: Request, res: Response) =>
    controller.approveClaim(req, res)
  );

  // Reject reimbursement claim (Manager/Finance)
  router.put('/reimbursements/:id/reject', authorize(['Department Manager', 'Finance / Payroll', 'HR Manager']) as any, (req: Request, res: Response) =>
    controller.rejectClaim(req, res)
  );

  // ============ Rewards ============

  // Award reward (Admin/Manager)
  router.post('/rewards', authorize(['Super Admin', 'HR Manager', 'Department Manager']) as any, (req: Request, res: Response) =>
    controller.awardReward(req, res)
  );

  // Get specific reward
  router.get('/rewards/:id', (req: Request, res: Response) =>
    controller.getReward(req, res)
  );

  // Get employee rewards
  router.get('/rewards/employee/:employeeId', (req: Request, res: Response) =>
    controller.getEmployeeRewards(req, res)
  );

  // Get public rewards (notice board)
  router.get('/rewards/public/all', (req: Request, res: Response) =>
    controller.getPublicRewards(req, res)
  );

  // Update reward (Admin/Manager)
  router.put('/rewards/:id', authorize(['Super Admin', 'HR Manager', 'Department Manager']) as any, (req: Request, res: Response) =>
    controller.updateReward(req, res)
  );

  // Delete reward (Admin)
  router.delete('/rewards/:id', authorize(['Super Admin', 'HR Manager']) as any, (req: Request, res: Response) =>
    controller.deleteReward(req, res)
  );

  return router;
}
