import { Knex } from 'knex';
import { SalaryStructureRepository } from '../repositories/salaryStructureRepository';
import { PayrollCalculation, SalaryComponent } from '../types/payroll';

export class PayrollCalculationService {
  private salaryStructureRepository: SalaryStructureRepository;

  constructor(private knex: Knex) {
    this.salaryStructureRepository = new SalaryStructureRepository(knex);
  }

  async calculateSalary(
    employeeId: string,
    month: number,
    year: number
  ): Promise<PayrollCalculation> {
    // Get salary structure
    const salaryStructure =
      await this.salaryStructureRepository.getSalaryStructureByEmployeeId(
        employeeId
      );

    if (!salaryStructure) {
      throw new Error(`No salary structure found for employee ${employeeId}`);
    }

    // Get attendance data
    const attendanceData = await this.getAttendanceData(
      employeeId,
      month,
      year
    );

    // Get leave data
    const leaveData = await this.getLeaveData(employeeId, month, year);

    // Get holiday data
    const holidayCount = await this.getHolidayCount(month, year);

    // Calculate paid days
    const paidDays = this.calculatePaidDays(
      attendanceData,
      leaveData,
      holidayCount
    );

    // Get total working days
    const totalWorkingDays = this.getTotalWorkingDays(month, year);

    // Calculate earnings
    const earnings = this.calculateEarnings(
      salaryStructure,
      paidDays,
      totalWorkingDays
    );

    // Calculate deductions
    const deductions = this.calculateDeductions(
      salaryStructure,
      earnings,
      paidDays,
      totalWorkingDays
    );

    // Get advance salary deductions
    const advanceDeduction = await this.getAdvanceSalaryDeduction(
      employeeId,
      month,
      year
    );

    if (advanceDeduction > 0) {
      deductions.push({
        name: 'Advance Salary Deduction',
        type: 'deduction',
        amount: advanceDeduction,
        isPercentage: false,
        isStatutory: false,
      });
    }

    // Calculate totals
    const grossPay = earnings.reduce((sum, e) => sum + e.amount, 0);
    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
    const netPay = grossPay - totalDeductions;

    return {
      employee_id: employeeId,
      month,
      year,
      paid_days: paidDays,
      total_working_days: totalWorkingDays,
      earnings,
      deductions,
      gross_pay: grossPay,
      total_deductions: totalDeductions,
      net_pay: netPay,
    };
  }

  private async getAttendanceData(
    employeeId: string,
    month: number,
    year: number
  ) {
    // Use UTC boundaries to avoid timezone-dependent month shifts
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0));

    const attendance = await this.knex('attendance')
      .where({ employee_id: employeeId })
      .whereBetween('attendance_date', [startDate, endDate])
      .select('*');

    return {
      presentDays: attendance.filter((a) => a.status === 'present').length,
      halfDays: attendance.filter((a) => a.status === 'half_day').length,
      absentDays: attendance.filter((a) => a.status === 'absent').length,
      onLeaveDays: attendance.filter((a) => a.status === 'on_leave').length,
    };
  }

  private async getLeaveData(employeeId: string, month: number, year: number) {
    // Use UTC boundaries to avoid timezone-dependent month shifts
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0));

    // Use a single JOIN to avoid N+1 queries (one query per leave record)
    const leaves = await this.knex('leaves')
      .join('leave_types', 'leaves.leave_type_id', 'leave_types.id')
      .where({ 'leaves.employee_id': employeeId, 'leaves.status': 'approved' })
      .whereBetween('leaves.from_date', [startDate, endDate])
      .select('leaves.from_date', 'leaves.to_date', 'leave_types.is_paid');

    let paidLeaveDays = 0;
    let unpaidLeaveDays = 0;

    for (const leave of leaves) {
      const days = this.calculateLeaveDays(leave.from_date, leave.to_date);
      if (leave.is_paid) {
        paidLeaveDays += days;
      } else {
        unpaidLeaveDays += days;
      }
    }

    return { paidLeaveDays, unpaidLeaveDays };
  }

  private async getHolidayCount(month: number, year: number): Promise<number> {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0));

    const holidays = await this.knex('company_holidays')
      .whereBetween('holiday_date', [startDate, endDate])
      .count('* as count')
      .first();

    return Number(holidays?.['count'] || 0);
  }

  private calculatePaidDays(
    attendanceData: { presentDays: number; halfDays: number },
    leaveData: { paidLeaveDays: number },
    _holidayCount: number  // Holidays are already excluded from totalWorkingDays; do not add again
  ): number {
    return (
      attendanceData.presentDays +
      attendanceData.halfDays * 0.5 +
      leaveData.paidLeaveDays
    );
  }

  private getTotalWorkingDays(month: number, year: number): number {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0));

    let workingDays = 0;
    // Advance by explicit millisecond addition to avoid setDate() mutation pitfalls
    for (let d = new Date(startDate); d <= endDate; d = new Date(d.getTime() + 86400000)) {
      const dayOfWeek = d.getUTCDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }

    return workingDays;
  }

  private calculateEarnings(
    salaryStructure: any,
    paidDays: number,
    totalWorkingDays: number
  ): SalaryComponent[] {
    const earnings: SalaryComponent[] = [];

    if (salaryStructure.salary_mode === 'monthly') {
      const baseSalaryPerDay = salaryStructure.base_salary / totalWorkingDays;
      const baseSalaryEarned = baseSalaryPerDay * paidDays;

      earnings.push({
        name: 'Base Salary',
        type: 'earning',
        amount: baseSalaryEarned,
        isPercentage: false,
        isStatutory: false,
      });

      if (salaryStructure.hra > 0) {
        const hraPerDay = salaryStructure.hra / totalWorkingDays;
        earnings.push({
          name: 'HRA',
          type: 'earning',
          amount: hraPerDay * paidDays,
          isPercentage: false,
          isStatutory: false,
        });
      }

      if (salaryStructure.dearness_allowance > 0) {
        const daPerDay = salaryStructure.dearness_allowance / totalWorkingDays;
        earnings.push({
          name: 'Dearness Allowance',
          type: 'earning',
          amount: daPerDay * paidDays,
          isPercentage: false,
          isStatutory: false,
        });
      }

      if (salaryStructure.other_allowances > 0) {
        const otherPerDay = salaryStructure.other_allowances / totalWorkingDays;
        earnings.push({
          name: 'Other Allowances',
          type: 'earning',
          amount: otherPerDay * paidDays,
          isPercentage: false,
          isStatutory: false,
        });
      }
    } else if (salaryStructure.salary_mode === 'daily') {
      const dailyRate = salaryStructure.base_salary;
      earnings.push({
        name: 'Daily Rate',
        type: 'earning',
        amount: dailyRate * paidDays,
        isPercentage: false,
        isStatutory: false,
      });
    } else if (salaryStructure.salary_mode === 'hourly') {
      const hourlyRate = salaryStructure.base_salary;
      const totalHours = paidDays * 8;
      earnings.push({
        name: 'Hourly Rate',
        type: 'earning',
        amount: hourlyRate * totalHours,
        isPercentage: false,
        isStatutory: false,
      });
    }

    return earnings;
  }

  private calculateDeductions(
    salaryStructure: any,
    earnings: SalaryComponent[],
    _paidDays: number,
    _totalWorkingDays: number
  ): SalaryComponent[] {
    const deductions: SalaryComponent[] = [];
    const grossEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);

    // PF Deduction
    if (salaryStructure.pf_contribution_rate > 0) {
      const pfAmount = (grossEarnings * salaryStructure.pf_contribution_rate) / 100;
      deductions.push({
        name: 'Provident Fund (PF)',
        type: 'deduction',
        amount: pfAmount,
        isPercentage: true,
        isStatutory: true,
      });
    }

    // ESI Deduction
    if (salaryStructure.esi_contribution_rate > 0) {
      const esiAmount =
        (grossEarnings * salaryStructure.esi_contribution_rate) / 100;
      deductions.push({
        name: 'Employee State Insurance (ESI)',
        type: 'deduction',
        amount: esiAmount,
        isPercentage: true,
        isStatutory: true,
      });
    }

    // Professional Tax
    if (salaryStructure.professional_tax > 0) {
      deductions.push({
        name: 'Professional Tax',
        type: 'deduction',
        amount: salaryStructure.professional_tax,
        isPercentage: false,
        isStatutory: true,
      });
    }

    // TDS (simplified - 10% on gross earnings above 50000)
    if (grossEarnings > 50000) {
      const tdsAmount = (grossEarnings - 50000) * 0.1;
      deductions.push({
        name: 'Tax Deducted at Source (TDS)',
        type: 'deduction',
        amount: tdsAmount,
        isPercentage: false,
        isStatutory: true,
      });
    }

    return deductions;
  }

  private async getAdvanceSalaryDeduction(
    employeeId: string,
    month: number,
    year: number
  ): Promise<number> {
    // Fetch ALL approved advances — using .first() previously silently skipped extras
    const advances = await this.knex('advance_salary_requests')
      .where({ employee_id: employeeId, status: 'approved' })
      .select('*');

    let totalDeduction = 0;

    for (const advance of advances) {
      const createdDate = new Date(advance.created_at);
      const deductionStartMonth = createdDate.getMonth() + 1;
      const deductionStartYear = createdDate.getFullYear();
      const monthsDiff =
        (year - deductionStartYear) * 12 + (month - deductionStartMonth);

      if (monthsDiff >= 0 && monthsDiff < advance.deduction_months) {
        totalDeduction += advance.amount / advance.deduction_months;
      }
    }

    return totalDeduction;
  }

  private calculateLeaveDays(fromDate: Date, toDate: Date): number {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
}
