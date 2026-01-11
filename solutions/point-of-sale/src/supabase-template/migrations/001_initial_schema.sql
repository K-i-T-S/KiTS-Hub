-- KiTS Hub Initial Schema Migration
-- This migration creates the complete database structure for the multi-tenant SaaS platform

-- Migration metadata
\echo 'Running KiTS Hub initial schema migration...'
\echo 'Timestamp: ' || now()

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create custom types
CREATE TYPE plan_type AS ENUM ('starter', 'basic', 'professional', 'enterprise');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly');
CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'cancelled', 'trial');
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'user', 'viewer', 'inventory_manager', 'sales_staff', 'hr_manager', 'accountant');
CREATE TYPE location_type AS ENUM ('warehouse', 'store', 'storage', 'production');
CREATE TYPE customer_type AS ENUM ('individual', 'business', 'non_profit', 'government');
CREATE TYPE communication_type AS ENUM ('email', 'phone', 'sms', 'note', 'meeting', 'task');
CREATE TYPE communication_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE communication_status AS ENUM ('draft', 'sent', 'failed', 'bounced', 'scheduled', 'cancelled');
CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'intern', 'temporary');
CREATE TYPE account_type AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'void', 'partial');
CREATE TYPE sale_status AS ENUM ('draft', 'pending', 'completed', 'cancelled', 'refunded', 'on_hold');
CREATE TYPE movement_type AS ENUM ('sale', 'purchase', 'adjustment', 'return', 'transfer_in', 'transfer_out', 'damage', 'loss', 'production');
CREATE TYPE alert_type AS ENUM ('low_stock', 'out_of_stock', 'expiring', 'expired', 'overstock', 'discontinued');
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error', 'system');

-- Core tenant management
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    domain TEXT,
    plan_type plan_type NOT NULL,
    billing_cycle billing_cycle NOT NULL,
    status tenant_status NOT NULL DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    subscription_data JSONB DEFAULT '{}',
    usage_limits JSONB DEFAULT '{}',
    api_quota INTEGER DEFAULT 10000,
    storage_quota_gb INTEGER DEFAULT 10,
    max_users INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    trial_ends_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    CHECK (plan_type IS NOT NULL),
    CHECK (billing_cycle IS NOT NULL),
    CHECK (status IS NOT NULL),
    CHECK (api_quota >= 0),
    CHECK (storage_quota_gb >= 0),
    CHECK (max_users >= 1)
);

-- User management with multi-tenant support
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'user',
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    last_login TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    session_data JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, email),
    CHECK (role IS NOT NULL),
    CHECK (login_count >= 0)
);

-- User sessions for security
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    CHECK (expires_at > created_at)
);

-- Inventory Management Tables
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, name),
    CHECK (sort_order >= 0)
);

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT,
    tax_id TEXT,
    payment_terms TEXT,
    lead_time_days INTEGER DEFAULT 0,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (lead_time_days >= 0),
    CHECK (min_order_amount >= 0)
);

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT,
    location_type location_type DEFAULT 'warehouse',
    is_primary BOOLEAN DEFAULT false,
    manager_id UUID REFERENCES users(id),
    contact_phone TEXT,
    operating_hours JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, name),
    CHECK (location_type IS NOT NULL)
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT NOT NULL,
    barcode TEXT,
    category_id UUID REFERENCES categories(id),
    supplier_id UUID REFERENCES suppliers(id),
    brand TEXT,
    unit TEXT,
    cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    weight DECIMAL(10,3),
    dimensions JSONB,
    images TEXT[],
    tags TEXT[],
    specifications JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    track_inventory BOOLEAN DEFAULT true,
    track_batches BOOLEAN DEFAULT false,
    allow_partial_sales BOOLEAN DEFAULT true,
    is_digital BOOLEAN DEFAULT false,
    requires_shipping BOOLEAN DEFAULT true,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER DEFAULT 0,
    reorder_point INTEGER DEFAULT 0,
    reorder_quantity INTEGER DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    reserved_stock INTEGER DEFAULT 0,
    available_stock INTEGER GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
    stock_value DECIMAL(12,2) DEFAULT 0,
    low_stock BOOLEAN DEFAULT false,
    last_stock_update TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, sku),
    CHECK (cost >= 0),
    CHECK (price >= 0),
    CHECK (weight >= 0),
    CHECK (min_stock_level >= 0),
    CHECK (max_stock_level >= 0),
    CHECK (reorder_point >= 0),
    CHECK (reorder_quantity >= 0),
    CHECK (current_stock >= 0),
    CHECK (reserved_stock >= 0),
    CHECK (stock_value >= 0),
    CHECK (max_stock_level >= min_stock_level),
    CHECK (reorder_point >= min_stock_level)
);

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    barcode TEXT,
    attributes JSONB DEFAULT '{}',
    cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    weight DECIMAL(10,3),
    images TEXT[],
    stock INTEGER DEFAULT 0,
    reserved_stock INTEGER DEFAULT 0,
    available_stock INTEGER GENERATED ALWAYS AS (stock - reserved_stock) STORED,
    reorder_level INTEGER DEFAULT 0,
    cost_history JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, sku),
    CHECK (cost >= 0),
    CHECK (price >= 0),
    CHECK (weight >= 0),
    CHECK (stock >= 0),
    CHECK (reserved_stock >= 0),
    CHECK (reorder_level >= 0)
);

CREATE TABLE product_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    batch_number TEXT NOT NULL,
    supplier_id UUID REFERENCES suppliers(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    quantity_reserved INTEGER NOT NULL DEFAULT 0,
    quantity_available INTEGER GENERATED ALWAYS AS (quantity - quantity_reserved) STORED,
    unit_cost DECIMAL(10,2) NOT NULL,
    manufacture_date DATE,
    expiration_date DATE,
    received_date TIMESTAMPTZ DEFAULT NOW(),
    quality_grade TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, batch_number),
    CHECK (quantity >= 0),
    CHECK (quantity_reserved >= 0),
    CHECK (unit_cost >= 0),
    CHECK (expiration_date IS NULL OR expiration_date >= manufacture_date)
);

-- Point of Sale Tables
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sale_number TEXT NOT NULL,
    customer_id UUID,
    location_id UUID REFERENCES locations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    register_id TEXT,
    status sale_status NOT NULL DEFAULT 'completed',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    tip_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_method TEXT,
    payment_status payment_status DEFAULT 'paid',
    tax_rate DECIMAL(5,4) DEFAULT 0,
    discount_rate DECIMAL(5,4) DEFAULT 0,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, sale_number),
    CHECK (status IS NOT NULL),
    CHECK (payment_status IS NOT NULL),
    CHECK (subtotal >= 0),
    CHECK (tax_amount >= 0),
    CHECK (discount_amount >= 0),
    CHECK (tip_amount >= 0),
    CHECK (total_amount >= 0),
    CHECK (tax_rate >= 0),
    CHECK (discount_rate >= 0),
    CHECK (total_amount = subtotal + tax_amount - discount_amount + tip_amount)
);

CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    batch_id UUID REFERENCES product_batches(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (quantity > 0),
    CHECK (unit_price >= 0),
    CHECK (total_price >= 0),
    CHECK (cost >= 0),
    CHECK (discount_amount >= 0),
    CHECK (tax_amount >= 0),
    CHECK (total_price = unit_price * quantity)
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    payment_method TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    transaction_id TEXT,
    gateway_response JSONB,
    processed_by UUID REFERENCES users(id),
    refund_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (status IS NOT NULL),
    CHECK (amount != 0)
);

-- CRM Tables
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    company TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT,
    customer_type customer_type DEFAULT 'individual',
    credit_limit DECIMAL(10,2) DEFAULT 0,
    balance DECIMAL(10,2) DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    tags TEXT[],
    notes TEXT,
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_purchase_date TIMESTAMPTZ,
    total_purchases DECIMAL(12,2) DEFAULT 0,
    average_order_value DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, email),
    CHECK (customer_type IS NOT NULL),
    CHECK (credit_limit >= 0),
    CHECK (loyalty_points >= 0),
    CHECK (total_purchases >= 0),
    CHECK (average_order_value >= 0)
);

CREATE TABLE customer_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    type communication_type NOT NULL,
    subject TEXT,
    content TEXT,
    direction communication_direction DEFAULT 'outbound',
    status communication_status DEFAULT 'sent',
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    user_id UUID REFERENCES users(id),
    scheduled_for TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (type IS NOT NULL),
    CHECK (direction IS NOT NULL),
    CHECK (status IS NOT NULL)
);

-- HR Management Tables
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    employee_number TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    department TEXT,
    position TEXT,
    manager_id UUID REFERENCES employees(id),
    hire_date DATE NOT NULL,
    termination_date DATE,
    employment_type employment_type DEFAULT 'full_time',
    salary DECIMAL(10,2),
    hourly_rate DECIMAL(8,2),
    work_schedule JSONB DEFAULT '{}',
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relation TEXT,
    skills TEXT[],
    certifications JSONB DEFAULT '{}',
    performance_reviews JSONB DEFAULT '{}',
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (employment_type IS NOT NULL),
    CHECK (salary >= 0),
    CHECK (hourly_rate >= 0),
    CHECK (hire_date IS NOT NULL),
    CHECK (termination_date IS NULL OR termination_date > hire_date)
);

CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clock_in TIMESTAMPTZ,
    clock_out TIMESTAMPTZ,
    break_duration_minutes INTEGER DEFAULT 0,
    work_hours DECIMAL(4,2) GENERATED ALWAYS AS (
        CASE 
            WHEN clock_out IS NOT NULL AND clock_in IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (clock_out - clock_in))/3600 - break_duration_minutes/60
            ELSE NULL 
        END
    ) STORED,
    status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'holiday', 'sick_leave', 'vacation')),
    notes TEXT,
    approved_by UUID REFERENCES employees(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, employee_id, date),
    CHECK (break_duration_minutes >= 0),
    CHECK (work_hours IS NULL OR work_hours >= 0)
);

CREATE TABLE payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    gross_pay DECIMAL(10,2) NOT NULL,
    net_pay DECIMAL(10,2) NOT NULL,
    federal_tax DECIMAL(10,2) DEFAULT 0,
    state_tax DECIMAL(10,2) DEFAULT 0,
    social_security DECIMAL(10,2) DEFAULT 0,
    medicare DECIMAL(10,2) DEFAULT 0,
    other_deductions DECIMAL(10,2) DEFAULT 0,
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    overtime_pay DECIMAL(8,2) DEFAULT 0,
    bonus DECIMAL(8,2) DEFAULT 0,
    commission DECIMAL(8,2) DEFAULT 0,
    payment_method TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'processed', 'paid', 'cancelled')),
    processed_by UUID REFERENCES employees(id),
    processed_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, employee_id, pay_period_start, pay_period_end),
    CHECK (pay_period_end > pay_period_start),
    CHECK (gross_pay >= 0),
    CHECK (net_pay >= 0),
    CHECK (federal_tax >= 0),
    CHECK (state_tax >= 0),
    CHECK (social_security >= 0),
    CHECK (medicare >= 0),
    CHECK (other_deductions >= 0),
    CHECK (overtime_hours >= 0),
    CHECK (overtime_pay >= 0),
    CHECK (bonus >= 0),
    CHECK (commission >= 0)
);

-- Accounting Tables
CREATE TABLE chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_type account_type NOT NULL,
    parent_id UUID REFERENCES chart_of_accounts(id),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    opening_balance DECIMAL(12,2) DEFAULT 0,
    current_balance DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, account_number),
    CHECK (account_type IS NOT NULL)
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    transaction_number TEXT NOT NULL,
    transaction_date DATE NOT NULL,
    description TEXT,
    reference_type TEXT,
    reference_id UUID,
    total_amount DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'posted' CHECK (status IN ('draft', 'posted', 'void')),
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, transaction_number),
    CHECK (transaction_date IS NOT NULL)
);

CREATE TABLE transaction_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    debit_amount DECIMAL(12,2) DEFAULT 0,
    credit_amount DECIMAL(12,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (debit_amount >= 0),
    CHECK (credit_amount >= 0),
    CHECK ((debit_amount > 0) OR (credit_amount > 0))
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    customer_id UUID REFERENCES customers(id),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'partial', 'overdue', 'void')),
    terms TEXT,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, invoice_number),
    CHECK (issue_date IS NOT NULL),
    CHECK (due_date >= issue_date),
    CHECK (subtotal >= 0),
    CHECK (tax_amount >= 0),
    CHECK (discount_amount >= 0),
    CHECK (total_amount >= 0),
    CHECK (balance >= 0),
    CHECK (total_amount = subtotal + tax_amount - discount_amount)
);

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,4) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (quantity > 0),
    CHECK (unit_price >= 0),
    CHECK (total_price >= 0),
    CHECK (tax_rate >= 0),
    CHECK (tax_amount >= 0),
    CHECK (total_price = unit_price * quantity)
);

-- Analytics and Reporting
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    user_id UUID REFERENCES users(id),
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    parameters JSONB DEFAULT '{}',
    data JSONB,
    status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed', 'scheduled')),
    generated_by UUID REFERENCES users(id),
    scheduled_for TIMESTAMPTZ,
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Tables
CREATE TABLE inventory_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    track_batches BOOLEAN DEFAULT false,
    track_expiration BOOLEAN DEFAULT false,
    default_location_id UUID REFERENCES locations(id),
    auto_reserve_stock BOOLEAN DEFAULT false,
    allow_partial_sales BOOLEAN DEFAULT true,
    enforce_fifo BOOLEAN DEFAULT false,
    expiration_warning_days INTEGER DEFAULT 30,
    low_stock_alert_enabled BOOLEAN DEFAULT true,
    reorder_alert_enabled BOOLEAN DEFAULT true,
    auto_reorder_enabled BOOLEAN DEFAULT false,
    barcode_enabled BOOLEAN DEFAULT true,
    multi_location_enabled BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id),
    CHECK (expiration_warning_days >= 0)
);

CREATE TABLE inventory_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    alert_type alert_type NOT NULL,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location_id UUID REFERENCES locations(id),
    batch_id UUID REFERENCES product_batches(id),
    urgency urgency_level NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (alert_type IS NOT NULL),
    CHECK (urgency IS NOT NULL)
);

CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id),
    location_id UUID REFERENCES locations(id),
    batch_id UUID REFERENCES product_batches(id),
    movement_type movement_type NOT NULL,
    quantity INTEGER NOT NULL,
    reference_id UUID,
    reference_type TEXT,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (movement_type IS NOT NULL),
    CHECK (quantity != 0)
);

-- Audit logging
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (type IS NOT NULL)
);

-- API keys for integrations
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT UNIQUE NOT NULL,
    permissions JSONB DEFAULT '[]',
    rate_limit INTEGER DEFAULT 1000,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    last_used TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (rate_limit > 0),
    CHECK (usage_count >= 0)
);

-- Webhooks for integrations
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL,
    secret_key TEXT,
    is_active BOOLEAN DEFAULT true,
    retry_count INTEGER DEFAULT 3,
    timeout_seconds INTEGER DEFAULT 30,
    headers JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (retry_count >= 0),
    CHECK (timeout_seconds > 0)
);

CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    response_code INTEGER,
    response_body TEXT,
    attempt_number INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'failed', 'retrying')),
    delivered_at TIMESTAMPTZ,
    next_retry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (attempt_number > 0)
);

\echo 'Initial schema migration completed successfully!'
