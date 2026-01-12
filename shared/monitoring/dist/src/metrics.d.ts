import { Meter } from '@opentelemetry/api';
export interface BusinessMetrics {
    tenantCount: number;
    activeUsers: number;
    apiRequests: number;
    errorRate: number;
    responseTime: number;
}
export declare class MetricsCollector {
    private meter;
    private tenantCounter;
    private userCounter;
    private apiRequestCounter;
    private errorCounter;
    private responseTimeHistogram;
    private databaseConnectionGauge;
    constructor(meter: Meter);
    private initializeMetrics;
    incrementTenantCount(tenantId?: string): void;
    decrementTenantCount(tenantId?: string): void;
    incrementActiveUsers(solution: string, tenantId?: string): void;
    decrementActiveUsers(solution: string, tenantId?: string): void;
    recordApiRequest(method: string, endpoint: string, statusCode: number, tenantId?: string): void;
    recordError(errorType: string, message: string, tenantId?: string): void;
    recordResponseTime(duration: number, endpoint: string, method: string, tenantId?: string): void;
    updateDatabaseConnections(count: number): void;
    recordTenantProvisioning(duration: number, success: boolean, planType: string): void;
    recordDatabaseQuery(query: string, duration: number, success: boolean, tenantId?: string): void;
    recordCacheOperation(operation: 'hit' | 'miss', key: string): void;
    private getQueryType;
}
//# sourceMappingURL=metrics.d.ts.map