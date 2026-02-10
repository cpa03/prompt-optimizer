/**
 * Template ID Constants Module
 * Centralizes all template identifiers to eliminate hardcoded values
 * Flexy loves modularity! All template IDs in one place.
 */

/**
 * Variable extraction template ID
 * Used for extracting variables from prompt content
 */
export const TEMPLATE_ID_VARIABLE_EXTRACTION = 'variable-extraction' as const

/**
 * Variable value generation template ID
 * Used for generating values for extracted variables
 */
export const TEMPLATE_ID_VARIABLE_VALUE_GENERATION = 'variable-value-generation' as const

/**
 * Template ID registry
 * All template identifiers organized by category
 */
export const TEMPLATE_IDS = {
  // Variable processing templates
  VARIABLE_EXTRACTION: TEMPLATE_ID_VARIABLE_EXTRACTION,
  VARIABLE_VALUE_GENERATION: TEMPLATE_ID_VARIABLE_VALUE_GENERATION,
} as const

/**
 * Template categories for organization
 */
export const TEMPLATE_CATEGORIES = {
  VARIABLE_PROCESSING: [
    TEMPLATE_IDS.VARIABLE_EXTRACTION,
    TEMPLATE_IDS.VARIABLE_VALUE_GENERATION,
  ],
} as const

// Type exports for type safety
export type TemplateId = typeof TEMPLATE_IDS[keyof typeof TEMPLATE_IDS]
