# Frontend Engineer - Long-term Memory

## Project Context
- Monorepo with packages: core, ui, web, desktop, extension, mcp-server
- Frontend: Vue 3 + TypeScript + Naive UI
- Package manager: pnpm
- Build: Vite

## Scan Date
2026-02-25

## Key Findings

### Code Quality
- Lint passes with no errors
- Build succeeds for UI package
- Components properly clean up event listeners (checked ThemeToggleUI, InputWithSelect, FavoriteManager, etc.)

### Memory Leak Fix (2026-02-25)
- Fixed memory leak in PromptOptimizerApp.vue (#635)
- Added cleanup for 'prompt-optimizer:history-refresh' event listener in onBeforeUnmount
- All event listeners now properly cleaned up:
  - pagehide ✓
  - visibilitychange ✓
  - unhandledrejection ✓
  - prompt-optimizer:history-refresh ✓ (FIXED)

### Bundle Size
- UI package main bundle: ~2.7MB uncompressed (820KB gzipped)
- This is large and could benefit from code splitting optimization in the future

### Missing Features Identified
1. **Vue Error Boundaries** - Issue #606 exists but labeled as "Backend" with owner "backend-engineer"
   - web/main.ts has global window error handlers
   - But NO Vue-specific errorHandler or errorCaptured hooks
   - UI package index.ts lacks error handling setup

### Components with Event Listeners (50+ files)
- Most components properly clean up in onUnmounted
- Fixed memory leak in PromptOptimizerApp.vue

## Action Items
- Implement Vue error boundaries in UI package for graceful error handling
- Consider this as a frontend-specific improvement (not backend)
