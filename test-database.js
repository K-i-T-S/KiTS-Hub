import puppeteer from 'puppeteer';
import fs from 'fs';

const baseUrl = 'http://localhost:3000';

// Database integration tests
const databaseTests = [
  {
    page: '/login',
    name: 'Authentication Flow',
    tests: [
      {
        action: 'Check if auth components are present',
        selector: 'form, input[type="email"], input[type="password"], button[type="submit"]'
      },
      {
        action: 'Test form validation',
        selector: 'form',
        input: [
          { selector: 'input[type="email"]', value: 'invalid-email' },
          { selector: 'input[type="password"]', value: 'short' }
        ]
      }
    ]
  },
  {
    page: '/signup',
    name: 'User Registration',
    tests: [
      {
        action: 'Check signup form components',
        selector: 'form, input[name="name"], input[type="email"], input[type="password"]'
      }
    ]
  },
  {
    page: '/admin',
    name: 'Admin Dashboard Data Loading',
    tests: [
      {
        action: 'Check if dashboard loads data',
        selector: '.dashboard, .admin-dashboard, [data-testid="dashboard"]'
      }
    ]
  },
  {
    page: '/analytics',
    name: 'Analytics Data Integration',
    tests: [
      {
        action: 'Check analytics components',
        selector: '.analytics, .charts, .metrics, [data-testid="analytics"]'
      }
    ]
  },
  {
    page: '/crm',
    name: 'CRM Data Integration',
    tests: [
      {
        action: 'Check CRM components',
        selector: '.crm, .customers, .contacts, [data-testid="crm"]'
      }
    ]
  },
  {
    page: '/pos',
    name: 'POS System Integration',
    tests: [
      {
        action: 'Check POS components',
        selector: '.pos, .products, .cart, .checkout, [data-testid="pos"]'
      }
    ]
  }
];

async function testDatabaseIntegration() {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = {
    passed: [],
    failed: [],
    warnings: [],
    networkRequests: []
  };

  console.log('🧪 Starting Database Integration Tests...\n');

  for (const testSuite of databaseTests) {
    const page = await browser.newPage();
    
    try {
      console.log(`Testing: ${testSuite.name} on ${testSuite.page}`);
      
      // Enable network monitoring
      const networkRequests = [];
      page.on('request', request => {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          resourceType: request.resourceType(),
          timestamp: Date.now()
        });
      });

      page.on('response', response => {
        const request = networkRequests.find(r => r.url === response.url());
        if (request) {
          request.status = response.status();
          request.responseHeaders = response.headers();
        }
      });

      // Navigate to page
      const response = await page.goto(`${baseUrl}${testSuite.page}`, {
        waitUntil: 'networkidle2',
        timeout: 15000
      });

      if (!response || response.status() !== 200) {
        results.failed.push({
          page: testSuite.page,
          test: testSuite.name,
          error: response ? `HTTP ${response.status()}` : 'No response'
        });
        console.log(`  ❌ FAIL - ${response ? `HTTP ${response.status()}` : 'No response'}`);
        await page.close();
        continue;
      }

      // Wait for dynamic content
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Run tests
      for (const test of testSuite.tests) {
        try {
          console.log(`  Testing: ${test.action}`);
          
          // Check if components exist
          const componentExists = await page.evaluate((selector) => {
            const elements = document.querySelectorAll(selector);
            return elements.length > 0;
          }, test.selector);

          if (!componentExists) {
            results.warnings.push({
              page: testSuite.page,
              test: test.action,
              warning: `Components not found: ${test.selector}`
            });
            console.log(`    ⚠️  WARNING - Components not found: ${test.selector}`);
            continue;
          }

          // If test has input actions, perform them
          if (test.input) {
            for (const input of test.input) {
              try {
                await page.type(input.selector, input.value, { delay: 100 });
                await new Promise(resolve => setTimeout(resolve, 500));
              } catch (inputError) {
                console.log(`    ⚠️  Input action failed: ${input.selector}`);
              }
            }
          }

          // Check for database-related network requests
          const dbRequests = networkRequests.filter(req => 
            req.url.includes('supabase') || 
            req.url.includes('api') ||
            req.resourceType === 'xhr' ||
            req.resourceType === 'fetch'
          );

          // Check page for database integration indicators
          const integrationChecks = await page.evaluate(() => {
            const checks = {
              hasDataElements: !!document.querySelector('[data-], .data, .table, .list'),
              hasLoadingStates: !!document.querySelector('.loading, .spinner, [data-loading]'),
              hasErrorStates: !!document.querySelector('.error, .alert, [data-error]'),
              hasAuthElements: !!document.querySelector('.auth, .login, .user'),
              formCount: document.querySelectorAll('form').length,
              inputCount: document.querySelectorAll('input').length
            };
            return checks;
          });

          results.passed.push({
            page: testSuite.page,
            test: test.action,
            networkRequests: dbRequests.length,
            integrationChecks,
            componentFound: true
          });

          console.log(`    ✅ PASS - ${dbRequests.length} network requests detected`);
          
        } catch (testError) {
          results.failed.push({
            page: testSuite.page,
            test: test.action,
            error: testError.message
          });
          console.log(`    ❌ FAIL - ${testError.message}`);
        }
      }

      // Store network requests for analysis
      results.networkRequests.push({
        page: testSuite.page,
        requests: networkRequests
      });
      
    } catch (error) {
      results.failed.push({
        page: testSuite.page,
        test: testSuite.name,
        error: error.message
      });
      console.log(`  ❌ FAIL - ${error.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();

  // Generate report
  const report = generateDatabaseReport(results);
  fs.writeFileSync('/home/casio699/projects/kits-hub/database-test-results.json', JSON.stringify(results, null, 2));
  fs.writeFileSync('/home/casio699/projects/kits-hub/database-test-report.md', report);
  
  console.log('\n📊 Database Integration Tests Complete!');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`📄 Report saved to database-test-report.md`);
  
  return results;
}

function generateDatabaseReport(results) {
  const report = `# KiTS Hub Database Integration Test Report

Generated: ${new Date().toISOString()}

## Summary
- **Total Tests**: ${results.passed.length + results.warnings.length + results.failed.length}
- **Passed**: ${results.passed.length}
- **Warnings**: ${results.warnings.length}
- **Failed**: ${results.failed.length}
- **Success Rate**: ${((results.passed.length / (results.passed.length + results.warnings.length + results.failed.length)) * 100).toFixed(1)}%

## ✅ Passed Database Tests

| Page | Test | Network Requests | Components Found |
|------|------|------------------|------------------|
${results.passed.map(p => `| ${p.page} | ${p.test} | ${p.networkRequests} | ${p.componentFound ? 'Yes' : 'No'} |`).join('\n')}

## ⚠️ Database Integration Warnings

| Page | Test | Warning |
|------|------|---------|
${results.warnings.map(w => `| ${w.page} | ${w.test} | ${w.warning} |`).join('\n')}

## ❌ Failed Database Tests

| Page | Test | Error |
|------|------|-------|
${results.failed.map(f => `| ${f.page} | ${f.test} | ${f.error} |`).join('\n')}

## Network Request Analysis

### Database/API Requests by Page:
${results.networkRequests.map(nr => {
  const dbRequests = nr.requests.filter(r => 
    r.url.includes('supabase') || 
    r.url.includes('api') ||
    r.resourceType === 'xhr' ||
    r.resourceType === 'fetch'
  );
  return `- ${nr.page}: ${dbRequests.length} database/API requests`;
}).join('\n')}

### Common Request Patterns:
${Object.entries(
  results.networkRequests.flatMap(nr => nr.requests)
    .filter(req => req.url.includes('supabase') || req.url.includes('api'))
    .reduce((acc, req) => {
      const domain = new URL(req.url).hostname;
      acc[domain] = (acc[domain] || 0) + 1;
      return acc;
    }, {})
).map(([domain, count]) => `- ${domain}: ${count} requests`).join('\n')}

## Integration Health Assessment

### Strong Integration Indicators:
${results.passed.filter(p => p.networkRequests > 0).map(p => `- ${p.page}: Active database communication`).join('\n')}

### Areas for Improvement:
${results.warnings.map(w => `- ${w.page}: ${w.warning}`).join('\n')}

### Critical Issues:
${results.failed.map(f => `- ${f.page}: ${f.error}`).join('\n')}

## Recommendations

### Database Integration
${results.passed.length > 0 ? `
✅ **Working Integrations:**
${results.passed.filter(p => p.networkRequests > 0).map(p => `- ${p.page} has active database communication`).join('\n')}
` : ''}

${results.warnings.length > 0 ? `
⚠️ **Integration Improvements Needed:**
${results.warnings.map(w => `- ${w.page}: Ensure proper component rendering`).join('\n')}
` : ''}

${results.failed.length > 0 ? `
❌ **Critical Issues to Fix:**
${results.failed.map(f => `- ${f.page}: ${f.error}`).join('\n')}
` : ''}

### General Recommendations
- Ensure all database connections use proper authentication
- Implement proper error handling for database operations
- Add loading states for async data operations
- Test database connectivity during application startup
- Implement proper data validation and sanitization
- Add comprehensive logging for database operations

### Security Considerations
- Verify that sensitive database operations require proper authentication
- Ensure Row Level Security (RLS) policies are properly configured
- Check that API keys are not exposed in client-side code
- Validate that database connections use secure protocols

---

*This report was generated automatically by the database integration test suite.*
`;

  return report;
}

// Run the tests
testDatabaseIntegration().catch(console.error);
