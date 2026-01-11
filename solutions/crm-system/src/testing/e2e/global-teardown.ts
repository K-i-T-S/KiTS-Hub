/**
 * Global Teardown for Playwright E2E Tests
 * Cleans up test environment and data
 */

import { FullConfig } from '@playwright/test';
import { TestDatabaseFactory } from '../integration/test-database';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up E2E test environment...');

  try {
    // Clean up test database
    await TestDatabaseFactory.resetAll();
    await TestDatabaseFactory.closeAll();
    console.log('✅ Test database cleaned up');
  } catch (error) {
    console.error('❌ Failed to cleanup test database:', error);
  }

  // Clean up any test files or temporary data
  try {
    // Add any additional cleanup logic here
    console.log('✅ E2E environment cleanup completed');
  } catch (error) {
    console.error('❌ Failed to cleanup E2E environment:', error);
  }
}

export default globalTeardown;
