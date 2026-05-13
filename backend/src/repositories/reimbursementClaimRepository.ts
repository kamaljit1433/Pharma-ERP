import { Knex } from 'knex';
import {
  ReimbursementClaim,
  ReimbursementClaimFilter,
} from '../types/benefits';
import { resolveEmployeeUUID } from '../utils/resolveEmployeeId';

export type ReimbursementClaimResult = ReimbursementClaim & { category: string };

export interface CreateReimbursementClaimInput {
  employee_id: string;
  claim_type?: string;
  category?: string;       // alias for claim_type
  amount: number;
  description: string;
  receipt_url?: string;
  currency?: string;       // not stored in DB, accepted for API compatibility
  claim_date?: Date;       // not stored in DB, accepted for API compatibility
  status?: string;
}

export interface UpdateReimbursementClaimInput {
  claim_type?: string;
  amount?: number;
  description?: string;
  receipt_url?: string;
  status?: string;
}

export class ReimbursementClaimRepository {
  constructor(private db: Knex) {}

  async createClaim(data: CreateReimbursementClaimInput): Promise<ReimbursementClaimResult> {
    const claimType = data.claim_type || data.category || 'other';
    const status = data.status || 'pending';
    const resolvedEmployeeId = await resolveEmployeeUUID(this.db, data.employee_id);
    if (!resolvedEmployeeId) throw new Error(`Employee not found: ${data.employee_id}`);

    const [claim] = await this.db('reimbursement_claims')
      .insert({
        employee_id: resolvedEmployeeId,
        claim_type: claimType,
        amount: data.amount,
        description: data.description,
        receipt_url: data.receipt_url || null,
        status,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    return this.mapToClaim(claim);
  }

  async getClaimById(id: string): Promise<ReimbursementClaimResult | null> {
    const claim = await this.db('reimbursement_claims').where({ id }).first();
    return claim ? this.mapToClaim(claim) : null;
  }

  async getClaimsByEmployee(employeeId: string): Promise<ReimbursementClaimResult[]> {
    const resolvedId = await resolveEmployeeUUID(this.db, employeeId);
    if (!resolvedId) return [];
    const claims = await this.db('reimbursement_claims')
      .where({ employee_id: resolvedId })
      .orderBy('created_at', 'desc');
    return claims.map((c: any) => this.mapToClaim(c));
  }

  async getClaimsByStatus(status: string): Promise<ReimbursementClaimResult[]> {
    const claims = await this.db('reimbursement_claims')
      .where({ status })
      .orderBy('created_at', 'desc');
    return claims.map((c: any) => this.mapToClaim(c));
  }

  async searchClaims(filters: ReimbursementClaimFilter): Promise<ReimbursementClaimResult[]> {
    let query = this.db('reimbursement_claims');

    if (filters.employee_id) {
      const resolvedId = await resolveEmployeeUUID(this.db, filters.employee_id);
      if (!resolvedId) return [];
      query = query.where('employee_id', resolvedId);
    }
    if (filters.status) query = query.where('status', filters.status);
    if (filters.claim_type) query = query.where('claim_type', filters.claim_type);
    if (filters.from_date) query = query.where('created_at', '>=', filters.from_date);
    if (filters.to_date) query = query.where('created_at', '<=', filters.to_date);

    const claims = await query.orderBy('created_at', 'desc');
    return claims.map((c: any) => this.mapToClaim(c));
  }

  async updateClaim(id: string, data: UpdateReimbursementClaimInput): Promise<ReimbursementClaimResult> {
    const updateData: any = { updated_at: new Date() };

    if (data.claim_type !== undefined) updateData.claim_type = data.claim_type;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.receipt_url !== undefined) updateData.receipt_url = data.receipt_url;
    if (data.status !== undefined) updateData.status = data.status;

    const [claim] = await this.db('reimbursement_claims')
      .where({ id })
      .update(updateData)
      .returning('*');

    return this.mapToClaim(claim);
  }

  async approveClaim(id: string, approvedBy: string, approvalNotes?: string): Promise<ReimbursementClaimResult> {
    const [claim] = await this.db('reimbursement_claims')
      .where({ id })
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approval_notes: approvalNotes || null,
        approved_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');
    return this.mapToClaim(claim);
  }

  async rejectClaim(id: string, approvedBy: string, approvalNotes: string): Promise<ReimbursementClaimResult> {
    const [claim] = await this.db('reimbursement_claims')
      .where({ id })
      .update({
        status: 'rejected',
        approved_by: approvedBy,
        approval_notes: approvalNotes,
        approved_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');
    return this.mapToClaim(claim);
  }

  async markAsPaid(id: string): Promise<ReimbursementClaimResult | null> {
    const [claim] = await this.db('reimbursement_claims')
      .where({ id })
      .update({ status: 'paid', paid_at: new Date(), updated_at: new Date() })
      .returning('*');
    return claim ? this.mapToClaim(claim) : null;
  }

  async deleteClaim(id: string): Promise<void> {
    await this.db('reimbursement_claims').where({ id }).delete();
  }

  async getApprovedClaimsForPayroll(month: number, year: number): Promise<ReimbursementClaimResult[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const claims = await this.db('reimbursement_claims')
      .where({ status: 'approved' })
      .whereBetween('approved_at', [startDate, endDate])
      .orderBy('employee_id');

    return claims.map((c: any) => this.mapToClaim(c));
  }

  private mapToClaim(row: any): ReimbursementClaimResult {
    return {
      id: row.id,
      employee_id: row.employee_id,
      claim_type: row.claim_type,
      category: row.claim_type,   // expose as category alias for test compatibility
      amount: Number(row.amount),
      description: row.description,
      receipt_url: row.receipt_url || null,
      status: row.status,
      approved_by: row.approved_by || null,
      approval_notes: row.approval_notes || null,
      approved_at: row.approved_at ? new Date(row.approved_at) : null,
      paid_at: row.paid_at ? new Date(row.paid_at) : null,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
