import { Knex } from 'knex';
import { LeaveBalance } from '../types/leave';

export class LeaveBalanceRepository {
  constructor(private knex: Knex) {}

  async getBalance(
    employeeId: string,
    leaveTypeId: string,
    year: number
  ): Promise<LeaveBalance | null> {
    return this.knex('leave_balances')
      .where({
        employee_id: employeeId,
        leave_type_id: leaveTypeId,
        year,
      })
      .first();
  }

  async getBalancesByEmployee(
    employeeId: string,
    year: number
  ): Promise<LeaveBalance[]> {
    return this.knex('leave_balances')
      .leftJoin('leave_types', 'leave_balances.leave_type_id', 'leave_types.id')
      .select('leave_balances.*', 'leave_types.name as leave_type_name')
      .where({
        'leave_balances.employee_id': employeeId,
        'leave_balances.year': year,
      })
      .orderBy('leave_balances.created_at');
  }

  async createBalance(data: Partial<LeaveBalance>): Promise<LeaveBalance> {
    const [balance] = await this.knex('leave_balances')
      .insert({
        employee_id: data.employee_id,
        leave_type_id: data.leave_type_id,
        year: data.year,
        opening_balance: data.opening_balance || 0,
        used_balance: 0,
        carry_forward_balance: data.carry_forward_balance || 0,
        available_balance:
          (data.opening_balance || 0) + (data.carry_forward_balance || 0),
      })
      .returning('*');

    return balance;
  }

  async updateBalance(
    id: string,
    updates: Partial<LeaveBalance>
  ): Promise<LeaveBalance> {
    const [balance] = await this.knex('leave_balances')
      .where({ id })
      .update({
        ...updates,
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return balance;
  }

  async deductBalance(
    employeeId: string,
    leaveTypeId: string,
    year: number,
    days: number
  ): Promise<LeaveBalance> {
    const balance = await this.getBalance(employeeId, leaveTypeId, year);

    if (!balance) {
      throw new Error('Leave balance not found');
    }

    if (Number(balance.available_balance) < days) {
      throw new Error('Insufficient leave balance');
    }

    const newUsedBalance = Number(balance.used_balance) + days;
    const newAvailableBalance = Number(balance.available_balance) - days;

    return this.updateBalance(balance.id, {
      used_balance: newUsedBalance,
      available_balance: newAvailableBalance,
    });
  }

  async addCarryForward(
    employeeId: string,
    leaveTypeId: string,
    year: number,
    carryForwardDays: number
  ): Promise<LeaveBalance> {
    const balance = await this.getBalance(employeeId, leaveTypeId, year);

    if (!balance) {
      throw new Error('Leave balance not found');
    }

    const newCarryForward = Number(balance.carry_forward_balance) + carryForwardDays;
    const newAvailableBalance = Number(balance.available_balance) + carryForwardDays;

    return this.updateBalance(balance.id, {
      carry_forward_balance: newCarryForward,
      available_balance: newAvailableBalance,
    });
  }

  async initializeBalancesForEmployee(
    employeeId: string,
    year: number
  ): Promise<LeaveBalance[]> {
    const leaveTypes = await this.knex('leave_types').where({ is_active: true });

    const balances: LeaveBalance[] = [];

    for (const leaveType of leaveTypes) {
      const existingBalance = await this.getBalance(
        employeeId,
        leaveType.id,
        year
      );

      if (!existingBalance) {
        const balance = await this.createBalance({
          employee_id: employeeId,
          leave_type_id: leaveType.id,
          year,
          opening_balance: leaveType.annual_limit,
          carry_forward_balance: 0,
        });
        balances.push(balance);
      } else {
        balances.push(existingBalance);
      }
    }

    return balances;
  }
}
