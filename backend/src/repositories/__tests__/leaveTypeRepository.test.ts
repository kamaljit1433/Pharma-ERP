/**
 * Leave Type Repository - Unit Tests
 * Tests for leave type management
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { LeaveTypeRepository } from '../leaveTypeRepository';
import db from '../../config/knex';
import { CreateLeaveTypeDTO, UpdateLeaveTypeDTO } from '../../types/leave';

describe('LeaveTypeRepository', () => {
  let repository: LeaveTypeRepository;
  let testLeaveTypeId: string;

  beforeAll(async () => {
    repository = new LeaveTypeRepository(db);

    // Clean up test data
    await db('leave_types').del();
  });

  afterAll(async () => {
    await db('leave_types').del();
  });

  describe('createLeaveType', () => {
    it('should create leave type', async () => {
      const data: CreateLeaveTypeDTO = {
        name: 'Casual Leave',
        code: 'CL',
        annual_limit: 12,
        carry_forward_limit: 5,
        is_paid: true,
      };

      const leaveType = await repository.createLeaveType(data);

      expect(leaveType).toBeDefined();
      expect(leaveType.id).toBeDefined();
      expect(leaveType.name).toBe('Casual Leave');
      expect(leaveType.annual_limit).toBe(12);
      expect(leaveType.is_paid).toBe(true);

      testLeaveTypeId = leaveType.id;
    });

    it('should create unpaid leave type', async () => {
      const data: CreateLeaveTypeDTO = {
        name: 'Unpaid Leave',
        code: 'UL',
        annual_limit: 0,
        is_paid: false,
      };

      const leaveType = await repository.createLeaveType(data);

      expect(leaveType.is_paid).toBe(false);
    });
  });

  describe('getLeaveType', () => {
    it('should retrieve leave type by ID', async () => {
      const leaveType = await repository.getLeaveType(testLeaveTypeId);

      expect(leaveType).toBeDefined();
      expect(leaveType?.id).toBe(testLeaveTypeId);
      expect(leaveType?.name).toBe('Casual Leave');
    });

    it('should return null for non-existent leave type', async () => {
      const leaveType = await repository.getLeaveType('00000000-0000-4000-a000-ffffffffffff');

      expect(leaveType).toBeNull();
    });
  });

  describe('getLeaveTypeByName', () => {
    it('should retrieve leave type by name', async () => {
      const leaveType = await repository.getLeaveTypeByName('Casual Leave');

      expect(leaveType).toBeDefined();
      expect(leaveType?.name).toBe('Casual Leave');
    });

    it('should return null for non-existent name', async () => {
      const leaveType = await repository.getLeaveTypeByName('NonExistent');

      expect(leaveType).toBeNull();
    });
  });

  describe('updateLeaveType', () => {
    it('should update leave type', async () => {
      const updateData: UpdateLeaveTypeDTO = {
        annual_limit: 15,
        carry_forward_limit: 7,
      };

      const updated = await repository.updateLeaveType(testLeaveTypeId, updateData);

      expect(updated.annual_limit).toBe(15);
      expect(updated.carry_forward_limit).toBe(7);
    });

    it('should throw error for non-existent leave type', async () => {
      await expect(
        repository.updateLeaveType('00000000-0000-4000-a000-ffffffffffff', { annual_limit: 10 })
      ).rejects.toThrow();
    });
  });

  describe('getAllLeaveTypes', () => {
    it('should retrieve all leave types', async () => {
      const leaveTypes = await repository.getAllLeaveTypes();

      expect(Array.isArray(leaveTypes)).toBe(true);
      expect(leaveTypes.length).toBeGreaterThan(0);
    });
  });

  describe('getActiveLeaveTypes', () => {
    it('should retrieve only active leave types', async () => {
      const leaveTypes = await repository.getActiveLeaveTypes();

      expect(Array.isArray(leaveTypes)).toBe(true);
      expect(leaveTypes.every((lt) => lt.is_active)).toBe(true);
    });
  });

  describe('getPaidLeaveTypes', () => {
    it('should retrieve paid leave types', async () => {
      const leaveTypes = await repository.getPaidLeaveTypes();

      expect(Array.isArray(leaveTypes)).toBe(true);
      expect(leaveTypes.every((lt) => lt.is_paid)).toBe(true);
    });
  });

  describe('getUnpaidLeaveTypes', () => {
    it('should retrieve unpaid leave types', async () => {
      const leaveTypes = await repository.getUnpaidLeaveTypes();

      expect(Array.isArray(leaveTypes)).toBe(true);
      expect(leaveTypes.every((lt) => !lt.is_paid)).toBe(true);
    });
  });

  describe('getLeaveTypeCount', () => {
    it('should count all leave types', async () => {
      const count = await repository.getLeaveTypeCount();

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('searchLeaveTypes', () => {
    it('should search leave types by name', async () => {
      const results = await repository.searchLeaveTypes('Casual');

      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('deactivateLeaveType', () => {
    it('should deactivate leave type', async () => {
      const data: CreateLeaveTypeDTO = {
        name: 'Deactivate Test',
        code: 'DT',
        annual_limit: 10,
        is_paid: true,
      };

      const leaveType = await repository.createLeaveType(data);
      const deactivated = await repository.deactivateLeaveType(leaveType.id);

      expect(deactivated.is_active).toBe(false);
    });
  });

  describe('deleteLeaveType', () => {
    it('should delete leave type', async () => {
      const data: CreateLeaveTypeDTO = {
        name: 'Delete Test',
        code: 'DELETE',
        annual_limit: 10,
        is_paid: true,
      };

      const leaveType = await repository.createLeaveType(data);
      await repository.deleteLeaveType(leaveType.id);

      const deleted = await repository.getLeaveType(leaveType.id);
      expect(deleted).toBeNull();
    });
  });
});
