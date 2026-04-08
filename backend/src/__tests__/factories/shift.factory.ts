import { Knex } from 'knex';
import { BaseFactory } from './base.factory';

export interface Shift {
  id: string;
  name: string;
  code: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  shift_type: 'fixed' | 'rotating' | 'flexible';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

/**
 * Factory for generating Shift test data
 */
export class ShiftFactory extends BaseFactory<Shift> {
  private static counter = 0;
  private static shifts = [
    { name: 'Morning Shift', code: 'MS', start_time: '09:00', end_time: '17:00', duration_hours: 8 },
    { name: 'Evening Shift', code: 'ES', start_time: '14:00', end_time: '22:00', duration_hours: 8 },
    { name: 'Night Shift', code: 'NS', start_time: '22:00', end_time: '06:00', duration_hours: 8 },
    { name: 'Flexible Shift', code: 'FS', start_time: '10:00', end_time: '18:00', duration_hours: 8 },
  ];

  constructor(knex: Knex) {
    super(knex, 'shifts');
  }

  /**
   * Create a single shift
   */
  async create(overrides?: Partial<Shift>): Promise<Shift> {
    const shift = ShiftFactory.shifts[ShiftFactory.counter % ShiftFactory.shifts.length]!;
    ShiftFactory.counter++;

    const data: any = {
      id: this.generateId(),
      name: shift.name,
      code: shift.code,
      start_time: shift.start_time,
      end_time: shift.end_time,
      duration_hours: shift.duration_hours,
      shift_type: 'fixed',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };

    return this.insert(data);
  }

  /**
   * Create all standard shifts
   */
  async createStandardShifts(): Promise<Shift[]> {
    const shifts: Shift[] = [];
    for (const shift of ShiftFactory.shifts) {
      const created = await this.create({
        name: shift.name,
        code: shift.code,
        start_time: shift.start_time,
        end_time: shift.end_time,
        duration_hours: shift.duration_hours,
      });
      shifts.push(created);
    }
    return shifts;
  }
}
