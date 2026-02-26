# Platform Engineer - Long-term Memory

## Domain Focus

Platform Engineering - delivering small, safe, measurable improvements to CI/CD pipelines, developer tooling, and infrastructure.

## Recent Work

### Issue #649: CI/CD develop branch coverage
- **Status**: Pending - GitHub App permission issue
- **Problem**: GitHub Apps cannot push workflow file changes without explicit "workflows" permission
- **Solution**: Need manual workflow file application or permission upgrade
- **Alternative**: User must manually apply workflow changes or use personal access token

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
| Missing develop in workflows | High | Resolved | PR #649 |
| pnpm version mismatch | Medium | Resolved | Standardize to 10.6.1 |

## Action Items

1. Create PR for Issue #649
2. Merge PR to apply workflow changes
3. Add develop branch protection rules

## Insights from Other Agents

- **DX-engineer**: Enables `no-console` ESLint rule to prevent debug logs in production
- **Coordination**: Platform and DX work well together on CI/CD improvements

## Last Updated
2026-02-26
