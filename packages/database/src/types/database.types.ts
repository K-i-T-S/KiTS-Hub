export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Multi-Tenant Foundation Tables
export interface Tenant {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
  settings: Json
  subscription_plan: string
  is_active: boolean
  logo_url: string | null
  industry: string | null
  business_type: 'retail' | 'restaurant' | 'service' | 'manufacturing' | 'wholesale' | 'other' | null
  size: 'solo' | 'small' | 'medium' | 'large' | 'enterprise' | null
  timezone: string
  currency: string
  address: Json
  contact_phone: string | null
  website: string | null
  tax_id: string | null
  business_registration: Json
}

export interface TenantUser {
  id: string
  tenant_id: string
  user_id: string
  role: 'owner' | 'manager' | 'cashier' | 'viewer'
  created_at: string
  updated_at: string
  is_active: boolean
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
  theme: 'light' | 'dark' | 'system'
  email_notifications: boolean
  push_notifications: boolean
  mfa_enabled: boolean
  mfa_method: 'totp' | 'sms' | 'email' | null
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

// Role-Based Access Control
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

// Inventory Management
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
  is_active: boolean
  created_at: string
  updated_at: string
  track_batches: boolean
  track_expiration: boolean
  default_location_id: string | null
  variants: Json
  supplier: string | null
  validity_date: string | null
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
  country: string
  tax_id: string | null
  payment_terms: string
  lead_time_days: number
  min_order_amount: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Location {
  id: string
  tenant_id: string
  name: string
  code: string
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

export interface PurchaseOrder {
  id: string
  tenant_id: string
  supplier_id: string
  location_id: string | null
  order_number: string
  status: 'draft' | 'sent' | 'confirmed' | 'partial' | 'received' | 'cancelled'
  order_date: string
  expected_date: string | null
  received_date: string | null
  subtotal: number
  tax_amount: number
  total_amount: number
  payment_terms: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface PurchaseOrderItem {
  id: string
  purchase_order_id: string
  product_id: string
  quantity_ordered: number
  quantity_received: number
  unit_cost: number
  total_cost: number
  batch_number: string | null
  manufacture_date: string | null
  expiration_date: string | null
  notes: string | null
  created_at: string
}

export interface StockTransfer {
  id: string
  tenant_id: string
  transfer_number: string
  from_location_id: string
  to_location_id: string
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled'
  transfer_date: string
  completed_date: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface StockTransferItem {
  id: string
  stock_transfer_id: string
  product_id: string
  batch_id: string | null
  quantity: number
  notes: string | null
  created_at: string
}

export interface ReorderPoint {
  id: string
  tenant_id: string
  product_id: string
  location_id: string
  min_stock_level: number
  max_stock_level: number
  reorder_point: number
  reorder_quantity: number
  lead_time_days: number
  safety_stock: number
  is_active: boolean
  last_calculated: string
  created_at: string
  updated_at: string
}

export interface InventoryMovement {
  id: string
  product_id: string
  movement_type: 'sale' | 'purchase' | 'adjustment' | 'return'
  quantity: number
  reference_id: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  tenant_id: string | null
  batch_id: string | null
  location_id: string | null
  transfer_id: string | null
}

// Point of Sale
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
  notes: string | null
  created_at: string
  tip_info: Json
  applied_coupon_id: string | null
  applied_promotion_id: string | null
  loyalty_points_earned: number
  loyalty_points_redeemed: number
  receipt_template_id: string | null
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

export interface SplitPayment {
  id: string
  sale_id: string
  payment_method: 'cash' | 'card' | 'digital'
  amount: number
  status: 'pending' | 'completed' | 'failed'
  transaction_id: string | null
  created_at: string
  updated_at: string
}

export interface Tip {
  id: string
  sale_id: string
  amount: number
  tip_type: 'percentage' | 'fixed' | 'custom'
  percentage: number | null
  employee_id: string | null
  created_at: string
}

export interface DiscountCoupon {
  id: string
  code: string
  name: string
  description: string | null
  type: 'percentage' | 'fixed' | 'bogo' | 'buy_x_get_y'
  value: number
  min_purchase_amount: number | null
  max_discount_amount: number | null
  usage_limit: number | null
  used_count: number
  start_date: string
  end_date: string
  is_active: boolean
  tenant_id: string
  created_at: string
  updated_at: string
}

export interface Promotion {
  id: string
  name: string
  description: string | null
  type: 'percentage' | 'fixed' | 'bundle' | 'free_shipping'
  value: number
  min_quantity: number | null
  min_amount: number | null
  start_date: string
  end_date: string
  is_active: boolean
  tenant_id: string
  created_at: string
  updated_at: string
}

export interface LoyaltyProgram {
  id: string
  name: string
  description: string | null
  points_per_dollar: number
  redemption_rate: number
  is_active: boolean
  tenant_id: string
  created_at: string
  updated_at: string
}

export interface CustomerLoyalty {
  id: string
  customer_id: string
  program_id: string
  current_points: number
  tier_id: string
  total_earned: number
  total_redeemed: number
  join_date: string
  last_activity_at: string
  created_at: string
  updated_at: string
}

export interface LoyaltyTransaction {
  id: string
  membership_id: string
  transaction_type: 'earned' | 'redeemed' | 'expired' | 'adjusted'
  points: number
  description: string | null
  reference_id: string | null
  reference_type: string | null
  created_at: string
}

export interface ReceiptTemplate {
  id: string
  name: string
  header: string | null
  footer: string | null
  include_logo: boolean
  include_barcode: boolean
  include_qr_code: boolean
  is_active: boolean
  tenant_id: string
  created_at: string
  updated_at: string
}

// CRM System
export interface Customer {
  id: string
  tenant_id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  country: string
  total_purchases: number
  visit_count: number
  last_visit: string | null
  created_at: string
  updated_at: string
  preferred_location_id: string | null
}

export interface CustomerCommunication {
  id: string
  customer_id: string
  type: 'email' | 'sms' | 'phone' | 'in_person' | 'social_media' | 'other'
  direction: 'inbound' | 'outbound'
  subject: string | null
  content: string | null
  status: 'draft' | 'sent' | 'delivered' | 'failed' | 'opened' | 'replied'
  scheduled_at: string | null
  sent_at: string | null
  employee_id: string | null
  metadata: Json
  created_at: string
  updated_at: string
}

export interface MarketingCampaign {
  id: string
  name: string
  description: string | null
  type: 'email' | 'sms' | 'social_media' | 'loyalty' | 'promotion'
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'
  target_segment_id: string | null
  content_template: Json
  schedule_config: Json
  budget: number
  actual_cost: number
  start_date: string | null
  end_date: string | null
  metrics: Json
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface CustomerSegment {
  id: string
  name: string
  description: string | null
  criteria: Json
  is_dynamic: boolean
  customer_count: number
  last_calculated: string | null
  created_at: string
  updated_at: string
}

export interface CustomerSegmentMembership {
  id: string
  segment_id: string
  customer_id: string
  score: number
  added_at: string
}

export interface CampaignDelivery {
  id: string
  campaign_id: string
  customer_id: string
  communication_id: string | null
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'converted' | 'failed' | 'bounced'
  sent_at: string | null
  delivered_at: string | null
  opened_at: string | null
  clicked_at: string | null
  converted_at: string | null
  error_message: string | null
  metadata: Json
  created_at: string
}

export interface CustomerInteraction {
  id: string
  customer_id: string
  type: 'purchase' | 'visit' | 'inquiry' | 'complaint' | 'compliment' | 'support' | 'review' | 'referral'
  channel: 'pos' | 'website' | 'phone' | 'email' | 'social_media' | 'in_store'
  description: string | null
  value: number
  sentiment: 'positive' | 'neutral' | 'negative' | null
  employee_id: string | null
  metadata: Json
  created_at: string
}

export interface CustomerPreference {
  id: string
  customer_id: string
  communication_channel: 'email' | 'sms' | 'phone' | 'social_media'
  is_opted_in: boolean
  preferred_time: string | null
  frequency_preference: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'never' | null
  last_contact_at: string | null
  created_at: string
  updated_at: string
}

// HR Management
export interface Employee {
  id: string
  tenant_id: string
  name: string
  email: string | null
  phone: string | null
  role: string
  commission: number
  total_sales: number
  shifts: Json
  is_active: boolean
  hire_date: string
  created_at: string
  updated_at: string
  location_id: string | null
}

export interface Attendance {
  id: string
  employee_id: string
  check_in: string
  check_out: string | null
  break_duration: number | null
  location_id: string | null
  created_at: string
}

export interface Payroll {
  id: string
  employee_id: string
  pay_period_start: string
  pay_period_end: string
  base_salary: number
  overtime_hours: number
  deductions: Json
  net_pay: number
  created_at: string
}

// Accounting System
export interface ChartOfAccounts {
  id: string
  tenant_id: string
  account_number: string
  account_name: string
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  parent_account_id: string | null
}

export interface FinancialTransaction {
  id: string
  tenant_id: string
  account_id: string
  transaction_date: string
  description: string | null
  debit_amount: number | null
  credit_amount: number | null
  reference_type: string | null
  reference_id: string | null
}

export interface Invoice {
  id: string
  tenant_id: string
  customer_id: string
  invoice_number: string
  issue_date: string
  due_date: string
  total_amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  created_at: string
}

// Workflow Automation
export interface Workflow {
  id: string
  tenant_id: string
  name: string
  description: string | null
  trigger_type: 'event' | 'schedule' | 'manual' | 'condition'
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

export interface WorkflowExecution {
  id: string
  workflow_id: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  started_at: string
  completed_at: string | null
  trigger_data: Json
  execution_context: Json
  result: Json
  error_message: string | null
  execution_time_ms: number | null
}

export interface WorkflowSchedule {
  id: string
  workflow_id: string
  schedule_type: 'cron' | 'interval' | 'once'
  schedule_expression: string
  next_run_at: string
  is_active: boolean
  timezone: string
  created_at: string
  updated_at: string
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string | null
  category: string
  template_config: Json
  is_system_template: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface WorkflowAction {
  id: string
  name: string
  description: string | null
  action_type: 'api_call' | 'email' | 'notification' | 'data_operation' | 'approval' | 'webhook'
  config_schema: Json
  is_enabled: boolean
  created_at: string
}

export interface WorkflowTrigger {
  id: string
  name: string
  description: string | null
  trigger_type: 'event' | 'schedule' | 'manual' | 'condition'
  config_schema: Json
  is_enabled: boolean
  created_at: string
}

// Public API & Webhooks
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
  secret: string | null
  active: boolean
  retry_config: Json
  headers: Json
  created_by: string
  created_at: string
  updated_at: string
  last_triggered_at: string | null
}

export interface WebhookDelivery {
  id: string
  webhook_id: string
  event_type: string
  payload: Json
  status: 'pending' | 'delivered' | 'failed' | 'retrying'
  response_status: number | null
  response_body: string | null
  attempt_count: number
  next_retry_at: string | null
  delivered_at: string | null
  created_at: string
  error_message: string | null
}

export interface ApiUsageLog {
  id: string
  api_key_id: string | null
  tenant_id: string
  endpoint: string
  method: string
  status_code: number
  response_time_ms: number | null
  request_size: number | null
  response_size: number | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface ApiEndpoint {
  id: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  description: string | null
  required_permissions: Json
  rate_limit_override: number | null
  is_enabled: boolean
  created_at: string
}

// Security & Audit
export interface UserSession {
  id: string
  user_id: string
  tenant_id: string | null
  session_token: string
  device_info: Json
  ip_address: string | null
  user_agent: string | null
  is_active: boolean
  last_activity_at: string
  expires_at: string
  created_at: string
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

export interface OnboardingStep {
  id: string
  step_key: string
  step_name: string
  step_description: string | null
  step_order: number
  is_required: boolean
  can_skip: boolean
  estimated_minutes: number
  component_name: string | null
  created_at: string
}

export interface UserOnboardingProgress {
  id: string
  user_id: string
  tenant_id: string | null
  step_id: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  started_at: string | null
  completed_at: string | null
  data: Json
  created_at: string
  updated_at: string
}

export interface Invitation {
  id: string
  tenant_id: string
  invited_by: string
  invited_email: string
  role_id: string | null
  custom_message: string | null
  permissions_override: Json
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled'
  token: string
  expires_at: string
  accepted_at: string | null
  accepted_by: string | null
  created_at: string
  updated_at: string
}

// Location Management
export interface LocationSetting {
  id: string
  location_id: string
  setting_key: string
  setting_value: Json
  created_at: string
  updated_at: string
}

export interface LocationUser {
  id: string
  user_id: string
  location_id: string
  role: 'manager' | 'supervisor' | 'staff' | 'viewer'
  assigned_by: string | null
  assigned_at: string
  is_active: boolean
}

export interface LocationReport {
  id: string
  location_id: string
  report_type: string
  report_period_start: string
  report_period_end: string
  report_data: Json
  generated_by: string
  generated_at: string
}

export interface InventoryByLocation {
  id: string
  product_id: string
  product_variant_id: string | null
  location_id: string
  quantity_on_hand: number
  quantity_reserved: number
  quantity_available: number
  reorder_level: number
  max_stock: number | null
  cost_per_unit: number
  last_counted_at: string | null
  counted_by: string | null
  created_at: string
  updated_at: string
}

// Utility Types
export type TenantContext = {
  tenantId: string
  userId: string
  role: string
  permissions: string[]
}

export type DatabaseConfig = {
  url: string
  anonKey: string
  serviceKey?: string
  options?: {
    db?: {
      schema?: string
    }
    auth?: {
      persistSession?: boolean
      autoRefreshToken?: boolean
      detectSessionInUrl?: boolean
    }
    global?: {
      headers?: Record<string, string>
    }
  }
}

// Export the Database type for Supabase client
export { Database };
