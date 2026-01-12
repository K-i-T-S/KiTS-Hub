import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base.repository';
import { SupabaseDatabaseClient } from '../supabase-client-fixed';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  settings: any;
  subscription_plan: string;
  business_type: string;
  size: string;
  currency: string;
  timezone: string;
  logo_url: string | null;
  industry: string | null;
  address: any;
  contact_phone: string | null;
  website: string | null;
  tax_id: string | null;
  business_registration: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTenantData {
  name: string;
  slug: string;
  settings?: any;
  subscription_plan?: string;
  business_type?: string;
  size?: string;
  currency?: string;
  timezone?: string;
  industry?: string;
  address?: any;
  contact_phone?: string;
  website?: string;
  tax_id?: string;
  business_registration?: any;
}

export interface UpdateTenantData {
  name?: string;
  settings?: any;
  subscription_plan?: string;
  business_type?: string;
  size?: string;
  currency?: string;
  timezone?: string;
  logo_url?: string;
  industry?: string;
  address?: any;
  contact_phone?: string;
  website?: string;
  tax_id?: string;
  business_registration?: any;
  is_active?: boolean;
}

/**
 * Repository for tenant management
 */
export class TenantRepository extends BaseRepository<Tenant> {
  constructor(dbClient: SupabaseDatabaseClient) {
    super(dbClient, 'tenants');
  }

  /**
   * Create a new tenant
   */
  async createTenant(data: CreateTenantData): Promise<{ data: Tenant | null; error: any }> {
    return await this.create(data);
  }

  /**
   * Find tenant by slug
   */
  async findBySlug(slug: string): Promise<{ data: Tenant | null; error: any }> {
    return await this.client
      .from(this.tableName)
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
  }

  /**
   * Get tenant with user count
   */
  async getTenantWithUserCount(tenantId: string): Promise<{ data: any; error: any }> {
    return await this.client
      .from(this.tableName)
      .select(`
        *,
        tenant_users!inner(
          count: user_id
        )
      `)
      .eq('id', tenantId)
      .eq('is_active', true)
      .single();
  }

  /**
   * Update tenant
   */
  async updateTenant(
    id: string,
    data: UpdateTenantData
  ): Promise<{ data: Tenant | null; error: any }> {
    return await this.updateById(id, {
      ...data,
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Deactivate tenant
   */
  async deactivateTenant(id: string): Promise<{ error: any }> {
    return await this.updateById(id, {
      is_active: false,
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Get active tenants
   */
  async getActiveTenants(): Promise<{ data: Tenant[] | null; error: any }> {
    return await this.findMany({ is_active: true }, {
      orderBy: [{ column: 'created_at', ascending: false }]
    });
  }

  /**
   * Get tenants by subscription plan
   */
  async getTenantsBySubscriptionPlan(
    plan: string
  ): Promise<{ data: Tenant[] | null; error: any }> {
    return await this.findMany(
      { subscription_plan: plan, is_active: true },
      {
        orderBy: [{ column: 'created_at', ascending: false }]
      }
    );
  }

  /**
   * Search tenants by name or slug
   */
  async searchTenants(query: string): Promise<{ data: Tenant[] | null; error: any }> {
    return await this.client
      .from(this.tableName)
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,slug.ilike.%${query}%`)
      .orderBy('name', { ascending: true })
      .limit(20);
  }

  /**
   * Check if slug is available
   */
  async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    let query = this.client
      .from(this.tableName)
      .select('id')
      .eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.single();
    
    if (error) {
      throw error;
    }

    return !data;
  }

  /**
   * Get tenant statistics
   */
  async getTenantStatistics(tenantId: string): Promise<{ data: any; error: any }> {
    const { data: tenant, error } = await this.findById(tenantId);
    
    if (error || !tenant) {
      return { data: null, error };
    }

    // Get user count
    const { data: userCount } = await this.client
      .from('tenant_users')
      .select('count', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .single() as any;

    // Get product count
    const { data: productCount } = await this.client
      .from('products')
      .select('count', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .single() as any;

    // Get sales count
    const { data: salesCount } = await this.client
      .from('sales')
      .select('count', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .single() as any;

    return {
      data: {
        tenant,
        statistics: {
          totalUsers: userCount?.count || 0,
          totalProducts: productCount?.count || 0,
          totalSales: salesCount?.count || 0
        }
      }
    };
  }

  /**
   * Update tenant settings
   */
  async updateTenantSettings(
    tenantId: string,
    settings: any
  ): Promise<{ data: Tenant | null; error: any }> {
    return await this.updateById(tenantId, {
      settings,
      updated_at: new Date().toISOString()
    });
  }

  /**
   * Get tenant by user ID
   */
  async getTenantByUserId(userId: string): Promise<{ data: Tenant | null; error: any }> {
    return await this.client
      .from(this.tableName)
      .select(`
        *,
        tenant_users!inner(
          user_id
        )
      `)
      .eq('tenant_users.user_id', userId)
      .eq('tenant_users.is_active', true)
      .eq('is_active', true)
      .single();
  }

  /**
   * Get all tenants for admin
   */
  async getAllTenants(options: {
    page?: number;
    limit?: number;
    search?: string;
    subscriptionPlan?: string;
  } = {}): Promise<{ data: Tenant[]; count: number; error: any }> {
    let query = this.client
      .from(this.tableName)
      .select('*', { count: 'exact' });

    // Apply filters
    if (options.subscriptionPlan) {
      query = query.eq('subscription_plan', options.subscriptionPlan);
    }

    if (options.search) {
      query = query.or(`name.ilike.%${options.search}%,slug.ilike.%${options.search}%`);
    }

    // Apply pagination
    const page = options.page || 1;
    const limit = options.limit || 50;
    const offset = (page - 1) * limit;

    query = query
      .range(offset, offset + limit - 1)
      .orderBy('created_at', { ascending: false });

    const { data, error, count } = await query;

    return {
      data: data || [],
      count: count || 0,
      error
    };
  }
}
