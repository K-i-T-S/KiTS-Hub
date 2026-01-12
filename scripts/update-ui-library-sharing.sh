#!/bin/bash

# Script to update all solution webpack configs with UI library sharing

echo "🔧 Updating Module Federation configs for UI library sharing..."

# Array of solution directories
solutions=(
    "solutions/inventory-management"
    "solutions/point-of-sale"
    "solutions/crm-system"
    "solutions/hr-management"
    "solutions/accounting-system"
    "solutions/analytics-dashboard"
)

# Function to update webpack config
update_webpack_config() {
    local solution_dir=$1
    local config_file="$solution_dir/webpack.config.cjs"
    
    echo "📝 Updating $config_file"
    
    # Check if config file exists
    if [[ ! -f "$config_file" ]]; then
        echo "❌ Config file not found: $config_file"
        return 1
    fi
    
    # Add UI library alias if not present
    if ! grep -q "'@kits-hub/ui'" "$config_file"; then
        echo "➕ Adding UI library alias..."
        sed -i "/@shared\/integration/a\        '@kits-hub/ui': path.resolve(__dirname, '../../packages/ui/src')," "$config_file"
    fi
    
    # Add UI library to shared dependencies if not present
    if ! grep -q "'@kits-hub/ui':" "$config_file"; then
        echo "➕ Adding UI library to shared dependencies..."
        sed -i "/'lucide-react': {/a\          '@kits-hub/ui': {\n            singleton: true,\n            requiredVersion: '^1.0.0',\n            eager: false,\n            import: '@kits-hub/ui',\n            shareKey: '@kits-hub/ui',\n            shareScope: 'default',\n          }," "$config_file"
    fi
    
    echo "✅ Updated $solution_dir"
}

# Update each solution
for solution in "${solutions[@]}"; do
    update_webpack_config "$solution"
done

echo "🎉 All solution webpack configs updated with UI library sharing!"
echo ""
echo "📋 Summary of changes:"
echo "  - Added @kits-hub/ui alias to all solution webpack configs"
echo "  - Added @kits-hub/ui to Module Federation shared dependencies"
echo "  - Configured singleton pattern for consistent UI library usage"
echo ""
echo "🚀 Solutions can now import and use UI components:"
echo "  import { Button, Card } from '@kits-hub/ui';"
echo ""
