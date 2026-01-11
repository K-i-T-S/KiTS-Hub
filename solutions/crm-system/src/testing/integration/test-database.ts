/**
 * Test Database Setup for KiTS Hub Integration Testing
 * Provides isolated test database environments
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface TestDatabaseConfig {
  url: string;
  anonKey: string;
  serviceKey: string;
  schema?: string;
}

export class TestDatabaseManager {
  private static instance: TestDatabaseManager;
  private testClients: Map<string, SupabaseClient> = new Map();
  private config: TestDatabaseConfig;

  constructor(config: TestDatabaseConfig) {
    this.config = config;
  }

  static getInstance(config?: TestDatabaseConfig): TestDatabaseManager {
    if (!TestDatabaseManager.instance) {
      if (!config) {
        throw new Error('TestDatabaseConfig required for first initialization');
      }
      TestDatabaseManager.instance = new TestDatabaseManager(config);
    }
    return TestDatabaseManager.instance;
  }

  /**
   * Create an isolated test database client for a specific test
   */
  createTestClient(testId: string): SupabaseClient {
    const client = createClient(this.config.url, this.config.serviceKey, {
      db: {
        schema: this.config.schema || 'public',
      },
      global: {
        headers: {
          'x-test-client-id': testId,
        },
      },
    });

    this.testClients.set(testId, client);
    return client;
  }

  /**
   * Get an existing test client
   */
  getTestClient(testId: string): SupabaseClient | undefined {
    return this.testClients.get(testId);
  }

  /**
   * Clean up test data for a specific test
   */
  async cleanupTestData(testId: string): Promise<void> {
    const client = this.testClients.get(testId);
    if (!client) return;

    try {
      // Clean up in reverse order of dependencies
      await this.cleanupSaleItems(client, testId);
      await this.cleanupSales(client, testId);
      await this.cleanupStockMovements(client, testId);
      await this.cleanupProducts(client, testId);
      await this.cleanupCustomers(client, testId);
      await this.cleanupUsers(client, testId);
      await this.cleanupTenants(client, testId);
    } catch (error) {
      console.error(`Error cleaning up test data for ${testId}:`, error);
    }
  }

  /**
   * Setup test data for a specific test scenario
   */
  async setupTestData(testId: string, scenario: 'basic' | 'inventory' | 'sales' | 'full'): Promise<void> {
    const client = this.testClients.get(testId);
    if (!client) throw new Error(`Test client not found for ${testId}`);

    switch (scenario) {
      case 'basic':
        await this.setupBasicScenario(client, testId);
        break;
      case 'inventory':
        await this.setupInventoryScenario(client, testId);
        break;
      case 'sales':
        await this.setupSalesScenario(client, testId);
        break;
      case 'full':
        await this.setupFullScenario(client, testId);
        break;
    }
  }

  private async cleanupTenants(client: SupabaseClient, testId: string): Promise<void> {
    await client
      .from('tenants')
      .delete()
      .eq('test_id', testId);
  }

  private async cleanupUsers(client: SupabaseClient, testId: string): Promise<void> {
    await client
      .from('users')
      .delete()
      .eq('test_id', testId);
  }

  private async cleanupCustomers(client: SupabaseClient, testId: string): Promise<void> {
    await client
      .from('customers')
      .delete()
      .eq('test_id', testId);
  }

  private async cleanupProducts(client: SupabaseClient, testId: string): Promise<void> {
    await client
      .from('products')
      .delete()
      .eq('test_id', testId);
  }

  private async cleanupStockMovements(client: SupabaseClient, testId: string): Promise<void> {
    await client
      .from('stock_movements')
      .delete()
      .eq('test_id', testId);
  }

  private async cleanupSales(client: SupabaseClient, testId: string): Promise<void> {
    await client
      .from('sales')
      .delete()
      .eq('test_id', testId);
  }

  private async cleanupSaleItems(client: SupabaseClient, testId: string): Promise<void> {
    await client
      .from('sale_items')
      .delete()
      .eq('test_id', testId);
  }

  private async setupBasicScenario(client: SupabaseClient, testId: string): Promise<void> {
    // Create test tenant
    const { data: tenant } = await client
      .from('tenants')
      .insert({
        id: `tenant-${testId}`,
        name: `Test Tenant ${testId}`,
        slug: `test-tenant-${testId}`,
        plan_type: 'basic',
        status: 'active',
        test_id,
      })
      .select()
      .single();

    if (!tenant) throw new Error('Failed to create test tenant');

    // Create test user
    await client
      .from('users')
      .insert({
        id: `user-${testId}`,
        tenant_id: tenant.id,
        email: `test-${testId}@example.com`,
        first_name: 'Test',
        last_name: 'User',
        role: 'admin',
        is_active: true,
        test_id,
      });
  }

  private async setupInventoryScenario(client: SupabaseClient, testId: string): Promise<void> {
    await this.setupBasicScenario(client, testId);

    const tenantId = `tenant-${testId}`;

    // Create test products
    const products = [
      {
        id: `product-1-${testId}`,
        tenant_id: tenantId,
        name: 'Test Product 1',
        sku: `TP1-${testId}`,
        category: 'Electronics',
        price: 99.99,
        cost: 50.00,
        current_stock: 100,
        reorder_point: 10,
        low_stock: false,
        is_active: true,
        test_id,
      },
      {
        id: `product-2-${testId}`,
        tenant_id: tenantId,
        name: 'Test Product 2',
        sku: `TP2-${testId}`,
        category: 'Electronics',
        price: 149.99,
        cost: 75.00,
        current_stock: 5,
        reorder_point: 10,
        low_stock: true,
        is_active: true,
        test_id,
      },
    ];

    await client.from('products').insert(products);
  }

  private async setupSalesScenario(client: SupabaseClient, testId: string): Promise<void> {
    await this.setupInventoryScenario(client, testId);

    const tenantId = `tenant-${testId}`;

    // Create test customer
    const { data: customer } = await client
      .from('customers')
      .insert({
        id: `customer-${testId}`,
        tenant_id: tenantId,
        email: `customer-${testId}@example.com`,
        first_name: 'Test',
        last_name: 'Customer',
        is_active: true,
        test_id,
      })
      .select()
      .single();

    if (!customer) throw new Error('Failed to create test customer');

    // Create test sale
    const { data: sale } = await client
      .from('sales')
      .insert({
        id: `sale-${testId}`,
        tenant_id: tenantId,
        customer_id: customer.id,
        total_amount: 249.98,
        status: 'completed',
        payment_method: 'card',
        test_id,
      })
      .select()
      .single();

    if (!sale) throw new Error('Failed to create test sale');

    // Create sale items
    await client.from('sale_items').insert([
      {
        id: `sale-item-1-${testId}`,
        sale_id: sale.id,
        product_id: `product-1-${testId}`,
        quantity: 1,
        unit_price: 99.99,
        total_price: 99.99,
        test_id,
      },
      {
        id: `sale-item-2-${testId}`,
        sale_id: sale.id,
        product_id: `product-2-${testId}`,
        quantity: 1,
        unit_price: 149.99,
        total_price: 149.99,
        test_id,
      },
    ]);

    // Update product stock
    await client
      .from('products')
      .update({ current_stock: 99 })
      .eq('id', `product-1-${testId}`);

    await client
      .from('products')
      .update({ current_stock: 4 })
      .eq('id', `product-2-${testId}`);
  }

  private async setupFullScenario(client: SupabaseClient, testId: string): Promise<void> {
    await this.setupSalesScenario(client, testId);

    const tenantId = `tenant-${testId}`;

    // Create additional users
    await client.from('users').insert([
      {
        id: `user-2-${testId}`,
        tenant_id: tenantId,
        email: `manager-${testId}@example.com`,
        first_name: 'Test',
        last_name: 'Manager',
        role: 'manager',
        is_active: true,
        test_id,
      },
      {
        id: `user-3-${testId}`,
        tenant_id: tenantId,
        email: `employee-${testId}@example.com`,
        first_name: 'Test',
        last_name: 'Employee',
        role: 'user',
        is_active: true,
        test_id,
      },
    ]);

    // Create more customers
    const customers = Array.from({ length: 5 }, (_, index) => ({
      id: `customer-${index + 2}-${testId}`,
      tenant_id: tenantId,
      email: `customer-${index + 2}-${testId}@example.com`,
      first_name: `Customer${index + 2}`,
      last_name: 'Test',
      is_active: true,
      test_id,
    }));

    await client.from('customers').insert(customers);

    // Create stock movements
    await client.from('stock_movements').insert([
      {
        id: `movement-1-${testId}`,
        tenant_id: tenantId,
        product_id: `product-1-${testId}`,
        movement_type: 'sale',
        quantity: -1,
        reference_id: `sale-${testId}`,
        reference_type: 'sale',
        test_id,
      },
      {
        id: `movement-2-${testId}`,
        tenant_id: tenantId,
        product_id: `product-2-${testId}`,
        movement_type: 'sale',
        quantity: -1,
        reference_id: `sale-${testId}`,
        reference_type: 'sale',
        test_id,
      },
    ]);
  }

  /**
   * Reset all test databases
   */
  async resetAllTests(): Promise<void> {
    const promises = Array.from(this.testClients.keys()).map(testId =>
      this.cleanupTestData(testId)
    );
    await Promise.all(promises);
  }

  /**
   * Close all test clients
   */
  async closeAllClients(): Promise<void> {
    this.testClients.clear();
  }

  /**
   * Get database statistics for testing
   */
  async getDatabaseStats(testId: string): Promise<any> {
    const client = this.testClients.get(testId);
    if (!client) return null;

    const [tenants, users, customers, products, sales] = await Promise.all([
      client.from('tenants').select('id').eq('test_id', testId),
      client.from('users').select('id').eq('test_id', testId),
      client.from('customers').select('id').eq('test_id', testId),
      client.from('products').select('id').eq('test_id', testId),
      client.from('sales').select('id').eq('test_id', testId),
    ]);

    return {
      tenants: tenants.data?.length || 0,
      users: users.data?.length || 0,
      customers: customers.data?.length || 0,
      products: products.data?.length || 0,
      sales: sales.data?.length || 0,
    };
  }
}

/**
 * Test database factory for creating isolated test environments
 */
export class TestDatabaseFactory {
  private static manager: TestDatabaseManager;

  static initialize(config: TestDatabaseConfig): void {
    this.manager = TestDatabaseManager.getInstance(config);
  }

  static createTest(testId: string): SupabaseClient {
    if (!this.manager) {
      throw new Error('TestDatabaseFactory not initialized');
    }
    return this.manager.createTestClient(testId);
  }

  static async setupTest(testId: string, scenario: 'basic' | 'inventory' | 'sales' | 'full' = 'basic'): Promise<void> {
    if (!this.manager) {
      throw new Error('TestDatabaseFactory not initialized');
    }
    await this.manager.setupTestData(testId, scenario);
  }

  static async cleanupTest(testId: string): Promise<void> {
    if (!this.manager) return;
    await this.manager.cleanupTestData(testId);
  }

  static async resetAll(): Promise<void> {
    if (!this.manager) return;
    await this.manager.resetAllTests();
  }

  static async closeAll(): Promise<void> {
    if (!this.manager) return;
    await this.manager.closeAllClients();
  }

  static getStats(testId: string): Promise<any> {
    if (!this.manager) {
      throw new Error('TestDatabaseFactory not initialized');
    }
    return this.manager.getDatabaseStats(testId);
  }
}
