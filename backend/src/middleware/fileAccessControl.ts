import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { FileCategory } from '../types/fileStorage';

/**
 * Middleware to check if user can access a specific file
 * Implements role-based and resource-level access control
 */
export const canAccessFile = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
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

  const fileKey = req.params['key'];
  if (!fileKey) {
    res.status(400).json({
      error: {
        code: 'MISSING_FILE_KEY',
        message: 'File key is required',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
    return;
  }

  // Parse file key to extract employee ID and category
  const { employeeId, category, isSystemFile } = parseFileKey(fileKey);

  // Super Admin and HR Manager can access all files
  if (['super_admin', 'hr_manager'].includes(req.user.role)) {
    next();
    return;
  }

  // System files (templates, training materials) - accessible by all authenticated users
  if (isSystemFile) {
    next();
    return;
  }

  // Employee-specific files
  if (employeeId) {
    // Employees can only access their own files
    if (req.user.employeeId === employeeId) {
      next();
      return;
    }

    // Department managers can access their team's files (simplified - in real implementation, check hierarchy)
    if (req.user.role === 'department_manager') {
      // TODO: Implement proper hierarchy check
      next();
      return;
    }

    // Finance role can access payslips and bank-related documents
    if (req.user.role === 'finance' && ['payslip', 'contract'].includes(category)) {
      next();
      return;
    }

    // IT Admin can access profile photos for system management
    if (req.user.role === 'it_admin' && category === 'profile-photo') {
      next();
      return;
    }
  }

  res.status(403).json({
    error: {
      code: 'ACCESS_DENIED',
      message: 'You do not have permission to access this file',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
};

/**
 * Middleware to check if user can upload files for a specific employee
 */
export const canUploadFile = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
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

  const { employeeId, category } = req.body;

  // Super Admin and HR Manager can upload files for any employee
  if (['super_admin', 'hr_manager'].includes(req.user.role)) {
    next();
    return;
  }

  // System files - only admins can upload
  if (!employeeId) {
    if (['super_admin', 'hr_manager', 'it_admin'].includes(req.user.role)) {
      next();
      return;
    }
    res.status(403).json({
      error: {
        code: 'ACCESS_DENIED',
        message: 'Only administrators can upload system files',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
    return;
  }

  // Employee-specific files
  if (employeeId) {
    // Employees can upload their own files (except payslips and contracts)
    if (req.user.employeeId === employeeId) {
      const restrictedCategories = [FileCategory.PAYSLIP, FileCategory.CONTRACT];
      if (restrictedCategories.includes(category)) {
        res.status(403).json({
          error: {
            code: 'ACCESS_DENIED',
            message: `Employees cannot upload ${category} files. Contact HR or Finance.`,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }
      next();
      return;
    }

    // Department managers can upload files for their team members
    if (req.user.role === 'department_manager') {
      // TODO: Implement proper hierarchy check
      next();
      return;
    }

    // Finance role can upload payslips and contracts
    if (req.user.role === 'finance' && [FileCategory.PAYSLIP, FileCategory.CONTRACT].includes(category)) {
      next();
      return;
    }
  }

  res.status(403).json({
    error: {
      code: 'ACCESS_DENIED',
      message: 'You do not have permission to upload files for this employee',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
};

/**
 * Middleware to check if user can delete files
 */
export const canDeleteFile = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
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

  const fileKey = req.params['key'];
  if (!fileKey) {
    res.status(400).json({
      error: {
        code: 'MISSING_FILE_KEY',
        message: 'File key is required',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
    return;
  }

  const { employeeId, category, isSystemFile } = parseFileKey(fileKey);

  // Super Admin can delete any file
  if (req.user.role === 'super_admin') {
    next();
    return;
  }

  // HR Manager can delete employee files but not system files
  if (req.user.role === 'hr_manager' && !isSystemFile) {
    next();
    return;
  }

  // System files - only super admin can delete
  if (isSystemFile) {
    res.status(403).json({
      error: {
        code: 'ACCESS_DENIED',
        message: 'Only super administrators can delete system files',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
    return;
  }

  // Employee-specific files
  if (employeeId) {
    // Employees can delete their own files (except payslips and contracts)
    if (req.user.employeeId === employeeId) {
      const restrictedCategories = [FileCategory.PAYSLIP, FileCategory.CONTRACT];
      if (restrictedCategories.includes(category as FileCategory)) {
        res.status(403).json({
          error: {
            code: 'ACCESS_DENIED',
            message: `Employees cannot delete ${category} files. Contact HR or Finance.`,
            timestamp: new Date().toISOString(),
            requestId: req.headers['x-request-id'] || 'unknown',
          },
        });
        return;
      }
      next();
      return;
    }

    // Finance role can delete payslips and contracts
    if (req.user.role === 'finance' && [FileCategory.PAYSLIP, FileCategory.CONTRACT].includes(category as FileCategory)) {
      next();
      return;
    }
  }

  res.status(403).json({
    error: {
      code: 'ACCESS_DENIED',
      message: 'You do not have permission to delete this file',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
};

/**
 * Middleware to check if user can list files for a specific employee
 */
export const canListFiles = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
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

  const { employeeId } = req.query;

  // Super Admin and HR Manager can list all files
  if (['super_admin', 'hr_manager'].includes(req.user.role)) {
    next();
    return;
  }

  // If no specific employee ID, allow listing (will be filtered by other logic)
  if (!employeeId) {
    next();
    return;
  }

  // Employees can only list their own files
  if (req.user.employeeId === employeeId) {
    next();
    return;
  }

  // Department managers can list their team's files
  if (req.user.role === 'department_manager') {
    // TODO: Implement proper hierarchy check
    next();
    return;
  }

  res.status(403).json({
    error: {
      code: 'ACCESS_DENIED',
      message: 'You do not have permission to list files for this employee',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  });
};

/**
 * Parse file key to extract employee ID, category, and determine if it's a system file
 */
function parseFileKey(fileKey: string): {
  employeeId?: string;
  category: string;
  isSystemFile: boolean;
} {
  const parts = fileKey.split('/');
  
  if (parts[0] === 'system') {
    return {
      category: parts[1] || 'other',
      isSystemFile: true,
    };
  }
  
  if (parts[0] === 'employees' && parts.length >= 3) {
    const result: { employeeId?: string; category: string; isSystemFile: boolean } = {
      category: parts[2] || 'document',
      isSystemFile: false,
    };
    
    if (parts[1]) {
      result.employeeId = parts[1];
    }
    
    return result;
  }
  
  return {
    category: 'other',
    isSystemFile: false,
  };
}

/**
 * Middleware to validate signed URL request parameters
 */
export const validateSignedUrlRequest = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const { operation, expiresIn } = req.query;
  
  // Validate operation parameter
  if (operation && !['getObject', 'putObject'].includes(operation as string)) {
    res.status(400).json({
      error: {
        code: 'INVALID_OPERATION',
        message: 'Operation must be either "getObject" or "putObject"',
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown',
      },
    });
    return;
  }

  // Validate expiresIn parameter
  if (expiresIn) {
    const expiresInNum = parseInt(expiresIn as string, 10);
    if (isNaN(expiresInNum) || expiresInNum < 1 || expiresInNum > 86400) { // Max 24 hours
      res.status(400).json({
        error: {
          code: 'INVALID_EXPIRES_IN',
          message: 'expiresIn must be a number between 1 and 86400 seconds (24 hours)',
          timestamp: new Date().toISOString(),
          requestId: req.headers['x-request-id'] || 'unknown',
        },
      });
      return;
    }
  }

  next();
};

/**
 * Middleware to log file access for audit purposes
 */
export const logFileAccess = (action: 'upload' | 'download' | 'delete' | 'list' | 'signed_url') => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    // Log the file access attempt
    const logData = {
      timestamp: new Date().toISOString(),
      userId: req.user?.id,
      employeeId: req.user?.employeeId,
      role: req.user?.role,
      action,
      fileKey: req.params['key'] || req.body?.key,
      targetEmployeeId: req.body?.employeeId || req.query?.['employeeId'],
      category: req.body?.category || req.query?.['category'],
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      requestId: req.headers['x-request-id'] || 'unknown',
    };

    // In a real implementation, this would be stored in an audit log table
    console.log('File Access Log:', JSON.stringify(logData, null, 2));

    next();
  };
};