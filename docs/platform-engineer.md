# Platform Engineer - Long-term Memory

## Domain Focus

Platform Engineering - delivering small, safe, measurable improvements to CI/CD pipelines, developer tooling, and infrastructure.

## Recent Work

### Issue #649: CI/CD develop branch coverage
- **Status**: Partially complete (workflow changes blocked by GitHub App permissions)
- **Changes needed**: test.yml, docker.yml, parallel.yml need develop branch
- **Blocker**: GitHub App lacks "workflows" permission
- **Workaround**: Manual application required

### PR #656: Platform Engineer Memory
- Created docs/platform-engineer.md
- Documented platform issues

## CI/CD Workflow Patterns

### GitHub Actions Permissions
- **Important**: GitHub Apps cannot push workflow file changes without explicit "workflows" permission
- **Workaround**: Use non-workflow changes first, or request permission upgrade, or manual apply
- **Files**: `.github/workflows/*.yml`

### Key Workflow Files

- `.github/workflows/test.yml` - Main CI pipeline
- `.github/workflows/release.yml` - Release automation
- `.github/workflows/docker.yml` - Docker builds
- `.github/workflows/parallel.yml` - Automated agent tasks

### Common Issues to Look For

1. **Branch triggers**: Ensure default branch (develop) is included in triggers
2. **pnpm version**: Match package.json version across all workflows
3. **Action versions**: Use pinned versions for security
4. **Concurrency**: Set to prevent duplicate runs

## Developer Tooling

### Package Management
- Use pnpm (version in package.json)
- Lock file: `pnpm-lock.yaml`

### Build Commands
- Install: `pnpm install`
- Build: `pnpm build`
- Test: `pnpm test`
- Lint: `pnpm lint`
- Test gate: `pnpm test:gate`

## Infrastructure

- **Docker**: `Dockerfile`, `docker-compose*.yml`
- **Kubernetes**: `k8s/` directory
- **Devcontainer**: `.devcontainer/`

## Known Issues

| Issue | Severity | Status | Solution |
|-------|----------|--------|----------|
| Missing develop in workflows | High | Documented | Manual apply needed |
| pnpm version mismatch | Medium | Documented | Standardize to 10.6.1 |

## Action Items

1. Request GitHub App "workflows" permission
2. Apply workflow changes from docs/development/ci-cd-improvements.md
3. Add develop branch protection rules

## Last Updated
2026-02-25
