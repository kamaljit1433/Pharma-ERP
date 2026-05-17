import { Knex } from 'knex';
import { RewardRepository } from '../repositories/rewardRepository';
import {
  Reward,
  RewardNomination,
  CreateRewardDTO,
  UpdateRewardDTO,
  CreateRewardNominationDTO,
  ApproveRewardNominationDTO,
  RejectRewardNominationDTO,
  RewardFilter,
  RewardCategory,
} from '../types/benefits';

export class RewardService {
  private rewardRepository: RewardRepository;

  constructor(private knex: Knex) {
    this.rewardRepository = new RewardRepository(knex);
  }

  // Reward Category Management
  getRewardCategories(): RewardCategory[] {
    return ['performance', 'attendance', 'innovation', 'teamwork'];
  }

  getCategoryDescription(category: RewardCategory): string {
    const descriptions: Record<RewardCategory, string> = {
      performance: 'Exceptional performance and results',
      attendance: 'Perfect or excellent attendance record',
      innovation: 'Creative ideas and innovative solutions',
      teamwork: 'Outstanding collaboration and teamwork',
    };
    return descriptions[category];
  }

  // Reward Management
  async awardReward(data: CreateRewardDTO): Promise<Reward> {
    // Validate category
    if (!this.getRewardCategories().includes(data.category as any)) {
      throw new Error(`Invalid reward category: ${data.category}`);
    }

    // Validate employee exists
    const employee = await this.knex('employees').where({ id: data.employee_id }).first();
    if (!employee) {
      throw new Error(`Employee not found: ${data.employee_id}`);
    }

    // Validate awarded_by if provided
    if (data.awarded_by) {
      const awarder = await this.knex('employees').where({ id: data.awarded_by }).first();
      if (!awarder) {
        throw new Error(`Awarder not found: ${data.awarded_by}`);
      }
    }

    const reward = await this.rewardRepository.createReward({
      employee_id: data.employee_id,
      category: data.category,
      title: data.title,
      description: data.description || null,
      awarded_by: data.awarded_by || null,
      awarded_date: data.awarded_date,
      is_public: data.is_public !== false,
    });

    return reward;
  }

  async getReward(id: string): Promise<Reward | null> {
    return this.rewardRepository.getRewardById(id);
  }

  async getEmployeeRewards(employeeId: string): Promise<Reward[]> {
    return this.rewardRepository.getRewardsByEmployee(employeeId);
  }

  async getAllRewards(): Promise<Reward[]> {
    return this.rewardRepository.getAllRewards();
  }

  async getPublicRewards(): Promise<Reward[]> {
    return this.rewardRepository.getPublicRewards();
  }

  async getRewardsByCategory(category: RewardCategory): Promise<Reward[]> {
    if (!this.getRewardCategories().includes(category)) {
      throw new Error(`Invalid reward category: ${category}`);
    }
    return this.rewardRepository.getRewardsByCategory(category);
  }

  async getRewardsByDateRange(fromDate: Date, toDate: Date): Promise<Reward[]> {
    if (fromDate > toDate) {
      throw new Error('From date must be before to date');
    }
    return this.rewardRepository.getRewardsByDateRange(fromDate, toDate);
  }

  async searchRewards(filters: RewardFilter): Promise<Reward[]> {
    if (filters.category && !this.getRewardCategories().includes(filters.category)) {
      throw new Error(`Invalid reward category: ${filters.category}`);
    }

    if (filters.from_date && filters.to_date && filters.from_date > filters.to_date) {
      throw new Error('From date must be before to date');
    }

    return this.rewardRepository.searchRewards(filters);
  }

  async updateReward(id: string, data: UpdateRewardDTO): Promise<Reward> {
    const reward = await this.rewardRepository.getRewardById(id);
    if (!reward) {
      throw new Error(`Reward not found: ${id}`);
    }

    if (data.category && !this.getRewardCategories().includes(data.category as any)) {
      throw new Error(`Invalid reward category: ${data.category}`);
    }

    return this.rewardRepository.updateReward(id, data);
  }

  async deleteReward(id: string): Promise<void> {
    const reward = await this.rewardRepository.getRewardById(id);
    if (!reward) {
      throw new Error(`Reward not found: ${id}`);
    }

    await this.rewardRepository.deleteReward(id);
  }

  // Reward Nomination and Approval Workflow
  async nominateReward(data: CreateRewardNominationDTO): Promise<RewardNomination> {
    // Validate category
    if (!this.getRewardCategories().includes(data.category)) {
      throw new Error(`Invalid reward category: ${data.category}`);
    }

    // Validate employee exists
    const employee = await this.knex('employees').where({ id: data.employee_id }).first();
    if (!employee) {
      throw new Error(`Employee not found: ${data.employee_id}`);
    }

    // Validate nominator exists
    const nominator = await this.knex('employees').where({ id: data.nominated_by }).first();
    if (!nominator) {
      throw new Error(`Nominator not found: ${data.nominated_by}`);
    }

    // Prevent self-nomination
    if (data.employee_id === data.nominated_by) {
      throw new Error('Employees cannot nominate themselves');
    }

    return this.rewardRepository.createNomination(data);
  }

  async getNomination(id: string): Promise<RewardNomination | null> {
    return this.rewardRepository.getNominationById(id);
  }

  async getPendingNominations(): Promise<RewardNomination[]> {
    return this.rewardRepository.getPendingNominations();
  }

  async getNominationsByEmployee(employeeId: string): Promise<RewardNomination[]> {
    return this.rewardRepository.getNominationsByEmployee(employeeId);
  }

  async getNominationsByNominator(nominatorId: string): Promise<RewardNomination[]> {
    return this.rewardRepository.getNominationsByNominator(nominatorId);
  }

  async approveNomination(
    nominationId: string,
    data: ApproveRewardNominationDTO
  ): Promise<{ nomination: RewardNomination; reward: Reward }> {
    const nomination = await this.rewardRepository.getNominationById(nominationId);
    if (!nomination) {
      throw new Error(`Nomination not found: ${nominationId}`);
    }

    if (nomination.status !== 'pending') {
      throw new Error(`Cannot approve nomination with status: ${nomination.status}`);
    }

    // Validate approver exists
    const approver = await this.knex('employees').where({ id: data.approved_by }).first();
    if (!approver) {
      throw new Error(`Approver not found: ${data.approved_by}`);
    }

    // Approve nomination
    const approvedNomination = await this.rewardRepository.approveNomination(
      nominationId,
      data.approved_by,
      data.approval_notes
    );

    // Create reward from approved nomination
    const reward = await this.rewardRepository.createReward({
      employee_id: nomination.employee_id,
      category: nomination.category,
      title: nomination.title,
      description: nomination.description,
      awarded_by: data.approved_by,
      awarded_date: new Date(),
      is_public: true,
    });

    return { nomination: approvedNomination, reward };
  }

  async rejectNomination(
    nominationId: string,
    data: RejectRewardNominationDTO
  ): Promise<RewardNomination> {
    const nomination = await this.rewardRepository.getNominationById(nominationId);
    if (!nomination) {
      throw new Error(`Nomination not found: ${nominationId}`);
    }

    if (nomination.status !== 'pending') {
      throw new Error(`Cannot reject nomination with status: ${nomination.status}`);
    }

    // Validate approver exists
    const approver = await this.knex('employees').where({ id: data.approved_by }).first();
    if (!approver) {
      throw new Error(`Approver not found: ${data.approved_by}`);
    }

    return this.rewardRepository.rejectNomination(nominationId, data.approved_by, data.approval_notes);
  }

  // Reward Statistics
  async getRewardStatistics(employeeId?: string): Promise<{
    total_rewards: number;
    by_category: Record<RewardCategory, number>;
    recent_rewards: Reward[];
  }> {
    let query = this.knex('rewards');

    if (employeeId) {
      query = query.where('employee_id', employeeId);
    }

    const rewards = await query;

    const byCategory: Record<RewardCategory, number> = {
      performance: 0,
      attendance: 0,
      innovation: 0,
      teamwork: 0,
    };

    rewards.forEach((r) => {
      byCategory[r.category as RewardCategory]++;
    });

    const recentRewards = rewards
      .sort((a, b) => new Date(b.awarded_date).getTime() - new Date(a.awarded_date).getTime())
      .slice(0, 5)
      .map((r) => this.rewardRepository['mapToReward'](r));

    return {
      total_rewards: rewards.length,
      by_category: byCategory,
      recent_rewards: recentRewards,
    };
  }

  async getTopRewardedEmployees(limit: number = 10): Promise<
    Array<{
      employee_id: string;
      employee_name: string;
      reward_count: number;
    }>
  > {
    const results = await this.knex('rewards')
      .join('employees', 'rewards.employee_id', 'employees.id')
      .select(
        'rewards.employee_id',
        this.knex.raw("employees.first_name || ' ' || employees.last_name as employee_name"),
        this.knex.raw('COUNT(*) as reward_count')
      )
      .groupBy('rewards.employee_id', 'employees.id')
      .orderBy('reward_count', 'desc')
      .limit(limit);

    return results.map((r) => ({
      employee_id: r.employee_id,
      employee_name: r.employee_name,
      reward_count: parseInt(r.reward_count),
    }));
  }
}
