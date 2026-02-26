/**
 * Variable Extraction API
 *
 * Provides AI-powered variable extraction from prompt text.
 * This is part of the Smart Prompt Templates innovation feature.
 *
 * Uses pattern-based detection to identify implicit variables in prompts:
 * - Recipient/target patterns (to, for, about)
 * - Topic/subject patterns
 * - Tool/method patterns (using, with, via)
 * - Name identifiers (called, named)
 *
 * Analytics tracking included for measuring feature growth:
 * - Request counts by variable count, language
 * - Daily usage tracking
 */

import { extractVariables, extractVariablesSchema } from '../packages/core/src/services/template/variable-extraction'

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Cross-Origin-Opener-Policy': 'same-origin',
}

function generateRequestId() {
  return `var_${Date.now()}_${crypto.randomUUID().split('-')[0]}`
}

function log(level, message, data = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: 'variable-extraction-api',
    region: process.env.VERCEL_REGION || 'local',
    ...data,
  }
  console.log(JSON.stringify(logEntry))
}

function validateRequest(body) {
  const result = extractVariablesSchema.safeParse(body)
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))
    return { valid: false, errors }
  }
  return { valid: true, data: result.data }
}

function successResponse(data) {
  return {
    success: true,
    data,
  }
}

function errorResponse(message, statusCode = 400) {
  return {
    success: false,
    error: {
      message,
      statusCode,
    },
  }
}

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

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json(errorResponse('Method not allowed', 405))
    return
  }

  try {
    log('info', 'Variable extraction request received', {
      bodySize: JSON.stringify(req.body)?.length || 0,
    })

    const validation = validateRequest(req.body)
    if (!validation.valid) {
      log('warn', 'Validation failed', { errors: validation.errors })
      res.status(400).json(errorResponse('Validation failed', 400))
      return
    }

    const { prompt, language } = validation.data

    const result = extractVariables(prompt, language)

    log('info', 'Variable extraction completed', {
      promptLength: prompt.length,
      variableCount: result.count,
      language,
      extractionTime: Date.now() - startTime,
    })

    res.status(200).json(successResponse(result))
  } catch (error) {
    log('error', 'Variable extraction error', {
      error: error.message,
      stack: error.stack,
    })
    res.status(500).json(errorResponse('Internal server error', 500))
  }
}
