/**
 * Security Validation Utilities
 *
 * Provides security-focused validation functions for input sanitization,
 * API key validation, URL validation, and other security-critical operations.
 */

/**
 * Validates and sanitizes API key format
 * @param key - API key to validate
 * @param provider - Provider name for specific validation rules
 * @returns Validation result with sanitized key and any warnings
 */
export function validateApiKey(
  key: string,
  provider?: string
): { valid: boolean; sanitized: string; warnings: string[] } {
  const warnings: string[] = []

  // Basic sanitization
  const sanitized = key.trim()

  // Check for empty key
  if (!sanitized) {
    return { valid: false, sanitized: '', warnings: ['API key is empty'] }
  }

  // Check minimum length (most providers have at least 20 characters)
  if (sanitized.length < 20) {
    warnings.push('API key appears unusually short. Please verify it is correct.')
  }

  // Check for common mistakes
  if (sanitized.includes('your_') || sanitized.includes('YOUR_')) {
    warnings.push('API key appears to be a placeholder. Please replace with actual key.')
  }

  // Provider-specific validation
  if (provider) {
    switch (provider.toLowerCase()) {
      case 'openai':
        if (!sanitized.startsWith('sk-') && !sanitized.startsWith('sk-proj-')) {
          warnings.push('OpenAI API keys typically start with "sk-" or "sk-proj-"')
        }
        break
      case 'anthropic':
        if (!sanitized.startsWith('sk-ant-')) {
          warnings.push('Anthropic API keys typically start with "sk-ant-"')
        }
        break
      case 'gemini':
        if (sanitized.length < 30) {
          warnings.push('Gemini API keys are typically longer than 30 characters')
        }
        break
    }
  }

  // Check for suspicious patterns
  if (sanitized.includes(' ') || sanitized.includes('\n') || sanitized.includes('\t')) {
    warnings.push('API key contains whitespace characters. Please verify it is correct.')
  }

  return {
    valid: warnings.length === 0 || warnings.every((w) => !w.includes('placeholder')),
    sanitized,
    warnings,
  }
}

/**
 * Validates URL format and security
 * @param url - URL to validate
 * @param options - Validation options
 * @returns Validation result
 */
export function validateUrl(
  url: string,
  options: {
    allowedProtocols?: ('http:' | 'https:')[]
    allowLocalhost?: boolean
    allowPrivateIp?: boolean
    maxLength?: number
  } = {}
): { valid: boolean; sanitized: string; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []
  const {
    allowedProtocols = ['https:'],
    allowLocalhost = false,
    allowPrivateIp = false,
    maxLength = 2048,
  } = options

  // Trim whitespace
  let sanitized = url.trim()

  // Check length
  if (sanitized.length > maxLength) {
    errors.push(`URL exceeds maximum length of ${maxLength} characters`)
    return { valid: false, sanitized: '', errors, warnings }
  }

  // Parse URL
  let parsedUrl: URL
  try {
    parsedUrl = new URL(sanitized)
  } catch (error) {
    errors.push('Invalid URL format')
    return { valid: false, sanitized: '', errors, warnings }
  }

  // Check protocol
  if (!allowedProtocols.includes(parsedUrl.protocol as 'http:' | 'https:')) {
    errors.push(
      `Protocol ${parsedUrl.protocol} is not allowed. Allowed: ${allowedProtocols.join(', ')}`
    )
  }

  // Check for localhost
  if (
    !allowLocalhost &&
    (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1')
  ) {
    warnings.push('Localhost URLs should not be used in production environments')
  }

  // Check for private IP addresses
  if (!allowPrivateIp) {
    const privateIpPatterns = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^169\.254\./,
      /^0\.0\.0\.0$/,
    ]

    if (privateIpPatterns.some((pattern) => pattern.test(parsedUrl.hostname))) {
      warnings.push('Private IP addresses should not be used in production environments')
    }
  }

  // Check for suspicious patterns
  if (sanitized.includes('javascript:')) {
    errors.push('JavaScript URLs are not allowed')
  }

  if (sanitized.includes('data:')) {
    errors.push('Data URLs are not allowed')
  }

  // Remove trailing slash for consistency
  if (sanitized.endsWith('/')) {
    sanitized = sanitized.slice(0, -1)
  }

  return {
    valid: errors.length === 0,
    sanitized,
    errors,
    warnings,
  }
}

/**
 * Validates model identifier format
 * @param modelId - Model identifier to validate
 * @returns Validation result
 */
export function validateModelId(modelId: string): {
  valid: boolean
  sanitized: string
  errors: string[]
} {
  const errors: string[] = []
  const sanitized = modelId.trim()

  if (!sanitized) {
    errors.push('Model identifier cannot be empty')
  }

  // Check for valid characters (alphanumeric, hyphens, underscores, dots, colons, slashes)
  const validPattern = /^[a-zA-Z0-9\-_.:/]+$/
  if (sanitized && !validPattern.test(sanitized)) {
    errors.push('Model identifier contains invalid characters')
  }

  // Check length
  if (sanitized.length > 128) {
    errors.push('Model identifier exceeds maximum length of 128 characters')
  }

  return {
    valid: errors.length === 0,
    sanitized,
    errors,
  }
}

/**
 * Validates file path to prevent directory traversal
 * @param path - File path to validate
 * @returns Validation result
 */
export function validateFilePath(path: string): {
  valid: boolean
  sanitized: string
  errors: string[]
} {
  const errors: string[] = []
  const sanitized = path.trim()

  // Check for directory traversal attempts
  if (sanitized.includes('..') || sanitized.includes('~')) {
    errors.push('Directory traversal patterns are not allowed')
  }

  // Check for absolute paths on Windows and Unix
  if (/^[A-Za-z]:/.test(sanitized) || sanitized.startsWith('/')) {
    errors.push('Absolute paths are not allowed')
  }

  // Check for null bytes
  if (sanitized.includes('\0')) {
    errors.push('Null bytes in file paths are not allowed')
  }

  return {
    valid: errors.length === 0,
    sanitized,
    errors,
  }
}

/**
 * Sanitizes user input to prevent injection attacks
 * @param input - User input to sanitize
 * @param options - Sanitization options
 * @returns Sanitized input
 */
export function sanitizeInput(
  input: string,
  options: {
    maxLength?: number
    allowHtml?: boolean
    trimWhitespace?: boolean
  } = {}
): string {
  const { maxLength = 10000, allowHtml = false, trimWhitespace = true } = options

  let sanitized = input

  // Trim whitespace if requested
  if (trimWhitespace) {
    sanitized = sanitized.trim()
  }

  // Enforce maximum length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength)
  }

  // Remove or escape HTML if not allowed
  if (!allowHtml) {
    sanitized = sanitized
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
  }

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')

  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  return sanitized
}

/**
 * Validates environment variable name
 * @param name - Environment variable name to validate
 * @returns Validation result
 */
export function validateEnvVarName(name: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Environment variable names must start with a letter or underscore
  // and contain only letters, numbers, and underscores
  const validPattern = /^[A-Za-z_][A-Za-z0-9_]*$/

  if (!name) {
    errors.push('Environment variable name cannot be empty')
  } else if (!validPattern.test(name)) {
    errors.push(
      'Environment variable name must start with a letter or underscore and contain only letters, numbers, and underscores'
    )
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Rate limiter for security-sensitive operations
 */
export class SecurityRateLimiter {
  private attempts: Map<string, { count: number; firstAttempt: number; blockedUntil?: number }> =
    new Map()
  private cleanupInterval?: ReturnType<typeof setInterval>

  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000,
    private blockDurationMs: number = 300000,
    private maxEntries: number = 10000
  ) {
    // Cleanup old entries periodically
    this.cleanupInterval = setInterval(() => this.cleanup(), windowMs)
  }

  /**
   * Check if an identifier is allowed to proceed
   */
  checkLimit(identifier: string): { allowed: boolean; retryAfter?: number; remaining?: number } {
    const now = Date.now()
    const entry = this.attempts.get(identifier)

    // Check if currently blocked
    if (entry?.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
      }
    }

    // Reset if window has expired
    if (entry?.blockedUntil && now >= entry.blockedUntil) {
      this.attempts.delete(identifier)
      return { allowed: true, remaining: this.maxAttempts }
    }

    // Check if window has expired
    if (entry && now - entry.firstAttempt > this.windowMs) {
      this.attempts.delete(identifier)
      return { allowed: true, remaining: this.maxAttempts }
    }

    // No entry exists
    if (!entry) {
      return { allowed: true, remaining: this.maxAttempts }
    }

    // Within window, return remaining attempts
    return {
      allowed: true,
      remaining: this.maxAttempts - entry.count,
    }
  }

  /**
   * Record a failed attempt
   */
  recordFailure(identifier: string): void {
    const now = Date.now()
    const entry = this.attempts.get(identifier)

    if (!entry) {
      this.attempts.set(identifier, { count: 1, firstAttempt: now })
    } else if (now - entry.firstAttempt > this.windowMs) {
      this.attempts.set(identifier, { count: 1, firstAttempt: now })
    } else {
      entry.count++
      if (entry.count >= this.maxAttempts) {
        entry.blockedUntil = now + this.blockDurationMs
      }
    }
  }

  /**
   * Clear attempts for an identifier
   */
  clear(identifier: string): void {
    this.attempts.delete(identifier)
  }

  /**
   * Cleanup old entries
   */
  private cleanup(): void {
    const now = Date.now()
    const cutoff = now - this.windowMs - this.blockDurationMs

    for (const [key, val] of this.attempts) {
      if (val.firstAttempt < cutoff) {
        this.attempts.delete(key)
      }
    }

    // If still too large, remove oldest entries
    if (this.attempts.size > this.maxEntries) {
      const entries = Array.from(this.attempts.entries()).sort(
        (a, b) => a[1].firstAttempt - b[1].firstAttempt
      )

      const toRemove = entries.slice(0, this.attempts.size - this.maxEntries)
      for (const [key] of toRemove) {
        this.attempts.delete(key)
      }
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.attempts.clear()
  }
}

/**
 * Security audit logger
 */
export class SecurityAuditLogger {
  private logs: Array<{
    timestamp: number
    event: string
    details: Record<string, unknown>
    severity: 'low' | 'medium' | 'high' | 'critical'
  }> = []

  /**
   * Log a security event
   */
  log(
    event: string,
    details: Record<string, unknown>,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
  ): void {
    this.logs.push({
      timestamp: Date.now(),
      event,
      details,
      severity,
    })

    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      const logMethod =
        severity === 'critical' || severity === 'high' ? console.error : console.warn
      logMethod(`[Security Audit] ${severity.toUpperCase()}: ${event}`, details)
    }
  }

  /**
   * Get logs by severity
   */
  getLogs(severity?: 'low' | 'medium' | 'high' | 'critical'): typeof this.logs {
    if (!severity) return [...this.logs]
    return this.logs.filter((log) => log.severity === severity)
  }

  /**
   * Clear logs
   */
  clear(): void {
    this.logs = []
  }
}
