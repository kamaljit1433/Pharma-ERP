import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { LeaveStatistics } from '../../types/dashboard';
import { CalendarDays, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface LeaveStatsCardProps {
  stats: LeaveStatistics;
}

export default function LeaveStatsCard({ stats }: LeaveStatsCardProps) {
  return (
    <div className="space-y-4">
      {/* Leave Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeaveRequests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedThisMonth}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave Today</CardTitle>
            <Badge className="bg-info">On Leave</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.employeesOnLeaveToday}</div>
          </CardContent>
        </Card>
      </div>

      {/* This Month's Activity */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{stats.approvedThisMonth}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{stats.rejectedThisMonth}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-muted-foreground">{stats.cancelledThisMonth}</div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Type Breakdown */}
      {Object.keys(stats.leaveTypeBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Leave Type Breakdown</CardTitle>
            <CardDescription>Distribution across leave types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.leaveTypeBreakdown).map(([leaveType, data]) => (
                <div key={leaveType} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{leaveType}</span>
                    <span className="text-sm text-muted-foreground">{data.total} total</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="flex-1 bg-muted rounded h-2">
                      <div
                        className="bg-success h-2 rounded"
                        style={{ width: `${(data.approved / data.total) * 100}%` }}
                        title={`Approved: ${data.approved}`}
                      />
                    </div>
                    <div className="flex-1 bg-muted rounded h-2">
                      <div
                        className="bg-warning h-2 rounded"
                        style={{ width: `${(data.pending / data.total) * 100}%` }}
                        title={`Pending: ${data.pending}`}
                      />
                    </div>
                    <div className="flex-1 bg-muted rounded h-2">
                      <div
                        className="bg-destructive h-2 rounded"
                        style={{ width: `${(data.rejected / data.total) * 100}%` }}
                        title={`Rejected: ${data.rejected}`}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>✓ {data.approved}</span>
                    <span>⏳ {data.pending}</span>
                    <span>✗ {data.rejected}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Leaves */}
      {stats.upcomingLeaves.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Approved Leaves</CardTitle>
            <CardDescription>Next 10 approved leave requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.upcomingLeaves.map((leave) => (
                <div key={`${leave.employeeId}-${leave.startDate}`} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{leave.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{leave.leaveType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {leave.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
