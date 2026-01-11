#!/bin/bash

# KiTS Hub - Install Dependencies Script
# This script installs all dependencies for all solutions

set -e

echo "🚀 Installing KiTS Hub dependencies..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run from kits-hub root directory."
    exit 1
fi

# Install shared dependencies
echo "📦 Installing shared dependencies..."
cd shared
if [ -f "package.json" ]; then
    npm install
    if [ $? -eq 0 ]; then
        print_status "Shared dependencies installed successfully"
    else
        print_error "Failed to install shared dependencies"
        exit 1
    fi
else
    print_warning "No shared package.json found, skipping..."
fi

# Install solution dependencies
echo "📦 Installing solution dependencies..."
cd ../solutions

for solution in inventory-management point-of-sale crm-system hr-management accounting-system analytics-dashboard; do
    if [ -d "$solution" ]; then
        echo "📦 Installing dependencies for $solution..."
        cd "$solution"
        
        if [ -f "package.json" ]; then
            npm install
            if [ $? -eq 0 ]; then
                print_status "$solution dependencies installed successfully"
            else
                print_error "Failed to install dependencies for $solution"
                exit 1
            fi
        else
            print_warning "No package.json found for $solution, skipping..."
        fi
        
        cd ..
    fi
done

# Go back to root
cd ..

echo ""
echo "🎉 KiTS Hub dependencies installation complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Run 'npm run dev' to start development servers"
echo "   2. Run 'npm run test' to run tests"
echo "   3. Run 'npm run build' to build for production"
echo ""
echo "💡 Tip: Make sure to configure your .env files with Supabase credentials"
