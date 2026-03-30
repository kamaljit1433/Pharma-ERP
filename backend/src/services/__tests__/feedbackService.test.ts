import { FeedbackService } from '../feedbackService';
import { FeedbackRepository } from '../../repositories/feedbackRepository';
import { Feedback } from '../../types/performance';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let repository: FeedbackRepository;

  beforeEach(() => {
    repository = {
      createFeedback: jest.fn(),
      getFeedbackById: jest.fn(),
      getFeedbackForEmployee: jest.fn(),
      getFeedbackFromEmployee: jest.fn(),
      getFeedbackByType: jest.fn(),
      getFeedbackByVisibility: jest.fn(),
      getVisibleFeedback: jest.fn(),
      deleteFeedback: jest.fn(),
    } as any;

    service = new FeedbackService(repository);
  });

  describe('provideFeedback', () => {
    it('should provide positive feedback', async () => {
      const mockFeedback: Feedback = {
        id: 'feedback-001',
        toEmployeeId: 'emp-001',
        fromEmployeeId: 'emp-002',
        type: 'Positive',
        content: 'Great work on the project!',
        isAnonymous: false,
        visibility: 'Public',
        createdAt: new Date(),
      };

      (repository.createFeedback as jest.Mock).mockResolvedValue(mockFeedback);

      const result = await service.provideFeedback(
        'emp-001',
        'Positive',
        'Great work on the project!',
        false,
        'Public',
        'emp-002'
      );

      expect(result).toEqual(mockFeedback);
    });

    it('should throw error if content is too short', async () => {
      await expect(
        service.provideFeedback('emp-001', 'Positive', 'Good', false, 'Public', 'emp-002')
      ).rejects.toThrow('Feedback content must be at least 10 characters');
    });

    it('should throw error if content is too long', async () => {
      const longContent = 'a'.repeat(5001);
      await expect(
        service.provideFeedback('emp-001', 'Positive', longContent, false, 'Public', 'emp-002')
      ).rejects.toThrow('Feedback content must not exceed 5000 characters');
    });

    it('should throw error if self-feedback is not anonymous', async () => {
      await expect(
        service.provideFeedback(
          'emp-001',
          'Positive',
          'Great work on the project!',
          false,
          'Public',
          'emp-001'
        )
      ).rejects.toThrow('Cannot provide non-anonymous feedback to yourself');
    });

    it('should allow anonymous self-feedback', async () => {
      const mockFeedback: Feedback = {
        id: 'feedback-001',
        toEmployeeId: 'emp-001',
        fromEmployeeId: 'emp-001',
        type: 'Positive',
        content: 'Great work on the project!',
        isAnonymous: true,
        visibility: 'Private',
        createdAt: new Date(),
      };

      (repository.createFeedback as jest.Mock).mockResolvedValue(mockFeedback);

      const result = await service.provideFeedback(
        'emp-001',
        'Positive',
        'Great work on the project!',
        true,
        'Private',
        'emp-001'
      );

      expect(result).toEqual(mockFeedback);
    });
  });

  describe('getVisibleFeedback', () => {
    it('should return all feedback for the employee', async () => {
      const mockFeedback: Feedback[] = [
        {
          id: 'feedback-001',
          toEmployeeId: 'emp-001',
          fromEmployeeId: 'emp-002',
          type: 'Positive',
          content: 'Great work!',
          isAnonymous: false,
          visibility: 'Private',
          createdAt: new Date(),
        },
      ];

      (repository.getVisibleFeedback as jest.Mock).mockResolvedValue(mockFeedback);

      const result = await service.getVisibleFeedback('emp-001', 'emp-001');

      expect(result).toEqual(mockFeedback);
    });
  });

  describe('getFeedbackSummary', () => {
    it('should return feedback summary', async () => {
      const mockFeedback: Feedback[] = [
        {
          id: 'feedback-001',
          toEmployeeId: 'emp-001',
          fromEmployeeId: 'emp-002',
          type: 'Positive',
          content: 'Great work!',
          isAnonymous: false,
          visibility: 'Public',
          createdAt: new Date(),
        },
        {
          id: 'feedback-002',
          toEmployeeId: 'emp-001',
          fromEmployeeId: 'emp-003',
          type: 'Constructive',
          content: 'Could improve on communication',
          isAnonymous: false,
          visibility: 'Manager Only',
          createdAt: new Date(),
        },
      ];

      (repository.getFeedbackForEmployee as jest.Mock).mockResolvedValue(mockFeedback);

      const result = await service.getFeedbackSummary('emp-001');

      expect(result.total).toBe(2);
      expect(result.positive).toBe(1);
      expect(result.constructive).toBe(1);
      expect(result.byVisibility.public).toBe(1);
      expect(result.byVisibility.managerOnly).toBe(1);
    });
  });

  describe('getFeedbackByType', () => {
    it('should return feedback by type', async () => {
      const mockFeedback: Feedback[] = [
        {
          id: 'feedback-001',
          toEmployeeId: 'emp-001',
          fromEmployeeId: 'emp-002',
          type: 'Positive',
          content: 'Great work!',
          isAnonymous: false,
          visibility: 'Public',
          createdAt: new Date(),
        },
      ];

      (repository.getFeedbackByType as jest.Mock).mockResolvedValue(mockFeedback);

      const result = await service.getFeedbackByType('emp-001', 'Positive');

      expect(result).toEqual(mockFeedback);
    });

    it('should throw error for invalid feedback type', async () => {
      await expect(service.getFeedbackByType('emp-001', 'Invalid')).rejects.toThrow(
        'Invalid feedback type'
      );
    });
  });

  describe('deleteFeedback', () => {
    it('should delete feedback', async () => {
      (repository.deleteFeedback as jest.Mock).mockResolvedValue(undefined);

      await service.deleteFeedback('feedback-001');

      expect(repository.deleteFeedback).toHaveBeenCalledWith('feedback-001');
    });
  });
});
