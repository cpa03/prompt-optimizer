/**
 * 环境变量配置管理
 *
 * 注意：环境变量已通过 preload-env.js 在应用启动前加载
 * 这里的 config() 调用是备用加载机制
 */

import { config } from 'dotenv'
import * as logger from '../utils/logging.js'
import {
  SUFFIX_PATTERN,
  MAX_SUFFIX_LENGTH,
  CUSTOM_API_PATTERN,
  MCP_CONFIG,
} from '@prompt-optimizer/core'

// 备用环境变量加载（preload-env.js 已经处理了主要加载）
config()

/**
 * 扫描动态自定义模型环境变量
 * 查找 VITE_CUSTOM_API_*_suffix 模式的环境变量
 */
function scanDynamicCustomEnvVars(): Record<string, string> {
  const dynamicMappings: Record<string, string> = {}

  // 使用共享的正则表达式模式
  const customApiPattern = CUSTOM_API_PATTERN

  Object.keys(process.env).forEach((key) => {
    const match = key.match(customApiPattern)
    if (match) {
      const [, configType, suffix] = match

      // 验证后缀名（不能为空，不能包含特殊字符，不能超过长度限制）
      if (!suffix || suffix.length > MAX_SUFFIX_LENGTH || !SUFFIX_PATTERN.test(suffix)) {
        logger.warn(`[MCP Environment] Invalid suffix in ${key}: ${suffix}`)
        return
      }

      // 生成对应的MCP环境变量名（保持suffix原始大小写）
      const mcpKey = `CUSTOM_API_${configType}_${suffix}`
      dynamicMappings[key] = mcpKey
    }
  })

  logger.info(
    `[MCP Environment] Found ${Object.keys(dynamicMappings).length} dynamic custom environment variables`
  )

  return dynamicMappings
}

// 静态环境变量映射
const staticEnvMappings = {
  VITE_OPENAI_API_KEY: 'OPENAI_API_KEY',
  VITE_GEMINI_API_KEY: 'GEMINI_API_KEY',
  VITE_DEEPSEEK_API_KEY: 'DEEPSEEK_API_KEY',
  VITE_ZHIPU_API_KEY: 'ZHIPU_API_KEY',
  VITE_SILICONFLOW_API_KEY: 'SILICONFLOW_API_KEY',
  VITE_CUSTOM_API_KEY: 'CUSTOM_API_KEY',
  VITE_CUSTOM_API_BASE_URL: 'CUSTOM_API_BASE_URL',
  VITE_CUSTOM_API_MODEL: 'CUSTOM_API_MODEL',
}

// 动态环境变量映射
const dynamicEnvMappings = scanDynamicCustomEnvVars()

// 合并所有环境变量映射
const allEnvMappings = {
  ...staticEnvMappings,
  ...dynamicEnvMappings,
}

// 执行环境变量映射
Object.entries(allEnvMappings).forEach(([viteKey, mcpKey]) => {
  if (process.env[viteKey] && !process.env[mcpKey]) {
    process.env[mcpKey] = process.env[viteKey]
    logger.info(`[MCP Environment] Mapped ${viteKey} -> ${mcpKey}`)
  }
})

export interface MCPServerConfig {
  httpPort: number
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  defaultLanguage: string
  preferredModelProvider?: string
  allowedOrigins: string[]
  enableDnsRebindingProtection: boolean
}

export function loadConfig(): MCPServerConfig {
  const allowedOriginsEnv = process.env.MCP_ALLOWED_ORIGINS

  let allowedOrigins: string[]
  if (allowedOriginsEnv) {
    allowedOrigins = allowedOriginsEnv
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  } else {
    allowedOrigins = ['*']
  }

  const config: MCPServerConfig = {
    httpPort: parseInt(process.env.MCP_HTTP_PORT || String(MCP_CONFIG.server.defaultHttpPort)),
    logLevel:
      (process.env.MCP_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') ||
      MCP_CONFIG.logging.defaultLevel,
    defaultLanguage: process.env.MCP_DEFAULT_LANGUAGE || MCP_CONFIG.defaults.language,
    preferredModelProvider: process.env.MCP_DEFAULT_MODEL_PROVIDER,
    allowedOrigins,
    enableDnsRebindingProtection: process.env.MCP_DNS_REBINDING_PROTECTION === 'true',
  }

  validateConfig(config)

  return config
}

export function validateConfig(config: MCPServerConfig): void {
  if (config.httpPort < MCP_CONFIG.server.minPort || config.httpPort > MCP_CONFIG.server.maxPort) {
    throw new Error(
      `HTTP port must be between ${MCP_CONFIG.server.minPort} and ${MCP_CONFIG.server.maxPort}`
    )
  }

  if (!MCP_CONFIG.logging.validLevels.includes(config.logLevel)) {
    throw new Error(`Log level must be one of: ${MCP_CONFIG.logging.validLevels.join(', ')}`)
  }
}
