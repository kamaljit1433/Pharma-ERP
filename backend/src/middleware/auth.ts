import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import knex from '../config/knex';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    employeeId?: string;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  employeeId?: string;
  iat?: number;
  exp?: number;
}

/**
 * Middleware to authenticate JWT token
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authReq = req as AuthenticatedRequest;
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: {
        code: 'MISSING_TOKEN',
        message: 'Access token is required',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
    return;
  }

  const token = authHeader.slice(7); // Remove 'Bearer ' prefix

  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: 'ems-api',
      audience: 'ems-client',
    }) as JWTPayload;
    authReq.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      ...(decoded.employeeId && { employeeId: decoded.employeeId }),
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Access token has expired',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid access token',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'TOKEN_VERIFICATION_ERROR',
        message: 'Failed to verify access token',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
  }
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (roles: string | string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user can access employee data.
 * targetEmployeeId is read exclusively from req.params to prevent parameter pollution.
 */
export const canAccessEmployeeData = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
    return;
  }

  // Use only req.params as the authoritative source to prevent parameter pollution
  const targetEmployeeId = req.params['employeeId'];

  // Super Admin and HR Manager can access all employee data
  if (['super_admin', 'hr_manager'].includes(req.user.role)) {
    next();
    return;
  }

  // Employees (and managers) can always access their own data
  if (req.user.employeeId === targetEmployeeId) {
    next();
    return;
  }

  // Department managers may only access employees in their own department
  if (req.user.role === 'department_manager' && req.user.employeeId && targetEmployeeId) {
    try {
      const [managerEmployee, targetEmployee] = await Promise.all([
        knex('employees').where({ employee_id: req.user.employeeId }).select('department_id').first(),
        knex('employees').where({ employee_id: targetEmployeeId }).select('department_id').first(),
      ]);

      if (
        managerEmployee?.department_id &&
        targetEmployee?.department_id &&
        managerEmployee.department_id === targetEmployee.department_id
      ) {
        next();
        return;
      }
    } catch {
      // Fall through to deny on DB error
    }
  }

  res.status(403).json({
    error: {
      code: 'ACCESS_DENIED',
      message: 'You do not have permission to access this employee data',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
};
