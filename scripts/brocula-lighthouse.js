#!/usr/bin/env node
/**
 * BroCula Lighthouse Optimizer
 * Audits web app with Lighthouse and generates optimization tasks
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import * as fs from 'fs';
import * as path from 'path';

const E2E_PORT = process.env.E2E_PORT || 15555;
const BASE_URL = `http://localhost:${E2E_PORT}`;

class LighthouseOptimizer {
  constructor() {
    this.opportunities = [];
    this.diagnostics = [];
  }

  async runAudit() {
    console.log('🧛‍♂️ BroCula initializing Lighthouse audit...');
    
    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox'] });
    
    const options = {
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
    };

    const runnerResult = await lighthouse(BASE_URL, options);
    
    await chrome.kill();

    // Extract scores
    const scores = {
      performance: Math.round(runnerResult.lhr.categories.performance.score * 100),
      accessibility: Math.round(runnerResult.lhr.categories.accessibility.score * 100),
      bestPractices: Math.round(runnerResult.lhr.categories['best-practices'].score * 100),
      seo: Math.round(runnerResult.lhr.categories.seo.score * 100),
    };

    console.log('\n📊 LIGHTHOUSE SCORES');
    console.log('====================');
    console.log(`🚀 Performance:     ${scores.performance}/100 ${this.getScoreEmoji(scores.performance)}`);
    console.log(`♿ Accessibility:   ${scores.accessibility}/100 ${this.getScoreEmoji(scores.accessibility)}`);
    console.log(`✅ Best Practices:  ${scores.bestPractices}/100 ${this.getScoreEmoji(scores.bestPractices)}`);
    console.log(`🔍 SEO:             ${scores.seo}/100 ${this.getScoreEmoji(scores.seo)}`);

    // Extract opportunities
    const opportunities = runnerResult.lhr.audits;
    this.analyzeOpportunities(opportunities);

    // Generate optimization report
    await this.generateOptimizationReport(scores, opportunities);

    // Generate actionable fixes
    await this.generateFixes();

    // Fail if any score is below threshold (90 for production)
    const minScore = 90;
    const failingCategories = Object.entries(scores)
      .filter(([_, score]) => score < minScore)
      .map(([category, _]) => category);

    if (failingCategories.length > 0) {
      console.log(`\n❌ FATAL: Lighthouse scores below ${minScore} in: ${failingCategories.join(', ')}`);
      console.log('   Fix these issues before creating PR.');
      return 1;
    }

    console.log('\n✅ All Lighthouse scores above threshold!');
    return 0;
  }

  getScoreEmoji(score) {
    if (score >= 90) return '🟢';
    if (score >= 70) return '🟡';
    return '🔴';
  }

  analyzeOpportunities(audits) {
    console.log('\n🔍 ANALYZING OPTIMIZATION OPPORTUNITIES...');
    
    const importantAudits = [
      'unused-javascript',
      'unused-css-rules',
      'modern-image-formats',
      'efficiently-encode-images',
      'render-blocking-resources',
      'unminified-javascript',
      'unminified-css',
      'uses-long-cache-ttl',
      'total-byte-weight',
      'dom-size',
      'third-party-summary'
    ];

    for (const [auditId, audit] of Object.entries(audits)) {
      if (importantAudits.includes(auditId) && audit.score !== null && audit.score < 1) {
        const opportunity = {
          id: auditId,
          title: audit.title,
          description: audit.description,
          score: audit.score,
          displayValue: audit.displayValue,
          details: audit.details,
          severity: audit.score < 0.5 ? 'high' : audit.score < 0.8 ? 'medium' : 'low'
        };
        
        this.opportunities.push(opportunity);
        
        console.log(`\n⚠️  ${audit.title}`);
        console.log(`   Score: ${Math.round(audit.score * 100)}/100`);
        console.log(`   ${audit.displayValue || ''}`);
      }
    }
  }

  async generateOptimizationReport(scores, audits) {
    const reportPath = path.join(process.cwd(), 'lighthouse-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      scores,
      opportunities: this.opportunities,
      fullAudits: audits
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Lighthouse report saved to: ${reportPath}`);
  }

  async generateFixes() {
    if (this.opportunities.length === 0) {
      console.log('\n✅ No optimization opportunities found - site is already optimized!');
      return;
    }

    console.log('\n🔧 GENERATING OPTIMIZATION FIXES...');
    
    const fixesDir = path.join(process.cwd(), 'optimization-fixes');
    if (!fs.existsSync(fixesDir)) {
      fs.mkdirSync(fixesDir, { recursive: true });
    }

    for (const opp of this.opportunities) {
      const fixFile = path.join(fixesDir, `${opp.id}.md`);
      
      let fixContent = `# Fix: ${opp.title}\n\n`;
      fixContent += `**Severity:** ${opp.severity.toUpperCase()}\n\n`;
      fixContent += `**Current Score:** ${Math.round(opp.score * 100)}/100\n\n`;
      fixContent += `**Description:** ${opp.description}\n\n`;
      fixContent += `**Current Value:** ${opp.displayValue || 'N/A'}\n\n`;
      fixContent += `## Recommended Fix\n\n`;
      
      // Generate specific fix based on audit type
      switch (opp.id) {
        case 'unused-javascript':
          fixContent += this.generateUnusedJSFix();
          break;
        case 'unused-css-rules':
          fixContent += this.generateUnusedCSSFix();
          break;
        case 'modern-image-formats':
          fixContent += this.generateImageFormatFix();
          break;
        case 'efficiently-encode-images':
          fixContent += this.generateImageOptimizationFix();
          break;
        case 'render-blocking-resources':
          fixContent += this.generateRenderBlockingFix();
          break;
        case 'unminified-javascript':
        case 'unminified-css':
          fixContent += this.generateMinificationFix();
          break;
        case 'uses-long-cache-ttl':
          fixContent += this.generateCacheFix();
          break;
        default:
          fixContent += `Review and optimize this metric based on Lighthouse recommendations.\n`;
      }
      
      fixContent += `\n## Implementation Steps\n\n`;
      fixContent += `1. [ ] Analyze current implementation\n`;
      fixContent += `2. [ ] Implement the fix\n`;
      fixContent += `3. [ ] Test in browser\n`;
      fixContent += `4. [ ] Re-run Lighthouse audit\n`;
      fixContent += `5. [ ] Verify improvement\n`;
      
      fs.writeFileSync(fixFile, fixContent);
      console.log(`   📝 Created fix guide: ${fixFile}`);
    }
    
    console.log(`\n📁 All fix guides saved to: ${fixesDir}/`);
  }

  generateUnusedJSFix() {
    return `### Remove Unused JavaScript\n\n` +
           `**Action:** Analyze bundle with tools like webpack-bundle-analyzer\n\n` +
           `**Steps:**\n` +
           `1. Run \`pnpm -F @prompt-optimizer/web build --analyze\`\n` +
           `2. Identify unused/large dependencies\n` +
           `3. Use tree-shaking friendly imports: \`import { specific } from 'lib'\`\n` +
           `4. Consider lazy loading with dynamic imports: \`const module = await import('./module')\`\n` +
           `5. Remove unused dependencies from package.json\n`;
  }

  generateUnusedCSSFix() {
    return `### Remove Unused CSS\n\n` +
           `**Action:** Purge unused CSS with PurgeCSS or similar\n\n` +
           `**Steps:**\n` +
           `1. Configure PurgeCSS in vite.config.ts\n` +
           `2. Ensure all used classes are in safelist\n` +
           `3. Run build and verify styles\n` +
           `4. Remove unused CSS files or imports\n`;
  }

  generateImageFormatFix() {
    return `### Use Modern Image Formats\n\n` +
           `**Action:** Convert images to WebP or AVIF format\n\n` +
           `**Steps:**\n` +
           `1. Use WebP format for photographs\n` +
           `2. Use SVG for icons and logos\n` +
           `3. Consider using <picture> element with fallbacks\n` +
           `4. Use responsive images with srcset\n` +
           `5. Configure Vite to handle image optimization\n`;
  }

  generateImageOptimizationFix() {
    return `### Optimize Image Encoding\n\n` +
           `**Action:** Compress images without quality loss\n\n` +
           `**Steps:**\n` +
           `1. Use tools like imagemin or squoosh\n` +
           `2. Set appropriate quality levels (80-85% for WebP)\n` +
           `3. Remove metadata from images\n` +
           `4. Consider using a CDN for image optimization\n`;
  }

  generateRenderBlockingFix() {
    return `### Eliminate Render-Blocking Resources\n\n` +
           `**Action:** Defer non-critical CSS and JS\n\n` +
           `**Steps:**\n` +
           `1. Add \`defer\` or \`async\` to script tags\n` +
           `2. Inline critical CSS\n` +
           `3. Load non-critical CSS asynchronously\n` +
           `4. Use preload for critical resources\n`;
  }

  generateMinificationFix() {
    return `### Enable Minification\n\n` +
           `**Action:** Ensure Vite is configured for production minification\n\n` +
           `**Steps:**\n` +
           `1. Check vite.config.ts has minify: 'terser'\n` +
           `2. Ensure terser is configured to remove console.log\n` +
           `3. Verify build output is minified\n` +
           `4. Check for source maps in production\n`;
  }

  generateCacheFix() {
    return `### Configure Long Cache TTL\n\n` +
           `**Action:** Add cache headers to static assets\n\n` +
           `**Steps:**\n` +
           `1. Configure server/Vercel to set Cache-Control headers\n` +
           `2. Use content hashing in filenames\n` +
           `3. Set long cache times for static assets (1 year)\n` +
           `4. Ensure HTML is not cached or has short TTL\n`;
  }
}

// Run audit
const optimizer = new LighthouseOptimizer();
optimizer.runAudit().then(exitCode => {
  process.exit(exitCode);
}).catch(err => {
  console.error('💀 BroCula Lighthouse audit failed:', err);
  process.exit(1);
});
