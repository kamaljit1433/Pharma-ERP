import { Knex } from 'knex';
import { ReviewCycle, CreateReviewCycleDTO } from '../types/performance';

export class ReviewCycleRepository {
  constructor(private db: Knex) {}

  async createReviewCycle(data: CreateReviewCycleDTO & { createdBy: string }): Promise<ReviewCycle> {
    const ids = await this.db('review_cycles').insert({
      name: data.name,
      start_date: data.startDate,
      end_date: data.endDate,
      self_review_deadline: data.selfReviewDeadline,
      manager_review_deadline: data.managerReviewDeadline,
      peer_review_deadline: data.peerReviewDeadline,
      status: 'Planning',
      created_by: data.createdBy,
      created_at: new Date(),
    });

    const id = Array.isArray(ids) ? ids[0] : ids;
    if (!id) {
      throw new Error('Failed to create review cycle');
    }
    return this.getReviewCycleById(id.toString()) as Promise<ReviewCycle>;
  }

  async getReviewCycleById(id: string): Promise<ReviewCycle | null> {
    const cycle = await this.db('review_cycles').where('id', id).first();

    if (!cycle) {
      return null;
    }

    return this.mapReviewCycle(cycle);
  }

  async getAllReviewCycles(): Promise<ReviewCycle[]> {
    const cycles = await this.db('review_cycles').orderBy('created_at', 'desc');
    return cycles.map((cycle) => this.mapReviewCycle(cycle));
  }

  async getActiveReviewCycles(): Promise<ReviewCycle[]> {
    const cycles = await this.db('review_cycles')
      .where('status', 'Active')
      .orderBy('created_at', 'desc');
    return cycles.map((cycle) => this.mapReviewCycle(cycle));
  }

  async updateReviewCycleStatus(id: string, status: string): Promise<void> {
    await this.db('review_cycles').where('id', id).update({
      status,
      updated_at: new Date(),
    });
  }

  async updateReviewCycle(
    id: string,
    data: Partial<CreateReviewCycleDTO>
  ): Promise<ReviewCycle | null> {
    const updateData: any = {};

    if (data.name) updateData.name = data.name;
    if (data.startDate) updateData.start_date = data.startDate;
    if (data.endDate) updateData.end_date = data.endDate;
    if (data.selfReviewDeadline) updateData.self_review_deadline = data.selfReviewDeadline;
    if (data.managerReviewDeadline) updateData.manager_review_deadline = data.managerReviewDeadline;
    if (data.peerReviewDeadline) updateData.peer_review_deadline = data.peerReviewDeadline;

    updateData.updated_at = new Date();

    await this.db('review_cycles').where('id', id).update(updateData);

    return this.getReviewCycleById(id);
  }

  async deleteReviewCycle(id: string): Promise<void> {
    await this.db('review_cycles').where('id', id).delete();
  }

  private mapReviewCycle(dbCycle: any): ReviewCycle {
    return {
      id: dbCycle.id,
      name: dbCycle.name,
      startDate: new Date(dbCycle.start_date),
      endDate: new Date(dbCycle.end_date),
      selfReviewDeadline: new Date(dbCycle.self_review_deadline),
      managerReviewDeadline: new Date(dbCycle.manager_review_deadline),
      peerReviewDeadline: new Date(dbCycle.peer_review_deadline),
      status: dbCycle.status,
      createdAt: new Date(dbCycle.created_at),
      createdBy: dbCycle.created_by,
    };
  }
}
