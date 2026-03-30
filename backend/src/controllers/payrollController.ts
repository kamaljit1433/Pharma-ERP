import { Request, Response } from 'express';
import { SalaryStructureService } from '../services/salaryStructureService';
import { PayslipService } from '../services/payslipService';
import { PayrollProcessingService } from '../services/payrollProcessingService';
import { AdvanceSalaryService } from '../services/advanceSalaryService';
import { Knex } from 'knex';

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
      const { employee_id, salary_mode, base_salary, hra, dearness_allowance, other_allowances, pf_contribution_rate, esi_contribution_rate, professional_tax, effective_from } = req.body;

      const result = await this.salaryStructureService.configureSalaryStructure(
        {
          employee_id,
          salary_mode,
          base_salary,
          hra,
          dearness_allowance,
          other_allowances,
          pf_contribution_rate,
          esi_contribution_rate,
          professional_tax,
          effective_from,
        },
        (req as any).user?.id
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getSalaryStructure(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;

      const result = await this.salaryStructureService.getSalaryStructure(
        employeeId as string
      );

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'Salary structure not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async processMonthlyPayroll(req: Request, res: Response): Promise<void> {
    try {
      const { month, year } = req.body;

      const result = await this.payrollProcessingService.processMonthlyPayroll(
        month,
        year,
        (req as any).user?.id
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getPayrollDetails(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId, month, year } = req.params;

      const payroll = await this.knex('payroll')
        .where({
          employee_id: employeeId,
          month: parseInt(month as string),
          year: parseInt(year as string),
        })
        .first();

      if (!payroll) {
        res.status(404).json({
          success: false,
          error: 'Payroll record not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: payroll,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getPayslip(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const payslip = await this.payslipService.getPayslip(id as string);

      if (!payslip) {
        res.status(404).json({
          success: false,
          error: 'Payslip not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: payslip,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async requestAdvanceSalary(req: Request, res: Response): Promise<void> {
    try {
      const { employee_id, amount, reason, deduction_months } = req.body;

      const result = await this.advanceSalaryService.requestAdvanceSalary({
        employee_id,
        amount,
        reason,
        deduction_months,
      });

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async lockPayroll(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await this.payrollProcessingService.lockPayroll(id as string, (req as any).user?.id);

      res.status(200).json({
        success: true,
        message: 'Payroll locked successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  async exportBankFile(req: Request, res: Response): Promise<void> {
    try {
      const { month, year } = req.params;
      const { format } = req.query;

      const buffer = await this.payrollProcessingService.exportBankFile(
        parseInt(month as string),
        parseInt(year as string),
        (format as string) === 'NEFT' ? 'NEFT' : 'CSV'
      );

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="payroll-${month}-${year}.${format === 'NEFT' ? 'txt' : 'csv'}"`
      );
      res.send(buffer);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}
