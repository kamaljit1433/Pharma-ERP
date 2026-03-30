import { Knex } from 'knex';
import { FnFSettlement, CreateFnFSettlementDTO, UpdateFnFSettlementDTO } from '../types/separation';
import { v4 as uuidv4 } from 'uuid';

export class FnFSettlementRepository {
  constructor(private db: Knex) {}

  async createFnFSettlement(employeeId: string, data: CreateFnFSettlementDTO): Promise<FnFSettlement> {
    const id = uuidv4();

    const pendingSalary = data.pending_salary || 0;
    const leaveEncashment = data.leave_encashment || 0;
    const gratuity = data.gratuity || 0;
    const bonus = data.bonus || 0;
    const otherBenefits = data.other_benefits || 0;
    const totalEarnings = pendingSalary + leaveEncashment + gratuity + bonus + otherBenefits;

    const advanceDeduction = data.advance_deduction || 0;
    const assetDamageDeduction = data.asset_damage_deduction || 0;
    const otherDeductions = data.other_deductions || 0;
    const totalDeductions = advanceDeduction + assetDamageDeduction + otherDeductions;

    const netSettlement = totalEarnings - totalDeductions;

    const [settlement] = await this.db('fnf_settlements')
      .insert({
        id,
        employee_id: employeeId,
        pending_salary: pendingSalary,
        leave_encashment: leaveEncashment,
        gratuity,
        bonus,
        other_benefits: otherBenefits,
        total_earnings: totalEarnings,
        advance_deduction: advanceDeduction,
        asset_damage_deduction: assetDamageDeduction,
        other_deductions: otherDeductions,
        total_deductions: totalDeductions,
        net_settlement: netSettlement,
        status: 'draft',
      })
      .returning('*');

    return settlement;
  }

  async getFnFSettlement(id: string): Promise<FnFSettlement | null> {
    return this.db('fnf_settlements').where('id', id).first();
  }

  async getFnFSettlementByEmployeeId(employeeId: string): Promise<FnFSettlement | null> {
    return this.db('fnf_settlements')
      .where('employee_id', employeeId)
      .orderBy('created_at', 'desc')
      .first();
  }

  async updateFnFSettlement(id: string, data: UpdateFnFSettlementDTO): Promise<FnFSettlement> {
    // Recalculate totals if any amounts are updated
    const current = await this.getFnFSettlement(id);
    if (!current) throw new Error('FnF Settlement not found');

    const pendingSalary = data.pending_salary ?? current.pending_salary;
    const leaveEncashment = data.leave_encashment ?? current.leave_encashment;
    const gratuity = data.gratuity ?? current.gratuity;
    const bonus = data.bonus ?? current.bonus;
    const otherBenefits = data.other_benefits ?? current.other_benefits;
    const totalEarnings = pendingSalary + leaveEncashment + gratuity + bonus + otherBenefits;

    const advanceDeduction = data.advance_deduction ?? current.advance_deduction;
    const assetDamageDeduction = data.asset_damage_deduction ?? current.asset_damage_deduction;
    const otherDeductions = data.other_deductions ?? current.other_deductions;
    const totalDeductions = advanceDeduction + assetDamageDeduction + otherDeductions;

    const netSettlement = totalEarnings - totalDeductions;

    const [settlement] = await this.db('fnf_settlements')
      .where('id', id)
      .update({
        pending_salary: pendingSalary,
        leave_encashment: leaveEncashment,
        gratuity,
        bonus,
        other_benefits: otherBenefits,
        total_earnings: totalEarnings,
        advance_deduction: advanceDeduction,
        asset_damage_deduction: assetDamageDeduction,
        other_deductions: otherDeductions,
        total_deductions: totalDeductions,
        net_settlement: netSettlement,
        status: data.status ?? current.status,
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return settlement;
  }

  async approveFnFSettlement(id: string, approvedBy: string): Promise<FnFSettlement> {
    const [settlement] = await this.db('fnf_settlements')
      .where('id', id)
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: this.db.fn.now(),
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return settlement;
  }

  async markFnFSettlementAsPaid(id: string): Promise<FnFSettlement> {
    const [settlement] = await this.db('fnf_settlements')
      .where('id', id)
      .update({
        status: 'paid',
        paid_at: this.db.fn.now(),
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return settlement;
  }

  async getFnFSettlementsByStatus(status: string): Promise<FnFSettlement[]> {
    return this.db('fnf_settlements')
      .where('status', status)
      .orderBy('created_at', 'desc');
  }

  async getAllFnFSettlements(limit: number = 50, offset: number = 0): Promise<FnFSettlement[]> {
    return this.db('fnf_settlements')
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');
  }

  async getFnFSettlementCount(): Promise<number> {
    const result = await this.db('fnf_settlements')
      .count('id as count')
      .first();
    return Number(result?.['count'] || 0);
  }
}
