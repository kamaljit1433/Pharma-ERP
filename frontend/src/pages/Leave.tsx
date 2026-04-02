import React, { useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLeaveStore } from '../store/leaveStore';
import { MainLayout } from '../components/layout/MainLayout';
import { LeaveBalance } from '../components/leave/LeaveBalance';
import { LeaveRequestForm } from '../components/leave/LeaveRequestForm';
import { LeaveHistory } from '../components/leave/LeaveHistory';
import { LeaveCalendarComponent } from '../components/leave/LeaveCalendarComponent';
import { LeaveApprovalPanel } from '../components/leave/LeaveApprovalPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useToast } from '../hooks/useToast';
import { CalendarDays, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const Leave: React.FC = () => {
  const { user } = useAuth();
  const { error, clearError, leaves, leaveBalances, loadingBalances, fetchLeaveBalance } = useLeaveStore();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        type: 'error',
        message: error,
      });
      clearError();
    }
  }, [error, toast, clearError]);

  // Fetch leave balance on mount
  useEffect(() => {
    if (user?.employeeId) {
      fetchLeaveBalance(user.employeeId, new Date().getFullYear());
    }
  }, [user?.employeeId, fetchLeaveBalance]);

  if (!user) {
    return null;
  }

  const isManager = ['department_manager', 'hr_manager', 'super_admin'].includes(user.role);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const totalAvailable = leaveBalances.reduce((sum, b) => sum + b.available_balance, 0);
    const totalUsed = leaveBalances.reduce((sum, b) => sum + b.used_balance, 0);
    const totalCarryForward = leaveBalances.reduce((sum, b) => sum + b.carry_forward_balance, 0);
    const pendingCount = leaves.filter((l) => l.status === 'pending').length;
    const approvedCount = leaves.filter((l) => l.status === 'approved').length;

    return {
      totalAvailable,
      totalUsed,
      totalCarryForward,
      pendingCount,
      approvedCount,
    };
  }, [leaveBalances, leaves]);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your leave requests and view leave balance
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Available Balance Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <CalendarDays className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAvailable.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Days available this year</p>
            </CardContent>
          </Card>

          {/* Used Balance Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Used Balance</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsed.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Days used this year</p>
            </CardContent>
          </Card>

          {/* Carry Forward Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carry Forward</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCarryForward.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Days carried forward</p>
            </CardContent>
          </Card>

          {/* Pending Requests Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="balance" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
            <TabsTrigger value="balance">Leave Balance</TabsTrigger>
            <TabsTrigger value="request">Request Leave</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            {isManager && <TabsTrigger value="approvals">Approvals</TabsTrigger>}
          </TabsList>

          {/* Leave Balance Tab */}
          <TabsContent value="balance" className="space-y-4">
            {loadingBalances ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Loading leave balance...</p>
                </CardContent>
              </Card>
            ) : (
              <LeaveBalance employeeId={user.employeeId} />
            )}
          </TabsContent>

          {/* Request Leave Tab */}
          <TabsContent value="request" className="space-y-4">
            <LeaveRequestForm employeeId={user.employeeId} />
          </TabsContent>

          {/* Leave History Tab */}
          <TabsContent value="history" className="space-y-4">
            <LeaveHistory leaves={leaves} />
          </TabsContent>

          {/* Leave Calendar Tab */}
          <TabsContent value="calendar" className="space-y-4">
            <LeaveCalendarComponent employeeId={user.employeeId} />
          </TabsContent>

          {/* Leave Approvals Tab (Manager Only) */}
          {isManager && (
            <TabsContent value="approvals" className="space-y-4">
              <LeaveApprovalPanel />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Leave;
