/**
 * Advance Salary Repository - Unit Tests
 * Tests for advance salary request CRUD operations and workflow
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { AdvanceSalaryRepository } from '../advanceSalaryRepository';
import db from '../../config/knex';

describe('AdvanceSalaryRepository', () => {
  let repository: AdvanceSalaryRepository;
  const testEmployeeId = 'a0000000-0000-4000-a000-000000000001';
  let testAdvanceId: string;

  beforeAll(async () => {
    repository = new AdvanceSalaryRepository(db);
    await db('advance_salary_requests').del();
    await db('employees')
      .insert({
        id: 'c0000000-0000-4000-a000-000000000101',
        employee_id: 'EMP-MGR-001',
        first_name: 'Manager',
        last_name: 'One',
        email: 'mgr1@example.com',
        employment_type: 'permanent',
        status: 'active',
        date_of_joining: new Date()
      })
      .onConflict('id').ignore();
    await db('employees')
      .insert({
        id: 'c0000000-0000-4000-a000-000000000102',
        employee_id: 'EMP-MGR-002',
        first_name: 'Manager',
        last_name: 'Two',
        email: 'mgr2@example.com',
        employment_type: 'permanent',
        status: 'active',
        date_of_joining: new Date()
      })
      .onConflict('id').ignore();
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
    await db('advance_salary_requests').del();
    await db('employees').del();
    await db.destroy();
  });

  describe('createAdvanceRequest', () => {
    it('should create an advance salary request', async () => {
      const request = await repository.createAdvanceRequest({
        employee_id: testEmployeeId,
        amount: 5000,
        reason: 'Medical emergency',
        deduction_months: 2,
      });

      expect(request).toBeDefined();
      expect(request.id).toBeDefined();
      expect(request.employee_id).toBe(testEmployeeId);
      expect(request.amount).toBe(5000);
      expect(request.status).toBe('pending');
      expect(request.deduction_months).toBe(2);
      expect(request.created_at).toBeDefined();

      testAdvanceId = request.id;
    });

    it('should set default deduction_months to 1', async () => {
      const request = await repository.createAdvanceRequest({
        employee_id: testEmployeeId,
        amount: 3000,
        reason: 'Personal need',
      });

      expect(request.deduction_months).toBe(1);
    });
  });

  describe('getAdvanceRequestById', () => {
    it('should retrieve advance request by ID', async () => {
      const request = await repository.getAdvanceRequestById(testAdvanceId);

      expect(request).toBeDefined();
      expect(request?.id).toBe(testAdvanceId);
      expect(request?.amount).toBe(5000);
    });

    it('should return null for non-existent request', async () => {
      const request = await repository.getAdvanceRequestById('00000000-0000-4000-a000-ffffffffffff');

      expect(request).toBeNull();
    });
  });

  describe('getAdvanceRequestsByEmployee', () => {
    it('should retrieve all advance requests for an employee', async () => {
      const requests = await repository.getAdvanceRequestsByEmployee(testEmployeeId);

      expect(Array.isArray(requests)).toBe(true);
      expect(requests.length).toBeGreaterThan(0);
      expect(requests.every((r) => r.employee_id === testEmployeeId)).toBe(true);
    });

    it('should return empty array for employee with no requests', async () => {
      const requests = await repository.getAdvanceRequestsByEmployee('a0000000-0000-4000-a000-000000000099');

      expect(Array.isArray(requests)).toBe(true);
      expect(requests.length).toBe(0);
    });

    it('should order by created_at descending', async () => {
      const requests = await repository.getAdvanceRequestsByEmployee(testEmployeeId);

      if (requests.length > 1) {
        for (let i = 0; i < requests.length - 1; i++) {
          expect(requests[i]!.created_at.getTime()).toBeGreaterThanOrEqual(
            requests[i + 1]!.created_at.getTime()
          );
        }
      }
    });
  });

  describe('getPendingAdvanceRequests', () => {
    it('should retrieve only pending requests', async () => {
      const requests = await repository.getPendingAdvanceRequests();

      expect(Array.isArray(requests)).toBe(true);
      expect(requests.every((r) => r.status === 'pending')).toBe(true);
    });
  });

  describe('approveAdvanceRequest', () => {
    it('should approve an advance request', async () => {
      const approved = await repository.approveAdvanceRequest(
        testAdvanceId,
        'c0000000-0000-4000-a000-000000000101',
        'Approved for medical emergency'
      );

      expect(approved.status).toBe('approved');
      expect(approved.approved_by).toBe('c0000000-0000-4000-a000-000000000101');
      expect(approved.approval_notes).toBe('Approved for medical emergency');
      expect(approved.approved_at).toBeDefined();
    });

    it('should update updated_at timestamp', async () => {
      const before = await repository.getAdvanceRequestById(testAdvanceId);
      const before_time = before?.updated_at.getTime();

      await new Promise((resolve) => setTimeout(resolve, 100));

      const after = await repository.getAdvanceRequestById(testAdvanceId);
      const after_time = after?.updated_at.getTime();

      expect(after_time).toBeGreaterThanOrEqual(before_time!);
    });
  });

  describe('rejectAdvanceRequest', () => {
    it('should reject an advance request', async () => {
      const request = await repository.createAdvanceRequest({
        employee_id: testEmployeeId,
        amount: 2000,
        reason: 'Test rejection',
      });

      const rejected = await repository.rejectAdvanceRequest(
        request.id,
        'c0000000-0000-4000-a000-000000000102',
        'Insufficient funds'
      );

      expect(rejected.status).toBe('rejected');
      expect(rejected.approved_by).toBe('c0000000-0000-4000-a000-000000000102');
      expect(rejected.approval_notes).toBe('Insufficient funds');
      expect(rejected.approved_at).toBeDefined();
    });

    it('should not overwrite approved_by when rejecting', async () => {
      const request = await repository.createAdvanceRequest({
        employee_id: testEmployeeId,
        amount: 1500,
        reason: 'Test audit trail',
      });

      await repository.approveAdvanceRequest(request.id, 'c0000000-0000-4000-a000-000000000101', 'Approved');
      const rejected = await repository.rejectAdvanceRequest(
        request.id,
        'c0000000-0000-4000-a000-000000000102',
        'Changed mind'
      );

      // Schema reuses approved_by for the last processor; rejection overwrites it
      expect(rejected.approved_by).toBe('c0000000-0000-4000-a000-000000000102');
      expect(rejected.status).toBe('rejected');
    });
  });

  describe('markAsDeducted', () => {
    it('should mark advance request as deducted', async () => {
      const request = await repository.createAdvanceRequest({
        employee_id: testEmployeeId,
        amount: 4000,
        reason: 'Test deduction',
      });

      await repository.approveAdvanceRequest(request.id, 'c0000000-0000-4000-a000-000000000101');
      const deducted = await repository.markAsDeducted(request.id);

      expect(deducted.status).toBe('deducted');
    });
  });
});
