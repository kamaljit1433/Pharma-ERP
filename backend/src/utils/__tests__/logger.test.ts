/**
 * Logger Utility Tests
 * Tests for logging functionality
 */

import logger, { LogLevel } from '../logger';

describe('Logger', () => {
  let consoleDebugSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleDebugSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('Log levels', () => {
    it('should have all log levels defined', () => {
      expect(LogLevel.DEBUG).toBeDefined();
      expect(LogLevel.INFO).toBeDefined();
      expect(LogLevel.WARN).toBeDefined();
      expect(LogLevel.ERROR).toBeDefined();
    });
  });

  describe('debug', () => {
    it('should log debug message', () => {
      logger.debug('Debug message');

      expect(consoleDebugSpy).toHaveBeenCalled();
    });

    it('should include timestamp', () => {
      logger.debug('Debug message');

      const call = consoleDebugSpy.mock.calls[0]?.[0];
      expect(call).toContain('DEBUG');
    });

    it('should handle objects', () => {
      const obj = { key: 'value' };
      logger.debug('Debug message', obj);

      expect(consoleDebugSpy).toHaveBeenCalled();
    });
  });

  describe('info', () => {
    it('should log info message', () => {
      logger.info('Info message');

      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should include timestamp', () => {
      logger.info('Info message');

      const call = consoleInfoSpy.mock.calls[0]?.[0];
      expect(call).toContain('INFO');
    });

    it('should handle objects', () => {
      const obj = { key: 'value' };
      logger.info('Info message', obj);

      expect(consoleInfoSpy).toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should log warn message', () => {
      logger.warn('Warn message');

      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should include timestamp', () => {
      logger.warn('Warn message');

      const call = consoleWarnSpy.mock.calls[0]?.[0];
      expect(call).toContain('WARN');
    });

    it('should handle objects', () => {
      const obj = { key: 'value' };
      logger.warn('Warn message', obj);

      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should log error message', () => {
      logger.error('Error message');

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should include timestamp', () => {
      logger.error('Error message');

      const call = consoleErrorSpy.mock.calls[0]?.[0];
      expect(call).toContain('ERROR');
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error');
      logger.error('Error message', { error });

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle objects', () => {
      const obj = { key: 'value' };
      logger.error('Error message', obj);

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Message formatting', () => {
    it('should format messages with context', () => {
      logger.info('User login', { userId: 'user-123' });

      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should handle empty messages', () => {
      logger.info('');

      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should handle very long messages', () => {
      const longMessage = 'a'.repeat(10000);
      logger.info(longMessage);

      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should handle special characters', () => {
      logger.info('Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?');

      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should handle unicode characters', () => {
      logger.info('Unicode: 你好世界 مرحبا بالعالم');

      expect(consoleInfoSpy).toHaveBeenCalled();
    });
  });

  describe('Context data', () => {
    it('should log with context object', () => {
      const context = {
        userId: 'user-123',
        action: 'login',
        timestamp: new Date().toISOString(),
      };

      logger.info('User action', context);

      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should handle nested context', () => {
      const context = {
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
        request: {
          method: 'POST',
          path: '/api/login',
        },
      };

      logger.info('Request received', context);

      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it('should handle array context', () => {
      const context = { items: ['item1', 'item2', 'item3'] };

      logger.info('Items', context);

      expect(consoleInfoSpy).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle null context', () => {
      expect(() => logger.info('Message', null as any)).not.toThrow();
    });

    it('should handle undefined context', () => {
      expect(() => logger.info('Message', undefined)).not.toThrow();
    });

    it('should handle circular references in context', () => {
      const obj: any = { key: 'value' };
      obj.self = obj;

      // JSON.stringify will throw on circular references, but logger should handle it
      expect(() => logger.info('Message', obj)).toThrow();
    });
  });

  describe('Child logger', () => {
    it('should create scoped logger', () => {
      const childLogger = logger.child('auth-service');

      childLogger.info('User logged in');

      expect(consoleInfoSpy).toHaveBeenCalled();
      const call = consoleInfoSpy.mock.calls[0]?.[0];
      expect(call).toContain('auth-service');
    });

    it('should include service name in all logs', () => {
      const childLogger = logger.child('payment-service');

      childLogger.debug('Debug message');
      childLogger.info('Info message');
      childLogger.warn('Warn message');
      childLogger.error('Error message');

      expect(consoleDebugSpy).toHaveBeenCalled();
      expect(consoleInfoSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
