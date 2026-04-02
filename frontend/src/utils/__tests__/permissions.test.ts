import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  canManageEmployees,
  canViewEmployees,
  canCreateEmployees,
  canEditEmployees,
  canDeleteEmployees,
  canImportExportEmployees,
  getEmployeeManagementRoles,
  getEmployeeViewRoles,
} from '../permissions';
import { UserRole } from '@/types/auth';

describe('Permissions Utility', () => {
  describe('hasPermission', () => {
    it('should grant all permissions to super admin', () => {
      expect(hasPermission(UserRole.SUPER_ADMIN, 'employees', 'create')).toBe(true);
      expect(hasPermission(UserRole.SUPER_ADMIN, 'employees', 'read')).toBe(true);
      expect(hasPermission(UserRole.SUPER_ADMIN, 'employees', 'update')).toBe(true);
      expect(hasPermission(UserRole.SUPER_ADMIN, 'employees', 'delete')).toBe(true);
      expect(hasPermission(UserRole.SUPER_ADMIN, 'any_resource', 'create')).toBe(true);
    });

    it('should grant employee management permissions to HR manager', () => {
      expect(hasPermission(UserRole.HR_MANAGER, 'employees', 'create')).toBe(true);
      expect(hasPermission(UserRole.HR_MANAGER, 'employees', 'read')).toBe(true);
      expect(hasPermission(UserRole.HR_MANAGER, 'employees', 'update')).toBe(true);
      expect(hasPermission(UserRole.HR_MANAGER, 'employees', 'delete')).toBe(true);
    });

    it('should deny employee creation to department manager', () => {
      expect(hasPermission(UserRole.DEPARTMENT_MANAGER, 'employees', 'create')).toBe(false);
      expect(hasPermission(UserRole.DEPARTMENT_MANAGER, 'employees', 'delete')).toBe(false);
    });

    it('should allow employee read to department manager', () => {
      expect(hasPermission(UserRole.DEPARTMENT_MANAGER, 'employees', 'read')).toBe(true);
    });

    it('should grant payroll permissions to finance role', () => {
      expect(hasPermission(UserRole.FINANCE, 'payroll', 'create')).toBe(true);
      expect(hasPermission(UserRole.FINANCE, 'payroll', 'read')).toBe(true);
      expect(hasPermission(UserRole.FINANCE, 'payroll', 'update')).toBe(true);
    });

    it('should deny payroll delete to finance role', () => {
      expect(hasPermission(UserRole.FINANCE, 'payroll', 'delete')).toBe(false);
    });

    it('should grant limited permissions to employee role', () => {
      expect(hasPermission(UserRole.EMPLOYEE, 'attendance', 'create')).toBe(true);
      expect(hasPermission(UserRole.EMPLOYEE, 'attendance', 'read')).toBe(true);
      expect(hasPermission(UserRole.EMPLOYEE, 'leave', 'create')).toBe(true);
      expect(hasPermission(UserRole.EMPLOYEE, 'leave', 'read')).toBe(true);
    });

    it('should deny employee management to employee role', () => {
      expect(hasPermission(UserRole.EMPLOYEE, 'employees', 'create')).toBe(false);
      expect(hasPermission(UserRole.EMPLOYEE, 'employees', 'update')).toBe(false);
      expect(hasPermission(UserRole.EMPLOYEE, 'employees', 'delete')).toBe(false);
    });

    it('should grant settings permissions to IT admin', () => {
      expect(hasPermission(UserRole.IT_ADMIN, 'settings', 'read')).toBe(true);
      expect(hasPermission(UserRole.IT_ADMIN, 'settings', 'update')).toBe(true);
    });

    it('should grant user management permissions to IT admin', () => {
      expect(hasPermission(UserRole.IT_ADMIN, 'users', 'create')).toBe(true);
      expect(hasPermission(UserRole.IT_ADMIN, 'users', 'read')).toBe(true);
      expect(hasPermission(UserRole.IT_ADMIN, 'users', 'update')).toBe(true);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has any of the permissions', () => {
      const permissions = [
        { resource: 'employees', action: 'create' as const },
        { resource: 'employees', action: 'delete' as const },
      ];

      expect(hasAnyPermission(UserRole.HR_MANAGER, permissions)).toBe(true);
    });

    it('should return false if user has none of the permissions', () => {
      const permissions = [
        { resource: 'settings', action: 'update' as const },
        { resource: 'users', action: 'create' as const },
      ];

      expect(hasAnyPermission(UserRole.EMPLOYEE, permissions)).toBe(false);
    });

    it('should return true for super admin with any permissions', () => {
      const permissions = [
        { resource: 'any_resource', action: 'create' as const },
        { resource: 'another_resource', action: 'delete' as const },
      ];

      expect(hasAnyPermission(UserRole.SUPER_ADMIN, permissions)).toBe(true);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has all permissions', () => {
      const permissions = [
        { resource: 'employees', action: 'create' as const },
        { resource: 'employees', action: 'read' as const },
        { resource: 'employees', action: 'update' as const },
      ];

      expect(hasAllPermissions(UserRole.HR_MANAGER, permissions)).toBe(true);
    });

    it('should return false if user lacks any permission', () => {
      const permissions = [
        { resource: 'employees', action: 'create' as const },
        { resource: 'employees', action: 'delete' as const },
        { resource: 'settings', action: 'update' as const },
      ];

      expect(hasAllPermissions(UserRole.HR_MANAGER, permissions)).toBe(false);
    });

    it('should return true for super admin with any permissions', () => {
      const permissions = [
        { resource: 'any_resource', action: 'create' as const },
        { resource: 'another_resource', action: 'delete' as const },
        { resource: 'third_resource', action: 'update' as const },
      ];

      expect(hasAllPermissions(UserRole.SUPER_ADMIN, permissions)).toBe(true);
    });
  });

  describe('getRolePermissions', () => {
    it('should return permissions for a role', () => {
      const permissions = getRolePermissions(UserRole.HR_MANAGER);

      expect(permissions.length).toBeGreaterThan(0);
      expect(permissions.some((p) => p.resource === 'employees')).toBe(true);
    });

    it('should return empty array for invalid role', () => {
      const permissions = getRolePermissions('invalid_role' as UserRole);

      expect(permissions).toEqual([]);
    });

    it('should return all permissions for super admin', () => {
      const permissions = getRolePermissions(UserRole.SUPER_ADMIN);

      expect(permissions.some((p) => p.resource === '*')).toBe(true);
    });
  });

  describe('Employee Management Helpers', () => {
    describe('canManageEmployees', () => {
      it('should return true for super admin', () => {
        expect(canManageEmployees(UserRole.SUPER_ADMIN)).toBe(true);
      });

      it('should return true for HR manager', () => {
        expect(canManageEmployees(UserRole.HR_MANAGER)).toBe(true);
      });

      it('should return false for department manager', () => {
        expect(canManageEmployees(UserRole.DEPARTMENT_MANAGER)).toBe(false);
      });

      it('should return false for employee', () => {
        expect(canManageEmployees(UserRole.EMPLOYEE)).toBe(false);
      });

      it('should return false for finance', () => {
        expect(canManageEmployees(UserRole.FINANCE)).toBe(false);
      });

      it('should return false for IT admin', () => {
        expect(canManageEmployees(UserRole.IT_ADMIN)).toBe(false);
      });
    });

    describe('canViewEmployees', () => {
      it('should return true for super admin', () => {
        expect(canViewEmployees(UserRole.SUPER_ADMIN)).toBe(true);
      });

      it('should return true for HR manager', () => {
        expect(canViewEmployees(UserRole.HR_MANAGER)).toBe(true);
      });

      it('should return true for department manager', () => {
        expect(canViewEmployees(UserRole.DEPARTMENT_MANAGER)).toBe(true);
      });

      it('should return true for finance', () => {
        expect(canViewEmployees(UserRole.FINANCE)).toBe(true);
      });

      it('should return false for employee', () => {
        expect(canViewEmployees(UserRole.EMPLOYEE)).toBe(false);
      });

      it('should return false for IT admin', () => {
        expect(canViewEmployees(UserRole.IT_ADMIN)).toBe(false);
      });
    });

    describe('canCreateEmployees', () => {
      it('should return true for super admin', () => {
        expect(canCreateEmployees(UserRole.SUPER_ADMIN)).toBe(true);
      });

      it('should return true for HR manager', () => {
        expect(canCreateEmployees(UserRole.HR_MANAGER)).toBe(true);
      });

      it('should return false for department manager', () => {
        expect(canCreateEmployees(UserRole.DEPARTMENT_MANAGER)).toBe(false);
      });
    });

    describe('canEditEmployees', () => {
      it('should return true for super admin', () => {
        expect(canEditEmployees(UserRole.SUPER_ADMIN)).toBe(true);
      });

      it('should return true for HR manager', () => {
        expect(canEditEmployees(UserRole.HR_MANAGER)).toBe(true);
      });

      it('should return false for department manager', () => {
        expect(canEditEmployees(UserRole.DEPARTMENT_MANAGER)).toBe(false);
      });
    });

    describe('canDeleteEmployees', () => {
      it('should return true for super admin', () => {
        expect(canDeleteEmployees(UserRole.SUPER_ADMIN)).toBe(true);
      });

      it('should return true for HR manager', () => {
        expect(canDeleteEmployees(UserRole.HR_MANAGER)).toBe(true);
      });

      it('should return false for department manager', () => {
        expect(canDeleteEmployees(UserRole.DEPARTMENT_MANAGER)).toBe(false);
      });
    });

    describe('canImportExportEmployees', () => {
      it('should return true for super admin', () => {
        expect(canImportExportEmployees(UserRole.SUPER_ADMIN)).toBe(true);
      });

      it('should return true for HR manager', () => {
        expect(canImportExportEmployees(UserRole.HR_MANAGER)).toBe(true);
      });

      it('should return false for department manager', () => {
        expect(canImportExportEmployees(UserRole.DEPARTMENT_MANAGER)).toBe(false);
      });

      it('should return false for employee', () => {
        expect(canImportExportEmployees(UserRole.EMPLOYEE)).toBe(false);
      });
    });
  });

  describe('Role Lists', () => {
    describe('getEmployeeManagementRoles', () => {
      it('should return roles that can manage employees', () => {
        const roles = getEmployeeManagementRoles();

        expect(roles).toContain(UserRole.SUPER_ADMIN);
        expect(roles).toContain(UserRole.HR_MANAGER);
        expect(roles).not.toContain(UserRole.EMPLOYEE);
        expect(roles).not.toContain(UserRole.DEPARTMENT_MANAGER);
      });
    });

    describe('getEmployeeViewRoles', () => {
      it('should return roles that can view employees', () => {
        const roles = getEmployeeViewRoles();

        expect(roles).toContain(UserRole.SUPER_ADMIN);
        expect(roles).toContain(UserRole.HR_MANAGER);
        expect(roles).toContain(UserRole.DEPARTMENT_MANAGER);
        expect(roles).toContain(UserRole.FINANCE);
        expect(roles).not.toContain(UserRole.EMPLOYEE);
        expect(roles).not.toContain(UserRole.IT_ADMIN);
      });
    });
  });
});
