# KiTS Hub Migration Execution Plan

## Overview

This document outlines the comprehensive migration strategy for the KiTS Hub multi-tenant SaaS platform. The migration plan ensures proper sequencing, dependency management, and rollback procedures for all 18 database migrations.

## Migration Files Analysis

### Migration Inventory
Based on analysis of the 18 migration files in `business-kits/supabase/migrations/`:

1. **20241226_base_schema.sql** - Core tables (products, customers, sales, employees, inventory_movements)
2. **20241226_create_multi_tenant_schema.sql** - Multi-tenant setup with RLS
3. **20241226_multi_store_support.sql** - Multi-location support
4. **20241226_tenant_management_functions.sql** - Tenant context functions
5. **20241226_update_rls_policies.sql** - Enhanced RLS policies
6. **20241227_advanced_inventory_schema.sql** - Advanced inventory (suppliers, batches, purchase orders)
7. **20241227_crm_enhancement_schema.sql** - CRM features (communications, segments, loyalty)
8. **20241227_enhanced_pos_features.sql** - POS enhancements (tips, discounts, promotions)
9. **20241227_enhanced_security_policies.sql** - Security policy updates
10. **20241227_fix_security_policies.sql** - Security policy fixes
11. **20241228_advanced_roles_permissions.sql** - RBAC system (roles, permissions)
12. **20241228_multi_location_support.sql** - Enhanced location management
13. **20241228_public_api_webhooks.sql** - API and webhook system
14. **20241228_workflow_automation.sql** - Workflow automation engine
15. **20241229_add_product_variants_support.sql** - Product variants support
16. **20241230_enhanced_auth_schema_final.sql** - Enhanced authentication and onboarding
17. **20241230_enhanced_security_policies_final.sql** - Final security policies and functions
18. **20241226_audit_logging.sql** - Audit logging system

## Dependency Analysis

### Critical Dependencies
```mermaid
graph TD
    A[Base Schema] --> B[Multi-Tenant Setup]
    B --> C[Tenant Management Functions]
    C --> D[Advanced Roles & Permissions]
    B --> E[Enhanced Security Policies]
    D --> E
    B --> F[Advanced Inventory Schema]
    B --> G[CRM Enhancement Schema]
    B --> H[Enhanced POS Features]
    B --> I[Multi-Location Support]
    B --> J[Public API & Webhooks]
    B --> K[Workflow Automation]
    B --> L[Enhanced Auth Schema]
    E --> M[Final Security Policies]
    F --> N[Product Variants Support]
    A --> O[Audit Logging]
```

### Migration Categories

#### Phase 1: Foundation (Migrations 1-5)
**Dependencies**: None (can run independently)
- **20241226_base_schema.sql** - Core business tables
- **20241226_create_multi_tenant_schema.sql** - Multi-tenant structure
- **20241226_multi_store_support.sql** - Location support
- **20241226_tenant_management_functions.sql** - Tenant functions
- **20241226_update_rls_policies.sql** - Initial RLS

#### Phase 2: Security & Access Control (Migrations 6-11)
**Dependencies**: Phase 1 complete
- **20241227_enhanced_security_policies.sql** - Security enhancements
- **20241227_fix_security_policies.sql** - Security fixes
- **20241228_advanced_roles_permissions.sql** - RBAC system

#### Phase 3: Business Logic (Migrations 12-16)
**Dependencies**: Phase 1 + Phase 2
- **20241228_multi_location_support.sql** - Enhanced locations
- **20241227_advanced_inventory_schema.sql** - Advanced inventory
- **20241227_crm_enhancement_schema.sql** - CRM features
- **20241227_enhanced_pos_features.sql** - POS enhancements
- **20241228_public_api_webhooks.sql** - API system
- **20241228_workflow_automation.sql** - Workflows
- **20241229_add_product_variants_support.sql** - Product variants

#### Phase 4: Authentication & Finalization (Migrations 17-18)
**Dependencies**: All previous phases
- **20241230_enhanced_auth_schema_final.sql** - Authentication system
- **20241230_enhanced_security_policies_final.sql** - Final security
- **20241226_audit_logging.sql** - Audit system

## Execution Strategy

### Pre-Migration Checklist

#### Environment Preparation
```bash
# 1. Backup current database
pg_dump -h localhost -U postgres -d kits_hub > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

# 2. Check database version
SELECT version();

# 3. Verify current schema
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

# 4. Check active connections
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

#### Prerequisites Verification
- [ ] Database backup completed
- [ ] Maintenance window scheduled (minimum 2 hours)
- [ ] Application downtime communicated
- [ ] Rollback plan documented
- [ ] Test environment ready for validation
- [ ] Monitoring tools configured

### Migration Execution Order

#### Phase 1: Foundation (Estimated: 15 minutes)
```sql
-- Migration 1: Base Schema
\i 20241226_base_schema.sql
-- Verify: products, customers, sales, employees, inventory_movements tables created

-- Migration 2: Multi-Tenant Setup
\i 20241226_create_multi_tenant_schema.sql
-- Verify: tenants, tenant_users tables created, RLS enabled

-- Migration 3: Multi-Store Support
\i 20241226_multi_store_support.sql
-- Verify: location support added to core tables

-- Migration 4: Tenant Management Functions
\i 20241226_tenant_management_functions.sql
-- Verify: current_tenant_id(), current_user_role() functions created

-- Migration 5: Update RLS Policies
\i 20241226_update_rls_policies.sql
-- Verify: Enhanced RLS policies applied
```

#### Phase 2: Security & Access Control (Estimated: 20 minutes)
```sql
-- Migration 6: Enhanced Security Policies
\i 20241227_enhanced_security_policies.sql
-- Verify: Security policy enhancements applied

-- Migration 7: Fix Security Policies
\i 20241227_fix_security_policies.sql
-- Verify: Security policy fixes applied

-- Migration 8: Advanced Roles & Permissions
\i 20241228_advanced_roles_permissions.sql
-- Verify: roles, permissions, role_permissions, user_roles tables created
```

#### Phase 3: Business Logic (Estimated: 45 minutes)
```sql
-- Migration 9: Enhanced Multi-Location Support
\i 20241228_multi_location_support.sql
-- Verify: Enhanced location management created

-- Migration 10: Advanced Inventory Schema
\i 20241227_advanced_inventory_schema.sql
-- Verify: suppliers, product_batches, purchase_orders, stock_transfers created

-- Migration 11: CRM Enhancement Schema
\i 20241227_crm_enhancement_schema.sql
-- Verify: customer_communications, marketing_campaigns, loyalty_programs created

-- Migration 12: Enhanced POS Features
\i 20241227_enhanced_pos_features.sql
-- Verify: split_payments, tips, discount_coupons, promotions created

-- Migration 13: Public API & Webhooks
\i 20241228_public_api_webhooks.sql
-- Verify: api_keys, webhooks, webhook_deliveries, api_usage_logs created

-- Migration 14: Workflow Automation
\i 20241228_workflow_automation.sql
-- Verify: workflows, workflow_executions, workflow_schedules created

-- Migration 15: Product Variants Support
\i 20241229_add_product_variants_support.sql
-- Verify: products.variants, supplier, validity_date columns added
```

#### Phase 4: Authentication & Finalization (Estimated: 30 minutes)
```sql
-- Migration 16: Enhanced Auth Schema
\i 20241230_enhanced_auth_schema_final.sql
-- Verify: user_profiles, user_sessions, invitations, audit_logs created

-- Migration 17: Final Security Policies
\i 20241230_enhanced_security_policies_final.sql
-- Verify: Final security functions and policies applied

-- Migration 18: Audit Logging
\i 20241226_audit_logging.sql
-- Verify: Audit logging system activated
```

### Post-Migration Validation

#### Schema Validation
```sql
-- 1. Verify all tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Verify RLS enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 3. Verify indexes created
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- 4. Verify functions created
SELECT proname, prosrc 
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace 
ORDER BY proname;
```

#### Data Integrity Checks
```sql
-- 1. Verify tenant isolation
SELECT tenant_id, COUNT(*) 
FROM products 
GROUP BY tenant_id;

-- 2. Verify foreign key constraints
SELECT tc.table_name, tc.constraint_name 
FROM information_schema.table_constraints tc 
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public';

-- 3. Verify check constraints
SELECT tc.table_name, tc.constraint_name, tc.check_clause 
FROM information_schema.table_constraints tc 
WHERE tc.constraint_type = 'CHECK' 
AND tc.table_schema = 'public';
```

#### Performance Validation
```sql
-- 1. Analyze table statistics
ANALYZE;

-- 2. Check query performance
EXPLAIN ANALYZE SELECT * FROM products WHERE tenant_id = $1;

-- 3. Verify index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read 
FROM pg_stat_user_indexes 
WHERE schemaname = 'public';
```

## Rollback Strategy

### Rollback Triggers
Rollback should be initiated if:
- [ ] Migration fails with critical error
- [ ] Data integrity issues detected
- [ ] Performance degradation > 50%
- [ ] Application functionality broken
- [ ] Security vulnerabilities identified

### Rollback Procedures

#### Immediate Rollback (Database Issues)
```bash
# 1. Stop application services
systemctl stop kits-hub-app

# 2. Restore from backup
psql -h localhost -U postgres -d kits_hub < backup_before_migration_YYYYMMDD_HHMMSS.sql

# 3. Verify restoration
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
```

#### Partial Rollback (Phase-specific)
```sql
-- Example: Rollback Phase 3 (Business Logic)
-- Drop tables created in Phase 3
DROP TABLE IF EXISTS workflow_executions CASCADE;
DROP TABLE IF EXISTS workflow_schedules CASCADE;
DROP TABLE IF EXISTS workflows CASCADE;
DROP TABLE IF EXISTS webhook_deliveries CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;
DROP TABLE IF EXISTS api_usage_logs CASCADE;
DROP TABLE IF EXISTS api_keys CASCADE;

-- Restore previous state
-- (Manual intervention may be required)
```

### Rollback Validation
```sql
-- Verify rollback completeness
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Verify data integrity
SELECT COUNT(*) FROM products; -- Should match pre-migration count

-- Test application connectivity
-- (Application-level testing required)
```

## Environment-Specific Configurations

### Development Environment
```bash
# Development settings
export DATABASE_URL="postgresql://postgres:password@localhost:5432/kits_hub_dev"
export SUPABASE_URL="http://localhost:5432"
export SUPABASE_ANON_KEY="dev_anon_key"
export SUPABASE_SERVICE_ROLE_KEY="dev_service_key"

# Migration settings
export MIGRATION_TIMEOUT=300
export MIGRATION_BATCH_SIZE=1000
export MIGRATION_DRY_RUN=false
```

### Staging Environment
```bash
# Staging settings
export DATABASE_URL="postgresql://postgres:password@staging-db:5432/kits_hub_staging"
export SUPABASE_URL="https://staging.supabase.co"
export SUPABASE_ANON_KEY="staging_anon_key"
export SUPABASE_SERVICE_ROLE_KEY="staging_service_key"

# Migration settings
export MIGRATION_TIMEOUT=600
export MIGRATION_BATCH_SIZE=5000
export MIGRATION_DRY_RUN=true
```

### Production Environment
```bash
# Production settings
export DATABASE_URL="postgresql://postgres:password@prod-db-cluster:5432/kits_hub_prod"
export SUPABASE_URL="https://prod.supabase.co"
export SUPABASE_ANON_KEY="prod_anon_key"
export SUPABASE_SERVICE_ROLE_KEY="prod_service_key"

# Migration settings
export MIGRATION_TIMEOUT=1800
export MIGRATION_BATCH_SIZE=10000
export MIGRATION_DRY_RUN=false
export MIGRATION_BACKUP_REQUIRED=true
```

## Seed Data Strategy

### Development Seed Data
```sql
-- Create test tenant
INSERT INTO tenants (name, slug, settings, subscription_plan) VALUES
('Test Organization', 'test-org', '{"theme": "light", "timezone": "UTC"}', 'premium');

-- Create test users
INSERT INTO auth.users (email, email_confirmed_at) VALUES
('admin@test.com', NOW()),
('manager@test.com', NOW()),
('cashier@test.com', NOW());

-- Create tenant user assignments
INSERT INTO tenant_users (tenant_id, user_id, role, is_active)
SELECT t.id, u.id, 'owner', true
FROM tenants t, auth.users u 
WHERE t.slug = 'test-org' AND u.email = 'admin@test.com';

-- Create sample products
INSERT INTO products (tenant_id, name, description, price, cost, sku, category, stock_quantity)
SELECT t.id, 'Sample Product', 'Test product for development', 99.99, 75.00, 'SAMPLE-001', 'Test Category', 100
FROM tenants t WHERE t.slug = 'test-org';
```

### Production Seed Data
```sql
-- Create system tenant for internal operations
INSERT INTO tenants (name, slug, settings, subscription_plan, is_active) VALUES
('System Operations', 'system', '{"internal": true}', 'enterprise', true);

-- Create default roles and permissions
-- (Handled by migration files)

-- Create system workflows
-- (Handled by migration files)
```

## Monitoring & Logging

### Migration Monitoring
```bash
# Monitor migration progress
watch -n 5 "psql -h localhost -U postgres -d kits_hub -c 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '\''public'\'';'"

# Monitor database connections
watch -n 5 "psql -h localhost -U postgres -d kits_hub -c 'SELECT count(*) FROM pg_stat_activity WHERE state = '\''active'\'';'"

# Monitor disk space
df -h /var/lib/postgresql
```

### Logging Configuration
```sql
-- Enable detailed logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;
ALTER SYSTEM SET log_duration = on;
SELECT pg_reload_conf();

-- Create migration log table
CREATE TABLE IF NOT EXISTS migration_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_name TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL,
    error_message TEXT,
    rows_affected INTEGER DEFAULT 0
);
```

## Troubleshooting Guide

### Common Issues

#### Issue 1: RLS Policy Conflicts
**Symptoms**: Permission denied errors
**Solution**: 
```sql
-- Drop conflicting policies
DROP POLICY IF EXISTS "conflicting_policy_name" ON table_name;

-- Recreate with correct conditions
CREATE POLICY "correct_policy_name" ON table_name FOR ALL USING (...);
```

#### Issue 2: Foreign Key Constraint Violations
**Symptoms**: Constraint violation errors
**Solution**:
```sql
-- Identify constraint
SELECT conname, conrelid::regclass, confrelid::regclass 
FROM pg_constraint 
WHERE conrelid = 'table_name'::regclass;

-- Temporarily disable constraint
ALTER TABLE table_name DISABLE TRIGGER ALL;

-- Fix data issues
-- Re-enable constraint
ALTER TABLE table_name ENABLE TRIGGER ALL;
```

#### Issue 3: Performance Degradation
**Symptoms**: Slow queries after migration
**Solution**:
```sql
-- Rebuild indexes
REINDEX DATABASE kits_hub;

-- Update statistics
ANALYZE;

-- Check query plans
EXPLAIN ANALYZE SELECT * FROM problematic_table WHERE condition;
```

### Emergency Procedures

#### Database Corruption
```bash
# 1. Immediate backup
pg_dump -h localhost -U postgres -d kits_hub > emergency_backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Check database integrity
pg_dump -h localhost -U postgres -d kits_hub --schema-only > schema_check.sql

# 3. Restore from last known good backup
psql -h localhost -U postgres -d kits_hub < last_known_good_backup.sql
```

#### Connection Exhaustion
```bash
# 1. Check connection count
psql -h localhost -U postgres -d kits_hub -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"

# 2. Kill idle connections
psql -h localhost -U postgres -d kits_hub -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND query_start < now() - interval '1 hour';"

# 3. Increase connection limit
ALTER SYSTEM SET max_connections = 200;
SELECT pg_reload_conf();
```

## Success Criteria

### Migration Success Indicators
- [ ] All 18 migrations executed without errors
- [ ] All tables created with correct structure
- [ ] RLS policies enabled and working correctly
- [ ] Indexes created and performing optimally
- [ ] Foreign key constraints enforced
- [ ] Data integrity preserved
- [ ] Application connectivity restored
- [ ] Performance benchmarks met
- [ ] Security controls functioning

### Validation Checklist
```sql
-- Table count verification
SELECT COUNT(*) as expected_tables FROM (
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name NOT LIKE 'pg_%'
) AS all_tables;

-- RLS verification
SELECT COUNT(*) as rls_enabled_tables 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Index verification
SELECT COUNT(*) as indexes_created 
FROM pg_indexes 
WHERE schemaname = 'public';

-- Function verification
SELECT COUNT(*) as functions_created 
FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace;
```

## Timeline

### Migration Window: 4 hours
- **Phase 1**: 15 minutes (Foundation)
- **Phase 2**: 20 minutes (Security)
- **Phase 3**: 45 minutes (Business Logic)
- **Phase 4**: 30 minutes (Authentication)
- **Validation**: 30 minutes (Testing)
- **Buffer**: 80 minutes (Contingency)

### Critical Path
1. **Backup Creation** (10 minutes)
2. **Phase 1-4 Execution** (110 minutes)
3. **Validation & Testing** (30 minutes)
4. **Application Verification** (30 minutes)
5. **Performance Tuning** (30 minutes)

## Communication Plan

### Stakeholder Notifications
- **Development Team**: 24 hours before migration
- **Operations Team**: 12 hours before migration
- **Customer Support**: 6 hours before migration
- **End Users**: 2 hours before migration

### Status Updates
- **Migration Start**: Immediate notification
- **Phase Completion**: Updates after each phase
- **Issues Detected**: Immediate notification with ETA
- **Migration Complete**: Success confirmation with summary

This migration execution plan provides a comprehensive framework for safely and efficiently migrating the KiTS Hub database to the new multi-tenant architecture while maintaining data integrity, security, and performance standards.
