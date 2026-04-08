import { Knex } from 'knex';

export interface Resignation {
  id: string;
  employee_id: string;
  resignation_date: Date;
  last_working_day: Date;
  reason?: string;
  status: string;
  accepted_by?: string;
  accepted_at?: Date;
  notice_period_days?: number;
  notice_period_end_date?: Date;
  notice_period_status?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateResignationInput {
  employee_id: string;
  resignation_date: Date;
  last_working_day: Date;
  reason?: string;
  status?: string;
}

export interface UpdateResignationInput {
  reason?: string;
  status?: string;
  last_working_day?: Date;
}

// Valid DB statuses
type DbStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

function toDbStatus(status: string | undefined): DbStatus {
  if (!status) return 'pending';
  if (status === 'submitted') return 'pending';
  return status as DbStatus;
}

export class ResignationRepository {
  constructor(private knex: Knex) {}

  async createResignation(data: CreateResignationInput): Promise<Resignation>;
  async createResignation(employeeId: string, data: { resignation_date: Date; last_working_day: Date; reason?: string }): Promise<Resignation>;
  async createResignation(
    dataOrEmployeeId: CreateResignationInput | string,
    legacyData?: { resignation_date: Date; last_working_day: Date; reason?: string }
  ): Promise<Resignation> {
    let employeeId: string;
    let resignation_date: Date;
    let last_working_day: Date;
    let reason: string | undefined;
    let status: DbStatus;

    if (typeof dataOrEmployeeId === 'string') {
      employeeId = dataOrEmployeeId;
      resignation_date = legacyData!.resignation_date;
      last_working_day = legacyData!.last_working_day;
      reason = legacyData!.reason;
      status = 'pending';
    } else {
      employeeId = dataOrEmployeeId.employee_id;
      resignation_date = dataOrEmployeeId.resignation_date;
      last_working_day = dataOrEmployeeId.last_working_day;
      reason = dataOrEmployeeId.reason;
      status = toDbStatus(dataOrEmployeeId.status);
    }

    const [row] = await this.knex('resignations')
      .insert({
        employee_id: employeeId,
        resignation_date,
        last_working_day,
        reason,
        status,
      })
      .returning('*');

    return this.mapToResignation(row);
  }

  async getResignationById(id: string): Promise<Resignation | null> {
    const row = await this.knex('resignations').where({ id }).first();
    return row ? this.mapToResignation(row) : null;
  }

  async getResignationByEmployeeId(employeeId: string): Promise<Resignation | null> {
    const row = await this.knex('resignations')
      .where({ employee_id: employeeId })
      .orderBy('created_at', 'desc')
      .first();
    return row ? this.mapToResignation(row) : null;
  }

  // Alias used by tests
  async getResignationByEmployee(employeeId: string): Promise<Resignation | null> {
    return this.getResignationByEmployeeId(employeeId);
  }

  async getResignationsByStatus(status: string): Promise<Resignation[]> {
    const rows = await this.knex('resignations')
      .where({ status: toDbStatus(status) })
      .orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapToResignation(r));
  }

  async getPendingResignations(): Promise<Resignation[]> {
    const rows = await this.knex('resignations')
      .where({ status: 'pending' })
      .orderBy('resignation_date', 'asc');
    return rows.map((r: any) => this.mapToResignation(r));
  }

  async updateResignation(id: string, data: UpdateResignationInput): Promise<Resignation> {
    const updateData: any = { updated_at: this.knex.fn.now() };

    if (data.status !== undefined) updateData.status = toDbStatus(data.status);
    if (data.last_working_day !== undefined) updateData.last_working_day = data.last_working_day;
    if (data.reason !== undefined) updateData.reason = data.reason;

    const [updated] = await this.knex('resignations')
      .where({ id })
      .update(updateData)
      .returning('*');

    return this.mapToResignation(updated);
  }

  async acceptResignation(id: string, acceptedBy: string): Promise<Resignation> {
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

  async rejectResignation(id: string, _rejectedBy?: string, _reason?: string): Promise<Resignation> {
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

  async deleteResignation(id: string): Promise<void> {
    await this.knex('resignations').where({ id }).delete();
  }

  async getResignationsWithinNoticePeriod(noticePeriodDays: number): Promise<Resignation[]> {
    const today = new Date();
    const cutoffDate = new Date(today.getTime() + noticePeriodDays * 24 * 60 * 60 * 1000);

    const rows = await this.knex('resignations')
      .where({ status: 'accepted' })
      .whereBetween('last_working_day', [today, cutoffDate])
      .orderBy('last_working_day', 'asc');

    return rows.map((r: any) => this.mapToResignation(r));
  }

  private parseDate(value: any): Date {
    if (value instanceof Date) {
      return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
    }
    const s = String(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return new Date(s + 'T00:00:00.000Z');
    }
    return new Date(value);
  }

  private mapToResignation(row: any): Resignation {
    const result: Resignation = {
      id: row.id,
      employee_id: row.employee_id,
      resignation_date: this.parseDate(row.resignation_date),
      last_working_day: this.parseDate(row.last_working_day),
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
