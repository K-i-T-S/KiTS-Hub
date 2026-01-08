/**
 * Production metrics collection and monitoring
 * Provides performance and business metrics
 */

import { logger } from './logger'

export interface PerformanceMetrics {
  operation: string
  duration: number
  timestamp: number
  success: boolean
  error?: string
  metadata?: Record<string, any>
}

export interface BusinessMetrics {
  queueLength: number
  averageWaitTime: number
  provisioningRate: number
  errorRate: number
  timestamp: number
}

class MetricsCollector {
  private performanceMetrics: PerformanceMetrics[] = []
  private businessMetrics: BusinessMetrics[] = []
  private readonly maxMetricsCount = 1000 // Keep last 1000 metrics

  // Performance metrics
  recordPerformance(operation: string, duration: number, success: boolean, error?: string, metadata?: Record<string, any>) {
    const metric: PerformanceMetrics = {
      operation,
      duration,
      timestamp: Date.now(),
      success,
      error,
      metadata
    }

    this.performanceMetrics.push(metric)
    
    // Keep only recent metrics
    if (this.performanceMetrics.length > this.maxMetricsCount) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.maxMetricsCount)
    }

    // Log performance warnings
    if (duration > 5000) { // 5 seconds
      logger.warn('Slow operation detected', {
        operation,
        duration: `${duration}ms`,
        success,
        metadata
      })
    }

    // Log errors
    if (!success && error) {
      logger.error('Operation failed', {
        operation,
        error,
        duration: `${duration}ms`,
        metadata
      })
    }
  }

  // Business metrics
  recordBusinessMetrics(metrics: Omit<BusinessMetrics, 'timestamp'>) {
    const businessMetric: BusinessMetrics = {
      ...metrics,
      timestamp: Date.now()
    }

    this.businessMetrics.push(businessMetric)
    
    if (this.businessMetrics.length > this.maxMetricsCount) {
      this.businessMetrics = this.businessMetrics.slice(-this.maxMetricsCount)
    }
  }

  // Get performance statistics
  getPerformanceStats(operation?: string, timeWindowMs: number = 3600000) { // 1 hour default
    const cutoff = Date.now() - timeWindowMs
    const metrics = this.performanceMetrics.filter(m => 
      m.timestamp > cutoff && (!operation || m.operation === operation)
    )

    if (metrics.length === 0) {
      return null
    }

    const durations = metrics.map(m => m.duration)
    const successCount = metrics.filter(m => m.success).length
    const errorCount = metrics.length - successCount

    return {
      count: metrics.length,
      successRate: (successCount / metrics.length) * 100,
      errorRate: (errorCount / metrics.length) * 100,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      p95Duration: this.percentile(durations, 95),
      p99Duration: this.percentile(durations, 99),
      timeWindow: `${timeWindowMs / 1000}s`
    }
  }

  // Get business metrics summary
  getBusinessMetricsSummary(timeWindowMs: number = 3600000) {
    const cutoff = Date.now() - timeWindowMs
    const metrics = this.businessMetrics.filter(m => m.timestamp > cutoff)

    if (metrics.length === 0) {
      return null
    }

    const latest = metrics[metrics.length - 1]
    const oldest = metrics[0]

    return {
      current: latest,
      timeWindow: `${timeWindowMs / 1000}s`,
      dataPoints: metrics.length,
      trends: {
        queueLengthChange: latest.queueLength - oldest.queueLength,
        averageWaitTimeChange: latest.averageWaitTime - oldest.averageWaitTime,
        provisioningRateChange: latest.provisioningRate - oldest.provisioningRate,
        errorRateChange: latest.errorRate - oldest.errorRate
      }
    }
  }

  // Helper method to calculate percentiles
  private percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil((p / 100) * sorted.length) - 1
    return sorted[Math.max(0, index)]
  }

  // Get system health score
  getHealthScore(): number {
    const perfStats = this.getPerformanceStats()
    const businessStats = this.getBusinessMetricsSummary()

    let score = 100

    // Performance factors (40% weight)
    if (perfStats) {
      if (perfStats.avgDuration > 2000) score -= 20 // Slow operations
      if (perfStats.errorRate > 5) score -= 30 // High error rate
      if (perfStats.p95Duration > 5000) score -= 15 // Slow tail
    }

    // Business factors (40% weight)
    if (businessStats) {
      if (businessStats.current.averageWaitTime > 24) score -= 25 // Long wait times
      if (businessStats.current.errorRate > 10) score -= 30 // High error rate
      if (businessStats.current.queueLength > 100) score -= 20 // Long queue
    }

    // System factors (20% weight)
    const memUsage = process.memoryUsage()
    const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100
    if (memUsagePercent > 80) score -= 15 // High memory usage
    if (memUsagePercent > 90) score -= 25 // Critical memory usage

    return Math.max(0, score)
  }

  // Export metrics for monitoring systems
  exportMetrics() {
    return {
      timestamp: Date.now(),
      performance: this.getPerformanceStats(),
      business: this.getBusinessMetricsSummary(),
      health: this.getHealthScore(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform
      }
    }
  }

  // Clear old metrics
  clearOldMetrics(olderThanMs: number = 86400000) { // 24 hours default
    const cutoff = Date.now() - olderThanMs
    
    this.performanceMetrics = this.performanceMetrics.filter(m => m.timestamp > cutoff)
    this.businessMetrics = this.businessMetrics.filter(m => m.timestamp > cutoff)
    
    logger.info('Old metrics cleared', {
      performanceMetrics: this.performanceMetrics.length,
      businessMetrics: this.businessMetrics.length,
      cutoff: new Date(cutoff).toISOString()
    })
  }
}

// Singleton instance
export const metrics = new MetricsCollector()

// Performance monitoring decorator
export function monitorPerformance(operation: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now()
      let success = true
      let error: string | undefined

      try {
        const result = await method.apply(this, args)
        return result
      } catch (err) {
        success = false
        error = err instanceof Error ? err.message : 'Unknown error'
        throw err
      } finally {
        const duration = Date.now() - startTime
        metrics.recordPerformance(operation, duration, success, error, {
          args: args.length,
          className: target.constructor.name,
          methodName: propertyName
        })
      }
    }

    return descriptor
  }
}

// Performance monitoring function
export async function withPerformanceMonitoring<T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const startTime = Date.now()
  let success = true
  let error: string | undefined

  try {
    const result = await fn()
    return result
  } catch (err) {
    success = false
    error = err instanceof Error ? err.message : 'Unknown error'
    throw err
  } finally {
    const duration = Date.now() - startTime
    metrics.recordPerformance(operation, duration, success, error, metadata)
  }
}
