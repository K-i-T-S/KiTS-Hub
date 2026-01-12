#!/usr/bin/env node

/**
 * KiTS Hub Workspace Information Script
 * Provides detailed information about all workspaces in the monorepo
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PACKAGE_JSON = 'package.json';

function getWorkspaceInfo() {
  const rootPackageJson = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, PACKAGE_JSON), 'utf8')
  );
  
  const workspaces = rootPackageJson.workspaces || [];
  const workspaceInfo = [];
  
  console.log('🔍 KiTS Hub Workspace Information\n');
  console.log('=====================================\n');
  
  // Process each workspace pattern
  for (const workspacePattern of workspaces) {
    const workspaceDirs = resolveWorkspacePattern(workspacePattern);
    
    for (const workspaceDir of workspaceDirs) {
      const packageJsonPath = path.join(ROOT_DIR, workspaceDir, PACKAGE_JSON);
      
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          const info = analyzeWorkspace(workspaceDir, packageJson);
          workspaceInfo.push(info);
        } catch (error) {
          console.warn(`⚠️  Error reading ${packageJsonPath}: ${error.message}`);
        }
      }
    }
  }
  
  // Display workspace information
  displayWorkspaceInfo(workspaceInfo);
  
  // Display summary statistics
  displaySummary(workspaceInfo);
  
  return workspaceInfo;
}

function resolveWorkspacePattern(pattern) {
  const workspaceDirs = [];
  
  if (pattern.includes('*')) {
    // Handle glob patterns like "packages/*" or "solutions/*"
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
    // Handle direct workspace paths
    const fullPath = path.join(ROOT_DIR, pattern);
    if (fs.existsSync(fullPath)) {
      workspaceDirs.push(pattern);
    }
  }
  
  return workspaceDirs;
}

function analyzeWorkspace(workspaceDir, packageJson) {
  const fullPath = path.join(ROOT_DIR, workspaceDir);
  const hasSrc = fs.existsSync(path.join(fullPath, 'src'));
  const hasDist = fs.existsSync(path.join(fullPath, 'dist'));
  const hasBuild = fs.existsSync(path.join(fullPath, 'build'));
  
  // Count dependencies
  const depCount = Object.keys(packageJson.dependencies || {}).length;
  const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
  
  // Determine workspace type
  const workspaceType = determineWorkspaceType(workspaceDir, packageJson);
  
  // Check for Module Federation
  const hasModuleFederation = checkModuleFederation(packageJson, fullPath);
  
  // Check build system
  const buildSystem = determineBuildSystem(packageJson, fullPath);
  
  return {
    name: packageJson.name || 'Unknown',
    path: workspaceDir,
    version: packageJson.version || '0.0.0',
    type: workspaceType,
    description: packageJson.description || '',
    private: packageJson.private !== false,
    moduleType: packageJson.type || 'commonjs',
    hasSrc,
    hasDist,
    hasBuild,
    dependencyCount: depCount,
    devDependencyCount: devDepCount,
    hasModuleFederation,
    buildSystem,
    scripts: Object.keys(packageJson.scripts || {}),
    engines: packageJson.engines || {},
  };
}

function determineWorkspaceType(workspaceDir, packageJson) {
  const name = packageJson.name || '';
  const description = packageJson.description || '';
  
  if (name.includes('shared-shell')) return 'Shell Application';
  if (name.includes('inventory')) return 'Solution - Inventory Management';
  if (name.includes('point-of-sale') || name.includes('pos')) return 'Solution - Point of Sale';
  if (name.includes('crm')) return 'Solution - CRM System';
  if (name.includes('hr')) return 'Solution - HR Management';
  if (name.includes('accounting')) return 'Solution - Accounting System';
  if (name.includes('analytics')) return 'Solution - Analytics Dashboard';
  if (name.includes('business-kits')) return 'Application - Business Kits';
  if (name.includes('kits-hub-v2.0')) return 'Application - KiTS Hub v2.0';
  if (name.includes('ui')) return 'Package - UI Components';
  if (name.includes('config')) return 'Package - Configuration';
  if (name.includes('auth')) return 'Package - Authentication';
  if (name.includes('database')) return 'Package - Database';
  if (name.includes('test')) return 'Package - Testing';
  
  if (workspaceDir.startsWith('packages/')) return 'Package';
  if (workspaceDir.startsWith('solutions/')) return 'Solution';
  if (workspaceDir.startsWith('shared/')) return 'Shared Library';
  
  return 'Unknown';
}

function checkModuleFederation(packageJson, fullPath) {
  // Check webpack config for Module Federation
  const webpackConfigs = [
    'webpack.config.js',
    'webpack.config.cjs',
    'webpack.prod.js',
    'webpack.prod.cjs'
  ];
  
  for (const config of webpackConfigs) {
    const configPath = path.join(fullPath, config);
    if (fs.existsSync(configPath)) {
      try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        return configContent.includes('ModuleFederationPlugin') || 
               configContent.includes('module-federation');
      } catch (error) {
        // Ignore read errors
      }
    }
  }
  
  return false;
}

function determineBuildSystem(packageJson, fullPath) {
  // Check package.json scripts and dependencies
  const scripts = packageJson.scripts || {};
  const deps = packageJson.devDependencies || {};
  
  if (deps.vite || scripts.vite) return 'Vite';
  if (deps.webpack || scripts.webpack) return 'Webpack';
  if (deps.rollup || scripts.rollup) return 'Rollup';
  if (deps.next || scripts.next) return 'Next.js';
  
  // Check config files
  if (fs.existsSync(path.join(fullPath, 'vite.config.js')) ||
      fs.existsSync(path.join(fullPath, 'vite.config.ts'))) {
    return 'Vite';
  }
  
  if (fs.existsSync(path.join(fullPath, 'webpack.config.js')) ||
      fs.existsSync(path.join(fullPath, 'webpack.config.cjs'))) {
    return 'Webpack';
  }
  
  if (fs.existsSync(path.join(fullPath, 'next.config.js')) ||
      fs.existsSync(path.join(fullPath, 'next.config.ts'))) {
    return 'Next.js';
  }
  
  return 'Unknown';
}

function displayWorkspaceInfo(workspaces) {
  for (const workspace of workspaces) {
    console.log(`📦 ${workspace.name}`);
    console.log(`   Path: ${workspace.path}`);
    console.log(`   Version: ${workspace.version}`);
    console.log(`   Type: ${workspace.type}`);
    console.log(`   Build System: ${workspace.buildSystem}`);
    console.log(`   Module Federation: ${workspace.hasModuleFederation ? '✅ Yes' : '❌ No'}`);
    console.log(`   Dependencies: ${workspace.dependencyCount} deps, ${workspace.devDependencyCount} dev deps`);
    console.log(`   Private: ${workspace.private ? '✅ Yes' : '❌ No'}`);
    console.log(`   Module Type: ${workspace.moduleType}`);
    
    if (workspace.description) {
      console.log(`   Description: ${workspace.description}`);
    }
    
    if (workspace.scripts.length > 0) {
      console.log(`   Scripts: ${workspace.scripts.slice(0, 5).join(', ')}${workspace.scripts.length > 5 ? '...' : ''}`);
    }
    
    console.log('');
  }
}

function displaySummary(workspaces) {
  console.log('📊 Summary Statistics');
  console.log('===================');
  
  const totalDeps = workspaces.reduce((sum, ws) => sum + ws.dependencyCount, 0);
  const totalDevDeps = workspaces.reduce((sum, ws) => sum + ws.devDependencyCount, 0);
  const withModuleFederation = workspaces.filter(ws => ws.hasModuleFederation).length;
  const withSrc = workspaces.filter(ws => ws.hasSrc).length;
  const withBuild = workspaces.filter(ws => ws.hasDist || ws.hasBuild).length;
  
  const buildSystems = {};
  workspaces.forEach(ws => {
    buildSystems[ws.buildSystem] = (buildSystems[ws.buildSystem] || 0) + 1;
  });
  
  const types = {};
  workspaces.forEach(ws => {
    types[ws.type] = (types[ws.type] || 0) + 1;
  });
  
  console.log(`Total Workspaces: ${workspaces.length}`);
  console.log(`Total Dependencies: ${totalDeps}`);
  console.log(`Total Dev Dependencies: ${totalDevDeps}`);
  console.log(`With Module Federation: ${withModuleFederation}/${workspaces.length}`);
  console.log(`With Source Code: ${withSrc}/${workspaces.length}`);
  console.log(`With Build Output: ${withBuild}/${workspaces.length}`);
  
  console.log('\n🏗️ Build Systems:');
  Object.entries(buildSystems).forEach(([system, count]) => {
    console.log(`   ${system}: ${count}`);
  });
  
  console.log('\n📂 Workspace Types:');
  Object.entries(types).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });
  
  console.log('\n🔧 Module Federation Status:');
  if (withModuleFederation === workspaces.length) {
    console.log('   ✅ All workspaces have Module Federation configured');
  } else {
    console.log(`   ⚠️  ${workspaces.length - withModuleFederation} workspaces missing Module Federation`);
  }
}

// Run the script
if (require.main === module) {
  getWorkspaceInfo();
}

module.exports = { getWorkspaceInfo };
