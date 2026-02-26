import { describe, it, expect } from 'vitest'
import { extractVariables, extractVariablesSchema } from '../../../src/services/template/variable-extraction'

describe('Variable Extraction Service', () => {
  describe('extractVariables', () => {
    it('should extract variables from English prompts with recipient context', () => {
      const result = extractVariables('Write an email to john about the meeting', 'en')
      expect(result.count).toBeGreaterThan(0)
      const names = result.variables.map(v => v.name)
      expect(names.some(n => n === 'john')).toBe(true)
    })

    it('should extract variables from English prompts with topic context', () => {
      const result = extractVariables('Create a story about dragons and magic', 'en')
      expect(result.count).toBeGreaterThan(0)
    })

    it('should extract variables from English prompts with tool context', () => {
      const result = extractVariables('Generate code using python and flask', 'en')
      expect(result.count).toBeGreaterThan(0)
    })

    it('should extract variables from English prompts with name identifier', () => {
      const result = extractVariables('Create a function called calculateTotal', 'en')
      expect(result.count).toBeGreaterThan(0)
      const names = result.variables.map(v => v.name)
      expect(names.some(n => n === 'calculatetotal')).toBe(true)
    })

    it('should return empty array for prompts without extractable variables', () => {
      const result = extractVariables('Hello world', 'en')
      expect(result.count).toBe(0)
    })

    it('should limit results to maximum 10 variables', () => {
      const longPrompt = 'Write to alice about topic1 using method1 called name1 for target1 with data1 about subject1 via tool1 in format1'
      const result = extractVariables(longPrompt, 'en')
      expect(result.count).toBeLessThanOrEqual(10)
    })

    it('should sort variables by confidence', () => {
      const result = extractVariables('Write an email to john about the project using python', 'en')
      if (result.count > 1) {
        expect(result.variables[0].confidence).toBeGreaterThanOrEqual(result.variables[1].confidence)
      }
    })

    it('should include context information in results', () => {
      const result = extractVariables('Write to john', 'en')
      if (result.count > 0) {
        expect(result.variables[0]).toHaveProperty('context')
        expect(result.variables[0]).toHaveProperty('pattern')
      }
    })

    it('should filter out common words', () => {
      const result = extractVariables('Write the and create the in for to', 'en')
      const names = result.variables.map(v => v.name)
      expect(names).not.toContain('the')
      expect(names).not.toContain('and')
      expect(names).not.toContain('for')
    })

    it('should filter out short variable names', () => {
      const result = extractVariables('Write a b c', 'en')
      const names = result.variables.map(v => v.name)
      expect(names).not.toContain('b')
      expect(names).not.toContain('c')
    })

    it('should filter out duplicate variables', () => {
      const result = extractVariables('Write to john about john and for john', 'en')
      const johnCount = result.variables.filter(v => v.name === 'john').length
      expect(johnCount).toBe(1)
    })

    it('should work with empty prompt', () => {
      const result = extractVariables('', 'en')
      expect(result.count).toBe(0)
    })

    it('should work with very long prompts', () => {
      const longPrompt = Array(100).fill('write to recipient about topic').join(' ')
      const result = extractVariables(longPrompt, 'en')
      expect(result.count).toBeGreaterThan(0)
    })

    it('should return correct count', () => {
      const result = extractVariables('Write to alice and bob about topic', 'en')
      expect(result.count).toBe(result.variables.length)
    })
  })

  describe('extractVariablesSchema', () => {
    it('should validate valid requests', () => {
      const validRequest = { prompt: 'Write to john', language: 'en' as const }
      const result = extractVariablesSchema.safeParse(validRequest)
      expect(result.success).toBe(true)
    })

    it('should reject empty prompts', () => {
      const invalidRequest = { prompt: '' }
      const result = extractVariablesSchema.safeParse(invalidRequest)
      expect(result.success).toBe(false)
    })

    it('should reject prompts that are too long', () => {
      const invalidRequest = { prompt: 'a'.repeat(10001) }
      const result = extractVariablesSchema.safeParse(invalidRequest)
      expect(result.success).toBe(false)
    })

    it('should accept valid language options', () => {
      const enRequest = { prompt: 'test', language: 'en' as const }
      const zhRequest = { prompt: 'test', language: 'zh' as const }
      expect(extractVariablesSchema.safeParse(enRequest).success).toBe(true)
      expect(extractVariablesSchema.safeParse(zhRequest).success).toBe(true)
    })

    it('should default to English when language not specified', () => {
      const request = { prompt: 'test' }
      const result = extractVariablesSchema.safeParse(request)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.language).toBe('en')
      }
    })
  })
})
