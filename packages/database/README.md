# KiTS Hub Database Package

This package provides a unified database abstraction layer for the KiTS Hub multi-tenant SaaS platform.

## Features

- **Type-safe database operations** with full TypeScript support
- **Multi-tenant isolation** with automatic tenant context switching
- **Connection pooling** and retry logic for reliability
- **Repository pattern** for clean data access abstraction
- **Transaction support** for atomic operations
- **Comprehensive error handling** with detailed error messages

## Installation

```bash
npm install @kits-hub/database
```

## Usage

```typescript
import { getDatabaseClient, ProductRepository } from '@kits-hub/database';

// Initialize database client
const db = getDatabaseClient({
  url: process.env.DATABASE_URL,
  anonKey: process.env.SUPABASE_ANON_KEY
});

// Use with tenant context
await db.withTenant('tenant-123', async (client) => {
  const products = await client
    .from('products')
    .select('*');
  
  return products;
});

// Use repository pattern
const productRepo = new ProductRepository('tenant-123');
const products = await productRepo.findByCategory('electronics');
```

## Structure

```
packages/database/src/
├── supabase-client.ts     # Main database client with singleton pattern
├── types/
│   └── database.types.ts  # TypeScript type definitions
├── repositories/
│   ├── base.repository.ts    # Base repository with common CRUD operations
│   ├── product.repository.ts # Product-specific operations
│   ├── customer.repository.ts # Customer-specific operations
│   ├── employee.repository.ts # Employee-specific operations
│   └── index.ts           # Export all repositories
└── index.ts              # Main package exports
```

## Database Schema

The package includes comprehensive TypeScript types for all database tables:

- Multi-tenant foundation (tenants, tenant_users, user_profiles)
- Role-based access control (roles, permissions, user_roles)
- Inventory management (products, suppliers, locations, product_batches)
- Point of sale (sales, sale_items, split_payments, tips)
- CRM system (customers, customer_communications, marketing_campaigns)
- HR management (employees, attendance, payroll)
- Accounting (chart_of_accounts, financial_transactions, invoices)
- Workflow automation (workflows, workflow_executions)
- Public API & webhooks (api_keys, webhooks, webhook_deliveries)
- Security & audit (user_sessions, audit_logs)

## Error Handling

All database operations include comprehensive error handling with:

- **Detailed error messages** with context
- **Automatic retry logic** with exponential backoff
- **Tenant isolation** validation
- **Type safety** with proper error types

## Performance Features

- **Connection pooling** for optimal resource usage
- **Query optimization** with proper indexing
- **Batch operations** for high-volume data processing
- **Transaction support** for atomic operations

## Security

- **Row Level Security (RLS)** integration
- **Tenant isolation** enforcement
- **Role-based permissions** validation
- **SQL injection prevention** with parameterized queries

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run in development mode
npm run dev

# Type checking
npm run typecheck
```

## License

MIT License - see LICENSE file for details.
