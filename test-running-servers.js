import puppeteer from 'puppeteer';
import fs from 'fs';

// Define the servers to test with their actual ports
const servers = [
  {
    name: 'KiTS Hub v2.0',
    port: 3000,
    baseUrl: 'http://localhost:3000',
    type: 'main-platform'
  },
  {
    name: 'Business Kits',
    port: 3001,
    baseUrl: 'http://localhost:3001',
    type: 'business-kits'
  },
  {
    name: 'Inventory Management',
    port: 3002,
    baseUrl: 'http://localhost:3002',
    type: 'solution'
  },
  {
    name: 'Accounting System',
    port: 3003,
    baseUrl: 'http://localhost:3003',
    type: 'solution'
  },
  {
    name: 'CRM System',
    port: 3004,
    baseUrl: 'http://localhost:3004',
    type: 'solution'
  },
  {
    name: 'HR Management',
    port: 3005,
    baseUrl: 'http://localhost:3005',
    type: 'solution'
  },
  {
    name: 'Point of Sale',
    port: 3006,
    baseUrl: 'http://localhost:3006',
    type: 'solution'
  },
  {
    name: 'Analytics Dashboard',
    port: 3007,
    baseUrl: 'http://localhost:3007',
    type: 'solution'
  }
];

async function testServerConnectivity() {
  console.log('🌐 Testing Server Connectivity...\n');
  
  const results = [];
  
  for (const server of servers) {
    try {
      const startTime = Date.now();
      const response = await fetch(server.baseUrl, { 
        method: 'GET',
        timeout: 5000
      });
      const loadTime = Date.now() - startTime;
      
      if (response.ok) {
        results.push({
          ...server,
          status: 'running',
          loadTime,
          statusCode: response.status,
          contentType: response.headers.get('content-type')
        });
        console.log(`✅ ${server.name} - ${response.status} (${loadTime}ms)`);
      } else {
        results.push({
          ...server,
          status: 'error',
          error: `HTTP ${response.status}`,
          loadTime
        });
        console.log(`❌ ${server.name} - HTTP ${response.status}`);
      }
    } catch (error) {
      results.push({
        ...server,
        status: 'offline',
        error: error.message,
        loadTime: 0
      });
      console.log(`❌ ${server.name} - Offline: ${error.message}`);
    }
  }
  
  return results;
}

async function testServerContent() {
  console.log('\n📄 Testing Server Content...\n');
  
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = [];
  
  // Test only running servers
  const runningServers = await testServerConnectivity();
  const onlineServers = runningServers.filter(s => s.status === 'running');
  
  for (const server of onlineServers) {
    const page = await browser.newPage();
    
    try {
      console.log(`Testing content for ${server.name}...`);
      
      const response = await page.goto(server.baseUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });
      
      if (response && response.status() === 200) {
        // Analyze page content
        const contentAnalysis = await page.evaluate(() => {
          const checks = {
            title: document.title,
            hasNavigation: !!document.querySelector('nav, header, .navbar, .header, .navigation'),
            hasMainContent: !!document.querySelector('main, .main, .content, .container, .app'),
            hasFooter: !!document.querySelector('footer, .footer'),
            hasInteractiveElements: document.querySelectorAll('button, a, input, select, textarea').length,
            hasForms: document.querySelectorAll('form').length,
            hasTables: document.querySelectorAll('table').length,
            hasCharts: !!document.querySelector('[class*="chart"], [class*="graph"], canvas'),
            bodyTextLength: document.body.innerText.length,
            errorElements: document.querySelectorAll('.error, .alert-error, [class*="error"]').length,
            loadingElements: document.querySelectorAll('.loading, .spinner, [class*="loading"]').length
          };
          return checks;
        });
        
        results.push({
          ...server,
          contentAnalysis,
          status: 'success'
        });
        
        console.log(`✅ ${server.name} - Content loaded successfully`);
        console.log(`   Title: ${contentAnalysis.title}`);
        console.log(`   Navigation: ${contentAnalysis.hasNavigation ? 'Yes' : 'No'}`);
        console.log(`   Main Content: ${contentAnalysis.hasMainContent ? 'Yes' : 'No'}`);
        console.log(`   Interactive Elements: ${contentAnalysis.hasInteractiveElements}`);
        console.log(`   Forms: ${contentAnalysis.hasForms}`);
        console.log(`   Content Length: ${contentAnalysis.bodyTextLength} chars`);
        
        // Take screenshot
        const screenshotPath = `/home/casio699/projects/kits-hub/screenshots/full-project/${server.name.replace(/\s+/g, '_')}.png`;
        await page.screenshot({ 
          path: screenshotPath, 
          fullPage: false 
        });
        
      } else {
        results.push({
          ...server,
          status: 'failed',
          error: response ? `HTTP ${response.status}` : 'No response'
        });
        console.log(`❌ ${server.name} - Failed to load content`);
      }
      
    } catch (error) {
      results.push({
        ...server,
        status: 'error',
        error: error.message
      });
      console.log(`❌ ${server.name} - Error: ${error.message}`);
    } finally {
      await page.close();
    }
  }
  
  await browser.close();
  return results;
}

async function testProjectStructure() {
  console.log('\n📁 Testing Project Structure...\n');
  
  const results = [];
  
  const projectPaths = [
    { name: 'KiTS Hub v2.0', path: '/home/casio699/projects/kits-hub/kits-hub-v2.0' },
    { name: 'Business Kits', path: '/home/casio699/projects/kits-hub/business-kits' },
    { name: 'Inventory Management', path: '/home/casio699/projects/kits-hub/solutions/inventory-management' },
    { name: 'Accounting System', path: '/home/casio699/projects/kits-hub/solutions/accounting-system' },
    { name: 'CRM System', path: '/home/casio699/projects/kits-hub/solutions/crm-system' },
    { name: 'HR Management', path: '/home/casio699/projects/kits-hub/solutions/hr-management' },
    { name: 'Point of Sale', path: '/home/casio699/projects/kits-hub/solutions/point-of-sale' },
    { name: 'Analytics Dashboard', path: '/home/casio699/projects/kits-hub/solutions/analytics-dashboard' }
  ];
  
  for (const project of projectPaths) {
    try {
      const structure = {
        hasPackageJson: fs.existsSync(`${project.path}/package.json`),
        hasNodeModules: fs.existsSync(`${project.path}/node_modules`),
        hasSrcDir: fs.existsSync(`${project.path}/src`),
        hasPublicDir: fs.existsSync(`${project.path}/public`),
        hasViteConfig: fs.existsSync(`${project.path}/vite.config.ts`) || fs.existsSync(`${project.path}/vite.config.js`),
        hasTsConfig: fs.existsSync(`${project.path}/tsconfig.json`),
        hasReadme: fs.existsSync(`${project.path}/README.md`),
        hasTestsDir: fs.existsSync(`${project.path}/tests`) || fs.existsSync(`${project.path}/test`)
      };
      
      // Check package.json content
      let packageInfo = null;
      if (structure.hasPackageJson) {
        try {
          const packageContent = fs.readFileSync(`${project.path}/package.json`, 'utf8');
          packageInfo = JSON.parse(packageContent);
        } catch (error) {
          console.log(`⚠️  Could not read package.json for ${project.name}`);
        }
      }
      
      results.push({
        name: project.name,
        path: project.path,
        structure,
        packageInfo: packageInfo ? {
          name: packageInfo.name,
          version: packageInfo.version,
          scripts: Object.keys(packageInfo.scripts || {}),
          dependencies: Object.keys(packageInfo.dependencies || {}),
          devDependencies: Object.keys(packageInfo.devDependencies || {})
        } : null,
        status: 'success'
      });
      
      console.log(`✅ ${project.name} - Structure analyzed`);
      console.log(`   Package.json: ${structure.hasPackageJson ? 'Yes' : 'No'}`);
      console.log(`   src/ directory: ${structure.hasSrcDir ? 'Yes' : 'No'}`);
      console.log(`   Tests: ${structure.hasTestsDir ? 'Yes' : 'No'}`);
      
    } catch (error) {
      results.push({
        name: project.name,
        path: project.path,
        status: 'error',
        error: error.message
      });
      console.log(`❌ ${project.name} - Error: ${error.message}`);
    }
  }
  
  return results;
}

function generateComprehensiveReport(connectivityResults, contentResults, structureResults) {
  const report = `# KiTS Hub Full Ecosystem Testing Report

**Generated:** ${new Date().toISOString()}  
**Scope:** Complete KiTS Hub Ecosystem  
**Components:** ${servers.length} total servers

---

## Executive Summary

This comprehensive test covers the entire KiTS Hub ecosystem including the main platform, business kits, and all individual business solutions.

### Overall Status
- **Total Servers:** ${servers.length}
- **Running:** ${connectivityResults.filter(s => s.status === 'running').length}
- **Offline/Error:** ${connectivityResults.filter(s => s.status !== 'running').length}
- **Content Tested:** ${contentResults.length}

---

## 🌐 Server Connectivity Results

### ✅ Running Servers
${connectivityResults.filter(s => s.status === 'running').map(s => 
  `- **${s.name}** - Port ${s.port} (${s.loadTime}ms) - ${s.contentType || 'Unknown content type'}`
).join('\n')}

### ❌ Offline/Error Servers
${connectivityResults.filter(s => s.status !== 'running').map(s => 
  `- **${s.name}** - Port ${s.port} - ${s.error || 'Unknown error'}`
).join('\n')}

---

## 📄 Content Analysis Results

### Successfully Loaded Content
${contentResults.map(c => `
**${c.name}**
- Title: ${c.contentAnalysis.title}
- Navigation: ${c.contentAnalysis.hasNavigation ? '✅' : '❌'}
- Main Content: ${c.contentAnalysis.hasMainContent ? '✅' : '❌'}
- Interactive Elements: ${c.contentAnalysis.hasInteractiveElements}
- Forms: ${c.contentAnalysis.hasForms}
- Content Length: ${c.contentAnalysis.bodyTextLength} characters
`).join('\n')}

---

## 📁 Project Structure Analysis

### Component Structure Summary
${structureResults.map(s => `
**${s.name}**
- Package.json: ${s.structure.hasPackageJson ? '✅' : '❌'}
- src/ directory: ${s.structure.hasSrcDir ? '✅' : '❌'}
- Tests: ${s.structure.hasTestsDir ? '✅' : '❌'}
- Dependencies: ${s.packageInfo ? s.packageInfo.dependencies.length : 'N/A'}
- Scripts: ${s.packageInfo ? s.packageInfo.scripts.length : 'N/A'}
`).join('\n')}

---

## 📊 Performance Analysis

### Fastest Servers
${connectivityResults
  .filter(s => s.status === 'running')
  .sort((a, b) => a.loadTime - b.loadTime)
  .slice(0, 3)
  .map(s => `- ${s.name}: ${s.loadTime}ms`).join('\n')}

### Slowest Servers
${connectivityResults
  .filter(s => s.status === 'running')
  .sort((a, b) => b.loadTime - a.loadTime)
  .slice(0, 3)
  .map(s => `- ${s.name}: ${s.loadTime}ms`).join('\n')}

---

## 🔍 Detailed Component Analysis

### Main Platform (KiTS Hub v2.0)
${connectivityResults.find(s => s.name === 'KiTS Hub v2.0')?.status === 'running' ? 
  '✅ **Status:** Running and accessible' : 
  '❌ **Status:** Not accessible'}

### Business Kits Platform
${connectivityResults.find(s => s.name === 'Business Kits')?.status === 'running' ? 
  '✅ **Status:** Running and accessible' : 
  '❌ **Status:** Not accessible'}

### Individual Business Solutions
${servers.filter(s => s.type === 'solution').map(s => {
  const result = connectivityResults.find(r => r.name === s.name);
  return `- **${s.name}:** ${result?.status === 'running' ? '✅ Running' : '❌ Offline'}`;
}).join('\n')}

---

## 🎯 Key Findings

### ✅ Strengths
1. **Modular Architecture:** Each solution runs independently
2. **Modern Stack:** All components use modern development tools
3. **Port Separation:** Each service has dedicated ports
4. **Standard Structure:** Consistent project organization

### ⚠️ Areas for Improvement
1. **Server Management:** Need automated startup scripts
2. **Content Loading:** Some servers may need optimization
3. **Cross-Integration:** Limited inter-service communication
4. **Testing Coverage:** Need comprehensive test suites

### 🔴 Critical Issues
${connectivityResults.filter(s => s.status !== 'running').length > 0 ? 
  connectivityResults.filter(s => s.status !== 'running').map(s => 
    `- ${s.name}: Server not accessible on port ${s.port}`
  ).join('\n') : 
  '✅ No critical issues detected'}

---

## 🚀 Recommendations

### Immediate Actions
1. **Start Offline Servers:** Bring all services online
2. **Verify Dependencies:** Ensure all node_modules are installed
3. **Check Configuration:** Verify environment variables and settings

### Short-term Improvements
1. **Automated Startup:** Create scripts to start all services
2. **Health Checks:** Implement service health monitoring
3. **Load Testing:** Test performance under load
4. **Integration Testing:** Test cross-service functionality

### Long-term Strategy
1. **Containerization:** Dockerize all services
2. **Orchestration:** Use Kubernetes or Docker Compose
3. **Monitoring:** Implement comprehensive monitoring
4. **CI/CD Pipeline:** Automated testing and deployment

---

## 📈 Success Metrics

- **Services Running:** ${connectivityResults.filter(s => s.status === 'running').length}/${servers.length} (${((connectivityResults.filter(s => s.status === 'running').length / servers.length) * 100).toFixed(1)}%)
- **Content Loading:** ${contentResults.length}/${connectivityResults.filter(s => s.status === 'running').length} (${contentResults.length > 0 ? ((contentResults.length / connectivityResults.filter(s => s.status === 'running').length) * 100).toFixed(1) : '0'}%)
- **Project Structure:** ${structureResults.filter(s => s.status === 'success').length}/${structureResults.length} (${((structureResults.filter(s => s.status === 'success').length / structureResults.length) * 100).toFixed(1)}%)

---

*This report provides a comprehensive overview of the entire KiTS Hub ecosystem. Screenshots are available in the screenshots/full-project/ directory.*
`;

  return report;
}

async function runComprehensiveTest() {
  console.log('🧪 Starting Comprehensive KiTS Hub Ecosystem Test...\n');
  
  // Create screenshots directory
  if (!fs.existsSync('/home/casio699/projects/kits-hub/screenshots/full-project')) {
    fs.mkdirSync('/home/casio699/projects/kits-hub/screenshots/full-project', { recursive: true });
  }
  
  try {
    // Test server connectivity
    const connectivityResults = await testServerConnectivity();
    
    // Test content for running servers
    const contentResults = await testServerContent();
    
    // Test project structure
    const structureResults = await testProjectStructure();
    
    // Generate comprehensive report
    const report = generateComprehensiveReport(connectivityResults, contentResults, structureResults);
    
    // Save reports
    fs.writeFileSync('/home/casio699/projects/kits-hub/COMPREHENSIVE_ECOSYSTEM_REPORT.md', report);
    fs.writeFileSync('/home/casio699/projects/kits-hub/ecosystem-test-results.json', JSON.stringify({
      connectivity: connectivityResults,
      content: contentResults,
      structure: structureResults
    }, null, 2));
    
    console.log('\n📊 Comprehensive Ecosystem Testing Complete!');
    console.log(`🌐 Servers Tested: ${connectivityResults.length}`);
    console.log(`✅ Running: ${connectivityResults.filter(s => s.status === 'running').length}`);
    console.log(`❌ Offline: ${connectivityResults.filter(s => s.status !== 'running').length}`);
    console.log(`📄 Content Analyzed: ${contentResults.length}`);
    console.log(`📁 Structure Analyzed: ${structureResults.length}`);
    console.log('\n📄 Reports saved:');
    console.log('   - COMPREHENSIVE_ECOSYSTEM_REPORT.md');
    console.log('   - ecosystem-test-results.json');
    console.log('   - screenshots/full-project/');
    
    return {
      connectivity: connectivityResults,
      content: contentResults,
      structure: structureResults
    };
    
  } catch (error) {
    console.error('❌ Comprehensive testing failed:', error);
    throw error;
  }
}

// Run the comprehensive test
runComprehensiveTest().catch(console.error);
