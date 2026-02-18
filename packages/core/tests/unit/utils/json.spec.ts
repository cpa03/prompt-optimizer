/**
 * Tests for JSON utilities for LLM response parsing
 */
import { describe, it, expect } from 'vitest'
import {
  extractJsonFromMarkdown,
  parseLLMJson,
  parseLLMJsonOrThrow,
  isJsonObject,
  isJsonArray,
} from '../../../src/utils/json'

describe('extractJsonFromMarkdown', () => {
  it('should extract JSON from markdown code block with json language', () => {
    const content = '```json\n{"name": "test", "value": 123}\n```'
    const result = extractJsonFromMarkdown(content)
    expect(result.extracted).toBe(true)
    expect(result.jsonText).toBe('{"name": "test", "value": 123}')
  })

  it('should extract JSON from generic code block', () => {
    const content = '```\n{"name": "test"}\n```'
    const result = extractJsonFromMarkdown(content)
    expect(result.extracted).toBe(true)
    expect(result.jsonText).toBe('{"name": "test"}')
  })

  it('should extract JSON array from code block', () => {
    const content = '```\n[1, 2, 3]\n```'
    const result = extractJsonFromMarkdown(content)
    expect(result.extracted).toBe(true)
    expect(result.jsonText).toBe('[1, 2, 3]')
  })

  it('should not extract from code block without JSON', () => {
    const content = '```\nplain text\n```'
    const result = extractJsonFromMarkdown(content)
    expect(result.extracted).toBe(false)
    expect(result.jsonText).toBe(content)
  })

  it('should return original content when no markdown found', () => {
    const content = '{"name": "test"}'
    const result = extractJsonFromMarkdown(content)
    expect(result.extracted).toBe(false)
    expect(result.jsonText).toBe(content)
  })
})

describe('parseLLMJson', () => {
  describe('successful parsing', () => {
    it('should parse valid JSON directly', () => {
      const content = '{"name": "test"}'
      const result = parseLLMJson<{ name: string }>(content)
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ name: 'test' })
      expect(result.repaired).toBe(false)
      expect(result.extractedFromMarkdown).toBe(false)
    })

    it('should parse JSON from markdown code block', () => {
      const content = '```json\n{"name": "test"}\n```'
      const result = parseLLMJson<{ name: string }>(content)
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ name: 'test' })
      expect(result.repaired).toBe(false)
      expect(result.extractedFromMarkdown).toBe(true)
    })

    it('should repair and parse malformed JSON', () => {
      const content = '{name: "test", value: 123,}' // Missing quotes, trailing comma
      const result = parseLLMJson(content)
      expect(result.success).toBe(true)
      expect(result.repaired).toBe(true)
    })

    it('should parse JSON arrays', () => {
      const content = '[1, 2, 3]'
      const result = parseLLMJson<number[]>(content)
      expect(result.success).toBe(true)
      expect(result.data).toEqual([1, 2, 3])
    })
  })

  describe('failed parsing', () => {
    it('should return failure for invalid JSON when repair fails and repair is disabled', () => {
      const content = '{name: "test"}' // Missing quotes - invalid JSON
      const result = parseLLMJson(content, { useRepair: false })
      expect(result.success).toBe(false)
      expect(result.repaired).toBe(false)
    })

    it('should repair malformed JSON when useRepair is enabled', () => {
      const content = '{name: "test"}' // Missing quotes - invalid JSON
      const result = parseLLMJson(content, { useRepair: true })
      expect(result.success).toBe(true)
      expect(result.repaired).toBe(true)
    })

    it('should respect extractMarkdown option', () => {
      const content = '```json\n{"name": "test"}\n```'
      const result = parseLLMJson(content, { extractMarkdown: false })
      expect(result.extractedFromMarkdown).toBe(false)
    })
  })
})

describe('parseLLMJsonOrThrow', () => {
  it('should return parsed data on success', () => {
    const content = '{"name": "test"}'
    const data = parseLLMJsonOrThrow<{ name: string }>(content)
    expect(data).toEqual({ name: 'test' })
  })

  it('should throw on parse failure when repair is disabled', () => {
    const content = '{name: "test"}' // Missing quotes - invalid JSON
    expect(() => parseLLMJsonOrThrow(content, { useRepair: false })).toThrow()
  })

  it('should use custom fallback message in error', () => {
    const content = '{name: "test"}' // Missing quotes - invalid JSON
    expect(() =>
      parseLLMJsonOrThrow(content, { useRepair: false, fallbackMessage: 'Custom error' })
    ).toThrow(/Custom error/)
  })
})

describe('type guards', () => {
  describe('isJsonObject', () => {
    it('should return true for plain objects', () => {
      expect(isJsonObject({})).toBe(true)
      expect(isJsonObject({ a: 1 })).toBe(true)
    })

    it('should return false for arrays', () => {
      expect(isJsonObject([])).toBe(false)
      expect(isJsonObject([1, 2, 3])).toBe(false)
    })

    it('should return false for null', () => {
      expect(isJsonObject(null)).toBe(false)
    })

    it('should return false for primitives', () => {
      expect(isJsonObject('string')).toBe(false)
      expect(isJsonObject(123)).toBe(false)
      expect(isJsonObject(true)).toBe(false)
      expect(isJsonObject(undefined)).toBe(false)
    })
  })

  describe('isJsonArray', () => {
    it('should return true for arrays', () => {
      expect(isJsonArray([])).toBe(true)
      expect(isJsonArray([1, 2, 3])).toBe(true)
    })

    it('should return false for objects', () => {
      expect(isJsonArray({})).toBe(false)
      expect(isJsonArray({ a: 1 })).toBe(false)
    })

    it('should return false for null', () => {
      expect(isJsonArray(null)).toBe(false)
    })

    it('should return false for primitives', () => {
      expect(isJsonArray('string')).toBe(false)
      expect(isJsonArray(123)).toBe(false)
    })
  })
})
