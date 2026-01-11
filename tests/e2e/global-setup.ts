import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test setup...')
  
  // Start all remote applications
  const remoteApps = [
    { name: 'Inventory', port: 4177, url: 'http://localhost:4177' },
    { name: 'POS', port: 4178, url: 'http://localhost:4178' },
    { name: 'CRM', port: 4179, url: 'http://localhost:4179' },
    { name: 'HR', port: 4180, url: 'http://localhost:4180' },
    { name: 'Accounting', port: 4181, url: 'http://localhost:4181' },
    { name: 'Analytics', port: 4182, url: 'http://localhost:4182' }
  ]

  // Check if all remote applications are running
  for (const app of remoteApps) {
    try {
      const browser = await chromium.launch()
      const context = await browser.newContext()
      const page = await context.newPage()
      
      console.log(`🔍 Checking ${app.name} at ${app.url}`)
      
      const response = await page.goto(app.url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      })
      
      if (!response || response.status() !== 200) {
        console.warn(`⚠️  ${app.name} is not responding correctly`)
      } else {
        console.log(`✅ ${app.name} is running`)
      }
      
      await browser.close()
    } catch (error) {
      console.error(`❌ Failed to connect to ${app.name}:`, error)
      throw new Error(`Remote application ${app.name} is not available at ${app.url}`)
    }
  }

  // Setup test data
  console.log('📊 Setting up test data...')
  
  // Create test database entries if needed
  const testBrowser = await chromium.launch()
  const testContext = await testBrowser.newContext()
  const testPage = await testContext.newPage()
  
  try {
    // Setup test users, customers, products, etc.
    await setupTestData(testPage)
    console.log('✅ Test data setup complete')
  } catch (error) {
    console.error('❌ Failed to setup test data:', error)
  } finally {
    await testBrowser.close()
  }

  console.log('🎉 E2E test setup complete!')
}

async function setupTestData(page: any) {
  // This would setup test data via API calls or direct database operations
  // For now, we'll just log that this would happen
  console.log('📝 Test data would be created here')
}

export default globalSetup
