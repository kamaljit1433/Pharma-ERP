/**
 * Journey Repository - Unit Tests
 * Tests for journey/travel tracking CRUD operations (backed by visits table)
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { JourneyRepository } from '../journeyRepository';
import db from '../../config/knex';

const TEST_EMP_ID = 'f0000000-0000-4000-a000-000000000001';
const TEST_SB_ID = 'f0000000-0000-4000-b000-000000000001';

describe('JourneyRepository', () => {
  let repository: JourneyRepository;
  let testJourneyId: string;
  let testEmployeeId: string;

  beforeAll(async () => {
    repository = new JourneyRepository(db);

    // Clean up
    await db('visits').whereIn('employee_id', [TEST_EMP_ID]).del();
    await db('suppliers_buyers').where('id', TEST_SB_ID).del();
    await db('employees').where('id', TEST_EMP_ID).del();

    // Create test employee
    const [emp] = await db('employees')
      .insert({
        id: TEST_EMP_ID,
        employee_id: 'EMP-JOURNEY-001',
        first_name: 'Test',
        last_name: 'Employee',
        email: 'test.journey@example.com',
        date_of_joining: new Date(),
      })
      .returning('id');

    testEmployeeId = emp.id;

    // Create supplier/buyer (required FK for visits)
    await db('suppliers_buyers').insert({
      id: TEST_SB_ID,
      employee_id: TEST_EMP_ID,
      name: 'Test Client',
      type: 'buyer',
    });
  });

  afterAll(async () => {
    await db('visits').whereIn('employee_id', [TEST_EMP_ID]).del();
    await db('suppliers_buyers').where('id', TEST_SB_ID).del();
    await db('employees').where('id', TEST_EMP_ID).del();
  });

  describe('createJourney', () => {
    it('should create a journey with valid data', async () => {
      const journey = await repository.createJourney({
        employee_id: testEmployeeId,
        supplier_buyer_id: TEST_SB_ID,
        start_location: { latitude: 40.7128, longitude: -74.006 },
        end_location: { latitude: 40.758, longitude: -73.9855 },
        distance: 5.2,
        duration: 1800,
        travel_date: new Date(),
        purpose: 'Client visit',
      });

      expect(journey).toBeDefined();
      expect(journey.id).toBeDefined();
      expect(journey.employee_id).toBe(testEmployeeId);
      expect(journey.distance).toBe(5.2);

      testJourneyId = journey.id;
    });
  });

  describe('getJourneyById', () => {
    it('should retrieve journey by ID', async () => {
      const journey = await repository.getJourneyById(testJourneyId);

      expect(journey).toBeDefined();
      expect(journey?.id).toBe(testJourneyId);
      expect(journey?.employee_id).toBe(testEmployeeId);
    });

    it('should return null for non-existent ID', async () => {
      const journey = await repository.getJourneyById('00000000-0000-4000-a000-ffffffffffff');
      expect(journey).toBeNull();
    });
  });

  describe('getJourneysByEmployee', () => {
    it('should retrieve journeys by employee ID', async () => {
      const journeys = await repository.getJourneysByEmployee(testEmployeeId);

      expect(Array.isArray(journeys)).toBe(true);
      expect(journeys.length).toBeGreaterThan(0);
      journeys.forEach((j) => {
        expect(j.employee_id).toBe(testEmployeeId);
      });
    });

    it('should return empty array for non-existent employee', async () => {
      const journeys = await repository.getJourneysByEmployee('00000000-0000-4000-a000-fffffffffffe');
      expect(journeys).toEqual([]);
    });
  });

  describe('getJourneysByDateRange', () => {
    it('should retrieve journeys within date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const journeys = await repository.getJourneysByDateRange(startDate, endDate);

      expect(Array.isArray(journeys)).toBe(true);
      journeys.forEach((j) => {
        const jDate = new Date(j.travel_date);
        expect(jDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(jDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });
  });

  describe('updateJourney', () => {
    it('should update journey properties', async () => {
      const updated = await repository.updateJourney(testJourneyId, {
        purpose: 'Updated purpose',
        distance: 6.5,
      });

      expect(updated.purpose).toBe('Updated purpose');
      expect(updated.distance).toBe(6.5);
    });
  });

  describe('deleteJourney', () => {
    it('should delete a journey', async () => {
      const journey = await repository.createJourney({
        employee_id: testEmployeeId,
        supplier_buyer_id: TEST_SB_ID,
        start_location: { latitude: 40.7128, longitude: -74.006 },
        end_location: { latitude: 40.758, longitude: -73.9855 },
        distance: 5.2,
        duration: 1800,
        travel_date: new Date(),
        purpose: 'To be deleted',
      });

      await repository.deleteJourney(journey.id);

      const deleted = await repository.getJourneyById(journey.id);
      expect(deleted).toBeNull();
    });
  });

  describe('CRUD operations', () => {
    it('should support full CRUD lifecycle', async () => {
      const created = await repository.createJourney({
        employee_id: testEmployeeId,
        supplier_buyer_id: TEST_SB_ID,
        start_location: { latitude: 40.7128, longitude: -74.006 },
        end_location: { latitude: 40.758, longitude: -73.9855 },
        distance: 5.2,
        duration: 1800,
        travel_date: new Date(),
        purpose: 'CRUD test',
      });

      expect(created.id).toBeDefined();

      const read = await repository.getJourneyById(created.id);
      expect(read?.purpose).toBe('CRUD test');

      const updated = await repository.updateJourney(created.id, {
        purpose: 'Updated CRUD test',
      });
      expect(updated.purpose).toBe('Updated CRUD test');

      await repository.deleteJourney(created.id);
      const deleted = await repository.getJourneyById(created.id);
      expect(deleted).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle zero distance', async () => {
      const journey = await repository.createJourney({
        employee_id: testEmployeeId,
        supplier_buyer_id: TEST_SB_ID,
        start_location: { latitude: 40.7128, longitude: -74.006 },
        end_location: { latitude: 40.7128, longitude: -74.006 },
        distance: 0,
        duration: 0,
        travel_date: new Date(),
        purpose: 'No movement',
      });

      expect(journey.distance).toBe(0);
    });

    it('should handle very long distances', async () => {
      const journey = await repository.createJourney({
        employee_id: testEmployeeId,
        supplier_buyer_id: TEST_SB_ID,
        start_location: { latitude: 40.7128, longitude: -74.006 },
        end_location: { latitude: 51.5074, longitude: -0.1278 },
        distance: 5570.5,
        duration: 86400,
        travel_date: new Date(),
        purpose: 'International travel',
      });

      expect(journey.distance).toBe(5570.5);
    });

    it('should handle multiple journeys for same employee', async () => {
      const j1 = await repository.createJourney({
        employee_id: testEmployeeId,
        supplier_buyer_id: TEST_SB_ID,
        start_location: { latitude: 40.7128, longitude: -74.006 },
        end_location: { latitude: 40.758, longitude: -73.9855 },
        distance: 5.2,
        duration: 1800,
        travel_date: new Date('2024-06-01'),
        purpose: 'First journey',
      });

      const j2 = await repository.createJourney({
        employee_id: testEmployeeId,
        supplier_buyer_id: TEST_SB_ID,
        start_location: { latitude: 40.758, longitude: -73.9855 },
        end_location: { latitude: 40.7128, longitude: -74.006 },
        distance: 5.2,
        duration: 1800,
        travel_date: new Date('2024-06-02'),
        purpose: 'Second journey',
      });

      expect(j1.id).not.toBe(j2.id);

      const journeys = await repository.getJourneysByEmployee(testEmployeeId);
      expect(journeys.length).toBeGreaterThanOrEqual(2);
    });
  });
});
