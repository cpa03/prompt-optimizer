# Frontend Engineer - Long-term Memory

## Project Context
- Monorepo with packages: core, ui, web, desktop, extension, mcp-server
- Frontend: Vue 3 + TypeScript + Naive UI
- Package manager: pnpm
- Build: Vite

## Scan Date
2026-02-27

## Key Findings

### Code Quality
- Lint passes with no errors
- Build succeeds for UI package
- Typecheck passes (309 tests)
- Components properly clean up event listeners (checked ThemeToggleUI, InputWithSelect, FavoriteManager, etc.)

### Status of Issues (2026-02-27)
- Issue #635 (Memory leak in PromptOptimizerApp.vue): ✅ FIXED - cleanup code present in onBeforeUnmount
- Issue #636 (Debug logs in production): ✅ FIXED - all console.log properly controlled with DEBUG flags
- Issue #606 (Error boundaries): ✅ FIXED - ErrorBoundary component with error type detection + global error handler installed
- Issue #732 (Accessibility testing): 📋 TODO - Add a11y testing to CI pipeline

### TypeScript Fixes (2026-02-25)
- Fixed undefined `router` variable in PromptOptimizerApp.vue
  - Changed `router` to `routerInstance` in handleRouteErrorRetry function
- Fixed unused variable in useConversationOptimization.ts
  - Removed unused `removed` variable assignment

### Memory Leak Fix (2026-02-25)
- Fixed memory leak in PromptOptimizerApp.vue (#635)
- Added cleanup for 'prompt-optimizer:history-refresh' event listener in onBeforeUnmount
- All event listeners now properly cleaned up:
  - pagehide ✓
  - visibilitychange ✓
  - unhandledrejection ✓
  - prompt-optimizer:history-refresh ✓ (FIXED)

### ErrorBoundary Enhancement (2026-02-25)
- Enhanced ErrorBoundary.vue with error type detection and custom fallback UI
- Error types supported:
  - Error, TypeError, ReferenceError, SyntaxError, RangeError, DOMException
  - NetworkError, FetchError, TimeoutError
- Added onLogError prop for external logging integration
- Enhanced console.error logging with timestamp and stack trace
- Added i18n translations for all error types (en-US, zh-CN, zh-TW)
- All route components already protected via RouterView wrapper in PromptOptimizerApp.vue

### Bundle Size
- UI package main bundle: ~2.7MB uncompressed (820KB gzipped)
- This is large and could benefit from code splitting optimization in the future

### Components with Event Listeners (50+ files)
- Most components properly clean up in onUnmounted
- Fixed memory leak in PromptOptimizerApp.vue

### ESLint no-console Rule (2026-02-27)
- Changed no-console from 'off' to 'warn' in packages/ui/.eslintrc.json
- This prevents future console.log statements from being added to production code
- Existing console.log statements now show as warnings (297 warnings) for gradual cleanup
- Lint passes with 0 errors, 297 warnings (expected)
- Build passes successfully

## Action Items
- Issue #732: Add accessibility (a11y) testing to CI pipeline
  - Requires: eslint-plugin-vuejs-accessibility package installation
  - Requires: axe-core integration with Playwright
  - Requires: Creating 20+ a11y test cases
- Monitor ErrorBoundary improvements and gather user feedback
- Consider adding error reporting service integration (e.g., Sentry)
