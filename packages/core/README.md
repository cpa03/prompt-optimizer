# @prompt-optimizer/core

Core business logic package for Prompt Optimizer. This package contains the fundamental services and utilities for AI prompt optimization.

## Overview

This package provides the core functionality for:

- **Template Management** - Prompt template handling and processing
- **History Management** - Conversation and prompt history tracking
- **LLM Service** - Unified interface for multiple LLM providers
- **Model Management** - Model configuration and parameter handling
- **Image Service** - Image generation and transformation
- **Prompt Optimization** - Core optimization algorithms

## Installation

This is a private package used internally by the Prompt Optimizer monorepo.

```bash
pnpm install
```

## Usage

```typescript
import {
  createLLMService,
  createTemplateManager,
  createHistoryManager,
  createModelManager,
} from '@prompt-optimizer/core'
```

## Key Modules

### LLM Service

Unified interface for multiple LLM providers (OpenAI, Gemini, DeepSeek, etc.):

```typescript
const llmService = createLLMService(config)
```

### Template Management

Handle prompt templates with Mustache-style variable substitution:

```typescript
const templateManager = createTemplateManager()
```

### History Management

Track and manage prompt optimization history:

```typescript
const historyManager = createHistoryManager()
```

### Model Management

Configure and manage LLM model settings:

```typescript
const modelManager = createModelManager()
```

## Development

```bash
# Build the package
pnpm build

# Watch mode for development
pnpm dev

# Run tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run with coverage
pnpm test:coverage
```

## Architecture

The package follows a modular architecture with clear separation of concerns:

- `services/` - Core service implementations
- `types/` - TypeScript type definitions
- `interfaces/` - Interface contracts
- `config/` - Configuration management
- `constants/` - Application constants
- `utils/` - Utility functions

## Related Documentation

- [Technical Development Guide](../../docs/developer/technical-development-guide.md)
- [Project Structure](../../docs/developer/project-structure.md)
- [LLM Parameters Guide](../../docs/developer/llm-params-guide.md)

## License

AGPL-3.0-only
