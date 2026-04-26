import { Router, Request, Response } from 'express';
import { PayrollController } from '../controllers/payrollController';
import { authenticateToken } from '../middleware/auth';
import { Knex } from 'knex';

export function createPayrollRoutes(knex: Knex): Router {
  const router = Router();
  const controller = new PayrollController(knex);

  // Get payroll records with optional filters (employee_id, month, year)
  router.get(
    '/records',
    authenticateToken as any,
    async (req: Request, res: Response) => {
      try {
        const { employee_id, month, year } = req.query as Record<string, string>;
        let query = knex('payroll').select('*').orderBy('year', 'desc').orderBy('month', 'desc');
        if (employee_id) query = query.where('employee_id', employee_id);
        if (month) query = query.where('month', parseInt(month));
        if (year) query = query.where('year', parseInt(year));
        const records = await query.limit(24);
        res.status(200).json({ success: true, data: records });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  );

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

  // List payslips with optional filters
  router.get(
    '/payslips',
    authenticateToken as any,
    (req: Request, res: Response) => controller.getPayslips(req, res)
  );

  // Generate payslip for employee/month/year
  router.post(
    '/payslip/generate',
    authenticateToken as any,
    (req: Request, res: Response) => controller.generatePayslip(req, res)
  );

  // Download payslip as text
  router.get(
    '/payslip/:id/download',
    authenticateToken as any,
    (req: Request, res: Response) => controller.downloadPayslip(req, res)
  );

  // Get payslip by id
  router.get(
    '/payslip/:id',
    authenticateToken as any,
    (req: Request, res: Response) => controller.getPayslip(req, res)
  );

  // Export bank file — MUST be before /:employeeId/:month/:year to avoid shadowing
  router.get(
    '/export/:month/:year',
    authenticateToken as any,
    (req: Request, res: Response) =>
      controller.exportBankFile(req, res)
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

  // Get payroll details — generic dynamic route, must come last
  router.get(
    '/:employeeId/:month/:year',
    authenticateToken as any,
    (req: Request, res: Response) =>
      controller.getPayrollDetails(req, res)
  );

  return router;
}
