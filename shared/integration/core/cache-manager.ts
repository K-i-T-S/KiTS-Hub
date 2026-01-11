/**
 * Advanced Cache Manager with Multiple Strategies
 * Supports LRU, TTL, and distributed caching patterns
 */

export enum CacheStrategy {
  LRU = 'lru',
  TTL = 'ttl',
  DISTRIBUTED = 'distributed'
}

export interface CacheConfig {
  strategy: CacheStrategy;
  maxSize?: number;           // For LRU
  defaultTTL?: number;       // For TTL (ms)
  keyPrefix?: string;         // For distributed
  redisUrl?: string;         // For distributed
  compressionEnabled?: boolean;
  serializationFormat?: 'json' | 'binary';
}

export interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl?: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  hitRate: number;
  currentSize: number;
  memoryUsage: number;
}

class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private currentSize = 0;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Update access information
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  set(key: string, value: T, ttl?: number): void {
    const existingEntry = this.cache.get(key);
    const size = this.calculateSize(value);

    // Check if we need to evict
    while (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    // Remove existing entry if present
    if (existingEntry) {
      this.currentSize -= existingEntry.size;
      this.cache.delete(key);
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl,
      accessCount: 1,
      lastAccessed: Date.now(),
      size
    };

    this.cache.set(key, entry);
    this.currentSize += size;
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.currentSize -= entry.size;
    this.cache.delete(key);
    return true;
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const entry = this.cache.get(oldestKey)!;
      this.currentSize -= entry.size;
      this.cache.delete(oldestKey);
    }
  }

  private calculateSize(value: T): number {
    return JSON.stringify(value).length * 2; // Rough estimate in bytes
  }

  getMetrics(): Omit<CacheMetrics, 'memoryUsage'> {
    return {
      hits: 0, // Would need to track separately
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      hitRate: 0,
      currentSize: this.cache.size
    };
  }
}

class TTLCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private defaultTTL: number;

  constructor(defaultTTL: number) {
    this.defaultTTL = defaultTTL;
    this.startCleanup();
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      return undefined;
    }

    entry.accessCount++;
    entry.lastAccessed = Date.now();
    return entry.value;
  }

  set(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      accessCount: 1,
      lastAccessed: Date.now(),
      size: this.calculateSize(value)
    };

    this.cache.set(key, entry);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private isExpired(entry: CacheEntry<T>): boolean {
    if (!entry.ttl) return false;
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private startCleanup(): void {
    // Clean up expired entries every minute
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (this.isExpired(entry)) {
          this.cache.delete(key);
        }
      }
    }, 60000);
  }

  private calculateSize(value: T): number {
    return JSON.stringify(value).length * 2;
  }
}

class DistributedCache<T> {
  private redis: any; // Redis client
  private keyPrefix: string;
  private metrics = { hits: 0, misses: 0, sets: 0, deletes: 0 };

  constructor(redisUrl: string, keyPrefix: string = 'kits:') {
    // In a real implementation, this would initialize Redis client
    // this.redis = new Redis(redisUrl);
    this.keyPrefix = keyPrefix;
  }

  async get(key: string): Promise<T | undefined> {
    const fullKey = this.keyPrefix + key;
    
    try {
      // const value = await this.redis.get(fullKey);
      // if (value) {
      //   this.metrics.hits++;
      //   return JSON.parse(value);
      // }
      this.metrics.misses++;
      return undefined;
    } catch (error) {
      this.metrics.misses++;
      return undefined;
    }
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    const fullKey = this.keyPrefix + key;
    const serialized = JSON.stringify(value);
    
    try {
      // if (ttl) {
      //   await this.redis.setex(fullKey, ttl / 1000, serialized);
      // } else {
      //   await this.redis.set(fullKey, serialized);
      // }
      this.metrics.sets++;
    } catch (error) {
      // Handle Redis errors
    }
  }

  async delete(key: string): Promise<boolean> {
    const fullKey = this.keyPrefix + key;
    
    try {
      // const result = await this.redis.del(fullKey);
      // this.metrics.deletes++;
      // return result > 0;
      return false;
    } catch (error) {
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      // const keys = await this.redis.keys(this.keyPrefix + '*');
      // if (keys.length > 0) {
      //   await this.redis.del(...keys);
      // }
    } catch (error) {
      // Handle Redis errors
    }
  }

  getMetrics(): Omit<CacheMetrics, 'currentSize' | 'memoryUsage'> {
    const total = this.metrics.hits + this.metrics.misses;
    return {
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      sets: this.metrics.sets,
      deletes: this.metrics.deletes,
      evictions: 0,
      hitRate: total > 0 ? this.metrics.hits / total : 0
    };
  }
}

export class CacheManager<T> {
  private cache: LRUCache<T> | TTLCache<T> | DistributedCache<T>;
  private metrics: CacheMetrics;

  constructor(private config: CacheConfig) {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      hitRate: 0,
      currentSize: 0,
      memoryUsage: 0
    };

    switch (config.strategy) {
      case CacheStrategy.LRU:
        if (!config.maxSize) {
          throw new Error('LRU strategy requires maxSize');
        }
        this.cache = new LRUCache<T>(config.maxSize);
        break;
      
      case CacheStrategy.TTL:
        if (!config.defaultTTL) {
          throw new Error('TTL strategy requires defaultTTL');
        }
        this.cache = new TTLCache<T>(config.defaultTTL);
        break;
      
      case CacheStrategy.DISTRIBUTED:
        if (!config.redisUrl) {
          throw new Error('Distributed strategy requires redisUrl');
        }
        this.cache = new DistributedCache<T>(config.redisUrl, config.keyPrefix);
        break;
      
      default:
        throw new Error(`Unknown cache strategy: ${config.strategy}`);
    }
  }

  async get(key: string): Promise<T | undefined> {
    const startTime = Date.now();
    
    let result: T | undefined;
    
    if (this.config.strategy === CacheStrategy.DISTRIBUTED) {
      result = await (this.cache as DistributedCache<T>).get(key);
    } else {
      result = (this.cache as LRUCache<T> | TTLCache<T>).get(key);
    }

    if (result !== undefined) {
      this.metrics.hits++;
    } else {
      this.metrics.misses++;
    }

    this.updateMetrics();
    return result;
  }

  async set(key: string, value: T, ttl?: number): Promise<void> {
    const startTime = Date.now();
    
    if (this.config.strategy === CacheStrategy.DISTRIBUTED) {
      await (this.cache as DistributedCache<T>).set(key, value, ttl);
    } else {
      (this.cache as LRUCache<T> | TTLCache<T>).set(key, value, ttl);
    }

    this.metrics.sets++;
    this.updateMetrics();
  }

  async delete(key: string): Promise<boolean> {
    let result: boolean;
    
    if (this.config.strategy === CacheStrategy.DISTRIBUTED) {
      result = await (this.cache as DistributedCache<T>).delete(key);
    } else {
      result = (this.cache as LRUCache<T> | TTLCache<T>).delete(key);
    }

    if (result) {
      this.metrics.deletes++;
    }

    this.updateMetrics();
    return result;
  }

  async clear(): Promise<void> {
    if (this.config.strategy === CacheStrategy.DISTRIBUTED) {
      await (this.cache as DistributedCache<T>).clear();
    } else {
      (this.cache as LRUCache<T> | TTLCache<T>).clear();
    }

    this.metrics.currentSize = 0;
    this.metrics.memoryUsage = 0;
  }

  private updateMetrics(): void {
    const total = this.metrics.hits + this.metrics.misses;
    this.metrics.hitRate = total > 0 ? this.metrics.hits / total : 0;

    if (this.config.strategy !== CacheStrategy.DISTRIBUTED) {
      const cacheMetrics = (this.cache as LRUCache<T> | TTLCache<T>).getMetrics();
      this.metrics.currentSize = cacheMetrics.currentSize;
    }
  }

  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      hitRate: 0,
      currentSize: 0,
      memoryUsage: 0
    };
  }
}

export class CacheManagerRegistry {
  private static instance: CacheManagerRegistry;
  private managers = new Map<string, CacheManager<any>>();

  static getInstance(): CacheManagerRegistry {
    if (!CacheManagerRegistry.instance) {
      CacheManagerRegistry.instance = new CacheManagerRegistry();
    }
    return CacheManagerRegistry.instance;
  }

  createCacheManager<T>(name: string, config: CacheConfig): CacheManager<T> {
    const manager = new CacheManager<T>(config);
    this.managers.set(name, manager);
    return manager;
  }

  getCacheManager<T>(name: string): CacheManager<T> | undefined {
    return this.managers.get(name);
  }

  getAllMetrics(): Record<string, CacheMetrics> {
    const metrics: Record<string, CacheMetrics> = {};
    for (const [name, manager] of this.managers.entries()) {
      metrics[name] = manager.getMetrics();
    }
    return metrics;
  }

  async clearAll(): Promise<void> {
    for (const manager of this.managers.values()) {
      await manager.clear();
    }
  }

  resetAll(): void {
    for (const manager of this.managers.values()) {
      manager.reset();
    }
  }
}
