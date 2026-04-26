import { Knex } from 'knex';
import logger from '../utils/logger';
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

    if (new Date(data.from_date) > new Date(data.to_date)) {
      throw new Error('From date must be before or equal to To date');
    }

    // Convert string employee_id (e.g., "EMP-ADM-001") to UUID if needed
    let employeeUUID = data.employee_id;
    if (!employeeUUID.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      // It's a string employee_id, convert to UUID
      const employee = await this.knex('employees')
        .where('employee_id', employeeUUID)
        .first();

      if (!employee) {
        throw new Error(`Employee not found: ${employeeUUID}`);
      }
      employeeUUID = employee.id;
    }

    // Validate balance
    const balance = await this.leaveBalanceRepository.getBalance(
      employeeUUID,
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
      employeeUUID
    );

    if (overlappingLeaves.length > 0) {
      throw new Error('Leave already exists for the requested dates');
    }

    // Create leave request with UUID
    const leave = await this.leaveRepository.createLeave({
      ...data,
      employee_id: employeeUUID,
    });

    // Route approval through hierarchy
    try {
      await this.approvalRoutingService.routeApprovalRequest({
        requestType: 'leave',
        requestId: leave.id,
        employeeId: employeeUUID,
        requestData: leave,
      });
    } catch (error) {
      // Log error but don't fail the leave creation
      logger.error('Failed to route leave approval', { error: error instanceof Error ? error.message : String(error) });
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

    await this.knex.transaction(async (trx) => {
      const trxLeaveBalanceRepo = new LeaveBalanceRepository(trx);
      const trxLeaveRepo = new LeaveRepository(trx);

      // Re-validate balance at approval time to prevent race conditions
      const currentBalance = await trxLeaveBalanceRepo.getBalance(
        leave.employee_id,
        leave.leave_type_id,
        year
      );

      if (!currentBalance || currentBalance.available_balance < leave.days_count) {
        throw new Error('Insufficient leave balance at time of approval');
      }

      // Deduct from balance
      await trxLeaveBalanceRepo.deductBalance(
        leave.employee_id,
        leave.leave_type_id,
        year,
        leave.days_count
      );

      // Update leave status
      await trxLeaveRepo.updateLeaveStatus(
        requestId,
        'approved',
        approverId
      );
    });
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
    // Accept either the UUID (id) or the business employee_id string (e.g. "EMP001")
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(employeeId);
    const employee = await this.knex('employees')
      .where(isUuid ? 'id' : 'employee_id', employeeId)
      .first();

    if (!employee) {
      throw new Error(`Employee not found: ${employeeId}`);
    }

    return this.leaveBalanceRepository.getBalancesByEmployee(employee.id, year);
  }

  async getLeaves(filters?: {
    status?: string;
    employeeId?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<Leave[]> {
    return this.leaveRepository.getLeaves(filters);
  }

  async getPendingLeaves(managerId?: string): Promise<Leave[]> {
    return this.leaveRepository.getPendingLeaves(managerId);
  }

  async cancelLeave(id: string): Promise<void> {
    const leave = await this.leaveRepository.getLeaveById(id);

    if (!leave) {
      throw new Error('Leave request not found');
    }

    if (leave.status === 'cancelled') {
      throw new Error('Leave request is already cancelled');
    }

    if (leave.status === 'rejected') {
      throw new Error('Cannot cancel a rejected leave request');
    }

    if (leave.status === 'approved') {
      const startDate = new Date(leave.from_date);
      if (startDate <= new Date()) {
        throw new Error('Cannot cancel an approved leave that has already started');
      }
    }

    await this.leaveRepository.cancelLeave(id);
  }

  async getTeamLeaveCalendar(managerId: string): Promise<LeaveCalendarEntry[]> {
    const leaves = await this.leaveRepository.getTeamLeaves(managerId);

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
        employee_name: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee',
        from_date: leave.from_date,
        to_date: leave.to_date,
        leave_type: leaveType ? leaveType.name : 'Unknown Leave Type',
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
    // Convert string employee_id (e.g., "EMP-ADM-001") to UUID
    const employee = await this.knex('employees')
      .where('employee_id', employeeId)
      .first();

    if (!employee) {
      throw new Error(`Employee not found: ${employeeId}`);
    }

    await this.leaveBalanceRepository.initializeBalancesForEmployee(
      employee.id,
      year
    );
  }

  private calculateDays(fromDate: string, toDate: string): number {
    // Use UTC to prevent timezone-related off-by-one errors
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const fromUTC = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
    const toUTC = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
    const diffTime = Math.abs(toUTC - fromUTC);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }
}
