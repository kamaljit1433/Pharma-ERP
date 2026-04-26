/**
 * Attendance History Component
 * Displays employee attendance records with calendar view, statistics, date range filter, and table format
 * Requirements: 7.6, 7.7
 */

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Clock, CalendarCheck, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAttendanceStore } from '../../store/attendanceStore';
import { AttendanceFilters } from '../../services/attendanceService';
import { useAuth } from '../../hooks/useAuth';

interface AttendanceHistoryProps {
  employeeId?: string;
  month?: number;
  year?: number;
}

interface CalendarDay {
  date: number;
  status: 'present' | 'absent' | 'half_day' | 'on_leave' | 'holiday' | 'empty';
  record?: any;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'present':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'absent':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'half_day':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'on_leave':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'holiday':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    default:
      return 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'present':
      return 'Present';
    case 'absent':
      return 'Absent';
    case 'half_day':
      return 'Half Day';
    case 'on_leave':
      return 'On Leave';
    case 'holiday':
      return 'Holiday';
    default:
      return 'Not Marked';
  }
};

const formatTime = (timeString: string | undefined | null) => {
  if (!timeString) return '-';
  try {
    // PostgreSQL TIME columns return plain "HH:MM:SS" strings — parse directly
    // to avoid new Date("HH:MM:SS") producing an Invalid Date.
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeString)) {
      const parts = timeString.split(':');
      const hours = parseInt(parts[0] ?? '0', 10);
      const minutes = parseInt(parts[1] ?? '0', 10);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const h12 = hours % 12 || 12;
      return `${String(h12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
    }
    // Full ISO datetime string
    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    return timeString;
  } catch {
    return timeString;
  }
};

// PostgreSQL DATE columns can come back as JS Date objects. Normalise to YYYY-MM-DD.
const toDateStr = (d: any): string => {
  if (!d) return '';
  if (d instanceof Date) return d.toISOString().split('T')[0]!;
  const s = String(d);
  // If it looks like an ISO datetime, strip the time part
  return s.includes('T') ? s.split('T')[0]! : s;
};

const formatDate = (dateString: any) => {
  try {
    const date = new Date(toDateStr(dateString));
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return String(dateString);
  }
};

const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month, 0).getDate();
};

const getFirstDayOfMonth = (month: number, year: number) => {
  return new Date(year, month - 1, 1).getDay();
};

const getMonthName = (month: number) => {
  return new Date(2024, month - 1).toLocaleString('en-US', { month: 'long' });
};

export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({
  employeeId: propEmployeeId,
}) => {
  const { user } = useAuth();
  const { records, stats, loading, error, fetchRecords, fetchStats } = useAttendanceStore();
  
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [filteredRecords, setFilteredRecords] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');

  const employeeId = propEmployeeId || user?.employeeId || '';

  useEffect(() => {
    if (employeeId) {
      loadAttendanceData();
    }
  }, [employeeId, currentMonth, currentYear]);

  const loadAttendanceData = async () => {
    try {
      const monthStart = new Date(currentYear, currentMonth - 1, 1);
      const monthEnd = new Date(currentYear, currentMonth, 0);
      
      const from = monthStart.toISOString().split('T')[0]!;
      const to = monthEnd.toISOString().split('T')[0]!;

      const filters: AttendanceFilters = { employee_id: employeeId, from_date: from, to_date: to };
      await fetchRecords(filters);

      await fetchStats(employeeId, from, to);
    } catch (err) {
      console.error('Failed to load attendance data:', err);
    }
  };

  useEffect(() => {
    let filtered = records;

    if (fromDate) {
      filtered = filtered.filter(r => toDateStr(r.date) >= fromDate);
    }
    if (toDate) {
      filtered = filtered.filter(r => toDateStr(r.date) <= toDate);
    }

    setFilteredRecords(filtered);
  }, [records, fromDate, toDate]);

  const buildCalendarDays = (): CalendarDay[] => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days: CalendarDay[] = [];

    // Empty days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push({ date: 0, status: 'empty' });
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const record = records.find(r => toDateStr(r.date) === dateStr);
      
      days.push({
        date: day,
        status: record?.status || 'empty',
        record,
      });
    }

    return days;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const calendarDays = buildCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Present Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.present_days}</div>
              <p className="text-xs text-muted-foreground mt-1">
                out of {stats.total_days} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.absent_days}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.half_days} half days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.late_arrivals}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg: {stats.average_working_hours.toFixed(1)}h/day
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.on_leave_days}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Leave days
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Date Range Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="from-date" className="text-sm font-medium text-muted-foreground">From Date</label>
              <input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm mt-1"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="to-date" className="text-sm font-medium text-muted-foreground">To Date</label>
              <input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFromDate('');
                  setToDate('');
                }}
              >
                Clear Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === 'calendar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('calendar')}
        >
          Calendar View
        </Button>
        <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('table')}
        >
          Table View
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5" />
                Attendance Calendar - {getMonthName(currentMonth)} {currentYear}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevMonth}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextMonth}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <div className="space-y-4">
                {/* Week Days Header */}
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map(day => (
                    <div key={day} className="text-center font-semibold text-sm text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, idx) => (
                    <div
                      key={idx}
                      className={`aspect-square flex items-center justify-center rounded-md border text-sm font-medium cursor-pointer transition-colors ${
                        day.status === 'empty'
                          ? 'bg-muted/30 border-transparent'
                          : `${getStatusColor(day.status)} border-current`
                      }`}
                      title={day.record ? `${getStatusLabel(day.status)}: ${formatTime(day.record.check_in_time)} - ${formatTime(day.record.check_out_time)}` : ''}
                    >
                      {day.date || ''}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100 border border-green-800"></div>
                    <span className="text-xs">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-100 border border-red-800"></div>
                    <span className="text-xs">Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-800"></div>
                    <span className="text-xs">Half Day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-blue-100 border border-blue-800"></div>
                    <span className="text-xs">On Leave</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-100 border border-gray-800"></div>
                    <span className="text-xs">Holiday</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5" />
              Attendance Records ({filteredRecords.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No attendance records found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {formatDate(record.date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            {formatTime(record.check_in_time)}
                          </div>
                        </TableCell>
                        <TableCell>{formatTime(record.check_out_time)}</TableCell>
                        <TableCell>
                          {record.working_hours ? `${record.working_hours.toFixed(1)}h` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(record.status)}>
                            {getStatusLabel(record.status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
