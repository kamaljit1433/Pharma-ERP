/**
 * Circuit Breaker Pattern Implementation
 * 
 * Prevents cascading failures by monitoring external service calls and
 * temporarily blocking requests when failure rate exceeds threshold.
 * 
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is failing, requests are blocked immediately
 * - HALF_OPEN: Testing if service has recovered, limited requests allowed
 */

export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening (default: 5)
  successThreshold: number; // Number of successes in HALF_OPEN before closing (default: 2)
  timeout: number; // Time in ms before transitioning from OPEN to HALF_OPEN (default: 60000)
  windowSize: number; // Time window in ms for tracking failures (default: 60000)
  name: string; // Identifier for the circuit breaker
}

export interface CircuitBreakerMetrics {
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
  successRate: number;
  lastError?: Error;
}

export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime?: Date;
  private lastSuccessTime?: Date;
  private openedAt?: Date;
  private totalRequests: number = 0;
  private totalFailures: number = 0;
  private totalSuccesses: number = 0;
  private failureTimestamps: number[] = [];
  private lastError?: Error;

  constructor(private config: CircuitBreakerConfig) {
    this.validateConfig();
  }

  private validateConfig(): void {
    if (this.config.failureThreshold < 1) {
      throw new Error('failureThreshold must be at least 1');
    }
    if (this.config.successThreshold < 1) {
      throw new Error('successThreshold must be at least 1');
    }
    if (this.config.timeout < 1000) {
      throw new Error('timeout must be at least 1000ms');
    }
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    // Check if circuit should transition from OPEN to HALF_OPEN
    if (this.state === CircuitBreakerState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitBreakerState.HALF_OPEN;
        this.successCount = 0;
      } else {
        throw new Error(
          `Circuit breaker "${this.config.name}" is OPEN. Service unavailable.`
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.lastError = error instanceof Error ? error : new Error(String(error));
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.successCount++;
    this.totalSuccesses++;
    this.lastSuccessTime = new Date();
    this.failureCount = 0;
    this.failureTimestamps = [];

    // Transition from HALF_OPEN to CLOSED after enough successes
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitBreakerState.CLOSED;
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.totalFailures++;
    this.lastFailureTime = new Date();
    this.failureTimestamps.push(Date.now());

    // Clean up old timestamps outside the window
    const windowStart = Date.now() - this.config.windowSize;
    this.failureTimestamps = this.failureTimestamps.filter(ts => ts > windowStart);

    // Transition from CLOSED to OPEN if threshold exceeded
    if (this.state === CircuitBreakerState.CLOSED) {
      if (this.failureTimestamps.length >= this.config.failureThreshold) {
        this.state = CircuitBreakerState.OPEN;
        this.openedAt = new Date();
      }
    }

    // Transition from HALF_OPEN back to OPEN on failure
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.state = CircuitBreakerState.OPEN;
      this.openedAt = new Date();
      this.successCount = 0;
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.openedAt) return false;
    const elapsed = Date.now() - this.openedAt.getTime();
    return elapsed >= this.config.timeout;
  }

  getMetrics(): CircuitBreakerMetrics {
    const successRate = this.totalRequests > 0 
      ? this.totalSuccesses / this.totalRequests 
      : 0;

    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
      successRate,
      lastError: this.lastError,
    };
  }

  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.failureTimestamps = [];
    this.openedAt = undefined;
    this.lastError = undefined;
    this.totalRequests = 0;
    this.totalFailures = 0;
    this.totalSuccesses = 0;
    this.lastFailureTime = undefined;
    this.lastSuccessTime = undefined;
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getName(): string {
    return this.config.name;
  }
}

/**
 * Global circuit breaker registry for managing multiple breakers
 */
export class CircuitBreakerRegistry {
  private breakers: Map<string, CircuitBreaker> = new Map();

  register(name: string, config: CircuitBreakerConfig): CircuitBreaker {
    if (this.breakers.has(name)) {
      throw new Error(`Circuit breaker "${name}" is already registered`);
    }
    const breaker = new CircuitBreaker({ ...config, name });
    this.breakers.set(name, breaker);
    return breaker;
  }

  get(name: string): CircuitBreaker {
    const breaker = this.breakers.get(name);
    if (!breaker) {
      throw new Error(`Circuit breaker "${name}" not found`);
    }
    return breaker;
  }

  getAll(): Map<string, CircuitBreaker> {
    return new Map(this.breakers);
  }

  getAllMetrics(): Record<string, CircuitBreakerMetrics> {
    const metrics: Record<string, CircuitBreakerMetrics> = {};
    for (const [name, breaker] of this.breakers) {
      metrics[name] = breaker.getMetrics();
    }
    return metrics;
  }

  reset(name: string): void {
    const breaker = this.get(name);
    breaker.reset();
  }

  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }
}

export const circuitBreakerRegistry = new CircuitBreakerRegistry();
