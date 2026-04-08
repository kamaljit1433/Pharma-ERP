import { Knex } from 'knex';

export interface NotificationTemplate {
  id: string;
  name: string;
  type?: string;
  subject: string;
  body: string;
  channel?: 'in_app' | 'email' | 'push';
  variables: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateNotificationTemplateDTO {
  name: string;
  type?: string;
  subject: string;
  body: string;
  channel?: 'in_app' | 'email' | 'push';
  variables?: string[];
  is_active?: boolean;
}

export interface UpdateNotificationTemplateDTO {
  name?: string;
  type?: string;
  subject?: string;
  body?: string;
  channel?: 'in_app' | 'email' | 'push';
  variables?: string[];
  is_active?: boolean;
}

export class NotificationTemplateRepository {
  constructor(private knex: Knex) {}

  async createTemplate(data: CreateNotificationTemplateDTO): Promise<NotificationTemplate> {
    const [template] = await this.knex('notification_templates')
      .insert({
        name: data.name,
        type: data.type,
        subject: data.subject,
        body: data.body,
        channel: data.channel,
        variables: JSON.stringify(data.variables ?? []),
        is_active: data.is_active !== false,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    return this.mapToTemplate(template);
  }

  // Alias for backward compatibility
  async create(data: CreateNotificationTemplateDTO): Promise<NotificationTemplate> {
    return this.createTemplate(data);
  }

  async getTemplateById(id: string): Promise<NotificationTemplate | null> {
    const row = await this.knex('notification_templates').where({ id }).first();
    return row ? this.mapToTemplate(row) : null;
  }

  async getById(id: string): Promise<NotificationTemplate | null> {
    return this.getTemplateById(id);
  }

  async getTemplateByName(name: string): Promise<NotificationTemplate | null> {
    const row = await this.knex('notification_templates').where({ name }).first();
    return row ? this.mapToTemplate(row) : null;
  }

  async getByName(name: string): Promise<NotificationTemplate | null> {
    return this.getTemplateByName(name);
  }

  async getTemplatesByType(type: string): Promise<NotificationTemplate[]> {
    const rows = await this.knex('notification_templates').where({ type });
    return rows.map((r: any) => this.mapToTemplate(r));
  }

  async getAllTemplates(): Promise<NotificationTemplate[]> {
    const rows = await this.knex('notification_templates').orderBy('name', 'asc');
    return rows.map((r: any) => this.mapToTemplate(r));
  }

  async getActiveTemplates(): Promise<NotificationTemplate[]> {
    const rows = await this.knex('notification_templates')
      .where({ is_active: true })
      .orderBy('name', 'asc');
    return rows.map((r: any) => this.mapToTemplate(r));
  }

  async getAll(activeOnly: boolean = true): Promise<NotificationTemplate[]> {
    return activeOnly ? this.getActiveTemplates() : this.getAllTemplates();
  }

  async getByChannel(channel: 'in_app' | 'email' | 'push'): Promise<NotificationTemplate[]> {
    const rows = await this.knex('notification_templates')
      .where({ channel, is_active: true })
      .orderBy('name', 'asc');
    return rows.map((r: any) => this.mapToTemplate(r));
  }

  async updateTemplate(id: string, data: UpdateNotificationTemplateDTO): Promise<NotificationTemplate> {
    const updateData: any = { ...data, updated_at: new Date() };
    if (data.variables !== undefined) {
      updateData.variables = JSON.stringify(data.variables);
    }

    const [template] = await this.knex('notification_templates')
      .where({ id })
      .update(updateData)
      .returning('*');

    return this.mapToTemplate(template);
  }

  async update(id: string, data: UpdateNotificationTemplateDTO): Promise<NotificationTemplate> {
    return this.updateTemplate(id, data);
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.knex('notification_templates').where({ id }).del();
  }

  async delete(id: string): Promise<number> {
    await this.deleteTemplate(id);
    return 1;
  }

  async exists(name: string, excludeId?: string): Promise<boolean> {
    let query = this.knex('notification_templates').where({ name });
    if (excludeId) query = query.whereNot('id', excludeId);
    const result = await query.first();
    return !!result;
  }

  private mapToTemplate(row: any): NotificationTemplate {
    let variables: string[] = [];
    if (row.variables) {
      try {
        const parsed = typeof row.variables === 'string' ? JSON.parse(row.variables) : row.variables;
        variables = Array.isArray(parsed) ? parsed : [];
      } catch {
        variables = [];
      }
    }

    return {
      id: row.id,
      name: row.name,
      type: row.type,
      subject: row.subject,
      body: row.body,
      channel: row.channel,
      variables,
      is_active: Boolean(row.is_active),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }
}
