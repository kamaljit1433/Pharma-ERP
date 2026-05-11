import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle, Calendar, Clock } from 'lucide-react';
import attendanceService, { AttendanceRecord } from '@/services/attendanceService';

interface EmployeeAttendanceTabProps {
  employeeId: string;
}

export const EmployeeAttendanceTab: React.FC<EmployeeAttendanceTabProps> = ({ employeeId }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!employeeId) {
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await attendanceService.getRecords(
          { employee_id: employeeId, limit: 10 },
          controller.signal
        );
        if (!controller.signal.aborted) {
          setRecords(Array.isArray(data) ? data : (data as any).data || []);
        }
      } catch (err: any) {
        if (!controller.signal.aborted) {
          setError(err?.message || 'Failed to load attendance records');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchAttendance();

    return () => {
      controller.abort();
    };
  }, [employeeId]);

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
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Attendance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Attendance
        </CardTitle>
        <CardDescription>Last 10 attendance records</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : records.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No attendance records found</p>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">
                    {new Date(record.date).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    {record.check_in_time && (
                      <>
                        <Clock className="h-4 w-4" />
                        <span>
                          {record.check_in_time}
                          {record.check_out_time && ` - ${record.check_out_time}`}
                        </span>
                      </>
                    )}
                    {record.working_hours && (
                      <span className="ml-2">
                        ({Number(record.working_hours).toFixed(1)} hrs)
                      </span>
                    )}
                  </div>
                </div>
                <Badge className={getStatusColor(record.status)}>
                  {record.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
