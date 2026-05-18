import { Response, NextFunction } from 'express';
import { Knex } from 'knex';
import { NotificationRepository } from '../repositories/notificationRepository';
import { DeviceTokenRepository } from '../repositories/deviceTokenRepository';
import {
  NotificationTemplateRepository,
  CreateNotificationTemplateDTO,
  UpdateNotificationTemplateDTO,
} from '../repositories/notificationTemplateRepository';
import { AuthenticatedRequest } from '../middleware/auth';

export class NotificationController {
  private notificationRepository: NotificationRepository;
  private deviceTokenRepository: DeviceTokenRepository;
  private templateRepository: NotificationTemplateRepository;

  constructor(private knex: Knex) {
    this.notificationRepository = new NotificationRepository(knex);
    this.deviceTokenRepository = new DeviceTokenRepository(knex);
    this.templateRepository = new NotificationTemplateRepository(knex);
  }

  private async resolveEmployeeUUID(user: any): Promise<string | null> {
    if (!user) return null;
    // user.employeeId is the HR code (e.g. "EMP001") — look up the UUID
    if (user.employeeId) {
      const row = await this.knex('employees')
        .where({ employee_id: user.employeeId })
        .select('id')
        .first();
      if (row) return row.id;
    }
    return null;
  }

  /**
   * GET /api/v1/notifications
   * Get user notifications with pagination
   */
  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employeeId = await this.resolveEmployeeUUID(req.user);
      if (!employeeId) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      const limit = Math.min(Number(req.query['limit']) || 50, 100);
      const offset = Number(req.query['offset']) || 0;

      const notifications = await this.notificationRepository.getByEmployeeId(
        employeeId,
        limit,
        offset
      );

      const unreadCount = await this.notificationRepository.getUnreadCount(employeeId);

      res.json({
        data: notifications,
        pagination: {
          limit,
          offset,
          unreadCount,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * PUT /api/v1/notifications/:id/read
   * Mark a notification as read
   */
  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const employeeId = await this.resolveEmployeeUUID(req.user);

      if (!employeeId) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      const notification = await this.notificationRepository.getById(id);

      if (!notification) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Notification not found',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // Verify ownership
      if (notification.employee_id !== employeeId) {
        res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to access this notification',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      const updated = await this.notificationRepository.markAsRead(id);
      res.json(updated);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /api/v1/notifications/device-token
   * Register an FCM device token for the authenticated employee
   */
  async registerDeviceToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employeeId = await this.resolveEmployeeUUID(req.user);
      if (!employeeId) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required', timestamp: new Date().toISOString() } });
        return;
      }

      const { token, deviceType } = req.body as { token?: string; deviceType?: string };
      if (!token || typeof token !== 'string' || token.trim() === '') {
        res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'token is required', timestamp: new Date().toISOString() } });
        return;
      }

      const validDeviceTypes = ['web', 'mobile', 'desktop'] as const;
      const normalizedType = (validDeviceTypes.includes(deviceType as any) ? deviceType : 'web') as 'web' | 'mobile' | 'desktop';

      const record = await this.deviceTokenRepository.upsert(employeeId, token.trim(), normalizedType);
      res.status(200).json({ data: record });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * DELETE /api/v1/notifications/device-token
   * Unregister (deactivate) an FCM device token
   */
  async unregisterDeviceToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employeeId = await this.resolveEmployeeUUID(req.user);
      if (!employeeId) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required', timestamp: new Date().toISOString() } });
        return;
      }

      const { token } = req.body as { token?: string };
      if (!token || typeof token !== 'string' || token.trim() === '') {
        res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'token is required', timestamp: new Date().toISOString() } });
        return;
      }

      await this.deviceTokenRepository.deactivate(employeeId, token.trim());
      res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * PUT /api/v1/notifications/mark-read
   * Mark multiple notifications as read by ID array
   */
  async markMultipleAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employeeId = await this.resolveEmployeeUUID(req.user);
      if (!employeeId) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required', timestamp: new Date().toISOString() } });
        return;
      }

      const { ids } = req.body as { ids?: string[] };
      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'ids must be a non-empty array', timestamp: new Date().toISOString() } });
        return;
      }

      await this.notificationRepository.markMultipleAsRead(ids);
      res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * PUT /api/v1/notifications/read-all
   * Mark all notifications for the authenticated employee as read
   */
  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employeeId = await this.resolveEmployeeUUID(req.user);
      if (!employeeId) {
        res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required', timestamp: new Date().toISOString() } });
        return;
      }

      await this.notificationRepository.markAllAsRead(employeeId);
      res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /api/v1/notifications/templates
   * Create a notification template (admin only)
   */
  async createTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { name, subject, body, channel, variables, is_active } = req.body;

      // Validate required fields
      if (!name || !subject || !body || !channel) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields: name, subject, body, channel',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // Check if template with same name already exists
      const exists = await this.templateRepository.exists(name);
      if (exists) {
        res.status(409).json({
          error: {
            code: 'CONFLICT',
            message: 'Template with this name already exists',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      const templateData: CreateNotificationTemplateDTO = {
        name,
        subject,
        body,
        channel,
        variables: variables || undefined,
        is_active: is_active !== false,
      };

      const template = await this.templateRepository.create(templateData);
      res.status(201).json(template);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/v1/notifications/templates
   * List notification templates (admin only)
   */
  async getTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const activeOnly = (req.query['activeOnly'] as string) !== 'false';
      const templates = await this.templateRepository.getAll(activeOnly);

      res.json({
        data: templates,
        count: templates.length,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/v1/notifications/templates/:id
   * Get a specific notification template (admin only)
   */
  async getTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const template = await this.templateRepository.getById(id);

      if (!template) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Template not found',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      res.json(template);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * PUT /api/v1/notifications/templates/:id
   * Update a notification template (admin only)
   */
  async updateTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;
      const { name, subject, body, channel, variables, is_active } = req.body;

      const template = await this.templateRepository.getById(id);
      if (!template) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Template not found',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      // Check if new name conflicts with existing template
      if (name && name !== template.name) {
        const exists = await this.templateRepository.exists(name, id);
        if (exists) {
          res.status(409).json({
            error: {
              code: 'CONFLICT',
              message: 'Template with this name already exists',
              timestamp: new Date().toISOString(),
            },
          });
          return;
        }
      }

      const updateData: UpdateNotificationTemplateDTO = {};
      if (name !== undefined) updateData.name = name;
      if (subject !== undefined) updateData.subject = subject;
      if (body !== undefined) updateData.body = body;
      if (channel !== undefined) updateData.channel = channel;
      if (variables !== undefined) updateData.variables = variables;
      if (is_active !== undefined) updateData.is_active = is_active;

      const updated = await this.templateRepository.update(id, updateData);
      res.json(updated);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * DELETE /api/v1/notifications/templates/:id
   * Delete a notification template (admin only)
   */
  async deleteTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params['id'] as string;

      const template = await this.templateRepository.getById(id);
      if (!template) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'Template not found',
            timestamp: new Date().toISOString(),
          },
        });
        return;
      }

      await this.templateRepository.delete(id);
      res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
}
