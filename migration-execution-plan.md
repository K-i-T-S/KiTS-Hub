# KiTS Hub Migration Execution Plan

## Overview

This document outlines the complete migration execution plan for the KiTS Hub database schema, including dependency ordering, rollback strategies, and environment-specific configurations.

## Migration Dependencies

### Phase 1: Foundation Schema
**Priority: Critical - Must be executed first**

1. **20241226_base_schema.sql**
   - Creates core business tables (products, customers, employees, sales, etc.)
   - **Dependencies**: None
   - **Rollback**: Drop all created tables

2. **20241226_create_multi_tenant_schema.sql**
   - Adds multi-tenant support with tenant isolation
   - **Dependencies**: 20241226_base_schema.sql
   - **Rollback**: Remove tenant_id columns, drop tenant tables

### Phase 2: Advanced Business Features
**Priority: High - Core business functionality**

3. **20241227_advanced_inventory_schema.sql**
   - Adds suppliers, locations, product batches, purchase orders
   - **Dependencies**: 20241226_create_multi_tenant_schema.sql
   - **Rollback**: Drop new inventory tables, remove columns

4. **20241227_crm_enhancement_schema.sql**
   - Adds CRM features: communications, campaigns, segments, loyalty
   - **Dependencies**: 20241226_create_multi_tenant_schema.sql
   - **Rollback**: Drop CRM-specific tables

5. **20241227_enhanced_pos_features.sql**
   - Adds POS features: split payments, tips, discounts, promotions
   - **Dependencies**: 20241226_create_multi_tenant_schema.sql
   - **Rollback**: Drop POS enhancement tables

### Phase 3: Security & Access Control
**Priority: High - Security foundation**

6. **20241228_advanced_roles_permissions.sql**
   - Implements RBAC system with roles and permissions
   - **Dependencies**: 20241226_create_multi_tenant_schema.sql
   - **Rollback**: Drop RBAC tables and functions

7. **20241228_multi_location_support.sql**
   - Adds multi-location inventory management
   - **Dependencies**: 20241227_advanced_inventory_schema.sql
   - **Rollback**: Drop location-specific tables

8. **20241228_public_api_webhooks.sql**
   - Adds API keys, webhooks, and usage tracking
   - **Dependencies**: 20241228_advanced_roles_permissions.sql
   - **Rollback**: Drop API and webhook tables

### Phase 4: Workflow Automation
**Priority: Medium - Business process automation**

9. **20241228_workflow_automation.sql**
   - Adds workflow engine with triggers and actions
   - **Dependencies**: 20241228_advanced_roles_permissions.sql
   - **Rollback**: Drop workflow tables and functions

### Phase 5: Feature Enhancements
**Priority: Medium - Additional features**

10. **20241229_add_product_variants_support.sql**
    - Adds product variants and additional columns
    - **Dependencies**: 20241227_advanced_inventory_schema.sql
    - **Rollback**: Remove variant columns

### Phase 6: Authentication & Security
**Priority: High - User management and security**

11. **20241230_enhanced_auth_schema_final.sql**
    - Adds user profiles, onboarding, invitations, sessions
    - **Dependencies**: 20241228_advanced_roles_permissions.sql
    - **Rollback**: Drop auth enhancement tables

12. **20241230_enhanced_security_policies_final.sql**
    - Implements comprehensive RLS policies and security functions
    - **Dependencies**: All previous migrations
    - **Rollback**: Restore previous RLS policies

### Phase 7: Additional Features (Optional)
**Priority: Low - Supporting features**

13. **20241226_audit_logging.sql**
    - Adds comprehensive audit logging
    - **Dependencies**: 20241226_create_multi_tenant_schema.sql
    - **Rollback**: Drop audit tables and triggers

14. **20241226_multi_store_support.sql**
    - Adds multi-store capabilities
    - **Dependencies**: 20241226_create_multi_tenant_schema.sql
    - **Rollback**: Remove multi-store columns

15. **20241226_tenant_management_functions.sql**
    - Adds tenant management utility functions
    - **Dependencies**: 20241226_create_multi_tenant_schema.sql
    - **Rollback**: Drop tenant management functions

16. **20241226_update_rls_policies.sql**
    - Updates RLS policies for enhanced security
    - **Dependencies**: 20241226_create_multi_tenant_schema.sql
    - **Rollback**: Restore previous RLS policies

17. **20241227_enhanced_security_policies.sql**
    - Enhanced security policies and validation
    - **Dependencies**: 20241226_create_multi_tenant_schema.sql
    - **Rollback**: Restore previous security policies

18. **20241227_fix_security_policies.sql**
    - Fixes security policy issues
    - **Dependencies**: 20241227_enhanced_security_policies.sql
    - **Rollback**: Restore previous security policies

## Execution Order

```bash
# Phase 1: Foundation
psql -d kits_hub -f 20241226_base_schema.sql
psql -d kits_hub -f 20241226_create_multi_tenant_schema.sql

# Phase 2: Advanced Business Features
psql -d kits_hub -f 20241227_advanced_inventory_schema.sql
psql -d kits_hub -f 20241227_crm_enhancement_schema.sql
psql -d kits_hub -f 20241227_enhanced_pos_features.sql

# Phase 3: Security & Access Control
psql -d kits_hub -f 20241228_advanced_roles_permissions.sql
psql -d kits_hub -f 20241228_multi_location_support.sql
psql -d kits_hub -f 20241228_public_api_webhooks.sql

# Phase 4: Workflow Automation
psql -d kits_hub -f 20241228_workflow_automation.sql

# Phase 5: Feature Enhancements
psql -d kits_hub -f 20241229_add_product_variants_support.sql

# Phase 6: Authentication & Security
psql -d kits_hub -f 20241230_enhanced_auth_schema_final.sql
psql -d kits_hub -f 20241230_enhanced_security_policies_final.sql

# Phase 7: Additional Features (Optional)
psql -d kits_hub -f 20241226_audit_logging.sql
psql -d kits_hub -f 20241226_multi_store_support.sql
psql -d kits_hub -f 20241226_tenant_management_functions.sql
psql -d kits_hub -f 20241226_update_rls_policies.sql
psql -d kits_hub -f 20241227_enhanced_security_policies.sql
psql -d kits_hub -f 20241227_fix_security_policies.sql
```

## Environment-Specific Configurations

### Development Environment
```bash
# Database connection
export DATABASE_URL="postgresql://user:password@localhost:5432/kits_hub_dev"
export SUPABASE_URL="http://localhost:54321"
export SUPABASE_ANON_KEY="your-dev-anon-key"

# Migration settings
export MIGRATION_ENV="development"
export MIGRATION_DRY_RUN="false"
export MIGRATION_VERBOSE="true"
```

### Staging Environment
```bash
# Database connection
export DATABASE_URL="postgresql://user:password@staging-db:5432/kits_hub_staging"
export SUPABASE_URL="https://staging.supabase.co"
export SUPABASE_ANON_KEY="your-staging-anon-key"

# Migration settings
export MIGRATION_ENV="staging"
export MIGRATION_DRY_RUN="false"
export MIGRATION_VERBOSE="true"
export MIGRATION_BACKUP="true"
```

### Production Environment
```bash
# Database connection
export DATABASE_URL="postgresql://user:password@prod-db:5432/kits_hub_prod"
export SUPABASE_URL="https://prod.supabase.co"
export SUPABASE_ANON_KEY="your-prod-anon-key"

# Migration settings
export MIGRATION_ENV="production"
export MIGRATION_DRY_RUN="false"
export MIGRATION_VERBOSE="true"
export MIGRATION_BACKUP="true"
export MIGRATION_REQUIRE_CONFIRMATION="true"
```

## Rollback Strategy

### Pre-Migration Backup
```bash
# Create full database backup
pg_dump kits_hub > kits_hub_backup_$(date +%Y%m%d_%H%M%S).sql

# Create schema-only backup
pg_dump --schema-only kits_hub > kits_hub_schema_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Rollback Procedures

#### Individual Migration Rollback
```bash
# For each migration, create a corresponding rollback file
# Example: rollback_20241226_base_schema.sql
DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS products CASCADE;
```

#### Full Database Rollback
```bash
# Restore from backup
psql -d kits_hub < kits_hub_backup_20241226_120000.sql

# Or use point-in-time recovery
psql -d kits_hub -c "SELECT pg_wal_replay('2024-12-26 12:00:00');"
```

### Rollback Validation
```bash
# Verify database integrity
psql -d kits_hub -c "
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY schemaname, tablename;
"

# Check for orphaned objects
psql -d kits_hub -c "
SELECT 
    dependent_ns.nspname AS schema_name,
    dependent_class.relname AS table_name,
    dependent_class.relkind AS object_type
FROM pg_depend 
    JOIN pg_rewrite AS dependent_class ON dependent_class.oid = pg_depend.objid
    JOIN pg_namespace AS dependent_ns ON dependent_ns.oid = dependent_class.relnamespace
WHERE dependent_ns.nspname = 'public'
    AND pg_depend.deptype = 'e'
    AND NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE pg_class.oid = pg_depend.refobjid
    );
"
```

## Migration Scripts

### Automated Migration Script
```bash
#!/bin/bash
# migrate.sh - Automated migration execution script

set -e

# Configuration
MIGRATIONS_DIR="./migrations"
LOG_FILE="./migration_$(date +%Y%m%d_%H%M%S).log"
BACKUP_DIR="./backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Function to execute migration with error handling
execute_migration() {
    local migration_file=$1
    local migration_name=$(basename $migration_file .sql)
    
    echo "[$(date)] Executing migration: $migration_name" | tee -a $LOG_FILE
    
    # Create pre-migration backup
    pg_dump kits_hub > "$BACKUP_DIR/pre_$migration_name_$(date +%Y%m%d_%H%M%S).sql"
    
    # Execute migration
    if psql -d kits_hub -f $migration_file 2>&1 | tee -a $LOG_FILE; then
        echo "[$(date)] Successfully completed: $migration_name" | tee -a $LOG_FILE
        echo "$migration_name" >> ./completed_migrations.txt
    else
        echo "[$(date)] Failed migration: $migration_name" | tee -a $LOG_FILE
        exit 1
    fi
}

# Function to rollback on error
rollback_migration() {
    local migration_file=$1
    local migration_name=$(basename $migration_file .sql)
    local rollback_file="${migration_file/.sql}_rollback.sql"
    
    if [ -f "$rollback_file" ]; then
        echo "[$(date)] Rolling back: $migration_name" | tee -a $LOG_FILE
        psql -d kits_hub -f $rollback_file 2>&1 | tee -a $LOG_FILE
    else
        echo "[$(date)] No rollback file found for: $migration_name" | tee -a $LOG_FILE
    fi
}

# Main execution
main() {
    echo "[$(date)] Starting migration process" | tee -a $LOG_FILE
    
    # Check database connection
    if ! psql -d kits_hub -c "SELECT 1;" > /dev/null 2>&1; then
        echo "[$(date)] ERROR: Cannot connect to database" | tee -a $LOG_FILE
        exit 1
    fi
    
    # Execute migrations in order
    for migration in $(ls $MIGRATIONS_DIR/*.sql | sort); do
        execute_migration $migration
    done
    
    echo "[$(date)] Migration process completed" | tee -a $LOG_FILE
}

# Error handling
trap 'echo "[$(date)] Migration failed. Check logs: $LOG_FILE"; exit 1' ERR

# Execute main function
main "$@"
```

### Migration Validation Script
```bash
#!/bin/bash
# validate.sh - Post-migration validation script

set -e

# Validation functions
validate_tables() {
    echo "Validating table creation..."
    psql -d kits_hub -c "
    SELECT 
        table_name,
        column_count,
        row_count
    FROM (
        SELECT 
            table_name,
            COUNT(*) as column_count
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        GROUP BY table_name
    ) t1
    LEFT JOIN (
        SELECT 
            table_name,
            COUNT(*) as row_count
        FROM (
            SELECT 
                schemaname||'.'||tablename as table_name
            FROM pg_tables 
            WHERE schemaname = 'public'
        ) t2
        GROUP BY table_name
    ) t2 ON t1.table_name = t2.table_name
    ORDER BY table_name;
    "
}

validate_indexes() {
    echo "Validating index creation..."
    psql -d kits_hub -c "
    SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
    FROM pg_indexes 
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname;
    "
}

validate_rls() {
    echo "Validating RLS policies..."
    psql -d kits_hub -c "
    SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual
    FROM pg_policies 
    WHERE schemaname = 'public'
    ORDER BY tablename, policyname;
    "
}

validate_foreign_keys() {
    echo "Validating foreign key constraints..."
    psql -d kits_hub -c "
    SELECT
        tc.table_schema, 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name, 
        ccu.column_name AS foreign_column_name 
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_schema = 'public';
    "
}

# Main validation
main() {
    echo "Starting post-migration validation..."
    
    validate_tables
    validate_indexes
    validate_rls
    validate_foreign_keys
    
    echo "Validation completed successfully"
}

main "$@"
```

## Monitoring and Logging

### Migration Monitoring
```sql
-- Create migration tracking table
CREATE TABLE IF NOT EXISTS migration_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_name TEXT NOT NULL,
    migration_version TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    execution_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    checksum TEXT
);

-- Create function to log migration
CREATE OR REPLACE FUNCTION log_migration(
    migration_name_param TEXT,
    migration_version_param TEXT,
    execution_time_ms_param INTEGER,
    success_param BOOLEAN DEFAULT true,
    error_message_param TEXT DEFAULT NULL,
    checksum_param TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO migration_history (
        migration_name,
        migration_version,
        execution_time_ms,
        success,
        error_message,
        checksum
    ) VALUES (
        migration_name_param,
        migration_version_param,
        execution_time_ms_param,
        success_param,
        error_message_param,
        checksum_param
    );
END;
$$ LANGUAGE plpgsql;
```

### Performance Monitoring
```sql
-- Monitor migration performance
CREATE OR REPLACE FUNCTION get_migration_performance()
RETURNS TABLE(
    migration_name TEXT,
    execution_count INTEGER,
    avg_execution_time_ms NUMERIC,
    max_execution_time_ms INTEGER,
    success_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        migration_name,
        COUNT(*) as execution_count,
        AVG(execution_time_ms) as avg_execution_time_ms,
        MAX(execution_time_ms) as max_execution_time_ms,
        (COUNT(*) FILTER (WHERE success = true))::NUMERIC / COUNT(*) * 100 as success_rate
    FROM migration_history
    GROUP BY migration_name
    ORDER BY avg_execution_time_ms DESC;
END;
$$ LANGUAGE plpgsql;
```

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Connection Issues
**Problem**: Cannot connect to database
**Solution**: 
- Verify database URL and credentials
- Check network connectivity
- Ensure database is running

#### 2. Permission Issues
**Problem**: Permission denied errors
**Solution**:
- Check user has required privileges
- Verify RLS policies are not blocking
- Run migrations as superuser if needed

#### 3. Constraint Violations
**Problem**: Foreign key or unique constraint violations
**Solution**:
- Check data integrity before migration
- Use temporary tables for data transformation
- Handle conflicts in migration scripts

#### 4. Performance Issues
**Problem**: Migration taking too long
**Solution**:
- Add indexes before data loading
- Use batch processing for large datasets
- Consider running during off-peak hours

#### 5. Rollback Failures
**Problem**: Cannot rollback successfully
**Solution**:
- Verify backup integrity
- Check for dependent objects
- Use point-in-time recovery if available

## Best Practices

### Migration Development
1. **Idempotent Scripts**: Ensure migrations can be run multiple times safely
2. **Transaction Management**: Use transactions for atomic operations
3. **Error Handling**: Include comprehensive error handling and logging
4. **Testing**: Test migrations on staging before production
5. **Documentation**: Document migration purpose and dependencies

### Production Deployment
1. **Backup Strategy**: Always create full backup before migration
2. **Rollback Plan**: Have tested rollback procedures ready
3. **Monitoring**: Monitor migration progress and performance
4. **Communication**: Notify stakeholders of migration schedule
5. **Validation**: Verify data integrity after migration

### Security Considerations
1. **Access Control**: Use least privilege principle for migration user
2. **Audit Trail**: Log all migration activities
3. **Data Protection**: Ensure sensitive data is properly handled
4. **Credential Management**: Use secure credential storage
5. **Network Security**: Use encrypted connections for remote databases

This migration execution plan provides a comprehensive framework for safely deploying the KiTS Hub database schema across different environments while maintaining data integrity and minimizing downtime.
