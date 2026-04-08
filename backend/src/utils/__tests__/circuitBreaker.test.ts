/**
 * Circuit Breaker Utility Tests
 * Tests for circuit breaker pattern implementation
 */

import { CircuitBreaker, CircuitBreakerState } from '../circuitBreaker';

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

  describe('State Management', () => {
    it('should start in CLOSED state', () => {
      expect(breaker.getState()).toBe(CircuitBreakerState.CLOSED);
    });

    it('should transition to OPEN after failure threshold', async () => {
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

      // Wait for timeout (1000ms + buffer)
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

      // Wait for timeout (1000ms + buffer)
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Execute successes to close
      for (let i = 0; i < 2; i++) {
        await breaker.execute(successFn);
      }

      expect(breaker.getState()).toBe(CircuitBreakerState.CLOSED);
    });

    it('should transition from HALF_OPEN to OPEN on failure', async () => {
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

      // Wait for timeout (1000ms + buffer)
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Transition to HALF_OPEN
      await breaker.execute(successFn);
      expect(breaker.getState()).toBe(CircuitBreakerState.HALF_OPEN);

      // Fail in HALF_OPEN
      try {
        await breaker.execute(failingFn);
      } catch (error) {
        // Expected
      }

      expect(breaker.getState()).toBe(CircuitBreakerState.OPEN);
    });
  });

  describe('Execution', () => {
    it('should execute successful function', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      const result = await breaker.execute(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should propagate function errors', async () => {
      const error = new Error('Test error');
      const fn = jest.fn().mockRejectedValue(error);

      await expect(breaker.execute(fn)).rejects.toThrow('Test error');
    });

    it('should handle async functions', async () => {
      const fn = jest.fn(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'success';
      });

      const result = await breaker.execute(fn);

      expect(result).toBe('success');
    });

    it('should handle function arguments', async () => {
      const fn = jest.fn((a, b) => Promise.resolve(a + b));

      const result = await breaker.execute(() => fn(2, 3));

      expect(result).toBe(5);
    });
  });

  describe('Metrics', () => {
    it('should track total requests', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      await breaker.execute(fn);
      await breaker.execute(fn);

      const metrics = breaker.getMetrics();
      expect(metrics.totalRequests).toBe(2);
    });

    it('should track successes', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      await breaker.execute(fn);
      await breaker.execute(fn);

      const metrics = breaker.getMetrics();
      expect(metrics.totalSuccesses).toBe(2);
    });

    it('should track failures', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Test error'));

      for (let i = 0; i < 3; i++) {
        try {
          await breaker.execute(fn);
        } catch (error) {
          // Expected
        }
      }

      const metrics = breaker.getMetrics();
      expect(metrics.totalFailures).toBe(3);
    });

    it('should calculate success rate', async () => {
      const successFn = jest.fn().mockResolvedValue('success');
      const failingFn = jest.fn().mockRejectedValue(new Error('Test error'));

      await breaker.execute(successFn);
      await breaker.execute(successFn);

      try {
        await breaker.execute(failingFn);
      } catch (error) {
        // Expected
      }

      const metrics = breaker.getMetrics();
      expect(metrics.successRate).toBeCloseTo(0.667, 2);
    });

    it('should track last error', async () => {
      const error = new Error('Test error');
      const fn = jest.fn().mockRejectedValue(error);

      try {
        await breaker.execute(fn);
      } catch (e) {
        // Expected
      }

      const metrics = breaker.getMetrics();
      expect(metrics.lastError).toBe(error);
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

    it('should clear metrics on reset', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      await breaker.execute(fn);

      let metrics = breaker.getMetrics();
      expect(metrics.totalRequests).toBe(1);

      breaker.reset();

      metrics = breaker.getMetrics();
      expect(metrics.totalRequests).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should respect failure threshold', async () => {
      const breaker2 = new CircuitBreaker({
        name: 'test-breaker-2',
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 1000,
        windowSize: 5000,
      });

      const failingFn = () => Promise.reject(new Error('Test error'));

      // Should not open after 3 failures
      for (let i = 0; i < 3; i++) {
        try {
          await breaker2.execute(failingFn);
        } catch (error) {
          // Expected
        }
      }

      expect(breaker2.getState()).toBe(CircuitBreakerState.CLOSED);

      // Should open after 5 failures
      for (let i = 0; i < 2; i++) {
        try {
          await breaker2.execute(failingFn);
        } catch (error) {
          // Expected
        }
      }

      expect(breaker2.getState()).toBe(CircuitBreakerState.OPEN);
    });

    it('should respect success threshold', async () => {
      const breaker2 = new CircuitBreaker({
        name: 'test-breaker-3',
        failureThreshold: 2,
        successThreshold: 3,
        timeout: 1000,
        windowSize: 5000,
      });

      const failingFn = () => Promise.reject(new Error('Test error'));
      const successFn = () => Promise.resolve('success');

      // Open the circuit
      for (let i = 0; i < 2; i++) {
        try {
          await breaker2.execute(failingFn);
        } catch (error) {
          // Expected
        }
      }

      // Wait for timeout (1000ms + buffer)
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Execute 2 successes (not enough to close)
      for (let i = 0; i < 2; i++) {
        await breaker2.execute(successFn);
      }

      expect(breaker2.getState()).toBe(CircuitBreakerState.HALF_OPEN);

      // Execute 1 more success to close
      await breaker2.execute(successFn);

      expect(breaker2.getState()).toBe(CircuitBreakerState.CLOSED);
    });
  });
});
