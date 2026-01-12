export { TelemetryService, type TelemetryConfig } from './telemetry';
export { MetricsCollector, type BusinessMetrics } from './metrics';
export { KiTSLogger, requestLogger, errorLogger, type LogContext } from './logger';
export { TracingService } from './tracing';
export { createHealthRouter, type HealthStatus, type HealthCheck } from './health-check';
export declare function initializeMonitoring(config: TelemetryConfig): {
    telemetry: any;
    metrics: any;
    logger: any;
    healthRouter: any;
};
//# sourceMappingURL=index.d.ts.map