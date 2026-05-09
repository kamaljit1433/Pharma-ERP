import { Knex } from 'knex';

const MORNING_SHIFT = '00000001-0000-0000-0000-000000000001';

const EMPLOYEES = [
  'e0000000-0000-0000-0000-000000000001', // EMP001
  'e0000000-0000-0000-0000-000000000002', // EMP002
  'e0000000-0000-0000-0000-000000000003', // EMP003
  'e0000000-0000-0000-0000-000000000004', // EMP004
  'e0000000-0000-0000-0000-000000000005', // EMP005
  'e0000000-0000-0000-0000-000000000006', // EMP006
  'e0000000-0000-0000-0000-000000000007', // EMP007
  'e0000000-0000-0000-0000-000000000008', // EMP008
  'e0000000-0000-0000-0000-000000000009', // EMP009
  'e0000000-0000-0000-0000-000000000010', // EMP010
];

// Returns all Mon-Fri dates within [year, month] as 'YYYY-MM-DD' strings
function getWeekdays(year: number, month: number): string[] {
  const days: string[] = [];
  const d = new Date(year, month - 1, 1);
  while (d.getMonth() === month - 1) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      const mm = String(month).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      days.push(`${year}-${mm}-${dd}`);
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'on_leave' | 'holiday';

interface Overrides {
  [date: string]: {
    [employeeId: string]: AttendanceStatus;
  };
}

function presentRecord(employeeId: string, date: string) {
  return {
    employee_id: employeeId,
    shift_id: MORNING_SHIFT,
    attendance_date: date,
    check_in_time: '09:00:00',
    check_out_time: '18:00:00',
    check_in_latitude: 19.076,
    check_in_longitude: 72.8777,
    check_out_latitude: 19.076,
    check_out_longitude: 72.8777,
    face_detected: true,
    working_hours: 480,
    overtime_minutes: 0,
    status: 'present' as AttendanceStatus,
    notes: null as string | null,
  };
}

function buildRecords(
  year: number,
  month: number,
  holidays: string[],
  overrides: Overrides
) {
  const weekdays = getWeekdays(year, month);
  const records: ReturnType<typeof presentRecord>[] = [];

  // Holiday records for all employees
  for (const date of holidays) {
    for (const empId of EMPLOYEES) {
      records.push({
        employee_id: empId,
        shift_id: null as any,
        attendance_date: date,
        check_in_time: null as any,
        check_out_time: null as any,
        check_in_latitude: null as any,
        check_in_longitude: null as any,
        check_out_latitude: null as any,
        check_out_longitude: null as any,
        face_detected: false,
        working_hours: 0,
        overtime_minutes: 0,
        status: 'holiday' as AttendanceStatus,
        notes: null,
      });
    }
  }

  for (const date of weekdays) {
    if (holidays.includes(date)) continue; // already added as holiday

    for (const empId of EMPLOYEES) {
      const override = overrides[date]?.[empId];

      if (override === 'on_leave') {
        records.push({
          employee_id: empId,
          shift_id: null as any,
          attendance_date: date,
          check_in_time: null as any,
          check_out_time: null as any,
          check_in_latitude: null as any,
          check_in_longitude: null as any,
          check_out_latitude: null as any,
          check_out_longitude: null as any,
          face_detected: false,
          working_hours: 0,
          overtime_minutes: 0,
          status: 'on_leave' as AttendanceStatus,
          notes: 'Approved leave',
        });
      } else if (override === 'absent') {
        records.push({
          employee_id: empId,
          shift_id: null as any,
          attendance_date: date,
          check_in_time: null as any,
          check_out_time: null as any,
          check_in_latitude: null as any,
          check_in_longitude: null as any,
          check_out_latitude: null as any,
          check_out_longitude: null as any,
          face_detected: false,
          working_hours: 0,
          overtime_minutes: 0,
          status: 'absent' as AttendanceStatus,
          notes: null,
        });
      } else if (override === 'half_day') {
        records.push({
          employee_id: empId,
          shift_id: MORNING_SHIFT,
          attendance_date: date,
          check_in_time: '09:00:00',
          check_out_time: '13:30:00',
          check_in_latitude: 19.076,
          check_in_longitude: 72.8777,
          check_out_latitude: 19.076,
          check_out_longitude: 72.8777,
          face_detected: true,
          working_hours: 240,
          overtime_minutes: 0,
          status: 'half_day' as AttendanceStatus,
          notes: 'Half day — afternoon leave',
        });
      } else {
        records.push(presentRecord(empId, date));
      }
    }
  }

  return records;
}

export async function seed(knex: Knex): Promise<void> {
  // CASCADE deletes attendance_regularization_requests too
  await knex('attendance').del();

  const EMP006 = EMPLOYEES[5] as string;
  const EMP007 = EMPLOYEES[6] as string;
  const EMP008 = EMPLOYEES[7] as string;
  const EMP009 = EMPLOYEES[8] as string;
  const EMP010 = EMPLOYEES[9] as string;

  // ── February 2026 (20 working days, no holidays) ─────────────────────────
  const febRecords = buildRecords(2026, 2, [], {});

  // ── March 2026 (22 working days, no weekday holidays) ────────────────────
  // Holi (Mar 14) falls on Saturday — not a weekday
  const marchOverrides: Overrides = {
    '2026-03-10': { [EMP007]: 'on_leave' },
    '2026-03-11': { [EMP007]: 'on_leave' },
    '2026-03-16': { [EMP009]: 'on_leave' },
    '2026-03-17': { [EMP009]: 'on_leave' },
    '2026-03-18': { [EMP009]: 'on_leave' },
    '2026-03-19': { [EMP008]: 'absent'   },
    '2026-03-24': { [EMP010]: 'half_day' },
  };
  const marchRecords = buildRecords(2026, 3, [], marchOverrides);

  // ── April 2026 (working days up to Apr 26; holidays Apr 3 & Apr 10) ──────
  const aprilHolidays = ['2026-04-03', '2026-04-10'];
  const aprilOverrides: Overrides = {
    '2026-04-14': { [EMP010]: 'on_leave' },
    '2026-04-15': { [EMP010]: 'on_leave' },
    '2026-04-22': { [EMP006]: 'absent'   },
  };
  // Only generate up to Apr 26 (today)
  const aprilWeekdays = getWeekdays(2026, 4).filter((d) => d <= '2026-04-26');
  const aprilRecords: any[] = [];

  // Add holiday rows
  for (const date of aprilHolidays) {
    for (const empId of EMPLOYEES) {
      aprilRecords.push({
        employee_id: empId,
        shift_id: null,
        attendance_date: date,
        check_in_time: null,
        check_out_time: null,
        check_in_latitude: null,
        check_in_longitude: null,
        check_out_latitude: null,
        check_out_longitude: null,
        face_detected: false,
        working_hours: 0,
        overtime_minutes: 0,
        status: 'holiday',
        notes: null,
      });
    }
  }

  // Add weekday rows (excluding holidays)
  for (const date of aprilWeekdays) {
    if (aprilHolidays.includes(date)) continue;
    for (const empId of EMPLOYEES) {
      const override = aprilOverrides[date]?.[empId];
      if (override === 'on_leave') {
        aprilRecords.push({ employee_id: empId, shift_id: null, attendance_date: date, check_in_time: null, check_out_time: null, check_in_latitude: null, check_in_longitude: null, check_out_latitude: null, check_out_longitude: null, face_detected: false, working_hours: 0, overtime_minutes: 0, status: 'on_leave', notes: 'Approved leave' });
      } else if (override === 'absent') {
        aprilRecords.push({ employee_id: empId, shift_id: null, attendance_date: date, check_in_time: null, check_out_time: null, check_in_latitude: null, check_in_longitude: null, check_out_latitude: null, check_out_longitude: null, face_detected: false, working_hours: 0, overtime_minutes: 0, status: 'absent', notes: null });
      } else {
        aprilRecords.push(presentRecord(empId, date));
      }
    }
  }

  const allRecords = [...febRecords, ...marchRecords, ...aprilRecords];
  await knex.batchInsert('attendance', allRecords, 100);

  console.log(`Attendance seeded: ${allRecords.length} records (Feb + Mar + Apr 2026)`);
}
