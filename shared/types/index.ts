// Shared types for KiTS Hub multi-tenant SaaS platform

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenant_id: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  last_sign_in_at?: string;
}

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  plan: SubscriptionPlan;
  settings: TenantSettings;
  created_at: string;
  updated_at: string;
}

export interface TenantSettings {
  timezone: string;
  currency: string;
  language: string;
  date_format: string;
  theme: 'light' | 'dark' | 'system';
  rtl: boolean;
}

export type UserRole = 
  | 'super_admin'
  | 'tenant_admin'
  | 'manager'
  | 'employee'
  | 'cashier'
  | 'sales_rep'
  | 'accountant'
  | 'viewer';

export type SubscriptionPlan = 
  | 'starter'
  | 'professional'
  | 'business'
  | 'enterprise';

// Inventory Management Types
export interface Product {
  id: string;
  tenant_id: string;
  sku: string;
  name: string;
  description?: string;
  category_id: string;
  supplier_id?: string;
  location_id?: string;
  unit_price: number;
  cost_price: number;
  stock_quantity: number;
  min_stock_level: number;
  max_stock_level: number;
  reorder_point: number;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  images?: string[];
  tags?: string[];
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  parent_id?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  tenant_id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: Address;
  tax_id?: string;
  payment_terms?: string;
  notes?: string;
  status: SupplierStatus;
  created_at: string;
  updated_at: string;
}

export interface Location {
  id: string;
  tenant_id: string;
  name: string;
  type: LocationType;
  address?: Address;
  contact_person?: string;
  phone?: string;
  email?: string;
  storage_capacity?: number;
  current_stock?: number;
  status: LocationStatus;
  created_at: string;
  updated_at: string;
}

export type ProductStatus = 'active' | 'inactive' | 'discontinued' | 'out_of_stock';
export type SupplierStatus = 'active' | 'inactive' | 'pending';
export type LocationType = 'warehouse' | 'store' | 'office' | 'factory';
export type LocationStatus = 'active' | 'inactive' | 'maintenance';

// Point of Sale Types
export interface Sale {
  id: string;
  tenant_id: string;
  location_id: string;
  customer_id?: string;
  employee_id: string;
  sale_number: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: SaleStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_price: number;
  cost_price: number;
  profit: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  tenant_id: string;
  sale_id?: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transaction_id?: string;
  gateway_response?: any;
  created_at: string;
  updated_at: string;
}

export type PaymentMethod = 
  | 'cash'
  | 'card'
  | 'mobile_money'
  | 'bank_transfer'
  | 'check'
  | 'credit';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type SaleStatus = 'pending' | 'completed' | 'cancelled' | 'refunded';

// CRM System Types
export interface Customer {
  id: string;
  tenant_id: string;
  customer_number: string;
  name: string;
  email?: string;
  phone?: string;
  address?: Address;
  company?: string;
  industry?: string;
  source?: string;
  tags?: string[];
  notes?: string;
  status: CustomerStatus;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  tenant_id: string;
  customer_id?: string;
  title: string;
  description?: string;
  source?: string;
  status: LeadStatus;
  priority: LeadPriority;
  assigned_to?: string;
  estimated_value?: number;
  probability?: number;
  expected_close_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  tenant_id: string;
  customer_id: string;
  lead_id?: string;
  name: string;
  description?: string;
  stage: OpportunityStage;
  value: number;
  currency: string;
  probability: number;
  expected_close_date?: string;
  assigned_to?: string;
  status: OpportunityStatus;
  created_at: string;
  updated_at: string;
}

export interface Communication {
  id: string;
  tenant_id: string;
  customer_id?: string;
  lead_id?: string;
  type: CommunicationType;
  subject?: string;
  content: string;
  direction: CommunicationDirection;
  status: CommunicationStatus;
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export type CustomerStatus = 'active' | 'inactive' | 'prospect' | 'churned';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';
export type OpportunityStage = 
  | 'prospecting'
  | 'qualification'
  | 'needs_analysis'
  | 'value_proposition'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';
export type OpportunityStatus = 'active' | 'won' | 'lost' | 'on_hold';
export type CommunicationType = 'email' | 'phone' | 'meeting' | 'sms' | 'note';
export type CommunicationDirection = 'inbound' | 'outbound';
export type CommunicationStatus = 'draft' | 'scheduled' | 'sent' | 'failed';

// HR Management Types
export interface Employee {
  id: string;
  tenant_id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: Address;
  emergency_contact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  department?: string;
  position?: string;
  manager_id?: string;
  hire_date: string;
  salary?: number;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
}

export type Department = 
  | 'engineering'
  | 'sales'
  | 'marketing'
  | 'hr'
  | 'finance'
  | 'operations';

export interface Payroll {
  id: string;
  tenant_id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  gross_salary: number;
  deductions: number;
  net_salary: number;
  status: PayrollStatus;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  tenant_id: string;
  employee_id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  break_duration?: number;
  work_hours?: number;
  status: AttendanceStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Performance {
  id: string;
  tenant_id: string;
  employee_id: string;
  review_period: string;
  reviewer_id: string;
  goals?: PerformanceGoal[];
  skills?: PerformanceSkill[];
  overall_rating?: number;
  comments?: string;
  status: PerformanceStatus;
  created_at: string;
  updated_at: string;
}

export type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'terminated' | 'suspended';
export type PayrollStatus = 'draft' | 'pending' | 'processed' | 'paid';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'on_leave';
export type PerformanceStatus = 'draft' | 'in_review' | 'completed' | 'approved';

// Accounting System Types
export interface Account {
  id: string;
  tenant_id: string;
  account_number: string;
  name: string;
  type: AccountType;
  parent_id?: string;
  description?: string;
  opening_balance: number;
  current_balance: number;
  currency: string;
  status: AccountStatus;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  tenant_id: string;
  transaction_number: string;
  date: string;
  description?: string;
  debit_account_id: string;
  credit_account_id: string;
  amount: number;
  currency: string;
  category: TransactionCategory;
  reference?: string;
  attachments?: string[];
  status: TransactionStatus;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  customer_id?: string;
  invoice_number: string;
  date: string;
  due_date?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  status: InvoiceStatus;
  items?: InvoiceItem[];
  created_at: string;
  updated_at: string;
}

export type AccountType = 
  | 'asset'
  | 'liability'
  | 'equity'
  | 'revenue'
  | 'expense';
export type AccountStatus = 'active' | 'inactive' | 'closed';
export type TransactionCategory = 
  | 'sales'
  | 'purchases'
  | 'expenses'
  | 'payroll'
  | 'tax'
  | 'other';
export type TransactionStatus = 'draft' | 'posted' | 'reversed' | 'completed' | 'pending' | 'failed' | 'cancelled';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

// Analytics Dashboard Types
export interface KPIData {
  id: string;
  tenant_id: string;
  name: string;
  value: number;
  previous_value?: number;
  change?: number;
  change_percentage?: number;
  period: string;
  category: KPICategory;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  tenant_id: string;
  name: string;
  type: ReportType;
  description?: string;
  parameters?: ReportParameter[];
  schedule?: ReportSchedule;
  last_run?: string;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
}

export interface Insight {
  id: string;
  tenant_id: string;
  title: string;
  description: string;
  type: InsightType;
  severity: InsightSeverity;
  data?: any;
  recommendations?: string[];
  status: InsightStatus;
  created_at: string;
  updated_at: string;
}

export type KPICategory = 
  | 'sales'
  | 'inventory'
  | 'customers'
  | 'employees'
  | 'financial'
  | 'operations';
export type ReportType = 
  | 'sales'
  | 'inventory'
  | 'financial'
  | 'hr'
  | 'customer'
  | 'custom';
export type ReportStatus = 'active' | 'inactive' | 'running' | 'completed' | 'failed';
export type InsightType = 
  | 'trend'
  | 'anomaly'
  | 'opportunity'
  | 'risk'
  | 'recommendation';
export type InsightSeverity = 'low' | 'medium' | 'high' | 'critical';
export type InsightStatus = 'new' | 'acknowledged' | 'resolved' | 'dismissed';

// Common Types
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
}

export interface PerformanceGoal {
  id?: string;
  description: string;
  target: string;
  achieved?: string;
  rating?: number;
}

export interface PerformanceSkill {
  id?: string;
  name: string;
  rating: number;
  comments?: string;
}

export interface InvoiceItem {
  id?: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface ReportParameter {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  default_value?: any;
  required: boolean;
  description?: string;
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  day_of_month?: number;
  day_of_week?: number;
  time?: string;
  timezone?: string;
  recipients?: string[];
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  error?: string;
  code?: string;
  details?: any;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ErrorResponse {
  error: string;
  message?: string;
  details?: any;
  code?: string;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | undefined;
  };
}

export interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
}

// Navigation Types
export interface NavigationItem {
  path: string;
  label: string;
  icon?: React.ComponentType<any>;
  badge?: string | number;
  children?: NavigationItem[];
  permissions?: UserRole[];
}

// Theme Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
}
