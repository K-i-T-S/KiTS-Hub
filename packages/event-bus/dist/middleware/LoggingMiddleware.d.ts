import type { EventMiddleware } from '../types';
export declare class LoggingMiddleware {
    /**
     * Middleware that logs all events
     */
    static logger(): EventMiddleware;
    /**
     * Middleware that logs only errors
     */
    static errorLogger(): EventMiddleware;
    /**
     * Middleware that logs performance metrics
     */
    static performanceLogger(): EventMiddleware;
    /**
     * Middleware that logs to external monitoring service
     */
    static monitoringLogger(serviceName?: string): EventMiddleware;
}
