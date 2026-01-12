import { Request, Response, NextFunction } from 'express';
export interface LogContext {
    tenant_id?: string;
    user_id?: string;
    solution?: string;
    request_id?: string;
    session_id?: string;
    correlation_id?: string;
    [key: string]: any;
}
export declare class KiTSLogger {
    private logger;
    constructor(serviceName?: string);
    info(message: string, context?: LogContext): void;
    error(message: string, error?: Error, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    debug(message: string, context?: LogContext): void;
    logBusinessEvent(event: string, data: any, context?: LogContext): void;
    logSecurityEvent(event: string, data: any, context?: LogContext): void;
    logPerformanceEvent(event: string, duration: number, context?: LogContext): void;
    logAudit(action: string, resource: string, userId: string, context?: LogContext): void;
}
interface RequestWithId extends Request {
    id: string;
    startTime: number;
    tenant_id?: string;
    user_id?: string;
}
export declare function requestLogger(logger: KiTSLogger): (req: RequestWithId, res: Response, next: NextFunction) => void;
export declare function errorLogger(logger: KiTSLogger): (error: Error, req: Request, res: Response, next: NextFunction) => void;
export declare const logger: KiTSLogger;
export {};
//# sourceMappingURL=logger.d.ts.map