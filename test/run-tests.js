#!/usr/bin/env node

/**
 * Test Execution Script
 * Run: npm run test:provisioning or node test/run-tests.js
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function runCommand(command, description) {
  log(`\n🔧 ${description}...`, 'cyan')
  try {
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    })
    log(`✅ ${description} completed`, 'green')
    return result
  } catch (error) {
    log(`❌ ${description} failed`, 'red')
    log(`Error: ${error.message}`, 'red')
    process.exit(1)
  }
}

function checkTestFiles() {
  const testFiles = [
    'test/mocks/supabase-mock.ts',
    'test/services/test-provisioning-service.ts',
    'test/tests/provisioning-test-suite.ts',
    'test/test-runner.ts'
  ]
  
  log('\n📋 Checking test files...', 'blue')
  
  for (const file of testFiles) {
    const fullPath = path.join(__dirname, '..', file)
    if (fs.existsSync(fullPath)) {
      log(`✅ ${file}`, 'green')
    } else {
      log(`❌ ${file} not found`, 'red')
      process.exit(1)
    }
  }
}

function runTypeCheck() {
  log('\n🔍 Running TypeScript type check...', 'blue')
  try {
    execSync('npx tsc --noEmit --project test/tsconfig.json', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    })
    log('✅ Type check passed', 'green')
  } catch (error) {
    log('❌ Type check failed', 'red')
    process.exit(1)
  }
}

function createTestReport(results) {
  const reportPath = path.join(__dirname, '..', 'test-results.json')
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2))
  log(`📄 Test report saved to: ${reportPath}`, 'cyan')
}

async function main() {
  log('🚀 KiTS Hub Provisioning System Test Runner', 'bright')
  log('=' .repeat(50), 'blue')
  
  try {
    // Check if test files exist
    checkTestFiles()
    
    // Run type check
    runTypeCheck()
    
    // Compile TypeScript
    runCommand('npx tsc --project test/tsconfig.json', 'Compiling test files')
    
    // Run the test suite
    log('\n🧪 Running Provisioning System Tests...', 'magenta')
    
    // Import and run the test runner
    const TestRunner = require('./dist/test-runner.js').default
    const runner = new TestRunner()
    
    const results = await runner.runFullTestSuite()
    
    // Save test report
    createTestReport(results)
    
    // Final summary
    log('\n' + '=' .repeat(50), 'blue')
    log('🎉 TEST EXECUTION COMPLETED', 'bright')
    
    if (results.summary.successRate === 100) {
      log('✅ All tests passed! System is ready.', 'green')
      process.exit(0)
    } else {
      log(`⚠️  ${results.summary.failedTests} tests failed`, 'yellow')
      process.exit(1)
    }
    
  } catch (error) {
    log(`\n💥 Test execution failed: ${error.message}`, 'red')
    process.exit(1)
  }
}

// Handle command line arguments
const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
  log('KiTS Hub Provisioning System Test Runner', 'bright')
  log('\nUsage:')
  log('  node test/run-tests.js          Run all tests')
  log('  node test/run-tests.js --help  Show this help')
  log('\nOptions:')
  log('  --help, -h    Show help message')
  process.exit(0)
}

if (args.includes('--version') || args.includes('-v')) {
  const packageJson = require('../package.json')
  log(`KiTS Hub Test Runner v${packageJson.version || '1.0.0'}`)
  process.exit(0)
}

// Run the main function
main()
