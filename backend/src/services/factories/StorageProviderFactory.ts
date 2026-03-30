import config from '../../config';
import { FileStorageProvider } from '../../types/fileStorage';
import { S3StorageProvider } from '../storage/s3StorageProvider';
import { LocalStorageProvider } from '../storage/localStorageProvider';

/**
 * Factory for creating file storage service providers
 * Supports: Local (development), AWS S3, Google Cloud Storage (future)
 * Provider is selected via FILE_STORAGE_PROVIDER environment variable
 */
export class StorageProviderFactory {
  /**
   * Create a file storage provider instance based on configuration
   * @throws Error if provider is not supported or configuration is invalid
   */
  static createProvider(): FileStorageProvider {
    const { provider } = config.fileStorage;

    this.validateConfiguration(provider);

    switch (provider) {
      case 'local':
        return this.createLocalProvider();

      case 's3':
        return this.createS3Provider();

      case 'gcs':
        throw new Error('Google Cloud Storage provider not implemented yet');

      default:
        throw new Error(`Unsupported file storage provider: ${provider}`);
    }
  }

  /**
   * Get list of supported providers
   */
  static getSupportedProviders(): string[] {
    return ['local', 's3', 'gcs'];
  }

  /**
   * Validate that required configuration exists for the provider
   */
  private static validateConfiguration(provider: string): void {
    switch (provider) {
      case 'local':
        // Local storage doesn't require any configuration
        break;

      case 's3':
        // Skip validation in development - credentials may not be available
        if (process.env['NODE_ENV'] === 'production') {
          if (!config.fileStorage.s3?.region || !config.fileStorage.s3?.bucket) {
            throw new Error('AWS S3 configuration is incomplete (AWS_REGION, S3_BUCKET)');
          }
          if (!config.fileStorage.s3?.accessKeyId || !config.fileStorage.s3?.secretAccessKey) {
            throw new Error('AWS S3 credentials are not configured (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)');
          }
        }
        break;

      case 'gcs':
        if (!config.fileStorage.gcs?.projectId || !config.fileStorage.gcs?.bucket) {
          throw new Error('Google Cloud Storage configuration is incomplete (GCS_PROJECT_ID, GCS_BUCKET)');
        }
        break;
    }
  }

  /**
   * Create local file storage provider (for development)
   */
  private static createLocalProvider(): FileStorageProvider {
    console.log('Using local file storage provider (development mode)');
    return new LocalStorageProvider();
  }

  /**
   * Create AWS S3 provider
   */
  private static createS3Provider(): FileStorageProvider {
    return new S3StorageProvider();
  }
}
