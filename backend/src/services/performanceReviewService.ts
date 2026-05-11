import { PerformanceReviewRepository } from '../repositories/performanceReviewRepository';
import { PerformanceReview, PerformanceReviewDTO } from '../types/performance';

export class PerformanceReviewService {
  constructor(private performanceReviewRepository: PerformanceReviewRepository) {}

  async submitReview(
    data: PerformanceReviewDTO,
    userId: string
  ): Promise<PerformanceReview> {
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const review = await this.performanceReviewRepository.createPerformanceReview({
      employeeId: data.employeeId,
      cycleId: data.cycleId,
      reviewType: data.reviewType,
      rating: data.rating,
      comments: data.comments,
      reviewerId: data.reviewerId || userId,
    });

    // Status transition depends on review type
    let newStatus: string;
    switch (data.reviewType) {
      case 'Self':
        newStatus = 'Self-Assessment Complete';
        break;
      case 'Manager':
        newStatus = 'Manager Review Complete';
        break;
      case 'Peer':
        newStatus = 'Pending';  // Peer reviews don't change the overall status alone
        break;
      default:
        newStatus = 'Pending';
    }

    await this.performanceReviewRepository.updateReviewStatus(review.id, newStatus);

    return this.getReview(review.id);
  }

  async getReview(reviewId: string): Promise<PerformanceReview> {
    const row = await this.performanceReviewRepository.getPerformanceReviewById(reviewId);
    if (!row) {
      throw new Error(`Performance review with ID ${reviewId} not found`);
    }
    return this.mapToPerformanceReview(row);
  }

  async getEmployeeReviews(employeeId: string): Promise<PerformanceReview[]> {
    const rows = await this.performanceReviewRepository.getPerformanceReviewsByEmployee(employeeId);
    return rows.map((r) => this.mapToPerformanceReview(r));
  }

  async generateReport(filters: {
    employeeId?: string;
    cycleId?: string;
    reportType?: string;
  }): Promise<any> {
    let reviews: PerformanceReview[] = [];

    if (filters.employeeId && filters.cycleId) {
      const rows = await this.performanceReviewRepository.getReviewsByEmployee(filters.employeeId);
      reviews = rows.map((r) => this.mapToPerformanceReview(r));
    } else if (filters.employeeId) {
      const rows = await this.performanceReviewRepository.getPerformanceReviewsByEmployee(filters.employeeId);
      reviews = rows.map((r) => this.mapToPerformanceReview(r));
    } else if (filters.cycleId) {
      const rows = await this.performanceReviewRepository.getPerformanceReviewsByCycle(filters.cycleId);
      reviews = rows.map((r) => this.mapToPerformanceReview(r));
    }

    if (filters.reportType === 'summary') {
      return this.generateSummaryReport(reviews);
    } else if (filters.reportType === 'detailed') {
      return this.generateDetailedReport(reviews);
    }

    return {
      totalReviews: reviews.length,
      reviews,
      generatedAt: new Date(),
    };
  }

  private generateSummaryReport(reviews: PerformanceReview[]): any {
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.finalRating || 0), 0) / reviews.length
      : 0;

    const statusCounts = {
      pending: reviews.filter(r => r.status === 'Pending').length,
      selfComplete: reviews.filter(r => r.status === 'Self-Assessment Complete').length,
      managerComplete: reviews.filter(r => r.status === 'Manager Review Complete').length,
      finalized: reviews.filter(r => r.status === 'Finalized').length,
    };

    return {
      totalReviews: reviews.length,
      averageRating: Math.round(avgRating * 100) / 100,
      statusCounts,
      generatedAt: new Date(),
    };
  }

  private generateDetailedReport(reviews: PerformanceReview[]): any {
    return {
      totalReviews: reviews.length,
      reviews: reviews.map(r => ({
        id: r.id,
        employeeId: r.employeeId,
        cycleId: r.cycleId,
        selfRating: r.selfRating,
        managerRating: r.managerRating,
        peerRatings: r.peerRatings,
        finalRating: r.finalRating,
        status: r.status,
        comments: r.comments,
        createdAt: r.createdAt,
      })),
      generatedAt: new Date(),
    };
  }

  /**
   * Calculate final rating from self, manager, and peer ratings.
   * Formula: (Self × 0.25) + (Manager × 0.50) + (Avg Peer × 0.25)
   * Falls back gracefully when some rating types are absent.
   */
  async calculateFinalRating(reviewId: string): Promise<number> {
    const review = await this.getReview(reviewId);

    let finalRating = 0;
    let totalWeight = 0;

    if (review.selfRating) {
      finalRating += review.selfRating * 0.25;
      totalWeight += 0.25;
    }

    if (review.managerRating) {
      finalRating += review.managerRating * 0.5;
      totalWeight += 0.5;
    }

    if (review.peerRatings && review.peerRatings.length > 0) {
      const avgPeer = review.peerRatings.reduce((a: number, b: number) => a + b, 0) / review.peerRatings.length;
      finalRating += avgPeer * 0.25;
      totalWeight += 0.25;
    }

    if (totalWeight === 0) return 0;

    // Normalise in case not all types are present
    return Math.round((finalRating / totalWeight) * 100) / 100;
  }

  async finalizeReview(reviewId: string): Promise<PerformanceReview> {
    const review = await this.getReview(reviewId);

    if (!review.selfRating || !review.managerRating) {
      throw new Error('Self and manager reviews must be completed before finalization');
    }

    const finalRating = await this.calculateFinalRating(reviewId);
    await this.performanceReviewRepository.updateReview(reviewId, { rating: finalRating });
    await this.performanceReviewRepository.updateReviewStatus(reviewId, 'Finalized');

    return this.getReview(reviewId);
  }

  async getReviewHistory(employeeId: string): Promise<PerformanceReview[]> {
    const rows = await this.performanceReviewRepository.getReviewHistory(employeeId);
    return rows.map((r) => this.mapToPerformanceReview(r));
  }

  async deleteReview(reviewId: string): Promise<void> {
    await this.performanceReviewRepository.deletePerformanceReview(reviewId);
  }

  // Maps the repository's snake_case row to the camelCase PerformanceReview type.
  private mapToPerformanceReview(row: any): PerformanceReview {
    const reviewType: string = row.review_type || '';
    return {
      id: row.id,
      employeeId: row.employee_id,
      cycleId: row.cycle_id,
      selfRating: reviewType.toLowerCase() === 'self' ? (row.rating ?? undefined) : undefined,
      managerRating: reviewType.toLowerCase() === 'manager' ? (row.rating ?? undefined) : undefined,
      peerRatings: reviewType.toLowerCase() === 'peer' ? [row.rating].filter(Boolean) : [],
      finalRating: row.rating || 0,
      comments: row.comments || '',
      status: this.normaliseStatus(row.status),
      completedAt: row.submitted_at ? new Date(row.submitted_at) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private normaliseStatus(status: string): PerformanceReview['status'] {
    const map: Record<string, PerformanceReview['status']> = {
      draft: 'Pending',
      pending: 'Pending',
      submitted: 'Self-Assessment Complete',
      'self-assessment complete': 'Self-Assessment Complete',
      'manager review complete': 'Manager Review Complete',
      finalized: 'Finalized',
      approved: 'Finalized',
      'Pending': 'Pending',
      'Self-Assessment Complete': 'Self-Assessment Complete',
      'Manager Review Complete': 'Manager Review Complete',
      'Finalized': 'Finalized',
    };
    return map[status] ?? 'Pending';
  }
}
