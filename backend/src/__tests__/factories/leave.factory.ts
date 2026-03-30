import { Knex } from 'knex';
import { BaseFactory } from './base.factory';

export interface Leave {
  id: string;
  employee_id: string;
  leave_type_id: string;
  from_date: Date;
  to_date: Date;
  number_of_days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by: string | null;
  approval_date: Date | null;
  rejection_reason: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Factory for generating Leave test data
 */
export class LeaveFactory extends BaseFactory<Leave> {
  constructor(knex: Knex) {
    super(knex, 'leaves');
  }

  /**
   * Create a single leave request
   */
  async create(overrides?: Partial<Leave>): Promise<Leave> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() + 7);

    const toDate = new Date(fromDate);
    toDate.setDate(toDate.getDate() + 4);

    const numberOfDays = 5;

    const data: any = {
      id: this.generateId(),
      employee_id: this.generateId(), // Will be overridden
      leave_type_id: this.generateId(), // Will be overridden
      from_date: fromDate,
      to_date: toDate,
      number_of_days: numberOfDays,
      reason: 'Personal leave',
      status: 'pending',
      approved_by: null,
      approval_date: null,
      rejection_reason: null,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };

    return this.insert(data);
  }

  /**
   * Create a leave request for a specific employee and leave type
   */
  async createForEmployee(
    employeeId: string,
    leaveTypeId: string,
    overrides?: Partial<Leave>
  ): Promise<Leave> {
    return this.create({
      employee_id: employeeId,
      leave_type_id: leaveTypeId,
      ...overrides,
    });
  }

  /**
   * Create an approved leave request
   */
  async createApproved(
    employeeId: string,
    leaveTypeId: string,
    approverId: string,
    overrides?: Partial<Leave>
  ): Promise<Leave> {
    return this.create({
      employee_id: employeeId,
      leave_type_id: leaveTypeId,
      status: 'approved',
      approved_by: approverId,
      approval_date: new Date(),
      ...overrides,
    });
  }

  /**
   * Create a rejected leave request
   */
  async createRejected(
    employeeId: string,
    leaveTypeId: string,
    approverId: string,
    reason: string = 'Not approved',
    overrides?: Partial<Leave>
  ): Promise<Leave> {
    return this.create({
      employee_id: employeeId,
      leave_type_id: leaveTypeId,
      status: 'rejected',
      approved_by: approverId,
      approval_date: new Date(),
      rejection_reason: reason,
      ...overrides,
    });
  }

  /**
   * Create multiple leave requests for an employee
   */
  async createManyForEmployee(employeeId: string, leaveTypeId: string, count: number): Promise<Leave[]> {
    const leaves: Leave[] = [];
    for (let i = 0; i < count; i++) {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() + 7 + i * 10);

      const toDate = new Date(fromDate);
      toDate.setDate(toDate.getDate() + 4);

      const leave = await this.createForEmployee(employeeId, leaveTypeId, {
        from_date: fromDate,
        to_date: toDate,
        number_of_days: 5,
      });
      leaves.push(leave);
    }
    return leaves;
  }
}
