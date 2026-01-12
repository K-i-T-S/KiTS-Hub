import { MetricsCollector } from './metrics';
import { KiTSLogger } from './logger';
export declare class TracingService {
    private metrics;
    private logger;
    constructor(metrics: MetricsCollector, logger: KiTSLogger);
    static traceDatabaseQuery(query: string, tenantId: string, executeQuery: Function): any;
    static traceAPICall(method: string, endpoint: string, tenantId: string, makeAPICall: Function): any;
    static traceBusinessProcess(processName: string, tenantId: string, userId: string, executeProcess: Function): any;
    static traceTenantOperation(operation: string, tenantId: string, executeOperation: Function): any;
    static traceSecurityEvent(event: string, details: any, tenantId?: string): void;
    static createSpan(name: string, attributes?: any): import("@opentelemetry/api").Span;
}
//# sourceMappingURL=tracing.d.ts.map