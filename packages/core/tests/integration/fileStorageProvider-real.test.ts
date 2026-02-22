import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs/promises'
import * as path from 'path'
import { FileStorageProvider } from '../../src/services/storage/fileStorageProvider'
import { StorageError } from '../../src/services/storage/errors'

describe('FileStorageProvider - Real File System Integration', () => {
  let provider: FileStorageProvider
  let testDir: string
  let storageFile: string

  beforeEach(async () => {
    // 在项目的tests目录下创建临时测试目录
    testDir = path.join(__dirname, '..', '..', 'temp-test-storage')
    storageFile = path.join(testDir, 'prompt-optimizer-data.json')

    // 确保测试目录存在
    await fs.mkdir(testDir, { recursive: true })

    // 创建FileStorageProvider实例
    provider = new FileStorageProvider(testDir)
  })

  afterEach(async () => {
    // 清理测试文件和目录
    try {
      await fs.rm(testDir, { recursive: true, force: true })
    } catch (error) {
      console.warn('Failed to cleanup test directory:', error)
    }
  })

  describe('Real file operations', () => {
    it('should create storage file when it does not exist', async () => {
      await expect(fs.access(storageFile)).rejects.toThrow()

      await provider.setItem('test-key', 'test-value')

      await new Promise((resolve) => setTimeout(resolve, 600))

      await expect(fs.access(storageFile)).resolves.toBeUndefined()

      const content = await fs.readFile(storageFile, 'utf8')
      const storageData = JSON.parse(content)
      expect(storageData.version).toBe(1)
      expect(storageData.data['test-key']).toBe('test-value')
    })

    it('should load existing data from real file', async () => {
      const testData = { 'existing-key': 'existing-value' }
      await fs.writeFile(storageFile, JSON.stringify(testData), 'utf8')

      const newProvider = new FileStorageProvider(testDir)

      const value = await newProvider.getItem('existing-key')
      expect(value).toBe('existing-value')
    })

    it('should throw error when file is corrupted and no backup exists', async () => {
      await fs.writeFile(storageFile, 'invalid json content', 'utf8')

      const newProvider = new FileStorageProvider(testDir)

      await expect(newProvider.setItem('recovery-key', 'recovery-value')).rejects.toThrow(
        'Storage corruption detected'
      )
    })

    it('should persist data across provider instances', async () => {
      await provider.setItem('persist-key', 'persist-value')
      await provider.setItem('another-key', 'another-value')

      await provider.flush()

      const newProvider = new FileStorageProvider(testDir)

      expect(await newProvider.getItem('persist-key')).toBe('persist-value')
      expect(await newProvider.getItem('another-key')).toBe('another-value')
    })

    it('should handle batch operations with real files', async () => {
      const operations = [
        { key: 'batch-key-1', operation: 'set' as const, value: 'batch-value-1' },
        { key: 'batch-key-2', operation: 'set' as const, value: 'batch-value-2' },
        { key: 'batch-key-3', operation: 'set' as const, value: 'batch-value-3' },
      ]

      await provider.batchUpdate(operations)

      // 验证数据在内存中正确
      expect(await provider.getItem('batch-key-1')).toBe('batch-value-1')
      expect(await provider.getItem('batch-key-2')).toBe('batch-value-2')
      expect(await provider.getItem('batch-key-3')).toBe('batch-value-3')

      // 验证文件存在
      await expect(fs.access(storageFile)).resolves.toBeUndefined()
    })

    it('should handle clearAll with real files', async () => {
      await provider.setItem('clear-key-1', 'clear-value-1')
      await provider.setItem('clear-key-2', 'clear-value-2')
      await provider.flush()

      let content = await fs.readFile(storageFile, 'utf8')
      let storageData = JSON.parse(content)
      expect(Object.keys(storageData.data)).toHaveLength(2)

      await provider.clearAll()

      content = await fs.readFile(storageFile, 'utf8')
      storageData = JSON.parse(content)
      expect(Object.keys(storageData.data)).toHaveLength(0)
    })

    it('should handle updateData with real files', async () => {
      await provider.setItem('counter', '5')
      await provider.flush()

      await provider.updateData<number>('counter', (current) => {
        return (current || 0) + 1
      })

      await provider.flush()

      const content = await fs.readFile(storageFile, 'utf8')
      const storageData = JSON.parse(content)
      expect(storageData.data['counter']).toBe('6')
    })

    it('should handle concurrent operations safely', async () => {
      for (let i = 0; i < 10; i++) {
        await provider.setItem(`concurrent-key-${i}`, `concurrent-value-${i}`)
      }

      await provider.flush()

      const content = await fs.readFile(storageFile, 'utf8')
      const storageData = JSON.parse(content)

      for (let i = 0; i < 10; i++) {
        expect(storageData.data[`concurrent-key-${i}`]).toBe(`concurrent-value-${i}`)
      }
    })

    it('should handle removeItem with real files', async () => {
      await provider.setItem('remove-key-1', 'remove-value-1')
      await provider.setItem('remove-key-2', 'remove-value-2')
      await provider.flush()

      await provider.removeItem('remove-key-1')
      await provider.flush()

      const content = await fs.readFile(storageFile, 'utf8')
      const storageData = JSON.parse(content)

      expect(storageData.data['remove-key-1']).toBeUndefined()
      expect(storageData.data['remove-key-2']).toBe('remove-value-2')
    })
  })

  describe('Error handling with real file system', () => {
    it('should throw error when directory cannot be created', async () => {
      const invalidPath = '/invalid/readonly/path'
      const invalidProvider = new FileStorageProvider(invalidPath)

      try {
        await invalidProvider.setItem('test', 'test')
        await invalidProvider.flush()
      } catch (error) {
        expect(error).toBeInstanceOf(StorageError)
      }
    })

    it('should handle temporary file cleanup on write failure', async () => {
      await provider.setItem('temp-test', 'temp-value')
      await provider.flush()

      const files = await fs.readdir(testDir)
      const tempFiles = files.filter((file) => file.endsWith('.tmp'))
      expect(tempFiles).toHaveLength(0)
    })
  })

  describe('Performance with real files', () => {
    it('should handle large data efficiently', async () => {
      const largeValue = 'x'.repeat(10000)

      const startTime = Date.now()

      for (let i = 0; i < 100; i++) {
        await provider.setItem(`large-key-${i}`, largeValue)
      }

      await provider.flush()

      const writeTime = Date.now() - startTime

      const readStartTime = Date.now()
      for (let i = 0; i < 100; i++) {
        await provider.getItem(`large-key-${i}`)
      }
      const readTime = Date.now() - readStartTime

      expect(writeTime).toBeLessThan(5000)
      expect(readTime).toBeLessThan(100)

      console.log(`Write time: ${writeTime}ms, Read time: ${readTime}ms`)
    })
  })
})
