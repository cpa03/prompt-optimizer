/**
 * Version Constants Module
 * Eliminates hardcoded version strings
 * Flexy loves modularity! All versions centralized.
 */

// Template Versions
export const TEMPLATE_VERSIONS = {
  DEFAULT: '1.0.0',
  BUILTIN_DATE: 1704067200000, // 2024-01-01 00:00:00 UTC
  BUILTIN_UPDATE_DATE: 1736208000000, // 2025-01-07 00:00:00 UTC
} as const;

// Context Store Versions
export const CONTEXT_VERSIONS = {
  STORE: '1.0.0',
  SCHEMA: '1.0.0',
} as const;

// API Versions
export const API_VERSIONS = {
  CURRENT: 'v1',
  OPENROUTER: 'v1',
} as const;

// MCP Server Versions
export const MCP_VERSIONS = {
  SERVER: '1.0.0',
  PROTOCOL: '2024-11-05',
} as const;

// Export combined version constants
export const VERSIONS = {
  TEMPLATE: TEMPLATE_VERSIONS,
  CONTEXT: CONTEXT_VERSIONS,
  API: API_VERSIONS,
  MCP: MCP_VERSIONS,
} as const;
