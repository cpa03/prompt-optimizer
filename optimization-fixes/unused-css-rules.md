# Fix: Reduce unused CSS

**Severity:** HIGH

**Current Score:** 0/100

**Description:** Reduce unused rules from stylesheets and defer CSS not used for above-the-fold content to decrease bytes consumed by network activity. [Learn how to reduce unused CSS](https://developer.chrome.com/docs/lighthouse/performance/unused-css-rules/).

**Current Value:** Potential savings of 18 KiB

## Recommended Fix

### Remove Unused CSS

**Action:** Purge unused CSS with PurgeCSS or similar

**Steps:**
1. Configure PurgeCSS in vite.config.ts
2. Ensure all used classes are in safelist
3. Run build and verify styles
4. Remove unused CSS files or imports

## Implementation Steps

1. [ ] Analyze current implementation
2. [ ] Implement the fix
3. [ ] Test in browser
4. [ ] Re-run Lighthouse audit
5. [ ] Verify improvement
