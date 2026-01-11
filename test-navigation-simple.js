import puppeteer from 'puppeteer';
import fs from 'fs';

const baseUrl = 'http://localhost:3000';

// All pages to test based on the directory structure
const pages = [
  '/',
  '/about',
  '/accounting',
  '/admin',
  '/admin/dashboard',
  '/admin/settings',
  '/admin/users',
  '/analytics',
  '/blog',
  '/careers',
  '/community',
  '/compliance',
  '/contact',
  '/cookies',
  '/crm',
  '/demo',
  '/docs',
  '/forgot-password',
  '/hr',
  '/integrations',
  '/login',
  '/onboarding',
  '/onboarding/step-1',
  '/partners',
  '/pos',
  '/press',
  '/pricing',
  '/privacy',
  '/queue-status',
  '/resources',
  '/search',
  '/security',
  '/signup',
  '/terms',
  '/tutorials',
  '/webinars'
];

async function testNavigation() {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = {
    passed: [],
    failed: [],
    totalTime: 0
  };

  console.log('🧪 Starting Navigation Tests...\n');

  for (const route of pages) {
    const page = await browser.newPage();
    
    try {
      const startTime = Date.now();
      
      console.log(`Testing: ${route}`);
      
      // Navigate to page
      const response = await page.goto(`${baseUrl}${route}`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });

      const loadTime = Date.now() - startTime;
      
      // Check if page loaded successfully
      if (response && response.status() === 200) {
        // Check for common error indicators using proper selectors
        const hasError = await page.evaluate(() => {
          const bodyText = document.body.innerText.toLowerCase();
          const errorIndicators = [
            '404',
            'page not found',
            'internal server error',
            'something went wrong'
          ];
          
          return errorIndicators.some(indicator => bodyText.includes(indicator));
        });

        if (!hasError) {
          // Get page title
          const title = await page.title();
          
          results.passed.push({
            route,
            status: response.status(),
            loadTime,
            title
          });
          
          console.log(`  ✅ PASS - ${response.status()} - ${loadTime}ms - ${title}`);
        } else {
          results.failed.push({
            route,
            status: response.status(),
            error: 'Error content detected',
            loadTime
          });
          console.log(`  ❌ FAIL - Error content detected`);
        }
      } else {
        results.failed.push({
          route,
          status: response?.status() || 'No response',
          error: response ? `HTTP ${response.status()}` : 'No response',
          loadTime
        });
        console.log(`  ❌ FAIL - ${response ? `HTTP ${response.status()}` : 'No response'}`);
      }
      
    } catch (error) {
      results.failed.push({
        route,
        error: error.message,
        loadTime: 0
      });
      console.log(`  ❌ FAIL - ${error.message}`);
    } finally {
      await page.close();
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  await browser.close();

  // Generate report
  const report = generateReport(results);
  fs.writeFileSync('/home/casio699/projects/kits-hub/navigation-test-results.json', JSON.stringify(results, null, 2));
  fs.writeFileSync('/home/casio699/projects/kits-hub/navigation-test-report.md', report);
  
  console.log('\n📊 Test Complete!');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`📄 Report saved to navigation-test-report.md`);
  
  return results;
}

function generateReport(results) {
  const report = `# KiTS Hub Navigation Test Report

Generated: ${new Date().toISOString()}

## Summary
- **Total Pages Tested**: ${results.passed.length + results.failed.length}
- **Passed**: ${results.passed.length}
- **Failed**: ${results.failed.length}
- **Success Rate**: ${((results.passed.length / (results.passed.length + results.failed.length)) * 100).toFixed(1)}%

## ✅ Passed Pages

| Route | Status | Load Time | Title |
|-------|--------|-----------|-------|
${results.passed.map(p => `| ${p.route} | ${p.status} | ${p.loadTime}ms | ${p.title} |`).join('\n')}

## ❌ Failed Pages

| Route | Error | Load Time |
|-------|-------|-----------|
${results.failed.map(f => `| ${f.route} | ${f.error} | ${f.loadTime}ms |`).join('\n')}

## Performance Analysis

### Average Load Time: ${results.passed.length > 0 ? (results.passed.reduce((sum, p) => sum + p.loadTime, 0) / results.passed.length).toFixed(0) : 0}ms

### Slowest Pages:
${results.passed.sort((a, b) => b.loadTime - a.loadTime).slice(0, 5).map(p => `- ${p.route}: ${p.loadTime}ms`).join('\n')}

### Fastest Pages:
${results.passed.sort((a, b) => a.loadTime - b.loadTime).slice(0, 5).map(p => `- ${p.route}: ${p.loadTime}ms`).join('\n')}

## Recommendations

${results.failed.length > 0 ? `
### Fix Failed Pages
${results.failed.map(f => `- ${f.route}: ${f.error}`).join('\n')}
` : ''}

${results.passed.some(p => p.loadTime > 3000) ? `
### Performance Optimization
${results.passed.filter(p => p.loadTime > 3000).map(p => `- ${p.route}: Consider optimizing (currently ${p.loadTime}ms)`).join('\n')}
` : ''}

---

*This report was generated automatically by the navigation test suite.*
`;

  return report;
}

// Run the tests
testNavigation().catch(console.error);
