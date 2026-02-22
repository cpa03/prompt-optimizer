# Documentation Index

Welcome to the Prompt Optimizer documentation. This index provides organized access to all project documentation.

## Quick Navigation

- [Getting Started](#getting-started) - First-time setup and development
- [Architecture](#architecture) - System design and technical decisions
- [Development Guides](#development-guides) - How-to guides for developers
- [Testing](#testing) - Testing strategies and automation
- [Deployment](#deployment) - Build, release, and deployment
- [Project Management](#project-management) - PRDs, roadmaps, and planning
- [Troubleshooting](#troubleshooting) - Common issues and solutions
- [Archives](#archives) - Historical documentation and migrations

---

## Getting Started

### Repository Setup

- **[Repository Guidelines](../AGENTS.md)** - Project structure, build commands, coding standards
- **[Environment Variables](ENVIRONMENT_VARIABLES.md)** - Complete environment configuration reference
- **[Developer Guide](developer/README.md)** - Comprehensive development guide

### Quick Start

```bash
# Install dependencies (requires pnpm)
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build all packages
pnpm build
```

### Package Overview

| Package               | Description               | Development                           |
| --------------------- | ------------------------- | ------------------------------------- |
| `packages/core`       | Core business logic       | `pnpm -F @prompt-optimizer/core test` |
| `packages/ui`         | Vue 3 component library   | `pnpm -F @prompt-optimizer/ui test`   |
| `packages/web`        | Web application           | `pnpm dev`                            |
| `packages/extension`  | Browser extension         | `pnpm dev:ext`                        |
| `packages/desktop`    | Electron desktop app      | `pnpm dev:desktop`                    |
| `packages/mcp-server` | MCP server implementation | `pnpm mcp:dev`                        |

---

## Architecture

### Core Architecture Documents

- **[Storage Key Architecture](architecture/storage-key-architecture.md)** - Storage system design
- **[Image Model Management](architecture/image-model-management-architecture.md)** - Image generation architecture
- **[Function Mode](architecture/function-mode.md)** - Function calling implementation
- **[LLM Refactor](architecture/llm-refactor.md)** - LLM service architecture
- **[Storage Refactoring Summary](architecture/storage-refactoring-summary.md)** - Storage system evolution

### Migration Guides

- **[Architecture Migration Guide](workspace/architecture-migration-guide.md)** - Migration planning
- **[Architecture Migration Analysis](workspace/architecture-migration-analysis.md)** - Technical analysis

---

## Development Guides

### Developer Documentation

- **[Developer Guide](developer/README.md)** - Main developer documentation
- **[Technical Development Guide](developer/technical-development-guide.md)** - In-depth technical guide
- **[Project Structure](developer/project-structure.md)** - Repository organization
- **[Desktop Developer Guide](developer/desktop-developer-guide.md)** - Electron development
- **[Electron IPC Best Practices](developer/electron-ipc-best-practices.md)** - IPC patterns
- **[LLM Params Guide](developer/llm-params-guide.md)** - LLM parameter configuration
- **[Prompt Garden Integration](developer/prompt-garden-integration.md)** - Integration patterns

### Working Documents

- **[Developer Todo](developer/todo.md)** - Active development tasks
- **[Technical Analysis](developer/technical-analysis.md)** - Technical investigations
- **[General Experience](developer/general-experience.md)** - Developer experience notes

---

## Testing

### Testing Documentation

- **[Testing Guide](testing/README.md)** - Testing overview and strategies
- **[Test Commands](testing/test-commands.md)** - Available test commands
- **[VCR Usage Guide](testing/vcr-usage-guide.md)** - VCR testing patterns
- **[E2E Selector Strategy](testing/e2e-selector-strategy.md)** - E2E testing approach

### AI Automation Testing

- **[AI Automation Guide](testing/ai-automation/README.md)** - AI-driven testing
- **[Electron MCP Guide](testing/ai-automation/electron-mcp-guide.md)** - MCP testing
- **[Migration Summary](testing/ai-automation/MIGRATION-SUMMARY.md)** - Test migration history

### Test Scenarios

- **[Normal Flow Scenarios](testing/ai-automation/test-scenarios/normal-flow/)**
  - [Basic Setup](testing/ai-automation/test-scenarios/normal-flow/01-basic-setup.md)
  - [Model Management](testing/ai-automation/test-scenarios/normal-flow/02-model-management.md)
  - [Template Management](testing/ai-automation/test-scenarios/normal-flow/03-template-management.md)
  - [Prompt Optimization](testing/ai-automation/test-scenarios/normal-flow/04-prompt-optimization.md)
  - [History Management](testing/ai-automation/test-scenarios/normal-flow/05-history-management.md)
  - [Data Management](testing/ai-automation/test-scenarios/normal-flow/06-data-management.md)
  - [UI Interaction Features](testing/ai-automation/test-scenarios/normal-flow/07-ui-interaction-features.md)
  - [Context Persistence](testing/ai-automation/test-scenarios/normal-flow/08-context-persistence.md)
  - [Context Variables & Preview](testing/ai-automation/test-scenarios/normal-flow/09-context-variables-and-preview.md)
  - [Tools Management](testing/ai-automation/test-scenarios/normal-flow/10-tools-management-and-advanced-context.md)
  - [Context Import/Export](testing/ai-automation/test-scenarios/normal-flow/11-context-import-export.md)
  - [Advanced Context Optimization](testing/ai-automation/test-scenarios/normal-flow/12-advanced-context-optimization-and-testing.md)

- **[Edge Cases](testing/ai-automation/test-scenarios/edge-cases/)**
  - [Concurrent Operations](testing/ai-automation/test-scenarios/edge-cases/concurrent-operations.md)
  - [Input Validation](testing/ai-automation/test-scenarios/edge-cases/input-validation.md)

- **[Error Handling](testing/ai-automation/test-scenarios/error-handling/)**
  - [Network Failures](testing/ai-automation/test-scenarios/error-handling/network-failures.md)

### Testing Redesign

- **[Testing Redesign Architecture](workspace/testing-redesign/architecture.md)**
- **[Testing Redesign Findings](workspace/testing-redesign/findings.md)**
- **[Testing Redesign Progress](workspace/testing-redesign/progress.md)**
- **[Testing Redesign Task Plan](workspace/testing-redesign/task_plan.md)**

---

## Deployment

### Deployment Documentation

- **[CI/CD Improvements](deployment/ci-cd-improvements.md)** - Recommended CI/CD enhancements
- **[Docker MCP Integration](deployment/docker-mcp-integration.md)** - Docker setup with MCP

---

## Project Management

### Project Status

- **[Project Status](project/project-status.md)** - Current project status
- **[Project README](project/README.md)** - Project overview
- **[PRD](project/prd.md)** - Product Requirements Document
- **[Version Sync](project/version-sync.md)** - Version management

### User Story Management

- **[User Story Engineering Guide](developer/user-story-engineering-guide.md)** - Story creation and implementation workflow
- **[User Story Template](workspace-template/user-story-template.md)** - Story documentation format
- **[Story Review Checklist](workspace-template/story-review-checklist.md)** - Pre/post implementation review
- **[Stories Directory](stories/README.md)** - Active story tracking and progress

### Workspaces

- **[Session Persistence Fix Plan](workspace/PLAN-session-persistence-fix.md)**
- **[Prompt Optimization Guide](workspace/prompt-optimization-guide-lyra.md)**
- **[Standardization Todo](workspace/standardization-optimization-todolist.md)**

### Testing Resources

- See [Testing Guide](testing/README.md) for testing documentation

---

## Troubleshooting

### General Troubleshooting

- **[Troubleshooting Guide](developer/troubleshooting/README.md)** - Common issues
- **[General Checklist](developer/troubleshooting/general-checklist.md)** - Diagnostic checklist

### Image Mode

- **[Image Mode Guide](image-mode.md)** - Image generation features

---

## Archives

### Historical Documentation

The [archives](archives/) directory contains historical documentation for completed migrations and refactors.

#### Major Migrations

- **[101 - Singleton Refactor](archives/101-singleton-refactor/)** - Singleton pattern migration
- **[122 - Naive UI Migration](archives/122-naive-ui-migration/)** - UI library migration
- **[124 - Advanced Mode Toggle](archives/124-advanced-mode-toggle-migration/)** - Mode toggle refactor
- **[125 - Test Area Refactor](archives/125-test-area-refactor/)** - Test system refactor

#### Archive Index

- **[Archives Index](archives/INDEX.md)** - Complete archive listing

---

## Active Workspaces

Workspace directories contain active development work and investigations:

- `workspace/` - Main workspace
- `workspace-template/` - Templates and scratchpads
- `workspace-trpc/` - tRPC-related work

### Workspace Templates

Standard templates for consistent documentation:

- **[User Story Template](workspace-template/user-story-template.md)** - User story tracking format
- **[Todo Template](workspace-template/todo-template.md)** - Task management template (Chinese)
- **[Todo Template EN](workspace-template/todo-template-en.md)** - Task management template (English)
- **[Experience Template](workspace-template/experience-template.md)** - Development experience records
- **[Scratchpad Template](workspace-template/scratchpad-template.md)** - Quick notes template
- **[Bug Report](workspace-template/bug.md)** - Bug tracking log
- **[Task Log](workspace-template/task.md)** - Detailed task tracking
- **[BroCula Report](workspace-template/brocula-report.md)** - Browser console report
- **[TestGuard Report](workspace-template/testguard-report.md)** - Test suite report

---

## Audit Reports

All audit reports are consolidated in the `audit/` directory:

- **[Phase 1 Audit 2025-02-13](audit/phase-1-audit-2025-02-13.md)** - Previous audit
- **[Phase 1 Comprehensive Audit 2026-02-14](audit/phase-1-comprehensive-audit-2026-02-14.md)** - Latest comprehensive audit
- **[Phase 1 Diagnostic Report](audit/phase-1-diagnostic-report.md)** - Diagnostic findings
- **[Phase 2 Report 2026-02-17](audit/phase-2-report-2026-02-17.md)** - Phase 2 progress
- **[Phase 2 Security Hardening 2026-02-18](audit/phase2-security-hardening-2026-02-18.md)** - Security improvements

---

## Contributing

### Development Workflow

1. Read [Repository Guidelines](../AGENTS.md)
2. Set up your environment using [Environment Variables](ENVIRONMENT_VARIABLES.md)
3. Follow [Testing Guide](testing/README.md) for test-driven development
4. Submit PRs following Conventional Commits format

### Code Standards

- TypeScript + Vue 3
- 2-space indentation
- PascalCase for Vue SFCs
- Kebab-case for directories
- Tests in `tests/unit/` or `tests/integration`

---

## License

This project is licensed under [AGPL-3.0-only](../LICENSE).

---

## Document Maintenance

**Last Updated:** 2026-02-22  
**Maintained by:** Project Team  
**Questions?** Refer to [Troubleshooting](developer/troubleshooting/) or create a discussion in the repository.

---

_For issues or suggestions about this documentation index, please create a task in the project's task tracking system._
