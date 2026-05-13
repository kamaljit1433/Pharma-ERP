import { Knex } from 'knex';
import logger from '../utils/logger';
import { ReimbursementClaimRepository } from '../repositories/reimbursementClaimRepository';
import { EmployeeRepository } from '../repositories/employeeRepository';
import {
  ReimbursementClaim,
  CreateReimbursementClaimDTO,
  UpdateReimbursementClaimDTO,
  ReimbursementClaimFilter,
} from '../types/benefits';

export class ReimbursementService {
  private claimRepository: ReimbursementClaimRepository;
  private employeeRepository: EmployeeRepository;

  constructor(private knex: Knex) {
    this.claimRepository = new ReimbursementClaimRepository(knex);
    this.employeeRepository = new EmployeeRepository(knex);
  }

  /**
   * Submit a reimbursement claim with optional file upload
   */
  async submitReimbursementClaim(
    data: CreateReimbursementClaimDTO
  ): Promise<ReimbursementClaim> {
    // Validate employee exists
    const employee = await this.employeeRepository.getEmployee(data.employee_id);
    if (!employee) {
      throw new Error(`Employee ${data.employee_id} not found`);
    }

    // Validate claim amount
    if (data.amount <= 0) {
      throw new Error('Claim amount must be greater than 0');
    }

    // Validate claim type
    if (!data.claim_type || data.claim_type.trim().length === 0) {
      throw new Error('Claim type is required');
    }

    // Validate description
    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Description is required');
    }

    // Create the claim
    const claim = await this.claimRepository.createClaim(data);

    // Log audit event
    await this.logAuditEvent('CLAIM_SUBMITTED', data.employee_id, claim.id, {
      amount: data.amount,
      claim_type: data.claim_type,
    });

    return claim;
  }

  /**
   * Get claim by ID
   */
  async getClaimById(id: string): Promise<ReimbursementClaim | null> {
    return this.claimRepository.getClaimById(id);
  }

  /**
   * Get all claims for an employee
   */
  async getEmployeeClaims(employeeId: string): Promise<ReimbursementClaim[]> {
    return this.claimRepository.getClaimsByEmployee(employeeId);
  }

  /**
   * Get claims by status
   */
  async getClaimsByStatus(status: string): Promise<ReimbursementClaim[]> {
    return this.claimRepository.getClaimsByStatus(status);
  }

  /**
   * Search claims with filters
   */
  async searchClaims(filters: ReimbursementClaimFilter): Promise<ReimbursementClaim[]> {
    return this.claimRepository.searchClaims(filters);
  }

  /**
   * Update a pending claim (only by employee who submitted it)
   */
  async updateClaim(
    claimId: string,
    employeeId: string,
    data: UpdateReimbursementClaimDTO
  ): Promise<ReimbursementClaim | null> {
    const claim = await this.claimRepository.getClaimById(claimId);

    if (!claim) {
      throw new Error(`Claim ${claimId} not found`);
    }

    // Only allow updates if claim is pending
    if (claim.status !== 'pending') {
      throw new Error(`Cannot update claim with status ${claim.status}`);
    }

    // Only allow employee to update their own claim
    if (claim.employee_id !== employeeId) {
      throw new Error('Unauthorized: Can only update your own claims');
    }

    // Validate amount if provided
    if (data.amount !== undefined && data.amount <= 0) {
      throw new Error('Claim amount must be greater than 0');
    }

    const updatedClaim = await this.claimRepository.updateClaim(claimId, data);

    if (updatedClaim) {
      await this.logAuditEvent('CLAIM_UPDATED', employeeId, claimId, data);
    }

    return updatedClaim;
  }

  /**
   * Manager approves a claim (first level approval)
   */
  async approveClaim(
    claimId: string,
    approverId: string,
    approvalNotes?: string
  ): Promise<ReimbursementClaim | null> {
    const claim = await this.claimRepository.getClaimById(claimId);

    if (!claim) {
      throw new Error(`Claim ${claimId} not found`);
    }

    // Only allow approval if claim is pending
    if (claim.status !== 'pending') {
      throw new Error(`Cannot approve claim with status ${claim.status}`);
    }

    const approvedClaim = await this.claimRepository.approveClaim(
      claimId,
      approverId,
      approvalNotes
    );

    if (approvedClaim) {
      await this.logAuditEvent('CLAIM_APPROVED', approverId, claimId, {
        approval_notes: approvalNotes,
      });

      // Trigger notification
      await this.notifyClaimApproved(approvedClaim);
    }

    return approvedClaim;
  }

  /**
   * Reject a claim
   */
  async rejectClaim(
    claimId: string,
    approverId: string,
    approvalNotes: string
  ): Promise<ReimbursementClaim | null> {
    const claim = await this.claimRepository.getClaimById(claimId);

    if (!claim) {
      throw new Error(`Claim ${claimId} not found`);
    }

    // Only allow rejection if claim is pending
    if (claim.status !== 'pending') {
      throw new Error(`Cannot reject claim with status ${claim.status}`);
    }

    // Validate rejection notes
    if (!approvalNotes || approvalNotes.trim().length === 0) {
      throw new Error('Rejection notes are required');
    }

    const rejectedClaim = await this.claimRepository.rejectClaim(
      claimId,
      approverId,
      approvalNotes
    );

    if (rejectedClaim) {
      await this.logAuditEvent('CLAIM_REJECTED', approverId, claimId, {
        approval_notes: approvalNotes,
      });

      // Trigger notification
      await this.notifyClaimRejected(rejectedClaim);
    }

    return rejectedClaim;
  }

  /**
   * Get approved claims for payroll integration
   */
  async getApprovedClaimsForPayroll(
    month: number,
    year: number
  ): Promise<ReimbursementClaim[]> {
    return this.claimRepository.getApprovedClaimsForPayroll(month, year);
  }

  /**
   * Mark claim as paid (called after payroll processing)
   */
  async markClaimAsPaid(claimId: string): Promise<ReimbursementClaim | null> {
    const claim = await this.claimRepository.getClaimById(claimId);

    if (!claim) {
      throw new Error(`Claim ${claimId} not found`);
    }

    // Only allow marking as paid if claim is approved
    if (claim.status !== 'approved') {
      throw new Error(`Cannot mark claim as paid with status ${claim.status}`);
    }

    const paidClaim = await this.claimRepository.markAsPaid(claimId);

    if (paidClaim) {
      await this.logAuditEvent('CLAIM_PAID', 'SYSTEM', claimId, {});
    }

    return paidClaim;
  }

  /**
   * Get reimbursement summary for an employee
   */
  async getEmployeeReimbursementSummary(
    employeeId: string,
    month?: number,
    year?: number
  ): Promise<{
    total_submitted: number;
    total_approved: number;
    total_rejected: number;
    total_paid: number;
    pending_count: number;
  }> {
    let filters: ReimbursementClaimFilter = { employee_id: employeeId };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      filters.from_date = startDate;
      filters.to_date = endDate;
    }

    const claims = await this.claimRepository.searchClaims(filters);

    return {
      total_submitted: claims.reduce((sum) => sum + 1, 0),
      total_approved: claims
        .filter((c) => c.status === 'approved')
        .reduce((sum, c) => sum + c.amount, 0),
      total_rejected: claims.filter((c) => c.status === 'rejected').length,
      total_paid: claims
        .filter((c) => c.status === 'paid')
        .reduce((sum, c) => sum + c.amount, 0),
      pending_count: claims.filter((c) => c.status === 'pending').length,
    };
  }

  /**
   * Log audit event
   */
  private async logAuditEvent(
    action: string,
    userId: string,
    claimId: string,
    details: any
  ): Promise<void> {
    try {
      await this.knex('audit_logs').insert({
        action,
        user_id: userId,
        resource_type: 'reimbursement_claim',
        resource_id: claimId,
        details: JSON.stringify(details),
        created_at: new Date(),
      });
    } catch (error) {
      // Log error but don't fail the operation
      logger.error('Failed to log audit event', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Notify employee of claim approval
   */
  private async notifyClaimApproved(claim: ReimbursementClaim): Promise<void> {
    try {
      // This would integrate with the notification service
      // For now, just log it
      logger.info('Claim approved', { claimId: claim.id, employeeId: claim.employee_id });
    } catch (error) {
      logger.error('Failed to send approval notification', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  /**
   * Notify employee of claim rejection
   */
  private async notifyClaimRejected(claim: ReimbursementClaim): Promise<void> {
    try {
      // This would integrate with the notification service
      // For now, just log it
      logger.info('Claim rejected', { claimId: claim.id, employeeId: claim.employee_id });
    } catch (error) {
      logger.error('Failed to send rejection notification', { error: error instanceof Error ? error.message : String(error) });
    }
  }
}
