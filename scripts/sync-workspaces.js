#!/usr/bin/env node

/**
 * KiTS Hub Workspace Synchronization Script
 * Synchronizes dependencies and configurations across all workspaces
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const PACKAGE_JSON = 'package.json';

// Unified dependency versions from root package.json
const UNIFIED_DEPENDENCIES = {
  // Core React dependencies
  'react': '18.3.1',
  'react-dom': '18.3.1',
  '@types/react': '18.3.11',
  '@types/react-dom': '18.3.0',
  
  // Core libraries
  '@supabase/supabase-js': '2.49.8',
  'react-router-dom': '6.30.2',
  'lucide-react': '0.487.0',
  'clsx': '2.1.1',
  'class-variance-authority': '0.7.1',
  'tailwind-merge': '2.5.4',
  'zustand': '5.0.9',
  'sonner': '2.0.3',
  'react-hot-toast': '2.6.0',
  
  // State management
  '@tanstack/react-query': '5.90.12',
  '@tanstack/react-query-devtools': '5.91.1',
  
  // Validation and utilities
  'zod': '3.25.76',
  'date-fns': '3.6.0',
  'react-hook-form': '7.55.0',
  'recharts': '2.15.2',
  
  // Styling
  'tailwindcss': '4.1.18',
  
  // Radix UI components
  '@radix-ui/react-dialog': '1.1.6',
  '@radix-ui/react-dropdown-menu': '2.1.6',
  '@radix-ui/react-toast': '1.2.5',
  '@radix-ui/react-tooltip': '1.1.8',
  '@radix-ui/react-label': '2.1.2',
  '@radix-ui/react-slot': '1.1.2',
  '@radix-ui/react-separator': '1.1.2',
  '@radix-ui/react-switch': '1.1.3',
  '@radix-ui/react-tabs': '1.1.3',
};

const UNIFIED_DEV_DEPENDENCIES = {
  // TypeScript
  'typescript': '5.9.3',
  '@types/node': '20.10.0',
  
  // ESLint
  'eslint': '9.15.0',
  '@eslint/js': '9.15.0',
  '@typescript-eslint/eslint-plugin': '8.15.0',
  '@typescript-eslint/parser': '8.15.0',
  'eslint-plugin-import': '2.31.0',
  'eslint-plugin-react-hooks': '5.0.0',
  'eslint-plugin-react-refresh': '0.4.14',
  'eslint-plugin-security': '3.0.1',
  
  // Testing
  'vitest': '4.0.16',
  '@vitest/coverage-v8': '4.0.16',
  '@testing-library/react': '16.1.0',
  '@testing-library/jest-dom': '6.5.0',
  '@testing-library/user-event': '14.5.2',
  'jsdom': '27.3.0',
  '@playwright/test': '1.57.0',
  'playwright': '1.57.0',
  
  // Build tools
  'webpack': '5.97.1',
  'webpack-cli': '5.1.4',
  'webpack-dev-server': '5.2.0',
  'html-webpack-plugin': '5.6.3',
  'ts-loader': '9.5.2',
  'css-loader': '7.1.2',
  'style-loader': '4.0.0',
  'postcss': '8.5.1',
  'postcss-loader': '8.1.1',
  'autoprefixer': '10.4.20',
  'terser-webpack-plugin': '5.3.11',
  'terser': '5.44.1',
  '@babel/preset-env': '7.28.5',
  '@babel/preset-react': '7.28.5',
  'babel-loader': '10.0.0',
};

function syncWorkspaces() {
  console.log('🔄 KiTS Hub Workspace Synchronization\n');
  console.log('=====================================\n');
  
  const rootPackageJson = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, PACKAGE_JSON), 'utf8')
  );
  
  const workspaces = rootPackageJson.workspaces || [];
  const syncedWorkspaces = [];
  
  for (const workspacePattern of workspaces) {
    const workspaceDirs = resolveWorkspacePattern(workspacePattern);
    
    for (const workspaceDir of workspaceDirs) {
      const packageJsonPath = path.join(ROOT_DIR, workspaceDir, PACKAGE_JSON);
      
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          const updatedPackageJson = syncWorkspaceDependencies(workspaceDir, packageJson);
          
          // Write updated package.json
          fs.writeFileSync(
            packageJsonPath,
            JSON.stringify(updatedPackageJson, null, 2) + '\n'
          );
          
          syncedWorkspaces.push({
            name: updatedPackageJson.name,
            path: workspaceDir,
            updated: true
          });
          
          console.log(`✅ Synced: ${updatedPackageJson.name}`);
        } catch (error) {
          console.warn(`⚠️  Error syncing ${packageJsonPath}: ${error.message}`);
        }
      }
    }
  }
  
  console.log(`\n🎉 Successfully synchronized ${syncedWorkspaces.length} workspaces`);
  
  // Run npm install to update dependencies
  console.log('\n📦 Installing updated dependencies...');
  try {
    execSync('npm install', { cwd: ROOT_DIR, stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully');
  } catch (error) {
    console.error('❌ Error installing dependencies:', error.message);
  }
}

function resolveWorkspacePattern(pattern) {
  const workspaceDirs = [];
  
  if (pattern.includes('*')) {
    const baseDir = pattern.replace('/*', '');
    const fullPath = path.join(ROOT_DIR, baseDir);
    
    if (fs.existsSync(fullPath)) {
      const items = fs.readdirSync(fullPath, { withFileTypes: true });
      
      for (const item of items) {
        if (item.isDirectory()) {
          workspaceDirs.push(path.join(baseDir, item.name));
        }
      }
    }
  } else {
    const fullPath = path.join(ROOT_DIR, pattern);
    if (fs.existsSync(fullPath)) {
      workspaceDirs.push(pattern);
    }
  }
  
  return workspaceDirs;
}

function syncWorkspaceDependencies(workspaceDir, packageJson) {
  const workspaceType = determineWorkspaceType(workspaceDir, packageJson);
  const updatedPackageJson = { ...packageJson };
  
  // Initialize dependencies if they don't exist
  updatedPackageJson.dependencies = updatedPackageJson.dependencies || {};
  updatedPackageJson.devDependencies = updatedPackageJson.devDependencies || {};
  
  // Sync unified dependencies based on workspace type
  switch (workspaceType) {
    case 'solution':
    case 'shell':
    case 'application':
      syncCoreDependencies(updatedPackageJson);
      syncDevDependencies(updatedPackageJson);
      break;
      
    case 'package':
      // Packages keep their specific dependencies but get unified dev deps
      syncDevDependencies(updatedPackageJson);
      break;
      
    default:
      // Apply minimal synchronization
      syncMinimalDependencies(updatedPackageJson);
      break;
  }
  
  // Ensure consistent module type for Module Federation
  if (hasModuleFederation(packageJson, path.join(ROOT_DIR, workspaceDir))) {
    updatedPackageJson.type = 'commonjs';
  }
  
  // Ensure consistent naming convention
  if (!updatedPackageJson.name.startsWith('@kits-hub/')) {
    const workspaceName = path.basename(workspaceDir);
    updatedPackageJson.name = `@kits-hub/${workspaceName}`;
  }
  
  return updatedPackageJson;
}

function determineWorkspaceType(workspaceDir, packageJson) {
  const name = packageJson.name || '';
  
  if (name.includes('shared-shell')) return 'shell';
  if (name.includes('inventory') || name.includes('pos') || 
      name.includes('crm') || name.includes('hr') || 
      name.includes('accounting') || name.includes('analytics')) {
    return 'solution';
  }
  if (name.includes('business-kits') || name.includes('kits-hub-v2.0')) {
    return 'application';
  }
  if (workspaceDir.startsWith('packages/')) return 'package';
  
  return 'unknown';
}

function syncCoreDependencies(packageJson) {
  // Update unified dependencies
  Object.entries(UNIFIED_DEPENDENCIES).forEach(([dep, version]) => {
    if (packageJson.dependencies[dep]) {
      packageJson.dependencies[dep] = version;
    }
  });
  
  // Remove jspdf and replace with secure version
  if (packageJson.dependencies['jspdf']) {
    packageJson.dependencies['jspdf'] = '4.0.0';
  }
}

function syncDevDependencies(packageJson) {
  // Update unified dev dependencies
  Object.entries(UNIFIED_DEV_DEPENDENCIES).forEach(([dep, version]) => {
    if (packageJson.devDependencies[dep]) {
      packageJson.devDependencies[dep] = version;
    }
  });
}

function syncMinimalDependencies(packageJson) {
  // Only sync critical dependencies for packages
  const criticalDeps = ['typescript', '@types/node'];
  
  criticalDeps.forEach(dep => {
    if (UNIFIED_DEV_DEPENDENCIES[dep] && packageJson.devDependencies[dep]) {
      packageJson.devDependencies[dep] = UNIFIED_DEV_DEPENDENCIES[dep];
    }
  });
}

function hasModuleFederation(packageJson, fullPath) {
  const webpackConfigs = [
    'webpack.config.js',
    'webpack.config.cjs'
  ];
  
  for (const config of webpackConfigs) {
    const configPath = path.join(fullPath, config);
    if (fs.existsSync(configPath)) {
      try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        return configContent.includes('ModuleFederationPlugin');
      } catch (error) {
        // Ignore read errors
      }
    }
  }
  
  return false;
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case '--dry-run':
    console.log('🔍 Dry run mode - no files will be modified\n');
    // Just show what would be synchronized
    break;
    
  case '--help':
    console.log(`
KiTS Hub Workspace Synchronization Tool

Usage: node scripts/sync-workspaces.js [options]

Options:
  --dry-run    Show what would be synchronized without making changes
  --help       Show this help message

Description:
  Synchronizes dependency versions and configurations across all workspaces
  to ensure consistency and proper Module Federation setup.
    `);
    break;
    
  default:
    syncWorkspaces();
    break;
}

module.exports = { syncWorkspaces };
