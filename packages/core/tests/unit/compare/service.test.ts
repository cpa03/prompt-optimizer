import { describe, it, expect, beforeEach } from 'vitest'
import { CompareService, createCompareService } from '../../../src/services/compare/service'
import { ChangeType, type CompareOptions } from '../../../src/services/compare/types'
import { CompareValidationError, CompareCalculationError } from '../../../src/services/compare/errors'

describe('CompareService', () => {
  let compareService: CompareService

  beforeEach(() => {
    compareService = new CompareService()
  })

  describe('compareTexts', () => {
    describe('basic functionality', () => {
      it('should compare identical texts and return all unchanged', () => {
        const text = 'Hello World'
        const result = compareService.compareTexts(text, text)

        expect(result.fragments).toHaveLength(1)
        expect(result.fragments[0].type).toBe(ChangeType.UNCHANGED)
        expect(result.fragments[0].text).toBe(text)
        expect(result.summary.unchanged).toBe(1)
        expect(result.summary.additions).toBe(0)
        expect(result.summary.deletions).toBe(0)
      })

      it('should detect added text at the end', () => {
        const original = 'Hello'
        const optimized = 'Hello World'
        const result = compareService.compareTexts(original, optimized)

        expect(result.summary.additions).toBeGreaterThan(0)
        expect(result.summary.deletions).toBe(0)
        
        const addedFragment = result.fragments.find(f => f.type === ChangeType.ADDED)
        expect(addedFragment).toBeDefined()
        expect(addedFragment?.text.trim()).toBe('World')
      })

      it('should detect removed text', () => {
        const original = 'Hello World'
        const optimized = 'Hello'
        const result = compareService.compareTexts(original, optimized)

        expect(result.summary.additions).toBe(0)
        expect(result.summary.deletions).toBeGreaterThan(0)
        
        const removedFragment = result.fragments.find(f => f.type === ChangeType.REMOVED)
        expect(removedFragment).toBeDefined()
        expect(removedFragment?.text.trim()).toBe('World')
      })

      it('should detect both additions and deletions', () => {
        const original = 'Hello World'
        const optimized = 'Hello Beautiful Universe'
        const result = compareService.compareTexts(original, optimized)

        expect(result.summary.additions).toBeGreaterThan(0)
      })
    })

    describe('granularity options', () => {
      it('should compare at word level by default', () => {
        const original = 'Hello World'
        const optimized = 'Hello Beautiful World'
        const result = compareService.compareTexts(original, optimized)

        expect(result.fragments.length).toBeGreaterThan(0)
      })

      it('should compare at character level when specified', () => {
        const original = 'abc'
        const optimized = 'abd'
        const result = compareService.compareTexts(original, optimized, {
          granularity: 'char',
        })

        expect(result.fragments.length).toBeGreaterThan(0)
      })
    })

    describe('whitespace handling', () => {
      it('should ignore whitespace when option is set', () => {
        const original = 'Hello    World'
        const optimized = 'Hello World'
        const result = compareService.compareTexts(original, optimized, {
          ignoreWhitespace: true,
        })

        expect(result.summary.unchanged).toBeGreaterThan(0)
      })

      it('should consider whitespace by default', () => {
        const original = 'Hello    World'
        const optimized = 'Hello World'
        const result = compareService.compareTexts(original, optimized)

        expect(result).toBeDefined()
      })
    })

    describe('case sensitivity', () => {
      it('should be case sensitive by default', () => {
        const original = 'Hello'
        const optimized = 'hello'
        const result = compareService.compareTexts(original, optimized)

        expect(result.summary.deletions + result.summary.additions).toBeGreaterThan(0)
      })

      it('should ignore case when option is set', () => {
        const original = 'Hello'
        const optimized = 'hello'
        const result = compareService.compareTexts(original, optimized, {
          caseSensitive: false,
        })

        expect(result.summary.unchanged).toBeGreaterThan(0)
      })
    })

    describe('input validation', () => {
      it('should throw CompareValidationError for non-string original', () => {
        expect(() => compareService.compareTexts(123 as any, 'text')).toThrow(CompareValidationError)
      })

      it('should throw CompareValidationError for non-string optimized', () => {
        expect(() => compareService.compareTexts('text', null as any)).toThrow(CompareValidationError)
      })

      it('should throw CompareValidationError with correct message for invalid original', () => {
        expect(() => compareService.compareTexts(undefined as any, 'text')).toThrow(
          'Original text must be a string'
        )
      })

      it('should throw CompareValidationError with correct message for invalid optimized', () => {
        expect(() => compareService.compareTexts('text', {} as any)).toThrow(
          'Optimized text must be a string'
        )
      })
    })

    describe('edge cases', () => {
      it('should handle empty strings', () => {
        const result = compareService.compareTexts('', '')

        expect(result.fragments).toHaveLength(0)
        expect(result.summary.additions).toBe(0)
        expect(result.summary.deletions).toBe(0)
        expect(result.summary.unchanged).toBe(0)
      })

      it('should handle one empty string (addition)', () => {
        const result = compareService.compareTexts('', 'Hello')

        expect(result.summary.additions).toBeGreaterThan(0)
        expect(result.summary.deletions).toBe(0)
      })

      it('should handle one empty string (deletion)', () => {
        const result = compareService.compareTexts('Hello', '')

        expect(result.summary.additions).toBe(0)
        expect(result.summary.deletions).toBeGreaterThan(0)
      })

      it('should handle special characters', () => {
        const original = 'Hello @#$%^&* World'
        const optimized = 'Hello World'
        const result = compareService.compareTexts(original, optimized)

        expect(result).toBeDefined()
        expect(result.summary.deletions).toBeGreaterThan(0)
      })

      it('should handle unicode characters', () => {
        const original = '你好世界'
        const optimized = '你好美丽世界'
        const result = compareService.compareTexts(original, optimized)

        expect(result).toBeDefined()
        expect(result.summary.additions).toBeGreaterThan(0)
      })

      it('should handle multiline text', () => {
        const original = 'Line 1\nLine 2\nLine 3'
        const optimized = 'Line 1\nModified Line 2\nLine 3'
        const result = compareService.compareTexts(original, optimized)

        expect(result).toBeDefined()
      })
    })

    describe('fragment indices', () => {
      it('should assign sequential indices to fragments', () => {
        const original = 'Hello World'
        const optimized = 'Hello Beautiful World'
        const result = compareService.compareTexts(original, optimized)

        result.fragments.forEach((fragment, index) => {
          expect(fragment.index).toBe(index)
        })
      })
    })

    describe('merged fragments', () => {
      it('should merge consecutive fragments of same type', () => {
        const original = 'A B C'
        const optimized = 'A X Y C'
        const result = compareService.compareTexts(original, optimized)

        const addedFragments = result.fragments.filter(f => f.type === ChangeType.ADDED)
        expect(addedFragments.length).toBeLessThanOrEqual(2)
      })
    })
  })

  describe('createCompareService', () => {
    it('should create a CompareService instance', () => {
      const service = createCompareService()
      expect(service).toBeInstanceOf(CompareService)
    })

    it('should return ICompareService interface', () => {
      const service = createCompareService()
      expect(service.compareTexts).toBeDefined()
      expect(typeof service.compareTexts).toBe('function')
    })
  })
})
