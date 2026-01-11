import { trace } from '@opentelemetry/api';
import { MetricsCollector } from './metrics';
import { KiTSLogger } from './logger';

export class TracingService {
  private metrics: MetricsCollector;
  private logger: KiTSLogger;

  constructor(metrics: MetricsCollector, logger: KiTSLogger) {
    this.metrics = metrics;
    this.logger = logger;
  }

  static traceDatabaseQuery(query: string, tenantId: string, executeQuery: Function) {
    const span = trace.getTracer('kits-hub').startSpan('database.query', {
      attributes: {
        'db.query': query,
        'tenant.id': tenantId,
        'db.system': 'postgresql',
      },
    });

    const startTime = Date.now();

    try {
      const result = executeQuery(query, tenantId);
      const duration = Date.now() - startTime;
      
      span.setAttributes({
        'db.rows': Array.isArray(result) ? result.length : 0,
        'db.success': 'true',
        'db.duration': duration,
      });

      // Record metrics
      this.metrics?.recordDatabaseQuery(query, duration / 1000, true, tenantId);
      
      span.end();
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      span.setAttributes({
        'db.success': 'false',
        'error.message': error.message,
        'db.duration': duration,
      });
      
      span.recordException(error);
      
      // Record metrics and logging
      this.metrics?.recordDatabaseQuery(query, duration / 1000, false, tenantId);
      this.logger?.error('Database query failed', error, { tenant_id: tenantId, query });
      
      span.end();
      throw error;
    }
  }

  static traceAPICall(method: string, endpoint: string, tenantId: string, makeAPICall: Function) {
    const span = trace.getTracer('kits-hub').startSpan('api.call', {
      attributes: {
        'http.method': method,
        'http.url': endpoint,
        'tenant.id': tenantId,
      },
    });

    const startTime = Date.now();

    try {
      const result = makeAPICall(method, endpoint);
      const duration = Date.now() - startTime;
      
      span.setAttributes({
        'http.status_code': result.status || 200,
        'http.success': (result.status || 200) < 400,
        'http.duration': duration,
      });

      // Record metrics
      this.metrics?.recordApiRequest(method, endpoint, result.status || 200, tenantId);
      this.metrics?.recordResponseTime(duration / 1000, endpoint, method, tenantId);
      
      span.end();
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      span.setAttributes({
        'http.success': 'false',
        'error.message': error.message,
        'http.duration': duration,
      });
      
      span.recordException(error);
      
      // Record metrics and logging
      this.metrics?.recordApiRequest(method, endpoint, 500, tenantId);
      this.metrics?.recordError('api_error', error.message, tenantId);
      this.logger?.error('API call failed', error, { tenant_id: tenantId, method, endpoint });
      
      span.end();
      throw error;
    }
  }

  static traceBusinessProcess(processName: string, tenantId: string, userId: string, executeProcess: Function) {
    const span = trace.getTracer('kits-hub').startSpan('business.process', {
      attributes: {
        'process.name': processName,
        'tenant.id': tenantId,
        'user.id': userId,
      },
    });

    const startTime = Date.now();

    try {
      const result = executeProcess();
      const duration = Date.now() - startTime;
      
      span.setAttributes({
        'process.success': 'true',
        'process.duration': duration,
      });

      // Record metrics and logging
      this.metrics?.recordResponseTime(duration / 1000, processName, 'business', tenantId);
      this.logger?.logBusinessEvent(processName, { duration, success: true }, { tenant_id: tenantId, user_id: userId });
      
      span.end();
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      span.setAttributes({
        'process.success': 'false',
        'error.message': error.message,
        'process.duration': duration,
      });
      
      span.recordException(error);
      
      // Record metrics and logging
      this.metrics?.recordError('business_process_error', error.message, tenantId);
      this.logger?.logBusinessEvent(processName, { duration, success: false, error: error.message }, { tenant_id: tenantId, user_id: userId });
      
      span.end();
      throw error;
    }
  }

  static traceTenantOperation(operation: string, tenantId: string, executeOperation: Function) {
    const span = trace.getTracer('kits-hub').startSpan('tenant.operation', {
      attributes: {
        'tenant.operation': operation,
        'tenant.id': tenantId,
      },
    });

    const startTime = Date.now();

    try {
      const result = executeOperation();
      const duration = Date.now() - startTime;
      
      span.setAttributes({
        'tenant.operation.success': 'true',
        'tenant.operation.duration': duration,
      });

      // Record metrics and logging
      this.metrics?.recordTenantProvisioning(duration / 1000, true, operation);
      this.logger?.logBusinessEvent(`tenant_${operation}`, { duration, success: true }, { tenant_id: tenantId });
      
      span.end();
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      span.setAttributes({
        'tenant.operation.success': 'false',
        'error.message': error.message,
        'tenant.operation.duration': duration,
      });
      
      span.recordException(error);
      
      // Record metrics and logging
      this.metrics?.recordTenantProvisioning(duration / 1000, false, operation);
      this.logger?.logSecurityEvent(`tenant_${operation}_failed`, { error: error.message }, { tenant_id: tenantId });
      
      span.end();
      throw error;
    }
  }

  static traceSecurityEvent(event: string, details: any, tenantId?: string) {
    const span = trace.getTracer('kits-hub').startSpan('security.event', {
      attributes: {
        'security.event': event,
        'tenant.id': tenantId || 'system',
        'security.details': JSON.stringify(details),
      },
    });

    // Record security event
    this.logger?.logSecurityEvent(event, details, { tenant_id: tenantId });
    
    span.setAttributes({
      'security.event.severity': details.severity || 'medium',
    });

    span.end();
  }

  static createSpan(name: string, attributes: any = {}) {
    return trace.getTracer('kits-hub').startSpan(name, { attributes });
  }
}
