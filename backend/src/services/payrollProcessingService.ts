import { Knex } from 'knex';
import { PayrollRepository } from '../repositories/payrollRepository';
import { PayrollCalculationService } from './payrollCalculationService';
import { PayslipService } from './payslipService';
import { PayrollSummary } from '../types/payroll';
import logger from '../utils/logger';

export class PayrollProcessingService {
  private payrollRepository: PayrollRepository;
  private payrollCalculationService: PayrollCalculationService;
  private payslipService: PayslipService;

  constructor(private knex: Knex) {
    this.payrollRepository = new PayrollRepository(knex);
    this.payrollCalculationService = new PayrollCalculationService(knex);
    this.payslipService = new PayslipService(knex);
  }

  private async resolveToEmployeeId(userId: string): Promise<string | null> {
    const direct = await this.knex('employees').where('id', userId).first();
    if (direct) return direct.id;
    const user = await this.knex('users').where('id', userId).first();
    if (!user) return null;
    const employee = await this.knex('employees').where('employee_id', user.employee_id).first();
    return employee ? employee.id : null;
  }

  async processMonthlyPayroll(
    month: number,
    year: number,
    processedBy: string
  ): Promise<PayrollSummary> {
    // Validate month and year
    if (month < 1 || month > 12) {
      throw new Error('Invalid month. Must be between 1 and 12');
    }

    if (year < 2000 || year > 2100) {
      throw new Error('Invalid year');
    }

    // Get all active employees
    const employees = await this.knex('employees')
      .where({ status: 'active' })
      .select('id');

    if (employees.length === 0) {
      throw new Error('No active employees found');
    }

    const processedByEmployeeId = await this.resolveToEmployeeId(processedBy) ?? undefined;

    let processedCount = 0;
    let totalGrossSalary = 0;
    let totalDeductions = 0;
    let totalNetSalary = 0;
    const failedEmployees: Array<{ employeeId: string; reason: string }> = [];

    // Process payroll for each employee
    for (const employee of employees) {
      try {
        // Calculate salary
        const calculation = await this.payrollCalculationService.calculateSalary(
          employee.id,
          month,
          year
        );

        // Check if payroll already exists
        const existingPayroll =
          await this.payrollRepository.getPayrollByEmployeeAndMonth(
            employee.id,
            month,
            year
          );

        // Locked payroll must not be overwritten
        if (existingPayroll?.status === 'locked') {
          processedCount++;
          totalGrossSalary += existingPayroll.gross_salary;
          totalDeductions += existingPayroll.total_deductions ?? 0;
          totalNetSalary += existingPayroll.net_salary;
          continue;
        }

        const pfDeduction = calculation.deductions.find((d) => d.name === 'Provident Fund (PF)')?.amount ?? 0;
        const esiDeduction = calculation.deductions.find((d) => d.name === 'Employee State Insurance (ESI)')?.amount ?? 0;
        const tdsDeduction = calculation.deductions.find((d) => d.name === 'Tax Deducted at Source (TDS)')?.amount ?? 0;

        let payroll;
        if (existingPayroll) {
          payroll = await this.payrollRepository.updatePayroll(existingPayroll.id, {
            gross_salary: calculation.gross_pay,
            net_salary: calculation.net_pay,
            total_deductions: calculation.total_deductions,
            total_earnings: calculation.gross_pay,
            pf_deduction: pfDeduction,
            esi_deduction: esiDeduction,
            tds_deduction: tdsDeduction,
          });
        } else {
          payroll = await this.payrollRepository.createPayroll({
            employee_id: employee.id,
            month,
            year,
            gross_salary: calculation.gross_pay,
            net_salary: calculation.net_pay,
            total_deductions: calculation.total_deductions,
            total_earnings: calculation.gross_pay,
            pf_deduction: pfDeduction,
            esi_deduction: esiDeduction,
            tds_deduction: tdsDeduction,
          });
        }

        // Update payroll status to processed
        await this.payrollRepository.updatePayrollStatus(payroll.id, 'processed', processedByEmployeeId);

        // Payslip generation is non-critical: failure must not block salary processing
        try {
          await this.payslipService.generatePayslip(
            payroll.id,
            employee.id,
            month,
            year,
            calculation.earnings,
            calculation.deductions
          );
        } catch (payslipError) {
          logger.error(`Payslip generation failed for employee ${employee.id}`, { payslipError });
        }

        processedCount++;
        totalGrossSalary += calculation.gross_pay;
        totalDeductions += calculation.total_deductions;
        totalNetSalary += calculation.net_pay;
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Payroll processing failed for employee ${employee.id}`, { error });
        failedEmployees.push({ employeeId: employee.id, reason });
      }
    }

    // Create audit log
    await this.createAuditLog(
      'PAYROLL_PROCESSED',
      `Monthly payroll processed for ${month}/${year}. Processed: ${processedCount} employees`,
      processedBy
    );

    return {
      total_employees: employees.length,
      total_gross_salary: totalGrossSalary,
      total_deductions: totalDeductions,
      total_net_salary: totalNetSalary,
      processed_count: processedCount,
      pending_count: employees.length - processedCount,
      failed_employees: failedEmployees,
      month,
      year,
    };
  }

  async lockPayroll(payrollId: string, lockedBy: string): Promise<void> {
    const payroll = await this.payrollRepository.getPayrollById(payrollId);

    if (!payroll) {
      throw new Error(`Payroll with ID ${payrollId} not found`);
    }

    if (payroll.status === 'locked') {
      throw new Error('Payroll is already locked');
    }

    if (payroll.status !== 'processed') {
      throw new Error('Only processed payroll can be locked');
    }

    await this.payrollRepository.lockPayroll(payrollId);

    // Create audit log
    await this.createAuditLog(
      'PAYROLL_LOCKED',
      `Payroll locked for employee ${payroll.employee_id} (${payroll.month}/${payroll.year})`,
      lockedBy
    );
  }

  async unlockPayroll(payrollId: string, unlockedBy: string): Promise<void> {
    const payroll = await this.payrollRepository.getPayrollById(payrollId);

    if (!payroll) {
      throw new Error(`Payroll with ID ${payrollId} not found`);
    }

    if (payroll.status !== 'locked') {
      throw new Error('Only locked payroll can be unlocked');
    }

    const unlockedByEmployeeId = await this.resolveToEmployeeId(unlockedBy) ?? undefined;
    // Update status back to processed, recording who unlocked it
    await this.payrollRepository.updatePayrollStatus(payrollId, 'processed', unlockedByEmployeeId);

    // Create audit log
    await this.createAuditLog(
      'PAYROLL_UNLOCKED',
      `Payroll unlocked for employee ${payroll.employee_id} (${payroll.month}/${payroll.year})`,
      unlockedBy
    );
  }

  async markPayrollAsPaid(payrollId: string, paidBy: string): Promise<void> {
    const payroll = await this.payrollRepository.getPayrollById(payrollId);

    if (!payroll) {
      throw new Error(`Payroll with ID ${payrollId} not found`);
    }

    if (payroll.status === 'paid') {
      throw new Error('Payroll is already marked as paid');
    }

    await this.payrollRepository.updatePayrollStatus(payrollId, 'paid', paidBy);

    // Create audit log
    await this.createAuditLog(
      'PAYROLL_PAID',
      `Payroll marked as paid for employee ${payroll.employee_id} (${payroll.month}/${payroll.year})`,
      paidBy
    );
  }

  async getPayrollSummary(
    month: number,
    year: number
  ): Promise<PayrollSummary> {
    return this.payrollRepository.getPayrollSummary(month, year);
  }

  async exportBankFile(
    month: number,
    year: number,
    format: 'NEFT' | 'CSV'
  ): Promise<Buffer> {
    const [lockedPayrolls, paidPayrolls] = await Promise.all([
      this.payrollRepository.getPayrollByStatus('locked', month, year),
      this.payrollRepository.getPayrollByStatus('paid', month, year),
    ]);
    const payrolls = [...lockedPayrolls, ...paidPayrolls];

    if (format === 'CSV') {
      if (payrolls.length === 0) {
        return Buffer.from(
          'Employee ID,Employee Name,Amount,Bank Account (Masked),IFSC Code\n' +
          `# No payroll records found for ${month}/${year}\n`,
          'utf-8'
        );
      }
      return this.generateCSVFile(payrolls);
    } else if (format === 'NEFT') {
      if (payrolls.length === 0) {
        return Buffer.from(`# No payroll records found for ${month}/${year}\n`, 'utf-8');
      }
      return this.generateNEFTFile(payrolls);
    }

    throw new Error('Invalid export format');
  }

  /** Mask a bank account number, showing only the last 4 digits. */
  private maskAccountNumber(raw: string): string {
    if (!raw || raw.length <= 4) return '****';
    return `${'*'.repeat(raw.length - 4)}${raw.slice(-4)}`;
  }

  private async generateCSVFile(payrolls: any[]): Promise<Buffer> {
    const employeeIds = payrolls.map((p) => p.employee_id);
    const [employees, bankAccounts] = await Promise.all([
      this.knex('employees').whereIn('id', employeeIds),
      this.knex('bank_accounts').whereIn('employee_id', employeeIds).where('is_primary', true),
    ]);
    const employeeMap = new Map(employees.map((e: any) => [e.id, e]));
    const bankAccountMap = new Map(bankAccounts.map((b: any) => [b.employee_id, b]));

    let csv = 'Employee ID,Employee Name,Amount,Bank Account (Masked),IFSC Code\n';
    const skipped: string[] = [];

    for (const payroll of payrolls) {
      const employee = employeeMap.get(payroll.employee_id) as any;
      const bankAccount = bankAccountMap.get(payroll.employee_id) as any;

      if (bankAccount) {
        // Mask the account number before writing to file — never expose raw/encrypted values
        const masked = this.maskAccountNumber(bankAccount.account_number_encrypted);
        const empId = employee?.employee_id ?? payroll.employee_id;
        const empName = employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown';
        csv += `${empId},${empName},${payroll.net_salary},${masked},${bankAccount.ifsc_code}\n`;
      } else {
        skipped.push(employee?.employee_id ?? payroll.employee_id);
        logger.error(`No primary bank account for employee ${payroll.employee_id} — skipped in CSV export`);
      }
    }

    if (skipped.length > 0) {
      csv += `\n# WARNING: The following employees were skipped (no primary bank account): ${skipped.join(', ')}\n`;
    }

    return Buffer.from(csv, 'utf-8');
  }

  private async generateNEFTFile(payrolls: any[]): Promise<Buffer> {
    const employeeIds = payrolls.map((p) => p.employee_id);
    const [employees, bankAccounts] = await Promise.all([
      this.knex('employees').whereIn('id', employeeIds),
      this.knex('bank_accounts').whereIn('employee_id', employeeIds).where('is_primary', true),
    ]);
    const employeeMap = new Map(employees.map((e: any) => [e.id, e]));
    const bankAccountMap = new Map(bankAccounts.map((b: any) => [b.employee_id, b]));

    let neft = '';
    const skipped: string[] = [];

    for (const payroll of payrolls) {
      const employee = employeeMap.get(payroll.employee_id) as any;
      const bankAccount = bankAccountMap.get(payroll.employee_id) as any;

      if (bankAccount) {
        // Mask the account number before writing to file
        const masked = this.maskAccountNumber(bankAccount.account_number_encrypted);
        const empId = employee?.employee_id ?? payroll.employee_id;
        const empName = employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown';
        neft += `${empId}|${empName}|${payroll.net_salary}|${masked}|${bankAccount.ifsc_code}\n`;
      } else {
        skipped.push(employee?.employee_id ?? payroll.employee_id);
        logger.error(`No primary bank account for employee ${payroll.employee_id} — skipped in NEFT export`);
      }
    }

    if (skipped.length > 0) {
      neft += `# WARNING: The following employees were skipped (no primary bank account): ${skipped.join(', ')}\n`;
    }

    return Buffer.from(neft, 'utf-8');
  }

  private async createAuditLog(
    action: string,
    details: string,
    performedBy: string
  ): Promise<void> {
    const { v4: uuidv4 } = await import('uuid');
    await this.knex('audit_logs').insert({
      id: uuidv4(),
      entity_type: 'payroll',
      entity_id: performedBy,
      action,
      performed_by: performedBy,
      changes: JSON.stringify({ details }),
    });
  }
}
