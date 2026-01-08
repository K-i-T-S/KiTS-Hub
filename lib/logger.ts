/**
 * Production-ready structured logging utility
 * Works in both Node.js and browser environments
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  requestId?: string;
  userId?: string;
  service: string;
  environment: string;
  error?: Error;
}

class ProductionLogger {
  private service: string;
  private environment: string;
  private minLevel: LogLevel;
  private isServer: boolean;

  constructor(service: string = 'kits-hub', minLevel: LogLevel = LogLevel.INFO) {
    this.service = service;
    this.environment = process.env.NODE_ENV || 'development';
    this.minLevel = minLevel;
    this.isServer = typeof window === 'undefined';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    const currentLevelIndex = levels.indexOf(level);
    const minLevelIndex = levels.indexOf(this.minLevel);
    return currentLevelIndex <= minLevelIndex;
  }

  private writeLog(entry: LogEntry) {
    // Always log to console in development or browser
    if (this.environment !== 'production' || !this.isServer) {
      const colorMap = {
        [LogLevel.ERROR]: '\x1b[31m',
        [LogLevel.WARN]: '\x1b[33m',
        [LogLevel.INFO]: '\x1b[36m',
        [LogLevel.DEBUG]: '\x1b[37m'
      };
      
      const colorCode = this.isServer ? (colorMap[entry.level] || '') : '';
      const resetCode = this.isServer ? '\x1b[0m' : '';
      
      console.log(
        `${colorCode}[${entry.level.toUpperCase()}]${resetCode} ` +
        `${entry.timestamp} - ${entry.message}`,
        entry.context || '',
        entry.error ? `\nError: ${entry.error.message}` : ''
      );
    }

    // In production server, could write to file or external service
    // For now, just use console which is sufficient for most cases
  }

  private createLogEntry(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      service: this.service,
      environment: this.environment,
      error
    };
  }

  error(message: string, context?: Record<string, any>, error?: Error) {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry = this.createLogEntry(LogLevel.ERROR, message, context, error);
      this.writeLog(entry);
    }
  }

  warn(message: string, context?: Record<string, any>) {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry = this.createLogEntry(LogLevel.WARN, message, context);
      this.writeLog(entry);
    }
  }

  info(message: string, context?: Record<string, any>) {
    if (this.shouldLog(LogLevel.INFO)) {
      const entry = this.createLogEntry(LogLevel.INFO, message, context);
      this.writeLog(entry);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
      this.writeLog(entry);
    }
  }

  // Structured logging methods for specific contexts
  audit(action: string, userId?: string, context?: Record<string, any>) {
    this.info(`AUDIT: ${action}`, {
      action,
      userId,
      ...context,
      auditLog: true
    });
  }

  performance(operation: string, duration: number, context?: Record<string, any>) {
    this.info(`PERFORMANCE: ${operation}`, {
      operation,
      duration: `${duration}ms`,
      ...context,
      performanceLog: true
    });
  }

  security(event: string, context?: Record<string, any>) {
    this.warn(`SECURITY: ${event}`, {
      event,
      ...context,
      securityLog: true
    });
  }

  // Request context helper
  withRequest(requestId: string, userId?: string) {
    return {
      error: (message: string, context?: Record<string, any>, error?: Error) => {
        const entry = this.createLogEntry(LogLevel.ERROR, message, {
          ...context,
          requestId,
          userId
        }, error);
        this.writeLog(entry);
      },
      warn: (message: string, context?: Record<string, any>) => {
        const entry = this.createLogEntry(LogLevel.WARN, message, {
          ...context,
          requestId,
          userId
        });
        this.writeLog(entry);
      },
      info: (message: string, context?: Record<string, any>) => {
        const entry = this.createLogEntry(LogLevel.INFO, message, {
          ...context,
          requestId,
          userId
        });
        this.writeLog(entry);
      },
      debug: (message: string, context?: Record<string, any>) => {
        const entry = this.createLogEntry(LogLevel.DEBUG, message, {
          ...context,
          requestId,
          userId
        });
        this.writeLog(entry);
      }
    };
  }
}

// Singleton instance for application-wide logging
export const logger = new ProductionLogger('kits-hub', LogLevel.INFO);

// Export class for creating specific loggers
export { ProductionLogger as Logger };