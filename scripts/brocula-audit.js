#!/usr/bin/env node

/**
 * BroCula - Browser Console Guardian
 * 
 * Workflow:
 * 1. Check build and lint (fatal if fail)
 * 2. Start dev server
 * 3. Audit browser console for errors/warnings
 * 4. Run Lighthouse audit for performance
 * 5. Generate reports
 * 6. Create/update PR
 */

const { execSync } = require('child_process');
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  devServerPort: 15555,
  devServerTimeout: 15000,
  auditTimeout: 10000,
  mainBranch: 'develop',
  prBranchPrefix: 'brocula/audit'
};

class BroCula {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      checks: {},
      errors: [],
      warnings: [],
      lighthouse: null,
      status: 'running'
    };
  }

  log(message, type = 'info') {
    const icons = {
      info: '🧛',
      success: '✅',
      error: '🚨',
      warning: '⚠️',
      fatal: '💀'
    };
    console.log(`${icons[type]} BroCula: ${message}`);
  }

  fatal(message) {
    this.log(message, 'fatal');
    this.results.status = 'failed';
    this.saveReport();
    process.exit(1);
  }

  async runCommand(command, options = {}) {
    try {
      const result = execSync(command, {
        encoding: 'utf8',
        stdio: options.silent ? 'pipe' : 'inherit',
        timeout: options.timeout || 60000,
        ...options
      });
      return { success: true, output: result };
    } catch (error) {
      return { success: false, error: error.message, output: error.stdout || '' };
    }
  }

  async checkBuild() {
    this.log('Running build check...');
    const result = await this.runCommand('pnpm build', { silent: true, timeout: 180000 });
    
    if (!result.success) {
      this.fatal('Build failed - Fatal error!\n' + result.error);
    }
    
    this.results.checks.build = 'pass';
    this.log('Build passed', 'success');
  }

  async checkLint() {
    this.log('Running lint check...');
    const result = await this.runCommand('pnpm lint', { silent: true });
    
    if (!result.success) {
      this.fatal('Lint failed - Fatal error!\n' + result.error);
    }
    
    this.results.checks.lint = 'pass';
    this.log('Lint passed', 'success');
  }

  async startDevServer() {
    this.log('Starting dev server...');
    
    // Kill any existing process on the port
    try {
      execSync(`lsof -ti:${CONFIG.devServerPort} | xargs kill -9 2>/dev/null || true`);
    } catch (e) {
      // Ignore errors
    }
    
    // Start dev server in background
    const serverProcess = require('child_process').spawn(
      'pnpm',
      ['-F', '@prompt-optimizer/web', 'dev', '--port', CONFIG.devServerPort.toString()],
      {
        detached: true,
        stdio: 'ignore'
      }
    );
    
    serverProcess.unref();
    
    // Wait for server to be ready
    this.log(`Waiting for server on port ${CONFIG.devServerPort}...`);
    await new Promise(resolve => setTimeout(resolve, CONFIG.devServerTimeout));
    
    // Verify server is running
    try {
      const response = await fetch(`http://localhost:${CONFIG.devServerPort}`);
      if (response.ok) {
        this.log('Dev server is ready', 'success');
        return true;
      }
    } catch (e) {
      this.fatal('Dev server failed to start');
    }
  }

  async auditConsole() {
    this.log('Starting console audit...');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    const consoleLogs = [];
    
    page.on('console', (msg) => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    });
    
    page.on('pageerror', (error) => {
      consoleLogs.push({
        type: 'pageerror',
        text: error.message,
        timestamp: new Date().toISOString()
      });
    });
    
    try {
      await page.goto(`http://localhost:${CONFIG.devServerPort}`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      await page.waitForTimeout(CONFIG.auditTimeout);
    } catch (error) {
      this.log(`Console audit error: ${error.message}`, 'error');
    }
    
    const errors = consoleLogs.filter(log => ['error', 'pageerror'].includes(log.type));
    const warnings = consoleLogs.filter(log => log.type === 'warning');
    
    this.results.errors = errors;
    this.results.warnings = warnings;
    this.results.checks.console = errors.length === 0 ? 'pass' : 'fail';
    
    if (errors.length > 0) {
      this.log(`Found ${errors.length} console errors!`, 'error');
      errors.forEach((err, i) => {
        this.log(`  ${i + 1}. ${err.text}`, 'error');
      });
    } else {
      this.log('No console errors found', 'success');
    }
    
    if (warnings.length > 0) {
      this.log(`Found ${warnings.length} console warnings`, 'warning');
    }
    
    await browser.close();
  }

  saveReport() {
    const reportPath = path.join(process.cwd(), 'brocula-health-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    this.log(`Report saved to ${reportPath}`);
  }

  async run() {
    this.log('Starting BroCula audit workflow...');
    
    try {
      // Step 1: Build check (fatal if fail)
      await this.checkBuild();
      
      // Step 2: Lint check (fatal if fail)
      await this.checkLint();
      
      // Step 3: Start dev server
      await this.startDevServer();
      
      // Step 4: Console audit
      await this.auditConsole();
      
      // Save results
      this.results.status = this.results.errors.length > 0 ? 'failed' : 'passed';
      this.saveReport();
      
      // Final summary
      this.log('=== Audit Complete ===', 'success');
      this.log(`Status: ${this.results.status.toUpperCase()}`);
      this.log(`Errors: ${this.results.errors.length}`);
      this.log(`Warnings: ${this.results.warnings.length}`);
      
      if (this.results.errors.length > 0) {
        process.exit(1);
      }
      
    } catch (error) {
      this.fatal(`Unexpected error: ${error.message}`);
    }
  }
}

// Run BroCula
const brocula = new BroCula();
brocula.run().catch(console.error);
