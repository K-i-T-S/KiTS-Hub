import { getDatabaseClient } from '../supabase-client';
import { Database, TenantContext } from '../types/database.types';

/**
 * Base repository class providing common CRUD operations
 * with tenant isolation and error handling
 */
export abstract class BaseRepository<T extends Database['public']['Tables'][keyof Database['public']['Tables']]> {
  protected db = getDatabaseClient();
  protected tableName: string;
  protected tenantId?: string;

  constructor(tableName: string, tenantId?: string) {
    this.tableName = tableName;
    this.tenantId = tenantId;
  }

  /**
   * Get a tenant-specific client instance
   */
  protected getClient() {
    if (this.tenantId) {
      return this.db.getTenantClient(this.tenantId);
    }
    return this.db.getClient();
  }

  /**
   * Find a single record by ID
   */
  async findById(id: string): Promise<T | null> {
    const client = this.getClient();
    const { data, error } = await client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to find ${this.tableName} by ID: ${error.message}`);
    }

    return data;
  }

  /**
   * Find a single record by a specific column
   */
  async findBy(column: keyof T, value: T[keyof T]): Promise<T | null> {
    const client = this.getClient();
    const { data, error } = await client
      .from(this.tableName)
      .select('*')
      .eq(column, value)
      .single();

    if (error) {
      throw new Error(`Failed to find ${this.tableName} by ${String(column)}: ${error.message}`);
    }

    return data;
  }

  /**
   * Find multiple records with optional filtering
   */
  async findMany(options: {
    column?: keyof T;
    value?: T[keyof T];
    filters?: Partial<T>;
    orderBy?: keyof T;
    ascending?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<T[]> {
    const client = this.getClient();
    let query = client.from(this.tableName).select('*');

    // Apply column filter
    if (options.column && options.value) {
      query = query.eq(options.column, options.value);
    }

    // Apply additional filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.eq(key as string, value);
        }
      });
    }

    // Apply ordering
    if (options.orderBy) {
      query = query.order(options.orderBy as string, { ascending: options.ascending ?? true });
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 1000));
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to find ${this.tableName}: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<T> {
    const client = this.getClient();
    const { data: result, error } = await client
      .from(this.tableName)
      .insert(data as T)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create ${this.tableName}: ${error.message}`);
    }

    return result;
  }

  /**
   * Create multiple records
   */
  async createMany(data: Partial<T>[]): Promise<T[]> {
    const client = this.getClient();
    const { data: result, error } = await client
      .from(this.tableName)
      .insert(data as T[])
      .select();

    if (error) {
      throw new Error(`Failed to create multiple ${this.tableName}: ${error.message}`);
    }

    return result || [];
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    const client = this.getClient();
    const { data: result, error } = await client
      .from(this.tableName)
      .update(data as T)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update ${this.tableName}: ${error.message}`);
    }

    return result;
  }

  /**
   * Update multiple records
   */
  async updateMany(filters: Partial<T>, data: Partial<T>): Promise<T[]> {
    const client = this.getClient();
    let query = client.from(this.tableName).update(data as T);

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key as string, value);
      }
    });

    const { data: result, error } = await query.select();

    if (error) {
      throw new Error(`Failed to update multiple ${this.tableName}: ${error.message}`);
    }

    return result || [];
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<void> {
    const client = this.getClient();
    const { error } = await client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete ${this.tableName}: ${error.message}`);
    }
  }

  /**
   * Delete multiple records
   */
  async deleteMany(filters: Partial<T>): Promise<void> {
    const client = this.getClient();
    let query = client.from(this.tableName).delete();

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key as string, value);
      }
    });

    const { error } = await query;

    if (error) {
      throw new Error(`Failed to delete multiple ${this.tableName}: ${error.message}`);
    }
  }

  /**
   * Count records with optional filters
   */
  async count(filters?: Partial<T>): Promise<number> {
    const client = this.getClient();
    let query = client.from(this.tableName, { count: 'exact' });

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.eq(key as string, value);
        }
      });
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to count ${this.tableName}: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Check if a record exists
   */
  async exists(column: keyof T, value: T[keyof T]): Promise<boolean> {
    const result = await this.findBy(column, value);
    return result !== null;
  }

  /**
   * Execute a custom query
   */
  async customQuery<R>(
    queryBuilder: (client: any) => any
  ): Promise<R[]> {
    const client = this.getClient();
    const { data, error } = await queryBuilder(client);

    if (error) {
      throw new Error(`Failed to execute custom query on ${this.tableName}: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Execute a transaction with multiple operations
   */
  async transaction<R>(
    operations: Array<(client: any) => Promise<R>>
  ): Promise<R[]> {
    const client = this.getClient();
    return client.executeTransaction(operations);
  }
}
