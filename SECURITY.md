# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Do NOT** open a public issue
2. Email your findings to the maintainers through GitHub's private vulnerability reporting
3. Or use GitHub's [Security Advisories](https://github.com/linshenkx/prompt-optimizer/security/advisories) feature

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution**: Depends on severity, typically within 30 days

## Security Best Practices

### For Docker Deployments

1. **Change default password**: Always set a strong `ACCESS_PASSWORD`
2. **Use secrets management**: Don't hardcode API keys in environment variables for production
3. **Enable HTTPS**: Use a reverse proxy with TLS termination
4. **Network isolation**: Use Docker networks to isolate containers

### For Kubernetes Deployments

1. **Review network policies**: Adjust NetworkPolicy to match your infrastructure
2. **Use secrets**: Store sensitive data in Kubernetes Secrets
3. **Enable RBAC**: Configure appropriate RBAC rules
4. **Pod Security Standards**: The namespace enforces `restricted` profile

### For Desktop Application

1. **API Keys**: Stored locally in your browser's localStorage
2. **No telemetry**: The application does not send any data to external servers
3. **No analytics**: No usage tracking or analytics

## Security Features

### Current Implementations

- **CORS Protection**: Web application follows browser CORS policies
- **XSS Prevention**: Content Security Policy headers in Docker deployment
- **Authentication**: Optional password protection for Docker/Vercel deployments
- **No Server Storage**: All data stored client-side, no server-side data collection

### Docker Security Headers

The Docker deployment includes the following security headers:
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy`
- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `X-Robots-Tag: noindex, nofollow, nosnippet, noarchive` (prevents search engine indexing)
- `Permissions-Policy` (restricts browser features)

### MCP Server CORS Configuration

The MCP server endpoint uses CORS headers to allow cross-origin requests. By default, it allows all origins (`*`), which is suitable for development but not recommended for production.

**For production deployments:**

Set the `MCP_ALLOWED_ORIGINS` environment variable to restrict access to trusted origins:

```bash
# Single origin
MCP_ALLOWED_ORIGINS=https://yourdomain.com

# Multiple origins (comma-separated)
MCP_ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

**Security implications:**
- Using `*` allows any website to make requests to your MCP server
- This could expose your API keys and prompt data to malicious websites
- Always restrict origins in production environments

## Known Vulnerabilities

### ESLint ajv ReDoS Vulnerability (GHSA-2g4f-4pwh-qvx6)

| Attribute | Value |
|-----------|-------|
| Severity | Moderate |
| CWE | CWE-1333 (Regular Expression Denial of Service) |
| Affected | ESLint 8.x (transitive dependency ajv) |
| Impact | Developer machine only (dev dependency) |

**Description:**
ESLint 8.x depends on ajv ~6.x which contains a ReDoS vulnerability in JSON schema validation. This affects the linting process.

**Risk Assessment:**
- **Impact**: Low - This is a dev-only dependency, not shipped to production
- **Exploitability**: Low - Requires malicious JSON schema input during linting
- **Attack Vector**: Local - Must have local code execution

**Mitigation:**
- **Short-term**: Acceptable risk for dev-only use; ensure lint runs in isolated CI environment
- **Long-term**: Migrate to ESLint 9.x which uses a patched version of ajv

**Remediation Timeline:**
- ESLint 9.x migration scheduled for future update

---

## Security Audit

This project follows security best practices:

- Dependencies are regularly updated via Dependabot
- Docker images are scanned for vulnerabilities
- No hardcoded secrets in the codebase
- Input validation on all user inputs

## Disclosure Policy

When a security vulnerability is fixed:
1. A security advisory will be published on GitHub
2. The fix will be included in the next release
3. Credits will be given to the reporter (if desired)

## Contact

For security-related questions or concerns:
- Open a GitHub Security Advisory
- Reference this security policy in your communication
