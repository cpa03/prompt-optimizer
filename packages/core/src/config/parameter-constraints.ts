/**
 * LLM Parameter Constraints Configuration
 * Centralizes all parameter constraints to eliminate hardcoded values in adapters
 * Flexy loves modularity! All constraints are centralized and reusable.
 */

export interface ParameterConstraint {
  min: number
  max: number
  step?: number
  default?: number
}

/**
 * Standard parameter constraints used across all LLM adapters
 * These values follow OpenAI API specifications and are reusable
 */
export const PARAMETER_CONSTRAINTS = {
  // Sampling parameters
  temperature: {
    min: 0,
    max: 2,
    step: 0.1,
    default: 1
  },

  top_p: {
    min: 0,
    max: 1,
    step: 0.01,
    default: 1
  },

  // Token limits
  max_tokens: {
    min: 1,
    max: 1000000,
    step: 1
  },

  max_completion_tokens: {
    min: 1,
    max: 1000000,
    step: 1
  },

  // Penalty parameters
  presence_penalty: {
    min: -2,
    max: 2,
    step: 0.1,
    default: 0
  },

  frequency_penalty: {
    min: -2,
    max: 2,
    step: 0.1,
    default: 0
  },

  // Logprobs
  top_logprobs: {
    min: 0,
    max: 20,
    step: 1
  },

  // Sampling
  n: {
    min: 1,
    max: 10,
    step: 1,
    default: 1
  },

  // Seed for deterministic sampling
  seed: {
    min: 0,
    max: 2147483647,
    step: 1
  },

  // Timeout in milliseconds
  timeout: {
    min: 1000,
    max: 600000,
    step: 1000,
    default: 60000
  },

  // Anthropic-specific
  max_tokens_anthropic: {
    min: 1,
    max: 8192,
    step: 1,
    default: 4096
  },

  // TopK for Gemini and other providers
  top_k: {
    min: 1,
    max: 40,
    step: 1
  }
} as const

/**
 * Helper function to get constraints for a specific parameter
 */
export function getParameterConstraint(
  name: keyof typeof PARAMETER_CONSTRAINTS
): ParameterConstraint {
  return PARAMETER_CONSTRAINTS[name]
}

/**
 * Validate if a value is within parameter constraints
 */
export function isWithinConstraints(
  name: keyof typeof PARAMETER_CONSTRAINTS,
  value: number
): boolean {
  const constraint = PARAMETER_CONSTRAINTS[name]
  if (!constraint) return true
  return value >= constraint.min && value <= constraint.max
}

/**
 * Clamp a value to parameter constraints
 */
export function clampToConstraints(
  name: keyof typeof PARAMETER_CONSTRAINTS,
  value: number
): number {
  const constraint = PARAMETER_CONSTRAINTS[name]
  if (!constraint) return value
  return Math.max(constraint.min, Math.min(constraint.max, value))
}

// Export individual constraints for convenience
export const TEMPERATURE_CONSTRAINTS = PARAMETER_CONSTRAINTS.temperature
export const TOP_P_CONSTRAINTS = PARAMETER_CONSTRAINTS.top_p
export const MAX_TOKENS_CONSTRAINTS = PARAMETER_CONSTRAINTS.max_tokens
export const PRESENCE_PENALTY_CONSTRAINTS = PARAMETER_CONSTRAINTS.presence_penalty
export const FREQUENCY_PENALTY_CONSTRAINTS = PARAMETER_CONSTRAINTS.frequency_penalty
