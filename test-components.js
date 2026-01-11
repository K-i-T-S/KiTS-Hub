import puppeteer from 'puppeteer';
import fs from 'fs';

const baseUrl = 'http://localhost:3000';

// Component tests to run on specific pages
const componentTests = [
  {
    page: '/login',
    tests: [
      {
        name: 'Login Form',
        selector: 'form',
        actions: [
          { type: 'type', selector: 'input[type="email"]', value: 'test@example.com' },
          { type: 'type', selector: 'input[type="password"]', value: 'testpassword123' },
          { type: 'click', selector: 'button[type="submit"]' }
        ],
        expected: 'Form submission should work'
      }
    ]
  },
  {
    page: '/signup',
    tests: [
      {
        name: 'Signup Form',
        selector: 'form',
        actions: [
          { type: 'type', selector: 'input[name="name"]', value: 'Test User' },
          { type: 'type', selector: 'input[type="email"]', value: 'test@example.com' },
          { type: 'type', selector: 'input[type="password"]', value: 'testpassword123' },
          { type: 'click', selector: 'button[type="submit"]' }
        ],
        expected: 'Form submission should work'
      }
    ]
  },
  {
    page: '/pricing',
    tests: [
      {
        name: 'Pricing Cards',
        selector: '.pricing-card, [data-testid*="pricing"], .card',
        actions: [
          { type: 'hover', selector: '.pricing-card, [data-testid*="pricing"], .card' }
        ],
        expected: 'Pricing cards should be interactive'
      }
    ]
  },
  {
    page: '/contact',
    tests: [
      {
        name: 'Contact Form',
        selector: 'form',
        actions: [
          { type: 'type', selector: 'input[name="name"]', value: 'Test Contact' },
          { type: 'type', selector: 'input[type="email"]', value: 'contact@example.com' },
          { type: 'type', selector: 'textarea', value: 'Test message content' },
          { type: 'click', selector: 'button[type="submit"]' }
        ],
        expected: 'Contact form should be functional'
      }
    ]
  },
  {
    page: '/search',
    tests: [
      {
        name: 'Search Input',
        selector: 'input[type="search"], input[placeholder*="search"]',
        actions: [
          { type: 'type', selector: 'input[type="search"], input[placeholder*="search"]', value: 'test search' }
        ],
        expected: 'Search input should accept text'
      }
    ]
  }
];

async function testComponents() {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = {
    passed: [],
    failed: [],
    totalTime: 0
  };

  console.log('🧪 Starting Component Interaction Tests...\n');

  for (const pageTest of componentTests) {
    const page = await browser.newPage();
    
    try {
      console.log(`Testing components on: ${pageTest.page}`);
      
      // Navigate to page
      await page.goto(`${baseUrl}${pageTest.page}`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });

      // Wait a bit for any dynamic content
      await new Promise(resolve => setTimeout(resolve, 1000));

      for (const test of pageTest.tests) {
        const startTime = Date.now();
        
        try {
          console.log(`  Testing: ${test.name}`);
          
          // Check if component exists
          const componentExists = await page.evaluate((selector) => {
            return document.querySelector(selector) !== null;
          }, test.selector);
          
          if (!componentExists) {
            results.failed.push({
              page: pageTest.page,
              test: test.name,
              error: `Component not found: ${test.selector}`,
              loadTime: Date.now() - startTime
            });
            console.log(`    ❌ FAIL - Component not found: ${test.selector}`);
            continue;
          }

          // Run actions
          for (const action of test.actions) {
            try {
              switch (action.type) {
                case 'type':
                  await page.type(action.selector, action.value, { delay: 100 });
                  break;
                case 'click':
                  await page.click(action.selector);
                  break;
                case 'hover':
                  await page.hover(action.selector);
                  break;
              }
              
              // Small delay between actions
              await new Promise(resolve => setTimeout(resolve, 200));
            } catch (actionError) {
              console.log(`    ⚠️  Action failed: ${action.type} on ${action.selector}`);
            }
          }

          const testTime = Date.now() - startTime;
          
          results.passed.push({
            page: pageTest.page,
            test: test.name,
            loadTime: testTime,
            expected: test.expected
          });
          
          console.log(`    ✅ PASS - ${testTime}ms`);
          
        } catch (testError) {
          results.failed.push({
            page: pageTest.page,
            test: test.name,
            error: testError.message,
            loadTime: Date.now() - startTime
          });
          console.log(`    ❌ FAIL - ${testError.message}`);
        }
      }
      
    } catch (pageError) {
      results.failed.push({
        page: pageTest.page,
        test: 'Page Load',
        error: pageError.message,
        loadTime: 0
      });
      console.log(`  ❌ FAIL - Page load error: ${pageError.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();

  // Generate report
  const report = generateComponentReport(results);
  fs.writeFileSync('/home/casio699/projects/kits-hub/component-test-results.json', JSON.stringify(results, null, 2));
  fs.writeFileSync('/home/casio699/projects/kits-hub/component-test-report.md', report);
  
  console.log('\n📊 Component Tests Complete!');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`📄 Report saved to component-test-report.md`);
  
  return results;
}

function generateComponentReport(results) {
  const report = `# KiTS Hub Component Interaction Test Report

Generated: ${new Date().toISOString()}

## Summary
- **Total Component Tests**: ${results.passed.length + results.failed.length}
- **Passed**: ${results.passed.length}
- **Failed**: ${results.failed.length}
- **Success Rate**: ${((results.passed.length / (results.passed.length + results.failed.length)) * 100).toFixed(1)}%

## ✅ Passed Component Tests

| Page | Component | Load Time | Expected |
|------|-----------|-----------|----------|
${results.passed.map(p => `| ${p.page} | ${p.test} | ${p.loadTime}ms | ${p.expected} |`).join('\n')}

## ❌ Failed Component Tests

| Page | Component | Error | Load Time |
|------|-----------|-------|-----------|
${results.failed.map(f => `| ${f.page} | ${f.test} | ${f.error} | ${f.loadTime}ms |`).join('\n')}

## Performance Analysis

### Average Component Test Time: ${results.passed.length > 0 ? (results.passed.reduce((sum, p) => sum + p.loadTime, 0) / results.passed.length).toFixed(0) : 0}ms

### Issues by Page:
${Object.entries(results.failed.reduce((acc, f) => {
  acc[f.page] = (acc[f.page] || 0) + 1;
  return acc;
}, {})).map(([page, count]) => `- ${page}: ${count} failed tests`).join('\n')}

## Recommendations

${results.failed.length > 0 ? `
### Fix Component Issues
${results.failed.map(f => `- ${f.page} - ${f.test}: ${f.error}`).join('\n')}
` : ''}

### Component Testing Coverage
- Consider adding more comprehensive form validation tests
- Test error states and edge cases
- Add accessibility testing for components
- Test component responsiveness

---

*This report was generated automatically by the component interaction test suite.*
`;

  return report;
}

// Run the tests
testComponents().catch(console.error);
