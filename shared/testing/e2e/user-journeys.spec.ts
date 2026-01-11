/**
 * User Journey E2E Tests for KiTS Hub
 * Tests complete user workflows across all solutions
 */

import { test, expect } from '@playwright/test';

test.describe('User Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login');
    await page.fill('[data-testid="email"]', 'e2e-test@example.com');
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test.describe('Tenant Onboarding Journey', () => {
    test('should complete full tenant onboarding process', async ({ page }) => {
      // Start onboarding
      await page.goto('/onboarding');
      
      // Step 1: Business Information
      await expect(page.locator('[data-testid="onboarding-step-1"]')).toBeVisible();
      await page.fill('[data-testid="company-name"]', 'Test Business Co');
      await page.fill('[data-testid="contact-name"]', 'John Doe');
      await page.fill('[data-testid="business-email"]', 'john@testbusiness.com');
      await page.fill('[data-testid="phone"]', '+1234567890');
      await page.click('[data-testid="next-step"]');

      // Step 2: Plan Selection
      await expect(page.locator('[data-testid="onboarding-step-2"]')).toBeVisible();
      await page.click('[data-testid="plan-professional"]');
      await page.click('[data-testid="billing-yearly"]');
      await page.click('[data-testid="next-step"]');

      // Step 3: Feature Selection
      await expect(page.locator('[data-testid="onboarding-step-3"]')).toBeVisible();
      await page.check('[data-testid="feature-inventory"]');
      await page.check('[data-testid="feature-pos"]');
      await page.check('[data-testid="feature-crm"]');
      await page.click('[data-testid="next-step"]');

      // Step 4: Backend Setup
      await expect(page.locator('[data-testid="onboarding-step-4"]')).toBeVisible();
      await page.fill('[data-testid="supabase-email"]', 'backend@testbusiness.com');
      await page.fill('[data-testid="supabase-password"]', 'SecurePassword123!');
      await page.click('[data-testid="create-backend-account"]');

      // Success
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      await expect(page.locator('text=Account created successfully')).toBeVisible();
      
      // Redirect to dashboard
      await page.waitForURL('/dashboard');
      await expect(page.locator('[data-testid="dashboard-welcome"]')).toBeVisible();
    });
  });

  test.describe('Inventory Management Journey', () => {
    test('should manage complete product lifecycle', async ({ page }) => {
      // Navigate to inventory
      await page.click('[data-testid="nav-inventory"]');
      await page.waitForURL('/inventory');

      // Add new product
      await page.click('[data-testid="add-product-button"]');
      await page.fill('[data-testid="product-name"]', 'Test Laptop');
      await page.fill('[data-testid="product-sku"]', 'LAPTOP-001');
      await page.selectOption('[data-testid="product-category"]', 'Electronics');
      await page.fill('[data-testid="product-price"]', '999');
      await page.fill('[data-testid="product-cost"]', '500');
      await page.fill('[data-testid="product-stock"]', '50');
      await page.fill('[data-testid="product-reorder-point"]', '10');
      await page.click('[data-testid="save-product-button"]');

      // Verify product created
      await expect(page.locator('text=Test Laptop')).toBeVisible();
      await expect(page.locator('text=LAPTOP-001')).toBeVisible();

      // Edit product
      await page.click('[data-testid="edit-product-LAPTOP-001"]');
      await page.fill('[data-testid="product-name"]', 'Updated Test Laptop');
      await page.click('[data-testid="save-product-button"]');

      // Verify product updated
      await expect(page.locator('text=Updated Test Laptop')).toBeVisible();

      // Add stock movement
      await page.click('[data-testid="stock-movement-LAPTOP-001"]');
      await page.selectOption('[data-testid="movement-type"]', 'purchase');
      await page.fill('[data-testid="movement-quantity"]', '25');
      await page.fill('[data-testid="movement-reason"]', 'New stock purchase');
      await page.click('[data-testid="add-movement-button"]');

      // Verify stock updated
      await expect(page.locator('text=75')).toBeVisible(); // 50 + 25

      // Create sale (stock reduction)
      await page.click('[data-testid="nav-pos"]');
      await page.fill('[data-testid="product-search"]', 'LAPTOP-001');
      await page.click('[data-testid="add-to-cart-LAPTOP-001"]');
      await page.fill('[data-testid="quantity-LAPTOP-001"]', '2');
      await page.click('[data-testid="complete-sale-button"]');

      // Verify stock reduced
      await page.click('[data-testid="nav-inventory"]');
      await expect(page.locator('text=73')).toBeVisible(); // 75 - 2
    });
  });

  test.describe('Point of Sale Journey', () => {
    test('should complete sale from cart to payment', async ({ page }) => {
      // Navigate to POS
      await page.click('[data-testid="nav-pos"]');
      await page.waitForURL('/pos');

      // Add products to cart
      await page.fill('[data-testid="product-search"]', 'LAPTOP-001');
      await page.click('[data-testid="add-to-cart-LAPTOP-001"]');
      
      await page.fill('[data-testid="product-search"]', 'MOUSE-001');
      await page.click('[data-testid="add-to-cart-MOUSE-001"]');

      // Verify cart items
      await expect(page.locator('[data-testid="cart-items"]')).toContainText('LAPTOP-001');
      await expect(page.locator('[data-testid="cart-items"]')).toContainText('MOUSE-001');
      
      // Add customer
      await page.click('[data-testid="add-customer-button"]');
      await page.fill('[data-testid="customer-email"]', 'walkin@example.com');
      await page.fill('[data-testid="customer-name"]', 'Walk-in Customer');
      await page.click('[data-testid="save-customer-button"]');

      // Apply discount
      await page.click('[data-testid="apply-discount"]');
      await page.fill('[data-testid="discount-percentage"]', '10');
      await page.click('[data-testid="confirm-discount"]');

      // Process payment
      await page.click('[data-testid="process-payment"]');
      await page.selectOption('[data-testid="payment-method"]', 'card');
      await page.click('[data-testid="complete-payment-button"]');

      // Verify sale completed
      await expect(page.locator('[data-testid="sale-success"]')).toBeVisible();
      await expect(page.locator('text=Payment processed successfully')).toBeVisible();

      // Print receipt
      await page.click('[data-testid="print-receipt"]');
      await expect(page.locator('[data-testid="receipt-preview"]')).toBeVisible();
    });
  });

  test.describe('Customer Management Journey', () => {
    test('should manage customer lifecycle', async ({ page }) => {
      // Navigate to CRM
      await page.click('[data-testid="nav-crm"]');
      await page.waitForURL('/crm');

      // Add new customer
      await page.click('[data-testid="add-customer-button"]');
      await page.fill('[data-testid="customer-first-name"]', 'Jane');
      await page.fill('[data-testid="customer-last-name"]', 'Smith');
      await page.fill('[data-testid="customer-email"]', 'jane.smith@example.com');
      await page.fill('[data-testid="customer-phone"]', '+1234567890');
      await page.fill('[data-testid="customer-company"]', 'Smith Corp');
      await page.click('[data-testid="save-customer-button"]');

      // Verify customer created
      await expect(page.locator('text=Jane Smith')).toBeVisible();
      await expect(page.locator('text=jane.smith@example.com')).toBeVisible();

      // View customer details
      await page.click('[data-testid="customer-jane.smith@example.com"]');
      await expect(page.locator('[data-testid="customer-details"]')).toBeVisible();
      await expect(page.locator('text=Smith Corp')).toBeVisible();

      // Add note
      await page.click('[data-testid="add-note-button"]');
      await page.fill('[data-testid="note-content"]', 'VIP customer - prefers email communication');
      await page.click('[data-testid="save-note-button"]');

      // Create sale for customer
      await page.click('[data-testid="create-sale-button"]');
      await page.fill('[data-testid="product-search"]', 'LAPTOP-001');
      await page.click('[data-testid="add-to-cart-LAPTOP-001"]');
      await page.click('[data-testid="complete-sale-button"]');

      // Verify purchase history
      await page.click('[data-testid="purchase-history-tab"]');
      await expect(page.locator('[data-testid="purchase-record"]')).toBeVisible();
      await expect(page.locator('text=LAPTOP-001')).toBeVisible();
    });
  });

  test.describe('Multi-Solution Workflow', () => {
    test('should handle inventory to POS to CRM integrated workflow', async ({ page }) => {
      // Step 1: Create product in Inventory
      await page.click('[data-testid="nav-inventory"]');
      await page.click('[data-testid="add-product-button"]');
      await page.fill('[data-testid="product-name"]', 'Integration Test Product');
      await page.fill('[data-testid="product-sku"]', 'INT-001');
      await page.fill('[data-testid="product-price"]', '299');
      await page.fill('[data-testid="product-stock"]', '20');
      await page.click('[data-testid="save-product-button"]');

      // Step 2: Process sale in POS
      await page.click('[data-testid="nav-pos"]');
      await page.fill('[data-testid="product-search"]', 'INT-001');
      await page.click('[data-testid="add-to-cart-INT-001"]');
      
      // Create new customer during sale
      await page.click('[data-testid="add-customer-button"]');
      await page.fill('[data-testid="customer-email"]', 'integration@example.com');
      await page.fill('[data-testid="customer-name"]', 'Integration Customer');
      await page.click('[data-testid="save-customer-button"]');
      
      await page.click('[data-testid="complete-sale-button"]');

      // Step 3: Verify customer record in CRM
      await page.click('[data-testid="nav-crm"]');
      await page.fill('[data-testid="customer-search"]', 'integration@example.com');
      await page.click('[data-testid="customer-integration@example.com"]');

      // Verify purchase history
      await expect(page.locator('[data-testid="purchase-history"]')).toContainText('INT-001');
      await expect(page.locator('[data-testid="purchase-history"]')).toContainText('$299');

      // Step 4: Verify inventory updated
      await page.click('[data-testid="nav-inventory"]');
      await expect(page.locator('[data-testid="stock-INT-001"]')).toContainText('19'); // 20 - 1
    });
  });

  test.describe('Reporting Journey', () => {
    test('should generate and export comprehensive reports', async ({ page }) => {
      // Navigate to reports
      await page.click('[data-testid="nav-reports"]');
      await page.waitForURL('/reports');

      // Generate sales report
      await page.click('[data-testid="sales-report-tab"]');
      await page.selectOption('[data-testid="date-range"]', 'last-30-days');
      await page.click('[data-testid="generate-report-button"]');

      // Verify report data
      await expect(page.locator('[data-testid="report-summary"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-sales"]')).toBeVisible();
      await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();

      // Export to PDF
      await page.click('[data-testid="export-pdf"]');
      await expect(page.locator('[data-testid="export-success"]')).toBeVisible();

      // Generate inventory report
      await page.click('[data-testid="inventory-report-tab"]');
      await page.click('[data-testid="generate-report-button"]');

      // Verify low stock alerts
      await expect(page.locator('[data-testid="low-stock-alerts"]')).toBeVisible();

      // Export to CSV
      await page.click('[data-testid="export-csv"]');
      await expect(page.locator('[data-testid="export-success"]')).toBeVisible();
    });
  });

  test.describe('Settings and Configuration Journey', () => {
    test('should configure tenant settings and preferences', async ({ page }) => {
      // Navigate to settings
      await page.click('[data-testid="nav-settings"]');
      await page.waitForURL('/settings');

      // General settings
      await page.click('[data-testid="general-settings-tab"]');
      await page.fill('[data-testid="business-name"]', 'Updated Business Name');
      await page.selectOption('[data-testid="timezone"]', 'America/New_York');
      await page.selectOption('[data-testid="currency"]', 'USD');
      await page.click('[data-testid="save-general-settings"]');

      // Notification settings
      await page.click('[data-testid="notifications-tab"]');
      await page.check('[data-testid="low-stock-alerts"]');
      await page.check('[data-testid="sales-notifications"]');
      await page.uncheck('[data-testid="marketing-emails"]');
      await page.click('[data-testid="save-notification-settings"]');

      // Integration settings
      await page.click('[data-testid="integrations-tab"]');
      await page.fill('[data-testid="stripe-api-key"]', 'sk_test_123');
      await page.fill('[data-testid="email-provider"]', 'smtp');
      await page.click('[data-testid="save-integration-settings"]');

      // User management
      await page.click('[data-testid="users-tab"]');
      await page.click('[data-testid="invite-user-button"]');
      await page.fill('[data-testid="user-email"]', 'newuser@example.com');
      await page.selectOption('[data-testid="user-role"]', 'manager');
      await page.click('[data-testid="send-invitation-button"]');

      // Verify settings saved
      await expect(page.locator('[data-testid="settings-saved"]')).toBeVisible();
    });
  });

  test.describe('Mobile Responsive Journey', () => {
    test('should work seamlessly on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Test mobile navigation
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      await page.click('[data-testid="mobile-menu-button"]');
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();

      // Test mobile POS
      await page.click('[data-testid="mobile-nav-pos"]');
      await page.waitForURL('/pos');
      
      // Add product using mobile interface
      await page.fill('[data-testid="mobile-product-search"]', 'LAPTOP-001');
      await page.click('[data-testid="mobile-add-to-cart"]');
      
      // Complete mobile sale
      await page.click('[data-testid="mobile-checkout-button"]');
      await page.selectOption('[data-testid="mobile-payment-method"]', 'card');
      await page.click('[data-testid="mobile-complete-payment"]');

      // Verify mobile success
      await expect(page.locator('[data-testid="mobile-success-message"]')).toBeVisible();
    });
  });
});
