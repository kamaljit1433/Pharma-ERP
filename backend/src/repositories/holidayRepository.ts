import { Knex } from 'knex';
import { CompanyHoliday, CreateHolidayDTO, UpdateHolidayDTO } from '../types/leave';
import { v4 as uuidv4 } from 'uuid';

export class HolidayRepository {
  constructor(private knex: Knex) {}

  private formatDate(value: any): string {
    if (!value) return value;
    if (typeof value === 'string') {
      // Already a string like '2024-01-01' — return the date portion directly
      return value.substring(0, 10);
    }
    // For Date objects, use ISO and take the date part
    return value.toISOString().substring(0, 10);
  }

  private mapRow(row: any): CompanyHoliday {
    return {
      id: row.id,
      name: row.name,
      date: this.formatDate(row.holiday_date),
      holiday_type: row.type,
      is_optional: row.is_optional,
      created_at: row.created_at,
    };
  }

  async createHoliday(data: CreateHolidayDTO): Promise<CompanyHoliday> {
    const id = uuidv4();
    const [holiday] = await this.knex('company_holidays')
      .insert({
        id,
        name: data.name,
        holiday_date: data.date,
        type: data.holiday_type,
        is_optional: data.is_optional ?? false,
      })
      .returning('*');

    return this.mapRow(holiday);
  }

  async getHoliday(id: string): Promise<CompanyHoliday | null> {
    const row = await this.knex('company_holidays').where('id', id).first();
    return row ? this.mapRow(row) : null;
  }

  async getHolidayById(id: string): Promise<CompanyHoliday | null> {
    return this.getHoliday(id);
  }

  async getHolidayByDate(date: string): Promise<CompanyHoliday | null> {
    const row = await this.knex('company_holidays').where('holiday_date', date).first();
    return row ? this.mapRow(row) : null;
  }

  async getAllHolidays(): Promise<CompanyHoliday[]> {
    const rows = await this.knex('company_holidays').orderBy('holiday_date');
    return rows.map((r: any) => this.mapRow(r));
  }

  async getHolidaysByYear(year: number): Promise<CompanyHoliday[]> {
    const rows = await this.knex('company_holidays')
      .whereRaw(`EXTRACT(YEAR FROM holiday_date) = ?`, [year])
      .orderBy('holiday_date');
    return rows.map((r: any) => this.mapRow(r));
  }

  async getHolidaysByType(type: 'national' | 'regional' | 'company'): Promise<CompanyHoliday[]> {
    const rows = await this.knex('company_holidays').where({ type }).orderBy('holiday_date');
    return rows.map((r: any) => this.mapRow(r));
  }

  async getHolidaysByDateRange(fromDate: string, toDate: string): Promise<CompanyHoliday[]> {
    const rows = await this.knex('company_holidays')
      .whereBetween('holiday_date', [fromDate, toDate])
      .orderBy('holiday_date');
    return rows.map((r: any) => this.mapRow(r));
  }

  async getMandatoryHolidays(): Promise<CompanyHoliday[]> {
    const rows = await this.knex('company_holidays')
      .where('is_optional', false)
      .orderBy('holiday_date');
    return rows.map((r: any) => this.mapRow(r));
  }

  async getOptionalHolidays(): Promise<CompanyHoliday[]> {
    const rows = await this.knex('company_holidays')
      .where('is_optional', true)
      .orderBy('holiday_date');
    return rows.map((r: any) => this.mapRow(r));
  }

  async getHolidayCount(year?: number): Promise<number> {
    let query = this.knex('company_holidays');
    if (year !== undefined) {
      query = query.whereRaw(`EXTRACT(YEAR FROM holiday_date) = ?`, [year]);
    }
    const result = await query.count('* as count').first();
    return Number(result?.['count'] || 0);
  }

  async updateHoliday(id: string, data: UpdateHolidayDTO): Promise<CompanyHoliday> {
    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData['name'] = data.name;
    if (data.date !== undefined) updateData['holiday_date'] = data.date;
    if (data.holiday_type !== undefined) updateData['type'] = data.holiday_type;
    if (data.is_optional !== undefined) updateData['is_optional'] = data.is_optional;

    const [holiday] = await this.knex('company_holidays')
      .where('id', id)
      .update(updateData)
      .returning('*');

    if (!holiday) throw new Error('Holiday not found');

    return this.mapRow(holiday);
  }

  async deleteHoliday(id: string): Promise<void> {
    await this.knex('company_holidays').where('id', id).delete();
  }

  async isHoliday(date: string): Promise<boolean> {
    const row = await this.knex('company_holidays').where('holiday_date', date).first();
    return !!row;
  }

  async getHolidaysInRange(fromDate: string, toDate: string): Promise<CompanyHoliday[]> {
    const rows = await this.knex('company_holidays')
      .whereBetween('holiday_date', [fromDate, toDate])
      .orderBy('holiday_date');
    return rows.map((r: any) => this.mapRow(r));
  }
}
