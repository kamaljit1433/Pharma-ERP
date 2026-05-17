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

const VALID_PIP_OUTCOMES = ['Completed', 'Extended', 'Escalated'] as const;
type PIPOutcome = typeof VALID_PIP_OUTCOMES[number];

export class PerformanceController {
  private knex: Knex;
  private goalService: GoalService;
  private reviewService: PerformanceReviewService;
  private feedbackService: FeedbackService;
  private pipService: PIPService;
  private reviewCycleRepository: ReviewCycleRepository;

  constructor(knex: Knex) {
    this.knex = knex;
    this.reviewCycleRepository = new ReviewCycleRepository(knex);

    this.goalService = new GoalService(new GoalRepository(knex));
    this.reviewService = new PerformanceReviewService(new PerformanceReviewRepository(knex));
    this.feedbackService = new FeedbackService(new FeedbackRepository(knex));
    this.pipService = new PIPService(new PIPRepository(knex), new GoalRepository(knex));
  }

  // ============ Goals ============

  async createGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeId, cycleId, type, title, description, targetValue, unit, weight, dueDate } =
        req.body;

      if (!employeeId || !cycleId || !type || !title || targetValue === undefined || weight === undefined || !dueDate) {
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
        { employeeId, cycleId, type, title, description, targetValue, unit, weight, dueDate: new Date(dueDate) },
        (req as any).user.id
      );

      res.status(201).json(goal);
    } catch (error) {
      return next(error);
    }
  }

  async listGoals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const goalRepository = new GoalRepository(this.knex);
      const goals = await goalRepository.getAllGoals();
      res.json(goals);
    } catch (error) {
      return next(error);
    }
  }

  async getGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string;
      if (!id) { res.status(400).json({ error: 'Goal ID is required' }); return; }
      const goal = await this.goalService.getGoal(id);
      res.json(goal);
    } catch (error) {
      return next(error);
    }
  }

  async getEmployeeGoals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.params['employeeId'] as string;
      if (!employeeId) { res.status(400).json({ error: 'Employee ID is required' }); return; }
      const goals = await this.goalService.getEmployeeGoals(employeeId);
      res.json(goals);
    } catch (error) {
      return next(error);
    }
  }

  async updateGoalProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string;
      if (!id) { res.status(400).json({ error: 'Goal ID is required' }); return; }
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
      return next(error);
    }
  }

  async updateGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string;
      if (!id) { res.status(400).json({ error: 'Goal ID is required' }); return; }
      const { title, description, type, targetValue, unit, weight, dueDate, status } = req.body;
      const goalRepository = new GoalRepository(this.knex);
      const goal = await goalRepository.updateGoalFull(id, {
        title,
        description,
        type,
        targetValue: targetValue !== undefined ? Number(targetValue) : undefined,
        unit,
        weight: weight !== undefined ? Number(weight) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status,
      });
      res.json(goal);
    } catch (error) {
      return next(error);
    }
  }

  async deleteGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string;
      if (!id) { res.status(400).json({ error: 'Goal ID is required' }); return; }
      await this.goalService.deleteGoal(id);
      res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  // ============ Review Cycles ============

  async createReviewCycle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, startDate, endDate, selfReviewDeadline, managerReviewDeadline, peerReviewDeadline } =
        req.body;

      if (!name || !startDate || !endDate) {
        res.status(400).json({ error: 'Missing required fields: name, startDate, endDate' });
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        res.status(400).json({ error: 'Start date must be before end date' });
        return;
      }

      const selfDeadline = selfReviewDeadline ? new Date(selfReviewDeadline) : undefined;
      const managerDeadline = managerReviewDeadline ? new Date(managerReviewDeadline) : undefined;
      const peerDeadline = peerReviewDeadline ? new Date(peerReviewDeadline) : undefined;

      if (selfDeadline && selfDeadline > end) {
        res.status(400).json({ error: 'Self-review deadline must be on or before end date' });
        return;
      }
      if (peerDeadline && peerDeadline > end) {
        res.status(400).json({ error: 'Peer review deadline must be on or before end date' });
        return;
      }
      if (managerDeadline && managerDeadline > end) {
        res.status(400).json({ error: 'Manager review deadline must be on or before end date' });
        return;
      }

      const cycle = await this.reviewCycleRepository.createReviewCycle({
        name,
        startDate: start,
        endDate: end,
        selfReviewDeadline: selfDeadline,
        managerReviewDeadline: managerDeadline,
        peerReviewDeadline: peerDeadline,
        createdBy: undefined,
      });

      res.status(201).json(cycle);
    } catch (error) {
      return next(error);
    }
  }

  async getReviewCycle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string;
      if (!id) { res.status(400).json({ error: 'Cycle ID is required' }); return; }
      const cycle = await this.reviewCycleRepository.getReviewCycleById(id);
      if (!cycle) { res.status(404).json({ error: 'Review cycle not found' }); return; }
      res.json(cycle);
    } catch (error) {
      return next(error);
    }
  }

  async listReviewCycles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.query;
      const cycles = status
        ? await this.reviewCycleRepository.getCyclesByStatus(status as string)
        : await this.reviewCycleRepository.getAllReviewCycles();
      res.json(cycles);
    } catch (error) {
      return next(error);
    }
  }

  async updateReviewCycle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string;
      if (!id) { res.status(400).json({ error: 'Cycle ID is required' }); return; }
      const { name, startDate, endDate } = req.body;
      const updateData: any = {};
      if (name) updateData.name = name;
      if (startDate) updateData.start_date = new Date(startDate);
      if (endDate) updateData.end_date = new Date(endDate);
      const cycle = await this.reviewCycleRepository.updateReviewCycle(id, updateData);
      if (!cycle) { res.status(404).json({ error: 'Review cycle not found' }); return; }
      res.json(cycle);
    } catch (error) {
      return next(error);
    }
  }

  async transitionCycleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string;
      if (!id) { res.status(400).json({ error: 'Cycle ID is required' }); return; }
      const { status } = req.body;
      const VALID_STATUSES = ['Planning', 'Active', 'Closed', 'Finalized'];
      if (!status || !VALID_STATUSES.includes(status)) {
        res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
        return;
      }
      await this.reviewCycleRepository.updateReviewCycleStatus(id, status);
      const cycle = await this.reviewCycleRepository.getReviewCycleById(id);
      res.json(cycle);
    } catch (error) {
      return next(error);
    }
  }

  async deleteReviewCycle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string;
      if (!id) { res.status(400).json({ error: 'Cycle ID is required' }); return; }
      await this.reviewCycleRepository.deleteReviewCycle(id);
      res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  // ============ Performance Reviews ============

  async submitReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeId, cycleId, reviewType, rating, comments, reviewerId } = req.body;

      if (!employeeId || !cycleId || !reviewType || rating === undefined || !comments) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      if (rating < 1 || rating > 5) {
        res.status(400).json({ error: 'Rating must be between 1 and 5' });
        return;
      }

      const user = (req as any).user;
      let resolvedReviewerId = reviewerId;
      if (!resolvedReviewerId) {
        const reviewerEmployee = await this.knex('employees')
          .where({ employee_id: user.employeeId })
          .select('id')
          .first();
        resolvedReviewerId = reviewerEmployee?.id;
      }
      if (!resolvedReviewerId) {
        res.status(400).json({ error: 'Could not resolve reviewer employee record' });
        return;
      }

      const review = await this.reviewService.submitReview(
        { employeeId, cycleId, reviewType, rating, comments, reviewerId: resolvedReviewerId },
        user.id
      );

      res.status(201).json(review);
    } catch (error) {
      return next(error);
    }
  }

  async listReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviews = await this.reviewService.getAllReviews();
      res.json(reviews);
    } catch (error) {
      return next(error);
    }
  }

  async deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string;
      if (!id) { res.status(400).json({ error: 'Review ID is required' }); return; }
      await this.reviewService.deleteReview(id);
      res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  async getReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string;
      if (!id) { res.status(400).json({ error: 'Review ID is required' }); return; }
      const review = await this.reviewService.getReview(id);
      res.json(review);
    } catch (error) {
      return next(error);
    }
  }

  async getEmployeeReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.params['employeeId'] as string;
      if (!employeeId) { res.status(400).json({ error: 'Employee ID is required' }); return; }
      const reviews = await this.reviewService.getEmployeeReviews(employeeId);
      res.json(reviews);
    } catch (error) {
      return next(error);
    }
  }

  async updateReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string;
      if (!id) { res.status(400).json({ error: 'Review ID is required' }); return; }
      const reviewRepository = new PerformanceReviewRepository(this.knex);
      await reviewRepository.updateReview(id, req.body);
      const review = await this.reviewService.getReview(id);
      res.json(review);
    } catch (error) {
      return next(error);
    }
  }

  // ============ Feedback ============

  async listFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const feedback = await this.feedbackService.getAllFeedback();
      res.json(feedback);
    } catch (error) {
      return next(error);
    }
  }

  async updateFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string;
      if (!id) { res.status(400).json({ error: 'Feedback ID is required' }); return; }
      const { type, content, visibility } = req.body;
      const updated = await this.feedbackService.updateFeedback(id, { type, content, visibility });
      res.json(updated);
    } catch (error) {
      return next(error);
    }
  }

  async deleteFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string;
      if (!id) { res.status(400).json({ error: 'Feedback ID is required' }); return; }
      await this.feedbackService.deleteFeedback(id);
      res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  async provideFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { toEmployeeId, type, content, isAnonymous, visibility } = req.body;

      if (!toEmployeeId || !type || !content || isAnonymous === undefined || !visibility) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      if (content.length < 10 || content.length > 5000) {
        res.status(400).json({ error: 'Content must be between 10 and 5000 characters' });
        return;
      }

      const user = (req as any).user;
      const fromEmployee = await this.knex('employees')
        .where({ employee_id: user.employeeId })
        .select('id')
        .first();
      const fromEmployeeId = fromEmployee?.id;
      if (!fromEmployeeId) {
        res.status(400).json({ error: 'Could not resolve sender employee record' });
        return;
      }

      if (toEmployeeId === fromEmployeeId && !isAnonymous) {
        res.status(400).json({ error: 'Cannot provide non-anonymous feedback to yourself' });
        return;
      }

      const feedback = await this.feedbackService.provideFeedback(
        toEmployeeId,
        type,
        content,
        isAnonymous,
        visibility,
        fromEmployeeId
      );

      res.status(201).json(feedback);
    } catch (error) {
      return next(error);
    }
  }

  async getFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.params['employeeId'] as string;
      if (!employeeId) { res.status(400).json({ error: 'Employee ID is required' }); return; }
      const feedback = await this.feedbackService.getEmployeeFeedback(employeeId);
      res.json(feedback);
    } catch (error) {
      return next(error);
    }
  }

  // ============ PIP ============

  async initiatePIP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { employeeId, goalIds, startDate, endDate } = req.body;

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
        { employeeId, goals: goalIds, startDate: start, endDate: end },
        (req as any).user.id
      );

      res.status(201).json(pip);
    } catch (error) {
      return next(error);
    }
  }

  async getPIP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string;
      if (!id) { res.status(400).json({ error: 'PIP ID is required' }); return; }
      const pip = await this.pipService.getPIP(id);
      res.json(pip);
    } catch (error) {
      return next(error);
    }
  }

  async getEmployeePIPs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employeeId = req.params['employeeId'] as string;
      if (!employeeId) { res.status(400).json({ error: 'Employee ID is required' }); return; }
      const pips = await this.pipService.getEmployeePIPs(employeeId);
      res.json(pips);
    } catch (error) {
      return next(error);
    }
  }

  async getActivePIPs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pips = await this.pipService.getActivePIPs();
      res.json(pips);
    } catch (error) {
      return next(error);
    }
  }

  async recordPIPCheckIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string;
      if (!id) { res.status(400).json({ error: 'PIP ID is required' }); return; }
      const { checkInDate, progress, notes, status } = req.body;

      if (!checkInDate || !progress || !notes || !status) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const checkIn = await this.pipService.recordCheckIn(
        id,
        { pipId: id, checkInDate: new Date(checkInDate), progress, notes, status },
        (req as any).user.id
      );

      res.json(checkIn);
    } catch (error) {
      return next(error);
    }
  }

  async recordPIPOutcome(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params['id'] as string;
      if (!id) { res.status(400).json({ error: 'PIP ID is required' }); return; }
      const { outcome } = req.body;

      if (!outcome) {
        res.status(400).json({ error: 'Outcome is required' });
        return;
      }

      if (!VALID_PIP_OUTCOMES.includes(outcome as PIPOutcome)) {
        res.status(400).json({ error: `Outcome must be one of: ${VALID_PIP_OUTCOMES.join(', ')}` });
        return;
      }

      const pip = await this.pipService.recordOutcome(id, outcome as PIPOutcome, (req as any).user.id);
      res.json(pip);
    } catch (error) {
      return next(error);
    }
  }

  // ============ Dashboard ============

  async getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const knex = this.knex;

      const [
        activeReviewCycles,
        pendingReviews,
        activePIPs,
        recentFeedback,
        goalRows,
        ratingRows,
        feedbackVisibility,
      ] = await Promise.all([
        knex('review_cycles').where('status', 'Active').count('id as count').first(),
        knex('performance_reviews').where('status', 'Pending').count('id as count').first(),
        knex('pips').where('status', 'Active').count('id as count').first(),
        knex('feedback')
          .where('created_at', '>=', knex.raw("NOW() - INTERVAL '30 days'"))
          .select('visibility')
          .count('id as count')
          .groupBy('visibility'),
        knex('goals')
          .select('status', 'completion_percentage')
          .whereIn('status', ['On Track', 'At Risk', 'Behind', 'Completed']),
        knex('performance_reviews')
          .whereNotNull('rating')
          .select('rating')
          .count('id as count')
          .groupBy('rating')
          .orderBy('rating'),
        knex('feedback')
          .select('visibility')
          .count('id as count')
          .groupBy('visibility'),
      ]);

      const goalCompletionStats = { completed: 0, onTrack: 0, atRisk: 0, behind: 0 };
      for (const g of goalRows) {
        if (g.status === 'Completed') goalCompletionStats.completed++;
        else if (g.status === 'On Track') goalCompletionStats.onTrack++;
        else if (g.status === 'At Risk') goalCompletionStats.atRisk++;
        else goalCompletionStats.behind++;
      }

      const feedbackSentiment = { positive: 0, constructive: 0, neutral: 0 };
      for (const row of feedbackVisibility as any[]) {
        const c = Number(row.count);
        if (row.visibility === 'Public') feedbackSentiment.positive += c;
        else if (row.visibility === 'Manager Only') feedbackSentiment.constructive += c;
        else feedbackSentiment.neutral += c;
      }

      res.json({
        activeReviewCycles: Number((activeReviewCycles as any)?.count || 0),
        pendingReviews: Number((pendingReviews as any)?.count || 0),
        activePIPs: Number((activePIPs as any)?.count || 0),
        recentFeedback: (recentFeedback as any[]).map((r) => ({
          id: r.visibility,
          type: r.visibility,
          count: Number(r.count),
        })),
        goalCompletionStats,
        reviewRatingsDistribution: (ratingRows as any[]).map((r) => ({
          rating: Number(r.rating),
          count: Number(r.count),
        })),
        feedbackSentiment,
      });
    } catch (error) {
      return next(error);
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
      return next(error);
    }
  }
}
