import { describe, it, expect, beforeEach } from 'vitest'
import { CompareService, createCompareService } from '../../../../src/services/compare/service'
import { ChangeType, type CompareOptions } from '../../../../src/services/compare/types'
import { CompareValidationError, CompareCalculationError } from '../../../../src/services/compare/errors'

describe('CompareService', () => {
  let service: CompareService

  beforeEach(() => {
    service = new CompareService()
  })

  describe('compareTexts - basic functionality', () => {
    it('should return correct result for identical texts', () => {
      const text = 'Hello World'
      const result = service.compareTexts(text, text)

      expect(result.fragments).toHaveLength(1)
      expect(result.fragments[0].text).toBe(text)
      expect(result.fragments[0].type).toBe(ChangeType.UNCHANGED)
      expect(result.summary.unchanged).toBe(1)
      expect(result.summary.additions).toBe(0)
      expect(result.summary.deletions).toBe(0)
    })

    it('should detect additions', () => {
      const original = 'Hello'
      const optimized = 'Hello World'
      const result = service.compareTexts(original, optimized)

      expect(result.summary.additions).toBeGreaterThan(0)
      expect(result.fragments.some((f) => f.type === ChangeType.ADDED)).toBe(true)
    })

    it('should detect deletions', () => {
      const original = 'Hello World'
      const optimized = 'Hello'
      const result = service.compareTexts(original, optimized)

      expect(result.summary.deletions).toBeGreaterThan(0)
      expect(result.fragments.some((f) => f.type === ChangeType.REMOVED)).toBe(true)
    })

    it('should detect mixed changes', () => {
      const original = 'The quick brown fox'
      const optimized = 'The fast brown dog'
      const result = service.compareTexts(original, optimized)

      expect(result.summary.deletions).toBeGreaterThan(0)
      expect(result.summary.additions).toBeGreaterThan(0)
    })

    it('should handle empty strings', () => {
      const result = service.compareTexts('', '')

      expect(result.fragments).toHaveLength(0)
      expect(result.summary.unchanged).toBe(0)
    })

    it('should handle addition from empty string', () => {
      const result = service.compareTexts('', 'Hello')

      expect(result.summary.additions).toBeGreaterThan(0)
    })

    it('should handle deletion to empty string', () => {
      const result = service.compareTexts('Hello', '')

      expect(result.summary.deletions).toBeGreaterThan(0)
    })
  })

  describe('compareTexts - input validation', () => {
    it('should throw CompareValidationError for non-string original', () => {
      expect(() => service.compareTexts(123 as any, 'test')).toThrow(CompareValidationError)
    })

    it('should throw CompareValidationError for non-string optimized', () => {
      expect(() => service.compareTexts('test', null as any)).toThrow(CompareValidationError)
    })

    it('should throw CompareValidationError with correct message for invalid original', () => {
      expect(() => service.compareTexts(undefined as any, 'test')).toThrow(
        'Original text must be a string'
      )
    })

    it('should throw CompareValidationError with correct message for invalid optimized', () => {
      expect(() => service.compareTexts('test', {} as any)).toThrow(
        'Optimized text must be a string'
      )
    })
  })

  describe('compareTexts - granularity options', () => {
    it('should use word granularity by default', () => {
      const original = 'Hello World'
      const optimized = 'Hello Beautiful World'
      const result = service.compareTexts(original, optimized)

      expect(result.fragments.length).toBeGreaterThan(0)
    })

    it('should compare at character level with char granularity', () => {
      const original = 'abc'
      const optimized = 'axc'
      const result = service.compareTexts(original, optimized, { granularity: 'char' })

      expect(result.fragments.length).toBeGreaterThan(0)
    })

    it('should handle char granularity for longer texts', () => {
      const original = 'Hello World'
      const optimized = 'Hella World'
      const result = service.compareTexts(original, optimized, { granularity: 'char' })

      expect(result.summary.deletions).toBeGreaterThan(0)
      expect(result.summary.additions).toBeGreaterThan(0)
    })
  })

  describe('compareTexts - whitespace options', () => {
    it('should be sensitive to whitespace by default', () => {
      const original = 'Hello  World'
      const optimized = 'Hello World'
      const result = service.compareTexts(original, optimized, { granularity: 'char' })

      expect(result.summary.deletions + result.summary.additions).toBeGreaterThan(0)
    })

    it('should ignore whitespace differences when ignoreWhitespace is true', () => {
      const original = 'Hello    World'
      const optimized = 'Hello World'
      const result = service.compareTexts(original, optimized, { ignoreWhitespace: true })

      expect(result.summary.unchanged).toBeGreaterThan(0)
    })

    it('should handle tabs and newlines with ignoreWhitespace', () => {
      const original = 'Hello\t\nWorld'
      const optimized = 'Hello World'
      const result = service.compareTexts(original, optimized, { ignoreWhitespace: true })

      expect(result.summary.unchanged).toBeGreaterThan(0)
    })
  })

  describe('compareTexts - case sensitivity options', () => {
    it('should be case sensitive by default', () => {
      const original = 'Hello'
      const optimized = 'hello'
      const result = service.compareTexts(original, optimized)

      expect(result.summary.deletions + result.summary.additions).toBeGreaterThan(0)
    })

    it('should ignore case when caseSensitive is false', () => {
      const original = 'Hello World'
      const optimized = 'hello world'
      const result = service.compareTexts(original, optimized, { caseSensitive: false })

      expect(result.summary.unchanged).toBeGreaterThan(0)
    })

    it('should handle mixed case with caseSensitive false', () => {
      const original = 'HeLLo WoRLd'
      const optimized = 'HELLO WORLD'
      const result = service.compareTexts(original, optimized, { caseSensitive: false })

      expect(result.summary.unchanged).toBeGreaterThan(0)
    })
  })

  describe('compareTexts - combined options', () => {
    it('should apply multiple options together', () => {
      const original = 'Hello  World'
      const optimized = 'hello world'
      const result = service.compareTexts(original, optimized, {
        ignoreWhitespace: true,
        caseSensitive: false,
      })

      expect(result.summary.unchanged).toBeGreaterThan(0)
    })

    it('should handle all options together', () => {
      const original = 'The  Quick  Brown'
      const optimized = 'the quick fox'
      const result = service.compareTexts(original, optimized, {
        granularity: 'word',
        ignoreWhitespace: true,
        caseSensitive: false,
      })

      expect(result.fragments.length).toBeGreaterThan(0)
    })
  })

  describe('TextFragment structure', () => {
    it('should return fragments with correct structure', () => {
      const result = service.compareTexts('Hello', 'Hello World')

      result.fragments.forEach((fragment) => {
        expect(fragment).toHaveProperty('text')
        expect(fragment).toHaveProperty('type')
        expect(fragment).toHaveProperty('index')
        expect(typeof fragment.text).toBe('string')
        expect(Object.values(ChangeType)).toContain(fragment.type)
        expect(typeof fragment.index).toBe('number')
      })
    })

    it('should assign sequential indices to fragments', () => {
      const result = service.compareTexts('Hello World', 'Hello Beautiful World')

      const indices = result.fragments.map((f) => f.index)
      const expectedIndices = indices.map((_, i) => i)
      expect(indices).toEqual(expectedIndices)
    })

    it('should use ChangeType enum values', () => {
      const result = service.compareTexts('abc', 'xyz')

      const types = result.fragments.map((f) => f.type)
      types.forEach((type) => {
        expect([ChangeType.UNCHANGED, ChangeType.ADDED, ChangeType.REMOVED]).toContain(type)
      })
    })
  })

  describe('Summary generation', () => {
    it('should count additions correctly', () => {
      const result = service.compareTexts('', 'one two three')

      const addedFragments = result.fragments.filter((f) => f.type === ChangeType.ADDED)
      expect(result.summary.additions).toBe(addedFragments.length)
    })

    it('should count deletions correctly', () => {
      const result = service.compareTexts('one two three', '')

      const deletedFragments = result.fragments.filter((f) => f.type === ChangeType.REMOVED)
      expect(result.summary.deletions).toBe(deletedFragments.length)
    })

    it('should count unchanged correctly', () => {
      const result = service.compareTexts('Hello World', 'Hello World')

      const unchangedFragments = result.fragments.filter((f) => f.type === ChangeType.UNCHANGED)
      expect(result.summary.unchanged).toBe(unchangedFragments.length)
    })

    it('should count mixed types correctly', () => {
      const result = service.compareTexts('Hello beautiful world', 'Hello amazing world')

      const additions = result.fragments.filter((f) => f.type === ChangeType.ADDED).length
      const deletions = result.fragments.filter((f) => f.type === ChangeType.REMOVED).length
      const unchanged = result.fragments.filter((f) => f.type === ChangeType.UNCHANGED).length

      expect(result.summary.additions).toBe(additions)
      expect(result.summary.deletions).toBe(deletions)
      expect(result.summary.unchanged).toBe(unchanged)
    })
  })

  describe('Edge cases', () => {
    it('should handle special characters', () => {
      const original = 'Hello @#$%^& World'
      const optimized = 'Hello World'
      const result = service.compareTexts(original, optimized)

      expect(result.fragments.length).toBeGreaterThan(0)
    })

    it('should handle unicode characters', () => {
      const original = '你好世界'
      const optimized = '你好宇宙'
      const result = service.compareTexts(original, optimized)

      expect(result.fragments.length).toBeGreaterThan(0)
    })

    it('should handle emojis', () => {
      const original = 'Hello 🌍'
      const optimized = 'Hello 🌎'
      const result = service.compareTexts(original, optimized)

      expect(result.fragments.length).toBeGreaterThan(0)
    })

    it('should handle very long texts', () => {
      const original = 'word '.repeat(1000)
      const optimized = 'word '.repeat(1000) + 'extra'
      const result = service.compareTexts(original, optimized)

      expect(result.fragments.length).toBeGreaterThan(0)
      expect(result.summary.additions).toBeGreaterThan(0)
    })

    it('should handle newlines', () => {
      const original = 'Line 1\nLine 2'
      const optimized = 'Line 1\nLine 3'
      const result = service.compareTexts(original, optimized)

      expect(result.summary.deletions + result.summary.additions).toBeGreaterThan(0)
    })

    it('should handle only whitespace differences', () => {
      const original = 'Hello World'
      const optimized = 'Hello  World'
      const result = service.compareTexts(original, optimized, { granularity: 'char' })

      expect(result.fragments.length).toBeGreaterThan(0)
    })
  })

  describe('Fragment merging', () => {
    it('should merge consecutive same-type fragments', () => {
      const original = 'The quick brown fox jumps'
      const optimized = 'A slow lazy dog walks'
      const result = service.compareTexts(original, optimized)

      const types = result.fragments.map((f) => f.type)
      let hasConsecutiveSame = false
      for (let i = 1; i < types.length; i++) {
        if (types[i] === types[i - 1]) {
          hasConsecutiveSame = true
          break
        }
      }

      expect(hasConsecutiveSame).toBe(false)
    })
  })
})

describe('createCompareService', () => {
  it('should create a CompareService instance', () => {
    const service = createCompareService()
    expect(service).toBeInstanceOf(CompareService)
  })

  it('should return a working service', () => {
    const service = createCompareService()
    const result = service.compareTexts('Hello', 'Hello World')
    expect(result.summary.additions).toBeGreaterThan(0)
  })
})

describe('CompareError classes', () => {
  it('CompareValidationError should have correct properties', () => {
    const error = new CompareValidationError('Test error')

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('CompareError')
    expect(error.code).toBe('error.compare.validation')
    expect(error.message).toContain('Test error')
  })

  it('CompareCalculationError should have correct properties', () => {
    const error = new CompareCalculationError('Calculation failed')

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('CompareError')
    expect(error.code).toBe('error.compare.calculation')
    expect(error.message).toContain('Calculation failed')
  })
})
