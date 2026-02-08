/**
 * Context Editor Constants Module
 * Eliminates hardcoded context editor tab defaults
 * Flexy loves modularity! All context editor defaults centralized and typed.
 */

// Default tabs for context editor
export const CONTEXT_EDITOR_DEFAULTS = {
  // Default tab when opening context editor
  TAB: 'messages' as const,
  
  // Available tabs
  AVAILABLE_TABS: ['messages', 'variables', 'tools'] as const,
} as const

// Type for context editor tabs
type ContextEditorTab = typeof CONTEXT_EDITOR_DEFAULTS.AVAILABLE_TABS[number]
export type { ContextEditorTab }
