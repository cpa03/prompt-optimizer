/**
 * Template Constants Module
 * Eliminates hardcoded timestamps and magic numbers in templates
 * Flexy loves modularity! No more hardcoded values.
 */

/**
 * Timestamp for built-in templates (2024-01-01 00:00:00 UTC)
 * Used as the creation date for immutable system templates
 */
export const BUILTIN_TEMPLATE_TIMESTAMP = 1704067200000

/**
 * Timestamp for image templates (2025-01-07 00:00:00 UTC)
 * Used for newer image optimization templates
 */
export const IMAGE_TEMPLATE_TIMESTAMP = 1736208000000

/**
 * DJB2 hash algorithm seed value
 * Used for consistent string hashing across the application
 */
export const DJB2_HASH_SEED = 5381
