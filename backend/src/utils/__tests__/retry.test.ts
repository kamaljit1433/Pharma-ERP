/**
 * Retry Utility Tests
 * Tests for retry pattern implementation
 */

import {
  withRetry,
  isRetryableError,
  calculateBackoffDelay,
  RetryError,
  RetryConfig,
} from '../retry';

describe('Retry Utilities', () => {
  describe('isRetryableError', () => {
    it('should identify ECONNREFUSED as retryable', () => {
      const error = new Error('Connection refused');
      (error as any).code = 'ECONNREFUSED';

      expect(isRetryableError(error)).toBe(true);
    });

    it('should identify ECONNRESET as retryable', () => {
      const error = new Error('Connection reset');
      (error as any).code = 'ECONNRESET';

      expect(isRetryableError(error)).toBe(true);
    });

    it('should identify ETIMEDOUT as retryable', () => {
      const error = new Error('Connection timeout');
      (error as any).code = 'ETIMEDOUT';

      expect(isRetryableError(error)).toBe(true);
    });

    it('should identify 408 status as retryable', () => {
      const error = new Error('Request timeout');
      (error as any).status = 408;

      expect(isRetryableError(error)).toBe(true);
    });

    it('should identify 429 status as retryable', () => {
      const error = new Error('Too many requests');
      (error as any).status = 429;

      expect(isRetryableError(error)).toBe(true);
    });

    it('should identify 5xx status as retryable', () => {
      expect(isRetryableError({ status: 500 })).toBe(true);
      expect(isRetryableError({ status: 502 })).toBe(true);
      expect(isRetryableError({ status: 503 })).toBe(true);
      expect(isRetryableError({ status: 504 })).toBe(true);
    });

    it('should identify timeout message as retryable', () => {
      const error = new Error('Operation timeout after 5000ms');

      expect(isRetryableError(error)).toBe(true);
    });

    it('should not identify 4xx status as retryable', () => {
      expect(isRetryableError({ status: 400 })).toBe(false);
      expect(isRetryableError({ status: 401 })).toBe(false);
      expect(isRetryableError({ status: 403 })).toBe(false);
      expect(isRetryableError({ status: 404 })).toBe(false);
    });

    it('should not identify generic errors as retryable', () => {
      const error = new Error('Generic error');

      expect(isRetryableError(error)).toBe(false);
    });
  });

  describe('calculateBackoffDelay', () => {
    const config: RetryConfig = {
      maxAttempts: 3,
      initialDelayMs: 1000,
      maxDelayMs: 30000,
      backoffMultiplier: 2,
      jitterFactor: 0,
    };

    it('should calculate exponential backoff', () => {
      const delay1 = calculateBackoffDelay(1, config);
      const delay2 = calculateBackoffDelay(2, config);
      const delay3 = calculateBackoffDelay(3, config);

      expect(delay1).toBe(1000);
      expect(delay2).toBe(2000);
      expect(delay3).toBe(4000);
    });

    it('should cap delay at maxDelayMs', () => {
      const config2 = { ...config, maxDelayMs: 5000 };

      const delay = calculateBackoffDelay(10, config2);

      expect(delay).toBeLessThanOrEqual(5000);
    });

    it('should apply jitter', () => {
      const config2 = { ...config, jitterFactor: 0.1 };

      const delays = [
        calculateBackoffDelay(1, config2),
        calculateBackoffDelay(1, config2),
        calculateBackoffDelay(1, config2),
      ];

      // At least some delays should be different due to jitter
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(1);
    });

    it('should handle zero jitter', () => {
      const config2 = { ...config, jitterFactor: 0 };

      const delay1 = calculateBackoffDelay(1, config2);
      const delay2 = calculateBackoffDelay(1, config2);

      expect(delay1).toBe(delay2);
    });

    it('should never return negative delay', () => {
      const config2 = { ...config, jitterFactor: 1 };

      for (let i = 1; i <= 10; i++) {
        const delay = calculateBackoffDelay(i, config2);
        expect(delay).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      const result = await withRetry(fn, { maxAttempts: 3, initialDelayMs: 10 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on transient failure', async () => {
      const error = new Error('Temporary error');
      (error as any).code = 'ECONNREFUSED';

      const fn = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce('success');

      const result = await withRetry(fn, { maxAttempts: 3, initialDelayMs: 10 });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
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

    it('should use default config', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      const result = await withRetry(fn);

      expect(result).toBe('success');
    });

    it('should merge partial config with defaults', async () => {
      const fn = jest.fn().mockResolvedValue('success');

      const result = await withRetry(fn, { maxAttempts: 5 });

      expect(result).toBe('success');
    });

    it('should handle timeout', async () => {
      const fn = jest.fn(
        () =>
          new Promise(resolve => {
            setTimeout(() => resolve('success'), 100);
          })
      );

      const result = await withRetry(fn, {
        maxAttempts: 1,
        timeoutMs: 200,
      });

      expect(result).toBe('success');
    });

    it('should throw on timeout', async () => {
      const fn = jest.fn(
        () =>
          new Promise(resolve => {
            setTimeout(() => resolve('success'), 100);
          })
      );

      await expect(
        withRetry(fn, {
          maxAttempts: 1,
          timeoutMs: 50,
        })
      ).rejects.toThrow('timed out');
    });

    it('should track metrics', async () => {
      const error = new Error('Temporary error');
      (error as any).code = 'ECONNREFUSED';

      const fn = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce('success');

      try {
        await withRetry(fn, { maxAttempts: 3, initialDelayMs: 10 });
      } catch (e) {
        const retryError = e as RetryError;
        expect(retryError.metrics.totalAttempts).toBe(2);
      }
    });
  });

  describe('RetryError', () => {
    it('should contain last error', () => {
      const lastError = new Error('Last error');
      const metrics = {
        totalAttempts: 3,
        successAttempt: 0,
        totalDurationMs: 1000,
      };

      const retryError = new RetryError('Failed after 3 attempts', lastError, 3, metrics);

      expect(retryError.lastError).toBe(lastError);
    });

    it('should contain attempt count', () => {
      const lastError = new Error('Last error');
      const metrics = {
        totalAttempts: 3,
        successAttempt: 0,
        totalDurationMs: 1000,
      };

      const retryError = new RetryError('Failed after 3 attempts', lastError, 3, metrics);

      expect(retryError.attempts).toBe(3);
    });

    it('should contain metrics', () => {
      const lastError = new Error('Last error');
      const metrics = {
        totalAttempts: 3,
        successAttempt: 0,
        totalDurationMs: 1000,
      };

      const retryError = new RetryError('Failed after 3 attempts', lastError, 3, metrics);

      expect(retryError.metrics).toBe(metrics);
    });

    it('should have correct name', () => {
      const lastError = new Error('Last error');
      const metrics = {
        totalAttempts: 3,
        successAttempt: 0,
        totalDurationMs: 1000,
      };

      const retryError = new RetryError('Failed after 3 attempts', lastError, 3, metrics);

      expect(retryError.name).toBe('RetryError');
    });
  });

  describe('Integration tests', () => {
    it('should retry with exponential backoff', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'))
        .mockResolvedValueOnce('success');

      const error1 = new Error('Error 1');
      (error1 as any).code = 'ECONNREFUSED';

      const error2 = new Error('Error 2');
      (error2 as any).code = 'ECONNREFUSED';

      const fn2 = jest
        .fn()
        .mockRejectedValueOnce(error1)
        .mockRejectedValueOnce(error2)
        .mockResolvedValueOnce('success');

      const result = await withRetry(fn2, {
        maxAttempts: 3,
        initialDelayMs: 10,
        backoffMultiplier: 2,
      });

      expect(result).toBe('success');
      expect(fn2).toHaveBeenCalledTimes(3);
    });

    it('should handle mixed retryable and non-retryable errors', async () => {
      const retryableError = new Error('Retryable');
      (retryableError as any).code = 'ECONNREFUSED';

      const nonRetryableError = new Error('Non-retryable');
      (nonRetryableError as any).status = 400;

      const fn = jest
        .fn()
        .mockRejectedValueOnce(retryableError)
        .mockRejectedValueOnce(nonRetryableError);

      await expect(
        withRetry(fn, { maxAttempts: 3, initialDelayMs: 10 })
      ).rejects.toThrow('Non-retryable');

      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});
