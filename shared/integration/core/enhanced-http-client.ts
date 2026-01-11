/**
 * Enhanced HTTP Client with Modern Features
 * Includes circuit breaker, rate limiting, caching, and observability
 */

import { CircuitBreaker, CircuitBreakerRegistry } from './circuit-breaker';
import { RateLimiter, RateLimiterRegistry } from './rate-limiter';
import { CacheManager, CacheManagerRegistry } from './cache-manager';
import { ObservabilityManager, TraceContext } from './observability';
import { TenantContext } from './types';

export interface EnhancedHttpClientConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  enableCircuitBreaker?: boolean;
  circuitBreakerConfig?: {
    failureThreshold: number;
    resetTimeout: number;
    monitoringPeriod: number;
  };
  enableRateLimiting?: boolean;
  rateLimitConfig?: {
    algorithm: 'sliding_window' | 'token_bucket' | 'fixed_window';
    windowSize?: number;
    maxRequests?: number;
    refillRate?: number;
    bucketSize?: number;
  };
  enableCaching?: boolean;
  cacheConfig?: {
    strategy: 'lru' | 'ttl' | 'distributed';
    maxSize?: number;
    defaultTTL?: number;
    keyPrefix?: string;
  };
  enableObservability?: boolean;
  observabilityConfig?: {
    serviceName: string;
    serviceVersion: string;
    environment: string;
  };
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
  timeout?: number;
  retries?: number;
  enableCircuitBreaker?: boolean;
  enableRateLimiting?: boolean;
  enableCaching?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  traceContext?: TraceContext;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestConfig;
  duration: number;
  cached: boolean;
  fromCache: boolean;
}

export class EnhancedHttpClient {
  private circuitBreaker?: CircuitBreaker;
  private rateLimiter?: RateLimiter;
  private cacheManager?: CacheManager<any>;
  private observabilityManager?: ObservabilityManager;
  private config: EnhancedHttpClientConfig;

  constructor(config: EnhancedHttpClientConfig) {
    this.config = config;
    this.initializeComponents();
  }

  private initializeComponents(): void {
    // Initialize Circuit Breaker
    if (this.config.enableCircuitBreaker && this.config.circuitBreakerConfig) {
      const registry = CircuitBreakerRegistry.getInstance();
      this.circuitBreaker = registry.createCircuitBreaker(
        `${this.config.baseUrl}-circuit-breaker`,
        {
          failureThreshold: this.config.circuitBreakerConfig.failureThreshold,
          resetTimeout: this.config.circuitBreakerConfig.resetTimeout,
          monitoringPeriod: this.config.circuitBreakerConfig.monitoringPeriod,
          expectedRecoveryTime: this.config.circuitBreakerConfig.resetTimeout
        }
      );
    }

    // Initialize Rate Limiter
    if (this.config.enableRateLimiting && this.config.rateLimitConfig) {
      const registry = RateLimiterRegistry.getInstance();
      this.rateLimiter = registry.createRateLimiter(
        `${this.config.baseUrl}-rate-limiter`,
        {
          algorithm: this.config.rateLimitConfig.algorithm as any,
          windowSize: this.config.rateLimitConfig.windowSize,
          maxRequests: this.config.rateLimitConfig.maxRequests,
          refillRate: this.config.rateLimitConfig.refillRate,
          bucketSize: this.config.rateLimitConfig.bucketSize
        }
      );
    }

    // Initialize Cache Manager
    if (this.config.enableCaching && this.config.cacheConfig) {
      const registry = CacheManagerRegistry.getInstance();
      this.cacheManager = registry.createCacheManager(
        `${this.config.baseUrl}-cache`,
        {
          strategy: this.config.cacheConfig.strategy as any,
          maxSize: this.config.cacheConfig.maxSize,
          defaultTTL: this.config.cacheConfig.defaultTTL,
          keyPrefix: this.config.cacheConfig.keyPrefix
        }
      );
    }

    // Initialize Observability Manager
    if (this.config.enableObservability && this.config.observabilityConfig) {
      this.observabilityManager = ObservabilityManager.getInstance({
        serviceName: this.config.observabilityConfig.serviceName,
        serviceVersion: this.config.observabilityConfig.serviceVersion,
        environment: this.config.observabilityConfig.environment,
        enableTracing: true,
        enableMetrics: true,
        enableLogging: true,
        sampleRate: 1.0,
        defaultTags: {
          component: 'enhanced-http-client',
          base_url: this.config.baseUrl
        }
      });
    }
  }

  async request<T = any>(config: RequestConfig): Promise<HttpResponse<T>> {
    const startTime = Date.now();
    let span: any = null;

    // Start tracing if enabled
    if (this.observabilityManager) {
      span = this.observabilityManager.getTracer().startSpan(
        `HTTP ${config.method} ${config.url}`,
        config.traceContext
      );
      this.observabilityManager.getTracer().setTag(span.spanId, 'http.method', config.method);
      this.observabilityManager.getTracer().setTag(span.spanId, 'http.url', config.url);
      this.observabilityManager.getTracer().setTag(span.spanId, 'component', 'enhanced-http-client');
    }

    try {
      // Check rate limiting
      if (this.rateLimiter && config.enableRateLimiting !== false) {
        const rateLimitResult = this.rateLimiter.check(this.config.baseUrl);
        if (!rateLimitResult.allowed) {
          throw new Error(`Rate limit exceeded. Retry after ${rateLimitResult.retryAfter}ms`);
        }
      }

      // Check cache for GET requests
      if (this.cacheManager && config.method === 'GET' && config.enableCaching !== false) {
        const cacheKey = config.cacheKey || this.generateCacheKey(config);
        const cachedResponse = await this.cacheManager.get(cacheKey);
        
        if (cachedResponse) {
          const duration = Date.now() - startTime;
          
          if (this.observabilityManager) {
            this.observabilityManager.getTracer().setTag(span.spanId, 'cache.hit', true);
            this.observabilityManager.getTracer().finishSpan(span.spanId);
            this.observabilityManager.getMetrics().increment('http.requests.cached');
            this.observabilityManager.getMetrics().timer('http.request.duration', duration);
          }

          return {
            data: cachedResponse,
            status: 200,
            statusText: 'OK (Cached)',
            headers: {},
            config,
            duration,
            cached: true,
            fromCache: true
          };
        }
      }

      // Execute request through circuit breaker
      const response = await this.executeRequest<T>(config, span);

      // Cache successful GET responses
      if (this.cacheManager && config.method === 'GET' && response.status < 400 && config.enableCaching !== false) {
        const cacheKey = config.cacheKey || this.generateCacheKey(config);
        await this.cacheManager.set(cacheKey, response.data, config.cacheTTL);
      }

      const duration = Date.now() - startTime;

      if (this.observabilityManager) {
        this.observabilityManager.getTracer().setTag(span.spanId, 'http.status_code', response.status);
        this.observabilityManager.getTracer().setTag(span.spanId, 'cache.hit', false);
        this.observabilityManager.getTracer().finishSpan(span.spanId);
        this.observabilityManager.getMetrics().increment('http.requests.total');
        this.observabilityManager.getMetrics().timer('http.request.duration', duration);
        
        if (response.status >= 400) {
          this.observabilityManager.getMetrics().increment('http.requests.errors');
        }
      }

      return {
        ...response,
        duration,
        cached: false,
        fromCache: false
      };

    } catch (error) {
      const duration = Date.now() - startTime;

      if (this.observabilityManager) {
        this.observabilityManager.getTracer().logEvent(span.spanId, 'error', (error as Error).message);
        this.observabilityManager.getTracer().finishSpan(span.spanId, 'error');
        this.observabilityManager.getMetrics().increment('http.requests.errors');
        this.observabilityManager.getMetrics().timer('http.request.duration', duration);
        this.observabilityManager.getLogger().error(
          `HTTP request failed: ${config.method} ${config.url}`,
          error as Error,
          { method: config.method, url: config.url, duration }
        );
      }

      throw error;
    }
  }

  private async executeRequest<T>(config: RequestConfig, span: any): Promise<Partial<HttpResponse<T>>> {
    const operation = async () => {
      const url = this.buildUrl(config.url, config.params);
      const headers = { ...config.headers };

      // Add authentication headers if tenant context is available
      if (this.observabilityManager) {
        const currentContext = this.observabilityManager.getTracer().getCurrentContext();
        if (currentContext) {
          headers['X-Trace-Id'] = currentContext.traceId;
          headers['X-Span-Id'] = currentContext.spanId;
        }
      }

      const fetchConfig: RequestInit = {
        method: config.method,
        headers,
        body: config.body ? JSON.stringify(config.body) : undefined
      };

      const response = await fetch(url, fetchConfig);
      const data = await this.parseResponse<T>(response);

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: this.parseHeaders(response.headers),
        config
      };
    };

    // Execute through circuit breaker if enabled
    if (this.circuitBreaker && config.enableCircuitBreaker !== false) {
      return await this.circuitBreaker.execute(operation);
    }

    return await operation();
  }

  private buildUrl(baseUrl: string, params?: Record<string, any>): string {
    if (!params) return baseUrl;

    const url = new URL(baseUrl);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    }
    return url.toString();
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      return await response.json();
    } else if (contentType?.includes('text/')) {
      return await response.text() as unknown as T;
    } else {
      return await response.blob() as unknown as T;
    }
  }

  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  private generateCacheKey(config: RequestConfig): string {
    const url = this.buildUrl(config.url, config.params);
    return `${config.method}:${url}:${JSON.stringify(config.headers || {})}`;
  }

  // Convenience methods
  async get<T = any>(url: string, config: Partial<RequestConfig> = {}): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(url: string, body?: any, config: Partial<RequestConfig> = {}): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, body });
  }

  async put<T = any>(url: string, body?: any, config: Partial<RequestConfig> = {}): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, body });
  }

  async delete<T = any>(url: string, config: Partial<RequestConfig> = {}): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  async patch<T = any>(url: string, body?: any, config: Partial<RequestConfig> = {}): Promise<HttpResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, body });
  }

  // Metrics and health
  getMetrics(): {
    circuitBreaker?: any;
    rateLimiter?: any;
    cache?: any;
    observability?: any;
  } {
    const metrics: any = {};

    if (this.circuitBreaker) {
      metrics.circuitBreaker = this.circuitBreaker.getMetrics();
    }

    if (this.rateLimiter) {
      metrics.rateLimiter = this.rateLimiter.getMetrics();
    }

    if (this.cacheManager) {
      metrics.cache = this.cacheManager.getMetrics();
    }

    if (this.observabilityManager) {
      metrics.observability = this.observabilityManager.getHealthStatus();
    }

    return metrics;
  }

  async healthCheck(): Promise<{
    healthy: boolean;
    checks: {
      circuitBreaker: boolean;
      rateLimiter: boolean;
      cache: boolean;
      connectivity: boolean;
    };
  }> {
    const checks = {
      circuitBreaker: true,
      rateLimiter: true,
      cache: true,
      connectivity: false
    };

    // Check circuit breaker
    if (this.circuitBreaker) {
      const metrics = this.circuitBreaker.getMetrics();
      checks.circuitBreaker = metrics.state !== 'open';
    }

    // Check rate limiter
    if (this.rateLimiter) {
      const metrics = this.rateLimiter.getMetrics();
      checks.rateLimiter = metrics.blockedRequests < metrics.totalRequests * 0.5; // Less than 50% blocked
    }

    // Check cache
    if (this.cacheManager) {
      const metrics = this.cacheManager.getMetrics();
      checks.cache = metrics.hitRate > 0.1; // At least 10% hit rate
    }

    // Check connectivity
    try {
      await this.get('/health', { enableCaching: false, enableCircuitBreaker: false, enableRateLimiting: false });
      checks.connectivity = true;
    } catch (error) {
      checks.connectivity = false;
    }

    const healthy = Object.values(checks).every(check => check);

    return { healthy, checks };
  }
}
