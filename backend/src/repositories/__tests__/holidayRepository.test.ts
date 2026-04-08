/**
 * Holiday Repository - Unit Tests
 * Tests for holiday calendar management
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { HolidayRepository } from '../holidayRepository';
import db from '../../config/knex';
import { CreateHolidayDTO, UpdateHolidayDTO } from '../../types/leave';

describe('HolidayRepository', () => {
  let repository: HolidayRepository;
  let testHolidayId: string;

  beforeAll(async () => {
    repository = new HolidayRepository(db);

    // Clean up test data
    await db('company_holidays').del();
  });

  afterAll(async () => {
    await db('company_holidays').del();
  });

  describe('createHoliday', () => {
    it('should create holiday', async () => {
      const data: CreateHolidayDTO = {
        name: 'New Year',
        date: '2024-01-01',
        holiday_type: 'national',
        is_optional: false,
      };

      const holiday = await repository.createHoliday(data);

      expect(holiday).toBeDefined();
      expect(holiday.id).toBeDefined();
      expect(holiday.name).toBe('New Year');
      expect(holiday.date).toBe('2024-01-01');
      expect(holiday.holiday_type).toBe('national');

      testHolidayId = holiday.id;
    });

    it('should create optional holiday', async () => {
      const data: CreateHolidayDTO = {
        name: 'Diwali',
        date: '2024-11-01',
        holiday_type: 'regional',
        is_optional: true,
      };

      const holiday = await repository.createHoliday(data);

      expect(holiday.is_optional).toBe(true);
    });
  });

  describe('getHoliday', () => {
    it('should retrieve holiday by ID', async () => {
      const holiday = await repository.getHoliday(testHolidayId);

      expect(holiday).toBeDefined();
      expect(holiday?.id).toBe(testHolidayId);
      expect(holiday?.name).toBe('New Year');
    });

    it('should return null for non-existent holiday', async () => {
      const holiday = await repository.getHoliday('00000000-0000-4000-a000-ffffffffffff');

      expect(holiday).toBeNull();
    });
  });

  describe('getHolidayByDate', () => {
    it('should retrieve holiday by date', async () => {
      const holiday = await repository.getHolidayByDate('2024-01-01');

      expect(holiday).toBeDefined();
      expect(holiday?.date).toBe('2024-01-01');
    });

    it('should return null for non-existent date', async () => {
      const holiday = await repository.getHolidayByDate('2025-12-31');

      expect(holiday).toBeNull();
    });
  });

  describe('updateHoliday', () => {
    it('should update holiday', async () => {
      const updateData: UpdateHolidayDTO = {
        name: 'New Year Day',
        is_optional: true,
      };

      const updated = await repository.updateHoliday(testHolidayId, updateData);

      expect(updated.name).toBe('New Year Day');
      expect(updated.is_optional).toBe(true);
    });

    it('should throw error for non-existent holiday', async () => {
      await expect(
        repository.updateHoliday('00000000-0000-4000-a000-ffffffffffff', { name: 'Test' })
      ).rejects.toThrow();
    });
  });

  describe('getAllHolidays', () => {
    it('should retrieve all holidays', async () => {
      const holidays = await repository.getAllHolidays();

      expect(Array.isArray(holidays)).toBe(true);
      expect(holidays.length).toBeGreaterThan(0);
    });
  });

  describe('getHolidaysByYear', () => {
    it('should retrieve holidays for year', async () => {
      const holidays = await repository.getHolidaysByYear(2024);

      expect(Array.isArray(holidays)).toBe(true);
    });
  });

  describe('getHolidaysByType', () => {
    it('should retrieve holidays by type', async () => {
      const holidays = await repository.getHolidaysByType('national');

      expect(Array.isArray(holidays)).toBe(true);
      expect(holidays.every((h) => h.holiday_type === 'national')).toBe(true);
    });
  });

  describe('getMandatoryHolidays', () => {
    it('should retrieve mandatory holidays', async () => {
      const holidays = await repository.getMandatoryHolidays();

      expect(Array.isArray(holidays)).toBe(true);
      expect(holidays.every((h) => !h.is_optional)).toBe(true);
    });
  });

  describe('getOptionalHolidays', () => {
    it('should retrieve optional holidays', async () => {
      const holidays = await repository.getOptionalHolidays();

      expect(Array.isArray(holidays)).toBe(true);
      expect(holidays.every((h) => h.is_optional)).toBe(true);
    });
  });

  describe('getHolidayCount', () => {
    it('should count all holidays', async () => {
      const count = await repository.getHolidayCount();

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThan(0);
    });

    it('should count by year', async () => {
      const count = await repository.getHolidayCount(2024);

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('isHoliday', () => {
    it('should check if date is holiday', async () => {
      const isHoliday = await repository.isHoliday('2024-01-01');

      expect(typeof isHoliday).toBe('boolean');
    });
  });

  describe('getHolidaysInRange', () => {
    it('should retrieve holidays in date range', async () => {
      const holidays = await repository.getHolidaysInRange('2024-01-01', '2024-12-31');

      expect(Array.isArray(holidays)).toBe(true);
    });
  });

  describe('deleteHoliday', () => {
    it('should delete holiday', async () => {
      const data: CreateHolidayDTO = {
        name: 'Delete Test',
        date: '2024-06-15',
        holiday_type: 'national',
        is_optional: false,
      };

      const holiday = await repository.createHoliday(data);
      await repository.deleteHoliday(holiday.id);

      const deleted = await repository.getHoliday(holiday.id);
      expect(deleted).toBeNull();
    });
  });
});
