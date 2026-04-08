/**
 * Exit Interview Repository - Unit Tests
 * Tests for exit interview CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import db from '../../config/knex';

describe('Exit Interview Operations', () => {
  const testEmployeeId = 'a0000000-0000-4000-a000-000000000001';
  let testInterviewId: string;

  beforeAll(async () => {
    await db('exit_interviews').del();
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
    await db('exit_interviews').del();
  });

  describe('Create Exit Interview', () => {
    it('should create exit interview record', async () => {
      const [interview] = await db('exit_interviews')
        .insert({
          employee_id: testEmployeeId,
          interview_date: new Date().toISOString().split('T')[0],
          conducted_by: 'c0000000-0000-4000-a000-000000000601',
          reason_for_leaving: 'Better opportunity',
          feedback: 'Great company culture',
          rating: 4,
          status: 'completed',
        })
        .returning('*');

      expect(interview).toBeDefined();
      expect(interview.id).toBeDefined();
      expect(interview.employee_id).toBe(testEmployeeId);
      expect(interview.status).toBe('completed');

      testInterviewId = interview.id;
    });

    it('should allow null feedback initially', async () => {
      const [interview] = await db('exit_interviews')
        .insert({
          employee_id: testEmployeeId,
          conducted_by: 'c0000000-0000-4000-a000-000000000601',
          status: 'scheduled',
        })
        .returning('*');

      expect(interview.feedback).toBeNull();
      expect(interview.status).toBe('scheduled');
    });
  });

  describe('Retrieve Exit Interview', () => {
    it('should retrieve interview by ID', async () => {
      const interview = await db('exit_interviews')
        .where({ id: testInterviewId })
        .first();

      expect(interview).toBeDefined();
      expect(interview.id).toBe(testInterviewId);
    });

    it('should retrieve interview by employee', async () => {
      const interview = await db('exit_interviews')
        .where({ employee_id: testEmployeeId })
        .first();

      expect(interview).toBeDefined();
      expect(interview.employee_id).toBe(testEmployeeId);
    });

    it('should return null for non-existent interview', async () => {
      const interview = await db('exit_interviews')
        .where({ id: '00000000-0000-4000-a000-ffffffffffff' })
        .first();

      expect(interview).toBeUndefined();
    });
  });

  describe('Update Exit Interview', () => {
    it('should update interview details', async () => {
      await db('exit_interviews').where({ id: testInterviewId }).update({
        feedback: 'Updated feedback',
        rating: 5,
      });

      const updated = await db('exit_interviews')
        .where({ id: testInterviewId })
        .first();

      expect(updated.feedback).toBe('Updated feedback');
      expect(updated.rating).toBe(5);
    });

    it('should update interview status', async () => {
      await db('exit_interviews').where({ id: testInterviewId }).update({
        status: 'completed',
      });

      const updated = await db('exit_interviews')
        .where({ id: testInterviewId })
        .first();

      expect(updated.status).toBe('completed');
    });
  });

  describe('Delete Exit Interview', () => {
    it('should delete exit interview', async () => {
      const [interview] = await db('exit_interviews')
        .insert({
          employee_id: testEmployeeId,
          conducted_by: 'c0000000-0000-4000-a000-000000000601',
          status: 'scheduled',
        })
        .returning('*');

      await db('exit_interviews').where({ id: interview.id }).del();

      const deleted = await db('exit_interviews')
        .where({ id: interview.id })
        .first();

      expect(deleted).toBeUndefined();
    });
  });

  describe('Query Exit Interviews', () => {
    it('should retrieve interviews by status', async () => {
      const interviews = await db('exit_interviews')
        .where({ status: 'completed' });

      expect(Array.isArray(interviews)).toBe(true);
      expect(interviews.every((i) => i.status === 'completed')).toBe(true);
    });

    it('should retrieve interviews by conductor', async () => {
      const interviews = await db('exit_interviews')
        .where({ conducted_by: 'c0000000-0000-4000-a000-000000000601' });

      expect(Array.isArray(interviews)).toBe(true);
      expect(interviews.every((i) => i.conducted_by === 'c0000000-0000-4000-a000-000000000601')).toBe(true);
    });

    it('should retrieve interviews by date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const endDate = new Date();

      const interviews = await db('exit_interviews')
        .whereRaw('interview_date >= ?', [startDate.toISOString().split('T')[0]])
        .whereRaw('interview_date <= ?', [endDate.toISOString().split('T')[0]]);

      expect(Array.isArray(interviews)).toBe(true);
    });
  });

  describe('Exit Interview Analytics', () => {
    it('should calculate average rating', async () => {
      const result = await db('exit_interviews')
        .avg('rating as avg_rating')
        .first();

      expect(result).toBeDefined();
      if (result?.avg_rating) {
        expect(result.avg_rating).toBeGreaterThanOrEqual(0);
        expect(result.avg_rating).toBeLessThanOrEqual(5);
      }
    });

    it('should count interviews by status', async () => {
      const result = await db('exit_interviews')
        .select('status')
        .count('* as count')
        .groupBy('status');

      expect(Array.isArray(result)).toBe(true);
    });

    it('should identify common reasons for leaving', async () => {
      const result = await db('exit_interviews')
        .select('reason_for_leaving')
        .count('* as count')
        .groupBy('reason_for_leaving')
        .orderBy('count', 'desc');

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
