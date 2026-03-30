import { Knex } from 'knex';
import { ResignationRepository } from '../repositories/resignationRepository';
import { ExitInterviewRepository } from '../repositories/exitInterviewRepository';
import { FnFSettlementRepository } from '../repositories/fnfSettlementRepository';
import { AssetRecoveryRepository } from '../repositories/assetRecoveryRepository';
import { EmployeeRepository } from '../repositories/employeeRepository';
import { LeaveBalanceRepository } from '../repositories/leaveBalanceRepository';
import { AdvanceSalaryRepository } from '../repositories/advanceSalaryRepository';
import { QuestionnaireTemplateRepository } from '../repositories/questionnaireTemplateRepository';
import notificationService from './notificationService';
import { NotificationType } from '../types/notification';
import {
  Resignation,
  CreateResignationDTO,
  ExitInterview,
  CreateExitInterviewDTO,
  FnFSettlement,
  CreateFnFSettlementDTO,
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

  constructor(private db: Knex) {
    this.resignationRepository = new ResignationRepository(db);
    this.exitInterviewRepository = new ExitInterviewRepository(db);
    this.fnfSettlementRepository = new FnFSettlementRepository(db);
    this.assetRecoveryRepository = new AssetRecoveryRepository(db);
    this.employeeRepository = new EmployeeRepository(db);
    this.leaveBalanceRepository = new LeaveBalanceRepository(db);
    this.advanceSalaryRepository = new AdvanceSalaryRepository(db);
    this.questionnaireTemplateRepository = new QuestionnaireTemplateRepository(db);
  }

  /**
   * Submit resignation for an employee
   * Validates employee exists, checks for existing pending resignation,
   * creates resignation record, and auto-triggers offboarding workflow
   */
  async submitResignation(employeeId: string, data: CreateResignationDTO): Promise<Resignation> {
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

    // Validate last working day is after resignation date
    const lastWorkingDayNorm = new Date(data.last_working_day);
    lastWorkingDayNorm.setHours(0, 0, 0, 0);
    
    if (lastWorkingDayNorm <= resignationDateNorm) {
      throw new Error('Last working day must be after resignation date');
    }

    // Create resignation
    const resignation = await this.resignationRepository.createResignation(employeeId, data);

    // Calculate and track notice period
    const noticePeriodInfo = this.calculateNoticePeriod(
      new Date(data.resignation_date),
      new Date(data.last_working_day)
    );

    // Store notice period info in database for tracking
    await this.db('resignations')
      .where('id', resignation.id)
      .update({
        notice_period_days: noticePeriodInfo.notice_period_days,
        notice_period_status: 'pending',
      });

    // Auto-trigger offboarding workflow
    await this.triggerOffboardingWorkflow(employeeId);

    // Send notification to HR
    await notificationService.sendNotification({
      employeeId: 'hr-team', // Would be actual HR team ID
      type: 'system_notification' as any,
      title: 'New Resignation Submitted',
      body: `${employee.first_name} ${employee.last_name} has submitted resignation effective ${data.last_working_day}`,
      data: { resignation_id: resignation.id, employee_id: employeeId },
    });

    return resignation;
  }

  /**
   * Initiate termination for an employee
   * Creates termination record with reason tracking and auto-triggers offboarding
   */
  async initiateTermination(employeeId: string, terminationDate: Date, reason: string): Promise<any> {
    // Validate employee exists
    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Validate termination date is not in the past
    if (new Date(terminationDate) < new Date()) {
      throw new Error('Termination date cannot be in the past');
    }

    // Validate reason is provided
    if (!reason || reason.trim().length === 0) {
      throw new Error('Termination reason is required');
    }

    // Create termination record
    const id = require('uuid').v4();
    const [termination] = await this.db('terminations')
      .insert({
        id,
        employee_id: employeeId,
        termination_date: terminationDate,
        reason,
        status: 'pending',
      })
      .returning('*');

    // Auto-trigger offboarding workflow
    await this.triggerOffboardingWorkflow(employeeId);

    // Send notification to HR and Finance
    await notificationService.sendNotification({
      employeeId: 'hr-team',
      type: 'system_notification' as any,
      title: 'Employee Termination Initiated',
      body: `${employee.first_name} ${employee.last_name} termination initiated effective ${terminationDate}. Reason: ${reason}`,
      data: { termination_id: id, employee_id: employeeId },
    });

    return termination;
  }

  /**
   * Calculate notice period information with status tracking
   * Returns notice period days, end date, served days, remaining days, and completion status
   */
  calculateNoticePeriod(resignationDate: Date, lastWorkingDay: Date): NoticePeriodInfo {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Normalize dates to UTC midnight for consistent comparison
    const resignationDateNorm = new Date(resignationDate);
    resignationDateNorm.setUTCHours(0, 0, 0, 0);
    
    const lastWorkingDayNorm = new Date(lastWorkingDay);
    lastWorkingDayNorm.setUTCHours(0, 0, 0, 0);

    // Calculate total notice period days
    const noticePeriodDays = Math.ceil(
      (lastWorkingDayNorm.getTime() - resignationDateNorm.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate days served so far
    const noticePeriodServedDays = Math.max(
      0,
      Math.ceil((today.getTime() - resignationDateNorm.getTime()) / (1000 * 60 * 60 * 24))
    );

    // Calculate remaining days
    const noticePeriodRemainingDays = Math.max(0, noticePeriodDays - noticePeriodServedDays);

    // Check if notice period is complete
    const isNoticePeriodComplete = today >= lastWorkingDayNorm;

    return {
      notice_period_days: noticePeriodDays,
      notice_period_end_date: lastWorkingDayNorm,
      notice_period_served_days: noticePeriodServedDays,
      notice_period_remaining_days: noticePeriodRemainingDays,
      is_notice_period_complete: isNoticePeriodComplete,
    };
  }

  /**
   * Schedule exit interview
   */
  async scheduleExitInterview(employeeId: string, data: CreateExitInterviewDTO): Promise<ExitInterview> {
    // Validate employee exists
    const employee = await this.employeeRepository.getEmployee(employeeId);
    if (!employee) {
      throw new Error('Employee not found');
    }

    return this.exitInterviewRepository.createExitInterview(employeeId, data);
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
    return this.exitInterviewRepository.completeExitInterview(
      exitInterviewId,
      conductedBy,
      responses,
      feedback
    );
  }

  /**
   * Calculate Full & Final Settlement
   */
  async calculateFnFSettlement(employeeId: string): Promise<FnFSettlement> {
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

    // 11. Create F&F settlement record
    const fnfData: CreateFnFSettlementDTO = {
      pending_salary: pendingSalary,
      leave_encashment: leaveEncashment,
      gratuity,
      bonus,
      other_benefits: otherBenefits,
      advance_deduction: advanceDeduction,
      asset_damage_deduction: assetDamageDeduction,
      other_deductions: otherDeductions,
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
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
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
    const dailyRate = monthlyBaseSalary / 26; // Standard 26 working days per month

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
    const settlement = await this.fnfSettlementRepository.getFnFSettlement(fnfSettlementId);
    if (!settlement) {
      throw new Error('F&F Settlement not found');
    }

    if (settlement.status !== 'pending_approval') {
      throw new Error(`Cannot approve settlement with status: ${settlement.status}`);
    }

    // Approve the settlement
    const approved = await this.fnfSettlementRepository.approveFnFSettlement(fnfSettlementId, approvedBy);

    // Log audit trail
    await this.db('audit_logs').insert({
      id: require('uuid').v4(),
      entity_type: 'fnf_settlement',
      entity_id: fnfSettlementId,
      action: 'approved',
      performed_by: approvedBy,
      changes: {
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date(),
      },
      created_at: new Date(),
    });

    return approved;
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
      id: require('uuid').v4(),
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
      id: require('uuid').v4(),
      entity_type: 'fnf_settlement',
      entity_id: fnfSettlementId,
      action: 'paid',
      performed_by: 'system',
      changes: {
        status: 'paid',
        paid_at: new Date(),
      },
      created_at: new Date(),
    });

    return paid;
  }

  /**
   * Generate F&F Statement document for employee records
   */
  async generateFnFStatement(fnfSettlementId: string): Promise<string> {
    const settlement = await this.fnfSettlementRepository.getFnFSettlement(fnfSettlementId);
    if (!settlement) {
      throw new Error('F&F Settlement not found');
    }

    const employee = await this.employeeRepository.getEmployee(settlement.employee_id);
    if (!employee) {
      throw new Error('Employee not found');
    }

    // Generate statement content
    const statement = this.generateFnFStatementContent(employee, settlement);

    // Store statement in file storage (optional)
    // For now, return the statement as string
    return statement;
  }

  /**
   * Generate F&F Statement content
   */
  private generateFnFStatementContent(employee: any, settlement: FnFSettlement): string {
    const date = new Date().toLocaleDateString('en-IN');
    const settlementDate = settlement.approved_at ? new Date(settlement.approved_at).toLocaleDateString('en-IN') : 'N/A';

    return `
FULL & FINAL SETTLEMENT STATEMENT
=====================================

Employee Details:
-----------------
Employee ID: ${employee.employee_id}
Name: ${employee.first_name} ${employee.last_name}
Department: ${employee.department_id || 'N/A'}
Date of Joining: ${new Date(employee.date_of_joining).toLocaleDateString('en-IN')}
Date of Separation: ${employee.date_of_exit ? new Date(employee.date_of_exit).toLocaleDateString('en-IN') : 'N/A'}

Settlement Details:
-------------------
Settlement ID: ${settlement.id}
Status: ${settlement.status}
Generated Date: ${date}
Approved Date: ${settlementDate}

EARNINGS:
---------
Pending Salary:           ₹ ${settlement.pending_salary.toFixed(2)}
Leave Encashment:         ₹ ${settlement.leave_encashment.toFixed(2)}
Gratuity:                 ₹ ${settlement.gratuity.toFixed(2)}
Bonus:                    ₹ ${settlement.bonus.toFixed(2)}
Other Benefits:           ₹ ${settlement.other_benefits.toFixed(2)}
                          ─────────────────
Total Earnings:           ₹ ${settlement.total_earnings.toFixed(2)}

DEDUCTIONS:
-----------
Advance Salary:           ₹ ${settlement.advance_deduction.toFixed(2)}
Asset Damage:             ₹ ${settlement.asset_damage_deduction.toFixed(2)}
Other Deductions:         ₹ ${settlement.other_deductions.toFixed(2)}
                          ─────────────────
Total Deductions:         ₹ ${settlement.total_deductions.toFixed(2)}

NET SETTLEMENT AMOUNT:    ₹ ${settlement.net_settlement.toFixed(2)}

Approval Details:
-----------------
Approved By: ${settlement.approved_by || 'N/A'}
Approved At: ${settlementDate}

This is a computer-generated statement and does not require a signature.
For queries, please contact the HR Department.
    `;
  }

  /**
   * Generate asset recovery checklist from assigned assets
   */
  async generateAssetRecoveryChecklist(employeeId: string): Promise<AssetRecoveryChecklist[]> {
    // Get all assets assigned to employee
    const assets = await this.db('assets')
      .where('assigned_to', employeeId)
      .where('status', 'active');

    const checklists: AssetRecoveryChecklist[] = [];

    for (const asset of assets) {
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
  }> {
    const missingItems: string[] = [];

    // Check exit interview completed
    const exitInterview = await this.exitInterviewRepository.getExitInterviewByEmployeeId(employeeId);
    if (!exitInterview || exitInterview.status !== 'completed') {
      missingItems.push('Exit interview not completed');
    }

    // Check F&F settlement approved
    const fnfSettlement = await this.fnfSettlementRepository.getFnFSettlementByEmployeeId(employeeId);
    if (!fnfSettlement || fnfSettlement.status !== 'approved') {
      missingItems.push('F&F settlement not approved');
    }

    // Check all assets recovered
    const unreturned = await this.assetRecoveryRepository.getUnreturnedAssets(employeeId);
    if (unreturned.length > 0) {
      missingItems.push('Some assets not recovered');
    }

    return {
      canDeactivate: missingItems.length === 0,
      missingItems,
    };
  }

  /**
   * Deactivate employee
   * Validates all offboarding preconditions are met, revokes system access,
   * updates employee status, and sends deactivation notification
   */
  async deactivateEmployee(employeeId: string): Promise<void> {
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

    // Revoke system access
    await this.db('users').where('employee_id', employeeId).update({ is_active: false });

    // Log deactivation in audit logs
    await this.db('audit_logs').insert({
      id: require('uuid').v4(),
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
   */
  private async triggerOffboardingWorkflow(employeeId: string): Promise<void> {
    try {
      // Generate asset recovery checklist
      const assetChecklists = await this.generateAssetRecoveryChecklist(employeeId);

      // Create F&F settlement (draft)
      const fnfSettlement = await this.calculateFnFSettlement(employeeId);

      // Send notification to employee about offboarding process
      const employee = await this.employeeRepository.getEmployee(employeeId);
      if (employee) {
        await notificationService.sendNotification({
          employeeId,
          type: 'system_notification' as any,
          title: 'Offboarding Process Started',
          body: 'Your offboarding process has been initiated. Please complete all required steps.',
          data: {
            asset_checklists_count: String(assetChecklists.length),
            fnf_settlement_id: fnfSettlement.id,
          },
        });
      }

      // Log offboarding workflow trigger
      await this.db('audit_logs').insert({
        id: require('uuid').v4(),
        entity_type: 'employee',
        entity_id: employeeId,
        action: 'offboarding_workflow_triggered',
        changes: {
          asset_checklists_generated: assetChecklists.length,
          fnf_settlement_created: fnfSettlement.id,
        },
        created_at: new Date(),
      });
    } catch (error) {
      // Log error but don't fail the resignation/termination submission
      console.error('Error triggering offboarding workflow:', error);
    }
  }

  /**
   * Get notice period status for a resignation
   * Returns current notice period tracking information
   */
  async getNoticePeriodStatus(resignationId: string): Promise<NoticePeriodInfo | null> {
    const resignation = await this.resignationRepository.getResignation(resignationId);
    if (!resignation) {
      return null;
    }

    return this.calculateNoticePeriod(
      new Date(resignation.resignation_date),
      new Date(resignation.last_working_day)
    );
  }

  /**
   * Update notice period serving status
   * Tracks whether notice period is pending, in-progress, or completed
   */
  async updateNoticePeriodStatus(resignationId: string): Promise<void> {
    const resignation = await this.resignationRepository.getResignation(resignationId);
    if (!resignation) {
      throw new Error('Resignation not found');
    }

    const noticePeriodInfo = this.calculateNoticePeriod(
      new Date(resignation.resignation_date),
      new Date(resignation.last_working_day)
    );

    let status = 'pending';
    if (noticePeriodInfo.notice_period_served_days > 0 && !noticePeriodInfo.is_notice_period_complete) {
      status = 'in_progress';
    } else if (noticePeriodInfo.is_notice_period_complete) {
      status = 'completed';
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
    return this.resignationRepository.getResignation(id);
  }

  /**
   * Get resignation by employee ID
   */
  async getResignationByEmployeeId(employeeId: string): Promise<Resignation | null> {
    return this.resignationRepository.getResignationByEmployeeId(employeeId);
  }

  /**
   * Accept resignation
   */
  async acceptResignation(resignationId: string, acceptedBy: string): Promise<Resignation> {
    return this.resignationRepository.acceptResignation(resignationId, acceptedBy);
  }

  /**
   * Reject resignation
   */
  async rejectResignation(resignationId: string): Promise<Resignation> {
    return this.resignationRepository.rejectResignation(resignationId);
  }

  /**
   * Withdraw resignation
   */
  async withdrawResignation(resignationId: string): Promise<Resignation> {
    return this.resignationRepository.withdrawResignation(resignationId);
  }

  /**
   * Get exit interview by ID
   */
  async getExitInterview(id: string): Promise<ExitInterview | null> {
    return this.exitInterviewRepository.getExitInterview(id);
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
    // Get exit interview
    const exitInterview = await this.exitInterviewRepository.getExitInterview(exitInterviewId);
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
    const exitInterview = await this.exitInterviewRepository.getExitInterview(id);
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
    status: string
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
}
