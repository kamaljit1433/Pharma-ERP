/**
 * PIP (Performance Improvement Plan) Repository - Unit Tests
 * Tests for PIP CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PIPRepository } from '../pipRepository';
import db from '../../config/knex';

describe('PIPRepository', () => {
  let repository: PIPRepository;
  let testPIPId: string;
  let testEmployeeId: string;

  beforeAll(async () => {
    repository = new PIPRepository(db);

    // Clean up test data
    await db('pips').del();
    await db('employees').del();

    // Create test employee
    const [emp] = await db('employees')
      .insert({
        id: 'a1000000-0000-4000-a000-000000000003',
        employee_id: 'EMP-PIP-001',
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
    await db('pips').del();
    await db('employees').del();
  });

  describe('createPIP', () => {
    it('should create a PIP with valid data', async () => {
      const pip = await repository.createPIP({
        employee_id: testEmployeeId,
        title: 'Performance Improvement Plan',
        description: 'Improve code quality and delivery',
        start_date: new Date('2024-06-01'),
        end_date: new Date('2024-08-31'),
        status: 'active',
        goals: ['Reduce code defects', 'Improve documentation'],
      });

      expect(pip).toBeDefined();
      expect(pip.id).toBeDefined();
      expect(pip.employee_id).toBe(testEmployeeId);
      expect(pip.status).toBe('active');
      expect(pip.goals.length).toBe(2);

      testPIPId = pip.id;
    });

    it('should create PIPs with different statuses', async () => {
      const statuses = ['active', 'completed', 'failed', 'cancelled'];

      for (const status of statuses) {
        const pip = await repository.createPIP({
          employee_id: testEmployeeId,
          title: `PIP - ${status}`,
          description: 'Test',
          start_date: new Date(),
          end_date: new Date(),
          status: status as any,
          goals: [],
        });

        expect(pip.status).toBe(status);
      }
    });
  });

  describe('getPIPById', () => {
    it('should retrieve PIP by ID', async () => {
      const pip = await repository.getPIPById(testPIPId);

      expect(pip).toBeDefined();
      expect(pip?.id).toBe(testPIPId);
      expect(pip?.employee_id).toBe(testEmployeeId);
    });

    it('should return null for non-existent ID', async () => {
      const pip = await repository.getPIPById('00000000-0000-4000-a000-ffffffffffff');
      expect(pip).toBeNull();
    });
  });

  describe('getPIPsByEmployee', () => {
    it('should retrieve PIPs by employee ID', async () => {
      const pips = await repository.getPIPsByEmployee(testEmployeeId);

      expect(Array.isArray(pips)).toBe(true);
      expect(pips.length).toBeGreaterThan(0);
      pips.forEach((p) => {
        expect(p.employee_id).toBe(testEmployeeId);
      });
    });

    it('should return empty array for non-existent employee', async () => {
      const pips = await repository.getPIPsByEmployee('00000000-0000-4000-a000-fffffffffffe');
      expect(pips).toEqual([]);
    });
  });

  describe('getActivePIPs', () => {
    it('should retrieve only active PIPs', async () => {
      const pips = await repository.getActivePIPs();

      expect(Array.isArray(pips)).toBe(true);
      pips.forEach((p) => {
        expect(p.status).toBe('active');
      });
    });
  });

  describe('updatePIP', () => {
    it('should update PIP properties', async () => {
      const updated = await repository.updatePIP(testPIPId, {
        title: 'Updated PIP',
        description: 'Updated description',
      });

      expect(updated.title).toBe('Updated PIP');
      expect(updated.description).toBe('Updated description');
    });

    it('should update PIP status', async () => {
      const updated = await repository.updatePIP(testPIPId, {
        status: 'completed',
      });

      expect(updated.status).toBe('completed');
    });

    it('should update PIP goals', async () => {
      const newGoals = ['Goal 1', 'Goal 2', 'Goal 3'];
      const updated = await repository.updatePIP(testPIPId, {
        goals: newGoals,
      });

      expect(updated.goals.length).toBe(3);
    });
  });

  describe('addCheckpoint', () => {
    it('should add a checkpoint to PIP', async () => {
      const checkpoint = await repository.addCheckpoint(testPIPId, {
        date: new Date('2024-07-01'),
        notes: 'Mid-term review',
        status: 'on_track',
      });

      expect(checkpoint).toBeDefined();
      expect(checkpoint.status).toBe('on_track');
    });

    it('should support different checkpoint statuses', async () => {
      const statuses = ['on_track', 'at_risk', 'off_track'];

      for (const status of statuses) {
        const checkpoint = await repository.addCheckpoint(testPIPId, {
          date: new Date(),
          notes: `Checkpoint - ${status}`,
          status: status as any,
        });

        expect(checkpoint.status).toBe(status);
      }
    });
  });

  describe('getCheckpoints', () => {
    it('should retrieve PIP checkpoints', async () => {
      const checkpoints = await repository.getCheckpoints(testPIPId);

      expect(Array.isArray(checkpoints)).toBe(true);
      expect(checkpoints.length).toBeGreaterThan(0);
    });
  });

  describe('deletePIP', () => {
    it('should delete a PIP', async () => {
      const pip = await repository.createPIP({
        employee_id: testEmployeeId,
        title: 'PIP to Delete',
        description: 'Test',
        start_date: new Date(),
        end_date: new Date(),
        status: 'active',
        goals: [],
      });

      await repository.deletePIP(pip.id);

      const deleted = await repository.getPIPById(pip.id);
      expect(deleted).toBeNull();
    });
  });

  describe('CRUD operations', () => {
    it('should support full CRUD lifecycle', async () => {
      // Create
      const created = await repository.createPIP({
        employee_id: testEmployeeId,
        title: 'CRUD Test PIP',
        description: 'CRUD test',
        start_date: new Date(),
        end_date: new Date(),
        status: 'active',
        goals: ['Goal 1'],
      });

      expect(created.id).toBeDefined();

      // Read
      const read = await repository.getPIPById(created.id);
      expect(read?.title).toBe('CRUD Test PIP');

      // Update
      const updated = await repository.updatePIP(created.id, {
        title: 'Updated CRUD PIP',
      });

      expect(updated.title).toBe('Updated CRUD PIP');

      // Delete
      await repository.deletePIP(created.id);
      const deleted = await repository.getPIPById(created.id);
      expect(deleted).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle many goals', async () => {
      const goals = Array.from({ length: 20 }, (_, i) => `Goal ${i + 1}`);

      const pip = await repository.createPIP({
        employee_id: testEmployeeId,
        title: 'Many Goals PIP',
        description: 'Test',
        start_date: new Date(),
        end_date: new Date(),
        status: 'active',
        goals,
      });

      expect(pip.goals.length).toBe(20);
    });

    it('should handle empty goals', async () => {
      const pip = await repository.createPIP({
        employee_id: testEmployeeId,
        title: 'No Goals PIP',
        description: 'Test',
        start_date: new Date(),
        end_date: new Date(),
        status: 'active',
        goals: [],
      });

      expect(pip.goals).toEqual([]);
    });

    it('should handle multiple PIPs for same employee', async () => {
      const p1 = await repository.createPIP({
        employee_id: testEmployeeId,
        title: 'First PIP',
        description: 'Test',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-03-31'),
        status: 'completed',
        goals: [],
      });

      const p2 = await repository.createPIP({
        employee_id: testEmployeeId,
        title: 'Second PIP',
        description: 'Test',
        start_date: new Date('2024-04-01'),
        end_date: new Date('2024-06-30'),
        status: 'active',
        goals: [],
      });

      expect(p1.id).not.toBe(p2.id);

      const pips = await repository.getPIPsByEmployee(testEmployeeId);
      expect(pips.length).toBeGreaterThanOrEqual(2);
    });
  });
});
