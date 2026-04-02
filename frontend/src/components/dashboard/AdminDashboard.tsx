import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Loader2, Users, Calendar, Wallet, UserPlus, RefreshCw, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../store/dashboardStore';
import { useDashboardRefresh } from '../../hooks/useDashboardRefresh';
import { useNotificationStore } from '../../store/notificationStore';
import EmployeeStatsCard from './EmployeeStatsCard';
import AttendanceStatsCard from './AttendanceStatsCard';
import LeaveStatsCard from './LeaveStatsCard';
import PayrollStatsCard from './PayrollStatsCard';
import RecruitmentStatsCard from './RecruitmentStatsCard';
import RecentNotifications from './RecentNotifications';

export default function AdminDashboard() {
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
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Real-time overview of your organization
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
          onClick={() => navigate('/employees/new')}
          aria-label="Add new employee"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/leave')}
          aria-label="Approve pending leave requests"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Approve Leaves
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/payroll')}
          aria-label="Process payroll"
        >
          <Wallet className="h-4 w-4 mr-2" />
          Process Payroll
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/recruitment')}
          aria-label="View recruitment dashboard"
        >
          <Users className="h-4 w-4 mr-2" />
          View Recruitment
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/settings')}
          aria-label="System settings"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.employees.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.employees.active} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <Badge className="bg-success">Today</Badge>
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
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <Badge className="bg-warning">Pending</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leaves.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payroll Pending</CardTitle>
            <Badge className="bg-warning">Pending</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.payroll.pendingProcessing}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recruitment.openPositions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.recruitment.totalApplicants} applicants
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <RecentNotifications notifications={notifications.slice(0, 5)} />
      )}

      {/* Detailed Stats Tabs */}
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <EmployeeStatsCard stats={stats.employees} />
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <AttendanceStatsCard stats={stats.attendance} />
        </TabsContent>

        <TabsContent value="leaves" className="space-y-4">
          <LeaveStatsCard stats={stats.leaves} />
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <PayrollStatsCard stats={stats.payroll} />
        </TabsContent>

        <TabsContent value="recruitment" className="space-y-4">
          <RecruitmentStatsCard stats={stats.recruitment} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
