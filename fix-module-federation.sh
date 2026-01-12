#!/bin/bash

echo "🔧 Fixing Module Federation configurations for all solutions..."

# Fix lucide-react configuration in all solutions
solutions=(
    "accounting-system"
    "analytics-dashboard"
    "crm-system"
    "hr-management"
    "inventory-management"
    "point-of-sale"
)

for solution in "${solutions[@]}"; do
    echo "Fixing $solution..."
    
    # Fix the lucide-react configuration
    sed -i "s|'@kits-hub\/ui': {$/, 'lucide-react': {$/, 'singleton': false, 'requiredVersion': dependencies\['lucide-react'],/g}" "solutions/$solution/webpack.config.cjs"
    
    echo "✅ Fixed $solution"
done

echo "✅ Module Federation configurations fixed for all solutions"
