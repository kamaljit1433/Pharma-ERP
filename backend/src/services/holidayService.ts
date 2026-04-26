import { Knex } from 'knex';
import { HolidayRepository } from '../repositories/holidayRepository';
import { CompanyHoliday, CreateHolidayDTO, UpdateHolidayDTO } from '../types/leave';

export class HolidayService {
  private holidayRepository: HolidayRepository;

  constructor(private knex: Knex) {
    this.holidayRepository = new HolidayRepository(knex);
  }

  async createHoliday(data: CreateHolidayDTO): Promise<CompanyHoliday> {
    // Check if holiday already exists on that date
    const existing = await this.knex('company_holidays')
      .where('holiday_date', data.holiday_date)
      .first();

    if (existing) {
      throw new Error('Holiday already exists on this date');
    }

    return this.holidayRepository.createHoliday(data);
  }

  async getHoliday(id: string): Promise<CompanyHoliday> {
    const holiday = await this.holidayRepository.getHolidayById(id);
    if (!holiday) {
      throw new Error('Holiday not found');
    }
    return holiday;
  }

  async getHolidaysByYear(year: number): Promise<CompanyHoliday[]> {
    return this.holidayRepository.getHolidaysByYear(year);
  }

  async getHolidaysByType(
    type: 'national' | 'regional' | 'company'
  ): Promise<CompanyHoliday[]> {
    return this.holidayRepository.getHolidaysByType(type);
  }

  async getHolidaysByDateRange(
    fromDate: string,
    toDate: string
  ): Promise<CompanyHoliday[]> {
    return this.holidayRepository.getHolidaysByDateRange(fromDate, toDate);
  }

  async updateHoliday(
    id: string,
    data: UpdateHolidayDTO
  ): Promise<CompanyHoliday> {
    const holiday = await this.holidayRepository.getHolidayById(id);
    if (!holiday) {
      throw new Error('Holiday not found');
    }

    return this.holidayRepository.updateHoliday(id, data);
  }

  async deleteHoliday(id: string): Promise<void> {
    const holiday = await this.holidayRepository.getHolidayById(id);
    if (!holiday) {
      throw new Error('Holiday not found');
    }

    await this.holidayRepository.deleteHoliday(id);
  }

  async isHoliday(date: string): Promise<boolean> {
    return this.holidayRepository.isHoliday(date);
  }

  async getHolidayCount(fromDate: string, toDate: string): Promise<number> {
    const holidays = await this.holidayRepository.getHolidaysInRange(fromDate, toDate);
    return holidays.length;
  }
}
