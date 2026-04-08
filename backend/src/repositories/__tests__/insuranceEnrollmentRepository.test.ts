/**
 * Insurance Enrollment Repository - Unit Tests
 * Tests for insurance enrollment CRUD operations and status management
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { InsuranceEnrollmentRepository } from '../insuranceEnrollmentRepository';
import db from '../../config/knex';

describe('InsuranceEnrollmentRepository', () => {
  let repository: InsuranceEnrollmentRepository;
  let testEnrollmentId: string;
  let testEmployeeId: string;
  let testPlanId: string;

  beforeAll(async () => {
    repository = new InsuranceEnrollmentRepository(db);
    
    // Create test data
    await db('insurance_enrollments').del();
    await db('insurance_plans').del();
    await db('employees').del();

    // Create test employee
    const [emp] = await db('employees')
      .insert({
        id: 'a1000000-0000-4000-a000-000000000001',
        employee_id: 'EMP-TEST-001',
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

    // Create test plan
    const [plan] = await db('insurance_plans')
      .insert({
        id: 'b1000000-0000-4000-b000-000000000001',
        name: 'Test Plan',
        provider: 'Test Provider',
        premium_amount: 5000,
        coverage_type: 'health',
        enrollment_start_date: new Date(),
        enrollment_end_date: new Date(),
        is_active: true,
      })
      .returning('*');

    testPlanId = plan.id;
  });

  afterAll(async () => {
    await db('insurance_enrollments').del();
    await db('insurance_plans').del();
    await db('employees').del();
  });

  describe('createEnrollment', () => {
    it('should create an insurance enrollment with valid data', async () => {
      const enrollment = await repository.createEnrollment({
        employee_id: testEmployeeId,
        plan_id: testPlanId,
        enrollment_date: new Date(),
        status: 'active',
      });

      expect(enrollment).toBeDefined();
      expect(enrollment.id).toBeDefined();
      expect(enrollment.employee_id).toBe(testEmployeeId);
      expect(enrollment.plan_id).toBe(testPlanId);
      expect(enrollment.status).toBe('active');

      testEnrollmentId = enrollment.id;
    });

    it('should create enrollments with different statuses', async () => {
      const statuses = ['active', 'pending', 'cancelled'];

      for (const status of statuses) {
        const enrollment = await repository.createEnrollment({
          employee_id: testEmployeeId,
          plan_id: testPlanId,
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

  describe('getEnrollmentsByPlan', () => {
    it('should retrieve enrollments by plan ID', async () => {
      const enrollments = await repository.getEnrollmentsByPlan(testPlanId);

      expect(Array.isArray(enrollments)).toBe(true);
      expect(enrollments.length).toBeGreaterThan(0);
      enrollments.forEach((e) => {
        expect(e.plan_id).toBe(testPlanId);
      });
    });
  });

  describe('getActiveEnrollments', () => {
    it('should retrieve only active enrollments', async () => {
      const enrollments = await repository.getActiveEnrollments();

      expect(Array.isArray(enrollments)).toBe(true);
      enrollments.forEach((e) => {
        expect(e.status).toBe('active');
      });
    });
  });

  describe('updateEnrollment', () => {
    it('should update enrollment status', async () => {
      const updated = await repository.updateEnrollment(testEnrollmentId, {
        status: 'cancelled',
      });

      expect(updated.status).toBe('cancelled');
    });

    it('should update enrollment date', async () => {
      const newDate = new Date('2025-01-01');
      const updated = await repository.updateEnrollment(testEnrollmentId, {
        enrollment_date: newDate,
      });

      expect(updated.enrollment_date).toEqual(newDate);
    });
  });

  describe('deleteEnrollment', () => {
    it('should delete an enrollment', async () => {
      const enrollment = await repository.createEnrollment({
        employee_id: testEmployeeId,
        plan_id: testPlanId,
        enrollment_date: new Date(),
        status: 'active',
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
        plan_id: testPlanId,
        enrollment_date: new Date(),
        status: 'pending',
      });

      expect(created.id).toBeDefined();

      // Read
      const read = await repository.getEnrollmentById(created.id);
      expect(read?.status).toBe('pending');

      // Update
      const updated = await repository.updateEnrollment(created.id, {
        status: 'active',
      });

      expect(updated.status).toBe('active');

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
        plan_id: testPlanId,
        enrollment_date: new Date(),
        status: 'active',
      });

      const e2 = await repository.createEnrollment({
        employee_id: testEmployeeId,
        plan_id: testPlanId,
        enrollment_date: new Date(),
        status: 'active',
      });

      expect(e1.id).not.toBe(e2.id);

      const enrollments = await repository.getEnrollmentsByEmployee(testEmployeeId);
      expect(enrollments.length).toBeGreaterThanOrEqual(2);
    });
  });
});
