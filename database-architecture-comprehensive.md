# KiTS Hub Database Architecture

## Overview

KiTS Hub implements a comprehensive multi-tenant SaaS database architecture using PostgreSQL with Supabase. The system supports 6 business solutions (Inventory, POS, CRM, HR, Accounting, Analytics) with enterprise-grade security, scalability, and performance optimizations.

## Architecture Principles

### Multi-Tenancy
- **Row Level Security (RLS)** for complete tenant isolation
- **Tenant-aware functions** for secure data access
- **Per-tenant data segregation** with shared infrastructure
- **Subscription-based access control** with feature limits

### Security & Compliance
- **Role-Based Access Control (RBAC)** with 8 granular roles
- **Audit logging** for all data modifications
- **Session management** with device tracking
- **API key authentication** with rate limiting
- **Data encryption** at rest and in transit

### Performance & Scalability
- **Strategic indexing** on all critical queries
- **Materialized views** for reporting optimization
- **Connection pooling** with configurable limits
- **Query optimization** with EXPLAIN ANALYZE support
- **Caching layers** for frequently accessed data

## Core Domain Models

### 1. Tenant Management
```sql
tenants
├── id (UUID, PK)
├── name (TEXT)
├── slug (TEXT, UNIQUE)
├── subscription_plan (TEXT)
├── settings (JSONB)
├── business_type (ENUM)
├── size (ENUM)
├── currency (TEXT)
└── timezone (TEXT)

tenant_users
├── id (UUID, PK)
├── tenant_id (UUID, FK)
├── user_id (UUID, FK)
├── role (TEXT)
└── is_active (BOOLEAN)
```

### 2. User Management & Authentication
```sql
user_profiles
├── id (UUID, PK)
├── user_id (UUID, FK)
├── first_name (TEXT)
├── last_name (TEXT)
├── phone (TEXT)
├── avatar_url (TEXT)
├── mfa_enabled (BOOLEAN)
├── onboarding_step (INTEGER)
└── preferences (JSONB)

user_sessions
├── id (UUID, PK)
├── user_id (UUID, FK)
├── tenant_id (UUID, FK)
├── session_token (TEXT, UNIQUE)
├── device_info (JSONB)
├── ip_address (INET)
└── expires_at (TIMESTAMP)

invitations
├── id (UUID, PK)
├── tenant_id (UUID, FK)
├── invited_email (TEXT)
├── role_id (UUID, FK)
├── token (UUID, UNIQUE)
├── status (ENUM)
└── expires_at (TIMESTAMP)
```

### 3. Role-Based Access Control
```sql
roles
├── id (UUID, PK)
├── name (TEXT, UNIQUE)
├── description (TEXT)
├── is_system_role (BOOLEAN)
└── tenant_id (UUID, FK)

permissions
├── id (UUID, PK)
├── name (TEXT, UNIQUE)
├── resource (TEXT)
├── action (TEXT)
└── description (TEXT)

role_permissions
├── id (UUID, PK)
├── role_id (UUID, FK)
├── permission_id (UUID, FK)
└── created_at (TIMESTAMP)

user_roles
├── id (UUID, PK)
├── user_id (UUID, FK)
├── tenant_id (UUID, FK)
├── role_id (UUID, FK)
├── expires_at (TIMESTAMP)
└── is_active (BOOLEAN)
```

### 4. Product & Inventory Management
```sql
products
├── id (UUID, PK)
├── tenant_id (UUID, FK)
├── name (TEXT)
├── description (TEXT)
├── price (DECIMAL)
├── cost (DECIMAL)
├── sku (TEXT, UNIQUE)
├── barcode (TEXT)
├── category (TEXT)
├── stock_quantity (INTEGER)
├── min_stock_level (INTEGER)
├── track_batches (BOOLEAN)
├── track_expiration (BOOLEAN)
├── variants (JSONB)
├── supplier (TEXT)
├── validity_date (TIMESTAMP)
└── is_active (BOOLEAN)

suppliers
├── id (UUID, PK)
├── tenant_id (UUID, FK)
├── name (TEXT)
├── contact_person (TEXT)
├── email (TEXT)
├── phone (TEXT)
├── address (JSONB)
├── lead_time_days (INTEGER)
└── is_active (BOOLEAN)

locations
├── id (UUID, PK)
├── tenant_id (UUID, FK)
├── name (TEXT)
├── code (TEXT, UNIQUE)
├── type (ENUM)
├── address (JSONB)
├── operating_hours (JSONB)
├── timezone (TEXT)
└── is_primary (BOOLEAN)

product_batches
├── id (UUID, PK)
├── tenant_id (UUID, FK)
├── product_id (UUID, FK)
├── location_id (UUID, FK)
├── batch_number (TEXT)
├── quantity (INTEGER)
├── quantity_reserved (INTEGER)
├── quantity_available (GENERATED)
├── unit_cost (DECIMAL)
├── manufacture_date (DATE)
├── expiration_date (DATE)
└── is_active (BOOLEAN)

inventory_by_location
├── id (UUID, PK)
├── product_id (UUID, FK)
├── location_id (UUID, FK)
├── quantity_on_hand (INTEGER)
├── quantity_reserved (INTEGER)
├── quantity_available (GENERATED)
├── reorder_level (INTEGER)
└── last_counted_at (TIMESTAMP)

inventory_movements
├── id (UUID, PK)
├── product_id (UUID, FK)
├── movement_type (ENUM)
├── quantity (INTEGER)
├── batch_id (UUID, FK)
├── location_id (UUID, FK)
├── reference_id (UUID)
└── created_at (TIMESTAMP)
```

### 5. Point of Sale & Sales Management
```sql
sales
├── id (UUID, PK)
├── tenant_id (UUID, FK)
├── customer_id (UUID, FK)
├── employee_id (UUID, FK)
├── location_id (UUID, FK)
├── sale_date (TIMESTAMP)
├── subtotal (DECIMAL)
├── tax_amount (DECIMAL)
├── total_amount (DECIMAL)
├── payment_method (TEXT)
├── payment_status (TEXT)
├── tip_info (JSONB)
├── applied_coupon_id (UUID, FK)
├── applied_promotion_id (UUID, FK)
├── loyalty_points_earned (INTEGER)
├── loyalty_points_redeemed (INTEGER)
├── receipt_template_id (UUID, FK)
└── notes (TEXT)

sale_items
├── id (UUID, PK)
├── sale_id (UUID, FK)
├── product_id (UUID, FK)
├── quantity (INTEGER)
├── unit_price (DECIMAL)
├── total_price (DECIMAL)
└── created_at (TIMESTAMP)

split_payments
├── id (UUID, PK)
├── sale_id (UUID, FK)
├── payment_method (ENUM)
├── amount (DECIMAL)
├── status (ENUM)
├── transaction_id (TEXT)
└── created_at (TIMESTAMP)

tips
├── id (UUID, PK)
├── sale_id (UUID, FK)
├── amount (DECIMAL)
├── tip_type (ENUM)
├── percentage (DECIMAL)
├── employee_id (UUID, FK)
└── created_at (TIMESTAMP)
```

### 6. Customer Relationship Management
```sql
customers
├── id (UUID, PK)
├── tenant_id (UUID, FK)
├── name (TEXT)
├── email (TEXT, UNIQUE)
├── phone (TEXT)
├── address (JSONB)
├── total_purchases (DECIMAL)
├── visit_count (INTEGER)
├── last_visit (TIMESTAMP)
├── preferred_location_id (UUID, FK)
└── created_at (TIMESTAMP)

customer_communications
├── id (UUID, PK)
├── customer_id (UUID, FK)
├── type (ENUM)
├── direction (ENUM)
├── subject (TEXT)
├── content (TEXT)
├── status (ENUM)
├── scheduled_at (TIMESTAMP)
├── sent_at (TIMESTAMP)
├── employee_id (UUID, FK)
└── metadata (JSONB)

customer_segments
├── id (UUID, PK)
├── name (TEXT)
├── description (TEXT)
├── criteria (JSONB)
├── is_dynamic (BOOLEAN)
├── customer_count (INTEGER)
└── last_calculated (TIMESTAMP)

customer_segment_memberships
├── id (UUID, PK)
├── segment_id (UUID, FK)
├── customer_id (UUID, FK)
├── score (DECIMAL)
└── added_at (TIMESTAMP)

loyalty_programs
├── id (UUID, PK)
├── name (TEXT)
├── description (TEXT)
├── type (ENUM)
├── rules (JSONB)
├── is_active (BOOLEAN)
└── created_at (TIMESTAMP)

customer_loyalty_memberships
├── id (UUID, PK)
├── customer_id (UUID, FK)
├── program_id (UUID, FK)
├── tier (TEXT)
├── points_balance (INTEGER)
├── total_points_earned (INTEGER)
├── lifetime_value (DECIMAL)
└── joined_at (TIMESTAMP)
```

### 7. Human Resources Management
```sql
employees
├── id (UUID, PK)
├── tenant_id (UUID, FK)
├── name (TEXT)
├── email (TEXT, UNIQUE)
├── phone (TEXT)
├── role (TEXT)
├── commission (DECIMAL)
├── total_sales (DECIMAL)
├── shifts (JSONB)
├── hire_date (TIMESTAMP)
├── location_id (UUID, FK)
└── is_active (BOOLEAN)

attendance
├── id (UUID, PK)
├── employee_id (UUID, FK)
├── date (DATE)
├── clock_in (TIMESTAMP)
├── clock_out (TIMESTAMP)
├── break_duration (INTEGER)
├── location_id (UUID, FK)
└── notes (TEXT)

payroll
├── id (UUID, PK)
├── employee_id (UUID, FK)
├── pay_period_start (DATE)
├── pay_period_end (DATE)
├── base_salary (DECIMAL)
├── overtime_hours (DECIMAL)
├── overtime_pay (DECIMAL)
├── commission_earned (DECIMAL)
├── deductions (DECIMAL)
├── net_pay (DECIMAL)
├── status (ENUM)
└── created_at (TIMESTAMP)
```

### 8. Accounting & Financial Management
```sql
chart_of_accounts
├── id (UUID, PK)
├── tenant_id (UUID, FK)
├── account_number (TEXT)
├── account_name (TEXT)
├── account_type (ENUM)
├── parent_account_id (UUID, FK)
├── description (TEXT)
├── is_active (BOOLEAN)
└── created_at (TIMESTAMP)

financial_transactions
├── id (UUID, PK)
├── tenant_id (UUID, FK)
├── transaction_date (TIMESTAMP)
├── description (TEXT)
├── reference_type (ENUM)
├── reference_id (UUID)
├── amount (DECIMAL)
├── currency (TEXT)
├── status (ENUM)
├── created_by (UUID, FK)
└── created_at (TIMESTAMP)

transaction_line_items
├── id (UUID, PK)
├── transaction_id (UUID, FK)
├── account_id (UUID, FK)
├── debit_amount (DECIMAL)
├── credit_amount (DECIMAL)
├── description (TEXT)
└── created_at (TIMESTAMP)

invoices
├── id (UUID, PK)
├── tenant_id (UUID, FK)
├── customer_id (UUID, FK)
├── invoice_number (TEXT, UNIQUE)
├── issue_date (DATE)
├── due_date (DATE)
├── subtotal (DECIMAL)
├── tax_amount (DECIMAL)
├── total_amount (DECIMAL)
├── status (ENUM)
├── paid_amount (DECIMAL)
└── created_at (TIMESTAMP)
```

### 9. Workflow Automation
```sql
workflows
├── id (UUID, PK)
├── tenant_id (UUID, FK)
├── name (TEXT)
├── description (TEXT)
├── trigger_type (ENUM)
├── trigger_config (JSONB)
├── actions (JSONB)
├── is_active (BOOLEAN)
├── last_run_at (TIMESTAMP)
├── run_count (INTEGER)
└── error_count (INTEGER)

workflow_executions
├── id (UUID, PK)
├── workflow_id (UUID, FK)
├── status (ENUM)
├── started_at (TIMESTAMP)
├── completed_at (TIMESTAMP)
├── trigger_data (JSONB)
├── execution_context (JSONB)
├── result (JSONB)
├── error_message (TEXT)
└── execution_time_ms (INTEGER)

workflow_schedules
├── id (UUID, PK)
├── workflow_id (UUID, FK)
├── schedule_type (ENUM)
├── schedule_expression (TEXT)
├── next_run_at (TIMESTAMP)
├── is_active (BOOLEAN)
└── timezone (TEXT)
```

### 10. API & Webhooks
```sql
api_keys
├── id (UUID, PK)
├── tenant_id (UUID, FK)
├── name (TEXT)
├── key_hash (TEXT, UNIQUE)
├── key_prefix (TEXT)
├── permissions (JSONB)
├── rate_limit (INTEGER)
├── is_active (BOOLEAN)
├── expires_at (TIMESTAMP)
├── last_used_at (TIMESTAMP)
└── created_by (UUID, FK)

webhooks
├── id (UUID, PK)
├── tenant_id (UUID, FK)
├── name (TEXT)
├── url (TEXT)
├── events (JSONB)
├── secret (TEXT)
├── active (BOOLEAN)
├── retry_config (JSONB)
├── headers (JSONB)
├── last_triggered_at (TIMESTAMP)
└── created_at (TIMESTAMP)

webhook_deliveries
├── id (UUID, PK)
├── webhook_id (UUID, FK)
├── event_type (TEXT)
├── payload (JSONB)
├── status (ENUM)
├── response_status (INTEGER)
├── response_body (TEXT)
├── attempt_count (INTEGER)
├── next_retry_at (TIMESTAMP)
├── delivered_at (TIMESTAMP)
└── error_message (TEXT)

api_usage_logs
├── id (UUID, PK)
├── api_key_id (UUID, FK)
├── tenant_id (UUID, FK)
├── endpoint (TEXT)
├── method (TEXT)
├── status_code (INTEGER)
├── response_time_ms (INTEGER)
├── request_size (INTEGER)
├── response_size (INTEGER)
├── ip_address (INET)
├── user_agent (TEXT)
└── created_at (TIMESTAMP)
```

### 11. Audit & Compliance
```sql
audit_logs
├── id (UUID, PK)
├── user_id (UUID, FK)
├── tenant_id (UUID, FK)
├── session_id (UUID, FK)
├── action (TEXT)
├── resource_type (TEXT)
├── resource_id (UUID)
├── old_values (JSONB)
├── new_values (JSONB)
├── ip_address (INET)
├── user_agent (TEXT)
└── created_at (TIMESTAMP)

onboarding_steps
├── id (UUID, PK)
├── step_key (TEXT, UNIQUE)
├── step_name (TEXT)
├── step_description (TEXT)
├── step_order (INTEGER)
├── is_required (BOOLEAN)
├── can_skip (BOOLEAN)
├── estimated_minutes (INTEGER)
├── component_name (TEXT)
└── created_at (TIMESTAMP)

user_onboarding_progress
├── id (UUID, PK)
├── user_id (UUID, FK)
├── tenant_id (UUID, FK)
├── step_id (UUID, FK)
├── status (ENUM)
├── started_at (TIMESTAMP)
├── completed_at (TIMESTAMP)
├── data (JSONB)
└── updated_at (TIMESTAMP)
```

## Security Implementation

### Row Level Security (RLS)
All tables implement RLS policies that enforce:
- **Tenant isolation**: Users can only access data from their tenant
- **Role-based permissions**: Access based on user roles and permissions
- **Data ownership**: Users can access their own data where applicable
- **Cross-tenant protection**: Prevents data leakage between tenants

### Key Security Functions
```sql
-- Get current user's tenant context
get_current_tenant_context() RETURNS TABLE(tenant_id, user_role, permissions, is_active)

-- Check if user has specific permission
user_has_permission(permission_name TEXT) RETURNS BOOLEAN

-- Check if user can access resource with specific action
can_access_resource(resource_name TEXT, action_name TEXT) RETURNS BOOLEAN

-- Validate tenant access before operations
validate_tenant_access() RETURNS TRIGGER
```

### Audit Trail
Comprehensive audit logging captures:
- **All DML operations** (INSERT, UPDATE, DELETE)
- **User context** (who, when, from where)
- **Data changes** (before/after values)
- **Session information** (device, IP, user agent)

## Performance Optimizations

### Indexing Strategy
- **Primary keys** on all tables (UUID)
- **Foreign key indexes** for join performance
- **Tenant isolation indexes** for RLS performance
- **Query-specific indexes** for common access patterns
- **Composite indexes** for multi-column queries

### Materialized Views
- **Reporting views** for complex aggregations
- **Dashboard metrics** pre-calculated for performance
- **Analytics summaries** for trend analysis
- **Refresh strategies** based on data freshness requirements

### Connection Management
- **Connection pooling** with configurable limits
- **Read replicas** for reporting queries
- **Load balancing** across multiple connections
- **Timeout configurations** for different query types

## Data Integrity & Constraints

### Business Rules
- **Unique constraints** on business identifiers (SKU, email, etc.)
- **Check constraints** for data validation
- **Foreign key constraints** for referential integrity
- **Generated columns** for computed values (quantity_available)

### Data Validation
- **JSON schema validation** for complex data structures
- **Enum constraints** for controlled vocabularies
- **Range checks** for numeric values
- **Format validation** for emails, phone numbers, etc.

## Migration Strategy

### Migration Dependencies
Migrations are ordered to respect dependencies:
1. **Base schema** (tenants, users, core tables)
2. **Multi-tenant setup** (RLS, security functions)
3. **Business domains** (inventory, sales, CRM, HR, accounting)
4. **Advanced features** (workflows, APIs, webhooks)
5. **Security enhancements** (audit, session management)
6. **Final optimizations** (indexes, constraints, performance)

### Rollback Strategy
- **Reversible migrations** where possible
- **Data preservation** during schema changes
- **Backup procedures** before major changes
- **Testing environments** for migration validation

## Scalability Considerations

### Horizontal Scaling
- **Tenant-based partitioning** for large datasets
- **Read replica support** for reporting workloads
- **Connection pooling** for high concurrency
- **Caching layers** for frequently accessed data

### Vertical Scaling
- **Resource monitoring** and optimization
- **Query performance tuning**
- **Index maintenance** and optimization
- **Storage management** and archiving strategies

## Monitoring & Maintenance

### Performance Monitoring
- **Query performance tracking**
- **Index usage analysis**
- **Connection pool monitoring**
- **Resource utilization tracking**

### Data Maintenance
- **Automated cleanup** of expired sessions
- **Archive procedures** for historical data
- **Data retention policies** for compliance
- **Backup verification** and testing

This architecture provides a solid foundation for enterprise-grade multi-tenant SaaS operations with comprehensive security, performance optimization, and scalability features.
