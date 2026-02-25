# Frontend Engineer - Long-term Memory

## Project Context
- Monorepo with packages: core, ui, web, desktop, extension, mcp-server
- Frontend: Vue 3 + TypeScript + Naive UI
- Package manager: pnpm
- Build: Vite

## Scan Date
2026-02-24

## Key Findings

### Code Quality
- Lint passes with no errors
- Build succeeds for UI package
- Components properly clean up event listeners (checked ThemeToggleUI, InputWithSelect, FavoriteManager, etc.)

### Bundle Size
- UI package main bundle: ~2.6MB uncompressed (813KB gzipped)
- This is large and could benefit from code splitting optimization in the future

### Missing Features Identified
1. **Vue Error Boundaries** - Issue #606 exists but labeled as "Backend" with owner "backend-engineer"
   - web/main.ts has global window error handlers
   - But NO Vue-specific errorHandler or errorCaptured hooks
   - UI package index.ts lacks error handling setup

### Components with Event Listeners (50+ files)
- Most components properly clean up in onUnmounted
- No obvious memory leak issues found

## Action Items
- Implement Vue error boundaries in UI package for graceful error handling
- Consider this as a frontend-specific improvement (not backend)
