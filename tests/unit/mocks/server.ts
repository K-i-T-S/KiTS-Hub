import { setupServer } from 'msw/node'
import { rest } from 'msw'

// Mock API handlers
export const handlers = [
  // Auth endpoints
  rest.post('/api/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'admin',
          tenant_id: 'tenant-1'
        },
        token: 'mock-token'
      })
    )
  }),

  rest.post('/api/auth/logout', (req, res, ctx) => {
    return res(ctx.status(200))
  }),

  rest.get('/api/auth/user', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        tenant_id: 'tenant-1'
      })
    )
  }),

  // Product endpoints
  rest.get('/api/products', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        products: [
          {
            id: '1',
            name: 'Test Product',
            description: 'A test product',
            price: 99.99,
            stock: 100,
            category_id: '1',
            tenant_id: 'tenant-1'
          }
        ]
      })
    )
  }),

  rest.post('/api/products', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: '2',
        name: 'New Product',
        description: 'A new product',
        price: 149.99,
        stock: 50,
        category_id: '1',
        tenant_id: 'tenant-1'
      })
    )
  }),

  // Customer endpoints
  rest.get('/api/customers', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        customers: [
          {
            id: '1',
            name: 'Test Customer',
            email: 'customer@example.com',
            phone: '+1234567890',
            tenant_id: 'tenant-1'
          }
        ]
      })
    )
  }),

  rest.post('/api/customers', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: '2',
        name: 'New Customer',
        email: 'newcustomer@example.com',
        phone: '+1234567891',
        tenant_id: 'tenant-1'
      })
    )
  }),

  // Sales endpoints
  rest.get('/api/sales', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        sales: [
          {
            id: '1',
            customer_id: '1',
            total: 199.98,
            status: 'completed',
            tenant_id: 'tenant-1',
            created_at: '2024-01-01T00:00:00Z'
          }
        ]
      })
    )
  }),

  rest.post('/api/sales', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: '2',
        customer_id: '1',
        total: 299.97,
        status: 'completed',
        tenant_id: 'tenant-1',
        created_at: '2024-01-02T00:00:00Z'
      })
    )
  }),

  // Analytics endpoints
  rest.get('/api/analytics/dashboard', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        total_sales: 10000,
        total_customers: 500,
        total_products: 100,
        total_orders: 250,
        revenue_this_month: 5000,
        orders_this_month: 125
      })
    )
  }),

  // Module Federation remoteEntry.js
  rest.get('http://localhost:4177/remoteEntry.js', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.set('Content-Type', 'application/javascript'),
      ctx.body(`
        // Mock remoteEntry.js for Inventory Management
        var inventoryManagement = {
          get: function(module) {
            return Promise.resolve(function() {
              return { default: function() { return 'Inventory Component'; } };
            });
          },
          init: function() {}
        };
      `)
    )
  }),

  rest.get('http://localhost:4178/remoteEntry.js', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.set('Content-Type', 'application/javascript'),
      ctx.body(`
        // Mock remoteEntry.js for Point of Sale
        var pointOfSale = {
          get: function(module) {
            return Promise.resolve(function() {
              return { default: function() { return 'POS Component'; } };
            });
          },
          init: function() {}
        };
      `)
    )
  }),

  rest.get('http://localhost:4179/remoteEntry.js', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.set('Content-Type', 'application/javascript'),
      ctx.body(`
        // Mock remoteEntry.js for CRM System
        var crmSystem = {
          get: function(module) {
            return Promise.resolve(function() {
              return { default: function() { return 'CRM Component'; } };
            });
          },
          init: function() {}
        };
      `)
    )
  }),

  rest.get('http://localhost:4180/remoteEntry.js', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.set('Content-Type', 'application/javascript'),
      ctx.body(`
        // Mock remoteEntry.js for HR Management
        var hrManagement = {
          get: function(module) {
            return Promise.resolve(function() {
              return { default: function() { return 'HR Component'; } };
            });
          },
          init: function() {}
        };
      `)
    )
  }),

  rest.get('http://localhost:4181/remoteEntry.js', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.set('Content-Type', 'application/javascript'),
      ctx.body(`
        // Mock remoteEntry.js for Accounting System
        var accountingSystem = {
          get: function(module) {
            return Promise.resolve(function() {
              return { default: function() { return 'Accounting Component'; } };
            });
          },
          init: function() {}
        };
      `)
    )
  }),

  rest.get('http://localhost:4182/remoteEntry.js', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.set('Content-Type', 'application/javascript'),
      ctx.body(`
        // Mock remoteEntry.js for Analytics Dashboard
        var analyticsDashboard = {
          get: function(module) {
            return Promise.resolve(function() {
              return { default: function() { return 'Analytics Component'; } };
            });
          },
          init: function() {}
        };
      `)
    )
  }),
]

// Setup server
export const server = setupServer(...handlers)
