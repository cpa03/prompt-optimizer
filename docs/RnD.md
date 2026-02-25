# RnD Documentation

## Active Work

### PR #643: Type safety improvements for variable extraction and value generation services
- **Status**: Open (Ready for Review)
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
