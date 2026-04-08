/**
 * RBAC Utility Tests
 * Tests for Role-Based Access Control functions
 */

import {
  hasPermission,
  userHasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getRolePermissions,
  canAccessResource,
  canAccessViaHierarchy,
  getApprovalRoute,
  canPerformAction,
  getRoleDisplayName,
  getPermissionDisplayName,
  isRoleHigherThan,
  isValidRole,
  isValidPermission,
} from '../rbac';
import { Role, Permission } from '../../types/rbac';

describe('RBAC Utilities', () => {
  describe('hasPermission', () => {
    it('should return true for valid permission', () => {
      const result = hasPermission(Role.SUPER_ADMIN, Permission.CREATE_EMPLOYEE);
      expect(result).toBe(true);
    });

    it('should return false for invalid permission', () => {
      const result = hasPermission(Role.EMPLOYEE, Permission.PROCESS_PAYROLL);
      expect(result).toBe(false);
    });

    it('should handle all roles', () => {
      const roles = [
        Role.SUPER_ADMIN,
        Role.HR_MANAGER,
        Role.DEPARTMENT_MANAGER,
        Role.FINANCE_PAYROLL,
        Role.EMPLOYEE,
        Role.IT_ADMIN,
      ];

      roles.forEach(role => {
        const result = hasPermission(role, Permission.READ_EMPLOYEE);
        expect(typeof result).toBe('boolean');
      });
    });
  });

  describe('userHasPermission', () => {
    it('should check user permission', () => {
      const result = userHasPermission(Role.HR_MANAGER, Permission.CREATE_EMPLOYEE);
      expect(result).toBe(true);
    });

    it('should return false for missing permission', () => {
      const result = userHasPermission(Role.EMPLOYEE, Permission.PROCESS_PAYROLL);
      expect(result).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true when user has all permissions', () => {
      const permissions = [Permission.READ_EMPLOYEE, Permission.UPDATE_EMPLOYEE];
      const result = hasAllPermissions(Role.HR_MANAGER, permissions);

      expect(result).toBe(true);
    });

    it('should return false when user lacks any permission', () => {
      const permissions = [Permission.READ_EMPLOYEE, Permission.PROCESS_PAYROLL];
      const result = hasAllPermissions(Role.EMPLOYEE, permissions);

      expect(result).toBe(false);
    });

    it('should handle empty permission list', () => {
      const result = hasAllPermissions(Role.EMPLOYEE, []);
      expect(result).toBe(true);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true when user has at least one permission', () => {
      const permissions = [Permission.READ_EMPLOYEE, Permission.PROCESS_PAYROLL];
      const result = hasAnyPermission(Role.HR_MANAGER, permissions);

      expect(result).toBe(true);
    });

    it('should return false when user lacks all permissions', () => {
      const permissions = [Permission.PROCESS_PAYROLL, Permission.LOCK_PAYROLL];
      const result = hasAnyPermission(Role.EMPLOYEE, permissions);

      expect(result).toBe(false);
    });

    it('should handle empty permission list', () => {
      const result = hasAnyPermission(Role.EMPLOYEE, []);
      expect(result).toBe(false);
    });
  });

  describe('getRolePermissions', () => {
    it('should return permissions for role', () => {
      const permissions = getRolePermissions(Role.HR_MANAGER);

      expect(Array.isArray(permissions)).toBe(true);
      expect(permissions.length).toBeGreaterThan(0);
    });

    it('should return different permissions for different roles', () => {
      const hrPermissions = getRolePermissions(Role.HR_MANAGER);
      const employeePermissions = getRolePermissions(Role.EMPLOYEE);

      expect(hrPermissions.length).toBeGreaterThan(employeePermissions.length);
    });

    it('should return all permissions for super admin', () => {
      const permissions = getRolePermissions(Role.SUPER_ADMIN);

      expect(permissions.length).toBeGreaterThan(0);
    });
  });

  describe('canAccessResource', () => {
    it('should allow super admin access', () => {
      const result = canAccessResource({
        userId: 'user-1',
        userRole: Role.SUPER_ADMIN,
        targetResourceId: 'resource-1',
        targetResourceType: 'employee',
        targetResourceOwnerId: 'user-2',
        targetResourceDepartmentId: 'dept-2',
        userDepartmentId: 'dept-1',
      });

      expect(result.allowed).toBe(true);
    });

    it('should allow employee to access own resource', () => {
      const result = canAccessResource({
        userId: 'user-1',
        userRole: Role.EMPLOYEE,
        targetResourceId: 'resource-1',
        targetResourceType: 'employee',
        targetResourceOwnerId: 'user-1',
        targetResourceDepartmentId: 'dept-1',
        userDepartmentId: 'dept-1',
      });

      expect(result.allowed).toBe(true);
    });

    it('should deny employee access to other resources', () => {
      const result = canAccessResource({
        userId: 'user-1',
        userRole: Role.EMPLOYEE,
        targetResourceId: 'resource-2',
        targetResourceType: 'employee',
        targetResourceOwnerId: 'user-2',
        targetResourceDepartmentId: 'dept-1',
        userDepartmentId: 'dept-1',
      });

      expect(result.allowed).toBe(false);
    });

    it('should allow department manager access to department resources', () => {
      const result = canAccessResource({
        userId: 'user-1',
        userRole: Role.DEPARTMENT_MANAGER,
        targetResourceId: 'resource-2',
        targetResourceType: 'employee',
        targetResourceOwnerId: 'user-2',
        targetResourceDepartmentId: 'dept-1',
        userDepartmentId: 'dept-1',
      });

      expect(result.allowed).toBe(true);
    });

    it('should deny department manager access to other departments', () => {
      const result = canAccessResource({
        userId: 'user-1',
        userRole: Role.DEPARTMENT_MANAGER,
        targetResourceId: 'resource-2',
        targetResourceType: 'employee',
        targetResourceOwnerId: 'user-2',
        targetResourceDepartmentId: 'dept-2',
        userDepartmentId: 'dept-1',
      });

      expect(result.allowed).toBe(false);
    });

    it('should allow HR manager access to all resources', () => {
      const result = canAccessResource({
        userId: 'user-1',
        userRole: Role.HR_MANAGER,
        targetResourceId: 'resource-2',
        targetResourceType: 'employee',
        targetResourceOwnerId: 'user-2',
        targetResourceDepartmentId: 'dept-2',
        userDepartmentId: 'dept-1',
      });

      expect(result.allowed).toBe(true);
    });
  });

  describe('canAccessViaHierarchy', () => {
    it('should allow access to own data', () => {
      const result = canAccessViaHierarchy(
        {
          userId: 'user-1',
          targetEmployeeId: 'user-1',
          accessType: 'view',
        },
        ['user-2', 'user-3']
      );

      expect(result.allowed).toBe(true);
    });

    it('should allow access to subordinates', () => {
      const result = canAccessViaHierarchy(
        {
          userId: 'user-1',
          targetEmployeeId: 'user-2',
          accessType: 'view',
        },
        ['user-1', 'user-3']
      );

      expect(result.allowed).toBe(true);
    });

    it('should deny access to non-subordinates', () => {
      const result = canAccessViaHierarchy(
        {
          userId: 'user-1',
          targetEmployeeId: 'user-2',
          accessType: 'view',
        },
        ['user-3', 'user-4']
      );

      expect(result.allowed).toBe(false);
    });
  });

  describe('getApprovalRoute', () => {
    it('should route to direct manager for leave', () => {
      const route = getApprovalRoute('emp-1', ['mgr-1', 'dir-1'], 'leave');

      expect(route).toContain('mgr-1');
    });

    it('should route to manager and finance for reimbursement', () => {
      const route = getApprovalRoute('emp-1', ['mgr-1', 'dir-1'], 'reimbursement');

      expect(route).toContain('mgr-1');
      expect(route).toContain('finance_team');
    });

    it('should route to HR when no reporting chain', () => {
      const route = getApprovalRoute('emp-1', [], 'leave');

      expect(route).toContain('hr_team');
    });

    it('should handle travel approval', () => {
      const route = getApprovalRoute('emp-1', ['mgr-1', 'dir-1'], 'travel');

      expect(route).toContain('mgr-1');
    });
  });

  describe('canPerformAction', () => {
    it('should allow action with permission and access', () => {
      const result = canPerformAction(
        Role.HR_MANAGER,
        Permission.CREATE_EMPLOYEE,
        {
          userId: 'user-1',
          userRole: Role.HR_MANAGER,
          targetResourceId: 'resource-1',
          targetResourceType: 'employee',
          targetResourceOwnerId: 'user-2',
          targetResourceDepartmentId: 'dept-1',
          userDepartmentId: 'dept-1',
        }
      );

      expect(result.allowed).toBe(true);
    });

    it('should deny action without permission', () => {
      const result = canPerformAction(
        Role.EMPLOYEE,
        Permission.PROCESS_PAYROLL,
        {
          userId: 'user-1',
          userRole: Role.EMPLOYEE,
          targetResourceId: 'resource-1',
          targetResourceType: 'employee',
          targetResourceOwnerId: 'user-1',
          targetResourceDepartmentId: 'dept-1',
          userDepartmentId: 'dept-1',
        }
      );

      expect(result.allowed).toBe(false);
    });

    it('should deny action without resource access', () => {
      const result = canPerformAction(
        Role.EMPLOYEE,
        Permission.READ_EMPLOYEE,
        {
          userId: 'user-1',
          userRole: Role.EMPLOYEE,
          targetResourceId: 'resource-2',
          targetResourceType: 'employee',
          targetResourceOwnerId: 'user-2',
          targetResourceDepartmentId: 'dept-1',
          userDepartmentId: 'dept-1',
        }
      );

      expect(result.allowed).toBe(false);
    });
  });

  describe('getRoleDisplayName', () => {
    it('should return display name for role', () => {
      expect(getRoleDisplayName(Role.SUPER_ADMIN)).toBe('Super Admin');
      expect(getRoleDisplayName(Role.HR_MANAGER)).toBe('HR Manager');
      expect(getRoleDisplayName(Role.EMPLOYEE)).toBe('Employee');
    });

    it('should handle all roles', () => {
      const roles = [
        Role.SUPER_ADMIN,
        Role.HR_MANAGER,
        Role.DEPARTMENT_MANAGER,
        Role.FINANCE_PAYROLL,
        Role.EMPLOYEE,
        Role.IT_ADMIN,
      ];

      roles.forEach(role => {
        const displayName = getRoleDisplayName(role);
        expect(displayName).toBeTruthy();
        expect(displayName.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getPermissionDisplayName', () => {
    it('should format permission name', () => {
      const displayName = getPermissionDisplayName(Permission.CREATE_EMPLOYEE);

      expect(displayName).toContain('Create');
      expect(displayName).toContain('Employee');
    });

    it('should handle all permissions', () => {
      const permissions = [
        Permission.CREATE_EMPLOYEE,
        Permission.READ_EMPLOYEE,
        Permission.UPDATE_EMPLOYEE,
        Permission.DELETE_EMPLOYEE,
      ];

      permissions.forEach(permission => {
        const displayName = getPermissionDisplayName(permission);
        expect(displayName).toBeTruthy();
      });
    });
  });

  describe('isRoleHigherThan', () => {
    it('should identify super admin as highest', () => {
      expect(isRoleHigherThan(Role.SUPER_ADMIN, Role.HR_MANAGER)).toBe(true);
      expect(isRoleHigherThan(Role.SUPER_ADMIN, Role.EMPLOYEE)).toBe(true);
    });

    it('should identify employee as lowest', () => {
      expect(isRoleHigherThan(Role.EMPLOYEE, Role.SUPER_ADMIN)).toBe(false);
      expect(isRoleHigherThan(Role.EMPLOYEE, Role.HR_MANAGER)).toBe(false);
    });

    it('should compare department manager and finance', () => {
      expect(isRoleHigherThan(Role.FINANCE_PAYROLL, Role.DEPARTMENT_MANAGER)).toBe(true);
    });

    it('should return false for same role', () => {
      expect(isRoleHigherThan(Role.HR_MANAGER, Role.HR_MANAGER)).toBe(false);
    });
  });

  describe('isValidRole', () => {
    it('should validate valid roles', () => {
      expect(isValidRole(Role.SUPER_ADMIN)).toBe(true);
      expect(isValidRole(Role.HR_MANAGER)).toBe(true);
      expect(isValidRole(Role.EMPLOYEE)).toBe(true);
    });

    it('should reject invalid roles', () => {
      expect(isValidRole('invalid_role')).toBe(false);
      expect(isValidRole('')).toBe(false);
      expect(isValidRole(null)).toBe(false);
    });
  });

  describe('isValidPermission', () => {
    it('should validate valid permissions', () => {
      expect(isValidPermission(Permission.CREATE_EMPLOYEE)).toBe(true);
      expect(isValidPermission(Permission.READ_EMPLOYEE)).toBe(true);
      expect(isValidPermission(Permission.PROCESS_PAYROLL)).toBe(true);
    });

    it('should reject invalid permissions', () => {
      expect(isValidPermission('invalid_permission')).toBe(false);
      expect(isValidPermission('')).toBe(false);
      expect(isValidPermission(null)).toBe(false);
    });
  });
});
