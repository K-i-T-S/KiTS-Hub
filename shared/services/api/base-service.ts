import { supabase, withTenantPolicy } from '../lib/supabase';
import { ApiResponse, PaginatedResponse } from '../../types';

export abstract class BaseService {
  protected tableName: string;
  protected tenantId: string | null = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  setTenant(tenantId: string): void {
    this.tenantId = tenantId;
  }

  protected getQuery() {
    if (this.tenantId) {
      return supabase
        .from(this.tableName)
        .select('*')
        .eq('tenant_id', this.tenantId);
    }
    return supabase.from(this.tableName).select('*');
  }

  protected async getAll<T = any>(
    page: number = 1,
    perPage: number = 20,
    filters?: Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    let query = this.getQuery();

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      });
    }

    const { data, count, error } = await query;
    
    if (error) {
      throw new Error(`Failed to fetch ${this.tableName}: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / perPage);
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;

    return {
      data: data || [],
      total,
      page,
      per_page: perPage,
      total_pages: totalPages,
    };
  }

  protected async getById<T = any>(id: string): Promise<T | null> {
    const { data, error } = await this.getQuery().eq('id', id).single();
    
    if (error) {
      throw new Error(`Failed to fetch ${this.tableName} by ID: ${error.message}`);
    }

    return data || null;
  }

  protected async create<T = any>(data: Partial<T>): Promise<T> {
    const createData = {
      ...data,
      ...(this.tenantId && { tenant_id: this.tenantId }),
      created_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from(this.tableName)
      .insert(createData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create ${this.tableName}: ${error.message}`);
    }

    return result;
  }

  protected async update<T = any>(
    id: string, 
    data: Partial<T>
  ): Promise<T> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { data: result, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update ${this.tableName}: ${error.message}`);
    }

    return result;
  }

  protected async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete ${this.tableName}: ${error.message}`);
    }
  }

  protected async search<T = any>(
    searchTerm: string,
    searchFields: string[] = ['name'],
    page: number = 1,
    perPage: number = 20
  ): Promise<PaginatedResponse<T>> {
    const query = this.getQuery();

    // Build OR conditions for search fields
    const searchConditions = searchFields.map(field => `${field}.ilike.%${searchTerm}%`).join(',');
    
    const { data, count, error } = await query.or(searchConditions);

    if (error) {
      throw new Error(`Failed to search ${this.tableName}: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / perPage);

    return {
      data: data || [],
      total,
      page,
      per_page: perPage,
      total_pages: totalPages,
    };
  }

  protected async count(filters?: Record<string, any>): Promise<number> {
    let query = supabase.from(this.tableName);

    // Apply tenant filter
    if (this.tenantId) {
      query = query.eq('tenant_id', this.tenantId);
    }

    // Apply additional filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      });
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to count ${this.tableName}: ${error.message}`);
    }

    return count || 0;
  }

  protected handleApiError(error: any, operation: string): never {
    const errorMessage = error?.message || `Unknown error during ${operation}`;
    console.error(`API Error [${this.tableName}]: ${operation}`, error);
    throw new Error(errorMessage);
  }

  protected createApiResponse<T>(
    data: T,
    message?: string
  ): ApiResponse<T> {
    return {
      data,
      message,
      success: true,
    };
  }

  protected createErrorResponse(error: string): ApiResponse<never> {
    return {
      data: null as never,
      error,
      success: false,
    };
  }
}
