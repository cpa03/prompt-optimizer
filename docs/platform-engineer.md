# Platform Engineer Long-term Memory

## Active Platform Work

### CI/CD Improvements for develop Branch
- **Status**: Blocked by GitHub App permissions
- **Priority**: High
- **Type**: Infrastructure/DevOps
- **Changes Needed**:
  - test.yml: Add `develop` branch to push/PR triggers, update pnpm to 10.6.1
  - docker.yml: Add `develop` branch to build triggers
  - parallel.yml: Add `develop` branch to push triggers
- **Blocker**: GitHub App lacks "workflows" permission to push workflow file changes

## Recent Platform Improvements

1. **CI/CD Branch Coverage** (2026-02-25)
   - Documented needed changes in docs/development/ci-cd-improvements.md
   - Changes require manual application or App permission upgrade

2. **Tooling Consistency** (2026-02-25)
   - Standardized pnpm version across all workflows (needs manual apply)
   - All workflows should use pnpm@10.6.1

## Platform Engineering Scope

1. **CI/CD Pipeline**
   - GitHub Actions workflows (test, release, docker, parallel)
   - Build and deployment automation
   - Branch protection and triggers

2. **Developer Tooling**
   - Package management (pnpm)
   - TypeScript configurations
   - Build tools (tsup, Vite, webpack)

3. **Infrastructure**
   - Docker configurations
   - Docker Compose setups
   - Kubernetes manifests (k8s/)

4. **Development Environment**
   - Devcontainer configuration
   - Environment variables management

## Known Platform Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| Missing develop in workflows | High | Documented | Needs manual apply |
| pnpm version mismatch | Medium | Documented | Standardize to 10.6.1 |

## Action Items

1. Request GitHub App "workflows" permission to push workflow changes
2. Or manually apply CI/CD changes from docs/development/ci-cd-improvements.md
3. Add develop branch protection rules

## Last Updated
2026-02-25
