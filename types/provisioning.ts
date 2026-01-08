// Core types for the KiTS provisioning system

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'provisioner' | 'support';
  active_provisions: number;
  total_provisions: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  email: string;
  company_name: string;
  contact_name: string;
  phone?: string;
  plan_type: 'starter' | 'basic' | 'professional' | 'enterprise';
  status: 'trial' | 'active' | 'suspended' | 'cancelled';
  created_at: string;
  updated_at: string;
  billing_address?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ProvisioningQueue {
  id: string;
  customer_id: string;
  status: 'pending' | 'in_progress' | 'credentials_received' | 'migrating' | 'completed' | 'failed' | 'cancelled';
  priority: number; // 0=normal, 1=high, 2=urgent
  requested_features: string[];
  customer_email: string;
  customer_temp_password?: string;
  admin_assigned_to?: string;
  admin_notes?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  estimated_completion: string;
  last_status_update: string;
  customer?: Customer;
  assigned_admin?: AdminUser;
}

export interface CustomerBackend {
  id: string;
  customer_id: string;
  supabase_project_ref: string;
  supabase_api_url: string;
  supabase_anon_key: string; // encrypted
  supabase_service_role_key: string; // encrypted
  database_password?: string; // encrypted
  region: string;
  tier: 'free' | 'pro' | 'team' | 'enterprise';
  provisioning_status: 'pending' | 'active' | 'suspended' | 'error';
  credentials_submitted_by?: string;
  credentials_submitted_at?: string;
  migration_logs: MigrationLog[];
  last_health_check?: string;
  storage_usage_mb: number;
  database_size_mb: number;
  created_at: string;
  updated_at: string;
}

export interface MigrationLog {
  step: string;
  status: 'success' | 'failed' | 'pending';
  timestamp?: string;
  error?: string;
  details?: Record<string, any>;
}

export interface FeatureTemplate {
  id: string;
  feature_key: string;
  feature_name: string;
  description?: string;
  version: string;
  migration_sql: string;
  dependencies: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  plan_key: string;
  plan_name: string;
  price_monthly: number;
  price_yearly: number;
  included_features: string[];
  max_storage_gb: number;
  max_api_calls_month: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProvisioningAuditLog {
  id: string;
  customer_id?: string;
  admin_id?: string;
  action: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Form types
export interface OnboardingFormData {
  // Company Information
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  billing_address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  
  // Plan Selection
  plan_type: 'starter' | 'basic' | 'professional' | 'enterprise';
  billing_cycle: 'monthly' | 'yearly';
  
  // Feature Selection
  selected_features: string[];
  
  // Supabase Account Details
  supabase_email?: string;
  supabase_password?: string;
  
  // Additional Info
  referral_source?: string;
  special_requirements?: string;
}

export interface CredentialSubmissionData {
  project_ref: string;
  project_url: string;
  anon_key: string;
  service_role_key: string;
  database_password?: string;
  region?: string;
  admin_notes?: string;
}

// UI State Types
export interface QueueStats {
  pending: number;
  in_progress: number;
  completed_today: number;
  failed_today: number;
  average_wait_time: number; // in hours
  overdue_count: number;
}

export interface ProvisioningProgress {
  current_step: number;
  total_steps: number;
  step_name: string;
  percentage: number;
  logs: MigrationLog[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface QueuePositionResponse {
  position: number;
  estimated_wait_hours: number;
  ahead_in_queue: number;
  status: string;
}

// Real-time subscription types
export interface RealtimeEvent {
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema: string;
  old?: Record<string, any>;
  new?: Record<string, any>;
  commit_timestamp: string;
}

// Email notification types
export interface EmailNotification {
  to: string
  template: 'waiting' | 'ready' | 'failed' | 'admin_alert'
  data: Record<string, any>
}

// Feature dependency resolution
export interface FeatureDependency {
  feature: string;
  depends_on: string[];
  level: number; // dependency depth for ordering
}

// Migration execution context
export interface MigrationContext {
  customer_id: string;
  credentials: CredentialSubmissionData;
  features: string[];
  admin_id: string;
  migration_id: string;
}
