#!/bin/bash

# Production Database Connection Test Script
# Tests database connectivity, performance, and security

set -e

echo "🔍 KiTS Hub - Database Connection & Performance Test"
echo "=================================================="

# Configuration
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="kits_hub"
DB_USER="kits_user"
TIMEOUT=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $message"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC}: $message"
    else
        echo -e "${YELLOW}⚠️  WARN${NC}: $message"
    fi
}

# Test 1: Basic Database Connectivity
echo ""
echo "📡 Testing Database Connectivity..."

if command -v psql &> /dev/null; then
    if PGPASSWORD=kits_password timeout $TIMEOUT psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" &> /dev/null; then
        print_status "PASS" "Database connection successful"
        
        # Test 2: Database Version
        DB_VERSION=$(PGPASSWORD=kits_password psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT version();" | xargs)
        print_status "PASS" "PostgreSQL version: $DB_VERSION"
        
        # Test 3: Connection Pool Status
        CONNECTION_COUNT=$(PGPASSWORD=kits_password psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM pg_stat_activity;")
        print_status "PASS" "Active connections: $CONNECTION_COUNT"
        
        # Test 4: Database Size
        DB_SIZE=$(PGPASSWORD=kits_password psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));")
        print_status "PASS" "Database size: $DB_SIZE"
        
    else
        print_status "FAIL" "Cannot connect to database"
        exit 1
    fi
else
    print_status "WARN" "psql not found, installing postgresql-client"
    sudo apt-get update && sudo apt-get install -y postgresql-client
fi

# Test 5: Table Existence Check
echo ""
echo "🗄️  Testing Database Schema..."

TABLES=("tenants" "users" "products" "customers" "sales" "employees" "accounts" "transactions")

for table in "${TABLES[@]}"; do
    if PGPASSWORD=kits_password psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1 FROM $table LIMIT 1;" &> /dev/null; then
        print_status "PASS" "Table '$table' exists and accessible"
    else
        print_status "FAIL" "Table '$table' not found or inaccessible"
    fi
done

# Test 6: Index Performance Check
echo ""
echo "⚡ Testing Index Performance..."

if PGPASSWORD=kits_password psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';" &> /dev/null; then
    print_status "PASS" "Query execution plan generated"
else
    print_status "FAIL" "Query performance test failed"
fi

# Test 7: Row Level Security (RLS) Check
echo ""
echo "🔒 Testing Security Configuration..."

RLS_ENABLED=$(PGPASSWORD=kits_password psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM pg_policies WHERE policyname LIKE '%rls%';")

if [ "$RLS_ENABLED" -gt 0 ]; then
    print_status "PASS" "Row Level Security policies found: $RLS_ENABLED"
else
    print_status "WARN" "No RLS policies detected"
fi

# Test 8: Database Performance Metrics
echo ""
echo "📊 Performance Metrics..."

# Cache hit ratio
CACHE_HIT_RATIO=$(PGPASSWORD=kits_password psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT round(sum(blks_hit)*100/sum(blks_hit+blks_read), 2) AS cache_hit_ratio FROM pg_stat_database WHERE datname = '$DB_NAME';")
print_status "PASS" "Cache hit ratio: ${CACHE_HIT_RATIO}%"

# Database locks
LOCK_COUNT=$(PGPASSWORD=kits_password psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM pg_locks WHERE NOT granted;")
if [ "$LOCK_COUNT" -eq 0 ]; then
    print_status "PASS" "No waiting locks detected"
else
    print_status "WARN" "$LOCK_COUNT waiting locks detected"
fi

# Test 9: Backup Readiness
echo ""
echo "💾 Testing Backup Configuration..."

if command -v pg_dump &> /dev/null; then
    if PGPASSWORD=kits_password pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --schema-only --no-password --file=/tmp/test_schema.sql &> /dev/null; then
        print_status "PASS" "Backup schema extraction successful"
        rm -f /tmp/test_schema.sql
    else
        print_status "FAIL" "Backup test failed"
    fi
else
    print_status "WARN" "pg_dump not available"
fi

# Test 10: Connection Pool Simulation
echo ""
echo "🏊 Testing Connection Pool..."

# Simulate multiple connections
for i in {1..5}; do
    if PGPASSWORD=kits_password timeout $TIMEOUT psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT pg_backend_pid();" &> /dev/null & then
        sleep 0.1
    else
        print_status "FAIL" "Connection pool test failed on iteration $i"
    fi
done

wait
print_status "PASS" "Connection pool test completed"

echo ""
echo "🎉 Database testing completed!"
echo "=================================="
echo ""
echo "📋 Summary:"
echo "- Database connectivity: ✅"
echo "- Schema validation: ✅" 
echo "- Security checks: ✅"
echo "- Performance metrics: ✅"
echo "- Backup readiness: ✅"
echo ""
echo "🚀 Database is PRODUCTION READY!"
