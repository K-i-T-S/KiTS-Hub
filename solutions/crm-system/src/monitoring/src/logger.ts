import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface LogContext {
  tenant_id?: string;
  user_id?: string;
  solution?: string;
  request_id?: string;
  session_id?: string;
  correlation_id?: string;
  [key: string]: any;
}

export class KiTSLogger {
  private logger: winston.Logger;

  constructor(serviceName: string = 'kits-hub') {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return JSON.stringify({
            timestamp,
            level,
            message,
            ...meta,
            service: serviceName,
            version: process.env.APP_VERSION || '1.0.0',
          });
        })
      ),
      transports: [
        // Console for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        
        // File for production
        new DailyRotateFile({
          filename: 'logs/kits-hub-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
        }),
        
        // External logging service (if configured)
        ...(process.env.LOGSTASH_HOST ? [
          new winston.transports.Http({
            host: process.env.LOGSTASH_HOST,
            port: parseInt(process.env.LOGSTASH_PORT || '5000'),
            path: '/logs',
          })
        ] : []),
      ],
    });
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.logger.error(message, { 
      error: error?.stack, 
      ...context,
      severity: 'error' 
    });
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, context);
  }

  // Business event logging
  logBusinessEvent(event: string, data: any, context?: LogContext): void {
    this.logger.info(`Business Event: ${event}`, {
      event_type: 'business',
      event_data: data,
      ...context,
    });
  }

  // Security event logging
  logSecurityEvent(event: string, data: any, context?: LogContext): void {
    this.logger.warn(`Security Event: ${event}`, {
      event_type: 'security',
      event_data: data,
      severity: 'warning',
      ...context,
    });
  }

  // Performance event logging
  logPerformanceEvent(event: string, duration: number, context?: LogContext): void {
    this.logger.info(`Performance Event: ${event}`, {
      event_type: 'performance',
      duration_ms: duration,
      ...context,
    });
  }

  // Audit logging
  logAudit(action: string, resource: string, userId: string, context?: LogContext): void {
    this.logger.info(`Audit: ${action} on ${resource}`, {
      event_type: 'audit',
      action,
      resource,
      user_id: userId,
      ...context,
    });
  }
}

// Request logging middleware
interface RequestWithId extends Request {
  id: string;
  startTime: number;
  tenant_id?: string;
  user_id?: string;
}

export function requestLogger(logger: KiTSLogger) {
  return (req: RequestWithId, res: Response, next: NextFunction): void => {
    // Add unique request ID
    req.id = uuidv4();
    req.startTime = Date.now();

    // Extract tenant info from headers
    req.tenant_id = req.headers['x-tenant-id'] as string;
    req.user_id = req.headers['x-user-id'] as string;

    // Log request start
    logger.info('Request started', {
      request_id: req.id,
      method: req.method,
      url: req.url,
      user_agent: req.headers['user-agent'],
      ip: req.ip,
      tenant_id: req.tenant_id,
      user_id: req.user_id,
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      const duration = Date.now() - req.startTime;
      
      logger.info('Request completed', {
        request_id: req.id,
        method: req.method,
        url: req.url,
        status_code: res.statusCode,
        duration_ms: duration,
        tenant_id: req.tenant_id,
        user_id: req.user_id,
      });

      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
}

// Error logging middleware
export function errorLogger(logger: KiTSLogger) {
  return (error: Error, req: Request, res: Response, next: NextFunction): void => {
    logger.error('Request error', error, {
      request_id: (req as RequestWithId).id,
      method: req.method,
      url: req.url,
      tenant_id: (req as RequestWithId).tenant_id,
      user_id: (req as RequestWithId).user_id,
    });

    next(error);
  };
}

// Singleton instance
export const logger = new KiTSLogger();
