# KiTS Hub Database Architecture Documentation

## Overview

The KiTS Hub database is a comprehensive multi-tenant SaaS platform built on PostgreSQL with Supabase. It supports 6 core business solutions: Inventory Management, Point of Sale, CRM System, HR Management, Accounting, and Analytics Dashboard.

## Architecture Principles

### Multi-Tenancy
- **Row Level Security (RLS)** ensures complete tenant isolation
- **Tenant-aware functions** provide secure context switching
- **Shared infrastructure** with logical data separation

### Security
- **Role-Based Access Control (RBAC)** with 8 predefined roles
- **Granular permissions** system with resource-action mapping
- **Audit logging** for compliance and security monitoring
- **Session management** with device tracking and expiration

### Performance
- **Strategic indexing** on foreign keys and query patterns
- **Materialized views** for reporting and analytics
- **Connection pooling** and query optimization
- **Batch operations** for high-volume data processing

## Core Tables

### 1. Multi-Tenant Foundation

#### `tenants`
Primary tenant management table with business information and settings.
```sql
- id: UUID (Primary Key)
- name: TEXT
- slug: TEXT (Unique)
- subscription_plan: TEXT
- settings: JSONB
- is_active: BOOLEAN
- business_type: TEXT (retail, restaurant, service, etc.)
- size: TEXT (solo, small, medium, large, enterprise)
- currency: TEXT (default: USD)
- timezone: TEXT (default: UTC)
```

#### `tenant_users`
Junction table for user-tenant relationships with role assignments.
```sql
- tenant_id: UUID (FK → tenants.id)
- user_id: UUID (FK → auth.users.id)
- role: TEXT (owner, manager, cashier, viewer)
- is_active: BOOLEAN
```

#### `user_profiles`
Extended user information with preferences and security settings.
```sql
- user_id: UUID (FK → auth.users.id)
- first_name: TEXT
- last_name: TEXT
- phone: TEXT
- avatar_url: TEXT
- timezone: TEXT
- language: TEXT
- mfa_enabled: BOOLEAN
- onboarding_step: INTEGER
```

### 2. Role-Based Access Control

#### `roles`
System and tenant-specific roles with hierarchical permissions.
```sql
- id: UUID (Primary Key)
- name: TEXT (Unique)
- description: TEXT
- is_system_role: BOOLEAN
- tenant_id: UUID (FK → tenants.id, nullable for system roles)
```

#### `permissions`
Granular permissions mapped to resources and actions.
```sql
- id: UUID (Primary Key)
- name: TEXT (Unique) - e.g., "products.create"
- resource: TEXT - products, sales, customers, etc.
- action: TEXT - create, read, update, delete, execute, manage
```

#### `role_permissions`
Many-to-many relationship between roles and permissions.
```sql
- role_id: UUID (FK → roles.id)
- permission_id: UUID (FK → permissions.id)
```

#### `user_roles`
User role assignments with expiration and activation control.
```sql
- user_id: UUID (FK → auth.users.id)
- tenant_id: UUID (FK → tenants.id)
- role_id: UUID (FK → roles.id)
- expires_at: TIMESTAMP
- is_active: BOOLEAN
```

### 3. Business Solution Tables

#### Inventory Management

**`products`**
Core product catalog with variants and pricing.
```sql
- id: UUID (Primary Key)
- tenant_id: UUID (FK → tenants.id)
- name: TEXT
- description: TEXT
- price: DECIMAL(10,2)
- cost: DECIMAL(10,2)
- sku: TEXT (Unique per tenant)
- barcode: TEXT
- category: TEXT
- stock_quantity: INTEGER
- min_stock_level: INTEGER
- track_batches: BOOLEAN
- track_expiration: BOOLEAN
- variants: JSONB
- supplier: TEXT
- validity_date: TIMESTAMP
```

**`suppliers`**
Supplier management with contact and payment information.
```sql
- id: UUID (Primary Key)
- tenant_id: UUID (FK → tenants.id)
- name: TEXT
- contact_person: TEXT
- email: TEXT
- phone: TEXT
- address: JSONB
- tax_id: TEXT
- payment_terms: TEXT
- lead_time_days: INTEGER
```

**`locations`**
Multi-location support for inventory and operations.
```sql
- id: UUID (Primary Key)
- tenant_id: UUID (FK → tenants.id)
- name: TEXT
- code: TEXT (Unique per tenant)
- type: TEXT (store, warehouse, office, pop-up, online)
- address: JSONB
- operating_hours: JSONB
- is_primary: BOOLEAN
```

**`product_batches`**
Batch tracking for expiration and cost management.
```sql
- id: UUID (Primary Key)
- tenant_id: UUID (FK → tenants.id)
- product_id: UUID (FK → products.id)
- location_id: UUID (FK → locations.id)
- batch_number: TEXT
- quantity: INTEGER
- quantity_reserved: INTEGER
- unit_cost: DECIMAL(10,2)
- manufacture_date: DATE
- expiration_date: DATE
```

**`purchase_orders`**
Purchase order management with approval workflows.
```sql
- id: UUID (Primary Key)
- tenant_id: UUID (FK → tenants.id)
- supplier_id: UUID (FK → suppliers.id)
- order_number: TEXT (Unique per tenant)
- status: TEXT (draft, sent, confirmed, partial, received)
- subtotal: DECIMAL(10,2)
- total_amount: DECIMAL(10,2)
```

#### Point of Sale

**`sales`**
Sales transaction management with payment and tax processing.
```sql
- id: UUID (Primary Key)
- tenant_id: UUID (FK → tenants.id)
- customer_id: UUID (FK → customers.id)
- employee_id: UUID (FK → employees.id)
- location_id: UUID (FK → locations.id)
- sale_date: TIMESTAMP
- subtotal: DECIMAL(10,2)
- tax_amount: DECIMAL(10,2)
- total_amount: DECIMAL(10,2)
- payment_method: TEXT
- payment_status: TEXT
- tip_info: JSONB
- applied_coupon_id: UUID (FK → discount_coupons.id)
- loyalty_points_earned: INTEGER
```

**`sale_items`**
Line items for sales transactions.
```sql
- id: UUID (Primary Key)
- sale_id: UUID (FK → sales.id)
- product_id: UUID (FK → products.id)
- quantity: INTEGER
- unit_price: DECIMAL(10,2)
- total_price: DECIMAL(10,2)
```

**`split_payments`**
Support for multiple payment methods per transaction.
```sql
- id: UUID (Primary Key)
- sale_id: UUID (FK → sales.id)
- payment_method: TEXT (cash, card, digital)
- amount: DECIMAL(10,2)
- status: TEXT
- transaction_id: TEXT
```

**`tips`**
Employee tip tracking and distribution.
```sql
- id: UUID (Primary Key)
- sale_id: UUID (FK → sales.id)
- amount: DECIMAL(10,2)
- tip_type: TEXT (percentage, fixed, custom)
- percentage: DECIMAL(5,2)
- employee_id: UUID (FK → employees.id)
```

#### CRM System

**`customers`**
Customer management with purchase history and segmentation.
```sql
- id: UUID (Primary Key)
- tenant_id: UUID (FK → tenants.id)
- name: TEXT
- email: TEXT (Unique per tenant)
- phone: TEXT
- address: TEXT
- total_purchases: DECIMAL(10,2)
- visit_count: INTEGER
- last_visit: TIMESTAMP
- preferred_location_id: UUID (FK → locations.id)
```

**`customer_communications`**
Communication history across all channels.
```sql
- id: UUID (Primary Key)
- customer_id: UUID (FK → customers.id)
- type: TEXT (email, sms, phone, in_person, social_media)
- direction: TEXT (inbound, outbound)
- subject: TEXT
- content: TEXT
- status: TEXT (sent, delivered, opened, replied)
- employee_id: UUID (FK → employees.id)
```

**`marketing_campaigns`**
Campaign management with targeting and analytics.
```sql
- id: UUID (Primary Key)
- name: TEXT
- type: TEXT (email, sms, social_media, loyalty, promotion)
- status: TEXT (draft, scheduled, active, completed)
- target_segment_id: UUID (FK → customer_segments.id)
- content_template: JSONB
- budget: DECIMAL(10,2)
- actual_cost: DECIMAL(10,2)
```

**`customer_segments`**
Dynamic customer segmentation with criteria-based membership.
```sql
- id: UUID (Primary Key)
- name: TEXT
- description: TEXT
- criteria: JSONB
- is_dynamic: BOOLEAN
- customer_count: INTEGER
- last_calculated: TIMESTAMP
```

**`loyalty_programs`**
Customer loyalty and rewards management.
```sql
- id: UUID (Primary Key)
- name: TEXT
- type: TEXT (points, tiers, cashback, hybrid)
- rules: JSONB
- is_active: BOOLEAN
```

**`customer_loyalty_memberships`**
Customer participation in loyalty programs.
```sql
- id: UUID (Primary Key)
- customer_id: UUID (FK → customers.id)
- program_id: UUID (FK → loyalty_programs.id)
- tier: TEXT
- points_balance: INTEGER
- total_points_earned: INTEGER
- lifetime_value: DECIMAL(10,2)
```

#### HR Management

**`employees`**
Employee management with roles and performance tracking.
```sql
- id: UUID (Primary Key)
- tenant_id: UUID (FK → tenants.id)
- name: TEXT
- email: TEXT (Unique per tenant)
- phone: TEXT
- role: TEXT
- commission: DECIMAL(5,2)
- total_sales: DECIMAL(10,2)
- shifts: JSONB
- location_id: UUID (FK → locations.id)
```

**`attendance`**
Employee attendance and time tracking.
```sql
- id: UUID (Primary Key)
- employee_id: UUID (FK → employees.id)
- check_in: TIMESTAMP
- check_out: TIMESTAMP
- break_duration: INTEGER
- location_id: UUID (FK → locations.id)
```

**`payroll`**
Payroll processing with tax and deduction management.
```sql
- id: UUID (Primary Key)
- employee_id: UUID (FK → employees.id)
- pay_period_start: DATE
- pay_period_end: DATE
- base_salary: DECIMAL(10,2)
- overtime_hours: DECIMAL(5,2)
- deductions: JSONB
- net_pay: DECIMAL(10,2)
```

#### Accounting System

**`chart_of_accounts`**
Standard chart of accounts with hierarchical structure.
```sql
- id: UUID (Primary Key)
- tenant_id: UUID (FK → tenants.id)
- account_number: TEXT
- account_name: TEXT
- account_type: TEXT (asset, liability, equity, revenue, expense)
- parent_account_id: UUID (FK → chart_of_accounts.id)
```

**`financial_transactions`**
All financial transactions with categorization.
```sql
- id: UUID (Primary Key)
- tenant_id: UUID (FK → tenants.id)
- account_id: UUID (FK → chart_of_accounts.id)
- transaction_date: DATE
- description: TEXT
- debit_amount: DECIMAL(10,2)
- credit_amount: DECIMAL(10,2)
- reference_type: TEXT (sale, purchase, adjustment)
- reference_id: UUID
```

**`invoices`**
Invoice generation and tracking.
```sql
- id: UUID (Primary Key)
- tenant_id: UUID (FK → tenants.id)
- customer_id: UUID (FK → customers.id)
- invoice_number: TEXT (Unique per tenant)
- issue_date: DATE
- due_date: DATE
- total_amount: DECIMAL(10,2)
- status: TEXT (draft, sent, paid, overdue)
```

### 4. Advanced Features

#### Workflow Automation

**`workflows`**
Custom workflow automation engine.
```sql
- id: UUID (Primary Key)
- tenant_id: UUID (FK → tenants.id)
- name: TEXT
- trigger_type: TEXT (event, schedule, manual, condition)
- trigger_config: JSONB
- actions: JSONB
- is_active: BOOLEAN
- run_count: INTEGER
```

**`workflow_executions`**
Workflow execution history and results.
```sql
- id: UUID (Primary Key)
- workflow_id: UUID (FK → workflows.id)
- status: TEXT (pending, running, completed, failed)
- started_at: TIMESTAMP
- completed_at: TIMESTAMP
- result: JSONB
```

#### Public API & Webhooks

**`api_keys`**
API key management with rate limiting and permissions.
```sql
- id: UUID (Primary Key)
- tenant_id: UUID (FK → tenants.id)
- name: TEXT
- key_hash: TEXT (Unique)
- permissions: JSONB
- rate_limit: INTEGER
- expires_at: TIMESTAMP
```

**`webhooks`**
Webhook configuration for event-driven integrations.
```sql
- id: UUID (Primary Key)
- tenant_id: UUID (FK → tenants.id)
- name: TEXT
- url: TEXT
- events: JSONB
- secret: TEXT
- active: BOOLEAN
```

#### Security & Audit

**`user_sessions`**
Session management with device tracking.
```sql
- id: UUID (Primary Key)
- user_id: UUID (FK → auth.users.id)
- tenant_id: UUID (FK → tenants.id)
- session_token: TEXT (Unique)
- device_info: JSONB
- ip_address: INET
- expires_at: TIMESTAMP
```

**`audit_logs`**
Comprehensive audit logging for compliance.
```sql
- id: UUID (Primary Key)
- user_id: UUID (FK → auth.users.id)
- tenant_id: UUID (FK → tenants.id)
- action: TEXT
- resource_type: TEXT
- resource_id: UUID
- old_values: JSONB
- new_values: JSONB
- ip_address: INET
```

## Row Level Security (RLS)

### Security Functions

#### `current_tenant_id()`
Returns the current user's tenant ID based on active membership.

#### `current_user_role()`
Returns the current user's role within the tenant context.

#### `user_has_permission(permission_name)`
Checks if the current user has a specific permission.

#### `can_access_resource(resource, action)`
Validates access to specific resources with required actions.

### RLS Policies

All tables implement RLS policies that ensure:

1. **Tenant Isolation**: Users can only access data from their tenant
2. **Role-Based Access**: Permissions are enforced based on user roles
3. **Data Integrity**: Foreign key relationships are maintained
4. **Audit Trail**: All data changes are logged

### Policy Examples

```sql
-- Products table RLS
CREATE POLICY "Product read access with permissions" ON products
    FOR SELECT USING (
        tenant_id = current_tenant_id()
        AND can_access_resource('products', 'read')
    );

CREATE POLICY "Product create access with permissions" ON products
    FOR INSERT WITH CHECK (
        tenant_id = current_tenant_id()
        AND can_access_resource('products', 'create')
    );
```

## Performance Optimization

### Indexes

Strategic indexes are created for:

1. **Foreign Keys**: All FK relationships are indexed
2. **Query Patterns**: Common WHERE clauses and JOIN conditions
3. **Tenant Isolation**: tenant_id columns on all multi-tenant tables
4. **Time Series**: created_at, updated_at, and date columns
5. **Unique Constraints**: Business identifiers like SKU, email

### Materialized Views

For reporting and analytics:

```sql
-- Daily sales summary
CREATE MATERIALIZED VIEW daily_sales_summary AS
SELECT 
    tenant_id,
    DATE(sale_date) as sale_date,
    COUNT(*) as transaction_count,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_transaction
FROM sales
GROUP BY tenant_id, DATE(sale_date);
```

### Connection Pooling

Configured for optimal performance:

- **Max Connections**: 20 per application instance
- **Idle Timeout**: 30 seconds
- **Connection Lifetime**: 1 hour
- **Retry Logic**: Exponential backoff with jitter

## Data Integrity

### Constraints

1. **Foreign Key Constraints**: Referential integrity
2. **Check Constraints**: Data validation rules
3. **Unique Constraints**: Business rule enforcement
4. **Not Null Constraints**: Required field validation

### Triggers

1. **Audit Triggers**: Automatic change logging
2. **Timestamp Triggers**: Updated_at field maintenance
3. **Validation Triggers**: Business rule enforcement
4. **Tenant Validation**: Cross-tenant access prevention

## Multi-Tenant Architecture

### Tenant Context Switching

The system supports seamless tenant switching:

```sql
-- Function to set tenant context
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid UUID)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_tenant', tenant_uuid::TEXT, true);
END;
$$ LANGUAGE plpgsql;
```

### Data Isolation Strategies

1. **Row Level Security**: Primary isolation mechanism
2. **Tenant ID Columns**: All business tables include tenant_id
3. **Function-Based Policies**: Dynamic permission checking
4. **Audit Logging**: Complete change tracking

### Cross-Tenant Operations

Limited cross-tenant operations for:

1. **System Administration**: Super admin functions
2. **Analytics**: Aggregated reporting across tenants
3. **Billing**: Subscription management
4. **Compliance**: Legal and regulatory requirements

## Migration Strategy

### Migration Dependencies

Migrations must be executed in dependency order:

1. **Base Schema** (20241226_base_schema.sql)
2. **Multi-Tenant Foundation** (20241226_create_multi_tenant_schema.sql)
3. **Advanced Features** (20241227_*.sql)
4. **Security & Roles** (20241228_advanced_roles_permissions.sql)
5. **Enhanced Features** (20241228_*.sql)
6. **Workflow Automation** (20241228_workflow_automation.sql)
7. **Product Variants** (20241229_add_product_variants_support.sql)
8. **Enhanced Auth** (20241230_enhanced_auth_schema_final.sql)
9. **Security Policies** (20241230_enhanced_security_policies_final.sql)

### Rollback Strategy

Each migration includes:

1. **Revert Scripts**: Automated rollback procedures
2. **Data Backup**: Critical data preservation
3. **Dependency Checks**: Safe rollback validation
4. **Testing Scripts**: Rollback verification

## Environment Configuration

### Development

- **Database**: PostgreSQL 14+
- **Connection Pool**: pgBouncer
- **Migration Tool**: Supabase CLI
- **Seed Data**: Comprehensive test datasets

### Staging

- **Database**: PostgreSQL 15+ (production mirroring)
- **Connection Pool**: PgBouncer with transaction pooling
- **Performance Monitoring**: Query performance analysis
- **Data Anonymization**: PII protection

### Production

- **Database**: PostgreSQL 15+ with read replicas
- **Connection Pool**: PgBouncer with session pooling
- **High Availability**: Streaming replication
- **Backup Strategy**: Point-in-time recovery
- **Monitoring**: Real-time performance metrics

## Security Considerations

### Data Encryption

1. **At Rest**: PostgreSQL TDE or filesystem encryption
2. **In Transit**: TLS 1.3 for all connections
3. **API Keys**: Hashed storage with salt
4. **Sensitive Data**: Column-level encryption for PII

### Access Control

1. **Network Security**: VPC with security groups
2. **Database Users**: Least privilege principle
3. **API Authentication**: JWT with refresh tokens
4. **Session Management**: Secure cookie handling

### Compliance

1. **GDPR**: Right to deletion and data portability
2. **SOC 2**: Security and availability controls
3. **PCI DSS**: Payment card industry compliance
4. **HIPAA**: Healthcare data protection (if applicable)

## Monitoring & Maintenance

### Performance Monitoring

1. **Query Performance**: Slow query logging and analysis
2. **Connection Metrics**: Pool utilization and wait times
3. **Resource Usage**: CPU, memory, and disk I/O
4. **Index Usage**: Unused index identification

### Maintenance Tasks

1. **Vacuum**: Regular table maintenance
2. **Analyze**: Statistics updates for query planning
3. **Reindex**: Index rebuilding for performance
4. **Archive**: Historical data management

### Backup Strategy

1. **Full Backups**: Daily full database backups
2. **Incremental Backups**: Hourly WAL archiving
3. **Point-in-Time Recovery**: 30-day retention
4. **Cross-Region Replication**: Disaster recovery

## API Integration

### RESTful Endpoints

All tables expose RESTful APIs:

- **CRUD Operations**: Create, Read, Update, Delete
- **Batch Operations**: Bulk insert and update
- **Filtering**: Advanced query parameters
- **Pagination**: Cursor-based pagination
- **Sorting**: Multi-column sorting support

### Real-time Subscriptions

Supabase real-time subscriptions for:

- **Data Changes**: Live updates for all tables
- **Presence**: User online/offline status
- **Notifications**: System alerts and messages
- **Workflow Events**: Automation triggers

### Webhooks

Event-driven webhooks for:

- **Business Events**: Sales, inventory changes, customer updates
- **System Events**: User registration, subscription changes
- **Security Events**: Login attempts, permission changes
- **Integration Events**: Third-party system synchronization

This comprehensive database architecture provides a solid foundation for the KiTS Hub multi-tenant SaaS platform with enterprise-grade security, performance, and scalability.
