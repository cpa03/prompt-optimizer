import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { isRef } from 'vue'
import { useSessionRestoreCoordinator } from '../../../src/composables/session/useSessionRestoreCoordinator'

describe('useSessionRestoreCoordinator', () => {
  let restoreFn: ReturnType<typeof vi.fn>

  beforeEach(() => {
    restoreFn = vi.fn()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('应该正确初始化所有状态', () => {
    const coordinator = useSessionRestoreCoordinator(restoreFn)

    expect(coordinator.isRestoring).toBeDefined()
    expect(coordinator.pendingRestore).toBeDefined()
    expect(coordinator.isUnmounted).toBeDefined()
    expect(coordinator.executeRestore).toBeDefined()
    expect(coordinator.markUnmounted).toBeDefined()

    expect(isRef(coordinator.isRestoring)).toBe(true)
    expect(isRef(coordinator.pendingRestore)).toBe(true)
    expect(isRef(coordinator.isUnmounted)).toBe(true)

    expect(coordinator.isRestoring.value).toBe(false)
    expect(coordinator.pendingRestore.value).toBe(false)
    expect(coordinator.isUnmounted.value).toBe(false)
  })

  it('应该执行恢复函数', async () => {
    const coordinator = useSessionRestoreCoordinator(restoreFn)

    await coordinator.executeRestore()

    expect(restoreFn).toHaveBeenCalledTimes(1)
    expect(coordinator.isRestoring.value).toBe(false)
  })

  it('应该防止并发执行（互斥锁）', async () => {
    let resolveFirst: (value: void) => void
    const blockingPromise = new Promise<void>((resolve) => {
      resolveFirst = resolve
    })
    restoreFn.mockReturnValueOnce(blockingPromise)

    const coordinator = useSessionRestoreCoordinator(restoreFn)

    // 第一次调用开始执行
    const promise1 = coordinator.executeRestore()
    expect(coordinator.isRestoring.value).toBe(true)

    // 第二次调用应该设置 pendingRestore 标志并立即返回
    const promise2 = coordinator.executeRestore()
    expect(coordinator.pendingRestore.value).toBe(true)

    // 等待第一个执行完成
    resolveFirst!()
    await promise1
    await promise2

    // 第一次调用完成了一次 restoreFn
    // pendingRestore 触发了第二次恢复，所以总共 2 次
    expect(restoreFn).toHaveBeenCalledTimes(2)
  })

  it('应该在恢复函数返回后重置状态', async () => {
    const coordinator = useSessionRestoreCoordinator(restoreFn)

    await coordinator.executeRestore()

    expect(coordinator.isRestoring.value).toBe(false)
  })

  it('应该在恢复失败时捕获错误', async () => {
    restoreFn.mockRejectedValue(new Error('恢复失败'))

    const coordinator = useSessionRestoreCoordinator(restoreFn)

    await expect(coordinator.executeRestore()).resolves.not.toThrow()
    expect(coordinator.isRestoring.value).toBe(false)
  })

  it('应该在恢复函数抛出同步错误时捕获', async () => {
    restoreFn.mockImplementation(() => {
      throw new Error('同步错误')
    })

    const coordinator = useSessionRestoreCoordinator(restoreFn)

    await expect(coordinator.executeRestore()).resolves.not.toThrow()
    expect(coordinator.isRestoring.value).toBe(false)
  })

  it('应该在调用 markUnmounted 后设置卸载标志', () => {
    const coordinator = useSessionRestoreCoordinator(restoreFn)

    coordinator.markUnmounted()

    expect(coordinator.isUnmounted.value).toBe(true)
  })

  it('应该处理异步恢复函数', async () => {
    let resolveFn: (value: void) => void
    const promise = new Promise<void>((resolve) => {
      resolveFn = resolve
    })
    restoreFn.mockReturnValue(promise)

    const coordinator = useSessionRestoreCoordinator(restoreFn)

    const executionPromise = coordinator.executeRestore()

    expect(coordinator.isRestoring.value).toBe(true)

    resolveFn!()
    await executionPromise

    expect(coordinator.isRestoring.value).toBe(false)
  })
})
