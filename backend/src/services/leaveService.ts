import { Knex } from 'knex';
import { LeaveRepository } from '../repositories/leaveRepository';
import { LeaveBalanceRepository } from '../repositories/leaveBalanceRepository';
import { ApprovalRoutingService } from './approvalRoutingService';
import {
  Leave,
  LeaveApplicationDTO,
  LeaveBalance,
  LeaveCalendarEntry,
} from '../types/leave';

export class LeaveService {
  private leaveRepository: LeaveRepository;
  private leaveBalanceRepository: LeaveBalanceRepository;
  private approvalRoutingService: ApprovalRoutingService;

  constructor(private knex: Knex) {
    this.leaveRepository = new LeaveRepository(knex);
    this.leaveBalanceRepository = new LeaveBalanceRepository(knex);
    this.approvalRoutingService = new ApprovalRoutingService(knex);
  }

  async applyLeave(data: LeaveApplicationDTO): Promise<Leave> {
    const year = new Date(data.from_date).getFullYear();

    // Validate balance
    const balance = await this.leaveBalanceRepository.getBalance(
      data.employee_id,
      data.leave_type_id,
      year
    );

    if (!balance) {
      throw new Error('Leave balance not initialized for this year');
    }

    const daysRequested = this.calculateDays(data.from_date, data.to_date);

    if (balance.available_balance < daysRequested) {
      throw new Error(
        `Insufficient leave balance. Available: ${balance.available_balance}, Requested: ${daysRequested}`
      );
    }

    // Check for overlapping leaves
    const overlappingLeaves = await this.leaveRepository.getLeavesByDateRange(
      data.from_date,
      data.to_date,
      data.employee_id
    );

    if (overlappingLeaves.length > 0) {
      throw new Error('Leave already exists for the requested dates');
    }

    // Create leave request
    const leave = await this.leaveRepository.createLeave(data);

    // Route approval through hierarchy
    try {
      await this.approvalRoutingService.routeApprovalRequest({
        requestType: 'leave',
        requestId: leave.id,
        employeeId: data.employee_id,
        requestData: leave,
      });
    } catch (error) {
      // Log error but don't fail the leave creation
      console.error('Failed to route leave approval:', error);
    }

    return leave;
  }

  async approveLeave(requestId: string, approverId: string): Promise<void> {
    const leave = await this.leaveRepository.getLeaveById(requestId);

    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.status !== 'pending') {
      throw new Error('Only pending leave requests can be approved');
    }

    const year = new Date(leave.from_date).getFullYear();

    // Deduct from balance
    await this.leaveBalanceRepository.deductBalance(
      leave.employee_id,
      leave.leave_type_id,
      year,
      leave.days_count
    );

    // Update leave status
    await this.leaveRepository.updateLeaveStatus(
      requestId,
      'approved',
      approverId
    );
  }

  async rejectLeave(
    requestId: string,
    approverId: string,
    reason: string
  ): Promise<void> {
    const leave = await this.leaveRepository.getLeaveById(requestId);

    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.status !== 'pending') {
      throw new Error('Only pending leave requests can be rejected');
    }

    await this.leaveRepository.updateLeaveStatus(
      requestId,
      'rejected',
      approverId,
      reason
    );
  }

  async getLeaveBalance(
    employeeId: string,
    year: number
  ): Promise<LeaveBalance[]> {
    return this.leaveBalanceRepository.getBalancesByEmployee(employeeId, year);
  }

  async getTeamLeaveCalendar(managerId: string): Promise<LeaveCalendarEntry[]> {
    const year = new Date().getFullYear();
    const leaves = await this.leaveRepository.getTeamLeaves(managerId, year);

    const entries: LeaveCalendarEntry[] = [];

    for (const leave of leaves) {
      const employee = await this.knex('employees')
        .where({ id: leave.employee_id })
        .first();

      const leaveType = await this.knex('leave_types')
        .where({ id: leave.leave_type_id })
        .first();

      entries.push({
        employee_id: leave.employee_id,
        employee_name: `${employee.first_name} ${employee.last_name}`,
        from_date: leave.from_date,
        to_date: leave.to_date,
        leave_type: leaveType.name,
        status: leave.status,
      });
    }

    return entries;
  }

  async applyCarryForwardRules(year: number): Promise<void> {
    const previousYear = year - 1;

    // Get all employees
    const employees = await this.knex('employees').where({ status: 'active' });

    // Get all leave types with carry-forward rules
    const leaveTypes = await this.knex('leave_types')
      .where('carry_forward_limit', '>', 0)
      .where({ is_active: true });

    for (const employee of employees) {
      for (const leaveType of leaveTypes) {
        const previousBalance =
          await this.leaveBalanceRepository.getBalance(
            employee.id,
            leaveType.id,
            previousYear
          );

        if (previousBalance) {
          const carryForwardDays = Math.min(
            previousBalance.available_balance,
            leaveType.carry_forward_limit
          );

          if (carryForwardDays > 0) {
            // Initialize balance for new year if not exists
            let currentBalance =
              await this.leaveBalanceRepository.getBalance(
                employee.id,
                leaveType.id,
                year
              );

            if (!currentBalance) {
              currentBalance = await this.leaveBalanceRepository.createBalance({
                employee_id: employee.id,
                leave_type_id: leaveType.id,
                year,
                opening_balance: leaveType.annual_limit,
                carry_forward_balance: carryForwardDays,
              });
            } else {
              await this.leaveBalanceRepository.addCarryForward(
                employee.id,
                leaveType.id,
                year,
                carryForwardDays
              );
            }
          }
        }
      }
    }
  }

  async initializeLeaveBalances(employeeId: string, year: number): Promise<void> {
    await this.leaveBalanceRepository.initializeBalancesForEmployee(
      employeeId,
      year
    );
  }

  private calculateDays(fromDate: string, toDate: string): number {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const diffTime = Math.abs(to.getTime() - from.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
}
