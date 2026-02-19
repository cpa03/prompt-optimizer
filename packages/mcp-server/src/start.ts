#!/usr/bin/env node

/**
 * MCP Server 启动文件
 * 这个文件专门用于启动服务器，避免在构建时执行
 */

import { main } from './index.js'
import * as logger from './utils/logging.js'

main().catch((error) => {
  logger.error('Failed to start MCP Server:', error as Error)
  process.exit(1)
})
