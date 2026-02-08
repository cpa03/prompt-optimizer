/**
 * Router Constants Module
 * Eliminates hardcoded route configuration values
 * Flexy loves modularity! All router defaults centralized and typed.
 */

// Default sub-modes for different main modes
export const DEFAULT_SUB_MODES = {
  // Image mode default sub-mode
  IMAGE: 'text2image',
  
  // Pro mode default sub-mode
  PRO: 'variable',
  
  // Context mode default sub-mode
  CONTEXT: 'system',
  
  // Basic mode default sub-mode
  BASIC: 'system',
} as const

// Type for default sub-modes
type DefaultSubModeKey = keyof typeof DEFAULT_SUB_MODES
export type DefaultSubMode = typeof DEFAULT_SUB_MODES[DefaultSubModeKey]

// Route guard configurations
export const ROUTE_GUARD_CONFIG = {
  // Toast message styles for navigation blocking
  TOAST: {
    text: {
      color: 'rgba(0,0,0,0.65)',
      fontSize: '14px',
    },
  },
} as const

// Get default sub-mode by mode helper
export function getDefaultSubMode(mode: 'image' | 'pro' | 'context' | 'basic'): string {
  const modeMap: Record<string, string> = {
    'image': DEFAULT_SUB_MODES.IMAGE,
    'pro': DEFAULT_SUB_MODES.PRO,
    'context': DEFAULT_SUB_MODES.CONTEXT,
    'basic': DEFAULT_SUB_MODES.BASIC,
  }
  
  const subMode = modeMap[mode]
  if (!subMode) {
    throw new Error(`Unknown mode: ${mode}`)
  }
  
  return subMode
}
