import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AttendanceStatistics } from '../../types/dashboard';
import { Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface AttendanceStatsCardProps {
  stats: AttendanceStatistics;
}

export default function AttendanceStatsCard({ stats }: AttendanceStatsCardProps) {
  return (
    <div className="space-y-4">
      {/* Today's Attendance */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.presentToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.attendanceRate.toFixed(1)}% attendance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.absentToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave Today</CardTitle>
            <Badge className="bg-info">On Leave</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.onLeaveToday}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Half Day</CardTitle>
            <Badge className="bg-warning">Half Day</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.halfDayToday}</div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Rates */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Today's Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{stats.attendanceRate.toFixed(1)}%</div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-success h-2 rounded-full"
                  style={{ width: `${stats.attendanceRate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.presentToday} out of {stats.totalEmployees} employees
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monthly Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold">{stats.monthlyAttendanceRate.toFixed(1)}%</div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${stats.monthlyAttendanceRate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Last 30 days average
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Check-Ins</CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lateCheckIns}</div>
            <p className="text-xs text-muted-foreground">
              After 9:00 AM
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incomplete Check-Outs</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.incompleteCheckOuts}</div>
            <p className="text-xs text-muted-foreground">
              Not checked out yet
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Absentees */}
      {stats.topAbsentees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Absentees (Last 30 Days)</CardTitle>
            <CardDescription>Employees with highest absence count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topAbsentees.map((employee, index) => (
                <div key={employee.employeeId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    <span className="text-sm font-medium">{employee.employeeName}</span>
                  </div>
                  <Badge variant="secondary">{employee.absenceCount} absences</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
