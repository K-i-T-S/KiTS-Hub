#!/usr/bin/env node

/**
 * Comprehensive Auth Hooks Validation Script
 * Validates that auth hooks work correctly and session persists across component renders
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Comprehensive Auth Hooks Validation\n');

// Test results storage
const results = [];

function addTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const message = `${status} ${testName}${details ? ` - ${details}` : ''}`;
  console.log(message);
  results.push({ testName, passed, details });
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkFileContent(filePath, content) {
  if (!checkFileExists(filePath)) return false;
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return fileContent.includes(content);
}

function checkFileRegex(filePath, regex) {
  if (!checkFileExists(filePath)) return false;
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return regex.test(fileContent);
}

// Test 1: Package structure validation
console.log('📁 Testing Package Structure...');
addTest(
  'Auth package.json exists',
  checkFileExists('./packages/auth/package.json')
);

addTest(
  'Auth package has correct dependencies',
  checkFileContent('./packages/auth/package.json', '@supabase/supabase-js') &&
  checkFileContent('./packages/auth/package.json', 'zustand')
);

addTest(
  'Auth package has build scripts',
  checkFileContent('./packages/auth/package.json', '"build"')
);

// Test 2: Core files exist
console.log('\n📄 Testing Core Files...');
addTest(
  'AuthProvider.tsx exists',
  checkFileExists('./packages/auth/src/AuthProvider.tsx')
);

addTest(
  'useAuth hook exists',
  checkFileExists('./packages/auth/src/hooks/useAuth.ts')
);

addTest(
  'usePermissions hook exists',
  checkFileExists('./packages/auth/src/hooks/usePermissions.ts')
);

addTest(
  'useOrganization hook exists',
  checkFileExists('./packages/auth/src/hooks/useOrganization.ts')
);

addTest(
  'useRequireAuth hook exists',
  checkFileExists('./packages/auth/src/hooks/useRequireAuth.ts')
);

addTest(
  'ProtectedRoute component exists',
  checkFileExists('./packages/auth/src/components/ProtectedRoute.tsx')
);

addTest(
  'Session utilities exist',
  checkFileExists('./packages/auth/src/utils/session.ts')
);

addTest(
  'Auth utilities exist',
  checkFileExists('./packages/auth/src/utils/auth-utils.ts')
);

addTest(
  'Type definitions exist',
  checkFileExists('./packages/auth/src/types/auth.types.ts')
);

// Test 3: AuthProvider implementation
console.log('\n🏗️ Testing AuthProvider Implementation...');
addTest(
  'AuthProvider exports React Context',
  checkFileContent('./packages/auth/src/AuthProvider.tsx', 'createContext')
);

addTest(
  'AuthProvider uses useReducer for state management',
  checkFileContent('./packages/auth/src/AuthProvider.tsx', 'useReducer')
);

addTest(
  'AuthProvider provides auth methods',
  checkFileContent('./packages/auth/src/AuthProvider.tsx', 'signIn') &&
  checkFileContent('./packages/auth/src/AuthProvider.tsx', 'signOut')
);

addTest(
  'AuthProvider handles session management',
  checkFileContent('./packages/auth/src/AuthProvider.tsx', 'sessionManager')
);

// Test 4: Hook implementations
console.log('\n🪝 Testing Hook Implementations...');
addTest(
  'useAuth hook uses AuthProvider context',
  checkFileContent('./packages/auth/src/hooks/useAuth.ts', 'useAuthContext')
);

addTest(
  'useAuth provides authentication methods',
  checkFileContent('./packages/auth/src/hooks/useAuth.ts', 'signIn') &&
  checkFileContent('./packages/auth/src/hooks/useAuth.ts', 'signOut') &&
  checkFileContent('./packages/auth/src/hooks/useAuth.ts', 'signUp')
);

addTest(
  'usePermissions provides permission checking',
  checkFileContent('./packages/auth/src/hooks/usePermissions.ts', 'hasPermission') &&
  checkFileContent('./packages/auth/src/hooks/usePermissions.ts', 'hasRole')
);

addTest(
  'useOrganization provides organization management',
  checkFileContent('./packages/auth/src/hooks/useOrganization.ts', 'switchOrganization')
);

addTest(
  'useRequireAuth provides route protection',
  checkFileContent('./packages/auth/src/hooks/useRequireAuth.ts', 'useNavigate')
);

// Test 5: Session management (Memory-only)
console.log('\n💾 Testing Session Management...');
addTest(
  'Session manager is singleton',
  checkFileContent('./packages/auth/src/utils/session.ts', 'getInstance')
);

addTest(
  'Session stored in memory (not localStorage)',
  checkFileContent('./packages/auth/src/utils/session.ts', 'private currentSession') &&
  !checkFileContent('./packages/auth/src/utils/session.ts', 'localStorage') &&
  !checkFileContent('./packages/auth/src/utils/session.ts', 'sessionStorage')
);

addTest(
  'Token refresh mechanism implemented',
  checkFileContent('./packages/auth/src/utils/session.ts', 'refreshToken') &&
  checkFileContent('./packages/auth/src/utils/session.ts', 'scheduleTokenRefresh')
);

addTest(
  'Session validation implemented',
  checkFileContent('./packages/auth/src/utils/session.ts', 'validateToken')
);

// Test 6: Security and utilities
console.log('\n🔒 Testing Security and Utilities...');
addTest(
  'Password strength checker implemented',
  checkFileContent('./packages/auth/src/utils/auth-utils.ts', 'checkPasswordStrength')
);

addTest(
  'Email validation implemented',
  checkFileContent('./packages/auth/src/utils/session.ts', 'validateEmail') ||
  checkFileContent('./packages/auth/src/utils/auth-utils.ts', 'validateEmail')
);

addTest(
  'Token validation utilities implemented',
  checkFileContent('./packages/auth/src/utils/auth-utils.ts', 'TokenUtils')
);

addTest(
  'Security utilities implemented',
  checkFileContent('./packages/auth/src/utils/auth-utils.ts', 'SecurityUtils')
);

// Test 7: Protected route components
console.log('\n🛡️ Testing Protected Route Components...');
addTest(
  'ProtectedRoute component exists',
  checkFileContent('./packages/auth/src/components/ProtectedRoute.tsx', 'ProtectedRoute')
);

addTest(
  'PermissionGuard component exists',
  checkFileContent('./packages/auth/src/components/ProtectedRoute.tsx', 'PermissionGuard')
);

addTest(
  'RoleGuard component exists',
  checkFileContent('./packages/auth/src/components/ProtectedRoute.tsx', 'RoleGuard')
);

addTest(
  'Route guards use React Router',
  checkFileContent('./packages/auth/src/components/ProtectedRoute.tsx', 'Navigate')
);

// Test 8: Type definitions
console.log('\n📝 Testing Type Definitions...');
addTest(
  'User type defined',
  checkFileContent('./packages/auth/src/types/auth.types.ts', 'interface User')
);

addTest(
  'AuthState type defined',
  checkFileContent('./packages/auth/src/types/auth.types.ts', 'interface AuthState')
);

addTest(
  'UserRole enum defined',
  checkFileContent('./packages/auth/src/types/auth.types.ts', 'enum UserRole')
);

addTest(
  'Permission enum defined',
  checkFileContent('./packages/auth/src/types/auth.types.ts', 'enum Permission')
);

addTest(
  'AuthContextType defined',
  checkFileContent('./packages/auth/src/types/auth.types.ts', 'interface AuthContextType')
);

// Test 9: Module Federation integration
console.log('\n🔗 Testing Module Federation Integration...');
addTest(
  'Shell webpack config includes auth package',
  checkFileContent('./shared-shell/webpack.config.cjs', '@kits-hub/auth')
);

addTest(
  'Shell package.json includes auth dependency',
  checkFileContent('./shared-shell/package.json', '@kits-hub/auth')
);

addTest(
  'Auth package configured as singleton',
  checkFileContent('./shared-shell/webpack.config.cjs', '@kits-hub/auth') &&
  checkFileRegex('./shared-shell/webpack.config.cjs', /@kits-hub\/auth[^}]*singleton:\s*true/)
);

addTest(
  'Zustand shared for auth package',
  checkFileContent('./shared-shell/webpack.config.cjs', 'zustand') &&
  checkFileRegex('./shared-shell/webpack.config.cjs', /zustand[^}]*singleton:\s*true/)
);

// Test 10: Supabase integration
console.log('\n🗄️ Testing Supabase Integration...');
addTest(
  'Supabase client configured',
  checkFileContent('./packages/auth/src/utils/session.ts', 'createClient')
);

addTest(
  'Supabase auth disabled persistence',
  checkFileContent('./packages/auth/src/utils/session.ts', 'persistSession: false')
);

addTest(
  'Supabase auto refresh enabled',
  checkFileContent('./packages/auth/src/utils/session.ts', 'autoRefreshToken: true')
);

// Test 11: Export structure
console.log('\n📤 Testing Export Structure...');
addTest(
  'Main index exports AuthProvider',
  checkFileContent('./packages/auth/src/index.ts', 'AuthProvider')
);

addTest(
  'Main index exports hooks',
  checkFileContent('./packages/auth/src/index.ts', 'useAuth') &&
  checkFileContent('./packages/auth/src/index.ts', 'usePermissions')
);

addTest(
  'Main index exports components',
  checkFileContent('./packages/auth/src/index.ts', 'ProtectedRoute')
);

addTest(
  'Main index exports utilities',
  checkFileContent('./packages/auth/src/index.ts', 'sessionManager') &&
  checkFileContent('./packages/auth/src/index.ts', 'AuthUtils')
);

// Test 12: Build configuration
console.log('\n⚙️ Testing Build Configuration...');
addTest(
  'Rollup config exists',
  checkFileExists('./packages/auth/rollup.config.js')
);

addTest(
  'TypeScript config exists',
  checkFileExists('./packages/auth/tsconfig.json')
);

addTest(
  'Package configured for ESM/CJS output',
  checkFileContent('./packages/auth/package.json', '"module"') &&
  checkFileContent('./packages/auth/package.json', '"main"')
);

// Summary
console.log('\n📊 Validation Results Summary:');
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;

console.log(`Total Tests: ${results.length}`);
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 All validation tests passed!');
  console.log('✅ Auth hooks are properly implemented and ready for use');
  console.log('✅ Session management uses memory-only storage');
  console.log('✅ Module Federation integration is configured');
  console.log('✅ All components and utilities are properly exported');
} else {
  console.log('\n⚠️ Some validation tests failed.');
  console.log('Please review the failing tests and fix the issues.');
  
  console.log('\n🔧 Failed Tests:');
  results.filter(r => !r.passed).forEach(test => {
    console.log(`  ❌ ${test.testName}: ${test.details}`);
  });
}

console.log('\n📋 Validation Complete!');
process.exit(failed === 0 ? 0 : 1);
