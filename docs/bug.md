# Bug Tracking Document

## Active Bugs

### [ ] BUG-001: Node.js fs functions imported in browser bundle
**Location**: `packages/core/dist/index.js`
**Severity**: High
**Description**: Node.js filesystem functions (mkdir, dirname, writeFile, rename, unlink) are being imported into browser bundle via `__vite-browser-external`. This causes runtime errors in browser environment.
**Impact**: Browser version may crash when trying to use file system operations
**Files affected**: 
- packages/core/dist/index.js (lines 17990-17998)

### [ ] BUG-002: Vue currentInstance export warning
**Location**: `packages/ui/dist/index-g5iyPfz5.js`
**Severity**: Medium
**Description**: `currentInstance` is not properly exported by Vue, causing potential compatibility issues
**Impact**: May cause issues with Vue component lifecycle hooks
**Files affected**:
- packages/ui/dist/index-g5iyPfz5.js (line 2364)

### [ ] BUG-003: Dynamic import optimization warning
**Location**: UI package build
**Severity**: Low
**Description**: Dynamic imports of core package causing suboptimal chunking
**Impact**: Bundle size inefficiency, potential performance impact
**Files affected**:
- packages/core/dist/index.js dynamically imported but also statically imported

### [ ] BUG-004: Large bundle chunks exceeding 500KB
**Location**: Web build output
**Severity**: Medium
**Description**: Main bundle is 4.7MB (1.35MB gzipped), exceeding recommended 500KB limit
**Impact**: Slow initial page load, poor user experience
**Recommendation**:
- Use dynamic import() to code-split
- Configure manualChunks in rollupOptions
- Lazy load heavy components

## Fixed Bugs

*No bugs fixed yet*

## Notes

- Build completes successfully but with warnings
- Tests pass (all green)
- Linting passes with no errors
