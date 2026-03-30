import * as admin from 'firebase-admin';
import config from './index';
import logger from '../utils/logger';

class FirebaseConfig {
  private static instance: FirebaseConfig;
  private app: admin.app.App | null = null;

  private constructor() {
    this.initialize();
  }

  public static getInstance(): FirebaseConfig {
    if (!FirebaseConfig.instance) {
      FirebaseConfig.instance = new FirebaseConfig();
    }
    return FirebaseConfig.instance;
  }

  private initialize(): void {
    if (!config.firebase.enabled) {
      logger.info('Firebase is disabled in configuration');
      return;
    }

    try {
      // Validate required Firebase credentials
      if (!config.firebase.projectId || !config.firebase.privateKey || !config.firebase.clientEmail) {
        throw new Error('Missing required Firebase credentials in environment variables');
      }

      const serviceAccount = {
        projectId: config.firebase.projectId,
        privateKeyId: config.firebase.privateKeyId,
        privateKey: config.firebase.privateKey,
        clientEmail: config.firebase.clientEmail,
        clientId: config.firebase.clientId,
        authUri: config.firebase.authUri,
        tokenUri: config.firebase.tokenUri,
        authProviderX509CertUrl: config.firebase.authProviderX509CertUrl,
        clientX509CertUrl: config.firebase.clientX509CertUrl,
      };

      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        projectId: config.firebase.projectId,
      });

      logger.info('Firebase Admin SDK initialized successfully');
    } catch (error: any) {
      logger.error('Failed to initialize Firebase Admin SDK:', error.message);
      throw error;
    }
  }

  public getApp(): admin.app.App {
    if (!this.app) {
      throw new Error('Firebase app is not initialized. Ensure FIREBASE_ENABLED is set to true and credentials are provided.');
    }
    return this.app;
  }

  public getMessaging(): admin.messaging.Messaging {
    return admin.messaging(this.getApp());
  }

  public isEnabled(): boolean {
    return config.firebase.enabled && this.app !== null;
  }

  public async validateConfiguration(): Promise<boolean> {
    try {
      if (!this.isEnabled()) {
        return false;
      }

      // Test Firebase connection by getting project info
      const messaging = this.getMessaging();
      await messaging.send({
        notification: {
          title: 'Firebase Configuration Test',
          body: 'This is a test message',
        },
        topic: 'test-topic',
      });

      logger.info('Firebase configuration validated successfully');
      return true;
    } catch (error: any) {
      logger.error('Firebase configuration validation failed:', error.message);
      return false;
    }
  }
}

export default FirebaseConfig.getInstance();
