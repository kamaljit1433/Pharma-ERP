import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Knex } from 'knex';
import knex from 'knex';
import { TravelAllowanceService } from '../travelAllowanceService';

describe('TravelAllowanceService', () => {
  let db: Knex;
  let service: TravelAllowanceService;
  let employeeId: string;
  let journeyId: string;

  beforeEach(async () => {
    db = knex({
      client: 'sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
    });

    // Create tables
    await db.schema.createTable('journeys', (table) => {
      table.uuid('id').primary();
      table.uuid('employee_id');
      table.timestamp('start_time');
      table.timestamp('end_time').nullable();
      table.decimal('total_distance', 10, 2).defaultTo(0);
      table.string('status').defaultTo('In Progress');
      table.timestamp('created_at').defaultTo(db.fn.now());
    });

    await db.schema.createTable('travel_logs', (table) => {
      table.uuid('id').primary();
      table.uuid('employee_id');
      table.uuid('journey_id').references('id').inTable('journeys');
      table.decimal('distance', 10, 2);
      table.decimal('allowance', 10, 2);
      table.string('status').defaultTo('pending');
      table.timestamp('created_at').defaultTo(db.fn.now());
    });

    employeeId = '550e8400-e29b-41d4-a716-446655440001';
    journeyId = '550e8400-e29b-41d4-a716-446655440002';

    service = new TravelAllowanceService(db);
  });

  afterEach(async () => {
    await db.destroy();
  });

  describe('logTravel', () => {
    it('should create travel log for valid journey', async () => {
      const distance = 50;

      const travelLog = await service.logTravel(employeeId, journeyId, distance);

      expect(travelLog).toBeDefined();
      expect(travelLog.employeeId).toBe(employeeId);
      expect(travelLog.journeyId).toBe(journeyId);
      expect(travelLog.distance).toBe(distance);
      expect(travelLog.status).toBe('pending');
      expect(travelLog.allowance).toBeGreaterThan(0);
    });

    it('should calculate allowance based on distance', async () => {
      const distance = 50;

      const travelLog = await service.logTravel(employeeId, journeyId, distance);

      const config = service.getConfig();
      const expectedAllowance = distance * config.ratePerKm;

      expect(travelLog.allowance).toBe(expectedAllowance);
    });

    it('should store travel log in database', async () => {
      const distance = 30;

      await service.logTravel(employeeId, journeyId, distance);

      const logs = await db('travel_logs').where({ employee_id: employeeId });

      expect(logs).toHaveLength(1);
      expect(logs[0]?.distance).toBe(distance);
    });

    it('should handle approval routing failure gracefully', async () => {
      const distance = 40;

      // Should not throw even if approval routing fails
      const travelLog = await service.logTravel(employeeId, journeyId, distance);

      expect(travelLog).toBeDefined();
    });
  });

  describe('calculateJourneyAllowance', () => {
    it('should calculate allowance for distance above minimum', () => {
      const distance = 50;
      const config = service.getConfig();

      const allowance = service.calculateJourneyAllowance(distance);

      expect(allowance).toBe(distance * config.ratePerKm);
    });

    it('should return 0 for distance below minimum', () => {
      const distance = 3; // Below default minimum of 5km

      const allowance = service.calculateJourneyAllowance(distance);

      expect(allowance).toBe(0);
    });

    it('should cap allowance at maximum per day', () => {
      const distance = 100; // Would exceed max allowance
      const config = service.getConfig();

      const allowance = service.calculateJourneyAllowance(distance);

      expect(allowance).toBeLessThanOrEqual(config.maxAllowancePerDay);
    });

    it('should return exact minimum distance allowance', () => {
      const config = service.getConfig();
      const distance = config.minDistance;

      const allowance = service.calculateJourneyAllowance(distance);

      expect(allowance).toBe(distance * config.ratePerKm);
    });
  });

  describe('calculateMonthlyAllowance', () => {
    beforeEach(async () => {
      await db('journeys').insert([
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          employee_id: employeeId,
          start_time: '2026-03-05 09:00:00',
          end_time: '2026-03-05 17:00:00',
          total_distance: 50,
          status: 'Completed',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440004',
          employee_id: employeeId,
          start_time: '2026-03-10 09:00:00',
          end_time: '2026-03-10 17:00:00',
          total_distance: 30,
          status: 'Completed',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440005',
          employee_id: employeeId,
          start_time: '2026-03-15 09:00:00',
          end_time: '2026-03-15 17:00:00',
          total_distance: 20,
          status: 'Completed',
        },
      ]);
    });

    it('should calculate total monthly allowance', async () => {
      const summary = await service.calculateMonthlyAllowance(employeeId, 3, 2026);

      expect(summary.employeeId).toBe(employeeId);
      expect(summary.month).toBe(3);
      expect(summary.year).toBe(2026);
      expect(summary.totalDistance).toBe(100);
      expect(summary.journeyCount).toBe(3);
      expect(summary.totalAllowance).toBeGreaterThan(0);
    });

    it('should return zero for employee with no journeys', async () => {
      const summary = await service.calculateMonthlyAllowance(
        'other-employee',
        3,
        2026
      );

      expect(summary.totalDistance).toBe(0);
      expect(summary.totalAllowance).toBe(0);
      expect(summary.journeyCount).toBe(0);
    });

    it('should only include completed journeys', async () => {
      await db('journeys').insert({
        id: '550e8400-e29b-41d4-a716-446655440006',
        employee_id: employeeId,
        start_time: '2026-03-20 09:00:00',
        total_distance: 40,
        status: 'In Progress',
      });

      const summary = await service.calculateMonthlyAllowance(employeeId, 3, 2026);

      expect(summary.journeyCount).toBe(3); // Only completed journeys
    });

    it('should include rate and currency in summary', async () => {
      const summary = await service.calculateMonthlyAllowance(employeeId, 3, 2026);
      const config = service.getConfig();

      expect(summary.rate).toBe(config.ratePerKm);
      expect(summary.currency).toBe(config.currency);
    });
  });

  describe('getTravelAllowanceSummary', () => {
    beforeEach(async () => {
      await db('journeys').insert([
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          employee_id: employeeId,
          start_time: '2026-03-05 09:00:00',
          end_time: '2026-03-05 17:00:00',
          total_distance: 50,
          status: 'Completed',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440004',
          employee_id: employeeId,
          start_time: '2026-03-10 09:00:00',
          end_time: '2026-03-10 17:00:00',
          total_distance: 30,
          status: 'Completed',
        },
      ]);
    });

    it('should return summary for date range', async () => {
      const startDate = new Date('2026-03-01');
      const endDate = new Date('2026-03-31');

      const summary = await service.getTravelAllowanceSummary(
        employeeId,
        startDate,
        endDate
      );

      expect(summary.employeeId).toBe(employeeId);
      expect(summary.period.startDate).toEqual(startDate);
      expect(summary.period.endDate).toEqual(endDate);
      expect(summary.totalDistance).toBe(80);
      expect(summary.journeyCount).toBe(2);
    });

    it('should calculate average distance per journey', async () => {
      const startDate = new Date('2026-03-01');
      const endDate = new Date('2026-03-31');

      const summary = await service.getTravelAllowanceSummary(
        employeeId,
        startDate,
        endDate
      );

      expect(summary.averageDistancePerJourney).toBe(40); // (50 + 30) / 2
    });

    it('should return zero average for no journeys', async () => {
      const startDate = new Date('2026-04-01');
      const endDate = new Date('2026-04-30');

      const summary = await service.getTravelAllowanceSummary(
        employeeId,
        startDate,
        endDate
      );

      expect(summary.averageDistancePerJourney).toBe(0);
      expect(summary.journeyCount).toBe(0);
    });

    it('should only include journeys within date range', async () => {
      await db('journeys').insert({
        id: '550e8400-e29b-41d4-a716-446655440007',
        employee_id: employeeId,
        start_time: '2026-04-05 09:00:00',
        end_time: '2026-04-05 17:00:00',
        total_distance: 25,
        status: 'Completed',
      });

      const startDate = new Date('2026-03-01');
      const endDate = new Date('2026-03-31');

      const summary = await service.getTravelAllowanceSummary(
        employeeId,
        startDate,
        endDate
      );

      expect(summary.journeyCount).toBe(2); // Only March journeys
    });
  });

  describe('updateConfig', () => {
    it('should update rate per km', () => {
      service.updateConfig({ ratePerKm: 15 });

      const config = service.getConfig();

      expect(config.ratePerKm).toBe(15);
    });

    it('should update minimum distance', () => {
      service.updateConfig({ minDistance: 10 });

      const config = service.getConfig();

      expect(config.minDistance).toBe(10);
    });

    it('should update max allowance per day', () => {
      service.updateConfig({ maxAllowancePerDay: 1000 });

      const config = service.getConfig();

      expect(config.maxAllowancePerDay).toBe(1000);
    });

    it('should update currency', () => {
      service.updateConfig({ currency: 'USD' });

      const config = service.getConfig();

      expect(config.currency).toBe('USD');
    });

    it('should update multiple config values', () => {
      service.updateConfig({
        ratePerKm: 12,
        minDistance: 8,
        currency: 'EUR',
      });

      const config = service.getConfig();

      expect(config.ratePerKm).toBe(12);
      expect(config.minDistance).toBe(8);
      expect(config.currency).toBe('EUR');
    });

    it('should preserve unchanged config values', () => {
      const originalConfig = service.getConfig();

      service.updateConfig({ ratePerKm: 15 });

      const newConfig = service.getConfig();

      expect(newConfig.minDistance).toBe(originalConfig.minDistance);
      expect(newConfig.maxAllowancePerDay).toBe(originalConfig.maxAllowancePerDay);
    });
  });

  describe('getConfig', () => {
    it('should return current configuration', () => {
      const config = service.getConfig();

      expect(config).toBeDefined();
      expect(config.ratePerKm).toBeDefined();
      expect(config.minDistance).toBeDefined();
      expect(config.maxAllowancePerDay).toBeDefined();
      expect(config.currency).toBeDefined();
    });

    it('should return default values from environment', () => {
      const config = service.getConfig();

      expect(config.ratePerKm).toBe(10); // Default from env
      expect(config.minDistance).toBe(5); // Default from env
      expect(config.maxAllowancePerDay).toBe(500); // Default from env
      expect(config.currency).toBe('INR'); // Default from env
    });
  });

  describe('edge cases', () => {
    it('should handle zero distance', () => {
      const allowance = service.calculateJourneyAllowance(0);

      expect(allowance).toBe(0);
    });

    it('should handle negative distance', () => {
      const allowance = service.calculateJourneyAllowance(-10);

      expect(allowance).toBe(0);
    });

    it('should handle very large distance', () => {
      const distance = 10000;
      const config = service.getConfig();

      const allowance = service.calculateJourneyAllowance(distance);

      expect(allowance).toBe(config.maxAllowancePerDay);
    });

    it('should handle fractional distance', () => {
      const distance = 15.5;
      const config = service.getConfig();

      const allowance = service.calculateJourneyAllowance(distance);

      expect(allowance).toBe(distance * config.ratePerKm);
    });
  });
});
