import { PerformanceReviewService } from '../performanceReviewService';
import { PerformanceReviewRepository } from '../../repositories/performanceReviewRepository';
import { ReviewCycleRepository } from '../../repositories/reviewCycleRepository';
import { PerformanceReview, ReviewCycle } from '../../types/performance';

describe('PerformanceReviewService', () => {
  let service: PerformanceReviewService;
  let reviewRepository: PerformanceReviewRepository;
  let cycleRepository: ReviewCycleRepository;

  beforeEach(() => {
    reviewRepository = {
      createPerformanceReview: jest.fn(),
      getPerformanceReviewById: jest.fn(),
      getPerformanceReviewsByEmployee: jest.fn(),
      getPerformanceReviewsByCycle: jest.fn(),
      updatePerformanceReview: jest.fn(),
      updateReviewStatus: jest.fn(),
      updateFinalRating: jest.fn(),
      getReviewHistory: jest.fn(),
      deletePerformanceReview: jest.fn(),
    } as any;

    cycleRepository = {
      createReviewCycle: jest.fn(),
      getReviewCycleById: jest.fn(),
      getAllReviewCycles: jest.fn(),
      getActiveReviewCycles: jest.fn(),
      updateReviewCycleStatus: jest.fn(),
      updateReviewCycle: jest.fn(),
      deleteReviewCycle: jest.fn(),
    } as any;

    service = new PerformanceReviewService(reviewRepository, cycleRepository);
  });

  describe('submitReview', () => {
    it('should submit a self-review', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const mockCycle: ReviewCycle = {
        id: 'cycle-001',
        name: 'Q1 2026',
        startDate: new Date('2026-01-01'),
        endDate: futureDate,
        selfReviewDeadline: futureDate,
        managerReviewDeadline: futureDate,
        peerReviewDeadline: futureDate,
        status: 'Active',
        createdAt: new Date(),
        createdBy: 'user-001',
      };

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

      (cycleRepository.getReviewCycleById as jest.Mock).mockResolvedValue(mockCycle);
      (reviewRepository.createPerformanceReview as jest.Mock).mockResolvedValue(mockReview);
      (reviewRepository.updateReviewStatus as jest.Mock).mockResolvedValue(undefined);
      (reviewRepository.getPerformanceReviewById as jest.Mock).mockResolvedValue(mockReview);

      const result = await service.submitReview(
        'emp-001',
        'cycle-001',
        'Self',
        4,
        'Good performance',
        undefined
      );

      expect(result).toEqual(mockReview);
      expect(reviewRepository.createPerformanceReview).toHaveBeenCalled();
    });

    it('should throw error if rating is invalid', async () => {
      const mockCycle: ReviewCycle = {
        id: 'cycle-001',
        name: 'Q1 2026',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-03-31'),
        selfReviewDeadline: new Date('2026-03-15'),
        managerReviewDeadline: new Date('2026-03-20'),
        peerReviewDeadline: new Date('2026-03-25'),
        status: 'Active',
        createdAt: new Date(),
        createdBy: 'user-001',
      };

      (cycleRepository.getReviewCycleById as jest.Mock).mockResolvedValue(mockCycle);

      await expect(
        service.submitReview('emp-001', 'cycle-001', 'Self', 6, 'Good performance', undefined)
      ).rejects.toThrow('Rating must be between 1 and 5');
    });

    it('should throw error if review cycle not found', async () => {
      (cycleRepository.getReviewCycleById as jest.Mock).mockResolvedValue(null);

      await expect(
        service.submitReview('emp-001', 'cycle-999', 'Self', 4, 'Good performance', undefined)
      ).rejects.toThrow('Review cycle with ID cycle-999 not found');
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
