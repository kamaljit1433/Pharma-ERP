/**
 * Onboarding Repository - Unit Tests
 * Tests for onboarding checklist CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { OnboardingRepository } from '../onboardingRepository';
import db from '../../config/knex';

describe('OnboardingRepository', () => {
  let repository: OnboardingRepository;
  let testChecklistId: string;
  let testEmployeeId: string;

  beforeAll(async () => {
    repository = new OnboardingRepository(db);

    // Clean up test data
    await db('onboarding_checklists').del();
    await db('employees').del();

    // Create test employee
    const [emp] = await db('employees')
      .insert({
        id: 'a1000000-0000-4000-a000-000000000011',
        employee_id: 'EMP-ONBOARD-001',
        first_name: 'New',
        last_name: 'Employee',
        email: 'new@example.com',
        phone: '+1234567890',
        date_of_joining: new Date(),
        employment_type: 'permanent',
        status: 'active',
      })
      .returning('*');

    testEmployeeId = emp.id;
  });

  afterAll(async () => {
    await db('onboarding_checklists').del();
    await db('employees').del();
  });

  describe('createChecklist', () => {
    it('should create an onboarding checklist with valid data', async () => {
      const items = [
        { task: 'IT Setup', completed: false },
        { task: 'HR Orientation', completed: false },
        { task: 'Department Orientation', completed: false },
      ];

      const checklist = await repository.createChecklist({
        employee_id: testEmployeeId,
        items,
        status: 'pending',
      });

      expect(checklist).toBeDefined();
      expect(checklist.id).toBeDefined();
      expect(checklist.employee_id).toBe(testEmployeeId);
      expect(checklist.status).toBe('pending');
      expect(checklist.items.length).toBe(3);

      testChecklistId = checklist.id;
    });
  });

  describe('getChecklistById', () => {
    it('should retrieve checklist by ID', async () => {
      const checklist = await repository.getChecklistById(testChecklistId);

      expect(checklist).toBeDefined();
      expect(checklist?.id).toBe(testChecklistId);
      expect(checklist?.employee_id).toBe(testEmployeeId);
    });

    it('should return null for non-existent ID', async () => {
      const checklist = await repository.getChecklistById('00000000-0000-4000-a000-ffffffffffff');
      expect(checklist).toBeNull();
    });
  });

  describe('getChecklistByEmployee', () => {
    it('should retrieve checklist by employee ID', async () => {
      const checklist = await repository.getChecklistByEmployee(testEmployeeId);

      expect(checklist).toBeDefined();
      expect(checklist?.employee_id).toBe(testEmployeeId);
    });

    it('should return null for employee without checklist', async () => {
      const checklist = await repository.getChecklistByEmployee('00000000-0000-4000-a000-fffffffffffe');
      expect(checklist).toBeNull();
    });
  });

  describe('updateChecklist', () => {
    it('should update checklist status', async () => {
      const updated = await repository.updateChecklist(testChecklistId, {
        status: 'in_progress',
      });

      expect(updated.status).toBe('in_progress');
    });

    it('should update checklist items', async () => {
      const newItems = [
        { task: 'IT Setup', completed: true },
        { task: 'HR Orientation', completed: true },
        { task: 'Department Orientation', completed: false },
        { task: 'Team Meeting', completed: false },
      ];

      const updated = await repository.updateChecklist(testChecklistId, {
        items: newItems,
      });

      expect(updated.items.length).toBe(4);
      expect(updated.items[0]!.completed).toBe(true);
    });
  });

  describe('completeItem', () => {
    it('should mark a checklist item as complete', async () => {
      const checklist = await repository.createChecklist({
        employee_id: testEmployeeId,
        items: [
          { task: 'Task 1', completed: false },
          { task: 'Task 2', completed: false },
        ],
        status: 'pending',
      });

      const updated = await repository.completeItem(checklist.id, 0);

      expect(updated.items[0]!.completed).toBe(true);
      expect(updated.items[1]!.completed).toBe(false);
    });
  });

  describe('deleteChecklist', () => {
    it('should delete a checklist', async () => {
      const checklist = await repository.createChecklist({
        employee_id: testEmployeeId,
        items: [{ task: 'To Delete', completed: false }],
        status: 'pending',
      });

      await repository.deleteChecklist(checklist.id);

      const deleted = await repository.getChecklistById(checklist.id);
      expect(deleted).toBeNull();
    });
  });

  describe('CRUD operations', () => {
    it('should support full CRUD lifecycle', async () => {
      // Create
      const created = await repository.createChecklist({
        employee_id: testEmployeeId,
        items: [
          { task: 'CRUD Task 1', completed: false },
          { task: 'CRUD Task 2', completed: false },
        ],
        status: 'pending',
      });

      expect(created.id).toBeDefined();

      // Read
      const read = await repository.getChecklistById(created.id);
      expect(read?.items.length).toBe(2);

      // Update
      const updated = await repository.updateChecklist(created.id, {
        status: 'in_progress',
      });

      expect(updated.status).toBe('in_progress');

      // Delete
      await repository.deleteChecklist(created.id);
      const deleted = await repository.getChecklistById(created.id);
      expect(deleted).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle empty checklist items', async () => {
      const checklist = await repository.createChecklist({
        employee_id: testEmployeeId,
        items: [],
        status: 'pending',
      });

      expect(checklist.items).toEqual([]);
    });

    it('should handle many checklist items', async () => {
      const items = Array.from({ length: 50 }, (_, i) => ({
        task: `Task ${i + 1}`,
        completed: false,
      }));

      const checklist = await repository.createChecklist({
        employee_id: testEmployeeId,
        items,
        status: 'pending',
      });

      expect(checklist.items.length).toBe(50);
    });

    it('should handle all items completed', async () => {
      const items = [
        { task: 'Task 1', completed: true },
        { task: 'Task 2', completed: true },
        { task: 'Task 3', completed: true },
      ];

      const checklist = await repository.createChecklist({
        employee_id: testEmployeeId,
        items,
        status: 'completed',
      });

      expect(checklist.items.every((i) => i.completed)).toBe(true);
    });
  });
});
