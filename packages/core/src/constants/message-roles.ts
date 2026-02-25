/**
 * Message Role Constants Module
 * Centralizes all LLM message role identifiers
 * Flexy loves modularity! No more hardcoded role strings.
 */

/**
 * System message role
 * Used for system instructions and context
 */
export const MESSAGE_ROLE_SYSTEM = 'system' as const

/**
 * User message role
 * Used for user input and queries
 */
export const MESSAGE_ROLE_USER = 'user' as const

/**
 * Assistant message role
 * Used for AI assistant responses
 */
export const MESSAGE_ROLE_ASSISTANT = 'assistant' as const

/**
 * Tool message role
 * Used for tool/function call results
 */
export const MESSAGE_ROLE_TOOL = 'tool' as const

/**
 * All message roles registry
 * Centralized collection of all supported roles
 */
export const MESSAGE_ROLES = {
  SYSTEM: MESSAGE_ROLE_SYSTEM,
  USER: MESSAGE_ROLE_USER,
  ASSISTANT: MESSAGE_ROLE_ASSISTANT,
  TOOL: MESSAGE_ROLE_TOOL,
} as const

/**
 * Role arrays for filtering operations
 * Pre-built arrays for common filter operations
 */
export const ROLE_FILTERS = {
  // Roles to include for system message extraction
  SYSTEM_ONLY: [MESSAGE_ROLE_SYSTEM],

  // Roles to exclude for conversation messages
  NON_SYSTEM: [MESSAGE_ROLE_USER, MESSAGE_ROLE_ASSISTANT, MESSAGE_ROLE_TOOL],

  // All conversation participant roles
  CONVERSATION: [MESSAGE_ROLE_USER, MESSAGE_ROLE_ASSISTANT],
} as const

// Type exports for type safety
export type MessageRole = (typeof MESSAGE_ROLES)[keyof typeof MESSAGE_ROLES]
