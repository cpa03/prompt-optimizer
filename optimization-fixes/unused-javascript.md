# Fix: Reduce unused JavaScript

**Severity:** HIGH

**Current Score:** 0/100

**Description:** Reduce unused JavaScript and defer loading scripts until they are required to decrease bytes consumed by network activity. [Learn how to reduce unused JavaScript](https://developer.chrome.com/docs/lighthouse/performance/unused-javascript/).

**Current Value:** Potential savings of 2,018 KiB

## Recommended Fix

### Remove Unused JavaScript

**Action:** Analyze bundle with tools like webpack-bundle-analyzer

**Steps:**
1. Run `pnpm -F @prompt-optimizer/web build --analyze`
2. Identify unused/large dependencies
3. Use tree-shaking friendly imports: `import { specific } from 'lib'`
4. Consider lazy loading with dynamic imports: `const module = await import('./module')`
5. Remove unused dependencies from package.json

## Implementation Steps

1. [ ] Analyze current implementation
2. [ ] Implement the fix
3. [ ] Test in browser
4. [ ] Re-run Lighthouse audit
5. [ ] Verify improvement
