/**
 * Advanced Rate Limiter with Multiple Algorithms
 * Supports sliding window, token bucket, and fixed window algorithms
 */

export enum RateLimitAlgorithm {
  SLIDING_WINDOW = 'sliding_window',
  TOKEN_BUCKET = 'token_bucket',
  FIXED_WINDOW = 'fixed_window'
}

export interface RateLimitConfig {
  algorithm: RateLimitAlgorithm;
  windowSize?: number;        // For sliding/fixed window (ms)
  maxRequests?: number;       // For sliding/fixed window
  refillRate?: number;        // For token bucket (tokens per second)
  bucketSize?: number;        // For token bucket (max tokens)
  keyGenerator?: (identifier: string) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  limit: number;
  window: number;
}

export interface RateLimitMetrics {
  totalRequests: number;
  blockedRequests: number;
  averageRequestRate: number;
  peakRequestRate: number;
  currentActiveKeys: number;
}

class SlidingWindowRateLimiter {
  private windows = new Map<string, number[]>();

  constructor(
    private windowSize: number,
    private maxRequests: number
  ) {}

  check(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowSize;
    
    if (!this.windows.has(key)) {
      this.windows.set(key, []);
    }
    
    const requests = this.windows.get(key)!;
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    this.windows.set(key, validRequests);
    
    const allowed = validRequests.length < this.maxRequests;
    const remaining = Math.max(0, this.maxRequests - validRequests.length);
    
    if (allowed) {
      validRequests.push(now);
    }
    
    return {
      allowed,
      remaining,
      resetTime: now + this.windowSize,
      retryAfter: allowed ? undefined : Math.min(...validRequests) + this.windowSize - now,
      limit: this.maxRequests,
      window: this.windowSize
    };
  }

  cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.windowSize * 2; // Keep windows for 2x window size
    
    for (const [key, requests] of this.windows.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > cutoff);
      if (validRequests.length === 0) {
        this.windows.delete(key);
      } else {
        this.windows.set(key, validRequests);
      }
    }
  }
}

class TokenBucketRateLimiter {
  private buckets = new Map<string, { tokens: number; lastRefill: number }>();

  constructor(
    private refillRate: number,    // tokens per second
    private bucketSize: number     // max tokens
  ) {}

  check(key: string): RateLimitResult {
    const now = Date.now();
    
    if (!this.buckets.has(key)) {
      this.buckets.set(key, {
        tokens: this.bucketSize,
        lastRefill: now
      });
    }
    
    const bucket = this.buckets.get(key)!;
    
    // Refill tokens based on time elapsed
    const timeElapsed = (now - bucket.lastRefill) / 1000;
    const tokensToAdd = timeElapsed * this.refillRate;
    bucket.tokens = Math.min(this.bucketSize, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
    
    const allowed = bucket.tokens >= 1;
    const remaining = Math.floor(bucket.tokens);
    
    if (allowed) {
      bucket.tokens -= 1;
    }
    
    return {
      allowed,
      remaining,
      resetTime: now + (this.bucketSize - bucket.tokens) * 1000 / this.refillRate,
      retryAfter: allowed ? undefined : 1000 / this.refillRate,
      limit: this.bucketSize,
      window: 1000 // 1 second window for token bucket
    };
  }

  cleanup(): void {
    const now = Date.now();
    const cutoff = now - 60000; // Remove buckets unused for 1 minute
    
    for (const [key, bucket] of this.buckets.entries()) {
      if (bucket.lastRefill < cutoff) {
        this.buckets.delete(key);
      }
    }
  }
}

class FixedWindowRateLimiter {
  private windows = new Map<string, { count: number; resetTime: number }>();

  constructor(
    private windowSize: number,
    private maxRequests: number
  ) {}

  check(key: string): RateLimitResult {
    const now = Date.now();
    
    if (!this.windows.has(key)) {
      this.windows.set(key, {
        count: 0,
        resetTime: now + this.windowSize
      });
    }
    
    const window = this.windows.get(key)!;
    
    if (now >= window.resetTime) {
      window.count = 0;
      window.resetTime = now + this.windowSize;
    }
    
    const allowed = window.count < this.maxRequests;
    const remaining = Math.max(0, this.maxRequests - window.count);
    
    if (allowed) {
      window.count++;
    }
    
    return {
      allowed,
      remaining,
      resetTime: window.resetTime,
      retryAfter: allowed ? undefined : window.resetTime - now,
      limit: this.maxRequests,
      window: this.windowSize
    };
  }

  cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.windowSize * 2;
    
    for (const [key, window] of this.windows.entries()) {
      if (window.resetTime < cutoff) {
        this.windows.delete(key);
      }
    }
  }
}

export class RateLimiter {
  private limiter: SlidingWindowRateLimiter | TokenBucketRateLimiter | FixedWindowRateLimiter;
  private metrics = {
    totalRequests: 0,
    blockedRequests: 0,
    requestTimestamps: [] as number[],
    peakRequestRate: 0
  };

  constructor(private config: RateLimitConfig) {
    switch (config.algorithm) {
      case RateLimitAlgorithm.SLIDING_WINDOW:
        if (!config.windowSize || !config.maxRequests) {
          throw new Error('Sliding window requires windowSize and maxRequests');
        }
        this.limiter = new SlidingWindowRateLimiter(config.windowSize, config.maxRequests);
        break;
      
      case RateLimitAlgorithm.TOKEN_BUCKET:
        if (!config.refillRate || !config.bucketSize) {
          throw new Error('Token bucket requires refillRate and bucketSize');
        }
        this.limiter = new TokenBucketRateLimiter(config.refillRate, config.bucketSize);
        break;
      
      case RateLimitAlgorithm.FIXED_WINDOW:
        if (!config.windowSize || !config.maxRequests) {
          throw new Error('Fixed window requires windowSize and maxRequests');
        }
        this.limiter = new FixedWindowRateLimiter(config.windowSize, config.maxRequests);
        break;
      
      default:
        throw new Error(`Unknown rate limit algorithm: ${config.algorithm}`);
    }

    // Start cleanup interval
    setInterval(() => this.cleanup(), 60000); // Cleanup every minute
  }

  check(identifier: string): RateLimitResult {
    const key = this.config.keyGenerator 
      ? this.config.keyGenerator(identifier)
      : identifier;
    
    this.metrics.totalRequests++;
    this.metrics.requestTimestamps.push(Date.now());
    
    const result = this.limiter.check(key);
    
    if (!result.allowed) {
      this.metrics.blockedRequests++;
    }
    
    // Update peak request rate
    const recentRequests = this.metrics.requestTimestamps.filter(
      timestamp => Date.now() - timestamp < 60000 // Last minute
    );
    this.metrics.peakRequestRate = Math.max(this.metrics.peakRequestRate, recentRequests.length);
    
    // Keep only last hour of timestamps
    if (this.metrics.requestTimestamps.length > 3600) {
      this.metrics.requestTimestamps = this.metrics.requestTimestamps.slice(-3600);
    }
    
    return result;
  }

  private cleanup(): void {
    if ('cleanup' in this.limiter) {
      (this.limiter as any).cleanup();
    }
  }

  getMetrics(): RateLimitMetrics {
    const recentRequests = this.metrics.requestTimestamps.filter(
      timestamp => Date.now() - timestamp < 60000 // Last minute
    );
    
    return {
      totalRequests: this.metrics.totalRequests,
      blockedRequests: this.metrics.blockedRequests,
      averageRequestRate: this.metrics.totalRequests / Math.max(1, this.metrics.requestTimestamps.length / 60),
      peakRequestRate: this.metrics.peakRequestRate,
      currentActiveKeys: this.getActiveKeyCount()
    };
  }

  private getActiveKeyCount(): number {
    // This would need to be implemented based on the underlying limiter
    return 0; // Placeholder
  }

  reset(): void {
    this.metrics = {
      totalRequests: 0,
      blockedRequests: 0,
      requestTimestamps: [],
      peakRequestRate: 0
    };
  }
}

export class RateLimiterRegistry {
  private static instance: RateLimiterRegistry;
  private limiters = new Map<string, RateLimiter>();

  static getInstance(): RateLimiterRegistry {
    if (!RateLimiterRegistry.instance) {
      RateLimiterRegistry.instance = new RateLimiterRegistry();
    }
    return RateLimiterRegistry.instance;
  }

  createRateLimiter(name: string, config: RateLimitConfig): RateLimiter {
    const limiter = new RateLimiter(config);
    this.limiters.set(name, limiter);
    return limiter;
  }

  getRateLimiter(name: string): RateLimiter | undefined {
    return this.limiters.get(name);
  }

  getAllMetrics(): Record<string, RateLimitMetrics> {
    const metrics: Record<string, RateLimitMetrics> = {};
    for (const [name, limiter] of this.limiters.entries()) {
      metrics[name] = limiter.getMetrics();
    }
    return metrics;
  }

  resetAll(): void {
    for (const limiter of this.limiters.values()) {
      limiter.reset();
    }
  }
}
