import { Knex } from 'knex';
import { Reward, RewardNomination, RewardFilter, RewardCategory } from '../types/benefits';

export class RewardRepository {
  constructor(private knex: Knex) {}

  // Reward CRUD Operations
  async createReward(data: {
    employee_id: string;
    category: RewardCategory;
    title: string;
    description?: string | null;
    awarded_by?: string | null;
    awarded_date: Date;
    is_public: boolean;
  }): Promise<Reward> {
    const [reward] = await this.knex('rewards')
      .insert({
        ...data,
        created_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.mapToReward(reward);
  }

  async getRewardById(id: string): Promise<Reward | null> {
    const reward = await this.knex('rewards').where({ id }).first();
    return reward ? this.mapToReward(reward) : null;
  }

  async getRewardsByEmployee(employeeId: string): Promise<Reward[]> {
    const rewards = await this.knex('rewards')
      .where({ employee_id: employeeId })
      .orderBy('awarded_date', 'desc');

    return rewards.map((r) => this.mapToReward(r));
  }

  async getPublicRewards(): Promise<Reward[]> {
    const rewards = await this.knex('rewards')
      .where({ is_public: true })
      .orderBy('awarded_date', 'desc');

    return rewards.map((r) => this.mapToReward(r));
  }

  async getRewardsByCategory(category: RewardCategory): Promise<Reward[]> {
    const rewards = await this.knex('rewards')
      .where({ category })
      .orderBy('awarded_date', 'desc');

    return rewards.map((r) => this.mapToReward(r));
  }

  async getRewardsByDateRange(fromDate: Date, toDate: Date): Promise<Reward[]> {
    const rewards = await this.knex('rewards')
      .whereBetween('awarded_date', [fromDate, toDate])
      .orderBy('awarded_date', 'desc');

    return rewards.map((r) => this.mapToReward(r));
  }

  async searchRewards(filters: RewardFilter): Promise<Reward[]> {
    let query = this.knex('rewards');

    if (filters.employee_id) {
      query = query.where('employee_id', filters.employee_id);
    }

    if (filters.category) {
      query = query.where('category', filters.category);
    }

    if (filters.is_public !== undefined) {
      query = query.where('is_public', filters.is_public);
    }

    if (filters.from_date && filters.to_date) {
      query = query.whereBetween('awarded_date', [filters.from_date, filters.to_date]);
    }

    const rewards = await query.orderBy('awarded_date', 'desc');
    return rewards.map((r) => this.mapToReward(r));
  }

  async updateReward(
    id: string,
    data: Partial<{
      category: RewardCategory;
      title: string;
      description: string | null;
      is_public: boolean;
    }>
  ): Promise<Reward> {
    const [updated] = await this.knex('rewards')
      .where({ id })
      .update(data)
      .returning('*');

    return this.mapToReward(updated);
  }

  async deleteReward(id: string): Promise<void> {
    await this.knex('rewards').where({ id }).delete();
  }

  // Reward Nomination Operations
  async createNomination(data: {
    employee_id: string;
    nominated_by: string;
    category: RewardCategory;
    title: string;
    description: string;
  }): Promise<RewardNomination> {
    const [nomination] = await this.knex('reward_nominations')
      .insert({
        ...data,
        status: 'pending',
        created_at: this.knex.fn.now(),
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.mapToNomination(nomination);
  }

  async getNominationById(id: string): Promise<RewardNomination | null> {
    const nomination = await this.knex('reward_nominations').where({ id }).first();
    return nomination ? this.mapToNomination(nomination) : null;
  }

  async getPendingNominations(): Promise<RewardNomination[]> {
    const nominations = await this.knex('reward_nominations')
      .where({ status: 'pending' })
      .orderBy('created_at', 'desc');

    return nominations.map((n) => this.mapToNomination(n));
  }

  async getNominationsByEmployee(employeeId: string): Promise<RewardNomination[]> {
    const nominations = await this.knex('reward_nominations')
      .where({ employee_id: employeeId })
      .orderBy('created_at', 'desc');

    return nominations.map((n) => this.mapToNomination(n));
  }

  async getNominationsByNominator(nominatorId: string): Promise<RewardNomination[]> {
    const nominations = await this.knex('reward_nominations')
      .where({ nominated_by: nominatorId })
      .orderBy('created_at', 'desc');

    return nominations.map((n) => this.mapToNomination(n));
  }

  async getNominationsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<RewardNomination[]> {
    const nominations = await this.knex('reward_nominations')
      .where({ status })
      .orderBy('created_at', 'desc');

    return nominations.map((n) => this.mapToNomination(n));
  }

  async approveNomination(
    id: string,
    approverId: string,
    approvalNotes?: string
  ): Promise<RewardNomination> {
    const [updated] = await this.knex('reward_nominations')
      .where({ id })
      .update({
        status: 'approved',
        approved_by: approverId,
        approval_notes: approvalNotes || null,
        approved_at: this.knex.fn.now(),
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.mapToNomination(updated);
  }

  async rejectNomination(
    id: string,
    approverId: string,
    approvalNotes: string
  ): Promise<RewardNomination> {
    const [updated] = await this.knex('reward_nominations')
      .where({ id })
      .update({
        status: 'rejected',
        approved_by: approverId,
        approval_notes: approvalNotes,
        approved_at: this.knex.fn.now(),
        updated_at: this.knex.fn.now(),
      })
      .returning('*');

    return this.mapToNomination(updated);
  }

  async deleteNomination(id: string): Promise<void> {
    await this.knex('reward_nominations').where({ id }).delete();
  }

  // Helper methods
  private mapToReward(row: any): Reward {
    return {
      id: row.id,
      employee_id: row.employee_id,
      category: row.category,
      title: row.title,
      description: row.description || null,
      awarded_by: row.awarded_by || null,
      awarded_date: new Date(row.awarded_date),
      is_public: row.is_public,
      created_at: new Date(row.created_at),
    };
  }

  private mapToNomination(row: any): RewardNomination {
    return {
      id: row.id,
      employee_id: row.employee_id,
      nominated_by: row.nominated_by,
      category: row.category,
      title: row.title,
      description: row.description,
      status: row.status,
      approved_by: row.approved_by || null,
      approval_notes: row.approval_notes || null,
      approved_at: row.approved_at ? new Date(row.approved_at) : (undefined as any),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
