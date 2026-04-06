/**
 * Audit Log Repository
 * Handles all audit log database operations
 */

import knex from '../config/knex';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../types/rbac';

export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userRole: Role;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
  reason?: string;
}

export interface CreateAuditLogDTO {
  userId: string;
  userRole: Role;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  status?: 'success' | 'failure';
  reason?: string;
}

export class AuditLogRepository {
  /**
   * Create a new audit log entry
   */
  async create(data: CreateAuditLogDTO): Promise<AuditLog> {
    let changesJson: string | null = null;
    if (data.changes) {
      try {
        changesJson = JSON.stringify(data.changes);
      } catch {
        changesJson = null; // Skip un-serializable changes rather than crashing
      }
    }

    const [record] = await knex('audit_logs').insert({
      id: uuidv4(),
      timestamp: new Date(),
      user_id: data.userId,
      user_role: data.userRole,
      action: data.action,
      resource_type: data.resourceType,
      resource_id: data.resourceId,
      changes: changesJson,
      ip_address: data.ipAddress,
      user_agent: data.userAgent,
      status: data.status || 'success',
      reason: data.reason
    }).returning('*');

    if (!record) {
      throw new Error('Failed to create audit log — insert returned no rows');
    }

    return this.mapToAuditLog(record);
  }

  /**
   * Get audit log by ID
   */
  async getById(id: string): Promise<AuditLog> {
    const log = await knex('audit_logs').where({ id }).first();

    if (!log) {
      throw new Error(`Audit log not found: ${id}`);
    }

    return this.mapToAuditLog(log);
  }

  /**
   * Get audit logs for a user
   */
  async getByUserId(userId: string, limit: number = 100, offset: number = 0): Promise<AuditLog[]> {
    const logs = await knex('audit_logs')
      .where({ user_id: userId })
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .offset(offset);

    return logs.map((log: any) => this.mapToAuditLog(log));
  }

  /**
   * Get audit logs for a resource
   */
  async getByResource(
    resourceType: string,
    resourceId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<AuditLog[]> {
    const logs = await knex('audit_logs')
      .where({ resource_type: resourceType, resource_id: resourceId })
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .offset(offset);

    return logs.map((log: any) => this.mapToAuditLog(log));
  }

  /**
   * Get audit logs for a date range
   */
  async getByDateRange(
    startDate: Date,
    endDate: Date,
    limit: number = 1000,
    offset: number = 0
  ): Promise<AuditLog[]> {
    const logs = await knex('audit_logs')
      .whereBetween('timestamp', [startDate, endDate])
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .offset(offset);

    return logs.map((log: any) => this.mapToAuditLog(log));
  }

  /**
   * Get audit logs with filters
   */
  async search(filters: {
    userId?: string;
    userRole?: Role;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    status?: 'success' | 'failure';
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    let query = knex('audit_logs');

    if (filters.userId) {
      query = query.where('user_id', filters.userId);
    }

    if (filters.userRole) {
      query = query.where('user_role', filters.userRole);
    }

    if (filters.action) {
      query = query.where('action', 'ilike', `%${filters.action}%`);
    }

    if (filters.resourceType) {
      query = query.where('resource_type', filters.resourceType);
    }

    if (filters.resourceId) {
      query = query.where('resource_id', filters.resourceId);
    }

    if (filters.status) {
      query = query.where('status', filters.status);
    }

    if (filters.startDate && filters.endDate) {
      query = query.whereBetween('timestamp', [filters.startDate, filters.endDate]);
    }

    // Get total count
    const countResult = await query.clone().count('* as count').first();
    const total = Number(countResult?.['count'] ?? 0);

    // Get paginated results
    const logs = await query
      .orderBy('timestamp', 'desc')
      .limit(filters.limit || 100)
      .offset(filters.offset || 0);

    return {
      logs: logs.map((log: any) => this.mapToAuditLog(log)),
      total
    };
  }

  /**
   * Get failed access attempts
   */
  async getFailedAccessAttempts(
    userId?: string,
    limit: number = 100
  ): Promise<AuditLog[]> {
    let query = knex('audit_logs').where({ status: 'failure' });

    if (userId) {
      query = query.where('user_id', userId);
    }

    const logs = await query
      .orderBy('timestamp', 'desc')
      .limit(limit);

    return logs.map((log: any) => this.mapToAuditLog(log));
  }

  /**
   * Get sensitive operations (create, update, delete)
   */
  async getSensitiveOperations(
    resourceType: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<AuditLog[]> {
    const logs = await knex('audit_logs')
      .where('resource_type', resourceType)
      .whereIn('action', ['create', 'update', 'delete'])
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .offset(offset);

    return logs.map((log: any) => this.mapToAuditLog(log));
  }

  /**
   * Delete old audit logs (retention policy)
   */
  async deleteOlderThan(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return knex('audit_logs')
      .where('timestamp', '<', cutoffDate)
      .delete();
  }

  /**
   * Map database row to AuditLog object
   */
  private mapToAuditLog(row: any): AuditLog {
    let changes: Record<string, any> | undefined;
    if (row.changes) {
      try {
        changes = JSON.parse(row.changes);
      } catch {
        // Return undefined rather than crashing on a corrupted row
      }
    }
    // Use conditional spread to satisfy exactOptionalPropertyTypes —
    // the property must be absent, not set to undefined, when there are no changes.
    return {
      id: row.id,
      timestamp: new Date(row.timestamp),
      userId: row.user_id,
      userRole: row.user_role,
      action: row.action,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      ...(changes !== undefined ? { changes } : {}),
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      status: row.status,
      ...(row.reason !== undefined && row.reason !== null ? { reason: row.reason } : {}),
    };
  }
}

export const auditLogRepository = new AuditLogRepository();
