# Fix: Serve static assets with an efficient cache policy

**Severity:** MEDIUM

**Current Score:** 50/100

**Description:** A long cache lifetime can speed up repeat visits to your page. [Learn more about efficient cache policies](https://developer.chrome.com/docs/lighthouse/performance/uses-long-cache-ttl/).

**Current Value:** 9 resources found

## Recommended Fix

### Configure Long Cache TTL

**Action:** Add cache headers to static assets

**Steps:**
1. Configure server/Vercel to set Cache-Control headers
2. Use content hashing in filenames
3. Set long cache times for static assets (1 year)
4. Ensure HTML is not cached or has short TTL

## Implementation Steps

1. [ ] Analyze current implementation
2. [ ] Implement the fix
3. [ ] Test in browser
4. [ ] Re-run Lighthouse audit
5. [ ] Verify improvement
