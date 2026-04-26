import { getKnexInstance } from '../config/knex';

export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  workingHours: number | null;
  overtimeMinutes: number | null;
  status: 'present' | 'absent' | 'half_day' | 'on_leave' | 'holiday';
  checkInLatitude: number | null;
  checkInLongitude: number | null;
  checkOutLatitude: number | null;
  checkOutLongitude: number | null;
  faceDetected: boolean;
  shiftId: string | null;
  notes: string | null;
  regularizationRequested: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegularizationRequest {
  id: string;
  attendanceId: string;
  employeeId: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy: string | null;
  approvalNotes: string | null;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: Date;
}

export interface CheckInOptions {
  /** Skip face-detection requirement (e.g. web/manual mode) */
  skipFaceValidation?: boolean;
  /** Skip GPS requirement (e.g. web mode has no GPS) */
  skipLocationValidation?: boolean;
  /** Skip the check-in window cutoff — for managers / HR overrides */
  skipCutoffCheck?: boolean;
}

export interface CheckOutOptions {
  /** Skip GPS requirement for web mode */
  skipLocationValidation?: boolean;
}

const STANDARD_SHIFT_HOURS = 8;
const DEFAULT_BREAK_MINUTES = 60;
// How many minutes after shift start the check-in window stays open (default 2 h)
const CHECK_IN_CUTOFF_MINUTES = 120;

class AttendanceService {

  // ── Check-in ─────────────────────────────────────────────────────────────

  async checkIn(
    employeeId: string,
    location: GeoLocation | null,
    faceDetected: boolean,
    shiftId?: string,
    options: CheckInOptions = {}
  ): Promise<Attendance> {
    if (!faceDetected && !options.skipFaceValidation) {
      throw new Error('Face detection required for check-in');
    }
    if (!options.skipLocationValidation) {
      if (!location || !isValidGeoLocation(location)) {
        throw new Error('Valid GPS location required for check-in');
      }
    }

    const db = getKnexInstance();

    const employee = await db('employees').where({ id: employeeId }).select('id').first();
    if (!employee) throw new Error(`Employee not found: ${employeeId}`);

    const today = new Date().toISOString().split('T')[0]!;

    // Block duplicate check-ins
    const todayRecord = await db('attendance')
      .where({ employee_id: employeeId, attendance_date: today })
      .select('id', 'check_in_time')
      .first();
    if (todayRecord?.check_in_time) {
      throw new Error('You have already checked in today. Use the regularization form if a correction is needed.');
    }

    // Enforce check-in window (shift start + CHECK_IN_CUTOFF_MINUTES)
    if (!options.skipCutoffCheck) {
      await assertCheckInWindow(db, employeeId, today);
    }

    const now = new Date().toTimeString().split(' ')[0]!;

    // Upsert: inserts on first call; only merges if there is no existing check_in_time
    // (the duplicate check above already guards against double check-in, but the upsert
    // keeps us race-condition safe on concurrent requests)
    const [record] = await db('attendance')
      .insert({
        employee_id: employeeId,
        attendance_date: today,
        check_in_time: now,
        check_in_latitude: location?.latitude ?? null,
        check_in_longitude: location?.longitude ?? null,
        face_detected: faceDetected,
        status: 'present',
        ...(shiftId ? { shift_id: shiftId } : {}),
      })
      .onConflict(['employee_id', 'attendance_date'])
      .merge({
        check_in_time: now,
        check_in_latitude: location?.latitude ?? null,
        check_in_longitude: location?.longitude ?? null,
        face_detected: faceDetected,
        status: 'present',
        ...(shiftId ? { shift_id: shiftId } : {}),
        updated_at: db.fn.now(),
      })
      .returning('*');

    await db('face_detection_logs').insert({
      attendance_id: record.id,
      detected: faceDetected,
      detected_at: new Date(),
    });

    return mapAttendanceRecord(record);
  }

  // ── Check-out ─────────────────────────────────────────────────────────────

  async checkOut(
    attendanceId: string,
    location: GeoLocation | null,
    options: CheckOutOptions = {}
  ): Promise<Attendance> {
    if (!options.skipLocationValidation) {
      if (!location || !isValidGeoLocation(location)) {
        throw new Error('Valid GPS location required for check-out');
      }
    }

    const db = getKnexInstance();
    const existing = await db('attendance').where({ id: attendanceId }).first();
    if (!existing) throw new Error(`Attendance record not found: ${attendanceId}`);
    if (!existing.check_in_time) throw new Error('Cannot check out without a check-in record');
    if (existing.check_out_time) throw new Error('Already checked out for this record');

    // Look up shift break duration — falls back to 60 min default
    const breakMinutes = await getShiftBreakMinutes(db, existing.employee_id);

    const now = new Date().toTimeString().split(' ')[0]!;
    const workingMinutes = calcWorkingMinutes(String(existing.check_in_time), now, breakMinutes);
    const workingHours = Math.round(workingMinutes / 60);
    const overtimeMinutes = Math.max(0, Math.round(workingMinutes - STANDARD_SHIFT_HOURS * 60));
    const newStatus: 'present' | 'half_day' = workingHours < 4 ? 'half_day' : 'present';

    await db('attendance').where({ id: attendanceId }).update({
      check_out_time: now,
      check_out_latitude: location?.latitude ?? null,
      check_out_longitude: location?.longitude ?? null,
      working_hours: workingHours,
      overtime_minutes: overtimeMinutes,
      status: newStatus,
      updated_at: db.fn.now(),
    });

    const record = await db('attendance').where({ id: attendanceId }).first();
    return mapAttendanceRecord(record);
  }

  // ── Monthly summary ───────────────────────────────────────────────────────

  async getMonthlyAttendance(employeeId: string, month: number, year: number): Promise<Attendance[]> {
    const db = getKnexInstance();
    const { startDate, endDate } = monthRange(month, year);
    const records = await db('attendance')
      .where({ employee_id: employeeId })
      .whereBetween('attendance_date', [startDate, endDate])
      .orderBy('attendance_date', 'asc');
    return records.map(mapAttendanceRecord);
  }

  // ── Regularization ────────────────────────────────────────────────────────

  async requestRegularization(
    attendanceId: string,
    employeeId: string,
    reason: string
  ): Promise<RegularizationRequest> {
    const db = getKnexInstance();

    const attendance = await db('attendance')
      .where({ id: attendanceId, employee_id: employeeId })
      .first();
    if (!attendance) throw new Error('Attendance record not found or does not belong to this employee');

    const [request] = await db('attendance_regularization_requests')
      .insert({ attendance_id: attendanceId, employee_id: employeeId, reason, status: 'pending' })
      .returning('*');

    await db('attendance')
      .where({ id: attendanceId })
      .update({ regularization_requested: true, updated_at: db.fn.now() });

    // ── Notifications ─────────────────────────────────────────────────────────
    const attRow = await db('attendance').where({ id: attendanceId }).select('attendance_date').first();
    const dateStr = fmtDate(attRow?.attendance_date);

    // 1. Confirm submission to the employee
    await notify(
      db, employeeId,
      'Regularization Request Submitted',
      `Your attendance regularization request for ${dateStr} has been submitted and is pending approval.`,
      'info',
      { requestId: request.id, attendanceId, date: dateStr }
    );

    // 2. Alert the reporting manager so they can act on it promptly
    const emp = await db('employees')
      .where({ id: employeeId })
      .select('reporting_manager_id', 'first_name', 'last_name')
      .first();

    if (emp?.reporting_manager_id) {
      const empName = `${emp.first_name ?? ''} ${emp.last_name ?? ''}`.trim();
      await notify(
        db, emp.reporting_manager_id,
        'New Regularization Request Pending',
        `${empName} has submitted an attendance regularization request for ${dateStr} that requires your approval.`,
        'info',
        { requestId: request.id, attendanceId, employeeId, date: dateStr }
      );
    }

    return mapRegularizationRequest(request);
  }

  async approveRegularization(
    requestId: string,
    approverId: string,
    comments?: string
  ): Promise<RegularizationRequest> {
    return this._processRegularization(requestId, 'approved', approverId, comments);
  }

  async rejectRegularization(
    requestId: string,
    rejecterId: string,
    comments?: string
  ): Promise<RegularizationRequest> {
    return this._processRegularization(requestId, 'rejected', rejecterId, comments);
  }

  private async _processRegularization(
    requestId: string,
    newStatus: 'approved' | 'rejected',
    actorId: string,
    comments?: string
  ): Promise<RegularizationRequest> {
    const db = getKnexInstance();

    const existing = await db('attendance_regularization_requests')
      .where({ id: requestId })
      .first();
    if (!existing) throw new Error(`Regularization request not found: ${requestId}`);
    if (existing.status !== 'pending') throw new Error(`Request is already ${existing.status}`);

    await db('attendance_regularization_requests').where({ id: requestId }).update({
      status: newStatus,
      approved_by: actorId,
      approval_notes: comments ?? null,
      approved_at: db.fn.now(),
      updated_at: db.fn.now(),
    });

    // When approved, apply the time corrections embedded in the reason string
    // Format: "… [Requested corrections — Check-in: HH:MM, Check-out: HH:MM]"
    if (newStatus === 'approved') {
      const reason: string = existing.reason ?? '';
      const checkInMatch  = reason.match(/Check-in:\s*(\d{1,2}:\d{2})/);
      const checkOutMatch = reason.match(/Check-out:\s*(\d{1,2}:\d{2})/);

      if (checkInMatch || checkOutMatch) {
        const updateData: Record<string, any> = { updated_at: db.fn.now() };

        if (checkInMatch)  updateData['check_in_time']  = checkInMatch[1];
        if (checkOutMatch) updateData['check_out_time'] = checkOutMatch[1];

        // Recalculate hours when both times are known
        if (checkInMatch && checkOutMatch) {
          const breakMinutes   = await getShiftBreakMinutes(db, existing.employee_id);
          const workingMinutes = calcWorkingMinutes(checkInMatch[1]!, checkOutMatch[1]!, breakMinutes);
          const workingHours   = Math.round(workingMinutes / 60);
          updateData['working_hours']    = workingHours;
          updateData['overtime_minutes'] = Math.max(0, Math.round(workingMinutes - STANDARD_SHIFT_HOURS * 60));
          updateData['status']           = workingHours < 4 ? 'half_day' : 'present';
        } else {
          // At minimum, mark as present when a check-in correction is applied
          updateData['status'] = 'present';
        }

        await db('attendance').where({ id: existing.attendance_id }).update(updateData);
      } else {
        // No time corrections in reason — just flip status to present
        const attendance = await db('attendance').where({ id: existing.attendance_id }).first();
        if (attendance && attendance.status === 'absent') {
          await db('attendance')
            .where({ id: existing.attendance_id })
            .update({ status: 'present', updated_at: db.fn.now() });
        }
      }
    }

    // ── Notify the employee of the outcome ────────────────────────────────────
    const attRow2 = await db('attendance').where({ id: existing.attendance_id }).select('attendance_date').first();
    const dateStr2 = fmtDate(attRow2?.attendance_date);

    if (newStatus === 'approved') {
      await notify(
        db, existing.employee_id,
        'Regularization Request Approved',
        `Your attendance regularization request for ${dateStr2} has been approved and your attendance record has been updated.`,
        'success',
        { requestId, date: dateStr2 }
      );
    } else {
      await notify(
        db, existing.employee_id,
        'Regularization Request Rejected',
        `Your attendance regularization request for ${dateStr2} has been rejected.${comments ? ` Reason: ${comments}` : ''}`,
        'warning',
        { requestId, date: dateStr2, rejectionReason: comments ?? '' }
      );
    }

    const updated = await db('attendance_regularization_requests').where({ id: requestId }).first();
    return mapRegularizationRequest(updated);
  }

  async getRegularizationRequest(requestId: string): Promise<RegularizationRequest> {
    const db = getKnexInstance();
    const record = await db('attendance_regularization_requests').where({ id: requestId }).first();
    if (!record) throw new Error(`Regularization request not found: ${requestId}`);
    return mapRegularizationRequest(record);
  }

  async listRegularizationRequests(filters: {
    employeeId?: string;
    attendanceId?: string;
    status?: string;
    limit?: number;
    page?: number;
  }): Promise<{ data: RegularizationRequest[]; total: number }> {
    const db = getKnexInstance();
    const limitNum = Math.min(filters.limit ?? 50, 200);
    const offset = ((filters.page ?? 1) - 1) * limitNum;

    // Separate count and data queries to avoid mixing aggregate + non-aggregate columns
    let countQuery = db('attendance_regularization_requests');
    let dataQuery  = db('attendance_regularization_requests').orderBy('created_at', 'desc');

    if (filters.employeeId)  { countQuery = countQuery.where('employee_id',  filters.employeeId);  dataQuery = dataQuery.where('employee_id',  filters.employeeId); }
    if (filters.attendanceId){ countQuery = countQuery.where('attendance_id', filters.attendanceId); dataQuery = dataQuery.where('attendance_id', filters.attendanceId); }
    if (filters.status)      { countQuery = countQuery.where('status',        filters.status);       dataQuery = dataQuery.where('status',        filters.status); }

    const countResult = await countQuery.count('* as count').first();
    const total = Number((countResult as any)?.count ?? 0);
    const rows  = await dataQuery.limit(limitNum).offset(offset);

    return { data: rows.map(mapRegularizationRequest), total };
  }

  // ── Pure utility (kept for tests / external callers) ─────────────────────

  calculateWorkingHours(checkIn: Date | string, checkOut?: Date | string): number {
    if (!checkIn || !checkOut) return 0;
    let diffMs: number;
    if (checkIn instanceof Date && checkOut instanceof Date) {
      diffMs = checkOut.getTime() - checkIn.getTime();
    } else {
      const [ih = 0, im = 0] = String(checkIn).split(':').map(Number);
      const [oh = 0, om = 0] = String(checkOut).split(':').map(Number);
      const inMin = ih * 60 + im;
      const outMin = oh * 60 + om;
      const diff = outMin >= inMin ? outMin - inMin : outMin + 1440 - inMin;
      diffMs = diff * 60 * 1000;
    }
    return Math.max(0, diffMs / (1000 * 60 * 60) - DEFAULT_BREAK_MINUTES / 60);
  }

  calculateOvertimeHours(workingHours: number): number {
    return Math.max(0, workingHours - STANDARD_SHIFT_HOURS);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Insert an in-app notification row for the given employee. Fire-and-forget safe. */
async function notify(
  db: any,
  employeeId: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    await db('notifications').insert({
      employee_id: employeeId,
      title,
      message,
      type,
      channel: 'in_app',
      is_read: false,
      metadata,
      created_at: new Date(),
    });
  } catch {
    // Non-fatal — attendance operations must not fail because of a notification error
  }
}

/** Format a DB date value (Date object or ISO string) to YYYY-MM-DD. */
function fmtDate(d: any): string {
  if (!d) return 'unknown date';
  const s = d instanceof Date ? d.toISOString() : String(d);
  return s.split('T')[0] ?? s;
}

/**
 * Throws if the employee's shift-based check-in window has already closed.
 * Window = shift start time + CHECK_IN_CUTOFF_MINUTES.
 * If the employee has no shift or the shift has no start_time, no restriction applies.
 */
async function assertCheckInWindow(db: any, employeeId: string, today: string): Promise<void> {
  const assignment = await db('employee_shifts')
    .where({ employee_id: employeeId })
    .where('effective_from', '<=', today)
    .where(function (this: any) {
      this.whereNull('effective_to').orWhere('effective_to', '>=', today);
    })
    .orderBy('effective_from', 'desc')
    .first();

  if (!assignment?.shift_id) return; // No shift assigned — no restriction

  const shift = await db('shifts').where({ id: assignment.shift_id }).first();
  if (!shift?.start_time) return; // Flexible / no fixed start — no restriction

  const parts = String(shift.start_time).split(':');
  const shiftStartMinutes = parseInt(parts[0] ?? '0', 10) * 60 + parseInt(parts[1] ?? '0', 10);
  const cutoffMinutes = shiftStartMinutes + CHECK_IN_CUTOFF_MINUTES;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (currentMinutes > cutoffMinutes) {
    const ch = Math.floor(cutoffMinutes / 60);
    const cm = cutoffMinutes % 60;
    const cutoffStr = `${String(ch).padStart(2, '0')}:${String(cm).padStart(2, '0')}`;
    throw new Error(
      `Check-in window closed at ${cutoffStr}. Please submit a regularization request.`
    );
  }
}

async function getShiftBreakMinutes(db: any, employeeId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0]!;
  const assignment = await db('employee_shifts')
    .where({ employee_id: employeeId })
    .where('effective_from', '<=', today)
    .where(function (this: any) {
      this.whereNull('effective_to').orWhere('effective_to', '>=', today);
    })
    .orderBy('effective_from', 'desc')
    .first();

  if (!assignment?.shift_id) return DEFAULT_BREAK_MINUTES;

  const shift = await db('shifts').where({ id: assignment.shift_id }).first();
  return shift?.break_duration_minutes != null
    ? Number(shift.break_duration_minutes)
    : DEFAULT_BREAK_MINUTES;
}

function calcWorkingMinutes(
  checkInTime: string,
  checkOutTime: string,
  breakMinutes: number = DEFAULT_BREAK_MINUTES
): number {
  const [ih = 0, im = 0] = String(checkInTime).split(':').map(Number);
  const [oh = 0, om = 0] = String(checkOutTime).split(':').map(Number);
  const inMin = ih * 60 + im;
  const outMin = oh * 60 + om;
  const diff = outMin >= inMin ? outMin - inMin : outMin + 1440 - inMin;
  return Math.max(0, diff - breakMinutes);
}

function isValidGeoLocation(location: GeoLocation): boolean {
  return (
    typeof location.latitude === 'number' &&
    typeof location.longitude === 'number' &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    location.longitude >= -180 &&
    location.longitude <= 180
  );
}

function monthRange(month: number, year: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0).toISOString().split('T')[0]!;
  return { startDate, endDate };
}

function mapAttendanceRecord(record: any): Attendance {
  return {
    id: record.id,
    employeeId: record.employee_id,
    date: record.attendance_date,
    checkInTime: record.check_in_time ?? null,
    checkOutTime: record.check_out_time ?? null,
    workingHours: record.working_hours ?? null,
    overtimeMinutes: record.overtime_minutes ?? null,
    status: record.status,
    checkInLatitude: record.check_in_latitude ?? null,
    checkInLongitude: record.check_in_longitude ?? null,
    checkOutLatitude: record.check_out_latitude ?? null,
    checkOutLongitude: record.check_out_longitude ?? null,
    faceDetected: record.face_detected ?? false,
    shiftId: record.shift_id ?? null,
    notes: record.notes ?? null,
    regularizationRequested: record.regularization_requested ?? false,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapRegularizationRequest(record: any): RegularizationRequest {
  return {
    id: record.id,
    attendanceId: record.attendance_id,
    employeeId: record.employee_id,
    reason: record.reason,
    status: record.status,
    approvedBy: record.approved_by ?? null,
    approvalNotes: record.approval_notes ?? null,
    approvedAt: record.approved_at ?? null,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export const attendanceService = new AttendanceService();
