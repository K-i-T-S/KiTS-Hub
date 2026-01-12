#!/usr/bin/env node

/**
 * KiTS Hub Dependency Analysis Script
 * Analyzes dependency usage across workspaces and identifies optimization opportunities
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PACKAGE_JSON = 'package.json';

function analyzeDependencies() {
  console.log('📊 KiTS Hub Dependency Analysis\n');
  console.log('=================================\n');
  
  const rootPackageJson = JSON.parse(
    fs.readFileSync(path.join(ROOT_DIR, PACKAGE_JSON), 'utf8')
  );
  
  const workspaces = rootPackageJson.workspaces || [];
  const workspaceData = [];
  const dependencyMap = new Map();
  const devDependencyMap = new Map();
  
  // Collect data from all workspaces
  for (const workspacePattern of workspaces) {
    const workspaceDirs = resolveWorkspacePattern(workspacePattern);
    
    for (const workspaceDir of workspaceDirs) {
      const packageJsonPath = path.join(ROOT_DIR, workspaceDir, PACKAGE_JSON);
      
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          const data = collectDependencyData(workspaceDir, packageJson);
          workspaceData.push(data);
          
          // Aggregate dependency data
          aggregateDependencies(data.dependencies, dependencyMap);
          aggregateDependencies(data.devDependencies, devDependencyMap);
        } catch (error) {
          console.warn(`⚠️  Error reading ${packageJsonPath}: ${error.message}`);
        }
      }
    }
  }
  
  // Display analysis results
  displayDependencyAnalysis(dependencyMap, devDependencyMap);
  displayOptimizationOpportunities(dependencyMap, devDependencyMap);
  displaySecurityAnalysis(dependencyMap);
  displayDuplicateAnalysis(dependencyMap, devDependencyMap);
  displayWorkspaceSummary(workspaceData);
  
  return {
    workspaces: workspaceData,
    dependencies: Object.fromEntries(dependencyMap),
    devDependencies: Object.fromEntries(devDependencyMap)
  };
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

function collectDependencyData(workspaceDir, packageJson) {
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};
  
  return {
    name: packageJson.name || 'Unknown',
    path: workspaceDir,
    dependencyCount: Object.keys(dependencies).length,
    devDependencyCount: Object.keys(devDependencies).length,
    dependencies,
    devDependencies,
    totalSize: estimatePackageSize(dependencies, devDependencies)
  };
}

function aggregateDependencies(dependencies, map) {
  Object.entries(dependencies).forEach(([name, version]) => {
    if (!map.has(name)) {
      map.set(name, {
        name,
        versions: new Set(),
        workspaces: new Set(),
        totalUsage: 0
      });
    }
    
    const depData = map.get(name);
    depData.versions.add(version);
    depData.totalUsage++;
  });
}

function estimatePackageSize(dependencies, devDependencies) {
  // Rough estimation based on dependency count
  const depCount = Object.keys(dependencies).length;
  const devDepCount = Object.keys(devDependencies).length;
  
  // Average package size estimation (very rough)
  const avgDepSize = 2; // MB
  const avgDevDepSize = 1; // MB
  
  return {
    production: depCount * avgDepSize,
    development: devDepCount * avgDevDepSize,
    total: (depCount * avgDepSize) + (devDepCount * avgDevDepSize)
  };
}

function displayDependencyAnalysis(dependencyMap, devDependencyMap) {
  console.log('📈 Production Dependencies Analysis');
  console.log('==================================');
  
  const sortedDeps = Array.from(dependencyMap.entries())
    .sort(([, a], [, b]) => b.totalUsage - a.totalUsage);
  
  console.log('\n🏆 Top 20 Most Used Dependencies:');
  sortedDeps.slice(0, 20).forEach(([name, data], index) => {
    const versions = Array.from(data.versions).join(', ');
    console.log(`${(index + 1).toString().padStart(2)}. ${name.padEnd(30)} (${data.totalUsage} workspaces)`);
    console.log(`     Versions: ${versions}`);
  });
  
  console.log('\n📊 Dev Dependencies Analysis');
  console.log('===============================');
  
  const sortedDevDeps = Array.from(devDependencyMap.entries())
    .sort(([, a], [, b]) => b.totalUsage - a.totalUsage);
  
  console.log('\n🛠️ Top 15 Most Used Dev Dependencies:');
  sortedDevDeps.slice(0, 15).forEach(([name, data], index) => {
    const versions = Array.from(data.versions).join(', ');
    console.log(`${(index + 1).toString().padStart(2)}. ${name.padEnd(30)} (${data.totalUsage} workspaces)`);
    console.log(`     Versions: ${versions}`);
  });
}

function displayOptimizationOpportunities(dependencyMap, devDependencyMap) {
  console.log('\n💡 Optimization Opportunities');
  console.log('============================');
  
  // Find dependencies with version conflicts
  const conflicts = Array.from(dependencyMap.entries())
    .filter(([, data]) => data.versions.size > 1)
    .sort(([, a], [, b]) => b.versions.size - a.versions.size);
  
  if (conflicts.length > 0) {
    console.log('\n⚠️ Version Conflicts (should be unified):');
    conflicts.forEach(([name, data]) => {
      const versions = Array.from(data.versions);
      console.log(`   ${name}: ${versions.join(', ')}`);
    });
  }
  
  // Find dependencies that could be hoisted
  const hoistCandidates = Array.from(dependencyMap.entries())
    .filter(([, data]) => data.totalUsage >= 3) // Used in 3+ workspaces
    .sort(([, a], [, b]) => b.totalUsage - a.totalUsage);
  
  if (hoistCandidates.length > 0) {
    console.log('\n🚀 Hoisting Candidates (used in 3+ workspaces):');
    hoistCandidates.forEach(([name, data]) => {
      console.log(`   ${name}: ${data.totalUsage} workspaces`);
    });
  }
  
  // Find large dependencies
  const largeDeps = ['react', 'react-dom', '@supabase/supabase-js', 'lucide-react'];
  const foundLargeDeps = Array.from(dependencyMap.entries())
    .filter(([name]) => largeDeps.includes(name));
  
  if (foundLargeDeps.length > 0) {
    console.log('\n📦 Large Dependencies (consider optimization):');
    foundLargeDeps.forEach(([name, data]) => {
      console.log(`   ${name}: ${data.totalUsage} workspaces`);
    });
  }
}

function displaySecurityAnalysis(dependencyMap) {
  console.log('\n🔒 Security Analysis');
  console.log('===================');
  
  // Known vulnerable dependencies
  const vulnerableDeps = {
    'jspdf': { fixedVersion: '4.0.0', severity: 'Critical' },
    'lodash': { fixedVersion: '4.17.21', severity: 'High' },
    'axios': { fixedVersion: '1.6.0', severity: 'Medium' }
  };
  
  const foundVulnerable = Array.from(dependencyMap.entries())
    .filter(([name]) => vulnerableDeps[name])
    .map(([name, data]) => ({ name, ...data, ...vulnerableDeps[name] }));
  
  if (foundVulnerable.length > 0) {
    console.log('\n🚨 Vulnerable Dependencies Found:');
    foundVulnerable.forEach(vuln => {
      const versions = Array.from(vuln.versions);
      console.log(`   ${vuln.name}: ${vuln.severity} severity`);
      console.log(`     Current versions: ${versions.join(', ')}`);
      console.log(`     Fixed version: ${vuln.fixedVersion}`);
    });
  } else {
    console.log('\n✅ No known vulnerable dependencies found');
  }
}

function displayDuplicateAnalysis(dependencyMap, devDependencyMap) {
  console.log('\n🔄 Duplication Analysis');
  console.log('======================');
  
  // Calculate potential duplication
  const totalDeps = Array.from(dependencyMap.values())
    .reduce((sum, data) => sum + data.totalUsage, 0);
  
  const uniqueDeps = dependencyMap.size;
  const duplicationRate = ((totalDeps - uniqueDeps) / totalDeps * 100).toFixed(1);
  
  console.log(`Total dependency instances: ${totalDeps}`);
  console.log(`Unique dependencies: ${uniqueDeps}`);
  console.log(`Duplication rate: ${duplicationRate}%`);
  
  if (duplicationRate > 50) {
    console.log('⚠️ High duplication detected - consider workspace hoisting');
  } else if (duplicationRate > 25) {
    console.log('⚠️ Moderate duplication detected');
  } else {
    console.log('✅ Low duplication - good workspace organization');
  }
}

function displayWorkspaceSummary(workspaceData) {
  console.log('\n📋 Workspace Summary');
  console.log('====================');
  
  const totalDeps = workspaceData.reduce((sum, ws) => sum + ws.dependencyCount, 0);
  const totalDevDeps = workspaceData.reduce((sum, ws) => sum + ws.devDependencyCount, 0);
  const totalSize = workspaceData.reduce((sum, ws) => sum + ws.totalSize.total, 0);
  
  console.log(`Total workspaces: ${workspaceData.length}`);
  console.log(`Total production dependencies: ${totalDeps}`);
  console.log(`Total dev dependencies: ${totalDevDeps}`);
  console.log(`Estimated total size: ${totalSize.toFixed(0)} MB`);
  
  // Find largest workspaces
  const largest = workspaceData
    .sort((a, b) => b.totalSize.total - a.totalSize.total)
    .slice(0, 5);
  
  console.log('\n📦 Largest Workspaces (by dependency size):');
  largest.forEach((ws, index) => {
    console.log(`${(index + 1)}. ${ws.name}: ${ws.totalSize.total.toFixed(1)} MB`);
    console.log(`   Production: ${ws.dependencyCount} deps, Development: ${ws.devDependencyCount} deps`);
  });
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case '--json':
    const analysis = analyzeDependencies();
    console.log('\n📄 JSON Output:');
    console.log(JSON.stringify(analysis, null, 2));
    break;
    
  case '--help':
    console.log(`
KiTS Hub Dependency Analysis Tool

Usage: node scripts/analyze-dependencies.js [options]

Options:
  --json       Output analysis results in JSON format
  --help       Show this help message

Description:
  Analyzes dependency usage across all workspaces to identify
  optimization opportunities, security issues, and duplication.
    `);
    break;
    
  default:
    analyzeDependencies();
    break;
}

module.exports = { analyzeDependencies };
