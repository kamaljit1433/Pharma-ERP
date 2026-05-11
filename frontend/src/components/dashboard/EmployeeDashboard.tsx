import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Loader2, Calendar, Clock, CheckCircle2, XCircle, CalendarDays, Bell, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import attendanceService from '../../services/attendanceService';
import { leaveService } from '../../services/leaveService';
import RecentNotifications from './RecentNotifications';

interface PersonalStats {
  attendance: {
    status: 'checked_in' | 'checked_out' | 'absent' | 'on_leave';
    checkInTime?: string;
    checkOutTime?: string;
    workingHours: number;
    presentDaysThisMonth: number;
    absentDaysThisMonth: number;
    attendanceRate: number;
  };
  leave: {
    balances: Array<{
      leaveType: string;
      available: number;
      used: number;
      total: number;
    }>;
    pendingRequests: number;
    upcomingLeaves: Array<{
      leaveType: string;
      startDate: string;
      endDate: string;
      status: string;
    }>;
  };
  upcomingEvents: Array<{
    title: string;
    date: string;
    type: 'holiday' | 'birthday' | 'anniversary' | 'meeting';
  }>;
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { notifications } = useNotificationStore();
  const [stats, setStats] = useState<PersonalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isFetching = React.useRef(false);
  const employeeId = user?.employeeId;

  const fetchPersonalStats = React.useCallback(async () => {
    if (!employeeId || isFetching.current) {
      console.log('[Dashboard] Skipping fetch - already fetching or no user');
      return;
    }
    
    console.log('[Dashboard] Starting fetch');
    isFetching.current = true;
    try {
      setLoading(true);
      
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // Fetch data with error handling for each endpoint
      let attendanceStatus = null;
      let attendanceStats = { present_days: 0, absent_days: 0, total_days: 0 };
      let leaveBalances: any[] = [];
      let leaveTypes: any[] = [];
      
      try {
        attendanceStatus = await attendanceService.getCurrentStatus(employeeId);
      } catch (err) {
        console.warn('Failed to fetch attendance status:', err);
      }
      
      try {
        attendanceStats = await attendanceService.getStats(
          employeeId,
          firstDayOfMonth.toISOString().split('T')[0],
          today.toISOString().split('T')[0]
        );
      } catch (err) {
        console.warn('Failed to fetch attendance stats:', err);
      }
      
      try {
        leaveBalances = await leaveService.getLeaveBalance(employeeId, today.getFullYear());
      } catch (err) {
        console.warn('Failed to fetch leave balances:', err);
      }
      
      try {
        leaveTypes = await leaveService.getLeaveTypes();
      } catch (err) {
        console.warn('Failed to fetch leave types:', err);
      }
      
      const leaveTypeMap = new Map(leaveTypes.map(lt => [lt.id, lt.name]));

      // Mock data for pending requests and upcoming leaves
      // In a real implementation, these would come from the backend
      const mockPendingRequests = 0;
      const mockUpcomingLeaves: Array<{
        leaveType: string;
        startDate: string;
        endDate: string;
        status: string;
      }> = [];

      setStats({
        attendance: {
          status: attendanceStatus?.status || 'absent',
          checkInTime: attendanceStatus?.check_in_time,
          checkOutTime: attendanceStatus?.check_out_time,
          workingHours: attendanceStatus?.working_hours || 0,
          presentDaysThisMonth: attendanceStats.present_days,
          absentDaysThisMonth: attendanceStats.absent_days,
          attendanceRate: (attendanceStats.present_days / attendanceStats.total_days) * 100,
        },
        leave: {
          balances: leaveBalances.map((lb) => ({
            leaveType: leaveTypeMap.get(lb.leave_type_id) || 'Unknown',
            available: lb.available_balance,
            used: lb.used_balance,
            total: lb.opening_balance + lb.carry_forward_balance,
          })),
          pendingRequests: mockPendingRequests,
          upcomingLeaves: mockUpcomingLeaves,
        },
        upcomingEvents: [
          // Mock data - would come from backend
          { title: 'Company Holiday', date: '2026-04-15', type: 'holiday' },
          { title: 'Team Meeting', date: '2026-04-10', type: 'meeting' },
        ],
      });
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [employeeId]);

  const handleManualRefresh = () => {
    fetchPersonalStats();
  };

  useEffect(() => {
    console.log('[Dashboard] Effect running');
    fetchPersonalStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchPersonalStats, 5 * 60 * 1000);
    return () => {
      console.log('[Dashboard] Cleanup');
      clearInterval(interval);
    };
  }, [fetchPersonalStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const getAttendanceStatusBadge = () => {
    switch (stats.attendance.status) {
      case 'checked_in':
        return <Badge className="bg-success">Checked In</Badge>;
      case 'checked_out':
        return <Badge className="bg-info">Checked Out</Badge>;
      case 'on_leave':
        return <Badge className="bg-warning">On Leave</Badge>;
      case 'absent':
        return <Badge className="bg-destructive">Absent</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.employeeId}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's your personal dashboard
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getAttendanceStatusBadge()}
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={loading}
            aria-label="Refresh dashboard"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="default" 
          size="sm"
          onClick={() => navigate('/attendance')}
        >
          <Clock className="h-4 w-4 mr-2" />
          Mark Attendance
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/leave')}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Request Leave
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/payroll')}
        >
          <CalendarDays className="h-4 w-4 mr-2" />
          View Payslips
        </Button>
      </div>

      {/* Today's Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
          <CardDescription>Your attendance status for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Check-In Time</p>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <p className="text-2xl font-bold">
                  {stats.attendance.checkInTime || '--:--'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Check-Out Time</p>
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-muted-foreground" />
                <p className="text-2xl font-bold">
                  {stats.attendance.checkOutTime || '--:--'}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Working Hours</p>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <p className="text-2xl font-bold">
                  {Number(stats.attendance.workingHours).toFixed(1)}h
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Attendance Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Days</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendance.presentDaysThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendance.absentDaysThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Badge variant="outline">{stats.attendance.attendanceRate.toFixed(1)}%</Badge>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-success h-2 rounded-full"
                style={{ width: `${stats.attendance.attendanceRate}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leave Balance */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Balance</CardTitle>
          <CardDescription>Your available leave balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.leave.balances.map((balance) => (
              <div key={balance.leaveType} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{balance.leaveType}</span>
                  <span className="text-sm text-muted-foreground">
                    {balance.available} / {balance.total} available
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(balance.available / balance.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Leaves & Events */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Leaves</CardTitle>
            <CardDescription>Your approved upcoming leaves</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.leave.upcomingLeaves.length > 0 ? (
              <div className="space-y-3">
                {stats.leave.upcomingLeaves.map((leave, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{leave.leaveType}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-success">{leave.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming leaves</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Company events and holidays</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {stats.upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">{event.type}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Actions */}
      {stats.leave.pendingRequests > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-warning" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              You have <span className="font-bold">{stats.leave.pendingRequests}</span> pending leave request(s) awaiting approval.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <RecentNotifications notifications={notifications.slice(0, 5)} />
      )}
    </div>
  );
}
