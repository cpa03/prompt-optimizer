# RnD Documentation

## Active Work

### PR #722: Add unit tests for VariableExtractionService
- **Status**: Open
- **Branch**: rnd/704-variable-extraction-unit-tests
- **Priority**: Medium
- **Domain**: Innovation / Testing
- **Summary**: Added 17 unit tests for VariableExtractionService covering extraction, validation, parsing, performance, and error handling

### PR #674: Type-safe error handling in retry.ts
- **Status**: Closed (merged)
- **Branch**: rnd/retry-ts-type-safety
- **Priority**: Medium
- **Domain**: Type Safety / Code Quality
- **Summary**: Added type-safe error handling with ErrorWithStatus interface and hasStatusProperty type guard

### PR #698: Fix error cause type safety
- **Status**: Merged
- **Branch**: rnd/fix-error-cause-type-safety
- **Priority**: Medium  
- **Domain**: Type Safety / Code Quality
- **Summary**: Replace unsafe `as any` cast in setErrorCause with proper ES2022 Error type

### PR #643: Type safety improvements for variable extraction and value generation services
- **Status**: Merged
- **Branch**: rnd/type-safety-raw-response-types
- **Priority**: Medium
- **Domain**: Type Safety / Code Quality
- **Summary**: Added Raw* types to improve type safety when parsing LLM responses, replacing `any` with `unknown` + type guards

### Issue #603: Add pnpm security audit to CI pipeline
- **Status**: PR In Progress
- **Branch**: rndi-603-pnpm-audit
- **Priority**: High
- **Domain**: DX/Security

## Implemented Changes

### 2026-02-26
- PR #722: Added 17 unit tests for VariableExtractionService in `packages/core/tests/unit/services/variable-extraction-service.test.ts`
- Tests cover: extraction, validation, model errors, template handling, JSON parsing, performance (< 2s), and LLM errors
- All tests pass (1185 passed), lint passes with 0 new errors

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
