#!/usr/bin/env node

/**
 * MCP Server 启动文件
 * 这个文件专门用于启动服务器，避免在构建时执行
 */

import { main } from './index.js'
import * as logger from './utils/logging.js'

// 启动服务器
main().catch((error) => {
  logger.error('MCP Server startup failed:', error)
  process.exit(1)
})
