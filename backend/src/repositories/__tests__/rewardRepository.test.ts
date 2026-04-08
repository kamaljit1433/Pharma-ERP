/**
 * Reward Repository - Unit Tests
 * Tests for reward CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { RewardRepository } from '../rewardRepository';
import db from '../../config/knex';

describe('RewardRepository', () => {
  let repository: RewardRepository;
  let testRewardId: string;
  let testEmployeeId: string;

  beforeAll(async () => {
    repository = new RewardRepository(db);

    // Clean up test data
    await db('rewards').del();
    await db('employees').del();

    // Create test employee
    const [emp] = await db('employees')
      .insert({
        id: 'a1000000-0000-4000-a000-000000000007',
        employee_id: 'EMP-REWARD-001',
        first_name: 'Test',
        last_name: 'Employee',
        email: 'test@example.com',
        phone: '+1234567890',
        date_of_joining: new Date(),
        employment_type: 'permanent',
        status: 'active',
      })
      .returning('*');

    testEmployeeId = emp.id;
  });

  afterAll(async () => {
    await db('rewards').del();
    await db('employees').del();
  });

  describe('createReward', () => {
    it('should create a reward with valid data', async () => {
      const reward = await repository.createReward({
        employee_id: testEmployeeId,
        category: 'performance',
        title: 'Employee of the Month',
        description: 'Outstanding performance',
        amount: 5000,
        currency: 'USD',
        awarded_date: new Date(),
        is_public: true,
      });

      expect(reward).toBeDefined();
      expect(reward.id).toBeDefined();
      expect(reward.employee_id).toBe(testEmployeeId);
      expect(reward.category).toBe('performance');
      expect(reward.is_public).toBe(true);

      testRewardId = reward.id;
    });

    it('should create rewards with different categories', async () => {
      const categories = ['performance', 'attendance', 'innovation', 'teamwork'];

      for (const category of categories) {
        const reward = await repository.createReward({
          employee_id: testEmployeeId,
          category,
          title: `${category} Award`,
          description: `${category} recognition`,
          amount: 1000,
          currency: 'USD',
          awarded_date: new Date(),
          is_public: true,
        });

        expect(reward.category).toBe(category);
      }
    });
  });

  describe('getRewardById', () => {
    it('should retrieve reward by ID', async () => {
      const reward = await repository.getRewardById(testRewardId);

      expect(reward).toBeDefined();
      expect(reward?.id).toBe(testRewardId);
      expect(reward?.employee_id).toBe(testEmployeeId);
    });

    it('should return null for non-existent ID', async () => {
      const reward = await repository.getRewardById('00000000-0000-4000-a000-ffffffffffff');
      expect(reward).toBeNull();
    });
  });

  describe('getRewardsByEmployee', () => {
    it('should retrieve rewards by employee ID', async () => {
      const rewards = await repository.getRewardsByEmployee(testEmployeeId);

      expect(Array.isArray(rewards)).toBe(true);
      expect(rewards.length).toBeGreaterThan(0);
      rewards.forEach((r) => {
        expect(r.employee_id).toBe(testEmployeeId);
      });
    });

    it('should return empty array for non-existent employee', async () => {
      const rewards = await repository.getRewardsByEmployee('00000000-0000-4000-a000-fffffffffffe');
      expect(rewards).toEqual([]);
    });
  });

  describe('getRewardsByCategory', () => {
    it('should retrieve rewards by category', async () => {
      const rewards = await repository.getRewardsByCategory('performance');

      expect(Array.isArray(rewards)).toBe(true);
      rewards.forEach((r) => {
        expect(r.category).toBe('performance');
      });
    });
  });

  describe('getPublicRewards', () => {
    it('should retrieve only public rewards', async () => {
      const rewards = await repository.getPublicRewards();

      expect(Array.isArray(rewards)).toBe(true);
      rewards.forEach((r) => {
        expect(r.is_public).toBe(true);
      });
    });
  });

  describe('updateReward', () => {
    it('should update reward properties', async () => {
      const updated = await repository.updateReward(testRewardId, {
        title: 'Updated Award',
        amount: 7500,
      });

      expect(updated.title).toBe('Updated Award');
      expect(updated.amount).toBe(7500);
    });

    it('should update visibility', async () => {
      const updated = await repository.updateReward(testRewardId, {
        is_public: false,
      });

      expect(updated.is_public).toBe(false);
    });
  });

  describe('deleteReward', () => {
    it('should delete a reward', async () => {
      const reward = await repository.createReward({
        employee_id: testEmployeeId,
        category: 'performance',
        title: 'To Delete',
        description: 'Test',
        amount: 1000,
        currency: 'USD',
        awarded_date: new Date(),
        is_public: true,
      });

      await repository.deleteReward(reward.id);

      const deleted = await repository.getRewardById(reward.id);
      expect(deleted).toBeNull();
    });
  });

  describe('CRUD operations', () => {
    it('should support full CRUD lifecycle', async () => {
      // Create
      const created = await repository.createReward({
        employee_id: testEmployeeId,
        category: 'innovation',
        title: 'CRUD Test Award',
        description: 'CRUD test',
        amount: 2000,
        currency: 'USD',
        awarded_date: new Date(),
        is_public: true,
      });

      expect(created.id).toBeDefined();

      // Read
      const read = await repository.getRewardById(created.id);
      expect(read?.title).toBe('CRUD Test Award');

      // Update
      const updated = await repository.updateReward(created.id, {
        title: 'Updated CRUD Award',
      });

      expect(updated.title).toBe('Updated CRUD Award');

      // Delete
      await repository.deleteReward(created.id);
      const deleted = await repository.getRewardById(created.id);
      expect(deleted).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle different currencies', async () => {
      const currencies = ['USD', 'EUR', 'GBP', 'INR'];

      for (const currency of currencies) {
        const reward = await repository.createReward({
          employee_id: testEmployeeId,
          category: 'performance',
          title: `Award in ${currency}`,
          description: 'Test',
          amount: 1000,
          currency,
          awarded_date: new Date(),
          is_public: true,
        });

        expect(reward.currency).toBe(currency);
      }
    });

    it('should handle zero amount', async () => {
      const reward = await repository.createReward({
        employee_id: testEmployeeId,
        category: 'performance',
        title: 'Recognition Only',
        description: 'No monetary reward',
        amount: 0,
        currency: 'USD',
        awarded_date: new Date(),
        is_public: true,
      });

      expect(reward.amount).toBe(0);
    });

    it('should handle very large amounts', async () => {
      const reward = await repository.createReward({
        employee_id: testEmployeeId,
        category: 'performance',
        title: 'Major Award',
        description: 'Large reward',
        amount: 999999.99,
        currency: 'USD',
        awarded_date: new Date(),
        is_public: true,
      });

      expect(reward.amount).toBe(999999.99);
    });

    it('should handle long descriptions', async () => {
      const longDescription = 'A'.repeat(5000);

      const reward = await repository.createReward({
        employee_id: testEmployeeId,
        category: 'performance',
        title: 'Award',
        description: longDescription,
        amount: 1000,
        currency: 'USD',
        awarded_date: new Date(),
        is_public: true,
      });

      expect(reward.description?.length).toBe(5000);
    });

    it('should handle multiple rewards for same employee', async () => {
      const r1 = await repository.createReward({
        employee_id: testEmployeeId,
        category: 'performance',
        title: 'First Award',
        description: 'Test',
        amount: 1000,
        currency: 'USD',
        awarded_date: new Date('2024-01-01'),
        is_public: true,
      });

      const r2 = await repository.createReward({
        employee_id: testEmployeeId,
        category: 'attendance',
        title: 'Second Award',
        description: 'Test',
        amount: 500,
        currency: 'USD',
        awarded_date: new Date('2024-06-01'),
        is_public: true,
      });

      expect(r1.id).not.toBe(r2.id);

      const rewards = await repository.getRewardsByEmployee(testEmployeeId);
      expect(rewards.length).toBeGreaterThanOrEqual(2);
    });
  });
});
