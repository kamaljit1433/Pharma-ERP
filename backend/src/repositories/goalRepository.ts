import { Knex } from 'knex';
import { Goal, CreateGoalDTO, UpdateGoalProgressDTO } from '../types/performance';

export class GoalRepository {
  constructor(private db: Knex) {}

  async createGoal(data: CreateGoalDTO & { createdBy?: string }): Promise<Goal> {
    const insertData: any = {
      employee_id: data.employeeId,
      cycle_id: data.cycleId,
      type: data.type,
      title: data.title,
      description: data.description,
      target_value: data.targetValue,
      current_value: 0,
      unit: data.unit,
      weight: data.weight,
      due_date: data.dueDate,
      status: 'On Track',
      completion_percentage: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const rows = await this.db('goals').insert(insertData).returning('id');

    const id = Array.isArray(rows) ? (rows[0]?.id ?? rows[0]) : rows;
    if (!id) {
      throw new Error('Failed to create goal');
    }
    return this.getGoalById(String(id)) as Promise<Goal>;
  }

  async getGoalById(id: string): Promise<Goal | null> {
    const goal = await this.db('goals').where('id', id).first();

    if (!goal) {
      return null;
    }

    return this.mapGoal(goal);
  }

  async getAllGoals(): Promise<Goal[]> {
    const goals = await this.db('goals').orderBy('created_at', 'desc');
    return goals.map((goal) => this.mapGoal(goal));
  }

  async getGoalsByEmployee(employeeId: string): Promise<Goal[]> {
    const goals = await this.db('goals').where('employee_id', employeeId);
    return goals.map((goal) => this.mapGoal(goal));
  }

  async getGoalsByCycle(cycleId: string): Promise<Goal[]> {
    const goals = await this.db('goals').where('cycle_id', cycleId);
    return goals.map((goal) => this.mapGoal(goal));
  }

  async getGoalsByEmployeeAndCycle(employeeId: string, cycleId: string): Promise<Goal[]> {
    const goals = await this.db('goals')
      .where('employee_id', employeeId)
      .where('cycle_id', cycleId);
    return goals.map((goal) => this.mapGoal(goal));
  }

  async updateGoalProgress(
    goalId: string,
    data: UpdateGoalProgressDTO & { updatedBy: string }
  ): Promise<Goal> {
    const goal = await this.getGoalById(goalId);
    if (!goal) {
      throw new Error(`Goal with ID ${goalId} not found`);
    }

    // Calculate completion percentage
    const completionPercentage = Math.min(
      100,
      Math.round((data.currentValue / goal.targetValue) * 100)
    );

    // Determine status based on completion
    let status = 'On Track';
    if (completionPercentage >= 100) {
      status = 'Completed';
    } else if (completionPercentage >= 75) {
      status = 'On Track';
    } else if (completionPercentage >= 50) {
      status = 'At Risk';
    } else {
      status = 'Behind';
    }

    await this.db('goals').where('id', goalId).update({
      current_value: data.currentValue,
      completion_percentage: completionPercentage,  // column added in migration
      status,
      updated_at: new Date(),
    });

    // Record progress history
    if (data.comment) {
      await this.db('goal_progress_history').insert({
        goal_id: goalId,
        previous_value: goal.currentValue,
        new_value: data.currentValue,
        completion_percentage: completionPercentage,
        comment: data.comment,
        recorded_by: data.updatedBy,
        recorded_at: new Date(),
      });
    }

    return this.getGoalById(goalId) as Promise<Goal>;
  }

  async updateGoalFull(goalId: string, data: {
    title?: string;
    description?: string;
    type?: string;
    targetValue?: number;
    unit?: string;
    weight?: number;
    dueDate?: Date;
    status?: string;
  }): Promise<Goal> {
    const update: any = { updated_at: new Date() };
    if (data.title       !== undefined) update.title        = data.title;
    if (data.description !== undefined) update.description  = data.description;
    if (data.type        !== undefined) update.type         = data.type;
    if (data.targetValue !== undefined) update.target_value = data.targetValue;
    if (data.unit        !== undefined) update.unit         = data.unit;
    if (data.weight      !== undefined) update.weight       = data.weight;
    if (data.dueDate     !== undefined) update.due_date     = data.dueDate;
    if (data.status      !== undefined) update.status       = data.status;
    await this.db('goals').where('id', goalId).update(update);
    return this.getGoalById(goalId) as Promise<Goal>;
  }

  async updateGoalStatus(goalId: string, status: string): Promise<void> {
    await this.db('goals').where('id', goalId).update({
      status,
      updated_at: new Date(),
    });
  }

  async getGoalProgressHistory(goalId: string): Promise<any[]> {
    return this.db('goal_progress_history').where('goal_id', goalId).orderBy('recorded_at', 'asc');
  }

  async deleteGoal(goalId: string): Promise<void> {
    await this.db('goals').where('id', goalId).delete();
  }

  private mapGoal(dbGoal: any): Goal {
    return {
      id: dbGoal.id,
      employeeId: dbGoal.employee_id,
      cycleId: dbGoal.cycle_id,
      type: dbGoal.type,
      title: dbGoal.title,
      description: dbGoal.description,
      targetValue: dbGoal.target_value,
      currentValue: dbGoal.current_value,
      unit: dbGoal.unit,
      weight: dbGoal.weight,
      dueDate: new Date(dbGoal.due_date),
      status: dbGoal.status,
      completionPercentage: dbGoal.completion_percentage,
      createdAt: new Date(dbGoal.created_at),
      updatedAt: new Date(dbGoal.updated_at),
      createdBy: dbGoal.created_by,
    };
  }
}
