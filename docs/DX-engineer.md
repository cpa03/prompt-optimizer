# DX Engineer Memory

## Overview
This document tracks DX improvements made to the prompt-optimizer monorepo.

## Improvements

### 2026-02-25: Add web package linting and type-checking

**Issue**: The root `pnpm lint` and `pnpm type-check` commands did not include the web package, leading to inconsistent DX across packages.

**Changes**:
1. Added `lint` and `type-check` scripts to `packages/web/package.json`
2. Added required devDependencies: eslint, eslint-plugin-vue, @typescript-eslint/eslint-plugin, @typescript-eslint/parser, typescript, vue-tsc
3. Created `packages/web/.eslintrc.json` (based on ui package config)
4. Updated root `package.json`:
   - Added `lint:web` and included web in main `lint` command
   - Added `lint:fix:web` and included in main `lint:fix` command
   - Added `type-check:web` and included in `type-check:all`

**Commands now available**:
- `pnpm lint` - runs lint for ui, mcp, and web packages
- `pnpm lint:web` - runs lint for web package only
- `pnpm lint:fix` - runs lint fix for ui, mcp, and web packages
- `pnpm lint:fix:web` - runs lint fix for web package only
- `pnpm type-check` - builds core and runs type-check for all packages
- `pnpm type-check:web` - runs type-check for web package only

**Verification**:
- All lint checks pass
- All type-checks pass
- All tests pass
