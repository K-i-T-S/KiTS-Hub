export { TelemetryService, type TelemetryConfig } from './telemetry';
export { MetricsCollector, type BusinessMetrics } from './metrics';
export { KiTSLogger, requestLogger, errorLogger, type LogContext } from './logger';
export { TracingService } from './tracing';
export { createHealthRouter, type HealthStatus, type HealthCheck } from './health-check';

// Main initialization function
export function initializeMonitoring(config: TelemetryConfig) {
  const telemetry = new TelemetryService(config);
  telemetry.start();

  const meter = telemetry.getMeter('kits-hub');
  const metrics = new MetricsCollector(meter);
  const logger = new KiTSLogger(config.serviceName);

  return {
    telemetry,
    metrics,
    logger,
    healthRouter: createHealthRouter(logger),
  };
}
