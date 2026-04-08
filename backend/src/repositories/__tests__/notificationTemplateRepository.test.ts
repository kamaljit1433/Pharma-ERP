/**
 * Notification Template Repository - Unit Tests
 * Tests for notification template CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { NotificationTemplateRepository } from '../notificationTemplateRepository';
import db from '../../config/knex';

describe('NotificationTemplateRepository', () => {
  let repository: NotificationTemplateRepository;
  let testTemplateId: string;

  beforeAll(async () => {
    repository = new NotificationTemplateRepository(db);
    await db('notification_templates').del();
  });

  afterAll(async () => {
    await db('notification_templates').del();
  });

  describe('createTemplate', () => {
    it('should create a notification template with valid data', async () => {
      const template = await repository.createTemplate({
        name: 'Leave Approved',
        type: 'leave',
        subject: 'Your leave request has been approved',
        body: 'Your leave request for {{date}} has been approved.',
        variables: ['date', 'approver_name'],
        is_active: true,
      });

      expect(template).toBeDefined();
      expect(template.id).toBeDefined();
      expect(template.name).toBe('Leave Approved');
      expect(template.type).toBe('leave');
      expect(template.is_active).toBe(true);

      testTemplateId = template.id;
    });

    it('should create templates with different types', async () => {
      const types = ['leave', 'attendance', 'payroll', 'recruitment', 'general'];

      for (const type of types) {
        const template = await repository.createTemplate({
          name: `${type} Template`,
          type,
          subject: `${type} notification`,
          body: `This is a ${type} notification`,
          variables: [],
          is_active: true,
        });

        expect(template.type).toBe(type);
      }
    });
  });

  describe('getTemplateById', () => {
    it('should retrieve template by ID', async () => {
      const template = await repository.getTemplateById(testTemplateId);

      expect(template).toBeDefined();
      expect(template?.id).toBe(testTemplateId);
      expect(template?.name).toBe('Leave Approved');
    });

    it('should return null for non-existent ID', async () => {
      const template = await repository.getTemplateById('00000000-0000-4000-a000-ffffffffffff');
      expect(template).toBeNull();
    });
  });

  describe('getTemplateByName', () => {
    it('should retrieve template by name', async () => {
      const template = await repository.getTemplateByName('Leave Approved');

      expect(template).toBeDefined();
      expect(template?.name).toBe('Leave Approved');
    });

    it('should return null for non-existent name', async () => {
      const template = await repository.getTemplateByName('Non Existent');
      expect(template).toBeNull();
    });
  });

  describe('getTemplatesByType', () => {
    it('should retrieve templates by type', async () => {
      const templates = await repository.getTemplatesByType('leave');

      expect(Array.isArray(templates)).toBe(true);
      templates.forEach((t) => {
        expect(t.type).toBe('leave');
      });
    });

    it('should return empty array for non-existent type', async () => {
      const templates = await repository.getTemplatesByType('non-existent-type');
      expect(templates).toEqual([]);
    });
  });

  describe('getAllTemplates', () => {
    it('should retrieve all templates', async () => {
      const templates = await repository.getAllTemplates();

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });
  });

  describe('getActiveTemplates', () => {
    it('should retrieve only active templates', async () => {
      const templates = await repository.getActiveTemplates();

      expect(Array.isArray(templates)).toBe(true);
      templates.forEach((t) => {
        expect(t.is_active).toBe(true);
      });
    });
  });

  describe('updateTemplate', () => {
    it('should update template properties', async () => {
      const updated = await repository.updateTemplate(testTemplateId, {
        subject: 'Updated subject',
        body: 'Updated body',
      });

      expect(updated.subject).toBe('Updated subject');
      expect(updated.body).toBe('Updated body');
    });

    it('should update active status', async () => {
      const updated = await repository.updateTemplate(testTemplateId, {
        is_active: false,
      });

      expect(updated.is_active).toBe(false);
    });

    it('should update variables', async () => {
      const updated = await repository.updateTemplate(testTemplateId, {
        variables: ['date', 'approver_name', 'reason'],
      });

      expect(updated.variables).toContain('date');
      expect(updated.variables).toContain('approver_name');
      expect(updated.variables).toContain('reason');
    });
  });

  describe('deleteTemplate', () => {
    it('should delete a template', async () => {
      const template = await repository.createTemplate({
        name: 'Template to Delete',
        type: 'general',
        subject: 'Test',
        body: 'Test',
        variables: [],
        is_active: true,
      });

      await repository.deleteTemplate(template.id);

      const deleted = await repository.getTemplateById(template.id);
      expect(deleted).toBeNull();
    });
  });

  describe('CRUD operations', () => {
    it('should support full CRUD lifecycle', async () => {
      // Create
      const created = await repository.createTemplate({
        name: 'CRUD Test Template',
        type: 'general',
        subject: 'CRUD Test',
        body: 'This is a CRUD test',
        variables: ['var1', 'var2'],
        is_active: true,
      });

      expect(created.id).toBeDefined();

      // Read
      const read = await repository.getTemplateById(created.id);
      expect(read?.name).toBe('CRUD Test Template');

      // Update
      const updated = await repository.updateTemplate(created.id, {
        subject: 'Updated CRUD Test',
      });

      expect(updated.subject).toBe('Updated CRUD Test');

      // Delete
      await repository.deleteTemplate(created.id);
      const deleted = await repository.getTemplateById(created.id);
      expect(deleted).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle templates with many variables', async () => {
      const variables = Array.from({ length: 20 }, (_, i) => `var${i + 1}`);

      const template = await repository.createTemplate({
        name: 'Many Variables Template',
        type: 'general',
        subject: 'Test',
        body: 'Test',
        variables,
        is_active: true,
      });

      expect(template.variables.length).toBe(20);
    });

    it('should handle templates with empty variables', async () => {
      const template = await repository.createTemplate({
        name: 'No Variables Template',
        type: 'general',
        subject: 'Test',
        body: 'Test',
        variables: [],
        is_active: true,
      });

      expect(template.variables).toEqual([]);
    });

    it('should handle long template content', async () => {
      const longBody = 'A'.repeat(5000);

      const template = await repository.createTemplate({
        name: 'Long Content Template',
        type: 'general',
        subject: 'Test',
        body: longBody,
        variables: [],
        is_active: true,
      });

      expect(template.body.length).toBe(5000);
    });
  });
});
