/**
 * RBAC Unit Tests
 * Tests for role-based access control functionality
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
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
  isValidPermission
} from '../utils/rbac';
import { Role, Permission, ROLE_PERMISSIONS } from '../types/rbac';

describe('RBAC Utilities', () => {
  describe('hasPermission', () => {
    it('should return true if role has permission', () => {
      expect(hasPermission(Role.SUPER_ADMIN, Permission.CREATE_EMPLOYEE)).toBe(true);
      expect(hasPermission(Role.HR_MANAGER, Permission.CREATE_EMPLOYEE)).toBe(true);
    });

    it('should return false if role does not have permission', () => {
      expect(hasPermission(Role.EMPLOYEE, Permission.PROCESS_PAYROLL)).toBe(false);
      expect(hasPermission(Role.DEPARTMENT_MANAGER, Permission.LOCK_PAYROLL)).toBe(false);
    });

    it('should handle invalid roles gracefully', () => {
      expect(hasPermission('invalid_role' as Role, Permission.CREATE_EMPLOYEE)).toBe(false);
    });
  });

  describe('userHasPermission', () => {
    it('should check if user role has permission', () => {
      expect(userHasPermission(Role.SUPER_ADMIN, Permission.MANAGE_USERS)).toBe(true);
      expect(userHasPermission(Role.EMPLOYEE, Permission.MANAGE_USERS)).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if role has all permissions', () => {
      const permissions = [Permission.CREATE_EMPLOYEE, Permission.READ_EMPLOYEE];
      expect(hasAllPermissions(Role.SUPER_ADMIN, permissions)).toBe(true);
      expect(hasAllPermissions(Role.HR_MANAGER, permissions)).toBe(true);
    });

    it('should return false if role is missing any permission', () => {
      const permissions = [Permission.CREATE_EMPLOYEE, Permission.PROCESS_PAYROLL];
      expect(hasAllPermissions(Role.EMPLOYEE, permissions)).toBe(false);
    });

    it('should return true for empty permission array', () => {
      expect(hasAllPermissions(Role.EMPLOYEE, [])).toBe(true);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if role has at least one permission', () => {
      const permissions = [Permission.PROCESS_PAYROLL, Permission.CREATE_EMPLOYEE];
      expect(hasAnyPermission(Role.HR_MANAGER, permissions)).toBe(true);
    });

    it('should return false if role has none of the permissions', () => {
      const permissions = [Permission.PROCESS_PAYROLL, Permission.LOCK_PAYROLL];
      expect(hasAnyPermission(Role.EMPLOYEE, permissions)).toBe(false);
    });

    it('should return false for empty permission array', () => {
      expect(hasAnyPermission(Role.EMPLOYEE, [])).toBe(false);
    });
  });

  describe('getRolePermissions', () => {
    it('should return all permissions for a role', () => {
      const permissions = getRolePermissions(Role.SUPER_ADMIN);
      expect(permissions.length).toBeGreaterThan(0);
      expect(permissions).toContain(Permission.CREATE_EMPLOYEE);
      expect(permissions).toContain(Permission.PROCESS_PAYROLL);
    });

    it('should return empty array for invalid role', () => {
      const permissions = getRolePermissions('invalid_role' as Role);
      expect(permissions).toEqual([]);
    });

    it('should return different permissions for different roles', () => {
      const adminPerms = getRolePermissions(Role.SUPER_ADMIN);
      const employeePerms = getRolePermissions(Role.EMPLOYEE);
      expect(adminPerms.length).toBeGreaterThan(employeePerms.length);
    });
  });

  describe('canAccessResource', () => {
    it('should allow Super Admin to access any resource', () => {
      const result = canAccessResource({
        userId: 'user1',
        userRole: Role.SUPER_ADMIN,
        targetResourceId: 'resource1',
        targetResourceType: 'employee',
        targetResourceOwnerId: 'user2'
      });
      expect(result.allowed).toBe(true);
    });

    it('should allow employees to access their own resources', () => {
      const result = canAccessResource({
        userId: 'user1',
        userRole: Role.EMPLOYEE,
        targetResourceId: 'resource1',
        targetResourceType: 'employee',
        targetResourceOwnerId: 'user1'
      });
      expect(result.allowed).toBe(true);
    });

    it('should deny employees access to other employees resources', () => {
      const result = canAccessResource({
        userId: 'user1',
        userRole: Role.EMPLOYEE,
        targetResourceId: 'resource1',
        targetResourceType: 'employee',
        targetResourceOwnerId: 'user2'
      });
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it('should allow Department Managers to access their department resources', () => {
      const result = canAccessResource({
        userId: 'manager1',
        userRole: Role.DEPARTMENT_MANAGER,
        userDepartmentId: 'dept1',
        targetResourceId: 'resource1',
        targetResourceType: 'employee',
        targetResourceDepartmentId: 'dept1'
      });
      expect(result.allowed).toBe(true);
    });

    it('should deny Department Managers access to other department resources', () => {
      const result = canAccessResource({
        userId: 'manager1',
        userRole: Role.DEPARTMENT_MANAGER,
        userDepartmentId: 'dept1',
        targetResourceId: 'resource1',
        targetResourceType: 'employee',
        targetResourceDepartmentId: 'dept2'
      });
      expect(result.allowed).toBe(false);
    });

    it('should allow HR Managers to access all resources', () => {
      const result = canAccessResource({
        userId: 'hr1',
        userRole: Role.HR_MANAGER,
        targetResourceId: 'resource1',
        targetResourceType: 'employee',
        targetResourceOwnerId: 'user2',
        targetResourceDepartmentId: 'dept2'
      });
      expect(result.allowed).toBe(true);
    });
  });

  describe('canAccessViaHierarchy', () => {
    it('should allow user to access their own data', () => {
      const result = canAccessViaHierarchy(
        {
          userId: 'user1',
          targetEmployeeId: 'user1',
          accessType: 'view'
        },
        []
      );
      expect(result.allowed).toBe(true);
    });

    it('should allow manager to access subordinate data', () => {
      const result = canAccessViaHierarchy(
        {
          userId: 'manager1',
          targetEmployeeId: 'employee1',
          accessType: 'view'
        },
        ['manager1', 'director1']
      );
      expect(result.allowed).toBe(true);
    });

    it('should deny access if employee not in reporting chain', () => {
      const result = canAccessViaHierarchy(
        {
          userId: 'manager1',
          targetEmployeeId: 'employee1',
          accessType: 'view'
        },
        ['manager2', 'director1']
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });
  });

  describe('getApprovalRoute', () => {
    it('should route to direct manager for leave approval', () => {
      const route = getApprovalRoute('emp1', ['manager1', 'director1'], 'leave');
      expect(route).toContain('manager1');
    });

    it('should route to manager and finance for reimbursement', () => {
      const route = getApprovalRoute('emp1', ['manager1', 'director1'], 'reimbursement');
      expect(route).toContain('manager1');
      expect(route).toContain('finance_team');
    });

    it('should route to HR if no reporting chain', () => {
      const route = getApprovalRoute('emp1', [], 'leave');
      expect(route).toContain('hr_team');
    });
  });

  describe('canPerformAction', () => {
    it('should allow action if role has permission and resource access', () => {
      const result = canPerformAction(
        Role.HR_MANAGER,
        Permission.CREATE_EMPLOYEE,
        {
          userId: 'hr1',
          userRole: Role.HR_MANAGER,
          targetResourceId: 'resource1',
          targetResourceType: 'employee'
        }
      );
      expect(result.allowed).toBe(true);
    });

    it('should deny action if role lacks permission', () => {
      const result = canPerformAction(
        Role.EMPLOYEE,
        Permission.PROCESS_PAYROLL,
        {
          userId: 'emp1',
          userRole: Role.EMPLOYEE,
          targetResourceId: 'resource1',
          targetResourceType: 'payroll'
        }
      );
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('does not have permission');
    });

    it('should deny action if resource access denied', () => {
      const result = canPerformAction(
        Role.EMPLOYEE,
        Permission.READ_EMPLOYEE,
        {
          userId: 'emp1',
          userRole: Role.EMPLOYEE,
          targetResourceId: 'resource1',
          targetResourceType: 'employee',
          targetResourceOwnerId: 'emp2'
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

    it('should return role name for invalid role', () => {
      expect(getRoleDisplayName('invalid_role' as Role)).toBe('invalid_role');
    });
  });

  describe('getPermissionDisplayName', () => {
    it('should return display name for permission', () => {
      expect(getPermissionDisplayName(Permission.CREATE_EMPLOYEE)).toBe('Create Employee');
      expect(getPermissionDisplayName(Permission.PROCESS_PAYROLL)).toBe('Process Payroll');
    });
  });

  describe('isRoleHigherThan', () => {
    it('should return true if first role is higher', () => {
      expect(isRoleHigherThan(Role.SUPER_ADMIN, Role.EMPLOYEE)).toBe(true);
      expect(isRoleHigherThan(Role.HR_MANAGER, Role.DEPARTMENT_MANAGER)).toBe(true);
    });

    it('should return false if first role is not higher', () => {
      expect(isRoleHigherThan(Role.EMPLOYEE, Role.SUPER_ADMIN)).toBe(false);
      expect(isRoleHigherThan(Role.DEPARTMENT_MANAGER, Role.HR_MANAGER)).toBe(false);
    });

    it('should return false if roles are equal', () => {
      expect(isRoleHigherThan(Role.SUPER_ADMIN, Role.SUPER_ADMIN)).toBe(false);
    });
  });

  describe('isValidRole', () => {
    it('should return true for valid roles', () => {
      expect(isValidRole(Role.SUPER_ADMIN)).toBe(true);
      expect(isValidRole(Role.EMPLOYEE)).toBe(true);
    });

    it('should return false for invalid roles', () => {
      expect(isValidRole('invalid_role')).toBe(false);
      expect(isValidRole(null)).toBe(false);
    });
  });

  describe('isValidPermission', () => {
    it('should return true for valid permissions', () => {
      expect(isValidPermission(Permission.CREATE_EMPLOYEE)).toBe(true);
      expect(isValidPermission(Permission.PROCESS_PAYROLL)).toBe(true);
    });

    it('should return false for invalid permissions', () => {
      expect(isValidPermission('invalid_permission')).toBe(false);
      expect(isValidPermission(null)).toBe(false);
    });
  });

  describe('Role Permission Matrix', () => {
    it('should have all roles defined', () => {
      Object.values(Role).forEach(role => {
        expect(ROLE_PERMISSIONS[role]).toBeDefined();
        expect(Array.isArray(ROLE_PERMISSIONS[role])).toBe(true);
      });
    });

    it('should have Super Admin with most permissions', () => {
      const superAdminPerms = ROLE_PERMISSIONS[Role.SUPER_ADMIN].length;
      Object.values(Role).forEach(role => {
        if (role !== Role.SUPER_ADMIN) {
          expect(ROLE_PERMISSIONS[role].length).toBeLessThanOrEqual(superAdminPerms);
        }
      });
    });

    it('should have Employee with least permissions', () => {
      const employeePerms = ROLE_PERMISSIONS[Role.EMPLOYEE].length;
      Object.values(Role).forEach(role => {
        if (role !== Role.EMPLOYEE) {
          expect(ROLE_PERMISSIONS[role].length).toBeGreaterThanOrEqual(employeePerms);
        }
      });
    });

    it('should not have duplicate permissions in a role', () => {
      Object.values(Role).forEach(role => {
        const perms = ROLE_PERMISSIONS[role];
        const uniquePerms = new Set(perms);
        expect(perms.length).toBe(uniquePerms.size);
      });
    });
  });
});
