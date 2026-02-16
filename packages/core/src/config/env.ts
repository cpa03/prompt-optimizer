/**
 * Environment helper utilities
 * Flexy loves modularity! Safe environment variable access for all platforms.
 */

// Safe environment variable access that works in both Node.js and browser (Vite)
declare global {
  interface ImportMeta {
    env?: Record<string, string | undefined>
  }
}

export function getEnvValue(key: string): string | undefined {
  // Try import.meta.env first (Vite/browser environment)
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key]
    }
  } catch {
    // import.meta not available
  }

  // Fall back to process.env (Node.js environment)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key]
    }
  } catch {
    // process not available
  }

  return undefined
}

export function getEnvString(key: string, defaultValue: string): string {
  return getEnvValue(key) || defaultValue
}

export function getEnvInt(key: string, defaultValue: number): number {
  const value = getEnvValue(key)
  if (value === undefined || value === '') return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

export function getEnvFloat(key: string, defaultValue: number): number {
  const value = getEnvValue(key)
  if (value === undefined || value === '') return defaultValue
  const parsed = parseFloat(value)
  return isNaN(parsed) ? defaultValue : parsed
}

export function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = getEnvValue(key)
  if (value === undefined || value === '') return defaultValue
  return value.toLowerCase() === 'true' || value === '1'
}
