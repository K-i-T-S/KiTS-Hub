# KiTS Hub Testing Suite

This comprehensive testing suite provides complete coverage for the KiTS Hub multi-tenant SaaS platform, ensuring reliability, security, and performance across all solutions.

## 🏗️ Testing Architecture

### Testing Pyramid
```
    /\
   /  \  E2E Tests (5%)
  /    \-----------------------
 /        \ Integration Tests (15%)
/          \---------------------
 Unit Tests (80%)
```

## 📁 Directory Structure

```
shared/testing/
├── test-utils/
│   ├── factories.ts          # Test data factories
│   ├── mocks.ts              # Mock utilities
│   └── test-helpers.ts       # Common test helpers
├── integration/
│   ├── test-database.ts      # Database setup and management
│   └── api-tests.ts          # API integration tests
├── e2e/
│   ├── playwright.config.ts   # Playwright configuration
│   ├── global-setup.ts       # Global test setup
│   ├── global-teardown.ts    # Global test cleanup
│   └── user-journeys.spec.ts # E2E user journey tests
├── performance/
│   ├── load-testing.ts       # Load testing with k6
│   └── database-performance.ts # Database performance tests
├── security/
│   └── security-tests.ts     # Security vulnerability tests
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Playwright browsers
- k6 (for load testing)

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Install k6 (Ubuntu/Debian)
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Environment Setup

Create a `.env.test` file:
```env
TEST_SUPABASE_URL=http://localhost:54321
TEST_SUPABASE_ANON_KEY=test-anon-key
TEST_SUPABASE_SERVICE_KEY=test-service-key
E2E_BASE_URL=http://localhost:3000
```

## 🧪 Test Types

### 1. Unit Tests
Fast, isolated tests for individual components and functions.

**Tools**: Vitest, React Testing Library, Jest

**Coverage Requirements**:
- 90% line coverage minimum
- 100% coverage for authentication and authorization
- 100% coverage for tenant isolation logic

**Running Unit Tests**:
```bash
# Run all unit tests
npm run test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### 2. Integration Tests
Tests for API endpoints, database operations, and cross-component interactions.

**Features**:
- Isolated test database environments
- Multi-tenant data isolation testing
- API contract validation
- Webhook testing

**Running Integration Tests**:
```bash
npm run test:integration
```

### 3. End-to-End Tests
Complete user journey tests across all solutions.

**Tools**: Playwright

**Coverage**:
- Tenant onboarding flows
- Multi-solution workflows
- Mobile responsive testing
- Cross-browser compatibility

**Running E2E Tests**:
```bash
# Run all E2E tests
npm run test:e2e

# Run specific browser
npm run test:e2e:chromium

# Run with UI
npm run test:e2e:ui

# Run mobile tests
npm run test:e2e:mobile
```

### 4. Performance Tests
Load testing and performance monitoring.

**Tools**: k6, custom performance metrics

**Scenarios**:
- Load testing (ramp-up to 200 users)
- Stress testing (peak load scenarios)
- Spike testing (sudden traffic increases)
- Database performance testing

**Running Performance Tests**:
```bash
# Load testing
k6 run shared/testing/performance/load-testing.ts

# Database performance
npm run test:performance:db

# Stress test
k6 run --stressed-out shared/testing/performance/load-testing.ts
```

### 5. Security Tests
Comprehensive security vulnerability testing.

**Coverage**:
- Authentication and authorization
- Input validation (XSS, SQL injection)
- Tenant isolation security
- Data privacy (GDPR)
- API security headers
- File upload security

**Running Security Tests**:
```bash
npm run test:security
```

### 6. Accessibility Tests
WCAG 2.1 AA compliance testing.

**Tools**: axe-playwright

**Running Accessibility Tests**:
```bash
npm run test:accessibility
```

### 7. Visual Regression Tests
UI consistency and visual testing.

**Tools**: Playwright visual comparison

**Running Visual Tests**:
```bash
npm run test:visual
```

## 📊 Test Data Management

### Data Factories
Use the `TestDataFactory` class to generate realistic test data:

```typescript
import { TestDataFactory } from '../shared/testing/test-utils/factories';

// Create test tenant
const tenant = TestDataFactory.createTenant({
  name: 'Test Company',
  plan_type: 'professional'
});

// Create test scenario
const scenario = TestDataFactory.createInventoryScenario(50);
```

### Database Management
The `TestDatabaseFactory` manages isolated test environments:

```typescript
import { TestDatabaseFactory } from '../shared/testing/integration/test-database';

// Setup test environment
await TestDatabaseFactory.setupTest('my-test', 'full');

// Cleanup test data
await TestDatabaseFactory.cleanupTest('my-test');
```

## 🔧 Configuration

### Vitest Configuration
Located in `vitest.config.ts`:
- 90% coverage thresholds
- jsdom environment
- Comprehensive exclusions

### Playwright Configuration
Located in `shared/testing/e2e/playwright.config.ts`:
- Multi-browser testing (Chrome, Firefox, Safari)
- Mobile and tablet testing
- Dark mode and high contrast testing
- Video and screenshot capture on failure

### CI/CD Integration
Automated testing pipeline in `.github/workflows/testing-pipeline.yml`:
- Parallel test execution
- Quality gates for deployment
- Comprehensive reporting
- Failure notifications

## 📈 Test Reports

### Coverage Reports
Generated in `coverage/` directory:
- HTML report for detailed viewing
- JSON report for CI/CD integration
- Text summary for quick overview

### E2E Reports
Generated in `playwright-report/`:
- HTML report with screenshots
- Test execution timeline
- Error details and stack traces

### Performance Reports
Generated as JSON files:
- Response time metrics
- Error rates
- Throughput measurements

### Security Reports
Comprehensive security analysis:
- Vulnerability scan results
- Compliance checks
- Risk assessment

## 🎯 Best Practices

### Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests focused and independent

### Data Management
- Use factories for test data
- Clean up data after each test
- Avoid hard-coded test values
- Use realistic data scenarios

### Performance
- Use appropriate wait strategies
- Avoid unnecessary sleeps
- Mock external dependencies
- Run tests in parallel when possible

### Security
- Test for common vulnerabilities
- Validate input sanitization
- Test authentication flows
- Verify data isolation

## 🚨 Troubleshooting

### Common Issues

1. **Test Database Connection**
   ```bash
   # Check PostgreSQL is running
   pg_isready -h localhost -p 5432
   
   # Reset test database
   npm run test:db:reset
   ```

2. **Playwright Browser Issues**
   ```bash
   # Reinstall browsers
   npx playwright install --force
   
   # Clear browser cache
   npx playwright install-deps
   ```

3. **Performance Test Failures**
   ```bash
   # Check system resources
   k6 run --vus 10 --duration 30s shared/testing/performance/load-testing.ts
   
   # Monitor database performance
   npm run test:performance:monitor
   ```

4. **Memory Issues**
   ```bash
   # Increase Node.js memory limit
   NODE_OPTIONS="--max-old-space-size=4096" npm run test
   
   # Run tests with garbage collection
   node --expose-gc node_modules/.bin/vitest
   ```

### Debug Mode

Enable debug logging:
```bash
# Vitest debug
DEBUG=vitest:* npm run test

# Playwright debug
DEBUG=pw:* npm run test:e2e

# k6 debug
k6 run --vus 1 --duration 10s shared/testing/performance/load-testing.ts
```

## 📚 Additional Resources

### Documentation
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [k6 Documentation](https://k6.io/)
- [Testing Library Documentation](https://testing-library.com/)

### Guides
- [Multi-tenant Testing Strategies](./docs/multi-tenant-testing.md)
- [Performance Testing Best Practices](./docs/performance-testing.md)
- [Security Testing Checklist](./docs/security-testing.md)

### Examples
- [Component Testing Examples](./examples/component-testing/)
- [API Testing Examples](./examples/api-testing/)
- [E2E Testing Examples](./examples/e2e-testing/)

## 🤝 Contributing

When adding new tests:
1. Follow existing patterns and conventions
2. Ensure proper test data management
3. Add appropriate coverage
4. Update documentation
5. Verify CI/CD pipeline passes

## 📞 Support

For testing-related questions:
- Check the troubleshooting guide
- Review existing test examples
- Consult the team testing channel
- Create an issue with detailed information

---

*Last updated: January 2026*
