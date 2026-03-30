import { StorageProviderFactory } from '../StorageProviderFactory';
import { S3StorageProvider } from '../../storage/s3StorageProvider';
import config from '../../../config';

// Mock the config module
jest.mock('../../../config', () => ({
  fileStorage: {
    provider: 's3',
    s3: {
      region: 'us-east-1',
      bucket: 'test-bucket',
      accessKeyId: 'test-key',
      secretAccessKey: 'test-secret',
    },
    gcs: {
      projectId: 'test-project',
      bucket: 'test-bucket',
      keyFile: '/path/to/key.json',
    },
  },
}));

// Mock the S3 provider
jest.mock('../../storage/s3StorageProvider');

describe('StorageProviderFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createProvider', () => {
    it('should create S3 provider when configured', () => {
      (config.fileStorage.provider as any) = 's3';
      
      const provider = StorageProviderFactory.createProvider();
      
      expect(S3StorageProvider).toHaveBeenCalled();
      expect(provider).toBeInstanceOf(S3StorageProvider);
    });

    it('should throw error for GCS provider (not implemented)', () => {
      (config.fileStorage.provider as any) = 'gcs';
      
      expect(() => StorageProviderFactory.createProvider()).toThrow(
        'Google Cloud Storage provider not implemented yet'
      );
    });

    it('should throw error for unsupported provider', () => {
      (config.fileStorage.provider as any) = 'unsupported';
      
      expect(() => StorageProviderFactory.createProvider()).toThrow(
        'Unsupported file storage provider: unsupported'
      );
    });

    it('should throw error when S3 configuration is incomplete', () => {
      (config.fileStorage.provider as any) = 's3';
      (config.fileStorage.s3 as any) = {
        region: '',
        bucket: 'test-bucket',
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
      };
      
      expect(() => StorageProviderFactory.createProvider()).toThrow(
        'AWS S3 configuration is incomplete'
      );
    });

    it('should throw error when S3 credentials are missing', () => {
      (config.fileStorage.provider as any) = 's3';
      (config.fileStorage.s3 as any) = {
        region: 'us-east-1',
        bucket: 'test-bucket',
        accessKeyId: '',
        secretAccessKey: 'test-secret',
      };
      
      expect(() => StorageProviderFactory.createProvider()).toThrow(
        'AWS S3 credentials are not configured'
      );
    });
  });

  describe('getSupportedProviders', () => {
    it('should return list of supported providers', () => {
      const providers = StorageProviderFactory.getSupportedProviders();
      
      expect(providers).toEqual(['s3', 'gcs']);
    });
  });
});
