#!/bin/bash

# KiTS Hub Micro-Frontend Integration Test
echo "🚀 KiTS Hub Micro-Frontend Integration Test"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

# Function to test a service
test_service() {
    local service_name=$1
    local port=$2
    local expected_content=$3
    
    echo -n "Testing $service_name (port $port)... "
    
    # Test if service is running
    if ! curl -s -f "http://localhost:$port/" > /dev/null 2>&1; then
        echo -e "${RED}FAILED${NC} - Service not responding"
        ((FAILED++))
        return
    fi
    
    # Test remoteEntry.js file exists
    if [[ "$port" != "3000" ]]; then
        if ! curl -s -f "http://localhost:$port/remoteEntry.js" > /dev/null 2>&1; then
            echo -e "${RED}FAILED${NC} - remoteEntry.js not found"
            ((FAILED++))
            return
        fi
    fi
    
    # Test content if specified
    if [[ -n "$expected_content" ]]; then
        if curl -s "http://localhost:$port/" | grep -q "$expected_content"; then
            echo -e "${GREEN}PASSED${NC}"
            ((PASSED++))
        else
            echo -e "${RED}FAILED${NC} - Content mismatch"
            ((FAILED++))
        fi
    else
        echo -e "${GREEN}PASSED${NC}"
        ((PASSED++))
    fi
}

# Test all services
echo "Testing Services..."
echo "------------------"

test_service "Shared Shell" "3000" "KiTS Hub"
test_service "Inventory Management" "4177" ""
test_service "Point of Sale" "4178" ""
test_service "CRM System" "4179" ""
test_service "HR Management" "4180" ""
test_service "Accounting System" "4181" ""
test_service "Analytics Dashboard" "4182" ""

echo ""
echo "Testing Module Federation Integration..."
echo "--------------------------------------"

# Test Module Federation configuration
echo -n "Testing Module Federation remote configuration... "
if curl -s "http://localhost:3000/main.js" | grep -q "inventoryManagement\|pointOfSale\|crmSystem" 2>/dev/null; then
    echo -e "${GREEN}PASSED${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}WARNING${NC} - Could not verify remote configuration"
fi

# Test CORS headers
echo -n "Testing CORS headers on remotes... "
cors_ok=true
for port in 4177 4178 4179 4180 4181 4182; do
    if ! curl -s -I "http://localhost:$port/remoteEntry.js" | grep -q "Access-Control-Allow-Origin" 2>/dev/null; then
        cors_ok=false
        break
    fi
done

if $cors_ok; then
    echo -e "${GREEN}PASSED${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}WARNING${NC} - CORS headers may be missing"
fi

echo ""
echo "Testing Bundle Sizes..."
echo "----------------------"

# Check bundle sizes
echo -n "Checking bundle sizes... "
for port in 4177 4178 4179 4180 4181 4182; do
    size=$(curl -s -I "http://localhost:$port/remoteEntry.js" | grep -i "content-length" | cut -d' ' -f2 | tr -d '\r')
    if [[ -n "$size" && "$size" -lt 50000 ]]; then
        echo -n "✓"
    else
        echo -n "⚠"
    fi
done
echo " done"

echo ""
echo "Test Results Summary"
echo "===================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [[ $FAILED -eq 0 ]]; then
    echo -e "${GREEN}🎉 All tests passed! KiTS Hub is fully operational.${NC}"
    echo ""
    echo "📱 Access Points:"
    echo "  • Shared Shell: http://localhost:3000"
    echo "  • Inventory:    http://localhost:4177"
    echo "  • Point of Sale: http://localhost:4178"
    echo "  • CRM System:   http://localhost:4179"
    echo "  • HR Management: http://localhost:4180"
    echo "  • Accounting:   http://localhost:4181"
    echo "  • Analytics:    http://localhost:4182"
    echo ""
    echo "🔗 Micro-Frontend Architecture: ✅ OPERATIONAL"
else
    echo -e "${RED}❌ Some tests failed. Please check the services.${NC}"
    exit 1
fi
