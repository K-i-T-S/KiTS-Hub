import puppeteer from 'puppeteer';
import fs from 'fs';

const baseUrl = 'http://localhost:3000';

// Viewport sizes to test
const viewports = [
  { name: 'Mobile', width: 375, height: 667 },
  { name: 'Mobile Landscape', width: 667, height: 375 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Tablet Landscape', width: 1024, height: 768 },
  { name: 'Desktop', width: 1920, height: 1080 },
  { name: 'Large Desktop', width: 2560, height: 1440 }
];

// Key pages to test for responsiveness
const pages = [
  '/',
  '/about',
  '/pricing',
  '/contact',
  '/login',
  '/signup',
  '/admin',
  '/analytics',
  '/crm',
  '/pos'
];

async function testResponsive() {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  console.log('🧪 Starting Responsive Design Tests...\n');

  for (const pageUrl of pages) {
    for (const viewport of viewports) {
      const page = await browser.newPage();
      
      try {
        console.log(`Testing: ${pageUrl} on ${viewport.name} (${viewport.width}x${viewport.height})`);
        
        // Set viewport
        await page.setViewport({
          width: viewport.width,
          height: viewport.height,
          isMobile: viewport.width <= 768,
          hasTouch: viewport.width <= 768
        });
        
        // Navigate to page
        const response = await page.goto(`${baseUrl}${pageUrl}`, {
          waitUntil: 'domcontentloaded',
          timeout: 10000
        });

        if (!response || response.status() !== 200) {
          results.failed.push({
            page: pageUrl,
            viewport: viewport.name,
            error: response ? `HTTP ${response.status()}` : 'No response',
            size: `${viewport.width}x${viewport.height}`
          });
          console.log(`  ❌ FAIL - ${response ? `HTTP ${response.status()}` : 'No response'}`);
          await page.close();
          continue;
        }

        // Wait for content to load
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check for responsive issues
        const responsiveChecks = await page.evaluate(() => {
          const checks = {
            horizontalScroll: false,
            overflowElements: [],
            tinyText: false,
            overlappingElements: false,
            brokenLayout: false
          };

          // Check for horizontal scroll
          const bodyWidth = document.body.scrollWidth;
          const viewportWidth = window.innerWidth;
          if (bodyWidth > viewportWidth) {
            checks.horizontalScroll = true;
          }

          // Check for overflow elements
          const allElements = document.querySelectorAll('*');
          allElements.forEach(el => {
            const styles = window.getComputedStyle(el);
            if (styles.overflow === 'auto' || styles.overflow === 'scroll') {
              if (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight) {
                checks.overflowElements.push(el.tagName + (el.className ? '.' + el.className : ''));
              }
            }
          });

          // Check for tiny text
          const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, button');
          textElements.forEach(el => {
            const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
            if (fontSize < 12) {
              checks.tinyText = true;
            }
          });

          // Check for obvious layout breaks
          const header = document.querySelector('header, nav, .header, .navbar');
          if (header) {
            const headerRect = header.getBoundingClientRect();
            if (headerRect.height > 200) { // Unusually tall header
              checks.brokenLayout = true;
            }
          }

          return checks;
        });

        // Take screenshot for visual verification
        const screenshotPath = `/home/casio699/projects/kits-hub/screenshots/${pageUrl.replace(/\//g, '_')}_${viewport.name.replace(/\s+/g, '_')}.png`;
        await page.screenshot({ 
          path: screenshotPath, 
          fullPage: false 
        });

        // Evaluate results
        const issues = [];
        if (responsiveChecks.horizontalScroll) issues.push('Horizontal scroll detected');
        if (responsiveChecks.overflowElements.length > 0) issues.push('Overflow elements: ' + responsiveChecks.overflowElements.join(', '));
        if (responsiveChecks.tinyText) issues.push('Tiny text detected');
        if (responsiveChecks.brokenLayout) issues.push('Broken layout detected');

        if (issues.length === 0) {
          results.passed.push({
            page: pageUrl,
            viewport: viewport.name,
            size: `${viewport.width}x${viewport.height}`,
            screenshot: screenshotPath
          });
          console.log(`  ✅ PASS - Responsive design looks good`);
        } else {
          if (issues.some(issue => issue.includes('Horizontal scroll') || issue.includes('Broken layout'))) {
            results.failed.push({
              page: pageUrl,
              viewport: viewport.name,
              error: issues.join('; '),
              size: `${viewport.width}x${viewport.height}`,
              screenshot: screenshotPath
            });
            console.log(`  ❌ FAIL - ${issues.join('; ')}`);
          } else {
            results.warnings.push({
              page: pageUrl,
              viewport: viewport.name,
              warning: issues.join('; '),
              size: `${viewport.width}x${viewport.height}`,
              screenshot: screenshotPath
            });
            console.log(`  ⚠️  WARNING - ${issues.join('; ')}`);
          }
        }
        
      } catch (error) {
        results.failed.push({
          page: pageUrl,
          viewport: viewport.name,
          error: error.message,
          size: `${viewport.width}x${viewport.height}`
        });
        console.log(`  ❌ FAIL - ${error.message}`);
      } finally {
        await page.close();
      }
    }
  }

  await browser.close();

  // Generate report
  const report = generateResponsiveReport(results);
  fs.writeFileSync('/home/casio699/projects/kits-hub/responsive-test-results.json', JSON.stringify(results, null, 2));
  fs.writeFileSync('/home/casio699/projects/kits-hub/responsive-test-report.md', report);
  
  console.log('\n📊 Responsive Design Tests Complete!');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`📄 Report saved to responsive-test-report.md`);
  console.log(`📸 Screenshots saved to screenshots/ directory`);
  
  return results;
}

function generateResponsiveReport(results) {
  const report = `# KiTS Hub Responsive Design Test Report

Generated: ${new Date().toISOString()}

## Summary
- **Total Tests**: ${results.passed.length + results.warnings.length + results.failed.length}
- **Passed**: ${results.passed.length}
- **Warnings**: ${results.warnings.length}
- **Failed**: ${results.failed.length}
- **Success Rate**: ${((results.passed.length / (results.passed.length + results.warnings.length + results.failed.length)) * 100).toFixed(1)}%

## ✅ Passed Responsive Tests

| Page | Viewport | Size | Screenshot |
|------|----------|------|------------|
${results.passed.map(p => `| ${p.page} | ${p.viewport} | ${p.size} | ${p.screenshot ? '📸' : 'N/A'} |`).join('\n')}

## ⚠️ Responsive Warnings

| Page | Viewport | Size | Warning | Screenshot |
|------|----------|------|---------|------------|
${results.warnings.map(w => `| ${w.page} | ${w.viewport} | ${w.size} | ${w.warning} | ${w.screenshot ? '📸' : 'N/A'} |`).join('\n')}

## ❌ Failed Responsive Tests

| Page | Viewport | Size | Error | Screenshot |
|------|----------|------|-------|------------|
${results.failed.map(f => `| ${f.page} | ${f.viewport} | ${f.size} | ${f.error} | ${f.screenshot ? '📸' : 'N/A'} |`).join('\n')}

## Viewport Analysis

### Performance by Viewport:
${Object.entries(results.passed.reduce((acc, p) => {
  acc[p.viewport] = (acc[p.viewport] || 0) + 1;
  return acc;
}, {})).map(([viewport, count]) => `- ${viewport}: ${count} passed`).join('\n')}

### Issues by Viewport:
${Object.entries([...results.failed, ...results.warnings].reduce((acc, r) => {
  acc[r.viewport] = (acc[r.viewport] || 0) + 1;
  return acc;
}, {})).map(([viewport, count]) => `- ${viewport}: ${count} issues`).join('\n')}

### Most Problematic Pages:
${Object.entries([...results.failed, ...results.warnings].reduce((acc, r) => {
  acc[r.page] = (acc[r.page] || 0) + 1;
  return acc;
}, {})).map(([page, count]) => `- ${page}: ${count} issues`).join('\n')}

## Recommendations

${results.failed.length > 0 ? `
### Critical Responsive Issues
${results.failed.map(f => `- ${f.page} on ${f.viewport}: ${f.error}`).join('\n')}
` : ''}

${results.warnings.length > 0 ? `
### Minor Responsive Improvements
${results.warnings.map(w => `- ${w.page} on ${w.viewport}: ${w.warning}`).join('\n')}
` : ''}

### General Responsive Best Practices
- Implement proper mobile-first design
- Use flexible grid systems (CSS Grid, Flexbox)
- Ensure touch targets are at least 44px on mobile
- Test on real devices, not just emulation
- Implement proper breakpoints for different screen sizes
- Use responsive images and media queries

---

*This report was generated automatically by the responsive design test suite.*
`;

  return report;
}

// Create screenshots directory
if (!fs.existsSync('/home/casio699/projects/kits-hub/screenshots')) {
  fs.mkdirSync('/home/casio699/projects/kits-hub/screenshots');
}

// Run the tests
testResponsive().catch(console.error);
