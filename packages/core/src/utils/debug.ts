/**
 * Debug Logging Utility
 * Provides development-only logging with namespace support
 * Eliminates console noise in production while maintaining debuggability in development
 */

import { isDevelopment } from './environment'

type LogLevel = 'debug' | 'log' | 'warn' | 'error'

export interface DebugLogger {
  debug: (...args: unknown[]) => void
  log: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
  enabled: boolean
}

const enabledNamespaces = new Set<string>()
let globalDebugEnabled = false

/**
 * Check if debug logging is currently enabled
 * @returns true if debug logging is enabled globally, in development, or via environment variable
 */
export function isDebugLoggingEnabled(): boolean {
  if (globalDebugEnabled) return true
  if (isDevelopment()) return true
  const debugEnv = getDebugEnvVar()
  if (debugEnv === 'true' || debugEnv === '1') return true
  if (debugEnv && debugEnv !== 'false' && debugEnv !== '0') {
    const namespaces = debugEnv.split(',').map((n) => n.trim())
    return namespaces.length > 0
  }
  return false
}

function getDebugEnvVar(): string | undefined {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.DEBUG_CORE || process.env.DEBUG
    }
  } catch {
    // process not available
  }
  try {
    if (typeof window !== 'undefined') {
      const runtimeConfig = (window as any).runtime_config
      if (runtimeConfig?.DEBUG_CORE || runtimeConfig?.DEBUG) {
        return runtimeConfig.DEBUG_CORE || runtimeConfig.DEBUG
      }
    }
  } catch {
    // window not available
  }
  return undefined
}

function shouldLog(namespace: string): boolean {
  if (!isDebugLoggingEnabled()) return false
  if (enabledNamespaces.has(namespace)) return true
  if (enabledNamespaces.has('*')) return true
  const debugEnv = getDebugEnvVar()
  if (
    debugEnv &&
    debugEnv !== 'true' &&
    debugEnv !== '1' &&
    debugEnv !== 'false' &&
    debugEnv !== '0'
  ) {
    const namespaces = debugEnv.split(',').map((n) => n.trim())
    return namespaces.some((pattern) => {
      if (pattern === '*') return true
      if (pattern.endsWith('*')) {
        return namespace.startsWith(pattern.slice(0, -1))
      }
      return pattern === namespace
    })
  }
  return true
}

function createLogFunction(level: LogLevel, namespace: string): (...args: unknown[]) => void {
  return (...args: unknown[]) => {
    if (!shouldLog(namespace)) return
    const prefix = `[${namespace}]`
    const consoleFn = console[level] as (...args: unknown[]) => void
    consoleFn(prefix, ...args)
  }
}

/**
 * Create a debug logger for a specific namespace
 * @param namespace - The namespace identifier for log messages (e.g., 'ModelManager', 'Storage')
 * @returns A DebugLogger instance with namespaced log methods
 * @example
 * const logger = createDebugLogger('MyService');
 * logger.log('Operation completed'); // Outputs: [MyService] Operation completed
 */
export function createDebugLogger(namespace: string): DebugLogger {
  return {
    debug: createLogFunction('debug', namespace),
    log: createLogFunction('log', namespace),
    warn: createLogFunction('warn', namespace),
    error: createLogFunction('error', namespace),
    get enabled() {
      return shouldLog(namespace)
    },
  }
}

/**
 * Enable debug logging for a specific namespace
 * @param namespace - The namespace to enable (use '*' for all namespaces)
 */
export function enableDebugNamespace(namespace: string): void {
  enabledNamespaces.add(namespace)
}

/**
 * Disable debug logging for a specific namespace
 * @param namespace - The namespace to disable
 */
export function disableDebugNamespace(namespace: string): void {
  enabledNamespaces.delete(namespace)
}

/**
 * Enable debug logging globally for all namespaces
 */
export function enableGlobalDebug(): void {
  globalDebugEnabled = true
}

/**
 * Disable debug logging globally
 */
export function disableGlobalDebug(): void {
  globalDebugEnabled = false
}
