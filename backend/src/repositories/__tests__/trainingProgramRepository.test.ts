/**
 * Training Program Repository - Unit Tests
 * Tests for training program CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { TrainingProgramRepository } from '../trainingProgramRepository';
import db from '../../config/knex';

describe('TrainingProgramRepository', () => {
  let repository: TrainingProgramRepository;
  let testProgramId: string;

  beforeAll(async () => {
    repository = new TrainingProgramRepository(db);
    await db('training_programs').del();
  });

  afterAll(async () => {
    await db('training_programs').del();
  });

  describe('createProgram', () => {
    it('should create a training program with valid data', async () => {
      const program = await repository.createProgram({
        name: 'TypeScript Basics',
        description: 'Learn TypeScript fundamentals',
        duration_days: 5,
        status: 'active',
      });

      expect(program).toBeDefined();
      expect(program.id).toBeDefined();
      expect(program.name).toBe('TypeScript Basics');
      expect(program.duration_days).toBe(5);
      expect(program.status).toBe('active');

      testProgramId = program.id;
    });

    it('should create programs with different statuses', async () => {
      const statuses = ['active', 'inactive', 'archived'];

      for (const status of statuses) {
        const program = await repository.createProgram({
          name: `${status} Program`,
          description: 'Test',
          duration_days: 5,
          status: status as any,
        });

        expect(program.status).toBe(status);
      }
    });
  });

  describe('getProgramById', () => {
    it('should retrieve program by ID', async () => {
      const program = await repository.getProgramById(testProgramId);

      expect(program).toBeDefined();
      expect(program?.id).toBe(testProgramId);
      expect(program?.name).toBe('TypeScript Basics');
    });

    it('should return null for non-existent ID', async () => {
      const program = await repository.getProgramById('00000000-0000-4000-a000-ffffffffffff');
      expect(program).toBeNull();
    });
  });

  describe('getProgramByName', () => {
    it('should retrieve program by name', async () => {
      const program = await repository.getProgramByName('TypeScript Basics');

      expect(program).toBeDefined();
      expect(program?.name).toBe('TypeScript Basics');
    });

    it('should return null for non-existent name', async () => {
      const program = await repository.getProgramByName('Non Existent Program');
      expect(program).toBeNull();
    });
  });

  describe('getAllPrograms', () => {
    it('should retrieve all programs', async () => {
      const programs = await repository.getAllPrograms();

      expect(Array.isArray(programs)).toBe(true);
      expect(programs.length).toBeGreaterThan(0);
    });
  });

  describe('getActivePrograms', () => {
    it('should retrieve only active programs', async () => {
      const programs = await repository.getActivePrograms();

      expect(Array.isArray(programs)).toBe(true);
      programs.forEach((p) => {
        expect(p.status).toBe('active');
      });
    });
  });

  describe('getProgramsByStatus', () => {
    it('should retrieve programs by status', async () => {
      const programs = await repository.getProgramsByStatus('active');

      expect(Array.isArray(programs)).toBe(true);
      programs.forEach((p) => {
        expect(p.status).toBe('active');
      });
    });
  });

  describe('updateProgram', () => {
    it('should update program properties', async () => {
      const updated = await repository.updateProgram(testProgramId, {
        name: 'Updated TypeScript Basics',
        duration_days: 10,
      });

      expect(updated.name).toBe('Updated TypeScript Basics');
      expect(updated.duration_days).toBe(10);
    });

    it('should update program status', async () => {
      const updated = await repository.updateProgram(testProgramId, {
        status: 'inactive',
      });

      expect(updated.status).toBe('inactive');
    });
  });

  describe('deleteProgram', () => {
    it('should delete a program', async () => {
      const program = await repository.createProgram({
        name: 'Program to Delete',
        description: 'Test',
        duration_days: 5,
        status: 'active',
      });

      await repository.deleteProgram(program.id);

      const deleted = await repository.getProgramById(program.id);
      expect(deleted).toBeNull();
    });
  });

  describe('CRUD operations', () => {
    it('should support full CRUD lifecycle', async () => {
      // Create
      const created = await repository.createProgram({
        name: 'CRUD Test Program',
        description: 'CRUD test',
        duration_days: 7,
        status: 'active',
      });

      expect(created.id).toBeDefined();

      // Read
      const read = await repository.getProgramById(created.id);
      expect(read?.name).toBe('CRUD Test Program');

      // Update
      const updated = await repository.updateProgram(created.id, {
        name: 'Updated CRUD Program',
      });

      expect(updated.name).toBe('Updated CRUD Program');

      // Delete
      await repository.deleteProgram(created.id);
      const deleted = await repository.getProgramById(created.id);
      expect(deleted).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle different duration values', async () => {
      const durations = [1, 5, 10, 30, 90, 365];

      for (const duration of durations) {
        const program = await repository.createProgram({
          name: `${duration} Day Program`,
          description: 'Test',
          duration_days: duration,
          status: 'active',
        });

        expect(program.duration_days).toBe(duration);
      }
    });

    it('should handle long program names', async () => {
      const longName = 'A'.repeat(500);

      const program = await repository.createProgram({
        name: longName,
        description: 'Test',
        duration_days: 5,
        status: 'active',
      });

      expect(program.name.length).toBe(500);
    });

    it('should handle long descriptions', async () => {
      const longDescription = 'A'.repeat(5000);

      const program = await repository.createProgram({
        name: 'Long Description Program',
        description: longDescription,
        duration_days: 5,
        status: 'active',
      });

      expect(program.description?.length).toBe(5000);
    });
  });
});
