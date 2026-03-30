import { Knex } from 'knex';
import {
  ReportFilter,
  ReportData,
  EmployeeReportRow,
  AttendanceReportRow,
  LeaveReportRow,
  PayrollReportRow,
  PerformanceReportRow,
  TrainingReportRow,
} from '../types/dashboard';

export class ReportService {
  constructor(private knex: Knex) {}

  async generateEmployeeReport(filter: ReportFilter, userId: string): Promise<ReportData> {
    let query = this.knex('employees')
      .select(
        'employees.id as employeeId',
        'employees.first_name as firstName',
        'employees.last_name as lastName',
        'employees.email',
        'employees.phone',
        'departments.name as department',
        'designations.name as designation',
        'employees.status',
        'employees.join_date as joinDate',
        'employees.date_of_birth as dateOfBirth',
        'employees.gender',
        'employees.address'
      )
      .leftJoin('hierarchy_nodes', 'employees.id', 'hierarchy_nodes.employee_id')
      .leftJoin('departments', 'hierarchy_nodes.department_id', 'departments.id')
      .leftJoin('designations', 'hierarchy_nodes.designation_id', 'designations.id');

    if (filter.departmentId) {
      query = query.where('hierarchy_nodes.department_id', filter.departmentId);
    }

    if (filter.designationId) {
      query = query.where('hierarchy_nodes.designation_id', filter.designationId);
    }

    if (filter.status) {
      query = query.where('employees.status', filter.status);
    }

    if (filter.startDate) {
      query = query.where('employees.join_date', '>=', filter.startDate);
    }

    if (filter.endDate) {
      query = query.where('employees.join_date', '<=', filter.endDate);
    }

    const limit = filter.limit || 1000;
    const offset = filter.offset || 0;

    const totalResult = await query.clone().count('* as count').first();
    const totalRows = totalResult?.count || 0;

    const rows = await query
      .orderBy('employees.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      type: 'employee',
      rows: rows as EmployeeReportRow[],
      totalRows,
      generatedAt: new Date(),
      generatedBy: userId,
    };
  }

  async generateAttendanceReport(filter: ReportFilter, userId: string): Promise<ReportData> {
    let query = this.knex('attendance')
      .select(
        'employees.id as employeeId',
        this.knex.raw("CONCAT(employees.first_name, ' ', employees.last_name) as employeeName"),
        'attendance.attendance_date as date',
        'attendance.check_in_time as checkInTime',
        'attendance.check_out_time as checkOutTime',
        'attendance.working_hours as workingHours',
        'attendance.status',
        'attendance.remarks'
      )
      .join('employees', 'attendance.employee_id', 'employees.id');

    if (filter.employeeId) {
      query = query.where('employees.id', filter.employeeId);
    }

    if (filter.departmentId) {
      query = query
        .join('hierarchy_nodes', 'employees.id', 'hierarchy_nodes.employee_id')
        .where('hierarchy_nodes.department_id', filter.departmentId);
    }

    if (filter.startDate) {
      query = query.where('attendance.attendance_date', '>=', filter.startDate);
    }

    if (filter.endDate) {
      query = query.where('attendance.attendance_date', '<=', filter.endDate);
    }

    const limit = filter.limit || 10000;
    const offset = filter.offset || 0;

    const totalResult = await query.clone().count('* as count').first();
    const totalRows = totalResult?.count || 0;

    const rows = await query
      .orderBy('attendance.attendance_date', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      type: 'attendance',
      rows: rows as AttendanceReportRow[],
      totalRows,
      generatedAt: new Date(),
      generatedBy: userId,
    };
  }

  async generateLeaveReport(filter: ReportFilter, userId: string): Promise<ReportData> {
    let query = this.knex('leaves')
      .select(
        'employees.id as employeeId',
        this.knex.raw("CONCAT(employees.first_name, ' ', employees.last_name) as employeeName"),
        'leave_types.name as leaveType',
        'leaves.start_date as startDate',
        'leaves.end_date as endDate',
        this.knex.raw('DATEDIFF(leaves.end_date, leaves.start_date) + 1 as numberOfDays'),
        'leaves.status',
        this.knex.raw("CONCAT(approvers.first_name, ' ', approvers.last_name) as approvedBy"),
        'leaves.created_at as appliedOn'
      )
      .join('employees', 'leaves.employee_id', 'employees.id')
      .join('leave_types', 'leaves.leave_type_id', 'leave_types.id')
      .leftJoin('employees as approvers', 'leaves.approved_by', 'approvers.id');

    if (filter.employeeId) {
      query = query.where('employees.id', filter.employeeId);
    }

    if (filter.departmentId) {
      query = query
        .join('hierarchy_nodes', 'employees.id', 'hierarchy_nodes.employee_id')
        .where('hierarchy_nodes.department_id', filter.departmentId);
    }

    if (filter.status) {
      query = query.where('leaves.status', filter.status);
    }

    if (filter.startDate) {
      query = query.where('leaves.start_date', '>=', filter.startDate);
    }

    if (filter.endDate) {
      query = query.where('leaves.end_date', '<=', filter.endDate);
    }

    const limit = filter.limit || 10000;
    const offset = filter.offset || 0;

    const totalResult = await query.clone().count('* as count').first();
    const totalRows = totalResult?.count || 0;

    const rows = await query
      .orderBy('leaves.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      type: 'leave',
      rows: rows as LeaveReportRow[],
      totalRows,
      generatedAt: new Date(),
      generatedBy: userId,
    };
  }

  async generatePayrollReport(filter: ReportFilter, userId: string): Promise<ReportData> {
    let query = this.knex('payroll')
      .select(
        'employees.id as employeeId',
        this.knex.raw("CONCAT(employees.first_name, ' ', employees.last_name) as employeeName"),
        'payroll.month',
        'payroll.year',
        'payroll.base_salary as baseSalary',
        'payroll.total_allowances as allowances',
        'payroll.total_deductions as deductions',
        'payroll.net_salary as netSalary',
        'payroll.status',
        'payroll.processed_at as processedOn'
      )
      .join('employees', 'payroll.employee_id', 'employees.id');

    if (filter.employeeId) {
      query = query.where('employees.id', filter.employeeId);
    }

    if (filter.departmentId) {
      query = query
        .join('hierarchy_nodes', 'employees.id', 'hierarchy_nodes.employee_id')
        .where('hierarchy_nodes.department_id', filter.departmentId);
    }

    if (filter.status) {
      query = query.where('payroll.status', filter.status);
    }

    if (filter.startDate) {
      query = query.where('payroll.created_at', '>=', filter.startDate);
    }

    if (filter.endDate) {
      query = query.where('payroll.created_at', '<=', filter.endDate);
    }

    const limit = filter.limit || 10000;
    const offset = filter.offset || 0;

    const totalResult = await query.clone().count('* as count').first();
    const totalRows = totalResult?.count || 0;

    const rows = await query
      .orderBy('payroll.year', 'desc')
      .orderBy('payroll.month', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      type: 'payroll',
      rows: rows as PayrollReportRow[],
      totalRows,
      generatedAt: new Date(),
      generatedBy: userId,
    };
  }

  async generatePerformanceReport(filter: ReportFilter, userId: string): Promise<ReportData> {
    let query = this.knex('performance_reviews')
      .select(
        'employees.id as employeeId',
        this.knex.raw("CONCAT(employees.first_name, ' ', employees.last_name) as employeeName"),
        'review_cycles.name as reviewCycle',
        'performance_reviews.self_rating as selfRating',
        'performance_reviews.manager_rating as managerRating',
        'performance_reviews.final_rating as finalRating',
        'performance_reviews.status',
        'performance_reviews.reviewed_at as reviewedOn'
      )
      .join('employees', 'performance_reviews.employee_id', 'employees.id')
      .join('review_cycles', 'performance_reviews.review_cycle_id', 'review_cycles.id');

    if (filter.employeeId) {
      query = query.where('employees.id', filter.employeeId);
    }

    if (filter.departmentId) {
      query = query
        .join('hierarchy_nodes', 'employees.id', 'hierarchy_nodes.employee_id')
        .where('hierarchy_nodes.department_id', filter.departmentId);
    }

    if (filter.status) {
      query = query.where('performance_reviews.status', filter.status);
    }

    if (filter.startDate) {
      query = query.where('performance_reviews.created_at', '>=', filter.startDate);
    }

    if (filter.endDate) {
      query = query.where('performance_reviews.created_at', '<=', filter.endDate);
    }

    const limit = filter.limit || 10000;
    const offset = filter.offset || 0;

    const totalResult = await query.clone().count('* as count').first();
    const totalRows = totalResult?.count || 0;

    const rows = await query
      .orderBy('performance_reviews.created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      type: 'performance',
      rows: rows as PerformanceReportRow[],
      totalRows,
      generatedAt: new Date(),
      generatedBy: userId,
    };
  }

  async generateTrainingReport(filter: ReportFilter, userId: string): Promise<ReportData> {
    let query = this.knex('training_enrollments')
      .select(
        'employees.id as employeeId',
        this.knex.raw("CONCAT(employees.first_name, ' ', employees.last_name) as employeeName"),
        'training_programs.name as trainingProgram',
        'training_enrollments.enrollment_date as enrollmentDate',
        'training_enrollments.completion_date as completionDate',
        'training_enrollments.status',
        'training_enrollments.certificate_issued as certificateIssued'
      )
      .join('employees', 'training_enrollments.employee_id', 'employees.id')
      .join('training_programs', 'training_enrollments.training_program_id', 'training_programs.id');

    if (filter.employeeId) {
      query = query.where('employees.id', filter.employeeId);
    }

    if (filter.departmentId) {
      query = query
        .join('hierarchy_nodes', 'employees.id', 'hierarchy_nodes.employee_id')
        .where('hierarchy_nodes.department_id', filter.departmentId);
    }

    if (filter.status) {
      query = query.where('training_enrollments.status', filter.status);
    }

    if (filter.startDate) {
      query = query.where('training_enrollments.enrollment_date', '>=', filter.startDate);
    }

    if (filter.endDate) {
      query = query.where('training_enrollments.enrollment_date', '<=', filter.endDate);
    }

    const limit = filter.limit || 10000;
    const offset = filter.offset || 0;

    const totalResult = await query.clone().count('* as count').first();
    const totalRows = totalResult?.count || 0;

    const rows = await query
      .orderBy('training_enrollments.enrollment_date', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      type: 'training',
      rows: rows as TrainingReportRow[],
      totalRows,
      generatedAt: new Date(),
      generatedBy: userId,
    };
  }

  exportToCSV(reportData: ReportData): string {
    if (reportData.rows.length === 0) {
      return '';
    }

    const headers = Object.keys(reportData.rows[0]);
    const csvHeaders = headers.join(',');

    const csvRows = reportData.rows.map((row: any) => {
      return headers
        .map((header) => {
          const value = row[header];
          if (value === null || value === undefined) {
            return '';
          }
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        })
        .join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  }

  exportToJSON(reportData: ReportData): string {
    return JSON.stringify(reportData, null, 2);
  }
}
