/**
 * Goal Repository - Unit Tests
 * Tests for OKR/KPI goal CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import db from '../../config/knex';

describe('Goal Operations', () => {
  const testEmployeeId = 'a0000000-0000-4000-a000-000000000001';
  let testGoalId: string;

  beforeAll(async () => {
    await db('goals').del();
    // Create test employee (FK requirement)
    await db('employees')
      .insert({
        id: testEmployeeId,
        employee_id: 'EMP-TEST-001',
        first_name: 'Test',
        last_name: 'Employee',
        email: 'test.employee@example.com',
        phone: '+1234567890',
        date_of_joining: new Date(),
        employment_type: 'permanent',
        status: 'active',
      })
      .onConflict('id')
      .ignore();
  });

  afterAll(async () => {
    await db('employees').del();
    await db('goals').del();
  });

  describe('Create Goal', () => {
    it('should create a goal', async () => {
      const [goal] = await db('goals')
        .insert({
          employee_id: testEmployeeId,
          title: 'Increase sales by 20%',
          description: 'Target to increase quarterly sales',
          goal_type: 'okr',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          target_value: 100,
          current_progress: 0,
          status: 'active',
        })
        .returning('*');

      expect(goal).toBeDefined();
      expect(goal.id).toBeDefined();
      expect(goal.employee_id).toBe(testEmployeeId);
      expect(goal.status).toBe('active');
      expect(goal.current_progress).toBe(0);

      testGoalId = goal.id;
    });

    it('should support different goal types', async () => {
      const types = ['okr', 'kpi', 'project', 'personal'];

      for (const type of types) {
        const [goal] = await db('goals')
          .insert({
            employee_id: testEmployeeId,
            title: `${type} goal`,
            goal_type: type,
            start_date: new Date().toISOString().split('T')[0],
            status: 'active',
          })
          .returning('*');

        expect(goal.goal_type).toBe(type);
      }
    });
  });

  describe('Retrieve Goal', () => {
    it('should retrieve goal by ID', async () => {
      const goal = await db('goals')
        .where({ id: testGoalId })
        .first();

      expect(goal).toBeDefined();
      expect(goal.id).toBe(testGoalId);
    });

    it('should retrieve goals for employee', async () => {
      const goals = await db('goals')
        .where({ employee_id: testEmployeeId });

      expect(Array.isArray(goals)).toBe(true);
      expect(goals.every((g) => g.employee_id === testEmployeeId)).toBe(true);
    });

    it('should return empty array for employee with no goals', async () => {
      const goals = await db('goals')
        .where({ employee_id: 'emp-no-goals' });

      expect(Array.isArray(goals)).toBe(true);
      expect(goals.length).toBe(0);
    });
  });

  describe('Update Goal', () => {
    it('should update goal progress', async () => {
      await db('goals').where({ id: testGoalId }).update({
        current_progress: 50,
      });

      const updated = await db('goals')
        .where({ id: testGoalId })
        .first();

      expect(updated.current_progress).toBe(50);
    });

    it('should update goal status', async () => {
      await db('goals').where({ id: testGoalId }).update({
        status: 'completed',
      });

      const updated = await db('goals')
        .where({ id: testGoalId })
        .first();

      expect(updated.status).toBe('completed');
    });

    it('should update goal details', async () => {
      await db('goals').where({ id: testGoalId }).update({
        description: 'Updated description',
        target_value: 150,
      });

      const updated = await db('goals')
        .where({ id: testGoalId })
        .first();

      expect(updated.description).toBe('Updated description');
      expect(updated.target_value).toBe(150);
    });
  });

  describe('Delete Goal', () => {
    it('should delete a goal', async () => {
      const [goal] = await db('goals')
        .insert({
          employee_id: testEmployeeId,
          title: 'Temp Goal',
          goal_type: 'okr',
          start_date: new Date().toISOString().split('T')[0],
          status: 'active',
        })
        .returning('*');

      await db('goals').where({ id: goal.id }).del();

      const deleted = await db('goals')
        .where({ id: goal.id })
        .first();

      expect(deleted).toBeUndefined();
    });
  });

  describe('Query Goals', () => {
    it('should retrieve goals by status', async () => {
      const goals = await db('goals')
        .where({ status: 'active' });

      expect(Array.isArray(goals)).toBe(true);
      expect(goals.every((g) => g.status === 'active')).toBe(true);
    });

    it('should retrieve goals by type', async () => {
      const goals = await db('goals')
        .where({ goal_type: 'okr' });

      expect(Array.isArray(goals)).toBe(true);
      expect(goals.every((g) => g.goal_type === 'okr')).toBe(true);
    });

    it('should retrieve goals by date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();

      const goals = await db('goals')
        .whereRaw('start_date >= ?', [startDate.toISOString().split('T')[0]])
        .whereRaw('start_date <= ?', [endDate.toISOString().split('T')[0]]);

      expect(Array.isArray(goals)).toBe(true);
    });
  });

  describe('Goal Progress Tracking', () => {
    it('should calculate progress percentage', async () => {
      const goal = await db('goals')
        .where({ id: testGoalId })
        .first();

      const progressPercentage = (goal.current_progress / goal.target_value) * 100;
      expect(progressPercentage).toBeGreaterThanOrEqual(0);
      expect(progressPercentage).toBeLessThanOrEqual(100);
    });

    it('should identify on-track goals', async () => {
      const goals = await db('goals')
        .where({ employee_id: testEmployeeId })
        .where('current_progress', '>=', 50);

      expect(Array.isArray(goals)).toBe(true);
    });

    it('should identify at-risk goals', async () => {
      const goals = await db('goals')
        .where({ employee_id: testEmployeeId })
        .where('current_progress', '<', 50)
        .where({ status: 'active' });

      expect(Array.isArray(goals)).toBe(true);
    });
  });

  describe('Goal Comments', () => {
    it('should add goal comment', async () => {
      const [comment] = await db('goal_comments')
        .insert({
          goal_id: testGoalId,
          employee_id: testEmployeeId,
          comment_text: 'Good progress so far',
          created_at: new Date(),
        })
        .returning('*');

      expect(comment).toBeDefined();
      expect(comment.goal_id).toBe(testGoalId);
    });

    it('should retrieve goal comments', async () => {
      const comments = await db('goal_comments')
        .where({ goal_id: testGoalId });

      expect(Array.isArray(comments)).toBe(true);
    });
  });
});
