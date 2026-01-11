/**
 * Circuit Breaker Pattern Implementation
 * Provides fault tolerance for external service calls
 */

export enum CircuitState {
  CLOSED = 'closed',      // Normal operation
  OPEN = 'open',          // Service is failing, calls are blocked
  HALF_OPEN = 'half_open' // Testing if service has recovered
}

export interface CircuitBreakerConfig {
  failureThreshold: number;    // Number of failures before opening
  resetTimeout: number;        // Time to wait before trying again (ms)
  monitoringPeriod: number;     // Time window for failure counting (ms)
  expectedRecoveryTime: number; // Expected time for service recovery (ms)
}

export interface CircuitBreakerMetrics {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  totalRequests: number;
  totalFailures: number;
  averageResponseTime: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime?: number;
  private lastSuccessTime?: number;
  private totalRequests = 0;
  private totalFailures = 0;
  private responseTimes: number[] = [];
  private failureWindow: number[] = [];

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const startTime = Date.now();
    
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await operation();
      this.onSuccess(startTime);
      return result;
    } catch (error) {
      this.onFailure(startTime);
      throw error;
    }
  }

  private onSuccess(startTime: number): void {
    const responseTime = Date.now() - startTime;
    this.totalRequests++;
    this.lastSuccessTime = Date.now();
    this.successCount++;
    this.responseTimes.push(responseTime);

    // Keep only last 100 response times
    if (this.responseTimes.length > 100) {
      this.responseTimes = this.responseTimes.slice(-100);
    }

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.CLOSED;
      this.failureCount = 0;
    }
  }

  private onFailure(startTime: number): void {
    const responseTime = Date.now() - startTime;
    this.totalRequests++;
    this.totalFailures++;
    this.lastFailureTime = Date.now();
    this.failureCount++;
    this.failureWindow.push(Date.now());

    // Clean old failures outside monitoring period
    const cutoff = Date.now() - this.config.monitoringPeriod;
    this.failureWindow = this.failureWindow.filter(time => time > cutoff);

    if (this.state === CircuitState.HALF_OPEN || 
        this.failureWindow.length >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }

  private shouldAttemptReset(): boolean {
    return this.lastFailureTime !== undefined &&
           Date.now() - this.lastFailureTime >= this.config.resetTimeout;
  }

  getMetrics(): CircuitBreakerMetrics {
    const avgResponseTime = this.responseTimes.length > 0
      ? this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length
      : 0;

    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      averageResponseTime: avgResponseTime
    };
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
    this.lastSuccessTime = undefined;
    this.totalRequests = 0;
    this.totalFailures = 0;
    this.responseTimes = [];
    this.failureWindow = [];
  }

  forceOpen(): void {
    this.state = CircuitState.OPEN;
    this.lastFailureTime = Date.now();
  }

  forceClose(): void {
    this.reset();
  }
}

export class CircuitBreakerRegistry {
  private static instance: CircuitBreakerRegistry;
  private circuitBreakers = new Map<string, CircuitBreaker>();

  static getInstance(): CircuitBreakerRegistry {
    if (!CircuitBreakerRegistry.instance) {
      CircuitBreakerRegistry.instance = new CircuitBreakerRegistry();
    }
    return CircuitBreakerRegistry.instance;
  }

  createCircuitBreaker(name: string, config: CircuitBreakerConfig): CircuitBreaker {
    const circuitBreaker = new CircuitBreaker(config);
    this.circuitBreakers.set(name, circuitBreaker);
    return circuitBreaker;
  }

  getCircuitBreaker(name: string): CircuitBreaker | undefined {
    return this.circuitBreakers.get(name);
  }

  getAllMetrics(): Record<string, CircuitBreakerMetrics> {
    const metrics: Record<string, CircuitBreakerMetrics> = {};
    for (const [name, circuitBreaker] of this.circuitBreakers.entries()) {
      metrics[name] = circuitBreaker.getMetrics();
    }
    return metrics;
  }

  resetAll(): void {
    for (const circuitBreaker of this.circuitBreakers.values()) {
      circuitBreaker.reset();
    }
  }
}
