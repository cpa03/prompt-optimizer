# 🧛‍♂️ BroCula - Browser Console & Lighthouse Guardian

BroCula is a strict workflow automation system for maintaining browser console error-free applications and optimal Lighthouse scores.

## Philosophy

> **"Zero console errors. Maximum performance. No exceptions."**

BroCula enforces:
1. **Fatal Error Policy**: Any console error or warning is a fatal failure
2. **Lighthouse Threshold**: Minimum 90/100 score in all categories
3. **Build/Lint Compliance**: All builds and lint checks must pass
4. **PR Hygiene**: Automatic PR creation/updates with proper branch synchronization

## Quick Start

```bash
# Run complete health check
pnpm brocula:health

# Run full monitoring cycle once
pnpm brocula:once

# Start continuous monitoring
pnpm brocula

# Check console errors only
pnpm brocula:console

# Run Lighthouse audit only
pnpm brocula:lighthouse
```

## Scripts

### 1. `brocula-health-check.js` 🏥
Quick health assessment of the project:
- ✅ Build status (core, ui)
- ✅ Lint compliance
- ✅ Unit test results
- ✅ Git branch status
- ✅ Dependencies check
- ✅ Project structure validation

**Usage:**
```bash
node scripts/brocula-health-check.js
```

### 2. `brocula-console-monitor.js` 🎭
Monitors browser console for errors and warnings:
- Launches headless Chrome via Playwright
- Captures all console messages
- Categorizes errors by severity
- Generates detailed JSON report
- **Fails immediately on any error**

**Usage:**
```bash
# Requires dev server running
pnpm -F @prompt-optimizer/web dev &
node scripts/brocula-console-monitor.js
```

### 3. `brocula-lighthouse.js` 💡
Comprehensive Lighthouse audit and optimization:
- Audits all 4 categories (Performance, Accessibility, Best Practices, SEO)
- Identifies optimization opportunities
- Generates fix guides for each issue
- **Fails if any score < 90**

**Usage:**
```bash
# Requires dev server running
pnpm -F @prompt-optimizer/web dev &
node scripts/brocula-lighthouse.js
```

### 4. `brocula-master.js` 🧛‍♂️
Master orchestrator that runs the complete workflow:

**Single Run Mode:**
```bash
pnpm brocula:once
# or
node scripts/brocula-master.js --once
```

**Continuous Mode:**
```bash
pnpm brocula
# Runs every 5 minutes indefinitely
```

**Workflow Steps:**
1. Pre-flight checks (git sync, uncommitted changes)
2. Build application (core → ui → web)
3. Run lint (auto-fix if possible)
4. Start dev server
5. Monitor console errors
6. Run Lighthouse audit
7. Apply automatic fixes
8. Create/update PR

## Configuration

Edit `scripts/brocula-master.js` to customize:

```javascript
const CONFIG = {
  mainBranch: 'main',           // Target branch for PRs
  minLighthouseScore: 90,       // Minimum acceptable score
  checkInterval: 300000,        // Continuous mode interval (ms)
  maxRetries: 3                 // Max fix attempts per issue
};
```

## Error Handling

### Fatal Errors (Build/Lint Failure)
- Console errors detected
- Build failures
- Lint errors that can't be auto-fixed
- Lighthouse scores below threshold

**Action:** Workflow stops immediately, manual intervention required

### Warnings (Logged but Continue)
- Lighthouse optimization opportunities
- Minor console warnings
- Non-blocking issues

**Action:** Logged in reports, fix guides generated

## Output Files

- `brocula-health-report.json` - Health check results
- `console-error-report.json` - Console error details
- `lighthouse-report.json` - Lighthouse scores and opportunities
- `optimization-fixes/*.md` - Fix guides for each issue

## CI/CD Integration

Add to your GitHub Actions or CI pipeline:

```yaml
- name: BroCula Health Check
  run: pnpm brocula:health

- name: BroCula Full Audit
  run: pnpm brocula:once
```

## Best Practices

1. **Run before every commit:**
   ```bash
   pnpm brocula:health
   ```

2. **Run before creating PR:**
   ```bash
   pnpm brocula:once
   ```

3. **Monitor in development:**
   ```bash
   pnpm brocula  # Continuous mode
   ```

4. **Fix console errors immediately** - Don't let them accumulate

5. **Maintain Lighthouse scores** - Address optimization opportunities promptly

## Troubleshooting

### "Cannot find module '@playwright/test'"
```bash
pnpm install
```

### "Chrome not found"
```bash
# Install Chrome/Chromium
# Ubuntu/Debian:
sudo apt-get install chromium-browser

# macOS:
brew install --cask google-chrome
```

### "Dev server not starting"
Check that ports 15555 (E2E) or default dev port are not in use:
```bash
pnpm kill:dev
```

## Contributing

BroCula is part of the prompt-optimizer project. Follow existing code style and ensure:
- All checks pass before submitting
- Console error-free in browser
- Lighthouse scores maintained

## License

AGPL-3.0-only - Same as parent project
