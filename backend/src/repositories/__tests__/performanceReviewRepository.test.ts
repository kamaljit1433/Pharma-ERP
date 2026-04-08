/**
 * Performance Review Repository - Unit Tests
 * Tests for performance review CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PerformanceReviewRepository } from '../performanceReviewRepository';
import db from '../../config/knex';

describe('PerformanceReviewRepository', () => {
  let repository: PerformanceReviewRepository;
  let testReviewId: string;
  let testEmployeeId: string;
  let testCycleId: string;

  beforeAll(async () => {
    repository = new PerformanceReviewRepository(db);

    // Clean up test data
    await db('performance_reviews').del();
    await db('review_cycles').del();
    await db('employees').del();
    await db('employees')
      .insert([
        {
          id: 'c0000000-0000-4000-a000-000000000201',
          employee_id: 'EMP-REV-001',
          first_name: 'Reviewer',
          last_name: 'One',
          email: 'rev1@example.com',
          employment_type: 'permanent',
          status: 'active',
          date_of_joining: new Date()
        },
        {
          id: 'c0000000-0000-4000-a000-000000000202',
          employee_id: 'EMP-REV-002',
          first_name: 'Reviewer',
          last_name: 'Two',
          email: 'rev2@example.com',
          employment_type: 'permanent',
          status: 'active',
          date_of_joining: new Date()
        },
      ])
      .onConflict('id').ignore();

    // Create test employee
    const [emp] = await db('employees')
      .insert({
        id: 'a1000000-0000-4000-a000-000000000002',
        employee_id: 'EMP-PERF-001',
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

    // Create test review cycle
    const [cycle] = await db('review_cycles')
      .insert({
        id: 'b1000000-0000-4000-b000-000000000002',
        name: 'Q1 2024 Review',
        start_date: new Date('2024-01-01'),
        end_date: new Date('2024-03-31'),
        status: 'active',
      })
      .returning('*');

    testCycleId = cycle.id;
  });

  afterAll(async () => {
    await db('performance_reviews').del();
    await db('review_cycles').del();
    await db('employees').del();
  });

  describe('createReview', () => {
    it('should create a performance review with valid data', async () => {
      const review = await repository.createReview({
        employee_id: testEmployeeId,
        cycle_id: testCycleId,
        reviewer_id: 'c0000000-0000-4000-a000-000000000201',
        rating: 4,
        comments: 'Great performance',
        status: 'draft',
      });

      expect(review).toBeDefined();
      expect(review.id).toBeDefined();
      expect(review.employee_id).toBe(testEmployeeId);
      expect(review.rating).toBe(4);
      expect(review.status).toBe('draft');

      testReviewId = review.id;
    });

    it('should create reviews with different ratings', async () => {
      for (let rating = 1; rating <= 5; rating++) {
        const review = await repository.createReview({
          employee_id: testEmployeeId,
          cycle_id: testCycleId,
          reviewer_id: 'c0000000-0000-4000-a000-000000000201',
          rating,
          comments: `Rating ${rating}`,
          status: 'draft',
        });

        expect(review.rating).toBe(rating);
      }
    });

    it('should create reviews with different statuses', async () => {
      const statuses = ['draft', 'submitted', 'finalized'];

      for (const status of statuses) {
        const review = await repository.createReview({
          employee_id: testEmployeeId,
          cycle_id: testCycleId,
          reviewer_id: 'c0000000-0000-4000-a000-000000000201',
          rating: 3,
          comments: `Status: ${status}`,
          status: status as any,
        });

        expect(review.status).toBe(status);
      }
    });
  });

  describe('getReviewById', () => {
    it('should retrieve review by ID', async () => {
      const review = await repository.getReviewById(testReviewId);

      expect(review).toBeDefined();
      expect(review?.id).toBe(testReviewId);
      expect(review?.employee_id).toBe(testEmployeeId);
    });

    it('should return null for non-existent ID', async () => {
      const review = await repository.getReviewById('00000000-0000-4000-a000-ffffffffffff');
      expect(review).toBeNull();
    });
  });

  describe('getReviewsByEmployee', () => {
    it('should retrieve reviews by employee ID', async () => {
      const reviews = await repository.getReviewsByEmployee(testEmployeeId);

      expect(Array.isArray(reviews)).toBe(true);
      expect(reviews.length).toBeGreaterThan(0);
      reviews.forEach((r) => {
        expect(r.employee_id).toBe(testEmployeeId);
      });
    });

    it('should return empty array for non-existent employee', async () => {
      const reviews = await repository.getReviewsByEmployee('00000000-0000-4000-a000-fffffffffffe');
      expect(reviews).toEqual([]);
    });
  });

  describe('getReviewsByCycle', () => {
    it('should retrieve reviews by cycle ID', async () => {
      const reviews = await repository.getReviewsByCycle(testCycleId);

      expect(Array.isArray(reviews)).toBe(true);
      reviews.forEach((r) => {
        expect(r.cycle_id).toBe(testCycleId);
      });
    });
  });

  describe('updateReview', () => {
    it('should update review properties', async () => {
      const updated = await repository.updateReview(testReviewId, {
        rating: 5,
        comments: 'Excellent performance',
      });

      expect(updated.rating).toBe(5);
      expect(updated.comments).toBe('Excellent performance');
    });

    it('should update review status', async () => {
      const updated = await repository.updateReview(testReviewId, {
        status: 'finalized',
      });

      expect(updated.status).toBe('finalized');
    });
  });

  describe('deleteReview', () => {
    it('should delete a review', async () => {
      const review = await repository.createReview({
        employee_id: testEmployeeId,
        cycle_id: testCycleId,
        reviewer_id: 'c0000000-0000-4000-a000-000000000201',
        rating: 3,
        comments: 'To be deleted',
        status: 'draft',
      });

      await repository.deleteReview(review.id);

      const deleted = await repository.getReviewById(review.id);
      expect(deleted).toBeNull();
    });
  });

  describe('CRUD operations', () => {
    it('should support full CRUD lifecycle', async () => {
      // Create
      const created = await repository.createReview({
        employee_id: testEmployeeId,
        cycle_id: testCycleId,
        reviewer_id: 'c0000000-0000-4000-a000-000000000201',
        rating: 3,
        comments: 'CRUD test',
        status: 'draft',
      });

      expect(created.id).toBeDefined();

      // Read
      const read = await repository.getReviewById(created.id);
      expect(read?.comments).toBe('CRUD test');

      // Update
      const updated = await repository.updateReview(created.id, {
        comments: 'Updated CRUD test',
      });

      expect(updated.comments).toBe('Updated CRUD test');

      // Delete
      await repository.deleteReview(created.id);
      const deleted = await repository.getReviewById(created.id);
      expect(deleted).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle very long comments', async () => {
      const longComments = 'A'.repeat(5000);

      const review = await repository.createReview({
        employee_id: testEmployeeId,
        cycle_id: testCycleId,
        reviewer_id: 'c0000000-0000-4000-a000-000000000201',
        rating: 3,
        comments: longComments,
        status: 'draft',
      });

      expect(review.comments.length).toBe(5000);
    });

    it('should handle empty comments', async () => {
      const review = await repository.createReview({
        employee_id: testEmployeeId,
        cycle_id: testCycleId,
        reviewer_id: 'c0000000-0000-4000-a000-000000000201',
        rating: 3,
        comments: '',
        status: 'draft',
      });

      expect(review.comments).toBe('');
    });

    it('should handle multiple reviews for same employee in same cycle', async () => {
      const r1 = await repository.createReview({
        employee_id: testEmployeeId,
        cycle_id: testCycleId,
        reviewer_id: 'c0000000-0000-4000-a000-000000000201',
        rating: 4,
        comments: 'First review',
        status: 'draft',
      });

      const r2 = await repository.createReview({
        employee_id: testEmployeeId,
        cycle_id: testCycleId,
        reviewer_id: 'c0000000-0000-4000-a000-000000000202',
        rating: 3,
        comments: 'Second review',
        status: 'draft',
      });

      expect(r1.id).not.toBe(r2.id);

      const reviews = await repository.getReviewsByEmployee(testEmployeeId);
      expect(reviews.length).toBeGreaterThanOrEqual(2);
    });
  });
});
