# KiTS Hub Development Guide

Complete guide for setting up and developing KiTS Hub solutions.

## Prerequisites

- **Node.js** 20.x or higher
- **npm** 10.x or higher
- **Git** 2.30 or higher
- **Docker** 20.x or higher (for local development)
- **Supabase CLI** (for database management)

## Quick Setup

### 1. Install Dependencies

```bash
# Make script executable
chmod +x scripts/install-dependencies.sh

# Install all dependencies
./scripts/install-dependencies.sh
```

### 2. Environment Configuration

```bash
# Copy example environment files
cd solutions/inventory-management
cp .env.example .env

# Add your Supabase credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_TENANT_ID=your-tenant-id
```

### 3. Start Development

```bash
# Start all solutions
npm run dev:all

# Start individual solution
cd solutions/inventory-management
npm run dev
```

## Development Workflow

### Code Structure

```
kits-hub/
├── solutions/                    # Individual solutions
│   ├── inventory-management/
│   ├── point-of-sale/
│   ├── crm-system/
│   ├── hr-management/
│   ├── accounting-system/
│   └── analytics-dashboard/
├── shared/                      # Shared components and infrastructure
│   ├── ui-components/
│   ├── supabase-template/
│   ├── integration/
│   ├── monitoring/
│   ├── security/
│   └── ci-cd/
├── scripts/                     # Development and deployment scripts
└── docs/                       # Documentation
```

### Development Commands

```bash
# Development
npm run dev:all              # Start all solutions
npm run dev:inventory         # Start inventory management
npm run dev:pos               # Start point of sale
npm run dev:crm               # Start CRM system
npm run dev:hr                # Start HR management
npm run dev:accounting         # Start accounting system
npm run dev:analytics          # Start analytics dashboard

# Testing
npm run test:unit:all         # Run all unit tests
npm run test:integration:all    # Run all integration tests
npm run test:e2e:all           # Run all E2E tests
npm run test:coverage:all      # Run all tests with coverage

# Building
npm run build:all            # Build all solutions
npm run build:inventory       # Build inventory management
npm run build:pos             # Build point of sale
npm run build:crm             # Build CRM system
npm run build:hr              # Build HR management
npm run build:accounting        # Build accounting system
npm run build:analytics         # Build analytics dashboard

# Linting
npm run lint:all              # Lint all solutions
npm run lint:inventory         # Lint inventory management
npm run lint:pos               # Lint point of sale
npm run lint:crm               # Lint CRM system
npm run lint:hr                # Lint HR management
npm run lint:accounting         # Lint accounting system
npm run lint:analytics          # Lint analytics dashboard
```

## Database Setup

### 1. Local Development

```bash
# Start local Supabase instance
docker-compose -f docker-compose.dev.yml up -d

# Run migrations
npm run db:migrate

# Seed test data
npm run db:seed
```

### 2. Production Database

```bash
# Create new Supabase project
supabase projects create kits-hub-tenant

# Apply schema
psql $DATABASE_URL -f shared/supabase-template/schema.sql

# Set up RLS policies
psql $DATABASE_URL -f shared/supabase-template/rls-policies.sql
```

## Integration Development

### API Integration

```typescript
// Example: POS calling Inventory API
import { InventoryService } from '@/services/inventory';

const inventoryService = new InventoryService(tenantId);

// Check product availability
const availability = await inventoryService.getProductAvailability([
  'product-1',
  'product-2'
]);

// Update stock from sale
await inventoryService.updateStockFromSale([
  { product_id: 'product-1', quantity: 2 },
  { product_id: 'product-2', quantity: 1 }
]);
```

### Webhook Integration

```typescript
// Example: Handle inventory updates
import { WebhookService } from '@/services/webhooks';

WebhookService.handleWebhook('inventory.updated', async (payload) => {
  // Update local state
  // Refresh UI components
  // Show notifications
});
```

## Testing

### Unit Testing

```bash
# Run specific solution tests
cd solutions/inventory-management
npm run test:unit

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:unit:watch
```

### Integration Testing

```bash
# Setup test database
createdb kits_test

# Run integration tests
npm run test:integration

# With specific tenant
TEST_TENANT_ID=test-tenant npm run test:integration
```

### E2E Testing

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test
npx playwright test --grep "Inventory Management"

# Run in headed mode
npx playwright test --headed
```

## Deployment

### Local Development

```bash
# Build for development
npm run build:dev

# Start local servers
npm run start:dev
```

### Production Build

```bash
# Build for production
npm run build:prod

# Optimize build
npm run build:analyze
```

### Docker Deployment

```bash
# Build Docker images
npm run docker:build

# Run containers
npm run docker:up

# Stop containers
npm run docker:down
```

## Troubleshooting

### Common Issues

1. **TypeScript Errors**
   - Missing dependencies: Run `npm install`
   - Type errors: Check `tsconfig.json` paths
   - Import errors: Verify module exports

2. **Database Connection**
   - Check Supabase URL and keys
   - Verify RLS policies
   - Check network connectivity

3. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Vite configuration
   - Verify import paths

4. **Test Failures**
   - Check test database setup
   - Verify environment variables
   - Check test data seeding

### Debug Commands

```bash
# Debug Vite build
npm run dev:debug

# Debug tests
npm run test:debug

# Check types
npm run typecheck
```

## Best Practices

### Code Organization
- Use absolute imports with `@/` alias
- Follow TypeScript strict mode
- Implement proper error handling
- Use consistent naming conventions

### Performance
- Implement code splitting
- Use React.memo for expensive components
- Optimize database queries
- Implement proper caching

### Security
- Validate all inputs
- Implement proper authentication
- Use environment variables for secrets
- Follow OWASP guidelines

### Testing
- Write tests for all new features
- Maintain 80%+ test coverage
- Use descriptive test names
- Test error scenarios

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request
5. Address feedback
6. Merge to main

## Getting Help

- **Documentation**: Check `/docs` folder
- **Issues**: Create GitHub issue
- **Discussions**: Use GitHub Discussions
- **Slack**: Join our development Slack
- **Email**: dev@kits-hub.com

This guide should help you get started with KiTS Hub development quickly and efficiently.
