# Quality Assurance Documentation

## Overview
This document serves as the long-time memory for the Quality Assurance agent.

## PR Reviews Completed

### PR #599 - test(core): add comprehensive tests for CompareService
- **Date**: 2026-02-24
- **Status**: APPROVED
- **Tests**: 1131 passed, 130 skipped
- **Lint**: Clean
- **Branch**: Updated with develop via merge
- **Notes**: Added 29 unit tests covering basic comparison, options configuration, input validation, fragment merging, statistics, edge cases, factory function, and error types

## Issues Addressed

### Issue #603 - Add pnpm security audit to CI pipeline
- **Status**: Identified solution, unable to push due to GitHub App permissions
- **Solution**: Add pnpm audit step to .github/workflows/test.yml after dependency installation
- **Workaround needed**: Manual push or token with workflow permissions required

## Repository Quality Metrics
- Test command: `pnpm -F @prompt-optimizer/core test --run`
- Lint command: `pnpm lint`
- Build command: `pnpm build`

## Notes
- Vercel deployment failures appear to be unrelated to test changes
- When updating old PR branches, use merge with --allow-unrelated-histories if histories are diverged
- GitHub App (github-actions[bot]) lacks workflow permissions - need personal access token for workflow changes
