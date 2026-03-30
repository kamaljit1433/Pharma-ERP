import { Knex } from 'knex';
import { PerformanceReview, PerformanceReviewDTO } from '../types/performance';

export class PerformanceReviewRepository {
  constructor(private db: Knex) {}

  async createPerformanceReview(
    data: PerformanceReviewDTO & { reviewerId?: string }
  ): Promise<PerformanceReview> {
    const existingReview = await this.db('performance_reviews')
      .where('employee_id', data.employeeId)
      .where('cycle_id', data.cycleId)
      .first();

    if (existingReview) {
      // Update existing review
      return this.updatePerformanceReview(existingReview.id, data);
    }

    const ids = await this.db('performance_reviews').insert({
      employee_id: data.employeeId,
      cycle_id: data.cycleId,
      self_rating: data.reviewType === 'Self' ? data.rating : null,
      manager_rating: data.reviewType === 'Manager' ? data.rating : null,
      peer_ratings: data.reviewType === 'Peer' ? JSON.stringify([data.rating]) : JSON.stringify([]),
      final_rating: 0,
      comments: data.comments,
      status: 'Pending',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const id = Array.isArray(ids) ? ids[0] : ids;
    if (!id) {
      throw new Error('Failed to create performance review');
    }
    return this.getPerformanceReviewById(id.toString()) as Promise<PerformanceReview>;
  }

  async getPerformanceReviewById(id: string): Promise<PerformanceReview | null> {
    const review = await this.db('performance_reviews').where('id', id).first();

    if (!review) {
      return null;
    }

    return this.mapPerformanceReview(review);
  }

  async getPerformanceReviewByEmployeeAndCycle(
    employeeId: string,
    cycleId: string
  ): Promise<PerformanceReview | null> {
    const review = await this.db('performance_reviews')
      .where('employee_id', employeeId)
      .where('cycle_id', cycleId)
      .first();

    if (!review) {
      return null;
    }

    return this.mapPerformanceReview(review);
  }

  async getPerformanceReviewsByEmployee(employeeId: string): Promise<PerformanceReview[]> {
    const reviews = await this.db('performance_reviews')
      .where('employee_id', employeeId)
      .orderBy('created_at', 'desc');
    return reviews.map((review) => this.mapPerformanceReview(review));
  }

  async getPerformanceReviewsByCycle(cycleId: string): Promise<PerformanceReview[]> {
    const reviews = await this.db('performance_reviews')
      .where('cycle_id', cycleId)
      .orderBy('created_at', 'desc');
    return reviews.map((review) => this.mapPerformanceReview(review));
  }

  async updatePerformanceReview(
    id: string,
    data: Partial<PerformanceReviewDTO>
  ): Promise<PerformanceReview> {
    const review = await this.getPerformanceReviewById(id);
    if (!review) {
      throw new Error(`Performance review with ID ${id} not found`);
    }

    const updateData: any = {};

    if (data.reviewType === 'Self' && data.rating) {
      updateData.self_rating = data.rating;
    } else if (data.reviewType === 'Manager' && data.rating) {
      updateData.manager_rating = data.rating;
    } else if (data.reviewType === 'Peer' && data.rating) {
      const peerRatings = review.peerRatings || [];
      peerRatings.push(data.rating);
      updateData.peer_ratings = JSON.stringify(peerRatings);
    }

    if (data.comments) {
      updateData.comments = data.comments;
    }

    updateData.updated_at = new Date();

    await this.db('performance_reviews').where('id', id).update(updateData);

    return this.getPerformanceReviewById(id) as Promise<PerformanceReview>;
  }

  async updateReviewStatus(id: string, status: string): Promise<void> {
    await this.db('performance_reviews').where('id', id).update({
      status,
      updated_at: new Date(),
    });
  }

  async updateFinalRating(id: string, finalRating: number): Promise<void> {
    await this.db('performance_reviews').where('id', id).update({
      final_rating: finalRating,
      status: 'Finalized',
      completed_at: new Date(),
      updated_at: new Date(),
    });
  }

  async getReviewHistory(employeeId: string): Promise<PerformanceReview[]> {
    const reviews = await this.db('performance_reviews')
      .where('employee_id', employeeId)
      .where('status', 'Finalized')
      .orderBy('created_at', 'desc');
    return reviews.map((review) => this.mapPerformanceReview(review));
  }

  async deletePerformanceReview(id: string): Promise<void> {
    await this.db('performance_reviews').where('id', id).delete();
  }

  private mapPerformanceReview(dbReview: any): PerformanceReview {
    const result: PerformanceReview = {
      id: dbReview.id,
      employeeId: dbReview.employee_id,
      cycleId: dbReview.cycle_id,
      selfRating: dbReview.self_rating,
      managerRating: dbReview.manager_rating,
      peerRatings: dbReview.peer_ratings ? JSON.parse(dbReview.peer_ratings) : [],
      finalRating: dbReview.final_rating,
      comments: dbReview.comments,
      status: dbReview.status,
      createdAt: new Date(dbReview.created_at),
      updatedAt: new Date(dbReview.updated_at),
    };

    if (dbReview.completed_at) {
      result.completedAt = new Date(dbReview.completed_at);
    }

    return result;
  }
}
