import axios from 'axios';

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class NotificationService {
  async getNotifications(limit: number = 50, offset: number = 0): Promise<GetNotificationsResponse> {
    const response = await axios.get<GetNotificationsResponse>(
      `${API_BASE_URL}/notifications`,
      {
        params: { limit, offset },
        withCredentials: true,
      }
    );
    return response.data;
  }

  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await axios.put<Notification>(
      `${API_BASE_URL}/notifications/${notificationId}/read`,
      {},
      { withCredentials: true }
    );
    return response.data;
  }

  async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    await axios.put(
      `${API_BASE_URL}/notifications/mark-read`,
      { ids: notificationIds },
      { withCredentials: true }
    );
  }

  async getTemplates(activeOnly: boolean = true): Promise<{ data: NotificationTemplate[]; count: number }> {
    const response = await axios.get<{ data: NotificationTemplate[]; count: number }>(
      `${API_BASE_URL}/notifications/templates`,
      {
        params: { activeOnly },
        withCredentials: true,
      }
    );
    return response.data;
  }

  async getTemplate(templateId: string): Promise<NotificationTemplate> {
    const response = await axios.get<NotificationTemplate>(
      `${API_BASE_URL}/notifications/templates/${templateId}`,
      { withCredentials: true }
    );
    return response.data;
  }

  async createTemplate(data: CreateTemplateDTO): Promise<NotificationTemplate> {
    const response = await axios.post<NotificationTemplate>(
      `${API_BASE_URL}/notifications/templates`,
      data,
      { withCredentials: true }
    );
    return response.data;
  }

  async updateTemplate(templateId: string, data: UpdateTemplateDTO): Promise<NotificationTemplate> {
    const response = await axios.put<NotificationTemplate>(
      `${API_BASE_URL}/notifications/templates/${templateId}`,
      data,
      { withCredentials: true }
    );
    return response.data;
  }

  async deleteTemplate(templateId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/notifications/templates/${templateId}`, {
      withCredentials: true,
    });
  }
}

export default new NotificationService();
