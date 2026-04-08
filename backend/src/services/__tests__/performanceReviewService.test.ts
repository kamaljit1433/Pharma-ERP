import { PerformanceReviewService } from '../performanceReviewService';
import { PerformanceReviewRepository } from '../../repositories/performanceReviewRepository';
import { PerformanceReview, PerformanceReviewDTO } from '../../types/performance';

describe('PerformanceReviewService', () => {
  let service: PerformanceReviewService;
  let reviewRepository: PerformanceReviewRepository;

  beforeEach(() => {
    reviewRepository = {
      createPerformanceReview: jest.fn(),
      getPerformanceReviewById: jest.fn(),
      getPerformanceReviewsByEmployee: jest.fn(),
      getPerformanceReviewsByCycle: jest.fn(),
      getPerformanceReviewByEmployeeAndCycle: jest.fn(),
      updatePerformanceReview: jest.fn(),
      updateReviewStatus: jest.fn(),
      updateFinalRating: jest.fn(),
      getReviewHistory: jest.fn(),
      deletePerformanceReview: jest.fn(),
    } as any;

    service = new PerformanceReviewService(reviewRepository);
  });

  describe('submitReview', () => {
    it('should submit a self-review', async () => {
      const mockReview: PerformanceReview = {
        id: 'review-001',
        employeeId: 'emp-001',
        cycleId: 'cycle-001',
        selfRating: 4,
        managerRating: undefined as any,
        peerRatings: [],
        finalRating: 0,
        comments: 'Good performance',
        status: 'Self-Assessment Complete',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (reviewRepository.createPerformanceReview as jest.Mock).mockResolvedValue(mockReview);
      (reviewRepository.updateReviewStatus as jest.Mock).mockResolvedValue(undefined);
      (reviewRepository.getPerformanceReviewById as jest.Mock).mockResolvedValue(mockReview);

      const dto: PerformanceReviewDTO = {
        employeeId: 'emp-001',
        cycleId: 'cycle-001',
        reviewType: 'Self',
        rating: 4,
        comments: 'Good performance',
      };

      const result = await service.submitReview(dto, 'user-001');

      expect(result).toEqual(mockReview);
      expect(reviewRepository.createPerformanceReview).toHaveBeenCalled();
      expect(reviewRepository.updateReviewStatus).toHaveBeenCalledWith('review-001', 'Self-Assessment Complete');
    });

    it('should throw error if rating is invalid', async () => {
      const dto: PerformanceReviewDTO = {
        employeeId: 'emp-001',
        cycleId: 'cycle-001',
        reviewType: 'Self',
        rating: 6,
        comments: 'Good performance',
      };

      await expect(service.submitReview(dto, 'user-001')).rejects.toThrow(
        'Rating must be between 1 and 5'
      );
    });

    it('should throw error if rating is below 1', async () => {
      const dto: PerformanceReviewDTO = {
        employeeId: 'emp-001',
        cycleId: 'cycle-001',
        reviewType: 'Self',
        rating: 0,
        comments: 'Good performance',
      };

      await expect(service.submitReview(dto, 'user-001')).rejects.toThrow(
        'Rating must be between 1 and 5'
      );
    });
  });

  describe('calculateFinalRating', () => {
    it('should calculate final rating with all components', async () => {
      const mockReview: PerformanceReview = {
        id: 'review-001',
        employeeId: 'emp-001',
        cycleId: 'cycle-001',
        selfRating: 4,
        managerRating: 5,
        peerRatings: [4, 3, 4],
        finalRating: 0,
        comments: 'Good performance',
        status: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (reviewRepository.getPerformanceReviewById as jest.Mock).mockResolvedValue(mockReview);

      const result = await service.calculateFinalRating('review-001');

      // (4 * 0.25) + (5 * 0.50) + ((4+3+4)/3 * 0.25) = 1 + 2.5 + 0.833 = 4.33
      expect(result).toBeCloseTo(4.33, 0);
    });

    it('should handle missing peer ratings', async () => {
      const mockReview: PerformanceReview = {
        id: 'review-001',
        employeeId: 'emp-001',
        cycleId: 'cycle-001',
        selfRating: 4,
        managerRating: 5,
        peerRatings: [],
        finalRating: 0,
        comments: 'Good performance',
        status: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (reviewRepository.getPerformanceReviewById as jest.Mock).mockResolvedValue(mockReview);

      const result = await service.calculateFinalRating('review-001');

      // (4 * 0.25) + (5 * 0.50) = 1 + 2.5 = 3.5
      expect(result).toBe(3.5);
    });
  });

  describe('finalizeReview', () => {
    it('should finalize review with all ratings', async () => {
      const mockReview: PerformanceReview = {
        id: 'review-001',
        employeeId: 'emp-001',
        cycleId: 'cycle-001',
        selfRating: 4,
        managerRating: 5,
        peerRatings: [4, 3, 4],
        finalRating: 0,
        comments: 'Good performance',
        status: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const finalizedReview: PerformanceReview = {
        ...mockReview,
        finalRating: 4.33,
        status: 'Finalized',
      };

      (reviewRepository.getPerformanceReviewById as jest.Mock)
        .mockResolvedValueOnce(mockReview)
        .mockResolvedValueOnce(mockReview)
        .mockResolvedValueOnce(finalizedReview);
      (reviewRepository.updateFinalRating as jest.Mock).mockResolvedValue(undefined);

      const result = await service.finalizeReview('review-001');

      expect(result.status).toBe('Finalized');
      expect(reviewRepository.updateFinalRating).toHaveBeenCalled();
    });

    it('should throw error if not all ratings are present', async () => {
      const mockReview: PerformanceReview = {
        id: 'review-001',
        employeeId: 'emp-001',
        cycleId: 'cycle-001',
        selfRating: 4,
        managerRating: undefined as any,
        peerRatings: [],
        finalRating: 0,
        comments: 'Good performance',
        status: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (reviewRepository.getPerformanceReviewById as jest.Mock).mockResolvedValue(mockReview);

      await expect(service.finalizeReview('review-001')).rejects.toThrow(
        'All review types (self, manager, peer) must be completed before finalization'
      );
    });
  });

  describe('getEmployeeReviews', () => {
    it('should return all reviews for an employee', async () => {
      const mockReviews: PerformanceReview[] = [
        {
          id: 'review-001',
          employeeId: 'emp-001',
          cycleId: 'cycle-001',
          selfRating: 4,
          managerRating: 5,
          peerRatings: [4],
          finalRating: 4.5,
          comments: 'Good',
          status: 'Finalized',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (reviewRepository.getPerformanceReviewsByEmployee as jest.Mock).mockResolvedValue(mockReviews);

      const result = await service.getEmployeeReviews('emp-001');

      expect(result).toEqual(mockReviews);
    });
  });
});
