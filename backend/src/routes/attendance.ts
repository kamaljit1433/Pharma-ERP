import { Router, Request, Response } from 'express';
import { attendanceService } from '../services/attendanceService';
import { shiftService } from '../services/shiftService';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { getKnexInstance } from '../config/knex';

const router = Router();

// ── Auth: every attendance route requires a valid JWT ─────────────────────────
router.use(authenticateToken);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Resolves a UUID or business employee_id string (e.g. "EMP001") → employees.id UUID */
async function resolveEmployeeUuid(value: string): Promise<string | null> {
  const db = getKnexInstance();
  const col = UUID_RE.test(value) ? 'id' : 'employee_id';
  const row = await db('employees').where(col, value).select('id').first();
  return row ? row.id : null;
}

function err(res: Response, status: number, code: string, message: string, req: Request) {
  res.status(status).json({
    success: false,
    error: { code, message, timestamp: new Date().toISOString(), requestId: (req as any).id },
  });
}

// ── POST /api/v1/attendance/mark ──────────────────────────────────────────────
// Unified web / GPS endpoint — delegates to service so logic stays in one place
router.post('/mark', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getKnexInstance();
    const { employee_id, type, location, mode = 'web' } = req.body as {
      employee_id: string;
      type: 'check_in' | 'check_out';
      location?: { latitude: number; longitude: number; accuracy?: number };
      mode?: string;
    };

    if (!employee_id) { err(res, 400, 'MISSING_EMPLOYEE_ID', 'employee_id is required', req); return; }
    if (type !== 'check_in' && type !== 'check_out') { err(res, 400, 'INVALID_TYPE', 'type must be check_in or check_out', req); return; }

    const employeeUuid = await resolveEmployeeUuid(employee_id);
    if (!employeeUuid) { err(res, 400, 'EMPLOYEE_NOT_FOUND', `Employee not found: ${employee_id}`, req); return; }

    const isWebMode = mode === 'web';
    const requestingUser = (req as any).user;
    const isPrivileged = ['super_admin', 'hr_manager', 'department_manager'].includes(
      requestingUser?.role ?? ''
    );
    let record;

    if (type === 'check_in') {
      record = await attendanceService.checkIn(
        employeeUuid,
        location ?? null,
        !isWebMode,
        undefined,
        {
          skipFaceValidation: isWebMode,
          skipLocationValidation: isWebMode || !location,
          skipCutoffCheck: isPrivileged,   // managers can mark for their team at any time
        }
      );
    } else {
      // Find today's attendance record to get its ID for checkout
      const today = new Date().toISOString().split('T')[0]!;
      const existing = await db('attendance')
        .where({ employee_id: employeeUuid, attendance_date: today })
        .select('id')
        .first();
      if (!existing) { err(res, 400, 'NO_CHECKIN', 'No check-in record found for today', req); return; }

      record = await attendanceService.checkOut(
        existing.id,
        location ?? null,
        { skipLocationValidation: isWebMode || !location }
      );
    }

    res.status(200).json({
      success: true,
      data: record,
      timestamp: new Date().toISOString(),
      requestId: (req as any).id,
    });
  } catch (error: any) {
    err(res, 500, 'MARK_FAILED', error.message, req);
  }
});

// ── GET /api/v1/attendance/team ───────────────────────────────────────────────
router.get('/team', requireRole(['super_admin', 'hr_manager', 'department_manager']) as any, async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getKnexInstance();
    const { date, manager_id, limit = '50', page = '1' } = req.query as Record<string, string>;
    const targetDate = date || new Date().toISOString().split('T')[0]!;

    const limitNum = Math.min(parseInt(limit) || 50, 200);
    const offset = (parseInt(page) - 1) * limitNum;

    let employeeIds: string[] = [];
    if (manager_id) {
      const managerUuid = await resolveEmployeeUuid(manager_id);
      if (managerUuid) {
        employeeIds = await db('employees')
          .where('reporting_manager_id', managerUuid)
          .where('status', 'active')
          .pluck('id') as string[];
      }
    }

    let query = db('attendance')
      .join('employees', 'attendance.employee_id', 'employees.id')
      .select(
        'attendance.id',
        'attendance.employee_id',
        db.raw("employees.first_name || ' ' || employees.last_name as employee_name"),
        'employees.employee_id as employee_code',
        'attendance.attendance_date as date',
        'attendance.check_in_time',
        'attendance.check_out_time',
        'attendance.working_hours',
        'attendance.status',
        'attendance.face_detected',
        'attendance.regularization_requested',
        'attendance.created_at',
        'attendance.updated_at'
      )
      .where('attendance.attendance_date', targetDate)
      .orderBy('employees.first_name')
      .limit(limitNum)
      .offset(offset);

    if (employeeIds.length > 0) query = query.whereIn('attendance.employee_id', employeeIds);

    const records = await query;
    res.status(200).json({ success: true, data: records, timestamp: new Date().toISOString(), requestId: (req as any).id });
  } catch (error: any) {
    err(res, 500, 'FETCH_FAILED', error.message, req);
  }
});

// ── GET /api/v1/attendance ────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getKnexInstance();
    const { employee_id, from_date, to_date, status, limit = '50', page = '1' } = req.query as Record<string, string>;

    // Keep separate count and data queries — cloning a query with .select()
    // then adding .count() produces invalid SQL in PostgreSQL.
    let countQuery = db('attendance');
    let dataQuery  = db('attendance')
      .select(
        'id', 'employee_id', 'shift_id',
        'attendance_date as date',
        'check_in_time', 'check_out_time',
        'working_hours', 'overtime_minutes',
        'status', 'notes', 'face_detected',
        'regularization_requested',
        'created_at', 'updated_at'
      )
      .orderBy('attendance_date', 'desc');

    if (employee_id) {
      const empUuid = await resolveEmployeeUuid(employee_id);
      if (!empUuid) { res.status(200).json({ success: true, data: [], total: 0 }); return; }
      countQuery = countQuery.where('employee_id', empUuid);
      dataQuery  = dataQuery.where('employee_id', empUuid);
    }
    if (from_date) { countQuery = countQuery.where('attendance_date', '>=', from_date); dataQuery = dataQuery.where('attendance_date', '>=', from_date); }
    if (to_date)   { countQuery = countQuery.where('attendance_date', '<=', to_date);   dataQuery = dataQuery.where('attendance_date', '<=', to_date); }
    if (status)    { countQuery = countQuery.where('status', status);                   dataQuery = dataQuery.where('status', status); }

    const limitNum = Math.min(parseInt(limit) || 50, 200);
    const offset   = (parseInt(page) - 1) * limitNum;

    const countResult = await countQuery.count('* as count').first();
    const total       = Number((countResult as any)?.count ?? 0);
    const records     = await dataQuery.limit(limitNum).offset(offset);

    res.status(200).json({ success: true, data: records, total, timestamp: new Date().toISOString(), requestId: (req as any).id });
  } catch (error: any) {
    err(res, 500, 'FETCH_FAILED', error.message, req);
  }
});

// ── POST /api/v1/attendance/check-in ─────────────────────────────────────────
router.post('/check-in', async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId, location, faceDetected, shiftId } = req.body;

    if (!employeeId) { err(res, 400, 'MISSING_EMPLOYEE_ID', 'Employee ID is required', req); return; }
    if (!location)   { err(res, 400, 'MISSING_LOCATION', 'GPS location is required', req); return; }
    if (faceDetected === undefined) { err(res, 400, 'MISSING_FACE_DETECTION', 'Face detection result is required', req); return; }

    // Resolve business ID (EMP001) or UUID — service only accepts UUIDs
    const employeeUuid = await resolveEmployeeUuid(String(employeeId));
    if (!employeeUuid) { err(res, 400, 'EMPLOYEE_NOT_FOUND', `Employee not found: ${employeeId}`, req); return; }

    const callerRole = (req as any).user?.role ?? '';
    const skipCutoff = ['super_admin', 'hr_manager', 'department_manager'].includes(callerRole);
    const attendance = await attendanceService.checkIn(
      employeeUuid, location, faceDetected, shiftId,
      { skipCutoffCheck: skipCutoff }
    );

    res.status(201).json({ success: true, data: attendance, timestamp: new Date().toISOString(), requestId: (req as any).id });
  } catch (error: any) {
    err(res, 400, 'CHECK_IN_FAILED', error.message, req);
  }
});

// ── POST /api/v1/attendance/check-out ────────────────────────────────────────
router.post('/check-out', async (req: Request, res: Response): Promise<void> => {
  try {
    const { attendanceId, location } = req.body;

    if (!attendanceId) { err(res, 400, 'MISSING_ATTENDANCE_ID', 'Attendance ID is required', req); return; }
    if (!location)     { err(res, 400, 'MISSING_LOCATION', 'GPS location is required', req); return; }

    const attendance = await attendanceService.checkOut(attendanceId, location);

    res.status(200).json({ success: true, data: attendance, timestamp: new Date().toISOString(), requestId: (req as any).id });
  } catch (error: any) {
    err(res, 400, 'CHECK_OUT_FAILED', error.message, req);
  }
});

// ── GET /api/v1/attendance/monthly/:employeeId ────────────────────────────────
router.get('/monthly/:employeeId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    if (!month || !year) { err(res, 400, 'MISSING_PERIOD', 'Month and year are required', req); return; }

    const monthNum = parseInt(month as string, 10);
    const yearNum  = parseInt(year as string, 10);

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) { err(res, 400, 'INVALID_MONTH', 'Month must be between 1 and 12', req); return; }
    if (isNaN(yearNum)  || yearNum < 2000 || yearNum > 2100) { err(res, 400, 'INVALID_YEAR', 'Year must be between 2000 and 2100', req); return; }

    const db = getKnexInstance();

    const empUuid = await resolveEmployeeUuid(employeeId!);
    if (!empUuid) {
      const today = new Date();
      const isCurrentMonth = yearNum === today.getFullYear() && monthNum === today.getMonth() + 1;
      const totalDays = isCurrentMonth ? today.getDate() : new Date(yearNum, monthNum, 0).getDate();
      res.status(200).json({
        success: true,
        data: { total_days: totalDays, present_days: 0, absent_days: 0, half_days: 0, on_leave_days: 0, holiday_days: 0, late_arrivals: 0, average_working_hours: 0 },
        timestamp: new Date().toISOString(), requestId: (req as any).id,
      });
      return;
    }

    const startDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-01`;
    const lastDayOfMonth = new Date(yearNum, monthNum, 0).toISOString().split('T')[0]!;
    const todayStr  = new Date().toISOString().split('T')[0]!;
    const endDate   = lastDayOfMonth < todayStr ? lastDayOfMonth : todayStr;

    const records = await db('attendance')
      .where('employee_id', empUuid)
      .whereBetween('attendance_date', [startDate, endDate])
      .select('status', 'working_hours', 'check_in_time', 'attendance_date');

    // Determine late-arrival threshold from shift start time + 15 min grace
    let lateThresholdHour = 9, lateThresholdMin = 15;
    const shiftAssignment = await db('employee_shifts')
      .where({ employee_id: empUuid })
      .where('effective_from', '<=', endDate)
      .where(function (this: any) {
        this.whereNull('effective_to').orWhere('effective_to', '>=', startDate);
      })
      .orderBy('effective_from', 'desc')
      .first();
    if (shiftAssignment?.shift_id) {
      const shift = await db('shifts').where({ id: shiftAssignment.shift_id }).first();
      if (shift?.start_time) {
        const parts = String(shift.start_time).split(':');
        const sh = parseInt(parts[0] ?? '9', 10);
        const sm = parseInt(parts[1] ?? '0', 10) + 15;
        lateThresholdHour = sm >= 60 ? sh + 1 : sh;
        lateThresholdMin  = sm >= 60 ? sm - 60 : sm;
      }
    }

    const totalDays    = endDate === lastDayOfMonth
      ? new Date(yearNum, monthNum, 0).getDate()
      : new Date().getDate();
    const presentDays  = records.filter((r: any) => r.status === 'present').length;
    const absentDays   = records.filter((r: any) => r.status === 'absent').length;
    const halfDays     = records.filter((r: any) => r.status === 'half_day').length;
    const onLeaveDays  = records.filter((r: any) => r.status === 'on_leave').length;
    const holidayDays  = records.filter((r: any) => r.status === 'holiday').length;
    const lateArrivals = records.filter((r: any) => {
      if (!r.check_in_time) return false;
      const parts = String(r.check_in_time).split(':');
      const h = parseInt(parts[0] ?? '0', 10);
      const m = parseInt(parts[1] ?? '0', 10);
      return h > lateThresholdHour || (h === lateThresholdHour && m > lateThresholdMin);
    }).length;
    const totalHours   = records.reduce((s: number, r: any) => s + (parseFloat(r.working_hours) || 0), 0);
    const daysWithHours = records.filter((r: any) => parseFloat(r.working_hours) > 0).length;
    const avgHours     = daysWithHours > 0 ? Math.round((totalHours / daysWithHours) * 100) / 100 : 0;

    res.status(200).json({
      success: true,
      data: { total_days: totalDays, present_days: presentDays, absent_days: absentDays, half_days: halfDays, on_leave_days: onLeaveDays, holiday_days: holidayDays, late_arrivals: lateArrivals, average_working_hours: avgHours },
      timestamp: new Date().toISOString(), requestId: (req as any).id,
    });
  } catch (error: any) {
    err(res, 500, 'FETCH_FAILED', error.message, req);
  }
});

// ── POST /api/v1/attendance/regularization ────────────────────────────────────
// Accepts either { attendanceId, employeeId, reason }  (legacy / internal callers)
// OR the frontend form format: { employee_id, date, reason, check_in_time?, check_out_time? }
router.post('/regularization', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getKnexInstance();
    const {
      attendanceId,
      employeeId: empIdCamel,
      employee_id: empIdSnake,
      date,
      reason,
      check_in_time,
      check_out_time,
    } = req.body;

    const rawEmployeeId = empIdCamel || empIdSnake;
    if (!rawEmployeeId || !reason?.trim()) {
      err(res, 400, 'MISSING_FIELDS', 'employee_id and reason are required', req); return;
    }

    const employeeUuid = await resolveEmployeeUuid(String(rawEmployeeId));
    if (!employeeUuid) {
      err(res, 400, 'EMPLOYEE_NOT_FOUND', `Employee not found: ${rawEmployeeId}`, req); return;
    }

    // Resolve the attendance record ID
    let finalAttendanceId: string = attendanceId;

    if (!finalAttendanceId) {
      if (!date) {
        err(res, 400, 'MISSING_FIELDS', 'Either attendanceId or date is required', req); return;
      }
      // Look up today's attendance record for this employee+date
      let record = await db('attendance')
        .where({ employee_id: employeeUuid, attendance_date: date })
        .select('id')
        .first();

      if (!record) {
        // No record yet — create a placeholder so the regularization request has something to link to
        const [created] = await db('attendance')
          .insert({ employee_id: employeeUuid, attendance_date: date, status: 'absent' })
          .returning('id');
        record = created;
      }
      finalAttendanceId = record.id;
    }

    // Append optional time corrections to the reason so reviewers can see what the employee wants corrected
    let fullReason = reason.trim();
    const corrections: string[] = [];
    if (check_in_time) corrections.push(`Check-in: ${check_in_time}`);
    if (check_out_time) corrections.push(`Check-out: ${check_out_time}`);
    if (corrections.length > 0) fullReason += ` [Requested corrections — ${corrections.join(', ')}]`;

    const request = await attendanceService.requestRegularization(finalAttendanceId, employeeUuid, fullReason);
    res.status(201).json({ success: true, data: request, timestamp: new Date().toISOString(), requestId: (req as any).id });
  } catch (error: any) {
    err(res, 400, 'REGULARIZATION_FAILED', error.message, req);
  }
});

// ── GET /api/v1/attendance/regularization ─────────────────────────────────────
router.get('/regularization', async (req: Request, res: Response): Promise<void> => {
  try {
    const { employee_id, attendance_id, status, limit, page } = req.query as Record<string, string>;
    const result = await attendanceService.listRegularizationRequests({
      employeeId: employee_id,
      attendanceId: attendance_id,
      status,
      limit: limit ? parseInt(limit) : undefined,
      page: page ? parseInt(page) : undefined,
    });
    res.status(200).json({ success: true, ...result, timestamp: new Date().toISOString(), requestId: (req as any).id });
  } catch (error: any) {
    err(res, 500, 'FETCH_FAILED', error.message, req);
  }
});

// ── GET /api/v1/attendance/regularization/:id ─────────────────────────────────
router.get('/regularization/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const request = await attendanceService.getRegularizationRequest(req.params['id']!);
    res.status(200).json({ success: true, data: request, timestamp: new Date().toISOString(), requestId: (req as any).id });
  } catch (error: any) {
    err(res, 404, 'NOT_FOUND', error.message, req);
  }
});

// ── PUT /api/v1/attendance/regularization/:id/approve ────────────────────────
router.put('/regularization/:id/approve',
  requireRole(['super_admin', 'hr_manager', 'department_manager']) as any,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { approverId, comments } = req.body;
      if (!approverId) { err(res, 400, 'MISSING_FIELDS', 'Approver ID is required', req); return; }
      const request = await attendanceService.approveRegularization(req.params['id']!, approverId, comments);
      res.status(200).json({ success: true, data: request, timestamp: new Date().toISOString(), requestId: (req as any).id });
    } catch (error: any) {
      err(res, 400, 'APPROVAL_FAILED', error.message, req);
    }
  }
);

// ── PUT /api/v1/attendance/regularization/:id/reject ─────────────────────────
router.put('/regularization/:id/reject',
  requireRole(['super_admin', 'hr_manager', 'department_manager']) as any,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { rejecterId, comments } = req.body;
      if (!rejecterId) { err(res, 400, 'MISSING_FIELDS', 'Rejecter ID is required', req); return; }
      const request = await attendanceService.rejectRegularization(req.params['id']!, rejecterId, comments);
      res.status(200).json({ success: true, data: request, timestamp: new Date().toISOString(), requestId: (req as any).id });
    } catch (error: any) {
      err(res, 400, 'REJECTION_FAILED', error.message, req);
    }
  }
);

// ── GET /api/v1/attendance/shifts ─────────────────────────────────────────────
router.get('/shifts', async (req: Request, res: Response): Promise<void> => {
  try {
    const shifts = await shiftService.getAllShifts();
    res.status(200).json({ success: true, data: shifts, timestamp: new Date().toISOString(), requestId: (req as any).id });
  } catch (error: any) {
    err(res, 500, 'FETCH_FAILED', error.message, req);
  }
});

// ── POST /api/v1/attendance/shifts ────────────────────────────────────────────
router.post('/shifts',
  requireRole(['super_admin', 'hr_manager']) as any,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, startTime, endTime, breakDuration, type, rotationPattern, minHours, maxHours, daysOfWeek } = req.body;
      if (!name || !type) { err(res, 400, 'MISSING_FIELDS', 'Name and type are required', req); return; }
      const shift = await shiftService.createShift({ name, startTime, endTime, breakDuration, type, rotationPattern, minHours, maxHours, daysOfWeek });
      res.status(201).json({ success: true, data: shift, timestamp: new Date().toISOString(), requestId: (req as any).id });
    } catch (error: any) {
      err(res, 400, 'SHIFT_CREATION_FAILED', error.message, req);
    }
  }
);

// ── GET /api/v1/attendance/current/:employeeId ───────────────────────────────
// Returns today's attendance record for the given employee (used by Today's Status card).
router.get('/current/:employeeId', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getKnexInstance();
    const empUuid = await resolveEmployeeUuid(req.params['employeeId']!);
    if (!empUuid) { res.status(200).json({ success: true, data: null }); return; }

    const today = new Date().toISOString().split('T')[0]!;
    const record = await db('attendance')
      .where({ employee_id: empUuid, attendance_date: today })
      .select(
        'id', 'employee_id', 'shift_id',
        'attendance_date as date',
        'check_in_time', 'check_out_time',
        'working_hours', 'overtime_minutes',
        'status', 'notes', 'face_detected',
        'regularization_requested',
        'created_at', 'updated_at'
      )
      .first();

    res.status(200).json({ success: true, data: record ?? null, timestamp: new Date().toISOString(), requestId: (req as any).id });
  } catch (error: any) {
    err(res, 500, 'FETCH_FAILED', error.message, req);
  }
});

// ── GET /api/v1/attendance/:id ────────────────────────────────────────────────
// Must be last — /:id is a wildcard that would shadow all named routes above it.
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const db = getKnexInstance();
    const record = await db('attendance').where({ id: req.params['id'] }).first();
    if (!record) { err(res, 404, 'NOT_FOUND', 'Attendance record not found', req); return; }
    res.status(200).json({ success: true, data: record, timestamp: new Date().toISOString(), requestId: (req as any).id });
  } catch (error: any) {
    err(res, 500, 'FETCH_FAILED', error.message, req);
  }
});

export default router;
