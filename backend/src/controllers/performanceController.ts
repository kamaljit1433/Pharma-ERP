import { Request, Response, NextFunction } from 'express';
import { Knex } from 'knex';
import { GoalService } from '../services/goalService';
import { PerformanceReviewService } from '../services/performanceReviewService';
import { FeedbackService } from '../services/feedbackService';
import { PIPService } from '../services/pipService';
import { GoalRepository } from '../repositories/goalRepository';
import { PerformanceReviewRepository } from '../repositories/performanceReviewRepository';
import { FeedbackRepository } from '../repositories/feedbackRepository';
import { PIPRepository } from '../repositories/pipRepository';
import { ReviewCycleRepository } from '../repositories/reviewCycleRepository';
import {
  CreateGoalDTO,
  UpdateGoalProgressDTO,
  CreateReviewCycleDTO,
  PerformanceReviewDTO,
  CreateFeedbackDTO,
  CreatePIPDTO,
  RecordPIPOutcomeDTO,
} from '../types/performance';

export class PerformanceController {
  private goalService: GoalService;
  private reviewService: PerformanceReviewService;
  private feedbackService: FeedbackService;
  private pipService: PIPService;
  private reviewCycleRepository: ReviewCycleRepository;

  constructor(private knex: Knex) {
    const goalRepository = new GoalRepository(knex);
    const reviewRepository = new PerformanceReviewRepository(knex);
    const feedbackRepository = new FeedbackRepository(knex);
    const pipRepository = new PIPRepository(knex);
    this.reviewCycleRepository = new ReviewCycleRepository(knex);

    this.goalService = new GoalService(goalRepository);
    this.reviewService = new PerformanceReviewService(reviewRepository, goalRepository);
    this.feedbackService = new FeedbackService(feedbackRepository);
    this.pipService = new PIPService(pipRepository, goalRepository);
  }

  // ============ Goals ============

  async createGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeId, cycleId, type, title, description, targetValue, unit, weight, dueDate } =
        req.body;

      // Validation
      if (!employeeId || !cycleId || !type || !title || !description || targetValue === undefined || !unit || weight === undefined || !dueDate) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      if (weight < 0 || weight > 100) {
        res.status(400).json({ error: 'Weight must be between 0 and 100' });
        return;
      }

      if (targetValue <= 0) {
        res.status(400).json({ error: 'Target value must be greater than 0' });
        return;
      }

      const goal = await this.goalService.createGoal(
        {
          employeeId,
          cycleId,
          type,
          title,
          description,
          targetValue,
          unit,
          weight,
          dueDate: new Date(dueDate),
        },
        (req as any).user.id
      );

      res.status(201).json(goal);
    } catch (error) {
      next(error);
    }
  }

  async getGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const goal = await this.goalService.getGoal(id);
      res.json(goal);
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeGoals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeId } = req.params;
      const goals = await this.goalService.getEmployeeGoals(employeeId);
      res.json(goals);
    } catch (error) {
      next(error);
    }
  }

  async updateGoalProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { currentValue, comment } = req.body;

      if (currentValue === undefined) {
        res.status(400).json({ error: 'Current value is required' });
        return;
      }

      if (currentValue < 0) {
        res.status(400).json({ error: 'Current value cannot be negative' });
        return;
      }

      const goal = await this.goalService.updateGoalProgress(
        id,
        { currentValue, comment },
        (req as any).user.id
      );

      res.json(goal);
    } catch (error) {
      next(error);
    }
  }

  // ============ Review Cycles ============

  async createReviewCycle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, startDate, endDate, selfReviewDeadline, managerReviewDeadline, peerReviewDeadline } =
        req.body;

      // Validation
      if (!name || !startDate || !endDate || !selfReviewDeadline || !managerReviewDeadline || !peerReviewDeadline) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const selfDeadline = new Date(selfReviewDeadline);
      const managerDeadline = new Date(managerReviewDeadline);
      const peerDeadline = new Date(peerReviewDeadline);

      // Validate date order
      if (start >= end) {
        res.status(400).json({ error: 'Start date must be before end date' });
        return;
      }

      if (selfDeadline > end || managerDeadline > end || peerDeadline > end) {
        res.status(400).json({ error: 'All deadlines must be before or on end date' });
        return;
      }

      const cycle = await this.reviewCycleRepository.createReviewCycle(
        {
          name,
          startDate: start,
          endDate: end,
          selfReviewDeadline: selfDeadline,
          managerReviewDeadline: managerDeadline,
          peerReviewDeadline: peerDeadline,
        },
        (req as any).user.id
      );

      res.status(201).json(cycle);
    } catch (error) {
      next(error);
    }
  }

  // ============ Performance Reviews ============

  async submitReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeId, cycleId, reviewType, rating, comments, reviewerId } = req.body;

      // Validation
      if (!employeeId || !cycleId || !reviewType || rating === undefined || !comments) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      if (rating < 1 || rating > 5) {
        res.status(400).json({ error: 'Rating must be between 1 and 5' });
        return;
      }

      const review = await this.reviewService.submitReview(
        {
          employeeId,
          cycleId,
          reviewType,
          rating,
          comments,
          reviewerId: reviewerId || (req as any).user.id,
        },
        (req as any).user.id
      );

      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  }

  async getReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const review = await this.reviewService.getReview(id);
      res.json(review);
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeId } = req.params;
      const reviews = await this.reviewService.getEmployeeReviews(employeeId);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  }

  // ============ Feedback ============

  async provideFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { toEmployeeId, type, content, isAnonymous, visibility } = req.body;

      // Validation
      if (!toEmployeeId || !type || !content || isAnonymous === undefined || !visibility) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      if (content.length < 10 || content.length > 5000) {
        res.status(400).json({ error: 'Content must be between 10 and 5000 characters' });
        return;
      }

      // Prevent self-feedback unless anonymous
      if (toEmployeeId === (req as any).user.id && !isAnonymous) {
        res.status(400).json({ error: 'Cannot provide non-anonymous feedback to yourself' });
        return;
      }

      const feedback = await this.feedbackService.provideFeedback(
        {
          toEmployeeId,
          type,
          content,
          isAnonymous,
          visibility,
        },
        (req as any).user.id
      );

      res.status(201).json(feedback);
    } catch (error) {
      next(error);
    }
  }

  async getFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeId } = req.params;
      const feedback = await this.feedbackService.getEmployeeFeedback(employeeId);
      res.json(feedback);
    } catch (error) {
      next(error);
    }
  }

  // ============ PIP ============

  async initiatePIP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeId, goalIds, startDate, endDate } = req.body;

      // Validation
      if (!employeeId || !goalIds || !Array.isArray(goalIds) || goalIds.length === 0 || !startDate || !endDate) {
        res.status(400).json({ error: 'Missing required fields or invalid goalIds' });
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        res.status(400).json({ error: 'Start date must be before end date' });
        return;
      }

      const pip = await this.pipService.initiatePIP(
        {
          employeeId,
          goals: goalIds,
          startDate: start,
          endDate: end,
        },
        (req as any).user.id
      );

      res.status(201).json(pip);
    } catch (error) {
      next(error);
    }
  }

  async getPIP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const pip = await this.pipService.getPIP(id);
      res.json(pip);
    } catch (error) {
      next(error);
    }
  }

  async getEmployeePIPs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeId } = req.params;
      const pips = await this.pipService.getEmployeePIPs(employeeId);
      res.json(pips);
    } catch (error) {
      next(error);
    }
  }

  async recordPIPCheckIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { checkInDate, progress, notes, status } = req.body;

      if (!checkInDate || !progress || !notes || !status) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const checkIn = await this.pipService.recordCheckIn(
        id,
        {
          pipId: id,
          checkInDate: new Date(checkInDate),
          progress,
          notes,
          status,
        },
        (req as any).user.id
      );

      res.json(checkIn);
    } catch (error) {
      next(error);
    }
  }

  async recordPIPOutcome(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { outcome } = req.body;

      if (!outcome) {
        res.status(400).json({ error: 'Outcome is required' });
        return;
      }

      const pip = await this.pipService.recordOutcome(id, outcome, (req as any).user.id);
      res.json(pip);
    } catch (error) {
      next(error);
    }
  }

  // ============ Reports ============

  async generatePerformanceReports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeId, cycleId, reportType } = req.query;

      const report = await this.reviewService.generateReport({
        employeeId: employeeId as string,
        cycleId: cycleId as string,
        reportType: reportType as string,
      });

      res.json(report);
    } catch (error) {
      next(error);
    }
  }
}
