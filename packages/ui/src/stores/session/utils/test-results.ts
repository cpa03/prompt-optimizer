/**
 * Test Results Utilities
 *
 * Helper functions for working with TestResults objects.
 * Used by session stores to avoid unnecessary reactive updates.
 */

import type { TestResults } from '../types/test-variant'

/**
 * Checks if two TestResults objects are equal by value.
 * Used to prevent unnecessary reactive updates when results haven't changed.
 *
 * @param a - First TestResults object (can be null)
 * @param b - Second TestResults object (can be null)
 * @returns true if both objects have identical values
 */
export const areTestResultsEqual = (a: TestResults | null, b: TestResults | null): boolean => {
  if (a === b) return true
  if (!a || !b) return false
  return (
    a.originalResult === b.originalResult &&
    a.originalReasoning === b.originalReasoning &&
    a.optimizedResult === b.optimizedResult &&
    a.optimizedReasoning === b.optimizedReasoning
  )
}
