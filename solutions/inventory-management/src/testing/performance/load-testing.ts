/**
 * Load Testing Configuration for KiTS Hub
 * Multi-tenant performance testing scenarios
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp up to 10 users
    { duration: '5m', target: 10 },   // Stay at 10 users
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 200 },  // Peak load
    { duration: '5m', target: 200 },  // Sustain peak load
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],    // Less than 10% failure rate
    errors: ['rate<0.1'],
  },
};

// Test data
const BASE_URL = 'http://localhost:3000';
const TENANTS = ['tenant-a', 'tenant-b', 'tenant-c'];
const USERS = [
  { email: 'user1@example.com', password: 'password123', tenant: 'tenant-a' },
  { email: 'user2@example.com', password: 'password123', tenant: 'tenant-b' },
  { email: 'user3@example.com', password: 'password123', tenant: 'tenant-c' },
];

// Helper functions
function getRandomTenant() {
  return TENANTS[Math.floor(Math.random() * TENANTS.length)];
}

function getRandomUser() {
  return USERS[Math.floor(Math.random() * USERS.length)];
}

function getAuthHeaders(token: string, tenantId: string) {
  return {
    'Authorization': `Bearer ${token}`,
    'X-Tenant-ID': tenantId,
    'Content-Type': 'application/json',
  };
}

// Main test function
export default function () {
  const user = getRandomUser();
  const tenantId = user.tenant;
  
  // Authentication
  const authResponse = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: user.email,
    password: user.password,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  const authSuccess = check(authResponse, {
    'auth status is 200': (r) => r.status === 200,
    'auth response has token': (r) => r.json('token') !== undefined,
  });

  if (!authSuccess) {
    errorRate.add(1);
    return;
  }

  const token = authResponse.json('token');
  const headers = getAuthHeaders(token, tenantId);

  // Test scenarios
  const scenarios = [
    testInventoryPerformance,
    testPOSSPerformance,
    testCRMPerformance,
    testReportingPerformance,
  ];

  // Run random scenario
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  scenario(headers, tenantId);

  sleep(1);
}

// Performance test scenarios
function testInventoryPerformance(headers: any, tenantId: string) {
  // Test product listing
  const productsResponse = http.get(`${BASE_URL}/api/inventory/products?limit=50`, {
    headers,
  });

  check(productsResponse, {
    'products status is 200': (r) => r.status === 200,
    'products response time < 300ms': (r) => r.timings.duration < 300,
    'products has data': (r) => r.json('data') !== undefined,
  }) || errorRate.add(1);

  // Test product search
  const searchResponse = http.get(`${BASE_URL}/api/inventory/products?search=test&limit=10`, {
    headers,
  });

  check(searchResponse, {
    'search status is 200': (r) => r.status === 200,
    'search response time < 200ms': (r) => r.timings.duration < 200,
  }) || errorRate.add(1);

  // Test stock update
  const stockResponse = http.put(`${BASE_URL}/api/inventory/products/test-product/stock`, JSON.stringify({
    quantity: 100,
    movement_type: 'adjustment',
    reason: 'Load test adjustment',
  }), {
    headers,
  });

  check(stockResponse, {
    'stock update status is 200': (r) => r.status === 200,
    'stock update response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);
}

function testPOSSPerformance(headers: any, tenantId: string) {
  // Test sales listing
  const salesResponse = http.get(`${BASE_URL}/api/pos/sales?page=1&limit=20`, {
    headers,
  });

  check(salesResponse, {
    'sales status is 200': (r) => r.status === 200,
    'sales response time < 300ms': (r) => r.timings.duration < 300,
    'sales has pagination': (r) => r.json('pagination') !== undefined,
  }) || errorRate.add(1);

  // Test sale calculation
  const calcResponse = http.post(`${BASE_URL}/api/pos/sales/calculate`, JSON.stringify({
    items: [
      { product_id: 'test-product-1', quantity: 2, unit_price: 99.99 },
      { product_id: 'test-product-2', quantity: 1, unit_price: 149.99 },
    ],
    payment_method: 'card',
  }), {
    headers,
  });

  check(calcResponse, {
    'calculation status is 200': (r) => r.status === 200,
    'calculation response time < 200ms': (r) => r.timings.duration < 200,
    'calculation has total': (r) => r.json('total') !== undefined,
  }) || errorRate.add(1);

  // Test customer search
  const customerResponse = http.get(`${BASE_URL}/api/customers?search=test&limit=10`, {
    headers,
  });

  check(customerResponse, {
    'customer search status is 200': (r) => r.status === 200,
    'customer search response time < 250ms': (r) => r.timings.duration < 250,
  }) || errorRate.add(1);
}

function testCRMPerformance(headers: any, tenantId: string) {
  // Test customer listing
  const customersResponse = http.get(`${BASE_URL}/api/customers?page=1&limit=50`, {
    headers,
  });

  check(customersResponse, {
    'customers status is 200': (r) => r.status === 200,
    'customers response time < 300ms': (r) => r.timings.duration < 300,
    'customers has data': (r) => r.json('data') !== undefined,
  }) || errorRate.add(1);

  // Test customer creation
  const createCustomerResponse = http.post(`${BASE_URL}/api/customers`, JSON.stringify({
    email: `load-test-${Date.now()}@example.com`,
    first_name: 'Load',
    last_name: 'Test',
    phone: '+1234567890',
  }), {
    headers,
  });

  check(createCustomerResponse, {
    'customer creation status is 201': (r) => r.status === 201,
    'customer creation response time < 400ms': (r) => r.timings.duration < 400,
  }) || errorRate.add(1);

  // Test customer update
  if (createCustomerResponse.status === 201) {
    const customerId = createCustomerResponse.json('id');
    const updateResponse = http.put(`${BASE_URL}/api/customers/${customerId}`, JSON.stringify({
      first_name: 'Updated',
      last_name: 'Customer',
    }), {
      headers,
    });

    check(updateResponse, {
      'customer update status is 200': (r) => r.status === 200,
      'customer update response time < 300ms': (r) => r.timings.duration < 300,
    }) || errorRate.add(1);
  }
}

function testReportingPerformance(headers: any, tenantId: string) {
  // Test sales report
  const salesReportResponse = http.get(`${BASE_URL}/api/reports/sales?start_date=2024-01-01&end_date=2024-12-31`, {
    headers,
  });

  check(salesReportResponse, {
    'sales report status is 200': (r) => r.status === 200,
    'sales report response time < 1000ms': (r) => r.timings.duration < 1000,
    'sales report has summary': (r) => r.json('summary') !== undefined,
  }) || errorRate.add(1);

  // Test inventory report
  const inventoryReportResponse = http.get(`${BASE_URL}/api/reports/inventory`, {
    headers,
  });

  check(inventoryReportResponse, {
    'inventory report status is 200': (r) => r.status === 200,
    'inventory report response time < 800ms': (r) => r.timings.duration < 800,
    'inventory report has data': (r) => r.json('summary') !== undefined,
  }) || errorRate.add(1);

  // Test dashboard data
  const dashboardResponse = http.get(`${BASE_URL}/api/dashboard/stats`, {
    headers,
  });

  check(dashboardResponse, {
    'dashboard status is 200': (r) => r.status === 200,
    'dashboard response time < 500ms': (r) => r.timings.duration < 500,
    'dashboard has stats': (r) => r.json('stats') !== undefined,
  }) || errorRate.add(1);
}

// Stress test configuration
export function stressTest() {
  return {
    ...options,
    stages: [
      { duration: '2m', target: 100 },
      { duration: '5m', target: 100 },
      { duration: '2m', target: 200 },
      { duration: '5m', target: 200 },
      { duration: '2m', target: 500 },
      { duration: '10m', target: 500 }, // Sustained high load
      { duration: '5m', target: 1000 }, // Extreme load
      { duration: '5m', target: 1000 },
      { duration: '2m', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<1000'], // More lenient for stress test
      http_req_failed: ['rate<0.2'],     // Allow higher failure rate
      errors: ['rate<0.2'],
    },
  };
}

// Spike test configuration
export function spikeTest() {
  return {
    ...options,
    stages: [
      { duration: '2m', target: 10 },
      { duration: '5m', target: 10 },
      { duration: '1m', target: 500 }, // Sudden spike
      { duration: '5m', target: 500 },
      { duration: '1m', target: 10 }, // Return to normal
      { duration: '5m', target: 10 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<800'],
      http_req_failed: ['rate<0.15'],
      errors: ['rate<0.15'],
    },
  };
}

// Soak test configuration
export function soakTest() {
  return {
    ...options,
    stages: [
      { duration: '5m', target: 50 },
      { duration: '4h', target: 50 }, // Extended duration
      { duration: '5m', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<600'],
      http_req_failed: ['rate<0.05'],
      errors: ['rate<0.05'],
    },
  };
}
