import { test, expect, Page } from '@playwright/test'

class SalesWorkflowPage {
  constructor(private page: Page) {}

  async navigateToPOS() {
    await this.page.goto('http://localhost:3000/pos')
    await this.page.waitForLoadState('networkidle')
  }

  async createCustomer(name: string, email: string, phone: string) {
    await this.page.click('[data-testid="create-customer-btn"]')
    await this.page.fill('[data-testid="customer-name-input"]', name)
    await this.page.fill('[data-testid="customer-email-input"]', email)
    await this.page.fill('[data-testid="customer-phone-input"]', phone)
    await this.page.click('[data-testid="save-customer-btn"]')
    
    // Wait for customer creation success
    await this.page.waitForSelector('[data-testid="customer-success-message"]')
  }

  async addProductToCart(productId: string, quantity: number) {
    await this.page.click('[data-testid="add-product-btn"]')
    await this.page.selectOption('[data-testid="product-select"]', productId)
    await this.page.fill('[data-testid="quantity-input"]', quantity.toString())
    await this.page.click('[data-testid="add-to-cart-btn"]')
    
    // Wait for item to be added to cart
    await this.page.waitForSelector(`[data-testid="cart-item-${productId}"]`)
  }

  async completeSale() {
    await this.page.click('[data-testid="complete-sale-btn"]')
    
    // Wait for sale completion
    await this.page.waitForSelector('[data-testid="sale-success-message"]')
  }

  async verifySaleInInventory() {
    await this.page.goto('http://localhost:3000/inventory')
    await this.page.waitForLoadState('networkidle')
    
    // Check that stock was updated
    await this.page.click('[data-testid="view-products-btn"]')
    await this.page.waitForSelector('[data-testid="products-list"]')
  }

  async verifySaleInAccounting() {
    await this.page.goto('http://localhost:3000/accounting')
    await this.page.waitForLoadState('networkidle')
    
    // Check that transaction was recorded
    await this.page.click('[data-testid="view-transactions-btn"]')
    await this.page.waitForSelector('[data-testid="transactions-list"]')
  }

  async verifySaleInAnalytics() {
    await this.page.goto('http://localhost:3000/analytics')
    await this.page.waitForLoadState('networkidle')
    
    // Check that analytics were updated
    await this.page.waitForSelector('[data-testid="dashboard-metrics"]')
  }
}

test.describe('Complete Sales Workflow E2E', () => {
  let salesPage: SalesWorkflowPage

  test.beforeEach(async ({ page }) => {
    salesPage = new SalesWorkflowPage(page)
    
    // Login if needed
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    
    // Check if we need to login
    const loginButton = page.locator('[data-testid="login-btn"]')
    if (await loginButton.isVisible()) {
      await loginButton.click()
      await page.fill('[data-testid="email-input"]', 'test@example.com')
      await page.fill('[data-testid="password-input"]', 'password')
      await page.click('[data-testid="signin-btn"]')
      await page.waitForSelector('[data-testid="user-menu"]')
    }
  })

  test('should complete full sales workflow from POS to Analytics', async ({ page }) => {
    // Step 1: Navigate to POS
    await salesPage.navigateToPOS()
    await expect(page.locator('h1')).toContainText('Point of Sale')

    // Step 2: Create a new customer
    await salesPage.createCustomer('John Doe', 'john@example.com', '+1234567890')
    
    // Verify customer was created
    await expect(page.locator('[data-testid="customer-success-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="customer-info"]')).toContainText('John Doe')

    // Step 3: Add products to cart
    await salesPage.addProductToCart('product-1', 2)
    await salesPage.addProductToCart('product-2', 1)
    
    // Verify cart contents
    await expect(page.locator('[data-testid="cart-item-product-1"]')).toBeVisible()
    await expect(page.locator('[data-testid="cart-item-product-2"]')).toBeVisible()
    await expect(page.locator('[data-testid="cart-total"]')).toContainText('$')

    // Step 4: Complete the sale
    await salesPage.completeSale()
    
    // Verify sale completion
    await expect(page.locator('[data-testid="sale-success-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="receipt"]')).toBeVisible()

    // Step 5: Verify inventory was updated
    await salesPage.verifySaleInInventory()
    await expect(page.locator('[data-testid="products-list"]')).toBeVisible()
    
    // Check stock levels (should be reduced)
    const productStock = page.locator('[data-testid="product-stock"]')
    await expect(productStock).toBeVisible()

    // Step 6: Verify accounting transaction was created
    await salesPage.verifySaleInAccounting()
    await expect(page.locator('[data-testid="transactions-list"]')).toBeVisible()
    
    // Check for the new transaction
    const newTransaction = page.locator('[data-testid="transaction-item"]').first()
    await expect(newTransaction).toBeVisible()

    // Step 7: Verify analytics were updated
    await salesPage.verifySaleInAnalytics()
    await expect(page.locator('[data-testid="dashboard-metrics"]')).toBeVisible()
    
    // Check updated metrics
    await expect(page.locator('[data-testid="total-sales"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-orders"]')).toBeVisible()
  })

  test('should handle low stock scenario', async ({ page }) => {
    await salesPage.navigateToPOS()
    
    // Try to add more items than available
    await salesPage.addProductToCart('low-stock-product', 10)
    
    // Should show low stock warning
    await expect(page.locator('[data-testid="low-stock-warning"]')).toBeVisible()
    await expect(page.locator('[data-testid="insufficient-stock-error"]')).toBeVisible()
    
    // Should prevent sale completion
    const completeSaleBtn = page.locator('[data-testid="complete-sale-btn"]')
    await expect(completeSaleBtn).toBeDisabled()
  })

  test('should handle payment processing', async ({ page }) => {
    await salesPage.navigateToPOS()
    await salesPage.createCustomer('Jane Smith', 'jane@example.com', '+1234567891')
    await salesPage.addProductToCart('product-1', 1)
    
    // Select payment method
    await page.click('[data-testid="payment-method-select"]')
    await page.selectOption('[data-testid="payment-method-select"]', 'credit_card')
    
    // Fill payment details
    await page.fill('[data-testid="card-number-input"]', '4111111111111111')
    await page.fill('[data-testid="card-expiry-input"]', '12/25')
    await page.fill('[data-testid="card-cvc-input"]', '123')
    
    // Process payment
    await page.click('[data-testid="process-payment-btn"]')
    
    // Verify payment success
    await expect(page.locator('[data-testid="payment-success-message"]')).toBeVisible()
    await salesPage.completeSale()
  })

  test('should handle refund workflow', async ({ page }) => {
    await salesPage.navigateToPOS()
    
    // Navigate to refunds section
    await page.click('[data-testid="refunds-tab"]')
    await page.waitForSelector('[data-testid="refunds-list"]')
    
    // Select a sale to refund
    await page.click('[data-testid="sale-item-to-refund"]')
    
    // Select items to refund
    await page.check('[data-testid="refund-item-checkbox"]')
    
    // Process refund
    await page.click('[data-testid="process-refund-btn"]')
    
    // Verify refund success
    await expect(page.locator('[data-testid="refund-success-message"]')).toBeVisible()
    
    // Verify inventory was updated (stock increased)
    await salesPage.verifySaleInInventory()
    const refundedProduct = page.locator('[data-testid="product-stock"]')
    await expect(refundedProduct).toContainText('+1') // Stock should increase
  })

  test('should handle customer loyalty program', async ({ page }) => {
    await salesPage.navigateToPOS()
    await salesPage.createCustomer('Loyal Customer', 'loyal@example.com', '+1234567892')
    
    // Add products to reach loyalty threshold
    await salesPage.addProductToCart('product-1', 5)
    
    // Check loyalty points earned
    await expect(page.locator('[data-testid="loyalty-points-earned"]')).toBeVisible()
    await expect(page.locator('[data-testid="loyalty-tier-upgrade"]')).toBeVisible()
    
    await salesPage.completeSale()
    
    // Verify customer was upgraded
    await page.goto('http://localhost:3000/crm')
    await page.waitForLoadState('networkidle')
    
    await page.click('[data-testid="view-customers-btn"]')
    await page.fill('[data-testid="customer-search"]', 'loyal@example.com')
    
    const customerCard = page.locator('[data-testid="customer-card"]').first()
    await expect(customerCard).toContainText('Gold Member')
    await expect(customerCard).toContainText('500 points')
  })

  test('should handle multi-tax calculation', async ({ page }) => {
    await salesPage.navigateToPOS()
    await salesPage.createCustomer('Tax Customer', 'tax@example.com', '+1234567893')
    await salesPage.addProductToCart('taxable-product', 1)
    
    // Verify tax calculation
    await expect(page.locator('[data-testid="tax-breakdown"]')).toBeVisible()
    await expect(page.locator('[data-testid="state-tax"]')).toBeVisible()
    await expect(page.locator('[data-testid="federal-tax"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-tax"]')).toBeVisible()
    
    // Verify total calculation
    const subtotal = await page.locator('[data-testid="cart-subtotal"]').textContent()
    const tax = await page.locator('[data-testid="total-tax"]').textContent()
    const total = await page.locator('[data-testid="cart-total"]').textContent()
    
    expect(total).toContain(subtotal)
    expect(total).toContain(tax)
  })

  test('should handle offline mode', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true)
    
    await salesPage.navigateToPOS()
    
    // Should show offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible()
    
    // Should still allow creating sales (cached)
    await salesPage.createCustomer('Offline Customer', 'offline@example.com', '+1234567894')
    await salesPage.addProductToCart('product-1', 1)
    
    // Sale should be queued for sync
    await salesPage.completeSale()
    await expect(page.locator('[data-testid="sale-queued-message"]')).toBeVisible()
    
    // Restore online mode
    await page.context().setOffline(false)
    
    // Should sync queued sales
    await expect(page.locator('[data-testid="syncing-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="sync-complete-message"]')).toBeVisible()
  })
})
