import { Knex } from 'knex';

export interface ReviewCycle {
  id: string;
  name: string;
  start_date: Date;
  end_date: Date;
  self_review_deadline?: Date;
  manager_review_deadline?: Date;
  peer_review_deadline?: Date;
  status: string;
  createdBy?: string;
  createdAt?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateReviewCycleData {
  name: string;
  start_date: Date;
  end_date: Date;
  self_review_deadline?: Date;
  manager_review_deadline?: Date;
  peer_review_deadline?: Date;
  status?: string;
  created_by?: string;
}

export interface CreateReviewCycleLegacyDTO {
  name: string;
  startDate: Date;
  endDate: Date;
  selfReviewDeadline?: Date;
  managerReviewDeadline?: Date;
  peerReviewDeadline?: Date;
  createdBy?: string;
}

export class ReviewCycleRepository {
  constructor(private db: Knex) {}

  async createCycle(data: CreateReviewCycleData): Promise<ReviewCycle> {
    const insertData: any = {
      name: data.name,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status || 'Planning',
      created_at: new Date(),
    };
    if (data.self_review_deadline) insertData.self_review_deadline = data.self_review_deadline;
    if (data.manager_review_deadline) insertData.manager_review_deadline = data.manager_review_deadline;
    if (data.peer_review_deadline) insertData.peer_review_deadline = data.peer_review_deadline;
    if (data.created_by) insertData.created_by = data.created_by;

    const rows = await this.db('review_cycles').insert(insertData).returning('id');

    const id = Array.isArray(rows) ? (rows[0]?.id ?? rows[0]) : rows;
    if (!id) {
      throw new Error('Failed to create review cycle');
    }
    return this.getCycleById(id.toString()) as Promise<ReviewCycle>;
  }

  async getCycleById(id: string): Promise<ReviewCycle | null> {
    const cycle = await this.db('review_cycles').where('id', id).first();
    if (!cycle) return null;
    return this.mapCycle(cycle);
  }

  async getCycleByName(name: string): Promise<ReviewCycle | null> {
    const cycle = await this.db('review_cycles').where('name', name).first();
    if (!cycle) return null;
    return this.mapCycle(cycle);
  }

  async getAllCycles(): Promise<ReviewCycle[]> {
    const cycles = await this.db('review_cycles').orderBy('created_at', 'desc');
    return cycles.map((cycle: any) => this.mapCycle(cycle));
  }

  async getActiveCycles(): Promise<ReviewCycle[]> {
    const cycles = await this.db('review_cycles')
      .where('status', 'Active')
      .orderBy('created_at', 'desc');
    return cycles.map((cycle: any) => this.mapCycle(cycle));
  }

  async getCyclesByStatus(status: string): Promise<ReviewCycle[]> {
    const cycles = await this.db('review_cycles')
      .where('status', status)
      .orderBy('created_at', 'desc');
    return cycles.map((cycle: any) => this.mapCycle(cycle));
  }

  async updateCycle(id: string, data: Partial<CreateReviewCycleData>): Promise<ReviewCycle> {
    const updateData: any = { updated_at: new Date() };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.start_date !== undefined) updateData.start_date = data.start_date;
    if (data.end_date !== undefined) updateData.end_date = data.end_date;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.self_review_deadline !== undefined) updateData.self_review_deadline = data.self_review_deadline;
    if (data.manager_review_deadline !== undefined) updateData.manager_review_deadline = data.manager_review_deadline;
    if (data.peer_review_deadline !== undefined) updateData.peer_review_deadline = data.peer_review_deadline;

    await this.db('review_cycles').where('id', id).update(updateData);
    return this.getCycleById(id) as Promise<ReviewCycle>;
  }

  async deleteCycle(id: string): Promise<void> {
    await this.db('review_cycles').where('id', id).delete();
  }

  // Legacy method aliases used by performanceController and integration tests
  async createReviewCycle(data: CreateReviewCycleLegacyDTO): Promise<ReviewCycle> {
    return this.createCycle({
      name: data.name,
      start_date: data.startDate,
      end_date: data.endDate,
      self_review_deadline: data.selfReviewDeadline,
      manager_review_deadline: data.managerReviewDeadline,
      peer_review_deadline: data.peerReviewDeadline,
      status: 'Planning',
      created_by: data.createdBy,
    });
  }

  async getReviewCycleById(id: string): Promise<ReviewCycle | null> {
    return this.getCycleById(id);
  }

  async getAllReviewCycles(): Promise<ReviewCycle[]> {
    return this.getAllCycles();
  }

  async getActiveReviewCycles(): Promise<ReviewCycle[]> {
    return this.getActiveCycles();
  }

  async updateReviewCycle(id: string, data: Partial<CreateReviewCycleData>): Promise<ReviewCycle | null> {
    return this.updateCycle(id, data);
  }

  async updateReviewCycleStatus(id: string, status: string): Promise<void> {
    await this.db('review_cycles').where('id', id).update({ status, updated_at: new Date() });
  }

  async deleteReviewCycle(id: string): Promise<void> {
    return this.deleteCycle(id);
  }

  private parseDate(value: any): Date {
    if (value instanceof Date) {
      return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
    }
    const s = String(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      return new Date(s + 'T00:00:00.000Z');
    }
    return new Date(value);
  }

  private mapCycle(dbCycle: any): ReviewCycle {
    return {
      id: dbCycle.id,
      name: dbCycle.name,
      start_date: this.parseDate(dbCycle.start_date),
      end_date: this.parseDate(dbCycle.end_date),
      self_review_deadline: dbCycle.self_review_deadline
        ? this.parseDate(dbCycle.self_review_deadline)
        : undefined,
      manager_review_deadline: dbCycle.manager_review_deadline
        ? this.parseDate(dbCycle.manager_review_deadline)
        : undefined,
      peer_review_deadline: dbCycle.peer_review_deadline
        ? this.parseDate(dbCycle.peer_review_deadline)
        : undefined,
      status: dbCycle.status,
      createdBy: dbCycle.created_by || undefined,
      created_at: dbCycle.created_at ? new Date(dbCycle.created_at) : undefined,
      updated_at: dbCycle.updated_at ? new Date(dbCycle.updated_at) : undefined,
    };
  }
}
