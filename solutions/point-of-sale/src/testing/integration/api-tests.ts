/**
 * API Integration Tests for KiTS Hub
 * Comprehensive API testing across all solutions
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { TestDatabaseFactory } from './test-database';

describe('API Integration Tests', () => {
  let testId: string;
  let authToken: string;

  beforeAll(async () => {
    // Initialize test database
    TestDatabaseFactory.initialize({
      url: process.env.TEST_SUPABASE_URL || 'http://localhost:54321',
      anonKey: process.env.TEST_SUPABASE_ANON_KEY || 'test-anon-key',
      serviceKey: process.env.TEST_SUPABASE_SERVICE_KEY || 'test-service-key',
      schema: 'test_schema',
    });
  });

  beforeEach(async () => {
    testId = `test-${Date.now()}`;
    await TestDatabaseFactory.setupTest(testId, 'full');
    
    // Get auth token for test user
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test-${testId}@example.com`,
        password: 'test-password',
      }),
    });
    
    const data = await response.json();
    authToken = data.token;
  });

  afterEach(async () => {
    await TestDatabaseFactory.cleanupTest(testId);
  });

  afterAll(async () => {
    await TestDatabaseFactory.closeAll();
  });

  describe('Authentication API', () => {
    it('should authenticate user with valid credentials', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test-${testId}@example.com`,
          password: 'test-password',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('token');
      expect(data).toHaveProperty('user');
      expect(data.user.email).toBe(`test-${testId}@example.com`);
    });

    it('should reject invalid credentials', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `test-${testId}@example.com`,
          password: 'wrong-password',
        }),
      });

      expect(response.status).toBe(401);
    });

    it('should validate JWT token', async () => {
      const response = await fetch('/api/auth/validate', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.valid).toBe(true);
    });
  });

  describe('Tenant Management API', () => {
    it('should get current tenant information', async () => {
      const response = await fetch('/api/tenants/current', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('plan_type');
    });

    it('should update tenant settings', async () => {
      const response = await fetch('/api/tenants/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme: 'dark',
          timezone: 'UTC',
          currency: 'USD',
        }),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.theme).toBe('dark');
    });

    it('should prevent cross-tenant data access', async () => {
      // Create a different tenant
      const otherTestId = `other-${Date.now()}`;
      await TestDatabaseFactory.setupTest(otherTestId, 'basic');

      // Try to access other tenant's data
      const response = await fetch('/api/tenants/current', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Tenant-ID': `tenant-${otherTestId}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(403);
      
      await TestDatabaseFactory.cleanupTest(otherTestId);
    });
  });

  describe('Inventory Management API', () => {
    it('should fetch products with pagination', async () => {
      const response = await fetch('/api/inventory/products?page=1&limit=10', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeLessThanOrEqual(10);
    });

    it('should create new product', async () => {
      const productData = {
        name: 'Test Product',
        sku: `TEST-${testId}`,
        category: 'Electronics',
        price: 99.99,
        cost: 50.00,
        current_stock: 100,
        reorder_point: 10,
      };

      const response = await fetch('/api/inventory/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.name).toBe(productData.name);
      expect(data.sku).toBe(productData.sku);
    });

    it('should update product stock', async () => {
      // First get a product
      const listResponse = await fetch('/api/inventory/products?limit=1', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const listData = await listResponse.json();
      const product = listData.data[0];

      // Update stock
      const updateResponse = await fetch(`/api/inventory/products/${product.id}/stock`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: 150,
          movement_type: 'adjustment',
          reason: 'Test adjustment',
        }),
      });

      expect(updateResponse.status).toBe(200);
      const updateData = await updateResponse.json();
      expect(updateData.current_stock).toBe(150);
    });

    it('should filter products by category', async () => {
      const response = await fetch('/api/inventory/products?category=Electronics', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.every((product: any) => product.category === 'Electronics')).toBe(true);
    });
  });

  describe('Point of Sale API', () => {
    it('should create a new sale', async () => {
      // Get products first
      const productsResponse = await fetch('/api/inventory/products?limit=2', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const productsData = await productsResponse.json();
      const products = productsData.data;

      // Create sale
      const saleData = {
        customer_id: `customer-${testId}`,
        items: products.map((product: any) => ({
          product_id: product.id,
          quantity: 1,
          unit_price: product.price,
        })),
        payment_method: 'card',
      };

      const response = await fetch('/api/pos/sales', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.status).toBe('completed');
      expect(data).toHaveProperty('items');
      expect(data.items.length).toBe(products.length);
    });

    it('should fetch sales history', async () => {
      const response = await fetch('/api/pos/sales?page=1&limit=10', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should calculate sale totals correctly', async () => {
      const saleData = {
        items: [
          { product_id: `product-1-${testId}`, quantity: 2, unit_price: 10.00 },
          { product_id: `product-2-${testId}`, quantity: 1, unit_price: 15.00 },
        ],
        payment_method: 'cash',
      };

      const response = await fetch('/api/pos/sales/calculate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.subtotal).toBe(35.00);
      expect(data.total).toBe(35.00);
    });
  });

  describe('Customer Management API', () => {
    it('should create new customer', async () => {
      const customerData = {
        email: `new-customer-${testId}@example.com`,
        first_name: 'New',
        last_name: 'Customer',
        phone: '+1234567890',
        company: 'Test Company',
      };

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.email).toBe(customerData.email);
      expect(data.first_name).toBe(customerData.first_name);
    });

    it('should search customers by email', async () => {
      const response = await fetch(`/api/customers?search=${testId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.data.some((customer: any) => customer.email.includes(testId))).toBe(true);
    });

    it('should update customer information', async () => {
      // Get existing customer
      const customersResponse = await fetch('/api/customers?limit=1', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const customersData = await customersResponse.json();
      const customer = customersData.data[0];

      // Update customer
      const updateData = {
        first_name: 'Updated',
        last_name: 'Name',
        phone: '+9876543210',
      };

      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.first_name).toBe(updateData.first_name);
      expect(data.last_name).toBe(updateData.last_name);
    });
  });

  describe('Reporting API', () => {
    it('should generate sales report', async () => {
      const response = await fetch('/api/reports/sales?start_date=2024-01-01&end_date=2024-12-31', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('summary');
      expect(data).toHaveProperty('data');
      expect(data.summary).toHaveProperty('total_sales');
      expect(data.summary).toHaveProperty('total_revenue');
    });

    it('should generate inventory report', async () => {
      const response = await fetch('/api/reports/inventory', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('summary');
      expect(data).toHaveProperty('low_stock_products');
      expect(data.summary).toHaveProperty('total_products');
      expect(data.summary).toHaveProperty('total_value');
    });

    it('should export data to CSV', async () => {
      const response = await fetch('/api/reports/sales/export?format=csv', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/csv');
    });
  });

  describe('Webhook API', () => {
    it('should handle inventory update webhook', async () => {
      const webhookData = {
        event: 'inventory.updated',
        data: {
          product_id: `product-1-${testId}`,
          old_stock: 100,
          new_stock: 95,
          movement_type: 'sale',
        },
        timestamp: new Date().toISOString(),
      };

      const response = await fetch('/api/webhooks/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': 'test-signature',
        },
        body: JSON.stringify(webhookData),
      });

      expect(response.status).toBe(200);
    });

    it('should verify webhook signature', async () => {
      const webhookData = {
        event: 'test.event',
        data: { test: 'data' },
      };

      const response = await fetch('/api/webhooks/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': 'invalid-signature',
        },
        body: JSON.stringify(webhookData),
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors', async () => {
      const response = await fetch('/api/inventory/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: '', // Invalid: empty name
          sku: '',
          price: -10, // Invalid: negative price
        }),
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('errors');
      expect(Array.isArray(data.errors)).toBe(true);
    });

    it('should handle rate limiting', async () => {
      const requests = Array.from({ length: 100 }, () =>
        fetch('/api/inventory/products', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        })
      );

      const responses = await Promise.allSettled(requests);
      const rateLimited = responses.filter(r => 
        r.status === 'fulfilled' && r.value.status === 429
      );

      expect(rateLimited.length).toBeGreaterThan(0);
    });

    it('should handle server errors gracefully', async () => {
      // Simulate server error
      const response = await fetch('/api/inventory/products/invalid-id', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });
  });

  describe('Performance Tests', () => {
    it('should respond within acceptable time limits', async () => {
      const start = performance.now();
      
      const response = await fetch('/api/inventory/products?limit=50', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const end = performance.now();
      const duration = end - start;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle concurrent requests', async () => {
      const concurrentRequests = 10;
      const requests = Array.from({ length: concurrentRequests }, () =>
        fetch('/api/inventory/products', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        })
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});
