import apiClient from './api';

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

export interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  channel: 'in_app' | 'email' | 'push';
  variables?: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface GetNotificationsResponse {
  data: Notification[];
  pagination: {
    limit: number;
    offset: number;
    unreadCount: number;
  };
}

export interface CreateTemplateDTO {
  name: string;
  subject: string;
  body: string;
  channel: 'in_app' | 'email' | 'push';
  variables?: string[];
  is_active?: boolean;
}

export interface UpdateTemplateDTO {
  name?: string;
  subject?: string;
  body?: string;
  channel?: 'in_app' | 'email' | 'push';
  variables?: string[];
  is_active?: boolean;
}

class NotificationService {
  async getNotifications(limit: number = 50, offset: number = 0): Promise<GetNotificationsResponse> {
    const response = await apiClient.get<GetNotificationsResponse>(
      '/notifications',
      {
        params: { limit, offset },
      }
    );
    return response.data;
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await apiClient.put<Notification>(
      `/notifications/${notificationId}/read`,
      {}
    );
    return response.data;
  }

  async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    await apiClient.put(
      '/notifications/mark-read',
      { ids: notificationIds }
    );
  }

  async getTemplates(activeOnly: boolean = true): Promise<{ data: NotificationTemplate[]; count: number }> {
    const response = await apiClient.get<{ data: NotificationTemplate[]; count: number }>(
      '/notifications/templates',
      {
        params: { activeOnly },
      }
    );
    return response.data;
  }

  async getTemplate(templateId: string): Promise<NotificationTemplate> {
    const response = await apiClient.get<NotificationTemplate>(
      `/notifications/templates/${templateId}`
    );
    return response.data;
  }

  async createTemplate(data: CreateTemplateDTO): Promise<NotificationTemplate> {
    const response = await apiClient.post<NotificationTemplate>(
      '/notifications/templates',
      data
    );
    return response.data;
  }

  async updateTemplate(templateId: string, data: UpdateTemplateDTO): Promise<NotificationTemplate> {
    const response = await apiClient.put<NotificationTemplate>(
      `/notifications/templates/${templateId}`,
      data
    );
    return response.data;
  }

  async deleteTemplate(templateId: string): Promise<void> {
    await apiClient.delete(`/notifications/templates/${templateId}`);
  }
}

export default new NotificationService();
