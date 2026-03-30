import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useLeaveStore } from '../../store/leaveStore';
import { CalendarDays } from 'lucide-react';

export const TeamLeaveCalendar: React.FC = () => {
  const { teamCalendar, loadingTeamCalendar, fetchTeamLeaveCalendar } = useLeaveStore();

  useEffect(() => {
    fetchTeamLeaveCalendar();
  }, [fetchTeamLeaveCalendar]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-orange-500">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-emerald-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-rose-500">Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loadingTeamCalendar) {
    return <div className="text-sm text-muted-foreground">Loading team calendar...</div>;
  }

  // Group by employee
  const groupedByEmployee = teamCalendar.reduce(
    (acc, entry) => {
      if (!acc[entry.employee_name]) {
        acc[entry.employee_name] = [];
      }
      acc[entry.employee_name].push(entry);
      return acc;
    },
    {} as Record<string, typeof teamCalendar>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Team Leave Calendar
        </CardTitle>
        <CardDescription>Leave requests from your team members</CardDescription>
      </CardHeader>
      <CardContent>
        {teamCalendar.length === 0 ? (
          <p className="text-sm text-muted-foreground">No team leave requests</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByEmployee).map(([employeeName, leaves]) => (
              <div key={employeeName} className="border-l-4 border-muted pl-4">
                <h3 className="font-semibold mb-3">{employeeName}</h3>
                <div className="space-y-2">
                  {leaves.map((leave, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-muted rounded"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{leave.leave_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(leave.from_date).toLocaleDateString()} -{' '}
                          {new Date(leave.to_date).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(leave.status)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
