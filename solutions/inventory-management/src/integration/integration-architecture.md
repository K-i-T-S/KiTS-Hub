# KiTS Hub Integration Architecture

This document outlines the integration architecture that enables standalone KiTS solutions to communicate and share data seamlessly while maintaining security and data isolation.

## Overview

KiTS solutions are designed to be standalone but completely integratable. Each solution operates independently with its own database, authentication, and business logic, but can communicate with other solutions through standardized APIs and webhooks.

## Integration Patterns

### 1. Direct API Integration

Solutions can call each other's APIs directly using tenant-specific credentials.

```typescript
// Example: POS calling Inventory API
const inventoryService = new InventoryService(tenantId);
const products = await inventoryService.getProductsForPOS({
  category: 'electronics',
  in_stock_only: true
});
```

### 2. Shared Database Access

For solutions within the same tenant, direct database access is possible through RLS policies.

```sql
-- Example: POS accessing inventory data
SELECT * FROM products 
WHERE tenant_id = current_setting('app.current_tenant_id')::uuid
AND current_stock > 0;
```

### 3. Event-Driven Communication

Real-time updates via Supabase subscriptions and webhooks.

```typescript
// Example: Inventory updates triggering POS refresh
const subscription = supabase
  .channel('inventory-updates')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'products' },
    (payload) => {
      // Update POS product list
      updateProductList(payload.new);
    }
  )
  .subscribe();
```

### 4. Webhook Integration

Automated data synchronization between solutions.

```typescript
// Example: Sale webhook updating inventory
app.post('/webhooks/sale-completed', async (req, res) => {
  const { tenant_id, items, total_amount } = req.body;
  
  // Update inventory
  await inventoryService.updateStockFromSale(items);
  
  // Update customer purchase history
  await crmService.recordPurchase(tenant_id, items);
  
  res.status(200).json({ success: true });
});
```

## Solution Integration Matrix

| Solution | Integrates With | Data Flow | Use Cases |
|-----------|----------------|------------|------------|
| **Inventory** | POS, CRM, Analytics | Products, Stock Levels | POS sales, Customer recommendations, Reports |
| **POS** | Inventory, CRM, Analytics | Sales, Payments | Stock updates, Customer history, Sales reports |
| **CRM** | Inventory, POS, Analytics | Customers, Communications | Product recommendations, Purchase history |
| **Analytics** | All solutions | Aggregated data | Cross-solution reporting, Business intelligence |
| **HR** | Analytics | Employee data | Performance reports, Cost analysis |
| **Accounting** | POS, Inventory, HR | Financial data | Revenue tracking, Cost management |

## API Contracts

### Standard Response Format

```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    requestId: string;
  };
}
```

### Authentication

All cross-solution API calls use tenant-specific authentication:

```typescript
interface TenantAuth {
  tenant_id: string;
  api_key: string;
  timestamp: number;
  signature: string; // HMAC-SHA256
}
```

### Rate Limiting

- **Standard**: 100 requests/minute per tenant
- **Premium**: 500 requests/minute per tenant
- **Enterprise**: Unlimited with fair usage policy

## Security Model

### 1. Tenant Isolation

```typescript
// Each solution validates tenant context
const validateTenant = (tenantId: string, apiKey: string) => {
  const tenant = getTenant(tenantId);
  if (!tenant || !isValidApiKey(apiKey, tenant)) {
    throw new UnauthorizedError('Invalid tenant credentials');
  }
  return tenant;
};
```

### 2. Data Encryption

```typescript
// Sensitive data is encrypted at rest and in transit
const encryptSensitiveData = (data: any, tenantKey: string) => {
  return crypto.encrypt(JSON.stringify(data), tenantKey);
};
```

### 3. Audit Logging

```typescript
// All cross-solution calls are logged
const logIntegrationCall = (from: string, to: string, data: any) => {
  auditLogger.log({
    event_type: 'integration_call',
    from_solution: from,
    to_solution: to,
    tenant_id: data.tenant_id,
    timestamp: new Date().toISOString(),
    request_data: sanitizeData(data)
  });
};
```

## Integration Endpoints

### Inventory Management API

```typescript
interface InventoryAPI {
  // Product endpoints
  getProducts(filters?: ProductFilters): Promise<Product[]>;
  getProduct(id: string): Promise<Product>;
  createProduct(product: CreateProductForm): Promise<Product>;
  updateProduct(id: string, updates: UpdateProductForm): Promise<Product>;
  
  // Stock endpoints
  getStockLevels(productIds: string[]): Promise<StockLevel[]>;
  updateStock(movements: StockMovement[]): Promise<void>;
  reserveStock(items: StockReservation[]): Promise<void>;
  
  // Integration endpoints
  getProductsForPOS(filters?: POSFilters): Promise<Product[]>;
  updateStockFromSale(items: SaleItem[]): Promise<void>;
  getProductAvailability(productIds: string[]): Promise<ProductAvailability[]>;
}
```

### Point of Sale API

```typescript
interface POSAPI {
  // Sale endpoints
  createSale(sale: CreateSaleForm): Promise<Sale>;
  getSale(id: string): Promise<Sale>;
  getSales(filters?: SaleFilters): Promise<Sale[]>;
  
  // Payment endpoints
  processPayment(payment: PaymentRequest): Promise<PaymentResponse>;
  refundPayment(paymentId: string, amount: number): Promise<RefundResponse>;
  
  // Integration endpoints
  getProductCatalog(): Promise<Product[]>;
  validateInventory(items: SaleItem[]): Promise<ValidationResponse>;
}
```

### CRM API

```typescript
interface CRMAPI {
  // Customer endpoints
  getCustomers(filters?: CustomerFilters): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer>;
  createCustomer(customer: CreateCustomerForm): Promise<Customer>;
  updateCustomer(id: string, updates: UpdateCustomerForm): Promise<Customer>;
  
  // Communication endpoints
  recordCommunication(communication: CommunicationForm): Promise<void>;
  getCommunications(customerId: string): Promise<Communication[]>;
  
  // Integration endpoints
  getProductRecommendations(customerId?: string): Promise<Product[]>;
  updatePurchaseHistory(customerId: string, items: SaleItem[]): Promise<void>;
}
```

## Webhook Events

### Standard Event Format

```typescript
interface WebhookEvent {
  id: string;
  event: string;
  data: any;
  tenant_id: string;
  timestamp: string;
  signature: string;
}
```

### Inventory Events

- `product.created` - New product added
- `product.updated` - Product details changed
- `product.deleted` - Product removed
- `stock.updated` - Stock level changed
- `low_stock.alert` - Product below reorder point
- `out_of_stock.alert` - Product out of stock

### POS Events

- `sale.created` - New sale completed
- `sale.updated` - Sale modified
- `payment.completed` - Payment processed
- `payment.failed` - Payment declined
- `refund.processed` - Refund issued

### CRM Events

- `customer.created` - New customer registered
- `customer.updated` - Customer details changed
- `communication.recorded` - New communication logged
- `purchase.completed` - Customer made purchase

## Error Handling

### Standard Error Codes

| Code | Description | HTTP Status |
|-------|-------------|--------------|
| `INVALID_TENANT` | Tenant not found or inactive | 401 |
| `INVALID_API_KEY` | API key invalid or expired | 401 |
| `INSUFFICIENT_PERMISSIONS` | Solution lacks required permissions | 403 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `DATA_VALIDATION_ERROR` | Invalid request data | 400 |
| `INTEGRATION_ERROR` | Cross-solution communication failed | 502 |
| `SERVICE_UNAVAILABLE` | Target solution is down | 503 |

### Retry Strategy

```typescript
const retryIntegrationCall = async (
  fn: () => Promise<any>,
  maxRetries: number = 3,
  backoffMs: number = 1000
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        await sleep(backoffMs * Math.pow(2, i));
      } else if (error.code === 'SERVICE_UNAVAILABLE') {
        await sleep(backoffMs * Math.pow(2, i));
      } else {
        throw error;
      }
    }
  }
};
```

## Performance Optimization

### 1. Caching Strategy

```typescript
// Cache frequently accessed data
const productCache = new Map<string, Product>();

const getCachedProduct = async (id: string): Promise<Product> => {
  if (productCache.has(id)) {
    return productCache.get(id)!;
  }
  
  const product = await inventoryService.getProduct(id);
  productCache.set(id, product);
  
  // Cache for 5 minutes
  setTimeout(() => productCache.delete(id), 5 * 60 * 1000);
  
  return product;
};
```

### 2. Batch Operations

```typescript
// Batch multiple operations
const batchUpdateStock = async (movements: StockMovement[]) => {
  const batches = chunk(movements, 100);
  
  for (const batch of batches) {
    await Promise.all(
      batch.map(movement => inventoryService.updateStock(movement))
    );
  }
};
```

### 3. Connection Pooling

```typescript
// Reuse database connections
const connectionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## Monitoring and Observability

### 1. Health Checks

```typescript
const checkIntegrationHealth = async () => {
  const checks = await Promise.allSettled([
    inventoryService.healthCheck(),
    posService.healthCheck(),
    crmService.healthCheck()
  ]);
  
  return {
    inventory: checks[0].status === 'fulfilled',
    pos: checks[1].status === 'fulfilled',
    crm: checks[2].status === 'fulfilled',
    timestamp: new Date().toISOString()
  };
};
```

### 2. Metrics Collection

```typescript
// Track integration performance
const metrics = {
  apiCalls: new Map<string, number>(),
  responseTimes: new Map<string, number[]>(),
  errorRates: new Map<string, number>()
};

const recordMetric = (service: string, metric: string, value: number) => {
  const key = `${service}.${metric}`;
  
  if (!metrics[metric].has(key)) {
    metrics[metric].set(key, []);
  }
  
  metrics[metric].get(key)!.push(value);
};
```

### 3. Distributed Tracing

```typescript
// Trace requests across solutions
const traceIntegrationCall = async (
  fromService: string,
  toService: string,
  operation: string,
  fn: () => Promise<any>
) => {
  const traceId = generateTraceId();
  
  logger.info('Integration call started', {
    traceId,
    fromService,
    toService,
    operation
  });
  
  try {
    const result = await fn();
    
    logger.info('Integration call completed', {
      traceId,
      fromService,
      toService,
      operation,
      success: true
    });
    
    return result;
  } catch (error) {
    logger.error('Integration call failed', {
      traceId,
      fromService,
      toService,
      operation,
      error: error.message
    });
    
    throw error;
  }
};
```

## Best Practices

### 1. Design Principles

- **Loose Coupling**: Solutions should not depend on internal implementations
- **Strong Consistency**: Critical data should be immediately consistent
- **Eventual Consistency**: Non-critical data can be eventually consistent
- **Fail-Safe**: Integration failures should not break core functionality

### 2. Data Governance

- **Data Ownership**: Each solution owns its core data
- **Data Sharing**: Shared through well-defined APIs
- **Data Privacy**: Sensitive data encrypted and access controlled
- **Data Retention**: Follow legal and compliance requirements

### 3. Development Guidelines

- **Version Compatibility**: Maintain backward compatibility
- **Documentation**: Keep API docs up to date
- **Testing**: Integration tests for all cross-solution flows
- **Monitoring**: Comprehensive logging and alerting

## Future Enhancements

### 1. Event Sourcing

Implement event sourcing for better audit trails and replay capabilities.

### 2. GraphQL Gateway

Create a unified GraphQL gateway for all solutions.

### 3. Service Mesh

Implement a service mesh for advanced traffic management and security.

### 4. Real-time Sync

Enable real-time data synchronization between solutions.

## Support and Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Verify tenant credentials
   - Check API key validity
   - Ensure proper signature generation

2. **Rate Limiting**
   - Implement exponential backoff
   - Use batch operations
   - Consider caching strategies

3. **Data Inconsistency**
   - Check transaction boundaries
   - Verify event ordering
   - Review conflict resolution

### Debug Tools

- Integration request/response logs
- Performance metrics dashboard
- Error tracking and alerting
- Data consistency reports

For integration issues, contact the KiTS Hub development team with:
- Tenant ID
- Solutions involved
- Error details
- Timestamp of issue
