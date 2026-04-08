/**
 * Feedback Repository - Unit Tests
 * Tests for feedback CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import db from '../../config/knex';

describe('Feedback Operations', () => {
  const testEmployeeId = 'a0000000-0000-4000-a000-000000000001';
  const testFromEmployeeId = 'a0000000-0000-4000-a000-000000000011';
  let testFeedbackId: string;

  beforeAll(async () => {
    await db('feedback').del();
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
    // Create secondary employee for feedback (from_employee)
    await db('employees')
      .insert({
        id: 'a0000000-0000-4000-a000-000000000011',
        employee_id: 'EMP-FROM-001',
        first_name: 'From',
        last_name: 'Employee',
        email: 'from.employee@example.com',
        phone: '+1234567891',
        date_of_joining: new Date(),
        employment_type: 'permanent',
        status: 'active',
      })
      .onConflict('id')
      .ignore();
  });

  afterAll(async () => {
    await db('employees').del();
    await db('feedback').del();
  });

  describe('Create Feedback', () => {
    it('should create feedback record', async () => {
      const [feedback] = await db('feedback')
        .insert({
          to_employee_id: testEmployeeId,
          from_employee_id: testFromEmployeeId,
          feedback_text: 'Great work on the project',
          rating: 4,
          feedback_type: 'peer',
          is_anonymous: false,
        })
        .returning('*');

      expect(feedback).toBeDefined();
      expect(feedback.id).toBeDefined();
      expect(feedback.to_employee_id).toBe(testEmployeeId);
      expect(feedback.from_employee_id).toBe(testFromEmployeeId);
      expect(feedback.rating).toBe(4);

      testFeedbackId = feedback.id;
    });

    it('should support anonymous feedback', async () => {
      const [feedback] = await db('feedback')
        .insert({
          to_employee_id: testEmployeeId,
          feedback_text: 'Anonymous feedback',
          feedback_type: 'peer',
          is_anonymous: true,
        })
        .returning('*');

      expect(feedback.is_anonymous).toBe(true);
      expect(feedback.from_employee_id).toBeNull();
    });

    it('should support different feedback types', async () => {
      const types = ['peer', 'manager', 'self', 'customer'];

      for (const type of types) {
        const [feedback] = await db('feedback')
          .insert({
            to_employee_id: testEmployeeId,
            from_employee_id: testFromEmployeeId,
            feedback_text: `${type} feedback`,
            feedback_type: type,
          })
          .returning('*');

        expect(feedback.feedback_type).toBe(type);
      }
    });
  });

  describe('Retrieve Feedback', () => {
    it('should retrieve feedback by ID', async () => {
      const feedback = await db('feedback')
        .where({ id: testFeedbackId })
        .first();

      expect(feedback).toBeDefined();
      expect(feedback.id).toBe(testFeedbackId);
    });

    it('should retrieve feedback for employee', async () => {
      const feedbacks = await db('feedback')
        .where({ to_employee_id: testEmployeeId });

      expect(Array.isArray(feedbacks)).toBe(true);
      expect(feedbacks.every((f) => f.to_employee_id === testEmployeeId)).toBe(true);
    });

    it('should retrieve feedback from employee', async () => {
      const feedbacks = await db('feedback')
        .where({ from_employee_id: testFromEmployeeId });

      expect(Array.isArray(feedbacks)).toBe(true);
      expect(feedbacks.every((f) => f.from_employee_id === testFromEmployeeId)).toBe(true);
    });

    it('should return empty array for employee with no feedback', async () => {
      const feedbacks = await db('feedback')
        .where({ to_employee_id: 'emp-no-feedback' });

      expect(Array.isArray(feedbacks)).toBe(true);
      expect(feedbacks.length).toBe(0);
    });
  });

  describe('Update Feedback', () => {
    it('should update feedback text', async () => {
      await db('feedback').where({ id: testFeedbackId }).update({
        feedback_text: 'Updated feedback text',
      });

      const updated = await db('feedback')
        .where({ id: testFeedbackId })
        .first();

      expect(updated.feedback_text).toBe('Updated feedback text');
    });

    it('should update rating', async () => {
      await db('feedback').where({ id: testFeedbackId }).update({
        rating: 5,
      });

      const updated = await db('feedback')
        .where({ id: testFeedbackId })
        .first();

      expect(updated.rating).toBe(5);
    });
  });

  describe('Delete Feedback', () => {
    it('should delete feedback', async () => {
      const [feedback] = await db('feedback')
        .insert({
          to_employee_id: testEmployeeId,
          from_employee_id: testFromEmployeeId,
          feedback_text: 'Temp feedback',
          feedback_type: 'peer',
        })
        .returning('*');

      await db('feedback').where({ id: feedback.id }).del();

      const deleted = await db('feedback')
        .where({ id: feedback.id })
        .first();

      expect(deleted).toBeUndefined();
    });
  });

  describe('Query Feedback', () => {
    it('should retrieve feedback by type', async () => {
      const feedbacks = await db('feedback')
        .where({ feedback_type: 'peer' });

      expect(Array.isArray(feedbacks)).toBe(true);
      expect(feedbacks.every((f) => f.feedback_type === 'peer')).toBe(true);
    });

    it('should retrieve anonymous feedback', async () => {
      const feedbacks = await db('feedback')
        .where({ is_anonymous: true });

      expect(Array.isArray(feedbacks)).toBe(true);
      expect(feedbacks.every((f) => f.is_anonymous === true)).toBe(true);
    });

    it('should retrieve feedback by rating', async () => {
      const feedbacks = await db('feedback')
        .where('rating', '>=', 4);

      expect(Array.isArray(feedbacks)).toBe(true);
      expect(feedbacks.every((f) => f.rating >= 4)).toBe(true);
    });
  });

  describe('Feedback Analytics', () => {
    it('should calculate average rating for employee', async () => {
      const result = await db('feedback')
        .where({ to_employee_id: testEmployeeId })
        .avg('rating as avg_rating')
        .first();

      expect(result).toBeDefined();
      if (result?.avg_rating) {
        expect(result.avg_rating).toBeGreaterThanOrEqual(0);
        expect(result.avg_rating).toBeLessThanOrEqual(5);
      }
    });

    it('should count feedback by type', async () => {
      const result = await db('feedback')
        .where({ to_employee_id: testEmployeeId })
        .select('feedback_type')
        .count('* as count')
        .groupBy('feedback_type');

      expect(Array.isArray(result)).toBe(true);
    });

    it('should count total feedback received', async () => {
      const result = await db('feedback')
        .where({ to_employee_id: testEmployeeId })
        .count('* as count')
        .first();

      expect(result?.count).toBeGreaterThanOrEqual(0);
    });
  });
});
