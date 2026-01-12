"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.KiTSLogger = void 0;
exports.requestLogger = requestLogger;
exports.errorLogger = errorLogger;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const uuid_1 = require("uuid");
class KiTSLogger {
    logger;
    constructor(serviceName = 'kits-hub') {
        this.logger = winston_1.default.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json(), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
                return JSON.stringify({
                    timestamp,
                    level,
                    message,
                    ...meta,
                    service: serviceName,
                    version: process.env.APP_VERSION || '1.0.0',
                });
            })),
            transports: [
                // Console for development
                new winston_1.default.transports.Console({
                    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
                }),
                // File for production
                new winston_daily_rotate_file_1.default({
                    filename: 'logs/kits-hub-%DATE%.log',
                    datePattern: 'YYYY-MM-DD',
                    maxSize: '20m',
                    maxFiles: '14d',
                }),
                // External logging service (if configured)
                ...(process.env.LOGSTASH_HOST ? [
                    new winston_1.default.transports.Http({
                        host: process.env.LOGSTASH_HOST,
                        port: parseInt(process.env.LOGSTASH_PORT || '5000'),
                        path: '/logs',
                    })
                ] : []),
            ],
        });
    }
    info(message, context) {
        this.logger.info(message, context);
    }
    error(message, error, context) {
        this.logger.error(message, {
            error: error?.stack,
            ...context,
            severity: 'error'
        });
    }
    warn(message, context) {
        this.logger.warn(message, context);
    }
    debug(message, context) {
        this.logger.debug(message, context);
    }
    // Business event logging
    logBusinessEvent(event, data, context) {
        this.logger.info(`Business Event: ${event}`, {
            event_type: 'business',
            event_data: data,
            ...context,
        });
    }
    // Security event logging
    logSecurityEvent(event, data, context) {
        this.logger.warn(`Security Event: ${event}`, {
            event_type: 'security',
            event_data: data,
            severity: 'warning',
            ...context,
        });
    }
    // Performance event logging
    logPerformanceEvent(event, duration, context) {
        this.logger.info(`Performance Event: ${event}`, {
            event_type: 'performance',
            duration_ms: duration,
            ...context,
        });
    }
    // Audit logging
    logAudit(action, resource, userId, context) {
        this.logger.info(`Audit: ${action} on ${resource}`, {
            event_type: 'audit',
            action,
            resource,
            user_id: userId,
            ...context,
        });
    }
}
exports.KiTSLogger = KiTSLogger;
function requestLogger(logger) {
    return (req, res, next) => {
        // Add unique request ID
        req.id = (0, uuid_1.v4)();
        req.startTime = Date.now();
        // Extract tenant info from headers
        req.tenant_id = req.headers['x-tenant-id'];
        req.user_id = req.headers['x-user-id'];
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
        res.end = function (chunk, encoding) {
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
function errorLogger(logger) {
    return (error, req, res, next) => {
        logger.error('Request error', error, {
            request_id: req.id,
            method: req.method,
            url: req.url,
            tenant_id: req.tenant_id,
            user_id: req.user_id,
        });
        next(error);
    };
}
// Singleton instance
exports.logger = new KiTSLogger();
//# sourceMappingURL=logger.js.map