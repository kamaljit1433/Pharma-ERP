import { Knex } from 'knex';
import { CompanyHoliday, CreateHolidayDTO } from '../types/leave';

export class HolidayRepository {
  constructor(private knex: Knex) {}

  async createHoliday(data: CreateHolidayDTO): Promise<CompanyHoliday> {
    const [holiday] = await this.knex('company_holidays')
      .insert({
        name: data.name,
        holiday_date: data.holiday_date,
        type: data.type,
        is_optional: data.is_optional ?? false,
      })
      .returning('*');

    return holiday;
  }

  async getHolidayById(id: string): Promise<CompanyHoliday | null> {
    return this.knex('company_holidays').where({ id }).first();
  }

  async getHolidaysByYear(year: number): Promise<CompanyHoliday[]> {
    return this.knex('company_holidays')
      .whereRaw(`EXTRACT(YEAR FROM holiday_date) = ?`, [year])
      .orderBy('holiday_date');
  }

  async getHolidaysByType(type: 'national' | 'regional' | 'company'): Promise<CompanyHoliday[]> {
    return this.knex('company_holidays')
      .where({ type })
      .orderBy('holiday_date');
  }

  async getHolidaysByDateRange(
    fromDate: string,
    toDate: string
  ): Promise<CompanyHoliday[]> {
    return this.knex('company_holidays')
      .whereBetween('holiday_date', [fromDate, toDate])
      .orderBy('holiday_date');
  }

  async updateHoliday(
    id: string,
    data: Partial<CompanyHoliday>
  ): Promise<CompanyHoliday> {
    const [holiday] = await this.knex('company_holidays')
      .where({ id })
      .update(data)
      .returning('*');

    return holiday;
  }

  async deleteHoliday(id: string): Promise<void> {
    await this.knex('company_holidays').where({ id }).delete();
  }

  async isHoliday(date: string): Promise<boolean> {
    const holiday = await this.knex('company_holidays')
      .where('holiday_date', date)
      .first();

    return !!holiday;
  }

  async getHolidaysInRange(
    fromDate: string,
    toDate: string
  ): Promise<number> {
    const holidays = await this.knex('company_holidays')
      .whereBetween('holiday_date', [fromDate, toDate])
      .count('* as count')
      .first();

    return Number(holidays?.['count'] || 0);
  }
}
