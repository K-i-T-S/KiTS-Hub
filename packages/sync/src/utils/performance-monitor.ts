import { EventEmitter } from 'eventemitter3';
import { SyncStats, SyncEvent, SyncStatus } from '../types';

export interface PerformanceMetrics {
  latency: number;
  throughput: number;
  errorRate: number;
  conflictRate: number;
  averageResponseTime: number;
  peakMemoryUsage: number;
  connectionUptime: number;
}

export interface PerformanceAlert {
  type: 'latency' | 'error_rate' | 'memory' | 'connection' | 'conflict_rate' | 'throughput';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  value: number;
  threshold: number;
}

export class SyncPerformanceMonitor extends EventEmitter {
  private metrics: PerformanceMetrics;
  private alerts: PerformanceAlert[] = [];
  private thresholds: Map<string, number> = new Map();
  private measurements: Map<string, number[]> = new Map();
  private startTime: number = Date.now();
  private lastCleanup: number = Date.now();

  constructor() {
    super();
    this.metrics = {
      latency: 0,
      throughput: 0,
      errorRate: 0,
      conflictRate: 0,
      averageResponseTime: 0,
      peakMemoryUsage: 0,
      connectionUptime: 0,
    };

    this.initializeThresholds();
    this.startMonitoring();
  }

  private initializeThresholds(): void {
    this.thresholds.set('latency', 1000); // 1 second
    this.thresholds.set('error_rate', 0.05); // 5%
    this.thresholds.set('memory', 100 * 1024 * 1024); // 100MB
    this.thresholds.set('conflict_rate', 0.02); // 2%
    this.thresholds.set('throughput', 10); // 10 events per second
  }

  private startMonitoring(): void {
    // Update metrics every 5 seconds
    setInterval(() => {
      this.updateMetrics();
      this.checkThresholds();
      this.cleanupOldData();
    }, 5000);

    // Monitor memory usage
    if (typeof window !== 'undefined' && 'performance' in window) {
      setInterval(() => {
        this.updateMemoryUsage();
      }, 10000);
    }
  }

  // Record a sync event for performance tracking
  recordSyncEvent(event: SyncEvent, responseTime?: number): void {
    const now = Date.now();
    
    // Record response time if provided
    if (responseTime !== undefined) {
      this.recordMeasurement('response_time', responseTime);
    }

    // Calculate latency if timestamp is available
    if (event.timestamp) {
      const eventTime = new Date(event.timestamp).getTime();
      const latency = now - eventTime;
      this.recordMeasurement('latency', latency);
    }

    // Track status-based metrics
    if (event.status === SyncStatus.FAILED) {
      this.recordMeasurement('error', 1);
    } else if (event.status === SyncStatus.CONFLICT) {
      this.recordMeasurement('conflict', 1);
    }

    this.recordMeasurement('throughput', 1);
  }

  // Record a measurement for averaging
  private recordMeasurement(type: string, value: number): void {
    if (!this.measurements.has(type)) {
      this.measurements.set(type, []);
    }

    const measurements = this.measurements.get(type)!;
    measurements.push(value);

    // Keep only last 100 measurements per type
    if (measurements.length > 100) {
      measurements.shift();
    }
  }

  // Update calculated metrics
  private updateMetrics(): void {
    const now = Date.now();
    
    // Update connection uptime
    this.metrics.connectionUptime = now - this.startTime;

    // Calculate average latency
    const latencyMeasurements = this.measurements.get('latency') || [];
    this.metrics.latency = this.calculateAverage(latencyMeasurements);

    // Calculate average response time
    const responseTimeMeasurements = this.measurements.get('response_time') || [];
    this.metrics.averageResponseTime = this.calculateAverage(responseTimeMeasurements);

    // Calculate throughput (events per second over last minute)
    const throughputMeasurements = this.measurements.get('throughput') || [];
    const recentThroughput = throughputMeasurements.slice(-12); // Last 12 * 5 seconds = 1 minute
    this.metrics.throughput = recentThroughput.reduce((sum, val) => sum + val, 0) / 60;

    // Calculate error rate
    const errorMeasurements = this.measurements.get('error') || [];
    const totalEvents = throughputMeasurements.length;
    const totalErrors = errorMeasurements.reduce((sum, val) => sum + val, 0);
    this.metrics.errorRate = totalEvents > 0 ? totalErrors / totalEvents : 0;

    // Calculate conflict rate
    const conflictMeasurements = this.measurements.get('conflict') || [];
    const totalConflicts = conflictMeasurements.reduce((sum, val) => sum + val, 0);
    this.metrics.conflictRate = totalEvents > 0 ? totalConflicts / totalEvents : 0;

    this.emit('metrics_updated', this.metrics);
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private updateMemoryUsage(): void {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (window.performance as any)) {
      const memory = (window.performance as any).memory;
      const usedMemory = memory.usedJSHeapSize;
      
      this.recordMeasurement('memory', usedMemory);
      this.metrics.peakMemoryUsage = Math.max(this.metrics.peakMemoryUsage, usedMemory);
    }
  }

  private checkThresholds(): void {
    // Check latency threshold
    if (this.metrics.latency > this.thresholds.get('latency')!) {
      this.createAlert('latency', 'high', 
        `Latency (${this.metrics.latency.toFixed(2)}ms) exceeds threshold`, 
        this.metrics.latency);
    }

    // Check error rate threshold
    if (this.metrics.errorRate > this.thresholds.get('error_rate')!) {
      this.createAlert('error_rate', 'high',
        `Error rate (${(this.metrics.errorRate * 100).toFixed(2)}%) exceeds threshold`,
        this.metrics.errorRate);
    }

    // Check memory usage threshold
    if (this.metrics.peakMemoryUsage > this.thresholds.get('memory')!) {
      this.createAlert('memory', 'medium',
        `Memory usage (${(this.metrics.peakMemoryUsage / 1024 / 1024).toFixed(2)}MB) exceeds threshold`,
        this.metrics.peakMemoryUsage);
    }

    // Check conflict rate threshold
    if (this.metrics.conflictRate > this.thresholds.get('conflict_rate')!) {
      this.createAlert('conflict_rate', 'medium',
        `Conflict rate (${(this.metrics.conflictRate * 100).toFixed(2)}%) exceeds threshold`,
        this.metrics.conflictRate);
    }

    // Check throughput threshold
    if (this.metrics.throughput < this.thresholds.get('throughput')!) {
      this.createAlert('throughput', 'low',
        `Throughput (${this.metrics.throughput.toFixed(2)} events/sec) below threshold`,
        this.metrics.throughput);
    }
  }

  private createAlert(
    type: PerformanceAlert['type'],
    severity: PerformanceAlert['severity'],
    message: string,
    value: number
  ): void {
    const alert: PerformanceAlert = {
      type,
      severity,
      message,
      timestamp: new Date(),
      value,
      threshold: this.thresholds.get(type) || 0,
    };

    this.alerts.push(alert);
    this.emit('performance_alert', alert);

    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts.shift();
    }
  }

  private cleanupOldData(): void {
    const now = Date.now();
    
    // Clean up old measurements every 5 minutes
    if (now - this.lastCleanup > 300000) {
      this.measurements.forEach((measurements, type) => {
        // Keep only recent measurements (last 10 minutes worth)
        const maxMeasurements = Math.min(120, measurements.length); // 10 minutes * 12 per minute
        if (measurements.length > maxMeasurements) {
          this.measurements.set(type, measurements.slice(-maxMeasurements));
        }
      });

      // Clean up old alerts (older than 1 hour)
      this.alerts = this.alerts.filter(alert => 
        now - alert.timestamp.getTime() < 3600000
      );

      this.lastCleanup = now;
    }
  }

  // Public API methods

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  getCriticalAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => alert.severity === 'critical');
  }

  setThreshold(type: string, value: number): void {
    this.thresholds.set(type, value);
  }

  getThreshold(type: string): number | undefined {
    return this.thresholds.get(type);
  }

  clearAlerts(): void {
    this.alerts = [];
  }

  reset(): void {
    this.measurements.clear();
    this.alerts = [];
    this.startTime = Date.now();
    this.metrics = {
      latency: 0,
      throughput: 0,
      errorRate: 0,
      conflictRate: 0,
      averageResponseTime: 0,
      peakMemoryUsage: 0,
      connectionUptime: 0,
    };
  }

  // Export performance data for analysis
  exportData(): {
    metrics: PerformanceMetrics;
    alerts: PerformanceAlert[];
    measurements: Record<string, number[]>;
    thresholds: Record<string, number>;
  } {
    const measurements: Record<string, number[]> = {};
    this.measurements.forEach((value, key) => {
      measurements[key] = [...value];
    });

    const thresholds: Record<string, number> = {};
    this.thresholds.forEach((value, key) => {
      thresholds[key] = value;
    });

    return {
      metrics: this.getMetrics(),
      alerts: this.getAlerts(),
      measurements,
      thresholds,
    };
  }
}

// Global instance
let globalPerformanceMonitor: SyncPerformanceMonitor | null = null;

export function getPerformanceMonitor(): SyncPerformanceMonitor {
  if (!globalPerformanceMonitor) {
    globalPerformanceMonitor = new SyncPerformanceMonitor();
  }
  return globalPerformanceMonitor;
}

export function resetPerformanceMonitor(): void {
  globalPerformanceMonitor = null;
}
