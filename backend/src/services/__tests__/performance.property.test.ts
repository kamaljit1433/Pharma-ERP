import fc from 'fast-check';
import { GoalService } from '../goalService';
import { PerformanceReviewService } from '../performanceReviewService';
import { GoalRepository } from '../../repositories/goalRepository';
import { PerformanceReviewRepository } from '../../repositories/performanceReviewRepository';
import { Goal, PerformanceReview } from '../../types/performance';

/**
 * Property 36: Goal Completion Percentage Calculation
 * **Validates: Requirements 5.1.3**
 *
 * For any set of goals with weights summing to 100, the weighted completion percentage
 * should be between 0 and 100. The calculation formula is:
 * weightedCompletion = Sum of (goal.completionPercentage × goal.weight / 100)
 */
describe('Performance Module - Property 36: Goal Completion Percentage Calculation', () => {
  let goalService: GoalService;
  let goalRepository: GoalRepository;

  beforeEach(() => {
    goalRepository = {
      createGoal: jest.fn(),
      getGoalById: jest.fn(),
      getGoalsByEmployee: jest.fn(),
      getGoalsByCycle: jest.fn(),
      getGoalsByEmployeeAndCycle: jest.fn(),
      updateGoalProgress: jest.fn(),
      updateGoalStatus: jest.fn(),
      getGoalProgressHistory: jest.fn(),
      deleteGoal: jest.fn(),
    } as any;

    goalService = new GoalService(goalRepository);
  });

  it('should calculate weighted completion percentage between 0 and 100 for any valid goals', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            completionPercentage: fc.integer({ min: 0, max: 100 }),
            weight: fc.integer({ min: 1, max: 100 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (goalsData) => {
          // Normalize weights to sum to 100
          const totalWeight = goalsData.reduce((sum, g) => sum + g.weight, 0);
          const normalizedGoals: Goal[] = goalsData.map((g, idx) => ({
            id: `goal-${idx}`,
            employeeId: 'emp-001',
            cycleId: 'cycle-001',
            type: 'OKR',
            title: `Goal ${idx}`,
            description: 'Test goal',
            targetValue: 100,
            currentValue: (g.completionPercentage * 100) / 100,
            unit: 'units',
            weight: (g.weight / totalWeight) * 100,
            dueDate: new Date(),
            status: 'On Track',
            completionPercentage: g.completionPercentage,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user-001',
          }));

          // Mock the repository
          (goalRepository.getGoalsByEmployeeAndCycle as jest.Mock).mockResolvedValue(
            normalizedGoals
          );

          // Calculate weighted completion
          const result = await goalService.calculateGoalCompletionPercentage('emp-001', 'cycle-001');
          
          // Verify result is between 0 and 100
          expect(result).toBeGreaterThanOrEqual(0);
          expect(result).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return 0 for all incomplete goals', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            completionPercentage: fc.constant(0),
            weight: fc.integer({ min: 1, max: 100 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (goalsData) => {
          const totalWeight = goalsData.reduce((sum, g) => sum + g.weight, 0);
          const goals: Goal[] = goalsData.map((g, idx) => ({
            id: `goal-${idx}`,
            employeeId: 'emp-001',
            cycleId: 'cycle-001',
            type: 'OKR',
            title: `Goal ${idx}`,
            description: 'Test goal',
            targetValue: 100,
            currentValue: 0,
            unit: 'units',
            weight: (g.weight / totalWeight) * 100,
            dueDate: new Date(),
            status: 'On Track',
            completionPercentage: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user-001',
          }));

          (goalRepository.getGoalsByEmployeeAndCycle as jest.Mock).mockResolvedValue(goals);

          const result = await goalService.calculateGoalCompletionPercentage('emp-001', 'cycle-001');
          expect(result).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return 100 for all completed goals', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            completionPercentage: fc.constant(100),
            weight: fc.integer({ min: 1, max: 100 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (goalsData) => {
          const totalWeight = goalsData.reduce((sum, g) => sum + g.weight, 0);
          const goals: Goal[] = goalsData.map((g, idx) => ({
            id: `goal-${idx}`,
            employeeId: 'emp-001',
            cycleId: 'cycle-001',
            type: 'OKR',
            title: `Goal ${idx}`,
            description: 'Test goal',
            targetValue: 100,
            currentValue: 100,
            unit: 'units',
            weight: (g.weight / totalWeight) * 100,
            dueDate: new Date(),
            status: 'Completed',
            completionPercentage: 100,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'user-001',
          }));

          (goalRepository.getGoalsByEmployeeAndCycle as jest.Mock).mockResolvedValue(goals);

          const result = await goalService.calculateGoalCompletionPercentage('emp-001', 'cycle-001');
          expect(result).toBe(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle single goal correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 100 }),
        async (completionPercentage: number) => {
          const goals: Goal[] = [
            {
              id: 'goal-001',
              employeeId: 'emp-001',
              cycleId: 'cycle-001',
              type: 'OKR',
              title: 'Single Goal',
              description: 'Test goal',
              targetValue: 100,
              currentValue: completionPercentage,
              unit: 'units',
              weight: 100,
              dueDate: new Date(),
              status: 'On Track',
              completionPercentage,
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'user-001',
            },
          ];

          (goalRepository.getGoalsByEmployeeAndCycle as jest.Mock).mockResolvedValue(goals);

          const result = await goalService.calculateGoalCompletionPercentage('emp-001', 'cycle-001');
          expect(result).toBe(completionPercentage);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle unequal weights correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 1, max: 100 })
        ),
        async ([comp1, comp2, weight1, weight2]) => {
          const goals: Goal[] = [
            {
              id: 'goal-001',
              employeeId: 'emp-001',
              cycleId: 'cycle-001',
              type: 'OKR',
              title: 'Goal 1',
              description: 'Test goal',
              targetValue: 100,
              currentValue: comp1,
              unit: 'units',
              weight: (weight1 / (weight1 + weight2)) * 100,
              dueDate: new Date(),
              status: 'On Track',
              completionPercentage: comp1,
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'user-001',
            },
            {
              id: 'goal-002',
              employeeId: 'emp-001',
              cycleId: 'cycle-001',
              type: 'OKR',
              title: 'Goal 2',
              description: 'Test goal',
              targetValue: 100,
              currentValue: comp2,
              unit: 'units',
              weight: (weight2 / (weight1 + weight2)) * 100,
              dueDate: new Date(),
              status: 'On Track',
              completionPercentage: comp2,
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'user-001',
            },
          ];

          (goalRepository.getGoalsByEmployeeAndCycle as jest.Mock).mockResolvedValue(goals);

          const result = await goalService.calculateGoalCompletionPercentage('emp-001', 'cycle-001');
          
          // Manual calculation
          const totalWeight = weight1 + weight2;
          const expected = Math.round(
            ((comp1 * weight1 + comp2 * weight2) / totalWeight) * 100
          ) / 100;

          // Allow small floating point error
          expect(Math.abs(result - expected)).toBeLessThan(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return 0 for empty goals array', async () => {
    (goalRepository.getGoalsByEmployeeAndCycle as jest.Mock).mockResolvedValue([]);

    const result = await goalService.calculateGoalCompletionPercentage('emp-001', 'cycle-001');
    expect(result).toBe(0);
  });
});

/**
 * Property 37: Performance Review Final Rating
 * **Validates: Requirements 5.2.4**
 *
 * Final rating should be the weighted average of self (25%), manager (50%), and peer (25%) ratings.
 * Formula: finalRating = (selfRating × 0.25) + (managerRating × 0.50) + (avgPeerRating × 0.25)
 * Result should always be between 1 and 5 (inclusive).
 */
describe('Performance Module - Property 37: Performance Review Final Rating', () => {
  let performanceReviewService: PerformanceReviewService;
  let performanceReviewRepository: PerformanceReviewRepository;

  beforeEach(() => {
    performanceReviewRepository = {
      createPerformanceReview: jest.fn(),
      getPerformanceReviewById: jest.fn(),
      getPerformanceReviewsByEmployee: jest.fn(),
      getPerformanceReviewsByCycle: jest.fn(),
      getPerformanceReviewByEmployeeAndCycle: jest.fn(),
      updateReviewStatus: jest.fn(),
      updateFinalRating: jest.fn(),
      getReviewHistory: jest.fn(),
      deletePerformanceReview: jest.fn(),
    } as any;

    performanceReviewService = new PerformanceReviewService(performanceReviewRepository);
  });

  it('should calculate final rating as weighted average of self, manager, and peer ratings', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 1, max: 5 }),
          fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 1, maxLength: 10 })
        ),
        async ([selfRating, managerRating, peerRatings]) => {
          const review: PerformanceReview = {
            id: 'review-001',
            employeeId: 'emp-001',
            cycleId: 'cycle-001',
            comments: 'Test review',
            selfRating,
            managerRating,
            peerRatings,
            finalRating: 0,
            status: 'Pending',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          (performanceReviewRepository.getPerformanceReviewById as jest.Mock).mockResolvedValue(
            review
          );

          const result = await performanceReviewService.calculateFinalRating('review-001');
          
          // Manual calculation
          const avgPeerRating =
            peerRatings.reduce((a, b) => a + b, 0) / peerRatings.length;
          const expected =
            selfRating * 0.25 + managerRating * 0.5 + avgPeerRating * 0.25;

          expect(Math.abs(result - expected)).toBeLessThan(0.01);
          expect(result).toBeGreaterThanOrEqual(1);
          expect(result).toBeLessThanOrEqual(5);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle single peer rating', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 1, max: 5 })
        ),
        async ([selfRating, managerRating, peerRating]) => {
          const review: PerformanceReview = {
            id: 'review-001',
            employeeId: 'emp-001',
            cycleId: 'cycle-001',
            comments: 'Test review',
            selfRating,
            managerRating,
            peerRatings: [peerRating],
            finalRating: 0,
            status: 'Pending',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          (performanceReviewRepository.getPerformanceReviewById as jest.Mock).mockResolvedValue(
            review
          );

          const result = await performanceReviewService.calculateFinalRating('review-001');
          const expected =
            selfRating * 0.25 + managerRating * 0.5 + peerRating * 0.25;

          expect(Math.abs(result - expected)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle multiple peer ratings', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 1, max: 5 }),
          fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 2, maxLength: 10 })
        ),
        async ([selfRating, managerRating, peerRatings]) => {
          const review: PerformanceReview = {
            id: 'review-001',
            employeeId: 'emp-001',
            cycleId: 'cycle-001',
            comments: 'Test review',
            selfRating,
            managerRating,
            peerRatings,
            finalRating: 0,
            status: 'Pending',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          (performanceReviewRepository.getPerformanceReviewById as jest.Mock).mockResolvedValue(
            review
          );

          const result = await performanceReviewService.calculateFinalRating('review-001');
          
          const avgPeerRating =
            peerRatings.reduce((a, b) => a + b, 0) / peerRatings.length;
          const expected =
            selfRating * 0.25 + managerRating * 0.5 + avgPeerRating * 0.25;

          expect(Math.abs(result - expected)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return value between 1 and 5', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 1, max: 5 }),
          fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 1, maxLength: 10 })
        ),
        async ([selfRating, managerRating, peerRatings]) => {
          const review: PerformanceReview = {
            id: 'review-001',
            employeeId: 'emp-001',
            cycleId: 'cycle-001',
            comments: 'Test review',
            selfRating,
            managerRating,
            peerRatings,
            finalRating: 0,
            status: 'Pending',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          (performanceReviewRepository.getPerformanceReviewById as jest.Mock).mockResolvedValue(
            review
          );

          const result = await performanceReviewService.calculateFinalRating('review-001');
          expect(result).toBeGreaterThanOrEqual(1);
          expect(result).toBeLessThanOrEqual(5);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle all same ratings', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),
        async (rating: number) => {
          const review: PerformanceReview = {
            id: 'review-001',
            employeeId: 'emp-001',
            cycleId: 'cycle-001',
            comments: 'Test review',
            selfRating: rating,
            managerRating: rating,
            peerRatings: [rating, rating, rating],
            finalRating: 0,
            status: 'Pending',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          (performanceReviewRepository.getPerformanceReviewById as jest.Mock).mockResolvedValue(
            review
          );

          const result = await performanceReviewService.calculateFinalRating('review-001');
          expect(Math.abs(result - rating)).toBeLessThan(0.01);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should handle extreme rating combinations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 1, max: 5 }),
          fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 1, maxLength: 10 })
        ),
        async ([selfRating, managerRating, peerRatings]) => {
          const review: PerformanceReview = {
            id: 'review-001',
            employeeId: 'emp-001',
            cycleId: 'cycle-001',
            comments: 'Test review',
            selfRating,
            managerRating,
            peerRatings,
            finalRating: 0,
            status: 'Pending',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          (performanceReviewRepository.getPerformanceReviewById as jest.Mock).mockResolvedValue(
            review
          );

          const result = await performanceReviewService.calculateFinalRating('review-001');
          
          // Result should be between min and max of all ratings
          const allRatings = [selfRating, managerRating, ...peerRatings];
          const minRating = Math.min(...allRatings);
          const maxRating = Math.max(...allRatings);

          expect(result).toBeGreaterThanOrEqual(minRating);
          expect(result).toBeLessThanOrEqual(maxRating);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain mathematical correctness with weighted formula', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 1, max: 5 }),
          fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 1, maxLength: 5 })
        ),
        async ([selfRating, managerRating, peerRatings]) => {
          const review: PerformanceReview = {
            id: 'review-001',
            employeeId: 'emp-001',
            cycleId: 'cycle-001',
            comments: 'Test review',
            selfRating,
            managerRating,
            peerRatings,
            finalRating: 0,
            status: 'Pending',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          (performanceReviewRepository.getPerformanceReviewById as jest.Mock).mockResolvedValue(
            review
          );

          const result = await performanceReviewService.calculateFinalRating('review-001');
          
          // Verify weights sum to 1.0 (0.25 + 0.50 + 0.25 = 1.0)
          const avgPeerRating =
            peerRatings.reduce((a, b) => a + b, 0) / peerRatings.length;
          const manualCalculation =
            selfRating * 0.25 + managerRating * 0.5 + avgPeerRating * 0.25;

          // Result should match manual calculation
          expect(Math.abs(result - manualCalculation)).toBeLessThan(0.01);

          // Verify the result is a valid weighted average
          expect(result).toBeGreaterThanOrEqual(1);
          expect(result).toBeLessThanOrEqual(5);
        }
      ),
      { numRuns: 100 }
    );
  });
});

