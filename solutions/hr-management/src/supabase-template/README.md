# KiTS Hub Supabase Template

A comprehensive, production-ready database template for the KiTS Hub multi-tenant SaaS platform. This template provides the foundation for all business solutions including Inventory Management, Point of Sale, CRM, HR Management, and Accounting.

## 🚀 Features

### Database Architecture
- **Multi-tenant Design**: Complete tenant isolation with Row Level Security (RLS)
- **40+ Tables**: Comprehensive schema for all business solutions
- **Type Safety**: Custom PostgreSQL types for data integrity
- **Performance Optimized**: Strategic indexing and query optimization
- **Audit Logging**: Complete audit trail for all data changes

### Security & Access Control
- **Row Level Security**: Tenant data isolation at the database level
- **Role-Based Permissions**: Granular access control with 8 user roles
- **API Key Management**: Secure API key generation and management
- **Session Management**: Secure user session tracking
- **Webhook Security**: Signed webhook deliveries with retry logic

### Business Solutions
- **Inventory Management**: Products, categories, suppliers, stock tracking
- **Point of Sale**: Sales processing, payments, receipts
- **CRM System**: Customer management, communications, tracking
- **HR Management**: Employees, attendance, payroll
- **Accounting**: Chart of accounts, transactions, invoices

### Integration & Automation
- **Cross-Solution Sync**: Data synchronization between solutions
- **Webhook System**: Real-time event notifications
- **Edge Functions**: Serverless business logic
- **RESTful APIs**: Complete API layer with validation
- **Analytics & Reporting**: Built-in reporting capabilities

## 📁 Structure

```
shared/supabase-template/
├── migrations/
│   ├── 001_initial_schema.sql      # Complete database schema
│   └── 002_rls_policies.sql         # Security policies
├── seed-data/
│   └── development-seed.sql         # Sample data for development
├── edge-functions/
│   ├── auth-handler.ts              # Authentication logic
│   ├── inventory-manager.ts         # Inventory operations
│   ├── sales-processor.ts           # Sales processing
│   ├── webhook-handler.ts           # Webhook management
│   └── cors.ts                      # CORS configuration
├── api/
│   ├── api-router.ts                 # RESTful API router
│   └── validation-schemas.ts        # Request validation
├── integration/
│   └── cross-solution-sync.ts       # Data synchronization
├── enhanced-schema.sql              # Complete schema with optimizations
├── comprehensive-rls-policies.sql    # All security policies
├── performance-optimizations.sql     # Indexes and performance
└── README.md                        # This file
```

## 🛠 Installation

### Prerequisites
- PostgreSQL 14+ (Supabase uses PostgreSQL 15)
- Supabase CLI installed and configured
- Node.js 18+ (for local development)

### Quick Start

1. **Create a new Supabase project**
   ```bash
   supabase projects create kits-hub-db --db-password your-secure-password
   ```

2. **Link to your project**
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Apply the database schema**
   ```bash
   # Apply initial schema
   psql $DATABASE_URL -f shared/supabase-template/migrations/001_initial_schema.sql
   
   # Apply RLS policies
   psql $DATABASE_URL -f shared/supabase-template/migrations/002_rls_policies.sql
   
   # Apply performance optimizations
   psql $DATABASE_URL -f shared/supabase-template/performance-optimizations.sql
   ```

4. **Seed development data** (optional)
   ```bash
   psql $DATABASE_URL -f shared/supabase-template/seed-data/development-seed.sql
   ```

5. **Deploy Edge Functions**
   ```bash
   # Deploy all edge functions
   supabase functions deploy auth-handler
   supabase functions deploy inventory-manager
   supabase functions deploy sales-processor
   supabase functions deploy webhook-handler
   ```

## 🔧 Configuration

### Environment Variables
Set these in your Supabase project settings:

```bash
# Database
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Edge Functions (if needed)
EXTERNAL_API_KEY=your-external-api-key
WEBHOOK_SECRET=your-webhook-secret
```

### Tenant Context
All operations require setting the tenant context:

```sql
-- Set tenant context for your operations
SET app.current_tenant_id = 'your-tenant-uuid';
```

### Authentication
The system uses Supabase Auth with custom user management:

```typescript
// Example login
const { data, error } = await supabase.functions.invoke('auth-handler', {
  body: {
    action: 'login',
    data: {
      email: 'user@example.com',
      password: 'password',
      tenantSlug: 'tenant-name'
    }
  }
})
```

## 📊 Database Schema

### Core Tables

#### Tenants
Multi-tenant configuration and subscription management:
- Plan types: starter, basic, professional, enterprise
- Usage limits and quotas
- Subscription data and billing cycles

#### Users & Authentication
User management with role-based permissions:
- 8 user roles with specific permissions
- Session tracking and security
- Two-factor authentication support

#### Products & Inventory
Complete inventory management:
- Product variants and batch tracking
- Multi-location support
- Automatic stock alerts and reordering

#### Sales & POS
Point of sale functionality:
- Sales processing with tax calculations
- Multiple payment methods
- Receipt and invoice generation

#### Customers & CRM
Customer relationship management:
- Customer communication tracking
- Loyalty points and tiers
- Interaction history

#### Employees & HR
Human resources management:
- Employee records and attendance
- Payroll processing
- Performance tracking

#### Accounting
Financial management:
- Chart of accounts
- Transaction processing
- Invoice generation

## 🔒 Security

### Row Level Security
All tables have RLS enabled with comprehensive policies:
- **Tenant Isolation**: Users can only access their tenant's data
- **Role-Based Access**: Different roles have different permissions
- **Data Validation**: All data changes are validated

### API Security
- **JWT Authentication**: Supabase Auth integration
- **API Keys**: Secure API key management
- **Rate Limiting**: Built-in rate limiting
- **Request Validation**: Comprehensive input validation

## 🚀 Performance

### Database Optimizations
- **Strategic Indexing**: 50+ optimized indexes
- **Query Optimization**: Efficient query patterns
- **Materialized Views**: Pre-computed reporting data
- **Connection Pooling**: Efficient connection management

### Caching Strategy
- **Application Caching**: Redis integration points
- **Query Caching**: Frequent query optimization
- **CDN Ready**: Static asset optimization

## 🔗 Integrations

### Webhooks
Real-time event notifications:
- **Event Types**: 15+ business events
- **Retry Logic**: Exponential backoff
- **Signature Verification**: Secure webhook delivery
- **Custom Headers**: Flexible configuration

### Cross-Solution Sync
Data synchronization between solutions:
- **Real-time Sync**: Immediate data propagation
- **Batch Processing**: Bulk data synchronization
- **Field Mapping**: Flexible data transformation
- **Error Handling**: Comprehensive error recovery

## 📈 Monitoring & Analytics

### Built-in Analytics
- **Event Tracking**: User action analytics
- **Performance Metrics**: Query performance monitoring
- **Usage Statistics**: Tenant usage tracking
- **Error Tracking**: Comprehensive error logging

### Reporting System
- **Standard Reports**: Pre-built business reports
- **Custom Reports**: Flexible report generation
- **Export Options**: Multiple export formats
- **Scheduled Reports**: Automated report delivery

## 🧪 Development

### Local Development
```bash
# Start local Supabase
supabase start

# Run migrations
supabase db push

# Seed data
supabase db seed

# Test edge functions locally
supabase functions serve --env-file .env
```

### Testing
The template includes comprehensive testing:
- **Unit Tests**: Database function testing
- **Integration Tests**: API endpoint testing
- **Performance Tests**: Load testing scenarios
- **Security Tests**: Penetration testing

### Database Functions
Key stored procedures and functions:
- `get_inventory_stats()` - Inventory statistics
- `generate_sale_number()` - Sale number generation
- `update_product_stock()` - Stock level updates
- `set_tenant_context()` - Tenant context management

## 📚 API Documentation

### REST API Endpoints

#### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh` - Token refresh

#### Products
- `GET /api/v1/products` - List products
- `POST /api/v1/products` - Create product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

#### Sales
- `GET /api/v1/sales` - List sales
- `POST /api/v1/sales` - Create sale
- `GET /api/v1/sales/reports` - Sales reports

#### Inventory
- `GET /api/v1/inventory/stats` - Inventory statistics
- `POST /api/v1/inventory/movements` - Stock movements
- `GET /api/v1/inventory/alerts` - Stock alerts

### Edge Functions

#### Auth Handler
```typescript
// Login
await supabase.functions.invoke('auth-handler', {
  body: { action: 'login', data: { email, password, tenantSlug } }
})

// Register
await supabase.functions.invoke('auth-handler', {
  body: { action: 'register', data: { email, password, firstName, lastName, tenantSlug } }
})
```

#### Inventory Manager
```typescript
// Add stock
await supabase.functions.invoke('inventory-manager', {
  body: { action: 'add-stock', data: { productId, quantity, locationId } }
})

// Transfer stock
await supabase.functions.invoke('inventory-manager', {
  body: { action: 'transfer-stock', data: { productId, quantity, fromLocationId, toLocationId } }
})
```

#### Sales Processor
```typescript
// Create sale
await supabase.functions.invoke('sales-processor', {
  body: { action: 'create-sale', data: { customerId, items, paymentMethod } }
})

// Process refund
await supabase.functions.invoke('sales-processor', {
  body: { action: 'refund-sale', data: { saleId, refundAmount, refundReason } }
})
```

## 🔧 Customization

### Adding New Solutions
1. Create new tables in the schema
2. Add RLS policies for security
3. Create corresponding Edge Functions
4. Add API endpoints
5. Update integration sync logic

### Custom Business Logic
1. Add stored procedures to the database
2. Create Edge Functions for complex logic
3. Add validation schemas
4. Update API router
5. Add webhook events

### Theme and Branding
1. Update tenant settings table
2. Add custom CSS variables
3. Update notification templates
4. Customize report layouts

## 🚀 Deployment

### Production Deployment
1. **Database Setup**: Apply all migrations
2. **Environment Config**: Set production variables
3. **Edge Functions**: Deploy all functions
4. **Monitoring Setup**: Configure monitoring
5. **Backup Strategy**: Set up automated backups

### Scaling Considerations
- **Database Scaling**: Read replicas and connection pooling
- **Edge Function Scaling**: Auto-scaling configuration
- **CDN Setup**: Static asset delivery
- **Load Balancing**: API load balancing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the migration guide
- Contact the KiTS Hub development team

## 🔄 Version History

- **v1.0.0** - Initial release with complete multi-tenant architecture
- **v1.1.0** - Added cross-solution synchronization
- **v1.2.0** - Enhanced security and performance optimizations
- **v1.3.0** - Added webhook system and integrations

---

**Built with ❤️ for the KiTS Hub multi-tenant SaaS platform**
