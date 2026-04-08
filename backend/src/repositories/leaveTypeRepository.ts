import { Knex } from 'knex';
import { LeaveType, CreateLeaveTypeDTO, UpdateLeaveTypeDTO } from '../types/leave';

export class LeaveTypeRepository {
  constructor(private knex: Knex) {}

  async createLeaveType(data: CreateLeaveTypeDTO): Promise<LeaveType> {
    const [leaveType] = await this.knex('leave_types')
      .insert({
        name: data.name,
        code: data.code,
        annual_limit: data.annual_limit,
        is_paid: data.is_paid ?? true,
        requires_approval: data.requires_approval ?? true,
        carry_forward_limit: data.carry_forward_limit ?? 0,
        is_active: true,
      })
      .returning('*');

    return leaveType;
  }

  async getLeaveTypeById(id: string): Promise<LeaveType | null> {
    return (await this.knex('leave_types').where({ id }).first()) ?? null;
  }

  async getLeaveType(id: string): Promise<LeaveType | null> {
    return this.getLeaveTypeById(id);
  }

  async getLeaveTypeByCode(code: string): Promise<LeaveType | null> {
    return (await this.knex('leave_types').where({ code }).first()) ?? null;
  }

  async getLeaveTypeByName(name: string): Promise<LeaveType | null> {
    return (await this.knex('leave_types').where({ name }).first()) ?? null;
  }

  async getAllLeaveTypes(activeOnly = true): Promise<LeaveType[]> {
    let query = this.knex('leave_types');

    if (activeOnly) {
      query = query.where({ is_active: true });
    }

    return query.orderBy('name');
  }

  async getActiveLeaveTypes(): Promise<LeaveType[]> {
    return this.knex('leave_types').where({ is_active: true }).orderBy('name');
  }

  async getPaidLeaveTypes(): Promise<LeaveType[]> {
    return this.knex('leave_types').where({ is_paid: true }).orderBy('name');
  }

  async getUnpaidLeaveTypes(): Promise<LeaveType[]> {
    return this.knex('leave_types').where({ is_paid: false }).orderBy('name');
  }

  async getLeaveTypeCount(): Promise<number> {
    const result = await this.knex('leave_types').count('id as count').first();
    return parseInt(String(result?.['count'] || 0), 10);
  }

  async searchLeaveTypes(query: string): Promise<LeaveType[]> {
    return this.knex('leave_types')
      .whereILike('name', `%${query}%`)
      .orderBy('name');
  }

  async updateLeaveType(id: string, data: UpdateLeaveTypeDTO): Promise<LeaveType> {
    const [leaveType] = await this.knex('leave_types')
      .where({ id })
      .update({
        ...data,
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    if (!leaveType) {
      throw new Error(`LeaveType with id ${id} not found`);
    }

    return leaveType;
  }

  async deleteLeaveType(id: string): Promise<void> {
    await this.knex('leave_types').where({ id }).delete();
  }

  async deactivateLeaveType(id: string): Promise<LeaveType> {
    return this.updateLeaveType(id, { is_active: false });
  }
}
