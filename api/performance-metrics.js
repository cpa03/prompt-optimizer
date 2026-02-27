/**
 * Performance Metrics API
 *
 * Provides performance metrics tracking for prompt optimization.
 * Part of the Innovation feature: prompt performance benchmarking.
 *
 * Analytics tracking:
 * - Latency per model
 * - Token counts (input/output)
 * - Success/failure rates
 * - Daily usage tracking
 * - By model and template breakdowns
 *
 * Integration:
 * - Used by optimization flow to track performance
 * - Provides data for benchmark comparisons
 * - Historical tracking for trend analysis
 */

import { performanceMetrics } from '../packages/core/src/services/analytics'

const metrics = performanceMetrics

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Cross-Origin-Opener-Policy': 'same-origin',
}

const TRACK_SCHEMA = {
  modelKey: z.string().min(1, 'Model key is required'),
  templateId: z.string().min(1, 'Template ID is required'),
  optimizationMode: z.string().optional().default('default'),
  latencyMs: z.number().min(0, 'Latency must be non-negative'),
  inputTokens: z.number().int().min(0).optional().default(0),
  outputTokens: z.number().int().min(0).optional().default(0),
  success: z.boolean(),
  errorMessage: z.string().optional(),
}

import { z } from 'zod'

function generateRequestId() {
  return `pm_${Date.now()}_${crypto.randomUUID().split('-')[0]}`
}

/**
 * Structured logging for Vercel serverless functions
 */
function log(level, message, data = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: 'performance-metrics-api',
    region: process.env.VERCEL_REGION || 'local',
    ...data,
  }
  console.log(JSON.stringify(logEntry))
}

/**
 * Build successful response
 */
function successResponse(data) {
  return {
    success: true,
    data,
  }
}

/**
 * Build error response
 */
function errorResponse(message, statusCode = 400) {
  return {
    success: false,
    error: {
      message,
      statusCode,
    },
  }
}

/**
 * Main handler function
 */
export default async function handler(req, res) {
  const requestId = generateRequestId()
  const startTime = Date.now()
  const isProduction = process.env.NODE_ENV === 'production'

  const corsOrigin = isProduction ? req.headers.origin || '*' : '*'

  const baseHeaders = {
    ...SECURITY_HEADERS,
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
    'X-Request-ID': requestId,
  }

  Object.entries(baseHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })

  const originalJson = res.json.bind(res)
  res.json = function (data) {
    const responseTime = Date.now() - startTime
    res.setHeader('X-Response-Time', `${responseTime}ms`)
    return originalJson(data)
  }

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Handle metrics GET request (retrieve summary)
  if (req.method === 'GET' && req.url === '/analytics') {
    try {
      const summary = metrics.getSummary()
      res.status(200).json(successResponse(summary))
      return
    } catch (error) {
      log('error', 'Metrics retrieval error', { error: error.message })
      res.status(500).json(errorResponse('Failed to retrieve metrics', 500))
      return
    }
  }

  // Handle full metrics GET request
  if (req.method === 'GET' && req.url === '/metrics') {
    try {
      const fullMetrics = metrics.getMetrics()
      res.status(200).json(successResponse(fullMetrics))
      return
    } catch (error) {
      log('error', 'Full metrics retrieval error', { error: error.message })
      res.status(500).json(errorResponse('Failed to retrieve metrics', 500))
      return
    }
  }

  // Handle metrics POST request (track optimization)
  if (req.method === 'POST' && req.url === '/track') {
    try {
      const result = TRACK_SCHEMA.safeParse(req.body)
      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))
        log('warn', 'Validation failed', { errors })
        res.status(400).json(errorResponse('Validation failed', 400))
        return
      }

      const {
        modelKey,
        templateId,
        optimizationMode,
        latencyMs,
        inputTokens,
        outputTokens,
        success,
        errorMessage,
      } = result.data

      metrics.trackOptimization({
        modelKey,
        templateId,
        optimizationMode,
        latencyMs,
        inputTokens,
        outputTokens,
        success,
        errorMessage,
      })

      await metrics.save()

      log('info', 'Performance metrics tracked', {
        modelKey,
        templateId,
        optimizationMode,
        latencyMs,
        success,
      })

      res.status(200).json(successResponse({ tracked: true }))
      return
    } catch (error) {
      log('error', 'Metrics tracking error', {
        error: error.message,
        stack: error.stack,
      })
      res.status(500).json(errorResponse('Internal server error', 500))
      return
    }
  }

  // Only allow GET or POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json(errorResponse('Method not allowed', 405))
    return
  }

  // Default: return API info
  if (req.method === 'GET') {
    res.status(200).json(successResponse({
      endpoints: {
        'GET /analytics': 'Get metrics summary (total, success rate, latency, top model/template)',
        'GET /metrics': 'Get full metrics with daily breakdown',
        'POST /track': 'Track optimization performance metrics',
      },
    }))
    return
  }
}
