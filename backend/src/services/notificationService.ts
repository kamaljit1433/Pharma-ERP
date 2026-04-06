import logger from '../utils/logger';
import { NotificationProviderFactory } from './factories/NotificationProviderFactory';
import { NotificationRepository } from '../repositories/notificationRepository';
import config from '../config';
import {
  NotificationType,
  NotificationChannel,
  SendNotificationDTO,
  SendBulkNotificationDTO,
  SendTopicNotificationDTO,
  PushNotificationPayload,
  NotificationTemplate,
  NotificationProvider,
} from '../types/notification';

export class NotificationService {
  private fcmProvider: NotificationProvider | null = null;
  private notificationTemplates: Map<NotificationType, NotificationTemplate> = new Map();
  private notificationRepository: NotificationRepository | null = null;

  constructor(notificationRepository?: NotificationRepository) {
    this.notificationRepository = notificationRepository || null;
    this.initializeFCM();
    this.initializeTemplates();
    // Attempt to overlay DB-stored templates on top of defaults.
    // This is fire-and-forget; if the table doesn't exist we keep the hard-coded defaults.
    this.loadTemplatesFromDB().catch(() => {
      logger.debug('notification_templates table not available, using defaults');
    });
  }

  /**
   * Attempt to load notification templates from the database.
   * Overlays any DB-stored templates on top of the built-in defaults.
   */
  private async loadTemplatesFromDB(): Promise<void> {
    if (!this.notificationRepository) return;

    try {
      const dbTemplates = await this.notificationRepository.getTemplates();
      if (dbTemplates && Array.isArray(dbTemplates)) {
        for (const tpl of dbTemplates) {
          this.notificationTemplates.set(tpl.type, tpl);
        }
        logger.info('Loaded notification templates from database', { count: dbTemplates.length });
      }
    } catch {
      // Table may not exist yet — safe to ignore
    }
  }

  private initializeFCM(): void {
    try {
      this.fcmProvider = NotificationProviderFactory.createProvider();
      if (this.fcmProvider) {
        logger.info('Notification Provider initialized successfully');
      } else {
        logger.warn('Notifications are disabled. Push notifications will not be sent.');
      }
    } catch (error: any) {
      logger.error('Failed to initialize Notification Provider:', error.message);
    }
  }

  private initializeTemplates(): void {
    // Initialize default notification templates
    this.notificationTemplates.set(NotificationType.LEAVE_APPROVED, {
      id: 'leave_approved',
      type: NotificationType.LEAVE_APPROVED,
      title: 'Leave Approved',
      body: 'Your leave request has been approved',
      channels: [NotificationChannel.PUSH, NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.notificationTemplates.set(NotificationType.LEAVE_REJECTED, {
      id: 'leave_rejected',
      type: NotificationType.LEAVE_REJECTED,
      title: 'Leave Rejected',
      body: 'Your leave request has been rejected',
      channels: [NotificationChannel.PUSH, NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.notificationTemplates.set(NotificationType.PAYROLL_PROCESSED, {
      id: 'payroll_processed',
      type: NotificationType.PAYROLL_PROCESSED,
      title: 'Payroll Processed',
      body: 'Your salary has been processed for this month',
      channels: [NotificationChannel.PUSH, NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.notificationTemplates.set(NotificationType.PAYSLIP_READY, {
      id: 'payslip_ready',
      type: NotificationType.PAYSLIP_READY,
      title: 'Payslip Ready',
      body: 'Your payslip is ready for download',
      channels: [NotificationChannel.PUSH, NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.notificationTemplates.set(NotificationType.BIRTHDAY_WISH, {
      id: 'birthday_wish',
      type: NotificationType.BIRTHDAY_WISH,
      title: 'Happy Birthday!',
      body: 'Wishing you a wonderful birthday!',
      channels: [NotificationChannel.PUSH, NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.notificationTemplates.set(NotificationType.INTERVIEW_SCHEDULED, {
      id: 'interview_scheduled',
      type: NotificationType.INTERVIEW_SCHEDULED,
      title: 'Interview Scheduled',
      body: 'Your interview has been scheduled',
      channels: [NotificationChannel.PUSH, NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.notificationTemplates.set(NotificationType.SYSTEM_NOTIFICATION, {
      id: 'system_notification',
      type: NotificationType.SYSTEM_NOTIFICATION,
      title: 'System Notification',
      body: 'You have a new system notification',
      channels: [NotificationChannel.PUSH, NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async sendNotification(data: SendNotificationDTO): Promise<void> {
    try {
      const channels = data.channels || [NotificationChannel.PUSH, NotificationChannel.IN_APP];

      // Send push notification if enabled
      if (channels.includes(NotificationChannel.PUSH) && this.fcmProvider) {
        await this.sendPushNotification(data.employeeId, data);
      }

      // Send email notification if enabled
      if (channels.includes(NotificationChannel.EMAIL)) {
        await this.sendEmailNotification(
          data.employeeId,
          data.title,
          data.body,
          data.data?.['email'] as string | undefined
        );
      }

      // Store in-app notification
      if (channels.includes(NotificationChannel.IN_APP)) {
        await this.storeInAppNotification({
          employeeId: data.employeeId,
          type: data.type,
          title: data.title,
          body: data.body,
          icon: data.icon,
          image: data.image,
          data: data.data,
          channels,
        });
      }

      logger.info(`Notification sent to employee ${data.employeeId} via channels: ${channels.join(', ')}`);
    } catch (error: any) {
      logger.error(`Failed to send notification to employee ${data.employeeId}:`, error.message);
      throw error;
    }
  }

  async sendBulkNotification(data: SendBulkNotificationDTO): Promise<void> {
    try {
      const channels = data.channels || [NotificationChannel.PUSH, NotificationChannel.IN_APP];

      // Send push notifications if enabled
      if (channels.includes(NotificationChannel.PUSH) && this.fcmProvider) {
        await this.sendBulkPushNotification(data.employeeIds, data);
      }

      // Send email notifications if enabled
      if (channels.includes(NotificationChannel.EMAIL)) {
        await Promise.allSettled(
          data.employeeIds.map((empId) =>
            this.sendEmailNotification(empId, data.title, data.body, data.data?.['email'] as string | undefined)
          )
        );
      }

      // Store in-app notifications
      if (channels.includes(NotificationChannel.IN_APP)) {
        for (const employeeId of data.employeeIds) {
          await this.storeInAppNotification({
            employeeId,
            type: data.type,
            title: data.title,
            body: data.body,
            icon: data.icon,
            image: data.image,
            data: data.data,
            channels,
          });
        }
      }

      logger.info(`Bulk notification sent to ${data.employeeIds.length} employees via channels: ${channels.join(', ')}`);
    } catch (error: any) {
      logger.error(`Failed to send bulk notification:`, error.message);
      throw error;
    }
  }

  async sendTopicNotification(data: SendTopicNotificationDTO): Promise<void> {
    try {
      if (!this.fcmProvider) {
        throw new Error('FCM Provider is not available');
      }

      const payload = this.buildPushPayload(data.title, data.body, data.icon, data.image, data.data);
      await this.fcmProvider.sendToTopic(data.topic, payload);

      logger.info(`Topic notification sent to topic: ${data.topic}`);
    } catch (error: any) {
      logger.error(`Failed to send topic notification:`, error.message);
      throw error;
    }
  }

  async subscribeToTopic(employeeId: string, deviceTokens: string[], topic: string): Promise<void> {
    try {
      if (!this.fcmProvider) {
        throw new Error('FCM Provider is not available');
      }

      await this.fcmProvider.subscribeToTopic(deviceTokens, topic);
      logger.info(`Employee ${employeeId} subscribed to topic: ${topic}`);
    } catch (error: any) {
      logger.error(`Failed to subscribe to topic:`, error.message);
      throw error;
    }
  }

  async unsubscribeFromTopic(employeeId: string, deviceTokens: string[], topic: string): Promise<void> {
    try {
      if (!this.fcmProvider) {
        throw new Error('FCM Provider is not available');
      }

      await this.fcmProvider.unsubscribeFromTopic(deviceTokens, topic);
      logger.info(`Employee ${employeeId} unsubscribed from topic: ${topic}`);
    } catch (error: any) {
      logger.error(`Failed to unsubscribe from topic:`, error.message);
      throw error;
    }
  }

  private async sendPushNotification(employeeId: string, _data: SendNotificationDTO): Promise<void> {
    try {
      if (!this.fcmProvider) {
        throw new Error('FCM Provider is not available');
      }

      // In a real implementation, fetch device tokens from database
      // For now, we'll just log the intent
      logger.info(`Push notification prepared for employee ${employeeId}`);
    } catch (error: any) {
      logger.error(`Failed to send push notification:`, error.message);
      throw error;
    }
  }

  private async sendBulkPushNotification(employeeIds: string[], _data: SendBulkNotificationDTO): Promise<void> {
    try {
      if (!this.fcmProvider) {
        throw new Error('FCM Provider is not available');
      }

      // In a real implementation, fetch device tokens for all employees from database
      logger.info(`Bulk push notifications prepared for ${employeeIds.length} employees`);
    } catch (error: any) {
      logger.error(`Failed to send bulk push notifications:`, error.message);
      throw error;
    }
  }

  private async storeInAppNotification(data: SendNotificationDTO & { channels: NotificationChannel[] }): Promise<void> {
    if (!this.notificationRepository) {
      // Repository not injected — log only (used when service is bootstrapped without DB)
      logger.warn(`storeInAppNotification called without a NotificationRepository — skipping DB persist for employee ${data.employeeId}`);
      return;
    }

    try {
      const record = await this.notificationRepository.create({
        employee_id: data.employeeId,
        title: data.title,
        message: data.body,
        type: 'info',
        channel: 'in_app',
        metadata: {
          notificationType: data.type,
          ...(data.icon && { icon: data.icon }),
          ...(data.image && { image: data.image }),
          ...(data.data && { data: data.data }),
        },
      });

      logger.info(`In-app notification persisted for employee ${data.employeeId}: id=${record.id}`);
    } catch (error: any) {
      logger.error(`Failed to store in-app notification for employee ${data.employeeId}:`, error.message);
      throw error;
    }
  }

  /**
   * Send an email notification via the configured SMTP transport.
   * Falls back gracefully if email config is absent.
   */
  private async sendEmailNotification(
    employeeId: string,
    subject: string,
    body: string,
    recipientEmail?: string
  ): Promise<void> {
    const smtpCfg = config.email?.smtp;
    if (!smtpCfg?.host || !smtpCfg?.user || !smtpCfg?.password) {
      logger.warn(`Email notification for employee ${employeeId} skipped — SMTP not configured (EMAIL_HOST / EMAIL_USER / EMAIL_PASSWORD missing)`);
      return;
    }

    const to = recipientEmail;
    if (!to) {
      logger.warn(`Email notification for employee ${employeeId} skipped — no recipient email address provided`);
      return;
    }

    try {
      // Dynamic import so nodemailer is only loaded when actually needed
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: smtpCfg.host,
        port: smtpCfg.port ?? 587,
        secure: (smtpCfg.port ?? 587) === 465,
        auth: {
          user: smtpCfg.user,
          pass: smtpCfg.password,
        },
      });

      await transporter.sendMail({
        from: smtpCfg.user,
        to,
        subject,
        text: body,
        html: `<p>${body.replace(/\n/g, '<br>')}</p>`,
      });

      logger.info(`Email notification sent to ${to} for employee ${employeeId}`);
    } catch (error: any) {
      // Log but do not rethrow — email failure should not crash the whole notification pipeline
      logger.error(`Failed to send email notification for employee ${employeeId}:`, error.message);
    }
  }

  private buildPushPayload(
    title: string,
    body: string,
    icon?: string | undefined,
    image?: string | undefined,
    data?: Record<string, string> | undefined
  ): PushNotificationPayload {
    return {
      notification: {
        title,
        body,
        ...(icon && { icon }),
        ...(image && { image }),
      },
      ...(data && { data }),
      webpush: {
        fcmOptions: {
          link: '/notifications',
        },
        notification: {
          icon: icon || '/notification-icon.png',
          badge: '/notification-badge.png',
          tag: 'notification',
          color: '#171717',
        },
      },
    };
  }

  getTemplate(type: NotificationType): NotificationTemplate | undefined {
    return this.notificationTemplates.get(type);
  }

  getAllTemplates(): NotificationTemplate[] {
    return Array.from(this.notificationTemplates.values());
  }

  isEnabled(): boolean {
    return this.fcmProvider !== null;
  }
}

export default new NotificationService();
