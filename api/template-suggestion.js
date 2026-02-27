/**
 * Template Suggestion API
 *
 * Provides AI-powered template suggestions based on prompt pattern analysis.
 * This is the first step in the Smart Prompt Templates innovation feature.
 *
 * Analytics tracking included for measuring feature growth:
 * - Request counts by type, language, complexity
 * - Acceptance tracking for suggestion effectiveness
 * - Daily usage tracking
 * - Integration with Vercel Analytics / Datadog
 *
 * Future enhancements:
 * - LLM-based suggestion refinement
 * - Community template analysis
 * - User pattern learning
 */

import { suggestTemplatesSchema, getTemplateSuggestions } from '../packages/core/src/services/template/suggestion'
import { templateAnalytics } from '../packages/core/src/services/analytics'

const analytics = templateAnalytics

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Cross-Origin-Opener-Policy': 'same-origin',
}

const ACCEPTANCE_SCHEMA = {
  templateId: z.string().min(1, 'Template ID is required'),
  detectedType: z.string().optional(),
  language: z.enum(['zh', 'en']).optional().default('en'),
}

import { z } from 'zod'

function generateRequestId() {
  return `tpl_${Date.now()}_${crypto.randomUUID().split('-')[0]}`
}

/**
 * Structured logging for Vercel serverless functions
 */
function log(level, message, data = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: 'template-suggestion-api',
    region: process.env.VERCEL_REGION || 'local',
    ...data,
  }
  console.log(JSON.stringify(logEntry))
}

/**
 * Validate request body against schema
 */
function validateRequest(body) {
  const result = suggestTemplatesSchema.safeParse(body)
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))
    return { valid: false, errors }
  }
  return { valid: true, data: result.data }
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
 * Track analytics event
 */
function trackAnalytics(detectedType, language, complexity) {
  try {
    analytics.trackSuggestion({
      detectedType,
      language,
      complexity,
    })
    log('debug', 'Analytics tracked', { detectedType, language, complexity })
  } catch (error) {
    log('warn', 'Analytics tracking failed', { error: error.message })
  }
}

/**
 * Track acceptance event
 */
function trackAcceptance(templateId, detectedType, language) {
  try {
    analytics.trackAcceptedSuggestion({
      templateId,
      detectedType,
      language,
    })
    log('debug', 'Acceptance tracked', { templateId, detectedType, language })
  } catch (error) {
    log('warn', 'Acceptance tracking failed', { error: error.message })
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

  // Handle analytics GET request
  if (req.method === 'GET' && req.url === '/analytics') {
    try {
      const summary = analytics.getSummary()
      res.status(200).json(successResponse(summary))
      return
    } catch (error) {
      log('error', 'Analytics retrieval error', { error: error.message })
      res.status(500).json(errorResponse('Failed to retrieve analytics', 500))
      return
    }
  }

  // Handle acceptance tracking POST request
  if (req.method === 'POST' && req.url === '/accept') {
    try {
      const result = ACCEPTANCE_SCHEMA.safeParse(req.body)
      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))
        res.status(400).json(errorResponse('Validation failed', 400))
        return
      }

      const { templateId, detectedType, language } = result.data

      trackAcceptance(templateId, detectedType, language)

      log('info', 'Template acceptance tracked', {
        templateId,
        detectedType,
        language,
      })

      res.status(200).json(successResponse({ accepted: true }))
      return
    } catch (error) {
      log('error', 'Acceptance tracking error', {
        error: error.message,
        stack: error.stack,
      })
      res.status(500).json(errorResponse('Internal server error', 500))
      return
    }
  }

  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json(errorResponse('Method not allowed', 405))
    return
  }

  try {
    log('info', 'Template suggestion request received', {
      bodySize: JSON.stringify(req.body)?.length || 0,
    })

    // Validate request
    const validation = validateRequest(req.body)
    if (!validation.valid) {
      log('warn', 'Validation failed', { errors: validation.errors })
      res.status(400).json(errorResponse('Validation failed', 400))
      return
    }

    const { prompt, language } = validation.data

    // Get suggestions
    const result = getTemplateSuggestions(prompt, language)

    // Track analytics
    trackAnalytics(result.analysis.detectedType, language, result.analysis.complexity)

    log('info', 'Template suggestions generated', {
      promptLength: prompt.length,
      suggestionCount: result.suggestions.length,
      detectedType: result.analysis.detectedType,
      complexity: result.analysis.complexity,
    })

    // Return success response
    res.status(200).json(successResponse(result))
  } catch (error) {
    log('error', 'Template suggestion error', {
      error: error.message,
      stack: error.stack,
    })
    res.status(500).json(errorResponse('Internal server error', 500))
  }
}
