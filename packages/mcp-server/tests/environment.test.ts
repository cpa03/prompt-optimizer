/**
 * MCP Server Environment Configuration Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { loadConfig, validateConfig, type MCPServerConfig } from '../src/config/environment.js'

describe('MCP Environment Configuration', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('loadConfig', () => {
    it('should load default configuration', () => {
      delete process.env.MCP_HTTP_PORT
      delete process.env.MCP_LOG_LEVEL
      delete process.env.MCP_DEFAULT_LANGUAGE
      delete process.env.MCP_DEFAULT_MODEL_PROVIDER
      delete process.env.MCP_ALLOWED_ORIGINS

      const config = loadConfig()

      expect(config.httpPort).toBeTypeOf('number')
      expect(config.logLevel).toBeTypeOf('string')
      expect(['debug', 'info', 'warn', 'error']).toContain(config.logLevel)
      expect(config.defaultLanguage).toBeTypeOf('string')
      expect(config.allowedOrigins).toBeInstanceOf(Array)
    })

    it('should load custom port from environment', () => {
      process.env.MCP_HTTP_PORT = '9000'
      const config = loadConfig()
      expect(config.httpPort).toBe(9000)
    })

    it('should load custom log level from environment', () => {
      process.env.MCP_LOG_LEVEL = 'debug'
      const config = loadConfig()
      expect(config.logLevel).toBe('debug')
    })

    it('should parse allowed origins from comma-separated string', () => {
      process.env.MCP_ALLOWED_ORIGINS = 'http://localhost:3000,http://example.com'
      const config = loadConfig()
      expect(config.allowedOrigins).toEqual(['http://localhost:3000', 'http://example.com'])
    })

    it('should use wildcard when no allowed origins specified', () => {
      delete process.env.MCP_ALLOWED_ORIGINS
      const config = loadConfig()
      expect(config.allowedOrigins).toEqual(['*'])
    })

    it('should load DNS rebinding protection setting', () => {
      process.env.MCP_DNS_REBINDING_PROTECTION = 'true'
      const config = loadConfig()
      expect(config.enableDnsRebindingProtection).toBe(true)
    })
  })

  describe('validateConfig', () => {
    it('should pass for valid configuration', () => {
      const validConfig: MCPServerConfig = {
        httpPort: 8081,
        logLevel: 'info',
        defaultLanguage: 'zh',
        allowedOrigins: ['*'],
        enableDnsRebindingProtection: false,
      }

      expect(() => validateConfig(validConfig)).not.toThrow()
    })

    it('should throw for invalid port (too low)', () => {
      const invalidConfig: MCPServerConfig = {
        httpPort: 0,
        logLevel: 'info',
        defaultLanguage: 'zh',
        allowedOrigins: ['*'],
        enableDnsRebindingProtection: false,
      }

      expect(() => validateConfig(invalidConfig)).toThrow()
    })

    it('should throw for invalid port (too high)', () => {
      const invalidConfig: MCPServerConfig = {
        httpPort: 70000,
        logLevel: 'info',
        defaultLanguage: 'zh',
        allowedOrigins: ['*'],
        enableDnsRebindingProtection: false,
      }

      expect(() => validateConfig(invalidConfig)).toThrow()
    })

    it('should throw for invalid log level', () => {
      const invalidConfig: MCPServerConfig = {
        httpPort: 8081,
        logLevel: 'invalid' as 'debug' | 'info' | 'warn' | 'error',
        defaultLanguage: 'zh',
        allowedOrigins: ['*'],
        enableDnsRebindingProtection: false,
      }

      expect(() => validateConfig(invalidConfig)).toThrow()
    })
  })

  describe('loadConfig validation integration', () => {
    it('should call validateConfig automatically and throw for invalid config', () => {
      process.env.MCP_HTTP_PORT = '0'
      expect(() => loadConfig()).toThrow()
    })

    it('should call validateConfig automatically and pass for valid config', () => {
      process.env.MCP_HTTP_PORT = '8081'
      process.env.MCP_LOG_LEVEL = 'info'
      expect(() => loadConfig()).not.toThrow()
    })
  })
})
