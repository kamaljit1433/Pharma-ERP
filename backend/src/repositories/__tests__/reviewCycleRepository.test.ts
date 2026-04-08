/**
 * Review Cycle Repository - Unit Tests
 * Tests for review cycle CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { ReviewCycleRepository } from '../reviewCycleRepository';
import db from '../../config/knex';

describe('ReviewCycleRepository', () => {
  let repository: ReviewCycleRepository;
  let testCycleId: string;

  beforeAll(async () => {
    repository = new ReviewCycleRepository(db);
    await db('review_cycles').del();
  });

  afterAll(async () => {
    await db('review_cycles').del();
  });

  describe('createCycle', () => {
    it('should create a review cycle with valid data', async () => {
      const cycle = await repository.createCycle({
        name: 'Q1 2024 Review',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-03-31'),
        status: 'draft',
      });

      expect(cycle).toBeDefined();
      expect(cycle.id).toBeDefined();
      expect(cycle.name).toBe('Q1 2024 Review');
      expect(cycle.status).toBe('draft');

      testCycleId = cycle.id;
    });

    it('should create cycles with different statuses', async () => {
      const statuses = ['draft', 'active', 'closed'];

      for (const status of statuses) {
        const cycle = await repository.createCycle({
          name: `${status} Cycle`,
          start_date: new Date(),
          end_date: new Date(),
          status: status as any,
        });

        expect(cycle.status).toBe(status);
      }
    });
  });

  describe('getCycleById', () => {
    it('should retrieve cycle by ID', async () => {
      const cycle = await repository.getCycleById(testCycleId);

      expect(cycle).toBeDefined();
      expect(cycle?.id).toBe(testCycleId);
      expect(cycle?.name).toBe('Q1 2024 Review');
    });

    it('should return null for non-existent ID', async () => {
      const cycle = await repository.getCycleById('00000000-0000-4000-a000-ffffffffffff');
      expect(cycle).toBeNull();
    });
  });

  describe('getCycleByName', () => {
    it('should retrieve cycle by name', async () => {
      const cycle = await repository.getCycleByName('Q1 2024 Review');

      expect(cycle).toBeDefined();
      expect(cycle?.name).toBe('Q1 2024 Review');
    });

    it('should return null for non-existent name', async () => {
      const cycle = await repository.getCycleByName('Non Existent Cycle');
      expect(cycle).toBeNull();
    });
  });

  describe('getAllCycles', () => {
    it('should retrieve all cycles', async () => {
      const cycles = await repository.getAllCycles();

      expect(Array.isArray(cycles)).toBe(true);
      expect(cycles.length).toBeGreaterThan(0);
    });
  });

  describe('getActiveCycles', () => {
    it('should retrieve only active cycles', async () => {
      const cycles = await repository.getActiveCycles();

      expect(Array.isArray(cycles)).toBe(true);
      for (const c of cycles) {
        expect(c.status).toBe('active');
      }
    });
  });

  describe('getCyclesByStatus', () => {
    it('should retrieve cycles by status', async () => {
      const cycles = await repository.getCyclesByStatus('active');

      expect(Array.isArray(cycles)).toBe(true);
      for (const c of cycles) {
        expect(c.status).toBe('active');
      }
    });
  });

  describe('updateCycle', () => {
    it('should update cycle properties', async () => {
      const updated = await repository.updateCycle(testCycleId, {
        name: 'Updated Q1 2024 Review',
        status: 'closed',
      });

      expect(updated.name).toBe('Updated Q1 2024 Review');
      expect(updated.status).toBe('closed');
    });

    it('should update cycle dates', async () => {
      const newStart = new Date('2024-02-01');
      const newEnd = new Date('2024-04-30');

      const updated = await repository.updateCycle(testCycleId, {
        start_date: newStart,
        end_date: newEnd,
      });

      expect(updated.start_date.toISOString().slice(0, 10)).toBe('2024-02-01');
      expect(updated.end_date.toISOString().slice(0, 10)).toBe('2024-04-30');
    });
  });

  describe('deleteCycle', () => {
    it('should delete a cycle', async () => {
      const cycle = await repository.createCycle({
        name: 'Cycle to Delete',
        start_date: new Date(),
        end_date: new Date(),
        status: 'draft',
      });

      await repository.deleteCycle(cycle.id);

      const deleted = await repository.getCycleById(cycle.id);
      expect(deleted).toBeNull();
    });
  });

  describe('CRUD operations', () => {
    it('should support full CRUD lifecycle', async () => {
      // Create
      const created = await repository.createCycle({
        name: 'CRUD Test Cycle',
        start_date: new Date('2024-06-01'),
        end_date: new Date('2024-06-30'),
        status: 'draft',
      });

      expect(created.id).toBeDefined();

      // Read
      const read = await repository.getCycleById(created.id);
      expect(read?.name).toBe('CRUD Test Cycle');

      // Update
      const updated = await repository.updateCycle(created.id, {
        name: 'Updated CRUD Cycle',
        status: 'closed',
      });

      expect(updated.name).toBe('Updated CRUD Cycle');
      expect(updated.status).toBe('closed');

      // Delete
      await repository.deleteCycle(created.id);
      const deleted = await repository.getCycleById(created.id);
      expect(deleted).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle same start and end dates', async () => {
      const date = new Date('2024-06-15');

      const cycle = await repository.createCycle({
        name: 'Single Day Cycle',
        start_date: date,
        end_date: date,
        status: 'active',
      });

      expect(cycle.start_date.toISOString().slice(0, 10)).toBe('2024-06-15');
      expect(cycle.end_date.toISOString().slice(0, 10)).toBe('2024-06-15');
    });

    it('should handle maximum length cycle names', async () => {
      const maxName = 'A'.repeat(100);

      const cycle = await repository.createCycle({
        name: maxName,
        start_date: new Date(),
        end_date: new Date(),
        status: 'active',
      });

      expect(cycle.name.length).toBe(100);
    });

    it('should handle cycles spanning multiple years', async () => {
      const cycle = await repository.createCycle({
        name: 'Multi-Year Cycle',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2025-12-31'),
        status: 'active',
      });

      expect(cycle.start_date.toISOString().slice(0, 10)).toBe('2024-01-01');
      expect(cycle.end_date.toISOString().slice(0, 10)).toBe('2025-12-31');
    });
  });
});
