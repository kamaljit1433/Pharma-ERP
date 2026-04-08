import { Knex } from 'knex';
import { v4 as uuidv4 } from 'uuid';

export interface AuditLogEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  performed_by?: string;
  changes?: Record<string, any>;
  created_at: Date;
}

/**
 * Log an audit event to the audit_logs table
 * @param db Knex database instance
 * @param entityType Type of entity being audited (e.g., 'employee')
 * @param entityId ID of the entity
 * @param action Action performed (e.g., 'employee_status_updated')
 * @param changes Object containing the changes made
 * @param performedBy Optional ID of the user who performed the action
 */
export async function logAuditEvent(
  db: Knex,
  entityType: string,
  entityId: string,
  action: string,
  changes?: Record<string, any>,
  performedBy?: string
): Promise<AuditLogEntry> {
  const auditEntry: AuditLogEntry = {
    id: uuidv4(),
    entity_type: entityType,
    entity_id: entityId,
    action,
    performed_by: performedBy,
    changes,
    created_at: new Date(),
  };

  await db('audit_logs').insert(auditEntry);

  return auditEntry;
}

/**
 * Get audit logs for a specific entity
 * @param db Knex database instance
 * @param entityType Type of entity
 * @param entityId ID of the entity
 * @param limit Maximum number of records to return
 * @param offset Number of records to skip
 */
export async function getAuditLogs(
  db: Knex,
  entityType: string,
  entityId: string,
  limit: number = 50,
  offset: number = 0
): Promise<AuditLogEntry[]> {
  return db('audit_logs')
    .where('entity_type', entityType)
    .where('entity_id', entityId)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);
}

/**
 * Get audit logs for a specific action
 * @param db Knex database instance
 * @param action Action to filter by
 * @param limit Maximum number of records to return
 * @param offset Number of records to skip
 */
export async function getAuditLogsByAction(
  db: Knex,
  action: string,
  limit: number = 50,
  offset: number = 0
): Promise<AuditLogEntry[]> {
  return db('audit_logs')
    .where('action', action)
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);
}
