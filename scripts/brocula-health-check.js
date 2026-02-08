#!/usr/bin/env node
/**
 * BroCula Quick Health Check
 * Runs build, lint, and generates a comprehensive health report
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

console.log('🧛‍♂️ BRO-CULA QUICK HEALTH CHECK');
console.log('================================\n');

const results = {
  timestamp: new Date().toISOString(),
  checks: {},
  status: 'pending'
};

// Check 1: Build Status
console.log('🔨 CHECK 1: Build Status');
console.log('─────────────────────────');
try {
  execSync('pnpm build:core', { stdio: 'pipe' });
  console.log('✅ Core build: PASS');
  results.checks.buildCore = 'pass';
} catch (e) {
  console.error('❌ Core build: FAIL');
  results.checks.buildCore = 'fail';
  results.status = 'failed';
}

try {
  execSync('pnpm build:ui', { stdio: 'pipe' });
  console.log('✅ UI build: PASS');
  results.checks.buildUI = 'pass';
} catch (e) {
  console.error('❌ UI build: FAIL');
  results.checks.buildUI = 'fail';
  results.status = 'failed';
}

// Check 2: Lint Status
console.log('\n🧹 CHECK 2: Lint Status');
console.log('─────────────────────────');
try {
  execSync('pnpm lint', { stdio: 'pipe' });
  console.log('✅ Lint: PASS');
  results.checks.lint = 'pass';
} catch (e) {
  console.warn('⚠️  Lint: ISSUES FOUND (attempting auto-fix...)');
  try {
    execSync('pnpm lint:fix', { stdio: 'pipe' });
    console.log('✅ Lint fix: SUCCESS');
    results.checks.lint = 'fixed';
  } catch (fixError) {
    console.error('❌ Lint fix: FAIL - Manual intervention required');
    results.checks.lint = 'fail';
    results.status = 'failed';
  }
}

// Check 3: Unit Tests
console.log('\n🧪 CHECK 3: Unit Tests');
console.log('─────────────────────────');
try {
  execSync('pnpm test:fast', { stdio: 'pipe', timeout: 120000 });
  console.log('✅ Unit tests: PASS');
  results.checks.unitTests = 'pass';
} catch (e) {
  console.error('❌ Unit tests: FAIL');
  results.checks.unitTests = 'fail';
  results.status = 'failed';
}

// Check 4: Git Status
console.log('\n📋 CHECK 4: Git Status');
console.log('─────────────────────────');
const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
const status = execSync('git status --short', { encoding: 'utf8' }).trim();
const behindMain = execSync('git rev-list --count HEAD..origin/main 2>/dev/null || echo "0"', { encoding: 'utf8' }).trim();

console.log(`Current branch: ${branch}`);
console.log(`Commits behind main: ${behindMain}`);
console.log(`Uncommitted changes: ${status ? 'YES' : 'NO'}`);

results.checks.git = {
  branch,
  behindMain: parseInt(behindMain),
  hasUncommittedChanges: !!status
};

// Check 5: Dependencies Check
console.log('\n📦 CHECK 5: Dependencies');
console.log('─────────────────────────');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log(`Node version required: ${packageJson.engines.node}`);
console.log(`Package manager: ${packageJson.packageManager}`);
results.checks.dependencies = {
  nodeEngine: packageJson.engines.node,
  packageManager: packageJson.packageManager
};

// Check 6: File Structure
console.log('\n📁 CHECK 6: Project Structure');
console.log('─────────────────────────');
const packages = fs.readdirSync('packages').filter(f => fs.statSync(`packages/${f}`).isDirectory());
console.log(`Packages found: ${packages.join(', ')}`);
results.checks.structure = {
  packages
};

// Generate Report
console.log('\n📊 HEALTH REPORT SUMMARY');
console.log('═══════════════════════════════════════════════════════');

const hasFailures = Object.values(results.checks).some(check => 
  check === 'fail' || (typeof check === 'object' && check.status === 'fail')
);

if (hasFailures) {
  console.log('❌ STATUS: HEALTH CHECK FAILED');
  console.log('\n⚠️  CRITICAL ISSUES DETECTED:');
  
  if (results.checks.buildCore === 'fail') console.log('   - Core build failure');
  if (results.checks.buildUI === 'fail') console.log('   - UI build failure');
  if (results.checks.lint === 'fail') console.log('   - Lint errors (manual fix required)');
  if (results.checks.unitTests === 'fail') console.log('   - Unit test failures');
  
  results.status = 'failed';
} else {
  console.log('✅ STATUS: ALL CHECKS PASSED');
  results.status = 'passed';
}

console.log('\n───────────────────────────────────────────────────────');
console.log(`Report generated: ${results.timestamp}`);
console.log(`Overall Status: ${results.status.toUpperCase()}`);

// Save report
fs.writeFileSync('brocula-health-report.json', JSON.stringify(results, null, 2));
console.log('\n📄 Full report saved to: brocula-health-report.json');

// Exit with appropriate code
process.exit(hasFailures ? 1 : 0);
