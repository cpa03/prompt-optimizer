/*
 * Prompt Optimizer - AI提示词优化工具
 * Copyright (C) 2025 linshenkx
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Utils Index Module
 * Centralized export for all utility modules
 * Flexy loves modularity! All utilities in one place.
 */

// Environment detection utilities
export {
  isRunningInElectron,
  isElectronApiReady,
  waitForElectronApi,
  isBrowser,
  isDevelopment,
  getEnvVar,
  scanCustomModelEnvVars,
  clearCustomModelEnvCache,
  CUSTOM_API_PATTERN,
  SUFFIX_PATTERN,
  MAX_SUFFIX_LENGTH,
  validateCustomModelConfig,
} from './environment'
export type {
  CustomModelEnvConfig,
  ValidatedCustomModelEnvConfig,
  ValidationResult,
} from './environment'

// IPC serialization utilities
export {
  safeSerializeForIPC,
  debugIPCSerializability,
  safeSerializeArgs,
} from './ipc-serialization'

// Patch plan utilities
export { applyPatchOperationsToText } from './patch-plan'
export type { ApplyPatchResult, ApplyPatchReportItem, ApplyPatchStatus } from './patch-plan'

// Debug logging utilities
export {
  createDebugLogger,
  isDebugLoggingEnabled,
  enableDebugNamespace,
  disableDebugNamespace,
  enableGlobalDebug,
  disableGlobalDebug,
} from './debug'
export type { DebugLogger } from './debug'

// Error handling utilities
export { toErrorWithCode, isStructuredErrorLike, isRecord, setErrorCause, BaseError } from './error'
export type { StructuredErrorLike, ErrorOptionsWithCause } from './error'

// JSON utilities
export {
  safeJsonParse,
  safeJsonParseNullish,
  isDangerousKey,
  sanitizeObject,
  redactSensitiveFields,
} from './json'
export type { SafeJsonParseOptions } from './json'

// Retry utilities
export {
  withRetry,
  withTimeout,
  sleep,
  createTimeoutSignal,
  TimeoutError,
  RETRY_PRESETS,
} from './retry'
export type { RetryOptions } from './retry'

// Circuit Breaker utilities
export {
  CircuitBreaker,
  CircuitBreakerRegistry,
  CircuitBreakerError,
  createCircuitBreaker,
  DEFAULT_CIRCUIT_BREAKER_OPTIONS,
} from './circuit-breaker'
export type {
  CircuitState,
  CircuitBreakerOptions,
  CircuitBreakerStats,
  CircuitBreakerRegistryOptions,
} from './circuit-breaker'
