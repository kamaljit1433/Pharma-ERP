import { GoalRepository } from '../repositories/goalRepository';
import { Goal, CreateGoalDTO, UpdateGoalProgressDTO } from '../types/performance';

export class GoalService {
  constructor(private goalRepository: GoalRepository) {}

  async createGoal(data: CreateGoalDTO, userId: string): Promise<Goal> {
    // Validate input
    if (!data.employeeId || !data.cycleId) {
      throw new Error('Employee ID and Cycle ID are required');
    }

    if (data.weight < 0 || data.weight > 100) {
      throw new Error('Goal weight must be between 0 and 100');
    }

    if (data.targetValue <= 0) {
      throw new Error('Target value must be greater than 0');
    }

    return this.goalRepository.createGoal({
      ...data,
      createdBy: userId,
    });
  }

  async getGoal(goalId: string): Promise<Goal> {
    const goal = await this.goalRepository.getGoalById(goalId);
    if (!goal) {
      throw new Error(`Goal with ID ${goalId} not found`);
    }
    return goal;
  }

  async getEmployeeGoals(employeeId: string): Promise<Goal[]> {
    return this.goalRepository.getGoalsByEmployee(employeeId);
  }

  async getCycleGoals(cycleId: string): Promise<Goal[]> {
    return this.goalRepository.getGoalsByCycle(cycleId);
  }

  async getEmployeeCycleGoals(employeeId: string, cycleId: string): Promise<Goal[]> {
    return this.goalRepository.getGoalsByEmployeeAndCycle(employeeId, cycleId);
  }

  async updateGoalProgress(
    goalId: string,
    data: UpdateGoalProgressDTO,
    userId: string
  ): Promise<Goal> {
    const goal = await this.getGoal(goalId);

    if (data.currentValue < 0) {
      throw new Error('Current value cannot be negative');
    }

    if (data.currentValue > goal.targetValue * 1.5) {
      // Allow up to 150% of target
      throw new Error('Current value exceeds reasonable limit (150% of target)');
    }

    return this.goalRepository.updateGoalProgress(goalId, {
      ...data,
      updatedBy: userId,
    });
  }

  /**
   * Calculate overall goal completion percentage for an employee in a cycle
   * Formula: Sum of (individual goal completion % × goal weight / 100)
   */
  async calculateGoalCompletionPercentage(employeeId: string, cycleId: string): Promise<number> {
    const goals = await this.getEmployeeCycleGoals(employeeId, cycleId);

    if (goals.length === 0) {
      return 0;
    }

    // Validate that weights sum to 100
    const totalWeight = goals.reduce((sum, goal) => sum + goal.weight, 0);
    if (totalWeight === 0) {
      return 0;
    }

    // Calculate weighted completion percentage
    const weightedCompletion = goals.reduce((sum, goal) => {
      return sum + (goal.completionPercentage * goal.weight) / 100;
    }, 0);

    // Normalize to 100 if weights don't sum to 100
    return Math.round((weightedCompletion * 100) / totalWeight);
  }

  /**
   * Cascade goals from company level to individual level
   * This creates individual goals based on company-level goals
   */
  async cascadeGoals(
    companyGoalId: string,
    employeeIds: string[],
    cycleId: string,
    userId: string
  ): Promise<Goal[]> {
    const companyGoal = await this.getGoal(companyGoalId);

    const cascadedGoals: Goal[] = [];

    for (const employeeId of employeeIds) {
      const cascadedGoal = await this.createGoal(
        {
          employeeId,
          cycleId,
          type: companyGoal.type,
          title: `${companyGoal.title} (Cascaded)`,
          description: `Cascaded from company goal: ${companyGoal.description}`,
          targetValue: companyGoal.targetValue,
          unit: companyGoal.unit,
          weight: companyGoal.weight,
          dueDate: companyGoal.dueDate,
        },
        userId
      );

      cascadedGoals.push(cascadedGoal);
    }

    return cascadedGoals;
  }

  async getGoalProgressHistory(goalId: string): Promise<any[]> {
    return this.goalRepository.getGoalProgressHistory(goalId);
  }

  async deleteGoal(goalId: string): Promise<void> {
    await this.goalRepository.deleteGoal(goalId);
  }
}
