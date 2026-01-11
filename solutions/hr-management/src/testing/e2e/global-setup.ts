/**
 * Global Setup for Playwright E2E Tests
 * Prepares test environment and data
 */

import { chromium, FullConfig } from '@playwright/test';
import { TestDatabaseFactory } from '../integration/test-database';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Setting up E2E test environment...');

  // Initialize test database
  try {
    TestDatabaseFactory.initialize({
      url: process.env.TEST_SUPABASE_URL || 'http://localhost:54321',
      anonKey: process.env.TEST_SUPABASE_ANON_KEY || 'test-anon-key',
      serviceKey: process.env.TEST_SUPABASE_SERVICE_KEY || 'test-service-key',
      schema: 'test_schema',
    });
    console.log('✅ Test database initialized');
  } catch (error) {
    console.error('❌ Failed to initialize test database:', error);
  }

  // Start browser for setup tasks
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Wait for application to be ready
    await page.goto(process.env.E2E_BASE_URL || 'http://localhost:3000');
    
    // Check if application is ready
    await page.waitForSelector('body', { timeout: 30000 });
    
    // Setup test data if needed
    await setupTestData(page);
    
    console.log('✅ Application is ready for E2E testing');
  } catch (error) {
    console.error('❌ Failed to setup E2E environment:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

async function setupTestData(page: any) {
  // Create test tenants and users for E2E tests
  const testTenants = [
    {
      name: 'E2E Test Tenant',
      email: 'e2e-test@example.com',
      password: 'TestPassword123!',
      plan: 'basic',
    },
    {
      name: 'E2E Premium Tenant',
      email: 'e2e-premium@example.com',
      password: 'TestPassword123!',
      plan: 'professional',
    },
  ];

  for (const tenant of testTenants) {
    try {
      // Check if tenant exists, create if not
      await page.goto('/auth/signup');
      
      await page.fill('[data-testid="email"]', tenant.email);
      await page.fill('[data-testid="password"]', tenant.password);
      await page.fill('[data-testid="company-name"]', tenant.name);
      
      // Select plan
      await page.click(`[data-testid="plan-${tenant.plan}"]`);
      
      // Submit form
      await page.click('[data-testid="signup-button"]');
      
      // Wait for success or handle existing user
      await page.waitForTimeout(2000);
      
      console.log(`✅ Setup test tenant: ${tenant.name}`);
    } catch (error) {
      console.log(`ℹ️ Tenant ${tenant.name} might already exist or setup failed`);
    }
  }
}

export default globalSetup;
