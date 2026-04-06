import { Router, Request, Response } from 'express';
import { BankDetailsController } from '../controllers/bankDetailsController';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

export function createBankDetailsRoutes(): Router {
  const router = Router();
  const controller = new BankDetailsController();

  // Middleware: All routes require authentication
  router.use(authenticateToken as any);

  /**
   * POST /api/v1/bank-details
   * Add a new bank account
   * Auth: Required (Employee, HR Manager, Super Admin)
   */
  router.post(
    '/',
    authorize(['Employee', 'HR Manager', 'Super Admin']) as any,
    (req: Request, res: Response) => controller.addBankAccount(req, res)
  );

  /**
   * PUT /api/v1/bank-details/:id
   * Update a bank account
   * Auth: Required (Employee can only update own, HR/Admin can update any)
   */
  router.put(
    '/:id',
    authorize(['Employee', 'HR Manager', 'Super Admin']) as any,
    (req: Request, res: Response) => controller.updateBankAccount(req, res)
  );

  /**
   * PUT /api/v1/bank-details/:id/set-primary
   * Set a bank account as primary
   * Auth: Required (Employee can only set own, HR/Admin can set any)
   */
  router.put(
    '/:id/set-primary',
    authorize(['Employee', 'HR Manager', 'Super Admin']) as any,
    (req: Request, res: Response) => controller.setPrimaryAccount(req, res)
  );

  /**
   * PUT /api/v1/bank-details/:id/verify
   * Verify a bank account (Finance/Admin only)
   * Auth: Required (Finance, Super Admin)
   */
  router.put(
    '/:id/verify',
    authorize(['Finance', 'Super Admin']) as any,
    (req: Request, res: Response) => controller.verifyBankAccount(req, res)
  );

  /**
   * GET /api/v1/bank-details/:employeeId
   * Get all bank accounts for an employee (masked)
   * Auth: Required (Employee can only view own, HR/Finance/Admin can view any)
   */
  router.get(
    '/:employeeId',
    authorize(['Employee', 'HR Manager', 'Finance', 'Super Admin']) as any,
    (req: Request, res: Response) => controller.getBankAccounts(req, res)
  );

  return router;
}
