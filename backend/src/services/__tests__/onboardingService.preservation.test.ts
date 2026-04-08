import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Knex } from 'knex';
import knex from 'knex';
import fc from 'fast-check';
import { OnboardingService } from '../onboardingService';

/**
 * Preservation Property Tests for OnboardingService
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 * 
 * These tests capture the baseline behavior of test logic that doesn't involve
 * schema definition. They verify that:
 * - Service method calls work correctly with proper schema
 * - Test assertions for checklist status, items, and completion remain unchanged
 * - Employee table setup and test data insertion work correctly
 * - Email service mocks function correctly
 * 
 * These tests are designed to run on UNFIXED code (with manually fixed schema for observation)
 * and should PASS, confirming baseline behavior to preserve.
 */
describe('OnboardingService - Preservation Properties', () => {
  let db: Knex;
  let service: OnboardingService;
  let employeeId: string;

  beforeEach(async () => {
    db = knex({
      client: 'sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
    });

    // Create tables with FIXED schema (manually fixed for observation)
    await db.schema.createTable('employees', (table) => {
      table.uuid('id').primary();
      table.string('first_name');
      table.string('last_name');
      table.string('email').unique();
      table.date('date_of_joining').nullable();
      table.string('status').defaultTo('active');
      table.timestamp('created_at').defaultTo(db.fn.now());
    });

    // FIXED schema - includes all columns from production migration
    await db.schema.createTable('onboarding_checklists', (table) => {
      table.uuid('id').primary();
      table.uuid('employee_id').references('id').inTable('employees');
      table.string('title', 100).notNullable(); // ADDED - was missing
      table.text('description').nullable(); // ADDED - was missing
      table.text('items');
      table.string('status').defaultTo('pending');
      table.date('target_completion_date').nullable(); // ADDED - was missing
      table.date('completed_date').nullable(); // ADDED - was missing (was completed_at)
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now()); // ADDED - was missing
    });

    // Insert test employee
    await db('employees').insert({
      id: '550e8400-e29b-41d4-a716-446655440001',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      date_of_joining: '2026-04-01',
    });

    employeeId = '550e8400-e29b-41d4-a716-446655440001';
    service = new OnboardingService(db);
  });

  afterEach(async () => {
    await db.destroy();
  });

  describe('Property: Service Method Behavior Preserved', () => {
    it('should create checklist with valid employee and items', async () => {
      const checklistData = {
        employee_id: employeeId,
        items: [
          { title: 'IT Setup', description: 'Laptop setup' },
          { title: 'Office Access', description: 'Access card' },
        ],
      };

      const checklist = await service.createOnboardingChecklist(checklistData);

      expect(checklist).toBeDefined();
      expect(checklist.employee_id).toBe(employeeId);
      expect(checklist.status).toBe('pending');
      expect(checklist.title).toBe('Onboarding Checklist');
      expect(checklist.items).toHaveLength(2);
    });

    it('should throw error for non-existent employee', async () => {
      const checklistData = {
        employee_id: 'non-existent-id',
        items: [{ title: 'IT Setup', description: 'Laptop setup' }],
      };

      await expect(service.createOnboardingChecklist(checklistData)).rejects.toThrow(
        'Employee not found'
      );
    });

    it('should retrieve checklist by id', async () => {
      const checklistData = {
        employee_id: employeeId,
        items: [{ title: 'IT Setup', description: 'Laptop setup' }],
      };

      const created = await service.createOnboardingChecklist(checklistData);
      const retrieved = await service.getOnboardingChecklist(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(created.id);
      expect(retrieved.employee_id).toBe(employeeId);
    });

    it('should throw error for non-existent checklist', async () => {
      await expect(service.getOnboardingChecklist('non-existent-id')).rejects.toThrow(
        'Onboarding checklist not found'
      );
    });

    it('should retrieve checklist by employee id', async () => {
      const checklistData = {
        employee_id: employeeId,
        items: [{ title: 'IT Setup', description: 'Laptop setup' }],
      };

      const created = await service.createOnboardingChecklist(checklistData);
      const retrieved = await service.getOnboardingChecklistByEmployee(employeeId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.employee_id).toBe(employeeId);
    });

    it('should return null for employee with no checklist', async () => {
      await db('employees').insert({
        id: '550e8400-e29b-41d4-a716-446655440004',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
      });

      const retrieved = await service.getOnboardingChecklistByEmployee(
        '550e8400-e29b-41d4-a716-446655440004'
      );

      expect(retrieved).toBeNull();
    });
  });

  describe('Property: Checklist Completion Logic Preserved', () => {
    it('should mark item as completed and update checklist', async () => {
      const checklistData = {
        employee_id: employeeId,
        items: [
          { title: 'IT Setup', description: 'Laptop setup' },
          { title: 'Office Access', description: 'Access card' },
        ],
      };

      const checklist = await service.createOnboardingChecklist(checklistData);
      const items = checklist.items as any[];

      // Verify items are properly structured
      expect(items).toBeDefined();
      expect(Array.isArray(items)).toBe(true);
      expect(items[0].id).toBeDefined();

      // Complete first item - this should work with the repository directly
      const completedItem = await service.completeChecklistItem(items[0].id, 'hr-user-1');

      expect(completedItem.completed).toBe(true);
      expect(completedItem.completed_by).toBe('hr-user-1');
      expect(completedItem.completed_at).toBeDefined();
    });

    it('should mark checklist as completed when all items are done', async () => {
      const checklistData = {
        employee_id: employeeId,
        items: [
          { title: 'IT Setup', description: 'Laptop setup' },
          { title: 'Office Access', description: 'Access card' },
        ],
      };

      const checklist = await service.createOnboardingChecklist(checklistData);
      const items = checklist.items as any[];

      // Complete all items
      await service.completeChecklistItem(items[0].id, 'hr-user-1');
      await service.completeChecklistItem(items[1].id, 'hr-user-1');

      const updated = await service.getOnboardingChecklist(checklist.id);

      expect(updated.status).toBe('completed');
      expect(updated.completed_date).toBeDefined();
    });

    it('should return false when some items are incomplete', async () => {
      const checklistData = {
        employee_id: employeeId,
        items: [
          { title: 'IT Setup', description: 'Laptop setup' },
          { title: 'Office Access', description: 'Access card' },
        ],
      };

      const checklist = await service.createOnboardingChecklist(checklistData);
      const items = checklist.items as any[];

      // Complete only first item
      await service.completeChecklistItem(items[0].id, 'hr-user-1');

      const isComplete = await service.isChecklistComplete(checklist.id);

      expect(isComplete).toBe(false);
    });

    it('should return true when all items are completed', async () => {
      const checklistData = {
        employee_id: employeeId,
        items: [
          { title: 'IT Setup', description: 'Laptop setup' },
          { title: 'Office Access', description: 'Access card' },
        ],
      };

      const checklist = await service.createOnboardingChecklist(checklistData);
      const items = checklist.items as any[];

      // Complete all items
      await service.completeChecklistItem(items[0].id, 'hr-user-1');
      await service.completeChecklistItem(items[1].id, 'hr-user-1');

      const isComplete = await service.isChecklistComplete(checklist.id);

      expect(isComplete).toBe(true);
    });
  });

  describe('Property: Default Checklist Generation Preserved', () => {
    it('should generate default checklist with standard items', async () => {
      const departmentId = '550e8400-e29b-41d4-a716-446655440005';

      const checklist = await service.generateDefaultChecklist(employeeId, departmentId);

      expect(checklist).toBeDefined();
      expect(checklist.employee_id).toBe(employeeId);
      expect(checklist.title).toBe('Onboarding Checklist');

      const items = checklist.items as any[];

      expect(items).toHaveLength(6);
      expect(items.some((item: any) => item.title === 'IT Setup')).toBe(true);
      expect(items.some((item: any) => item.title === 'Office Access')).toBe(true);
      expect(items.some((item: any) => item.title === 'Orientation')).toBe(true);
      expect(items.some((item: any) => item.title === 'Department Induction')).toBe(true);
      expect(items.some((item: any) => item.title === 'Benefits Enrollment')).toBe(true);
      expect(items.some((item: any) => item.title === 'Bank Details')).toBe(true);
    });
  });

  describe('Property: Employee Table Setup Preserved', () => {
    it('should have employee table with correct schema', async () => {
      const employee = await db('employees').where({ id: employeeId }).first();

      expect(employee).toBeDefined();
      expect(employee.first_name).toBe('John');
      expect(employee.last_name).toBe('Doe');
      expect(employee.email).toBe('john.doe@example.com');
      expect(employee.date_of_joining).toBe('2026-04-01');
      expect(employee.status).toBe('active');
    });

    it('should insert multiple employees correctly', async () => {
      await db('employees').insert({
        id: '550e8400-e29b-41d4-a716-446655440005',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
        date_of_joining: '2026-05-01',
      });

      const employees = await db('employees').select('*');

      expect(employees).toHaveLength(2);
      expect(employees.some((e: any) => e.email === 'john.doe@example.com')).toBe(true);
      expect(employees.some((e: any) => e.email === 'jane@example.com')).toBe(true);
    });
  });

  describe('Property-Based: Service Methods with Various Inputs', () => {
    it('should handle checklists with varying numbers of items', async () => {
      fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 10 }),
          async (itemCount) => {
            const items = Array.from({ length: itemCount }, (_, i) => ({
              title: `Item ${i + 1}`,
              description: `Description for item ${i + 1}`,
            }));

            const checklistData = {
              employee_id: employeeId,
              items,
            };

            const checklist = await service.createOnboardingChecklist(checklistData);

            expect(checklist.items).toHaveLength(itemCount);
            expect(checklist.status).toBe('pending');
            expect(checklist.title).toBe('Onboarding Checklist');
          }
        ),
        { numRuns: 5 }
      );
    });

    it('should handle item completion in any order', async () => {
      fc.assert(
        fc.asyncProperty(
          fc.shuffledSubarray([0, 1, 2, 3]),
          async (completionOrder) => {
            const checklistData = {
              employee_id: employeeId,
              items: [
                { title: 'Item 1', description: 'Desc 1' },
                { title: 'Item 2', description: 'Desc 2' },
                { title: 'Item 3', description: 'Desc 3' },
                { title: 'Item 4', description: 'Desc 4' },
              ],
            };

            const checklist = await service.createOnboardingChecklist(checklistData);
            const items = checklist.items as any[];

            // Complete items in the specified order
            for (const idx of completionOrder) {
              if (idx < items.length) {
                await service.completeChecklistItem(items[idx].id, 'hr-user-1');
              }
            }

            const isComplete = await service.isChecklistComplete(checklist.id);
            const expectedComplete = completionOrder.length === 4;

            expect(isComplete).toBe(expectedComplete);
          }
        ),
        { numRuns: 5 }
      );
    });

    it('should preserve item data through completion', async () => {
      fc.assert(
        fc.asyncProperty(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 50 }),
            description: fc.string({ minLength: 1, maxLength: 100 }),
          }),
          async (itemData) => {
            const checklistData = {
              employee_id: employeeId,
              items: [itemData],
            };

            const checklist = await service.createOnboardingChecklist(checklistData);
            const items = checklist.items as any[];

            expect(items[0].title).toBe(itemData.title);
            expect(items[0].description).toBe(itemData.description);

            // Complete the item
            const completedItem = await service.completeChecklistItem(items[0].id, 'hr-user-1');

            expect(completedItem.title).toBe(itemData.title);
            expect(completedItem.description).toBe(itemData.description);
          }
        ),
        { numRuns: 5 }
      );
    });
  });

  describe('Property-Based: Full Workflow Scenarios', () => {
    it('should complete full onboarding workflow with various item counts', async () => {
      fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 5 }),
          async (itemCount) => {
            const items = Array.from({ length: itemCount }, (_, i) => ({
              title: `Task ${i + 1}`,
              description: `Complete task ${i + 1}`,
            }));

            const checklistData = {
              employee_id: employeeId,
              items,
            };

            // Create checklist
            const checklist = await service.createOnboardingChecklist(checklistData);
            expect(checklist.status).toBe('pending');

            // Get items
            const checklistItems = checklist.items as any[];

            // Complete all items
            for (const item of checklistItems) {
              await service.completeChecklistItem(item.id, 'hr-user-1');
            }

            // Verify completion
            const updated = await service.getOnboardingChecklist(checklist.id);
            expect(updated.status).toBe('completed');
            expect(updated.completed_date).toBeDefined();

            const isComplete = await service.isChecklistComplete(checklist.id);
            expect(isComplete).toBe(true);
          }
        ),
        { numRuns: 5 }
      );
    });
  });
});
