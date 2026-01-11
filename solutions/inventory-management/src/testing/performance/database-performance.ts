/**
 * Database Performance Testing for KiTS Hub
 * Tests database query performance and optimization
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { TestDatabaseFactory } from '../integration/test-database';

describe('Database Performance Tests', () => {
  let testId: string;

  beforeAll(async () => {
    TestDatabaseFactory.initialize({
      url: process.env.TEST_SUPABASE_URL || 'http://localhost:54321',
      anonKey: process.env.TEST_SUPABASE_ANON_KEY || 'test-anon-key',
      serviceKey: process.env.TEST_SUPABASE_SERVICE_KEY || 'test-service-key',
      schema: 'test_schema',
    });
  });

  beforeEach(async () => {
    testId = `perf-test-${Date.now()}`;
    await TestDatabaseFactory.setupTest(testId, 'full');
  });

  afterEach(async () => {
    await TestDatabaseFactory.cleanupTest(testId);
  });

  afterAll(async () => {
    await TestDatabaseFactory.closeAll();
  });

  describe('Query Performance Tests', () => {
    it('should execute product queries within performance thresholds', async () => {
      const client = TestDatabaseFactory.createTest(testId);
      
      // Test basic product query
      const start = performance.now();
      const { data: products, error } = await client
        .from('products')
        .select('*')
        .eq('tenant_id', `tenant-${testId}`)
        .limit(50);
      const end = performance.now();
      
      expect(error).toBeNull();
      expect(products).toBeDefined();
      expect(end - start).toBeLessThan(100); // Should complete within 100ms
    });

    it('should handle complex product queries with joins efficiently', async () => {
      const client = TestDatabaseFactory.createTest(testId);
      
      const start = performance.now();
      const { data: products, error } = await client
        .from('products')
        .select(`
          *,
          stock_movements (
            id,
            movement_type,
            quantity,
            created_at
          )
        `)
        .eq('tenant_id', `tenant-${testId}`)
        .order('created_at', { ascending: false });
      const end = performance.now();
      
      expect(error).toBeNull();
      expect(end - start).toBeLessThan(200); // Complex query within 200ms
    });

    it('should execute sales queries with aggregation efficiently', async () => {
      const client = TestDatabaseFactory.createTest(testId);
      
      const start = performance.now();
      const { data: sales, error } = await client
        .from('sales')
        .select(`
          *,
          sale_items (
            product_id,
            quantity,
            unit_price,
            total_price
          ),
          customers (
            email,
            first_name,
            last_name
          )
        `)
        .eq('tenant_id', `tenant-${testId}`)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });
      const end = performance.now();
      
      expect(error).toBeNull();
      expect(end - start).toBeLessThan(300); // Aggregated query within 300ms
    });

    it('should handle full-text search efficiently', async () => {
      const client = TestDatabaseFactory.createTest(testId);
      
      const start = performance.now();
      const { data: searchResults, error } = await client
        .from('products')
        .select('*')
        .eq('tenant_id', `tenant-${testId}`)
        .ilike('name', '%test%')
        .limit(20);
      const end = performance.now();
      
      expect(error).toBeNull();
      expect(end - start).toBeLessThan(150); // Search query within 150ms
    });

    it('should execute reporting queries efficiently', async () => {
      const client = TestDatabaseFactory.createTest(testId);
      
      // Test sales summary query
      const start = performance.now();
      const { data: salesSummary, error } = await client
        .from('sales')
        .select('total_amount, status, payment_method')
        .eq('tenant_id', `tenant-${testId}`)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      const { data: inventorySummary } = await client
        .from('products')
        .select('current_stock, cost, price')
        .eq('tenant_id', `tenant-${testId}`)
        .eq('is_active', true);
      
      const end = performance.now();
      
      expect(error).toBeNull();
      expect(end - start).toBeLessThan(500); // Reporting queries within 500ms
    });
  });

  describe('Index Performance Tests', () => {
    it('should benefit from tenant_id index', async () => {
      const client = TestDatabaseFactory.createTest(testId);
      
      // Test query with tenant_id filter
      const start = performance.now();
      const { data: products } = await client
        .from('products')
        .select('id, name, sku')
        .eq('tenant_id', `tenant-${testId}`)
        .limit(100);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(50); // Should be very fast with index
    });

    it('should benefit from composite indexes', async () => {
      const client = TestDatabaseFactory.createTest(testId);
      
      // Test query with tenant_id and status filter
      const start = performance.now();
      const { data: activeProducts } = await client
        .from('products')
        .select('id, name, current_stock')
        .eq('tenant_id', `tenant-${testId}`)
        .eq('is_active', true)
        .order('name');
      const end = performance.now();
      
      expect(end - start).toBeLessThan(75); // Should be fast with composite index
    });

    it('should handle date range queries efficiently', async () => {
      const client = TestDatabaseFactory.createTest(testId);
      
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();
      
      const start = performance.now();
      const { data: recentSales } = await client
        .from('sales')
        .select('id, total_amount, created_at')
        .eq('tenant_id', `tenant-${testId}`)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Date range query should be efficient
    });
  });

  describe('Concurrent Access Tests', () => {
    it('should handle concurrent read operations', async () => {
      const client = TestDatabaseFactory.createTest(testId);
      
      const concurrentQueries = 10;
      const promises = Array.from({ length: concurrentQueries }, async (_, index) => {
        const start = performance.now();
        const { data: products } = await client
          .from('products')
          .select('*')
          .eq('tenant_id', `tenant-${testId}`)
          .limit(20);
        const end = performance.now();
        
        return {
          index,
          duration: end - start,
          count: products?.length || 0,
        };
      });
      
      const results = await Promise.all(promises);
      
      // All queries should complete within reasonable time
      results.forEach(result => {
        expect(result.duration).toBeLessThan(200);
        expect(result.count).toBeGreaterThan(0);
      });
    });

    it('should handle concurrent write operations', async () => {
      const client = TestDatabaseFactory.createTest(testId);
      
      const concurrentWrites = 5;
      const promises = Array.from({ length: concurrentWrites }, async (_, index) => {
        const start = performance.now();
        const { data: product } = await client
          .from('products')
          .insert({
            tenant_id: `tenant-${testId}`,
            name: `Concurrent Product ${index}`,
            sku: `CONC-${index}-${testId}`,
            category: 'Test',
            price: 99.99,
            cost: 50.00,
            current_stock: 100,
            reorder_point: 10,
            is_active: true,
          })
          .select()
          .single();
        const end = performance.now();
        
        return {
          index,
          duration: end - start,
          productId: product?.id,
        };
      });
      
      const results = await Promise.all(promises);
      
      // All writes should complete successfully
      results.forEach(result => {
        expect(result.duration).toBeLessThan(300);
        expect(result.productId).toBeDefined();
      });
    });
  });

  describe('Data Volume Tests', () => {
    it('should handle large datasets efficiently', async () => {
      const client = TestDatabaseFactory.createTest(testId);
      
      // Create a larger dataset
      const products = Array.from({ length: 1000 }, (_, index) => ({
        tenant_id: `tenant-${testId}`,
        name: `Volume Test Product ${index}`,
        sku: `VOL-${index}-${testId}`,
        category: 'Test',
        price: Math.random() * 1000,
        cost: Math.random() * 500,
        current_stock: Math.floor(Math.random() * 1000),
        reorder_point: Math.floor(Math.random() * 100),
        is_active: Math.random() > 0.1,
      }));
      
      // Insert in batches
      const batchSize = 100;
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        await client.from('products').insert(batch);
      }
      
      // Test pagination performance
      const start = performance.now();
      const { data: page1 } = await client
        .from('products')
        .select('*')
        .eq('tenant_id', `tenant-${testId}`)
        .range(0, 49)
        .order('name');
      
      const { data: page100 } = await client
        .from('products')
        .select('*')
        .eq('tenant_id', `tenant-${testId}`)
        .range(4900, 4949)
        .order('name');
      const end = performance.now();
      
      expect(end - start).toBeLessThan(200); // Even with large dataset
      expect(page1?.length).toBe(50);
      expect(page100?.length).toBe(50);
    });

    it('should maintain performance with complex aggregations', async () => {
      const client = TestDatabaseFactory.createTest(testId);
      
      // Create sales data for aggregation
      const sales = Array.from({ length: 500 }, (_, index) => ({
        tenant_id: `tenant-${testId}`,
        customer_id: `customer-${testId}`,
        total_amount: Math.random() * 1000,
        status: 'completed',
        payment_method: ['cash', 'card', 'bank_transfer'][Math.floor(Math.random() * 3)],
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      }));
      
      await client.from('sales').insert(sales);
      
      // Test aggregation performance
      const start = performance.now();
      const { data: summary } = await client
        .from('sales')
        .select('total_amount, payment_method')
        .eq('tenant_id', `tenant-${testId}`)
        .eq('status', 'completed');
      
      // Simulate aggregation calculation
      const totalRevenue = summary?.reduce((sum: number, sale: any) => sum + sale.total_amount, 0) || 0;
      const avgSale = totalRevenue / (summary?.length || 1);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(400); // Aggregation should be efficient
      expect(totalRevenue).toBeGreaterThan(0);
      expect(avgSale).toBeGreaterThan(0);
    });
  });

  describe('Memory and Connection Tests', () => {
    it('should handle connection pooling efficiently', async () => {
      const client = TestDatabaseFactory.createTest(testId);
      
      // Simulate multiple rapid connections
      const connectionCount = 20;
      const promises = Array.from({ length: connectionCount }, async () => {
        const start = performance.now();
        const { data: products } = await client
          .from('products')
          .select('id, name')
          .eq('tenant_id', `tenant-${testId}`)
          .limit(10);
        const end = performance.now();
        
        return {
          duration: end - start,
          success: !!products,
        };
      });
      
      const results = await Promise.all(promises);
      
      // All connections should succeed quickly
      results.forEach(result => {
        expect(result.duration).toBeLessThan(150);
        expect(result.success).toBe(true);
      });
    });

    it('should handle large result sets without memory issues', async () => {
      const client = TestDatabaseFactory.createTest(testId);
      
      // Query a large result set
      const start = performance.now();
      const { data: largeResult } = await client
        .from('products')
        .select('*')
        .eq('tenant_id', `tenant-${testId}`)
        .limit(1000);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(500); // Large result set should be handled efficiently
      expect(largeResult?.length).toBeLessThanOrEqual(1000);
    });
  });
});
