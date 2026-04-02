import React from 'react';
import { DashboardStats } from '../../types/dashboard';
import { LineChart, BarChart, PieChart } from '../charts';
import { LineChartDataPoint, BarChartDataPoint, PieChartDataPoint } from '../charts';

interface DashboardChartsProps {
  stats: DashboardStats | null;
  loading?: boolean;
}

export default function DashboardCharts({ stats, loading = false }: DashboardChartsProps) {
  if (!stats) {
    return null;
  }

  // Prepare data for attendance trend chart (mock data - would come from API)
  const attendanceTrendData: LineChartDataPoint[] = [
    { name: 'Mon', present: 85, absent: 15 },
    { name: 'Tue', present: 88, absent: 12 },
    { name: 'Wed', present: 82, absent: 18 },
    { name: 'Thu', present: 90, absent: 10 },
    { name: 'Fri', present: 87, absent: 13 },
  ];

  // Prepare data for leave type distribution
  const leaveTypeData: PieChartDataPoint[] = Object.entries(stats.leaves.leaveTypeBreakdown).map(
    ([type, data]) => ({
      name: type,
      value: data.approved,
    })
  );

  // Prepare data for employee status distribution
  const employeeStatusData: BarChartDataPoint[] = [
    { name: 'Active', count: stats.employees.active },
    { name: 'On Leave', count: stats.employees.onLeave },
    { name: 'Suspended', count: stats.employees.suspended },
    { name: 'Resigned', count: stats.employees.resigned },
    { name: 'Terminated', count: stats.employees.terminated },
  ];

  // Prepare data for payroll status
  const payrollStatusData: PieChartDataPoint[] = Object.entries(stats.payroll.payrollByStatus).map(
    ([status, count]) => ({
      name: status,
      value: count,
    })
  );

  return (
    <div className="space-y-6">
      {/* Attendance Trend */}
      <LineChart
        title="Weekly Attendance Trend"
        description="Present vs Absent employees over the week"
        data={attendanceTrendData}
        lines={[
          { dataKey: 'present', stroke: '#10b981', name: 'Present' },
          { dataKey: 'absent', stroke: '#ef4444', name: 'Absent' },
        ]}
        loading={loading}
        empty={attendanceTrendData.length === 0}
        height={300}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Leave Type Distribution */}
        <PieChart
          title="Leave Type Distribution"
          description="Approved leaves by type"
          data={leaveTypeData}
          loading={loading}
          empty={leaveTypeData.length === 0}
          emptyMessage="No leave data available"
          height={300}
        />

        {/* Payroll Status */}
        <PieChart
          title="Payroll Status Distribution"
          description="Payroll processing status"
          data={payrollStatusData}
          loading={loading}
          empty={payrollStatusData.length === 0}
          emptyMessage="No payroll data available"
          height={300}
        />
      </div>

      {/* Employee Status Distribution */}
      <BarChart
        title="Employee Status Distribution"
        description="Breakdown of employees by status"
        data={employeeStatusData}
        bars={[
          { dataKey: 'count', fill: '#3b82f6', name: 'Count' },
        ]}
        loading={loading}
        empty={employeeStatusData.length === 0}
        height={300}
      />
    </div>
  );
}
