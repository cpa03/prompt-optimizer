/**
 * Security Validation Utilities Tests
 *
 * Tests for security-critical validation functions
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  validateApiKey,
  validateUrl,
  validateModelId,
  validateFilePath,
  sanitizeInput,
  validateEnvVarName,
  SecurityRateLimiter,
  SecurityAuditLogger,
} from '../src/utils/security-validation'

describe('Security Validation Utilities', () => {
  describe('validateApiKey', () => {
    it('should validate OpenAI API key format', () => {
      const result = validateApiKey('sk-test1234567890abcdefghijklmnop', 'openai')
      expect(result.valid).toBe(true)
      expect(result.sanitized).toBe('sk-test1234567890abcdefghijklmnop')
      expect(result.warnings).toHaveLength(0)
    })

    it('should warn about incorrect OpenAI key format', () => {
      const result = validateApiKey('invalid-key', 'openai')
      expect(result.valid).toBe(true) // Still valid, just warning
      expect(result.warnings).toContain('OpenAI API keys typically start with "sk-" or "sk-proj-"')
    })

    it('should detect placeholder keys', () => {
      const result = validateApiKey('your_api_key_here', 'openai')
      expect(result.valid).toBe(false)
      expect(result.warnings).toContain(
        'API key appears to be a placeholder. Please replace with actual key.'
      )
    })

    it('should warn about unusually short keys', () => {
      const result = validateApiKey('short', 'openai')
      expect(result.warnings).toContain(
        'API key appears unusually short. Please verify it is correct.'
      )
    })

    it('should detect whitespace in keys', () => {
      const result = validateApiKey('sk-test key', 'openai')
      expect(result.warnings).toContain(
        'API key contains whitespace characters. Please verify it is correct.'
      )
    })

    it('should trim whitespace from keys', () => {
      const result = validateApiKey('  sk-test1234567890  ', 'openai')
      expect(result.sanitized).toBe('sk-test1234567890')
    })

    it('should reject empty keys', () => {
      const result = validateApiKey('', 'openai')
      expect(result.valid).toBe(false)
      expect(result.warnings).toContain('API key is empty')
    })
  })

  describe('validateUrl', () => {
    it('should validate HTTPS URLs', () => {
      const result = validateUrl('https://api.openai.com/v1', { allowedProtocols: ['https:'] })
      expect(result.valid).toBe(true)
      expect(result.sanitized).toBe('https://api.openai.com/v1')
      expect(result.errors).toHaveLength(0)
    })

    it('should reject HTTP URLs when only HTTPS is allowed', () => {
      const result = validateUrl('http://api.openai.com/v1', { allowedProtocols: ['https:'] })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Protocol http: is not allowed. Allowed: https:')
    })

    it('should warn about localhost URLs in production', () => {
      const result = validateUrl('http://localhost:3000', { allowLocalhost: false })
      expect(result.warnings).toContain(
        'Localhost URLs should not be used in production environments'
      )
    })

    it('should allow localhost URLs when specified', () => {
      const result = validateUrl('http://localhost:3000', { allowLocalhost: true })
      expect(result.valid).toBe(true)
      expect(result.warnings).not.toContain(
        'Localhost URLs should not be used in production environments'
      )
    })

    it('should warn about private IP addresses', () => {
      const result = validateUrl('https://192.168.1.1/api', { allowPrivateIp: false })
      expect(result.warnings).toContain(
        'Private IP addresses should not be used in production environments'
      )
    })

    it('should reject JavaScript URLs', () => {
      const result = validateUrl('javascript:alert(1)')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('JavaScript URLs are not allowed')
    })

    it('should reject data URLs', () => {
      const result = validateUrl('data:text/html,<script>alert(1)</script>')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Data URLs are not allowed')
    })

    it('should reject invalid URL format', () => {
      const result = validateUrl('not-a-url')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid URL format')
    })

    it('should enforce maximum length', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(3000)
      const result = validateUrl(longUrl, { maxLength: 2048 })
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('URL exceeds maximum length of 2048 characters')
    })
  })

  describe('validateModelId', () => {
    it('should validate standard model IDs', () => {
      const result = validateModelId('gpt-4-turbo')
      expect(result.valid).toBe(true)
      expect(result.sanitized).toBe('gpt-4-turbo')
    })

    it('should validate model IDs with slashes', () => {
      const result = validateModelId('openai/gpt-4-turbo')
      expect(result.valid).toBe(true)
    })

    it('should validate model IDs with colons', () => {
      const result = validateModelId('anthropic:claude-3')
      expect(result.valid).toBe(true)
    })

    it('should reject empty model IDs', () => {
      const result = validateModelId('')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Model identifier cannot be empty')
    })

    it('should reject invalid characters', () => {
      const result = validateModelId('model@#$')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Model identifier contains invalid characters')
    })

    it('should reject overly long model IDs', () => {
      const longId = 'a'.repeat(150)
      const result = validateModelId(longId)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Model identifier exceeds maximum length of 128 characters')
    })
  })

  describe('validateFilePath', () => {
    it('should reject directory traversal attempts', () => {
      const result = validateFilePath('../../../etc/passwd')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Directory traversal patterns are not allowed')
    })

    it('should reject absolute paths', () => {
      const result = validateFilePath('/etc/passwd')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Absolute paths are not allowed')
    })

    it('should reject Windows absolute paths', () => {
      const result = validateFilePath('C:\\Windows\\System32')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Absolute paths are not allowed')
    })

    it('should reject paths with null bytes', () => {
      const result = validateFilePath('file\0.txt')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Null bytes in file paths are not allowed')
    })

    it('should accept valid relative paths', () => {
      const result = validateFilePath('data/file.txt')
      expect(result.valid).toBe(true)
    })
  })

  describe('sanitizeInput', () => {
    it('should remove HTML tags when not allowed', () => {
      const result = sanitizeInput('<script>alert(1)</script>', { allowHtml: false })
      expect(result).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')
    })

    it('should allow HTML when specified', () => {
      const result = sanitizeInput('<b>bold</b>', { allowHtml: true })
      expect(result).toBe('<b>bold</b>')
    })

    it('should trim whitespace by default', () => {
      const result = sanitizeInput('  text  ')
      expect(result).toBe('text')
    })

    it('should preserve whitespace when specified', () => {
      const result = sanitizeInput('  text  ', { trimWhitespace: false })
      expect(result).toBe('  text  ')
    })

    it('should enforce maximum length', () => {
      const result = sanitizeInput('a'.repeat(20000), { maxLength: 100 })
      expect(result.length).toBe(100)
    })

    it('should remove null bytes', () => {
      const result = sanitizeInput('text\0with\0nulls')
      expect(result).toBe('textwithnulls')
    })

    it('should remove control characters', () => {
      const result = sanitizeInput('text\x00\x01\x02with\x1Fcontrols')
      expect(result).toBe('textwithcontrols')
    })

    it('should preserve newlines and tabs', () => {
      const result = sanitizeInput('line1\nline2\ttab')
      expect(result).toBe('line1\nline2\ttab')
    })
  })

  describe('validateEnvVarName', () => {
    it('should validate standard environment variable names', () => {
      const result = validateEnvVarName('VITE_API_KEY')
      expect(result.valid).toBe(true)
    })

    it('should allow names starting with underscore', () => {
      const result = validateEnvVarName('_PRIVATE_KEY')
      expect(result.valid).toBe(true)
    })

    it('should reject names starting with numbers', () => {
      const result = validateEnvVarName('123_INVALID')
      expect(result.valid).toBe(false)
    })

    it('should reject names with special characters', () => {
      const result = validateEnvVarName('API-KEY')
      expect(result.valid).toBe(false)
    })

    it('should reject empty names', () => {
      const result = validateEnvVarName('')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Environment variable name cannot be empty')
    })
  })

  describe('SecurityRateLimiter', () => {
    let limiter: SecurityRateLimiter

    beforeEach(() => {
      limiter = new SecurityRateLimiter(3, 60000, 300000) // 3 attempts, 1min window, 5min block
    })

    afterEach(() => {
      limiter.destroy()
    })

    it('should allow requests within limit', () => {
      expect(limiter.checkLimit('user1').allowed).toBe(true)
      limiter.recordFailure('user1')
      expect(limiter.checkLimit('user1').allowed).toBe(true)
      limiter.recordFailure('user1')
      expect(limiter.checkLimit('user1').allowed).toBe(true)
    })

    it('should block after max attempts', () => {
      limiter.recordFailure('user1')
      limiter.recordFailure('user1')
      limiter.recordFailure('user1')
      const result = limiter.checkLimit('user1')
      expect(result.allowed).toBe(false)
      expect(result.retryAfter).toBeDefined()
    })

    it('should track remaining attempts', () => {
      let result = limiter.checkLimit('user1')
      expect(result.remaining).toBe(3)

      limiter.recordFailure('user1')
      result = limiter.checkLimit('user1')
      expect(result.remaining).toBe(2)

      limiter.recordFailure('user1')
      result = limiter.checkLimit('user1')
      expect(result.remaining).toBe(1)
    })

    it('should clear attempts', () => {
      limiter.recordFailure('user1')
      limiter.recordFailure('user1')
      limiter.clear('user1')
      const result = limiter.checkLimit('user1')
      expect(result.remaining).toBe(3)
    })

    it('should track different identifiers separately', () => {
      limiter.recordFailure('user1')
      limiter.recordFailure('user1')
      expect(limiter.checkLimit('user1').remaining).toBe(1)
      expect(limiter.checkLimit('user2').remaining).toBe(3)
    })
  })

  describe('SecurityAuditLogger', () => {
    let logger: SecurityAuditLogger

    beforeEach(() => {
      logger = new SecurityAuditLogger()
    })

    it('should log security events', () => {
      logger.log('test-event', { key: 'value' }, 'medium')
      const logs = logger.getLogs()
      expect(logs).toHaveLength(1)
      expect(logs[0].event).toBe('test-event')
      expect(logs[0].severity).toBe('medium')
      expect(logs[0].details).toEqual({ key: 'value' })
    })

    it('should filter logs by severity', () => {
      logger.log('low-event', {}, 'low')
      logger.log('high-event', {}, 'high')
      logger.log('critical-event', {}, 'critical')

      const highLogs = logger.getLogs('high')
      expect(highLogs).toHaveLength(1)
      expect(highLogs[0].event).toBe('high-event')

      const criticalLogs = logger.getLogs('critical')
      expect(criticalLogs).toHaveLength(1)
      expect(criticalLogs[0].event).toBe('critical-event')
    })

    it('should clear logs', () => {
      logger.log('event1', {}, 'low')
      logger.log('event2', {}, 'medium')
      logger.clear()
      expect(logger.getLogs()).toHaveLength(0)
    })

    it('should include timestamp', () => {
      const before = Date.now()
      logger.log('test', {}, 'low')
      const after = Date.now()
      const logs = logger.getLogs()
      expect(logs[0].timestamp).toBeGreaterThanOrEqual(before)
      expect(logs[0].timestamp).toBeLessThanOrEqual(after)
    })
  })
})
