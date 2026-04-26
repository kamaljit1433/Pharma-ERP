/**
 * Audit Log Service
 * Business logic for audit logging
 */

import { auditLogRepository, CreateAuditLogDTO, AuditLog } from '../repositories/auditLogRepository';
import { Role } from '../types/rbac';

export class AuditLogService {
  /**
   * Log a successful operation
   */
  async logAccess(data: Omit<CreateAuditLogDTO, 'status'>): Promise<AuditLog> {
    const mappedData: any = {
      user_id: data.userId || data.user_id,
      entity_type: data.entity_type || data.resourceType || 'unknown',
      entity_id: data.entity_id || data.resourceId || 'unknown',
      action: data.action,
      changes: data.changes,
      ip_address: data.ipAddress || data.ip_address,
      user_agent: data.userAgent || data.user_agent,
    };
    return auditLogRepository.create({
      ...mappedData,
      status: 'success'
    });
  }

  /**
   * Log a failed access attempt
   */
  async logAccessDenied(data: Omit<CreateAuditLogDTO, 'status'>): Promise<AuditLog> {
    const mappedData: any = {
      user_id: data.userId || data.user_id,
      entity_type: data.entity_type || data.resourceType || 'unknown',
      entity_id: data.entity_id || data.resourceId || 'unknown',
      action: data.action,
      changes: data.changes,
      ip_address: data.ipAddress || data.ip_address,
      user_agent: data.userAgent || data.user_agent,
      reason: data.reason,
    };
    return auditLogRepository.create({
      ...mappedData,
      status: 'failure'
    });
  }

  /**
   * Log employee creation
   */
  async logEmployeeCreated(
    userId: string,
    userRole: Role,
    employeeId: string,
    employeeData: any,
    ipAddress: string,
    userAgent: string
  ): Promise<AuditLog> {
    return auditLogRepository.create({
      userId,
      userRole,
      action: 'create_employee',
      resourceType: 'employee',
      resourceId: employeeId,
      changes: employeeData,
      ipAddress,
      userAgent,
      status: 'success'
    });
  }

  /**
   * Log employee update
   */
  async logEmployeeUpdated(
    userId: string,
    userRole: Role,
    employeeId: string,
    changes: any,
    ipAddress: string,
    userAgent: string
  ): Promise<AuditLog> {
    return auditLogRepository.create({
      userId,
      userRole,
      action: 'update_employee',
      resourceType: 'employee',
      resourceId: employeeId,
      changes,
      ipAddress,
      userAgent,
      status: 'success'
    });
  }

  /**
   * Log employee deletion
   */
  async logEmployeeDeleted(
    userId: string,
    userRole: Role,
    employeeId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<AuditLog> {
    return auditLogRepository.create({
      userId,
      userRole,
      action: 'delete_employee',
      resourceType: 'employee',
      resourceId: employeeId,
      ipAddress,
      userAgent,
      status: 'success'
    });
  }

  /**
   * Log payroll processing
   */
  async logPayrollProcessed(
    userId: string,
    userRole: Role,
    month: number,
    year: number,
    employeeCount: number,
    totalAmount: number,
    ipAddress: string,
    userAgent: string
  ): Promise<AuditLog> {
    return auditLogRepository.create({
      userId,
      userRole,
      action: 'process_payroll',
      resourceType: 'payroll',
      resourceId: `${year}-${month}`,
      changes: { employeeCount, totalAmount },
      ipAddress,
      userAgent,
      status: 'success'
    });
  }

  /**
   * Log payroll lock
   */
  async logPayrollLocked(
    userId: string,
    userRole: Role,
    payrollId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<AuditLog> {
    return auditLogRepository.create({
      userId,
      userRole,
      action: 'lock_payroll',
      resourceType: 'payroll',
      resourceId: payrollId,
      ipAddress,
      userAgent,
      status: 'success'
    });
  }

  /**
   * Log leave approval
   */
  async logLeaveApproved(
    userId: string,
    userRole: Role,
    leaveId: string,
    employeeId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<AuditLog> {
    return auditLogRepository.create({
      userId,
      userRole,
      action: 'approve_leave',
      resourceType: 'leave',
      resourceId: leaveId,
      changes: { employeeId, approvedBy: userId },
      ipAddress,
      userAgent,
      status: 'success'
    });
  }

  /**
   * Log leave rejection
   */
  async logLeaveRejected(
    userId: string,
    userRole: Role,
    leaveId: string,
    employeeId: string,
    reason: string,
    ipAddress: string,
    userAgent: string
  ): Promise<AuditLog> {
    return auditLogRepository.create({
      userId,
      userRole,
      action: 'reject_leave',
      resourceType: 'leave',
      resourceId: leaveId,
      changes: { employeeId, rejectedBy: userId, reason },
      ipAddress,
      userAgent,
      status: 'success'
    });
  }

  /**
   * Log bank details update
   */
  async logBankDetailsUpdated(
    userId: string,
    userRole: Role,
    employeeId: string,
    accountId: string,
    changes: any,
    ipAddress: string,
    userAgent: string
  ): Promise<AuditLog> {
    return auditLogRepository.create({
      userId,
      userRole,
      action: 'update_bank_details',
      resourceType: 'bank_account',
      resourceId: accountId,
      changes: { ...changes, employeeId },
      ipAddress,
      userAgent,
      status: 'success'
    });
  }

  /**
   * Log bank details verification
   */
  async logBankDetailsVerified(
    userId: string,
    userRole: Role,
    accountId: string,
    employeeId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<AuditLog> {
    return auditLogRepository.create({
      userId,
      userRole,
      action: 'verify_bank_details',
      resourceType: 'bank_account',
      resourceId: accountId,
      changes: { employeeId, verifiedBy: userId },
      ipAddress,
      userAgent,
      status: 'success'
    });
  }

  /**
   * Log document upload
   */
  async logDocumentUploaded(
    userId: string,
    userRole: Role,
    documentId: string,
    employeeId: string,
    documentType: string,
    ipAddress: string,
    userAgent: string
  ): Promise<AuditLog> {
    return auditLogRepository.create({
      userId,
      userRole,
      action: 'upload_document',
      resourceType: 'document',
      resourceId: documentId,
      changes: { employeeId, documentType },
      ipAddress,
      userAgent,
      status: 'success'
    });
  }

  /**
   * Log document deletion
   */
  async logDocumentDeleted(
    userId: string,
    userRole: Role,
    documentId: string,
    employeeId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<AuditLog> {
    return auditLogRepository.create({
      userId,
      userRole,
      action: 'delete_document',
      resourceType: 'document',
      resourceId: documentId,
      changes: { employeeId },
      ipAddress,
      userAgent,
      status: 'success'
    });
  }

  /**
   * Get audit logs for a user
   */
  async getUserAuditLogs(userId: string, limit: number = 100, offset: number = 0): Promise<AuditLog[]> {
    return auditLogRepository.getByUserId(userId, limit, offset);
  }

  /**
   * Get audit logs for a resource
   */
  async getResourceAuditLogs(
    resourceType: string,
    resourceId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<AuditLog[]> {
    return auditLogRepository.getByResource(resourceType, resourceId);
  }

  /**
   * Search audit logs
   */
  async searchAuditLogs(filters: any): Promise<{ logs: AuditLog[]; total: number }> {
    return auditLogRepository.search(filters);
  }

  /**
   * Get failed access attempts
   */
  async getFailedAccessAttempts(userId?: string, limit: number = 100): Promise<AuditLog[]> {
    return auditLogRepository.getFailedAccessAttempts(userId, limit);
  }

  /**
   * Get sensitive operations
   */
  async getSensitiveOperations(resourceType: string, limit: number = 100, offset: number = 0): Promise<AuditLog[]> {
    return auditLogRepository.getSensitiveOperations(resourceType, limit, offset);
  }

  /**
   * Clean up old audit logs
   */
  async cleanupOldLogs(days: number = 90): Promise<number> {
    return auditLogRepository.deleteOlderThan(days);
  }
}

export const auditLogService = new AuditLogService();
