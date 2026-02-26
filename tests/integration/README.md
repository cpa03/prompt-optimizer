# Integration Tests

This directory contains integration tests for cross-package workflows.

## Structure

- `tests/integration/` - Root-level integration test utilities
- `tests/integration/test-utils.ts` - Shared mock utilities for cross-package testing
- `packages/core/tests/integration/` - Core package integration tests (135+ tests)
- `packages/ui/tests/integration/` - UI package integration tests (35+ tests)

## Running Integration Tests

```bash
# Run all integration tests (core + UI)
pnpm run test:integration

# Run core integration tests only
pnpm run test:integration

# Run UI integration tests only
pnpm run test:integration:ui

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

### Cross-Package Workflows (Implemented)
- ✅ PromptService + TemplateManager interactions
- ✅ HistoryManager + Storage persistence
- ✅ ModelManager + Storage coordination
- ✅ UI store + core service integration

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
