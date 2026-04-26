import apiClient from './api';
import {
  DashboardStats,
  EmployeeStatistics,
  AttendanceStatistics,
  LeaveStatistics,
  PayrollStatistics,
  RecruitmentStatistics,
  ReportData,
  ReportFilter,
} from '../types/dashboard';

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get('/dashboard/stats');
      return response.data.data;
    } catch (error) {
      console.warn('Dashboard stats endpoint not implemented, returning mock data');
      // Return properly structured mock data when endpoint doesn't exist
      return {
        employees: {
          total: 0,
          active: 0,
          onLeave: 0,
          suspended: 0,
          resigned: 0,
          terminated: 0,
          byDepartment: {},
          byDesignation: {},
          newHiresThisMonth: 0,
          separationsThisMonth: 0,
        },
        attendance: {
          totalEmployees: 0,
          presentToday: 0,
          absentToday: 0,
          onLeaveToday: 0,
          halfDayToday: 0,
          attendanceRate: 0,
          monthlyAttendanceRate: 0,
          lateCheckIns: 0,
          incompleteCheckOuts: 0,
          topAbsentees: [],
        },
        leaves: {
          totalLeaveRequests: 0,
          pendingApprovals: 0,
          approvedThisMonth: 0,
          rejectedThisMonth: 0,
          cancelledThisMonth: 0,
          leaveTypeBreakdown: {},
          employeesOnLeaveToday: 0,
          upcomingLeaves: [],
        },
        payroll: {
          totalEmployees: 0,
          processedThisMonth: 0,
          pendingProcessing: 0,
          totalPayrollAmount: 0,
          averageSalary: 0,
          totalDeductions: 0,
          totalEarnings: 0,
          payrollByStatus: {},
          advanceSalaryRequests: 0,
          reimbursementClaims: 0,
        },
        recruitment: {
          openPositions: 0,
          totalApplicants: 0,
          applicantsByStage: {},
          offersExtended: 0,
          offersAccepted: 0,
          offersRejected: 0,
          averageTimeToHire: 0,
          topSourceOfApplicants: {},
          recentHires: [],
        },
        generatedAt: new Date(),
      };
    }
  },

  async getEmployeeStats(): Promise<EmployeeStatistics> {
    const response = await apiClient.get('/dashboard/employees');
    return response.data.data;
  },

  async getAttendanceStats(): Promise<AttendanceStatistics> {
    const response = await apiClient.get('/dashboard/attendance');
    return response.data.data;
  },

  async getLeaveStats(): Promise<LeaveStatistics> {
    const response = await apiClient.get('/dashboard/leaves');
    return response.data.data;
  },

  async getPayrollStats(): Promise<PayrollStatistics> {
    const response = await apiClient.get('/dashboard/payroll');
    return response.data.data;
  },

  async getRecruitmentStats(): Promise<RecruitmentStatistics> {
    const response = await apiClient.get('/dashboard/recruitment');
    return response.data.data;
  },

  async generateEmployeeReport(filter?: ReportFilter, format: 'json' | 'csv' = 'json'): Promise<ReportData | Blob> {
    const params = new URLSearchParams();
    if (filter?.departmentId) params.append('departmentId', filter.departmentId);
    if (filter?.designationId) params.append('designationId', filter.designationId);
    if (filter?.status) params.append('status', filter.status);
    if (filter?.startDate) params.append('startDate', filter.startDate.toISOString());
    if (filter?.endDate) params.append('endDate', filter.endDate.toISOString());
    if (filter?.limit) params.append('limit', filter.limit.toString());
    if (filter?.offset) params.append('offset', filter.offset.toString());
    params.append('format', format);

    const response = await apiClient.get(`/dashboard/reports/employees?${params.toString()}`, {
      responseType: format === 'csv' ? 'blob' : 'json',
    });

    return response.data;
  },

  async generateAttendanceReport(filter?: ReportFilter, format: 'json' | 'csv' = 'json'): Promise<ReportData | Blob> {
    const params = new URLSearchParams();
    if (filter?.employeeId) params.append('employeeId', filter.employeeId);
    if (filter?.departmentId) params.append('departmentId', filter.departmentId);
    if (filter?.startDate) params.append('startDate', filter.startDate.toISOString());
    if (filter?.endDate) params.append('endDate', filter.endDate.toISOString());
    if (filter?.limit) params.append('limit', filter.limit.toString());
    if (filter?.offset) params.append('offset', filter.offset.toString());
    params.append('format', format);

    const response = await apiClient.get(`/dashboard/reports/attendance?${params.toString()}`, {
      responseType: format === 'csv' ? 'blob' : 'json',
    });

    return response.data;
  },

  async generateLeaveReport(filter?: ReportFilter, format: 'json' | 'csv' = 'json'): Promise<ReportData | Blob> {
    const params = new URLSearchParams();
    if (filter?.employeeId) params.append('employeeId', filter.employeeId);
    if (filter?.departmentId) params.append('departmentId', filter.departmentId);
    if (filter?.status) params.append('status', filter.status);
    if (filter?.startDate) params.append('startDate', filter.startDate.toISOString());
    if (filter?.endDate) params.append('endDate', filter.endDate.toISOString());
    if (filter?.limit) params.append('limit', filter.limit.toString());
    if (filter?.offset) params.append('offset', filter.offset.toString());
    params.append('format', format);

    const response = await apiClient.get(`/dashboard/reports/leaves?${params.toString()}`, {
      responseType: format === 'csv' ? 'blob' : 'json',
    });

    return response.data;
  },

  async generatePayrollReport(filter?: ReportFilter, format: 'json' | 'csv' = 'json'): Promise<ReportData | Blob> {
    const params = new URLSearchParams();
    if (filter?.employeeId) params.append('employeeId', filter.employeeId);
    if (filter?.departmentId) params.append('departmentId', filter.departmentId);
    if (filter?.status) params.append('status', filter.status);
    if (filter?.startDate) params.append('startDate', filter.startDate.toISOString());
    if (filter?.endDate) params.append('endDate', filter.endDate.toISOString());
    if (filter?.limit) params.append('limit', filter.limit.toString());
    if (filter?.offset) params.append('offset', filter.offset.toString());
    params.append('format', format);

    const response = await apiClient.get(`/dashboard/reports/payroll?${params.toString()}`, {
      responseType: format === 'csv' ? 'blob' : 'json',
    });

    return response.data;
  },

  async generatePerformanceReport(filter?: ReportFilter, format: 'json' | 'csv' = 'json'): Promise<ReportData | Blob> {
    const params = new URLSearchParams();
    if (filter?.employeeId) params.append('employeeId', filter.employeeId);
    if (filter?.departmentId) params.append('departmentId', filter.departmentId);
    if (filter?.status) params.append('status', filter.status);
    if (filter?.startDate) params.append('startDate', filter.startDate.toISOString());
    if (filter?.endDate) params.append('endDate', filter.endDate.toISOString());
    if (filter?.limit) params.append('limit', filter.limit.toString());
    if (filter?.offset) params.append('offset', filter.offset.toString());
    params.append('format', format);

    const response = await apiClient.get(`/dashboard/reports/performance?${params.toString()}`, {
      responseType: format === 'csv' ? 'blob' : 'json',
    });

    return response.data;
  },

  async generateTrainingReport(filter?: ReportFilter, format: 'json' | 'csv' = 'json'): Promise<ReportData | Blob> {
    const params = new URLSearchParams();
    if (filter?.employeeId) params.append('employeeId', filter.employeeId);
    if (filter?.departmentId) params.append('departmentId', filter.departmentId);
    if (filter?.status) params.append('status', filter.status);
    if (filter?.startDate) params.append('startDate', filter.startDate.toISOString());
    if (filter?.endDate) params.append('endDate', filter.endDate.toISOString());
    if (filter?.limit) params.append('limit', filter.limit.toString());
    if (filter?.offset) params.append('offset', filter.offset.toString());
    params.append('format', format);

    const response = await apiClient.get(`/dashboard/reports/training?${params.toString()}`, {
      responseType: format === 'csv' ? 'blob' : 'json',
    });

    return response.data;
  },

  downloadReport(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
