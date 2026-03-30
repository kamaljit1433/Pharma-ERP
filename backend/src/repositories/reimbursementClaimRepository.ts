import { Knex } from 'knex';
import {
  ReimbursementClaim,
  CreateReimbursementClaimDTO,
  UpdateReimbursementClaimDTO,
  ReimbursementClaimFilter,
} from '../types/benefits';

export class ReimbursementClaimRepository {
  constructor(private db: Knex) {}

  async createClaim(data: CreateReimbursementClaimDTO): Promise<ReimbursementClaim> {
    const [claim] = await this.db('reimbursement_claims')
      .insert({
        employee_id: data.employee_id,
        claim_type: data.claim_type,
        amount: data.amount,
        description: data.description,
        receipt_url: data.receipt_url || null,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    return this.mapToClaim(claim);
  }

  async getClaimById(id: string): Promise<ReimbursementClaim | null> {
    const claim = await this.db('reimbursement_claims')
      .where({ id })
      .first();

    return claim ? this.mapToClaim(claim) : null;
  }

  async getClaimsByEmployee(employeeId: string): Promise<ReimbursementClaim[]> {
    const claims = await this.db('reimbursement_claims')
      .where({ employee_id: employeeId })
      .orderBy('created_at', 'desc');

    return claims.map((claim) => this.mapToClaim(claim));
  }

  async getClaimsByStatus(status: string): Promise<ReimbursementClaim[]> {
    const claims = await this.db('reimbursement_claims')
      .where({ status })
      .orderBy('created_at', 'desc');

    return claims.map((claim) => this.mapToClaim(claim));
  }

  async searchClaims(filters: ReimbursementClaimFilter): Promise<ReimbursementClaim[]> {
    let query = this.db('reimbursement_claims');

    if (filters.employee_id) {
      query = query.where('employee_id', filters.employee_id);
    }

    if (filters.status) {
      query = query.where('status', filters.status);
    }

    if (filters.claim_type) {
      query = query.where('claim_type', filters.claim_type);
    }

    if (filters.from_date) {
      query = query.where('created_at', '>=', filters.from_date);
    }

    if (filters.to_date) {
      query = query.where('created_at', '<=', filters.to_date);
    }

    const claims = await query.orderBy('created_at', 'desc');

    return claims.map((claim) => this.mapToClaim(claim));
  }

  async updateClaim(
    id: string,
    data: UpdateReimbursementClaimDTO
  ): Promise<ReimbursementClaim | null> {
    const [claim] = await this.db('reimbursement_claims')
      .where({ id })
      .update({
        ...data,
        updated_at: new Date(),
      })
      .returning('*');

    return claim ? this.mapToClaim(claim) : null;
  }

  async approveClaim(
    id: string,
    approvedBy: string,
    approvalNotes?: string
  ): Promise<ReimbursementClaim | null> {
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

    return claim ? this.mapToClaim(claim) : null;
  }

  async rejectClaim(
    id: string,
    approvedBy: string,
    approvalNotes: string
  ): Promise<ReimbursementClaim | null> {
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

    return claim ? this.mapToClaim(claim) : null;
  }

  async markAsPaid(id: string): Promise<ReimbursementClaim | null> {
    const [claim] = await this.db('reimbursement_claims')
      .where({ id })
      .update({
        status: 'paid',
        paid_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    return claim ? this.mapToClaim(claim) : null;
  }

  async getApprovedClaimsForPayroll(
    month: number,
    year: number
  ): Promise<ReimbursementClaim[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const claims = await this.db('reimbursement_claims')
      .where({ status: 'approved' })
      .whereBetween('approved_at', [startDate, endDate])
      .orderBy('employee_id');

    return claims.map((claim) => this.mapToClaim(claim));
  }

  private mapToClaim(row: any): ReimbursementClaim {
    return {
      id: row.id,
      employee_id: row.employee_id,
      claim_type: row.claim_type,
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
