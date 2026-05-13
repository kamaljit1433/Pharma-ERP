import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import logger from '../utils/logger';
import { ResignationRepository } from '../repositories/resignationRepository';
import { ExitInterviewRepository } from '../repositories/exitInterviewRepository';
import { FnFSettlementRepository } from '../repositories/fnfSettlementRepository';
import { AssetRecoveryRepository } from '../repositories/assetRecoveryRepository';
import { EmployeeRepository } from '../repositories/employeeRepository';
import { LeaveBalanceRepository } from '../repositories/leaveBalanceRepository';
import { AdvanceSalaryRepository } from '../repositories/advanceSalaryRepository';
import { QuestionnaireTemplateRepository } from '../repositories/questionnaireTemplateRepository';
import { FileStorageService } from './fileStorageService';
import { FileCategory } from '../types/fileStorage';
import notificationService from './notificationService';
import { NotificationType } from '../types/notification';
import {
  Resignation,
  CreateResignationDTO,
  ExitInterview,
  CreateExitInterviewDTO,
  FnFSettlement,
  CreateFnFSettlementDTO,
  UpdateFnFSettlementDTO,
  AssetRecoveryChecklist,
  CreateAssetRecoveryDTO,
  NoticePeriodInfo,
  QuestionnaireTemplate,
  CreateQuestionnaireTemplateDTO,
  UpdateQuestionnaireTemplateDTO,
} from '../types/separation';

export class SeparationService {
  private resignationRepository: ResignationRepository;
  private exitInterviewRepository: ExitInterviewRepository;
  private fnfSettlementRepository: FnFSettlementRepository;
  private assetRecoveryRepository: AssetRecoveryRepository;
  private employeeRepository: EmployeeRepository;
  private leaveBalanceRepository: LeaveBalanceRepository;
  private advanceSalaryRepository: AdvanceSalaryRepository;
  private questionnaireTemplateRepository: QuestionnaireTemplateRepository;
  private fileStorageService: FileStorageService;

  constructor(private db: Knex) {
    this.resignationRepository = new ResignationRepository(db);
    this.exitInterviewRepository = new ExitInterviewRepository(db);
    this.fnfSettlementRepository = new FnFSettlementRepository(db);
    this.assetRecoveryRepository = new AssetRecoveryRepository(db);
    this.employeeRepository = new EmployeeRepository(db);
    this.leaveBalanceRepository = new LeaveBalanceRepository(db);
    this.advanceSalaryRepository = new AdvanceSalaryRepository(db);
    this.questionnaireTemplateRepository = new QuestionnaireTemplateRepository(db);
    this.fileStorageService = new FileStorageService();
  }

  /**
   * Resolve an employee identifier (UUID or string code like "EMP001") to the
   * internal UUID that separation tables use as a foreign key.
   * Throws if no matching employee is found.
   */
  private async resolveEmployeeUUID(employeeIdOrCode: string): Promise<string> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(employeeIdOrCode)) {
      return employeeIdOrCode;
    }
    const row = await this.db('employees')
      .where('employee_id', employeeIdOrCode)
      .select('id')
      .first();
    if (!row) {
      throw new Error(`Employee not found: ${employeeIdOrCode}`);
    }
    return row.id as string;
  }

  /**
   * Get HR department manager ID for notifications
   * Looks up the HR department and returns its head employee ID
   */
  private async getHRDepartmentManagerId(): Promise<string | null> {
    try {
      const hrDepartment = await this.db('departments')
        .where('name', 'ilike', '%HR%')
        .orWhere('name', 'ilike', '%Human Resources%')
        .first();

      if (hrDepartment && hrDepartment.head_employee_id) {
        return hrDepartment.head_employee_id;
      }

      // Fallback: get any department head if HR not found
      const anyDepartmentHead = await this.db('departments')
        .whereNotNull('head_employee_id')
        .first();

      return anyDepartmentHead?.head_employee_id || null;
    } catch (error) {
      logger.error('Error getting HR department manager', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  }

  /**
   * Submit resignation for an employee
   * Validates employee exists, checks for existing pending resignation,
   * creates resignation record, and auto-triggers offboarding workflow
   */
  async submitResignation(employeeId: string, data: CreateResignationDTO): Promise<Resignation> {
    employeeId = await this.resolveEmployeeUUID(employeeId);
    // Validate employee exists
    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Check if employee already has a pending resignation
    const existingResignation = await this.resignationRepository.getResignationByEmployeeId(employeeId);
    if (existingResignation && existingResignation.status === 'pending') {
      throw new Error('Employee already has a pending resignation');
    }

    // Validate resignation date is not in the past (allow today)
    const resignationDateNorm = new Date(data.resignation_date);
    resignationDateNorm.setUTCHours(0, 0, 0, 0);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    if (resignationDateNorm < today) {
      throw new Error('Resignation date cannot be in the past');
    }

    // Validate last working day is after resignation date (allow same-day)
    const lastWorkingDayNorm = new Date(data.last_working_day);
    lastWorkingDayNorm.setUTCHours(0, 0, 0, 0);
    
    if (lastWorkingDayNorm < resignationDateNorm) {
      throw new Error('Last working day must be on or after resignation date');
    }

    // Fetch employee's contract notice period (default to 30 days if not set)
    const employeeNotice = employee.notice_period_days || 30;

    // Calculate notice period end date using UTC calendar day arithmetic
    const noticePeriodInfo = this.calculateNoticePeriod(
      new Date(data.resignation_date),
      employeeNotice
    );

    // Validate that last_working_day matches calculated notice_period_end_date
    // Allow override with warning if they differ
    const calculatedEndDate = new Date(noticePeriodInfo.notice_period_end_date);
    calculatedEndDate.setUTCHours(0, 0, 0, 0);
    
    if (lastWorkingDayNorm.getTime() !== calculatedEndDate.getTime()) {
      logger.warn('Last working day differs from calculated notice period end date', {
        employeeId,
        resignationDate: data.resignation_date,
        calculatedEndDate: calculatedEndDate,
        providedLastWorkingDay: lastWorkingDayNorm,
        employeeNotice,
      });
    }

    // Create resignation with calculated notice period end date
    const resignation = await this.resignationRepository.createResignation(employeeId, data);

    // Store notice period info in database for tracking
    await this.db('resignations')
      .where('id', resignation.id)
      .update({
        notice_period_days: employeeNotice,
        notice_period_end_date: noticePeriodInfo.notice_period_end_date,
        notice_period_status: 'pending',
      });

    // Auto-trigger offboarding workflow
    const offboardingResult = await this.triggerOffboardingWorkflow(employeeId);

    // Send notification to HR department manager
    const hrManagerId = await this.getHRDepartmentManagerId();
    if (hrManagerId) {
      try {
        await notificationService.sendNotification({
          employeeId: hrManagerId,
          type: 'system_notification' as any,
          title: 'New Resignation Submitted',
          body: `${employee.first_name} ${employee.last_name} has submitted resignation effective ${data.last_working_day}`,
          data: { resignation_id: resignation.id, employee_id: employeeId },
        });
      } catch (notificationError) {
        logger.error('Failed to send resignation notification to HR', {
          hrManagerId,
          employeeId,
          error: notificationError instanceof Error ? notificationError.message : String(notificationError),
        });
      }
    }

    // If offboarding workflow had errors, include them in response
    if (offboardingResult.errors && offboardingResult.errors.length > 0) {
      logger.warn('Offboarding workflow completed with errors', {
        employeeId,
        errors: offboardingResult.errors,
      });
    }

    return resignation as any;
  }

  /**
   * Initiate termination for an employee
   * Creates termination record with reason tracking and auto-triggers offboarding
   */
  async initiateTermination(employeeId: string, terminationDate: Date, reason: string, terminationType?: string, finalSettlementDate?: Date): Promise<any> {
    employeeId = await this.resolveEmployeeUUID(employeeId);
    // Validate employee exists
    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Validate termination date is not before today (date-only comparison)
    const inputDay = new Date(terminationDate);
    inputDay.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (inputDay < today) {
      throw new Error('Termination date cannot be in the past');
    }

    // Validate reason is provided
    if (!reason || reason.trim().length === 0) {
      throw new Error('Termination reason is required');
    }

    // Create termination record
    const id = uuidv4();
    const insertData: Record<string, any> = {
      id,
      employee_id: employeeId,
      termination_date: terminationDate,
      reason,
      status: 'pending',
    };
    if (terminationType) insertData['termination_type'] = terminationType;
    if (finalSettlementDate) insertData['final_settlement_date'] = finalSettlementDate;

    const [termination] = await this.db('terminations')
      .insert(insertData)
      .returning('*');

    // Auto-trigger offboarding workflow
    const offboardingResult = await this.triggerOffboardingWorkflow(employeeId);

    // Send notification to HR department manager
    const hrManagerId = await this.getHRDepartmentManagerId();
    if (hrManagerId) {
      try {
        await notificationService.sendNotification({
          employeeId: hrManagerId,
          type: 'system_notification' as any,
          title: 'Employee Termination Initiated',
          body: `${employee.first_name} ${employee.last_name} termination initiated effective ${terminationDate}. Reason: ${reason}`,
          data: { termination_id: id, employee_id: employeeId },
        });
      } catch (notificationError) {
        logger.error('Failed to send termination notification to HR', {
          hrManagerId,
          employeeId,
          error: notificationError instanceof Error ? notificationError.message : String(notificationError),
        });
      }
    }

    // If offboarding workflow had errors, include them in response
    if (offboardingResult.errors && offboardingResult.errors.length > 0) {
      logger.warn('Offboarding workflow completed with errors', {
        employeeId,
        errors: offboardingResult.errors,
      });
    }

    return termination;
  }

  /**
   * Calculate notice period information with status tracking
   * Uses UTC calendar day arithmetic to avoid DST and timezone issues
   * Returns notice period days, end date, served days, remaining days, and completion status
   */
  calculateNoticePeriod(resignationDate: Date, noticePeriodDays: number): NoticePeriodInfo {
    // Normalize resignation date to UTC midnight for consistent calendar day arithmetic
    const resignationDateUTC = new Date(resignationDate);
    resignationDateUTC.setUTCHours(0, 0, 0, 0);

    // Calculate notice period end date by adding calendar days
    // This avoids millisecond rounding and DST transition issues
    const noticeEndDateUTC = new Date(resignationDateUTC);
    noticeEndDateUTC.setUTCDate(noticeEndDateUTC.getUTCDate() + noticePeriodDays);

    // Get today's date normalized to UTC midnight
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);

    // Calculate days served using calendar day arithmetic
    // Count the number of calendar days from resignation date to today
    const daysServed = Math.max(0, this.calculateCalendarDaysDifference(resignationDateUTC, todayUTC));

    // Calculate remaining days
    const daysRemaining = Math.max(0, noticePeriodDays - daysServed);

    // Check if notice period is complete
    const isNoticePeriodComplete = todayUTC >= noticeEndDateUTC;

    return {
      notice_period_days: noticePeriodDays,
      notice_period_end_date: noticeEndDateUTC,
      notice_period_served_days: daysServed,
      notice_period_remaining_days: daysRemaining,
      is_notice_period_complete: isNoticePeriodComplete,
    };
  }

  /**
   * Calculate the difference in calendar days between two UTC dates
   * Handles leap years, month boundaries, and DST transitions correctly
   */
  private calculateCalendarDaysDifference(startDate: Date, endDate: Date): number {
    // Both dates should already be normalized to UTC midnight
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Calculate difference in milliseconds
    const diffMs = end.getTime() - start.getTime();

    // Convert to days (using exact 24-hour periods)
    // This is safe because both dates are at UTC midnight
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }



  /**
   * Schedule exit interview
   */
  async scheduleExitInterview(employeeId: string, date: Date): Promise<ExitInterview> {
    employeeId = await this.resolveEmployeeUUID(employeeId);
    // Validate employee exists
    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Validate scheduled date is in the future
    if (new Date(date) < new Date()) {
      throw new Error('Exit interview cannot be scheduled in the past');
    }

    return this.exitInterviewRepository.createExitInterview(employeeId, {
      scheduled_at: date,
    });
  }

  /**
   * Complete exit interview
   */
  async completeExitInterview(
    exitInterviewId: string,
    conductedBy: string,
    responses: Record<string, any>,
    feedback: string
  ): Promise<ExitInterview> {
    const conductedByUUID = await this.resolveEmployeeUUID(conductedBy);
    return this.exitInterviewRepository.completeExitInterview(
      exitInterviewId,
      conductedByUUID,
      responses,
      feedback
    );
  }

  /**
   * Calculate Full & Final Settlement
   */
  async calculateFnFSettlement(employeeId: string): Promise<FnFSettlement> {
    employeeId = await this.resolveEmployeeUUID(employeeId);
    // Validate employee exists
    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // 1. Calculate pending salary (salary for current month up to last working day)
    const pendingSalary = await this.calculatePendingSalary(employeeId);

    // 2. Calculate leave encashment (remaining leave balance * daily rate)
    const leaveEncashment = await this.calculateLeaveEncashment(employeeId);

    // 3. Calculate gratuity using gratuity service
    const gratuity = await this.calculateGratuityAmount(employeeId, employee);

    // 4. Get bonus (if applicable - can be configured per company policy)
    const bonus = 0;

    // 5. Get other benefits (performance bonus, incentives, etc.)
    const otherBenefits = 0;

    // 7. Get pending advances to deduct
    const advanceDeduction = await this.calculateAdvanceDeductions(employeeId);

    // 8. Get asset damage costs
    const assetDamageDeduction = await this.assetRecoveryRepository.getTotalDamageCost(employeeId);

    // 9. Get other deductions (if any - can be configured per company policy)
    const otherDeductions = 0;

    // 10. Get statutory deductions (PF, ESI, Tax on pending salary)
    const statutoryDeductions = await this.calculateStatutoryDeductions(employeeId, pendingSalary);

    // 11. Create F&F settlement record
    const fnfData: CreateFnFSettlementDTO = {
      pending_salary: pendingSalary,
      leave_encashment: leaveEncashment,
      gratuity,
      bonus,
      other_benefits: otherBenefits,
      advance_deduction: advanceDeduction,
      asset_damage_deduction: assetDamageDeduction,
      other_deductions: otherDeductions + statutoryDeductions,
    };

    return this.fnfSettlementRepository.createFnFSettlement(employeeId, fnfData);
  }

  /**
   * Calculate pending salary for the employee up to last working day
   * Includes salary for days worked in current month
   */
  private async calculatePendingSalary(employeeId: string): Promise<number> {
    // Get salary structure
    const salaryStructure = await this.db('salary_structures')
      .where('employee_id', employeeId)
      .orderBy('created_at', 'desc')
      .first();

    if (!salaryStructure) {
      return 0;
    }

    // Get last working day from resignation or termination
    const resignation = await this.db('resignations')
      .where('employee_id', employeeId)
      .orderBy('created_at', 'desc')
      .first();

    const termination = await this.db('terminations')
      .where('employee_id', employeeId)
      .orderBy('created_at', 'desc')
      .first();

    const lastWorkingDay = resignation?.last_working_day || termination?.termination_date || new Date();

    // Calculate days worked in current month
    const currentDate = new Date();
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const daysInMonth = 30; // Standardize to 30 days for F&F calculations
    const daysWorked = Math.min(
      Math.floor((new Date(lastWorkingDay).getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      daysInMonth
    );

    // Calculate daily rate
    const monthlyBaseSalary = salaryStructure.basic_salary || 0;
    const dailyRate = monthlyBaseSalary / daysInMonth;

    // Return pending salary for days worked
    return dailyRate * daysWorked;
  }

  /**
   * Calculate statutory deductions for F&F settlement
   * Applies PF and ESI using the standard rates on the pending salary
   */
  private async calculateStatutoryDeductions(employeeId: string, pendingSalaryAmount: number): Promise<number> {
    if (pendingSalaryAmount <= 0) return 0;

    const salaryStructure = await this.db('salary_structures')
      .where('employee_id', employeeId)
      .orderBy('created_at', 'desc')
      .first();

    if (!salaryStructure) return 0;

    const pfRate = salaryStructure.pf_contribution_rate || 0;
    const esiRate = salaryStructure.esi_contribution_rate || 0;

    const pfDeduction = (pendingSalaryAmount * pfRate) / 100;
    const esiDeduction = (pendingSalaryAmount * esiRate) / 100;
    const taxDeduction = pendingSalaryAmount > 50000 ? (pendingSalaryAmount - 50000) * 0.1 : 0; // Simplified TDS

    return pfDeduction + esiDeduction + taxDeduction;
  }

  /**
   * Calculate leave encashment based on remaining leave balance
   * Formula: Remaining leave days * Daily rate
   */
  private async calculateLeaveEncashment(employeeId: string): Promise<number> {
    const currentYear = new Date().getFullYear();
    const leaveBalances = await this.leaveBalanceRepository.getBalancesByEmployee(employeeId, currentYear);

    if (!leaveBalances || leaveBalances.length === 0) {
      return 0;
    }

    // Get salary structure for daily rate
    const salaryStructure = await this.db('salary_structures')
      .where('employee_id', employeeId)
      .orderBy('created_at', 'desc')
      .first();

    if (!salaryStructure) {
      return 0;
    }

    const monthlyBaseSalary = salaryStructure.basic_salary || 0;
    const dailyRate = monthlyBaseSalary / 30; // Standard 30 working days per month

    // Sum remaining leave balance and calculate encashment
    let totalLeaveEncashment = 0;
    for (const balance of leaveBalances) {
      const remainingDays = balance.available_balance || 0;
      totalLeaveEncashment += remainingDays * dailyRate;
    }

    return totalLeaveEncashment;
  }

  /**
   * Calculate gratuity amount using gratuity service
   * Formula: (Last drawn salary × Years of service × 15) / 26
   * Eligibility: Minimum 5 years of service
   */
  private async calculateGratuityAmount(employeeId: string, employee: any): Promise<number> {
    try {
      // Get last drawn salary
      const salaryStructure = await this.db('salary_structures')
        .where('employee_id', employeeId)
        .orderBy('created_at', 'desc')
        .first();

      if (!salaryStructure) {
        return 0;
      }

      const lastDrawnSalary = salaryStructure.basic_salary || 0;

      if (!employee.date_of_joining) {
        return 0; // Invalid join date, cannot calculate gratuity
      }

      // Calculate years of service
      const dateOfJoining = new Date(employee.date_of_joining);
      const currentDate = new Date();
      let yearsOfService = currentDate.getFullYear() - dateOfJoining.getFullYear();
      const monthDiff = currentDate.getMonth() - dateOfJoining.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < dateOfJoining.getDate())) {
        yearsOfService--;
      }

      // Check eligibility (minimum 5 years)
      if (yearsOfService < 5) {
        return 0;
      }

      // Calculate gratuity: (Last drawn salary × Years of service × 15) / 26
      return (lastDrawnSalary * yearsOfService * 15) / 26;
    } catch (error) {
      // If gratuity calculation fails, return 0
      return 0;
    }
  }

  /**
   * Calculate total advance salary deductions
   * Includes all approved and deducted advances
   */
  private async calculateAdvanceDeductions(employeeId: string): Promise<number> {
    const advances = await this.advanceSalaryRepository.getAdvanceRequestsByEmployee(employeeId);

    if (!advances || advances.length === 0) {
      return 0;
    }

    // Sum all approved and deducted advances
    return advances
      .filter((adv: any) => adv.status === 'approved' || adv.status === 'deducted')
      .reduce((sum: number, adv: any) => sum + (adv.amount || 0), 0);
  }

  /**
   * Submit F&F Settlement for approval (draft → pending_approval)
   */
  async submitFnFSettlementForApproval(fnfSettlementId: string): Promise<FnFSettlement> {
    const settlement = await this.fnfSettlementRepository.getFnFSettlement(fnfSettlementId);
    if (!settlement) {
      throw new Error('F&F Settlement not found');
    }

    if (settlement.status !== 'draft') {
      throw new Error(`Cannot submit settlement with status: ${settlement.status}`);
    }

    // Update status to pending_approval
    return this.fnfSettlementRepository.updateFnFSettlement(fnfSettlementId, {
      status: 'pending_approval',
    });
  }

  /**
   * Approve F&F Settlement (pending_approval → approved)
   */
  async approveFnFSettlement(fnfSettlementId: string, approvedBy: string): Promise<FnFSettlement> {
    approvedBy = await this.resolveEmployeeUUID(approvedBy);
    const settlement = await this.fnfSettlementRepository.getFnFSettlement(fnfSettlementId);
    if (!settlement) {
      throw new Error('F&F Settlement not found');
    }

    if (settlement.status !== 'pending_approval') {
      throw new Error(`Cannot approve settlement with status: ${settlement.status}`);
    }

    const approved = await this.fnfSettlementRepository.approveFnFSettlement(fnfSettlementId, approvedBy);

    await this.db('audit_logs').insert({
      id: uuidv4(),
      entity_type: 'fnf_settlement',
      entity_id: fnfSettlementId,
      action: 'approved',
      performed_by: approvedBy,
      changes: { status: 'approved', approved_by: approvedBy, approved_at: new Date() },
      created_at: new Date(),
    });

    return approved;
  }

  async updateFnFDraft(fnfSettlementId: string, data: UpdateFnFSettlementDTO): Promise<FnFSettlement> {
    const settlement = await this.fnfSettlementRepository.getFnFSettlement(fnfSettlementId);
    if (!settlement) throw new Error('F&F Settlement not found');
    if (settlement.status !== 'draft') {
      throw new Error('Only draft settlements can be edited');
    }
    return this.fnfSettlementRepository.updateFnFSettlement(fnfSettlementId, data);
  }

  /**
   * Reject F&F Settlement (pending_approval → draft)
   */
  async rejectFnFSettlement(fnfSettlementId: string, rejectedBy: string, reason: string): Promise<FnFSettlement> {
    const settlement = await this.fnfSettlementRepository.getFnFSettlement(fnfSettlementId);
    if (!settlement) {
      throw new Error('F&F Settlement not found');
    }

    if (settlement.status !== 'pending_approval') {
      throw new Error(`Cannot reject settlement with status: ${settlement.status}`);
    }

    // Update status back to draft
    const rejected = await this.fnfSettlementRepository.updateFnFSettlement(fnfSettlementId, {
      status: 'draft',
    });

    // Log audit trail
    await this.db('audit_logs').insert({
      id: uuidv4(),
      entity_type: 'fnf_settlement',
      entity_id: fnfSettlementId,
      action: 'rejected',
      performed_by: rejectedBy,
      changes: {
        status: 'draft',
        rejection_reason: reason,
      },
      created_at: new Date(),
    });

    return rejected;
  }

  /**
   * Mark F&F Settlement as Paid (approved → paid)
   */
  async markFnFSettlementAsPaid(fnfSettlementId: string): Promise<FnFSettlement> {
    const settlement = await this.fnfSettlementRepository.getFnFSettlement(fnfSettlementId);
    if (!settlement) {
      throw new Error('F&F Settlement not found');
    }

    if (settlement.status !== 'approved') {
      throw new Error(`Cannot mark settlement as paid with status: ${settlement.status}`);
    }

    // Mark as paid
    const paid = await this.fnfSettlementRepository.markFnFSettlementAsPaid(fnfSettlementId);

    // Log audit trail
    await this.db('audit_logs').insert({
      id: uuidv4(),
      entity_type: 'fnf_settlement',
      entity_id: fnfSettlementId,
      action: 'paid',
      performed_by: null, // System action
      changes: {
        status: 'paid',
        paid_at: new Date(),
      },
      created_at: new Date(),
    });

    return paid;
  }

  /**
   * Generate plain text F&F Statement
   */
  private generateFnFStatementText(templateData: any): string {
    const { employee, settlement } = templateData;
    
    const lines = [
      '═══════════════════════════════════════════════════════════════',
      'FULL & FINAL (F&F) SETTLEMENT STATEMENT',
      '═══════════════════════════════════════════════════════════════',
      '',
      'EMPLOYEE INFORMATION',
      '─────────────────────────────────────────────────────────────',
      `Employee ID: ${employee.employee_id}`,
      `Name: ${employee.first_name} ${employee.last_name}`,
      `Department: ${employee.department_name}`,
      `Designation: ${employee.designation}`,
      `Date of Joining: ${employee.date_of_joining}`,
      `Last Working Day: ${employee.last_working_day}`,
      '',
      'SETTLEMENT DETAILS',
      '─────────────────────────────────────────────────────────────',
      `Settlement ID: ${settlement.id}`,
      `Status: ${settlement.status}`,
      `Generated Date: ${settlement.generated_date}`,
      `Approved Date: ${settlement.approved_date || 'Pending'}`,
      '',
      'EARNINGS',
      '─────────────────────────────────────────────────────────────',
      `Pending Salary: ₹${settlement.pending_salary}`,
      `Leave Encashment: ₹${settlement.leave_encashment}`,
      `Gratuity: ₹${settlement.gratuity}`,
      `Bonus: ₹${settlement.bonus}`,
      `Other Benefits: ₹${settlement.other_benefits}`,
      `Total Earnings: ₹${settlement.total_earnings}`,
      '',
      'DEDUCTIONS',
      '─────────────────────────────────────────────────────────────',
      `Advance Deduction: ₹${settlement.advance_deduction}`,
      `Asset Damage Deduction: ₹${settlement.asset_damage_deduction}`,
      `Other Deductions: ₹${settlement.other_deductions}`,
      `Total Deductions: ₹${settlement.total_deductions}`,
      '',
      'NET SETTLEMENT',
      '─────────────────────────────────────────────────────────────',
      `Net Settlement Amount: ₹${settlement.net_settlement}`,
      '',
      `Approved By: ${settlement.approved_by || 'Pending Approval'}`,
      '',
      '═══════════════════════════════════════════════════════════════',
      'This is a system-generated document.',
      '═══════════════════════════════════════════════════════════════',
    ];
    
    return lines.join('\n');
  }

  /**
   * Generate F&F Statement document for employee records
   * Creates a formatted text document, stores it in file storage, and returns the file URL
   */
  async generateFnFStatement(fnfSettlementId: string): Promise<{ fileUrl: string; fileKey: string }> {
    const settlement = await this.fnfSettlementRepository.getFnFSettlement(fnfSettlementId);
    if (!settlement) {
      throw new Error('F&F Settlement not found');
    }

    const employee = await this.employeeRepository.getEmployee(settlement.employee_id);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Get department name
    let departmentName = 'N/A';
    if (employee.department_id) {
      const department = await this.db('departments')
        .where('id', employee.department_id)
        .first();
      departmentName = department?.name || 'N/A';
    }

    // Get designation name
    let designationName = 'N/A';
    if (employee.designation_id) {
      const designation = await this.db('designations')
        .where('id', employee.designation_id)
        .first();
      designationName = designation?.title || 'N/A';
    }

    // Get last working day from resignation or termination
    let lastWorkingDay = 'N/A';
    const resignation = await this.db('resignations')
      .where('employee_id', settlement.employee_id)
      .orderBy('created_at', 'desc')
      .first();
    
    if (resignation) {
      lastWorkingDay = new Date(resignation.last_working_day).toLocaleDateString('en-IN');
    } else {
      const termination = await this.db('terminations')
        .where('employee_id', settlement.employee_id)
        .orderBy('created_at', 'desc')
        .first();
      if (termination) {
        lastWorkingDay = new Date(termination.termination_date).toLocaleDateString('en-IN');
      }
    }

    // Prepare template data
    const templateData = {
      employee: {
        employee_id: employee.employee_id,
        first_name: employee.first_name,
        last_name: employee.last_name,
        department_name: departmentName,
        designation: designationName,
        date_of_joining: new Date(employee.date_of_joining).toLocaleDateString('en-IN'),
        last_working_day: lastWorkingDay,
      },
      settlement: {
        id: settlement.id,
        status: settlement.status,
        generated_date: new Date().toLocaleDateString('en-IN'),
        approved_date: settlement.approved_at 
          ? new Date(settlement.approved_at).toLocaleDateString('en-IN') 
          : null,
        pending_salary: settlement.pending_salary.toFixed(2),
        leave_encashment: settlement.leave_encashment.toFixed(2),
        gratuity: settlement.gratuity.toFixed(2),
        bonus: settlement.bonus.toFixed(2),
        other_benefits: settlement.other_benefits.toFixed(2),
        total_earnings: settlement.total_earnings.toFixed(2),
        advance_deduction: settlement.advance_deduction.toFixed(2),
        asset_damage_deduction: settlement.asset_damage_deduction.toFixed(2),
        other_deductions: settlement.other_deductions.toFixed(2),
        total_deductions: settlement.total_deductions.toFixed(2),
        net_settlement: settlement.net_settlement.toFixed(2),
        approved_by: settlement.approved_by || null,
      },
    };

    // Generate plain text F&F statement
    const textContent = this.generateFnFStatementText(templateData);

    // Store in file storage
    const fileName = `fnf-statement-${employee.employee_id}-${Date.now()}.txt`;
    const fileBuffer = Buffer.from(textContent, 'utf-8');

    const uploadResult = await this.fileStorageService.uploadFile(fileBuffer, fileName, {
      employeeId: settlement.employee_id,
      category: FileCategory.DOCUMENT,
      metadata: {
        documentType: 'fnf_statement',
        settlementId: fnfSettlementId,
        generatedAt: new Date().toISOString(),
      },
    });

    // Store file reference in database
    await this.db('fnf_settlements')
      .where('id', fnfSettlementId)
      .update({
        statement_file_key: uploadResult.key,
        statement_file_url: uploadResult.url,
        statement_generated_at: new Date(),
      });

    logger.info('F&F statement generated and stored', {
      settlementId: fnfSettlementId,
      employeeId: settlement.employee_id,
      fileKey: uploadResult.key,
    });

    return {
      fileUrl: uploadResult.url,
      fileKey: uploadResult.key,
    };
  }

  /**
   * Generate asset recovery checklist from assigned assets
   */
  async generateAssetRecoveryChecklist(employeeId: string): Promise<AssetRecoveryChecklist[]> {
    // Get all assets assigned to employee
    const assets = await this.db('assets')
      .where('assigned_to', employeeId)
      .where('status', 'assigned');

    // Get already-existing checklist entries so we don't re-insert (unique constraint)
    const existing = await this.db('asset_recovery_checklists')
      .where('employee_id', employeeId)
      .select('asset_id');
    const existingAssetIds = new Set(existing.map((r: any) => r.asset_id));

    const checklists: AssetRecoveryChecklist[] = [];

    for (const asset of assets) {
      if (existingAssetIds.has(asset.id)) continue;

      const checklistData: CreateAssetRecoveryDTO = {
        asset_id: asset.id,
        status: 'pending',
      };

      const checklist = await this.assetRecoveryRepository.createAssetRecovery(employeeId, checklistData);
      checklists.push(checklist);
    }

    return checklists;
  }

  /**
   * Get asset recovery checklist for employee
   */
  async getAssetRecoveryChecklist(employeeId: string): Promise<AssetRecoveryChecklist[]> {
    employeeId = await this.resolveEmployeeUUID(employeeId);

    // Always try to generate missing entries first (safe — skips already-existing ones)
    await this.generateAssetRecoveryChecklist(employeeId);

    return this.assetRecoveryRepository.getAssetRecoveriesByEmployeeId(employeeId);
  }

  /**
   * Update asset recovery status
   */
  async updateAssetRecoveryStatus(
    assetRecoveryId: string,
    status: 'pending' | 'returned' | 'damaged' | 'missing',
    damageCost?: number
  ): Promise<AssetRecoveryChecklist> {
    if (status === 'returned') {
      return this.assetRecoveryRepository.markAssetAsReturned(assetRecoveryId);
    } else if (status === 'damaged') {
      return this.assetRecoveryRepository.markAssetAsDamaged(assetRecoveryId, damageCost || 0);
    } else if (status === 'missing') {
      return this.assetRecoveryRepository.markAssetAsMissing(assetRecoveryId);
    } else {
      return this.assetRecoveryRepository.updateAssetRecovery(assetRecoveryId, { status });
    }
  }

  /**
   * Check offboarding preconditions
   */
  async checkOffboardingPreconditions(employeeId: string): Promise<{
    canDeactivate: boolean;
    missingItems: string[];
    exitInterviewCompleted: boolean;
    fnfSettlementApproved: boolean;
    assetsRecovered: boolean;
    systemAccessRevoked: boolean;
    dataArchived: boolean;
  }> {
    employeeId = await this.resolveEmployeeUUID(employeeId);
    const missingItems: string[] = [];

    // Check exit interview completed
    const exitInterview = await this.exitInterviewRepository.getExitInterviewByEmployeeId(employeeId);
    const exitInterviewCompleted = !!(exitInterview && exitInterview.status === 'completed');
    if (!exitInterviewCompleted) {
      missingItems.push('Exit interview not completed');
    }

    // Check F&F settlement approved
    const fnfSettlement = await this.fnfSettlementRepository.getFnFSettlementByEmployeeId(employeeId);
    const fnfSettlementApproved = !!(fnfSettlement && (fnfSettlement.status === 'approved' || fnfSettlement.status === 'paid'));
    if (!fnfSettlementApproved) {
      missingItems.push('F&F settlement not approved');
    }

    // Check all assets recovered
    const unreturned = await this.assetRecoveryRepository.getUnreturnedAssets(employeeId);
    const assetsRecovered = unreturned.length === 0;
    if (!assetsRecovered) {
      missingItems.push('Some assets not recovered');
    }

    // Check system access revoked by querying the linked user account.
    // users.employee_id stores the string code (e.g. "EMP001"), not the UUID.
    const employee = await this.employeeRepository.getEmployee(employeeId);
    const linkedUser = employee
      ? await this.db('users').where('employee_id', (employee as any).employee_id).first()
      : null;
    const systemAccessRevoked = !!(linkedUser && linkedUser.is_active === false);
    const dataArchived = !!(employee && (employee as any).archived_at);

    return {
      canDeactivate: missingItems.length === 0,
      missingItems,
      exitInterviewCompleted,
      fnfSettlementApproved,
      assetsRecovered,
      systemAccessRevoked,
      dataArchived,
    };
  }

  /**
   * Revoke system access for an employee
   * Invalidates all active sessions, clears cached authentication data,
   * and prevents future login attempts
   *
   * @param employeeId - The employee ID to revoke access for
   * @throws Error if employee not found or access revocation fails
   */
  async revokeSystemAccess(employeeId: string): Promise<void> {
    const scopedLogger = logger.child('SeparationService.revokeSystemAccess');

    try {
      // Resolve to UUID first so we can look up the employee record
      employeeId = await this.resolveEmployeeUUID(employeeId);

      // users.employee_id stores the string code (e.g. "EMP001"), not the UUID.
      // Look up the employee to get their string code, then find the user.
      const employee = await this.db('employees')
        .where('id', employeeId)
        .select('employee_id')
        .first();

      if (!employee) {
        scopedLogger.warn('Employee not found', { employeeId });
        return;
      }

      const user = await this.db('users')
        .where('employee_id', employee.employee_id)
        .first();

      if (!user) {
        scopedLogger.warn('No user account found for employee', { employeeId, stringId: employee.employee_id });
        return;
      }

      const userId = user.id;
      scopedLogger.info('Starting system access revocation', { employeeId, userId });

      // 1. Invalidate all refresh tokens by incrementing token version
      // This prevents any existing refresh tokens from being used
      await this.db('users')
        .where('id', userId)
        .update({
          refresh_token_version: this.db.raw('refresh_token_version + 1'),
          updated_at: this.db.fn.now(),
        });

      scopedLogger.info('Incremented refresh token version', { userId });

      // 2. Deactivate user account to prevent login attempts
      await this.db('users')
        .where('id', userId)
        .update({
          is_active: false,
          updated_at: this.db.fn.now(),
        });

      scopedLogger.info('Deactivated user account', { userId });

      // 3. Clear any active sessions from Redis
      const redisClient = require('../config/redis').default.getClient();
      const sessionKey = `session:${userId}`;

      try {
        const sessionExists = await redisClient.exists(sessionKey);
        if (sessionExists) {
          await redisClient.del(sessionKey);
          scopedLogger.info('Cleared Redis session', { sessionKey });
        }
      } catch (redisError) {
        scopedLogger.warn('Failed to clear Redis session', {
          sessionKey,
          error: redisError instanceof Error ? redisError.message : String(redisError),
        });
        // Don't throw - Redis session clearing is best-effort
      }

      // 4. Log the access revocation in audit logs
      await this.db('audit_logs').insert({
        id: uuidv4(),
        entity_type: 'user',
        entity_id: userId,
        action: 'system_access_revoked',
        changes: {
          is_active: false,
          token_version_incremented: true,
          session_cleared: true,
          revocation_timestamp: new Date().toISOString(),
        },
        created_at: new Date(),
      });

      scopedLogger.info('System access revocation completed successfully', {
        employeeId,
        userId,
      });
    } catch (error) {
      scopedLogger.error('Failed to revoke system access', {
        employeeId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Deactivate employee
   * Validates all offboarding preconditions are met, revokes system access,
   * updates employee status, and sends deactivation notification
   */
  async deactivateEmployee(employeeId: string): Promise<void> {
    employeeId = await this.resolveEmployeeUUID(employeeId);
    // Validate employee exists
    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Check preconditions
    const preconditions = await this.checkOffboardingPreconditions(employeeId);
    if (!preconditions.canDeactivate) {
      throw new Error(`Cannot deactivate employee: ${preconditions.missingItems.join(', ')}`);
    }

    // Update employee status to resigned
    await this.employeeRepository.updateEmployeeStatus(employeeId, 'resigned');

    // Revoke system access (invalidates sessions, tokens, and prevents login)
    await this.revokeSystemAccess(employeeId);

    // Log deactivation in audit logs
    await this.db('audit_logs').insert({
      id: uuidv4(),
      entity_type: 'employee',
      entity_id: employeeId,
      action: 'employee_deactivated',
      changes: {
        status: 'resigned',
        system_access_revoked: true,
        deactivation_timestamp: new Date().toISOString(),
      },
      created_at: new Date(),
    });

    // Send deactivation notification to employee
    await notificationService.sendNotification({
      employeeId,
      type: NotificationType.SYSTEM_NOTIFICATION,
      title: 'Account Deactivated',
      body: 'Your employee account has been deactivated. Your system access has been revoked.',
      data: {
        deactivation_date: new Date().toISOString(),
        employee_id: employeeId,
      },
    });
  }

  /**
   * Trigger offboarding workflow
   * Generates asset recovery checklist, creates F&F settlement, and sends notifications
   * Returns workflow result with any errors that occurred
   */
  private async triggerOffboardingWorkflow(employeeId: string): Promise<{ errors: string[] }> {
    const errors: string[] = [];

    try {
      // Generate asset recovery checklist
      let assetChecklists: AssetRecoveryChecklist[] = [];
      try {
        assetChecklists = await this.generateAssetRecoveryChecklist(employeeId);
      } catch (error) {
        const errorMsg = `Failed to generate asset recovery checklist: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        logger.error(errorMsg, { employeeId });
        try {
          await this.db('audit_logs').insert({
            id: uuidv4(),
            entity_type: 'employee',
            entity_id: employeeId,
            action: 'offboarding_asset_recovery_failed',
            changes: { error: errorMsg },
            created_at: new Date(),
          });
        } catch { /* non-critical audit log failure */ }
      }

      // Create F&F settlement (draft)
      let fnfSettlement: FnFSettlement | null = null;
      try {
        fnfSettlement = await this.calculateFnFSettlement(employeeId);
      } catch (error) {
        const errorMsg = `Failed to create F&F settlement: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        logger.error(errorMsg, { employeeId });
        try {
          await this.db('audit_logs').insert({
            id: uuidv4(),
            entity_type: 'employee',
            entity_id: employeeId,
            action: 'offboarding_fnf_settlement_failed',
            changes: { error: errorMsg },
            created_at: new Date(),
          });
        } catch { /* non-critical audit log failure */ }
      }

      // Send notification to employee about offboarding process
      try {
        const employee = await this.employeeRepository.getEmployee(employeeId);
        if (employee) {
          await notificationService.sendNotification({
            employeeId,
            type: 'system_notification' as any,
            title: 'Offboarding Process Started',
            body: 'Your offboarding process has been initiated. Please complete all required steps.',
            data: {
              asset_checklists_count: String(assetChecklists.length),
              fnf_settlement_id: fnfSettlement?.id || 'pending',
            },
          });
        }
      } catch (error) {
        const errorMsg = `Failed to send offboarding notification to employee: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        logger.error(errorMsg, { employeeId });
      }

      try {
        await this.db('audit_logs').insert({
          id: uuidv4(),
          entity_type: 'employee',
          entity_id: employeeId,
          action: 'offboarding_workflow_triggered',
          changes: {
            asset_checklists_generated: assetChecklists.length,
            fnf_settlement_created: fnfSettlement?.id || null,
            workflow_errors: errors.length > 0 ? errors : null,
          },
          created_at: new Date(),
        });
      } catch { /* non-critical audit log failure */ }
    } catch (error) {
      const errorMsg = `Critical error in offboarding workflow: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(errorMsg);
      logger.error(errorMsg, { employeeId });
      try {
        await this.db('audit_logs').insert({
          id: uuidv4(),
          entity_type: 'employee',
          entity_id: employeeId,
          action: 'offboarding_workflow_critical_error',
          changes: { error: errorMsg },
          created_at: new Date(),
        });
      } catch { /* non-critical audit log failure */ }
    }

    return { errors };
  }

  /**
   * Get notice period status for a resignation
   * Returns current notice period tracking information with early exit/buyout detection
   */
  async getNoticePeriodStatus(resignationId: string): Promise<NoticePeriodInfo | null> {
    const resignation = await this.resignationRepository.getResignationById(resignationId);
    if (!resignation) {
      return null;
    }

    // Use stored notice_period_days if available, otherwise calculate from dates
    const noticeDays = resignation.notice_period_days || 
      Math.ceil(
        (new Date(resignation.last_working_day).getTime() - new Date(resignation.resignation_date).getTime()) / 
        (1000 * 60 * 60 * 24)
      );

    return this.calculateNoticePeriod(
      new Date(resignation.resignation_date),
      noticeDays
    );
  }

  /**
   * Check if an employee has exited early (before notice period end date)
   */
  private isEarlyExit(lastWorkingDay: Date, noticePeriodEndDate: Date): boolean {
    const lastWorkingDayNorm = new Date(lastWorkingDay);
    lastWorkingDayNorm.setUTCHours(0, 0, 0, 0);

    const endDateNorm = new Date(noticePeriodEndDate);
    endDateNorm.setUTCHours(0, 0, 0, 0);

    return lastWorkingDayNorm < endDateNorm;
  }

  /**
   * Update notice period serving status
   * Detects and flags early exits or buyouts
   */
  async updateNoticePeriodStatus(resignationId: string): Promise<void> {
    const resignation = await this.resignationRepository.getResignationById(resignationId);
    if (!resignation) {
      throw new Error('Resignation not found');
    }

    // Use stored notice_period_days if available
    const noticeDays = resignation.notice_period_days || 
      Math.ceil(
        (new Date(resignation.last_working_day).getTime() - new Date(resignation.resignation_date).getTime()) / 
        (1000 * 60 * 60 * 24)
      );

    const noticePeriodInfo = this.calculateNoticePeriod(
      new Date(resignation.resignation_date),
      noticeDays
    );

    let status = 'pending';

    // Determine status based on notice period completion and early exit
    if (noticePeriodInfo.is_notice_period_complete) {
      // Check if it was an early exit
      if (resignation.notice_period_end_date && this.isEarlyExit(resignation.last_working_day, resignation.notice_period_end_date)) {
        status = 'early_exit';
      } else {
        status = 'served';
      }
    } else if (noticePeriodInfo.notice_period_served_days > 0 && noticePeriodInfo.notice_period_served_days < noticeDays) {
      // Notice period partially served - check if it's a buyout
      // Buyout is when notice period was explicitly shortened by employer
      status = 'buyout';
    } else {
      status = 'pending';
    }

    await this.db('resignations')
      .where('id', resignationId)
      .update({
        notice_period_status: status,
        notice_period_served_days: noticePeriodInfo.notice_period_served_days,
        notice_period_remaining_days: noticePeriodInfo.notice_period_remaining_days,
      });
  }

  /**
   * Get resignation by ID
   */
  async getResignation(id: string): Promise<Resignation | null> {
    return this.resignationRepository.getResignationById(id) as any;
  }

  /**
   * Get resignation by employee ID
   */
  async getResignationByEmployeeId(employeeId: string): Promise<Resignation | null> {
    employeeId = await this.resolveEmployeeUUID(employeeId);
    return this.resignationRepository.getResignationByEmployeeId(employeeId) as any;
  }

  /**
   * Accept resignation
   */
  async acceptResignation(resignationId: string, acceptedBy: string): Promise<Resignation> {
    return this.resignationRepository.acceptResignation(resignationId, acceptedBy) as any;
  }

  /**
   * Reject resignation
   */
  async rejectResignation(resignationId: string): Promise<Resignation> {
    return this.resignationRepository.rejectResignation(resignationId) as any;
  }

  /**
   * Withdraw resignation
   */
  async withdrawResignation(resignationId: string): Promise<Resignation> {
    return this.resignationRepository.withdrawResignation(resignationId) as any;
  }

  /**
   * Get all exit interviews for an employee
   */
  async getExitInterviewsByEmployeeId(employeeId: string): Promise<ExitInterview[]> {
    employeeId = await this.resolveEmployeeUUID(employeeId);
    return this.exitInterviewRepository.getAllByEmployeeId(employeeId);
  }

  /**
   * Get exit interview by ID
   */
  async getExitInterview(id: string): Promise<ExitInterview | null> {
    return this.exitInterviewRepository.getExitInterviewById(id);
  }

  /**
   * Get F&F settlement by ID
   */
  async getFnFSettlement(id: string): Promise<FnFSettlement | null> {
    return this.fnfSettlementRepository.getFnFSettlement(id);
  }

  /**
   * Get F&F settlement by employee ID
   */
  async getFnFSettlementByEmployeeId(employeeId: string): Promise<FnFSettlement | null> {
    employeeId = await this.resolveEmployeeUUID(employeeId);
    return this.fnfSettlementRepository.getFnFSettlementByEmployeeId(employeeId);
  }

  /**
   * Create questionnaire template
   * Allows HR to define configurable exit interview questionnaires
   */
  async createQuestionnaireTemplate(data: CreateQuestionnaireTemplateDTO): Promise<QuestionnaireTemplate> {
    // Validate template has at least one question
    if (!data.questions || data.questions.length === 0) {
      throw new Error('Questionnaire template must have at least one question');
    }

    // Validate all questions have required fields
    for (const question of data.questions) {
      if (!question.question_text || !question.question_type) {
        throw new Error('All questions must have text and type');
      }

      // Validate question type
      const validTypes = ['text', 'multiple_choice', 'rating', 'yes_no'];
      if (!validTypes.includes(question.question_type)) {
        throw new Error(`Invalid question type: ${question.question_type}`);
      }

      // Validate multiple choice has options
      if (question.question_type === 'multiple_choice' && (!question.options || question.options.length === 0)) {
        throw new Error('Multiple choice questions must have options');
      }
    }

    return this.questionnaireTemplateRepository.createTemplate(data);
  }

  /**
   * Get questionnaire template by ID
   */
  async getQuestionnaireTemplate(id: string): Promise<QuestionnaireTemplate | null> {
    return this.questionnaireTemplateRepository.getTemplate(id);
  }

  /**
   * Get all active questionnaire templates
   */
  async getActiveQuestionnaireTemplates(): Promise<QuestionnaireTemplate[]> {
    return this.questionnaireTemplateRepository.getActiveTemplates();
  }

  /**
   * Get all questionnaire templates
   */
  async getAllQuestionnaireTemplates(): Promise<QuestionnaireTemplate[]> {
    return this.questionnaireTemplateRepository.getAllTemplates();
  }

  /**
   * Update questionnaire template
   */
  async updateQuestionnaireTemplate(
    id: string,
    data: UpdateQuestionnaireTemplateDTO
  ): Promise<QuestionnaireTemplate> {
    // Validate if questions are being updated
    if (data.questions) {
      if (data.questions.length === 0) {
        throw new Error('Questionnaire template must have at least one question');
      }

      for (const question of data.questions) {
        if (!question.question_text || !question.question_type) {
          throw new Error('All questions must have text and type');
        }

        const validTypes = ['text', 'multiple_choice', 'rating', 'yes_no'];
        if (!validTypes.includes(question.question_type)) {
          throw new Error(`Invalid question type: ${question.question_type}`);
        }

        if (question.question_type === 'multiple_choice' && (!question.options || question.options.length === 0)) {
          throw new Error('Multiple choice questions must have options');
        }
      }
    }

    return this.questionnaireTemplateRepository.updateTemplate(id, data);
  }

  /**
   * Deactivate questionnaire template
   */
  async deactivateQuestionnaireTemplate(id: string): Promise<QuestionnaireTemplate> {
    return this.questionnaireTemplateRepository.deactivateTemplate(id);
  }

  /**
   * Delete questionnaire template
   */
  async deleteQuestionnaireTemplate(id: string): Promise<void> {
    return this.questionnaireTemplateRepository.deleteTemplate(id);
  }

  /**
   * Schedule exit interview with optional questionnaire template
   * Validates employee exists and creates exit interview record
   */
  async scheduleExitInterviewWithTemplate(
    employeeId: string,
    scheduledAt: Date,
    templateId?: string
  ): Promise<ExitInterview> {
    // Validate employee exists
    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Validate template exists if provided
    if (templateId) {
      const template = await this.questionnaireTemplateRepository.getTemplate(templateId);
      if (!template) {
        throw new Error('Questionnaire template not found');
      }
    }

    // Validate scheduled date is in the future
    if (new Date(scheduledAt) < new Date()) {
      throw new Error('Exit interview cannot be scheduled in the past');
    }

    return this.exitInterviewRepository.createExitInterview(employeeId, {
      scheduled_at: scheduledAt,
      questionnaire_template_id: templateId || undefined,
    });
  }

  /**
   * Complete exit interview with questionnaire responses
   * Validates responses match template questions and stores feedback
   */
  async completeExitInterviewWithResponses(
    exitInterviewId: string,
    conductedBy: string,
    responses: Record<string, any>,
    feedback: string
  ): Promise<ExitInterview> {
    conductedBy = await this.resolveEmployeeUUID(conductedBy);
    // Get exit interview
    const exitInterview = await this.exitInterviewRepository.getExitInterviewById(exitInterviewId);
    if (!exitInterview) {
      throw new Error('Exit interview not found');
    }

    // Validate responses if template was used
    if (exitInterview.questionnaire_template_id) {
      const template = await this.questionnaireTemplateRepository.getTemplate(
        exitInterview.questionnaire_template_id
      );
      if (template) {
        // Validate all required questions have responses
        for (const question of template.questions) {
          if (question.is_required && !responses[question.id]) {
            throw new Error(`Required question "${question.question_text}" has no response`);
          }

          // Validate response format based on question type
          if (responses[question.id]) {
            const response = responses[question.id];
            if (question.question_type === 'rating' && (typeof response !== 'number' || response < 1 || response > 5)) {
              throw new Error(`Rating response must be between 1 and 5 for question "${question.question_text}"`);
            }

            if (question.question_type === 'yes_no' && typeof response !== 'boolean') {
              throw new Error(`Yes/No response must be boolean for question "${question.question_text}"`);
            }

            if (question.question_type === 'multiple_choice' && !question.options?.includes(response)) {
              throw new Error(`Invalid option for question "${question.question_text}"`);
            }
          }
        }
      }
    }

    // Complete exit interview
    const completed = await this.exitInterviewRepository.completeExitInterview(
      exitInterviewId,
      conductedBy,
      responses,
      feedback
    );

    // Send notification to employee
    const exitInterviewEmployee = await this.employeeRepository.getEmployee(exitInterview.employee_id);
    if (exitInterviewEmployee) {
      await notificationService.sendNotification({
        employeeId: exitInterview.employee_id,
        type: NotificationType.SYSTEM_NOTIFICATION,
        title: 'Exit Interview Completed',
        body: 'Your exit interview has been completed. Thank you for your feedback.',
        data: { exit_interview_id: exitInterviewId },
      });
    }

    return completed;
  }

  /**
   * Get exit interview with template details
   */
  async getExitInterviewWithTemplate(id: string): Promise<(ExitInterview & { template?: QuestionnaireTemplate | undefined }) | null> {
    const exitInterview = await this.exitInterviewRepository.getExitInterviewById(id);
    if (!exitInterview) {
      return null;
    }

    if (exitInterview.questionnaire_template_id) {
      const template = await this.questionnaireTemplateRepository.getTemplate(
        exitInterview.questionnaire_template_id
      );
      return { ...exitInterview, template: template || undefined };
    }

    return exitInterview;
  }

  /**
   * Get exit interviews by status with template details
   */
  async getExitInterviewsByStatusWithTemplate(
    status: 'scheduled' | 'completed' | 'cancelled'
  ): Promise<(ExitInterview & { template?: QuestionnaireTemplate | undefined })[]> {
    const exitInterviews = await this.exitInterviewRepository.getExitInterviewsByStatus(status);

    const result = [];
    for (const exitInterview of exitInterviews) {
      if (exitInterview.questionnaire_template_id) {
        const template = await this.questionnaireTemplateRepository.getTemplate(
          exitInterview.questionnaire_template_id
        );
        result.push({ ...exitInterview, template: template || undefined });
      } else {
        result.push(exitInterview);
      }
    }

    return result;
  }

  /**
   * Archive employee data for compliance and audit purposes
   * Marks employee as archived with timestamp and reason
   * Archived employees are excluded from normal queries but remain searchable by HR/Admin
   *
   * @param employeeId - The employee ID to archive
   * @param reason - The reason for archiving (e.g., "Resignation", "Termination")
   * @throws Error if employee not found or archive fails
   */
  async archiveEmployee(employeeId: string, reason: string): Promise<void> {
    const scopedLogger = logger.child('SeparationService.archiveEmployee');

    try {
      // Validate employee exists
      const employee = await this.employeeRepository.getEmployee(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      scopedLogger.info('Starting employee archiving', { employeeId, reason });

      // Archive the employee record
      await this.employeeRepository.archiveEmployee(employeeId, reason);

      scopedLogger.info('Employee archived successfully', { employeeId, reason });

      // Log archiving in audit logs
      await this.db('audit_logs').insert({
        id: uuidv4(),
        entity_type: 'employee',
        entity_id: employeeId,
        action: 'employee_archived',
        changes: {
          archived_at: new Date().toISOString(),
          archive_reason: reason,
        },
        created_at: new Date(),
      });

      scopedLogger.info('Archiving logged in audit trail', { employeeId });
    } catch (error) {
      scopedLogger.error('Failed to archive employee', {
        employeeId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get archived employees for HR/Admin compliance review
   * Returns paginated list of archived employees with archiving details
   *
   * @param limit - Number of records to return
   * @param offset - Number of records to skip
   * @returns List of archived employees
   */
  async getArchivedEmployees(limit: number = 50, offset: number = 0): Promise<any[]> {
    return this.employeeRepository.getArchivedEmployees(limit, offset);
  }

  /**
   * Get count of archived employees
   * Used for pagination and reporting
   *
   * @returns Total count of archived employees
   */
  async getArchivedEmployeeCount(): Promise<number> {
    return this.employeeRepository.getArchivedEmployeeCount();
  }

  /**
   * Complete offboarding process for an employee
   * Performs all final offboarding steps including archiving
   * Should be called after all other offboarding tasks are complete
   *
   * @param employeeId - The employee ID to complete offboarding for
   * @throws Error if employee not found or offboarding cannot be completed
   */
  async completeOffboarding(employeeId: string): Promise<void> {
    const scopedLogger = logger.child('SeparationService.completeOffboarding');

    try {
      // Validate employee exists
      const employee = await this.employeeRepository.getEmployee(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      scopedLogger.info('Starting complete offboarding process', { employeeId });

      // Check offboarding preconditions
      const preconditions = await this.checkOffboardingPreconditions(employeeId);
      if (!preconditions.canDeactivate) {
        throw new Error(`Cannot complete offboarding: ${preconditions.missingItems.join(', ')}`);
      }

      // Get resignation or termination reason for archiving
      let archiveReason = 'Employee Offboarding';
      const resignation = await this.resignationRepository.getResignationByEmployeeId(employeeId);
      if (resignation) {
        archiveReason = `Resignation - ${resignation.reason || 'No reason provided'}`;
      }

      // Archive employee data
      await this.archiveEmployee(employeeId, archiveReason);

      scopedLogger.info('Complete offboarding process finished', { employeeId });

      // Send final notification to employee
      await notificationService.sendNotification({
        employeeId,
        type: NotificationType.SYSTEM_NOTIFICATION,
        title: 'Offboarding Complete',
        body: 'Your offboarding process has been completed. Your employee record has been archived for compliance purposes.',
        data: {
          completion_date: new Date().toISOString(),
          employee_id: employeeId,
        },
      });
    } catch (error) {
      scopedLogger.error('Failed to complete offboarding', {
        employeeId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
