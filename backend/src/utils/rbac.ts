/**
 * RBAC Utility Functions
 * Helper functions for permission checking and access control
 */

import { Role, Permission, ROLE_PERMISSIONS, ResourceAccessContext, HierarchyAccessContext, PermissionCheckResult } from '../types/rbac';

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Check if a user has a specific permission
 */
export function userHasPermission(userRole: Role, permission: Permission): boolean {
  return hasPermission(userRole, permission);
}

/**
 * Check multiple permissions (AND logic - user must have all)
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Check multiple permissions (OR logic - user must have at least one)
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check resource-level access control
 * Determines if a user can access a specific resource
 */
export function canAccessResource(context: ResourceAccessContext): PermissionCheckResult {
  const { userId, userRole, targetResourceOwnerId, targetResourceDepartmentId, userDepartmentId } = context;

  // Super Admin can access everything
  if (userRole === Role.SUPER_ADMIN) {
    return { allowed: true };
  }

  // Employees can only access their own resources
  if (userRole === Role.EMPLOYEE) {
    if (targetResourceOwnerId === userId) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Employees can only access their own resources' };
  }

  // Department Managers can access resources in their department
  if (userRole === Role.DEPARTMENT_MANAGER) {
    if (targetResourceDepartmentId === userDepartmentId || targetResourceOwnerId === userId) {
      return { allowed: true };
    }
    return { allowed: false, reason: 'Department managers can only access resources in their department' };
  }

  // HR Managers and Finance/Payroll can access all resources
  if (userRole === Role.HR_MANAGER || userRole === Role.FINANCE_PAYROLL) {
    return { allowed: true };
  }

  // IT Admin can access all resources
  if (userRole === Role.IT_ADMIN) {
    return { allowed: true };
  }

  return { allowed: false, reason: 'Access denied' };
}

/**
 * Check hierarchy-based access control
 * Determines if a manager can access a subordinate's data
 */
export function canAccessViaHierarchy(
  context: HierarchyAccessContext,
  reportingChain: string[]
): PermissionCheckResult {
  const { userId, targetEmployeeId, accessType } = context;

  // User can always access their own data
  if (userId === targetEmployeeId) {
    return { allowed: true };
  }

  // Check if target employee is in user's reporting chain
  if (reportingChain.includes(userId)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `User cannot ${accessType} this resource - target employee is not in reporting chain`
  };
}

/**
 * Determine approval route based on hierarchy
 * Returns the chain of approvers for a request
 */
export function getApprovalRoute(
  employeeId: string,
  reportingChain: string[],
  approvalType: 'leave' | 'travel' | 'reimbursement'
): string[] {
  // For most approvals, route to direct manager (first in chain)
  if (reportingChain.length > 0) {
    const directManager = reportingChain[0];

    // For high-value requests, add additional approvers
    if (approvalType === 'reimbursement') {
      // Route to manager and finance
      return [directManager, 'finance_team'];
    }

    return [directManager];
  }

  // If no reporting chain, route to HR
  return ['hr_team'];
}

/**
 * Check if a user can perform an action on a resource
 * Combines permission and resource-level access checks
 */
export function canPerformAction(
  userRole: Role,
  permission: Permission,
  resourceContext: ResourceAccessContext
): PermissionCheckResult {
  // First check if role has permission
  if (!hasPermission(userRole, permission)) {
    return { allowed: false, reason: `Role ${userRole} does not have permission ${permission}` };
  }

  // Then check resource-level access
  return canAccessResource(resourceContext);
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: Role): string {
  const displayNames: Record<Role, string> = {
    [Role.SUPER_ADMIN]: 'Super Admin',
    [Role.HR_MANAGER]: 'HR Manager',
    [Role.DEPARTMENT_MANAGER]: 'Department Manager',
    [Role.FINANCE_PAYROLL]: 'Finance/Payroll',
    [Role.EMPLOYEE]: 'Employee',
    [Role.IT_ADMIN]: 'IT Admin'
  };
  return displayNames[role] || role;
}

/**
 * Get permission display name
 */
export function getPermissionDisplayName(permission: Permission): string {
  return permission
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Check if a role is higher in hierarchy than another
 * Used for approval routing and escalation
 */
export function isRoleHigherThan(role1: Role, role2: Role): boolean {
  const roleHierarchy: Record<Role, number> = {
    [Role.SUPER_ADMIN]: 6,
    [Role.HR_MANAGER]: 5,
    [Role.IT_ADMIN]: 5,
    [Role.FINANCE_PAYROLL]: 4,
    [Role.DEPARTMENT_MANAGER]: 3,
    [Role.EMPLOYEE]: 1
  };

  return (roleHierarchy[role1] || 0) > (roleHierarchy[role2] || 0);
}

/**
 * Validate role
 */
export function isValidRole(role: any): role is Role {
  return Object.values(Role).includes(role);
}

/**
 * Validate permission
 */
export function isValidPermission(permission: any): permission is Permission {
  return Object.values(Permission).includes(permission);
}
