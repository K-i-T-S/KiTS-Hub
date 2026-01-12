import { Router } from 'express';
export interface HealthCheck {
    status: 'healthy' | 'unhealthy' | 'degraded';
    message?: string;
    responseTime?: number;
    details?: any;
}
export interface HealthStatus {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: string;
    version: string;
    checks: {
        database: HealthCheck;
        redis: HealthCheck;
        external_apis: HealthCheck;
        disk_space: HealthCheck;
        memory: HealthCheck;
    };
}
export declare function createHealthRouter(): Router;
//# sourceMappingURL=health-check.d.ts.map