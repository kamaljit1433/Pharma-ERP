/**
 * Training Enrollment Repository - Unit Tests
 * Tests for training enrollment CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { TrainingEnrollmentRepository } from '../trainingEnrollmentRepository';
import db from '../../config/knex';

describe('TrainingEnrollmentRepository', () => {
  let repository: TrainingEnrollmentRepository;
  let testEnrollmentId: string;
  let testEmployeeId: string;
  let testProgramId: string;

  beforeAll(async () => {
    repository = new TrainingEnrollmentRepository(db);

    // Clean up test data
    await db('training_enrollments').del();
    await db('training_programs').del();
    await db('employees').del();

    // Create test employee
    const [emp] = await db('employees')
      .insert({
        id: 'a1000000-0000-4000-a000-000000000009',
        employee_id: 'EMP-TRAIN-001',
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

    // Create test training program
    const [program] = await db('training_programs')
      .insert({
        id: 'b1000000-0000-4000-b000-000000000003',
        name: 'TypeScript Basics',
        description: 'Learn TypeScript',
        duration_days: 5,
        status: 'active',
      })
      .returning('*');

    testProgramId = program.id;
  });

  afterAll(async () => {
    await db('training_enrollments').del();
    await db('training_programs').del();
    await db('employees').del();
  });

  describe('createEnrollment', () => {
    it('should create a training enrollment with valid data', async () => {
      const enrollment = await repository.createEnrollment({
        employee_id: testEmployeeId,
        program_id: testProgramId,
        enrollment_date: new Date(),
        status: 'enrolled',
      });

      expect(enrollment).toBeDefined();
      expect(enrollment.id).toBeDefined();
      expect(enrollment.employee_id).toBe(testEmployeeId);
      expect(enrollment.program_id).toBe(testProgramId);
      expect(enrollment.status).toBe('enrolled');

      testEnrollmentId = enrollment.id;
    });

    it('should create enrollments with different statuses', async () => {
      const statuses = ['enrolled', 'in_progress', 'completed', 'dropped'];

      for (const status of statuses) {
        const enrollment = await repository.createEnrollment({
          employee_id: testEmployeeId,
          program_id: testProgramId,
          enrollment_date: new Date(),
          status: status as any,
        });

        expect(enrollment.status).toBe(status);
      }
    });
  });

  describe('getEnrollmentById', () => {
    it('should retrieve enrollment by ID', async () => {
      const enrollment = await repository.getEnrollmentById(testEnrollmentId);

      expect(enrollment).toBeDefined();
      expect(enrollment?.id).toBe(testEnrollmentId);
      expect(enrollment?.employee_id).toBe(testEmployeeId);
    });

    it('should return null for non-existent ID', async () => {
      const enrollment = await repository.getEnrollmentById('00000000-0000-4000-a000-ffffffffffff');
      expect(enrollment).toBeNull();
    });
  });

  describe('getEnrollmentsByEmployee', () => {
    it('should retrieve enrollments by employee ID', async () => {
      const enrollments = await repository.getEnrollmentsByEmployee(testEmployeeId);

      expect(Array.isArray(enrollments)).toBe(true);
      expect(enrollments.length).toBeGreaterThan(0);
      enrollments.forEach((e) => {
        expect(e.employee_id).toBe(testEmployeeId);
      });
    });

    it('should return empty array for non-existent employee', async () => {
      const enrollments = await repository.getEnrollmentsByEmployee('00000000-0000-4000-a000-fffffffffffe');
      expect(enrollments).toEqual([]);
    });
  });

  describe('getEnrollmentsByProgram', () => {
    it('should retrieve enrollments by program ID', async () => {
      const enrollments = await repository.getEnrollmentsByProgram(testProgramId);

      expect(Array.isArray(enrollments)).toBe(true);
      enrollments.forEach((e) => {
        expect(e.program_id).toBe(testProgramId);
      });
    });
  });

  describe('getActiveEnrollments', () => {
    it('should retrieve only active enrollments', async () => {
      const enrollments = await repository.getActiveEnrollments();

      expect(Array.isArray(enrollments)).toBe(true);
      enrollments.forEach((e) => {
        expect(['enrolled', 'in_progress']).toContain(e.status);
      });
    });
  });

  describe('updateEnrollment', () => {
    it('should update enrollment status', async () => {
      const updated = await repository.updateEnrollment(testEnrollmentId, {
        status: 'in_progress',
      });

      expect(updated.status).toBe('in_progress');
    });

    it('should update completion date', async () => {
      const completionDate = new Date('2024-06-30');
      const updated = await repository.updateEnrollment(testEnrollmentId, {
        completion_date: completionDate,
      });

      expect(updated.completion_date).toBeDefined();
      const d = updated.completion_date!;
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      expect(dateStr).toBe('2024-06-30');
    });
  });

  describe('markCompleted', () => {
    it('should mark enrollment as completed', async () => {
      const enrollment = await repository.createEnrollment({
        employee_id: testEmployeeId,
        program_id: testProgramId,
        enrollment_date: new Date(),
        status: 'in_progress',
      });

      const completed = await repository.markCompleted(enrollment.id);

      expect(completed.status).toBe('completed');
      expect(completed.completion_date).toBeDefined();
    });
  });

  describe('deleteEnrollment', () => {
    it('should delete an enrollment', async () => {
      const enrollment = await repository.createEnrollment({
        employee_id: testEmployeeId,
        program_id: testProgramId,
        enrollment_date: new Date(),
        status: 'enrolled',
      });

      await repository.deleteEnrollment(enrollment.id);

      const deleted = await repository.getEnrollmentById(enrollment.id);
      expect(deleted).toBeNull();
    });
  });

  describe('CRUD operations', () => {
    it('should support full CRUD lifecycle', async () => {
      // Create
      const created = await repository.createEnrollment({
        employee_id: testEmployeeId,
        program_id: testProgramId,
        enrollment_date: new Date(),
        status: 'enrolled',
      });

      expect(created.id).toBeDefined();

      // Read
      const read = await repository.getEnrollmentById(created.id);
      expect(read?.status).toBe('enrolled');

      // Update
      const updated = await repository.updateEnrollment(created.id, {
        status: 'in_progress',
      });

      expect(updated.status).toBe('in_progress');

      // Delete
      await repository.deleteEnrollment(created.id);
      const deleted = await repository.getEnrollmentById(created.id);
      expect(deleted).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle multiple enrollments for same employee', async () => {
      const e1 = await repository.createEnrollment({
        employee_id: testEmployeeId,
        program_id: testProgramId,
        enrollment_date: new Date('2024-01-01'),
        status: 'completed',
      });

      const e2 = await repository.createEnrollment({
        employee_id: testEmployeeId,
        program_id: testProgramId,
        enrollment_date: new Date('2024-06-01'),
        status: 'enrolled',
      });

      expect(e1.id).not.toBe(e2.id);

      const enrollments = await repository.getEnrollmentsByEmployee(testEmployeeId);
      expect(enrollments.length).toBeGreaterThanOrEqual(2);
    });
  });
});
