/**
 * Retry Pattern Implementation
 * 
 * Provides configurable retry logic with exponential backoff and jitter
 * for handling transient failures in external service calls.
 */

export interface RetryConfig {
  maxAttempts: number; // Maximum number of retry attempts (default: 3)
  initialDelayMs: number; // Initial delay in milliseconds (default: 1000)
  maxDelayMs: number; // Maximum delay in milliseconds (default: 30000)
  backoffMultiplier: number; // Exponential backoff multiplier (default: 2)
  jitterFactor: number; // Jitter factor 0-1 to randomize delays (default: 0.1)
  timeoutMs?: number; // Timeout for individual attempt (default: undefined)
}

export interface RetryMetrics {
  totalAttempts: number;
  successAttempt: number;
  lastError?: Error;
  totalDurationMs: number;
}

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly lastError: Error,
    public readonly attempts: number,
    public readonly metrics: RetryMetrics
  ) {
    super(message);
    this.name = 'RetryError';
  }
}

/**
 * Determines if an error is retryable
 */
export function isRetryableError(error: any): boolean {
  // Network errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return true;
  }

  // HTTP status codes that are retryable
  if (error.status) {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status);
  }

  // Timeout errors
  if (error.message && error.message.includes('timeout')) {
    return true;
  }

  return false;
}

/**
 * Calculate delay with exponential backoff and jitter
 */
export function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig
): number {
  // Exponential backoff: initialDelay * (multiplier ^ attempt)
  const exponentialDelay = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
  
  // Cap at maxDelay
  const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);
  
  // Add jitter: randomize by ±jitterFactor%
  const jitterAmount = cappedDelay * config.jitterFactor;
  const jitter = (Math.random() - 0.5) * 2 * jitterAmount;
  
  return Math.max(0, cappedDelay + jitter);
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig: RetryConfig = {
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    jitterFactor: 0.1,
    ...config,
  };

  const metrics: RetryMetrics = {
    totalAttempts: 0,
    successAttempt: 0,
    totalDurationMs: 0,
  };

  const startTime = Date.now();
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    metrics.totalAttempts = attempt;

    try {
      // Execute with optional timeout
      if (finalConfig.timeoutMs) {
        return await executeWithTimeout(fn, finalConfig.timeoutMs);
      } else {
        return await fn();
      }
    } catch (error: any) {
      lastError = error;
      metrics.lastError = error;

      // Check if error is retryable
      if (!isRetryableError(error)) {
        metrics.totalDurationMs = Date.now() - startTime;
        throw error;
      }

      // Don't retry if this was the last attempt
      if (attempt === finalConfig.maxAttempts) {
        metrics.totalDurationMs = Date.now() - startTime;
        throw new RetryError(
          `Failed after ${finalConfig.maxAttempts} attempts: ${error.message}`,
          error,
          attempt,
          metrics
        );
      }

      // Calculate delay before next attempt
      const delayMs = calculateBackoffDelay(attempt, finalConfig);
      await sleep(delayMs);
    }
  }

  // Should not reach here, but just in case
  metrics.totalDurationMs = Date.now() - startTime;
  throw new RetryError(
    `Retry exhausted after ${finalConfig.maxAttempts} attempts`,
    lastError || new Error('Unknown error'),
    finalConfig.maxAttempts,
    metrics
  );
}

/**
 * Execute a function with timeout
 */
async function executeWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry decorator for class methods
 */
export function Retry(config: Partial<RetryConfig> = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return withRetry(() => originalMethod.apply(this, args), config);
    };

    return descriptor;
  };
}
