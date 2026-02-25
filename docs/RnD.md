# RnD Documentation

## Active Work

### PR #674: Type-safe error handling in retry.ts
- **Status**: Open
- **Branch**: rnd/retry-ts-type-safety
- **Priority**: Medium
- **Domain**: Type Safety / Code Quality
- **Summary**: Added ErrorWithStatus interface and hasStatusProperties type guard to replace unsafe `as any` casts for error properties (code, status, statusCode)
- **Related**: Issue #618

### PR #651: Type-safe error handling with isError type guard
- **Status**: Merged
- **Branch**: rnd/add-iserror-type-guard
- **Priority**: Medium
- **Domain**: Type Safety / Code Quality
- **Summary**: Added isError type guard and getErrorMessage utility to replace unsafe `any` usage in error handling

## Implemented Changes

### 2026-02-25
- PR #674: Added ErrorWithStatus interface and hasStatusProperties type guard to packages/core/src/utils/retry.ts
- PR #674: Replaced 2 instances of `as any` with type-safe code in isRetryableError function
- PR #674: All tests pass (1123 passed), lint passes with 0 new errors

### 2026-02-25
- PR #651: Added `isError` type guard and `getErrorMessage` utility to `packages/core/src/utils/error.ts`
- PR #651: Exported new utilities from `packages/core/src/utils/index.ts`
- PR #651: Updated LLMService to use type-safe error handling (3 instances of `any` removed)
- All tests pass (1114 passed), lint passes with 0 new errors

### 2026-02-25
- PR #643: Added RawExtractionResponse, RawExtractedVariable types to variable-extraction/types.ts
- PR #643: Added RawGenerationResponse, RawGeneratedValue types to variable-value-generation/types.ts
- PR #643: Updated service implementations to use unknown + type guards instead of any
- All tests pass (1114 passed), lint passes with 0 new errors

### 2026-02-24
- Added `pnpm audit --audit-level=moderate` step to `.github/workflows/test.yml`
- Location: After dependency installation, before tests
- Fails on moderate+ vulnerabilities

## Repository Health Indicators

### CI/CD
- GitHub Actions workflows present in `.github/workflows/`
- Security audit step added to test workflow
- Build and test steps properly configured

### Dependencies
- Uses pnpm as package manager
- Node.js 22 configured
- Playwright for E2E testing

## Notes
- Default branch: develop
- Main branch: main/master
- CI triggers on push to main/master and PRs
