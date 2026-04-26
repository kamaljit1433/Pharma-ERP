/**
 * Permission and Role-Based Access Control Utility
 * Defines permissions for different user roles
 */

import { UserRole } from '@/types/auth';

/** Named permission constants used for route/navigation guards */
export enum Permission {
  VIEW_EMPLOYEES = 'employees:read',
  VIEW_ATTENDANCE = 'attendance:read',
  VIEW_LEAVE = 'leave:read',
  VIEW_PAYROLL = 'payroll:read',
  VIEW_RECRUITMENT = 'recruitment:read',
  VIEW_PERFORMANCE = 'performance:read',
  VIEW_TRAINING = 'training:read',
  VIEW_BENEFITS = 'benefits:read',
  VIEW_SEPARATION = 'separation:read',
  VIEW_SETTINGS = 'settings:read',
  VIEW_USERS = 'users:read',
}

/** Low-level permission shape used in role mappings */
export interface PermissionDef {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}

/**
 * Role-to-permissions mapping
 * Defines what each role can do
 */
const rolePermissions: Record<UserRole, PermissionDef[]> = {
  [UserRole.SUPER_ADMIN]: [
    // Super Admin has all permissions
    { resource: '*', action: 'create' },
    { resource: '*', action: 'read' },
    { resource: '*', action: 'update' },
    { resource: '*', action: 'delete' },
  ],
  [UserRole.HR_MANAGER]: [
    // Employee management
    { resource: 'employees', action: 'create' },
    { resource: 'employees', action: 'read' },
    { resource: 'employees', action: 'update' },
    { resource: 'employees', action: 'delete' },
    // Leave management
    { resource: 'leave', action: 'read' },
    { resource: 'leave', action: 'update' },
    // Payroll
    { resource: 'payroll', action: 'read' },
    // Recruitment
    { resource: 'recruitment', action: 'create' },
    { resource: 'recruitment', action: 'read' },
    { resource: 'recruitment', action: 'update' },
    // Separation
    { resource: 'separation', action: 'create' },
    { resource: 'separation', action: 'read' },
    { resource: 'separation', action: 'update' },
    // Documents
    { resource: 'documents', action: 'read' },
    { resource: 'documents', action: 'update' },
  ],
  [UserRole.DEPARTMENT_MANAGER]: [
    // Employee read-only
    { resource: 'employees', action: 'read' },
    // Attendance
    { resource: 'attendance', action: 'read' },
    // Leave approval
    { resource: 'leave', action: 'read' },
    { resource: 'leave', action: 'update' },
    // Performance
    { resource: 'performance', action: 'create' },
    { resource: 'performance', action: 'read' },
    { resource: 'performance', action: 'update' },
  ],
  [UserRole.FINANCE]: [
    // Payroll management
    { resource: 'payroll', action: 'create' },
    { resource: 'payroll', action: 'read' },
    { resource: 'payroll', action: 'update' },
    // Employee read-only
    { resource: 'employees', action: 'read' },
    // Benefits
    { resource: 'benefits', action: 'read' },
    { resource: 'benefits', action: 'update' },
  ],
  [UserRole.EMPLOYEE]: [
    // Self-service
    { resource: 'attendance', action: 'create' },
    { resource: 'attendance', action: 'read' },
    { resource: 'leave', action: 'create' },
    { resource: 'leave', action: 'read' },
    { resource: 'documents', action: 'read' },
    { resource: 'payroll', action: 'read' },
    { resource: 'benefits', action: 'read' },
    { resource: 'performance', action: 'read' },
  ],
  [UserRole.IT_ADMIN]: [
    // System settings
    { resource: 'settings', action: 'read' },
    { resource: 'settings', action: 'update' },
    // User management
    { resource: 'users', action: 'create' },
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update' },
  ],
};

/**
 * Check if a user role has a specific permission
 */
/**
 * Check if a user role has a specific permission.
 * Accepts either (role, resource, action) or (role, Permission) overloads.
 */
export function hasPermission(role: UserRole, resource: string, action: 'create' | 'read' | 'update' | 'delete'): boolean;
export function hasPermission(role: UserRole, permission: Permission): boolean;
export function hasPermission(
  role: UserRole,
  resourceOrPermission: string | Permission,
  action?: 'create' | 'read' | 'update' | 'delete'
): boolean {
  const permissions = rolePermissions[role];
  if (!permissions) return false;

  let resource: string;
  let act: 'create' | 'read' | 'update' | 'delete';

  if (action !== undefined) {
    // Called as hasPermission(role, resource, action)
    resource = resourceOrPermission as string;
    act = action;
  } else {
    // Called as hasPermission(role, Permission.VIEW_X)
    const [res, a] = (resourceOrPermission as string).split(':');
    resource = res!;
    act = a! as 'create' | 'read' | 'update' | 'delete';
  }

  return permissions.some(
    (p) =>
      (p.resource === '*' || p.resource === resource) &&
      p.action === act
  );
}

/**
 * Check if a user role has any of the specified permissions
 */
export const hasAnyPermission = (
  role: UserRole,
  permissions: PermissionDef[]
): boolean => {
  return permissions.some((p) => hasPermission(role, p.resource, p.action));
};

/**
 * Check if a user role has all of the specified permissions
 */
export const hasAllPermissions = (
  role: UserRole,
  permissions: PermissionDef[]
): boolean => {
  return permissions.every((p) => hasPermission(role, p.resource, p.action));
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role: UserRole): PermissionDef[] => {
  return rolePermissions[role] || [];
};

/**
 * Check if user can manage employees (create, update, delete)
 */
export const canManageEmployees = (role: UserRole): boolean => {
  return (
    hasPermission(role, 'employees', 'create') &&
    hasPermission(role, 'employees', 'update') &&
    hasPermission(role, 'employees', 'delete')
  );
};

/**
 * Check if user can view employees
 */
export const canViewEmployees = (role: UserRole): boolean => {
  return hasPermission(role, 'employees', 'read');
};

/**
 * Check if user can create employees
 */
export const canCreateEmployees = (role: UserRole): boolean => {
  return hasPermission(role, 'employees', 'create');
};

/**
 * Check if user can edit employees
 */
export const canEditEmployees = (role: UserRole): boolean => {
  return hasPermission(role, 'employees', 'update');
};

/**
 * Check if user can delete employees
 */
export const canDeleteEmployees = (role: UserRole): boolean => {
  return hasPermission(role, 'employees', 'delete');
};

/**
 * Check if user can import/export employees
 */
export const canImportExportEmployees = (role: UserRole): boolean => {
  return canManageEmployees(role);
};

/**
 * Get roles that can manage employees
 */
export const getEmployeeManagementRoles = (): UserRole[] => {
  return [UserRole.SUPER_ADMIN, UserRole.HR_MANAGER];
};

/**
 * Get roles that can view employees
 */
export const getEmployeeViewRoles = (): UserRole[] => {
  return [
    UserRole.SUPER_ADMIN,
    UserRole.HR_MANAGER,
    UserRole.DEPARTMENT_MANAGER,
    UserRole.FINANCE,
  ];
};
