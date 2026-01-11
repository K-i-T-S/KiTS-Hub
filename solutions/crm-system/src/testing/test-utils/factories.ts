/**
 * Test Data Factories for KiTS Hub
 * Provides factory functions for creating test data across all solutions
 */

import { faker } from '@faker-js/faker';

// Types for test data
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan_type: 'basic' | 'professional' | 'enterprise';
  billing_cycle: 'monthly' | 'yearly';
  status: 'active' | 'inactive' | 'trial';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'user' | 'manager';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  tenant_id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  price: number;
  cost: number;
  current_stock: number;
  reorder_point: number;
  low_stock: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  tenant_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  tenant_id: string;
  customer_id: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Factory functions
export class TestDataFactory {
  static generateUUID(): string {
    return faker.string.uuid();
  }

  static generateTimestamp(): string {
    return faker.date.recent().toISOString();
  }

  static createTenant(overrides: Partial<Tenant> = {}): Tenant {
    const name = faker.company.name();
    return {
      id: this.generateUUID(),
      name,
      slug: faker.helpers.slugify(name).toLowerCase(),
      plan_type: faker.helpers.arrayElement(['basic', 'professional', 'enterprise']),
      billing_cycle: faker.helpers.arrayElement(['monthly', 'yearly']),
      status: faker.helpers.arrayElement(['active', 'inactive', 'trial']),
      created_at: this.generateTimestamp(),
      updated_at: this.generateTimestamp(),
      ...overrides
    };
  }

  static createUser(overrides: Partial<User> = {}): User {
    return {
      id: this.generateUUID(),
      tenant_id: this.generateUUID(),
      email: faker.internet.email(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      role: faker.helpers.arrayElement(['admin', 'user', 'manager']),
      is_active: true,
      created_at: this.generateTimestamp(),
      updated_at: this.generateTimestamp(),
      ...overrides
    };
  }

  static createProduct(overrides: Partial<Product> = {}): Product {
    const name = faker.commerce.productName();
    return {
      id: this.generateUUID(),
      tenant_id: this.generateUUID(),
      name,
      sku: `${faker.string.alphanumeric({ length: 8 }).toUpperCase()}-${faker.number.int({ min: 100, max: 999 })}`,
      description: faker.commerce.productDescription(),
      category: faker.commerce.department(),
      price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
      cost: parseFloat(faker.commerce.price({ min: 5, max: 500 })),
      current_stock: faker.number.int({ min: 0, max: 1000 }),
      reorder_point: faker.number.int({ min: 5, max: 50 }),
      low_stock: false,
      is_active: true,
      created_at: this.generateTimestamp(),
      updated_at: this.generateTimestamp(),
      ...overrides
    };
  }

  static createCustomer(overrides: Partial<Customer> = {}): Customer {
    return {
      id: this.generateUUID(),
      tenant_id: this.generateUUID(),
      email: faker.internet.email(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      phone: faker.phone.number(),
      company: faker.company.name(),
      is_active: true,
      created_at: this.generateTimestamp(),
      updated_at: this.generateTimestamp(),
      ...overrides
    };
  }

  static createSale(overrides: Partial<Sale> = {}): Sale {
    return {
      id: this.generateUUID(),
      tenant_id: this.generateUUID(),
      customer_id: this.generateUUID(),
      total_amount: parseFloat(faker.commerce.price({ min: 20, max: 2000 })),
      status: faker.helpers.arrayElement(['pending', 'completed', 'cancelled']),
      payment_method: faker.helpers.arrayElement(['cash', 'card', 'bank_transfer']),
      created_at: this.generateTimestamp(),
      updated_at: this.generateTimestamp(),
      ...overrides
    };
  }

  static createSaleItem(overrides: Partial<SaleItem> = {}): SaleItem {
    const quantity = faker.number.int({ min: 1, max: 10 });
    const unitPrice = parseFloat(faker.commerce.price({ min: 10, max: 500 }));
    
    return {
      id: this.generateUUID(),
      sale_id: this.generateUUID(),
      product_id: this.generateUUID(),
      quantity,
      unit_price: unitPrice,
      total_price: quantity * unitPrice,
      ...overrides
    };
  }

  // Bulk creation helpers
  static createTenants(count: number, overrides: Partial<Tenant> = {}): Tenant[] {
    return Array.from({ length: count }, () => this.createTenant(overrides));
  }

  static createUsers(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, () => this.createUser(overrides));
  }

  static createProducts(count: number, overrides: Partial<Product> = {}): Product[] {
    return Array.from({ length: count }, () => this.createProduct(overrides));
  }

  static createCustomers(count: number, overrides: Partial<Customer> = {}): Customer[] {
    return Array.from({ length: count }, () => this.createCustomer(overrides));
  }

  static createSales(count: number, overrides: Partial<Sale> = {}): Sale[] {
    return Array.from({ length: count }, () => this.createSale(overrides));
  }

  // Scenario-specific factories
  static createTenantWithUsers(userCount: number = 3): { tenant: Tenant; users: User[] } {
    const tenant = this.createTenant();
    const users = Array.from({ length: userCount }, (_, index) => 
      this.createUser({ 
        tenant_id: tenant.id,
        role: index === 0 ? 'admin' : 'user'
      })
    );
    
    return { tenant, users };
  }

  static createInventoryScenario(productCount: number = 10): {
    tenant: Tenant;
    products: Product[];
    lowStockProducts: Product[];
  } {
    const tenant = this.createTenant();
    const products = this.createProducts(productCount, { tenant_id: tenant.id });
    
    // Mark some products as low stock
    const lowStockProducts = products.slice(0, 2).map(product => ({
      ...product,
      current_stock: product.reorder_point - 1,
      low_stock: true
    }));
    
    return {
      tenant,
      products: products.map(product => 
        lowStockProducts.find(p => p.id === product.id) || product
      ),
      lowStockProducts
    };
  }

  static createSalesScenario(customerCount: number = 5, saleCount: number = 20): {
    tenant: Tenant;
    customers: Customer[];
    sales: Sale[];
    saleItems: SaleItem[];
  } {
    const tenant = this.createTenant();
    const customers = this.createCustomers(customerCount, { tenant_id: tenant.id });
    const sales = this.createSales(saleCount, { tenant_id: tenant.id });
    
    // Create sale items for each sale
    const saleItems: SaleItem[] = [];
    sales.forEach(sale => {
      const itemCount = faker.number.int({ min: 1, max: 5 });
      for (let i = 0; i < itemCount; i++) {
        saleItems.push(this.createSaleItem({
          sale_id: sale.id,
          product_id: this.generateUUID()
        }));
      }
    });
    
    return { tenant, customers, sales, saleItems };
  }
}
