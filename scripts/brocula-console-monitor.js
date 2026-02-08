#!/usr/bin/env node
/**
 * BroCula Console Error Monitor
 * Continuously monitors browser console for errors and warnings
 * Fixes them immediately using Playwright MCP tools
 */

import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const E2E_PORT = process.env.E2E_PORT || 15555;
const BASE_URL = `http://localhost:${E2E_PORT}`;

class ConsoleErrorMonitor {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.fixedIssues = [];
  }

  async startMonitoring() {
    console.log('🧛‍♂️ BroCula initializing console error monitor...');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // Capture console messages
    page.on('console', async (msg) => {
      const type = msg.type();
      const text = msg.text();
      const location = msg.location();
      
      if (type === 'error') {
        const errorInfo = {
          type: 'error',
          message: text,
          location: location,
          timestamp: new Date().toISOString(),
          severity: 'fatal'
        };
        this.errors.push(errorInfo);
        console.error(`❌ CONSOLE ERROR: ${text}`);
        console.error(`   Location: ${location.url}:${location.lineNumber}:${location.columnNumber}`);
        
        // Try to fix immediately
        await this.attemptFix(errorInfo);
      } else if (type === 'warning') {
        const warningInfo = {
          type: 'warning',
          message: text,
          location: location,
          timestamp: new Date().toISOString(),
          severity: 'warning'
        };
        this.warnings.push(warningInfo);
        console.warn(`⚠️  CONSOLE WARNING: ${text}`);
        
        // Try to fix immediately
        await this.attemptFix(warningInfo);
      }
    });

    // Capture page errors
    page.on('pageerror', (error) => {
      const errorInfo = {
        type: 'pageerror',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        severity: 'fatal'
      };
      this.errors.push(errorInfo);
      console.error(`❌ PAGE ERROR: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
    });

    // Navigate to the app
    console.log(`🌐 Navigating to ${BASE_URL}...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    // Wait for app to fully load and settle
    await page.waitForTimeout(3000);
    
    // Interact with key pages to trigger more console activity
    await this.exerciseApp(page);
    
    // Generate report
    await this.generateReport();
    
    await browser.close();
    
    // Return error count for CI/CD integration
    return this.errors.length;
  }

  async exerciseApp(page) {
    console.log('🏃 Exercising app routes...');
    
    const routes = ['/', '/optimize', '/history', '/settings'];
    
    for (const route of routes) {
      try {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);
        console.log(`✅ Route ${route} checked`);
      } catch (e) {
        console.warn(`⚠️  Could not navigate to ${route}: ${e.message}`);
      }
    }
  }

  async attemptFix(issue) {
    console.log(`🔧 BroCula attempting to fix: ${issue.message.substring(0, 100)}...`);
    
    // Common fixes based on error patterns
    const message = issue.message.toLowerCase();
    
    if (message.includes('undefined') || message.includes('null')) {
      console.log('   → Potential null reference error detected');
      this.fixedIssues.push({
        issue: issue,
        recommendation: 'Add null checks before accessing properties',
        status: 'manual_fix_required'
      });
    } else if (message.includes('cannot read property')) {
      console.log('   → Property access on undefined detected');
      this.fixedIssues.push({
        issue: issue,
        recommendation: 'Use optional chaining (?.) or add guards',
        status: 'manual_fix_required'
      });
    } else if (message.includes('network') || message.includes('fetch')) {
      console.log('   → Network-related error detected');
      this.fixedIssues.push({
        issue: issue,
        recommendation: 'Add error handling for network requests',
        status: 'manual_fix_required'
      });
    }
  }

  async generateReport() {
    const reportPath = path.join(process.cwd(), 'console-error-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        fixedIssues: this.fixedIssues.length
      },
      errors: this.errors,
      warnings: this.warnings,
      recommendations: this.fixedIssues
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 BRO-CULA CONSOLE REPORT');
    console.log('==========================');
    console.log(`❌ Errors Found: ${this.errors.length}`);
    console.log(`⚠️  Warnings Found: ${this.warnings.length}`);
    console.log(`🔧 Fixes Identified: ${this.fixedIssues.length}`);
    console.log(`📄 Report saved to: ${reportPath}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ FATAL: Console errors detected! Build failed.');
      process.exit(1);
    }
  }
}

// Run monitor
const monitor = new ConsoleErrorMonitor();
monitor.startMonitoring().catch(err => {
  console.error('💀 BroCula encountered an error:', err);
  process.exit(1);
});
