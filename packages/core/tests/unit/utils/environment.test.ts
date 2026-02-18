/**
 * Unit tests for environment utility functions
 *
 * Tests cover:
 * - validateCustomModelConfig validation logic
 * - Edge cases for suffix, apiKey, baseURL, and model validation
 */

import { describe, it, expect } from 'vitest'
import {
  validateCustomModelConfig,
  type CustomModelEnvConfig,
} from '../../../src/utils/environment'

describe('environment utilities', () => {
  describe('validateCustomModelConfig', () => {
    describe('suffix validation', () => {
      it('should return error for missing suffix', () => {
        const config: CustomModelEnvConfig = {
          suffix: '',
          apiKey: 'test-api-key',
          baseURL: 'https://api.example.com',
          model: 'gpt-4',
        }
        const result = validateCustomModelConfig(config)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('Suffix is required')
      })

      it('should return error for suffix with invalid characters', () => {
        const config: CustomModelEnvConfig = {
          suffix: 'invalid@suffix!',
          apiKey: 'test-api-key',
          baseURL: 'https://api.example.com',
          model: 'gpt-4',
        }
        const result = validateCustomModelConfig(config)
        expect(result.valid).toBe(false)
        expect(result.errors.some((e) => e.includes('Invalid suffix'))).toBe(true)
      })

      it('should accept valid suffixes with alphanumeric, underscore, and hyphen', () => {
        const validSuffixes = ['claude_local', 'gpt-4', 'test123', 'a', 'MODEL_V2']
        validSuffixes.forEach((suffix) => {
          const config: CustomModelEnvConfig = {
            suffix,
            apiKey: 'test-api-key',
            baseURL: 'https://api.example.com',
            model: 'gpt-4',
          }
          const result = validateCustomModelConfig(config)
          expect(result.valid).toBe(true)
        })
      })
    })

    describe('apiKey validation', () => {
      it('should return error for missing apiKey', () => {
        const config: CustomModelEnvConfig = {
          suffix: 'test',
          apiKey: undefined,
          baseURL: 'https://api.example.com',
          model: 'gpt-4',
        }
        const result = validateCustomModelConfig(config)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('API key is required')
      })

      it('should return warning for short apiKey', () => {
        const config: CustomModelEnvConfig = {
          suffix: 'test',
          apiKey: 'short',
          baseURL: 'https://api.example.com',
          model: 'gpt-4',
        }
        const result = validateCustomModelConfig(config)
        expect(result.valid).toBe(true)
        expect(result.warnings.some((w) => w.includes('too short'))).toBe(true)
      })

      it('should accept valid apiKey', () => {
        const config: CustomModelEnvConfig = {
          suffix: 'test',
          apiKey: 'sk-valid-api-key-12345',
          baseURL: 'https://api.example.com',
          model: 'gpt-4',
        }
        const result = validateCustomModelConfig(config)
        expect(result.valid).toBe(true)
        expect(result.warnings.length).toBe(0)
      })
    })

    describe('baseURL validation', () => {
      it('should return error for missing baseURL', () => {
        const config: CustomModelEnvConfig = {
          suffix: 'test',
          apiKey: 'test-api-key',
          baseURL: undefined,
          model: 'gpt-4',
        }
        const result = validateCustomModelConfig(config)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('Base URL is required')
      })

      it('should return error for invalid baseURL format', () => {
        const config: CustomModelEnvConfig = {
          suffix: 'test',
          apiKey: 'test-api-key',
          baseURL: 'not-a-valid-url',
          model: 'gpt-4',
        }
        const result = validateCustomModelConfig(config)
        expect(result.valid).toBe(false)
        expect(result.errors.some((e) => e.includes('Invalid baseURL format'))).toBe(true)
      })

      it('should return warning for unusual protocol', () => {
        const config: CustomModelEnvConfig = {
          suffix: 'test',
          apiKey: 'test-api-key',
          baseURL: 'ftp://api.example.com',
          model: 'gpt-4',
        }
        const result = validateCustomModelConfig(config)
        expect(result.valid).toBe(true)
        expect(result.warnings.some((w) => w.includes('Unusual protocol'))).toBe(true)
      })

      it('should accept valid http and https URLs', () => {
        const validUrls = [
          'https://api.openai.com/v1',
          'http://localhost:8080',
          'https://api.example.com',
        ]
        validUrls.forEach((baseURL) => {
          const config: CustomModelEnvConfig = {
            suffix: 'test',
            apiKey: 'test-api-key',
            baseURL,
            model: 'gpt-4',
          }
          const result = validateCustomModelConfig(config)
          expect(result.valid).toBe(true)
        })
      })
    })

    describe('model validation', () => {
      it('should return error for missing model', () => {
        const config: CustomModelEnvConfig = {
          suffix: 'test',
          apiKey: 'test-api-key',
          baseURL: 'https://api.example.com',
          model: undefined,
        }
        const result = validateCustomModelConfig(config)
        expect(result.valid).toBe(false)
        expect(result.errors).toContain('Model name is required')
      })

      it('should accept valid model name', () => {
        const config: CustomModelEnvConfig = {
          suffix: 'test',
          apiKey: 'test-api-key',
          baseURL: 'https://api.example.com',
          model: 'gpt-4-turbo',
        }
        const result = validateCustomModelConfig(config)
        expect(result.valid).toBe(true)
      })
    })

    describe('complete config validation', () => {
      it('should validate a complete valid config', () => {
        const config: CustomModelEnvConfig = {
          suffix: 'claude_local',
          apiKey: 'sk-ant-api-key-12345',
          baseURL: 'https://api.anthropic.com',
          model: 'claude-3-opus',
        }
        const result = validateCustomModelConfig(config)
        expect(result.valid).toBe(true)
        expect(result.errors.length).toBe(0)
        expect(result.warnings.length).toBe(0)
      })

      it('should accumulate multiple errors', () => {
        const config: CustomModelEnvConfig = {
          suffix: '',
          apiKey: undefined,
          baseURL: undefined,
          model: undefined,
        }
        const result = validateCustomModelConfig(config)
        expect(result.valid).toBe(false)
        expect(result.errors.length).toBe(4)
        expect(result.errors).toContain('Suffix is required')
        expect(result.errors).toContain('API key is required')
        expect(result.errors).toContain('Base URL is required')
        expect(result.errors).toContain('Model name is required')
      })
    })
  })
})
