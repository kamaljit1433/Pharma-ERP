/**
 * Manager Attendance View Component
 * Allows managers to view team attendance
 * Displays team attendance summary and records
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
import { AlertCircle, Users } from 'lucide-react';
import attendanceService, { AttendanceRecord } from '../../services/attendanceService';

interface ManagerAttendanceViewProps {
  managerId: string;
  date?: string;
}

interface TeamAttendanceSummary {
  total_team_members: number;
  present: number;
  absent: number;
  half_day: number;
  on_leave: number;
  late_arrivals: number;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'present':
      return 'bg-success text-success-foreground';
    case 'absent':
      return 'bg-destructive text-destructive-foreground';
    case 'half_day':
      return 'bg-warning text-warning-foreground';
    case 'on_leave':
      return 'bg-info text-info-foreground';
    default:
      return 'bg-secondary text-secondary-foreground';
  }
};

// PostgreSQL TIME columns return plain "HH:MM:SS" strings; new Date() on those
// produces Invalid Date. Detect and parse directly.
const formatTime = (timeString?: string | null) => {
  if (!timeString) return '-';
  try {
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeString)) {
      const parts = timeString.split(':');
      const hours = parseInt(parts[0] ?? '0', 10);
      const minutes = parseInt(parts[1] ?? '0', 10);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const h12 = hours % 12 || 12;
      return `${String(h12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
    }
    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    return timeString;
  } catch {
    return timeString;
  }
};

const timeToMinutes = (t: string) => {
  const parts = t.split(':');
  return parseInt(parts[0] ?? '0', 10) * 60 + parseInt(parts[1] ?? '0', 10);
};


export const ManagerAttendanceView: React.FC<ManagerAttendanceViewProps> = ({
  managerId,
  date,
}) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<TeamAttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(date || new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchTeamAttendance();
  }, [managerId, selectedDate]);

  const fetchTeamAttendance = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const teamRecords = await attendanceService.getTeamAttendance(selectedDate);
      setRecords(teamRecords);

      // Calculate summary
      const summary: TeamAttendanceSummary = {
        total_team_members: teamRecords.length,
        present: teamRecords.filter((r) => r.status === 'present').length,
        absent: teamRecords.filter((r) => r.status === 'absent').length,
        half_day: teamRecords.filter((r) => r.status === 'half_day').length,
        on_leave: teamRecords.filter((r) => r.status === 'on_leave').length,
        late_arrivals: teamRecords.filter((r) => {
          if (!r.check_in_time) return false;
          // Compare as minutes-since-midnight; works for both "HH:MM:SS" and ISO strings
          const t = String(r.check_in_time);
          const mins = /^\d{1,2}:\d{2}/.test(t)
            ? timeToMinutes(t)
            : timeToMinutes(new Date(t).toTimeString().slice(0, 5));
          return mins > 9 * 60; // after 09:00
        }).length,
      };

      setSummary(summary);
    } catch (err: any) {
      setError(err.message || 'Failed to load team attendance');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Picker */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          Team Attendance
        </h2>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <Button onClick={fetchTeamAttendance} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_team_members}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Present
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{summary.present}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Absent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{summary.absent}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Half Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{summary.half_day}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                On Leave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-info">{summary.on_leave}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Late
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{summary.late_arrivals}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records found for this date
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mode</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {(record as any).employee_name || record.employee_id}
                        {(record as any).employee_code && (
                          <span className="block text-xs text-muted-foreground">
                            {(record as any).employee_code}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{formatTime(record.check_in_time)}</TableCell>
                      <TableCell>{formatTime(record.check_out_time)}</TableCell>
                      <TableCell>
                        {record.working_hours ? `${record.working_hours.toFixed(1)}h` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status === 'present'
                            ? 'Present'
                            : record.status === 'absent'
                              ? 'Absent'
                              : record.status === 'half_day'
                                ? 'Half Day'
                                : 'On Leave'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {record.check_in_location ? 'GPS' : 'Web'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
