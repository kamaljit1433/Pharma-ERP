import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../types/auth';
import { Knex } from 'knex';

export function createNotificationRoutes(knex: Knex): Router {
  const router = Router();
  const notificationController = new NotificationController(knex);

  /**
   * Notification endpoints
   */

  // GET /api/v1/notifications - Get user notifications
  router.get('/', authenticateToken as any, (req, res, next) =>
    notificationController.getNotifications(req as any, res, next)
  );

  // PUT /api/v1/notifications/:id/read - Mark notification as read
  router.put('/:id/read', authenticateToken as any, (req, res, next) =>
    notificationController.markAsRead(req as any, res, next)
  );

  /**
   * Template endpoints (admin only)
   */

  // POST /api/v1/notifications/templates - Create template
  router.post(
    '/templates',
    authenticateToken as any,
    authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any,
    (req, res, next) => notificationController.createTemplate(req as any, res, next)
  );

  // GET /api/v1/notifications/templates - List templates
  router.get(
    '/templates',
    authenticateToken as any,
    authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any,
    (req, res, next) => notificationController.getTemplates(req as any, res, next)
  );

  // GET /api/v1/notifications/templates/:id - Get specific template
  router.get(
    '/templates/:id',
    authenticateToken as any,
    authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any,
    (req, res, next) => notificationController.getTemplate(req as any, res, next)
  );

  // PUT /api/v1/notifications/templates/:id - Update template
  router.put(
    '/templates/:id',
    authenticateToken as any,
    authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any,
    (req, res, next) => notificationController.updateTemplate(req as any, res, next)
  );

  // DELETE /api/v1/notifications/templates/:id - Delete template
  router.delete(
    '/templates/:id',
    authenticateToken as any,
    authorize([UserRole.SUPER_ADMIN, UserRole.HR_MANAGER]) as any,
    (req, res, next) => notificationController.deleteTemplate(req as any, res, next)
  );

  return router;
}
