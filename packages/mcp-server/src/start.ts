#!/usr/bin/env node

import { main } from './index.js'

main().catch((error: unknown) => {
  const err = error instanceof Error ? error : new Error(String(error))
  console.error('Failed to start MCP server:', err.message)
  process.exit(1)
})
