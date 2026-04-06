/**
 * Resilient Notification Provider
 * 
 * Wraps notification provider calls with retry and circuit breaker patterns
 * to handle transient failures gracefully.
 */

import { NotificationProvider, PushNotificationPayload } from '../../types/notification';
import { getResilienceWrapper } from '../../config/resilience';
import logger from '../../utils/logger';

export class ResilientNotificationProvider implements NotificationProvider {
  constructor(private provider: NotificationProvider) {}

  async sendToDevice(deviceToken: string, payload: PushNotificationPayload): Promise<any> {
    const resilience = getResilienceWrapper('notification-service');

    try {
      await resilience.execute(async () => {
        return await this.provider.sendToDevice(deviceToken, payload);
      });
    } catch (error: any) {
      logger.error(
        `Failed to send notification to device ${deviceToken}:`,
        error.message
      );
      // Don't throw - notifications are non-critical
    }
  }

  async sendToMultipleDevices(
    deviceTokens: string[],
    payload: PushNotificationPayload
  ): Promise<any> {
    const resilience = getResilienceWrapper('notification-service');

    try {
      await resilience.execute(async () => {
        return await this.provider.sendToMultipleDevices(deviceTokens, payload);
      });
    } catch (error: any) {
      logger.error(
        `Failed to send bulk notifications to ${deviceTokens.length} devices:`,
        error.message
      );
      // Don't throw - notifications are non-critical
    }
  }

  async sendToTopic(topic: string, payload: PushNotificationPayload): Promise<any> {
    const resilience = getResilienceWrapper('notification-service');

    try {
      await resilience.execute(async () => {
        return await this.provider.sendToTopic(topic, payload);
      });
    } catch (error: any) {
      logger.error(`Failed to send topic notification to ${topic}:`, error.message);
      // Don't throw - notifications are non-critical
    }
  }

  async subscribeToTopic(deviceTokens: string[], topic: string): Promise<any> {
    const resilience = getResilienceWrapper('notification-service');

    try {
      await resilience.execute(async () => {
        return await this.provider.subscribeToTopic(deviceTokens, topic);
      });
    } catch (error: any) {
      logger.error(
        `Failed to subscribe ${deviceTokens.length} devices to topic ${topic}:`,
        error.message
      );
      // Don't throw - subscription failures are non-critical
    }
  }

  async unsubscribeFromTopic(deviceTokens: string[], topic: string): Promise<any> {
    const resilience = getResilienceWrapper('notification-service');

    try {
      await resilience.execute(async () => {
        return await this.provider.unsubscribeFromTopic(deviceTokens, topic);
      });
    } catch (error: any) {
      logger.error(
        `Failed to unsubscribe ${deviceTokens.length} devices from topic ${topic}:`,
        error.message
      );
      // Don't throw - unsubscription failures are non-critical
    }
  }

  /**
   * Get resilience metrics for notification service
   */
  getResilienceMetrics() {
    const resilience = getResilienceWrapper('notification-service');
    return resilience.getMetrics();
  }

  /**
   * Check if notification service is available
   */
  isAvailable(): boolean {
    const resilience = getResilienceWrapper('notification-service');
    return resilience.isAvailable();
  }

  /**
   * Reset resilience wrapper
   */
  resetResilience(): void {
    const resilience = getResilienceWrapper('notification-service');
    resilience.reset();
  }
}
