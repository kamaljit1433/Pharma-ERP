/**
 * Role-Based Access Control (RBAC) Type Definitions
 * Defines roles, permissions, and access control structures
 */

export enum Role {
  SUPER_ADMIN = 'super_admin',
  HR_MANAGER = 'hr_manager',
  DEPARTMENT_MANAGER = 'department_manager',
  FINANCE_PAYROLL = 'finance_payroll',
  EMPLOYEE = 'employee',
  IT_ADMIN = 'it_admin'
}

export enum Permission {
  // Employee Management
  CREATE_EMPLOYEE = 'create_employee',
  READ_EMPLOYEE = 'read_employee',
  UPDATE_EMPLOYEE = 'update_employee',
  DELETE_EMPLOYEE = 'delete_employee',
  VIEW_EMPLOYEE_BANK_DETAILS = 'view_employee_bank_details',
  VERIFY_BANK_DETAILS = 'verify_bank_details',

  // Attendance
  CREATE_ATTENDANCE = 'create_attendance',
  READ_ATTENDANCE = 'read_attendance',
  UPDATE_ATTENDANCE = 'update_attendance',
  APPROVE_REGULARIZATION = 'approve_regularization',

  // Leave Management
  CREATE_LEAVE = 'create_leave',
  READ_LEAVE = 'read_leave',
  APPROVE_LEAVE = 'approve_leave',
  REJECT_LEAVE = 'reject_leave',
  MANAGE_LEAVE_TYPES = 'manage_leave_types',

  // Payroll
  CONFIGURE_SALARY = 'configure_salary',
  PROCESS_PAYROLL = 'process_payroll',
  VIEW_PAYROLL = 'view_payroll',
  LOCK_PAYROLL = 'lock_payroll',
  EXPORT_PAYROLL = 'export_payroll',

  // Recruitment
  CREATE_JOB_POSTING = 'create_job_posting',
  MANAGE_APPLICANTS = 'manage_applicants',
  SCHEDULE_INTERVIEWS = 'schedule_interviews',
  GENERATE_OFFER_LETTER = 'generate_offer_letter',

  // Benefits
  MANAGE_INSURANCE = 'manage_insurance',
  APPROVE_REIMBURSEMENT = 'approve_reimbursement',
  MANAGE_REWARDS = 'manage_rewards',

  // Performance
  CREATE_GOALS = 'create_goals',
  SUBMIT_REVIEW = 'submit_review',
  MANAGE_PERFORMANCE = 'manage_performance',

  // Training
  MANAGE_TRAINING = 'manage_training',
  ENROLL_TRAINING = 'enroll_training',

  // Separation
  INITIATE_SEPARATION = 'initiate_separation',
  PROCESS_SEPARATION = 'process_separation',

  // Hierarchy
  MANAGE_HIERARCHY = 'manage_hierarchy',
  VIEW_ORG_CHART = 'view_org_chart',

  // Audit & Security
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  MANAGE_SECURITY = 'manage_security',
  MANAGE_USERS = 'manage_users',

  // Documents & e-Signature
  UPLOAD_DOCUMENT = 'upload_document',
  MANAGE_DOCUMENTS = 'manage_documents',
  SIGN_DOCUMENT = 'sign_document',

  // Notifications
  MANAGE_NOTIFICATIONS = 'manage_notifications',

  // Geo Tracking
  VIEW_GEO_LOGS = 'view_geo_logs',
  APPROVE_TRAVEL = 'approve_travel',

  // Dashboard & Reports
  VIEW_DASHBOARD = 'view_dashboard',
  GENERATE_REPORTS = 'generate_reports'
}

/**
 * Role-Permission Matrix
 * Defines which permissions each role has
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: [
    // All permissions
    Permission.CREATE_EMPLOYEE,
    Permission.READ_EMPLOYEE,
    Permission.UPDATE_EMPLOYEE,
    Permission.DELETE_EMPLOYEE,
    Permission.VIEW_EMPLOYEE_BANK_DETAILS,
    Permission.VERIFY_BANK_DETAILS,
    Permission.CREATE_ATTENDANCE,
    Permission.READ_ATTENDANCE,
    Permission.UPDATE_ATTENDANCE,
    Permission.APPROVE_REGULARIZATION,
    Permission.CREATE_LEAVE,
    Permission.READ_LEAVE,
    Permission.APPROVE_LEAVE,
    Permission.REJECT_LEAVE,
    Permission.MANAGE_LEAVE_TYPES,
    Permission.CONFIGURE_SALARY,
    Permission.PROCESS_PAYROLL,
    Permission.VIEW_PAYROLL,
    Permission.LOCK_PAYROLL,
    Permission.EXPORT_PAYROLL,
    Permission.CREATE_JOB_POSTING,
    Permission.MANAGE_APPLICANTS,
    Permission.SCHEDULE_INTERVIEWS,
    Permission.GENERATE_OFFER_LETTER,
    Permission.MANAGE_INSURANCE,
    Permission.APPROVE_REIMBURSEMENT,
    Permission.MANAGE_REWARDS,
    Permission.CREATE_GOALS,
    Permission.SUBMIT_REVIEW,
    Permission.MANAGE_PERFORMANCE,
    Permission.MANAGE_TRAINING,
    Permission.ENROLL_TRAINING,
    Permission.INITIATE_SEPARATION,
    Permission.PROCESS_SEPARATION,
    Permission.MANAGE_HIERARCHY,
    Permission.VIEW_ORG_CHART,
    Permission.VIEW_AUDIT_LOGS,
    Permission.MANAGE_SECURITY,
    Permission.MANAGE_USERS,
    Permission.UPLOAD_DOCUMENT,
    Permission.MANAGE_DOCUMENTS,
    Permission.SIGN_DOCUMENT,
    Permission.MANAGE_NOTIFICATIONS,
    Permission.VIEW_GEO_LOGS,
    Permission.APPROVE_TRAVEL,
    Permission.VIEW_DASHBOARD,
    Permission.GENERATE_REPORTS
  ],

  [Role.HR_MANAGER]: [
    Permission.CREATE_EMPLOYEE,
    Permission.READ_EMPLOYEE,
    Permission.UPDATE_EMPLOYEE,
    Permission.VIEW_EMPLOYEE_BANK_DETAILS,
    Permission.READ_ATTENDANCE,
    Permission.CREATE_LEAVE,
    Permission.READ_LEAVE,
    Permission.APPROVE_LEAVE,
    Permission.REJECT_LEAVE,
    Permission.MANAGE_LEAVE_TYPES,
    Permission.VIEW_PAYROLL,
    Permission.CREATE_JOB_POSTING,
    Permission.MANAGE_APPLICANTS,
    Permission.SCHEDULE_INTERVIEWS,
    Permission.GENERATE_OFFER_LETTER,
    Permission.MANAGE_INSURANCE,
    Permission.MANAGE_REWARDS,
    Permission.CREATE_GOALS,
    Permission.SUBMIT_REVIEW,
    Permission.MANAGE_TRAINING,
    Permission.ENROLL_TRAINING,
    Permission.INITIATE_SEPARATION,
    Permission.PROCESS_SEPARATION,
    Permission.VIEW_ORG_CHART,
    Permission.VIEW_AUDIT_LOGS,
    Permission.UPLOAD_DOCUMENT,
    Permission.MANAGE_DOCUMENTS,
    Permission.SIGN_DOCUMENT,
    Permission.MANAGE_NOTIFICATIONS,
    Permission.VIEW_DASHBOARD,
    Permission.GENERATE_REPORTS
  ],

  [Role.DEPARTMENT_MANAGER]: [
    Permission.READ_EMPLOYEE,
    Permission.READ_ATTENDANCE,
    Permission.APPROVE_REGULARIZATION,
    Permission.CREATE_LEAVE,
    Permission.READ_LEAVE,
    Permission.APPROVE_LEAVE,
    Permission.REJECT_LEAVE,
    Permission.VIEW_PAYROLL,
    Permission.CREATE_GOALS,
    Permission.SUBMIT_REVIEW,
    Permission.MANAGE_PERFORMANCE,
    Permission.ENROLL_TRAINING,
    Permission.VIEW_ORG_CHART,
    Permission.UPLOAD_DOCUMENT,
    Permission.SIGN_DOCUMENT,
    Permission.APPROVE_TRAVEL,
    Permission.APPROVE_REIMBURSEMENT,
    Permission.VIEW_DASHBOARD
  ],

  [Role.FINANCE_PAYROLL]: [
    Permission.READ_EMPLOYEE,
    Permission.VIEW_EMPLOYEE_BANK_DETAILS,
    Permission.VERIFY_BANK_DETAILS,
    Permission.READ_ATTENDANCE,
    Permission.READ_LEAVE,
    Permission.CONFIGURE_SALARY,
    Permission.PROCESS_PAYROLL,
    Permission.VIEW_PAYROLL,
    Permission.LOCK_PAYROLL,
    Permission.EXPORT_PAYROLL,
    Permission.APPROVE_REIMBURSEMENT,
    Permission.VIEW_ORG_CHART,
    Permission.VIEW_AUDIT_LOGS,
    Permission.UPLOAD_DOCUMENT,
    Permission.SIGN_DOCUMENT,
    Permission.VIEW_DASHBOARD,
    Permission.GENERATE_REPORTS
  ],

  [Role.EMPLOYEE]: [
    Permission.READ_EMPLOYEE, // Own profile only
    Permission.CREATE_ATTENDANCE,
    Permission.READ_ATTENDANCE, // Own attendance only
    Permission.CREATE_LEAVE,
    Permission.READ_LEAVE, // Own leaves only
    Permission.VIEW_PAYROLL, // Own payroll only
    Permission.ENROLL_TRAINING,
    Permission.CREATE_GOALS,
    Permission.SUBMIT_REVIEW,
    Permission.UPLOAD_DOCUMENT,
    Permission.SIGN_DOCUMENT,
    Permission.VIEW_ORG_CHART
  ],

  [Role.IT_ADMIN]: [
    Permission.READ_EMPLOYEE,
    Permission.MANAGE_USERS,
    Permission.MANAGE_SECURITY,
    Permission.VIEW_AUDIT_LOGS,
    Permission.MANAGE_NOTIFICATIONS
  ]
};

/**
 * Resource-Level Access Control
 * Defines which resources a user can access based on their role and relationship
 */
export interface ResourceAccessContext {
  userId: string
  userRole: Role
  userDepartmentId?: string
  userManagerId?: string
  targetResourceId: string
  targetResourceType: 'employee' | 'attendance' | 'leave' | 'payroll' | 'document'
  targetResourceOwnerId?: string
  targetResourceDepartmentId?: string
}

/**
 * Hierarchy-Based Access Control
 * Determines if a user can access a resource based on reporting lines
 */
export interface HierarchyAccessContext {
  userId: string
  targetEmployeeId: string
  accessType: 'view' | 'approve' | 'modify'
}

/**
 * Audit Log Entry
 * Records all access control decisions and sensitive operations
 */
export interface AuditLogEntry {
  id: string
  timestamp: Date
  userId: string
  userRole: Role
  action: string
  resourceType: string
  resourceId: string
  changes?: Record<string, any>
  ipAddress: string
  userAgent: string
  status: 'success' | 'failure'
  reason?: string
}

/**
 * Permission Check Result
 */
export interface PermissionCheckResult {
  allowed: boolean
  reason?: string
  requiresApproval?: boolean
  approvalRoute?: string[]
}
