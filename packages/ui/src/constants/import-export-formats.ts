/**
 * Import/Export Format Constants
 * Flexy hates hardcoded format strings!
 * Centralizes all import/export format identifiers for consistency
 */

// Import format constants
export const IMPORT_FORMAT_SMART = 'smart' as const
export const IMPORT_FORMAT_OPENAI = 'openai' as const
export const IMPORT_FORMAT_LANGFUSE = 'langfuse' as const
export const IMPORT_FORMAT_CONVERSATION = 'conversation' as const

// Export format constants  
export const EXPORT_FORMAT_STANDARD = 'standard' as const
export const EXPORT_FORMAT_OPENAI = 'openai' as const

// Type definitions
export type ImportFormat = 
  | typeof IMPORT_FORMAT_SMART
  | typeof IMPORT_FORMAT_OPENAI
  | typeof IMPORT_FORMAT_LANGFUSE
  | typeof IMPORT_FORMAT_CONVERSATION

export type ExportFormat = 
  | typeof EXPORT_FORMAT_STANDARD
  | typeof EXPORT_FORMAT_OPENAI

// All import formats array
export const IMPORT_FORMATS = [
  IMPORT_FORMAT_SMART,
  IMPORT_FORMAT_OPENAI,
  IMPORT_FORMAT_LANGFUSE,
  IMPORT_FORMAT_CONVERSATION,
] as const

// All export formats array
export const EXPORT_FORMATS = [
  EXPORT_FORMAT_STANDARD,
  EXPORT_FORMAT_OPENAI,
] as const
