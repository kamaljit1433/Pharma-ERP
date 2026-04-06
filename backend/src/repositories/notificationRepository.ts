import { Knex } from 'knex';

export interface Notification {
  id: string;
  employee_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  channel: 'in_app' | 'email' | 'push';
  is_read: boolean;
  read_at?: Date | null;
  metadata?: Record<string, any> | null;
  created_at: Date;
}

export interface CreateNotificationDTO {
  employee_id: string;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  channel?: 'in_app' | 'email' | 'push';
  metadata?: Record<string, any>;
}

export class NotificationRepository {
  constructor(private knex: Knex) {}

  async create(data: CreateNotificationDTO): Promise<Notification> {
    const [notification] = await this.knex('notifications')
      .insert({
        employee_id: data.employee_id,
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        channel: data.channel || 'in_app',
        is_read: false,
        metadata: data.metadata || null,
        created_at: new Date(),
      })
      .returning('*');

    return notification;
  }

  async getById(id: string): Promise<Notification | null> {
    return this.knex('notifications').where('id', id).first();
  }

  async getByEmployeeId(
    employeeId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Notification[]> {
    return this.knex('notifications')
      .where('employee_id', employeeId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async markAsRead(id: string): Promise<Notification> {
    const [notification] = await this.knex('notifications')
      .where('id', id)
      .update({
        is_read: true,
        read_at: new Date(),
      })
      .returning('*');

    return notification;
  }

  async markMultipleAsRead(ids: string[]): Promise<number> {
    return this.knex('notifications')
      .whereIn('id', ids)
      .update({
        is_read: true,
        read_at: new Date(),
      });
  }

  async getUnreadCount(employeeId: string): Promise<number> {
    const result = await this.knex('notifications')
      .where('employee_id', employeeId)
      .where('is_read', false)
      .count('id as count')
      .first();

    return (result?.['count'] as number) || 0;
  }

  async delete(id: string): Promise<number> {
    return this.knex('notifications').where('id', id).delete();
  }

  async deleteOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.knex('notifications')
      .where('created_at', '<', cutoffDate)
      .delete();
  }

  /**
   * Load notification templates from DB.
   * Returns empty array if the table does not exist.
   */
  async getTemplates(): Promise<any[]> {
    try {
      const hasTable = await this.knex.schema.hasTable('notification_templates');
      if (!hasTable) return [];
      return this.knex('notification_templates').select('*');
    } catch {
      return [];
    }
  }
}
