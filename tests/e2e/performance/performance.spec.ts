import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance monitoring
    await page.addInitScript(() => {
      // Override performance API to capture more detailed metrics
      const originalPerformance = window.performance
      window.performanceMetrics = {
        navigationStart: 0,
        loadEventEnd: 0,
        domContentLoaded: 0,
        firstPaint: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        firstInputDelay: 0,
        cumulativeLayoutShift: 0
      }
      
      // Capture navigation timing
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            window.performanceMetrics.navigationStart = entry.startTime
            window.performanceMetrics.domContentLoaded = entry.domContentLoadedEventEnd - entry.startTime
            window.performanceMetrics.loadEventEnd = entry.loadEventEnd - entry.startTime
          }
        })
      }).observe({ entryTypes: ['navigation'] })
      
      // Capture paint timing
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'paint') {
            if (entry.name === 'first-paint') {
              window.performanceMetrics.firstPaint = entry.startTime
            }
            if (entry.name === 'first-contentful-paint') {
              window.performanceMetrics.firstContentfulPaint = entry.startTime
            }
          }
        })
      }).observe({ entryTypes: ['paint'] })
      
      // Capture LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            window.performanceMetrics.largestContentfulPaint = entry.startTime
          }
        })
      }).observe({ entryTypes: ['largest-contentful-paint'] })
      
      // Capture CLS
      let clsValue = 0
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        window.performanceMetrics.cumulativeLayoutShift = clsValue
      }).observe({ entryTypes: ['layout-shift'] })
      
      // Capture FID
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'first-input') {
            window.performanceMetrics.firstInputDelay = entry.processingStart - entry.startTime
          }
        })
      }).observe({ entryTypes: ['first-input'] })
    })
  })

  test('should meet initial load performance targets', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    
    // Wait for all remote applications to load
    await Promise.all([
      page.waitForSelector('[data-testid="inventory-loaded"]'),
      page.waitForSelector('[data-testid="pos-loaded"]'),
      page.waitForSelector('[data-testid="crm-loaded"]'),
      page.waitForSelector('[data-testid="hr-loaded"]'),
      page.waitForSelector('[data-testid="accounting-loaded"]'),
      page.waitForSelector('[data-testid="analytics-loaded"]')
    ])
    
    const loadTime = Date.now() - startTime
    
    // Get performance metrics
    const metrics = await page.evaluate(() => window.performanceMetrics)
    
    // Performance assertions
    expect(loadTime).toBeLessThan(5000) // Total load time < 5s
    expect(metrics.firstContentfulPaint).toBeLessThan(2000) // FCP < 2s
    expect(metrics.largestContentfulPaint).toBeLessThan(2500) // LCP < 2.5s
    expect(metrics.firstInputDelay).toBeLessThan(100) // FID < 100ms
    expect(metrics.cumulativeLayoutShift).toBeLessThan(0.1) // CLS < 0.1
    
    console.log('Performance Metrics:', {
      loadTime,
      fcp: metrics.firstContentfulPaint,
      lcp: metrics.largestContentfulPaint,
      fid: metrics.firstInputDelay,
      cls: metrics.cumulativeLayoutShift
    })
  })

  test('should handle remote loading performance', async ({ page }) => {
    const remoteLoadTimes = {}
    
    // Monitor remote loading performance
    await page.route('**/remoteEntry.js', async (route) => {
      const startTime = Date.now()
      await route.continue()
      const loadTime = Date.now() - startTime
      
      const url = route.request().url()
      const remoteName = url.includes('4177') ? 'inventory' :
                       url.includes('4178') ? 'pos' :
                       url.includes('4179') ? 'crm' :
                       url.includes('4180') ? 'hr' :
                       url.includes('4181') ? 'accounting' :
                       url.includes('4182') ? 'analytics' : 'unknown'
      
      remoteLoadTimes[remoteName] = loadTime
    })
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    
    // Wait for all remotes to load
    await Promise.all([
      page.waitForSelector('[data-testid="inventory-loaded"]'),
      page.waitForSelector('[data-testid="pos-loaded"]'),
      page.waitForSelector('[data-testid="crm-loaded"]'),
      page.waitForSelector('[data-testid="hr-loaded"]'),
      page.waitForSelector('[data-testid="accounting-loaded"]'),
      page.waitForSelector('[data-testid="analytics-loaded"]')
    ])
    
    // Each remote should load within 1 second
    Object.entries(remoteLoadTimes).forEach(([remote, time]) => {
      expect(time).toBeLessThan(1000)
      console.log(`${remote} remote load time: ${time}ms`)
    })
  })

  test('should handle navigation performance between solutions', async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    
    const solutions = [
      { path: '/inventory', name: 'Inventory' },
      { path: '/pos', name: 'POS' },
      { path: '/crm', name: 'CRM' },
      { path: '/hr', name: 'HR' },
      { path: '/accounting', name: 'Accounting' },
      { path: '/analytics', name: 'Analytics' }
    ]
    
    for (const solution of solutions) {
      const startTime = Date.now()
      
      await page.goto(`http://localhost:3000${solution.path}`, { waitUntil: 'networkidle' })
      
      // Wait for solution to be fully loaded
      await page.waitForSelector(`[data-testid="${solution.name.toLowerCase()}-loaded"]`)
      
      const navigationTime = Date.now() - startTime
      
      // Navigation between solutions should be fast (< 1s)
      expect(navigationTime).toBeLessThan(1000)
      console.log(`${solution.name} navigation time: ${navigationTime}ms`)
    }
  })

  test('should handle memory usage', async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        }
      }
      return null
    })
    
    // Navigate through all solutions to accumulate memory
    const solutions = ['/inventory', '/pos', '/crm', '/hr', '/accounting', '/analytics']
    
    for (const path of solutions) {
      await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000) // Allow for memory allocation
    }
    
    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      if (performance.memory) {
        return {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        }
      }
      return null
    })
    
    if (initialMemory && finalMemory) {
      const memoryIncrease = finalMemory.used - initialMemory.used
      const memoryIncreasePercent = (memoryIncrease / initialMemory.used) * 100
      
      // Memory increase should be reasonable (< 50%)
      expect(memoryIncreasePercent).toBeLessThan(50)
      
      console.log('Memory Usage:', {
        initial: `${(initialMemory.used / 1024 / 1024).toFixed(2)} MB`,
        final: `${(finalMemory.used / 1024 / 1024).toFixed(2)} MB`,
        increase: `${(memoryIncrease / 1024 / 1024).toFixed(2)} MB (${memoryIncreasePercent.toFixed(2)}%)`
      })
    }
  })

  test('should handle bundle size optimization', async ({ page }) => {
    const bundleSizes = {}
    
    // Monitor bundle loading
    await page.route('**/*.js', async (route) => {
      const response = await route.fetch()
      const buffer = await response.body()
      const size = buffer ? buffer.byteLength : 0
      
      const url = route.request().url()
      const bundleName = url.includes('remoteEntry') ? 'remoteEntry' :
                        url.includes('main') ? 'main' :
                        url.includes('vendor') ? 'vendor' :
                        url.split('/').pop()?.split('?')[0] || 'unknown'
      
      bundleSizes[bundleName] = (bundleSizes[bundleName] || 0) + size
      await route.fulfill({ response })
    })
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    
    // Wait for all remotes to load
    await Promise.all([
      page.waitForSelector('[data-testid="inventory-loaded"]'),
      page.waitForSelector('[data-testid="pos-loaded"]'),
      page.waitForSelector('[data-testid="crm-loaded"]'),
      page.waitForSelector('[data-testid="hr-loaded"]'),
      page.waitForSelector('[data-testid="accounting-loaded"]'),
      page.waitForSelector('[data-testid="analytics-loaded"]')
    ])
    
    // Check bundle sizes
    const totalSize = Object.values(bundleSizes).reduce((sum, size) => sum + size, 0)
    
    // Total bundle size should be reasonable (< 5MB)
    expect(totalSize).toBeLessThan(5 * 1024 * 1024) // 5MB
    
    console.log('Bundle Sizes:', Object.entries(bundleSizes).map(([name, size]) => ({
      name,
      size: `${(size / 1024).toFixed(2)} KB`
    })))
    
    console.log(`Total bundle size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
  })

  test('should handle concurrent loading performance', async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    
    // Open multiple solutions in quick succession
    const startTime = Date.now()
    
    await Promise.all([
      page.goto('http://localhost:3000/inventory'),
      page.goto('http://localhost:3000/pos'),
      page.goto('http://localhost:3000/crm'),
      page.goto('http://localhost:3000/hr'),
      page.goto('http://localhost:3000/accounting'),
      page.goto('http://localhost:3000/analytics')
    ])
    
    const concurrentLoadTime = Date.now() - startTime
    
    // Concurrent loading should be efficient
    expect(concurrentLoadTime).toBeLessThan(3000) // < 3s for all solutions
    
    console.log(`Concurrent loading time: ${concurrentLoadTime}ms`)
  })

  test('should handle performance under load', async ({ context }) => {
    const pages = await Promise.all([
      context.newPage(),
      context.newPage(),
      context.newPage(),
      context.newPage(),
      context.newPage()
    ])
    
    const startTime = Date.now()
    
    // Load multiple pages concurrently
    await Promise.all(pages.map(async (page, index) => {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
      
      // Navigate to different solutions
      const solutions = ['/inventory', '/pos', '/crm', '/hr', '/accounting']
      await page.goto(`http://localhost:3000${solutions[index]}`, { waitUntil: 'networkidle' })
    }))
    
    const loadTime = Date.now() - startTime
    
    // Should handle concurrent load efficiently
    expect(loadTime).toBeLessThan(5000) // < 5s for 5 concurrent pages
    
    console.log(`Concurrent pages load time: ${loadTime}ms`)
    
    // Close pages
    await Promise.all(pages.map(page => page.close()))
  })

  test('should handle performance regression detection', async ({ page }) => {
    // This test establishes performance baselines
    const performanceBaseline = {
      initialLoad: 3000, // 3s
      navigation: 500,   // 500ms
      remoteLoad: 800,   // 800ms
      memoryIncrease: 30 // 30%
    }
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
    
    // Measure actual performance
    const actualMetrics = {
      initialLoad: await measureLoadTime(page, 'http://localhost:3000'),
      navigation: await measureNavigationTime(page, '/inventory'),
      remoteLoad: await measureRemoteLoadTime(page),
      memoryIncrease: await measureMemoryIncrease(page)
    }
    
    // Check for regressions
    Object.entries(performanceBaseline).forEach(([metric, baseline]) => {
      const actual = actualMetrics[metric]
      const regressionPercent = ((actual - baseline) / baseline) * 100
      
      // Allow 20% regression tolerance
      expect(regressionPercent).toBeLessThan(20)
      
      console.log(`${metric}: ${actual}ms (baseline: ${baseline}ms, regression: ${regressionPercent.toFixed(2)}%)`)
    })
  })
})

async function measureLoadTime(page: any, url: string): Promise<number> {
  const startTime = Date.now()
  await page.goto(url, { waitUntil: 'networkidle' })
  return Date.now() - startTime
}

async function measureNavigationTime(page: any, path: string): Promise<number> {
  const startTime = Date.now()
  await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle' })
  return Date.now() - startTime
}

async function measureRemoteLoadTime(page: any): Promise<number> {
  let maxLoadTime = 0
  
  page.route('**/remoteEntry.js', async (route) => {
    const startTime = Date.now()
    await route.continue()
    const loadTime = Date.now() - startTime
    maxLoadTime = Math.max(maxLoadTime, loadTime)
  })
  
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000) // Wait for all remotes
  
  return maxLoadTime
}

async function measureMemoryIncrease(page: any): Promise<number> {
  const initialMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0)
  
  // Navigate through all solutions
  const solutions = ['/inventory', '/pos', '/crm', '/hr', '/accounting', '/analytics']
  for (const path of solutions) {
    await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1000)
  }
  
  const finalMemory = await page.evaluate(() => performance.memory?.usedJSHeapSize || 0)
  
  return ((finalMemory - initialMemory) / initialMemory) * 100
}
