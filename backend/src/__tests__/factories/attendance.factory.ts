import { Knex } from 'knex';
import { BaseFactory } from './base.factory';

export interface Attendance {
  id: string;
  employee_id: string;
  shift_id: string | null;
  check_in_time: Date;
  check_out_time: Date | null;
  check_in_location: string | null;
  check_out_location: string | null;
  face_detected: boolean;
  working_hours: number | null;
  status: 'present' | 'absent' | 'half_day' | 'on_leave';
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Factory for generating Attendance test data
 */
export class AttendanceFactory extends BaseFactory<Attendance> {
  constructor(knex: Knex) {
    super(knex, 'attendance');
  }

  /**
   * Create a single attendance record
   */
  async create(overrides?: Partial<Attendance>): Promise<Attendance> {
    const checkInTime = new Date();
    checkInTime.setHours(9, 0, 0, 0);

    const checkOutTime = new Date(checkInTime);
    checkOutTime.setHours(17, 0, 0, 0);

    const workingHours = 8;

    const data: any = {
      id: this.generateId(),
      employee_id: this.generateId(), // Will be overridden
      shift_id: null,
      check_in_time: checkInTime,
      check_out_time: checkOutTime,
      check_in_location: 'Office',
      check_out_location: 'Office',
      face_detected: true,
      working_hours: workingHours,
      status: 'present',
      notes: null,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };

    return this.insert(data);
  }

  /**
   * Create attendance for a specific employee
   */
  async createForEmployee(employeeId: string, overrides?: Partial<Attendance>): Promise<Attendance> {
    return this.create({
      employee_id: employeeId,
      ...overrides,
    });
  }

  /**
   * Create attendance with custom status
   */
  async createWithStatus(
    employeeId: string,
    status: 'present' | 'absent' | 'half_day' | 'on_leave',
    overrides?: Partial<Attendance>
  ): Promise<Attendance> {
    const data: Partial<Attendance> = {
      employee_id: employeeId,
      status,
      ...overrides,
    };

    if (status === 'absent') {
      data.check_in_time = undefined;
      data.check_out_time = undefined;
      data.working_hours = 0;
      data.face_detected = false;
    } else if (status === 'half_day') {
      data.working_hours = 4;
    }

    return this.create(data);
  }

  /**
   * Create monthly attendance records for an employee
   */
  async createMonthlyAttendance(
    employeeId: string,
    year: number,
    month: number,
    presentDays: number = 20
  ): Promise<Attendance[]> {
    const attendanceRecords: Attendance[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();

      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue;
      }

      const isPresent = Math.random() * daysInMonth < presentDays;
      const status = isPresent ? 'present' : 'absent';

      const checkInTime = new Date(date);
      checkInTime.setHours(9, 0, 0, 0);

      const checkOutTime = new Date(date);
      checkOutTime.setHours(17, 0, 0, 0);

      const record = await this.createWithStatus(employeeId, status as any, {
        check_in_time: checkInTime,
        check_out_time: isPresent ? checkOutTime : null,
        working_hours: isPresent ? 8 : 0,
      });

      attendanceRecords.push(record);
    }

    return attendanceRecords;
  }
}
