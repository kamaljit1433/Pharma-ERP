import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import attendanceService, { AttendanceRecord } from '@/services/attendanceService';
import { useToast } from '@/hooks/useToast';

interface EmployeeAttendanceTabProps {
  employeeId: string;
}

export const EmployeeAttendanceTab: React.FC<EmployeeAttendanceTabProps> = ({ employeeId }) => {
  const { toast } = useToast();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const data = await attendanceService.getRecords({
          employee_id: employeeId,
          limit: 10,
        });
        setRecords(data);
      } catch (error) {
        toast({
          type: 'error',
          message: 'Failed to load attendance records',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [employeeId, toast]);

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
        {records.length === 0 ? (
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
                        ({record.working_hours.toFixed(1)} hrs)
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
