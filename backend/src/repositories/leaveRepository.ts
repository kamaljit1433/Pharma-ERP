import { Knex } from 'knex';
import { Leave, LeaveApplicationDTO } from '../types/leave';

export class LeaveRepository {
  constructor(private knex: Knex) {}

  async createLeave(data: LeaveApplicationDTO): Promise<Leave> {
    const [leave] = await this.knex('leaves')
      .insert({
        employee_id: data.employee_id,
        leave_type_id: data.leave_type_id,
        from_date: data.from_date,
        to_date: data.to_date,
        days_count: this.calculateDays(data.from_date, data.to_date),
        reason: data.reason,
        status: 'pending',
      })
      .returning('*');

    return leave;
  }

  async getLeaveById(id: string): Promise<Leave | null> {
    return this.knex('leaves').where({ id }).first();
  }

  async getLeavesByEmployee(
    employeeId: string,
    filters?: { status?: string; year?: number }
  ): Promise<Leave[]> {
    let query = this.knex('leaves').where({ employee_id: employeeId });

    if (filters?.status) {
      query = query.where({ status: filters.status });
    }

    if (filters?.year) {
      query = query.whereRaw(
        "EXTRACT(YEAR FROM from_date) = ?",
        [filters.year]
      );
    }

    return query.orderBy('from_date', 'desc');
  }

  async updateLeaveStatus(
    id: string,
    status: string,
    approverId?: string,
    approvalNotes?: string
  ): Promise<Leave> {
    const updateData: any = {
      status,
      updated_at: this.knex.fn.now(),
    };

    if (approverId) {
      updateData.approved_by = approverId;
      updateData.approved_at = this.knex.fn.now();
    }

    if (approvalNotes) {
      updateData.approval_notes = approvalNotes;
    }

    const [leave] = await this.knex('leaves')
      .where({ id })
      .update(updateData)
      .returning('*');

    return leave;
  }

  async getLeavesByDateRange(
    fromDate: string,
    toDate: string,
    employeeId?: string
  ): Promise<Leave[]> {
    let query = this.knex('leaves')
      .where('status', 'approved')
      .where((builder) => {
        builder
          .whereBetween('from_date', [fromDate, toDate])
          .orWhereBetween('to_date', [fromDate, toDate])
          .orWhere((b) =>
            b.where('from_date', '<=', fromDate).andWhere('to_date', '>=', toDate)
          );
      });

    if (employeeId) {
      query = query.where({ employee_id: employeeId });
    }

    return query.orderBy('from_date');
  }

  async getTeamLeaves(managerId: string, year: number): Promise<Leave[]> {
    return this.knex('leaves')
      .join('employees', 'leaves.employee_id', 'employees.id')
      .where('employees.reporting_manager_id', managerId)
      .whereRaw("EXTRACT(YEAR FROM leaves.from_date) = ?", [year])
      .select('leaves.*')
      .orderBy('leaves.from_date');
  }

  private calculateDays(fromDate: string, toDate: string): number {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
}
