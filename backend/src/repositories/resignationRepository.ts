import { Knex } from 'knex';
import {
  Resignation,
  CreateResignationDTO,
  UpdateResignationDTO,
} from '../types/separation';

export class ResignationRepository {
  constructor(private knex: Knex) {}

  async createResignation(
    employeeId: string,
    data: CreateResignationDTO
  ): Promise<Resignation> {
    const [resignation] = await this.knex('resignations')
      .insert({
        employee_id: employeeId,
        resignation_date: data.resignation_date,
        last_working_day: data.last_working_day,
        reason: data.reason,
        status: 'pending',
      })
      .returning('*');

    return this.mapToResignation(resignation);
  }

  async getResignationById(id: string): Promise<Resignation | null> {
    const resignation = await this.knex('resignations')
      .where({ id })
      .first();

    return resignation ? this.mapToResignation(resignation) : null;
  }

  async getResignationByEmployeeId(
    employeeId: string
  ): Promise<Resignation | null> {
    const resignation = await this.knex('resignations')
      .where({ employee_id: employeeId })
      .orderBy('created_at', 'desc')
      .first();

    return resignation ? this.mapToResignation(resignation) : null;
  }

  async getResignationsByStatus(
    status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  ): Promise<Resignation[]> {
    const resignations = await this.knex('resignations')
      .where({ status })
      .orderBy('created_at', 'desc');

    return resignations.map((r) => this.mapToResignation(r));
  }

  async getPendingResignations(): Promise<Resignation[]> {
    const resignations = await this.knex('resignations')
      .where({ status: 'pending' })
      .orderBy('resignation_date', 'asc');

    return resignations.map((r) => this.mapToResignation(r));
  }

  async updateResignation(
    id: string,
    data: UpdateResignationDTO
  ): Promise<Resignation> {
    const updateData: any = {
      updated_at: this.knex.fn.now(),
    };

    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    if (data.last_working_day !== undefined) {
      updateData.last_working_day = data.last_working_day;
    }
    if (data.reason !== undefined) {
      updateData.reason = data.reason;
    }

    const [updated] = await this.knex('resignations')
      .where({ id })
      .update(updateData)
      .returning('*');

    return this.mapToResignation(updated);
  }

  async acceptResignation(
    id: string,
    acceptedBy: string
  ): Promise<Resignation> {
    const [updated] = await this.knex('resignations')
      .where({ id })
      .update({
        status: 'accepted',
        accepted_by: acceptedBy,
        accepted_at: this.knex.fn.now(),
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.mapToResignation(updated);
  }

  async rejectResignation(id: string): Promise<Resignation> {
    const [updated] = await this.knex('resignations')
      .where({ id })
      .update({
        status: 'rejected',
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.mapToResignation(updated);
  }

  async withdrawResignation(id: string): Promise<Resignation> {
    const [updated] = await this.knex('resignations')
      .where({ id })
      .update({
        status: 'withdrawn',
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.mapToResignation(updated);
  }

  async getResignationsWithinNoticePeriod(
    noticePeriodDays: number
  ): Promise<Resignation[]> {
    const today = new Date();
    const cutoffDate = new Date(today.getTime() + noticePeriodDays * 24 * 60 * 60 * 1000);

    const resignations = await this.knex('resignations')
      .where({ status: 'accepted' })
      .whereBetween('last_working_day', [today, cutoffDate])
      .orderBy('last_working_day', 'asc');

    return resignations.map((r) => this.mapToResignation(r));
  }

  private mapToResignation(row: any): Resignation {
    const result: Resignation = {
      id: row.id,
      employee_id: row.employee_id,
      resignation_date: new Date(row.resignation_date),
      last_working_day: new Date(row.last_working_day),
      status: row.status,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };

    if (row.reason) result.reason = row.reason;
    if (row.accepted_by) result.accepted_by = row.accepted_by;
    if (row.accepted_at) result.accepted_at = new Date(row.accepted_at);
    if (row.notice_period_days) result.notice_period_days = row.notice_period_days;
    if (row.notice_period_end_date) result.notice_period_end_date = new Date(row.notice_period_end_date);
    if (row.notice_period_status) result.notice_period_status = row.notice_period_status;

    return result;
  }
}
