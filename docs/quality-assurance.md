# Quality Assurance Documentation

## Overview
This document serves as the long-time memory for the Quality Assurance agent.

## PR Reviews Completed

### PR #638 - feat(ci): add code coverage gate to CI pipeline
- **Date**: 2026-02-25
- **Status**: MERGEABLE
- **Label**: quality-assurance
- **Linked Issue**: #622
- **Changes**: 
  - Added Vitest coverage configuration with thresholds (70% lines, 65% functions, 60% branches)
  - Added coverage thresholds to UI package (50% lines minimum)
  - Added test:gate:coverage script
- **Notes**: Workflow file changes require manual application due to GitHub App permissions

### PR #639 - fix(ci): add pnpm security audit to CI pipeline
- **Date**: 2026-02-25
- **Status**: OPEN
- **Label**: quality-assurance
- **Linked Issue**: #603
- **Changes**: 
  - Added pnpm audit step to .github/workflows/test.yml
  - Runs with --audit-level=critical to block only critical vulnerabilities
  - Reports high/moderate/low but doesn't fail the build (known issues)
- **Notes**: Starting with critical-only to avoid blocking CI on known vulnerabilities

### PR #599 - test(core): add comprehensive tests for CompareService
- **Date**: 2026-02-24
- **Status**: APPROVED
- **Tests**: 1131 passed, 130 skipped
- **Lint**: Clean
- **Branch**: Updated with develop via merge
- **Notes**: Added 29 unit tests covering basic comparison, options configuration, input validation, fragment merging, statistics, edge cases, factory function, and error types

## Issues Addressed

### Issue #622 - Missing code coverage gate in CI pipeline
- **Status**: PR #638 created
- **Solution**: 
  - Added coverage config to packages/core/vitest.config.js and packages/ui/vitest.config.ts
  - Added test:gate:coverage script
  - CI workflow update requires manual application (GitHub App permissions)

### Issue #603 - Add pnpm security audit to CI pipeline
- **Status**: PR #639 created
- **Solution**: 
  - Added pnpm audit step to .github/workflows/test.yml
  - Uses --audit-level=critical to block only critical vulnerabilities
  - Known high/moderate/low vulnerabilities are reported but don't block CI

## Repository Quality Metrics
- Test command: `pnpm -F @prompt-optimizer/core test --run`
- Lint command: `pnpm lint`
- Build command: `pnpm build`

## Notes
- Vercel deployment failures appear to be unrelated to test changes
- When updating old PR branches, use merge with --allow-unrelated-histories if histories are diverged
- GitHub App (github-actions[bot]) lacks workflow permissions - need personal access token for workflow changes

## Proposed Changes (Pending Manual Application)

### Issue #649 - Add develop branch to CI/CD workflows
- **Status**: Changes prepared but need manual push due to GitHub App permissions
- **Linked Issue**: #649
- **Solution**:
  - **test.yml**: Add `develop` branch to push/PR triggers
    ```yaml
    on:
      push:
        branches: [ main, master, develop ]
      pull_request:
        branches: [ main, master, develop ]
    ```
  - **docker.yml**: Add `develop` branch to build condition
    ```yaml
    if: ${{ ... || github.event.workflow_run.head_branch == 'develop' }}
    ```
  - **parallel.yml**: Add `develop` branch to push triggers
    ```yaml
    on:
      push:
        branches:
          - main
          - develop
    ```
- **Impact**: CI will run on develop branch pushes/PRs, improving pre-production quality checks
