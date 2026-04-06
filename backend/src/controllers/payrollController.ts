import { Request, Response } from 'express';
import { SalaryStructureService } from '../services/salaryStructureService';
import { PayslipService } from '../services/payslipService';
import { PayrollProcessingService } from '../services/payrollProcessingService';
import { AdvanceSalaryService } from '../services/advanceSalaryService';
import { AuthenticatedRequest } from '../middleware/auth';
import { Knex } from 'knex';

/** Map service errors to appropriate HTTP status codes. */
function httpStatusFor(error: unknown): number {
  if (!(error instanceof Error)) return 500;
  const msg = error.message.toLowerCase();
  if (msg.includes('not found')) return 404;
  if (
    msg.includes('invalid') ||
    msg.includes('required') ||
    msg.includes('must be') ||
    msg.includes('already')
  ) return 400;
  return 500;
}

export class PayrollController {
  private salaryStructureService: SalaryStructureService;
  private payslipService: PayslipService;
  private payrollProcessingService: PayrollProcessingService;
  private advanceSalaryService: AdvanceSalaryService;

  constructor(private knex: Knex) {
    this.salaryStructureService = new SalaryStructureService(knex);
    this.payslipService = new PayslipService(knex);
    this.payrollProcessingService = new PayrollProcessingService(knex);
    this.advanceSalaryService = new AdvanceSalaryService(knex);
  }

  async configureSalaryStructure(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const {
        employee_id, salary_mode, base_salary, hra, dearness_allowance,
        other_allowances, pf_contribution_rate, esi_contribution_rate,
        professional_tax, effective_from,
      } = req.body;

      const result = await this.salaryStructureService.configureSalaryStructure(
        {
          employee_id, salary_mode, base_salary, hra, dearness_allowance,
          other_allowances, pf_contribution_rate, esi_contribution_rate,
          professional_tax, effective_from,
        },
        authReq.user?.id ?? ''
      );

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(httpStatusFor(error)).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async getSalaryStructure(req: Request, res: Response): Promise<void> {
    try {
      const employeeId = req.params['employeeId'] as string;
      if (!employeeId) {
        res.status(400).json({ success: false, error: 'Employee ID is required' });
        return;
      }
      const result = await this.salaryStructureService.getSalaryStructure(employeeId);

      if (!result) {
        res.status(404).json({ success: false, error: 'Salary structure not found' });
        return;
      }

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(httpStatusFor(error)).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async processMonthlyPayroll(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const { month, year } = req.body;

      const result = await this.payrollProcessingService.processMonthlyPayroll(
        month,
        year,
        authReq.user?.id ?? ''
      );

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(httpStatusFor(error)).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async getPayrollDetails(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId, month, year } = req.params;
      if (!employeeId || !month || !year) {
        res.status(400).json({ success: false, error: 'Employee ID, month, and year are required' });
        return;
      }

      const payroll = await this.knex('payroll')
        .where({
          employee_id: employeeId,
          month: parseInt(month),
          year: parseInt(year),
        })
        .first();

      if (!payroll) {
        res.status(404).json({ success: false, error: 'Payroll record not found' });
        return;
      }

      res.status(200).json({ success: true, data: payroll });
    } catch (error) {
      res.status(httpStatusFor(error)).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async getPayslip(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      if (!id) {
        res.status(400).json({ success: false, error: 'Payslip ID is required' });
        return;
      }
      const payslip = await this.payslipService.getPayslip(id);

      if (!payslip) {
        res.status(404).json({ success: false, error: 'Payslip not found' });
        return;
      }

      res.status(200).json({ success: true, data: payslip });
    } catch (error) {
      res.status(httpStatusFor(error)).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async requestAdvanceSalary(req: Request, res: Response): Promise<void> {
    try {
      const { employee_id, amount, reason, deduction_months } = req.body;

      const result = await this.advanceSalaryService.requestAdvanceSalary({
        employee_id, amount, reason, deduction_months,
      });

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      res.status(httpStatusFor(error)).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async lockPayroll(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const id = req.params['id'] as string;
      if (!id) {
        res.status(400).json({ success: false, error: 'Payroll ID is required' });
        return;
      }

      await this.payrollProcessingService.lockPayroll(id, authReq.user?.id ?? '');

      res.status(200).json({ success: true, message: 'Payroll locked successfully' });
    } catch (error) {
      res.status(httpStatusFor(error)).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async exportBankFile(req: Request, res: Response): Promise<void> {
    try {
      const { month, year } = req.params;
      const { format } = req.query;

      // Validate month and year are provided
      if (!month || !year) {
        res.status(400).json({ success: false, error: 'Month and year are required' });
        return;
      }

      // Validate month and year before passing to the service
      const parsedMonth = parseInt(month);
      const parsedYear = parseInt(year);

      if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
        res.status(400).json({ success: false, error: 'Invalid month. Must be 1–12.' });
        return;
      }
      if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
        res.status(400).json({ success: false, error: 'Invalid year.' });
        return;
      }

      const buffer = await this.payrollProcessingService.exportBankFile(
        parsedMonth,
        parsedYear,
        (format as string) === 'NEFT' ? 'NEFT' : 'CSV'
      );

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="payroll-${month}-${year}.${format === 'NEFT' ? 'txt' : 'csv'}"`
      );
      res.send(buffer);
    } catch (error) {
      res.status(httpStatusFor(error)).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }
}
