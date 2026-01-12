# KiTS Hub Dependency Migration Roadmap

## Executive Summary

This roadmap provides a step-by-step migration plan to resolve all identified dependency conflicts, security vulnerabilities, and build system inconsistencies across the KiTS Hub monorepo. The migration is designed to be executed in phases to minimize disruption while ensuring production stability.

## Migration Phases Overview

### Phase 1: Critical Security Fixes (Immediate - 1 day)
### Phase 2: React Ecosystem Unification (1-2 days)
### Phase 3: Build System Migration (3-5 days)
### Phase 4: Workspace Optimization (2-3 days)
### Phase 5: Module Federation Configuration (1-2 days)
### Phase 6: Validation & Testing (2-3 days)

---

## Phase 1: Critical Security Fixes ⚡

**Timeline**: Immediate (1 day)
**Risk Level**: HIGH (Security vulnerability)
**Impact**: All applications using jspdf

### 1.1 Update jspdf Security Vulnerability

**Current Issue**: 
- jspdf v3.0.4 has critical Local File Inclusion vulnerability (GHSA-f8cm-6447-x5h2)
- React Router v6.28.0 has external redirect vulnerability (GHSA-9jcx-v3wj-wh4m)

**Action Required**:
```bash
# Update jspdf to secure version across all applications
npm install jspdf@4.0.0 --save

# Update React Router to secure version
npm install react-router-dom@6.30.2 --save
```

**Affected Applications**:
- business-kits
- accounting-system
- analytics-dashboard
- crm-system
- hr-management
- point-of-sale

**Breaking Changes**: 
- API changes in jspdf 4.0.0
- Update import statements if necessary
- Test PDF generation functionality
- React Router 6.30.2 API changes (minimal breaking changes)
- Test routing functionality

**Validation**:
```bash
npm audit
# Should show no critical vulnerabilities
```

---

## Phase 2: React Ecosystem Unification 🔄

**Timeline**: 1-2 days
**Risk Level**: HIGH (Module Federation compatibility)
**Impact**: kits-hub-v2.0 downgrade, all applications type updates

### 2.1 Standardize React Version

**Current Conflict**:
- Most applications: React 18.3.1
- kits-hub-v2.0: React 19.2.3

**Target State**: React 18.3.1 across all applications

**Actions**:

#### 2.1.1 Downgrade kits-hub-v2.0 React
```bash
cd kits-hub-v2.0
npm install react@18.3.1 react-dom@18.3.1
npm install @types/react@18.3.11 @types/react-dom@18.3.0 --save-dev
```

#### 2.1.2 Update TypeScript Configuration
```json
// kits-hub-v2.0/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### 2.1.3 Update React 19 Specific Code
Review and update any React 19 specific features:
- Check for `<Suspense>` fallback changes
- Update concurrent features usage
- Verify server components compatibility

### 2.2 Standardize Module Types

**Current Issue**: Mixed "module" and "commonjs" types
**Target**: "commonjs" for Webpack 5 compatibility

**Actions**:
```json
// Update package.json in all applications
{
  "type": "commonjs"
}
```

**Exception**: Keep root workspace as "module"

**Validation**:
```bash
# Test build in each application
npm run build
```

---

## Phase 3: Build System Migration 🛠️

**Timeline**: 3-5 days
**Risk Level**: MEDIUM to HIGH
**Impact**: business-kits and kits-hub-v2.0 major changes

### 3.1 Migrate business-kits from Vite to Webpack 5

**Current State**: Vite 6.4.1
**Target State**: Webpack 5 with Module Federation

#### 3.1.1 Create Webpack Configuration
```javascript
// business-kits/webpack.config.cjs
const ModuleFederationPlugin = require('@module-federation/webpack');
const deps = require('./package.json').dependencies;

module.exports = {
  mode: 'development',
  devServer: {
    port: 4173,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'businessKits',
      filename: 'remoteEntry.js',
      exposes: {
        './BusinessKitsApp': './src/App',
      },
      shared: {
        ...deps,
        react: { singleton: true, requiredVersion: deps.react },
        'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
      },
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-react', '@babel/preset-env'],
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
};
```

#### 3.1.2 Update Dependencies
```bash
cd business-kits
npm install --save-dev @module-federation/webpack webpack webpack-cli webpack-dev-server
npm install --save-dev babel-loader @babel/preset-react @babel/preset-env
npm install --save-dev css-loader style-loader postcss postcss-loader
npm uninstall vite @vitejs/plugin-react-swc
```

#### 3.1.3 Update Scripts
```json
{
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production",
    "preview": "webpack serve --mode production"
  }
}
```

#### 3.1.4 Create HTML Template
```html
<!-- business-kits/public/index.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>Business Kits</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

### 3.2 Migrate kits-hub-v2.0 from Next.js to Webpack 5

**Current State**: Next.js 16.1.1
**Target State**: Webpack 5 with Module Federation

#### 3.2.1 Extract Components from Next.js Structure
- Move components from `app/` directory to `src/`
- Convert Next.js specific components to standard React
- Remove Next.js specific imports and APIs

#### 3.2.2 Create Webpack Configuration
```javascript
// kits-hub-v2.0/webpack.config.cjs
const ModuleFederationPlugin = require('@module-federation/webpack');
const deps = require('./package.json').dependencies;
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  devServer: {
    port: 4174,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'kitsHubV2',
      filename: 'remoteEntry.js',
      exposes: {
        './KitsHubV2App': './src/App',
      },
      shared: {
        ...deps,
        react: { singleton: true, requiredVersion: deps.react },
        'react-dom': { singleton: true, requiredVersion: deps['react-dom'] },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-react', '@babel/preset-env'],
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
};
```

#### 3.2.3 Update Dependencies
```bash
cd kits-hub-v2.0
npm install --save-dev @module-federation/webpack webpack webpack-cli webpack-dev-server
npm install --save-dev babel-loader @babel/preset-react @babel/preset-env
npm install --save-dev css-loader style-loader postcss postcss-loader html-webpack-plugin
npm uninstall next @next/bundle-analyzer eslint-config-next
```

#### 3.2.4 Update Scripts and Structure
```json
{
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production",
    "preview": "webpack serve --mode production"
  }
}
```

---

## Phase 4: Workspace Optimization 📦

**Timeline**: 2-3 days
**Risk Level**: MEDIUM
**Impact**: Reduced bundle sizes, improved build times

### 4.1 Configure Workspace Hoisting

#### 4.1.1 Update Root package.json
```json
{
  "workspaces": {
    "packages": [
      "business-kits",
      "kits-hub-v2.0", 
      "shared-shell",
      "solutions/*"
    ],
    "nohoist": [
      "**/webpack",
      "**/webpack-cli",
      "**/webpack-dev-server",
      "**/@module-federation/**",
      "**/next",
      "**/@next/**",
      "**/jspdf",
      "**/@dnd-kit/**",
      "**/i18next",
      "**/stripe"
    ]
  }
}
```

#### 4.1.2 Move Common Dependencies to Root
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@supabase/supabase-js": "^2.49.8",
    "lucide-react": "^0.487.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwindcss": "^4.1.8",
    "zod": "^3.25.76",
    "react-router-dom": "^6.30.2",
    "@tanstack/react-query": "^5.90.12"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "eslint": "^9.15.0",
    "vitest": "^4.0.16",
    "@testing-library/react": "^16.1.0",
    "playwright": "^1.57.0"
  }
}
```

### 4.2 Clean Application Dependencies

#### 4.2.1 Remove Hoisted Dependencies from Applications
For each application, remove dependencies that are now hoisted to root:

```bash
# Example for business-kits
cd business-kits
npm uninstall react react-dom @supabase/supabase-js lucide-react
# Keep application-specific dependencies
```

#### 4.2.2 Standardize Radix UI Versions
Update all applications to use consistent Radix UI versions:

```bash
# Update across all applications
npm install @radix-ui/react-accordion@^1.2.3
npm install @radix-ui/react-alert-dialog@^1.1.6
npm install @radix-ui/react-avatar@^1.1.3
# ... continue for all Radix UI components
```

### 4.3 Optimize Bundle Sizes

#### 4.3.1 Configure Tree Shaking
```javascript
// webpack.config.cjs additions
module.exports = {
  optimization: {
    usedExports: true,
    sideEffects: false,
  },
};
```

#### 4.3.2 Implement Code Splitting
```javascript
// webpack.config.cjs additions
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
```

---

## Phase 5: Module Federation Configuration 🔗

**Timeline**: 1-2 days
**Risk Level**: MEDIUM
**Impact:**

### 5.1 Configure Shared Dependencies

#### 5.1.1 Standardize Module Federation Shared Config
Create shared configuration for all applications:

```javascript
// shared-module-federation.config.cjs
const sharedDeps = {
  react: { singleton: true, requiredVersion: '^18.3.1', eager: true },
  'react-dom': { singleton: true, requiredVersion: '^18.3.1', eager: true },
  '@supabase/supabase-js': { singleton: false, requiredVersion: '^2.49.8' },
  'lucide-react': { singleton: false, requiredVersion: '^0.487.0' },
  'react-router-dom': { singleton: false, requiredVersion: '^6.30.2' },
  'zod': { singleton: false, requiredVersion: '^3.25.76' },
  'class-variance-authority': { singleton: false, requiredVersion: '^0.7.1' },
  'clsx': { singleton: false, requiredVersion: '^2.1.1' },
};

module.exports = { sharedDeps };
```

#### 5.1.2 Update All Webpack Configs
Apply shared configuration to all applications:

```javascript
// In each webpack.config.cjs
const { sharedDeps } = require('../shared-module-federation.config.cjs');

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'applicationName',
      filename: 'remoteEntry.js',
      exposes: { /* ... */ },
      shared: sharedDeps,
    }),
  ],
};
```

### 5.2 Update Shell Configuration

#### 5.2.1 Configure Remote Applications in Shell
```javascript
// shared-shell/webpack.config.cjs
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        businessKits: 'businessKits@http://localhost:4173/remoteEntry.js',
        kitsHubV2: 'kitsHubV2@http://localhost:4174/remoteEntry.js',
        inventory: 'inventory@http://localhost:4177/remoteEntry.js',
        pos: 'pos@http://localhost:4178/remoteEntry.js',
        crm: 'crm@http://localhost:4179/remoteEntry.js',
        hr: 'hr@http://localhost:4180/remoteEntry.js',
        accounting: 'accounting@http://localhost:4181/remoteEntry.js',
        analytics: 'analytics@http://localhost:4182/remoteEntry.js',
      },
      shared: sharedDeps,
    }),
  ],
};
```

---

## Phase 6: Validation & Testing ✅

**Timeline**: 2-3 days
**Risk Level**: LOW
**Impact**: Ensure migration success

### 6.1 Build Validation

#### 6.1.1 Test All Applications
```bash
# Test each application individually
cd business-kits && npm run build
cd kits-hub-v2.0 && npm run build
cd shared-shell && npm run build
cd solutions/inventory-management && npm run build
# ... continue for all solutions
```

#### 6.1.2 Test Workspace Build
```bash
# Test workspace build
npm run build
```

### 6.2 Module Federation Testing

#### 6.2.1 Test Remote Loading
```bash
# Start all applications
npm run dev

# Test remote loading in browser
# Navigate to shell application and test all remotes
```

#### 6.2.2 Test Shared Dependencies
```bash
# Verify shared dependencies are working
# Check network tab for duplicate dependencies
# Test cross-application functionality
```

### 6.3 Security Validation

#### 6.3.1 Final Security Audit
```bash
npm audit
# Should show no critical or high vulnerabilities
```

#### 6.3.2 Test Application Functionality
- Test all critical user workflows
- Verify PDF generation works with jspdf 4.0.0
- Test authentication and authorization
- Verify data synchronization between solutions

### 6.4 Performance Validation

#### 6.4.1 Bundle Size Analysis
```bash
# Analyze bundle sizes
npm run build:analyze

# Verify bundle size reduction
# Target: <5MB total, <1MB per remote
```

#### 6.4.2 Load Time Testing
```bash
# Test load times
npm run test:performance

# Target: <3s initial load, <2s FCP
```

---

## Rollback Strategy 🔄

### Pre-Migration Backup
```bash
# Create backup branch
git checkout -b backup/pre-dependency-migration
git add .
git commit -m "Backup before dependency migration"

# Create migration branch
git checkout -b feature/dependency-migration
```

### Rollback Procedures
```bash
# If migration fails, rollback:
git checkout backup/pre-dependency-migration
git checkout main
git merge backup/pre-dependency-migration
```

### Rollback Triggers
- Critical application functionality broken
- Build failures in production
- Security vulnerabilities introduced
- Performance degradation >50%

---

## Success Metrics 📊

### Dependency Metrics
- ✅ Zero critical security vulnerabilities
- ✅ React version unified across all applications
- ✅ All applications using Webpack 5
- ✅ Bundle size reduction >200MB
- ✅ Build time improvement >30%

### Functionality Metrics
- ✅ All applications build successfully
- ✅ Module Federation working correctly
- ✅ No breaking changes in user workflows
- ✅ Cross-application data synchronization working
- ✅ PDF generation working with jspdf 4.0.0

### Performance Metrics
- ✅ Initial load time <3 seconds
- ✅ First Contentful Paint <2 seconds
- ✅ Bundle size <5MB total
- ✅ Cache hit rate >90%

---

## Post-Migration Tasks 📋

### 1. Update Documentation
- Update development guides
- Update deployment documentation
- Update troubleshooting guides

### 2. Team Training
- Train team on new build system
- Document new development workflows
- Create migration guide for future dependencies

### 3. Monitoring Setup
- Set up dependency monitoring
- Configure automated security scanning
- Implement performance monitoring

### 4. Maintenance Procedures
- Establish dependency update procedures
- Create security vulnerability response plan
- Document Module Federation best practices

---

## Timeline Summary

| Phase | Duration | Start Date | End Date | Risk Level |
|-------|----------|------------|----------|------------|
| Phase 1: Security Fixes | 1 day | Day 1 | Day 1 | HIGH |
| Phase 2: React Unification | 1-2 days | Day 2 | Day 3 | HIGH |
| Phase 3: Build Migration | 3-5 days | Day 4 | Day 8 | MEDIUM-HIGH |
| Phase 4: Workspace Optimization | 2-3 days | Day 9 | Day 11 | MEDIUM |
| Phase 5: Module Federation | 1-2 days | Day 12 | Day 13 | MEDIUM |
| Phase 6: Validation & Testing | 2-3 days | Day 14 | Day 16 | LOW |
| **Total Duration** | **10-16 days** | **Day 1** | **Day 16** | **-** |

---

## Risk Mitigation 🛡️

### High-Risk Items
1. **React Version Downgrade**: May break React 19 specific features
2. **Build System Migration**: Complex configuration changes
3. **jspdf Update**: Breaking API changes

### Mitigation Strategies
1. **Feature Branch Development**: Isolate changes from main branch
2. **Incremental Testing**: Test each phase before proceeding
3. **Rollback Preparedness**: Maintain backup branch and rollback procedures
4. **Team Communication**: Regular status updates and risk assessments

### Contingency Plans
1. **Extended Timeline**: Allocate buffer time for complex migrations
2. **Expert Support**: Have Webpack and React experts available
3. **Staging Environment**: Test migrations in staging before production
4. **User Communication**: Prepare user communication for any downtime

---

## Conclusion

This migration roadmap provides a structured approach to resolving all identified dependency issues while minimizing risk and disruption. The phased approach allows for incremental validation and rollback capabilities at each stage.

Successful completion of this migration will result in:
- **Enhanced Security**: Elimination of critical vulnerabilities
- **Improved Performance**: Reduced bundle sizes and build times
- **Better Maintainability**: Unified dependency management
- **Module Federation Ready**: Properly configured micro-frontend architecture

The migration is complex but manageable with proper planning, testing, and risk mitigation strategies in place.
