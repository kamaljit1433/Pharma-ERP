/**
 * Resilience Wrapper
 * 
 * Combines retry and circuit breaker patterns for robust external service calls.
 * Provides a unified interface for handling transient and persistent failures.
 */

import { CircuitBreaker, CircuitBreakerConfig, CircuitBreakerState } from './circuitBreaker';
import { withRetry, RetryConfig, isRetryableError, RetryError } from './retry';
import logger from './logger';

export interface ResilienceConfig {
  name: string;
  retry?: Partial<RetryConfig>;
  circuitBreaker?: Partial<CircuitBreakerConfig>;
  enableLogging?: boolean;
}

export interface ResilienceMetrics {
  name: string;
  circuitBreakerState: CircuitBreakerState;
  totalAttempts: number;
  totalSuccesses: number;
  totalFailures: number;
  lastError?: string;
  lastErrorTime?: Date;
}

export class ResilienceWrapper {
  private circuitBreaker: CircuitBreaker;
  private config: ResilienceConfig;
  private totalAttempts: number = 0;
  private totalSuccesses: number = 0;
  private totalFailures: number = 0;
  private lastError?: Error;
  private lastErrorTime?: Date;

  constructor(config: ResilienceConfig) {
    this.config = config;

    // Initialize circuit breaker with defaults
    const cbConfig: CircuitBreakerConfig = {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
      windowSize: 60000,
      name: config.name,
      ...config.circuitBreaker,
    };

    this.circuitBreaker = new CircuitBreaker(cbConfig);
  }

  /**
   * Execute a function with both retry and circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalAttempts++;

    try {
      // Use circuit breaker to wrap the retry logic
      const result = await this.circuitBreaker.execute(async () => {
        return await withRetry(fn, this.config.retry);
      });

      this.totalSuccesses++;
      this.log('info', `Operation succeeded on attempt ${this.totalAttempts}`);
      return result;
    } catch (error: any) {
      this.totalFailures++;
      this.lastError = error;
      this.lastErrorTime = new Date();

      this.log('error', `Operation failed: ${error.message}`);

      throw error;
    }
  }

  /**
   * Execute with fallback value on failure
   */
  async executeWithFallback<T>(
    fn: () => Promise<T>,
    fallback: T | (() => Promise<T>)
  ): Promise<T> {
    try {
      return await this.execute(fn);
    } catch (error: any) {
      this.log('warn', `Using fallback due to: ${error.message}`);

      if (typeof fallback === 'function') {
        return await (fallback as () => Promise<T>)();
      }
      return fallback;
    }
  }

  /**
   * Execute with timeout
   */
  async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return this.execute(async () => {
      return Promise.race([
        fn(),
        new Promise<T>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
            timeoutMs
          )
        ),
      ]);
    });
  }

  /**
   * Get current metrics
   */
  getMetrics(): ResilienceMetrics {
    const cbMetrics = this.circuitBreaker.getMetrics();

    return {
      name: this.config.name,
      circuitBreakerState: cbMetrics.state,
      totalAttempts: this.totalAttempts,
      totalSuccesses: this.totalSuccesses,
      totalFailures: this.totalFailures,
      lastError: this.lastError?.message,
      lastErrorTime: this.lastErrorTime,
    };
  }

  /**
   * Reset the resilience wrapper
   */
  reset(): void {
    this.circuitBreaker.reset();
    this.totalAttempts = 0;
    this.totalSuccesses = 0;
    this.totalFailures = 0;
    this.lastError = undefined;
    this.lastErrorTime = undefined;
    this.log('info', 'Resilience wrapper reset');
  }

  /**
   * Get circuit breaker state
   */
  getCircuitBreakerState(): CircuitBreakerState {
    return this.circuitBreaker.getState();
  }

  /**
   * Check if service is available (circuit breaker not open)
   */
  isAvailable(): boolean {
    return this.circuitBreaker.getState() !== CircuitBreakerState.OPEN;
  }

  private log(level: 'info' | 'warn' | 'error', message: string): void {
    if (this.config.enableLogging !== false) {
      logger[level](`[${this.config.name}] ${message}`);
    }
  }
}

/**
 * Global resilience wrapper registry
 */
export class ResilienceRegistry {
  private wrappers: Map<string, ResilienceWrapper> = new Map();

  register(config: ResilienceConfig): ResilienceWrapper {
    if (this.wrappers.has(config.name)) {
      throw new Error(`Resilience wrapper "${config.name}" is already registered`);
    }

    const wrapper = new ResilienceWrapper(config);
    this.wrappers.set(config.name, wrapper);
    return wrapper;
  }

  get(name: string): ResilienceWrapper {
    const wrapper = this.wrappers.get(name);
    if (!wrapper) {
      throw new Error(`Resilience wrapper "${name}" not found`);
    }
    return wrapper;
  }

  getAll(): Map<string, ResilienceWrapper> {
    return new Map(this.wrappers);
  }

  getAllMetrics(): Record<string, ResilienceMetrics> {
    const metrics: Record<string, ResilienceMetrics> = {};
    for (const [name, wrapper] of this.wrappers) {
      metrics[name] = wrapper.getMetrics();
    }
    return metrics;
  }

  reset(name: string): void {
    const wrapper = this.get(name);
    wrapper.reset();
  }

  resetAll(): void {
    for (const wrapper of this.wrappers.values()) {
      wrapper.reset();
    }
  }
}

export const resilienceRegistry = new ResilienceRegistry();
