// Performance monitoring and logging utilities for cross-solution integration

export interface PerformanceMetrics {
  // Event bus metrics
  eventBus: {
    eventsEmitted: number;
    eventsProcessed: number;
    averageProcessingTime: number;
    errorRate: number;
    activeSubscriptions: number;
  };
  
  // Real-time metrics
  realtime: {
    connectionsActive: number;
    messagesReceived: number;
    averageLatency: number;
    reconnectAttempts: number;
    uptime: number;
  };
  
  // Sync service metrics
  sync: {
    syncOperations: number;
    successRate: number;
    averageSyncTime: number;
    recordsProcessed: number;
    conflictsResolved: number;
  };
  
  // System metrics
  system: {
    memoryUsage: number;
    cpuUsage: number;
    networkLatency: number;
    errorCount: number;
    lastError?: string;
  };
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: 'event-bus' | 'realtime' | 'sync' | 'system' | 'integration';
  message: string;
  data?: any;
  source?: string;
  userId?: string;
  tenantId?: string;
  correlationId?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  condition: {
    metric: string;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    threshold: number;
    duration?: number; // in seconds
  };
  action: {
    type: 'log' | 'notification' | 'webhook';
    target: string;
    message: string;
  };
  cooldown: number; // in seconds
  lastTriggered?: Date;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private logs: LogEntry[] = [];
  private alertRules: AlertRule[] = [];
  private logBuffer: LogEntry[] = [];
  private metricsHistory: Map<string, number[]> = new Map();
  private startTime: Date;
  private logFlushInterval?: NodeJS.Timeout;
  private metricsUpdateInterval?: NodeJS.Timeout;

  constructor() {
    this.startTime = new Date();
    this.metrics = this.initializeMetrics();
    this.setupDefaultAlertRules();
    this.startPeriodicTasks();
  }

  /**
   * Initialize default metrics
   */
  private initializeMetrics(): PerformanceMetrics {
    return {
      eventBus: {
        eventsEmitted: 0,
        eventsProcessed: 0,
        averageProcessingTime: 0,
        errorRate: 0,
        activeSubscriptions: 0,
      },
      realtime: {
        connectionsActive: 0,
        messagesReceived: 0,
        averageLatency: 0,
        reconnectAttempts: 0,
        uptime: 0,
      },
      sync: {
        syncOperations: 0,
        successRate: 0,
        averageSyncTime: 0,
        recordsProcessed: 0,
        conflictsResolved: 0,
      },
      system: {
        memoryUsage: 0,
        cpuUsage: 0,
        networkLatency: 0,
        errorCount: 0,
      },
    };
  }

  /**
   * Setup default alert rules
   */
  private setupDefaultAlertRules(): void {
    this.alertRules = [
      {
        id: 'high-error-rate',
        name: 'High Error Rate',
        description: 'Alert when error rate exceeds 5%',
        enabled: true,
        condition: {
          metric: 'eventBus.errorRate',
          operator: '>',
          threshold: 0.05,
          duration: 300, // 5 minutes
        },
        action: {
          type: 'notification',
          target: 'system',
          message: 'Error rate is {{value}}% (threshold: 5%)',
        },
        cooldown: 900, // 15 minutes
      },
      {
        id: 'slow-processing',
        name: 'Slow Event Processing',
        description: 'Alert when average processing time exceeds 1000ms',
        enabled: true,
        condition: {
          metric: 'eventBus.averageProcessingTime',
          operator: '>',
          threshold: 1000,
          duration: 180, // 3 minutes
        },
        action: {
          type: 'log',
          target: 'performance',
          message: 'Average processing time is {{value}}ms (threshold: 1000ms)',
        },
        cooldown: 600, // 10 minutes
      },
      {
        id: 'sync-failures',
        name: 'Sync Service Failures',
        description: 'Alert when sync success rate drops below 90%',
        enabled: true,
        condition: {
          metric: 'sync.successRate',
          operator: '<',
          threshold: 0.9,
          duration: 600, // 10 minutes
        },
        action: {
          type: 'notification',
          target: 'system',
          message: 'Sync success rate is {{value}}% (threshold: 90%)',
        },
        cooldown: 1800, // 30 minutes
      },
    ];
  }

  /**
   * Start periodic tasks
   */
  private startPeriodicTasks(): void {
    // Flush logs every 30 seconds
    this.logFlushInterval = setInterval(() => {
      this.flushLogs();
    }, 30000);

    // Update metrics every 10 seconds
    this.metricsUpdateInterval = setInterval(() => {
      this.updateSystemMetrics();
      this.checkAlertRules();
    }, 10000);
  }

  /**
   * Log an event
   */
  log(entry: Omit<LogEntry, 'id' | 'timestamp'>): void {
    const logEntry: LogEntry = {
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
    };

    this.logBuffer.push(logEntry);

    // Also add to in-memory logs for immediate access
    this.logs.push(logEntry);

    // Keep only last 1000 logs in memory
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    // If it's an error, increment error count
    if (entry.level === 'error') {
      this.metrics.system.errorCount++;
      this.metrics.system.lastError = entry.message;
    }
  }

  /**
   * Update event bus metrics
   */
  updateEventBusMetrics(metrics: Partial<PerformanceMetrics['eventBus']>): void {
    this.metrics.eventBus = { ...this.metrics.eventBus, ...metrics };
    
    // Store history for trending
    this.storeMetricHistory('eventBus.eventsEmitted', this.metrics.eventBus.eventsEmitted);
    this.storeMetricHistory('eventBus.averageProcessingTime', this.metrics.eventBus.averageProcessingTime);
  }

  /**
   * Update realtime metrics
   */
  updateRealtimeMetrics(metrics: Partial<PerformanceMetrics['realtime']>): void {
    this.metrics.realtime = { 
      ...this.metrics.realtime, 
      uptime: Date.now() - this.startTime.getTime(),
      ...metrics 
    };
    
    this.storeMetricHistory('realtime.connectionsActive', this.metrics.realtime.connectionsActive);
    this.storeMetricHistory('realtime.averageLatency', this.metrics.realtime.averageLatency);
  }

  /**
   * Update sync metrics
   */
  updateSyncMetrics(metrics: Partial<PerformanceMetrics['sync']>): void {
    this.metrics.sync = { ...this.metrics.sync, ...metrics };
    
    this.storeMetricHistory('sync.successRate', this.metrics.sync.successRate);
    this.storeMetricHistory('sync.averageSyncTime', this.metrics.sync.averageSyncTime);
  }

  /**
   * Update system metrics
   */
  private updateSystemMetrics(): void {
    try {
      // Memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.metrics.system.memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
      }

      // Network latency (mock implementation)
      this.metrics.system.networkLatency = Math.random() * 100 + 50; // 50-150ms

      // CPU usage (mock implementation - would need actual monitoring in production)
      this.metrics.system.cpuUsage = Math.random() * 0.8; // 0-80%

      this.storeMetricHistory('system.memoryUsage', this.metrics.system.memoryUsage);
      this.storeMetricHistory('system.cpuUsage', this.metrics.system.cpuUsage);
      this.storeMetricHistory('system.networkLatency', this.metrics.system.networkLatency);
    } catch (error) {
      this.log({
        level: 'warn',
        category: 'system',
        message: 'Failed to update system metrics',
        data: { error: error instanceof Error ? error.message : String(error) },
      });
    }
  }

  /**
   * Store metric history for trending
   */
  private storeMetricHistory(metric: string, value: number): void {
    if (!this.metricsHistory.has(metric)) {
      this.metricsHistory.set(metric, []);
    }

    const history = this.metricsHistory.get(metric)!;
    history.push(value);

    // Keep only last 100 data points
    if (history.length > 100) {
      history.shift();
    }
  }

  /**
   * Check alert rules
   */
  private checkAlertRules(): void {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      // Check cooldown
      if (rule.lastTriggered) {
        const timeSinceLastTrigger = Date.now() - rule.lastTriggered.getTime();
        if (timeSinceLastTrigger < rule.cooldown * 1000) {
          continue;
        }
      }

      // Get current metric value
      const currentValue = this.getMetricValue(rule.condition.metric);
      if (currentValue === undefined) continue;

      // Check condition
      const conditionMet = this.evaluateCondition(
        currentValue,
        rule.condition.operator,
        rule.condition.threshold
      );

      if (conditionMet) {
        this.triggerAlert(rule, currentValue);
        rule.lastTriggered = new Date();
      }
    }
  }

  /**
   * Get metric value by path
   */
  private getMetricValue(path: string): number | undefined {
    const parts = path.split('.');
    let value: any = this.metrics;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return typeof value === 'number' ? value : undefined;
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(value: number, operator: string, threshold: number): boolean {
    switch (operator) {
      case '>': return value > threshold;
      case '<': return value < threshold;
      case '>=': return value >= threshold;
      case '<=': return value <= threshold;
      case '==': return value === threshold;
      case '!=': return value !== threshold;
      default: return false;
    }
  }

  /**
   * Trigger alert
   */
  private triggerAlert(rule: AlertRule, value: number): void {
    const message = rule.action.message.replace('{{value}}', String(value));

    this.log({
      level: 'warn',
      category: 'system',
      message: `Alert triggered: ${rule.name}`,
      data: {
        rule: rule.id,
        value,
        threshold: rule.condition.threshold,
        message,
      },
    });

    // Execute action based on type
    switch (rule.action.type) {
      case 'log':
        // Already logged above
        break;
      case 'notification':
        // In a real implementation, this would send a notification
        console.warn('ALERT:', message);
        break;
      case 'webhook':
        // In a real implementation, this would call a webhook
        console.warn('WEBHOOK ALERT:', message);
        break;
    }
  }

  /**
   * Flush logs to storage
   */
  private flushLogs(): void {
    if (this.logBuffer.length === 0) return;

    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    // In a real implementation, this would send logs to a logging service
    console.log('Flushing logs:', logsToFlush.length);
    
    // For now, just clear the buffer
    // In production, you'd send to Elasticsearch, Loggly, etc.
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get logs
   */
  getLogs(limit?: number, level?: LogEntry['level'], category?: LogEntry['category']): LogEntry[] {
    let logs = [...this.logs];

    if (level) {
      logs = logs.filter(log => log.level === level);
    }

    if (category) {
      logs = logs.filter(log => log.category === category);
    }

    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return limit ? logs.slice(0, limit) : logs;
  }

  /**
   * Get metric history
   */
  getMetricHistory(metric: string): number[] {
    return this.metricsHistory.get(metric) || [];
  }

  /**
   * Add custom alert rule
   */
  addAlertRule(rule: Omit<AlertRule, 'id'>): string {
    const newRule: AlertRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };

    this.alertRules.push(newRule);
    return newRule.id;
  }

  /**
   * Remove alert rule
   */
  removeAlertRule(ruleId: string): boolean {
    const index = this.alertRules.findIndex(rule => rule.id === ruleId);
    if (index > -1) {
      this.alertRules.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Get alert rules
   */
  getAlertRules(): AlertRule[] {
    return [...this.alertRules];
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    summary: PerformanceMetrics;
    trends: Record<string, { current: number; trend: 'up' | 'down' | 'stable' }>;
    topErrors: LogEntry[];
    recommendations: string[];
  } {
    const trends: Record<string, { current: number; trend: 'up' | 'down' | 'stable' }> = {};

    // Calculate trends
    for (const [metric, history] of this.metricsHistory) {
      if (history.length >= 2) {
        const recent = history.slice(-10);
        const older = history.slice(-20, -10);
        
        if (older.length > 0) {
          const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
          const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
          
          const change = (recentAvg - olderAvg) / olderAvg;
          let trend: 'up' | 'down' | 'stable';
          
          if (Math.abs(change) < 0.05) {
            trend = 'stable';
          } else if (change > 0) {
            trend = 'up';
          } else {
            trend = 'down';
          }
          
          trends[metric] = { current: recentAvg, trend };
        }
      }
    }

    // Get top errors
    const topErrors = this.logs
      .filter(log => log.level === 'error')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    // Generate recommendations
    const recommendations: string[] = [];

    if (this.metrics.eventBus.errorRate > 0.05) {
      recommendations.push('Error rate is above 5%. Check event handlers for errors.');
    }

    if (this.metrics.eventBus.averageProcessingTime > 1000) {
      recommendations.push('Event processing is slow. Consider optimizing handlers.');
    }

    if (this.metrics.sync.successRate < 0.9) {
      recommendations.push('Sync success rate is below 90%. Check data conflicts.');
    }

    if (this.metrics.system.memoryUsage > 0.8) {
      recommendations.push('Memory usage is high. Consider optimizing memory usage.');
    }

    return {
      summary: this.metrics,
      trends,
      topErrors,
      recommendations,
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.logFlushInterval) {
      clearInterval(this.logFlushInterval);
    }

    if (this.metricsUpdateInterval) {
      clearInterval(this.metricsUpdateInterval);
    }

    // Flush remaining logs
    this.flushLogs();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions for logging
export const log = {
  debug: (message: string, data?: any, category?: LogEntry['category']) => {
    performanceMonitor.log({
      level: 'debug',
      message,
      data,
      category: category || 'system',
    });
  },
  info: (message: string, data?: any, category?: LogEntry['category']) => {
    performanceMonitor.log({
      level: 'info',
      message,
      data,
      category: category || 'system',
    });
  },
  warn: (message: string, data?: any, category?: LogEntry['category']) => {
    performanceMonitor.log({
      level: 'warn',
      message,
      data,
      category: category || 'system',
    });
  },
  error: (message: string, data?: any, category?: LogEntry['category']) => {
    performanceMonitor.log({
      level: 'error',
      message,
      data,
      category: category || 'system',
    });
  },
};

// Performance tracking decorator
export function trackPerformance(category: 'event-bus' | 'sync' | 'realtime' | 'integration' | 'system') {
  return function (_target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      const correlationId = `perf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      log.info(`Starting ${propertyName}`, { correlationId, args }, category as any);

      try {
        const result = await method.apply(this, args);
        const duration = Date.now() - startTime;

        log.info(`Completed ${propertyName}`, { 
          correlationId, 
          duration,
          success: true 
        }, category as any);

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        log.error(`Failed ${propertyName}`, { 
          correlationId, 
          duration,
          error: error instanceof Error ? error.message : String(error),
          success: false
        }, category as any);

        throw error;
      }
    };

    return descriptor;
  };
}
