# Contributing to Prompt Optimizer

Thank you for your interest in contributing to Prompt Optimizer! This document provides guidelines and best practices for contributors and repository managers.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0 (18/20/22 supported)
- pnpm >= 10.6.1 (package manager - required)
- Git

> **Note:** The pnpm version must be consistent across all configuration files:
>
> - `package.json` (`packageManager` field)
> - `.github/workflows/test.yml` (`pnpm/action-setup` version)
> - `.github/workflows/release.yml` (`PNPM_VERSION` env variable)

### Initial Setup

#### Option 1: DevContainer (Recommended)

The fastest way to get started is using the DevContainer, which provides a fully-configured development environment:

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Install [VS Code](https://code.visualstudio.com/) with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
3. Clone and open the repository in VS Code
4. When prompted, click "Reopen in Container"

The DevContainer automatically:
- Installs Node.js 20 and pnpm 10.6.1
- Configures all recommended VS Code extensions
- Runs `pnpm install` and builds the core package

See [.devcontainer/README.md](../.devcontainer/README.md) for details.

#### Option 2: Manual Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/prompt-optimizer.git
cd prompt-optimizer

# 2. Install dependencies (pnpm only)
pnpm install

# 3. Verify setup
pnpm lint
pnpm test:fast
```

## 📋 Development Workflow

### Branch Naming Convention

Use descriptive branch names following these patterns:

- `feature/your-feature-name` - New features
- `fix/your-bug-fix` - Bug fixes
- `refactor/your-refactor` - Code refactoring
- `docs/your-docs-update` - Documentation updates
- `test/your-test-additions` - Test additions/improvements
- `repository-manager` - Repository management improvements
- `DX-engineer` - Developer experience improvements

### Making Changes

1. **Create a feature branch** from `develop`

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards
   - TypeScript + Vue 3
   - 2-space indentation
   - PascalCase for Vue SFCs
   - Kebab-case for directories

3. **Test your changes**

   ```bash
   # Run linting
   pnpm lint

   # Run fast tests
   pnpm test:fast

   # Build to verify no build errors
   pnpm build
   ```

4. **Commit your changes** using Conventional Commits
   ```bash
   git commit -m "feat(ui): add template preview feature"
   ```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation changes
- `test`: Adding/updating tests
- `build`: Build system changes
- `ci`: CI/CD configuration
- `chore`: Maintenance tasks

**Examples:**

- `feat(ui): add template preview component`
- `fix(core): resolve memory leak in prompt optimizer`
- `refactor(mcp-server): eliminate hardcoded retry values`
- `docs(developer): update API documentation`

## 🔍 Code Review Guidelines

### Before Submitting a PR

- [ ] All tests pass (`pnpm test:fast`)
- [ ] Lint passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Commit messages follow Conventional Commits
- [ ] Documentation updated (if applicable)
- [ ] No breaking changes (or clearly documented)

### PR Description Template

```markdown
## Summary

Brief description of changes

## Changes Made

- List of specific changes
- Key decisions and rationale

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests (if applicable)
- [ ] Manual testing performed

## Screenshots (if UI changes)

Before/After screenshots

## Related Issues

Closes #XXX
```

## 🏗️ Repository Management

### Repository Manager Responsibilities

As a repository manager, you should:

1. **Maintain Branch Health**
   - Keep branches up-to-date with `develop`
   - Resolve merge conflicts promptly
   - Remove merged/abandoned branches

2. **Ensure Code Quality**
   - All PRs must pass lint and tests
   - No warnings in build process
   - Documentation is up-to-date

3. **Review and Merge PRs**
   - Follow PR review guidelines
   - Ensure CI/CD passes
   - Merge using squash or rebase (prefer squash)

4. **Monitor Repository Health**
   - Check for security vulnerabilities
   - Update dependencies regularly
   - Maintain documentation quality

### Repository Manager Workflow

```bash
# 1. Create/update repository manager branch
git checkout develop
git pull origin develop
git checkout -b repository-manager
# OR if branch exists
git checkout repository-manager
git merge develop

# 2. Make improvements
# - Update documentation
# - Fix inconsistencies
# - Improve repository structure

# 3. Verify changes
pnpm lint
pnpm test:fast
pnpm build

# 4. Create/update PR with label
gh pr create --label "repository manager" --title "chore: repository management improvements"
```

### Repository Manager Best Practices

1. **Monitor Open PRs**
   - Check for PRs ready to merge
   - Ensure all PRs pass CI/CD
   - Help resolve merge conflicts

2. **No Changes Required**
   - If repository is healthy with no issues, document the status
   - Create a PR summarizing repository health
   - Note any PRs ready for review/merge

3. **Coordinate with Other Agents**
   - Avoid conflicts with open PRs from other agents
   - Wait for dependent PRs to merge before making related changes

## 📚 Documentation Standards

### Documentation Structure

- `docs/README.md` - Chinese documentation index
- `docs/index.md` - English documentation index
- `AGENTS.md` - Repository guidelines and BMAD agents
- `CONTRIBUTING.md` - This file

### When to Update Documentation

- New features → Update user/developer docs
- API changes → Update API documentation
- Architecture changes → Update architecture docs
- Process changes → Update contributing guide

## 🧪 Testing Guidelines

### Test Types

1. **Unit Tests** (`pnpm test:unit`)
   - Fast, isolated tests
   - Located in `tests/unit/`
   - Mock external dependencies

2. **Integration Tests** (`pnpm test`)
   - Test component interactions
   - Located in `tests/integration/`

3. **E2E Tests** (`pnpm test:e2e`)
   - Full user workflows
   - Use VCR for API calls
   - Located in `tests/e2e/`

### Test Commands

```bash
# Fast tests (unit + some integration)
pnpm test:fast

# All tests including E2E
pnpm test

# Test specific package
pnpm -F @prompt-optimizer/core test

# Test with coverage
pnpm -F @prompt-optimizer/core test:coverage
```

## 🔧 Development Commands

### Build Commands

```bash
# Build all packages
pnpm build

# Build specific package
pnpm build:core
pnpm build:ui
pnpm build:mcp

# Build desktop application
pnpm build:desktop
```

### Development Servers

```bash
# Web development
pnpm dev

# Desktop development
pnpm dev:desktop

# Extension development
pnpm dev:ext

# MCP server development
pnpm mcp:dev
```

### Code Quality

```bash
# Lint code
pnpm lint

# Fix lint issues
pnpm lint:fix

# Format code
pnpm format

# Check formatting
pnpm format:check
```

## 🚢 Release Process

### Version Management

1. Update version: `pnpm version:prepare [major|minor|patch]`
2. Sync versions across packages: `pnpm version:sync`
3. Create tag: `pnpm version:tag`
4. Push tag: `pnpm version:publish`

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version numbers synced
- [ ] Git tag created and pushed
- [ ] GitHub release created
- [ ] Desktop app built and uploaded
- [ ] Docker image built and pushed

## 🛡️ Quality Assurance

### QA Workflow

Quality assurance improvements follow a structured workflow:

```bash
# 1. Create quality-assurance branch from develop
git checkout develop
git pull origin develop
git checkout -b quality-assurance

# 2. Run quality checks
pnpm lint
pnpm test:fast
pnpm build

# 3. Make improvements
# - Fix lint warnings
# - Add missing tests
# - Improve type safety
# - Update documentation

# 4. Verify no regressions
pnpm test
pnpm build

# 5. Create PR with quality-assurance label
gh pr create --label "quality-assurance" --title "qa: quality improvements"
```

### QA Focus Areas

1. **Code Quality**
   - Eliminate TypeScript `any` types where possible
   - Remove unused code and dead exports
   - Improve error handling patterns

2. **Test Coverage**
   - Add tests for edge cases
   - Ensure all new code has test coverage
   - Maintain test reliability (no flaky tests)

3. **Documentation**
   - Keep documentation up-to-date with code changes
   - Fix broken links
   - Add missing documentation for public APIs

4. **Security**
   - Run `pnpm audit` regularly
   - Address security vulnerabilities promptly
   - Follow secure coding practices

### QA Checklist

- [ ] Lint passes with no warnings (`pnpm lint`)
- [ ] All tests pass (`pnpm test`)
- [ ] Build succeeds (`pnpm build`)
- [ ] No TypeScript errors
- [ ] Documentation updated (if applicable)
- [ ] No security vulnerabilities (`pnpm audit`)

## 🛠️ Developer Experience

### DX-engineer Workflow

Developer experience improvements follow a structured workflow:

```bash
# 1. Create DX-engineer branch from develop
git checkout develop
git pull origin develop
git checkout -b DX-engineer

# 2. Run quality checks
pnpm lint
pnpm test:fast
pnpm type-check

# 3. Make improvements
# - Improve documentation clarity
# - Add missing documentation
# - Fix documentation inconsistencies
# - Improve code comments
# - Update CONTRIBUTING.md
# - Review open issues for DX improvements

# 4. Verify no regressions
pnpm lint
pnpm test:fast
pnpm build

# 5. Ensure branch is up-to-date before PR
git fetch origin develop
git rebase origin/develop

# 6. Create/update PR with DX-engineer label
gh pr create --label "DX-engineer" --title "docs: developer experience improvements"
```

### DX-engineer Focus Areas

1. **Documentation**
   - Keep documentation up-to-date with code changes
   - Fix broken links and outdated references
   - Add missing documentation for new features
   - Improve documentation clarity and organization

2. **Developer Onboarding**
   - Ensure clear setup instructions
   - Document common pitfalls and solutions
   - Update troubleshooting guides

3. **Code Readability**
   - Add or improve code comments
   - Document complex algorithms and decisions
   - Update inline documentation

4. **Process Improvement**
   - Improve workflow documentation
   - Update contribution guidelines
   - Document best practices

### DX-engineer Checklist

- [ ] Lint passes with no warnings (`pnpm lint`)
- [ ] Tests pass (`pnpm test:fast`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Type check passes (`pnpm type-check`)
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] PR has DX-engineer label
- [ ] Branch is up-to-date with develop

## 🤝 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards other community members

### Reporting Issues

Report unacceptable behavior to the repository maintainers via GitHub issues or discussions.

## 📞 Getting Help

- **Documentation**: Start with `docs/README.md` or `docs/index.md`
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Developer Guide**: See `docs/developer/README.md`

## 📄 License

By contributing to Prompt Optimizer, you agree that your contributions will be licensed under the [AGPL-3.0 License](LICENSE).

---

**Thank you for contributing to Prompt Optimizer!** 🎉

For questions about contributing, please create a discussion in the repository or refer to the [Developer Guide](docs/developer/README.md).
