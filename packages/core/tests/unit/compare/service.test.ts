import { describe, it, expect, beforeEach } from 'vitest'
import { CompareService, createCompareService } from '../../../src/services/compare'
import { ChangeType, type CompareOptions } from '../../../src/services/compare/types'
import { CompareValidationError, CompareCalculationError } from '../../../src/services/compare/errors'

describe('CompareService', () => {
  let service: CompareService

  beforeEach(() => {
    service = new CompareService()
  })

  describe('compareTexts', () => {
    describe('基本功能', () => {
      it('应该正确对比两个相同的文本', () => {
        const result = service.compareTexts('hello world', 'hello world')

        expect(result.fragments).toHaveLength(1)
        expect(result.fragments[0].type).toBe(ChangeType.UNCHANGED)
        expect(result.fragments[0].text).toBe('hello world')
        expect(result.summary.unchanged).toBe(1)
        expect(result.summary.additions).toBe(0)
        expect(result.summary.deletions).toBe(0)
      })

      it('应该正确检测添加的内容', () => {
        const result = service.compareTexts('hello', 'hello world')

        const addedFragments = result.fragments.filter(f => f.type === ChangeType.ADDED)
        expect(addedFragments.length).toBeGreaterThan(0)
        expect(result.summary.additions).toBeGreaterThan(0)
      })

      it('应该正确检测删除的内容', () => {
        const result = service.compareTexts('hello world', 'hello')

        const removedFragments = result.fragments.filter(f => f.type === ChangeType.REMOVED)
        expect(removedFragments.length).toBeGreaterThan(0)
        expect(result.summary.deletions).toBeGreaterThan(0)
      })

      it('应该正确处理完全不同的文本', () => {
        const result = service.compareTexts('abc', 'xyz')

        expect(result.summary.deletions).toBeGreaterThan(0)
        expect(result.summary.additions).toBeGreaterThan(0)
      })

      it('应该正确处理空字符串', () => {
        const result = service.compareTexts('', '')

        expect(result.fragments).toHaveLength(0)
        expect(result.summary.unchanged).toBe(0)
      })

      it('应该正确处理从空字符串添加内容', () => {
        const result = service.compareTexts('', 'hello')

        expect(result.fragments.every(f => f.type === ChangeType.ADDED)).toBe(true)
        expect(result.summary.additions).toBeGreaterThan(0)
      })

      it('应该正确处理删除所有内容', () => {
        const result = service.compareTexts('hello', '')

        expect(result.fragments.every(f => f.type === ChangeType.REMOVED)).toBe(true)
        expect(result.summary.deletions).toBeGreaterThan(0)
      })
    })

    describe('选项配置', () => {
      it('应该使用默认选项（word粒度）', () => {
        const result = service.compareTexts('hello world', 'hello beautiful world')

        expect(result.fragments.length).toBeGreaterThan(0)
      })

      it('应该支持字符级粒度对比', () => {
        const options: Partial<CompareOptions> = { granularity: 'char' }
        const result = service.compareTexts('abc', 'adc', options)

        expect(result.fragments.length).toBeGreaterThan(0)
      })

      it('应该支持忽略空白符', () => {
        const options: Partial<CompareOptions> = { ignoreWhitespace: true }
        const result = service.compareTexts('hello  world', 'hello world', options)

        expect(result.summary.unchanged).toBeGreaterThan(0)
      })

      it('应该支持忽略大小写', () => {
        const options: Partial<CompareOptions> = { caseSensitive: false }
        const result = service.compareTexts('Hello World', 'hello world', options)

        expect(result.summary.unchanged).toBeGreaterThan(0)
        expect(result.summary.additions).toBe(0)
        expect(result.summary.deletions).toBe(0)
      })

      it('应该区分大小写（默认行为）', () => {
        const result = service.compareTexts('Hello', 'hello')

        expect(result.summary.deletions + result.summary.additions).toBeGreaterThan(0)
      })
    })

    describe('输入验证', () => {
      it('应该在original参数非字符串时抛出验证错误', () => {
        expect(() => service.compareTexts(null as unknown as string, 'test')).toThrow(CompareValidationError)
      })

      it('应该在optimized参数非字符串时抛出验证错误', () => {
        expect(() => service.compareTexts('test', undefined as unknown as string)).toThrow(CompareValidationError)
      })

      it('应该在original参数为数字时抛出验证错误', () => {
        expect(() => service.compareTexts(123 as unknown as string, 'test')).toThrow(CompareValidationError)
      })

      it('应该在optimized参数为对象时抛出验证错误', () => {
        expect(() => service.compareTexts('test', {} as unknown as string)).toThrow(CompareValidationError)
      })
    })

    describe('片段合并', () => {
      it('应该合并连续的相同类型片段', () => {
        const result = service.compareTexts('abc def', 'abc xyz def')

        const types = result.fragments.map(f => f.type)
        let hasConsecutiveSame = false
        for (let i = 0; i < types.length - 1; i++) {
          if (types[i] === types[i + 1]) {
            hasConsecutiveSame = true
            break
          }
        }
        expect(hasConsecutiveSame).toBe(false)
      })
    })

    describe('统计信息', () => {
      it('应该正确统计添加数量', () => {
        const result = service.compareTexts('a', 'a b c')

        expect(result.summary.additions).toBeGreaterThan(0)
      })

      it('应该正确统计删除数量', () => {
        const result = service.compareTexts('a b c', 'a')

        expect(result.summary.deletions).toBeGreaterThan(0)
      })

      it('应该正确统计未改变数量', () => {
        const result = service.compareTexts('hello world', 'hello world')

        expect(result.summary.unchanged).toBe(1)
      })
    })

    describe('边界情况', () => {
      it('应该处理包含换行符的文本', () => {
        const result = service.compareTexts('line1\nline2', 'line1\nline2\nline3')

        expect(result.summary.additions).toBeGreaterThan(0)
      })

      it('应该处理包含特殊字符的文本', () => {
        const result = service.compareTexts('hello! @#$%', 'hello! @#$%^')

        expect(result.summary.additions).toBeGreaterThan(0)
      })

      it('应该处理超长文本', () => {
        const longText = 'a'.repeat(10000)
        const result = service.compareTexts(longText, longText + 'b')

        expect(result.summary.additions).toBeGreaterThan(0)
      })

      it('应该处理Unicode字符', () => {
        const result = service.compareTexts('你好世界', '你好世界！')

        expect(result.summary.additions).toBeGreaterThan(0)
      })

      it('应该处理Emoji字符', () => {
        const result = service.compareTexts('hello 👋', 'hello 👋 world 🌍')

        expect(result.summary.additions).toBeGreaterThan(0)
      })
    })
  })

  describe('createCompareService', () => {
    it('应该创建CompareService实例', () => {
      const service = createCompareService()
      expect(service).toBeInstanceOf(CompareService)
    })

    it('创建的服务应该能正常工作', () => {
      const service = createCompareService()
      const result = service.compareTexts('test', 'test')
      expect(result.summary.unchanged).toBe(1)
    })
  })

  describe('错误类型', () => {
    it('CompareValidationError应该包含正确的错误信息', () => {
      const error = new CompareValidationError('test message')
      expect(error.message).toContain('test message')
      expect(error.name).toBe('CompareError')
    })

    it('CompareCalculationError应该包含正确的错误信息', () => {
      const error = new CompareCalculationError('calculation failed')
      expect(error.message).toContain('calculation failed')
      expect(error.name).toBe('CompareError')
    })
  })
})
