/**
 * Service Provider Factories
 * 
 * This module exports factory classes for creating service providers.
 * Factories handle provider instantiation and configuration validation,
 * allowing easy switching between different implementations without
 * modifying service code.
 * 
 * Usage:
 * - EmailProviderFactory: Create email providers (SendGrid, SES, SMTP)
 * - StorageProviderFactory: Create file storage providers (S3, GCS)
 * - NotificationProviderFactory: Create notification providers (FCM)
 */

export { EmailProviderFactory } from './EmailProviderFactory';
export { StorageProviderFactory } from './StorageProviderFactory';
export { NotificationProviderFactory } from './NotificationProviderFactory';
