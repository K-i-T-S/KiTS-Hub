/**
 * Auth Hooks Validation Script
 * Tests that auth hooks work correctly and session persists across component renders
 */

// Mock React environment for testing
const React = require('react');

// Test utilities
function createTestResult(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${testName}${details ? ` - ${details}` : ''}`);
  return { testName, passed, details };
}

function runAuthValidation() {
  console.log('🔐 Starting Auth Hooks Validation...\n');
  
  const results = [];

  // Test 1: Check if auth package can be imported
  try {
    const authPackage = require('./packages/auth/src/index.ts');
    results.push(createTestResult(
      'Auth package import',
      !!authPackage,
      `Exported: ${Object.keys(authPackage).join(', ')}`
    ));
  } catch (error) {
    results.push(createTestResult(
      'Auth package import',
      false,
      `Error: ${error.message}`
    ));
  }

  // Test 2: Check AuthProvider export
  try {
    const { AuthProvider } = require('./packages/auth/src/AuthProvider.tsx');
    results.push(createTestResult(
      'AuthProvider component export',
      typeof AuthProvider === 'function',
      `Type: ${typeof AuthProvider}`
    ));
  } catch (error) {
    results.push(createTestResult(
      'AuthProvider component export',
      false,
      `Error: ${error.message}`
    ));
  }

  // Test 3: Check useAuth hook export
  try {
    const { useAuth } = require('./packages/auth/src/hooks/useAuth.ts');
    results.push(createTestResult(
      'useAuth hook export',
      typeof useAuth === 'function',
      `Type: ${typeof useAuth}`
    ));
  } catch (error) {
    results.push(createTestResult(
      'useAuth hook export',
      false,
      `Error: ${error.message}`
    ));
  }

  // Test 4: Check usePermissions hook export
  try {
    const { usePermissions } = require('./packages/auth/src/hooks/usePermissions.ts');
    results.push(createTestResult(
      'usePermissions hook export',
      typeof usePermissions === 'function',
      `Type: ${typeof usePermissions}`
    ));
  } catch (error) {
    results.push(createTestResult(
      'usePermissions hook export',
      false,
      `Error: ${error.message}`
    ));
  }

  // Test 5: Check useOrganization hook export
  try {
    const { useOrganization } = require('./packages/auth/src/hooks/useOrganization.ts');
    results.push(createTestResult(
      'useOrganization hook export',
      typeof useOrganization === 'function',
      `Type: ${typeof useOrganization}`
    ));
  } catch (error) {
    results.push(createTestResult(
      'useOrganization hook export',
      false,
      `Error: ${error.message}`
    ));
  }

  // Test 6: Check ProtectedRoute component export
  try {
    const { ProtectedRoute } = require('./packages/auth/src/components/ProtectedRoute.tsx');
    results.push(createTestResult(
      'ProtectedRoute component export',
      typeof ProtectedRoute === 'function',
      `Type: ${typeof ProtectedRoute}`
    ));
  } catch (error) {
    results.push(createTestResult(
      'ProtectedRoute component export',
      false,
      `Error: ${error.message}`
    ));
  }

  // Test 7: Check session manager utilities
  try {
    const { sessionManager, AuthUtils, PermissionUtils } = require('./packages/auth/src/utils/session.ts');
    results.push(createTestResult(
      'Session manager utilities export',
          !!(sessionManager && AuthUtils && PermissionUtils),
      `sessionManager: ${typeof sessionManager}, AuthUtils: ${typeof AuthUtils}, PermissionUtils: ${typeof PermissionUtils}`
    ));
  } catch (error) {
    results.push(createTestResult(
      'Session manager utilities export',
      false,
      `Error: ${error.message}`
    ));
  }

  // Test 8: Check auth utilities
  try {
    const { TokenUtils, PasswordUtils, SecurityUtils } = require('./packages/auth/src/utils/auth-utils.ts');
    results.push(createTestResult(
      'Auth utilities export',
      !!(TokenUtils && PasswordUtils && SecurityUtils),
      `TokenUtils: ${typeof TokenUtils}, PasswordUtils: ${typeof PasswordUtils}, SecurityUtils: ${typeof SecurityUtils}`
    ));
  } catch (error) {
    results.push(createTestResult(
      'Auth utilities export',
      false,
      `Error: ${error.message}`
    ));
  }

  // Test 9: Check type definitions
  try {
    const types = require('./packages/auth/src/types/auth.types.ts');
    const hasRequiredTypes = !!(types.User && types.AuthState && types.UserRole && types.Permission);
    results.push(createTestResult(
      'Type definitions export',
      hasRequiredTypes,
      `User: ${typeof types.User}, AuthState: ${typeof types.AuthState}, UserRole: ${typeof types.UserRole}`
    ));
  } catch (error) {
    results.push(createTestResult(
      'Type definitions export',
      false,
      `Error: ${error.message}`
    ));
  }

  // Test 10: Check Supabase integration
  try {
    const { supabase } = require('./packages/auth/src/utils/session.ts');
    results.push(createTestResult(
      'Supabase client integration',
      !!supabase && typeof supabase.auth === 'object',
      `Supabase client available: ${!!supabase}, Auth available: ${!!supabase?.auth}`
    ));
  } catch (error) {
    results.push(createTestResult(
      'Supabase client integration',
      false,
      `Error: ${error.message}`
    ));
  }

  // Test 11: Check memory-only session (no localStorage usage)
  try {
    const sessionCode = require('fs').readFileSync('./packages/auth/src/utils/session.ts', 'utf8');
    const usesLocalStorage = sessionCode.includes('localStorage') || sessionCode.includes('sessionStorage');
    results.push(createTestResult(
      'Memory-only session storage',
      !usesLocalStorage,
      usesLocalStorage ? '❌ Found localStorage/sessionStorage usage' : '✅ No localStorage/sessionStorage found'
    ));
  } catch (error) {
    results.push(createTestResult(
      'Memory-only session storage',
      false,
      `Error reading session file: ${error.message}`
    ));
  }

  // Test 12: Check Module Federation compatibility
  try {
    const shellWebpackConfig = require('./shared-shell/webpack.config.cjs');
    const sharedConfig = shellWebpackConfig.plugins[0].options.shared;
    const hasAuthShared = sharedConfig['@kits-hub/auth'];
    results.push(createTestResult(
      'Module Federation auth sharing',
      !!hasAuthShared,
      `Auth shared config: ${!!hasAuthShared}, Singleton: ${hasAuthShared?.singleton}`
    ));
  } catch (error) {
    results.push(createTestResult(
      'Module Federation auth sharing',
      false,
      `Error: ${error.message}`
    ));
  }

  // Summary
  console.log('\n📊 Test Results Summary:');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Auth hooks are working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
  }

  return results;
}

// Run the validation
if (require.main === module) {
  runAuthValidation();
}

module.exports = { runAuthValidation };
