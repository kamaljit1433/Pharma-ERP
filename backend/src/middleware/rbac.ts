/**
 * RBAC Middleware
 * Express middleware for role-based access control
 */

import { Request, Response, NextFunction } from 'express';
import { Role, Permission } from '../types/rbac';
import { userHasPermission, canAccessResource, canPerformAction } from '../utils/rbac';
import { auditLogService } from '../services/auditLogService';

/**
 * Extend Express Request to include user info
 */
declare global {
  namespace Express {
    interface User {
      id: string;
      role: string;
      departmentId?: string;
      managerId?: string;
    }
  }
}

/**
 * Middleware to check if user has a specific permission
 */
export function requirePermission(permission: Permission | Permission[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const permissions = Array.isArray(permission) ? permission : [permission];
      const hasPermission = permissions.some(p => userHasPermission(req.user!.role as Role, p));

      if (!hasPermission) {
        // Log unauthorized access attempt
        await auditLogService.logAccessDenied({
          userId: req.user.id,
          userRole: req.user.role as Role,
          action: `Attempted to access ${permissions.join(', ')}`,
          resourceType: 'permission',
          resourceId: permissions.join(','),
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('user-agent') || 'unknown',
          reason: 'Insufficient permissions'
        });

        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient permissions for this operation'
          }
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error checking permissions'
        }
      });
    }
  };
}

/**
 * Middleware to check if user has a specific role
 */
export function requireRole(role: Role | Role[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const roles = Array.isArray(role) ? role : [role];
      const hasRole = roles.includes(req.user.role as Role);

      if (!hasRole) {
        // Log unauthorized access attempt
        await auditLogService.logAccessDenied({
          userId: req.user.id,
          userRole: req.user.role as Role,
          action: `Attempted to access resource requiring role: ${roles.join(', ')}`,
          resourceType: 'role',
          resourceId: roles.join(','),
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('user-agent') || 'unknown',
          reason: 'Insufficient role'
        });

        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'This operation requires a higher role'
          }
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error checking role'
        }
      });
    }
  };
}

/**
 * Middleware to check resource-level access control
 * Checks if user can access a specific resource based on ownership/department
 */
export function requireResourceAccess(
  getResourceContext: (req: Request) => {
    targetResourceId: string;
    targetResourceType: 'employee' | 'attendance' | 'leave' | 'payroll' | 'document';
    targetResourceOwnerId?: string;
    targetResourceDepartmentId?: string;
  }
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const resourceContext = getResourceContext(req);
      const accessContext = {
        userId: req.user.id,
        userRole: req.user.role as Role,
        userDepartmentId: req.user.departmentId,
        userManagerId: req.user.managerId,
        ...resourceContext
      };

      const result = canAccessResource(accessContext);

      if (!result.allowed) {
        // Log unauthorized access attempt
        await auditLogService.logAccessDenied({
          userId: req.user.id,
          userRole: req.user.role as Role,
          action: `Attempted to access ${resourceContext.targetResourceType} ${resourceContext.targetResourceId}`,
          resourceType: resourceContext.targetResourceType,
          resourceId: resourceContext.targetResourceId,
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('user-agent') || 'unknown',
          reason: result.reason || 'Access denied'
        });

        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: result.reason || 'Access denied to this resource'
          }
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error checking resource access'
        }
      });
    }
  };
}

/**
 * Middleware to check if user can perform an action on a resource
 * Combines permission and resource-level access checks
 */
export function requireActionPermission(
  permission: Permission,
  getResourceContext: (req: Request) => {
    targetResourceId: string;
    targetResourceType: 'employee' | 'attendance' | 'leave' | 'payroll' | 'document';
    targetResourceOwnerId?: string;
    targetResourceDepartmentId?: string;
  }
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const resourceContext = getResourceContext(req);
      const accessContext = {
        userId: req.user.id,
        userRole: req.user.role as Role,
        userDepartmentId: req.user.departmentId,
        userManagerId: req.user.managerId,
        ...resourceContext
      };

      const result = canPerformAction(req.user.role as Role, permission, accessContext);

      if (!result.allowed) {
        // Log unauthorized access attempt
        await auditLogService.logAccessDenied({
          userId: req.user.id,
          userRole: req.user.role as Role,
          action: `Attempted to perform ${permission} on ${resourceContext.targetResourceType} ${resourceContext.targetResourceId}`,
          resourceType: resourceContext.targetResourceType,
          resourceId: resourceContext.targetResourceId,
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('user-agent') || 'unknown',
          reason: result.reason || 'Access denied'
        });

        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: result.reason || 'Insufficient permissions for this operation'
          }
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error checking action permission'
        }
      });
    }
  };
}

/**
 * Middleware to log all API access
 */
export function logApiAccess() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function(data: any) {
      // Log successful access
      if (req.user && res.statusCode < 400) {
        auditLogService.logAccess({
          userId: req.user.id,
          userRole: req.user.role as Role,
          action: `${req.method} ${req.path}`,
          resourceType: 'api',
          resourceId: req.path,
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('user-agent') || 'unknown'
        }).catch(err => console.error('Failed to log API access:', err));
      }

      return originalSend.call(this, data);
    };

    next();
  };
}
