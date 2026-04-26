import { getKnexInstance } from '../config/knex';

export interface Shift {
  id: string;
  name: string;
  shiftType: string;              // 'fixed' | 'rotating' | 'flexible'
  startTime: string | null;       // HH:MM:SS
  endTime: string | null;         // HH:MM:SS
  durationMinutes: number | null;
  breakDurationMinutes: number;   // default 60, persisted in DB
  daysOfWeek: string | null;
  rotationPattern: string | null;
  minHours: number | null;
  maxHours: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeShiftAssignment {
  id: string;
  employeeId: string;
  shiftId: string | null;
  effectiveFrom: string;      // YYYY-MM-DD
  effectiveTo: string | null; // YYYY-MM-DD
  createdAt: Date;
}

interface CreateShiftInput {
  name: string;
  startTime?: string;
  endTime?: string;
  breakDuration?: number;   // accepted from API but not persisted (no DB column)
  type: string;             // 'Fixed' | 'Rotating' | 'Flexible' (case-insensitive)
  rotationPattern?: string;
  minHours?: number;
  maxHours?: number;
  daysOfWeek?: string;
}

class ShiftService {
  async createShift(input: CreateShiftInput): Promise<Shift> {
    this._validateShiftInput(input);
    const db = getKnexInstance();
    const shiftType = input.type.toLowerCase();

    const [shift] = await db('shifts')
      .insert({
        name: input.name,
        type: shiftType,
        shift_type: shiftType,
        start_time: input.startTime ?? null,
        end_time: input.endTime ?? null,
        break_duration_minutes: input.breakDuration ?? 60,
        rotation_pattern: input.rotationPattern ?? null,
        min_hours: input.minHours ?? null,
        max_hours: input.maxHours ?? null,
        days_of_week: input.daysOfWeek ?? null,
        is_active: true,
      })
      .returning('*');

    return mapShift(shift);
  }

  async getShift(shiftId: string): Promise<Shift | null> {
    const db = getKnexInstance();
    const shift = await db('shifts').where({ id: shiftId }).first();
    return shift ? mapShift(shift) : null;
  }

  async getAllShifts(): Promise<Shift[]> {
    const db = getKnexInstance();
    const shifts = await db('shifts').where({ is_active: true }).orderBy('name');
    return shifts.map(mapShift);
  }

  async updateShift(
    shiftId: string,
    updates: Partial<Omit<CreateShiftInput, 'breakDuration'>>
  ): Promise<Shift> {
    const db = getKnexInstance();
    const shift = await db('shifts').where({ id: shiftId }).first();
    if (!shift) throw new Error(`Shift with ID ${shiftId} not found`);

    const updateData: Record<string, any> = { updated_at: db.fn.now() };
    if (updates.name !== undefined) updateData['name'] = updates.name;
    if (updates.startTime !== undefined) updateData['start_time'] = updates.startTime;
    if (updates.endTime !== undefined) updateData['end_time'] = updates.endTime;
    if (updates.type !== undefined) {
      updateData['shift_type'] = updates.type.toLowerCase();
      updateData['type'] = updates.type.toLowerCase();
    }
    if (updates.rotationPattern !== undefined) updateData['rotation_pattern'] = updates.rotationPattern;
    if (updates.minHours !== undefined) updateData['min_hours'] = updates.minHours;
    if (updates.maxHours !== undefined) updateData['max_hours'] = updates.maxHours;
    if (updates.daysOfWeek !== undefined) updateData['days_of_week'] = updates.daysOfWeek;

    await db('shifts').where({ id: shiftId }).update(updateData);
    const updated = await db('shifts').where({ id: shiftId }).first();
    return mapShift(updated);
  }

  async deleteShift(shiftId: string): Promise<void> {
    const db = getKnexInstance();
    const shift = await db('shifts').where({ id: shiftId }).first();
    if (!shift) throw new Error(`Shift with ID ${shiftId} not found`);

    const activeAssignments = await db('employee_shifts')
      .where({ shift_id: shiftId })
      .whereNull('effective_to');

    if (activeAssignments.length > 0) {
      throw new Error(`Cannot delete shift — assigned to ${activeAssignments.length} employee(s)`);
    }

    await db('shifts').where({ id: shiftId }).del();
  }

  async assignShiftToEmployee(
    employeeId: string,
    shiftId: string,
    effectiveFrom: string
  ): Promise<EmployeeShiftAssignment> {
    const db = getKnexInstance();
    const shift = await db('shifts').where({ id: shiftId }).first();
    if (!shift) throw new Error(`Shift with ID ${shiftId} not found`);

    // Close any open assignments for this employee
    await db('employee_shifts')
      .where({ employee_id: employeeId })
      .whereNull('effective_to')
      .update({ effective_to: effectiveFrom });

    const [assignment] = await db('employee_shifts')
      .insert({ employee_id: employeeId, shift_id: shiftId, effective_from: effectiveFrom })
      .returning('*');

    return mapAssignment(assignment);
  }

  async getCurrentShiftForEmployee(employeeId: string): Promise<Shift | null> {
    const db = getKnexInstance();
    const today = new Date().toISOString().split('T')[0]!;

    const assignment = await db('employee_shifts')
      .where({ employee_id: employeeId })
      .where('effective_from', '<=', today)
      .where(function () {
        this.whereNull('effective_to').orWhere('effective_to', '>=', today);
      })
      .orderBy('effective_from', 'desc')
      .first();

    if (!assignment?.shift_id) return null;
    const shift = await db('shifts').where({ id: assignment.shift_id }).first();
    return shift ? mapShift(shift) : null;
  }

  async getShiftHistoryForEmployee(employeeId: string): Promise<EmployeeShiftAssignment[]> {
    const db = getKnexInstance();
    const rows = await db('employee_shifts')
      .where({ employee_id: employeeId })
      .orderBy('effective_from', 'desc');
    return rows.map(mapAssignment);
  }

  private _validateShiftInput(input: CreateShiftInput): void {
    if (!input.name?.trim()) throw new Error('Shift name is required');
    if (input.startTime && !isValidTimeFormat(input.startTime))
      throw new Error('Invalid start time format. Use HH:mm');
    if (input.endTime && !isValidTimeFormat(input.endTime))
      throw new Error('Invalid end time format. Use HH:mm');
    const validTypes = ['fixed', 'rotating', 'flexible', 'Fixed', 'Rotating', 'Flexible'];
    if (!validTypes.includes(input.type))
      throw new Error('Invalid shift type. Must be Fixed, Rotating, or Flexible');
  }
}

function isValidTimeFormat(time: string): boolean {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
}

function mapShift(row: any): Shift {
  return {
    id: row.id,
    name: row.name,
    shiftType: row.shift_type ?? row.type,
    startTime: row.start_time ?? null,
    endTime: row.end_time ?? null,
    durationMinutes: row.duration_minutes ?? null,
    breakDurationMinutes: row.break_duration_minutes ?? 60,
    daysOfWeek: row.days_of_week ?? null,
    rotationPattern: row.rotation_pattern ?? null,
    minHours: row.min_hours ?? null,
    maxHours: row.max_hours ?? null,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapAssignment(row: any): EmployeeShiftAssignment {
  return {
    id: row.id,
    employeeId: row.employee_id,
    shiftId: row.shift_id ?? null,
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to ?? null,
    createdAt: row.created_at,
  };
}

export const shiftService = new ShiftService();
