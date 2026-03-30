import { NotificationProviderFactory } from '../NotificationProviderFactory';
import { FCMProvider } from '../../notification/fcmProvider';
import config from '../../../config';
import firebaseConfig from '../../../config/firebase';

// Mock the logger first
jest.mock('../../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock the config modules
jest.mock('../../../config', () => ({
  notification: {
    provider: 'fcm',
  },
}));

jest.mock('../../../config/firebase', () => ({
  isEnabled: jest.fn(() => true),
  getMessaging: jest.fn(() => ({})),
}));

// Mock the FCM provider
jest.mock('../../notification/fcmProvider');

describe('NotificationProviderFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProvider', () => {
    it('should create FCM provider when configured', () => {
      (config.notification.provider as any) = 'fcm';
      (firebaseConfig.isEnabled as jest.Mock).mockReturnValue(true);
      
      const provider = NotificationProviderFactory.createProvider();
      
      expect(FCMProvider).toHaveBeenCalled();
      expect(provider).toBeInstanceOf(FCMProvider);
    });

    it('should return null when notifications are disabled', () => {
      (config.notification.provider as any) = 'disabled';
      
      const provider = NotificationProviderFactory.createProvider();
      
      expect(provider).toBeNull();
    });

    it('should throw error for unsupported provider', () => {
      (config.notification.provider as any) = 'unsupported';
      
      expect(() => NotificationProviderFactory.createProvider()).toThrow(
        'Unsupported notification provider: unsupported'
      );
    });

    it('should throw error when Firebase is not enabled for FCM', () => {
      (config.notification.provider as any) = 'fcm';
      (firebaseConfig.isEnabled as jest.Mock).mockReturnValue(false);
      
      expect(() => NotificationProviderFactory.createProvider()).toThrow(
        'Firebase is not enabled'
      );
    });
  });

  describe('getSupportedProviders', () => {
    it('should return list of supported providers', () => {
      const providers = NotificationProviderFactory.getSupportedProviders();
      
      expect(providers).toEqual(['fcm', 'disabled']);
    });
  });

  describe('validateConfiguration', () => {
    it('should validate FCM configuration when Firebase is enabled', () => {
      (firebaseConfig.isEnabled as jest.Mock).mockReturnValue(true);
      
      const isValid = NotificationProviderFactory.validateConfiguration('fcm');
      
      expect(isValid).toBe(true);
    });

    it('should return false for FCM when Firebase is not enabled', () => {
      (firebaseConfig.isEnabled as jest.Mock).mockReturnValue(false);
      
      const isValid = NotificationProviderFactory.validateConfiguration('fcm');
      
      expect(isValid).toBe(false);
    });

    it('should validate disabled provider', () => {
      const isValid = NotificationProviderFactory.validateConfiguration('disabled');
      
      expect(isValid).toBe(true);
    });

    it('should return false for unsupported provider', () => {
      const isValid = NotificationProviderFactory.validateConfiguration('unsupported');
      
      expect(isValid).toBe(false);
    });
  });
});
