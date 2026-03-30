import { GoalService } from '../../services/goalService';
import { PerformanceReviewService } from '../../services/performanceReviewService';
import { FeedbackService } from '../../services/feedbackService';
import { PIPService } from '../../services/pipService';
import { GoalRepository } from '../../repositories/goalRepository';
import { PerformanceReviewRepository } from '../../repositories/performanceReviewRepository';
import { FeedbackRepository } from '../../repositories/feedbackRepository';
import { PIPRepository } from '../../repositories/pipRepository';
import { ReviewCycleRepository } from '../../repositories/reviewCycleRepository';
import db from '../../config/knex';
import { v4 as uuidv4 } from 'uuid';

describe('Performance API Endpoints - Integration Tests', () => {
  let goalService: GoalService;
  let reviewService: PerformanceReviewService;
  let feedbackService: FeedbackService;
  let pipService: PIPService;
  let reviewCycleRepository: ReviewCycleRepository;

  let employeeId: string;
  let cycleId: string;
  let goalId: string;
  let reviewId: string;
  let pipId: string;
  const userId = uuidv4();

  beforeAll(async () => {
    const goalRepository = new GoalRepository(db);
    const reviewRepository = new PerformanceReviewRepository(db);
    const feedbackRepository = new FeedbackRepository(db);
    const pipRepository = new PIPRepository(db);
    reviewCycleRepository = new ReviewCycleRepository(db);

    goalService = new GoalService(goalRepository);
    reviewService = new PerformanceReviewService(reviewRepository);
    feedbackService = new FeedbackService(feedbackRepository);
    pipService = new PIPService(pipRepository, goalRepository);

    // Clean up test data
    await db('goals').del();
    await db('performance_reviews').del();
    await db('feedback').del();
    await db('pips').del();
    await db('review_cycles').del();

    employeeId = uuidv4();
  });

  afterAll(async () => {
    // Clean up test data
    await db('goals').del();
    await db('performance_reviews').del();
    await db('feedback').del();
    await db('pips').del();
    await db('review_cycles').del();
  });

  describe('Goal Management', () => {
    it('should create a goal with valid data', async () => {
      const goal = await goalService.createGoal(
        {
          employeeId,
          cycleId: uuidv4(),
          type: 'OKR',
          title: 'Increase Sales',
          description: 'Increase sales by 20%',
          targetValue: 100,
          unit: 'units',
          weight: 50,
          dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
        userId
      );

      expect(goal).toHaveProperty('id');
      expect(goal.title).toBe('Increase Sales');
      expect(goal.weight).toBe(50);
      goalId = goal.id;
    });

    it('should reject goal with weight > 100', async () => {
      await expect(
        goalService.createGoal(
          {
            employeeId,
            cycleId: uuidv4(),
            type: 'KPI',
            title: 'Test Goal',
            description: 'Test',
            targetValue: 50,
            unit: 'units',
            weight: 150,
            dueDate: new Date(),
          },
          userId
        )
      ).rejects.toThrow('Weight must be between 0 and 100');
    });

    it('should reject goal with targetValue <= 0', async () => {
      await expect(
        goalService.createGoal(
          {
            employeeId,
            cycleId: uuidv4(),
            type: 'OKR',
            title: 'Test Goal',
            description: 'Test',
            targetValue: 0,
            unit: 'units',
            weight: 50,
            dueDate: new Date(),
          },
          userId
        )
      ).rejects.toThrow('Target value must be greater than 0');
    });

    it('should retrieve goal by id', async () => {
      const goal = await goalService.getGoal(goalId);
      expect(goal.id).toBe(goalId);
      expect(goal.title).toBe('Increase Sales');
    });

    it('should retrieve all goals for an employee', async () => {
      const goals = await goalService.getEmployeeGoals(employeeId);
      expect(Array.isArray(goals)).toBe(true);
      expect(goals.length).toBeGreaterThan(0);
    });

    it('should update goal progress with valid data', async () => {
      const goal = await goalService.updateGoalProgress(
        goalId,
        {
          currentValue: 50,
          comment: 'Halfway there',
        },
        userId
      );

      expect(goal.currentValue).toBe(50);
    });

    it('should reject negative currentValue', async () => {
      await expect(
        goalService.updateGoalProgress(
          goalId,
          {
            currentValue: -10,
          },
          userId
        )
      ).rejects.toThrow('Current value cannot be negative');
    });

    it('should reject currentValue > 150% of target', async () => {
      await expect(
        goalService.updateGoalProgress(
          goalId,
          {
            currentValue: 200,
          },
          userId
        )
      ).rejects.toThrow('Current value exceeds reasonable limit');
    });
  });

  describe('Review Cycle Management', () => {
    it('should create review cycle with valid data', async () => {
      const startDate = new Date();
      const endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
      const selfDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const managerDeadline = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      const peerDeadline = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);

      const cycle = await reviewCycleRepository.createReviewCycle(
        {
          name: 'Q1 2026 Review',
          startDate,
          endDate,
          selfReviewDeadline: selfDeadline,
          managerReviewDeadline: managerDeadline,
          peerReviewDeadline: peerDeadline,
          createdBy: userId,
        }
      );

      expect(cycle).toHaveProperty('id');
      expect(cycle.name).toBe('Q1 2026 Review');
      cycleId = cycle.id;
    });
  });

  describe('Performance Review Management', () => {
    it('should submit review with valid data', async () => {
      const review = await reviewService.submitReview(
        {
          employeeId,
          cycleId,
          reviewType: 'Self',
          rating: 4,
          comments: 'Good performance',
        },
        userId
      );

      expect(review).toHaveProperty('id');
      expect(review.selfRating).toBe(4);
      reviewId = review.id;
    });

    it('should reject rating < 1', async () => {
      await expect(
        reviewService.submitReview(
          {
            employeeId,
            cycleId,
            reviewType: 'Manager',
            rating: 0,
            comments: 'Test',
          },
          userId
        )
      ).rejects.toThrow('Rating must be between 1 and 5');
    });

    it('should reject rating > 5', async () => {
      await expect(
        reviewService.submitReview(
          {
            employeeId,
            cycleId,
            reviewType: 'Peer',
            rating: 6,
            comments: 'Test',
          },
          userId
        )
      ).rejects.toThrow('Rating must be between 1 and 5');
    });

    it('should retrieve review by id', async () => {
      const review = await reviewService.getReview(reviewId);
      expect(review.id).toBe(reviewId);
    });

    it('should retrieve all reviews for an employee', async () => {
      const reviews = await reviewService.getEmployeeReviews(employeeId);
      expect(Array.isArray(reviews)).toBe(true);
    });
  });

  describe('Feedback Management', () => {
    it('should provide feedback with valid data', async () => {
      const feedback = await feedbackService.provideFeedback(
        {
          toEmployeeId: employeeId,
          type: 'Positive',
          content: 'Great work on the project! Your contribution was valuable.',
          isAnonymous: false,
          visibility: 'Public',
        },
        userId
      );

      expect(feedback).toHaveProperty('id');
      expect(feedback.type).toBe('Positive');
    });

    it('should reject feedback < 10 characters', async () => {
      await expect(
        feedbackService.provideFeedback(
          {
            toEmployeeId: employeeId,
            type: 'Positive',
            content: 'Short',
            isAnonymous: false,
            visibility: 'Public',
          },
          userId
        )
      ).rejects.toThrow('Feedback content must be at least 10 characters');
    });

    it('should reject feedback > 5000 characters', async () => {
      await expect(
        feedbackService.provideFeedback(
          {
            toEmployeeId: employeeId,
            type: 'Positive',
            content: 'a'.repeat(5001),
            isAnonymous: false,
            visibility: 'Public',
          },
          userId
        )
      ).rejects.toThrow('Feedback content must not exceed 5000 characters');
    });

    it('should reject self-feedback when not anonymous', async () => {
      await expect(
        feedbackService.provideFeedback(
          {
            toEmployeeId: userId,
            type: 'Positive',
            content: 'This is self feedback which should be rejected',
            isAnonymous: false,
            visibility: 'Public',
          },
          userId
        )
      ).rejects.toThrow('Cannot provide non-anonymous feedback to yourself');
    });

    it('should retrieve feedback for employee', async () => {
      const feedback = await feedbackService.getEmployeeFeedback(employeeId);
      expect(Array.isArray(feedback)).toBe(true);
    });
  });

  describe('PIP Management', () => {
    it('should initiate PIP with valid data', async () => {
      const pip = await pipService.initiatePIP(
        {
          employeeId,
          goals: [goalId],
          startDate: new Date(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        },
        userId
      );

      expect(pip).toHaveProperty('id');
      expect(pip.status).toBe('Active');
      pipId = pip.id;
    });

    it('should reject if start date >= end date', async () => {
      await expect(
        pipService.initiatePIP(
          {
            employeeId,
            goals: [goalId],
            startDate: new Date(),
            endDate: new Date(Date.now() - 1000),
          },
          userId
        )
      ).rejects.toThrow('Start date must be before end date');
    });

    it('should reject if goalIds is empty', async () => {
      await expect(
        pipService.initiatePIP(
          {
            employeeId,
            goals: [],
            startDate: new Date(),
            endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          },
          userId
        )
      ).rejects.toThrow('Employee ID and at least one goal are required');
    });

    it('should retrieve PIP by id', async () => {
      const pip = await pipService.getPIP(pipId);
      expect(pip.id).toBe(pipId);
      expect(pip.status).toBe('Active');
    });

    it('should retrieve all PIPs for an employee', async () => {
      const pips = await pipService.getEmployeePIPs(employeeId);
      expect(Array.isArray(pips)).toBe(true);
    });

    it('should record PIP check-in with valid data', async () => {
      const checkIn = await pipService.recordCheckIn(
        pipId,
        {
          pipId,
          checkInDate: new Date(),
          progress: 'Making good progress',
          notes: 'On track with goals',
          status: 'On Track',
        },
        userId
      );

      expect(checkIn).toHaveProperty('id');
      expect(checkIn.status).toBe('On Track');
    });

    it('should record PIP outcome', async () => {
      const pip = await pipService.recordOutcome(pipId, 'Completed');
      expect(pip.outcome).toBe('Completed');
    });
  });

  describe('Report Generation', () => {
    it('should generate performance reports', async () => {
      const report = await reviewService.generateReport({
        employeeId,
        cycleId,
      });

      expect(report).toHaveProperty('totalReviews');
    });

    it('should generate summary report', async () => {
      const report = await reviewService.generateReport({
        reportType: 'summary',
      });

      expect(report).toHaveProperty('averageRating');
    });

    it('should generate detailed report', async () => {
      const report = await reviewService.generateReport({
        reportType: 'detailed',
      });

      expect(report).toHaveProperty('reviews');
    });
  });
});
