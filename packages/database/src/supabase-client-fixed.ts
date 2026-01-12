import { createClient, SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js';

// Simplified Database type for compatibility
export interface Database {
  public: {
    Tables: Record<string, any>;
    Views: Record<string, any>;
    Functions: Record<string, any>;
    Enums: Record<string, any>;
    CompositeTypes: Record<string, any>;
  }
}

/**
 * Configuration interface for Supabase client
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
  options?: SupabaseClientOptions;
}

/**
 * Tenant context interface for multi-tenant operations
 */
export interface TenantContext {
  tenantId: string;
  userId?: string;
  role?: string;
  permissions?: string[];
}

/**
 * Connection pool configuration
 */
export interface ConnectionPoolConfig {
  maxConnections: number;
  minConnections: number;
  idleTimeoutMillis: number;
  acquireTimeoutMillis: number;
}

/**
 * Retry configuration for failed requests
 */
export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryDelayMultiplier: number;
  maxRetryDelay: number;
  retryableErrors: string[];
}

/**
 * Database client abstraction layer with multi-tenant support
 */
export class SupabaseDatabaseClient {
  private static instance: SupabaseDatabaseClient;
  private client: SupabaseClient;
  private serviceRoleClient: SupabaseClient | null = null;
  private config: SupabaseConfig;
  private currentTenantContext: TenantContext | null = null;
  private connectionPool: Map<string, SupabaseClient> = new Map();
  private retryConfig: RetryConfig;

  /**
   * Private constructor for singleton pattern
   */
  private constructor(config: SupabaseConfig) {
    this.config = config;
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      retryDelayMultiplier: 2,
      maxRetryDelay: 10000,
      retryableErrors: ['timeout', 'connection', 'network', '503', '502', '504']
    };

    // Initialize main client
    this.client = createClient<Database>(config.url, config.anonKey, config.options);

    // Initialize service role client if available
    if (config.serviceRoleKey) {
      this.serviceRoleClient = createClient<Database>(
        config.url,
        config.serviceRoleKey,
        {
          ...config.options,
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        }
      );
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: SupabaseConfig): SupabaseDatabaseClient {
    if (!SupabaseDatabaseClient.instance) {
      if (!config) {
        throw new Error('Configuration required for first initialization');
      }
      SupabaseDatabaseClient.instance = new SupabaseDatabaseClient(config);
    }
    return SupabaseDatabaseClient.instance;
  }

  /**
   * Get Supabase client for current tenant context
   */
  public getClient(tenantId?: string): SupabaseClient {
    const targetTenantId = tenantId || this.currentTenantContext?.tenantId;
    
    if (!targetTenantId) {
      throw new Error('Tenant context required. Call setTenantContext() first.');
    }

    // Return cached client if available
    if (this.connectionPool.has(targetTenantId)) {
      return this.connectionPool.get(targetTenantId)!;
    }

    // Create new client for tenant
    const tenantClient = createClient<Database>(this.config.url, this.config.anonKey, {
      ...this.config.options,
      global: {
        headers: {
          'X-Tenant-ID': targetTenantId
        }
      }
    });

    this.connectionPool.set(targetTenantId, tenantClient);
    return tenantClient;
  }

  /**
   * Get service role client for admin operations
   */
  public getServiceRoleClient(): SupabaseClient {
    if (!this.serviceRoleClient) {
      throw new Error('Service role client not initialized. Provide serviceRoleKey in config.');
    }
    return this.serviceRoleClient;
  }

  /**
   * Set tenant context for multi-tenant operations
   */
  public setTenantContext(context: TenantContext): void {
    this.currentTenantContext = context;
    
    // Update client headers with tenant context
    const client = this.getClient(context.tenantId);
    
    // Set custom headers for RLS (using JWT approach)
    console.log('Setting tenant context:', context);
  }

  /**
   * Get current tenant context
   */
  public getTenantContext(): TenantContext | null {
    return this.currentTenantContext;
  }

  /**
   * Clear tenant context and connection pool
   */
  public clearTenantContext(): void {
    this.currentTenantContext = null;
    
    // Clean up connection pool
    for (const [tenantId, client] of this.connectionPool) {
      client.removeAllChannels();
      client.realtime.disconnect();
    }
    this.connectionPool.clear();
  }

  /**
   * Execute operation with retry logic
   */
  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    customRetryConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const config = { ...this.retryConfig, ...customRetryConfig };
    let lastError: Error;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Check if error is retryable
        const isRetryable = config.retryableErrors.some(retryableError =>
          lastError.message.toLowerCase().includes(retryableError.toLowerCase())
        );

        if (!isRetryable || attempt === config.maxRetries) {
          throw lastError;
        }

        // Calculate delay for next attempt
        const delay = Math.min(
          config.retryDelay * Math.pow(config.retryDelayMultiplier, attempt),
          config.maxRetryDelay
        );

        console.warn(`Operation failed, retrying in ${delay}ms (attempt ${attempt + 1}/${config.maxRetries + 1}):`, lastError.message);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Execute operation within a transaction
   */
  public async executeTransaction<T>(
    operations: (client: SupabaseClient) => Promise<T>
  ): Promise<T> {
    const client = this.getClient();
    
    try {
      // Begin transaction
      const { data, error } = await client.rpc('begin_transaction');
      if (error) throw error;

      // Execute operations
      const result = await operations(client);

      // Commit transaction
      const { error: commitError } = await client.rpc('commit_transaction');
      if (commitError) throw commitError;

      return result;
    } catch (error) {
      // Rollback transaction
      await client.rpc('rollback_transaction');
      throw error;
    }
  }

  /**
   * Switch tenant context
   */
  public switchTenant(tenantId: string, userId?: string, role?: string): void {
    this.setTenantContext({
      tenantId,
      userId,
      role,
      permissions: [] // Will be loaded from database
    });
  }

  /**
   * Check if user has specific permission
   */
  public async hasPermission(permission: string): Promise<boolean> {
    if (!this.currentTenantContext) {
      return false;
    }

    const client = this.getClient();
    const { data, error } = await client.rpc('user_has_permission', {
      permission_name: permission
    });

    if (error) {
      console.error('Error checking permission:', error);
      return false;
    }

    return data || false;
  }

  /**
   * Check if user has specific role
   */
  public async hasRole(role: string): Promise<boolean> {
    if (!this.currentTenantContext) {
      return false;
    }

    const client = this.getClient();
    const { data, error } = await client.rpc('user_has_role', {
      required_role: role
    });

    if (error) {
      console.error('Error checking role:', error);
      return false;
    }

    return data || false;
  }

  /**
   * Get current user permissions
   */
  public async getUserPermissions(): Promise<string[]> {
    if (!this.currentTenantContext) {
      return [];
    }

    const client = this.getClient();
    const { data, error } = await client.rpc('get_user_permissions');

    if (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }

    return data?.map((p: any) => p.name) || [];
  }

  /**
   * Get tenant information
   */
  public async getTenantInfo(tenantId?: string): Promise<any> {
    const targetTenantId = tenantId || this.currentTenantContext?.tenantId || '';
    if (!targetTenantId) {
      throw new Error('Tenant ID required');
    }

    const client = this.getServiceRoleClient();
    const { data, error } = await client
      .from('tenants')
      .select('*')
      .eq('id', targetTenantId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Health check for database connectivity
   */
  public async healthCheck(): Promise<{ status: string; latency: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      const client = this.getClient();
      const { error } = await client.from('tenants').select('id').limit(1);
      
      const latency = Date.now() - startTime;
      
      if (error) {
        return {
          status: 'error',
          latency,
          error: error.message
        };
      }

      return {
        status: 'healthy',
        latency
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        status: 'error',
        latency,
        error: (error as Error).message
      };
    }
  }

  /**
   * Get connection pool statistics
   */
  public getConnectionPoolStats(): {
    totalConnections: number;
    activeTenants: string[];
  } {
    return {
      totalConnections: this.connectionPool.size,
      activeTenants: Array.from(this.connectionPool.keys())
    };
  }

  /**
   * Clean up idle connections
   */
  public cleanupIdleConnections(): void {
    // In a real implementation, this would track last usage time
    // and clean up connections that have been idle for too long
    console.log('Cleaning up idle connections...');
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Close all connections and cleanup resources
   */
  public async close(): Promise<void> {
    // Close all tenant connections
    for (const [tenantId, client] of this.connectionPool) {
      client.removeAllChannels();
      client.realtime.disconnect();
    }
    this.connectionPool.clear();

    // Close main clients
    this.client.removeAllChannels();
    this.client.realtime.disconnect();
    
    if (this.serviceRoleClient) {
      this.serviceRoleClient.removeAllChannels();
      this.serviceRoleClient.realtime.disconnect();
    }

    this.currentTenantContext = null;
  }

  /**
   * Get client configuration
   */
  public getConfig(): SupabaseConfig {
    return { ...this.config };
  }

  /**
   * Update client configuration
   */
  public updateConfig(newConfig: Partial<SupabaseConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Reinitialize clients with new config
    if (newConfig.url || newConfig.anonKey) {
      this.client = createClient<Database>(
        this.config.url,
        this.config.anonKey,
        this.config.options
      );
    }

    if (newConfig.serviceRoleKey) {
      this.serviceRoleClient = createClient<Database>(
        this.config.url,
        this.config.serviceRoleKey,
        {
          ...this.config.options,
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        }
      );
    }
  }
}

/**
 * Default configuration for development
 */
export const defaultConfig: SupabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:5432',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  options: {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
};

/**
 * Production configuration
 */
export const productionConfig: SupabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  options: {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    },
    realtime: {
      params: {
        eventsPerSecond: 2
      }
    },
    global: {
      headers: {
        'X-Client-Name': 'kits-hub',
        'X-Client-Version': '1.0.0'
      }
    }
  }
};

/**
 * Create database client instance
 */
export function createDatabaseClient(config?: SupabaseConfig): SupabaseDatabaseClient {
  const env = process.env.NODE_ENV || 'development';
  const dbConfig = config || (env === 'production' ? productionConfig : defaultConfig);
  
  return SupabaseDatabaseClient.getInstance(dbConfig);
}

/**
 * Export singleton instance for backward compatibility
 */
export const dbClient = createDatabaseClient();

/**
 * Export types for convenience
 */
export type { SupabaseClient };
