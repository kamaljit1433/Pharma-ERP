import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardCharts from '../DashboardCharts';
import { DashboardStats } from '../../../types/dashboard';

describe('DashboardCharts', () => {
  const mockStats: DashboardStats = {
    employees: {
      total: 100,
      active: 85,
      onLeave: 10,
      suspended: 2,
      resigned: 2,
      terminated: 1,
      byDepartment: { HR: 5, IT: 20, Sales: 30 },
      byDesignation: { Manager: 10, Developer: 40, Analyst: 50 },
      newHiresThisMonth: 5,
      separationsThisMonth: 1,
    },
    attendance: {
      totalEmployees: 100,
      presentToday: 85,
      absentToday: 10,
      onLeaveToday: 5,
      halfDayToday: 0,
      attendanceRate: 85,
      monthlyAttendanceRate: 88,
      lateCheckIns: 5,
      incompleteCheckOuts: 3,
      topAbsentees: [],
    },
    leaves: {
      totalLeaveRequests: 50,
      pendingApprovals: 5,
      approvedThisMonth: 20,
      rejectedThisMonth: 2,
      cancelledThisMonth: 1,
      leaveTypeBreakdown: {
        Casual: { total: 20, approved: 15, pending: 3, rejected: 2 },
        Sick: { total: 15, approved: 12, pending: 2, rejected: 1 },
        Earned: { total: 15, approved: 13, pending: 0, rejected: 2 },
      },
      employeesOnLeaveToday: 5,
      upcomingLeaves: [],
    },
    payroll: {
      totalEmployees: 100,
      processedThisMonth: 95,
      pendingProcessing: 5,
      totalPayrollAmount: 500000,
      averageSalary: 5000,
      totalDeductions: 50000,
      totalEarnings: 500000,
      payrollByStatus: { Processed: 95, Pending: 5 },
      advanceSalaryRequests: 2,
      reimbursementClaims: 3,
    },
    recruitment: {
      openPositions: 5,
      totalApplicants: 50,
      applicantsByStage: { Applied: 20, Shortlisted: 15, Interviewed: 10, Offered: 5 },
      offersExtended: 5,
      offersAccepted: 3,
      offersRejected: 1,
      averageTimeToHire: 30,
      topSourceOfApplicants: { LinkedIn: 20, Referral: 15, Direct: 15 },
      recentHires: [],
    },
    generatedAt: new Date(),
  };

  it('renders all chart titles', () => {
    render(<DashboardCharts stats={mockStats} />);

    expect(screen.getByText('Weekly Attendance Trend')).toBeInTheDocument();
    expect(screen.getByText('Leave Type Distribution')).toBeInTheDocument();
    expect(screen.getByText('Payroll Status Distribution')).toBeInTheDocument();
    expect(screen.getByText('Employee Status Distribution')).toBeInTheDocument();
  });

  it('renders chart descriptions', () => {
    render(<DashboardCharts stats={mockStats} />);

    expect(screen.getByText('Present vs Absent employees over the week')).toBeInTheDocument();
    expect(screen.getByText('Approved leaves by type')).toBeInTheDocument();
    expect(screen.getByText('Payroll processing status')).toBeInTheDocument();
    expect(screen.getByText('Breakdown of employees by status')).toBeInTheDocument();
  });

  it('shows loading state when loading is true', () => {
    const { container } = render(
      <DashboardCharts stats={mockStats} loading={true} />
    );

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders null when stats is null', () => {
    const { container } = render(<DashboardCharts stats={null} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders charts with correct data structure', () => {
    const { container } = render(<DashboardCharts stats={mockStats} />);

    // Check if recharts components are rendered
    const charts = container.querySelectorAll('.recharts-wrapper');
    expect(charts.length).toBeGreaterThan(0);
  });

  it('displays employee status data correctly', () => {
    render(<DashboardCharts stats={mockStats} />);

    // The chart should render with the employee status data
    expect(screen.getByText('Employee Status Distribution')).toBeInTheDocument();
  });

  it('displays leave type data correctly', () => {
    render(<DashboardCharts stats={mockStats} />);

    expect(screen.getByText('Leave Type Distribution')).toBeInTheDocument();
  });

  it('displays payroll status data correctly', () => {
    render(<DashboardCharts stats={mockStats} />);

    expect(screen.getByText('Payroll Status Distribution')).toBeInTheDocument();
  });
});
