/**
 * Resilience Pattern Tests
 * 
 * Tests for retry and circuit breaker patterns
 */

import { CircuitBreaker, CircuitBreakerState, CircuitBreakerRegistry } from '../circuitBreaker';
import { withRetry, isRetryableError, calculateBackoffDelay, RetryError } from '../retry';
import { ResilienceWrapper, resilienceRegistry } from '../resilience';

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker({
      name: 'test-breaker',
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 1000,
      windowSize: 5000,
    });
  });

  describe('State Transitions', () => {
    it('should start in CLOSED state', () => {
      expect(breaker.getState()).toBe(CircuitBreakerState.CLOSED);
    });

    it('should transition from CLOSED to OPEN after threshold failures', async () => {
      const failingFn = () => Promise.reject(new Error('Test error'));

      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(failingFn);
        } catch (error) {
          // Expected
        }
      }

      expect(breaker.getState()).toBe(CircuitBreakerState.OPEN);
    });

    it('should block requests when OPEN', async () => {
      const failingFn = () => Promise.reject(new Error('Test error'));

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(failingFn);
        } catch (error) {
          // Expected
        }
      }

      // Try to execute when open
      await expect(breaker.execute(failingFn)).rejects.toThrow(
        'Circuit breaker "test-breaker" is OPEN'
      );
    });

    it('should transition from OPEN to HALF_OPEN after timeout', async () => {
      const failingFn = () => Promise.reject(new Error('Test error'));

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(failingFn);
        } catch (error) {
          // Expected
        }
      }

      expect(breaker.getState()).toBe(CircuitBreakerState.OPEN);

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Next execution should transition to HALF_OPEN
      const successFn = () => Promise.resolve('success');
      const result = await breaker.execute(successFn);
      expect(result).toBe('success');
      expect(breaker.getState()).toBe(CircuitBreakerState.HALF_OPEN);
    });

    it('should transition from HALF_OPEN to CLOSED after success threshold', async () => {
      const failingFn = () => Promise.reject(new Error('Test error'));
      const successFn = () => Promise.resolve('success');

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(failingFn);
        } catch (error) {
          // Expected
        }
      }

      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Execute successes to close
      for (let i = 0; i < 2; i++) {
        await breaker.execute(successFn);
      }

      expect(breaker.getState()).toBe(CircuitBreakerState.CLOSED);
    });
  });

  describe('Metrics', () => {
    it('should track metrics correctly', async () => {
      const successFn = () => Promise.resolve('success');

      await breaker.execute(successFn);
      await breaker.execute(successFn);

      const metrics = breaker.getMetrics();
      expect(metrics.totalRequests).toBe(2);
      expect(metrics.totalSuccesses).toBe(2);
      expect(metrics.totalFailures).toBe(0);
    });
  });

  describe('Reset', () => {
    it('should reset to CLOSED state', async () => {
      const failingFn = () => Promise.reject(new Error('Test error'));

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(failingFn);
        } catch (error) {
          // Expected
        }
      }

      expect(breaker.getState()).toBe(CircuitBreakerState.OPEN);

      breaker.reset();
      expect(breaker.getState()).toBe(CircuitBreakerState.CLOSED);
    });
  });
});

describe('Retry', () => {
  describe('isRetryableError', () => {
    it('should identify network errors as retryable', () => {
      const error = new Error('Connection refused');
      (error as any).code = 'ECONNREFUSED';
      expect(isRetryableError(error)).toBe(true);
    });

    it('should identify timeout errors as retryable', () => {
      const error = new Error('Operation timed out');
      expect(isRetryableError(error)).toBe(true);
    });

    it('should identify 5xx errors as retryable', () => {
      const error = new Error('Server error');
      (error as any).status = 503;
      expect(isRetryableError(error)).toBe(true);
    });

    it('should not identify 4xx errors as retryable', () => {
      const error = new Error('Bad request');
      (error as any).status = 400;
      expect(isRetryableError(error)).toBe(false);
    });
  });

  describe('calculateBackoffDelay', () => {
    it('should calculate exponential backoff', () => {
      const config = {
        initialDelayMs: 1000,
        maxDelayMs: 30000,
        backoffMultiplier: 2,
        jitterFactor: 0,
        maxAttempts: 3,
        successThreshold: 2,
        timeout: 60000,
        windowSize: 60000,
        name: 'test',
      };

      const delay1 = calculateBackoffDelay(1, config);
      const delay2 = calculateBackoffDelay(2, config);
      const delay3 = calculateBackoffDelay(3, config);

      expect(delay1).toBe(1000);
      expect(delay2).toBe(2000);
      expect(delay3).toBe(4000);
    });

    it('should cap delay at maxDelayMs', () => {
      const config = {
        initialDelayMs: 1000,
        maxDelayMs: 5000,
        backoffMultiplier: 2,
        jitterFactor: 0,
        maxAttempts: 3,
        successThreshold: 2,
        timeout: 60000,
        windowSize: 60000,
        name: 'test',
      };

      const delay = calculateBackoffDelay(10, config);
      expect(delay).toBeLessThanOrEqual(5000);
    });
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      const result = await withRetry(fn, { maxAttempts: 3 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on transient failure', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce('success');

      const error = new Error('Temporary error');
      (error as any).code = 'ECONNREFUSED';

      const fn2 = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce('success');

      const result = await withRetry(fn2, { maxAttempts: 3, initialDelayMs: 10 });

      expect(result).toBe('success');
      expect(fn2).toHaveBeenCalledTimes(2);
    });

    it('should throw RetryError after max attempts', async () => {
      const error = new Error('Persistent error');
      (error as any).code = 'ECONNREFUSED';
      const fn = jest.fn().mockRejectedValue(error);

      await expect(
        withRetry(fn, { maxAttempts: 2, initialDelayMs: 10 })
      ).rejects.toThrow(RetryError);

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-retryable errors', async () => {
      const error = new Error('Bad request');
      (error as any).status = 400;
      const fn = jest.fn().mockRejectedValue(error);

      await expect(
        withRetry(fn, { maxAttempts: 3, initialDelayMs: 10 })
      ).rejects.toThrow('Bad request');

      expect(fn).toHaveBeenCalledTimes(1);
    });
  });
});

describe('ResilienceWrapper', () => {
  let wrapper: ResilienceWrapper;

  beforeEach(() => {
    wrapper = new ResilienceWrapper({
      name: 'test-wrapper',
      enableLogging: false,
      retry: { maxAttempts: 2, initialDelayMs: 10 },
      circuitBreaker: { failureThreshold: 2, timeout: 500 },
    });
  });

  it('should execute successfully', async () => {
    const fn = jest.fn().mockResolvedValue('success');

    const result = await wrapper.execute(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should use fallback on failure', async () => {
    const error = new Error('Test error');
    (error as any).code = 'ECONNREFUSED';
    const fn = jest.fn().mockRejectedValue(error);

    const result = await wrapper.executeWithFallback(fn, 'fallback-value');

    expect(result).toBe('fallback-value');
  });

  it('should track metrics', async () => {
    const fn = jest.fn().mockResolvedValue('success');

    await wrapper.execute(fn);

    const metrics = wrapper.getMetrics();
    expect(metrics.totalAttempts).toBe(1);
    expect(metrics.totalSuccesses).toBe(1);
    expect(metrics.totalFailures).toBe(0);
  });

  it('should report availability', () => {
    expect(wrapper.isAvailable()).toBe(true);
  });
});

describe('CircuitBreakerRegistry', () => {
  let registry: CircuitBreakerRegistry;

  beforeEach(() => {
    registry = new CircuitBreakerRegistry();
  });

  it('should register and retrieve breakers', () => {
    const breaker = registry.register('test', {
      name: 'test',
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
      windowSize: 60000,
    });

    expect(registry.get('test')).toBe(breaker);
  });

  it('should prevent duplicate registration', () => {
    registry.register('test', {
      name: 'test',
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
      windowSize: 60000,
    });

    expect(() => {
      registry.register('test', {
        name: 'test',
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 60000,
        windowSize: 60000,
      });
    }).toThrow('already registered');
  });

  it('should get all metrics', () => {
    registry.register('test1', {
      name: 'test1',
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
      windowSize: 60000,
    });

    registry.register('test2', {
      name: 'test2',
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
      windowSize: 60000,
    });

    const metrics = registry.getAllMetrics();
    expect(Object.keys(metrics)).toHaveLength(2);
  });
});
