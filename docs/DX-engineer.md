# DX Engineer Documentation

## Overview

This document serves as the long-term memory for the DX Engineer agent. It captures insights, patterns, and best practices for improving developer experience in this repository.

## Project Context

- **Package Manager**: pnpm (v10.6.1)
- **Monorepo Structure**: Multiple packages under `packages/`
  - `@prompt-optimizer/core` - TypeScript core library
  - `@prompt-optimizer/ui` - Vue 3 component library
  - `@prompt-optimizer/web` - Vite web app
  - `@prompt-optimizer/extension` - Browser extension
  - `@prompt-optimizer/desktop` - Electron app
  - `@prompt-optimizer/mcp-server` - MCP server

## Workflow

### Phase: INITIATE
1. Check for open PRs with DX-engineer label
2. Check for DX-engineer labeled issues
3. If none, proactively scan for DX improvements within domain

### Phase: PLAN
Identify small, safe, measurable improvements:
- Lint warnings cleanup
- TypeScript improvements
- Test coverage gaps
- Developer workflow improvements
- Build performance optimizations

### Phase: IMPLEMENT
- Make atomic, focused changes
- Never refactor unrelated modules
- Never introduce unnecessary abstraction

### Phase: VERIFY
- Run lint: `pnpm lint`
- Run tests: `pnpm test:fast`
- Ensure zero warnings

### Phase: SELF-REVIEW
- Document the changes made
- Assess impact on developer experience
- Note any learnings for future iterations

### Phase: SELF-EVOLVE
- Check other agents' long-term memory for improvements
- Update this document with learnings

### Phase: DELIVER (PR)
- Label: DX-engineer
- Link to issue if exists
- Up to date with default branch (develop)
- No conflicts
- Build/lint/test success
- Zero warnings
- Small atomic diff

## Common Commands

```bash
# Install dependencies
pnpm install

# Run linting
pnpm lint
pnpm lint:fix

# Run tests
pnpm test:fast
pnpm test:unit

# Build packages
pnpm build:core
pnpm build:ui

# Development
pnpm dev
pnpm dev:desktop
pnpm dev:ext
```

## Known Issues / Technical Debt

- MSW and protobufjs build scripts are ignored by default
- Some packages may have lint warnings that need cleanup

## ESLint Rules to Follow

1. **Unused variables**: Prefix with `_` to indicate intentionally unused
2. **Duplicate imports**: Merge into single import statement
3. **Constant conditions**: Avoid `while (true)`, use flag variables
4. **Empty blocks**: Remove or add comments explaining intentional empty blocks

## Version History

### 2026-02-25
- Initial DX-engineer documentation
- Fixed 15 lint warnings in core package:
  - Unused variables prefixed with `_`
  - Duplicate imports merged
  - `while (true)` replaced with flag variable
  - Removed unused `processed` variable in abstract-adapter.ts
