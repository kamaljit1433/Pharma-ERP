import notificationService from '../notificationService';
import { NotificationType, NotificationChannel, SendNotificationDTO } from '../../types/notification';

describe('NotificationService', () => {
  describe('sendNotification', () => {
    it('should send a notification with default channels', async () => {
      const data: SendNotificationDTO = {
        employeeId: 'emp_001',
        type: NotificationType.LEAVE_APPROVED,
        title: 'Leave Approved',
        body: 'Your leave request has been approved',
      };

      await expect(notificationService.sendNotification(data)).resolves.not.toThrow();
    });

    it('should send a notification with specific channels', async () => {
      const data: SendNotificationDTO = {
        employeeId: 'emp_001',
        type: NotificationType.PAYROLL_PROCESSED,
        title: 'Payroll Processed',
        body: 'Your salary has been processed',
        channels: [NotificationChannel.PUSH, NotificationChannel.EMAIL],
      };

      await expect(notificationService.sendNotification(data)).resolves.not.toThrow();
    });

    it('should send a notification with custom data', async () => {
      const data: SendNotificationDTO = {
        employeeId: 'emp_001',
        type: NotificationType.PAYSLIP_READY,
        title: 'Payslip Ready',
        body: 'Your payslip is ready for download',
        data: {
          payslipId: 'payslip_123',
          month: 'January',
          year: '2026',
        },
      };

      await expect(notificationService.sendNotification(data)).resolves.not.toThrow();
    });

    it('should send a notification with icon and image', async () => {
      const data: SendNotificationDTO = {
        employeeId: 'emp_001',
        type: NotificationType.BIRTHDAY_WISH,
        title: 'Happy Birthday!',
        body: 'Wishing you a wonderful birthday!',
        icon: '/birthday-icon.png',
        image: '/birthday-image.png',
      };

      await expect(notificationService.sendNotification(data)).resolves.not.toThrow();
    });
  });

  describe('sendBulkNotification', () => {
    it('should send bulk notifications to multiple employees', async () => {
      const data = {
        employeeIds: ['emp_001', 'emp_002', 'emp_003'],
        type: NotificationType.PAYROLL_PROCESSED,
        title: 'Payroll Processed',
        body: 'Your salary has been processed for this month',
      };

      await expect(notificationService.sendBulkNotification(data)).resolves.not.toThrow();
    });

    it('should send bulk notifications with custom channels', async () => {
      const data = {
        employeeIds: ['emp_001', 'emp_002'],
        type: NotificationType.SYSTEM_NOTIFICATION,
        title: 'System Update',
        body: 'A system update is scheduled',
        channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
      };

      await expect(notificationService.sendBulkNotification(data)).resolves.not.toThrow();
    });

    it('should handle empty employee list', async () => {
      const data = {
        employeeIds: [],
        type: NotificationType.SYSTEM_NOTIFICATION,
        title: 'System Update',
        body: 'A system update is scheduled',
      };

      await expect(notificationService.sendBulkNotification(data)).resolves.not.toThrow();
    });
  });

  describe('sendTopicNotification', () => {
    it('should send notification to a topic', async () => {
      const data = {
        topic: 'payroll-updates',
        type: NotificationType.PAYROLL_PROCESSED,
        title: 'Payroll Processed',
        body: 'Monthly payroll has been processed',
      };

      // This will fail if FCM is not enabled, which is expected in test environment
      if (notificationService.isEnabled()) {
        await expect(notificationService.sendTopicNotification(data)).resolves.not.toThrow();
      }
    });

    it('should send notification to topic with custom data', async () => {
      const data = {
        topic: 'leave-updates',
        type: NotificationType.LEAVE_APPROVED,
        title: 'Leave Approved',
        body: 'A leave request has been approved',
        data: {
          leaveId: 'leave_123',
          employeeId: 'emp_001',
        },
      };

      if (notificationService.isEnabled()) {
        await expect(notificationService.sendTopicNotification(data)).resolves.not.toThrow();
      }
    });
  });

  describe('subscribeToTopic', () => {
    it('should subscribe device tokens to a topic', async () => {
      const deviceTokens = ['token_001', 'token_002'];
      const topic = 'payroll-updates';

      if (notificationService.isEnabled()) {
        await expect(
          notificationService.subscribeToTopic('emp_001', deviceTokens, topic)
        ).resolves.not.toThrow();
      }
    });

    it('should handle empty device token list', async () => {
      const deviceTokens: string[] = [];
      const topic = 'leave-updates';

      if (notificationService.isEnabled()) {
        await expect(
          notificationService.subscribeToTopic('emp_001', deviceTokens, topic)
        ).resolves.not.toThrow();
      }
    });
  });

  describe('unsubscribeFromTopic', () => {
    it('should unsubscribe device tokens from a topic', async () => {
      const deviceTokens = ['token_001', 'token_002'];
      const topic = 'payroll-updates';

      if (notificationService.isEnabled()) {
        await expect(
          notificationService.unsubscribeFromTopic('emp_001', deviceTokens, topic)
        ).resolves.not.toThrow();
      }
    });
  });

  describe('getTemplate', () => {
    it('should return template for LEAVE_APPROVED notification type', () => {
      const template = notificationService.getTemplate(NotificationType.LEAVE_APPROVED);

      expect(template).toBeDefined();
      expect(template?.type).toBe(NotificationType.LEAVE_APPROVED);
      expect(template?.title).toBe('Leave Approved');
      expect(template?.channels).toContain(NotificationChannel.PUSH);
    });

    it('should return template for PAYROLL_PROCESSED notification type', () => {
      const template = notificationService.getTemplate(NotificationType.PAYROLL_PROCESSED);

      expect(template).toBeDefined();
      expect(template?.type).toBe(NotificationType.PAYROLL_PROCESSED);
      expect(template?.title).toBe('Payroll Processed');
    });

    it('should return undefined for non-existent template', () => {
      const template = notificationService.getTemplate('non_existent' as NotificationType);

      expect(template).toBeUndefined();
    });
  });

  describe('getAllTemplates', () => {
    it('should return all notification templates', () => {
      const templates = notificationService.getAllTemplates();

      expect(templates.length).toBeGreaterThan(0);
      expect(templates.some(t => t.type === NotificationType.LEAVE_APPROVED)).toBe(true);
      expect(templates.some(t => t.type === NotificationType.PAYROLL_PROCESSED)).toBe(true);
      expect(templates.some(t => t.type === NotificationType.BIRTHDAY_WISH)).toBe(true);
    });

    it('should return templates with all required fields', () => {
      const templates = notificationService.getAllTemplates();

      templates.forEach(template => {
        expect(template.id).toBeDefined();
        expect(template.type).toBeDefined();
        expect(template.title).toBeDefined();
        expect(template.body).toBeDefined();
        expect(template.channels).toBeDefined();
        expect(Array.isArray(template.channels)).toBe(true);
      });
    });
  });

  describe('isEnabled', () => {
    it('should return boolean indicating if notification service is enabled', () => {
      const enabled = notificationService.isEnabled();

      expect(typeof enabled).toBe('boolean');
    });
  });

  describe('notification types', () => {
    it('should have all required notification types', () => {
      const requiredTypes = [
        NotificationType.LEAVE_APPROVED,
        NotificationType.LEAVE_REJECTED,
        NotificationType.PAYROLL_PROCESSED,
        NotificationType.PAYSLIP_READY,
        NotificationType.BIRTHDAY_WISH,
        NotificationType.INTERVIEW_SCHEDULED,
        NotificationType.SYSTEM_NOTIFICATION,
      ];

      requiredTypes.forEach(type => {
        const template = notificationService.getTemplate(type);
        expect(template).toBeDefined();
      });
    });
  });

  describe('notification channels', () => {
    it('should support all notification channels', () => {
      const channels = [
        NotificationChannel.PUSH,
        NotificationChannel.EMAIL,
        NotificationChannel.IN_APP,
      ];

      channels.forEach(channel => {
        expect(channel).toBeDefined();
      });
    });
  });
});
