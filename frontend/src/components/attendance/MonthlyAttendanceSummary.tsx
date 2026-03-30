/**
 * Monthly Attendance Summary Component
 * Displays attendance statistics for the month
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { CalendarCheck, Clock, AlertCircle } from 'lucide-react';

interface AttendanceSummary {
  totalWorkingDays: number;
  presentDays: number;
  absentDays: number;
  halfDays: number;
  leaveDays: number;
  holidayDays: number;
  totalWorkingHours: number;
  totalOvertimeHours: number;
}

interface MonthlyAttendanceSummaryProps {
  employeeId: string;
  month: number;
  year: number;
}

export const MonthlyAttendanceSummary: React.FC<MonthlyAttendanceSummaryProps> = ({
  employeeId,
  month,
  year,
}) => {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSummary();
  }, [employeeId, month, year]);

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `/api/v1/attendance/monthly/${employeeId}?month=${month}&year=${year}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch attendance summary');
      }

      const data = await response.json();

      // Calculate summary from records
      const records = data.data || [];
      const summary: AttendanceSummary = {
        totalWorkingDays: 0,
        presentDays: 0,
        absentDays: 0,
        halfDays: 0,
        leaveDays: 0,
        holidayDays: 0,
        totalWorkingHours: 0,
        totalOvertimeHours: 0,
      };

      records.forEach((record: any) => {
        summary.totalWorkingDays++;

        switch (record.status) {
          case 'Present':
            summary.presentDays++;
            break;
          case 'Absent':
            summary.absentDays++;
            break;
          case 'Half-Day':
            summary.halfDays++;
            break;
          case 'On Leave':
            summary.leaveDays++;
            break;
          case 'Holiday':
            summary.holidayDays++;
            break;
        }

        if (record.totalHours) {
          summary.totalWorkingHours += record.totalHours;
        }
        if (record.overtimeHours) {
          summary.totalOvertimeHours += record.overtimeHours;
        }
      });

      setSummary(summary);
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance summary');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5" />
            Monthly Summary
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
            <CalendarCheck className="w-5 h-5" />
            Monthly Summary
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

  if (!summary) {
    return null;
  }

  const attendancePercentage =
    summary.totalWorkingDays > 0
      ? ((summary.presentDays + summary.halfDays * 0.5) / summary.totalWorkingDays) * 100
      : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="w-5 h-5" />
          Monthly Summary - {month}/{year}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Attendance Percentage */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Attendance Rate</span>
            <Badge className="bg-success text-success-foreground">
              {attendancePercentage.toFixed(1)}%
            </Badge>
          </div>
          <Progress value={attendancePercentage} className="h-2" />
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Present Days */}
          <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Present Days</div>
            <div className="text-2xl font-bold text-success">{summary.presentDays}</div>
          </div>

          {/* Absent Days */}
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Absent Days</div>
            <div className="text-2xl font-bold text-destructive">{summary.absentDays}</div>
          </div>

          {/* Half Days */}
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Half Days</div>
            <div className="text-2xl font-bold text-warning">{summary.halfDays}</div>
          </div>

          {/* Leave Days */}
          <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
            <div className="text-sm text-muted-foreground">Leave Days</div>
            <div className="text-2xl font-bold text-info">{summary.leaveDays}</div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Working Hours</span>
            </div>
            <span className="font-semibold">{summary.totalWorkingHours.toFixed(1)}h</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Overtime Hours</span>
            <span className="font-semibold text-warning">
              {summary.totalOvertimeHours.toFixed(1)}h
            </span>
          </div>
        </div>

        {/* Holiday Days */}
        {summary.holidayDays > 0 && (
          <div className="text-sm text-muted-foreground">
            Holiday Days: <span className="font-semibold">{summary.holidayDays}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
