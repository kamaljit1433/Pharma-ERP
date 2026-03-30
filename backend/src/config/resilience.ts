/**
 * Resilience Configuration
 * 
 * Initializes resilience wrappers for all external service calls
 * (Email, Notifications, File Storage, Google Maps, etc.)
 */

import { resilienceRegistry, ResilienceConfig } from '../utils/resilience';

/**
 * Initialize all resilience wrappers for external services
 */
export function initializeResilienceWrappers(): void {
  // Email Service Resilience
  resilienceRegistry.register({
    name: 'email-service',
    enableLogging: true,
    retry: {
      maxAttempts: 3,
      initialDelayMs: 1000,
      maxDelayMs: 10000,
      backoffMultiplier: 2,
      jitterFactor: 0.1,
      timeoutMs: 30000,
    },
    circuitBreaker: {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
      windowSize: 60000,
    },
  });

  // Notification Service (Firebase Cloud Messaging) Resilience
  resilienceRegistry.register({
    name: 'notification-service',
    enableLogging: true,
    retry: {
      maxAttempts: 3,
      initialDelayMs: 500,
      maxDelayMs: 5000,
      backoffMultiplier: 2,
      jitterFactor: 0.1,
      timeoutMs: 15000,
    },
    circuitBreaker: {
      failureThreshold: 10,
      successThreshold: 3,
      timeout: 30000,
      windowSize: 60000,
    },
  });

  // File Storage Service (AWS S3) Resilience
  resilienceRegistry.register({
    name: 'file-storage-service',
    enableLogging: true,
    retry: {
      maxAttempts: 4,
      initialDelayMs: 1000,
      maxDelayMs: 15000,
      backoffMultiplier: 2,
      jitterFactor: 0.15,
      timeoutMs: 60000,
    },
    circuitBreaker: {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 120000,
      windowSize: 120000,
    },
  });

  // Google Maps API Resilience
  resilienceRegistry.register({
    name: 'google-maps-service',
    enableLogging: true,
    retry: {
      maxAttempts: 3,
      initialDelayMs: 500,
      maxDelayMs: 5000,
      backoffMultiplier: 2,
      jitterFactor: 0.1,
      timeoutMs: 10000,
    },
    circuitBreaker: {
      failureThreshold: 8,
      successThreshold: 3,
      timeout: 60000,
      windowSize: 60000,
    },
  });

  // Database Connection Resilience
  resilienceRegistry.register({
    name: 'database-service',
    enableLogging: true,
    retry: {
      maxAttempts: 5,
      initialDelayMs: 500,
      maxDelayMs: 10000,
      backoffMultiplier: 1.5,
      jitterFactor: 0.1,
      timeoutMs: 30000,
    },
    circuitBreaker: {
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 30000,
      windowSize: 60000,
    },
  });

  // Redis Cache Resilience
  resilienceRegistry.register({
    name: 'redis-service',
    enableLogging: true,
    retry: {
      maxAttempts: 2,
      initialDelayMs: 100,
      maxDelayMs: 1000,
      backoffMultiplier: 2,
      jitterFactor: 0.1,
      timeoutMs: 5000,
    },
    circuitBreaker: {
      failureThreshold: 10,
      successThreshold: 5,
      timeout: 30000,
      windowSize: 60000,
    },
  });

  // OAuth/Authentication Service Resilience
  resilienceRegistry.register({
    name: 'oauth-service',
    enableLogging: true,
    retry: {
      maxAttempts: 2,
      initialDelayMs: 1000,
      maxDelayMs: 5000,
      backoffMultiplier: 2,
      jitterFactor: 0.1,
      timeoutMs: 15000,
    },
    circuitBreaker: {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
      windowSize: 60000,
    },
  });
}

/**
 * Get resilience wrapper for a specific service
 */
export function getResilienceWrapper(serviceName: string) {
  return resilienceRegistry.get(serviceName);
}

/**
 * Get all resilience metrics
 */
export function getAllResilienceMetrics() {
  return resilienceRegistry.getAllMetrics();
}

/**
 * Reset all resilience wrappers
 */
export function resetAllResilienceWrappers() {
  resilienceRegistry.resetAll();
}
