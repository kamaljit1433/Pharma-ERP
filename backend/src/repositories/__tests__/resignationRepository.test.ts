/**
 * Resignation Repository - Unit Tests
 * Tests for resignation CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { ResignationRepository } from '../resignationRepository';
import db from '../../config/knex';

describe('ResignationRepository', () => {
  let repository: ResignationRepository;
  let testResignationId: string;
  let testEmployeeId: string;

  beforeAll(async () => {
    repository = new ResignationRepository(db);

    // Clean up test data
    await db('resignations').del();
    await db('employees').del();

    // Create test employee
    const [emp] = await db('employees')
      .insert({
        id: 'a1000000-0000-4000-a000-000000000006',
        employee_id: 'EMP-RESIGN-001',
        first_name: 'Test',
        last_name: 'Employee',
        email: 'test@example.com',
        phone: '+1234567890',
        date_of_joining: new Date('2020-01-01'),
        employment_type: 'permanent',
        status: 'active',
      })
      .returning('*');

    testEmployeeId = emp.id;
  });

  afterAll(async () => {
    await db('resignations').del();
    await db('employees').del();
  });

  describe('createResignation', () => {
    it('should create a resignation with valid data', async () => {
      const resignation = await repository.createResignation({
        employee_id: testEmployeeId,
        resignation_date: new Date(),
        last_working_day: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        reason: 'Better opportunity',
        status: 'pending',
      });

      expect(resignation).toBeDefined();
      expect(resignation.id).toBeDefined();
      expect(resignation.employee_id).toBe(testEmployeeId);
      expect(resignation.status).toBe('pending');

      testResignationId = resignation.id;
    });

    it('should create resignations with different statuses', async () => {
      const statuses = ['pending', 'accepted', 'rejected', 'withdrawn'];

      for (const status of statuses) {
        const resignation = await repository.createResignation({
          employee_id: testEmployeeId,
          resignation_date: new Date(),
          last_working_day: new Date(),
          reason: `Status: ${status}`,
          status: status as any,
        });

        expect(resignation.status).toBe(status);
      }
    });
  });

  describe('getResignationById', () => {
    it('should retrieve resignation by ID', async () => {
      const resignation = await repository.getResignationById(testResignationId);

      expect(resignation).toBeDefined();
      expect(resignation?.id).toBe(testResignationId);
      expect(resignation?.employee_id).toBe(testEmployeeId);
    });

    it('should return null for non-existent ID', async () => {
      const resignation = await repository.getResignationById('00000000-0000-4000-a000-ffffffffffff');
      expect(resignation).toBeNull();
    });
  });

  describe('getResignationByEmployee', () => {
    it('should retrieve resignation by employee ID', async () => {
      const resignation = await repository.getResignationByEmployee(testEmployeeId);

      expect(resignation).toBeDefined();
      expect(resignation?.employee_id).toBe(testEmployeeId);
    });

    it('should return null for employee without resignation', async () => {
      const resignation = await repository.getResignationByEmployee('00000000-0000-4000-a000-fffffffffffe');
      expect(resignation).toBeNull();
    });
  });

  describe('getPendingResignations', () => {
    it('should retrieve pending resignations', async () => {
      const resignations = await repository.getPendingResignations();

      expect(Array.isArray(resignations)).toBe(true);
      resignations.forEach((r) => {
        expect(r.status).toBe('pending');
      });
    });
  });

  describe('updateResignation', () => {
    it('should update resignation properties', async () => {
      const updated = await repository.updateResignation(testResignationId, {
        reason: 'Updated reason',
        status: 'accepted',
      });

      expect(updated.reason).toBe('Updated reason');
      expect(updated.status).toBe('accepted');
    });

    it('should update last working day', async () => {
      const newDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      const updated = await repository.updateResignation(testResignationId, {
        last_working_day: newDate,
      });

      expect(updated.last_working_day.toISOString().slice(0, 10)).toBe(newDate.toISOString().slice(0, 10));
    });
  });

  describe('acceptResignation', () => {
    it('should accept a resignation', async () => {
      const resignation = await repository.createResignation({
        employee_id: testEmployeeId,
        resignation_date: new Date(),
        last_working_day: new Date(),
        reason: 'To accept',
        status: 'pending',
      });

      const accepted = await repository.acceptResignation(resignation.id, testEmployeeId);

      expect(accepted.status).toBe('accepted');
    });
  });

  describe('rejectResignation', () => {
    it('should reject a resignation', async () => {
      const resignation = await repository.createResignation({
        employee_id: testEmployeeId,
        resignation_date: new Date(),
        last_working_day: new Date(),
        reason: 'To reject',
        status: 'pending',
      });

      const rejected = await repository.rejectResignation(resignation.id, testEmployeeId, 'Critical project ongoing');

      expect(rejected.status).toBe('rejected');
    });
  });

  describe('deleteResignation', () => {
    it('should delete a resignation', async () => {
      const resignation = await repository.createResignation({
        employee_id: testEmployeeId,
        resignation_date: new Date(),
        last_working_day: new Date(),
        reason: 'To delete',
        status: 'pending',
      });

      await repository.deleteResignation(resignation.id);

      const deleted = await repository.getResignationById(resignation.id);
      expect(deleted).toBeNull();
    });
  });

  describe('CRUD operations', () => {
    it('should support full CRUD lifecycle', async () => {
      // Create
      const created = await repository.createResignation({
        employee_id: testEmployeeId,
        resignation_date: new Date(),
        last_working_day: new Date(),
        reason: 'CRUD test',
        status: 'pending',
      });

      expect(created.id).toBeDefined();

      // Read
      const read = await repository.getResignationById(created.id);
      expect(read?.reason).toBe('CRUD test');

      // Update
      const updated = await repository.updateResignation(created.id, {
        reason: 'Updated CRUD test',
      });

      expect(updated.reason).toBe('Updated CRUD test');

      // Delete
      await repository.deleteResignation(created.id);
      const deleted = await repository.getResignationById(created.id);
      expect(deleted).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle different notice periods', async () => {
      const noticePeriods = [0, 7, 14, 30, 60, 90];

      for (const days of noticePeriods) {
        const lastWorkingDay = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

        const resignation = await repository.createResignation({
          employee_id: testEmployeeId,
          resignation_date: new Date(),
          last_working_day: lastWorkingDay,
          reason: `${days} days notice`,
          status: 'pending',
        });

        expect(resignation.last_working_day.toISOString().slice(0, 10)).toBe(lastWorkingDay.toISOString().slice(0, 10));
      }
    });

    it('should handle long resignation reasons', async () => {
      const longReason = 'A'.repeat(5000);

      const resignation = await repository.createResignation({
        employee_id: testEmployeeId,
        resignation_date: new Date(),
        last_working_day: new Date(),
        reason: longReason,
        status: 'pending',
      });

      expect(resignation.reason?.length).toBe(5000);
    });

    it('should handle immediate resignations', async () => {
      const resignation = await repository.createResignation({
        employee_id: testEmployeeId,
        resignation_date: new Date(),
        last_working_day: new Date(),
        reason: 'Immediate resignation',
        status: 'pending',
      });

      expect(resignation.last_working_day).toBeDefined();
    });
  });
});
