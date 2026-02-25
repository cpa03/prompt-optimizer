/**
 * Shared Test Variant Types
 *
 * This module contains shared types used across all session stores
 * for managing test panel variants (A/B/C/D multi-column testing).
 *
 * Extracted from individual session files to reduce code duplication
 * and ensure consistent type definitions across the codebase.
 */

/**
 * Test panel version selection:
 * - 0: v0 (original prompt)
 * - >=1: v1..vn (history chain version)
 * - 'latest': follow latest vn
 */
export type TestPanelVersionValue = 0 | number | 'latest'

/**
 * Test variant identifiers (A/B/C/D columns)
 */
export type TestVariantId = 'a' | 'b' | 'c' | 'd'

/**
 * Test column count configuration (2-4 columns)
 */
export type TestColumnCount = 2 | 3 | 4

/**
 * Test variant configuration
 */
export interface TestVariantConfig {
  id: TestVariantId
  /** Prompt version (v0 / vN / latest) */
  version: TestPanelVersionValue
  /** Model configuration key (configId) */
  modelKey: string
}

/**
 * Test variant results type - generic to allow different result types
 */
export type TestVariantResults<T = unknown> = Record<TestVariantId, T>

/**
 * Test variant last run fingerprint for stale detection
 */
export type TestVariantLastRunFingerprint = Record<TestVariantId, string>

/**
 * Helper constants for variant IDs
 */
export const ALL_VARIANT_IDS: TestVariantId[] = ['a', 'b', 'c', 'd']

/**
 * Helper function to get variant label
 */
export const getVariantLabel = (id: TestVariantId): string => {
  const labels: Record<TestVariantId, string> = { a: 'A', b: 'B', c: 'C', d: 'D' }
  return labels[id]
}

/**
 * Test variant result structure (per column)
 * Used by all session stores for A/B/C/D column results
 */
export interface TestVariantResult {
  result: string
  reasoning: string
}

/**
 * Test variant results map (A/B/C/D -> TestVariantResult)
 * Re-exports TestVariantResults with concrete TestVariantResult type
 */
export type TestVariantResultsMap = Record<TestVariantId, TestVariantResult>

/**
 * Legacy test results structure (original vs optimized comparison)
 * Used by Basic mode sessions for simple 2-column comparison
 */
export interface TestResults {
  originalResult: string
  originalReasoning: string
  optimizedResult: string
  optimizedReasoning: string
}

/**
 * Common workspace layout configuration
 * Shared across all session types that have split panel + test columns
 */
export interface WorkspaceLayoutConfig {
  /** Main split: left pane width percent (25..50) */
  mainSplitLeftPct: number
  /** Test area: visible result columns (2..4) */
  testColumnCount: TestColumnCount
}
