#!/bin/bash

# KiTS Hub Shell Integration Testing Script
# Tests the complete micro-frontend integration with all remote applications

set -e

echo "🚀 Starting KiTS Hub Shell Integration Tests..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SHELL_PORT=3000
INVENTORY_PORT=4177
POS_PORT=4178
CRM_PORT=4179
HR_PORT=4180
ACCOUNTING_PORT=4181
ANALYTICS_PORT=4182

# Test results
PASSED=0
FAILED=0
TOTAL=0

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED++))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

test_port() {
    local port=$1
    local service=$2
    ((TOTAL++))
    
    log_info "Testing $service on port $port..."
    
    if curl -s "http://localhost:$port" > /dev/null; then
        log_success "$service is running on port $port"
        return 0
    else
        log_error "$service is not accessible on port $port"
        return 1
    fi
}

test_remote_entry() {
    local port=$1
    local service=$2
    ((TOTAL++))
    
    log_info "Testing remoteEntry.js for $service..."
    
    if curl -s "http://localhost:$port/remoteEntry.js" | grep -q "window"; then
        log_success "$service remoteEntry.js is accessible"
        return 0
    else
        log_error "$service remoteEntry.js is not found or invalid"
        return 1
    fi
}

test_shell_route() {
    local route=$1
    local expected_content=$2
    ((TOTAL++))
    
    log_info "Testing shell route: $route"
    
    response=$(curl -s "http://localhost:$SHELL_PORT$route")
    
    if echo "$response" | grep -q "$expected_content"; then
        log_success "Route $route loads correctly"
        return 0
    else
        log_error "Route $route does not contain expected content: $expected_content"
        return 1
    fi
}

# Start testing
echo ""
log_info "Phase 1: Testing Service Availability"
echo "-----------------------------------------"

# Test all remote services
test_port $INVENTORY_PORT "Inventory Management"
test_port $POS_PORT "Point of Sale"
test_port $CRM_PORT "CRM System"
test_port $HR_PORT "HR Management"
test_port $ACCOUNTING_PORT "Accounting System"
test_port $ANALYTICS_PORT "Analytics Dashboard"

# Test shell
test_port $SHELL_PORT "Shared Shell"

echo ""
log_info "Phase 2: Testing Module Federation Remote Entries"
echo "----------------------------------------------------"

test_remote_entry $INVENTORY_PORT "Inventory Management"
test_remote_entry $POS_PORT "Point of Sale"
test_remote_entry $CRM_PORT "CRM System"
test_remote_entry $HR_PORT "HR Management"
test_remote_entry $ACCOUNTING_PORT "Accounting System"
test_remote_entry $ANALYTICS_PORT "Analytics Dashboard"

echo ""
log_info "Phase 3: Testing Shell Routes and Navigation"
echo "------------------------------------------------"

# Test main routes
test_shell_route "/" "Dashboard"
test_shell_route "/inventory" "Inventory"
test_shell_route "/pos" "Point of Sale"
test_shell_route "/crm" "CRM"
test_shell_route "/hr" "HR"
test_shell_route "/accounting" "Accounting"
test_shell_route "/analytics" "Analytics"
test_shell_route "/settings" "Settings"

echo ""
log_info "Phase 4: Testing Deep Links"
echo "-------------------------------"

# Test deep links to specific solution pages
test_shell_route "/inventory/products" "Products"
test_shell_route "/pos/checkout" "Checkout"
test_shell_route "/crm/customers" "Customers"
test_shell_route "/hr/employees" "Employees"
test_shell_route "/accounting/invoices" "Invoices"
test_shell_route "/analytics/reports" "Reports"

echo ""
log_info "Phase 5: Testing Authentication Context"
echo "------------------------------------------"

((TOTAL++))
if curl -s "http://localhost:$SHELL_PORT/" | grep -q "Demo User"; then
    log_success "Authentication context is working"
else
    log_error "Authentication context not found"
fi

echo ""
log_info "Phase 6: Testing Error Handling"
echo "----------------------------------"

# Test 404 handling
((TOTAL++))
response=$(curl -s "http://localhost:$SHELL_PORT/nonexistent-route")
if echo "$response" | grep -q "404\|Not Found\|Page not found"; then
    log_success "404 error handling works correctly"
else
    log_error "404 error handling not working properly"
fi

echo ""
log_info "Phase 7: Performance and Loading"
echo "------------------------------------"

# Test loading performance
((TOTAL++))
load_time=$(curl -o /dev/null -s -w '%{time_total}' "http://localhost:$SHELL_PORT/")
if (( $(echo "$load_time < 3.0" | bc -l) )); then
    log_success "Shell loads in acceptable time: ${load_time}s"
else
    log_warning "Shell load time is slow: ${load_time}s"
fi

echo ""
log_info "Phase 8: Cross-Solution Integration"
echo "--------------------------------------"

# Test that remote applications can be loaded
((TOTAL++))
if curl -s "http://localhost:$SHELL_PORT/inventory" | grep -q "Remote Application\|Inventory Management\|loading"; then
    log_success "Remote application loading mechanism works"
else
    log_error "Remote application loading mechanism failed"
fi

echo ""
echo "=================================================="
echo "🏁 Integration Tests Complete"
echo "=================================================="

# Summary
echo ""
echo "Test Summary:"
echo -e "  Total Tests: ${BLUE}$TOTAL${NC}"
echo -e "  Passed: ${GREEN}$PASSED${NC}"
echo -e "  Failed: ${RED}$FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo ""
    log_success "🎉 All tests passed! The shell integration is working correctly."
    echo ""
    echo "Next steps:"
    echo "1. Test the shell in a browser: http://localhost:$SHELL_PORT"
    echo "2. Navigate between different solutions"
    echo "3. Test deep linking to specific pages"
    echo "4. Verify error handling with remote services down"
    exit 0
else
    echo ""
    log_error "❌ Some tests failed. Please check the issues above."
    echo ""
    echo "Troubleshooting:"
    echo "1. Ensure all remote services are running on their designated ports"
    echo "2. Check that remoteEntry.js files are accessible"
    echo "3. Verify Module Federation configuration"
    echo "4. Check browser console for JavaScript errors"
    exit 1
fi
