// KiTS Hub API Router
// RESTful API endpoints with validation and authentication

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  createUserSchema,
  updateUserSchema,
  createProductSchema,
  updateProductSchema,
  createSaleSchema,
  createCustomerSchema,
  createSupplierSchema,
  createCategorySchema,
  createLocationSchema,
  createStockMovementSchema,
  createTenantSchema,
  validatePagination,
  validateDateRange
} from './validation-schemas.ts'

interface ApiResponse {
  success: boolean
  data?: any
  error?: string
  errors?: string[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface AuthenticatedRequest {
  user: any
  userData: any
  tenantId: string
}

export class ApiRouter {
  private supabase: any
  private supabaseUrl: string
  private supabaseServiceKey: string

  constructor() {
    this.supabaseUrl = Deno.env.get('SUPABASE_URL')!
    this.supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    this.supabase = createClient(this.supabaseUrl, this.supabaseServiceKey)
  }

  // Authentication middleware
  private async authenticateRequest(req: Request): Promise<AuthenticatedRequest | null> {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return null
    }

    const { data: { user }, error } = await this.supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (error || !user) {
      return null
    }

    const { data: userData } = await this.supabase
      .from('users')
      .select('tenant_id, role, permissions')
      .eq('id', user.id)
      .single()

    if (!userData) {
      return null
    }

    return {
      user,
      userData,
      tenantId: userData.tenant_id
    }
  }

  // Permission checking
  private hasPermission(auth: AuthenticatedRequest, permission: string): boolean {
    if (auth.userData.role === 'admin') return true
    if (auth.userData.permissions?.includes('*')) return true
    if (auth.userData.permissions?.includes(permission)) return true
    
    const rolePermissions: Record<string, string[]> = {
      'manager': ['users.view', 'inventory.view', 'sales.view', 'reports.view'],
      'inventory_manager': ['inventory.*', 'products.*', 'suppliers.*'],
      'sales_staff': ['sales.*', 'customers.*', 'payments.*'],
      'hr_manager': ['employees.*', 'attendance.*', 'payroll.*'],
      'accountant': ['transactions.*', 'invoices.*', 'accounts.*']
    }
    
    const userRolePermissions = rolePermissions[auth.userData.role] || []
    
    // Check for wildcard permissions (e.g., 'inventory.*')
    for (const rolePermission of userRolePermissions) {
      if (rolePermission.endsWith('.*')) {
        const prefix = rolePermission.slice(0, -1)
        if (permission.startsWith(prefix)) {
          return true
        }
      } else if (rolePermission === permission) {
        return true
      }
    }
    
    return false
  }

  // Error response helper
  private errorResponse(message: string, status: number = 400, errors?: string[]): Response {
    return new Response(
      JSON.stringify({ success: false, error: message, errors }),
      { 
        status, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
        } 
      }
    )
  }

  // Success response helper
  private successResponse(data: any, pagination?: any): Response {
    return new Response(
      JSON.stringify({ success: true, data, pagination }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
        }
      }
    )
  }

  // Handle CORS preflight
  private handleCORS(): Response {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE'
      }
    })
  }

  // Main router
  async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url)
    const method = req.method
    const path = url.pathname

    // Handle CORS
    if (method === 'OPTIONS') {
      return this.handleCORS()
    }

    try {
      // Parse request body for POST/PUT requests
      let body = null
      if (method === 'POST' || method === 'PUT') {
        body = await req.json()
      }

      // Route handling
      if (path.startsWith('/api/v1/users')) {
        return await this.handleUsers(req, method, path, body)
      } else if (path.startsWith('/api/v1/products')) {
        return await this.handleProducts(req, method, path, body)
      } else if (path.startsWith('/api/v1/sales')) {
        return await this.handleSales(req, method, path, body)
      } else if (path.startsWith('/api/v1/customers')) {
        return await this.handleCustomers(req, method, path, body)
      } else if (path.startsWith('/api/v1/suppliers')) {
        return await this.handleSuppliers(req, method, path, body)
      } else if (path.startsWith('/api/v1/categories')) {
        return await this.handleCategories(req, method, path, body)
      } else if (path.startsWith('/api/v1/locations')) {
        return await this.handleLocations(req, method, path, body)
      } else if (path.startsWith('/api/v1/inventory')) {
        return await this.handleInventory(req, method, path, body)
      } else if (path.startsWith('/api/v1/reports')) {
        return await this.handleReports(req, method, path, body)
      } else if (path.startsWith('/api/v1/tenants')) {
        return await this.handleTenants(req, method, path, body)
      } else {
        return this.errorResponse('Endpoint not found', 404)
      }
    } catch (error) {
      console.error('API Error:', error)
      return this.errorResponse('Internal server error', 500)
    }
  }

  // Users endpoints
  private async handleUsers(req: Request, method: string, path: string, body: any): Promise<Response> {
    const auth = await this.authenticateRequest(req)
    if (!auth) {
      return this.errorResponse('Unauthorized', 401)
    }

    // Set tenant context
    await this.supabase.rpc('set_tenant_context', { p_tenant_id: auth.tenantId })

    if (method === 'GET') {
      if (!this.hasPermission(auth, 'users.view')) {
        return this.errorResponse('Insufficient permissions', 403)
      }

      const url = new URL(req.url)
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const search = url.searchParams.get('search')

      let query = this.supabase
        .from('users')
        .select('*')
        .eq('tenant_id', auth.tenantId)

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
      }

      const { data, error } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false })

      if (error) {
        return this.errorResponse(error.message, 500)
      }

      return this.successResponse(data)
    } else if (method === 'POST') {
      if (!this.hasPermission(auth, 'users.create')) {
        return this.errorResponse('Insufficient permissions', 403)
      }

      const validation = createUserSchema.validate(body)
      if (!validation.isValid) {
        return this.errorResponse('Validation failed', 400, validation.errors)
      }

      const { data, error } = await this.supabase
        .from('users')
        .insert({
          ...body,
          tenant_id: auth.tenantId
        })
        .select()
        .single()

      if (error) {
        return this.errorResponse(error.message, 500)
      }

      return this.successResponse(data, null, 201)
    } else if (method === 'PUT') {
      const userId = path.split('/').pop()
      if (!userId) {
        return this.errorResponse('User ID required', 400)
      }

      if (!this.hasPermission(auth, 'users.update')) {
        return this.errorResponse('Insufficient permissions', 403)
      }

      const validation = updateUserSchema.validate(body)
      if (!validation.isValid) {
        return this.errorResponse('Validation failed', 400, validation.errors)
      }

      const { data, error } = await this.supabase
        .from('users')
        .update(body)
        .eq('id', userId)
        .eq('tenant_id', auth.tenantId)
        .select()
        .single()

      if (error) {
        return this.errorResponse(error.message, 500)
      }

      return this.successResponse(data)
    } else if (method === 'DELETE') {
      const userId = path.split('/').pop()
      if (!userId) {
        return this.errorResponse('User ID required', 400)
      }

      if (!this.hasPermission(auth, 'users.delete')) {
        return this.errorResponse('Insufficient permissions', 403)
      }

      const { error } = await this.supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userId)
        .eq('tenant_id', auth.tenantId)

      if (error) {
        return this.errorResponse(error.message, 500)
      }

      return this.successResponse({ message: 'User deactivated successfully' })
    }

    return this.errorResponse('Method not allowed', 405)
  }

  // Products endpoints
  private async handleProducts(req: Request, method: string, path: string, body: any): Promise<Response> {
    const auth = await this.authenticateRequest(req)
    if (!auth) {
      return this.errorResponse('Unauthorized', 401)
    }

    await this.supabase.rpc('set_tenant_context', { p_tenant_id: auth.tenantId })

    if (method === 'GET') {
      if (!this.hasPermission(auth, 'products.view')) {
        return this.errorResponse('Insufficient permissions', 403)
      }

      const url = new URL(req.url)
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const search = url.searchParams.get('search')
      const categoryId = url.searchParams.get('category_id')
      const lowStock = url.searchParams.get('low_stock')

      let query = this.supabase
        .from('products')
        .select(`
          *,
          category:categories(name),
          supplier:suppliers(name)
        `)
        .eq('tenant_id', auth.tenantId)

      if (search) {
        query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`)
      }

      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      if (lowStock === 'true') {
        query = query.eq('low_stock', true)
      }

      const { data, error } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false })

      if (error) {
        return this.errorResponse(error.message, 500)
      }

      return this.successResponse(data)
    } else if (method === 'POST') {
      if (!this.hasPermission(auth, 'products.create')) {
        return this.errorResponse('Insufficient permissions', 403)
      }

      const validation = createProductSchema.validate(body)
      if (!validation.isValid) {
        return this.errorResponse('Validation failed', 400, validation.errors)
      }

      const { data, error } = await this.supabase
        .from('products')
        .insert({
          ...body,
          tenant_id: auth.tenantId
        })
        .select()
        .single()

      if (error) {
        return this.errorResponse(error.message, 500)
      }

      return this.successResponse(data, null, 201)
    } else if (method === 'PUT') {
      const productId = path.split('/').pop()
      if (!productId) {
        return this.errorResponse('Product ID required', 400)
      }

      if (!this.hasPermission(auth, 'products.update')) {
        return this.errorResponse('Insufficient permissions', 403)
      }

      const validation = updateProductSchema.validate(body)
      if (!validation.isValid) {
        return this.errorResponse('Validation failed', 400, validation.errors)
      }

      const { data, error } = await this.supabase
        .from('products')
        .update(body)
        .eq('id', productId)
        .eq('tenant_id', auth.tenantId)
        .select()
        .single()

      if (error) {
        return this.errorResponse(error.message, 500)
      }

      return this.successResponse(data)
    }

    return this.errorResponse('Method not allowed', 405)
  }

  // Sales endpoints
  private async handleSales(req: Request, method: string, path: string, body: any): Promise<Response> {
    const auth = await this.authenticateRequest(req)
    if (!auth) {
      return this.errorResponse('Unauthorized', 401)
    }

    await this.supabase.rpc('set_tenant_context', { p_tenant_id: auth.tenantId })

    if (method === 'GET') {
      if (!this.hasPermission(auth, 'sales.view')) {
        return this.errorResponse('Insufficient permissions', 403)
      }

      const url = new URL(req.url)
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const startDate = url.searchParams.get('start_date')
      const endDate = url.searchParams.get('end_date')
      const customerId = url.searchParams.get('customer_id')
      const status = url.searchParams.get('status')

      let query = this.supabase
        .from('sales')
        .select(`
          *,
          customer:customers(first_name, last_name, company),
          location:locations(name),
          user:users(first_name, last_name)
        `)
        .eq('tenant_id', auth.tenantId)

      if (startDate) {
        query = query.gte('created_at', startDate)
      }
      if (endDate) {
        query = query.lte('created_at', endDate)
      }
      if (customerId) {
        query = query.eq('customer_id', customerId)
      }
      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false })

      if (error) {
        return this.errorResponse(error.message, 500)
      }

      return this.successResponse(data)
    } else if (method === 'POST') {
      if (!this.hasPermission(auth, 'sales.create')) {
        return this.errorResponse('Insufficient permissions', 403)
      }

      const validation = createSaleSchema.validate(body)
      if (!validation.isValid) {
        return this.errorResponse('Validation failed', 400, validation.errors)
      }

      // Call the sales processor edge function
      const { data, error } = await this.supabase.functions.invoke('sales-processor', {
        body: {
          action: 'create-sale',
          data: {
            ...body,
            userId: auth.user.id
          }
        }
      })

      if (error) {
        return this.errorResponse(error.message, 500)
      }

      return this.successResponse(data, null, 201)
    }

    return this.errorResponse('Method not allowed', 405)
  }

  // Customers endpoints
  private async handleCustomers(req: Request, method: string, path: string, body: any): Promise<Response> {
    const auth = await this.authenticateRequest(req)
    if (!auth) {
      return this.errorResponse('Unauthorized', 401)
    }

    await this.supabase.rpc('set_tenant_context', { p_tenant_id: auth.tenantId })

    if (method === 'GET') {
      if (!this.hasPermission(auth, 'customers.view')) {
        return this.errorResponse('Insufficient permissions', 403)
      }

      const url = new URL(req.url)
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const search = url.searchParams.get('search')

      let query = this.supabase
        .from('customers')
        .select('*')
        .eq('tenant_id', auth.tenantId)

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,company.ilike.%${search}%,email.ilike.%${search}%`)
      }

      const { data, error } = await query
        .range((page - 1) * limit, page * limit - 1)
        .order('created_at', { ascending: false })

      if (error) {
        return this.errorResponse(error.message, 500)
      }

      return this.successResponse(data)
    } else if (method === 'POST') {
      if (!this.hasPermission(auth, 'customers.create')) {
        return this.errorResponse('Insufficient permissions', 403)
      }

      const validation = createCustomerSchema.validate(body)
      if (!validation.isValid) {
        return this.errorResponse('Validation failed', 400, validation.errors)
      }

      const { data, error } = await this.supabase
        .from('customers')
        .insert({
          ...body,
          tenant_id: auth.tenantId
        })
        .select()
        .single()

      if (error) {
        return this.errorResponse(error.message, 500)
      }

      return this.successResponse(data, null, 201)
    }

    return this.errorResponse('Method not allowed', 405)
  }

  // Suppliers endpoints
  private async handleSuppliers(req: Request, method: string, path: string, body: any): Promise<Response> {
    const auth = await this.authenticateRequest(req)
    if (!auth) {
      return this.errorResponse('Unauthorized', 401)
    }

    await this.supabase.rpc('set_tenant_context', { p_tenant_id: auth.tenantId })

    if (method === 'GET') {
      if (!this.hasPermission(auth, 'suppliers.view')) {
        return this.errorResponse('Insufficient permissions', 403)
      }

      const { data, error } = await this.supabase
        .from('suppliers')
        .select('*')
        .eq('tenant_id', auth.tenantId)
        .order('name')

      if (error) {
        return this.errorResponse(error.message, 500)
      }

      return this.successResponse(data)
    } else if (method === 'POST') {
      if (!this.hasPermission(auth, 'suppliers.create')) {
        return this.errorResponse('Insufficient permissions', 403)
      }

      const validation = createSupplierSchema.validate(body)
      if (!validation.isValid) {
        return this.errorResponse('Validation failed', 400, validation.errors)
      }

      const { data, error } = await this.supabase
        .from('suppliers')
        .insert({
          ...body,
          tenant_id: auth.tenantId
        })
        .select()
        .single()

      if (error) {
        return this.errorResponse(error.message, 500)
      }

      return this.successResponse(data, null, 201)
    }

    return this.errorResponse('Method not allowed', 405)
  }

  // Categories endpoints
  private async handleCategories(req: Request, method: string, path: string, body: any): Promise<Response> {
    const auth = await this.authenticateRequest(req)
    if (!auth) {
      return this.errorResponse('Unauthorized', 401)
    }

    await this.supabase.rpc('set_tenant_context', { p_tenant_id: auth.tenantId })

    if (method === 'GET') {
      if (!this.hasPermission(auth, 'categories.view')) {
        return this.errorResponse('Insufficient permissions', 403)
      }

      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('tenant_id', auth.tenantId)
        .order('sort_order')

      if (error) {
        return this.errorResponse(error.message, 500)
      }

      return this.successResponse(data)
    } else if (method === 'POST') {
      if (!this.hasPermission(auth, 'categories.create')) {
        return this.errorResponse('Insufficient permissions', 403)
      }

      const validation = createCategorySchema.validate(body)
      if (!validation.isValid) {
        return this.errorResponse('Validation failed', 400, validation.errors)
      }

      const { data, error } = await this.supabase
        .from('categories')
        .insert({
          ...body,
          tenant_id: auth.tenantId
        })
        .select()
        .single()

      if (error) {
        return this.errorResponse(error.message, 500)
      }

      return this.successResponse(data, null, 201)
    }

    return this.errorResponse('Method not allowed', 405)
  }

  // Locations endpoints
  private async handleLocations(req: Request, method: string, path: string, body: any): Promise<Response> {
    const auth = await this.authenticateRequest(req)
    if (!auth) {
      return this.errorResponse('Unauthorized', 401)
    }

    await this.supabase.rpc('set_tenant_context', { p_tenant_id: auth.tenantId })

    if (method === 'GET') {
      if (!this.hasPermission(auth, 'locations.view')) {
        return this.errorResponse('Insufficient permissions', 403)
      }

      const { data, error } = await this.supabase
        .from('locations')
        .select('*')
        .eq('tenant_id', auth.tenantId)
        .order('name')

      if (error) {
        return this.errorResponse(error.message, 500)
      }

      return this.successResponse(data)
    } else if (method === 'POST') {
      if (!this.hasPermission(auth, 'locations.create')) {
        return this.errorResponse('Insufficient permissions', 403)
      }

      const validation = createLocationSchema.validate(body)
      if (!validation.isValid) {
        return this.errorResponse('Validation failed', 400, validation.errors)
      }

      const { data, error } = await this.supabase
        .from('locations')
        .insert({
          ...body,
          tenant_id: auth.tenantId
        })
        .select()
        .single()

      if (error) {
        return this.errorResponse(error.message, 500)
      }

      return this.successResponse(data, null, 201)
    }

    return this.errorResponse('Method not allowed', 405)
  }

  // Inventory endpoints
  private async handleInventory(req: Request, method: string, path: string, body: any): Promise<Response> {
    const auth = await this.authenticateRequest(req)
    if (!auth) {
      return this.errorResponse('Unauthorized', 401)
    }

    await this.supabase.rpc('set_tenant_context', { p_tenant_id: auth.tenantId })

    if (method === 'GET') {
      if (!this.hasPermission(auth, 'inventory.view')) {
        return this.errorResponse('Insufficient permissions', 403)
      }

      const url = new URL(req.url)
      const action = url.searchParams.get('action')

      if (action === 'stats') {
        const { data, error } = await this.supabase.rpc('get_inventory_stats', {
          p_tenant_id: auth.tenantId
        })

        if (error) {
          return this.errorResponse(error.message, 500)
        }

        return this.successResponse(data)
      } else if (action === 'low-stock') {
        const { data, error } = await this.supabase
          .from('products')
          .select('*')
          .eq('tenant_id', auth.tenantId)
          .eq('low_stock', true)

        if (error) {
          return this.errorResponse(error.message, 500)
        }

        return this.successResponse(data)
      } else {
        // Get stock movements
        const { data, error } = await this.supabase
          .from('stock_movements')
          .select(`
            *,
            product:products(name, sku),
            location:locations(name)
          `)
          .eq('tenant_id', auth.tenantId)
          .order('created_at', { ascending: false })
          .limit(100)

        if (error) {
          return this.errorResponse(error.message, 500)
        }

        return this.successResponse(data)
      }
    } else if (method === 'POST') {
      if (!this.hasPermission(auth, 'inventory.manage')) {
        return this.errorResponse('Insufficient permissions', 403)
      }

      const validation = createStockMovementSchema.validate(body)
      if (!validation.isValid) {
        return this.errorResponse('Validation failed', 400, validation.errors)
      }

      // Call inventory manager edge function
      const { data, error } = await this.supabase.functions.invoke('inventory-manager', {
        body: {
          action: body.action || 'adjust-stock',
          data: {
            ...body,
            userId: auth.user.id
          }
        }
      })

      if (error) {
        return this.errorResponse(error.message, 500)
      }

      return this.successResponse(data, null, 201)
    }

    return this.errorResponse('Method not allowed', 405)
  }

  // Reports endpoints
  private async handleReports(req: Request, method: string, path: string, body: any): Promise<Response> {
    const auth = await this.authenticateRequest(req)
    if (!auth) {
      return this.errorResponse('Unauthorized', 401)
    }

    await this.supabase.rpc('set_tenant_context', { p_tenant_id: auth.tenantId })

    if (method === 'GET') {
      if (!this.hasPermission(auth, 'reports.view')) {
        return this.errorResponse('Insufficient permissions', 403)
      }

      const url = new URL(req.url)
      const reportType = url.searchParams.get('type')
      const startDate = url.searchParams.get('start_date')
      const endDate = url.searchParams.get('end_date')

      if (reportType === 'sales') {
        const { data, error } = await this.supabase.functions.invoke('sales-processor', {
          body: {
            action: 'get-sales-report',
            data: { startDate, endDate }
          }
        })

        if (error) {
          return this.errorResponse(error.message, 500)
        }

        return this.successResponse(data)
      } else if (reportType === 'inventory') {
        const { data, error } = await this.supabase.rpc('get_inventory_stats', {
          p_tenant_id: auth.tenantId
        })

        if (error) {
          return this.errorResponse(error.message, 500)
        }

        return this.successResponse(data)
      } else {
        return this.errorResponse('Invalid report type', 400)
      }
    }

    return this.errorResponse('Method not allowed', 405)
  }

  // Tenants endpoints (admin only)
  private async handleTenants(req: Request, method: string, path: string, body: any): Promise<Response> {
    const auth = await this.authenticateRequest(req)
    if (!auth) {
      return this.errorResponse('Unauthorized', 401)
    }

    // Only system admins can manage tenants
    if (auth.userData.role !== 'admin' || auth.tenantId !== '00000000-0000-0000-0000-000000000000') {
      return this.errorResponse('Insufficient permissions', 403)
    }

    if (method === 'GET') {
      const { data, error } = await this.supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return this.errorResponse(error.message, 500)
      }

      return this.successResponse(data)
    } else if (method === 'POST') {
      const validation = createTenantSchema.validate(body)
      if (!validation.isValid) {
        return this.errorResponse('Validation failed', 400, validation.errors)
      }

      const { data, error } = await this.supabase
        .from('tenants')
        .insert(body)
        .select()
        .single()

      if (error) {
        return this.errorResponse(error.message, 500)
      }

      return this.successResponse(data, null, 201)
    }

    return this.errorResponse('Method not allowed', 405)
  }
}
