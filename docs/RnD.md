# RnD Documentation

## Active Work

### Issue #603: Add pnpm security audit to CI pipeline
- **Status**: PR In Progress
- **Branch**: rndi-603-pnpm-audit
- **Priority**: High
- **Domain**: DX/Security

## Implemented Changes

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
