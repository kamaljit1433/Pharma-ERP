import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Loader2, Users, CheckCircle2, Calendar, TrendingUp, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../store/dashboardStore';
import { useDashboardRefresh } from '../../hooks/useDashboardRefresh';
import { useNotificationStore } from '../../store/notificationStore';
import AttendanceStatsCard from './AttendanceStatsCard';
import LeaveStatsCard from './LeaveStatsCard';
import RecentNotifications from './RecentNotifications';

export default function DepartmentManagerDashboard() {
  const navigate = useNavigate();
  const { stats, loading, error } = useDashboardStore();
  const { fetchStats } = useDashboardRefresh();
  const { notifications } = useNotificationStore();

  const handleManualRefresh = () => {
    fetchStats();
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Department Manager Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Team attendance and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Last updated: {stats?.generatedAt ? new Date(stats.generatedAt).toLocaleTimeString() : 'Never'}
          </Badge>
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
          <CheckCircle2 className="h-4 w-4 mr-2" />
          View Team Attendance
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/leave')}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Approve Leaves
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/performance')}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Performance Reviews
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/hierarchy')}
        >
          <Users className="h-4 w-4 mr-2" />
          Team Overview
        </Button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.employees.active}</div>
            <p className="text-xs text-muted-foreground">
              Active employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendance.presentToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.attendance.attendanceRate.toFixed(1)}% attendance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave Today</CardTitle>
            <Calendar className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendance.onLeaveToday}</div>
            <p className="text-xs text-muted-foreground">
              Team members on leave
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Badge className="bg-warning">Pending</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leaves.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Leave requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
            <CardDescription>Team attendance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-sm font-medium">Present</span>
                </div>
                <span className="text-sm font-bold">{stats.attendance.presentToday}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-sm font-medium">Absent</span>
                </div>
                <span className="text-sm font-bold">{stats.attendance.absentToday}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-info" />
                  <span className="text-sm font-medium">On Leave</span>
                </div>
                <span className="text-sm font-bold">{stats.attendance.onLeaveToday}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <span className="text-sm font-medium">Half Day</span>
                </div>
                <span className="text-sm font-bold">{stats.attendance.halfDayToday || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Rate</CardTitle>
            <CardDescription>Monthly average</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Today</span>
                  <span className="text-2xl font-bold">{stats.attendance.attendanceRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-success h-2 rounded-full"
                    style={{ width: `${stats.attendance.attendanceRate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">This Month</span>
                  <span className="text-2xl font-bold">{stats.attendance.monthlyAttendanceRate?.toFixed(1) || '0'}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${stats.attendance.monthlyAttendanceRate || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <RecentNotifications notifications={notifications.slice(0, 5)} />
      )}

      {/* Detailed Stats Tabs */}
      <Tabs defaultValue="attendance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leaves">Leave Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          <AttendanceStatsCard stats={stats.attendance} />
        </TabsContent>

        <TabsContent value="leaves" className="space-y-4">
          <LeaveStatsCard stats={stats.leaves} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
