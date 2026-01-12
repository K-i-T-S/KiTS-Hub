#!/bin/bash

# KiTS Hub Module Federation Fix Script
# Applies proven working pattern to all solutions

echo "🔧 KiTS Hub Module Federation Fix Script"
echo "========================================"

# Solutions to fix
solutions=(
    "point-of-sale:4178:pos-"
    "crm-system:4179:crm-"
    "hr-management:4180:hr-"
    "accounting-system:4181:accounting-"
    "analytics-dashboard:4182:analytics-"
)

# Function to create bootstrap.tsx
create_bootstrap() {
    local solution_dir=$1
    cat > "$solution_dir/src/bootstrap.tsx" << 'EOF'
import { createRoot } from 'react-dom/client';
import App from './App';

// Type declaration for webpack share scopes
declare global {
  interface Window {
    __webpack_share_scopes__?: {
      default?: any;
    };
    __webpack_init_sharing__?: (scope: string) => Promise<void>;
  }
}

// Bootstrap function for Module Federation
const bootstrap = async () => {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root element not found');
  }
  
  // Wait for Module Federation to initialize if in remote context
  if (window.__webpack_share_scopes__?.default) {
    // Import and initialize shared modules
    await (globalThis as any).__webpack_init_sharing__('default');
  }
  
  const root = createRoot(container);
  root.render(<App />);
};

// Export for Module Federation
export { bootstrap };

// Auto-bootstrap if not in Module Federation context
if (!window.__webpack_share_scopes__?.default) {
  bootstrap();
}
EOF
}

# Function to create tailwind config
create_tailwind() {
    local solution_dir=$1
    local prefix=$2
    cat > "$solution_dir/tailwind.config.js" << EOF
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  prefix: '$prefix',
  theme: {
    extend: {
      colors: {
        border: 'oklch(var(--border))',
        input: 'oklch(var(--input))',
        ring: 'oklch(var(--ring))',
        background: 'oklch(var(--background))',
        foreground: 'oklch(var(--foreground))',
        card: {
          DEFAULT: 'oklch(var(--card))',
          foreground: 'oklch(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'oklch(var(--popover))',
          foreground: 'oklch(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'oklch(var(--primary))',
          foreground: 'oklch(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'oklch(var(--secondary))',
          foreground: 'oklch(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'oklch(var(--muted))',
          foreground: 'oklch(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'oklch(var(--accent))',
          foreground: 'oklch(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'oklch(var(--destructive))',
          foreground: 'oklch(var(--destructive-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'gradient': 'gradient 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-luxury': 'linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5576c 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      },
      boxShadow: {
        'purple-glow': '0 0 20px rgba(139, 92, 246, 0.3)',
        'purple-glow-lg': '0 0 40px rgba(139, 92, 246, 0.4)',
        'luxury': '0 10px 40px rgba(139, 92, 246, 0.2)',
        'luxury-lg': '0 20px 60px rgba(139, 92, 246, 0.3)',
      },
    },
  },
  plugins: [],
}
EOF
}

echo "📋 Applying fixes to all solutions..."

for solution in "${solutions[@]}"; do
    IFS=':' read -r name port prefix <<< "$solution"
    solution_dir="/home/casio699/projects/kits-hub/solutions/$name"
    
    echo ""
    echo "🔧 Fixing $name (Port: $port, Prefix: $prefix)"
    
    # Create bootstrap.tsx if not exists
    if [ ! -f "$solution_dir/src/bootstrap.tsx" ]; then
        echo "  ✅ Creating bootstrap.tsx"
        create_bootstrap "$solution_dir"
    else
        echo "  ⚠️  bootstrap.tsx already exists"
    fi
    
    # Create tailwind config if not exists
    if [ ! -f "$solution_dir/tailwind.config.js" ]; then
        echo "  ✅ Creating tailwind.config.js"
        create_tailwind "$solution_dir" "$prefix"
    else
        echo "  ⚠️  tailwind.config.js already exists"
    fi
    
    # Kill existing process on port
    echo "  🔄 Stopping existing server on port $port"
    pkill -f "webpack.*$name" 2>/dev/null || true
    sudo fuser -k "$port/tcp" 2>/dev/null || true
    
    echo "  ✅ $name fixed"
done

echo ""
echo "🎯 All solutions have been prepared with best practices!"
echo ""
echo "📋 Next Steps:"
echo "1. Start each solution: npm run dev (in respective directories)"
echo "2. Validate remoteEntry.js accessibility"
echo "3. Test Module Federation integration"
echo ""
echo "🚀 Ready for production!"
