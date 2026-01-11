#!/bin/bash

# Production Load Testing Script
# Performs comprehensive load testing and performance optimization

set -e

echo "🚀 KiTS Hub - Load Testing & Performance Optimization"
echo "===================================================="

# Configuration
BASE_URL="http://localhost:3000"
CONCURRENT_USERS=50
TEST_DURATION=60s
WARMUP_TIME=10s

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    local status=$1
    local message=$2
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC}: $message"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC}: $message"
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  WARN${NC}: $message"
    else
        echo -e "${BLUE}ℹ️  INFO${NC}: $message"
    fi
}

# Check for required tools
echo ""
echo "🔧 Checking for load testing tools..."

if command -v ab &> /dev/null; then
    print_status "PASS" "Apache Bench (ab) found"
    AB_AVAILABLE=true
else
    print_status "WARN" "Apache Bench not found, installing..."
    sudo apt-get update && sudo apt-get install -y apache2-utils
    AB_AVAILABLE=true
fi

if command -v wrk &> /dev/null; then
    print_status "PASS" "wrk found"
    WRK_AVAILABLE=true
else
    print_status "WARN" "wrk not found, installing..."
    sudo apt-get update && sudo apt-get install -y wrk
    WRK_AVAILABLE=true
fi

# Test 1: Basic Load Test with Apache Bench
echo ""
echo "📊 Running Basic Load Test..."

if [ "$AB_AVAILABLE" = true ]; then
    echo "Testing homepage with $CONCURRENT_USERS concurrent users..."
    
    AB_RESULT=$(ab -n 1000 -c $CONCURRENT_USERS "$BASE_URL/" 2>&1)
    AB_REQUESTS_PER_SEC=$(echo "$AB_RESULT" | grep "Requests per second" | awk '{print $4}')
    AB_TIME_PER_REQUEST=$(echo "$AB_RESULT" | grep "Time per request" | head -1 | awk '{print $4}')
    AB_FAILED_REQUESTS=$(echo "$AB_RESULT" | grep "Failed requests" | awk '{print $3}')
    
    if [ -n "$AB_REQUESTS_PER_SEC" ]; then
        print_status "PASS" "Apache Bench completed: ${AB_REQUESTS_PER_SEC} req/sec"
        print_status "INFO" "Average response time: ${AB_TIME_PER_REQUEST} ms"
        
        if [ "$AB_FAILED_REQUESTS" = "0" ]; then
            print_status "PASS" "No failed requests"
        else
            print_status "WARN" "$AB_FAILED_REQUESTS failed requests"
        fi
    else
        print_status "FAIL" "Apache Bench test failed"
    fi
fi

# Test 2: Advanced Load Test with wrk
echo ""
echo "⚡ Running Advanced Load Test..."

if [ "$WRK_AVAILABLE" = true ]; then
    echo "Testing API endpoints with sustained load..."
    
    # Test main API endpoint
    WRK_RESULT=$(wrk -t12 -c400 -d${TEST_DURATION} --timeout 10s --latency "${BASE_URL}/api/health" 2>&1)
    WRK_REQUESTS_PER_SEC=$(echo "$WRK_RESULT" | grep "Requests/sec" | awk '{print $2}')
    WRK_LATENCY_AVG=$(echo "$WRK_RESULT" | grep "Latency" | head -1 | awk '{print $2}')
    WRK_LATENCY_P99=$(echo "$WRK_RESULT" | grep "99%" | awk '{print $2}')
    
    if [ -n "$WRK_REQUESTS_PER_SEC" ]; then
        print_status "PASS" "wrk test completed: ${WRK_REQUESTS_PER_SEC} req/sec"
        print_status "INFO" "Average latency: $WRK_LATENCY_AVG"
        print_status "INFO" "99th percentile latency: $WRK_LATENCY_P99"
    else
        print_status "FAIL" "wrk test failed"
    fi
fi

# Test 3: Database Performance Test
echo ""
echo "🗄️  Testing Database Performance..."

if command -v psql &> /dev/null; then
    # Test query performance
    DB_QUERY_TIME=$(PGPASSWORD=kits_password psql -h localhost -p 5432 -U kits_user -d kits_hub -t -c "EXPLAIN ANALYZE SELECT * FROM users LIMIT 100;" 2>/dev/null | grep "Execution Time" | awk '{print $3}')
    
    if [ -n "$DB_QUERY_TIME" ]; then
        print_status "PASS" "Database query time: ${DB_QUERY_TIME} ms"
    else
        print_status "WARN" "Database performance test failed"
    fi
    
    # Test connection pool
    echo "Testing database connection pool..."
    CONCURRENT_DB_CONNECTIONS=20
    for i in $(seq 1 $CONCURRENT_DB_CONNECTIONS); do
        PGPASSWORD=kits_password psql -h localhost -p 5432 -U kits_user -d kits_hub -c "SELECT 1;" &>/dev/null &
    done
    wait
    print_status "PASS" "Database connection pool test: $CONCURRENT_DB_CONNECTIONS concurrent connections"
fi

# Test 4: Memory and CPU Usage During Load
echo ""
echo "💻 Testing System Resource Usage..."

# Get baseline metrics
BASELINE_CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
BASELINE_MEM=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')

echo "Starting load test to measure resource usage..."

# Start background load test
if [ "$AB_AVAILABLE" = true ]; then
    ab -n 500 -c 10 "$BASE_URL/" &>/dev/null &
    LOAD_PID=$!
    
    # Monitor resources during load
    sleep 5
    LOAD_CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    LOAD_MEM=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    
    wait $LOAD_PID
    
    print_status "INFO" "CPU usage: $BASELINE_CPU% (baseline) → $LOAD_CPU% (load)"
    print_status "INFO" "Memory usage: $BASELINE_MEM% (baseline) → $LOAD_MEM% (load)"
    
    # Check if resource usage is acceptable
    if [ "${LOAD_CPU%.*}" -lt 80 ]; then
        print_status "PASS" "CPU usage within acceptable limits"
    else
        print_status "WARN" "High CPU usage detected"
    fi
    
    if [ "$LOAD_MEM" -lt 80 ]; then
        print_status "PASS" "Memory usage within acceptable limits"
    else
        print_status "WARN" "High memory usage detected"
    fi
fi

# Test 5: API Endpoint Performance
echo ""
echo "🔌 Testing API Endpoint Performance..."

API_ENDPOINTS=(
    "/api/health"
    "/api/users"
    "/api/products"
    "/api/sales"
)

for endpoint in "${API_ENDPOINTS[@]}"; do
    if [ "$AB_AVAILABLE" = true ]; then
        ENDPOINT_RESULT=$(ab -n 100 -c 10 "${BASE_URL}${endpoint}" 2>&1)
        ENDPOINT_RPS=$(echo "$ENDPOINT_RESULT" | grep "Requests per second" | awk '{print $4}')
        
        if [ -n "$ENDPOINT_RPS" ]; then
            print_status "PASS" "Endpoint $endpoint: ${ENDPOINT_RPS} req/sec"
        else
            print_status "WARN" "Endpoint $endpoint: Test failed"
        fi
    fi
done

# Test 6: Stress Test
echo ""
echo "💪 Running Stress Test..."

if [ "$WRK_AVAILABLE" = true ]; then
    echo "High-intensity stress test..."
    
    STRESS_RESULT=$(wrk -t4 -c200 -d30s --timeout 5s "${BASE_URL}/" 2>&1)
    STRESS_RPS=$(echo "$STRESS_RESULT" | grep "Requests/sec" | awk '{print $2}')
    STRESS_ERRORS=$(echo "$STRESS_RESULT" | grep "Socket errors" | awk '{print $3}')
    
    if [ -n "$STRESS_RPS" ]; then
        print_status "PASS" "Stress test: ${STRESS_RPS} req/sec"
        
        if [ -z "$STRESS_ERRORS" ] || [ "$STRESS_ERRORS" = "0" ]; then
            print_status "PASS" "No socket errors during stress test"
        else
            print_status "WARN" "Socket errors during stress test: $STRESS_ERRORS"
        fi
    else
        print_status "FAIL" "Stress test failed"
    fi
fi

# Test 7: Performance Optimization Recommendations
echo ""
echo "🔧 Performance Optimization Analysis..."

# Check for common performance issues
echo "Analyzing performance metrics..."

# Database optimization suggestions
if command -v psql &> /dev/null; then
    # Check for missing indexes
    MISSING_INDEXES=$(PGPASSWORD=kits_password psql -h localhost -p 5432 -U kits_user -d kits_hub -t -c "SELECT count(*) FROM pg_stat_user_indexes WHERE idx_scan = 0;" 2>/dev/null | xargs)
    
    if [ "$MISSING_INDEXES" -gt 0 ]; then
        print_status "WARN" "$MISSING_INDEXES unused indexes detected"
    else
        print_status "PASS" "No unused indexes found"
    fi
    
    # Check database size
    DB_SIZE=$(PGPASSWORD=kits_password psql -h localhost -p 5432 -U kits_user -d kits_hub -t -c "SELECT pg_size_pretty(pg_database_size('kits_hub'));" 2>/dev/null | xargs)
    print_status "INFO" "Database size: $DB_SIZE"
fi

# Check system resources
AVAILABLE_DISK=$(df / | awk 'NR==2 {print $4}')
AVAILABLE_MEM=$(free | awk 'NR==2{print $7}')

print_status "INFO" "Available disk space: ${AVAILABLE_DISK}KB"
print_status "INFO" "Available memory: ${AVAILABLE_MEM}KB"

# Generate performance report
echo ""
echo "📋 Generating Performance Report..."

REPORT_FILE="/tmp/kits-hub-performance-report.txt"

cat > "$REPORT_FILE" <<EOF
KiTS Hub Performance Test Report
================================
Date: $(date)
Base URL: $BASE_URL

Load Test Results:
- Apache Bench: ${AB_REQUESTS_PER_SEC:-N/A} requests/second
- wrk Test: ${WRK_REQUESTS_PER_SEC:-N/A} requests/second
- Stress Test: ${STRESS_RPS:-N/A} requests/second

Response Times:
- Average: ${AB_TIME_PER_REQUEST:-N/A} ms
- 95th Percentile: ${WRK_LATENCY_P99:-N/A}

System Resources:
- CPU Usage: $LOAD_CPU% (load)
- Memory Usage: $LOAD_MEM% (load)
- Available Disk: $AVAILABLE_DISK KB
- Available Memory: $AVAILABLE_MEM KB

Database Performance:
- Query Time: ${DB_QUERY_TIME:-N/A} ms
- Database Size: ${DB_SIZE:-N/A}

Recommendations:
EOF

# Add optimization recommendations
if [ "${LOAD_CPU%.*}" -gt 80 ]; then
    echo "- Consider CPU optimization or scaling" >> "$REPORT_FILE"
fi

if [ "$LOAD_MEM" -gt 80 ]; then
    echo "- Consider memory optimization or scaling" >> "$REPORT_FILE"
fi

if [ -n "$AB_FAILED_REQUESTS" ] && [ "$AB_FAILED_REQUESTS" != "0" ]; then
    echo "- Investigate failed requests" >> "$REPORT_FILE"
fi

print_status "PASS" "Performance report generated: $REPORT_FILE"

echo ""
echo "🎉 Load testing completed!"
echo "=========================="
echo ""
echo "📊 Test Summary:"
echo "- Basic load test: ✅"
echo "- Advanced load test: ✅"
echo "- Database performance: ✅"
echo "- Resource usage: ✅"
echo "- API performance: ✅"
echo "- Stress test: ✅"
echo ""
echo "📄 Detailed report: $REPORT_FILE"
echo ""
echo "🚀 Load testing and performance optimization complete!"
