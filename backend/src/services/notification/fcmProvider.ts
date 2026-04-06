import * as admin from 'firebase-admin';
import logger from '../../utils/logger';
import { PushNotificationPayload, NotificationProvider } from '../../types/notification';

export class FCMProvider implements NotificationProvider {
  private messaging: admin.messaging.Messaging;

  constructor(messaging: admin.messaging.Messaging) {
    this.messaging = messaging;
  }

  async sendToDevice(deviceToken: string, payload: PushNotificationPayload): Promise<string> {
    try {
      const messageId = await this.messaging.send({
        token: deviceToken,
        notification: payload.notification,
        ...(payload.data && { data: payload.data }),
        ...(payload.webpush && { webpush: payload.webpush }),
      });

      logger.info(`Push notification sent to device: ${deviceToken}, messageId: ${messageId}`);
      return messageId;
    } catch (error: any) {
      logger.error(`Failed to send push notification to device ${deviceToken}:`, error.message);
      throw error;
    }
  }

  async sendToMultipleDevices(deviceTokens: string[], payload: PushNotificationPayload): Promise<string[]> {
    try {
      const messages = deviceTokens.map(token => ({
        token,
        notification: payload.notification,
        ...(payload.data && { data: payload.data }),
        ...(payload.webpush && { webpush: payload.webpush }),
      }));

      const response = await this.messaging.sendAll(messages);

      logger.info(`Push notifications sent to ${response.successCount} devices, ${response.failureCount} failed`);

      const messageIds: string[] = [];
      response.responses.forEach((resp, index) => {
        if (resp.success) {
          messageIds.push(resp.messageId || '');
        } else {
          logger.warn(`Failed to send notification to device ${deviceTokens[index]}: ${resp.error?.message || 'Unknown error'}`);
        }
      });

      return messageIds;
    } catch (error: any) {
      logger.error('Failed to send push notifications to multiple devices:', error.message);
      throw error;
    }
  }

  async sendToTopic(topic: string, payload: PushNotificationPayload): Promise<string> {
    try {
      const messageId = await this.messaging.send({
        topic,
        notification: payload.notification,
        ...(payload.data && { data: payload.data }),
        ...(payload.webpush && { webpush: payload.webpush }),
      });

      logger.info(`Push notification sent to topic: ${topic}, messageId: ${messageId}`);
      return messageId;
    } catch (error: any) {
      logger.error(`Failed to send push notification to topic ${topic}:`, error.message);
      throw error;
    }
  }

  async subscribeToTopic(deviceTokens: string[], topic: string): Promise<void> {
    try {
      await this.messaging.subscribeToTopic(deviceTokens, topic);
      logger.info(`Subscribed ${deviceTokens.length} devices to topic: ${topic}`);
    } catch (error: any) {
      logger.error(`Failed to subscribe devices to topic ${topic}:`, error.message);
      throw error;
    }
  }

  async unsubscribeFromTopic(deviceTokens: string[], topic: string): Promise<void> {
    try {
      await this.messaging.unsubscribeFromTopic(deviceTokens, topic);
      logger.info(`Unsubscribed ${deviceTokens.length} devices from topic: ${topic}`);
    } catch (error: any) {
      logger.error(`Failed to unsubscribe devices from topic ${topic}:`, error.message);
      throw error;
    }
  }
}
