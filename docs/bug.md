# Bug Tracking Document

## Active Bugs

### [x] BUG-001: Node.js fs functions imported in browser bundle
**Location**: `packages/core/dist/index.js`
**Severity**: High
**Description**: Node.js filesystem functions (join, access, readFile, copyFile, mkdir, dirname, writeFile, rename, unlink) are being imported into browser bundle via `__vite-browser-external`. This causes runtime errors in browser environment.
**Impact**: Browser version may crash when trying to use file system operations
**Files affected**: 
- packages/core/dist/index.js (lines 17835-18009)
**Status**: FIXED - Created separate electron.ts entry point for FileStorageProvider, removed from main index.ts
**Solution**: 
- Created `/packages/core/src/electron.ts` as separate entry point for Node.js-only exports
- Updated `package.json` exports to include `./electron` subpath
- Removed FileStorageProvider from main index.ts exports
- Updated build script to compile both entry points
- Bundle size reduced from 891KB to 877KB

### [-] BUG-002: Vue currentInstance export warning
**Location**: `packages/ui/dist/index-cJUwbj-o.js`
**Severity**: Low
**Description**: `currentInstance` is not properly exported by Vue. This is a compatibility issue between vue-i18n@11.2.2 and @intlify/vue-i18n-extensions which expects vue-i18n@^10.0.0
**Impact**: None - warning only, code falls back to getCurrentInstance()
**Files affected**:
- packages/ui/dist/index-cJUwbj-o.js (line 2364)
**Status**: ACCEPTED - This is a dependency version mismatch that doesn't affect runtime functionality. The code uses a fallback pattern: `"currentInstance" in qh ? qh["currentInstance"] : qh.getCurrentInstance()`
**Note**: To fully resolve, would need to downgrade vue-i18n to ^10.0.0 or wait for @intlify/vue-i18n-extensions update

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

- [x] BUG-001: Node.js fs functions in browser bundle
  - Fixed by creating separate electron.ts entry point
  - Bundle size reduced by ~14KB

## Notes

- Build completes successfully but with warnings
- Tests pass (all green - 262 tests)
- Linting passes with no errors
- Only remaining warnings: Vue currentInstance (harmless) and bundle size (optimization)
