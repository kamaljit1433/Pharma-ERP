import { Knex } from 'knex';
import { AdvanceSalaryRequest, CreateAdvanceSalaryDTO } from '../types/payroll';

export class AdvanceSalaryRepository {
  constructor(private knex: Knex) {}

  async createAdvanceRequest(
    data: CreateAdvanceSalaryDTO
  ): Promise<AdvanceSalaryRequest> {
    const [request] = await this.knex('advance_salary_requests')
      .insert({
        employee_id: data.employee_id,
        amount: data.amount,
        reason: data.reason,
        deduction_months: data.deduction_months || 1,
        status: 'pending',
      })
      .returning('*');

    return this.mapToAdvanceRequest(request);
  }

  async getAdvanceRequestById(id: string): Promise<AdvanceSalaryRequest | null> {
    const request = await this.knex('advance_salary_requests')
      .where({ id })
      .first();

    return request ? this.mapToAdvanceRequest(request) : null;
  }

  async getAdvanceRequestsByEmployee(
    employeeId: string
  ): Promise<AdvanceSalaryRequest[]> {
    const requests = await this.knex('advance_salary_requests')
      .where({ employee_id: employeeId })
      .orderBy('created_at', 'desc');

    return requests.map((r) => this.mapToAdvanceRequest(r));
  }

  async getPendingAdvanceRequests(): Promise<AdvanceSalaryRequest[]> {
    const requests = await this.knex('advance_salary_requests')
      .where({ status: 'pending' })
      .orderBy('created_at', 'asc');

    return requests.map((r) => this.mapToAdvanceRequest(r));
  }

  async approveAdvanceRequest(
    id: string,
    approvedBy: string,
    notes?: string
  ): Promise<AdvanceSalaryRequest> {
    const [updated] = await this.knex('advance_salary_requests')
      .where({ id })
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approval_notes: notes,
        approved_at: this.knex.fn.now(),
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.mapToAdvanceRequest(updated);
  }

  async rejectAdvanceRequest(
    id: string,
    rejectedBy: string,
    notes?: string
  ): Promise<AdvanceSalaryRequest> {
    const [updated] = await this.knex('advance_salary_requests')
      .where({ id })
      .update({
        status: 'rejected',
        rejected_by: rejectedBy,
        rejection_notes: notes,
        rejected_at: this.knex.fn.now(),
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.mapToAdvanceRequest(updated);
  }

  async markAsDeducted(id: string): Promise<AdvanceSalaryRequest> {
    const [updated] = await this.knex('advance_salary_requests')
      .where({ id })
      .update({
        status: 'deducted',
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.mapToAdvanceRequest(updated);
  }

  private mapToAdvanceRequest(row: any): AdvanceSalaryRequest {
    const result: AdvanceSalaryRequest = {
      id: row.id,
      employee_id: row.employee_id,
      amount: parseFloat(row.amount),
      status: row.status,
      deduction_months: row.deduction_months,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };

    if (row.reason) result.reason = row.reason;
    if (row.approved_by) result.approved_by = row.approved_by;
    if (row.approval_notes) result.approval_notes = row.approval_notes;
    if (row.approved_at) result.approved_at = new Date(row.approved_at);
    if (row.rejected_by) result.rejected_by = row.rejected_by;
    if (row.rejection_notes) result.rejection_notes = row.rejection_notes;
    if (row.rejected_at) result.rejected_at = new Date(row.rejected_at);

    return result;
  }
}
