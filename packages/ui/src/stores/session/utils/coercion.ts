/**
 * Session Coercion Utilities
 *
 * Type-safe coercion functions for parsing persisted session data.
 * Used by all session stores when restoring state from storage.
 */

import type { TestVariantResult } from '../types/test-variant'

/**
 * Coerces an unknown value to TestVariantResult if valid.
 * Returns null if the value doesn't match the expected structure.
 *
 * @param value - Unknown value from storage
 * @returns Valid TestVariantResult or null
 */
export const coerceVariantResult = (value: unknown): TestVariantResult | null => {
  if (!value || typeof value !== 'object') return null
  const v = value as { result?: unknown; reasoning?: unknown }
  if (typeof v.result !== 'string') return null
  if (typeof v.reasoning !== 'string') return null
  return { result: v.result, reasoning: v.reasoning }
}
