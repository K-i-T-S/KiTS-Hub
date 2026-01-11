#!/bin/bash

# Cross-Solution Integration Test Script
# Tests the complete integration system for KiTS Hub

set -e

echo "🧪 KiTS Hub Cross-Solution Integration Tests"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    log_info "Running: $test_name"
    
    if eval "$test_command"; then
        log_success "$test_name"
    else
        log_error "$test_name"
    fi
}

# Check if shared-shell is running
check_shell_running() {
    curl -s http://localhost:3000 > /dev/null 2>&1
}

# Check if remote applications are running
check_remote_running() {
    local port=$1
    curl -s http://localhost:$port > /dev/null 2>&1
}

# Test event bus functionality
test_event_bus() {
    log_info "Testing Event Bus System..."
    
    # Check if event bus module exists
    if [ -f "shared-shell/src/lib/events/event-bus.ts" ]; then
        log_success "Event bus module exists"
        
        # Check if types are defined
        if [ -f "shared-shell/src/lib/events/types.ts" ]; then
            log_success "Event types defined"
        else
            log_error "Event types not found"
            return 1
        fi
        
        # Check if global instance is exported
        if grep -q "export const globalEventBus" shared-shell/src/lib/events/event-bus.ts; then
            log_success "Global event bus exported"
        else
            log_error "Global event bus not exported"
            return 1
        fi
    else
        log_error "Event bus module not found"
        return 1
    fi
}

# Test real-time subscriptions
test_realtime() {
    log_info "Testing Real-time Subscriptions..."
    
    if [ -f "shared-shell/src/lib/events/realtime.ts" ]; then
        log_success "Real-time module exists"
        
        # Check if Supabase integration is present
        if grep -q "import.*supabase" shared-shell/src/lib/events/realtime.ts; then
            log_success "Supabase integration present"
        else
            log_error "Supabase integration missing"
            return 1
        fi
        
        # Check if manager is exported
        if grep -q "export const realtimeManager" shared-shell/src/lib/events/realtime.ts; then
            log_success "Real-time manager exported"
        else
            log_error "Real-time manager not exported"
            return 1
        fi
    else
        log_error "Real-time module not found"
        return 1
    fi
}

# Test shared state management
test_shared_state() {
    log_info "Testing Shared State Management..."
    
    if [ -f "shared-shell/src/lib/state/shared-context.tsx" ]; then
        log_success "Shared state module exists"
        
        # Check if React Context is used
        if grep -q "createContext" shared-shell/src/lib/state/shared-context.tsx; then
            log_success "React Context implemented"
        else
            log_error "React Context not found"
            return 1
        fi
        
        # Check if provider is exported
        if grep -q "export.*SharedStateProvider" shared-shell/src/lib/state/shared-context.tsx; then
            log_success "Shared state provider exported"
        else
            log_error "Shared state provider not exported"
            return 1
        fi
    else
        log_error "Shared state module not found"
        return 1
    fi
}

# Test data synchronization
test_data_sync() {
    log_info "Testing Data Synchronization Service..."
    
    if [ -f "shared-shell/src/lib/sync/data-sync.ts" ]; then
        log_success "Data sync module exists"
        
        # Check if sync methods are implemented
        if grep -q "syncCustomerData" shared-shell/src/lib/sync/data-sync.ts; then
            log_success "Customer sync method implemented"
        else
            log_error "Customer sync method missing"
            return 1
        fi
        
        # Check if conflict resolution is present
        if grep -q "ConflictResolutionStrategy" shared-shell/src/lib/sync/data-sync.ts; then
            log_success "Conflict resolution implemented"
        else
            log_error "Conflict resolution missing"
            return 1
        fi
        
        # Check if validation is present
        if grep -q "validateData" shared-shell/src/lib/sync/data-sync.ts; then
            log_success "Data validation implemented"
        else
            log_error "Data validation missing"
            return 1
        fi
    else
        log_error "Data sync module not found"
        return 1
    fi
}

# Test notification system
test_notifications() {
    log_info "Testing Unified Notification System..."
    
    if [ -f "shared-shell/src/lib/notifications/notification-system.tsx" ]; then
        log_success "Notification system module exists"
        
        # Check if React Context is used
        if grep -q "createContext" shared-shell/src/lib/notifications/notification-system.tsx; then
            log_success "React Context implemented"
        else
            log_error "React Context not found"
            return 1
        fi
        
        # Check if desktop notifications are supported
        if grep -q "Notification.*window" shared-shell/src/lib/notifications/notification-system.tsx; then
            log_success "Desktop notifications supported"
        else
            log_error "Desktop notifications not supported"
            return 1
        fi
        
        # Check if preferences are implemented
        if grep -q "NotificationPreferences" shared-shell/src/lib/notifications/notification-system.tsx; then
            log_success "Notification preferences implemented"
        else
            log_error "Notification preferences missing"
            return 1
        fi
    else
        log_error "Notification system module not found"
        return 1
    fi
}

# Test performance monitoring
test_performance_monitoring() {
    log_info "Testing Performance Monitoring..."
    
    if [ -f "shared-shell/src/lib/monitoring/performance.ts" ]; then
        log_success "Performance monitoring module exists"
        
        # Check if metrics are tracked
        if grep -q "PerformanceMetrics" shared-shell/src/lib/monitoring/performance.ts; then
            log_success "Performance metrics defined"
        else
            log_error "Performance metrics not defined"
            return 1
        fi
        
        # Check if logging is implemented
        if grep -q "LogEntry" shared-shell/src/lib/monitoring/performance.ts; then
            log_success "Logging system implemented"
        else
            log_error "Logging system not implemented"
            return 1
        fi
        
        # Check if alerting is present
        if grep -q "AlertRule" shared-shell/src/lib/monitoring/performance.ts; then
            log_success "Alert system implemented"
        else
            log_error "Alert system missing"
            return 1
        fi
    else
        log_error "Performance monitoring module not found"
        return 1
    fi
}

# Test integration tests
test_integration_tests() {
    log_info "Testing Integration Test Suite..."
    
    if [ -f "shared-shell/src/lib/integration/cross-solution.test.ts" ]; then
        log_success "Integration test file exists"
        
        # Check if event bus tests are present
        if grep -q "describe.*Event Bus" shared-shell/src/lib/integration/cross-solution.test.ts; then
            log_success "Event bus tests present"
        else
            log_error "Event bus tests missing"
            return 1
        fi
        
        # Check if workflow tests are present
        if grep -q "Cross-Solution Workflows" shared-shell/src/lib/integration/cross-solution.test.ts; then
            log_success "Workflow tests present"
        else
            log_error "Workflow tests missing"
            return 1
        fi
        
        # Check if performance tests are present
        if grep -q "Performance" shared-shell/src/lib/integration/cross-solution.test.ts; then
            log_success "Performance tests present"
        else
            log_error "Performance tests missing"
            return 1
        fi
    else
        log_error "Integration test file not found"
        return 1
    fi
}

# Test documentation
test_documentation() {
    log_info "Testing Documentation..."
    
    if [ -f "shared-shell/CROSS_SOLUTION_INTEGRATION_GUIDE.md" ]; then
        log_success "Integration guide exists"
        
        # Check if API reference is included
        if grep -q "## API Reference" shared-shell/CROSS_SOLUTION_INTEGRATION_GUIDE.md; then
            log_success "API reference included"
        else
            log_error "API reference missing"
            return 1
        fi
        
        # Check if troubleshooting is included
        if grep -q "## Troubleshooting" shared-shell/CROSS_SOLUTION_INTEGRATION_GUIDE.md; then
            log_success "Troubleshooting section included"
        else
            log_error "Troubleshooting section missing"
            return 1
        fi
    else
        log_error "Integration guide not found"
        return 1
    fi
}

# Test module dependencies
test_dependencies() {
    log_info "Testing Module Dependencies..."
    
    # Check if required packages are installed
    if [ -f "shared-shell/package.json" ]; then
        log_success "Package.json exists"
        
        # Check for React
        if grep -q '"react"' shared-shell/package.json; then
            log_success "React dependency found"
        else
            log_error "React dependency missing"
            return 1
        fi
        
        # Check for Supabase
        if grep -q '"@supabase/supabase-js"' shared-shell/package.json; then
            log_success "Supabase dependency found"
        else
            log_error "Supabase dependency missing"
            return 1
        fi
        
        # Check for TypeScript
        if grep -q '"typescript"' shared-shell/package.json; then
            log_success "TypeScript dependency found"
        else
            log_error "TypeScript dependency missing"
            return 1
        fi
    else
        log_error "Package.json not found"
        return 1
    fi
}

# Test TypeScript compilation
test_typescript_compilation() {
    log_info "Testing TypeScript Compilation..."
    
    cd shared-shell
    
    if npm run typecheck > /dev/null 2>&1; then
        log_success "TypeScript compilation successful"
        cd ..
        return 0
    else
        log_error "TypeScript compilation failed"
        cd ..
        return 1
    fi
}

# Test build process
test_build() {
    log_info "Testing Build Process..."
    
    cd shared-shell
    
    if npm run build > /dev/null 2>&1; then
        log_success "Build successful"
        cd ..
        return 0
    else
        log_error "Build failed"
        cd ..
        return 1
    fi
}

# Run all integration tests
run_all_tests() {
    echo "Starting comprehensive integration tests..."
    echo ""
    
    # Module existence tests
    run_test "Event Bus System" "test_event_bus"
    run_test "Real-time Subscriptions" "test_realtime"
    run_test "Shared State Management" "test_shared_state"
    run_test "Data Synchronization" "test_data_sync"
    run_test "Unified Notification System" "test_notifications"
    run_test "Performance Monitoring" "test_performance_monitoring"
    run_test "Integration Test Suite" "test_integration_tests"
    run_test "Documentation" "test_documentation"
    
    echo ""
    log_info "Running dependency and build tests..."
    
    # Dependency and build tests
    run_test "Module Dependencies" "test_dependencies"
    run_test "TypeScript Compilation" "test_typescript_compilation"
    run_test "Build Process" "test_build"
    
    echo ""
    echo "Test Results Summary:"
    echo "===================="
    echo "Total Tests: $TOTAL_TESTS"
    echo "Passed: $TESTS_PASSED"
    echo "Failed: $TESTS_FAILED"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}✅ All tests passed!${NC}"
        return 0
    else
        echo -e "${RED}❌ $TESTS_FAILED test(s) failed${NC}"
        return 1
    fi
}

# Check if running in CI environment
if [ "$CI" = "true" ]; then
    run_all_tests
    exit $?
fi

# Interactive mode
echo "Choose test mode:"
echo "1) Quick check (module existence only)"
echo "2) Full integration tests"
echo "3) Build and compilation only"
echo "4) Exit"
echo ""

read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo "Running quick check..."
        test_event_bus
        test_realtime
        test_shared_state
        test_data_sync
        test_notifications
        test_performance_monitoring
        ;;
    2)
        run_all_tests
        ;;
    3)
        test_dependencies
        test_typescript_compilation
        test_build
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "Quick check completed!"
echo "Passed: $TESTS_PASSED"
echo "Failed: $TESTS_FAILED"
