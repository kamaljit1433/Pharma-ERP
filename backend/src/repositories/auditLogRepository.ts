/**
 * Audit Log Repository
 * Handles all audit log database operations
 */

import defaultKnex from '../config/knex';
import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

export interface AuditLog {
  id: string;
  user_id: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  changes?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface CreateAuditLogDTO {
  user_id?: string;
  entity_type: string;
  entity_id: string;
  action: string;
  changes?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  // Legacy camelCase fields (used by auditLogService)
  userId?: string;
  userRole?: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  status?: 'success' | 'failure';
  reason?: string;
}

export class AuditLogRepository {
  private db: Knex;

  constructor(db?: Knex) {
    this.db = db || defaultKnex;
  }

  private mapRow(row: any): AuditLog {
    let changes: Record<string, any> | undefined;
    if (row.changes) {
      try {
        changes = typeof row.changes === 'string' ? JSON.parse(row.changes) : row.changes;
      } catch {
        // ignore corrupted changes
      }
    }
    return {
      id: row.id,
      user_id: row.performed_by ?? null,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      action: row.action,
      ...(changes !== undefined ? { changes } : {}),
      ip_address: row.ip_address,
      user_agent: row.user_agent,
      created_at: new Date(row.created_at),
    };
  }

  async createLog(data: CreateAuditLogDTO): Promise<AuditLog> {
    const [record] = await this.db('audit_logs')
      .insert({
        id: uuidv4(),
        performed_by: data.user_id ?? null,
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        action: data.action,
        changes: data.changes ? JSON.stringify(data.changes) : null,
      })
      .returning('*');

    if (!record) {
      throw new Error('Failed to create audit log — insert returned no rows');
    }

    return this.mapRow(record);
  }

  async getLogById(id: string): Promise<AuditLog | null> {
    const row = await this.db('audit_logs').where('id', id).first();
    return row ? this.mapRow(row) : null;
  }

  async getLogsByUser(userId: string): Promise<AuditLog[]> {
    // Guard against non-UUID values to avoid DB errors
    if (!userId || !userId.match(/^[0-9a-f-]{36}$/i)) {
      return [];
    }
    const rows = await this.db('audit_logs')
      .where('performed_by', userId)
      .orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapRow(r));
  }

  async getLogsByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    const rows = await this.db('audit_logs')
      .where('entity_type', entityType)
      .where('entity_id', entityId)
      .orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapRow(r));
  }

  async getLogsByAction(action: string): Promise<AuditLog[]> {
    const rows = await this.db('audit_logs')
      .where('action', action)
      .orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapRow(r));
  }

  async getLogsByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]> {
    const rows = await this.db('audit_logs')
      .whereBetween('created_at', [startDate, endDate])
      .orderBy('created_at', 'desc');
    return rows.map((r: any) => this.mapRow(r));
  }

  async getAllLogs(limit: number = 100, offset: number = 0): Promise<AuditLog[]> {
    const rows = await this.db('audit_logs')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
    return rows.map((r: any) => this.mapRow(r));
  }

  async getLogCount(userId?: string): Promise<number> {
    let query = this.db('audit_logs');
    if (userId) {
      if (!userId.match(/^[0-9a-f-]{36}$/i)) return 0;
      query = query.where('performed_by', userId);
    }
    const result = await query.count('* as count').first();
    return Number(result?.['count'] || 0);
  }

  async deleteOldLogs(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return this.db('audit_logs').where('created_at', '<', cutoffDate).delete();
  }

  // Legacy methods kept for backward compatibility
  async create(data: {
    userId: string;
    userRole?: string;
    action: string;
    resourceType: string;
    resourceId: string;
    changes?: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    status?: 'success' | 'failure';
    reason?: string;
  }): Promise<AuditLog> {
    return this.createLog({
      user_id: data.userId,
      entity_type: data.resourceType,
      entity_id: data.resourceId,
      action: data.action,
      changes: data.changes,
      ip_address: data.ipAddress,
      user_agent: data.userAgent,
    });
  }

  async getById(id: string): Promise<AuditLog> {
    const log = await this.getLogById(id);
    if (!log) throw new Error(`Audit log not found: ${id}`);
    return log;
  }

  async getByUserId(userId: string, limit = 100, offset = 0): Promise<AuditLog[]> {
    return this.getLogsByUser(userId);
  }

  async getByResource(resourceType: string, resourceId: string): Promise<AuditLog[]> {
    return this.getLogsByEntity(resourceType, resourceId);
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]> {
    return this.getLogsByDateRange(startDate, endDate);
  }

  async deleteOlderThan(days: number): Promise<number> {
    return this.deleteOldLogs(days);
  }

  async search(filters: {
    userId?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    let query = this.db('audit_logs');
    if (filters.userId) query = query.where('performed_by', filters.userId);
    if (filters.action) query = query.where('action', 'ilike', `%${filters.action}%`);
    if (filters.resourceType) query = query.where('entity_type', filters.resourceType);
    if (filters.resourceId) query = query.where('entity_id', filters.resourceId);
    if (filters.startDate && filters.endDate) {
      query = query.whereBetween('created_at', [filters.startDate, filters.endDate]);
    }
    const countResult = await query.clone().count('* as count').first();
    const total = Number(countResult?.['count'] ?? 0);
    const rows = await query
      .orderBy('created_at', 'desc')
      .limit(filters.limit || 100)
      .offset(filters.offset || 0);
    return { logs: rows.map((r: any) => this.mapRow(r)), total };
  }

  async getFailedAccessAttempts(userId?: string, limit = 100): Promise<AuditLog[]> {
    let query = this.db('audit_logs').where('action', 'ilike', '%fail%');
    if (userId) query = query.where('performed_by', userId);
    const rows = await query.orderBy('created_at', 'desc').limit(limit);
    return rows.map((r: any) => this.mapRow(r));
  }

  async getSensitiveOperations(resourceType: string, limit = 100, offset = 0): Promise<AuditLog[]> {
    const rows = await this.db('audit_logs')
      .where('entity_type', resourceType)
      .whereIn('action', ['CREATE', 'UPDATE', 'DELETE', 'create', 'update', 'delete'])
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
    return rows.map((r: any) => this.mapRow(r));
  }
}

export const auditLogRepository = new AuditLogRepository();
