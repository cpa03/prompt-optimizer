# AI Agent Engineer - Long Time Memory

## Domain Focus

AI Agent Engineering - delivering small, safe, measurable improvements to the MCP server and related AI agent integration code.

## Recent Work

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

1. **Variable hoisting issues**: JavaScript function-scope variables (`var`) can be hoisted, but `const`/`let` are block-scoped and will throw `ReferenceError` if accessed before declaration.
2. **Async initialization**: Ensure async dependencies are properly awaited before use.
3. **Module-level state**: Watch for race conditions in module initialization.
4. **Polling vs Locks**: Prefer async/await with in-flight checks over setTimeout polling loops for concurrency control.

## MCP Server Architecture Patterns

- **Error handling**: Use `MCPErrorHandler` with standardized error codes (`-32xxx` range for AI-specific errors)
- **Rate limiting**: Use `RateLimiter` class with sliding window algorithm
- **Health checks**: `/health` and `/health/ready` endpoints should include rate limiter stats
- **Graceful shutdown**: Use `unref()` on timers to allow process exit

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
