import { Knex } from 'knex';

export interface PerformanceReview {
  id: string;
  employee_id: string;
  employee_name?: string;
  cycle_id: string;
  reviewer_id: string;
  review_type?: string;
  rating: number;
  comments: string;
  status: string;
  submitted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateReviewInput {
  employee_id: string;
  cycle_id: string;
  reviewer_id: string;
  review_type?: string;
  rating: number;
  comments: string;
  status?: string;
}

export interface UpdateReviewInput {
  rating?: number;
  comments?: string;
  status?: string;
  review_type?: string;
}

export class PerformanceReviewRepository {
  constructor(private db: Knex) {}

  async createReview(data: CreateReviewInput): Promise<PerformanceReview> {
    const [row] = await this.db('performance_reviews')
      .insert({
        employee_id: data.employee_id,
        review_cycle_id: data.cycle_id,
        reviewer_id: data.reviewer_id,
        review_type: data.review_type || 'Self',
        rating: data.rating,
        comments: data.comments,
        status: data.status || 'Pending',
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    return this.mapReview(row);
  }

  async getReviewById(id: string): Promise<PerformanceReview | null> {
    const row = await this.db('performance_reviews').where({ id }).first();
    return row ? this.mapReview(row) : null;
  }

  async getReviewsByEmployee(employeeId: string): Promise<PerformanceReview[]> {
    const rows = await this.db('performance_reviews')
      .where({ employee_id: employeeId })
      .orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapReview(r));
  }

  async getReviewsByCycle(cycleId: string): Promise<PerformanceReview[]> {
    const rows = await this.db('performance_reviews')
      .where({ review_cycle_id: cycleId })
      .orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapReview(r));
  }

  async updateReview(id: string, data: UpdateReviewInput): Promise<PerformanceReview> {
    const updateData: any = { updated_at: new Date() };

    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.comments !== undefined) updateData.comments = data.comments;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.review_type !== undefined) updateData.review_type = data.review_type;

    const [row] = await this.db('performance_reviews')
      .where({ id })
      .update(updateData)
      .returning('*');

    return this.mapReview(row);
  }

  async deleteReview(id: string): Promise<void> {
    await this.db('performance_reviews').where({ id }).delete();
  }

  // Legacy methods
  async createPerformanceReview(data: { employeeId: string; cycleId: string; reviewerId?: string; reviewType?: string; rating?: number; comments?: string }): Promise<PerformanceReview> {
    return this.createReview({
      employee_id: data.employeeId,
      cycle_id: data.cycleId,
      reviewer_id: data.reviewerId || data.employeeId,
      review_type: data.reviewType,
      rating: data.rating || 0,
      comments: data.comments || '',
    });
  }

  async getPerformanceReviewById(id: string): Promise<PerformanceReview | null> {
    return this.getReviewById(id);
  }

  async getPerformanceReviewsByEmployee(employeeId: string): Promise<PerformanceReview[]> {
    return this.getReviewsByEmployee(employeeId);
  }

  async getPerformanceReviewsByCycle(cycleId: string): Promise<PerformanceReview[]> {
    return this.getReviewsByCycle(cycleId);
  }

  async updatePerformanceReview(id: string, data: UpdateReviewInput): Promise<PerformanceReview> {
    return this.updateReview(id, data);
  }

  async deletePerformanceReview(id: string): Promise<void> {
    return this.deleteReview(id);
  }

  async updateReviewStatus(id: string, status: string): Promise<void> {
    await this.db('performance_reviews').where({ id }).update({ status, updated_at: new Date() });
  }

  async listAllReviews(): Promise<PerformanceReview[]> {
    const rows = await this.db('performance_reviews as pr')
      .leftJoin('employees as e', 'e.id', 'pr.employee_id')
      .select(
        'pr.*',
        this.db.raw("CONCAT(e.first_name, ' ', e.last_name) as employee_name")
      )
      .orderBy('pr.created_at', 'desc');
    return rows.map((r: any) => this.mapReview(r));
  }

  async getReviewHistory(employeeId: string): Promise<PerformanceReview[]> {
    const rows = await this.db('performance_reviews')
      .where({ employee_id: employeeId })
      .whereIn('status', ['Finalized', 'Manager Review Complete', 'Self-Assessment Complete'])
      .orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapReview(r));
  }

  private mapReview(row: any): PerformanceReview {
    return {
      id: row.id,
      employee_id: row.employee_id,
      employee_name: row.employee_name ?? undefined,
      cycle_id: row.review_cycle_id,
      reviewer_id: row.reviewer_id,
      review_type: row.review_type,
      rating: row.rating,
      comments: row.comments || '',
      status: row.status,
      submitted_at: row.submitted_at ? new Date(row.submitted_at) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
