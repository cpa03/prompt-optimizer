# Fix: Serve images in next-gen formats

**Severity:** MEDIUM

**Current Score:** 50/100

**Description:** Image formats like WebP and AVIF often provide better compression than PNG or JPEG, which means faster downloads and less data consumption. [Learn more about modern image formats](https://developer.chrome.com/docs/lighthouse/performance/uses-webp-images/).

**Current Value:** Potential savings of 10 KiB

## Recommended Fix

### Use Modern Image Formats

**Action:** Convert images to WebP or AVIF format

**Steps:**
1. Use WebP format for photographs
2. Use SVG for icons and logos
3. Consider using <picture> element with fallbacks
4. Use responsive images with srcset
5. Configure Vite to handle image optimization

## Implementation Steps

1. [ ] Analyze current implementation
2. [ ] Implement the fix
3. [ ] Test in browser
4. [ ] Re-run Lighthouse audit
5. [ ] Verify improvement
