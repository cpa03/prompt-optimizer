# AI Agent Engineer - Long Time Memory

## Domain Focus

AI Agent Engineering - delivering small, safe, measurable improvements to the MCP server and related AI agent integration code.

## Recent Work

### PR #750: Use logger instead of console in graceful shutdown
- **Issue**: The graceful shutdown code used direct `console.log`/`console.warn` calls instead of the project's logger utility, creating inconsistency with the rest of the codebase.
- **Fix**: Replaced 8 `console.log` calls with `logger.info` and 2 `console.warn` calls with `logger.warn` in `packages/mcp-server/src/index.ts`. This allows proper log level control via the DEBUG environment variable.
- **Files Changed**: `packages/mcp-server/src/index.ts`
- **Testing**: All 132 tests pass, build succeeds, lint passes

### PR #725: Fix graceful shutdown session close order
- **Issue**: The graceful shutdown function called `httpServer.close()` before closing active sessions, which could cause a race condition where the process exits before sessions are properly closed.
- **Fix**: Reordered shutdown sequence to close all active sessions BEFORE calling `httpServer.close()`. This ensures sessions are properly cleaned up before the server stops accepting connections.
- **Files Changed**: `packages/mcp-server/src/index.ts`
- **Testing**: All 88 tests pass, build succeeds

### PR #697: Fix graceful shutdown to properly close active sessions
- **Issue**: The graceful shutdown function was logging that it would close active sessions but never actually calling `close()` on them, leaving sessions in an inconsistent state.
- **Fix**: Made `gracefulShutdown` async and added actual session close logic using `Promise.all` to close each transport with proper error handling.
- **Files Changed**: `packages/mcp-server/src/index.ts`
- **Testing**: Type-check passes, 88 tests pass

### PR #686: Add error handling to HTTP route handlers
- **Issue**: HTTP route handlers for `/mcp` (POST, GET, DELETE) were missing try-catch blocks around `httpTransport.handleRequest` calls, which could cause unhandled exceptions to crash the server.
- **Fix**: Added try-catch blocks with proper error logging and JSON-RPC error responses in `packages/mcp-server/src/index.ts`
- **Files Changed**: `packages/mcp-server/src/index.ts`
- **Testing**: Lint passes, 88 tests pass, build succeeds

### PR #654: Improve rateLimiter initialization order for code clarity
- **Issue**: The `rateLimiter` was created after the health endpoint definitions, which, while working at runtime (since route handlers are executed later), was confusing for code readability and maintenance.
- **Fix**: Moved the `rateLimiter` creation to occur before the health endpoint definitions in `packages/mcp-server/src/index.ts`
- **Files Changed**: `packages/mcp-server/src/index.ts`
- **Benefit**: Improved code clarity and maintainability - variables are now declared before use

### PR #653: Fix race condition in session initialization (fixes #627)
- **Issue**: Session initialization used setTimeout polling in `saveAllSessions` which could lead to race conditions when multiple components initialize simultaneously.
- **Fix**: Replaced setTimeout polling loop with async/await lock pattern, same as `restoreAllSessions`. Added second check after `restoreAllSessions()` to handle concurrent saves.
- **Files Changed**: `packages/ui/src/stores/session/useSessionManager.ts`
- **Testing**: Build passes, Lint passes, 309/309 tests pass

### PR #646: Fix rateLimiter initialization order
- **Issue**: The `rateLimiter` was being used in `/health` and `/health/ready` endpoints before it was created, causing a `ReferenceError` in HTTP transport mode.
- **Fix**: Moved the `rateLimiter` creation to occur before the health endpoint definitions in `packages/mcp-server/src/index.ts`
- **Files Changed**: `packages/mcp-server/src/index.ts`
- **Testing**: All 88 tests pass, build succeeds

## Common Issues to Look For

1. **Missing error handling in async route handlers**: Always wrap async route handler calls in try-catch to prevent unhandled exceptions from crashing the server.
2. **Variable hoisting issues**: JavaScript function-scope variables (`var`) can be hoisted, but `const`/`let` are block-scoped and will throw `ReferenceError` if accessed before declaration.
3. **Async initialization**: Ensure async dependencies are properly awaited before use.
4. **Module-level state**: Watch for race conditions in module initialization.
5. **Polling vs Locks**: Prefer async/await with in-flight checks over setTimeout polling loops for concurrency control.
6. **Incomplete shutdown logic**: When logging cleanup actions, ensure the actual cleanup code is implemented (not just the log statements).
7. **Shutdown sequence**: When gracefully shutting down services with dependencies, ensure dependent resources (like sessions) are closed BEFORE stopping the server that manages them.
8. **Console vs Logger**: Always use the project's logger utility instead of direct console.log/console.warn calls for consistent log level control.

## MCP Server Architecture Patterns

- **Error handling**: Use `MCPErrorHandler` with standardized error codes (`-32xxx` range for AI-specific errors)
- **HTTP route error handling**: Always wrap async handlers in try-catch, log errors, return proper JSON-RPC error responses
- **Rate limiting**: Use `RateLimiter` class with sliding window algorithm
- **Health checks**: `/health` and `/health/ready` endpoints should include rate limiter stats
- **Graceful shutdown**: Use `unref()` on timers to allow process exit, and ensure all resources (like sessions) are properly cleaned up. Close dependent resources BEFORE stopping the server that manages them.

## Key Files

- `packages/mcp-server/src/index.ts` - Main MCP server entry point
- `packages/mcp-server/src/adapters/core-services.ts` - Core services manager
- `packages/mcp-server/src/adapters/error-handler.ts` - Error handling with AI-specific codes
- `packages/mcp-server/src/utils/rate-limiter.ts` - Rate limiting implementation
- `packages/mcp-server/src/utils/logging.ts` - Logging utilities
- `packages/ui/src/stores/session/useSessionManager.ts` - Session management with race condition protection

## Testing Approach

- Unit tests for error handlers, rate limiter, parameter validation
- Integration tests for core services
- All tests use Vitest framework
- Run with: `pnpm -F @prompt-optimizer/mcp-server test`

## Build Commands

- Build: `pnpm build`
- Test: `pnpm test`
- Lint: `pnpm lint`
- Build core first: `pnpm -F @prompt-optimizer/core build`
