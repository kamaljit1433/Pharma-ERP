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
    return this.knex('leave_types').where({ id }).first();
  }

  async getLeaveTypeByCode(code: string): Promise<LeaveType | null> {
    return this.knex('leave_types').where({ code }).first();
  }

  async getAllLeaveTypes(activeOnly = true): Promise<LeaveType[]> {
    let query = this.knex('leave_types');

    if (activeOnly) {
      query = query.where({ is_active: true });
    }

    return query.orderBy('name');
  }

  async updateLeaveType(
    id: string,
    data: UpdateLeaveTypeDTO
  ): Promise<LeaveType> {
    const [leaveType] = await this.knex('leave_types')
      .where({ id })
      .update({
        ...data,
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return leaveType;
  }

  async deleteLeaveType(id: string): Promise<void> {
    await this.knex('leave_types').where({ id }).delete();
  }

  async deactivateLeaveType(id: string): Promise<LeaveType> {
    return this.updateLeaveType(id, { is_active: false });
  }
}
