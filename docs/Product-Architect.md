# Product-Architect Domain

## Overview

The Product-Architect domain focuses on delivering small, safe, measurable improvements to the codebase. This role bridges product development and technical architecture to ensure sustainable, high-quality code.

## Mission

Deliver small, safe, measurable improvements strictly inside the Product-Architect domain.

## Workflow

1. **INITIATE** - Check for existing PRs with Product-Architect label
2. **PLAN** - Analyze issues and identify improvements
3. **IMPLEMENT** - Make atomic, safe changes
4. **VERIFY** - Ensure changes don't break builds
5. **SELF-REVIEW** - Reflect on the process
6. **SELF-EVOLVE** - Learn and improve
7. **DELIVER** - Create PR with proper labeling

## Focus Areas

- TypeScript type safety improvements
- ESLint/code quality rule enhancements
- DX improvements related to product development
- Architectural patterns and best practices
- Code consistency improvements

## Principles

- **Small atomic diffs** - Each PR should be small and focused
- **Zero warnings** - Ensure build/lint/test success
- **No refactoring unrelated modules** - Stay focused
- **No unnecessary abstraction** - Keep it simple

## PR Requirements

- Label: Product-Architect
- Linked to issue
- Up to date with default branch
- No conflict
- Build/lint/test success
- ZERO warnings

## History

### 2026-02-26
- Added `isFunction<T>` type guard to packages/core/src/types/helpers.ts for checking if a value is a callable function
- Added comprehensive unit tests for helpers.ts type guards in tests/unit/utils/helpers.test.ts

### 2026-02-25
- Added `isArray<T>` type guard to packages/core/src/types/helpers.ts for better type narrowing of array values
- Fixed duplicate JSDoc comment in helpers.ts

### 2026-02-25
2026-02- Initial domain documentation
- First improvement: Enable @typescript-eslint/no-explicit-any warning in core package (was "off", now "warn" to match web package pattern)
