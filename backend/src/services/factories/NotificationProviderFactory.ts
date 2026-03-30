import config from '../../config';
import firebaseConfig from '../../config/firebase';
import { NotificationProvider } from '../../types/notification';
import { FCMProvider } from '../notification/fcmProvider';

/**
 * Factory for creating notification service providers
 * Supports: Firebase Cloud Messaging (FCM)
 * Provider is selected via NOTIFICATION_PROVIDER environment variable
 */
export class NotificationProviderFactory {
  /**
   * Create a notification provider instance based on configuration
   * @throws Error if provider is not supported or configuration is invalid
   */
  static createProvider(): NotificationProvider | null {
    const { provider } = config.notification;

    switch (provider) {
      case 'fcm':
        return this.createFCMProvider();

      case 'disabled':
        return null;

      default:
        throw new Error(`Unsupported notification provider: ${provider}`);
    }
  }

  /**
   * Get list of supported providers
   */
  static getSupportedProviders(): string[] {
    return ['fcm', 'disabled'];
  }

  /**
   * Validate that required configuration exists for the provider
   */
  static validateConfiguration(provider: string): boolean {
    switch (provider) {
      case 'fcm':
        return firebaseConfig.isEnabled();

      case 'disabled':
        return true;

      default:
        return false;
    }
  }

  /**
   * Create Firebase Cloud Messaging provider
   */
  private static createFCMProvider(): NotificationProvider {
    if (!firebaseConfig.isEnabled()) {
      throw new Error('Firebase is not enabled. Check FIREBASE_PROJECT_ID and FIREBASE_PRIVATE_KEY configuration.');
    }

    return new FCMProvider(firebaseConfig.getMessaging());
  }
}
