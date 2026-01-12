# KiTS Hub Monorepo Setup Guide

This guide covers the complete setup and management of the KiTS Hub monorepo using npm workspaces with 2026 best practices.

## 🏗️ Architecture Overview

The KiTS Hub monorepo is organized as follows:

```
kits-hub/
├── packages/                    # Shared packages
│   ├── ui/                   # UI component library
│   ├── config/                # Configuration management
│   ├── auth/                  # Authentication package
│   └── database/              # Database utilities
├── shared-shell/               # Micro-frontend host application
├── shared/                     # Shared libraries and utilities
├── solutions/                  # Business solution micro-frontends
│   ├── inventory-management/
│   ├── point-of-sale/
│   ├── crm-system/
│   ├── hr-management/
│   ├── accounting-system/
│   └── analytics-dashboard/
├── business-kits/              # Business kits application
├── kits-hub-v2.0/            # KiTS Hub v2.0 application
├── tests/                      # Testing infrastructure
└── scripts/                    # Management and utility scripts
```

## 📦 Workspace Configuration

### Root package.json

The root `package.json` defines all workspaces and shared dependencies:

```json
{
  "workspaces": [
    "packages/*",
    "shared-shell",
    "shared/*",
    "solutions/*",
    "business-kits",
    "kits-hub-v2.0",
    "tests"
  ],
  "dependencies": {
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "@supabase/supabase-js": "2.49.8",
    // ... other shared dependencies
  }
}
```

### .npmrc Configuration

The `.npmrc` file optimizes dependency management:

```ini
# Workspace and hoisting configuration
workspaces=true
workspaces-hoist-pattern=*
link-workspace-packages=true

# Save exact versions for reproducible builds
save-exact=true

# Dependency resolution for Module Federation
prefer-frozen-lockfile=true
strict-peer-deps=true
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x
- npm 10.x
- Git

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd kits-hub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build all workspaces:**
   ```bash
   npm run build
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```

## 📋 Available Scripts

### Development Scripts

```bash
# Start all applications
npm run dev

# Start individual applications
npm run dev:shell
npm run dev:inventory
npm run dev:pos
npm run dev:crm
npm run dev:hr
npm run dev:accounting
npm run dev:analytics
```

### Build Scripts

```bash
# Build all workspaces
npm run build

# Build individual workspaces
npm run build:shell
npm run build:inventory
# ... etc for each solution
```

### Testing Scripts

```bash
# Run all tests
npm run test

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:coverage
```

### Workspace Management

```bash
# List all workspaces
npm run workspaces:list

# Show detailed workspace information
npm run workspaces:info

# Synchronize workspace dependencies
npm run workspaces:sync

# Analyze dependencies across workspaces
npm run deps:analyze
```

## 🔧 Development Workflow

### 1. Adding New Dependencies

#### For Shared Dependencies
Add to root `package.json` if used by 3+ workspaces:

```bash
# Add to root
npm install --save-exact package-name@version

# Update workspaces
npm run workspaces:sync
```

#### For Workspace-Specific Dependencies
Add to individual workspace `package.json`:

```bash
# Navigate to workspace
cd solutions/inventory-management

# Install dependency
npm install --save-exact package-name@version
```

### 2. Creating New Workspaces

1. **Create workspace directory:**
   ```bash
   mkdir packages/new-package
   cd packages/new-package
   ```

2. **Initialize package.json:**
   ```json
   {
     "name": "@kits-hub/new-package",
     "version": "1.0.0",
     "private": true,
     "type": "commonjs",
     "main": "src/index.ts",
     "scripts": {
       "build": "tsc",
       "test": "vitest"
     }
   }
   ```

3. **Add to root workspaces:**
   ```json
   // In root package.json
   "workspaces": [
     // ... existing workspaces
     "packages/new-package"
   ]
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

### 3. Module Federation Setup

All solution workspaces use Module Federation. Key configuration:

#### webpack.config.cjs
```javascript
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'inventoryManagement',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
        './Dashboard': './src/Dashboard'
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.1' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.1' }
      }
    })
  ]
};
```

## 📏 Code Quality

### ESLint Configuration

Shared ESLint configuration in `.eslintrc.js`:

- TypeScript strict mode
- React hooks rules
- Import/export organization
- Security rules
- Module Federation support

### Prettier Configuration

Consistent code formatting with `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

### TypeScript Configuration

Base configuration in `tsconfig.base.json`:

- Path aliases for all workspaces
- Strict type checking
- Project references for incremental builds
- Module Federation compatibility

## 🔄 Dependency Management

### Hoisting Strategy

Dependencies are hoisted to root based on usage:

1. **Level 1** (Always hoisted):
   - react, react-dom
   - @supabase/supabase-js
   - lucide-react
   - typescript, eslint

2. **Level 2** (Hoisted when used by 3+ workspaces):
   - @tanstack/react-query
   - react-router-dom
   - zod, date-fns

3. **Level 3** (Keep in workspaces):
   - @radix-ui components
   - Specialized libraries

### Version Management

- **Exact versions**: All dependencies use exact versions
- **Unified versions**: React 18.3.1 enforced across all workspaces
- **Security updates**: Critical vulnerabilities fixed immediately
- **Overrides**: Root package.json overrides ensure consistency

## 🧪 Testing Strategy

### Test Organization

```
tests/
├── unit/                    # Unit tests
├── integration/              # Integration tests
├── e2e/                    # End-to-end tests
├── visual/                  # Visual regression tests
└── performance/             # Performance tests
```

### Running Tests

```bash
# All tests
npm run test

# Specific test types
npm run test:unit          # Unit tests only
npm run test:integration     # Integration tests only
npm run test:e2e           # E2E tests only
npm run test:coverage       # With coverage report

# Individual workspace tests
npm run test:inventory
npm run test:pos
# ... etc
```

## 📦 Building and Deployment

### Build Process

1. **Clean builds**: Each workspace builds to its own `dist/` directory
2. **Type checking**: TypeScript compilation with strict mode
3. **Optimization**: Bundle optimization and tree shaking
4. **Source maps**: Generated for debugging

### Production Build

```bash
# Build all workspaces
npm run build

# Start production servers
npm run start:prod
```

### Module Federation Build

Each solution generates:
- `remoteEntry.js` - Module federation entry point
- `dist/` - Optimized build output
- Source maps for debugging

## 🔍 Troubleshooting

### Common Issues

#### Dependency Conflicts
```bash
# Check for conflicts
npm run deps:analyze

# Sync dependencies
npm run workspaces:sync
```

#### Module Federation Issues
```bash
# Check remote entry files
find solutions -name "remoteEntry.js"

# Test module loading
npm run test:module-federation
```

#### Build Failures
```bash
# Clean all builds
npm run clean

# Rebuild from scratch
npm run clean:deps
npm install
npm run build
```

### Performance Issues

```bash
# Analyze bundle sizes
npm run deps:analyze

# Check build times
time npm run build
```

## 📚 Best Practices

### 1. Dependency Management
- Use exact versions
- Hoist shared dependencies
- Regular security audits
- Keep package-lock.json committed

### 2. Code Organization
- Follow naming conventions (@kits-hub/package-name)
- Use path aliases consistently
- Keep business logic in solutions
- Share utilities through packages

### 3. Module Federation
- Expose minimal components
- Share dependencies properly
- Handle loading errors
- Test remote loading

### 4. Testing
- Test at unit, integration, and E2E levels
- Use consistent test patterns
- Maintain good coverage
- Test Module Federation scenarios

### 5. Development Workflow
- Use workspace scripts
- Leverage dependency hoisting
- Follow linting and formatting rules
- Use TypeScript strict mode

## 🛠️ Advanced Configuration

### Custom Scripts

The `scripts/` directory contains utility scripts:

- `workspace-info.js` - Detailed workspace information
- `sync-workspaces.js` - Dependency synchronization
- `analyze-dependencies.js` - Dependency analysis

### Environment Configuration

Use the `@kits-hub/config` package for type-safe environment variable management.

### CI/CD Integration

The monorepo is designed for CI/CD pipelines with:
- Parallel builds
- Incremental deployments
- Automated testing
- Security scanning

## 📞 Support

For issues with the monorepo setup:

1. Check this guide first
2. Run `npm run workspaces:info` for diagnostics
3. Check GitHub issues
4. Contact the development team

## 🔄 Updates and Maintenance

### Regular Tasks

1. **Weekly**: Security audits, dependency updates
2. **Monthly**: Major dependency upgrades, performance analysis
3. **Quarterly**: Architecture review, optimization planning

### Keeping Updated

```bash
# Check for updates
npm outdated

# Update dependencies
npm run deps:update

# Security audit
npm audit fix
```

This monorepo setup provides a scalable, maintainable foundation for the KiTS Hub micro-frontend architecture with proper dependency management, consistent tooling, and optimized development workflows.
