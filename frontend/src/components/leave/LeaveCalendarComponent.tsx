import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useLeaveStore } from '../../store/leaveStore';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '../ui/button';

interface LeaveCalendarComponentProps {
  employeeId: string;
}

const LEAVE_TYPE_COLORS: Record<string, string> = {
  'Casual Leave': 'bg-blue-100 text-blue-800 border-blue-300',
  'Sick Leave': 'bg-red-100 text-red-800 border-red-300',
  'Earned Leave': 'bg-green-100 text-green-800 border-green-300',
  'Maternity Leave': 'bg-pink-100 text-pink-800 border-pink-300',
  'Paternity Leave': 'bg-purple-100 text-purple-800 border-purple-300',
  'Unpaid Leave': 'bg-gray-100 text-gray-800 border-gray-300',
};

export const LeaveCalendarComponent: React.FC<LeaveCalendarComponentProps> = ({
  employeeId,
}) => {
  const { leaves, leaveTypes, fetchLeaveBalance } = useLeaveStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<(number | null)[]>([]);
  const [leavesByDate, setLeavesByDate] = useState<Record<string, any[]>>({});

  // Fetch leave data on mount
  useEffect(() => {
    fetchLeaveBalance(employeeId, currentDate.getFullYear());
  }, [employeeId, currentDate, fetchLeaveBalance]);

  // Build calendar and map leaves to dates
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Create calendar array
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    setCalendarDays(days);

    // Map approved leaves to dates
    const leaveMap: Record<string, any[]> = {};
    leaves
      .filter((leave) => leave.status === 'approved')
      .forEach((leave) => {
        const from = new Date(leave.from_date);
        const to = new Date(leave.to_date);

        for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          if (!leaveMap[dateStr]) {
            leaveMap[dateStr] = [];
          }
          leaveMap[dateStr].push(leave);
        }
      });

    setLeavesByDate(leaveMap);
  }, [currentDate, leaves]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getLeaveTypeColor = (leaveTypeId: string): string => {
    const leaveType = leaveTypes.find((lt) => lt.id === leaveTypeId);
    return LEAVE_TYPE_COLORS[leaveType?.name || 'Unpaid Leave'] || 'bg-gray-100 text-gray-800';
  };

  const getDateLeaves = (day: number): any[] => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    )
      .toISOString()
      .split('T')[0];
    return leavesByDate[dateStr] || [];
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Leave Calendar
        </CardTitle>
        <CardDescription>View your approved leaves on the calendar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">{monthName}</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-2">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-semibold text-sm text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dateLeaves = day ? getDateLeaves(day) : [];
              const isToday =
                day &&
                new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString() ===
                new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`min-h-20 p-1 border rounded-md ${
                    day ? 'bg-background' : 'bg-muted'
                  } ${isToday ? 'border-primary border-2' : 'border-border'}`}
                >
                  {day && (
                    <div className="space-y-1">
                      <div className={`text-sm font-semibold ${isToday ? 'text-primary' : ''}`}>
                        {day}
                      </div>
                      <div className="space-y-0.5">
                        {dateLeaves.slice(0, 2).map((leave) => {
                          const leaveType = leaveTypes.find((lt) => lt.id === leave.leave_type_id);
                          return (
                            <Badge
                              key={leave.id}
                              variant="outline"
                              className={`text-xs w-full justify-center ${getLeaveTypeColor(
                                leave.leave_type_id
                              )}`}
                              title={leaveType?.name}
                            >
                              {leaveType?.code || 'Leave'}
                            </Badge>
                          );
                        })}
                        {dateLeaves.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{dateLeaves.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="pt-4 border-t space-y-2">
          <p className="text-sm font-semibold">Leave Types:</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(LEAVE_TYPE_COLORS).map(([name, color]) => (
              <div key={name} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${color.split(' ')[0]}`} />
                <span className="text-xs">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
