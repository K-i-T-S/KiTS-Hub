#!/bin/bash

# Module Federation Test Script for KiTS Hub Shared Shell
# This script tests the Module Federation configuration and remote loading

set -e

echo "🚀 Testing KiTS Hub Module Federation Setup"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Solution configurations
declare -A SOLUTIONS=(
    ["inventoryManagement"]="4177"
    ["pointOfSale"]="4178"
    ["crmSystem"]="4179"
    ["hrManagement"]="4180"
    ["accountingSystem"]="4181"
    ["analyticsDashboard"]="4182"
)

# Function to check if a port is available
check_port() {
    local port=$1
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to check remote entry file
check_remote_entry() {
    local port=$1
    local solution=$2
    local url="http://localhost:$port/remoteEntry.js"
    
    echo -n "  Checking $solution remoteEntry.js... "
    if curl -s "$url" | grep -q "window\.$solution"; then
        echo -e "${GREEN}✅ Available${NC}"
        return 0
    else
        echo -e "${RED}❌ Not available${NC}"
        return 1
    fi
}

# Function to test webpack configuration
test_webpack_config() {
    echo -e "${BLUE}📦 Testing Webpack Configuration${NC}"
    
    if [ -f "webpack.mf.cjs" ]; then
        echo -e "  ${GREEN}✅ webpack.mf.cjs exists${NC}"
        
        # Check if ModuleFederationPlugin is configured
        if grep -q "ModuleFederationPlugin" webpack.mf.cjs; then
            echo -e "  ${GREEN}✅ ModuleFederationPlugin configured${NC}"
        else
            echo -e "  ${RED}❌ ModuleFederationPlugin not found${NC}"
            return 1
        fi
        
        # Check if all remotes are configured
        local remotes_count=$(grep -o "localhost:4[0-9][0-9][0-9]" webpack.mf.cjs | wc -l)
        if [ "$remotes_count" -eq 6 ]; then
            echo -e "  ${GREEN}✅ All 6 remotes configured${NC}"
        else
            echo -e "  ${YELLOW}⚠️  Found $remotes_count remotes (expected 6)${NC}"
        fi
    else
        echo -e "  ${RED}❌ webpack.mf.cjs not found${NC}"
        return 1
    fi
    
    echo ""
}

# Function to test solution availability
test_solutions() {
    echo -e "${BLUE}🔍 Testing Solution Availability${NC}"
    
    local available_count=0
    local total_count=${#SOLUTIONS[@]}
    
    for solution in "${!SOLUTIONS[@]}"; do
        port=${SOLUTIONS[$solution]}
        
        if check_port $port; then
            ((available_count++))
            check_remote_entry $port $solution
        else
            echo -n "  Checking $solution (port $port)... "
            echo -e "${RED}❌ Service not running${NC}"
        fi
    done
    
    echo ""
    echo -e "Summary: ${GREEN}$available_count${NC}/${total_count} solutions available"
    echo ""
    
    if [ $available_count -eq $total_count ]; then
        return 0
    else
        return 1
    fi
}

# Function to test shell application
test_shell_app() {
    echo -e "${BLUE}🖥️  Testing Shell Application${NC}"
    
    # Check if shell is running on port 3000
    if check_port 3000; then
        echo -e "  ${GREEN}✅ Shell application running on port 3000${NC}"
        
        # Test shell health
        if curl -s "http://localhost:3000" | grep -q "KiTS Hub"; then
            echo -e "  ${GREEN}✅ Shell application responding${NC}"
        else
            echo -e "  ${YELLOW}⚠️  Shell application not responding as expected${NC}"
        fi
    else
        echo -e "  ${RED}❌ Shell application not running on port 3000${NC}"
        echo -e "  ${YELLOW}💡 Start with: npm run dev${NC}"
        return 1
    fi
    
    echo ""
}

# Function to test file structure
test_file_structure() {
    echo -e "${BLUE}📁 Testing File Structure${NC}"
    
    local required_files=(
        "src/utils/loadRemote.ts"
        "src/components/ErrorBoundary.tsx"
        "src/components/RemoteLoading.tsx"
        "src/config/solutions.ts"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            echo -e "  ${GREEN}✅ $file${NC}"
        else
            echo -e "  ${RED}❌ $file missing${NC}"
        fi
    done
    
    echo ""
}

# Function to provide development tips
development_tips() {
    echo -e "${BLUE}💡 Development Tips${NC}"
    echo ""
    echo "To start all services for testing:"
    echo ""
    echo "1. Start the shell application:"
    echo "   ${YELLOW}cd shared-shell && npm run dev${NC}"
    echo ""
    echo "2. Start individual solutions (in separate terminals):"
    
    for solution in "${!SOLUTIONS[@]}"; do
        port=${SOLUTIONS[$solution]}
        echo "   ${YELLOW}cd solutions/${solution} && npm run dev${NC} (port $port)"
    done
    
    echo ""
    echo "3. Test remote loading by navigating to:"
    echo "   ${YELLOW}http://localhost:3000/inventory${NC}"
    echo "   ${YELLOW}http://localhost:3000/pos${NC}"
    echo "   ${YELLOW}http://localhost:3000/crm${NC}"
    echo "   ${YELLOW}http://localhost:3000/hr${NC}"
    echo "   ${YELLOW}http://localhost:3000/accounting${NC}"
    echo "   ${YELLOW}http://localhost:3000/analytics${NC}"
    echo ""
}

# Main test execution
main() {
    echo ""
    
    # Test file structure
    test_file_structure
    
    # Test webpack configuration
    test_webpack_config
    
    # Test solution availability
    if ! test_solutions; then
        echo -e "${YELLOW}⚠️  Some solutions are not running. Start them for full testing.${NC}"
        echo ""
    fi
    
    # Test shell application
    test_shell_app
    
    # Provide development tips
    development_tips
    
    echo -e "${GREEN}🎉 Module Federation testing complete!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Start missing services if needed"
    echo "2. Test remote loading in browser"
    echo "3. Check browser console for any errors"
    echo "4. Verify error boundaries and loading states"
}

# Run main function
main "$@"
