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

  async getPayslips(req: Request, res: Response): Promise<void> {
    try {
      const { employee_id, month, year } = req.query;
      let payslips;
      if (employee_id) {
        payslips = await this.payslipService.getPayslipsByEmployee(employee_id as string);
      } else if (month && year) {
        payslips = await this.payslipService.getPayslipsByMonth(
          parseInt(month as string),
          parseInt(year as string)
        );
      } else {
        payslips = await this.knex('payslips')
          .leftJoin('employees', 'payslips.employee_id', 'employees.id')
          .select(
            'payslips.*',
            this.knex.raw("CONCAT(employees.first_name, ' ', employees.last_name) as employee_name")
          )
          .orderBy('payslips.year', 'desc')
          .orderBy('payslips.month', 'desc')
          .limit(50);
      }
      res.status(200).json({ success: true, data: payslips });
    } catch (error) {
      res.status(httpStatusFor(error)).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async generatePayslip(req: Request, res: Response): Promise<void> {
    try {
      const { employee_id, month, year } = req.body;
      if (!employee_id || !month || !year) {
        res.status(400).json({ success: false, error: 'employee_id, month, and year are required' });
        return;
      }

      // Resolve employee UUID if string ID provided
      let employeeUUID = employee_id;
      if (!employee_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        const emp = await this.knex('employees').where('employee_id', employee_id).first();
        if (!emp) {
          res.status(404).json({ success: false, error: `Employee not found: ${employee_id}` });
          return;
        }
        employeeUUID = emp.id;
      }

      // Find the payroll record for this employee/month/year
      const payroll = await this.knex('payroll')
        .where({ employee_id: employeeUUID, month: parseInt(month), year: parseInt(year) })
        .first();

      if (!payroll) {
        res.status(404).json({
          success: false,
          error: `No payroll record found for month ${month}/${year}. Process payroll first.`,
        });
        return;
      }

      const payslip = await this.payslipService.generatePayslip(
        payroll.id,
        employeeUUID,
        parseInt(month),
        parseInt(year)
      );

      res.status(201).json({ success: true, data: payslip });
    } catch (error) {
      res.status(httpStatusFor(error)).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async downloadPayslip(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params['id'] as string;
      const payslip = await this.payslipService.getPayslip(id);

      if (!payslip) {
        res.status(404).json({ success: false, error: 'Payslip not found' });
        return;
      }

      const employee = await this.knex('employees').where({ id: payslip.employee_id }).first();
      const employeeName = employee
        ? `${employee.first_name} ${employee.last_name}`
        : payslip.employee_id;

      // Generate plain-text payslip
      const monthName = new Date(payslip.year, payslip.month - 1).toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
      });

      const lines: string[] = [
        '========================================',
        '               PAYSLIP',
        '========================================',
        `Employee : ${employeeName}`,
        `Payslip# : ${payslip.payslip_number}`,
        `Period   : ${monthName}`,
        '----------------------------------------',
        'EARNINGS',
        '----------------------------------------',
      ];

      const earnings = (payslip as any).earnings as Record<string, number> | undefined;
      if (earnings && Object.keys(earnings).length > 0) {
        for (const [key, val] of Object.entries(earnings)) {
          lines.push(`  ${key.padEnd(30)} ${String(val.toFixed(2)).padStart(10)}`);
        }
      } else {
        lines.push(`  Gross Salary                   ${String(payslip.gross_salary.toFixed(2)).padStart(10)}`);
      }

      lines.push('----------------------------------------');
      lines.push('DEDUCTIONS');
      lines.push('----------------------------------------');

      const deductions = (payslip as any).deductions as Record<string, number> | undefined;
      if (deductions && Object.keys(deductions).length > 0) {
        for (const [key, val] of Object.entries(deductions)) {
          lines.push(`  ${key.padEnd(30)} ${String(val.toFixed(2)).padStart(10)}`);
        }
      } else {
        const totalDeductions = payslip.gross_salary - payslip.net_salary;
        lines.push(`  Total Deductions               ${String(totalDeductions.toFixed(2)).padStart(10)}`);
      }

      lines.push('========================================');
      lines.push(`  NET SALARY                     ${String(payslip.net_salary.toFixed(2)).padStart(10)}`);
      lines.push('========================================');
      lines.push(`Generated: ${new Date().toLocaleDateString('en-IN')}`);

      const content = lines.join('\n');

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="payslip-${payslip.payslip_number}.txt"`
      );
      res.send(content);
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
