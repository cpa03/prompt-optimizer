# Security Engineer Long-term Memory

## Active Security Work

### Issue #601: ESLint 8.x ajv vulnerability
- **Status**: Completed
- **Priority**: Medium
- **Type**: ReDoS vulnerability in transitive dependency (ajv)
- **Acceptance Criteria**:
  - [x] Document vulnerability in SECURITY.md
  - [x] Create tracking issue for ESLint 9.x migration (documented in SECURITY.md)
  - [x] Add pnpm audit to CI pipeline

### DNS Rebinding Protection (2026-02-25)
- **Status**: Completed
- **Priority**: High
- **Type**: Security hardening - enable DNS rebinding protection by default
- **Changes**:
  - [x] Enable DNS rebinding protection by default in MCP server (environment.ts)
  - [x] Add documentation in SECURITY.md
  - [x] Add environment variable to env.local.example

## Recent Security Improvements

1. **CI Security Audit** (2026-02-25)
   - Added `pnpm audit` to CI pipeline (test.yml)
   - Runs on every push/PR to detect new vulnerabilities
   - Uses `--audit-level=high` to catch high severity issues
   - Currently monitors known vulnerabilities (minimatch, ajv)

2. **MCP Server DNS Rebinding Protection** (2026-02-25)
   - Enabled by default (previously disabled by default)
   - Protects against DNS rebinding attacks
   - Configurable via `MCP_DNS_REBINDING_PROTECTION=false` to disable
   - Documented in SECURITY.md

## Security Best Practices Implemented

1. **Dependency Management**
   - Dependabot enabled for automated updates
   - pnpm audit runs in CI pipeline (test.yml)

2. **Docker Security**
   - Security headers configured
   - CSP, HSTS, X-Frame-Options, etc.

3. **MCP Server**
   - CORS configuration for production use

## Known Vulnerabilities (Documented)

| Vulnerability | Severity | Status | Notes |
|---------------|----------|--------|-------|
| ESLint ajv ReDoS | Moderate | Mitigated | Documented in SECURITY.md, dev-only |
| minimatch ReDoS | High | Mitigated | Tracked via pnpm audit in CI |
| ESLint 9.x migration | - | Future | Required for full vulnerability resolution |

## Action Items

1. Monitor dependency updates via pnpm audit in CI
2. Plan ESLint 9.x migration to resolve ajv vulnerabilities
3. Review and address minimatch vulnerabilities via dependency updates

## Security Analysis (2026-02-25)

### Issue #617: XSS Vulnerability (v-html)
- **Status**: Already addressed
- **Finding**: CategoryManager.vue uses DOMPurify for sanitization before v-html
- **Evidence**: `sanitizedDeleteWarning` computed property sanitizes input with `DOMPurify.sanitize(name, { ALLOWED_TAGS: [] })`
- **Conclusion**: Issue was fixed in PR #140

### Issue #624: Console Logging
- **Status**: Already addressed
- **Finding**: Vite configuration strips all console.* methods in production builds
- **Evidence**: 
  - `packages/web/vite.config.ts` - drop_console: true and pure_funcs for console.log/info/warn/error
  - `packages/ui/vite.config.ts` - pure_funcs for console.log/info/debug/trace
- **Conclusion**: Console statements are removed in production builds

### Issue #609: ESLint 8.x to 9.x Migration
- **Status**: Documented, pending implementation
- **Finding**: ESLint 8.x is used in UI package
- **Action**: Migration tracked in SECURITY.md as future work

## New Security Improvement

### COOP/COEP Headers Added (2026-02-25)
- **Type**: Defense-in-depth security hardening
- **Change**: Added Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy headers to MCP server
- **Files Modified**: `packages/mcp-server/src/index.ts`
- **Headers Added**:
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Embedder-Policy: require-corp`
  - `Cross-Origin-Resource-Policy: same-origin` (was missing, now added)
- **Rationale**: These headers were already configured in nginx.conf but not in the MCP server itself. Adding them provides defense-in-depth protection.

## Last Updated
2026-02-25
