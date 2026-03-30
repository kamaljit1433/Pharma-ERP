# Resilience Patterns - Complete Guide

## Overview

This comprehensive guide covers the retry and circuit breaker patterns implemented in the Employee Management System to handle transient failures in external service calls (Email, Notifications, File Storage, Google Maps, Database, Redis, OAuth).

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Retry Pattern](#retry-pattern)
3. [Circuit Breaker Pattern](#circuit-breaker-pattern)
4. [Resilience Wrapper](#resilience-wrapper)
5. [Configuration](#configuration)
6. [Usage Examples](#usage-examples)
7. [Monitoring](#monitoring)
8. [Integration Checklist](#integration-checklist)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Quick Start

### 1. Initialize on Startup
```typescript
import { initializeResilienceWrappers } from './config/resilience';

initializeResilienceWrappers();
```

### 2. Use in Service
```typescript
import { resilienceRegistry } from './config/resilience';

const resilience = resilienceRegistry.get('email-service');
const result = await resilience.execute(async () => {
  return await emailService.send(options);
});
```

### 3. Check Health
```bash
curl http://localhost:3000/health/resilience
```

---

## Retry Pattern

### What is Retry?

The retry pattern automatically retries failed operations with exponential backoff and jitter to handle transient failures gracefully.

### Key Features

- **Exponential Backoff**: Delays increase exponentially between retries (1s, 2s, 4s, etc.)
- **Jitter**: Random variation in delays to prevent thundering herd problem
- **Timeout Support**: Individual attempt timeout to prevent hanging
- **Retryable Error Detection**: Only retries transient errors (network, timeouts, 5xx)
- **Metrics Tracking**: Tracks attempts, successes, and failures

### Configuration

```typescript
interface RetryConfig {
  maxAttempts: number;        // Default: 3
  initialDelayMs: number;     // Default: 1000
  maxDelayMs: number;         // Default: 30000
  backoffMultiplier: number;  // Default: 2
  jitterFactor: number;       // Default: 0.1 (10%)
  timeoutMs?: number;         // Optional timeout per attempt
}
```

### Retryable Errors

✅ **Will Retry:**
- Network errors: ECONNREFUSED, ECONNRESET, ETIMEDOUT
- HTTP 408 (Request Timeout)
- HTTP 429 (Too Many Requests)
- HTTP 500 (Internal Server Error)
- HTTP 502 (Bad Gateway)
- HTTP 503 (Service Unavailable)
- HTTP 504 (Gateway Timeout)

❌ **Won't Retry:**
- HTTP 400 (Bad Request)
- HTTP 401 (Unauthorized)
- HTTP 403 (Forbidden)
- HTTP 404 (Not Found)
- Validation errors

### Backoff Calculation

```
Attempt 1: 1000ms
Attempt 2: 2000ms (1000 * 2^1)
Attempt 3: 4000ms (1000 * 2^2)
Attempt 4: 8000ms (1000 * 2^3)
...
Max: 30000ms (capped)

With jitter (±10%):
Attempt 1: 900-1100ms
Attempt 2: 1800-2200ms
Attempt 3: 3600-4400ms
```

### Usage

```typescript
import { withRetry } from '../utils/retry';

// Basic usage
const result = await withRetry(async () => {
  return await emailService.send(options);
});

// With custom config
const result = await withRetry(
  async () => {
    return await emailService.send(options);
  },
  {
    maxAttempts: 5,
    initialDelayMs: 500,
    maxDelayMs: 10000,
    timeoutMs: 30000,
  }
);
```

---

## Circuit Breaker Pattern

### What is Circuit Breaker?

The circuit breaker pattern prevents cascading failures by monitoring external service calls and temporarily blocking requests when failure rate exceeds a threshold.

### States

1. **CLOSED** (Normal)
   - Requests pass through normally
   - Failures are tracked
   - Transitions to OPEN when failure threshold exceeded

2. **OPEN** (Failing)
   - Requests are blocked immediately
   - No calls to the failing service
   - Transitions to HALF_OPEN after timeout

3. **HALF_OPEN** (Testing)
   - Limited requests allowed to test recovery
   - Transitions to CLOSED if successes exceed threshold
   - Transitions back to OPEN on failure

### State Transitions

```
CLOSED
  ↓ (failures ≥ threshold)
OPEN
  ↓ (timeout elapsed)
HALF_OPEN
  ↓ (successes ≥ threshold)
CLOSED

HALF_OPEN
  ↓ (failure)
OPEN
```

### Configuration

```typescript
interface CircuitBreakerConfig {
  failureThreshold: number;   // Failures before opening
  successThreshold: number;   // Successes in HALF_OPEN before closing
  timeout: number;            // Time before OPEN → HALF_OPEN (ms)
  windowSize: number;         // Time window for tracking failures (ms)
  name: string;               // Identifier
}
```

### Usage

```typescript
import { CircuitBreaker } from '../utils/circuitBreaker';

const breaker = new CircuitBreaker({
  name: 'email-service',
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000,
  windowSize: 60000,
});

try {
  const result = await breaker.execute(async () => {
    return await emailService.send(options);
  });
} catch (error) {
  if (error.message.includes('OPEN')) {
    console.log('Email service temporarily unavailable');
  }
}

// Get metrics
const metrics = breaker.getMetrics();
console.log(metrics.state); // CLOSED, OPEN, or HALF_OPEN
```

---

## Resilience Wrapper

### What is Resilience Wrapper?

The resilience wrapper combines retry and circuit breaker patterns for comprehensive failure handling.

### Features

- Combines retry and circuit breaker
- Fallback value support
- Timeout support
- Unified metrics
- Service availability checking

### Usage

```typescript
import { resilienceRegistry } from '../config/resilience';

// Get wrapper
const resilience = resilienceRegistry.get('email-service');

// Execute with retry + circuit breaker
const result = await resilience.execute(async () => {
  return await emailService.send(options);
});

// Execute with fallback
const result = await resilience.executeWithFallback(
  async () => {
    return await emailService.send(options);
  },
  { success: false, error: 'Service unavailable' }
);

// Check availability
if (resilience.isAvailable()) {
  // Service is available
}

// Get metrics
const metrics = resilience.getMetrics();
console.log(metrics.circuitBreakerState);
console.log(metrics.totalAttempts);
console.log(metrics.totalSuccesses);
console.log(metrics.totalFailures);
```

---

## Configuration

### Pre-configured Services

| Service | Max Attempts | Initial Delay | Max Delay | CB Timeout | Failure Threshold |
|---------|--------------|---------------|-----------|------------|-------------------|
| email-service | 3 | 1000ms | 10000ms | 60s | 5 |
| notification-service | 3 | 500ms | 5000ms | 30s | 10 |
| file-storage-service | 4 | 1000ms | 15000ms | 120s | 5 |
| google-maps-service | 3 | 500ms | 5000ms | 60s | 8 |
| database-service | 5 | 500ms | 10000ms | 30s | 3 |
| redis-service | 2 | 100ms | 1000ms | 30s | 10 |
| oauth-service | 2 | 1000ms | 5000ms | 60s | 5 |

### Customizing Configuration

```typescript
// In src/config/resilience.ts
resilienceRegistry.register({
  name: 'email-service',
  retry: {
    maxAttempts: 5,
    initialDelayMs: 500,
  },
  circuitBreaker: {
    failureThreshold: 3,
    timeout: 30000,
  },
});
```

---

## Usage Examples

### Example 1: Email Service with Resilience

```typescript
import { resilienceRegistry } from '../config/resilience';
import logger from '../utils/logger';

export class EmailService {
  async send(options: EmailOptions): Promise<EmailResult> {
    const resilience = resilienceRegistry.get('email-service');

    try {
      return await resilience.execute(async () => {
        logger.info(`Sending email to ${options.to}`);
        return await this.provider.send(options);
      });
    } catch (error: any) {
      logger.error(`Email send failed: ${error.message}`);
      
      if (resilience.isAvailable()) {
        throw error;
      } else {
        logger.warn('Email service unavailable, queuing for later');
        this.queueEmail(options);
        return {
          success: false,
          error: 'Email service temporarily unavailable, queued for retry',
        };
      }
    }
  }
}
```

### Example 2: Notification Service (Non-Critical)

```typescript
export class NotificationService {
  async sendNotification(data: SendNotificationDTO): Promise<void> {
    const resilience = resilienceRegistry.get('notification-service');

    try {
      await resilience.execute(async () => {
        logger.info(`Sending notification to employee ${data.employeeId}`);
        return await this.provider.send(data);
      });
    } catch (error: any) {
      // Log but don't throw - notifications are non-critical
      logger.warn(
        `Failed to send notification to ${data.employeeId}: ${error.message}`
      );
    }
  }
}
```

### Example 3: File Storage with Timeout

```typescript
export class FileStorageService {
  async upload(
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<string> {
    const resilience = resilienceRegistry.get('file-storage-service');

    try {
      return await resilience.executeWithTimeout(
        async () => {
          logger.info(`Uploading file ${key}`);
          return await this.provider.upload(key, buffer, contentType);
        },
        60000 // 60 second timeout
      );
    } catch (error: any) {
      logger.error(`File upload failed for ${key}: ${error.message}`);
      throw error;
    }
  }
}
```

### Example 4: Google Maps with Availability Check

```typescript
export class GeoTrackingService {
  async calculateDistance(waypoints: GeoLocation[]): Promise<number> {
    const resilience = resilienceRegistry.get('google-maps-service');

    // Check availability first
    if (!resilience.isAvailable()) {
      logger.warn('Google Maps service unavailable, using fallback calculation');
      return this.calculateStraightLineDistance(waypoints);
    }

    try {
      return await resilience.executeWithTimeout(
        async () => {
          logger.info(`Calculating distance for ${waypoints.length} waypoints`);
          return await this.mapsClient.calculateDistance(waypoints);
        },
        10000 // 10 second timeout
      );
    } catch (error: any) {
      logger.error(`Distance calculation failed: ${error.message}`);
      return this.calculateStraightLineDistance(waypoints);
    }
  }
}
```

---

## Monitoring

### Health Check Endpoints

#### 1. Basic Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-20T10:30:00Z",
  "uptime": 3600
}
```

#### 2. Resilience Metrics
```bash
GET /health/resilience
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-20T10:30:00Z",
  "services": {
    "email-service": {
      "name": "email-service",
      "circuitBreakerState": "CLOSED",
      "totalAttempts": 150,
      "totalSuccesses": 148,
      "totalFailures": 2,
      "lastError": null,
      "lastErrorTime": null
    }
  }
}
```

#### 3. Service-Specific Metrics
```bash
GET /health/resilience/email-service
```

#### 4. Detailed Health Check
```bash
GET /health/detailed
```

### Metrics Interpretation

```json
{
  "name": "email-service",
  "circuitBreakerState": "CLOSED",
  "totalAttempts": 150,
  "totalSuccesses": 148,
  "totalFailures": 2,
  "lastError": null,
  "lastErrorTime": null
}
```

- **CLOSED**: ✅ Service is healthy, requests passing through normally
- **HALF_OPEN**: 🔄 Service was failing, now testing recovery with limited requests
- **OPEN**: ❌ Service is failing, requests blocked to prevent cascading failures

---

## Integration Checklist

### Phase 1: Application Startup
- [ ] Initialize Resilience Wrappers in `src/index.ts`
- [ ] Add Health Check Routes
- [ ] Verify Initialization with `curl http://localhost:3000/health`

### Phase 2: Email Service Integration
- [ ] Wrap Email Provider with resilience
- [ ] Update Email Service to use resilience registry
- [ ] Test Email Resilience with health endpoint

### Phase 3: Notification Service Integration
- [ ] Wrap Notification Provider with resilience
- [ ] Update Notification Service
- [ ] Test Notification Resilience

### Phase 4: File Storage Integration
- [ ] Wrap Storage Provider with resilience
- [ ] Update File Storage Service
- [ ] Test Storage Resilience

### Phase 5: Google Maps Integration
- [ ] Wrap Google Maps Client with resilience
- [ ] Add timeout support
- [ ] Test Maps Resilience

### Phase 6: Database Integration
- [ ] Wrap Database Connections
- [ ] Test Database Resilience

### Phase 7: Redis Integration
- [ ] Wrap Redis Client
- [ ] Add fallback support
- [ ] Test Redis Resilience

### Phase 8: OAuth Integration
- [ ] Wrap OAuth Client
- [ ] Test OAuth Resilience

### Phase 9: Monitoring Setup
- [ ] Set Up Health Check Monitoring
- [ ] Configure Alerting
- [ ] Create Dashboard

### Phase 10: Testing
- [ ] Run Unit Tests
- [ ] Test Circuit Breaker Opening
- [ ] Test Retry Logic
- [ ] Test Fallback Behavior
- [ ] Test Recovery

### Phase 11: Documentation
- [ ] Update API Documentation
- [ ] Update Runbooks
- [ ] Update Deployment Guide

### Phase 12: Production Deployment
- [ ] Pre-Deployment Checklist
- [ ] Deployment Steps
- [ ] Post-Deployment Verification

---

## Troubleshooting

### Circuit Breaker Stuck OPEN

**Problem**: All requests failing with "Circuit breaker is OPEN"

**Solution**:
1. Check if service is actually healthy
2. Wait for timeout (60s default)
3. Or manually reset: `resilience.reset()`
4. Check logs for actual error

### Too Many Retries

**Problem**: Requests taking too long

**Solution**:
1. Reduce `maxAttempts`
2. Increase `initialDelayMs`
3. Check if error is actually retryable
4. Consider using fallback instead

### Service Unavailable

**Problem**: Circuit breaker keeps opening

**Solution**:
1. Verify service is running
2. Check network connectivity
3. Review service logs
4. Increase `failureThreshold`

### High Failure Rate

**Problem**: Many failures in metrics

**Solution**:
1. Check detailed metrics: `curl http://localhost:3000/health/detailed`
2. Check logs for actual errors
3. Verify service is available
4. Check network connectivity

---

## Best Practices

### 1. Choose Appropriate Timeouts

```typescript
// Fast services (cache, local DB)
timeoutMs: 5000

// Medium services (external APIs)
timeoutMs: 15000

// Slow services (file uploads, batch processing)
timeoutMs: 60000
```

### 2. Adjust Thresholds Based on Service

```typescript
// Critical services (auth, payments)
failureThreshold: 3
successThreshold: 2
timeout: 30000

// Non-critical services (notifications)
failureThreshold: 10
successThreshold: 5
timeout: 60000
```

### 3. Use Fallbacks for Non-Critical Operations

```typescript
// Critical: fail fast
await resilience.execute(fn);

// Non-critical: use fallback
await resilience.executeWithFallback(fn, defaultValue);
```

### 4. Log and Monitor

```typescript
const metrics = resilience.getMetrics();
if (metrics.totalFailures > 10) {
  logger.warn(`Service ${metrics.name} has high failure rate`);
}
```

### 5. Test Failure Scenarios

```typescript
// Test circuit breaker opening
for (let i = 0; i < 5; i++) {
  try {
    await resilience.execute(() => Promise.reject(new Error('Test')));
  } catch (error) {
    // Expected
  }
}

// Verify circuit is open
expect(resilience.getCircuitBreakerState()).toBe('OPEN');
```

### 6. Document Service Dependencies

```typescript
/**
 * Sends email with automatic retry and circuit breaker protection
 * 
 * Retries up to 3 times with exponential backoff
 * Circuit breaker opens after 5 consecutive failures
 * 
 * @throws {RetryError} If all retries exhausted
 * @throws {Error} If circuit breaker is open
 */
async send(options: EmailOptions): Promise<EmailResult>
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/utils/circuitBreaker.ts` | Circuit breaker implementation |
| `src/utils/retry.ts` | Retry logic implementation |
| `src/utils/resilience.ts` | Combined wrapper |
| `src/config/resilience.ts` | Configuration & initialization |
| `src/routes/health.ts` | Health check endpoints |
| `src/controllers/healthController.ts` | Health check logic |
| `src/utils/__tests__/resilience.test.ts` | Comprehensive tests |

---

## Key Takeaways

1. **Retry** handles transient failures automatically
2. **Circuit Breaker** prevents cascading failures
3. **Together** they make services resilient
4. **Monitor** via health check endpoints
5. **Configure** based on service criticality
6. **Test** failure scenarios regularly

---

## Support

For detailed implementation examples, see the service implementations in:
- `src/services/emailService.ts`
- `src/services/notificationService.ts`
- `src/services/fileStorageService.ts`
- `src/services/geoTrackingService.ts`
