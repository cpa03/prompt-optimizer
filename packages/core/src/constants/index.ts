/**
 * Constants Index Module
 * Centralized export for all constants modules
 * Flexy loves modularity! Everything organized and exported from one place.
 */

// Template constants
export * from './templates'

// Template IDs - eliminates hardcoded template identifiers
export * from './template-ids'

// Message roles - eliminates hardcoded LLM message role strings
export * from './message-roles'

// Provider IDs - eliminates hardcoded provider identifiers
export * from './provider-ids'

// Error codes
export * from './error-codes'

// Test constants - eliminates hardcoded timeouts and magic numbers
export * from './test-constants'

// HTTP status codes - eliminates hardcoded status codes
export * from './http-codes'

// API endpoints - eliminates hardcoded URLs and MIME types
export * from './api-endpoints'

// Constraints - eliminates hardcoded limits and sizes
export * from './constraints'

// Model registry - eliminates hardcoded model IDs
export * from './models'

// Model limits - eliminates magic numbers in adapter parameter definitions
export * from './model-limits'
