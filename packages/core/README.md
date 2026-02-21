# @prompt-optimizer/core

Core library for Prompt Optimizer, providing essential services for prompt optimization, LLM interactions, and data management.

## Installation

```bash
pnpm add @prompt-optimizer/core
```

## Features

- **Template Management**: Manage and process prompt templates
- **History Management**: Track and manage prompt optimization history
- **LLM Service**: Unified interface for multiple LLM providers
- **Model Management**: Configure and manage AI models
- **Image Service**: Image generation and management
- **Storage Providers**: Multiple storage backends (localStorage, IndexedDB, Memory, File)
- **Prompt Service**: Optimize, iterate, and test prompts
- **Context Management**: Manage conversation contexts
- **Favorite Management**: Save and organize favorite prompts

## Usage

```typescript
import {
  createModelManager,
  createLLMService,
  createTemplateManager,
  createPromptService,
  MemoryStorageProvider,
} from '@prompt-optimizer/core'

// Create storage provider
const storage = new MemoryStorageProvider()

// Initialize model manager
const modelManager = createModelManager(storage)

// Initialize LLM service
const llmService = createLLMService(modelManager)

// Initialize template manager
const templateManager = createTemplateManager(storage)

// Create prompt service
const promptService = createPromptService(modelManager, llmService, templateManager)
```

## Storage Providers

The core package provides multiple storage providers:

- `MemoryStorageProvider` - In-memory storage (for testing/MCP server)
- `LocalStorageProvider` - Browser localStorage
- `DexieStorageProvider` - IndexedDB via Dexie
- `FileStorageProvider` - File system storage (Electron only)

## Development

```bash
# Build
pnpm build

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage
```

## License

AGPL-3.0-only
