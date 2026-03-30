import { Response, NextFunction } from 'express';
import { Knex } from 'knex';
import { NotificationRepository } from '../repositories/notificationRepository';
import {
  NotificationTemplateRepository,
  CreateNotificationTemplateDTO,
  UpdateNotificationTemplateDTO,
} from '../repositories/notificationTemplateRepository';
import { AuthenticatedRequest } from '../middleware/auth';

export class NotificationController {
  private notificationRepository: NotificationRepository;
  private templateRepository: NotificationTemplateRepository;

  constructor(knex: Knex) {
    this.notificationRepository = new NotificationRepository(knex);
    this.templateRepository = new NotificationTemplateRepository(knex);
  }

  /**
   * GET /api/v1/notifications
   * Get user notifications with pagination
   */
  async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employeeId = req.user?.id;
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
      next(error);
    }
  }

  /**
   * PUT /api/v1/notifications/:id/read
   * Mark a notification as read
   */
  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const employeeId = req.user?.id;

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
      next(error);
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
      next(error);
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
      next(error);
    }
  }

  /**
   * GET /api/v1/notifications/templates/:id
   * Get a specific notification template (admin only)
   */
  async getTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
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
      next(error);
    }
  }

  /**
   * PUT /api/v1/notifications/templates/:id
   * Update a notification template (admin only)
   */
  async updateTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
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
      next(error);
    }
  }

  /**
   * DELETE /api/v1/notifications/templates/:id
   * Delete a notification template (admin only)
   */
  async deleteTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

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
      next(error);
    }
  }
}
