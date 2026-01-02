export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, any>
  error?: Error
}

export class Logger {
  private static instance: Logger
  private logs: LogEntry[] = []
  private maxLogs = 1000

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error
    }

    this.logs.push(entry)
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      const logMethod = level === LogLevel.ERROR ? 'error' : 
                       level === LogLevel.WARN ? 'warn' : 
                       level === LogLevel.INFO ? 'info' : 'debug'
      
      console[logMethod](`[${level}] ${message}`, context || '', error || '')
    }

    // In production, you might want to send to a logging service
    if (process.env.NODE_ENV === 'production' && level === LogLevel.ERROR) {
      // Send to error tracking service (Sentry, etc.)
      this.sendToErrorService(entry)
    }
  }

  private async sendToErrorService(entry: LogEntry): Promise<void> {
    // Implementation for external error tracking service
    try {
      // Example: await fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) })
    } catch (error) {
      console.error('Failed to send log to error service:', error)
    }
  }

  error(message: string, context?: Record<string, any>, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error)
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context)
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context)
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  getLogs(level?: LogLevel): LogEntry[] {
    return level ? this.logs.filter(log => log.level === level) : [...this.logs]
  }

  clearLogs(): void {
    this.logs = []
  }
}

export const logger = Logger.getInstance()
