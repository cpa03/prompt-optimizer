/**
 * Port Configuration Module
 * Eliminates hardcoded port values across the application
 * Flexy loves modularity! All ports centralized and configurable via environment.
 */

import { getEnvInt } from './env';

// Port configuration - all ports configurable via environment variables
export const PORTS = {
  // Web development server
  web: {
    dev: getEnvInt('VITE_WEB_PORT', 18181),
    e2e: getEnvInt('E2E_PORT', 15555),
  },
  
  // MCP Server
  mcp: {
    http: getEnvInt('MCP_HTTP_PORT', 3000),
  },
  
  // Extension development (if needed)
  extension: {
    dev: getEnvInt('VITE_EXT_PORT', 18182),
  },
  
  // Desktop app (if needed for dev server)
  desktop: {
    dev: getEnvInt('VITE_DESKTOP_PORT', 18183),
  },
} as const;

// Helper functions for common port access
export function getWebDevPort(): number {
  return PORTS.web.dev;
}

export function getE2EPort(): number {
  return PORTS.web.e2e;
}

export function getMCPHttpPort(): number {
  return PORTS.mcp.http;
}

// Validate port is in valid range
export function isValidPort(port: number): boolean {
  return port >= 1 && port <= 65535;
}

// Get base URL for a given port
export function getBaseUrl(port: number): string {
  return `http://localhost:${port}`;
}
