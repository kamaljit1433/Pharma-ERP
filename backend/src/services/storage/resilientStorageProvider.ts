/**
 * Resilient Storage Provider
 * 
 * Wraps file storage provider calls with retry and circuit breaker patterns
 * to handle transient failures gracefully.
 */

import { getResilienceWrapper } from '../../config/resilience';
import logger from '../../utils/logger';

export interface StorageProvider {
  upload(key: string, buffer: Buffer, contentType: string): Promise<string>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  getSignedUrl(key: string, expiresIn: number): Promise<string>;
}

export class ResilientStorageProvider implements StorageProvider {
  constructor(private provider: StorageProvider) {}

  async upload(key: string, buffer: Buffer, contentType: string): Promise<string> {
    const resilience = getResilienceWrapper('file-storage-service');

    try {
      return await resilience.execute(async () => {
        return await this.provider.upload(key, buffer, contentType);
      });
    } catch (error: any) {
      logger.error(`Failed to upload file ${key}:`, error.message);
      throw error;
    }
  }

  async download(key: string): Promise<Buffer> {
    const resilience = getResilienceWrapper('file-storage-service');

    try {
      return await resilience.execute(async () => {
        return await this.provider.download(key);
      });
    } catch (error: any) {
      logger.error(`Failed to download file ${key}:`, error.message);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    const resilience = getResilienceWrapper('file-storage-service');

    try {
      await resilience.execute(async () => {
        return await this.provider.delete(key);
      });
    } catch (error: any) {
      logger.error(`Failed to delete file ${key}:`, error.message);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    const resilience = getResilienceWrapper('file-storage-service');

    try {
      return await resilience.executeWithFallback(
        async () => {
          return await this.provider.exists(key);
        },
        false
      );
    } catch (error: any) {
      logger.error(`Failed to check file existence ${key}:`, error.message);
      return false;
    }
  }

  async getSignedUrl(key: string, expiresIn: number): Promise<string> {
    const resilience = getResilienceWrapper('file-storage-service');

    try {
      return await resilience.execute(async () => {
        return await this.provider.getSignedUrl(key, expiresIn);
      });
    } catch (error: any) {
      logger.error(`Failed to generate signed URL for ${key}:`, error.message);
      throw error;
    }
  }

  /**
   * Get resilience metrics for file storage service
   */
  getResilienceMetrics() {
    const resilience = getResilienceWrapper('file-storage-service');
    return resilience.getMetrics();
  }

  /**
   * Check if storage service is available
   */
  isAvailable(): boolean {
    const resilience = getResilienceWrapper('file-storage-service');
    return resilience.isAvailable();
  }

  /**
   * Reset resilience wrapper
   */
  resetResilience(): void {
    const resilience = getResilienceWrapper('file-storage-service');
    resilience.reset();
  }
}
