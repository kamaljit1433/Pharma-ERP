/**
 * Visit Repository - Unit Tests
 * Tests for visit CRUD operations
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { VisitRepository } from '../visitRepository';
import db from '../../config/knex';

describe('VisitRepository', () => {
  let repository: VisitRepository;
  let testVisitId: string;
  let testRecordId: string;

  beforeAll(async () => {
    repository = new VisitRepository(db);

    // Clean up test data
    await db('visits').del();
    await db('suppliers_buyers').del();
    await db('employees').del();

    // Create test employee
    const [emp] = await db('employees')
      .insert({
        id: 'a1000000-0000-4000-a000-000000000010',
        employee_id: 'EMP-VISIT-001',
        first_name: 'Test',
        last_name: 'Employee',
        email: 'test@example.com',
        phone: '+1234567890',
        date_of_joining: new Date(),
        employment_type: 'permanent',
        status: 'active',
      })
      .returning('*');

    // Create test supplier/buyer record
    const [record] = await db('suppliers_buyers')
      .insert({
        id: 'b1000000-0000-4000-b000-000000000005',
        employee_id: emp.id,
        name: 'Test Company',
        type: 'supplier',
        contact_person: 'Contact',
        email: 'contact@example.com',
        phone: '+1234567890',
        address: '123 St',
        city: 'City',
        state: 'State',
        country: 'Country',
      })
      .returning('*');

    testRecordId = record.id;
  });

  afterAll(async () => {
    await db('visits').del();
    await db('suppliers_buyers').del();
    await db('employees').del();
  });

  describe('createVisit', () => {
    it('should create a visit with valid data', async () => {
      const visit = await repository.createVisit({
        record_id: testRecordId,
        visit_date: new Date(),
        location: { latitude: 40.7128, longitude: -74.006 },
        notes: 'Productive meeting',
        duration_minutes: 60,
      });

      expect(visit).toBeDefined();
      expect(visit.id).toBeDefined();
      expect(visit.record_id).toBe(testRecordId);
      expect(visit.duration_minutes).toBe(60);

      testVisitId = visit.id;
    });
  });

  describe('getVisitById', () => {
    it('should retrieve visit by ID', async () => {
      const visit = await repository.getVisitById(testVisitId);

      expect(visit).toBeDefined();
      expect(visit?.id).toBe(testVisitId);
      expect(visit?.record_id).toBe(testRecordId);
    });

    it('should return null for non-existent ID', async () => {
      const visit = await repository.getVisitById('00000000-0000-4000-a000-ffffffffffff');
      expect(visit).toBeNull();
    });
  });

  describe('getVisitsByRecord', () => {
    it('should retrieve visits by record ID', async () => {
      const visits = await repository.getVisitsByRecord(testRecordId);

      expect(Array.isArray(visits)).toBe(true);
      expect(visits.length).toBeGreaterThan(0);
      visits.forEach((v) => {
        expect(v.record_id).toBe(testRecordId);
      });
    });

    it('should return empty array for non-existent record', async () => {
      const visits = await repository.getVisitsByRecord('00000000-0000-4000-a000-fffffffffffb');
      expect(visits).toEqual([]);
    });
  });

  describe('getVisitsByDateRange', () => {
    it('should retrieve visits within date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const visits = await repository.getVisitsByDateRange(startDate, endDate);

      expect(Array.isArray(visits)).toBe(true);
      visits.forEach((v) => {
        const vDate = new Date(v.visit_date);
        expect(vDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(vDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });
  });

  describe('updateVisit', () => {
    it('should update visit properties', async () => {
      const updated = await repository.updateVisit(testVisitId, {
        notes: 'Updated notes',
        duration_minutes: 90,
      });

      expect(updated.notes).toBe('Updated notes');
      expect(updated.duration_minutes).toBe(90);
    });
  });

  describe('deleteVisit', () => {
    it('should delete a visit', async () => {
      const visit = await repository.createVisit({
        record_id: testRecordId,
        visit_date: new Date(),
        location: { latitude: 40.7128, longitude: -74.006 },
        notes: 'To delete',
        duration_minutes: 30,
      });

      await repository.deleteVisit(visit.id);

      const deleted = await repository.getVisitById(visit.id);
      expect(deleted).toBeNull();
    });
  });

  describe('CRUD operations', () => {
    it('should support full CRUD lifecycle', async () => {
      // Create
      const created = await repository.createVisit({
        record_id: testRecordId,
        visit_date: new Date(),
        location: { latitude: 40.7128, longitude: -74.006 },
        notes: 'CRUD test',
        duration_minutes: 45,
      });

      expect(created.id).toBeDefined();

      // Read
      const read = await repository.getVisitById(created.id);
      expect(read?.notes).toBe('CRUD test');

      // Update
      const updated = await repository.updateVisit(created.id, {
        notes: 'Updated CRUD test',
      });

      expect(updated.notes).toBe('Updated CRUD test');

      // Delete
      await repository.deleteVisit(created.id);
      const deleted = await repository.getVisitById(created.id);
      expect(deleted).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle zero duration', async () => {
      const visit = await repository.createVisit({
        record_id: testRecordId,
        visit_date: new Date(),
        location: { latitude: 40.7128, longitude: -74.006 },
        notes: 'Quick visit',
        duration_minutes: 0,
      });

      expect(visit.duration_minutes).toBe(0);
    });

    it('should handle very long durations', async () => {
      const visit = await repository.createVisit({
        record_id: testRecordId,
        visit_date: new Date(),
        location: { latitude: 40.7128, longitude: -74.006 },
        notes: 'All day visit',
        duration_minutes: 1440,
      });

      expect(visit.duration_minutes).toBe(1440);
    });

    it('should handle long notes', async () => {
      const longNotes = 'A'.repeat(5000);

      const visit = await repository.createVisit({
        record_id: testRecordId,
        visit_date: new Date(),
        location: { latitude: 40.7128, longitude: -74.006 },
        notes: longNotes,
        duration_minutes: 60,
      });

      expect(visit.notes?.length).toBe(5000);
    });

    it('should handle multiple visits for same record', async () => {
      const v1 = await repository.createVisit({
        record_id: testRecordId,
        visit_date: new Date('2024-06-01'),
        location: { latitude: 40.7128, longitude: -74.006 },
        notes: 'First visit',
        duration_minutes: 60,
      });

      const v2 = await repository.createVisit({
        record_id: testRecordId,
        visit_date: new Date('2024-06-15'),
        location: { latitude: 40.7128, longitude: -74.006 },
        notes: 'Second visit',
        duration_minutes: 45,
      });

      expect(v1.id).not.toBe(v2.id);

      const visits = await repository.getVisitsByRecord(testRecordId);
      expect(visits.length).toBeGreaterThanOrEqual(2);
    });
  });
});
