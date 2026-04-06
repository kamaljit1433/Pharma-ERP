import config from '../config';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  service?: string;
  [key: string]: unknown;
}

class Logger {
  private level: LogLevel;

  constructor() {
    this.level = this.getLogLevel(config.logging.level);
  }

  private getLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'debug':
        return LogLevel.DEBUG;
      case 'info':
        return LogLevel.INFO;
      case 'warn':
        return LogLevel.WARN;
      case 'error':
        return LogLevel.ERROR;
      default:
        return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private buildEntry(level: string, message: string, meta?: Record<string, unknown>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    };
  }

  /**
   * Create a child logger scoped to a specific service/module.
   * All log entries from the child include a `service` field.
   */
  child(service: string): ScopedLogger {
    return new ScopedLogger(this, service);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.buildEntry('DEBUG', message, meta);
      console.debug(JSON.stringify(entry));
    }
  }

  info(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.buildEntry('INFO', message, meta);
      console.info(JSON.stringify(entry));
    }
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry = this.buildEntry('WARN', message, meta);
      console.warn(JSON.stringify(entry));
    }
  }

  error(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.buildEntry('ERROR', message, meta);
      console.error(JSON.stringify(entry));
    }
  }
}

/**
 * A logger scoped to a specific service/module.
 * Automatically includes the service name in every log entry.
 */
export class ScopedLogger {
  constructor(
    private parent: Logger,
    private service: string
  ) {}

  debug(message: string, meta?: Record<string, unknown>): void {
    this.parent.debug(message, { service: this.service, ...meta });
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.parent.info(message, { service: this.service, ...meta });
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.parent.warn(message, { service: this.service, ...meta });
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.parent.error(message, { service: this.service, ...meta });
  }
}

const logger = new Logger();
export default logger;
