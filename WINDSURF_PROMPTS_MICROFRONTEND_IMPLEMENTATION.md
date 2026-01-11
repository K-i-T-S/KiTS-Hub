# 🚀 KiTS Hub Micro-Frontend Implementation - Windsurf Prompts
## Complete Ready-to-Paste Prompts for Multiple Chat Sessions

---

## 📋 **PROMPT 1: Shared-Shell Application Creation**
**Chat Session**: Shell Foundation  
**Expected Duration**: 2-3 hours  
**Dependencies**: None

```
You are a micro-frontend architecture specialist. I need you to create the shared-shell host application for the KiTS Hub platform.

CONTEXT:
- We have 6 working React solutions running on ports 4177-4182
- All solutions use React 18.3.1, TypeScript, Tailwind CSS, and Supabase
- We need to integrate them using Module Federation
- The shell will be the host application running on port 3000

TASKS:
1. Create shared-shell directory structure
2. Initialize package.json with correct dependencies
3. Configure TypeScript and build setup
4. Create basic shell application with navigation
5. Configure Module Federation for the shell
6. Set up webpack configuration for remote loading

DIRECTORY STRUCTURE TO CREATE:
```
shared-shell/
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── Layout.tsx
│   │   ├── Navigation.tsx
│   │   └── ErrorBoundary.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   └── Settings.tsx
│   └── index.tsx
├── public/
│   └── index.html
├── package.json
├── webpack.config.js
├── tsconfig.json
├── tailwind.config.js
└── Dockerfile
```

REQUIREMENTS:
1. Use React 18.3.1 with TypeScript
2. Configure Module Federation with these remotes:
   - inventory: 'inventory@http://localhost:4177/remoteEntry.js'
   - pos: 'pos@http://localhost:4178/remoteEntry.js'
   - crm: 'crm@http://localhost:4179/remoteEntry.js'
   - hr: 'hr@http://localhost:4180/remoteEntry.js'
   - accounting: 'accounting@http://localhost:4181/remoteEntry.js'
   - analytics: 'analytics@http://localhost:4182/remoteEntry.js'
3. Create navigation header with links to all solutions
4. Use Tailwind CSS for styling (inherit from existing solutions)
5. Add error boundaries for remote loading failures
6. Include Supabase client integration
7. Add lazy loading for all remote components

DELIVERABLES:
1. Complete shared-shell application
2. Working webpack.config.js with Module Federation
3. Basic navigation and layout components
4. Error boundary components
5. Development server configuration
6. Instructions to run and test the shell

The shell should be fully functional and ready to load remote applications. Focus on clean architecture and proper error handling.
```

---

## 📋 **PROMPT 2: First Solution Module Federation Configuration**
**Chat Session**: Inventory Integration  
**Expected Duration**: 2-3 hours  
**Dependencies**: Shared-shell completed

```
You are a Module Federation specialist. I need you to configure the inventory-management solution to work as a remote application in our micro-frontend architecture.

CONTEXT:
- Shared-shell host application is ready and running on port 3000
- Inventory management solution is working on port 4177
- We need to expose inventory components for remote loading
- Solution uses React 18.3.1, TypeScript, Tailwind CSS, and Supabase

CURRENT INVENTORY STRUCTURE:
```
solutions/inventory-management/
├── src/
│   ├── App.tsx
│   ├── components/
│   ├── pages/
│   │   ├── InventoryDashboard.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── SuppliersPage.tsx
│   │   ├── LocationsPage.tsx
│   │   ├── ReportsPage.tsx
│   │   └── SettingsPage.tsx
│   └── lib/
│       └── supabase-client.ts
├── package.json
├── vite.config.ts
└── tsconfig.json
```

TASKS:
1. Convert from Vite to Webpack for Module Federation support
2. Configure Module Federation to expose components
3. Update build configuration for remote deployment
4. Ensure shared dependencies are properly configured
5. Test remote loading functionality
6. Update package.json scripts for new build system

MODULE FEDERATION CONFIGURATION:
Expose these components:
- './InventoryApp': './src/App.tsx'
- './InventoryDashboard': './src/pages/InventoryDashboard.tsx'
- './ProductsPage': './src/pages/ProductsPage.tsx'
- './SuppliersPage': './src/pages/SuppliersPage.tsx'
- './LocationsPage': './src/pages/LocationsPage.tsx'
- './ReportsPage': './src/pages/ReportsPage.tsx'
- './SettingsPage': './src/pages/SettingsPage.tsx'

SHARED DEPENDENCIES:
- react: { singleton: true, requiredVersion: '^18.3.1' }
- react-dom: { singleton: true, requiredVersion: '^18.3.1' }
- @supabase/supabase-js: { singleton: true }
- lucide-react: { singleton: false }

REQUIREMENTS:
1. Maintain all existing functionality
2. Ensure Supabase integration continues to work
3. Keep the same styling and UI components
4. Add proper error handling for remote context
5. Test both standalone and remote loading
6. Update development server to work with new configuration

DELIVERABLES:
1. Updated webpack.config.js with Module Federation
2. Modified package.json with webpack scripts
3. Working remoteEntry.js generation
4. Instructions to test remote loading
5. Verification that all features work in both modes

The inventory solution should continue working standalone while being available for remote loading in the shell.
```

---

## 📋 **PROMPT 3: Shared UI Components Library**
**Chat Session**: UI Components Extraction  
**Expected Duration**: 3-4 hours  
**Dependencies**: None (can run in parallel)

```
You are a UI component library specialist. I need you to extract and create a shared UI components library from the kits-hub-v2.0 application.

CONTEXT:
- kits-hub-v2.0 is a Next.js application with luxury design components
- We need to create a shared component library for all solutions
- Components should be framework-agnostic (React components)
- Target usage: Module Federation shared dependencies

SOURCE LOCATION:
```
kits-hub-v2.0/components/ui/
```

TARGET STRUCTURE:
```
shared/ui-components/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── accordion.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── switch.tsx
│   │   │   └── radio-group.tsx
│   │   ├── layout/
│   │   │   ├── layout.tsx
│   │   │   ├── navigation.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── header.tsx
│   │   └── business/
│   │       ├── product-card.tsx
│   │       ├── customer-card.tsx
│   │       ├── sale-item.tsx
│   │       └── employee-card.tsx
│   ├── hooks/
│   │   ├── use-api.ts
│   │   ├── use-auth.ts
│   │   ├── use-tenant.ts
│   │   └── use-notification.ts
│   ├── utils/
│   │   ├── format-currency.ts
│   │   ├── format-date.ts
│   │   ├── generate-barcode.ts
│   │   └── validate-email.ts
│   ├── styles/
│   │   ├── globals.css
│   │   └── components.css
│   └── index.ts
├── package.json
├── rollup.config.js
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

TASKS:
1. Extract all UI components from kits-hub-v2.0
2. Remove Next.js specific dependencies
3. Convert to standalone React components
4. Create proper TypeScript definitions
5. Set up Rollup build system for library distribution
6. Configure Tailwind CSS for component styling
7. Create comprehensive index.ts exports
8. Add business-specific components
9. Include utility hooks and functions
10. Create documentation and examples

REQUIREMENTS:
1. Components must be framework-agnostic (pure React)
2. Maintain luxury design system and styling
3. Include all TypeScript type definitions
4. Support both light and dark themes
5. Include proper accessibility features
6. Add comprehensive JSDoc documentation
7. Create Storybook configuration (optional)
8. Ensure compatibility with Module Federation

DELIVERABLES:
1. Complete shared-ui-components package
2. Built distribution files (ESM and CJS)
3. TypeScript declaration files
4. Package configuration for npm publishing
5. Documentation and usage examples
6. Integration guide for existing solutions

The shared UI library should be immediately usable by all solutions and the shell application.
```

---

## 📋 **PROMPT 4: All Solutions Module Federation Configuration**
**Chat Session**: Bulk Solution Configuration  
**Expected Duration**: 4-5 hours  
**Dependencies**: First solution configured as proof of concept

```
You are a Module Federation configuration specialist. I need you to configure the remaining 5 solutions to work as remote applications.

CONTEXT:
- Inventory management is already configured and working
- Shell application is ready and waiting for remotes
- All solutions are currently using Vite and need Webpack conversion
- Each solution needs to expose its main components

SOLUTIONS TO CONFIGURE:
1. Point of Sale (port 4178)
2. CRM System (port 4179)
3. HR Management (port 4180)
4. Accounting System (port 4181)
5. Analytics Dashboard (port 4182)

TASKS FOR EACH SOLUTION:
1. Convert vite.config.ts to webpack.config.js
2. Add Module Federation plugin configuration
3. Expose main components and pages
4. Update package.json scripts
5. Configure shared dependencies
6. Test standalone functionality
7. Test remote loading capability
8. Update development server configuration

EXPOSE COMPONENTS PER SOLUTION:

**Point of Sale**:
- './PosApp': './src/App.tsx'
- './PosDashboard': './src/pages/PosDashboard.tsx'
- './CheckoutPage': './src/pages/CheckoutPage.tsx'
- './TransactionsPage': './src/pages/TransactionsPage.tsx'
- './ReceiptsPage': './src/pages/ReceiptsPage.tsx'
- './SettingsPage': './src/pages/SettingsPage.tsx'

**CRM System**:
- './CrmApp': './src/App.tsx'
- './CrmDashboard': './src/pages/CrmDashboard.tsx'
- './CustomersPage': './src/pages/CustomersPage.tsx'
- './CommunicationsPage': './src/pages/CommunicationsPage.tsx'
- './SalesPage': './src/pages/SalesPage.tsx'
- './SettingsPage': './src/pages/SettingsPage.tsx'

**HR Management**:
- './HrApp': './src/App.tsx'
- './HrDashboard': './src/pages/HrDashboard.tsx'
- './EmployeesPage': './src/pages/EmployeesPage.tsx'
- './AttendancePage': './src/pages/AttendancePage.tsx'
- './PayrollPage': './src/pages/PayrollPage.tsx'
- './SettingsPage': './src/pages/SettingsPage.tsx'

**Accounting System**:
- './AccountingApp': './src/App.tsx'
- './AccountingDashboard': './src/pages/AccountingDashboard.tsx'
- './TransactionsPage': './src/pages/TransactionsPage.tsx'
- './InvoicesPage': './src/pages/InvoicesPage.tsx'
- './ReportsPage': './src/pages/ReportsPage.tsx'
- './SettingsPage': './src/pages/SettingsPage.tsx'

**Analytics Dashboard**:
- './AnalyticsApp': './src/App.tsx'
- './AnalyticsDashboard': './src/pages/AnalyticsDashboard.tsx'
- './ReportsPage': './src/pages/ReportsPage.tsx'
- './KpiPage': './src/pages/KpiPage.tsx'
- './TrendsPage': './src/pages/TrendsPage.tsx'
- './SettingsPage': './src/pages/SettingsPage.tsx'

SHARED DEPENDENCIES CONFIGURATION:
```javascript
shared: {
  'react': { singleton: true, requiredVersion: '^18.3.1' },
  'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
  '@supabase/supabase-js': { singleton: true },
  'lucide-react': { singleton: false },
  '@kits-hub/shared-ui': { singleton: true, requiredVersion: '^1.0.0' }
}
```

REQUIREMENTS:
1. Maintain all existing functionality
2. Ensure Supabase integration works in all solutions
3. Keep same styling and UI patterns
4. Add proper error handling
5. Test both standalone and remote modes
6. Update all build and development scripts
7. Ensure proper TypeScript configuration

DELIVERABLES:
1. Updated webpack.config.js for all 5 solutions
2. Modified package.json files
3. Working remoteEntry.js files for all solutions
4. Testing instructions for each solution
5. Integration verification checklist
6. Troubleshooting guide for common issues

All solutions should be ready for remote loading while maintaining standalone functionality.
```

---

## 📋 **PROMPT 5: Shell Integration & Navigation**
**Chat Session**: Shell Integration  
**Expected Duration**: 3-4 hours  
**Dependencies**: All remotes configured

```
You are a micro-frontend integration specialist. I need you to integrate all configured remote applications into the shared-shell host application.

CONTEXT:
- All 6 solutions are configured as remotes
- Shell application is created with basic navigation
- Remote applications are ready to be loaded
- Need to implement seamless navigation and integration

CURRENT SHELL STATUS:
- Basic navigation structure exists
- Module Federation remotes are configured
- Need to implement actual remote loading
- Need to add error handling and loading states

TASKS:
1. Update shell App.tsx to load all remote applications
2. Implement lazy loading with Suspense
3. Add loading states and error boundaries
4. Create unified navigation experience
5. Implement solution switching
6. Add shared authentication state
7. Create layout components for remote content
8. Add breadcrumb navigation
9. Implement solution-specific styling
10. Add user feedback and notifications

REMOTE INTEGRATION REQUIREMENTS:
- Load each remote application on route navigation
- Handle remote loading failures gracefully
- Show loading indicators during remote loading
- Maintain authentication state across solutions
- Provide seamless navigation between solutions
- Support deep linking to specific solution pages
- Handle solution-specific routing

NAVIGATION STRUCTURE:
```typescript
// Routes to implement:
/                    - Dashboard/Overview
/inventory           - Inventory Management
/inventory/products  - Inventory Products
/inventory/suppliers - Inventory Suppliers
/pos                 - Point of Sale
/pos/checkout        - POS Checkout
/crm                 - CRM System
/crm/customers       - CRM Customers
/hr                  - HR Management
/hr/employees        - HR Employees
/accounting          - Accounting System
/accounting/invoices - Accounting Invoices
/analytics           - Analytics Dashboard
```

ERROR HANDLING:
- Remote loading failures
- Network connectivity issues
- Authentication errors
- Solution-specific errors
- Fallback UI components

SHARED STATE MANAGEMENT:
- User authentication status
- Tenant context
- Global notifications
- Theme preferences
- Language settings

REQUIREMENTS:
1. Implement React.lazy() for all remote components
2. Add Suspense boundaries with loading indicators
3. Create ErrorBoundary components for remote failures
4. Maintain consistent navigation state
5. Support browser back/forward navigation
6. Add proper route protection
7. Implement solution-specific layouts
8. Add responsive design for mobile

DELIVERABLES:
1. Updated shell App.tsx with remote integration
2. Navigation components with active states
3. Loading and error components
4. Layout wrapper components
5. Route protection logic
6. Shared state management
7. Testing instructions for all routes
8. Performance optimization for remote loading

The shell should provide a seamless experience loading and navigating between all remote applications.
```

---

## 📋 **PROMPT 6: Cross-Solution Integration Features**
**Chat Session**: Advanced Integration  
**Expected Duration**: 4-5 hours  
**Dependencies**: Shell integration complete

```
You are a cross-solution integration specialist. I need you to implement real-time features and data synchronization between the micro-frontend applications.

CONTEXT:
- All solutions are loaded in the shell
- Each solution has its own state and data
- Need to implement cross-solution communication
- Supabase real-time subscriptions are available

INTEGRATION FEATURES TO IMPLEMENT:

1. **Real-time Stock Updates** (Inventory ↔ POS)
   - POS sales update inventory stock levels
   - Inventory changes reflect in POS immediately
   - Low stock alerts across solutions

2. **Customer Data Synchronization** (CRM ↔ POS)
   - POS customer creation updates CRM
   - CRM customer changes reflect in POS
   - Purchase history synchronization

3. **Employee Performance Data** (HR ↔ Analytics)
   - HR employee data feeds analytics
   - Performance metrics aggregation
   - Real-time dashboard updates

4. **Financial Data Aggregation** (Accounting ↔ Analytics)
   - Sales data flows to accounting
   - Accounting summaries in analytics
   - Real-time financial reporting

5. **Unified Notifications**
   - Cross-solution event notifications
   - Alert system for important events
   - User preference management

TECHNICAL IMPLEMENTATION:

1. **Event Bus System**
```typescript
// Create shared event bus
class EventBus {
  private events: Map<string, Function[]> = new Map();
  
  emit(event: string, data: any): void
  on(event: string, callback: Function): void
  off(event: string, callback: Function): void
}
```

2. **Supabase Real-time Integration**
```typescript
// Set up real-time subscriptions
const subscription = supabase
  .channel('cross-solution-events')
  .on('postgres_changes', { event: '*', schema: 'public' }, handleRealtimeUpdate)
  .subscribe()
```

3. **Shared State Management**
```typescript
// Cross-solution state store
interface SharedState {
  currentUser: User;
  tenantContext: TenantContext;
  notifications: Notification[];
  globalSettings: GlobalSettings;
}
```

4. **Data Synchronization Service**
```typescript
// Sync service for cross-solution data
class DataSyncService {
  syncCustomerData(customerId: string): Promise<void>
  syncInventoryData(productId: string): Promise<void>
  syncFinancialData(transactionId: string): Promise<void>
}
```

SPECIFIC INTEGRATION SCENARIOS:

**Scenario 1: POS Sale → Inventory Update**
1. POS processes sale
2. Emit 'sale-processed' event
3. Inventory listens and updates stock
4. Analytics receives sales data
5. Accounting records transaction

**Scenario 2: New Customer → CRM Sync**
1. POS creates new customer
2. Emit 'customer-created' event
3. CRM receives and enriches customer data
4. Analytics updates customer metrics

**Scenario 3: Low Stock → Alert System**
1. Inventory detects low stock
2. Emit 'low-stock' event
3. POS shows warning
4. Notifications sent to relevant users

REQUIREMENTS:
1. Use existing Supabase real-time capabilities
2. Implement proper error handling and retry logic
3. Ensure data consistency across solutions
4. Add conflict resolution for concurrent updates
5. Implement proper event typing and validation
6. Add performance monitoring and logging
7. Create fallback mechanisms for offline scenarios

DELIVERABLES:
1. Event bus implementation
2. Real-time subscription setup
3. Data synchronization services
4. Cross-solution notification system
5. Integration testing suite
6. Performance monitoring setup
7. Documentation for integration patterns
8. Troubleshooting guide for sync issues

The integration should provide seamless real-time data flow between all solutions while maintaining data integrity and performance.
```

---

## 📋 **PROMPT 7: Testing & Quality Assurance**
**Chat Session**: Testing Implementation  
**Expected Duration**: 3-4 hours  
**Dependencies**: All integration features complete

```
You are a micro-frontend testing specialist. I need you to implement comprehensive testing for the KiTS Hub micro-frontend architecture.

CONTEXT:
- All 6 solutions are configured as remotes
- Shell application integrates all solutions
- Cross-solution features are implemented
- Need comprehensive testing coverage

TESTING REQUIREMENTS:

1. **Unit Testing**
   - Component testing for all shared components
   - Service testing for integration services
   - Utility function testing
   - Mock implementations for external dependencies

2. **Integration Testing**
   - Module Federation loading tests
   - Cross-solution API testing
   - Real-time subscription testing
   - Authentication flow testing

3. **End-to-End Testing**
   - User journey testing across solutions
   - Cross-solution workflow testing
   - Performance testing with loaded remotes
   - Accessibility testing

4. **Visual Regression Testing**
   - UI consistency across solutions
   - Responsive design testing
   - Theme consistency verification
   - Component variation testing

TESTING FRAMEWORK SETUP:

**Unit Testing (Vitest)**
```typescript
// vitest.config.js
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
})
```

**Integration Testing (Playwright)**
```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] }
    }
  ],
  webServer: {
    command: 'npm run start:test',
    port: 3000
  }
})
```

**Component Testing (Storybook)**
```typescript
// .storybook/main.ts
export default {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions'
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  }
}
```

TEST SCENARIOS TO IMPLEMENT:

**Module Federation Tests**
- Remote loading success/failure
- Shared dependency conflicts
- Version compatibility testing
- Network error handling

**Cross-Solution Workflow Tests**
- Complete sales workflow (POS → Inventory → Accounting)
- Customer creation workflow (POS → CRM → Analytics)
- Employee onboarding (HR → All solutions)
- Financial reporting (All solutions → Analytics)

**Performance Tests**
- Initial load time with all remotes
- Remote switching performance
- Memory usage monitoring
- Bundle size optimization

**Accessibility Tests**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast verification

**Security Tests**
- Authentication state persistence
- Tenant isolation verification
- API security testing
- XSS protection verification

TESTING STRUCTURE:
```
tests/
├── unit/
│   ├── components/
│   ├── services/
│   ├── utils/
│   └── hooks/
├── integration/
│   ├── module-federation/
│   ├── cross-solution/
│   └── api/
├── e2e/
│   ├── workflows/
│   ├── performance/
│   └── accessibility/
├── visual/
│   ├── screenshots/
│   └── regression/
└── fixtures/
    ├── mock-data/
    └── test-accounts/
```

QUALITY GATES:
1. All unit tests pass (>80% coverage)
2. All integration tests pass
3. All e2e tests pass
4. Performance benchmarks met
5. Accessibility compliance verified
6. Security scans pass
7. Visual regression tests pass

DELIVERABLES:
1. Complete testing framework setup
2. Test suites for all components and services
3. Integration test scenarios
4. E2E test automation
5. Performance testing setup
6. Accessibility testing configuration
7. CI/CD integration for automated testing
8. Testing documentation and guidelines

The testing suite should ensure reliability, performance, and quality across the entire micro-frontend architecture.
```

---

## 📋 **PROMPT 8: Production Deployment & Optimization**
**Chat Session**: Deployment Preparation  
**Expected Duration**: 3-4 hours  
**Dependencies**: Testing complete

```
You are a DevOps and deployment specialist. I need you to prepare the KiTS Hub micro-frontend architecture for production deployment.

CONTEXT:
- All micro-frontend integration is complete
- Testing suite is implemented and passing
- Need to deploy to production environment
- Require monitoring, optimization, and scaling

DEPLOYMENT REQUIREMENTS:

1. **Production Build Configuration**
   - Optimized webpack builds for all applications
   - Asset optimization and compression
   - Bundle size analysis and optimization
   - Source map generation for debugging

2. **Container Configuration**
   - Docker images for all applications
   - Multi-stage builds for optimization
   - Environment-specific configurations
   - Health check implementations

3. **Infrastructure Setup**
   - Load balancer configuration
   - CDN setup for static assets
   - Database connection pooling
   - Caching strategies

4. **Monitoring & Observability**
   - Application performance monitoring
   - Error tracking and alerting
   - Log aggregation and analysis
   - Health check endpoints

PRODUCTION OPTIMIZATION TASKS:

**Webpack Production Configuration**
```javascript
// webpack.prod.js for each application
module.exports = merge(webpackConfig, {
  mode: 'production',
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  performance: {
    maxAssetSize: 244 * 1024, // 244KB
    maxEntrypointSize: 244 * 1024
  }
})
```

**Docker Configuration**
```dockerfile
# Multi-stage Dockerfile for each application
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Kubernetes Deployment**
```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: kits-hub-shell
spec:
  replicas: 3
  selector:
    matchLabels:
      app: kits-hub-shell
  template:
    metadata:
      labels:
        app: kits-hub-shell
    spec:
      containers:
      - name: shell
        image: kits-hub/shell:latest
        ports:
        - containerPort: 80
        env:
        - name: NODE_ENV
          value: "production"
        - name: SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: kits-hub-secrets
              key: supabase-url
```

**Monitoring Setup**
```typescript
// monitoring/health-check.ts
export const healthCheck = async (req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version,
    remotes: await checkRemoteHealth()
  };
  
  res.status(200).json(health);
};
```

PERFORMANCE OPTIMIZATION:

1. **Bundle Optimization**
   - Code splitting for remote applications
   - Tree shaking for unused code
   - Compression and minification
   - CDN caching strategies

2. **Runtime Optimization**
   - Lazy loading implementation
   - Service worker for caching
   - Image optimization
   - Font loading optimization

3. **Database Optimization**
   - Connection pooling
   - Query optimization
   - Index optimization
   - Caching layer implementation

**CI/CD Pipeline**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    tags: ['v*']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm run test:all
  
  build:
    needs: test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        app: [shell, inventory, pos, crm, hr, accounting, analytics]
    steps:
      - name: Build ${{ matrix.app }}
        run: |
          cd ${{ matrix.app == 'shell' && 'shared-shell' || format('solutions/{0}', matrix.app) }}
          npm run build
          docker build -t kits-hub/${{ matrix.app }}:${{ github.sha }} .
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl apply -f k8s/
          kubectl set image deployment/kits-hub-shell shell=kits-hub/shell:${{ github.sha }}
```

MONITORING & ALERTING:

1. **Application Metrics**
   - Response times
   - Error rates
   - Throughput metrics
   - Resource utilization

2. **Business Metrics**
   - User engagement
   - Feature usage
   - Cross-solution navigation
   - Performance benchmarks

3. **Infrastructure Metrics**
   - Server health
   - Database performance
   - Network latency
   - CDN performance

DELIVERABLES:
1. Production webpack configurations
2. Docker images for all applications
3. Kubernetes deployment manifests
4. CI/CD pipeline configuration
5. Monitoring and alerting setup
6. Performance optimization implementation
7. Security hardening configuration
8. Deployment documentation and runbooks

The production deployment should be scalable, monitored, and optimized for performance.
```

---

## 🎯 **EXECUTION STRATEGY**

### **Parallel Execution Possibilities**

**Can Run in Parallel:**
- PROMPT 3 (UI Components) + PROMPT 1 (Shell) - Independent
- PROMPT 4 (All Solutions) + PROMPT 2 (First Solution) - After first is proven

**Sequential Dependencies:**
1. PROMPT 1 → PROMPT 2 (Shell needed before first solution)
2. PROMPT 2 → PROMPT 4 (Proof of concept needed before bulk)
3. PROMPT 4 → PROMPT 5 (All remotes needed before integration)
4. PROMPT 5 → PROMPT 6 (Integration needed before features)
5. PROMPT 6 → PROMPT 7 (Features needed before testing)
6. PROMPT 7 → PROMPT 8 (Testing needed before deployment)

### **Timeline Optimization**

**Week 1:**
- Day 1: PROMPT 1 (Shell) + PROMPT 3 (UI Components) - Parallel
- Day 2: PROMPT 2 (First Solution)
- Day 3-4: PROMPT 4 (All Solutions)

**Week 2:**
- Day 5: PROMPT 5 (Shell Integration)
- Day 6-7: PROMPT 6 (Cross-Solution Features)

**Week 3:**
- Day 8-9: PROMPT 7 (Testing & QA)
- Day 10: PROMPT 8 (Deployment & Optimization)

### **Success Criteria**

**After PROMPT 1-2:** Shell + 1 solution working
**After PROMPT 4:** All solutions loading in shell
**After PROMPT 5:** Seamless navigation between solutions
**After PROMPT 6:** Real-time cross-solution features
**After PROMPT 7:** Production-ready quality
**After PROMPT 8:** Deployed and monitored production system

---

## 🚀 **READY TO EXECUTE**

Copy and paste each prompt into separate Windsurf chat sessions. The prompts are designed to be:
- **Self-contained** with all necessary context
- **Action-oriented** with clear deliverables
- **Sequentially dependent** where required
- **Parallelizable** where possible

**Total Estimated Time: 2-3 weeks for complete implementation**
