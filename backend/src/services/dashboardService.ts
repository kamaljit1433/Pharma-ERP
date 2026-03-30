import { Knex } from 'knex';
import {
  DashboardStats,
  EmployeeStatistics,
  AttendanceStatistics,
  LeaveStatistics,
  PayrollStatistics,
  RecruitmentStatistics,
} from '../types/dashboard';

export class DashboardService {
  constructor(private knex: Knex) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const [employees, attendance, leaves, payroll, recruitment] = await Promise.all([
      this.getEmployeeStatistics(),
      this.getAttendanceStatistics(),
      this.getLeaveStatistics(),
      this.getPayrollStatistics(),
      this.getRecruitmentStatistics(),
    ]);

    return {
      employees,
      attendance,
      leaves,
      payroll,
      recruitment,
      generatedAt: new Date(),
    };
  }

  private async getEmployeeStatistics(): Promise<EmployeeStatistics> {
    const totalResult = await this.knex('employees').count('* as count').first();
    const total = totalResult?.count || 0;

    const statusCounts = await this.knex('employees')
      .select('status')
      .count('* as count')
      .groupBy('status');

    const statusMap: Record<string, number> = {};
    statusCounts.forEach((row: any) => {
      statusMap[row.status] = row.count;
    });

    const departmentCounts = await this.knex('employees')
      .join('hierarchy_nodes', 'employees.id', 'hierarchy_nodes.employee_id')
      .select('hierarchy_nodes.department_id')
      .count('* as count')
      .groupBy('hierarchy_nodes.department_id');

    const byDepartment: Record<string, number> = {};
    departmentCounts.forEach((row: any) => {
      byDepartment[row.department_id] = row.count;
    });

    const designationCounts = await this.knex('employees')
      .join('hierarchy_nodes', 'employees.id', 'hierarchy_nodes.employee_id')
      .select('hierarchy_nodes.designation_id')
      .count('* as count')
      .groupBy('hierarchy_nodes.designation_id');

    const byDesignation: Record<string, number> = {};
    designationCounts.forEach((row: any) => {
      byDesignation[row.designation_id] = row.count;
    });

    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const newHiresResult = await this.knex('employees')
      .count('* as count')
      .where('join_date', '>=', monthStart)
      .where('join_date', '<=', monthEnd)
      .first();
    const newHiresThisMonth = newHiresResult?.count || 0;

    const separationsResult = await this.knex('resignations')
      .count('* as count')
      .where('created_at', '>=', monthStart)
      .where('created_at', '<=', monthEnd)
      .first();
    const separationsThisMonth = separationsResult?.count || 0;

    return {
      total,
      active: statusMap['active'] || 0,
      onLeave: statusMap['on_leave'] || 0,
      suspended: statusMap['suspended'] || 0,
      resigned: statusMap['resigned'] || 0,
      terminated: statusMap['terminated'] || 0,
      byDepartment,
      byDesignation,
      newHiresThisMonth,
      separationsThisMonth,
    };
  }

  private async getAttendanceStatistics(): Promise<AttendanceStatistics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalEmployeesResult = await this.knex('employees')
      .where('status', 'active')
      .count('* as count')
      .first();
    const totalEmployees = totalEmployeesResult?.count || 0;

    const todayAttendance = await this.knex('attendance')
      .select('status')
      .count('* as count')
      .where('attendance_date', '>=', today)
      .where('attendance_date', '<', tomorrow)
      .groupBy('status');

    const attendanceMap: Record<string, number> = {};
    todayAttendance.forEach((row: any) => {
      attendanceMap[row.status] = row.count;
    });

    const presentToday = attendanceMap['present'] || 0;
    const absentToday = attendanceMap['absent'] || 0;
    const onLeaveToday = attendanceMap['on_leave'] || 0;
    const halfDayToday = attendanceMap['half_day'] || 0;

    const attendanceRate = totalEmployees > 0 ? (presentToday / totalEmployees) * 100 : 0;

    // Monthly attendance rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyAttendanceResult = await this.knex('attendance')
      .where('status', 'present')
      .where('attendance_date', '>=', thirtyDaysAgo)
      .count('* as count')
      .first();
    const monthlyPresent = monthlyAttendanceResult?.count || 0;

    const totalMonthlyRecords = await this.knex('attendance')
      .where('attendance_date', '>=', thirtyDaysAgo)
      .count('* as count')
      .first();
    const monthlyTotal = totalMonthlyRecords?.count || 0;

    const monthlyAttendanceRate = monthlyTotal > 0 ? (monthlyPresent / monthlyTotal) * 100 : 0;

    const lateCheckInsResult = await this.knex('attendance')
      .where('attendance_date', '>=', today)
      .where('attendance_date', '<', tomorrow)
      .where('check_in_time', '>', '09:00:00')
      .count('* as count')
      .first();
    const lateCheckIns = lateCheckInsResult?.count || 0;

    const incompleteCheckOutsResult = await this.knex('attendance')
      .where('attendance_date', '>=', today)
      .where('attendance_date', '<', tomorrow)
      .whereNull('check_out_time')
      .count('* as count')
      .first();
    const incompleteCheckOuts = incompleteCheckOutsResult?.count || 0;

    const topAbsentees = await this.knex('attendance')
      .join('employees', 'attendance.employee_id', 'employees.id')
      .select('employees.id as employeeId', 'employees.first_name', 'employees.last_name')
      .count('* as absenceCount')
      .where('attendance.status', 'absent')
      .where('attendance.attendance_date', '>=', thirtyDaysAgo)
      .groupBy('employees.id', 'employees.first_name', 'employees.last_name')
      .orderBy('absenceCount', 'desc')
      .limit(5);

    return {
      totalEmployees,
      presentToday,
      absentToday,
      onLeaveToday,
      halfDayToday,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      monthlyAttendanceRate: Math.round(monthlyAttendanceRate * 100) / 100,
      lateCheckIns,
      incompleteCheckOuts,
      topAbsentees: topAbsentees.map((row: any) => ({
        employeeId: row.employeeId,
        employeeName: `${row.first_name} ${row.last_name}`,
        absenceCount: row.absenceCount,
      })),
    };
  }

  private async getLeaveStatistics(): Promise<LeaveStatistics> {
    const totalLeaveRequestsResult = await this.knex('leaves')
      .count('* as count')
      .first();
    const totalLeaveRequests = totalLeaveRequestsResult?.count || 0;

    const pendingApprovalsResult = await this.knex('leaves')
      .where('status', 'pending')
      .count('* as count')
      .first();
    const pendingApprovals = pendingApprovalsResult?.count || 0;

    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const approvedThisMonthResult = await this.knex('leaves')
      .where('status', 'approved')
      .where('created_at', '>=', monthStart)
      .where('created_at', '<=', monthEnd)
      .count('* as count')
      .first();
    const approvedThisMonth = approvedThisMonthResult?.count || 0;

    const rejectedThisMonthResult = await this.knex('leaves')
      .where('status', 'rejected')
      .where('created_at', '>=', monthStart)
      .where('created_at', '<=', monthEnd)
      .count('* as count')
      .first();
    const rejectedThisMonth = rejectedThisMonthResult?.count || 0;

    const cancelledThisMonthResult = await this.knex('leaves')
      .where('status', 'cancelled')
      .where('created_at', '>=', monthStart)
      .where('created_at', '<=', monthEnd)
      .count('* as count')
      .first();
    const cancelledThisMonth = cancelledThisMonthResult?.count || 0;

    const leaveTypeStats = await this.knex('leaves')
      .join('leave_types', 'leaves.leave_type_id', 'leave_types.id')
      .select('leave_types.name')
      .count('* as total')
      .sum(this.knex.raw('CASE WHEN leaves.status = ? THEN 1 ELSE 0 END as approved', ['approved']))
      .sum(this.knex.raw('CASE WHEN leaves.status = ? THEN 1 ELSE 0 END as pending', ['pending']))
      .sum(this.knex.raw('CASE WHEN leaves.status = ? THEN 1 ELSE 0 END as rejected', ['rejected']))
      .groupBy('leave_types.name');

    const leaveTypeBreakdown: Record<string, any> = {};
    leaveTypeStats.forEach((row: any) => {
      leaveTypeBreakdown[row.name] = {
        total: row.total || 0,
        approved: row.approved || 0,
        pending: row.pending || 0,
        rejected: row.rejected || 0,
      };
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const employeesOnLeaveTodayResult = await this.knex('leaves')
      .where('status', 'approved')
      .where('start_date', '<=', today)
      .where('end_date', '>=', today)
      .count('* as count')
      .first();
    const employeesOnLeaveToday = employeesOnLeaveTodayResult?.count || 0;

    const upcomingLeaves = await this.knex('leaves')
      .join('employees', 'leaves.employee_id', 'employees.id')
      .join('leave_types', 'leaves.leave_type_id', 'leave_types.id')
      .select(
        'employees.id as employeeId',
        'employees.first_name',
        'employees.last_name',
        'leave_types.name as leaveType',
        'leaves.start_date as startDate',
        'leaves.end_date as endDate',
        'leaves.status'
      )
      .where('leaves.status', 'approved')
      .where('leaves.start_date', '>=', today)
      .orderBy('leaves.start_date', 'asc')
      .limit(10);

    return {
      totalLeaveRequests,
      pendingApprovals,
      approvedThisMonth,
      rejectedThisMonth,
      cancelledThisMonth,
      leaveTypeBreakdown,
      employeesOnLeaveToday,
      upcomingLeaves: upcomingLeaves.map((row: any) => ({
        employeeId: row.employeeId,
        employeeName: `${row.first_name} ${row.last_name}`,
        leaveType: row.leaveType,
        startDate: row.startDate,
        endDate: row.endDate,
        status: row.status,
      })),
    };
  }

  private async getPayrollStatistics(): Promise<PayrollStatistics> {
    const totalEmployeesResult = await this.knex('employees')
      .where('status', 'active')
      .count('* as count')
      .first();
    const totalEmployees = totalEmployeesResult?.count || 0;

    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const processedThisMonthResult = await this.knex('payroll')
      .where('status', 'paid')
      .where('created_at', '>=', monthStart)
      .where('created_at', '<=', monthEnd)
      .count('* as count')
      .first();
    const processedThisMonth = processedThisMonthResult?.count || 0;

    const pendingProcessingResult = await this.knex('payroll')
      .where('status', 'draft')
      .count('* as count')
      .first();
    const pendingProcessing = pendingProcessingResult?.count || 0;

    const payrollAmountResult = await this.knex('payroll')
      .where('status', 'paid')
      .where('created_at', '>=', monthStart)
      .where('created_at', '<=', monthEnd)
      .sum('net_salary as total')
      .first();
    const totalPayrollAmount = payrollAmountResult?.total || 0;

    const averageSalaryResult = await this.knex('payroll')
      .where('status', 'paid')
      .where('created_at', '>=', monthStart)
      .where('created_at', '<=', monthEnd)
      .avg('net_salary as average')
      .first();
    const averageSalary = averageSalaryResult?.average || 0;

    const deductionsResult = await this.knex('payroll')
      .where('status', 'paid')
      .where('created_at', '>=', monthStart)
      .where('created_at', '<=', monthEnd)
      .sum('total_deductions as total')
      .first();
    const totalDeductions = deductionsResult?.total || 0;

    const earningsResult = await this.knex('payroll')
      .where('status', 'paid')
      .where('created_at', '>=', monthStart)
      .where('created_at', '<=', monthEnd)
      .sum('total_earnings as total')
      .first();
    const totalEarnings = earningsResult?.total || 0;

    const payrollByStatus = await this.knex('payroll')
      .select('status')
      .count('* as count')
      .groupBy('status');

    const statusMap: Record<string, number> = {};
    payrollByStatus.forEach((row: any) => {
      statusMap[row.status] = row.count;
    });

    const advanceSalaryRequestsResult = await this.knex('advance_salary_requests')
      .where('status', 'pending')
      .count('* as count')
      .first();
    const advanceSalaryRequests = advanceSalaryRequestsResult?.count || 0;

    const reimbursementClaimsResult = await this.knex('reimbursement_claims')
      .where('status', 'pending')
      .count('* as count')
      .first();
    const reimbursementClaims = reimbursementClaimsResult?.count || 0;

    return {
      totalEmployees,
      processedThisMonth,
      pendingProcessing,
      totalPayrollAmount: Math.round(totalPayrollAmount * 100) / 100,
      averageSalary: Math.round(averageSalary * 100) / 100,
      totalDeductions: Math.round(totalDeductions * 100) / 100,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      payrollByStatus: statusMap,
      advanceSalaryRequests,
      reimbursementClaims,
    };
  }

  private async getRecruitmentStatistics(): Promise<RecruitmentStatistics> {
    const openPositionsResult = await this.knex('job_postings')
      .where('status', 'open')
      .count('* as count')
      .first();
    const openPositions = openPositionsResult?.count || 0;

    const totalApplicantsResult = await this.knex('applicants')
      .count('* as count')
      .first();
    const totalApplicants = totalApplicantsResult?.count || 0;

    const applicantsByStage = await this.knex('applicants')
      .select('stage')
      .count('* as count')
      .groupBy('stage');

    const stageMap: Record<string, number> = {};
    applicantsByStage.forEach((row: any) => {
      stageMap[row.stage] = row.count;
    });

    const offersExtendedResult = await this.knex('applicants')
      .where('stage', 'offer')
      .count('* as count')
      .first();
    const offersExtended = offersExtendedResult?.count || 0;

    const offersAcceptedResult = await this.knex('applicants')
      .where('stage', 'hired')
      .count('* as count')
      .first();
    const offersAccepted = offersAcceptedResult?.count || 0;

    const offersRejectedResult = await this.knex('applicants')
      .where('stage', 'rejected')
      .count('* as count')
      .first();
    const offersRejected = offersRejectedResult?.count || 0;

    // Average time to hire (in days)
    const timeToHireResult = await this.knex('applicants')
      .where('stage', 'hired')
      .select(this.knex.raw('AVG(EXTRACT(DAY FROM (updated_at - created_at))) as avg_days'))
      .first();
    const averageTimeToHire = Math.round(timeToHireResult?.avg_days || 0);

    const topSourceResult = await this.knex('applicants')
      .select('source')
      .count('* as count')
      .groupBy('source')
      .orderBy('count', 'desc')
      .limit(5);

    const topSourceOfApplicants: Record<string, number> = {};
    topSourceResult.forEach((row: any) => {
      topSourceOfApplicants[row.source] = row.count;
    });

    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

    const recentHires = await this.knex('employees')
      .select(
        'employees.id as employeeId',
        'employees.first_name',
        'employees.last_name',
        'designations.name as designation',
        'employees.join_date as joinDate'
      )
      .join('hierarchy_nodes', 'employees.id', 'hierarchy_nodes.employee_id')
      .join('designations', 'hierarchy_nodes.designation_id', 'designations.id')
      .where('employees.join_date', '>=', monthStart)
      .orderBy('employees.join_date', 'desc')
      .limit(10);

    return {
      openPositions,
      totalApplicants,
      applicantsByStage: stageMap,
      offersExtended,
      offersAccepted,
      offersRejected,
      averageTimeToHire,
      topSourceOfApplicants,
      recentHires: recentHires.map((row: any) => ({
        employeeId: row.employeeId,
        employeeName: `${row.first_name} ${row.last_name}`,
        designation: row.designation,
        joinDate: row.joinDate,
      })),
    };
  }
}
