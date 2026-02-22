# CI/CD Configuration Improvements

## Status: Documentation Ready

**Created:** 2026-02-22
**Author:** devops-engineer
**Priority:** High

## Summary

This document outlines critical CI/CD configuration improvements needed for the project. The default branch is `develop`, but several GitHub Actions workflows are configured to only trigger on `main`/`master` branches, causing CI/CD gaps.

## Issues Identified

### 1. test.yml - Missing develop Branch

**File:** `.github/workflows/test.yml`

**Current State:**
```yaml
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
```

**Issue:** The `develop` branch (default branch) is not included in the test workflow triggers.

**Recommended Fix:**
```yaml
on:
  push:
    branches: [ main, master, develop ]
  pull_request:
    branches: [ main, master, develop ]
```

### 2. pnpm Version Mismatch

**Files:** `.github/workflows/test.yml`, `package.json`

**Current State:**
- test.yml uses: `pnpm@10.5.2`
- package.json specifies: `pnpm@10.6.1`
- release.yml uses: `pnpm@10.6.1`

**Issue:** Inconsistent pnpm versions across workflows can cause unexpected behavior.

**Recommended Fix:** Standardize all workflows to use `pnpm@10.6.1` (matches package.json).

### 3. docker.yml - Missing develop Branch

**File:** `.github/workflows/docker.yml`

**Current State:**
```yaml
if: ${{ ... && (head_branch == 'main' || head_branch == 'master') }}
```

**Issue:** Docker builds won't trigger for `develop` branch pushes.

**Recommended Fix:**
```yaml
if: ${{ ... && (head_branch == 'main' || head_branch == 'master' || head_branch == 'develop') }}
```

### 4. parallel.yml - Missing develop Branch

**File:** `.github/workflows/parallel.yml`

**Current State:**
```yaml
on:
  push:
    branches:
      - main
```

**Issue:** The parallel workflow (automated agent tasks) won't run on `develop` branch.

**Recommended Fix:**
```yaml
on:
  push:
    branches:
      - main
      - develop
```

## Impact Analysis

### Without These Fixes

1. **No CI on develop:** Push to `develop` won't trigger tests
2. **No Docker builds on develop:** Changes to `develop` won't build new Docker images
3. **No automated agent tasks on develop:** The parallel workflow won't maintain the `develop` branch
4. **Version inconsistencies:** Different pnpm versions may cause build failures

### With These Fixes

1. **Full CI/CD coverage:** All branches get proper testing
2. **Consistent tooling:** Same pnpm version across all workflows
3. **Automated maintenance:** Parallel workflow keeps `develop` healthy
4. **Better developer experience:** CI feedback on the default branch

## Related PRs

- PR #535 (feat(vercel): optimize Vercel deployment configuration) - Also adds `develop` branch to Vercel config
- PR #533 (fix(integration): ensure core is built before type-check) - Integration improvements

## Implementation Notes

Due to GitHub App permissions, workflow file changes require:
1. Direct push access to the repository
2. Or a PR from a fork with appropriate permissions
3. Or manual application by a repository maintainer

## Verification Steps

After implementing fixes:

1. Push to `develop` branch
2. Verify test workflow runs: `gh run list --branch develop`
3. Verify Docker build triggers: Check GitHub Actions dashboard
4. Verify parallel workflow runs: Check GitHub Actions dashboard

## Configuration Best Practices

### Environment Variables

Consider adding to test.yml for consistency:
```yaml
env:
  NODE_VERSION: '22'
  PNPM_VERSION: '10.6.1'
```

### Branch Protection

Recommend enabling branch protection for `develop`:
- Require PR reviews
- Require status checks (test, lint)
- Require branches to be up to date

## Conclusion

These improvements will ensure consistent CI/CD behavior across all branches and reduce configuration drift between workflows.
