/**
 * Port Configuration Module
 * Eliminates hardcoded port numbers across all packages
 * Flexy loves modularity! All ports centralized and typed.
 */

// Development server ports
export const DEV_PORTS = {
  // Web package dev server
  WEB: 18181,
  
  // Extension dev server  
  EXTENSION: 5174,
  
  // UI package dev server (if needed standalone)
  UI: 5173,
  
  // Desktop package dev server
  DESKTOP: 5175,
  
  // MCP server port
  MCP_SERVER: 3001,
} as const

// Type for dev ports
type DevPortKey = keyof typeof DEV_PORTS
export type DevPort = typeof DEV_PORTS[DevPortKey]

// Test server ports
export const TEST_PORTS = {
  // E2E test server
  E2E: 8888,
  
  // Unit test server
  UNIT_TEST: 9999,
} as const

// Type for test ports
type TestPortKey = keyof typeof TEST_PORTS
export type TestPort = typeof TEST_PORTS[TestPortKey]

// Get port by package name helper
export function getDevPort(packageName: 'web' | 'extension' | 'ui' | 'desktop' | 'mcp-server'): number {
  const portMap: Record<string, number> = {
    'web': DEV_PORTS.WEB,
    'extension': DEV_PORTS.EXTENSION,
    'ui': DEV_PORTS.UI,
    'desktop': DEV_PORTS.DESKTOP,
    'mcp-server': DEV_PORTS.MCP_SERVER,
  }
  
  const port = portMap[packageName]
  if (!port) {
    throw new Error(`Unknown package name: ${packageName}`)
  }
  
  return port
}

// Port range validation
export function isValidPort(port: number): boolean {
  return port >= 1024 && port <= 65535
}

// Validate all ports are in valid range
export function validatePorts(): void {
  const allPorts = [
    ...Object.values(DEV_PORTS),
    ...Object.values(TEST_PORTS),
  ]
  
  for (const port of allPorts) {
    if (!isValidPort(port)) {
      throw new Error(`Invalid port number: ${port}. Must be between 1024 and 65535.`)
    }
  }
}
