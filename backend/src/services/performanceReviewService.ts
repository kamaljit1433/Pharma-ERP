import { PerformanceReviewRepository } from '../repositories/performanceReviewRepository';
import { PerformanceReview, PerformanceReviewDTO } from '../types/performance';

export class PerformanceReviewService {
  constructor(private performanceReviewRepository: PerformanceReviewRepository) {}

  async submitReview(
    data: PerformanceReviewDTO,
    userId: string
  ): Promise<PerformanceReview> {
    // Validate rating
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

    // Update status based on review type
    let newStatus = 'Pending';
    if (data.reviewType === 'Self') {
      newStatus = 'Self-Assessment Complete';
    } else if (data.reviewType === 'Manager') {
      newStatus = 'Manager Review Complete';
    }

    await this.performanceReviewRepository.updateReviewStatus(review.id, newStatus);

    return this.getReview(review.id);
  }

  async getReview(reviewId: string): Promise<PerformanceReview> {
    const review = await this.performanceReviewRepository.getPerformanceReviewById(reviewId);
    if (!review) {
      throw new Error(`Performance review with ID ${reviewId} not found`);
    }
    return review;
  }

  async getEmployeeReviews(employeeId: string): Promise<PerformanceReview[]> {
    return this.performanceReviewRepository.getPerformanceReviewsByEmployee(employeeId);
  }

  async generateReport(filters: {
    employeeId?: string;
    cycleId?: string;
    reportType?: string;
  }): Promise<any> {
    let reviews: PerformanceReview[] = [];

    if (filters.employeeId && filters.cycleId) {
      const review = await this.performanceReviewRepository.getPerformanceReviewByEmployeeAndCycle(
        filters.employeeId,
        filters.cycleId
      );
      reviews = review ? [review] : [];
    } else if (filters.employeeId) {
      reviews = await this.performanceReviewRepository.getPerformanceReviewsByEmployee(filters.employeeId);
    } else if (filters.cycleId) {
      reviews = await this.performanceReviewRepository.getPerformanceReviewsByCycle(filters.cycleId);
    }

    // Generate report based on type
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
   * Calculate final rating from self, manager, and peer ratings
   * Formula: (Self Rating × 0.25) + (Manager Rating × 0.50) + (Average Peer Rating × 0.25)
   */
  async calculateFinalRating(reviewId: string): Promise<number> {
    const review = await this.getReview(reviewId);

    let finalRating = 0;

    // Self rating (25% weight)
    if (review.selfRating) {
      finalRating += review.selfRating * 0.25;
    }

    // Manager rating (50% weight)
    if (review.managerRating) {
      finalRating += review.managerRating * 0.5;
    }

    // Peer ratings (25% weight)
    if (review.peerRatings && review.peerRatings.length > 0) {
      const avgPeerRating = review.peerRatings.reduce((a: number, b: number) => a + b, 0) / review.peerRatings.length;
      finalRating += avgPeerRating * 0.25;
    }

    return Math.round(finalRating * 100) / 100;
  }

  async finalizeReview(reviewId: string): Promise<PerformanceReview> {
    const review = await this.getReview(reviewId);

    // Validate that all required ratings are present
    if (!review.selfRating || !review.managerRating || !review.peerRatings || review.peerRatings.length === 0) {
      throw new Error('All review types (self, manager, peer) must be completed before finalization');
    }

    const finalRating = await this.calculateFinalRating(reviewId);
    await this.performanceReviewRepository.updateFinalRating(reviewId, finalRating);

    return this.getReview(reviewId);
  }

  async getReviewHistory(employeeId: string): Promise<PerformanceReview[]> {
    return this.performanceReviewRepository.getReviewHistory(employeeId);
  }

  async deleteReview(reviewId: string): Promise<void> {
    await this.performanceReviewRepository.deletePerformanceReview(reviewId);
  }
}
