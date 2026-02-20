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
