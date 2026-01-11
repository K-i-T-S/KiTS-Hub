# KiTS Hub Comprehensive Testing Guide

## 📋 Overview

This guide provides comprehensive testing strategies, best practices, and implementation details for the KiTS Hub micro-frontend architecture. Our testing approach ensures reliability, performance, and quality across all 6 business solutions and their integrations.

## 🏗️ Testing Architecture

### Testing Pyramid

```
    E2E Tests (10%)
   ─────────────────
  Integration Tests (20%)
 ─────────────────────────
Unit Tests (70%)
```

### Test Categories

1. **Unit Tests** - Individual component and function testing
2. **Integration Tests** - Module Federation and cross-solution testing
3. **E2E Tests** - Full user workflow testing
4. **Performance Tests** - Load time and resource usage testing
5. **Visual Tests** - UI consistency and regression testing
6. **Security Tests** - Vulnerability and permission testing
7. **Accessibility Tests** - WCAG compliance testing

## 🛠️ Testing Framework Setup

### Core Technologies

- **Vitest** - Fast unit testing with TypeScript support
- **Playwright** - Cross-browser E2E testing
- **Storybook** - Component testing and visual regression
- **MSW** - API mocking for unit/integration tests
- **Testing Library** - Component testing utilities

### Configuration Files

```bash
tests/
├── vitest.config.js              # Vitest configuration
├── playwright.config.ts          # Playwright configuration
├── .storybook/
│   ├── main.ts                    # Storybook main config
│   └── preview.ts                 # Storybook preview config
├── unit/
│   ├── setup.ts                   # Test setup utilities
│   ├── mocks/                     # Mock implementations
│   ├── components/                # Component tests
│   ├── services/                  # Service tests
│   └── utils/                     # Utility tests
├── integration/
│   ├── module-federation/         # Module Federation tests
│   ├── cross-solution/            # Cross-solution tests
│   └── api/                       # API integration tests
├── e2e/
│   ├── workflows/                 # User workflow tests
│   ├── performance/               # Performance tests
│   ├── accessibility/             # A11y tests
│   ├── global-setup.ts            # E2E setup
│   └── global-teardown.ts         # E2E cleanup
└── visual/
    └── stories/                   # Storybook stories
```

## 🧪 Unit Testing

### Component Testing

#### Best Practices

1. **Test behavior, not implementation**
2. **Use meaningful test descriptions**
3. **Mock external dependencies**
4. **Test all component variants**
5. **Include accessibility testing**

#### Example: Button Component

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: 'Click me' })
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Disabled</Button>)
    
    const button = screen.getByRole('button', { name: 'Disabled' })
    expect(button).toBeDisabled()
    
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })
})
```

#### Service Testing

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '@/lib/auth-service'

describe('AuthService', () => {
  let authService: AuthService
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = createMockSupabase()
    authService = new AuthService(mockSupabase)
  })

  it('should sign in user with valid credentials', async () => {
    const mockUser = { id: '1', email: 'test@example.com' }
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: mockUser, session: { access_token: 'token' } },
      error: null
    })

    const result = await authService.signIn('test@example.com', 'password')

    expect(result.user).toEqual(mockUser)
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    })
  })
})
```

#### Utility Testing

```typescript
import { describe, it, expect } from 'vitest'
import { formatCurrency, calculateTax, applyDiscount } from '@/lib/utils/currency'

describe('Currency Utils', () => {
  it('should format USD currency correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56')
    expect(formatCurrency(0, 'USD')).toBe('$0.00')
    expect(formatCurrency(-123.45, 'USD')).toBe('-$123.45')
  })

  it('should calculate tax correctly', () => {
    expect(calculateTax(100, 0.1)).toBe(10)
    expect(calculateTax(100, 0.15)).toBe(15)
  })

  it('should apply discount correctly', () => {
    expect(applyDiscount(100, 10)).toBe(90)
    expect(applyDiscount(100, 25, 'fixed')).toBe(75)
  })
})
```

### Coverage Requirements

- **Branch Coverage**: ≥ 80%
- **Function Coverage**: ≥ 80%
- **Line Coverage**: ≥ 80%
- **Statement Coverage**: ≥ 80%

## 🔗 Integration Testing

### Module Federation Testing

#### Remote Loading Tests

```typescript
describe('Module Federation Remote Loading', () => {
  it('should load remoteEntry.js for all solutions', async () => {
    renderApp()
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:4177/remoteEntry.js')
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:4178/remoteEntry.js')
      // ... other remotes
    })
  })

  it('should handle remote loading failure gracefully', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'))
    
    renderApp()
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load remote application/i)).toBeInTheDocument()
    })
  })
})
```

### Cross-Solution Workflow Testing

```typescript
describe('Complete Sales Workflow', () => {
  it('should execute POS → Inventory → Accounting workflow', async () => {
    // Create customer in POS
    await createCustomer('John Doe', 'john@example.com')
    
    // Add products to cart
    await addProductToCart('product-1', 2)
    
    // Complete sale
    await completeSale()
    
    // Verify inventory was updated
    expect(mockDataSync.syncProduct).toHaveBeenCalledWith(
      expect.objectContaining({ product_id: 'product-1', stock_change: -2 })
    )
    
    // Verify accounting transaction was created
    expect(mockDataSync.syncSale).toHaveBeenCalledWith(
      expect.objectContaining({ sale_id: 'sale-1', total: 199.98 })
    )
  })
})
```

## 🎭 E2E Testing

### User Workflow Testing

#### Complete Sales Workflow

```typescript
test.describe('Complete Sales Workflow E2E', () => {
  test('should complete full sales workflow from POS to Analytics', async ({ page }) => {
    // Step 1: Navigate to POS
    await page.goto('http://localhost:3000/pos')
    
    // Step 2: Create customer
    await page.click('[data-testid="create-customer-btn"]')
    await page.fill('[data-testid="customer-name-input"]', 'John Doe')
    await page.fill('[data-testid="customer-email-input"]', 'john@example.com')
    await page.click('[data-testid="save-customer-btn"]')
    
    // Step 3: Add products
    await page.click('[data-testid="add-product-btn"]')
    await page.selectOption('[data-testid="product-select"]', 'product-1')
    await page.fill('[data-testid="quantity-input"]', '2')
    await page.click('[data-testid="add-to-cart-btn"]')
    
    // Step 4: Complete sale
    await page.click('[data-testid="complete-sale-btn"]')
    
    // Step 5: Verify in other solutions
    await page.goto('http://localhost:3000/inventory')
    await expect(page.locator('[data-testid="products-list"]')).toBeVisible()
    
    await page.goto('http://localhost:3000/accounting')
    await expect(page.locator('[data-testid="transactions-list"]')).toBeVisible()
    
    await page.goto('http://localhost:3000/analytics')
    await expect(page.locator('[data-testid="dashboard-metrics"]')).toBeVisible()
  })
})
```

### Performance Testing

```typescript
test.describe('Performance Tests', () => {
  test('should meet initial load performance targets', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    
    // Wait for all remotes to load
    await Promise.all([
      page.waitForSelector('[data-testid="inventory-loaded"]'),
      page.waitForSelector('[data-testid="pos-loaded"]'),
      // ... other solutions
    ])
    
    const loadTime = Date.now() - startTime
    
    // Performance assertions
    expect(loadTime).toBeLessThan(5000) // < 5s total load
    
    const metrics = await page.evaluate(() => window.performanceMetrics)
    expect(metrics.firstContentfulPaint).toBeLessThan(2000) // < 2s FCP
    expect(metrics.largestContentfulPaint).toBeLessThan(2500) // < 2.5s LCP
  })
})
```

### Accessibility Testing

```typescript
test.describe('Accessibility Tests', () => {
  test('should meet WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    // Check for proper heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    expect(headings.length).toBeGreaterThan(0)
    
    // Check for ARIA labels
    const buttonsWithoutLabels = await page.locator('button:not([aria-label]):not([aria-labelledby])').all()
    expect(buttonsWithoutLabels.length).toBe(0)
    
    // Check color contrast
    const violations = await page.locator('[data-contrast-violation]').all()
    expect(violations.length).toBe(0)
  })
})
```

## 🎨 Visual Testing

### Storybook Configuration

#### Component Stories

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/components/ui/button'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants and sizes.'
      }
    }
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Button'
  }
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  )
}
```

### Visual Regression Testing

```typescript
test.describe('Visual Regression Tests', () => {
  test('should match screenshots across viewports', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    // Test different viewports
    const viewports = ['desktop', 'tablet', 'mobile']
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: 1200, height: 800 })
      await expect(page).toHaveScreenshot(`navigation-${viewport}.png`)
    }
  })
})
```

## 🚀 CI/CD Integration

### GitHub Actions Pipeline

Our testing pipeline includes:

1. **Code Quality** - ESLint, TypeScript checking
2. **Unit Tests** - Component, service, and utility testing
3. **Integration Tests** - Module Federation and cross-solution testing
4. **E2E Tests** - Full workflow testing across browsers
5. **Performance Tests** - Load time and resource usage
6. **Security Tests** - Vulnerability scanning
7. **Accessibility Tests** - WCAG compliance
8. **Visual Tests** - Screenshot comparison

### Quality Gates

```yaml
# Deployment Quality Gate
- name: Check test results
  run: |
    if [[ "${{ needs.unit-tests.result }}" == "success" && 
          "${{ needs.integration-tests.result }}" == "success" && 
          "${{ needs.e2e-tests.result }}" == "success" && 
          "${{ needs.security-tests.result }}" == "success" ]]; then
      echo "deploy-ready=true" >> $GITHUB_OUTPUT
    else
      echo "deploy-ready=false" >> $GITHUB_OUTPUT
      exit 1
    fi
```

## 📊 Test Reporting

### Coverage Reports

- **Codecov** - Coverage tracking and visualization
- **HTML Reports** - Detailed coverage breakdown
- **Threshold Enforcement** - Minimum coverage requirements

### Test Results

- **JUnit XML** - Standardized test results
- **JSON Reports** - Machine-readable results
- **HTML Reports** - Human-readable test summaries

### Performance Metrics

- **Lighthouse Scores** - Performance, accessibility, best practices
- **Bundle Size Analysis** - JavaScript bundle optimization
- **Load Time Metrics** - FCP, LCP, FID, CLS

## 🛡️ Security Testing

### Vulnerability Scanning

```bash
# npm audit for dependency vulnerabilities
npm audit --json > audit-report.json

# SAST scanning with Super Linter
- uses: github/super-linter@v5
  env:
    VALIDATE_JAVASCRIPT_ES: true
    VALIDATE_TYPESCRIPT_ES: true
```

### Permission Testing

```typescript
test.describe('Security Tests', () => {
  test('should enforce tenant isolation', async ({ page }) => {
    // Login as tenant A user
    await loginAsUser('tenant-a@example.com')
    
    // Try to access tenant B data
    await page.goto('http://localhost:3000/api/customers?tenant=tenant-b')
    
    // Should be denied access
    await expect(page.locator('[data-testid="access-denied"]')).toBeVisible()
  })
})
```

## ♿ Accessibility Testing

### WCAG 2.1 AA Compliance

- **Keyboard Navigation** - All functionality accessible via keyboard
- **Screen Reader Support** - Proper ARIA labels and descriptions
- **Color Contrast** - Minimum 4.5:1 contrast ratio
- **Focus Management** - Visible focus indicators
- **Semantic HTML** - Proper heading structure and landmarks

### Automated Testing

```typescript
test.describe('Accessibility Tests', () => {
  test('should have proper color contrast', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    // Use axe-core for accessibility testing
    const violations = await page.accessibility.check()
    expect(violations).toHaveLength(0)
  })
})
```

## 🔧 Testing Utilities

### Mock Implementations

```typescript
// Mock Supabase client
export const mockSupabase = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  }))
}
```

### Test Helpers

```typescript
// Common test utilities
export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  tenant_id: 'tenant-1',
  ...overrides
})

export const waitForRemoteLoad = async (page: Page, remoteName: string) => {
  await page.waitForSelector(`[data-testid="${remoteName}-loaded"]`)
}

export const createTestCustomer = async (page: Page, customerData: any) => {
  await page.click('[data-testid="create-customer-btn"]')
  await page.fill('[data-testid="customer-name-input"]', customerData.name)
  await page.fill('[data-testid="customer-email-input"]', customerData.email)
  await page.click('[data-testid="save-customer-btn"]')
  await page.waitForSelector('[data-testid="customer-success-message"]')
}
```

## 📈 Performance Benchmarks

### Load Time Targets

- **Initial Load**: < 5 seconds
- **First Contentful Paint**: < 2 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **First Input Delay**: < 100 milliseconds
- **Cumulative Layout Shift**: < 0.1

### Bundle Size Limits

- **Total Bundle Size**: < 5MB
- **Individual Remote**: < 1MB
- **Shared Dependencies**: Optimized and deduplicated

### Memory Usage

- **Initial Memory**: < 50MB
- **Memory Growth**: < 30% during navigation
- **Memory Leaks**: None detected

## 🎯 Best Practices

### Test Organization

1. **Group related tests** in describe blocks
2. **Use descriptive test names** that explain what is being tested
3. **Follow AAA pattern** (Arrange, Act, Assert)
4. **Keep tests focused** on a single behavior
5. **Use page objects** for E2E tests

### Mock Strategy

1. **Mock external dependencies** (APIs, databases)
2. **Use realistic mock data** that matches production
3. **Avoid over-mocking** - test real behavior when possible
4. **Reset mocks between tests** to prevent test pollution

### Performance Considerations

1. **Run tests in parallel** when possible
2. **Use selective test execution** for development
3. **Optimize test data** to minimize setup time
4. **Cache expensive operations** (database setup, compilation)

### Maintenance

1. **Review test failures** regularly
2. **Update tests when features change**
3. **Remove obsolete tests** promptly
4. **Document complex test scenarios**

## 🚨 Troubleshooting

### Common Issues

#### Flaky Tests

```typescript
// Use proper waiting strategies
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument()
}, { timeout: 5000 })

// Avoid fixed timeouts
// BAD: await page.waitForTimeout(3000)
// GOOD: await page.waitForSelector('[data-testid="ready"]')
```

#### Module Federation Issues

```typescript
// Ensure remotes are loaded before testing
await waitForRemoteLoad(page, 'inventory')
await waitForRemoteLoad(page, 'pos')
```

#### Memory Leaks

```typescript
// Clean up after tests
afterEach(() => {
  vi.clearAllMocks()
  cleanup()
})
```

### Debugging Tips

1. **Use VS Code debugger** for unit tests
2. **Playwright Inspector** for E2E debugging
3. **Network tab** for API call inspection
4. **Console logs** for error tracking
5. **Test reports** for failure analysis

## 📚 Additional Resources

### Documentation

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Storybook Documentation](https://storybook.js.org/)
- [Testing Library](https://testing-library.com/)

### Tools

- [Codecov](https://codecov.io/) - Coverage tracking
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance testing
- [axe-core](https://www.deque.com/axe/) - Accessibility testing
- [MSW](https://mswjs.io/) - API mocking

### Community

- [Testing Library Discord](https://discord.gg/testing-library)
- [Playwright Community](https://github.com/microsoft/playwright/discussions)
- [Storybook Community](https://storybook.js.org/community)

---

## 🎉 Conclusion

This comprehensive testing strategy ensures that the KiTS Hub micro-frontend architecture maintains high quality, reliability, and performance standards. By following these guidelines and best practices, we can deliver a robust and user-friendly enterprise SaaS platform.

Remember: **Good tests are not just about finding bugs - they're about preventing them and enabling confident, rapid development.**
