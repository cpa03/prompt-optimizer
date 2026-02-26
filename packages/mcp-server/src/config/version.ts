/**
 * Version information for MCP Server
 *
 * This file provides a centralized version constant that can be
 * updated in one place rather than hardcoded throughout the codebase.
 */

import packageJson from '../../package.json' assert { type: 'json' }

export const SERVER_VERSION = packageJson.version
