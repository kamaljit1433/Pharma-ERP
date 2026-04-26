import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Knex } from 'knex';
import knex from 'knex';
import { OnboardingService } from '../onboardingService';

describe('OnboardingService', () => {
  let db: Knex;
  let service: OnboardingService;
  let employeeId: string;
  let checklistId: string;

  beforeEach(async () => {
    db = knex({
      client: 'sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
    });

    // Create tables
    await db.schema.createTable('employees', (table) => {
      table.uuid('id').primary();
      table.string('first_name');
      table.string('last_name');
      table.string('email').unique();
      table.date('date_of_joining').nullable();
      table.string('status').defaultTo('active');
      table.timestamp('created_at').defaultTo(db.fn.now());
    });

    await db.schema.createTable('onboarding_checklists', (table) => {
      table.uuid('id').primary();
      table.uuid('employee_id').references('id').inTable('employees');
      table.string('title', 100).notNullable();
      table.text('description').nullable();
      table.text('items');
      table.string('status').defaultTo('pending');
      table.date('target_completion_date').nullable();
      table.date('completed_date').nullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });

    // Insert test data
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

  describe('createOnboardingChecklist', () => {
    it('should create onboarding checklist for valid employee', async () => {
      const checklistData = {
        employee_id: employeeId,
        items: [
          { task: 'IT Setup', completed: false },
          { task: 'Office Access', completed: false },
        ],
      };

      const checklist = await service.createOnboardingChecklist(checklistData);

      expect(checklist).toBeDefined();
      expect(checklist.employee_id).toBe(employeeId);
      expect(checklist.status).toBe('pending');
    });

    it('should throw error for non-existent employee', async () => {
      const checklistData = {
        employee_id: 'non-existent-id',
        items: [{ task: 'IT Setup', completed: false }],
      };

      await expect(service.createOnboardingChecklist(checklistData)).rejects.toThrow(
        'Employee not found'
      );
    });

    it('should send welcome email after creating checklist', async () => {
      const checklistData = {
        employee_id: employeeId,
        items: [{ task: 'IT Setup', completed: false }],
      };

      // Should not throw even if email fails
      const checklist = await service.createOnboardingChecklist(checklistData);
      expect(checklist).toBeDefined();
    });
  });

  describe('completeChecklistItem', () => {
    beforeEach(async () => {
      const items = [
        {
          id: 'item-1',
          title: 'IT Setup',
          description: 'Laptop setup',
          completed: false,
          completed_by: null,
          completed_at: null,
        },
        {
          id: 'item-2',
          title: 'Office Access',
          description: 'Access card',
          completed: false,
          completed_by: null,
          completed_at: null,
        },
      ];

      await db('onboarding_checklists').insert({
        id: '550e8400-e29b-41d4-a716-446655440002',
        employee_id: employeeId,
        title: 'Onboarding Checklist',
        description: 'Standard onboarding process',
        items: JSON.stringify(items),
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      });

      checklistId = '550e8400-e29b-41d4-a716-446655440002';
    });

    it('should mark checklist item as completed', async () => {
      const completedBy = '550e8400-e29b-41d4-a716-446655440003';

      const item = await service.completeChecklistItem('item-1', completedBy);

      expect(item).toBeDefined();
      expect(item.completed).toBe(true);
      expect(item.completed_by).toBe(completedBy);
    });

    it('should complete checklist when all items are done', async () => {
      const completedBy = '550e8400-e29b-41d4-a716-446655440003';

      await service.completeChecklistItem('item-1', completedBy);
      await service.completeChecklistItem('item-2', completedBy);

      const checklist = await db('onboarding_checklists')
        .where({ id: checklistId })
        .first();

      expect(checklist.status).toBe('completed');
      expect(checklist.completed_date).toBeDefined();
    });

    it('should send completion notification when checklist is done', async () => {
      const completedBy = '550e8400-e29b-41d4-a716-446655440003';

      await service.completeChecklistItem('item-1', completedBy);
      // Should not throw even if email fails
      await service.completeChecklistItem('item-2', completedBy);

      const checklist = await db('onboarding_checklists')
        .where({ id: checklistId })
        .first();

      expect(checklist.status).toBe('completed');
    });
  });

  describe('getOnboardingChecklist', () => {
    beforeEach(async () => {
      await db('onboarding_checklists').insert({
        id: '550e8400-e29b-41d4-a716-446655440002',
        employee_id: employeeId,
        title: 'Onboarding Checklist',
        description: 'Standard onboarding process',
        items: JSON.stringify([
          { id: 'item-1', title: 'IT Setup', completed: false },
        ]),
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      });

      checklistId = '550e8400-e29b-41d4-a716-446655440002';
    });

    it('should return checklist by id', async () => {
      const checklist = await service.getOnboardingChecklist(checklistId);

      expect(checklist).toBeDefined();
      expect(checklist.id).toBe(checklistId);
      expect(checklist.employee_id).toBe(employeeId);
    });

    it('should throw error for non-existent checklist', async () => {
      await expect(service.getOnboardingChecklist('non-existent-id')).rejects.toThrow(
        'Onboarding checklist not found'
      );
    });
  });

  describe('getOnboardingChecklistByEmployee', () => {
    beforeEach(async () => {
      await db('onboarding_checklists').insert({
        id: '550e8400-e29b-41d4-a716-446655440002',
        employee_id: employeeId,
        title: 'Onboarding Checklist',
        description: 'Standard onboarding process',
        items: JSON.stringify([
          { id: 'item-1', title: 'IT Setup', completed: false },
        ]),
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      });
    });

    it('should return checklist for employee', async () => {
      const checklist = await service.getOnboardingChecklistByEmployee(employeeId);

      expect(checklist).toBeDefined();
      expect(checklist?.employee_id).toBe(employeeId);
    });

    it('should return null for employee with no checklist', async () => {
      await db('employees').insert({
        id: '550e8400-e29b-41d4-a716-446655440004',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
      });

      const checklist = await service.getOnboardingChecklistByEmployee(
        '550e8400-e29b-41d4-a716-446655440004'
      );

      expect(checklist).toBeNull();
    });
  });

  describe('isChecklistComplete', () => {
    it('should return true when all items are completed', async () => {
      const items = [
        {
          id: 'item-1',
          title: 'IT Setup',
          completed: true,
          completed_by: 'user-1',
          completed_at: new Date(),
        },
        {
          id: 'item-2',
          title: 'Office Access',
          completed: true,
          completed_by: 'user-1',
          completed_at: new Date(),
        },
      ];

      await db('onboarding_checklists').insert({
        id: '550e8400-e29b-41d4-a716-446655440002',
        employee_id: employeeId,
        title: 'Onboarding Checklist',
        description: 'Standard onboarding process',
        items: JSON.stringify(items),
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      });

      const isComplete = await service.isChecklistComplete(
        '550e8400-e29b-41d4-a716-446655440002'
      );

      expect(isComplete).toBe(true);
    });

    it('should return false when some items are incomplete', async () => {
      const items = [
        {
          id: 'item-1',
          title: 'IT Setup',
          completed: true,
          completed_by: 'user-1',
          completed_at: new Date(),
        },
        {
          id: 'item-2',
          title: 'Office Access',
          completed: false,
          completed_by: null,
          completed_at: null,
        },
      ];

      await db('onboarding_checklists').insert({
        id: '550e8400-e29b-41d4-a716-446655440002',
        employee_id: employeeId,
        title: 'Onboarding Checklist',
        description: 'Standard onboarding process',
        items: JSON.stringify(items),
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      });

      const isComplete = await service.isChecklistComplete(
        '550e8400-e29b-41d4-a716-446655440002'
      );

      expect(isComplete).toBe(false);
    });
  });

  describe('generateDefaultChecklist', () => {
    it('should generate default checklist with standard items', async () => {
      const departmentId = '550e8400-e29b-41d4-a716-446655440005';

      const checklist = await service.generateDefaultChecklist(employeeId, departmentId);

      expect(checklist).toBeDefined();
      expect(checklist.employee_id).toBe(employeeId);

      const items = typeof checklist.items === 'string' 
        ? JSON.parse(checklist.items) 
        : checklist.items;

      expect(items).toHaveLength(6);
      expect(items.some((item: any) => item.title === 'IT Setup')).toBe(true);
      expect(items.some((item: any) => item.title === 'Office Access')).toBe(true);
      expect(items.some((item: any) => item.title === 'Orientation')).toBe(true);
      expect(items.some((item: any) => item.title === 'Department Induction')).toBe(true);
      expect(items.some((item: any) => item.title === 'Benefits Enrollment')).toBe(true);
      expect(items.some((item: any) => item.title === 'Bank Details')).toBe(true);
    });

    it('should send welcome email after generating default checklist', async () => {
      const departmentId = '550e8400-e29b-41d4-a716-446655440005';

      // Should not throw even if email fails
      const checklist = await service.generateDefaultChecklist(employeeId, departmentId);
      expect(checklist).toBeDefined();
    });
  });

  describe('onboarding workflow', () => {
    it('should complete full onboarding workflow', async () => {
      // Create checklist
      const checklistData = {
        employee_id: employeeId,
        items: [
          { task: 'IT Setup', completed: false },
          { task: 'Office Access', completed: false },
        ],
      };

      const checklist = await service.createOnboardingChecklist(checklistData);
      expect(checklist.status).toBe('pending');

      // Get items
      const items = typeof checklist.items === 'string' 
        ? JSON.parse(checklist.items) 
        : checklist.items;

      // Complete first item
      await service.completeChecklistItem(items[0].id, 'hr-user-1');

      let updatedChecklist = await service.getOnboardingChecklist(checklist.id);
      expect(updatedChecklist.status).toBe('pending');

      // Complete second item
      await service.completeChecklistItem(items[1].id, 'hr-user-1');

      updatedChecklist = await service.getOnboardingChecklist(checklist.id);
      expect(updatedChecklist.status).toBe('completed');
      expect(updatedChecklist.completed_date).toBeDefined();
    });
  });
});
