import { Meter } from '@opentelemetry/api';

export interface BusinessMetrics {
  tenantCount: number;
  activeUsers: number;
  apiRequests: number;
  errorRate: number;
  responseTime: number;
}

export class MetricsCollector {
  private meter: Meter;
  private tenantCounter: any;
  private userCounter: any;
  private apiRequestCounter: any;
  private errorCounter: any;
  private responseTimeHistogram: any;
  private databaseConnectionGauge: any;

  constructor(meter: Meter) {
    this.meter = meter;
    this.initializeMetrics();
  }

  private initializeMetrics() {
    // Business metrics
    this.tenantCounter = this.meter.createUpDownCounter('kits_tenants_total', {
      description: 'Total number of active tenants',
    });

    this.userCounter = this.meter.createUpDownCounter('kits_active_users_total', {
      description: 'Total number of active users',
    });

    this.apiRequestCounter = this.meter.createCounter('kits_api_requests_total', {
      description: 'Total API requests',
    });

    this.errorCounter = this.meter.createCounter('kits_errors_total', {
      description: 'Total errors',
    });

    this.responseTimeHistogram = this.meter.createHistogram('kits_api_response_time_seconds', {
      description: 'API response time in seconds',
    });

    // Infrastructure metrics
    this.databaseConnectionGauge = this.meter.createUpDownCounter('kits_db_connections_active', {
      description: 'Active database connections',
    });
  }

  // Business metric methods
  incrementTenantCount(tenantId?: string) {
    this.tenantCounter.add(1, tenantId ? { tenant_id: tenantId } : {});
  }

  decrementTenantCount(tenantId?: string) {
    this.tenantCounter.add(-1, tenantId ? { tenant_id: tenantId } : {});
  }

  incrementActiveUsers(solution: string, tenantId?: string) {
    const attributes: any = { solution };
    if (tenantId) attributes.tenant_id = tenantId;
    this.userCounter.add(1, attributes);
  }

  decrementActiveUsers(solution: string, tenantId?: string) {
    const attributes: any = { solution };
    if (tenantId) attributes.tenant_id = tenantId;
    this.userCounter.add(-1, attributes);
  }

  recordApiRequest(method: string, endpoint: string, statusCode: number, tenantId?: string) {
    const attributes: any = {
      method,
      endpoint,
      status_code: statusCode.toString(),
    };
    if (tenantId) attributes.tenant_id = tenantId;
    this.apiRequestCounter.add(1, attributes);
  }

  recordError(errorType: string, message: string, tenantId?: string) {
    const attributes: any = {
      error_type: errorType,
      error_message: message,
    };
    if (tenantId) attributes.tenant_id = tenantId;
    this.errorCounter.add(1, attributes);
  }

  recordResponseTime(duration: number, endpoint: string, method: string, tenantId?: string) {
    const attributes: any = {
      endpoint,
      method,
    };
    if (tenantId) attributes.tenant_id = tenantId;
    this.responseTimeHistogram.record(duration, attributes);
  }

  // Infrastructure metric methods
  updateDatabaseConnections(count: number) {
    this.databaseConnectionGauge.add(count);
  }

  // Custom metrics for specific business processes
  recordTenantProvisioning(duration: number, success: boolean, planType: string) {
    this.responseTimeHistogram.record(duration, {
      process: 'tenant_provisioning',
      success: success.toString(),
      plan_type: planType,
    });
  }

  recordDatabaseQuery(query: string, duration: number, success: boolean, tenantId?: string) {
    const attributes: any = {
      query_type: this.getQueryType(query),
      success: success.toString(),
    };
    if (tenantId) attributes.tenant_id = tenantId;
    
    this.responseTimeHistogram.record(duration, attributes);
  }

  recordCacheOperation(operation: 'hit' | 'miss', key: string) {
    this.apiRequestCounter.add(1, {
      cache_operation: operation,
      cache_key: key,
    });
  }

  private getQueryType(query: string): string {
    const normalized = query.trim().toLowerCase();
    if (normalized.startsWith('select')) return 'select';
    if (normalized.startsWith('insert')) return 'insert';
    if (normalized.startsWith('update')) return 'update';
    if (normalized.startsWith('delete')) return 'delete';
    return 'other';
  }
}
