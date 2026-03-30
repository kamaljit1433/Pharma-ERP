// Dashboard Statistics Types

export interface EmployeeStatistics {
  total: number;
  active: number;
  onLeave: number;
  suspended: number;
  resigned: number;
  terminated: number;
  byDepartment: Record<string, number>;
  byDesignation: Record<string, number>;
  newHiresThisMonth: number;
  separationsThisMonth: number;
}

export interface AttendanceStatistics {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
  halfDayToday: number;
  attendanceRate: number; // percentage
  monthlyAttendanceRate: number; // percentage
  lateCheckIns: number;
  incompleteCheckOuts: number;
  topAbsentees: Array<{
    employeeId: string;
    employeeName: string;
    absenceCount: number;
  }>;
}

export interface LeaveStatistics {
  totalLeaveRequests: number;
  pendingApprovals: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  cancelledThisMonth: number;
  leaveTypeBreakdown: Record<string, {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  }>;
  employeesOnLeaveToday: number;
  upcomingLeaves: Array<{
    employeeId: string;
    employeeName: string;
    leaveType: string;
    startDate: Date;
    endDate: Date;
    status: string;
  }>;
}

export interface PayrollStatistics {
  totalEmployees: number;
  processedThisMonth: number;
  pendingProcessing: number;
  totalPayrollAmount: number;
  averageSalary: number;
  totalDeductions: number;
  totalEarnings: number;
  payrollByStatus: Record<string, number>;
  advanceSalaryRequests: number;
  reimbursementClaims: number;
}

export interface RecruitmentStatistics {
  openPositions: number;
  totalApplicants: number;
  applicantsByStage: Record<string, number>;
  offersExtended: number;
  offersAccepted: number;
  offersRejected: number;
  averageTimeToHire: number; // in days
  topSourceOfApplicants: Record<string, number>;
  recentHires: Array<{
    employeeId: string;
    employeeName: string;
    designation: string;
    joinDate: Date;
  }>;
}

export interface DashboardStats {
  employees: EmployeeStatistics;
  attendance: AttendanceStatistics;
  leaves: LeaveStatistics;
  payroll: PayrollStatistics;
  recruitment: RecruitmentStatistics;
  generatedAt: Date;
}

export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  departmentId?: string;
  designationId?: string;
  employeeId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface EmployeeReportRow {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  status: string;
  joinDate: Date;
  dateOfBirth: Date;
  gender: string;
  address: string;
}

export interface AttendanceReportRow {
  employeeId: string;
  employeeName: string;
  date: Date;
  checkInTime: string | null;
  checkOutTime: string | null;
  workingHours: number;
  status: string;
  remarks: string | null;
}

export interface LeaveReportRow {
  employeeId: string;
  employeeName: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  numberOfDays: number;
  status: string;
  approvedBy: string | null;
  appliedOn: Date;
}

export interface PayrollReportRow {
  employeeId: string;
  employeeName: string;
  month: number;
  year: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: string;
  processedOn: Date | null;
}

export interface PerformanceReportRow {
  employeeId: string;
  employeeName: string;
  reviewCycle: string;
  selfRating: number | null;
  managerRating: number | null;
  finalRating: number | null;
  status: string;
  reviewedOn: Date | null;
}

export interface TrainingReportRow {
  employeeId: string;
  employeeName: string;
  trainingProgram: string;
  enrollmentDate: Date;
  completionDate: Date | null;
  status: string;
  certificateIssued: boolean;
}

export interface ReportData {
  type: 'employee' | 'attendance' | 'leave' | 'payroll' | 'performance' | 'training';
  rows: Array<
    EmployeeReportRow |
    AttendanceReportRow |
    LeaveReportRow |
    PayrollReportRow |
    PerformanceReportRow |
    TrainingReportRow
  >;
  totalRows: number;
  generatedAt: Date;
  generatedBy: string;
}
