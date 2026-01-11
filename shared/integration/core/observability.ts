/**
 * Comprehensive Observability System
 * Provides distributed tracing, metrics, and logging for integrations
 */

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  baggage?: Record<string, string>;
  sampled: boolean;
}

export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  tags: Record<string, any>;
  logs: Array<{
    timestamp: number;
    level: string;
    message: string;
    fields?: Record<string, any>;
  }>;
  status: 'ok' | 'error' | 'cancelled';
  service: string;
  resource?: string;
}

export interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags: Record<string, string>;
  type: 'counter' | 'gauge' | 'histogram' | 'timer';
  unit?: string;
}

export interface LogEntry {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  service: string;
  traceId?: string;
  spanId?: string;
  fields?: Record<string, any>;
  correlationId?: string;
}

export interface ObservabilityConfig {
  serviceName: string;
  serviceVersion: string;
  environment: string;
  enableTracing: boolean;
  enableMetrics: boolean;
  enableLogging: boolean;
  tracingEndpoint?: string;
  metricsEndpoint?: string;
  loggingEndpoint?: string;
  sampleRate: number;
  defaultTags: Record<string, string>;
}

export class DistributedTracer {
  private activeSpans = new Map<string, Span>();
  private config: ObservabilityConfig;

  constructor(config: ObservabilityConfig) {
    this.config = config;
  }

  startSpan(operationName: string, parentContext?: TraceContext): Span {
    const traceId = parentContext?.traceId || this.generateId();
    const spanId = this.generateId();
    const parentSpanId = parentContext?.spanId;

    const span: Span = {
      traceId,
      spanId,
      parentSpanId,
      operationName,
      startTime: Date.now(),
      tags: {},
      logs: [],
      status: 'ok',
      service: this.config.serviceName
    };

    this.activeSpans.set(spanId, span);
    return span;
  }

  finishSpan(spanId: string, status: 'ok' | 'error' | 'cancelled' = 'ok'): Span | undefined {
    const span = this.activeSpans.get(spanId);
    if (!span) return undefined;

    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = status;

    this.activeSpans.delete(spanId);
    
    // Send to tracing backend
    this.sendSpan(span);
    
    return span;
  }

  setTag(spanId: string, key: string, value: any): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.tags[key] = value;
    }
  }

  logEvent(spanId: string, level: string, message: string, fields?: Record<string, any>): void {
    const span = this.activeSpans.get(spanId);
    if (span) {
      span.logs.push({
        timestamp: Date.now(),
        level,
        message,
        fields
      });
    }
  }

  getCurrentContext(): TraceContext | undefined {
    if (this.activeSpans.size === 0) return undefined;
    
    // Get the most recent span
    let latestSpan: Span | undefined;
    let latestTime = 0;
    
    for (const span of this.activeSpans.values()) {
      if (span.startTime > latestTime) {
        latestTime = span.startTime;
        latestSpan = span;
      }
    }
    
    if (!latestSpan) return undefined;
    
    return {
      traceId: latestSpan.traceId,
      spanId: latestSpan.spanId,
      parentSpanId: latestSpan.parentSpanId,
      sampled: true
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 16);
  }

  private sendSpan(span: Span): void {
    if (!this.config.enableTracing) return;
    
    // In a real implementation, this would send to Jaeger, Zipkin, etc.
    console.log('Sending span:', span);
  }
}

export class MetricsCollector {
  private metrics: Metric[] = [];
  private counters = new Map<string, number>();
  private gauges = new Map<string, number>();
  private histograms = new Map<string, number[]>();
  private config: ObservabilityConfig;

  constructor(config: ObservabilityConfig) {
    this.config = config;
    this.startPeriodicFlush();
  }

  increment(name: string, value: number = 1, tags?: Record<string, string>): void {
    const current = this.counters.get(name) || 0;
    this.counters.set(name, current + value);
    
    this.addMetric({
      name,
      value: current + value,
      timestamp: Date.now(),
      tags: { ...this.config.defaultTags, ...tags },
      type: 'counter'
    });
  }

  gauge(name: string, value: number, tags?: Record<string, string>): void {
    this.gauges.set(name, value);
    
    this.addMetric({
      name,
      value,
      timestamp: Date.now(),
      tags: { ...this.config.defaultTags, ...tags },
      type: 'gauge'
    });
  }

  histogram(name: string, value: number, tags?: Record<string, string>): void {
    if (!this.histograms.has(name)) {
      this.histograms.set(name, []);
    }
    
    const values = this.histograms.get(name)!;
    values.push(value);
    
    // Keep only last 1000 values
    if (values.length > 1000) {
      values.splice(0, values.length - 1000);
    }
    
    this.addMetric({
      name,
      value,
      timestamp: Date.now(),
      tags: { ...this.config.defaultTags, ...tags },
      type: 'histogram'
    });
  }

  timer(name: string, duration: number, tags?: Record<string, string>): void {
    this.histogram(name, duration, tags);
    
    this.addMetric({
      name,
      value: duration,
      timestamp: Date.now(),
      tags: { ...this.config.defaultTags, ...tags },
      type: 'timer',
      unit: 'ms'
    });
  }

  private addMetric(metric: Metric): void {
    this.metrics.push(metric);
    
    // Keep only last 10000 metrics in memory
    if (this.metrics.length > 10000) {
      this.metrics.splice(0, this.metrics.length - 10000);
    }
  }

  getMetrics(): Metric[] {
    return [...this.metrics];
  }

  getAggregatedMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    
    // Aggregate counters
    for (const [name, value] of this.counters.entries()) {
      result[name] = { type: 'counter', value };
    }
    
    // Aggregate gauges
    for (const [name, value] of this.gauges.entries()) {
      result[name] = { type: 'gauge', value };
    }
    
    // Aggregate histograms
    for (const [name, values] of this.histograms.entries()) {
      if (values.length === 0) continue;
      
      const sorted = [...values].sort((a, b) => a - b);
      const sum = values.reduce((a, b) => a + b, 0);
      
      result[name] = {
        type: 'histogram',
        count: values.length,
        sum,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        mean: sum / values.length,
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)]
      };
    }
    
    return result;
  }

  private startPeriodicFlush(): void {
    // Flush metrics every 30 seconds
    setInterval(() => {
      this.flushMetrics();
    }, 30000);
  }

  private flushMetrics(): void {
    if (!this.config.enableMetrics || this.metrics.length === 0) return;
    
    // In a real implementation, this would send to Prometheus, InfluxDB, etc.
    console.log('Flushing metrics:', this.metrics.length);
    
    // Clear sent metrics
    this.metrics = [];
  }
}

export class StructuredLogger {
  private logs: LogEntry[] = [];
  private config: ObservabilityConfig;

  constructor(config: ObservabilityConfig) {
    this.config = config;
  }

  debug(message: string, fields?: Record<string, any>, traceContext?: TraceContext): void {
    this.log('debug', message, fields, traceContext);
  }

  info(message: string, fields?: Record<string, any>, traceContext?: TraceContext): void {
    this.log('info', message, fields, traceContext);
  }

  warn(message: string, fields?: Record<string, any>, traceContext?: TraceContext): void {
    this.log('warn', message, fields, traceContext);
  }

  error(message: string, error?: Error, fields?: Record<string, any>, traceContext?: TraceContext): void {
    const errorFields = error ? {
      error: error.message,
      stack: error.stack
    } : {};
    
    this.log('error', message, { ...errorFields, ...fields }, traceContext);
  }

  fatal(message: string, error?: Error, fields?: Record<string, any>, traceContext?: TraceContext): void {
    const errorFields = error ? {
      error: error.message,
      stack: error.stack
    } : {};
    
    this.log('fatal', message, { ...errorFields, ...fields }, traceContext);
  }

  private log(level: LogEntry['level'], message: string, fields?: Record<string, any>, traceContext?: TraceContext): void {
    const logEntry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      service: this.config.serviceName,
      traceId: traceContext?.traceId,
      spanId: traceContext?.spanId,
      fields: {
        ...this.config.defaultTags,
        ...fields
      }
    };

    this.logs.push(logEntry);
    
    // Keep only last 5000 logs in memory
    if (this.logs.length > 5000) {
      this.logs.splice(0, this.logs.length - 5000);
    }

    // Send to logging backend
    this.sendLog(logEntry);
  }

  private sendLog(logEntry: LogEntry): void {
    if (!this.config.enableLogging) return;
    
    // In a real implementation, this would send to ELK, Splunk, etc.
    console.log(JSON.stringify(logEntry));
  }

  getLogs(level?: LogEntry['level'], limit?: number): LogEntry[] {
    let filtered = this.logs;
    
    if (level) {
      filtered = filtered.filter(log => log.level === level);
    }
    
    if (limit) {
      filtered = filtered.slice(-limit);
    }
    
    return filtered;
  }
}

export class ObservabilityManager {
  private static instance: ObservabilityManager;
  private tracer: DistributedTracer;
  private metrics: MetricsCollector;
  private logger: StructuredLogger;
  private config: ObservabilityConfig;

  constructor(config: ObservabilityConfig) {
    this.config = config;
    this.tracer = new DistributedTracer(config);
    this.metrics = new MetricsCollector(config);
    this.logger = new StructuredLogger(config);
  }

  static getInstance(config?: ObservabilityConfig): ObservabilityManager {
    if (!ObservabilityManager.instance) {
      if (!config) {
        throw new Error('Config required for first initialization');
      }
      ObservabilityManager.instance = new ObservabilityManager(config);
    }
    return ObservabilityManager.instance;
  }

  getTracer(): DistributedTracer {
    return this.tracer;
  }

  getMetrics(): MetricsCollector {
    return this.metrics;
  }

  getLogger(): StructuredLogger {
    return this.logger;
  }

  // Convenience methods for common operations
  async traceOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    tags?: Record<string, any>
  ): Promise<T> {
    const span = this.tracer.startSpan(operationName);
    
    if (tags) {
      for (const [key, value] of Object.entries(tags)) {
        this.tracer.setTag(span.spanId, key, value);
      }
    }

    const startTime = Date.now();
    
    try {
      const result = await operation();
      this.tracer.finishSpan(span.spanId, 'ok');
      
      this.metrics.timer(`${operationName}.duration`, Date.now() - startTime);
      this.metrics.increment(`${operationName}.success`);
      
      return result;
    } catch (error) {
      this.tracer.finishSpan(span.spanId, 'error');
      this.tracer.logEvent(span.spanId, 'error', error.message, { stack: error.stack });
      
      this.metrics.timer(`${operationName}.duration`, Date.now() - startTime);
      this.metrics.increment(`${operationName}.error`);
      
      this.logger.error(`Operation failed: ${operationName}`, error as Error, {
        operationName,
        duration: Date.now() - startTime
      }, this.tracer.getCurrentContext());
      
      throw error;
    }
  }

  getHealthStatus(): {
    service: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: any;
    recentErrors: number;
  } {
    const recentLogs = this.logger.getLogs('error', 100);
    const aggregatedMetrics = this.metrics.getAggregatedMetrics();
    
    // Determine health based on error rate and metrics
    const errorRate = recentLogs.length / 100; // Errors in last 100 logs
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (errorRate > 0.1) {
      status = 'unhealthy';
    } else if (errorRate > 0.05) {
      status = 'degraded';
    }
    
    return {
      service: this.config.serviceName,
      status,
      metrics: aggregatedMetrics,
      recentErrors: recentLogs.length
    };
  }
}
