import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database, TenantContext, DatabaseConfig } from './types/database.types';

class DatabaseClientManager {
  private static instance: DatabaseClientManager;
  private client: SupabaseClient<Database>;
  private config: DatabaseConfig;
  private tenantContext: TenantContext | null = null;
  private connectionPool: Map<string, SupabaseClient<Database>> = new Map();

  private constructor(config: DatabaseConfig) {
    this.config = config;
    this.client = this.createClient();
  }

  public static getInstance(config?: DatabaseConfig): DatabaseClientManager {
    if (!DatabaseClientManager.instance) {
      if (!config) {
        throw new Error('Database config required for first initialization');
      }
      DatabaseClientManager.instance = new DatabaseClientManager(config);
    }
    return DatabaseClientManager.instance;
  }

  private createClient(): SupabaseClient<Database> {
    const defaultOptions = {
      db: {
        schema: 'public' as const
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'X-Client-Info': 'kits-hub-database-client'
        }
      }
    };

    const options = {
      ...defaultOptions,
      ...this.config.options
    };

    return createClient<Database>(this.config.url, this.config.anonKey, options);
  }

  /**
   * Get the main database client
   */
  public getClient(): SupabaseClient<Database> {
    return this.client;
  }

  /**
   * Get a tenant-specific client with RLS context
   */
  public getTenantClient(tenantId: string): SupabaseClient<Database> {
    if (this.connectionPool.has(tenantId)) {
      return this.connectionPool.get(tenantId)!;
    }

    const tenantClient = createClient<Database>(this.config.url, this.config.anonKey, {
      ...this.config.options,
      global: {
        ...this.config.options?.global,
        headers: {
          ...this.config.options?.global?.headers,
          'X-Tenant-ID': tenantId
        }
      }
    });

    this.connectionPool.set(tenantId, tenantClient);
    return tenantClient;
  }

  /**
   * Set the current tenant context for multi-tenant operations
   */
  public setTenantContext(context: TenantContext): void {
    this.tenantContext = context;
    
    // Update the main client with tenant context
    this.client.rpc('set_tenant_context', { 
      tenant_uuid: context.tenantId 
    }).then(() => {
      console.log(`Tenant context set for ${context.tenantId}`);
    }).catch(error => {
      console.error('Failed to set tenant context:', error);
    });
  }

  /**
   * Get the current tenant context
   */
  public getTenantContext(): TenantContext | null {
    return this.tenantContext;
  }

  /**
   * Clear the current tenant context
   */
  public clearTenantContext(): void {
    this.tenantContext = null;
  }

  /**
   * Execute a database operation with retry logic
   */
  public async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on authentication errors
        if (error instanceof Error && 
            (error.message.includes('JWT') || 
             error.message.includes('Unauthorized') ||
             error.message.includes('Permission denied'))) {
          throw error;
        }

        // Exponential backoff with jitter
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Execute a transaction with multiple operations
   */
  public async executeTransaction<T>(
    operations: Array<() => Promise<any>>
  ): Promise<T[]> {
    const results: T[] = [];
    
    try {
      // Start transaction
      await this.client.rpc('begin_transaction');
      
      // Execute all operations
      for (const operation of operations) {
        const result = await operation();
        results.push(result);
      }
      
      // Commit transaction
      await this.client.rpc('commit_transaction');
      
      return results;
    } catch (error) {
      // Rollback on error
      try {
        await this.client.rpc('rollback_transaction');
      } catch (rollbackError) {
        console.error('Failed to rollback transaction:', rollbackError);
      }
      
      throw error;
    }
  }

  /**
   * Check database connection health
   */
  public async checkHealth(): Promise<boolean> {
    try {
      const { data, error } = await this.client
        .from('tenants')
        .select('id')
        .limit(1);

      return !error && data !== null;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Get connection pool statistics
   */
  public getConnectionStats(): {
    totalConnections: number;
    activeTenants: string[];
  } {
    return {
      totalConnections: this.connectionPool.size,
      activeTenants: Array.from(this.connectionPool.keys())
    };
  }

  /**
   * Close all connections and cleanup
   */
  public async cleanup(): Promise<void> {
    // Clear connection pool
    this.connectionPool.clear();
    
    // Clear tenant context
    this.tenantContext = null;
    
    console.log('Database client manager cleaned up');
  }

  /**
   * Refresh authentication token
   */
  public async refreshAuth(): Promise<void> {
    try {
      const { data, error } = await this.client.auth.refreshSession();
      if (error) {
        throw error;
      }
      
      console.log('Authentication token refreshed');
    } catch (error) {
      console.error('Failed to refresh auth token:', error);
      throw error;
    }
  }

  /**
   * Get current user session
   */
  public async getCurrentSession() {
    try {
      const { data, error } = await this.client.auth.getSession();
      if (error) {
        throw error;
      }
      
      return data.session;
    } catch (error) {
      console.error('Failed to get current session:', error);
      throw error;
    }
  }

  /**
   * Sign in user
   */
  public async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  }

  /**
   * Sign out user
   */
  public async signOut(): Promise<void> {
    try {
      const { error } = await this.client.auth.signOut();
      if (error) {
        throw error;
      }
      
      // Clear tenant context on sign out
      this.clearTenantContext();
      
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  }

  /**
   * Execute a function with tenant context
   */
  public async withTenant<T>(
    tenantId: string,
    operation: (client: SupabaseClient<Database>) => Promise<T>
  ): Promise<T> {
    const originalContext = this.getTenantContext();
    
    try {
      // Set new tenant context
      const tenantClient = this.getTenantClient(tenantId);
      
      // Get user info for context
      const { data: userData } = await this.client
        .from('tenant_users')
        .select('role')
        .eq('tenant_id', tenantId)
        .eq('user_id', (await this.getCurrentSession())?.user?.id || '')
        .single();

      if (userData) {
        this.setTenantContext({
          tenantId,
          userId: (await this.getCurrentSession())?.user?.id || '',
          role: userData.role,
          permissions: [] // Will be populated by RLS functions
        });
      }

      // Execute operation
      return await operation(tenantClient);
    } finally {
      // Restore original context
      if (originalContext) {
        this.setTenantContext(originalContext);
      } else {
        this.clearTenantContext();
      }
    }
  }
}

// Export singleton instance getter
export const getDatabaseClient = (config?: DatabaseConfig) => {
  return DatabaseClientManager.getInstance(config);
};

// Export types for external use
export type { Database, TenantContext, DatabaseConfig };

// Default export for convenience
export default DatabaseClientManager;
