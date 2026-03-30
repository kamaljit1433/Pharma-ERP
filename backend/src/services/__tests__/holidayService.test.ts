import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Knex } from 'knex';
import knex from 'knex';
import { HolidayService } from '../holidayService';

describe('HolidayService', () => {
  let db: Knex;
  let holidayService: HolidayService;

  beforeEach(async () => {
    db = knex({
      client: 'sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
    });

    await db.schema.createTable('company_holidays', (table) => {
      table.uuid('id').primary();
      table.string('name');
      table.date('holiday_date');
      table.enum('type', ['national', 'regional', 'company']).defaultTo('national');
      table.boolean('is_optional').defaultTo(false);
      table.timestamp('created_at').defaultTo(db.fn.now());
    });

    holidayService = new HolidayService(db);
  });

  afterEach(async () => {
    await db.destroy();
  });

  describe('createHoliday', () => {
    it('should create a new holiday', async () => {
      const holiday = await holidayService.createHoliday({
        name: 'Independence Day',
        holiday_date: '2026-08-15',
        type: 'national',
      });

      expect(holiday).toBeDefined();
      expect(holiday.name).toBe('Independence Day');
      expect(holiday.holiday_date).toBe('2026-08-15');
      expect(holiday.type).toBe('national');
    });

    it('should reject duplicate holiday on same date', async () => {
      await holidayService.createHoliday({
        name: 'Independence Day',
        holiday_date: '2026-08-15',
        type: 'national',
      });

      await expect(
        holidayService.createHoliday({
          name: 'Another Holiday',
          holiday_date: '2026-08-15',
          type: 'national',
        })
      ).rejects.toThrow('already exists');
    });
  });

  describe('getHoliday', () => {
    it('should retrieve holiday by id', async () => {
      const created = await holidayService.createHoliday({
        name: 'Independence Day',
        holiday_date: '2026-08-15',
        type: 'national',
      });

      const retrieved = await holidayService.getHoliday(created.id);

      expect(retrieved.id).toBe(created.id);
      expect(retrieved.name).toBe('Independence Day');
    });

    it('should throw error for non-existent holiday', async () => {
      await expect(
        holidayService.getHoliday('non-existent-id')
      ).rejects.toThrow('not found');
    });
  });

  describe('getHolidaysByYear', () => {
    it('should return holidays for a specific year', async () => {
      await holidayService.createHoliday({
        name: 'Independence Day',
        holiday_date: '2026-08-15',
        type: 'national',
      });

      await holidayService.createHoliday({
        name: 'Republic Day',
        holiday_date: '2026-01-26',
        type: 'national',
      });

      const holidays = await holidayService.getHolidaysByYear(2026);

      expect(holidays).toHaveLength(2);
    });
  });

  describe('getHolidaysByType', () => {
    it('should return holidays by type', async () => {
      await holidayService.createHoliday({
        name: 'Independence Day',
        holiday_date: '2026-08-15',
        type: 'national',
      });

      await holidayService.createHoliday({
        name: 'Company Founding Day',
        holiday_date: '2026-06-01',
        type: 'company',
      });

      const nationalHolidays = await holidayService.getHolidaysByType('national');

      expect(nationalHolidays).toHaveLength(1);
      expect(nationalHolidays[0].type).toBe('national');
    });
  });

  describe('getHolidaysByDateRange', () => {
    it('should return holidays within date range', async () => {
      await holidayService.createHoliday({
        name: 'Independence Day',
        holiday_date: '2026-08-15',
        type: 'national',
      });

      await holidayService.createHoliday({
        name: 'Republic Day',
        holiday_date: '2026-01-26',
        type: 'national',
      });

      const holidays = await holidayService.getHolidaysByDateRange(
        '2026-01-01',
        '2026-06-30'
      );

      expect(holidays).toHaveLength(1);
      expect(holidays[0].name).toBe('Republic Day');
    });
  });

  describe('isHoliday', () => {
    it('should return true for holiday date', async () => {
      await holidayService.createHoliday({
        name: 'Independence Day',
        holiday_date: '2026-08-15',
        type: 'national',
      });

      const isHoliday = await holidayService.isHoliday('2026-08-15');

      expect(isHoliday).toBe(true);
    });

    it('should return false for non-holiday date', async () => {
      const isHoliday = await holidayService.isHoliday('2026-08-16');

      expect(isHoliday).toBe(false);
    });
  });

  describe('getHolidayCount', () => {
    it('should count holidays in date range', async () => {
      await holidayService.createHoliday({
        name: 'Independence Day',
        holiday_date: '2026-08-15',
        type: 'national',
      });

      await holidayService.createHoliday({
        name: 'Republic Day',
        holiday_date: '2026-01-26',
        type: 'national',
      });

      const count = await holidayService.getHolidayCount(
        '2026-01-01',
        '2026-12-31'
      );

      expect(count).toBe(2);
    });
  });

  describe('updateHoliday', () => {
    it('should update holiday', async () => {
      const created = await holidayService.createHoliday({
        name: 'Independence Day',
        holiday_date: '2026-08-15',
        type: 'national',
      });

      const updated = await holidayService.updateHoliday(created.id, {
        is_optional: true,
      });

      expect(updated.is_optional).toBe(true);
    });
  });

  describe('deleteHoliday', () => {
    it('should delete holiday', async () => {
      const created = await holidayService.createHoliday({
        name: 'Independence Day',
        holiday_date: '2026-08-15',
        type: 'national',
      });

      await holidayService.deleteHoliday(created.id);

      await expect(
        holidayService.getHoliday(created.id)
      ).rejects.toThrow('not found');
    });
  });
});
