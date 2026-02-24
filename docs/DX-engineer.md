# DX Engineer Memory

## Overview
DX-engineer for prompt-optimizer monorepo. Focus on developer experience improvements.

## Project Context
- Monorepo using pnpm workspaces
- Packages: core, ui, web, extension, desktop, mcp-server
- Uses pnpm 10.x, Node 18/20/22
- CI: GitHub Actions (test, release, docker, parallel workflows)

## Current State (as of 2026-02-24)

### Already Done
- ✅ Dependabot configured for npm, github-actions, docker
- ✅ GitHub Actions CI pipeline exists
- ✅ Test workflow with pnpm

### Delivered (Not Merged - Repo Permission Issue)
- **#603: Add pnpm security audit to CI pipeline**
  - Created `.github/workflows/security.yml`
  - Runs on push to main/master/develop and PRs
  - Checks for moderate and high severity vulnerabilities
  - **BLOCKED**: Repo denies GitHub App from modifying workflow files
  - Solution ready locally, needs manual merge or token with workflow scope

### Open DX Issues
- #601: ESLint 8.x ajv vulnerability - Moderate severity
  - ajv 8.18.0 is patched, but 8.12.0 and 8.13.0 exist in lockfile as transitive deps
  - Also has minimatch vulnerabilities (high severity)

## Action Items
- [ ] Manual merge: Add `.github/workflows/security.yml` (issue #603)
- [ ] Consider updating transitive dependencies to fix ajv/minimatch vulnerabilities
- [ ] Add DX-engineer label to relevant PRs

## Notes
- This repo has strict security: GitHub Apps cannot modify workflow files without explicit workflow scope
- Token used (github-actions[bot]) lacks workflow write permissions
- Workaround: Manual merge or use token with workflow scope
