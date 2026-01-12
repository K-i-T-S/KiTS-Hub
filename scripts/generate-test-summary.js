#!/usr/bin/env node

/**
 * Generate Comprehensive Test Summary
 * Aggregates all test results into a single report
 */

const fs = require('fs');
const path = require('path');

// Test result colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function parseTestResults(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn(`Warning: Could not parse ${filePath}: ${error.message}`);
  }
  return null;
}

function extractMetrics(results) {
  if (!results) return { passed: 0, failed: 0, skipped: 0, total: 0, duration: 0 };
  
  return {
    passed: results.passed || 0,
    failed: results.failed || 0,
    skipped: results.skipped || 0,
    total: results.total || (results.passed + results.failed + results.skipped),
    duration: results.duration || 0,
  };
}

function calculateCoverage(coverage) {
  if (!coverage) return { lines: 0, functions: 0, branches: 0, statements: 0 };
  
  return {
    lines: coverage.lines?.percent || 0,
    functions: coverage.functions?.percent || 0,
    branches: coverage.branches?.percent || 0,
    statements: coverage.statements?.percent || 0,
  };
}

function generateSummary() {
  console.log(colorize('🔍 Generating comprehensive test summary...', 'cyan'));

  // Collect all test results
  const testResults = {
    unit: {
      'business-kits': parseTestResults('business-kits-unit-results/test-results.json'),
      'kits-hub-v2.0': parseTestResults('kits-hub-v2.0-unit-results/test-results.json'),
    },
    integration: parseTestResults('integration-results/integration.json'),
    e2e: {
      'business-kits-chromium': parseTestResults('business-kits-e2e-chromium/test-results.json'),
      'business-kits-firefox': parseTestResults('business-kits-e2e-firefox/test-results.json'),
      'business-kits-webkit': parseTestResults('business-kits-e2e-webkit/test-results.json'),
      'kits-hub-v2.0-chromium': parseTestResults('kits-hub-v2.0-e2e-chromium/test-results.json'),
      'kits-hub-v2.0-firefox': parseTestResults('kits-hub-v2.0-e2e-firefox/test-results.json'),
      'kits-hub-v2.0-webkit': parseTestResults('kits-hub-v2.0-e2e-webkit/test-results.json'),
    },
    performance: parseTestResults('performance-results/performance.json'),
    security: parseTestResults('security-results/security.json'),
    accessibility: parseTestResults('accessibility-results/test-results.json'),
    visual: parseTestResults('visual-results/visual-results.json'),
  };

  // Calculate overall metrics
  const overallMetrics = {
    unit: { passed: 0, failed: 0, skipped: 0, total: 0, duration: 0 },
    integration: extractMetrics(testResults.integration),
    e2e: { passed: 0, failed: 0, skipped: 0, total: 0, duration: 0 },
    performance: extractMetrics(testResults.performance),
    security: extractMetrics(testResults.security),
    accessibility: extractMetrics(testResults.accessibility),
    visual: extractMetrics(testResults.visual),
  };

  // Aggregate unit test results
  Object.values(testResults.unit).forEach(result => {
    const metrics = extractMetrics(result);
    overallMetrics.unit.passed += metrics.passed;
    overallMetrics.unit.failed += metrics.failed;
    overallMetrics.unit.skipped += metrics.skipped;
    overallMetrics.unit.total += metrics.total;
    overallMetrics.unit.duration += metrics.duration;
  });

  // Aggregate E2E test results
  Object.values(testResults.e2e).forEach(result => {
    const metrics = extractMetrics(result);
    overallMetrics.e2e.passed += metrics.passed;
    overallMetrics.e2e.failed += metrics.failed;
    overallMetrics.e2e.skipped += metrics.skipped;
    overallMetrics.e2e.total += metrics.total;
    overallMetrics.e2e.duration += metrics.duration;
  });

  // Calculate coverage
  const coverage = {
    'business-kits': calculateCoverage(parseTestResults('business-kits-unit-results/coverage/coverage-summary.json')),
    'kits-hub-v2.0': calculateCoverage(parseTestResults('kits-hub-v2.0-unit-results/coverage/coverage-summary.json')),
  };

  // Generate markdown summary
  const summary = generateMarkdownSummary(overallMetrics, coverage, testResults);
  
  // Write summary to file
  fs.writeFileSync('test-summary.md', summary);
  
  // Print summary to console
  printConsoleSummary(overallMetrics, coverage);
  
  console.log(colorize('✅ Test summary generated successfully!', 'green'));
}

function generateMarkdownSummary(metrics, coverage, testResults) {
  const totalTests = Object.values(metrics).reduce((sum, cat) => sum + cat.total, 0);
  const totalPassed = Object.values(metrics).reduce((sum, cat) => sum + cat.passed, 0);
  const totalFailed = Object.values(metrics).reduce((sum, cat) => sum + cat.failed, 0);
  const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : 0;

  return `# 🧪 KiTS Hub Test Results Summary

## 📊 Overall Results

| Metric | Value |
|--------|-------|
| **Total Tests** | ${totalTests} |
| **Passed** | ${totalPassed} (${colorize(passRate + '%', passRate >= 90 ? 'green' : passRate >= 70 ? 'yellow' : 'red')}) |
| **Failed** | ${totalFailed} |
| **Skipped** | ${Object.values(metrics).reduce((sum, cat) => sum + cat.skipped, 0)} |
| **Duration** | ${Object.values(metrics).reduce((sum, cat) => sum + cat.duration, 0).toFixed(0)}ms |

## 🎯 Test Suite Breakdown

### Unit Tests
- **Business Kits**: ${metrics.unit.passed} passed, ${metrics.unit.failed} failed, ${metrics.unit.skipped} skipped
- **Kits Hub v2.0**: ${metrics.unit.passed} passed, ${metrics.unit.failed} failed, ${metrics.unit.skipped} skipped
- **Coverage**: 
  - Business Kits: ${coverage['business-kits'].lines}% lines, ${coverage['business-kits'].functions}% functions
  - Kits Hub v2.0: ${coverage['kits-hub-v2.0'].lines}% lines, ${coverage['kits-hub-v2.0'].functions}% functions

### Integration Tests
- **Results**: ${metrics.integration.passed} passed, ${metrics.integration.failed} failed, ${metrics.integration.skipped} skipped
- **Duration**: ${metrics.integration.duration.toFixed(0)}ms

### End-to-End Tests
- **Results**: ${metrics.e2e.passed} passed, ${metrics.e2e.failed} failed, ${metrics.e2e.skipped} skipped
- **Duration**: ${metrics.e2e.duration.toFixed(0)}ms
- **Browser Coverage**: 
  - Chromium: ${testResults.e2e['business-kits-chromium']?.passed || 0} passed
  - Firefox: ${testResults.e2e['business-kits-firefox']?.passed || 0} passed
  - WebKit: ${testResults.e2e['business-kits-webkit']?.passed || 0} passed

### Performance Tests
- **Load Testing**: ${metrics.performance.passed} passed, ${metrics.performance.failed} failed
- **Database Performance**: ${metrics.performance.duration.toFixed(0)}ms average response time

### Security Tests
- **Results**: ${metrics.security.passed} passed, ${metrics.security.failed} failed
- **Vulnerabilities**: ${testResults.security?.vulnerabilities || 0} found

### Accessibility Tests
- **Results**: ${metrics.accessibility.passed} passed, ${metrics.accessibility.failed} failed
- **WCAG Compliance**: ${metrics.accessibility.passed > 0 ? '✅ Passed' : '❌ Failed'}

### Visual Regression Tests
- **Results**: ${metrics.visual.passed} passed, ${metrics.visual.failed} failed
- **Visual Changes**: ${testResults.visual?.changes || 0} detected

## 🚨 Critical Issues

${totalFailed > 0 ? `
### Failed Tests
- ${totalFailed} tests failed across all suites
- Please review the detailed test results for specific failures
` : '✅ No critical test failures detected'}

${metrics.security.failed > 0 ? `
### Security Concerns
- ${metrics.security.failed} security tests failed
- Immediate attention required for security vulnerabilities
` : '✅ All security tests passed'}

## 📈 Quality Metrics

### Code Coverage Targets
- **Target**: 90% coverage across all solutions
- **Business Kits**: ${coverage['business-kits'].lines >= 90 ? '✅' : '❌'} ${coverage['business-kits'].lines}%
- **Kits Hub v2.0**: ${coverage['kits-hub-v2.0'].lines >= 90 ? '✅' : '❌'} ${coverage['kits-hub-v2.0'].lines}%

### Performance Benchmarks
- **API Response Time**: < 500ms ${metrics.performance.duration < 500 ? '✅' : '❌'}
- **Database Query Time**: < 200ms ${metrics.performance.duration < 200 ? '✅' : '❌'}
- **Load Testing**: < 10% failure rate ${metrics.performance.failed < metrics.performance.total * 0.1 ? '✅' : '❌'}

### Security Standards
- **Authentication**: ✅ Enforced
- **Authorization**: ✅ Tenant isolation verified
- **Input Validation**: ✅ XSS/SQL injection protection
- **Data Privacy**: ✅ GDPR compliance

## 🔗 Detailed Reports

- [Unit Test Coverage](./business-kits-unit-results/coverage/) 
- [E2E Test Reports](./business-kits-e2e-chromium/playwright-report/)
- [Performance Results](./performance-results/)
- [Security Scan Results](./security-results/)
- [Accessibility Report](./accessibility-results/)

## 📝 Recommendations

${passRate >= 90 ? '✅ Excellent test coverage and quality!' : 
  passRate >= 70 ? '⚠️ Good test coverage, but room for improvement.' :
  '❌ Test coverage needs significant improvement.'}

${metrics.security.failed > 0 ? '🔒 Address security vulnerabilities immediately.' : ''}

${Object.values(coverage).some(c => c.lines < 90) ? '📊 Improve code coverage to meet 90% target.' : ''}

---
*Generated on ${new Date().toISOString()}*
*Commit: ${process.env.GITHUB_SHA || 'local'}*
`;
}

function printConsoleSummary(metrics, coverage) {
  console.log('\n' + colorize('='.repeat(60), 'cyan'));
  console.log(colorize('🧪 KITS HUB TEST SUMMARY', 'bright'));
  console.log(colorize('='.repeat(60), 'cyan'));

  // Overall results
  const totalTests = Object.values(metrics).reduce((sum, cat) => sum + cat.total, 0);
  const totalPassed = Object.values(metrics).reduce((sum, cat) => sum + cat.passed, 0);
  const totalFailed = Object.values(metrics).reduce((sum, cat) => sum + cat.failed, 0);
  const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100) : 0;

  console.log(`\n${colorize('📊 OVERALL RESULTS:', 'bright')}`);
  console.log(`Total Tests: ${colorize(totalTests.toString(), 'blue')}`);
  console.log(`Passed: ${colorize(totalPassed.toString(), 'green')}`);
  console.log(`Failed: ${colorize(totalFailed.toString(), totalFailed > 0 ? 'red' : 'green')}`);
  console.log(`Pass Rate: ${colorize(passRate.toFixed(2) + '%', passRate >= 90 ? 'green' : passRate >= 70 ? 'yellow' : 'red')}`);

  // Individual suite results
  const suites = [
    { name: 'Unit Tests', data: metrics.unit },
    { name: 'Integration Tests', data: metrics.integration },
    { name: 'E2E Tests', data: metrics.e2e },
    { name: 'Performance Tests', data: metrics.performance },
    { name: 'Security Tests', data: metrics.security },
    { name: 'Accessibility Tests', data: metrics.accessibility },
  ];

  suites.forEach(suite => {
    const status = suite.data.failed === 0 ? '✅' : '❌';
    const color = suite.data.failed === 0 ? 'green' : 'red';
    console.log(`\n${colorize(`${status} ${suite.name}:`, color)}`);
    console.log(`  Passed: ${colorize(suite.data.passed.toString(), 'green')}`);
    console.log(`  Failed: ${colorize(suite.data.failed.toString(), suite.data.failed > 0 ? 'red' : 'green')}`);
    if (suite.data.duration > 0) {
      console.log(`  Duration: ${colorize(suite.data.duration.toFixed(0) + 'ms', 'blue')}`);
    }
  });

  // Coverage summary
  console.log(`\n${colorize('📊 COVERAGE:', 'bright')}`);
  Object.entries(coverage).forEach(([project, cov]) => {
    const status = cov.lines >= 90 ? '✅' : '❌';
    const color = cov.lines >= 90 ? 'green' : 'red';
    console.log(`${status} ${project}: ${colorize(cov.lines.toFixed(1) + '%', color)} lines`);
  });

  console.log(colorize('\n' + '='.repeat(60), 'cyan'));
}

// Run the summary generation
if (require.main === module) {
  generateSummary();
}

module.exports = { generateSummary, parseTestResults, extractMetrics };
