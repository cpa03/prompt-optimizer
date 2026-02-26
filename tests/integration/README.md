# Integration Tests

This directory contains integration tests for cross-package workflows.

## Structure

- `tests/integration/` - Root-level integration test utilities (work in progress)
- `packages/core/tests/integration/` - Core package integration tests (124 tests)
- `packages/ui/tests/` - UI package tests

## Running Integration Tests

```bash
# Run all integration tests in core package
pnpm -F @prompt-optimizer/core test:integration

# Run specific integration test file
pnpm -F @prompt-optimizer/core vitest run tests/integration/prompt/service.integration.test.ts
```

## Test Categories

### Core Package Integration Tests
- LLM service integration (OpenAI, Anthropic, Gemini, DeepSeek, etc.)
- Storage implementations
- Template processing
- Variable extraction
- Image adapters
- Data compatibility

### Cross-Package Workflows (To Be Implemented)
- PromptService + TemplateManager interactions
- HistoryManager + Storage persistence
- ModelManager + LLM adapters coordination
- UI store + core service integration

## Test Environment

Integration tests may require API keys set as environment variables:
- `VITE_OPENAI_API_KEY`
- `VITE_ANTHROPIC_API_KEY`
- `VITE_GEMINI_API_KEY`
- `VITE_DEEPSEEK_API_KEY`
- `VITE_CUSTOM_API_KEY`

Tests requiring API keys will be skipped if keys are not provided.

## CI Integration

Integration tests are run in CI but only gate tests are required to pass:
- `pnpm test:gate` - Gate tests (VCR and mock service)
- `pnpm test:integration` - Full integration tests (skips tests without API keys)
