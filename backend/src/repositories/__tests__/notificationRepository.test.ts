/**
 * Notification Repository - Unit Tests
 * Tests for notification management
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { NotificationRepository, CreateNotificationDTO, UpdateNotificationDTO } from '../notificationRepository';
import db from '../../config/knex';

describe('NotificationRepository', () => {
  let repository: NotificationRepository;
  let testEmployeeId: string;
  let testNotificationId: string;

  beforeAll(async () => {
    repository = new NotificationRepository(db);

    // Clean up and create test employee
    await db('notifications').del();
    await db('employees').where('employee_id', 'NOTIF-TEST-001').del();

    const [employee] = await db('employees')
      .insert({
        employee_id: 'NOTIF-TEST-001',
        first_name: 'Notif',
        last_name: 'Test',
        email: `notif.test.${Date.now()}@example.com`,
        date_of_joining: new Date('2024-01-01'),
      })
      .returning('id');

    testEmployeeId = employee.id;
  });

  afterAll(async () => {
    await db('notifications').del();
    await db('employees').where('employee_id', 'NOTIF-TEST-001').del();
  });

  describe('createNotification', () => {
    it('should create notification', async () => {
      const data: CreateNotificationDTO = {
        employee_id: testEmployeeId,
        title: 'Leave Approved',
        message: 'Your leave request has been approved',
        type: 'info',
        is_read: false,
      };

      const notification = await repository.createNotification(data);

      expect(notification).toBeDefined();
      expect(notification.id).toBeDefined();
      expect(notification.employee_id).toBe(testEmployeeId);
      expect(notification.title).toBe('Leave Approved');
      expect(notification.is_read).toBe(false);

      testNotificationId = notification.id;
    });
  });

  describe('getNotification', () => {
    it('should retrieve notification by ID', async () => {
      const notification = await repository.getNotification(testNotificationId);

      expect(notification).toBeDefined();
      expect(notification?.id).toBe(testNotificationId);
    });

    it('should return null for non-existent notification', async () => {
      const notification = await repository.getNotification('00000000-0000-4000-a000-ffffffffffff');

      expect(notification).toBeNull();
    });
  });

  describe('updateNotification', () => {
    it('should update notification', async () => {
      const updateData: UpdateNotificationDTO = {
        is_read: true,
      };

      const updated = await repository.updateNotification(testNotificationId, updateData);

      expect(updated.is_read).toBe(true);
    });

    it('should throw error for non-existent notification', async () => {
      await expect(
        repository.updateNotification('00000000-0000-4000-a000-ffffffffffff', { is_read: true })
      ).rejects.toThrow();
    });
  });

  describe('getEmployeeNotifications', () => {
    it('should retrieve employee notifications', async () => {
      const notifications = await repository.getEmployeeNotifications(testEmployeeId);

      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.length).toBeGreaterThan(0);
    });
  });

  describe('getUnreadNotifications', () => {
    it('should retrieve unread notifications', async () => {
      const notifications = await repository.getUnreadNotifications(testEmployeeId);

      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.every((n) => !n.is_read)).toBe(true);
    });
  });

  describe('getReadNotifications', () => {
    it('should retrieve read notifications', async () => {
      const notifications = await repository.getReadNotifications(testEmployeeId);

      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.every((n) => n.is_read)).toBe(true);
    });
  });

  describe('getNotificationsByType', () => {
    it('should retrieve notifications by type', async () => {
      const notifications = await repository.getNotificationsByType('leave');

      expect(Array.isArray(notifications)).toBe(true);
    });

    it('should filter by employee', async () => {
      const notifications = await repository.getNotificationsByType('leave', testEmployeeId);

      expect(Array.isArray(notifications)).toBe(true);
    });
  });

  describe('getUnreadCount', () => {
    it('should count unread notifications', async () => {
      const count = await repository.getUnreadCount(testEmployeeId);

      expect(typeof count).toBe('number');
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const data: CreateNotificationDTO = {
        employee_id: testEmployeeId,
        title: 'Test Notification',
        message: 'Test message',
        type: 'success',
        is_read: false,
      };

      const notification = await repository.createNotification(data);
      const marked = await repository.markAsRead(notification.id);

      expect(marked.is_read).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const marked = await repository.markAllAsRead(testEmployeeId);

      expect(typeof marked).toBe('number');
      expect(marked).toBeGreaterThanOrEqual(0);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification', async () => {
      const data: CreateNotificationDTO = {
        employee_id: testEmployeeId,
        title: 'Delete Test',
        message: 'Delete test message',
        type: 'warning',
        is_read: false,
      };

      const notification = await repository.createNotification(data);
      await repository.deleteNotification(notification.id);

      const deleted = await repository.getNotification(notification.id);
      expect(deleted).toBeNull();
    });
  });

  describe('deleteOldNotifications', () => {
    it('should delete old notifications', async () => {
      const daysOld = 30;
      const deleted = await repository.deleteOldNotifications(daysOld);

      expect(typeof deleted).toBe('number');
      expect(deleted).toBeGreaterThanOrEqual(0);
    });
  });
});
