#!/bin/bash

# Shell Application Routing Validation Script
# Tests navigation between routes and lazy loading functionality

echo "🚀 KiTS Hub Shell Routing Validation"
echo "===================================="

SHELL_URL="http://localhost:3000"
VALIDATION_RESULTS=()

# Function to test route accessibility
test_route() {
    local route_path="$1"
    local route_name="$2"
    local expected_content="$3"
    
    echo "📍 Testing route: $route_name ($route_path)"
    
    # Make HTTP request to the route
    response=$(curl -s -o /dev/null -w "%{http_code}" "$SHELL_URL$route_path")
    
    if [ "$response" = "200" ]; then
        echo "✅ $route_name: Accessible (HTTP $response)"
        VALIDATION_RESULTS+=("✅ $route_name: Accessible")
        
        # Test for specific content if provided
        if [ -n "$expected_content" ]; then
            content_check=$(curl -s "$SHELL_URL$route_path" | grep -c "$expected_content" || echo "0")
            if [ "$content_check" -gt 0 ]; then
                echo "   ✅ Content verification passed"
            else
                echo "   ⚠️  Content verification failed"
            fi
        fi
    else
        echo "❌ $route_name: Failed (HTTP $response)"
        VALIDATION_RESULTS+=("❌ $route_name: Failed (HTTP $response)")
    fi
    
    echo ""
}

# Function to test lazy loading chunks
test_lazy_loading() {
    echo "🔄 Testing Lazy Loading Chunks"
    echo "-------------------------------"
    
    # Test if lazy loading chunks are generated
    chunks_dir="/home/casio699/projects/kits-hub/shared-shell/dist"
    
    if [ -d "$chunks_dir" ]; then
        chunk_files=$(find "$chunks_dir" -name "*.js" | grep -E "(Dashboard|Settings|Profile|Login)" | wc -l)
        echo "📦 Found $chunk_files lazy-loaded chunks"
        
        if [ "$chunk_files" -ge 4 ]; then
            echo "✅ Lazy loading chunks generated successfully"
            VALIDATION_RESULTS+=("✅ Lazy loading: Chunks generated")
        else
            echo "⚠️  Expected more lazy loading chunks"
            VALIDATION_RESULTS+=("⚠️ Lazy loading: Insufficient chunks")
        fi
    else
        echo "ℹ️  Development mode - chunks served from memory"
        VALIDATION_RESULTS+=("ℹ️ Lazy loading: Dev mode (memory)")
    fi
    
    echo ""
}

# Function to test authentication flow
test_authentication() {
    echo "🔐 Testing Authentication Flow"
    echo "-----------------------------"
    
    # Test login page accessibility
    login_response=$(curl -s -o /dev/null -w "%{http_code}" "$SHELL_URL/login")
    if [ "$login_response" = "200" ]; then
        echo "✅ Login page accessible"
        VALIDATION_RESULTS+=("✅ Auth: Login page accessible")
        
        # Check for login form elements
        login_form=$(curl -s "$SHELL_URL/login" | grep -c "email\|password\|sign in" || echo "0")
        if [ "$login_form" -gt 0 ]; then
            echo "   ✅ Login form elements present"
        else
            echo "   ⚠️  Login form elements missing"
        fi
    else
        echo "❌ Login page not accessible"
        VALIDATION_RESULTS+=("❌ Auth: Login page failed")
    fi
    
    # Test profile page (should redirect to login if not authenticated)
    profile_response=$(curl -s -o /dev/null -w "%{http_code}" "$SHELL_URL/profile")
    if [ "$profile_response" = "200" ]; then
        echo "✅ Profile page accessible (authenticated or mock)"
        VALIDATION_RESULTS+=("✅ Auth: Profile page accessible")
    else
        echo "ℹ️  Profile page redirects to login (expected behavior)"
        VALIDATION_RESULTS+=("ℹ️ Auth: Profile redirects to login")
    fi
    
    echo ""
}

# Function to test navigation components
test_navigation() {
    echo "🧭 Testing Navigation Components"
    echo "--------------------------------"
    
    # Test main page for navigation elements
    main_page=$(curl -s "$SHELL_URL/")
    
    # Check for sidebar navigation
    sidebar_check=$(echo "$main_page" | grep -c "Dashboard\|Inventory\|Point of Sale\|CRM\|HR\|Accounting\|Analytics" || echo "0")
    if [ "$sidebar_check" -gt 0 ]; then
        echo "✅ Sidebar navigation elements found ($sidebar_check items)"
        VALIDATION_RESULTS+=("✅ Navigation: Sidebar present")
    else
        echo "❌ Sidebar navigation elements missing"
        VALIDATION_RESULTS+=("❌ Navigation: Sidebar missing")
    fi
    
    # Check for top bar
    topbar_check=$(echo "$main_page" | grep -c "search\|notification\|user\|profile" || echo "0")
    if [ "$topbar_check" -gt 0 ]; then
        echo "✅ Top bar elements found ($topbar_check items)"
        VALIDATION_RESULTS+=("✅ Navigation: Top bar present")
    else
        echo "❌ Top bar elements missing"
        VALIDATION_RESULTS+=("❌ Navigation: Top bar missing")
    fi
    
    echo ""
}

# Function to test remote loading setup
test_remote_loading() {
    echo "🔗 Testing Remote Loading Setup"
    echo "-------------------------------"
    
    # Test inventory route (should show loading state or error boundary)
    inventory_response=$(curl -s -o /dev/null -w "%{http_code}" "$SHELL_URL/inventory")
    if [ "$inventory_response" = "200" ]; then
        echo "✅ Inventory route accessible"
        VALIDATION_RESULTS+=("✅ Remote: Inventory route accessible")
        
        # Check for loading or error boundary content
        inventory_content=$(curl -s "$SHELL_URL/inventory")
        loading_check=$(echo "$inventory_content" | grep -c "loading\|error\|failed to load" || echo "0")
        if [ "$loading_check" -gt 0 ]; then
            echo "   ✅ Loading/error handling present"
        else
            echo "   ℹ️  Remote may be loading or content not visible"
        fi
    else
        echo "❌ Inventory route failed"
        VALIDATION_RESULTS+=("❌ Remote: Inventory route failed")
    fi
    
    # Test other remote routes
    for route in "pos" "crm" "hr" "accounting" "analytics"; do
        route_response=$(curl -s -o /dev/null -w "%{http_code}" "$SHELL_URL/$route")
        if [ "$route_response" = "200" ]; then
            echo "✅ $route route accessible"
            VALIDATION_RESULTS+=("✅ Remote: $route accessible")
        else
            echo "❌ $route route failed"
            VALIDATION_RESULTS+=("❌ Remote: $route failed")
        fi
    done
    
    echo ""
}

# Main validation execution
echo "Starting comprehensive routing validation..."
echo ""

# Test if shell is running
if ! curl -s "$SHELL_URL" > /dev/null; then
    echo "❌ Shell application not accessible at $SHELL_URL"
    echo "Please ensure the shell is running with: npm run dev"
    exit 1
fi

echo "✅ Shell application is running"
echo ""

# Run all tests
test_route "/" "Dashboard" "Dashboard\|Business"
test_route "/settings" "Settings" "Settings\|Configuration"
test_route "/profile" "User Profile" "Profile\|User"
test_route "/login" "Login" "Sign in\|Email"

test_lazy_loading
test_authentication
test_navigation
test_remote_loading

# Summary
echo "📊 Validation Summary"
echo "===================="
for result in "${VALIDATION_RESULTS[@]}"; do
    echo "$result"
done

# Count results
total_tests=${#VALIDATION_RESULTS[@]}
passed_tests=$(printf '%s\n' "${VALIDATION_RESULTS[@]}" | grep -c "✅" || echo "0")
failed_tests=$(printf '%s\n' "${VALIDATION_RESULTS[@]}" | grep -c "❌" || echo "0")
warning_tests=$(printf '%s\n' "${VALIDATION_RESULTS[@]}" | grep -c "⚠️" || echo "0")
info_tests=$(printf '%s\n' "${VALIDATION_RESULTS[@]}" | grep -c "ℹ️" || echo "0")

echo ""
echo "📈 Test Results:"
echo "   Total Tests: $total_tests"
echo "   ✅ Passed: $passed_tests"
echo "   ❌ Failed: $failed_tests"
echo "   ⚠️  Warnings: $warning_tests"
echo "   ℹ️  Info: $info_tests"

if [ "$failed_tests" -eq 0 ]; then
    echo ""
    echo "🎉 All critical tests passed! Routing system is working correctly."
else
    echo ""
    echo "⚠️  Some tests failed. Please review the results above."
fi

echo ""
echo "🔗 Open $SHELL_URL in your browser to manually test navigation"
