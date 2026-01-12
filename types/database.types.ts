export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Base Database interface placeholder

// Table interfaces based on migration analysis
export interface Tenant {
  id: string
  name: string
  slug: string
  settings: Json
  subscription_plan: string
  business_type: string
  size: string
  currency: string
  timezone: string
  logo_url: string | null
  industry: string | null
  address: Json
  contact_phone: string | null
  website: string | null
  tax_id: string | null
  business_registration: Json
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  email_confirmed_at: string | null
  phone: string | null
  created_at: string
  last_sign_in_at: string | null
  raw_user_meta_data: Json
}

export interface UserProfile {
  id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  timezone: string
  language: string
  job_title: string | null
  department: string | null
  theme: string
  email_notifications: boolean
  push_notifications: boolean
  mfa_enabled: boolean
  mfa_method: string | null
  phone_verified: boolean
  onboarding_started_at: string | null
  onboarding_completed_at: string | null
  onboarding_step: number
  onboarding_skipped_steps: string[]
  last_login_at: string | null
  login_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TenantUser {
  id: string
  tenant_id: string
  user_id: string
  role: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Role {
  id: string
  name: string
  description: string | null
  is_system_role: boolean
  tenant_id: string | null
  created_at: string
  updated_at: string
}

export interface Permission {
  id: string
  name: string
  description: string | null
  resource: string
  action: string
  created_at: string
}

export interface RolePermission {
  id: string
  role_id: string
  permission_id: string
  created_at: string
}

export interface UserRole {
  id: string
  user_id: string
  tenant_id: string
  role_id: string
  assigned_by: string | null
  assigned_at: string
  expires_at: string | null
  is_active: boolean
}

export interface Product {
  id: string
  tenant_id: string
  name: string
  description: string | null
  price: number
  cost: number
  sku: string | null
  barcode: string | null
  category: string | null
  stock_quantity: number
  min_stock_level: number
  track_batches: boolean
  track_expiration: boolean
  variants: Json
  supplier: string | null
  validity_date: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  tenant_id: string
  name: string
  email: string | null
  phone: string | null
  address: Json
  city: string | null
  state: string | null
  zip_code: string | null
  country: string | null
  total_purchases: number
  visit_count: number
  last_visit: string | null
  preferred_location_id: string | null
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  tenant_id: string
  name: string
  email: string | null
  phone: string | null
  role: string | null
  commission: number
  total_sales: number
  shifts: Json
  hire_date: string | null
  location_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  tenant_id: string
  customer_id: string | null
  employee_id: string | null
  location_id: string | null
  sale_date: string
  subtotal: number
  tax_amount: number
  total_amount: number
  payment_method: string | null
  payment_status: string
  tip_info: Json
  applied_coupon_id: string | null
  applied_promotion_id: string | null
  loyalty_points_earned: number
  loyalty_points_redeemed: number
  receipt_template_id: string | null
  notes: string | null
  created_at: string
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export interface Location {
  id: string
  tenant_id: string
  name: string
  code: string
  type: string
  address: Json
  contact_info: Json
  operating_hours: Json
  timezone: string
  is_active: boolean
  is_primary: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  tenant_id: string
  name: string
  contact_person: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  country: string | null
  tax_id: string | null
  payment_terms: string | null
  lead_time_days: number
  min_order_amount: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductBatch {
  id: string
  tenant_id: string
  product_id: string
  location_id: string
  batch_number: string
  supplier_id: string | null
  quantity: number
  quantity_reserved: number
  quantity_available: number
  unit_cost: number
  manufacture_date: string | null
  expiration_date: string | null
  received_date: string
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface InventoryMovement {
  id: string
  product_id: string
  movement_type: string
  quantity: number
  batch_id: string | null
  location_id: string | null
  transfer_id: string | null
  reference_id: string | null
  notes: string | null
  created_by: string | null
  created_at: string
}

export interface Workflow {
  id: string
  tenant_id: string
  name: string
  description: string | null
  trigger_type: string
  trigger_config: Json
  actions: Json
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  last_run_at: string | null
  run_count: number
  error_count: number
}

export interface ApiKey {
  id: string
  tenant_id: string
  name: string
  key_hash: string
  key_prefix: string
  permissions: Json
  rate_limit: number
  is_active: boolean
  expires_at: string | null
  last_used_at: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Webhook {
  id: string
  tenant_id: string
  name: string
  url: string
  events: Json
  secret: string
  active: boolean
  retry_config: Json
  headers: Json
  created_by: string | null
  created_at: string
  updated_at: string
  last_triggered_at: string | null
}

export interface AuditLog {
  id: string
  user_id: string | null
  tenant_id: string | null
  session_id: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  old_values: Json | null
  new_values: Json | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface UserSession {
  id: string
  user_id: string
  tenant_id: string
  session_token: string
  device_info: Json
  ip_address: string | null
  user_agent: string | null
  is_active: boolean
  last_activity_at: string
  expires_at: string
  created_at: string
}

// Export all table types
export type Tables = {
  tenants: Tenant
  users: User
  user_profiles: UserProfile
  tenant_users: TenantUser
  roles: Role
  permissions: Permission
  role_permissions: RolePermission
  user_roles: UserRole
  products: Product
  customers: Customer
  employees: Employee
  sales: Sale
  sale_items: SaleItem
  locations: Location
  suppliers: Supplier
  product_batches: ProductBatch
  inventory_movements: InventoryMovement
  workflows: Workflow
  api_keys: ApiKey
  webhooks: Webhook
  audit_logs: AuditLog
  user_sessions: UserSession
}

// Export table insert types
export type TablesInsert<T extends keyof Tables> = Omit<Tables[T], 'id' | 'created_at' | 'updated_at'>

// Export table update types
export type TablesUpdate<T extends keyof Tables> = Partial<Omit<Tables[T], 'id' | 'created_at' | 'updated_at'>>

// Export table row types
export type TablesRow<T extends keyof Tables> = Tables[T]

// Export database functions
export interface DatabaseFunctions {
  current_tenant_id: () => string | null
  current_user_role: () => string | null
  user_has_permission: (params: { permission_name: string }) => boolean
  user_has_role: (params: { required_role: string }) => boolean
  get_user_permissions: () => Permission[]
  get_current_tenant_context: () => {
    tenant_id: string
    user_role: string
    permissions: Json
    is_active: boolean
  }[]
  can_access_resource: (params: { resource_name: string; action_name: string }) => boolean
  execute_workflow: (params: { workflow_uuid: string; trigger_data?: Json }) => string
  get_scheduled_workflows: () => { workflow_id: string; schedule_id: string }[]
  log_user_action: (params: {
    action_text: string
    resource_type?: string
    resource_id?: string
    old_values?: Json
    new_values?: Json
  }) => void
  create_user_session: (params: { tenant_uuid: string; device_info?: Json }) => string
  invalidate_user_session: (params: { session_uuid: string }) => boolean
  invalidate_all_user_sessions: () => number
  cleanup_expired_sessions: () => number
  get_user_onboarding_progress: (params: { user_uuid: string }) => {
    step_key: string
    step_name: string
    status: string
    completed_at: string | null
    step_order: number
  }[]
  calculate_onboarding_completion: (params: { user_uuid: string }) => number
  generate_api_key: (params: {
    tenant_uuid: string
    key_name: string
    permissions_param?: Json
    rate_limit_param?: number
    expires_at_param?: string | null
  }) => string
  validate_api_key: (params: { api_key: string }) => {
    tenant_id: string
    user_id: string
    permissions: Json
  } | null
  trigger_webhook: (params: {
    webhook_uuid: string
    event_type: string
    payload: Json
  }) => boolean
  retry_webhook_delivery: (params: { delivery_uuid: string }) => boolean
  create_inventory_transfer: (params: {
    from_location: string
    to_location: string
    product_uuid: string
    variant_uuid: string
    transfer_quantity: number
    notes_param?: string | null
  }) => string
  complete_inventory_transfer: (params: { transfer_uuid: string }) => boolean
  get_location_inventory: (params: { location_uuid: string }) => {
    product_id: string
    product_name: string
    quantity_on_hand: number
    quantity_reserved: number
    quantity_available: number
  }[]
  get_low_stock_products: (params: { location_uuid?: string | null }) => {
    product_id: string
    product_name: string
    current_stock: number
    min_stock_level: number
    location_name: string
  }[]
  check_reorder_points: () => {
    product_id: string
    location_id: string
    current_quantity: number
    reorder_level: number
    supplier_name: string
  }[]
  get_expiring_products: (params: { days_ahead?: number }) => {
    product_id: string
    product_name: string
    batch_number: string
    quantity: number
    expiration_date: string
    days_until_expiration: number
  }[]
  calculate_customer_segment: (params: { customer_uuid: string }) => string
  update_customer_loyalty_points: (params: {
    customer_uuid: string
    points_change: number
    transaction_type: string
    reference_id?: string | null
  }) => boolean
  get_customer_loyalty_balance: (params: { customer_uuid: string }) => {
    points_balance: number
    tier_name: string | null
    total_points_earned: number
    lifetime_value: number
  }
}

// Export database enums
export interface DatabaseEnums {
  tenant_subscription_plan: 'free' | 'basic' | 'premium' | 'enterprise'
  tenant_business_type: 'retail' | 'restaurant' | 'service' | 'manufacturing' | 'wholesale' | 'other'
  tenant_size: 'solo' | 'small' | 'medium' | 'large' | 'enterprise'
  user_profile_theme: 'light' | 'dark' | 'system'
  user_profile_mfa_method: 'totp' | 'sms' | 'email'
  tenant_user_role: 'owner' | 'admin' | 'manager' | 'cashier' | 'viewer' | 'inventory_manager' | 'report_analyst' | 'api_user'
  permission_resource: 'products' | 'sales' | 'customers' | 'employees' | 'inventory' | 'reports' | 'settings' | 'workflows' | 'locations' | 'api'
  permission_action: 'create' | 'read' | 'update' | 'delete' | 'execute' | 'manage'
  product_movement_type: 'sale' | 'purchase' | 'transfer' | 'adjustment' | 'return' | 'damage' | 'expiration'
  location_type: 'store' | 'warehouse' | 'office' | 'pop-up' | 'online'
  sale_payment_method: 'cash' | 'card' | 'digital' | 'check' | 'credit'
  sale_payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partial'
  workflow_trigger_type: 'event' | 'schedule' | 'manual' | 'condition'
  workflow_status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  workflow_schedule_type: 'cron' | 'interval' | 'once'
  webhook_status: 'pending' | 'delivered' | 'failed' | 'retrying'
  api_usage_status: 'success' | 'error' | 'timeout'
  audit_action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'access_denied'
}

// Export complete Database type with proper structure
export type Database = {
  public: {
    Tables: Tables
    Views: Record<string, never>
    Functions: DatabaseFunctions
    Enums: DatabaseEnums
    CompositeTypes: Record<string, never>
  }
}
