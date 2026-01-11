# KiTS Hub Integration API Documentation

## Overview

KiTS Hub provides a comprehensive integration platform that enables seamless communication between all solutions. This documentation covers the complete API surface for cross-solution integration, external service integrations, and webhook management.

## Table of Contents

1. [Authentication](#authentication)
2. [Core APIs](#core-apis)
3. [Solution-Specific APIs](#solution-specific-apis)
4. [External Integrations](#external-integrations)
5. [Webhooks](#webhooks)
6. [Data Synchronization](#data-synchronization)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)
9. [SDK and Client Libraries](#sdk-and-client-libraries)

## Authentication

All API requests require authentication using tenant-specific credentials.

### Authentication Headers

```http
X-Tenant-ID: your-tenant-id
X-API-Key: your-api-key
X-Timestamp: 1640995200000
X-Signature: hmac-signature
Content-Type: application/json
```

### Generating Signatures

```typescript
import { createHmac } from 'crypto';

const generateSignature = (tenantId: string, apiKey: string, timestamp: number): string => {
  const message = `${tenantId}:${apiKey}:${timestamp}`;
  return createHmac('sha256', apiKey)
    .update(message)
    .digest('hex');
};
```

### Authentication Flow

1. Obtain tenant credentials from the KiTS Hub admin panel
2. Include authentication headers in all API requests
3. Generate HMAC signature using your API key
4. Include timestamp (must be within 5 minutes of server time)

## Core APIs

### Health Check

```http
GET /api/v1/health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0",
    "services": {
      "authentication": "healthy",
      "webhooks": "healthy",
      "data_sync": "healthy"
    }
  }
}
```

### Tenant Information

```http
GET /api/v1/tenant
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tenant_id": "tenant_123",
    "name": "Acme Corporation",
    "plan": "premium",
    "created_at": "2024-01-01T00:00:00Z",
    "active_solutions": ["inventory", "pos", "crm", "analytics"]
  }
}
```

## Solution-Specific APIs

### Inventory Management API

#### Get Products

```http
GET /api/v1/inventory/products
```

**Query Parameters:**
- `category` (optional): Filter by category
- `in_stock_only` (optional): Only show products with stock
- `search` (optional): Search term
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_123",
      "tenant_id": "tenant_123",
      "name": "Wireless Mouse",
      "sku": "WM-001",
      "price": 29.99,
      "current_stock": 150,
      "category": "Electronics",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "totalPages": 2
    }
  }
}
```

#### Update Stock

```http
POST /api/v1/inventory/stock/update
```

**Request Body:**
```json
{
  "movements": [
    {
      "product_id": "prod_123",
      "quantity": -5,
      "type": "sale",
      "reference_id": "sale_456",
      "notes": "POS Sale #456"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated_products": 1,
    "stock_levels": [
      {
        "product_id": "prod_123",
        "previous_stock": 150,
        "new_stock": 145,
        "movement_id": "move_789"
      }
    ]
  }
}
```

### Point of Sale API

#### Create Sale

```http
POST /api/v1/pos/sales
```

**Request Body:**
```json
{
  "customer_id": "cust_123",
  "items": [
    {
      "product_id": "prod_123",
      "quantity": 2,
      "unit_price": 29.99,
      "total_price": 59.98
    }
  ],
  "payment_method": "credit_card",
  "notes": "Customer requested gift wrap"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "sale_456",
    "tenant_id": "tenant_123",
    "customer_id": "cust_123",
    "items": [...],
    "subtotal": 59.98,
    "tax_amount": 4.80,
    "total_amount": 64.78,
    "payment_method": "credit_card",
    "status": "completed",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Process Payment

```http
POST /api/v1/pos/payments
```

**Request Body:**
```json
{
  "sale_id": "sale_456",
  "amount": 64.78,
  "method": "credit_card",
  "payment_details": {
    "card_number": "****-****-****-1234",
    "expiry_month": 12,
    "expiry_year": 2025,
    "cvv": "***"
  }
}
```

### CRM API

#### Get Customers

```http
GET /api/v1/crm/customers
```

**Query Parameters:**
- `search` (optional): Search by name, email, or phone
- `tags` (optional): Filter by tags (comma-separated)
- `created_after` (optional): Filter by creation date
- `created_before` (optional): Filter by creation date

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cust_123",
      "tenant_id": "tenant_123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-555-0123",
      "tags": ["vip", "repeat_customer"],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Record Communication

```http
POST /api/v1/crm/communications
```

**Request Body:**
```json
{
  "customer_id": "cust_123",
  "type": "email",
  "subject": "Order Confirmation",
  "content": "Your order #456 has been confirmed.",
  "direction": "outbound",
  "metadata": {
    "template_id": "order_confirmation",
    "automation_triggered": true
  }
}
```

### Analytics API

#### Get Sales Report

```http
GET /api/v1/analytics/reports/sales
```

**Query Parameters:**
- `date_from` (required): Start date (ISO 8601)
- `date_to` (required): End date (ISO 8601)
- `group_by` (optional): Group by field (day, week, month, product, category)
- `solution` (optional): Filter by solution source

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_sales": 12500.00,
      "total_orders": 150,
      "average_order_value": 83.33,
      "growth_rate": 15.5
    },
    "breakdown": [
      {
        "date": "2024-01-01",
        "sales": 1250.00,
        "orders": 15,
        "avg_order_value": 83.33
      }
    ]
  }
}
```

## External Integrations

### Payment Gateway

#### Process Payment

```http
POST /api/v1/payments/process
```

**Request Body:**
```json
{
  "provider": "stripe",
  "amount": 6478,
  "currency": "usd",
  "payment_method": "pm_123",
  "customer_id": "cust_123",
  "description": "Order #456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_id": "pay_456",
    "provider_payment_id": "pi_123456",
    "status": "completed",
    "amount": 6478,
    "currency": "usd",
    "fee": 188,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Refund Payment

```http
POST /api/v1/payments/refund
```

**Request Body:**
```json
{
  "provider": "stripe",
  "payment_id": "pay_456",
  "amount": 6478,
  "reason": "Customer requested refund"
}
```

### Email Service

#### Send Email

```http
POST /api/v1/emails/send
```

**Request Body:**
```json
{
  "provider": "sendgrid",
  "to": "customer@example.com",
  "from": "noreply@yourcompany.com",
  "subject": "Order Confirmation",
  "html": "<h1>Thank you for your order!</h1>",
  "text": "Thank you for your order!",
  "tracking": {
    "open_tracking": true,
    "click_tracking": true
  }
}
```

#### Send Template Email

```http
POST /api/v1/emails/send-template
```

**Request Body:**
```json
{
  "provider": "sendgrid",
  "template_id": "order_confirmation",
  "to": "customer@example.com",
  "from": "noreply@yourcompany.com",
  "variables": {
    "customer_name": "John Doe",
    "order_number": "456",
    "total_amount": "$64.78"
  }
}
```

### SMS Service

#### Send SMS

```http
POST /api/v1/sms/send
```

**Request Body:**
```json
{
  "provider": "twilio",
  "to": "+15551234567",
  "from": "+15557654321",
  "body": "Your order #456 has been confirmed. Total: $64.78"
}
```

#### Get SMS Status

```http
GET /api/v1/sms/{messageId}/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message_id": "sms_123",
    "provider_message_id": "SM456789",
    "status": "delivered",
    "sent_at": "2024-01-01T00:00:00Z",
    "delivered_at": "2024-01-01T00:01:00Z",
    "cost": 0.0799,
    "currency": "USD"
  }
}
```

## Webhooks

### Subscribe to Events

```http
POST /api/v1/webhooks/subscribe
```

**Request Body:**
```json
{
  "url": "https://yourapp.com/webhooks/kits",
  "events": [
    "product.created",
    "product.updated",
    "sale.completed",
    "customer.created"
  ],
  "secret": "your-webhook-secret",
  "retry_count": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "webhook_123",
    "url": "https://yourapp.com/webhooks/kits",
    "events": ["product.created", "product.updated"],
    "active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Webhook Event Format

Webhook events are sent as POST requests with the following format:

**Headers:**
```http
X-Webhook-ID: webhook_123
X-Webhook-Event: product.created
X-Webhook-Timestamp: 1640995200000
X-Webhook-Signature: hmac-signature
Content-Type: application/json
```

**Body:**
```json
{
  "id": "evt_123",
  "event": "product.created",
  "data": {
    "id": "prod_123",
    "name": "Wireless Mouse",
    "sku": "WM-001",
    "price": 29.99
  },
  "tenant_id": "tenant_123",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Available Events

#### Product Events
- `product.created` - New product added
- `product.updated` - Product details changed
- `product.deleted` - Product removed
- `stock.updated` - Stock level changed
- `low_stock.alert` - Product below reorder point
- `out_of_stock.alert` - Product out of stock

#### Sale Events
- `sale.created` - New sale completed
- `sale.updated` - Sale modified
- `payment.completed` - Payment processed
- `payment.failed` - Payment declined
- `refund.processed` - Refund issued

#### Customer Events
- `customer.created` - New customer registered
- `customer.updated` - Customer details changed
- `communication.recorded` - New communication logged
- `purchase.completed` - Customer made purchase

## Data Synchronization

### Create Sync Job

```http
POST /api/v1/sync/jobs
```

**Request Body:**
```json
{
  "source_solution": "inventory",
  "target_solution": "pos",
  "entity_type": "product",
  "sync_type": "incremental",
  "schedule": {
    "type": "cron",
    "expression": "0 */6 * * *"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "sync_123",
    "tenant_id": "tenant_123",
    "source_solution": "inventory",
    "target_solution": "pos",
    "entity_type": "product",
    "sync_type": "incremental",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Get Sync Job Status

```http
GET /api/v1/sync/jobs/{jobId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "sync_123",
    "status": "running",
    "progress": 75,
    "total_records": 1000,
    "processed_records": 750,
    "failed_records": 5,
    "started_at": "2024-01-01T00:00:00Z",
    "estimated_completion": "2024-01-01T00:15:00Z"
  }
}
```

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "INVALID_API_KEY",
    "message": "The provided API key is invalid or expired",
    "details": {
      "tenant_id": "tenant_123",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req_123456789"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_TENANT` | 401 | Tenant not found or inactive |
| `INVALID_API_KEY` | 401 | API key invalid or expired |
| `INSUFFICIENT_PERMISSIONS` | 403 | Solution lacks required permissions |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `DATA_VALIDATION_ERROR` | 400 | Invalid request data |
| `INTEGRATION_ERROR` | 502 | Cross-solution communication failed |
| `SERVICE_UNAVAILABLE` | 503 | Target solution is down |
| `TIMEOUT_ERROR` | 408 | Request timeout |
| `NETWORK_ERROR` | 500 | Network connectivity issue |

## Rate Limiting

### Rate Limits by Plan

| Plan | Requests per Minute | Burst Limit |
|------|---------------------|-------------|
| Standard | 100 | 200 |
| Premium | 500 | 1000 |
| Enterprise | Unlimited | 10000 |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995260
```

### Handling Rate Limits

When rate limited, the API returns a `429` status code with a `Retry-After` header indicating when to retry:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
```

## SDK and Client Libraries

### JavaScript/TypeScript SDK

```bash
npm install @kits-hub/integration-sdk
```

```typescript
import { KiTSHubClient } from '@kits-hub/integration-sdk';

const client = new KiTSHubClient({
  tenantId: 'your-tenant-id',
  apiKey: 'your-api-key',
  baseUrl: 'https://api.kits-hub.com'
});

// Get products
const products = await client.inventory.getProducts({
  category: 'Electronics',
  in_stock_only: true
});

// Create sale
const sale = await client.pos.createSale({
  items: [
    { product_id: 'prod_123', quantity: 2, unit_price: 29.99 }
  ],
  payment_method: 'credit_card'
});

// Send email
await client.emails.send({
  to: 'customer@example.com',
  subject: 'Order Confirmation',
  html: '<h1>Thank you!</h1>'
});
```

### Python SDK

```bash
pip install kits-hub-sdk
```

```python
from kits_hub import KiTSHubClient

client = KiTSHubClient(
    tenant_id='your-tenant-id',
    api_key='your-api-key',
    base_url='https://api.kits-hub.com'
)

# Get products
products = client.inventory.get_products(
    category='Electronics',
    in_stock_only=True
)

# Create sale
sale = client.pos.create_sale(
    items=[
        {'product_id': 'prod_123', 'quantity': 2, 'unit_price': 29.99}
    ],
    payment_method='credit_card'
)
```

### cURL Examples

```bash
# Get products
curl -X GET "https://api.kits-hub.com/api/v1/inventory/products" \
  -H "X-Tenant-ID: your-tenant-id" \
  -H "X-API-Key: your-api-key" \
  -H "X-Timestamp: 1640995200000" \
  -H "X-Signature: hmac-signature"

# Create sale
curl -X POST "https://api.kits-hub.com/api/v1/pos/sales" \
  -H "X-Tenant-ID: your-tenant-id" \
  -H "X-API-Key: your-api-key" \
  -H "X-Timestamp: 1640995200000" \
  -H "X-Signature: hmac-signature" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"product_id": "prod_123", "quantity": 2, "unit_price": 29.99}
    ],
    "payment_method": "credit_card"
  }'
```

## API Versioning

KiTS Hub uses semantic versioning for API endpoints:

- `v1` - Current stable version
- `v2` - Next major version (in development)

Version-specific URLs:
- `https://api.kits-hub.com/api/v1/...`
- `https://api.kits-hub.com/api/v2/...`

### Backward Compatibility

We maintain backward compatibility within major versions. Breaking changes are introduced in new major versions.

### Deprecation Policy

- Deprecated endpoints are supported for at least 6 months
- Deprecation warnings are included in response headers
- Migration guides are provided for major version changes

## Support and Resources

### Documentation
- [Getting Started Guide](./getting-started.md)
- [Integration Best Practices](./best-practices.md)
- [Troubleshooting Guide](./troubleshooting.md)

### Developer Tools
- [API Explorer](https://api.kits-hub.com/explorer)
- [Webhook Testing Tool](https://api.kits-hub.com/webhooks/test)
- [SDK Documentation](./sdk/README.md)

### Support
- Email: developers@kits-hub.com
- Slack: [KiTS Hub Developers](https://kits-hub.slack.com/developers)
- Status Page: [https://status.kits-hub.com](https://status.kits-hub.com)

### Community
- GitHub: [github.com/kits-hub/integration-sdk](https://github.com/kits-hub/integration-sdk)
- Forums: [https://community.kits-hub.com](https://community.kits-hub.com)
- Blog: [https://blog.kits-hub.com](https://blog.kits-hub.com)
