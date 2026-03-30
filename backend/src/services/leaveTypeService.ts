import { Knex } from 'knex';
import { LeaveTypeRepository } from '../repositories/leaveTypeRepository';
import { LeaveType, CreateLeaveTypeDTO, UpdateLeaveTypeDTO } from '../types/leave';

export class LeaveTypeService {
  private leaveTypeRepository: LeaveTypeRepository;

  constructor(private knex: Knex) {
    this.leaveTypeRepository = new LeaveTypeRepository(knex);
  }

  async createLeaveType(data: CreateLeaveTypeDTO): Promise<LeaveType> {
    // Check if code already exists
    const existing = await this.leaveTypeRepository.getLeaveTypeByCode(data.code);
    if (existing) {
      throw new Error(`Leave type with code ${data.code} already exists`);
    }

    return this.leaveTypeRepository.createLeaveType(data);
  }

  async getLeaveType(id: string): Promise<LeaveType> {
    const leaveType = await this.leaveTypeRepository.getLeaveTypeById(id);
    if (!leaveType) {
      throw new Error('Leave type not found');
    }
    return leaveType;
  }

  async getAllLeaveTypes(activeOnly = true): Promise<LeaveType[]> {
    return this.leaveTypeRepository.getAllLeaveTypes(activeOnly);
  }

  async updateLeaveType(
    id: string,
    data: UpdateLeaveTypeDTO
  ): Promise<LeaveType> {
    const leaveType = await this.leaveTypeRepository.getLeaveTypeById(id);
    if (!leaveType) {
      throw new Error('Leave type not found');
    }

    return this.leaveTypeRepository.updateLeaveType(id, data);
  }

  async deleteLeaveType(id: string): Promise<void> {
    const leaveType = await this.leaveTypeRepository.getLeaveTypeById(id);
    if (!leaveType) {
      throw new Error('Leave type not found');
    }

    // Check if any leave balances exist for this type
    const balances = await this.knex('leave_balances')
      .where({ leave_type_id: id })
      .first();

    if (balances) {
      throw new Error(
        'Cannot delete leave type with existing leave balances'
      );
    }

    await this.leaveTypeRepository.deleteLeaveType(id);
  }

  async deactivateLeaveType(id: string): Promise<LeaveType> {
    const leaveType = await this.leaveTypeRepository.getLeaveTypeById(id);
    if (!leaveType) {
      throw new Error('Leave type not found');
    }

    return this.leaveTypeRepository.deactivateLeaveType(id);
  }
}
