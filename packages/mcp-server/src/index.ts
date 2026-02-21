#!/usr/bin/env node

/*
 * Prompt Optimizer - AI提示词优化工具
 * Copyright (C) 2025 linshenkx
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * MCP Server for Prompt Optimizer
 *
 * 提供3个核心工具：
 * - optimize-user-prompt: 优化用户提示词
 * - optimize-system-prompt: 优化系统提示词
 * - iterate-prompt: 迭代优化成熟提示词
 *
 * 支持 stdio 和 HTTP 两种传输方式
 *
 * 注意：环境变量通过 environment.ts 在应用启动时加载
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  isInitializeRequest,
} from '@modelcontextprotocol/sdk/types.js'
import { CoreServicesManager } from './adapters/core-services.js'
import { loadConfig, MCPServerConfig } from './config/environment.js'
import * as logger from './utils/logging.js'
import { ParameterValidator } from './adapters/parameter-adapter.js'
import { getTemplateOptions, getDefaultTemplateId } from './config/templates.js'
import { randomUUID } from 'node:crypto'
import express from 'express'
import {
  createRateLimiter,
  getClientIdentifier,
  type RateLimitResult,
} from './utils/rate-limiter.js'
import { MCP_CONFIG } from '@prompt-optimizer/core'

// 创建服务器实例的工厂函数
async function createServerInstance(config: MCPServerConfig) {
  // 创建 MCP Server 实例 - 使用正确的 API
  const server = new Server(
    {
      name: 'prompt-optimizer-mcp-server',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  )

  // 初始化 Core 服务（每个服务器实例独立）
  const coreServices = CoreServicesManager.getInstance()
  await coreServices.initialize(config)

  return { server, coreServices }
}

// 设置服务器工具和处理器的函数
async function setupServerHandlers(server: Server, coreServices: CoreServicesManager) {
  // 获取模板选项和默认模板ID用于工具定义
  logger.info('获取模板选项...')
  const templateManager = coreServices.getTemplateManager()
  const [
    userOptimizeOptions,
    systemOptimizeOptions,
    iterateOptions,
    userDefaultId,
    systemDefaultId,
    iterateDefaultId,
  ] = await Promise.all([
    getTemplateOptions(templateManager, 'userOptimize'),
    getTemplateOptions(templateManager, 'optimize'),
    getTemplateOptions(templateManager, 'iterate'),
    getDefaultTemplateId(templateManager, 'user'),
    getDefaultTemplateId(templateManager, 'system'),
    getDefaultTemplateId(templateManager, 'iterate'),
  ])

  // 注册工具列表处理器
  logger.info('注册 MCP 工具...')
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'optimize-user-prompt',
          description:
            '优化用户提示词，提升与AI对话的效果。适用于日常对话、问答、创作等场景。\n\n主要功能：\n- 增强表达清晰度和具体性\n- 添加必要的上下文信息\n- 优化语言表达和逻辑结构\n- 提高AI理解准确性\n\n使用场景示例：\n- 将模糊问题转化为具体明确的询问\n- 为创作任务添加详细要求和约束\n- 优化技术问题的描述方式',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: "要优化的用户提示词。例如：'帮我写个文章' 或 '解释一下机器学习'",
              },
              template: {
                type: 'string',
                description: `选择优化模板，不同模板适用于不同场景：\n${userOptimizeOptions.map((opt) => `- ${opt.label}：${opt.description}`).join('\n')}`,
                enum: userOptimizeOptions.map((opt) => opt.value),
                default: userDefaultId,
              },
            },
            required: ['prompt'],
          },
        },
        {
          name: 'optimize-system-prompt',
          description:
            '优化系统提示词，提升AI角色扮演和行为控制效果。适用于定制AI助手、创建专业角色、设计对话系统等场景。\n\n主要功能：\n- 增强角色定义和专业性\n- 优化行为指导和约束\n- 改进指令结构和层次\n- 添加必要的专业知识\n\n使用场景示例：\n- 将简单角色描述转化为专业角色定义\n- 为AI助手添加详细的行为规则和限制\n- 优化特定领域专家的知识框架',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: "要优化的系统提示词。例如：'你是一个助手' 或 '你是一个医疗顾问'",
              },
              template: {
                type: 'string',
                description: `选择优化模板，不同模板适用于不同场景：\n${systemOptimizeOptions.map((opt) => `- ${opt.label}：${opt.description}`).join('\n')}`,
                enum: systemOptimizeOptions.map((opt) => opt.value),
                default: systemDefaultId,
              },
            },
            required: ['prompt'],
          },
        },
        {
          name: 'iterate-prompt',
          description:
            '基于具体需求迭代改进已有的提示词。适用于已经有基础提示词，但需要针对特定需求进行精细调整的场景。\n\n主要功能：\n- 保持原有提示词的核心功能\n- 根据具体需求进行针对性改进\n- 解决现有提示词的特定问题\n- 适应新的使用场景或要求\n\n使用场景示例：\n- 现有提示词效果不够理想，需要改进\n- 需要适应新的业务需求或使用场景\n- 要解决特定的输出格式或内容问题\n- 需要增强某个特定方面的表现',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: '要迭代改进的现有提示词。应该是一个已经在使用但需要改进的完整提示词',
              },
              requirements: {
                type: 'string',
                description:
                  "具体的改进需求或问题描述。例如：'输出格式不够规范' 或 '需要更专业的语言风格' 或 '希望增加创意性'",
              },
              template: {
                type: 'string',
                description: `选择迭代优化模板，不同模板有不同的改进策略：\n${iterateOptions.map((opt) => `- ${opt.label}：${opt.description}`).join('\n')}`,
                enum: iterateOptions.map((opt) => opt.value),
                default: iterateDefaultId,
              },
            },
            required: ['prompt', 'requirements'],
          },
        },
      ],
    }
  })

  // 注册工具调用处理器
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params
    logger.info(`处理工具调用请求: ${name}`)

    try {
      switch (name) {
        case 'optimize-user-prompt': {
          const { prompt, template } = args as { prompt?: string; template?: string }

          if (!prompt) {
            return {
              isError: true,
              content: [
                {
                  type: 'text',
                  text: "错误：缺少必需参数 'prompt'",
                },
              ],
            }
          }

          // 参数验证
          ParameterValidator.validatePrompt(prompt)
          if (template) {
            ParameterValidator.validateTemplate(template)
          }

          // 调用 Core 服务
          const promptService = coreServices.getPromptService()
          const modelManager = coreServices.getModelManager()
          const templateManager = coreServices.getTemplateManager()

          // 检查 MCP 默认模型是否可用
          const mcpModel = await modelManager.getModel('mcp-default')
          if (!mcpModel || !mcpModel.enabled) {
            return {
              isError: true,
              content: [
                {
                  type: 'text',
                  text: '错误：MCP 默认模型未配置或未启用，请检查环境变量配置',
                },
              ],
            }
          }

          const templateId = template || (await getDefaultTemplateId(templateManager, 'user'))
          const result = await promptService.optimizePrompt({
            targetPrompt: prompt,
            modelKey: 'mcp-default',
            optimizationMode: 'user',
            templateId,
          })

          return {
            content: [
              {
                type: 'text',
                text: result,
              },
            ],
          }
        }

        case 'optimize-system-prompt': {
          const { prompt, template } = args as { prompt?: string; template?: string }

          if (!prompt) {
            return {
              isError: true,
              content: [
                {
                  type: 'text',
                  text: "错误：缺少必需参数 'prompt'",
                },
              ],
            }
          }

          // 参数验证
          ParameterValidator.validatePrompt(prompt)
          if (template) {
            ParameterValidator.validateTemplate(template)
          }

          // 调用 Core 服务
          const promptService = coreServices.getPromptService()
          const modelManager = coreServices.getModelManager()
          const templateManager = coreServices.getTemplateManager()

          // 检查 MCP 默认模型是否可用
          const mcpModel = await modelManager.getModel('mcp-default')
          if (!mcpModel || !mcpModel.enabled) {
            return {
              isError: true,
              content: [
                {
                  type: 'text',
                  text: '错误：MCP 默认模型未配置或未启用，请检查环境变量配置',
                },
              ],
            }
          }

          const templateId = template || (await getDefaultTemplateId(templateManager, 'system'))
          const result = await promptService.optimizePrompt({
            targetPrompt: prompt,
            modelKey: 'mcp-default',
            optimizationMode: 'system',
            templateId,
          })

          return {
            content: [
              {
                type: 'text',
                text: result,
              },
            ],
          }
        }

        case 'iterate-prompt': {
          const { prompt, requirements, template } = args as {
            prompt?: string
            requirements?: string
            template?: string
          }

          if (!prompt) {
            return {
              isError: true,
              content: [
                {
                  type: 'text',
                  text: "错误：缺少必需参数 'prompt'",
                },
              ],
            }
          }

          if (!requirements) {
            return {
              isError: true,
              content: [
                {
                  type: 'text',
                  text: "错误：缺少必需参数 'requirements'",
                },
              ],
            }
          }

          // 参数验证
          ParameterValidator.validatePrompt(prompt)
          ParameterValidator.validateRequirements(requirements)
          if (template) {
            ParameterValidator.validateTemplate(template)
          }

          // 调用 Core 服务
          const promptService = coreServices.getPromptService()
          const modelManager = coreServices.getModelManager()
          const templateManager = coreServices.getTemplateManager()

          // 检查 MCP 默认模型是否可用
          const mcpModel = await modelManager.getModel('mcp-default')
          if (!mcpModel || !mcpModel.enabled) {
            return {
              isError: true,
              content: [
                {
                  type: 'text',
                  text: '错误：MCP 默认模型未配置或未启用，请检查环境变量配置',
                },
              ],
            }
          }

          const templateId = template || (await getDefaultTemplateId(templateManager, 'iterate'))
          const result = await promptService.iteratePrompt(
            prompt,
            prompt, // 使用原始提示词作为上次优化的提示词
            requirements,
            'mcp-default',
            templateId
          )

          return {
            content: [
              {
                type: 'text',
                text: result,
              },
            ],
          }
        }

        default:
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: `错误：未知工具 '${name}'`,
              },
            ],
          }
      }
    } catch (error) {
      logger.error(`工具执行错误 ${name}:`, error as Error)
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `工具执行错误: ${(error as Error).message}`,
          },
        ],
      }
    }
  })

  logger.info('MCP 工具注册成功')
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function validateSessionId(id: string | undefined): boolean {
  if (!id) return false
  return UUID_REGEX.test(id)
}

async function main() {
  const config = loadConfig()
  logger.setLogLevel(config.logLevel)

  try {
    const args = process.argv.slice(2)
    const transport = args.find((arg) => arg.startsWith('--transport='))?.split('=')[1] || 'stdio'
    const port = parseInt(
      args.find((arg) => arg.startsWith('--port='))?.split('=')[1] || config.httpPort.toString()
    )

    logger.info('Starting MCP Server for Prompt Optimizer')
    logger.info(`Transport: ${transport}, Port: ${port}`)

    logger.info('Initializing Core services...')
    const coreServices = CoreServicesManager.getInstance()
    await coreServices.initialize(config)
    logger.info('Core services initialized successfully')

    if (transport === 'http') {
      logger.info('Starting HTTP server with session management...')
      const app = express()
      app.use(express.json())

      app.use((_req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff')
        res.setHeader('X-Frame-Options', 'DENY')
        res.setHeader('X-XSS-Protection', '1; mode=block')
        res.removeHeader('X-Powered-By')
        next()
      })

      logger.info('Express app configured')

      const rateLimiter = createRateLimiter({
        windowMs: MCP_CONFIG.rateLimit.defaultWindowMs,
        maxRequests: MCP_CONFIG.rateLimit.defaultMaxRequests,
      })

      // Health check endpoint for monitoring and load balancers
      app.get('/health', async (_req, res) => {
        const rateLimitStats = rateLimiter.getStats()
        const memUsage = process.memoryUsage()
        const activeSessions = Object.keys(transports).length

        let coreHealth: { initialized: boolean; services: Record<string, boolean> } | null = null
        try {
          coreHealth = await coreServices.getHealthStatus()
        } catch {
          coreHealth = null
        }

        const healthStatus = {
          status: coreHealth?.initialized ? 'healthy' : 'degraded',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          version: '0.1.0',
          rateLimiter: {
            totalClients: rateLimitStats.totalClients,
            maxRequests: rateLimitStats.config.maxRequests,
          },
          sessions: {
            active: activeSessions,
          },
          memory: {
            heapUsedMB: Math.round(memUsage.heapUsed / 1024 / 1024),
            heapTotalMB: Math.round(memUsage.heapTotal / 1024 / 1024),
            rssMB: Math.round(memUsage.rss / 1024 / 1024),
            externalMB: Math.round(memUsage.external / 1024 / 1024),
          },
          coreServices: coreHealth,
        }

        res.status(coreHealth?.initialized ? 200 : 503).json(healthStatus)
      })

      const rateLimitMiddleware = (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        const clientId = getClientIdentifier(req)
        const result: RateLimitResult = rateLimiter.check(clientId)

        res.setHeader('X-RateLimit-Limit', String(MCP_CONFIG.rateLimit.defaultMaxRequests))
        res.setHeader('X-RateLimit-Remaining', result.remaining.toString())
        res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString())

        if (!result.allowed) {
          res.setHeader('Retry-After', result.retryAfter?.toString() || '60')
          res.status(429).json({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Too Many Requests: Rate limit exceeded. Please retry later.',
              data: { retryAfter: result.retryAfter },
            },
            id: null,
          })
          return
        }

        next()
      }

      // 存储每个会话的传输实例及元数据
      interface SessionMetadata {
        transport: StreamableHTTPServerTransport
        createdAt: number
        lastActivityAt: number
      }
      const transports: { [sessionId: string]: SessionMetadata } = {}

      // Session configuration
      const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
      const SESSION_CLEANUP_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

      // Stale session cleanup job
      const cleanupStaleSessions = () => {
        const now = Date.now()
        let cleanedCount = 0

        for (const [sessionId, meta] of Object.entries(transports)) {
          if (now - meta.lastActivityAt > SESSION_TIMEOUT_MS) {
            delete transports[sessionId]
            cleanedCount++
            logger.debug(`[SessionCleanup] Removed stale session: ${sessionId}`)
          }
        }

        if (cleanedCount > 0) {
          logger.info(`[SessionCleanup] Cleaned ${cleanedCount} stale session(s)`)
        }
      }

      const sessionCleanupTimer = setInterval(cleanupStaleSessions, SESSION_CLEANUP_INTERVAL_MS)
      sessionCleanupTimer.unref() // Don't prevent process exit

      // Helper to update session activity
      const updateSessionActivity = (sessionId: string) => {
        const meta = transports[sessionId]
        if (meta) {
          meta.lastActivityAt = Date.now()
        }
      }

      // 处理 POST 请求（客户端到服务器通信）
      app.post('/mcp', rateLimitMiddleware, async (req, res) => {
        // 检查现有会话ID
        const sessionId = req.headers['mcp-session-id'] as string | undefined
        let httpTransport: StreamableHTTPServerTransport

        if (sessionId && transports[sessionId]) {
          // 重用现有传输
          httpTransport = transports[sessionId].transport
          updateSessionActivity(sessionId)
        } else if (!sessionId && isInitializeRequest(req.body)) {
          httpTransport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (newSessionId) => {
              const now = Date.now()
              transports[newSessionId] = {
                transport: httpTransport,
                createdAt: now,
                lastActivityAt: now,
              }
            },
            allowedOrigins: config.allowedOrigins,
            enableDnsRebindingProtection: config.enableDnsRebindingProtection,
          })

          // 清理传输实例
          httpTransport.onclose = () => {
            if (httpTransport.sessionId) {
              delete transports[httpTransport.sessionId]
              logger.debug(`[SessionCleanup] Session closed: ${httpTransport.sessionId}`)
            }
          }

          // 为每个会话创建独立的服务器实例
          const { server } = await createServerInstance(config)
          await setupServerHandlers(server, coreServices)

          // 连接到 MCP 服务器
          await server.connect(httpTransport)
        } else {
          // 无效请求
          res.status(400).json({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Bad Request: No valid session ID provided',
            },
            id: null,
          })
          return
        }

        // 处理请求
        await httpTransport.handleRequest(req, res, req.body)
      })

      app.get('/mcp', async (req, res) => {
        const sessionId = req.headers['mcp-session-id'] as string | undefined
        if (!validateSessionId(sessionId) || !transports[sessionId!]) {
          res.status(400).send('Invalid or missing session ID')
          return
        }

        const httpTransport = transports[sessionId!].transport
        updateSessionActivity(sessionId!)
        await httpTransport.handleRequest(req, res)
      })

      app.delete('/mcp', async (req, res) => {
        const sessionId = req.headers['mcp-session-id'] as string | undefined
        if (!validateSessionId(sessionId) || !transports[sessionId!]) {
          res.status(400).send('Invalid or missing session ID')
          return
        }

        const httpTransport = transports[sessionId!].transport
        await httpTransport.handleRequest(req, res)
      })

      logger.info('Setting up HTTP server listener...')
      const httpServer = app.listen(port, () => {
        logger.info(`MCP Server running on HTTP port ${port} with session management`)
      })
      logger.info('HTTP server setup completed')

      // Improved graceful shutdown for HTTP mode
      const gracefulShutdown = (signal: string) => {
        console.log(`Received ${signal}, shutting down gracefully...`)

        // Stop the rate limiter cleanup timer
        rateLimiter.stop()

        // Stop the session cleanup timer
        clearInterval(sessionCleanupTimer)

        // Stop accepting new connections
        httpServer.close(() => {
          console.log('HTTP server closed')
          process.exit(0)
        })

        // Force close after timeout (use unref to not prevent process exit)
        const forceExitTimer = setTimeout(() => {
          console.warn('Forcing shutdown after timeout')
          process.exit(1)
        }, 10000)
        forceExitTimer.unref()

        // Close all active sessions
        const sessionIds = Object.keys(transports)
        if (sessionIds.length > 0) {
          console.log(`Closing ${sessionIds.length} active session(s)...`)
        }
      }

      process.on('SIGINT', () => gracefulShutdown('SIGINT'))
      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    } else {
      // stdio 模式 - 创建单个服务器实例
      const { server } = await createServerInstance(config)
      await setupServerHandlers(server, coreServices)

      const stdioTransport = new StdioServerTransport()
      await server.connect(stdioTransport)
      logger.info('MCP Server running on stdio')
    }
  } catch (error) {
    // 确保错误信息始终显示，即使没有启用 DEBUG
    console.error('❌ MCP Server startup failed:')
    console.error('   ', (error as Error).message)

    // 同时使用 debug 库记录详细信息
    logger.error('Failed to start MCP Server', error as Error)

    process.exit(1)
  }
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// 优雅关闭 (stdio mode fallback - HTTP mode registers its own handlers)
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully...')
  process.exit(0)
})

// 导出 main 函数供外部调用
export { main }

// 创建一个单独的启动文件，避免在构建时执行
