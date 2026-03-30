import { Knex } from 'knex';
import { BaseFactory } from './base.factory';

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  description: string | null;
  annual_limit: number;
  carry_forward_limit: number;
  requires_approval: boolean;
  is_paid: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Factory for generating LeaveType test data
 */
export class LeaveTypeFactory extends BaseFactory<LeaveType> {
  private static counter = 0;
  private static leaveTypes = [
    { name: 'Casual Leave', code: 'CL', annual_limit: 12, carry_forward_limit: 5, is_paid: true },
    { name: 'Sick Leave', code: 'SL', annual_limit: 10, carry_forward_limit: 0, is_paid: true },
    { name: 'Earned Leave', code: 'EL', annual_limit: 20, carry_forward_limit: 10, is_paid: true },
    { name: 'Maternity Leave', code: 'ML', annual_limit: 180, carry_forward_limit: 0, is_paid: true },
    { name: 'Paternity Leave', code: 'PL', annual_limit: 15, carry_forward_limit: 0, is_paid: true },
    { name: 'Unpaid Leave', code: 'UL', annual_limit: 30, carry_forward_limit: 0, is_paid: false },
  ];

  constructor(knex: Knex) {
    super(knex, 'leave_types');
  }

  /**
   * Create a single leave type
   */
  async create(overrides?: Partial<LeaveType>): Promise<LeaveType> {
    const leaveType = LeaveTypeFactory.leaveTypes[LeaveTypeFactory.counter % LeaveTypeFactory.leaveTypes.length];
    LeaveTypeFactory.counter++;

    const data: any = {
      id: this.generateId(),
      name: leaveType.name,
      code: leaveType.code,
      description: `${leaveType.name} for employees`,
      annual_limit: leaveType.annual_limit,
      carry_forward_limit: leaveType.carry_forward_limit,
      requires_approval: true,
      is_paid: leaveType.is_paid,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };

    return this.insert(data);
  }

  /**
   * Create all standard leave types
   */
  async createStandardLeaveTypes(): Promise<LeaveType[]> {
    const leaveTypes: LeaveType[] = [];
    for (const leaveType of LeaveTypeFactory.leaveTypes) {
      const created = await this.create({
        name: leaveType.name,
        code: leaveType.code,
        annual_limit: leaveType.annual_limit,
        carry_forward_limit: leaveType.carry_forward_limit,
        is_paid: leaveType.is_paid,
      });
      leaveTypes.push(created);
    }
    return leaveTypes;
  }
}
