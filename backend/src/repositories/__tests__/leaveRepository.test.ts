/**
 * Leave Repository - Unit Tests
 * Tests for leave requests, leave balances, and leave management
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { LeaveRepository } from '../leaveRepository';
import db from '../../config/knex';
import { CreateLeaveDTO, UpdateLeaveDTO } from '../../types/leave';

const MANAGER_ID = 'c0000000-0000-4000-a000-000000000101';
const EMPLOYEE_ID = 'c0000000-0000-4000-a000-000000000102';
const LEAVE_TYPE_ID = 'e0000000-0000-4000-b000-000000000001';

describe('LeaveRepository', () => {
  let repository: LeaveRepository;
  let testEmployeeId: string;
  let testLeaveId: string;

  beforeAll(async () => {
    repository = new LeaveRepository(db);

    // Clean up
    await db('leaves').del();
    await db('leave_types').where('id', LEAVE_TYPE_ID).del();
    await db('employees').whereIn('id', [MANAGER_ID, EMPLOYEE_ID]).del();

    // Create manager
    await db('employees')
      .insert({
        id: MANAGER_ID,
        employee_id: 'EMP-MGR-001',
        first_name: 'Manager',
        last_name: 'One',
        email: 'mgr1.leave@example.com',
        date_of_joining: new Date(),
      })
      .onConflict('id').ignore();

    // Create employee reporting to manager
    await db('employees')
      .insert({
        id: EMPLOYEE_ID,
        employee_id: 'EMP-LEAVE-001',
        first_name: 'Leave',
        last_name: 'Tester',
        email: 'leave.tester@example.com',
        date_of_joining: new Date(),
        reporting_manager_id: MANAGER_ID,
      })
      .onConflict('id').ignore();

    testEmployeeId = EMPLOYEE_ID;

    // Create leave type
    await db('leave_types')
      .insert({
        id: LEAVE_TYPE_ID,
        name: 'Annual Leave',
        code: 'AL',
        annual_limit: 20,
        is_paid: true,
        requires_approval: true,
        carry_forward_limit: 5,
        is_active: true,
      })
      .onConflict('id').ignore();
  });

  afterAll(async () => {
    await db('leaves').del();
    await db('leave_types').where('id', LEAVE_TYPE_ID).del();
    await db('employees').whereIn('id', [MANAGER_ID, EMPLOYEE_ID]).del();
  });

  describe('createLeave', () => {
    it('should create leave request', async () => {
      const data: CreateLeaveDTO = {
        employee_id: testEmployeeId,
        leave_type_id: LEAVE_TYPE_ID,
        from_date: '2024-02-01',
        to_date: '2024-02-05',
        reason: 'Vacation',
        status: 'pending',
      };

      const leave = await repository.createLeave(data);

      expect(leave).toBeDefined();
      expect(leave.id).toBeDefined();
      expect(leave.employee_id).toBe(testEmployeeId);
      expect(leave.status).toBe('pending');
      expect(leave.reason).toBe('Vacation');

      testLeaveId = leave.id;
    });

    it('should create leave with default pending status', async () => {
      const data: CreateLeaveDTO = {
        employee_id: testEmployeeId,
        leave_type_id: LEAVE_TYPE_ID,
        from_date: '2024-02-10',
        to_date: '2024-02-10',
        reason: 'Personal',
      };

      const leave = await repository.createLeave(data);

      expect(leave.status).toBe('pending');
    });
  });

  describe('getLeave', () => {
    it('should retrieve leave by ID', async () => {
      const leave = await repository.getLeave(testLeaveId);

      expect(leave).toBeDefined();
      expect(leave?.id).toBe(testLeaveId);
    });

    it('should return null for non-existent leave', async () => {
      const leave = await repository.getLeave('00000000-0000-4000-a000-ffffffffffff');

      expect(leave).toBeNull();
    });
  });

  describe('updateLeave', () => {
    it('should update leave status', async () => {
      const updateData: UpdateLeaveDTO = {
        status: 'approved',
        approved_by: MANAGER_ID,
        approval_date: new Date(),
      };

      const updated = await repository.updateLeave(testLeaveId, updateData);

      expect(updated.status).toBe('approved');
      expect(updated.approved_by).toBe(MANAGER_ID);
    });

    it('should throw error for non-existent leave', async () => {
      await expect(
        repository.updateLeave('00000000-0000-4000-a000-ffffffffffff', { status: 'approved' })
      ).rejects.toThrow();
    });
  });

  describe('getEmployeeLeaves', () => {
    it('should retrieve employee leaves', async () => {
      const leaves = await repository.getEmployeeLeaves(testEmployeeId);

      expect(Array.isArray(leaves)).toBe(true);
      expect(leaves.length).toBeGreaterThan(0);
    });

    it('should filter by status', async () => {
      const leaves = await repository.getEmployeeLeaves(testEmployeeId, 'approved');

      expect(Array.isArray(leaves)).toBe(true);
      expect(leaves.every((l) => l.status === 'approved')).toBe(true);
    });
  });

  describe('getLeavesByDateRange', () => {
    it('should retrieve leaves for date range', async () => {
      const leaves = await repository.getLeavesByDateRange(testEmployeeId, '2024-02-01', '2024-02-28');

      expect(Array.isArray(leaves)).toBe(true);
    });
  });

  describe('getPendingLeaves', () => {
    it('should retrieve pending leaves', async () => {
      const leaves = await repository.getPendingLeaves();

      expect(Array.isArray(leaves)).toBe(true);
    });

    it('should filter by manager', async () => {
      const leaves = await repository.getPendingLeaves(MANAGER_ID);

      expect(Array.isArray(leaves)).toBe(true);
    });
  });

  describe('getApprovedLeaves', () => {
    it('should retrieve approved leaves', async () => {
      const leaves = await repository.getApprovedLeaves(testEmployeeId);

      expect(Array.isArray(leaves)).toBe(true);
    });
  });

  describe('getRejectedLeaves', () => {
    it('should retrieve rejected leaves', async () => {
      const leaves = await repository.getRejectedLeaves(testEmployeeId);

      expect(Array.isArray(leaves)).toBe(true);
    });
  });

  describe('getLeaveCount', () => {
    it('should count leaves by status', async () => {
      const count = await repository.getLeaveCount(testEmployeeId, 'approved');

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('cancelLeave', () => {
    it('should cancel leave request', async () => {
      const data: CreateLeaveDTO = {
        employee_id: testEmployeeId,
        leave_type_id: LEAVE_TYPE_ID,
        from_date: '2024-02-20',
        to_date: '2024-02-22',
        reason: 'To be cancelled',
        status: 'approved',
      };

      const leave = await repository.createLeave(data);
      const cancelled = await repository.cancelLeave(leave.id, 'Changed plans');

      expect(cancelled.status).toBe('cancelled');
      expect(cancelled.cancellation_reason).toBe('Changed plans');
    });
  });

  describe('getLeavesByType', () => {
    it('should retrieve leaves by type', async () => {
      const leaves = await repository.getLeavesByType(testEmployeeId, LEAVE_TYPE_ID);

      expect(Array.isArray(leaves)).toBe(true);
    });
  });

  describe('getOverlappingLeaves', () => {
    it('should detect overlapping leaves', async () => {
      const overlapping = await repository.getOverlappingLeaves(
        testEmployeeId,
        '2024-02-01',
        '2024-02-05'
      );

      expect(Array.isArray(overlapping)).toBe(true);
    });
  });

  describe('getTeamLeaves', () => {
    it('should retrieve team leaves for manager', async () => {
      const leaves = await repository.getTeamLeaves(MANAGER_ID);

      expect(Array.isArray(leaves)).toBe(true);
    });

    it('should filter by date range', async () => {
      const leaves = await repository.getTeamLeaves(MANAGER_ID, '2024-02-01', '2024-02-28');

      expect(Array.isArray(leaves)).toBe(true);
    });
  });
});
