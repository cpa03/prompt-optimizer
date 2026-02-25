/**
 * Vue 错误处理插件
 *
 * 提供全局 Vue 错误处理功能：
 * - Vue 全局错误处理器 (app.config.errorHandler)
 * - 错误边界组件支持
 * - 错误日志记录
 *
 * 使用流程：
 * 1. 在应用启动时调用 installErrorHandler(app, options?)
 */

import { type App, ref, type ComponentPublicInstance } from 'vue'

export interface ErrorHandlerOptions {
  /**
   * 是否在开发模式下输出详细错误信息
   * @default import.meta.env.DEV
   */
  verbose?: boolean

  /**
   * 错误回调函数
   * 可用于发送到外部错误追踪服务 (如 Sentry)
   */
  onError?: (error: Error, instance: ComponentPublicInstance | null, info: string) => void

  /**
   * 是否捕获组件错误后继续渲染
   * @default true
   */
  allowRecovery?: boolean
}

export interface ErrorInfo {
  error: Error
  instance: ComponentPublicInstance | null
  info: string
  timestamp: number
}

/**
 * 全局错误信息列表
 */
export const globalErrorList = ref<ErrorInfo[]>([])

/**
 * 是否有全局错误
 */
export const hasGlobalError = ref(false)

/**
 * 清除错误列表
 */
export function clearGlobalErrors() {
  globalErrorList.value = []
  hasGlobalError.value = false
}

/**
 * 安装 Vue 错误处理器
 *
 * @param app - Vue 应用实例
 * @param options - 配置选项
 */
export function installErrorHandler(app: App, options: ErrorHandlerOptions = {}) {
  const { verbose = import.meta.env?.DEV ?? false, onError } = options

  // Vue 全局错误处理器
  app.config.errorHandler = (
    err: unknown,
    instance: ComponentPublicInstance | null,
    info: string
  ) => {
    const error = err instanceof Error ? err : new Error(String(err))
    const errorInfo: ErrorInfo = {
      error,
      instance,
      info,
      timestamp: Date.now(),
    }

    // 添加到全局错误列表
    globalErrorList.value.push(errorInfo)
    hasGlobalError.value = true

    // 调用自定义错误回调
    if (onError) {
      try {
        onError(error, instance, info)
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError)
      }
    }

    // 开发模式下输出详细错误信息
    if (verbose) {
      console.error('Vue Error:', error.message)
      console.error('Component:', instance)
      console.error('Info:', info)
      if (error.stack) {
        console.error('Stack:', error.stack)
      }
    } else {
      // 生产模式下只输出简洁错误信息
      console.error(`Vue Error: ${error.message}`)
    }
  }

  // Vue 警告处理器 (仅开发模式)
  if (verbose) {
    app.config.warnHandler = (
      msg: string,
      _instance: ComponentPublicInstance | null,
      trace: string
    ) => {
      console.warn(`Vue Warning: ${msg}`)
      if (trace) {
        console.warn('Trace:', trace)
      }
    }
  }

  // errorCaptured 钩子会在组件中自动继承
  // 组件中可以通过 onErrorCaptured 监听子组件错误
}

/**
 * 错误边界 Mixin (兼容 Vue 2 风格)
 * Vue 3 中推荐使用 onErrorCaptured 钩子
 *
 * @deprecated 使用 onErrorCaptured 代替
 */
export const errorBoundaryMixin = {
  data() {
    return {
      errorCaptured: null as Error | null,
    }
  },
}
