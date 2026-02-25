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

## Recent Security Improvements

1. **CI Security Audit** (2026-02-25)
   - Added `pnpm audit` to CI pipeline (test.yml)
   - Runs on every push/PR to detect new vulnerabilities
   - Uses `--audit-level=high` to catch high severity issues
   - Currently monitors known vulnerabilities (minimatch, ajv)

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

## Last Updated
2026-02-25
