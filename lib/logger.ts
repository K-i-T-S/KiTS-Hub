export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;
    
    let logMessage = `[${timestamp}] ${level}: ${message}`;
    
    if (context) {
      logMessage += ` | Context: ${JSON.stringify(context)}`;
    }
    
    if (error) {
      logMessage += ` | Error: ${error.message}`;
      if (error.stack && this.isDevelopment) {
        logMessage += `\nStack: ${error.stack}`;
      }
    }
    
    return logMessage;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error,
    };

    const formattedLog = this.formatLog(entry);

    switch (level) {
      case LogLevel.ERROR:
        // eslint-disable-next-line no-console
        console.error(formattedLog);
        break;
      case LogLevel.WARN:
        // eslint-disable-next-line no-console
        console.warn(formattedLog);
        break;
      case LogLevel.INFO:
        // eslint-disable-next-line no-console
        console.info(formattedLog);
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          // eslint-disable-next-line no-console
          console.debug(formattedLog);
        }
        break;
    }
  }

  error(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }
}

export const logger = new Logger();
