# KiTS Hub Observability Setup

This document outlines comprehensive monitoring and observability setup for KiTS Hub multi-tenant SaaS platform, following industry best practices for modern SaaS applications.

## Overview

Observability in KiTS Hub encompasses monitoring, logging, metrics, tracing, and alerting across all solutions and infrastructure. This setup ensures we can detect issues quickly, understand system behavior, and maintain high availability.

## 1. Application Performance Monitoring (APM)

### OpenTelemetry Integration

```typescript
// shared/monitoring/telemetry.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-http';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';

// Initialize OpenTelemetry
const sdk = NodeSDK.init({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'kits-hub',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION || '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    [SemanticResourceAttributes.SERVICE_INSTANCE_ID]: process.env.INSTANCE_ID || 'unknown',
  }),
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://jaeger:14268/api/traces',
  }),
  spanProcessors: [new SimpleSpanProcessor()],
});

export function startTracing() {
  sdk.start();
}

export function createSpan(name: string, fn: () => Promise<any>) {
  return sdk.trace.getTracer('kits-hub').startActiveSpan(name, fn);
}
```

### Custom Metrics Collection

```typescript
// shared/monitoring/metrics.ts
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { MetricExporter } from '@opentelemetry/exporter-prometheus';

const meterProvider = new MeterProvider({
  exporter: new MetricExporter({
    url: process.env.PROMETHEUS_EXPORTER_URL || 'http://prometheus:9090/metrics',
  }),
});

const meter = meterProvider.getMeter('kits-hub');

// Business metrics
export const businessMetrics = {
  tenantCount: meter.createUpDownCounter('kits_tenants_total', {
    description: 'Total number of active tenants',
  }),
  
  activeUsers: meter.createUpDownCounter('kits_active_users_total', {
    description: 'Total number of active users',
    labels: { solution: 'inventory', 'pos', 'crm' },
  }),
  
  apiRequests: meter.createCounter('kits_api_requests_total', {
    description: 'Total API requests',
    labels: { method: 'GET', 'POST', 'PUT', 'DELETE' },
  }),
  
  apiResponseTime: meter.createHistogram('kits_api_response_time_seconds', {
    description: 'API response time in seconds',
    labels: { endpoint: 'products', 'sales', 'customers' },
  }),
  
  databaseConnections: meter.createUpDownCounter('kits_db_connections_active', {
    description: 'Active database connections',
  }),
  
  errorRate: meter.createCounter('kits_errors_total', {
    description: 'Total errors',
    labels: { type: 'validation', 'database', 'integration' },
  }),
};

// Performance metrics
export const performanceMetrics = {
  memoryUsage: meter.createObservableGauge('kits_memory_usage_bytes', {
    description: 'Memory usage in bytes',
  }),
  
  cpuUsage: meter.createObservableGauge('kits_cpu_usage_percent', {
    description: 'CPU usage percentage',
  }),
  
  diskUsage: meter.createObservableGauge('kits_disk_usage_bytes', {
    description: 'Disk usage in bytes',
  }),
};
```

## 2. Centralized Logging

### Structured Logging Setup

```typescript
// shared/monitoring/logger.ts
import winston from 'winston';
import 'winston-daily-rotate-file';

interface LogContext {
  tenant_id?: string;
  user_id?: string;
  solution?: string;
  request_id?: string;
  session_id?: string;
  correlation_id?: string;
}

class KiTSLogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return JSON.stringify({
            timestamp,
            level,
            message,
            ...meta,
            service: 'kits-hub',
            version: process.env.APP_VERSION,
          });
        })
      ),
      transports: [
        // Console for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        
        // File for production
        new winston.transports.DailyRotateFile({
          filename: 'logs/kits-hub-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
        }),
        
        // External logging service
        new winston.transports.Http({
          host: process.env.LOGSTASH_HOST || 'localhost',
          port: parseInt(process.env.LOGSTASH_PORT || '5000'),
          path: '/logs',
        }),
      ],
    });
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.logger.error(message, { 
      error: error?.stack, 
      ...context,
      severity: 'error' 
    });
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, context);
  }

  // Business event logging
  logBusinessEvent(event: string, data: any, context?: LogContext): void {
    this.logger.info(`Business Event: ${event}`, {
      event_type: 'business',
      event_data: data,
      ...context,
    });
  }

  // Security event logging
  logSecurityEvent(event: string, data: any, context?: LogContext): void {
    this.logger.warn(`Security Event: ${event}`, {
      event_type: 'security',
      event_data: data,
      severity: 'warning',
      ...context,
    });
  }

  // Performance event logging
  logPerformanceEvent(event: string, duration: number, context?: LogContext): void {
    this.logger.info(`Performance Event: ${event}`, {
      event_type: 'performance',
      duration_ms: duration,
      ...context,
    });
  }
}

export const logger = new KiTSLogger();
```

### Request/Response Logging Middleware

```typescript
// shared/monitoring/logging-middleware.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';

interface RequestWithId extends Request {
  id: string;
  startTime: number;
  tenant_id?: string;
  user_id?: string;
}

export function requestLogger(req: RequestWithId, res: Response, next: NextFunction): void {
  // Add unique request ID
  req.id = uuidv4();
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
  res.end = function(chunk?: any, encoding?: any) {
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
}
```

## 3. Infrastructure Monitoring

### Prometheus Configuration

```yaml
# monitoring/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'kits-hub-applications'
    static_configs:
      - targets:
          - 'inventory-management:3001'
          - 'point-of-sale:3002'
          - 'crm-system:3003'
          - 'hr-management:3004'
          - 'accounting-system:3005'
          - 'analytics-dashboard:3006'
    metrics_path: '/metrics'
    relabel_configs:
      - source_labels: [instance]
      - regex: instance: '([^:]+):.*'
      - target_label: solution
      - replacement: '${1}'

  - job_name: 'kits-hub-infrastructure'
    static_configs:
      - targets:
          - 'node-exporter:9100'
          - 'postgres-exporter:9187'
          - 'redis-exporter:9121'
          - 'nginx-exporter:9113'
    metrics_path: '/metrics'

  - job_name: 'supabase'
    static_configs:
      - targets: ['supabase-kw:3000']
    metrics_path: '/metrics'
    basic_auth:
      username: 'admin'
      password: 'supabase_password'
```

### Alerting Rules

```yaml
# monitoring/prometheus/alert_rules.yml
groups:
  - name: kits-hub-alerts
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(kits_errors_total[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      # High response time
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(kits_api_response_time_seconds[5m])) > 1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High API response time"
          description: "95th percentile response time is {{ $value }} seconds"

      # Database connection issues
      - alert: DatabaseConnectionIssues
        expr: kits_db_connections_active == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "No active database connections"
          description: "Database connection pool is exhausted"

      # High memory usage
      - alert: HighMemoryUsage
        expr: kits_memory_usage_bytes / (1024 * 1024 * 1024) > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value | humanizePercentage }}"

      # Tenant isolation breach
      - alert: TenantIsolationBreach
        expr: increase(kits_security_events_total{type="data_leak"}[5m]) > 0
        for: 0m
        labels:
          severity: critical
        annotations:
          summary: "Potential tenant data isolation breach"
          description: "Security event detected potential data leak between tenants"
```

## 4. Distributed Tracing

### Jaeger Configuration

```yaml
# monitoring/jaeger/jaeger.yml
version: '3'

collector:
  zipkin:
    host_port: 9411

  query:
    base_path: /

storage:
  type: elasticsearch
  elasticsearch:
    node_count: 1
    url: http://elasticsearch:9200

  sampling:
    type: probabilistic
    param: 0.1  # Sample 10% of traces
```

### Custom Instrumentation

```typescript
// shared/monitoring/tracing.ts
import { trace } from '@opentelemetry/api';

export class TracingService {
  static traceDatabaseQuery(query: string, tenantId: string): void {
    const span = trace.startSpan('database.query', {
      attributes: {
        'db.query': query,
        'tenant.id': tenantId,
        'db.system': 'postgresql',
      },
    });

    try {
      // Execute database query
      const result = await executeQuery(query, tenantId);
      span.setAttributes({
        'db.rows': result.length,
        'db.success': 'true',
      });
      return result;
    } catch (error) {
      span.setAttributes({
        'db.success': 'false',
        'error.message': error.message,
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  }

  static traceAPICall(method: string, endpoint: string, tenantId: string): void {
    const span = trace.startSpan('api.call', {
      attributes: {
        'http.method': method,
        'http.url': endpoint,
        'tenant.id': tenantId,
      },
    });

    try {
      const result = await makeAPICall(method, endpoint);
      span.setAttributes({
        'http.status_code': result.status,
        'http.success': result.status < 400,
      });
      return result;
    } catch (error) {
      span.setAttributes({
        'http.success': 'false',
        'error.message': error.message,
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  }

  static traceBusinessProcess(processName: string, tenantId: string, userId: string): void {
    const span = trace.startSpan('business.process', {
      attributes: {
        'process.name': processName,
        'tenant.id': tenantId,
        'user.id': userId,
      },
    });

    try {
      const result = await executeBusinessProcess(processName, tenantId, userId);
      span.setAttributes({
        'process.success': 'true',
        'process.duration': result.duration,
      });
      return result;
    } catch (error) {
      span.setAttributes({
        'process.success': 'false',
        'error.message': error.message,
      });
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  }
}
```

## 5. Health Checks

### Health Check Endpoints

```typescript
// shared/monitoring/health-check.ts
import { Router } from 'express';
import { prometheus } from './metrics';
import { logger } from './logger';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  checks: {
    database: HealthCheck;
    redis: HealthCheck;
    external_apis: HealthCheck;
    disk_space: HealthCheck;
  };
}

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  message?: string;
  responseTime?: number;
}

export function createHealthRouter(): Router {
  const router = Router();

  router.get('/health', async (req, res) => {
    const health: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      checks: {},
    };

    try {
      // Database health check
      const dbStart = Date.now();
      await checkDatabaseHealth();
      health.checks.database = {
        status: 'healthy',
        responseTime: Date.now() - dbStart,
      };
    } catch (error) {
      health.checks.database = {
        status: 'unhealthy',
        message: error.message,
      };
      health.status = 'degraded';
    }

    try {
      // Redis health check
      const redisStart = Date.now();
      await checkRedisHealth();
      health.checks.redis = {
        status: 'healthy',
        responseTime: Date.now() - redisStart,
      };
    } catch (error) {
      health.checks.redis = {
        status: 'unhealthy',
        message: error.message,
      };
      health.status = 'degraded';
    }

    // Check disk space
    const diskUsage = await checkDiskSpace();
    health.checks.disk_space = {
      status: diskUsage.percentage < 80 ? 'healthy' : 'degraded',
      message: `Disk usage: ${diskUsage.percentage}%`,
    };

    // Overall status based on individual checks
    const unhealthyChecks = Object.values(health.checks)
      .filter(check => check.status === 'unhealthy').length;
    
    if (unhealthyChecks > 0) {
      health.status = 'unhealthy';
    }

    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(health);
  });

  router.get('/metrics', async (req, res) => {
    try {
      const metrics = await prometheus.register.metrics();
      res.set('Content-Type', 'text/plain');
      res.send(metrics);
    } catch (error) {
      logger.error('Failed to generate metrics', error);
      res.status(500).json({ error: 'Failed to generate metrics' });
    }
  });

  return router;
}

async function checkDatabaseHealth(): Promise<void> {
  // Implement database health check
  const result = await pool.query('SELECT 1');
  if (!result) {
    throw new Error('Database query failed');
  }
}

async function checkRedisHealth(): Promise<void> {
  // Implement Redis health check
  const redis = require('redis').createClient();
  await redis.ping();
}

async function checkDiskSpace(): Promise<{ percentage: number }> {
  const stats = await fs.promises.statfs('/');
  const used = stats.blocks - stats.bfree;
  const percentage = (used / stats.blocks) * 100;
  return { percentage };
}
```

## 6. Dashboard Setup

### Grafana Dashboards

```json
{
  "dashboard": {
    "title": "KiTS Hub Overview",
    "tags": ["kits-hub", "overview"],
    "timezone": "browser",
    "panels": [
      {
        "title": "Active Tenants",
        "type": "stat",
        "targets": [
          {
            "expr": "kits_tenants_total",
            "legendFormat": "{{__value__.text}}"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": "blue",
            "mappings": {
              "value": {
                "text": "Tenants"
              }
            }
          }
        }
      },
      {
        "title": "API Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(kits_api_requests_total[5m])",
            "legendFormat": "{{__field.labels.legendFormat}}"
          }
        ],
        "yAxes": [
          {
            "label": "Requests per second"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(kits_api_response_time_seconds[5m]))",
            "legendFormat": "95th percentile"
          }
        ],
        "yAxes": [
          {
            "label": "Seconds"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(kits_errors_total[5m])",
            "legendFormat": "{{__field.labels.legendFormat}}"
          }
        ],
        "yAxes": [
          {
            "label": "Errors per second"
          }
        ]
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "30s"
  }
}
```

## 7. Alerting Setup

### Slack Integration

```typescript
// shared/monitoring/alerting.ts
import axios from 'axios';

interface AlertData {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  channel?: string;
  fields?: Array<{ title: string; value: string; short: boolean }>;
}

export class AlertingService {
  private webhookUrl: string;

  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL;
  }

  async sendAlert(alert: AlertData): Promise<void> {
    if (!this.webhookUrl) return;

    const payload = {
      text: alert.title,
      attachments: [{
        color: this.getSeverityColor(alert.severity),
        fields: [
          { title: 'Severity', value: alert.severity.toUpperCase(), short: true },
          { title: 'Time', value: new Date().toISOString(), short: true },
          ...(alert.fields || [])
        ],
        footer: 'KiTS Hub Monitoring',
        ts: Date.now() / 1000,
      }],
    };

    try {
      await axios.post(this.webhookUrl, payload);
      logger.info('Alert sent to Slack', { alert });
    } catch (error) {
      logger.error('Failed to send alert to Slack', { error, alert });
    }
  }

  private getSeverityColor(severity: string): string {
    const colors = {
      info: '#36a64f',
      warning: '#ff9500',
      critical: '#dc2626',
    };
    return colors[severity] || '#36a64f';
  }

  async sendTenantProvisioningAlert(tenantId: string, status: 'success' | 'failed'): Promise<void> {
    await this.sendAlert({
      title: `Tenant Provisioning ${status.toUpperCase()}`,
      message: `Tenant ${tenantId} provisioning ${status}`,
      severity: status === 'failed' ? 'critical' : 'info',
      fields: [
        { title: 'Tenant ID', value: tenantId },
        { title: 'Status', value: status },
      ],
    });
  }

  async sendSecurityAlert(event: string, details: any): Promise<void> {
    await this.sendAlert({
      title: 'Security Alert',
      message: `Security event detected: ${event}`,
      severity: 'critical',
      fields: [
        { title: 'Event', value: event },
        { title: 'Details', value: JSON.stringify(details) },
      ],
    });
  }

  async sendPerformanceAlert(metric: string, threshold: number, actual: number): Promise<void> {
    await this.sendAlert({
      title: 'Performance Alert',
      message: `${metric} threshold exceeded: ${actual} > ${threshold}`,
      severity: 'warning',
      fields: [
        { title: 'Metric', value: metric },
        { title: 'Threshold', value: threshold.toString() },
        { title: 'Actual', value: actual.toString() },
      ],
    });
  }
}
```

## 8. Log Aggregation

### ELK Stack Configuration

```yaml
# monitoring/elasticsearch/elasticsearch.yml
cluster.name: "kits-hub-logs"
network.host: 0.0.0.0

node:
  master: true
  name: "kits-hub-es-node-1"
  data: true
  path: /usr/share/elasticsearch/data

path:
  logs: /var/log/elasticsearch
  data: /usr/share/elasticsearch/data

# monitoring/logstash/logstash.yml
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "kits-hub" {
    json {
      source => "parse message"
    }
    
    if [tenant_id] {
      mutate {
        add_field => { "index_prefix" => "tenant_%{[tenant_id]}" }
      }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "%{[fields][index_prefix]}-%{+YYYY.MM.dd}"
  }
}
```

## 9. Custom Metrics

### Business Metrics

```typescript
// shared/monitoring/business-metrics.ts
export class BusinessMetricsCollector {
  static collectTenantMetrics(tenantId: string): Promise<any> {
    // Collect tenant-specific business metrics
    const metrics = {
      active_users: await this.getActiveUserCount(tenantId),
      daily_sales: await this.getDailySales(tenantId),
      inventory_value: await this.getInventoryValue(tenantId),
      api_usage: await this.getAPIUsage(tenantId),
    };

    // Send to metrics system
    businessMetrics.tenantMetrics.record(metrics, {
      tenant_id: tenantId,
    });

    return metrics;
  }

  static collectSolutionMetrics(solution: string): Promise<any> {
    const metrics = {
      error_rate: await this.getSolutionErrorRate(solution),
      response_time: await this.getSolutionResponseTime(solution),
      throughput: await this.getSolutionThroughput(solution),
    };

    businessMetrics.solutionMetrics.record(metrics, {
      solution,
    });

    return metrics;
  }

  private static async getActiveUserCount(tenantId: string): Promise<number> {
    // Implement active user counting
    const result = await pool.query(
      'SELECT COUNT(*) FROM user_sessions WHERE tenant_id = $1 AND last_activity > NOW() - INTERVAL \'1 hour\'',
      [tenantId]
    );
    return parseInt(result.rows[0].count);
  }

  private static async getDailySales(tenantId: string): Promise<number> {
    // Implement daily sales calculation
    const result = await pool.query(
      'SELECT COALESCE(SUM(total_amount), 0) as daily_sales FROM sales WHERE tenant_id = $1 AND DATE(created_at) = CURRENT_DATE',
      [tenantId]
    );
    return parseFloat(result.rows[0].daily_sales);
  }
}
```

## 10. Monitoring Best Practices

### Data Retention
- **Logs**: 30 days hot, 90 days warm, 1 year cold
- **Metrics**: 15 minutes raw, 1 hour aggregated, 90 days stored
- **Traces**: 7 days stored, sampled based on traffic

### Alerting Strategy
- **Critical**: Immediate notification (PagerDuty, Slack, SMS)
- **Warning**: 5-minute aggregation, Slack notification
- **Info**: Hourly aggregation, email notification

### Performance Baselines
- **Response Time**: 95th percentile < 500ms
- **Error Rate**: < 0.1% of total requests
- **Availability**: > 99.9% uptime
- **Resource Usage**: < 80% CPU, < 80% memory

### Security Monitoring
- **Failed Logins**: Alert on > 5 failed attempts per minute
- **Data Access**: Monitor cross-tenant access attempts
- **API Abuse**: Rate limiting and unusual patterns
- **Vulnerability Scans**: Daily automated scans

This comprehensive observability setup ensures KiTS Hub maintains high availability, performance, and security while providing deep insights into system behavior and business metrics.
