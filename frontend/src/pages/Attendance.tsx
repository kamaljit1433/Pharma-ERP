/**
 * Attendance Page
 * Main page for attendance management
 * Displays current attendance status, check-in/check-out times, and working hours
 */

import React, { useState, useEffect } from 'react';
import { useAttendanceStore } from '../store/attendanceStore';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AttendanceMarker } from '../components/attendance/AttendanceMarker';
import { AttendanceHistory } from '../components/attendance/AttendanceHistory';
import { RegularizationRequest } from '../components/attendance/RegularizationRequest';
import { ManagerAttendanceView } from '../components/attendance/ManagerAttendanceView';
import { AttendanceReports } from '../components/attendance/AttendanceReports';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { UserRole } from '../types/auth';
import employeeService from '../services/employeeService';

export const Attendance: React.FC = () => {
  const { user } = useAuth();
  const { currentStatus, stats, fetchCurrentStatus, fetchStats } = useAttendanceStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeePhotoUrl, setEmployeePhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user?.employeeId) {
      loadAttendanceData();
      loadEmployeePhoto();
    }
  }, [user?.employeeId]);

  const loadEmployeePhoto = async () => {
    if (!user?.employeeId) return;
    try {
      const results = await employeeService.search(user.employeeId, 5);
      // Find the exact match by employee_id (business string like "EMP001")
      const emp = results.find(e => e.employee_id === user.employeeId) ?? results[0];
      setEmployeePhotoUrl(emp?.profile_photo_url ?? null);
    } catch {
      // keep employeePhotoUrl null; the modal will block verification and show an error
    }
  };

  const loadAttendanceData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (user?.employeeId) {
        await fetchCurrentStatus(user.employeeId);
        await fetchStats(user.employeeId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'present':
        return 'bg-success text-success-foreground';
      case 'absent':
        return 'bg-destructive text-destructive-foreground';
      case 'half_day':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'absent':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Attendance</h1>
        </div>
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Check if user is a manager
  const isManager = user?.role === UserRole.DEPARTMENT_MANAGER || user?.role === UserRole.HR_MANAGER || user?.role === UserRole.SUPER_ADMIN;

  return (
    <div className="space-y-6">
      {/* Manager View */}
      {isManager && (
        <>
          <ManagerAttendanceView managerId={user?.employeeId || ''} />
          <hr className="my-8" />
        </>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Attendance</h1>
        <AttendanceMarker
          employeeId={user?.employeeId || ''}
          employeePhotoUrl={employeePhotoUrl}
          currentStatus={currentStatus}
          onSuccess={loadAttendanceData}
        />
      </div>
      {error && (
        <div className="flex gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Today's Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center gap-2">
                {getStatusIcon(currentStatus?.status)}
                <Badge className={getStatusColor(currentStatus?.status)}>
                  {currentStatus?.status === 'present'
                    ? 'Present'
                    : currentStatus?.status === 'absent'
                      ? 'Absent'
                      : currentStatus?.status === 'half_day'
                        ? 'Half Day'
                        : 'Not Marked'}
                </Badge>
              </div>
            </div>

            {/* Check-in Time */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Check-in Time</p>
              <p className="text-lg font-semibold">
                {formatTime((currentStatus as any)?.check_in_time ?? (currentStatus as any)?.checkInTime)}
              </p>
            </div>

            {/* Check-out Time */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Check-out Time</p>
              <p className="text-lg font-semibold">
                {formatTime((currentStatus as any)?.check_out_time ?? (currentStatus as any)?.checkOutTime)}
              </p>
            </div>

            {/* Working Hours */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Working Hours</p>
              <p className="text-lg font-semibold">
                {(() => {
                  const wh = (currentStatus as any)?.working_hours ?? (currentStatus as any)?.workingHours;
                  return wh != null ? `${Number(wh).toFixed(1)}h` : '-';
                })()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Present Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.present_days}</div>
              <p className="text-xs text-muted-foreground mt-1">
                out of {stats.total_days} working days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.absent_days}</div>
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
              <div className="text-2xl font-bold text-warning">{stats.late_arrivals}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg: {Number(stats.average_working_hours).toFixed(1)}h/day
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      {isManager ? (
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="regularization">Regularization</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <AttendanceHistory employeeId={user?.employeeId || ''} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <AttendanceReports employeeId={user?.employeeId || ''} />
          </TabsContent>

          <TabsContent value="regularization">
            <RegularizationRequest employeeId={user?.employeeId || ''} onSuccess={loadAttendanceData} />
          </TabsContent>
        </Tabs>
      ) : (
        <AttendanceHistory employeeId={user?.employeeId || ''} />
      )}
    </div>
  );
};
