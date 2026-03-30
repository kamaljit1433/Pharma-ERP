import { Router, Request, Response } from 'express';
import { PayrollController } from '../controllers/payrollController';
import { authenticateToken } from '../middleware/auth';
import { Knex } from 'knex';

export function createPayrollRoutes(knex: Knex): Router {
  const router = Router();
  const controller = new PayrollController(knex);

  // Configure salary structure
  router.post(
    '/salary-structure',
    authenticateToken as any,
    (req: Request, res: Response) =>
      controller.configureSalaryStructure(req, res)
  );

  // Get salary structure
  router.get(
    '/salary-structure/:employeeId',
    authenticateToken as any,
    (req: Request, res: Response) => controller.getSalaryStructure(req, res)
  );

  // Process monthly payroll
  router.post(
    '/process',
    authenticateToken as any,
    (req: Request, res: Response) =>
      controller.processMonthlyPayroll(req, res)
  );

  // Get payroll details
  router.get(
    '/:employeeId/:month/:year',
    authenticateToken as any,
    (req: Request, res: Response) =>
      controller.getPayrollDetails(req, res)
  );

  // Get payslip
  router.get(
    '/payslip/:id',
    authenticateToken as any,
    (req: Request, res: Response) => controller.getPayslip(req, res)
  );

  // Request advance salary
  router.post(
    '/advance',
    authenticateToken as any,
    (req: Request, res: Response) =>
      controller.requestAdvanceSalary(req, res)
  );

  // Lock payroll
  router.put(
    '/:id/lock',
    authenticateToken as any,
    (req: Request, res: Response) => controller.lockPayroll(req, res)
  );

  // Export bank file
  router.get(
    '/export/:month/:year',
    authenticateToken as any,
    (req: Request, res: Response) =>
      controller.exportBankFile(req, res)
  );

  return router;
}
