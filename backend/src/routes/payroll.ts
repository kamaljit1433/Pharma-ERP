import { Router, Request, Response } from 'express';
import { PayrollController } from '../controllers/payrollController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { Knex } from 'knex';

const PAYROLL_ROLES = ['super_admin', 'hr_manager', 'finance'];

export function createPayrollRoutes(knex: Knex): Router {
  const router = Router();
  const controller = new PayrollController(knex);

  // Get payroll records with optional filters (employee_id, month, year)
  router.get(
    '/records',
    authenticateToken as any,
    requireRole(PAYROLL_ROLES) as any,
    async (req: Request, res: Response) => {
      try {
        const { employee_id, month, year } = req.query as Record<string, string>;
        let query = knex('payroll')
          .leftJoin('employees', 'payroll.employee_id', 'employees.id')
          .select(
            'payroll.*',
            knex.raw("CONCAT(employees.first_name, ' ', employees.last_name) as employee_name"),
            'employees.employee_id as employee_code'
          )
          .orderBy('payroll.year', 'desc')
          .orderBy('payroll.month', 'desc');
        if (employee_id) query = query.where('payroll.employee_id', employee_id);
        if (month) query = query.where('payroll.month', parseInt(month));
        if (year) query = query.where('payroll.year', parseInt(year));
        const records = await query.limit(200);
        res.status(200).json({ success: true, data: records });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  );

  // List all active employees with their current salary structure
  router.get(
    '/salary-structures',
    authenticateToken as any,
    requireRole(PAYROLL_ROLES) as any,
    async (req: Request, res: Response) => {
      try {
        const rows = await knex('employees')
          .leftJoin('salary_structures', function () {
            this.on('employees.id', '=', 'salary_structures.employee_id').andOn(
              'salary_structures.is_active',
              '=',
              knex.raw('true')
            );
          })
          .where('employees.status', 'active')
          .select(
            'employees.id as employee_uuid',
            'employees.employee_id as employee_code',
            knex.raw("CONCAT(employees.first_name, ' ', employees.last_name) as employee_name"),
            'salary_structures.id as structure_id',
            'salary_structures.salary_mode',
            'salary_structures.base_salary',
            'salary_structures.hra',
            'salary_structures.dearness_allowance',
            'salary_structures.other_allowances',
            'salary_structures.pf_contribution_rate',
            'salary_structures.esi_contribution_rate',
            'salary_structures.professional_tax',
            'salary_structures.effective_from',
            'salary_structures.is_active'
          )
          .orderBy('employees.first_name');
        res.status(200).json({ success: true, data: rows });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  );

  // Configure salary structure
  router.post(
    '/salary-structure',
    authenticateToken as any,
    requireRole(PAYROLL_ROLES) as any,
    (req: Request, res: Response) =>
      controller.configureSalaryStructure(req, res)
  );

  // Get salary structure
  router.get(
    '/salary-structure/:employeeId',
    authenticateToken as any,
    requireRole(PAYROLL_ROLES) as any,
    (req: Request, res: Response) => controller.getSalaryStructure(req, res)
  );

  // Process monthly payroll
  router.post(
    '/process',
    authenticateToken as any,
    requireRole(PAYROLL_ROLES) as any,
    (req: Request, res: Response) =>
      controller.processMonthlyPayroll(req, res)
  );

  // List payslips with optional filters
  router.get(
    '/payslips',
    authenticateToken as any,
    requireRole(PAYROLL_ROLES) as any,
    (req: Request, res: Response) => controller.getPayslips(req, res)
  );

  // Generate payslip for employee/month/year
  router.post(
    '/payslip/generate',
    authenticateToken as any,
    requireRole(PAYROLL_ROLES) as any,
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
    requireRole(PAYROLL_ROLES) as any,
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
    requireRole(PAYROLL_ROLES) as any,
    (req: Request, res: Response) => controller.lockPayroll(req, res)
  );

  // Get payroll details — generic dynamic route, must come last
  router.get(
    '/:employeeId/:month/:year',
    authenticateToken as any,
    requireRole(PAYROLL_ROLES) as any,
    (req: Request, res: Response) =>
      controller.getPayrollDetails(req, res)
  );

  return router;
}
