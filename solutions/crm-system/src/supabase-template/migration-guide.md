# KiTS Hub Supabase Template Migration Guide

This guide explains how to provision new customer backends using the KiTS Hub Supabase template.

## Overview

The KiTS Hub architecture provides each customer with a dedicated Supabase instance. This template contains all necessary tables, functions, and security policies to support our multi-tenant SaaS solutions.

## Prerequisites

- Supabase CLI installed and configured
- Admin access to KiTS Hub provisioning system
- Customer's subscription details from kits-hub-v2.0

## Migration Process

### 1. Create New Supabase Project

```bash
# Using Supabase CLI
supabase projects create <PROJECT_NAME> --db-password <SECURE_PASSWORD>

# Or via dashboard at https://app.supabase.com
```

### 2. Apply Base Schema

```bash
# Connect to the new project
supabase link --project-ref <PROJECT_ID>

# Apply the template schema
psql <DATABASE_URL> -f shared/supabase-template/schema.sql
```

### 3. Configure Tenant

```sql
-- Insert the new tenant
INSERT INTO tenants (name, slug, plan_type, billing_cycle, status)
VALUES (
    '<CUSTOMER_COMPANY_NAME>',
    '<CUSTOMER_SLUG>',
    '<PLAN_TYPE>',
    '<BILLING_CYCLE>',
    'active'
);

-- Get the tenant ID for subsequent steps
SELECT id FROM tenants WHERE slug = '<CUSTOMER_SLUG>';
```

### 4. Create Admin User

```sql
-- Create the first admin user for the customer
INSERT INTO users (
    tenant_id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    permissions
) VALUES (
    '<TENANT_ID>',
    '<ADMIN_EMAIL>',
    '<HASHED_PASSWORD>',
    '<FIRST_NAME>',
    '<LAST_NAME>',
    'admin',
    '["*"]' -- Full permissions
);
```

### 5. Configure Solution-Specific Features

Based on the customer's subscription, enable relevant features:

#### Inventory Management
```sql
-- Enable inventory features
INSERT INTO inventory_settings (tenant_id, track_batches, track_expiration, low_stock_alert_enabled)
VALUES ('<TENANT_ID>', true, true, true)
ON CONFLICT (tenant_id) DO UPDATE SET
    track_batches = EXCLUDED.track_batches,
    track_expiration = EXCLUDED.track_expiration,
    low_stock_alert_enabled = EXCLUDED.low_stock_alert_enabled;
```

#### Point of Sale
```sql
-- POS is enabled by default for plans that include it
-- No additional setup required
```

#### CRM System
```sql
-- CRM features are enabled based on user permissions
-- No additional setup required
```

### 6. Set Up Row Level Security Context

```sql
-- Set the tenant context for the session
SET app.current_tenant_id = '<TENANT_ID>';
```

### 7. Configure API Keys

Generate and store API keys for the customer:

```sql
-- Store API keys in a secure location
-- These will be used by the customer's applications
```

## Feature-Based Provisioning

### Starter Plan
- Basic inventory management (single location)
- Limited to 100 products
- Basic reporting

### Basic Plan
- Full inventory management (multiple locations)
- Point of Sale system
- Advanced reporting
- Customer management (basic)

### Professional Plan
- All Basic features
- Advanced CRM
- Batch tracking
- Expiration tracking
- Custom reports

### Enterprise Plan
- All Professional features
- HR Management
- Accounting System
- Advanced analytics
- Custom integrations

## Post-Migration Tasks

### 1. Update KiTS Hub Systems

```bash
# Update customer record in kits-hub-v2.0
curl -X POST https://kits-hub.vercel.app/api/customers/<CUSTOMER_ID>/provisioned \
  -H "Content-Type: application/json" \
  -d '{
    "supabase_url": "https://<PROJECT_ID>.supabase.co",
    "supabase_anon_key": "<ANON_KEY>",
    "supabase_service_key": "<SERVICE_KEY>",
    "status": "active"
  }'
```

### 2. Configure Application Access

Update each solution's environment variables with the customer's Supabase credentials:

```bash
# Inventory Management
VITE_SUPABASE_URL=https://<PROJECT_ID>.supabase.co
VITE_SUPABASE_ANON_KEY=<ANON_KEY>

# Point of Sale
VITE_SUPABASE_URL=https://<PROJECT_ID>.supabase.co
VITE_SUPABASE_ANON_KEY=<ANON_KEY>

# ... etc for each solution
```

### 3. Set Up Custom Domain (Enterprise)

For enterprise customers with custom domains:

```bash
# Configure custom domain in Supabase
supabase domains create <CUSTOM_DOMAIN> --project <PROJECT_ID>

# Update DNS records
# A record: <CUSTOM_DOMAIN> -> <SUPABASE_IP>
# CNAME record: www.<CUSTOM_DOMAIN> -> <CUSTOM_DOMAIN>
```

## Security Considerations

### 1. Row Level Security
- All tables have RLS policies enabled
- Data isolation is enforced at the database level
- Tenant context must be set for all operations

### 2. API Security
- Use service role keys for server-side operations
- Use anon keys for client-side operations
- Implement proper authentication flows

### 3. Backup Strategy
```sql
-- Enable daily backups
-- Configure point-in-time recovery
-- Set up backup retention policies
```

## Monitoring and Maintenance

### 1. Health Checks
```sql
-- Monitor database performance
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Check RLS policy effectiveness
SELECT * FROM pg_policies WHERE tablename = 'products';
```

### 2. Usage Monitoring
```sql
-- Track API usage
SELECT COUNT(*) as requests, DATE_TRUNC('hour', created_at) as hour
FROM analytics_events
WHERE tenant_id = '<TENANT_ID>'
GROUP BY hour
ORDER BY hour DESC;
```

### 3. Storage Management
```sql
-- Monitor storage usage
SELECT 
    pg_size_pretty(pg_database_size('<DATABASE_NAME>')) as database_size,
    pg_size_pretty(pg_total_relation_size('products')) as products_size,
    pg_size_pretty(pg_total_relation_size('sales')) as sales_size;
```

## Troubleshooting

### Common Issues

1. **RLS Policy Blocking Access**
   ```sql
   -- Check current tenant context
   SELECT current_setting('app.current_tenant_id');
   
   -- Verify RLS policies
   SELECT * FROM pg_policies WHERE tablename = 'products';
   ```

2. **Permission Denied Errors**
   ```sql
   -- Check user permissions
   SELECT role, permissions FROM users WHERE email = '<USER_EMAIL>';
   ```

3. **Performance Issues**
   ```sql
   -- Analyze slow queries
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   ```

## Automation Scripts

### Provisioning Script
```bash
#!/bin/bash
# provision-customer.sh

CUSTOMER_NAME=$1
PLAN_TYPE=$2
BILLING_CYCLE=$3

echo "Provisioning customer: $CUSTOMER_NAME"

# Create Supabase project
PROJECT_ID=$(supabase projects create $CUSTOMER_NAME --db-password $SECURE_PASSWORD --output json | jq -r '.id')

# Apply schema
psql $DATABASE_URL -f shared/supabase-template/schema.sql

# Configure tenant
psql $DATABASE_URL -c "
INSERT INTO tenants (name, slug, plan_type, billing_cycle, status)
VALUES ('$CUSTOMER_NAME', '$CUSTOMER_NAME', '$PLAN_TYPE', '$BILLING_CYCLE', 'active');
"

echo "Customer provisioned successfully: $PROJECT_ID"
```

### Deprovisioning Script
```bash
#!/bin/bash
# deprovision-customer.sh

CUSTOMER_ID=$1

echo "Deprovisioning customer: $CUSTOMER_ID"

# Backup data
pg_dump $DATABASE_URL > "backups/$CUSTOMER_ID-$(date +%Y%m%d).sql"

# Pause project
supabase projects pause $CUSTOMER_ID

echo "Customer deprovisioned: $CUSTOMER_ID"
```

## Best Practices

1. **Always use transactions** when modifying multiple tables
2. **Validate tenant context** before any data operation
3. **Implement proper error handling** in all API calls
4. **Monitor resource usage** to prevent overages
5. **Regular backups** and point-in-time recovery setup
6. **Audit logging** for all sensitive operations
7. **Rate limiting** on API endpoints
8. **Regular security updates** and dependency management

## Support

For issues with the migration process:

1. Check the Supabase logs
2. Review the error messages in detail
3. Consult the troubleshooting section
4. Contact the KiTS Hub development team

## Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [KiTS Hub Architecture](../../ARCHITECTURE.md)
- [Solution Integration Guides](../solutions/)
