import { Knex } from 'knex';

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  channel: 'in_app' | 'email' | 'push';
  variables?: Record<string, any> | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateNotificationTemplateDTO {
  name: string;
  subject: string;
  body: string;
  channel: 'in_app' | 'email' | 'push';
  variables?: Record<string, any>;
  is_active?: boolean;
}

export interface UpdateNotificationTemplateDTO {
  name?: string;
  subject?: string;
  body?: string;
  channel?: 'in_app' | 'email' | 'push';
  variables?: Record<string, any>;
  is_active?: boolean;
}

export class NotificationTemplateRepository {
  constructor(private knex: Knex) {}

  async create(data: CreateNotificationTemplateDTO): Promise<NotificationTemplate> {
    const [template] = await this.knex('notification_templates')
      .insert({
        name: data.name,
        subject: data.subject,
        body: data.body,
        channel: data.channel,
        variables: data.variables || null,
        is_active: data.is_active !== false,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    return template;
  }

  async getById(id: string): Promise<NotificationTemplate | null> {
    return this.knex('notification_templates').where('id', id).first();
  }

  async getByName(name: string): Promise<NotificationTemplate | null> {
    return this.knex('notification_templates').where('name', name).first();
  }

  async getAll(activeOnly: boolean = true): Promise<NotificationTemplate[]> {
    let query = this.knex('notification_templates');

    if (activeOnly) {
      query = query.where('is_active', true);
    }

    return query.orderBy('name', 'asc');
  }

  async getByChannel(channel: 'in_app' | 'email' | 'push'): Promise<NotificationTemplate[]> {
    return this.knex('notification_templates')
      .where('channel', channel)
      .where('is_active', true)
      .orderBy('name', 'asc');
  }

  async update(id: string, data: UpdateNotificationTemplateDTO): Promise<NotificationTemplate> {
    const [template] = await this.knex('notification_templates')
      .where('id', id)
      .update({
        ...data,
        updated_at: new Date(),
      })
      .returning('*');

    return template;
  }

  async delete(id: string): Promise<number> {
    return this.knex('notification_templates').where('id', id).delete();
  }

  async exists(name: string, excludeId?: string): Promise<boolean> {
    let query = this.knex('notification_templates').where('name', name);

    if (excludeId) {
      query = query.whereNot('id', excludeId);
    }

    const result = await query.first();
    return !!result;
  }
}
