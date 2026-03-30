import { Knex } from 'knex';
import { InsurancePlan, CreateInsurancePlanDTO, UpdateInsurancePlanDTO } from '../types/insurance';
import { v4 as uuidv4 } from 'uuid';

export class InsurancePlanRepository {
  constructor(private db: Knex) {}

  async createInsurancePlan(data: CreateInsurancePlanDTO): Promise<InsurancePlan> {
    const id = uuidv4();

    const [plan] = await this.db('insurance_plans')
      .insert({
        id,
        name: data.name,
        provider: data.provider,
        description: data.description,
        premium_amount: data.premium_amount,
        coverage_type: data.coverage_type,
        enrollment_start_date: data.enrollment_start_date,
        enrollment_end_date: data.enrollment_end_date,
        is_active: true,
      })
      .returning('*');

    return this.mapToInsurancePlan(plan);
  }

  async getInsurancePlanById(id: string): Promise<InsurancePlan | null> {
    const plan = await this.db('insurance_plans').where('id', id).first();
    return plan ? this.mapToInsurancePlan(plan) : null;
  }

  async getAllInsurancePlans(isActive?: boolean): Promise<InsurancePlan[]> {
    let query = this.db('insurance_plans');

    if (isActive !== undefined) {
      query = query.where('is_active', isActive);
    }

    const plans = await query.orderBy('created_at', 'desc');
    return plans.map((p) => this.mapToInsurancePlan(p));
  }

  async getActiveInsurancePlans(): Promise<InsurancePlan[]> {
    const plans = await this.db('insurance_plans')
      .where('is_active', true)
      .orderBy('created_at', 'desc');

    return plans.map((p) => this.mapToInsurancePlan(p));
  }

  async getInsurancePlansByType(coverageType: string): Promise<InsurancePlan[]> {
    const plans = await this.db('insurance_plans')
      .where('coverage_type', coverageType)
      .where('is_active', true)
      .orderBy('created_at', 'desc');

    return plans.map((p) => this.mapToInsurancePlan(p));
  }

  async updateInsurancePlan(id: string, data: UpdateInsurancePlanDTO): Promise<InsurancePlan> {
    const [plan] = await this.db('insurance_plans')
      .where('id', id)
      .update({
        ...data,
        updated_at: this.db.fn.now(),
      })
      .returning('*');

    return this.mapToInsurancePlan(plan);
  }

  async deleteInsurancePlan(id: string): Promise<void> {
    await this.db('insurance_plans').where('id', id).delete();
  }

  private mapToInsurancePlan(row: any): InsurancePlan {
    return {
      id: row.id,
      name: row.name,
      provider: row.provider,
      description: row.description,
      premium_amount: parseFloat(row.premium_amount),
      coverage_type: row.coverage_type,
      enrollment_start_date: new Date(row.enrollment_start_date),
      enrollment_end_date: new Date(row.enrollment_end_date),
      is_active: row.is_active,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
