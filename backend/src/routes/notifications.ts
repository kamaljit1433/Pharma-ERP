import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { UserRole } from '../types/auth';
import { Knex } from 'knex';
import { NotificationService } from '../services/notificationService';
import { NotificationRepository } from '../repositories/notificationRepository';
import { DeviceTokenRepository } from '../repositories/deviceTokenRepository';
import { NotificationType, NotificationChannel } from '../types/notification';

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

  // PUT /api/v1/notifications/mark-read - Mark multiple notifications as read
  router.put('/mark-read', authenticateToken as any, (req, res, next) =>
    notificationController.markMultipleAsRead(req as any, res, next)
  );

  // PUT /api/v1/notifications/read-all - Mark all notifications as read
  router.put('/read-all', authenticateToken as any, (req, res, next) =>
    notificationController.markAllAsRead(req as any, res, next)
  );

  // PUT /api/v1/notifications/:id/read - Mark single notification as read
  router.put('/:id/read', authenticateToken as any, (req, res, next) =>
    notificationController.markAsRead(req as any, res, next)
  );

  // POST /api/v1/notifications/device-token - Register FCM device token
  router.post('/device-token', authenticateToken as any, (req, res, next) =>
    notificationController.registerDeviceToken(req as any, res, next)
  );

  // DELETE /api/v1/notifications/device-token - Unregister FCM device token
  router.delete('/device-token', authenticateToken as any, (req, res, next) =>
    notificationController.unregisterDeviceToken(req as any, res, next)
  );

  // POST /api/v1/notifications/test - Send a test push to the authenticated user
  router.post('/test', authenticateToken as any, async (req: any, res, next) => {
    try {
      const userEmployeeCode = req.user?.employeeId;
      if (!userEmployeeCode) { res.status(401).json({ error: 'No employee linked to this account' }); return; }
      const emp = await knex('employees').where({ employee_id: userEmployeeCode }).select('id').first();
      const employeeId = emp?.id;
      if (!employeeId) { res.status(404).json({ error: 'Employee record not found' }); return; }

      const notifRepo = new NotificationRepository(knex);
      const tokenRepo = new DeviceTokenRepository(knex);
      const service = new NotificationService(notifRepo, tokenRepo);

      await service.sendNotification({
        employeeId,
        type: NotificationType.SYSTEM_NOTIFICATION,
        title: '🔔 FCM Test',
        body: 'Push notifications are working!',
        channels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
      });

      res.json({ success: true, message: 'Test notification sent' });
    } catch (error) {
      return next(error);
    }
  });

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
