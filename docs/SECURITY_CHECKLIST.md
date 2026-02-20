# Security Deployment Checklist

Use this checklist when deploying Prompt Optimizer to ensure all security best practices are followed.

## Pre-Deployment Checklist

### API Key Security

- [ ] All API keys are stored in environment variables (never in code)
- [ ] API keys have minimal required permissions
- [ ] Different API keys for dev/staging/production environments
- [ ] API keys are rotated regularly (recommended: every 90 days)
- [ ] API keys are not shared in code commits, emails, or chat
- [ ] API key usage is monitored on provider dashboards

### Access Control

- [ ] Strong `ACCESS_PASSWORD` set (if using password protection)
- [ ] Password is at least 12 characters with complexity requirements
- [ ] Password is stored securely in environment variables
- [ ] Rate limiting is enabled and configured appropriately
- [ ] Session timeout is configured (default: 24 hours)

### Network Security

- [ ] HTTPS is enabled with valid SSL/TLS certificate
- [ ] HTTP Strict Transport Security (HSTS) is enabled
- [ ] Certificate is from trusted Certificate Authority
- [ ] Certificate is not expired
- [ ] Certificate covers all domains (including subdomains if needed)

### Security Headers

- [ ] Content-Security-Policy header is configured
- [ ] X-Frame-Options header is set to DENY
- [ ] X-Content-Type-Options header is set to nosniff
- [ ] X-XSS-Protection header is enabled
- [ ] Referrer-Policy header is configured
- [ ] Permissions-Policy header is configured

### Content Security Policy (CSP)

- [ ] CSP allows only necessary script sources
- [ ] CSP allows only necessary style sources
- [ ] CSP allows only necessary image sources
- [ ] CSP allows only necessary API endpoints
- [ ] CSP blocks inline scripts where possible (note: Vue requires unsafe-inline)
- [ ] CSP blocks data: URLs for scripts
- [ ] CSP blocks object-src
- [ ] CSP sets frame-ancestors to 'none'

### Data Protection

- [ ] No sensitive data is logged
- [ ] User data is stored locally (not on servers)
- [ ] API keys are encrypted if persisted
- [ ] HTTPS is enforced for all API communications
- [ ] No sensitive data in URL parameters

### Dependency Security

- [ ] All dependencies are up to date
- [ ] `npm audit` shows no critical vulnerabilities
- [ ] Dependabot alerts are reviewed and addressed
- [ ] Security patches are applied promptly

### File Upload Security (if using image features)

- [ ] File size limits are configured (default: 10MB)
- [ ] File type validation is enabled
- [ ] Image dimension limits are set (default: 4096px)
- [ ] Malicious file detection is considered

### Docker Security (if using Docker)

- [ ] Docker image is from trusted source
- [ ] Environment variables are passed securely
- [ ] Secrets are not in Dockerfile
- [ ] Container runs as non-root user
- [ ] Container network is isolated
- [ ] Docker Compose secrets are used for sensitive data

### Cloudflare Pages Security (if using Cloudflare)

- [ ] Access password is set in environment variables
- [ ] Rate limiting is enabled
- [ ] Web Application Firewall (WAF) is enabled
- [ ] SSL/TLS mode is set to "Full (Strict)"
- [ ] Security level is appropriate

### Vercel Security (if using Vercel)

- [ ] Access password is set in environment variables
- [ ] Security headers are configured in vercel.json
- [ ] Environment variables are encrypted
- [ ] Deployments are protected
- [ ] Preview deployments have appropriate access controls

### Monitoring and Logging

- [ ] Security events are logged
- [ ] Failed authentication attempts are monitored
- [ ] API usage is monitored for anomalies
- [ ] Error logs do not contain sensitive information
- [ ] Alerting is configured for suspicious activity

### Backup and Recovery

- [ ] Configuration is backed up regularly
- [ ] Recovery procedures are documented
- [ ] API keys can be quickly rotated if compromised
- [ ] Rollback procedures are tested

## Post-Deployment Verification

### Immediate Checks

- [ ] HTTPS is working (visit https://your-domain.com)
- [ ] Security headers are present (use browser dev tools or security scanners)
- [ ] Password protection works (if enabled)
- [ ] Rate limiting works (test multiple failed login attempts)
- [ ] API connections work properly
- [ ] No errors in console/logs

### Security Scanning

- [ ] Run security header scanner (e.g., securityheaders.com)
- [ ] Run SSL/TLS scanner (e.g., ssllabs.com/ssltest/)
- [ ] Run CSP evaluator (e.g., csp-evaluator.withgoogle.com/)
- [ ] Check for exposed sensitive files
- [ ] Verify no sensitive data in client-side code

### Functional Testing

- [ ] Login/logout works correctly
- [ ] API key configuration works
- [ ] All features work with HTTPS
- [ ] No mixed content warnings
- [ ] No CORS errors
- [ ] Desktop app connects properly (if applicable)

### Performance Testing

- [ ] Response times are acceptable
- [ ] No memory leaks
- [ ] Rate limiting doesn't block legitimate users
- [ ] Large file uploads work correctly

## Ongoing Security Maintenance

### Daily

- [ ] Monitor security logs for anomalies
- [ ] Check for failed authentication attempts
- [ ] Monitor API usage

### Weekly

- [ ] Review Dependabot alerts
- [ ] Check for security advisories
- [ ] Review access logs

### Monthly

- [ ] Run security audit (`npm audit`)
- [ ] Review and rotate API keys if needed
- [ ] Update dependencies for security patches
- [ ] Review security policies

### Quarterly

- [ ] Full security review
- [ ] Penetration testing (if applicable)
- [ ] Update security documentation
- [ ] Review and update access controls
- [ ] Rotate all API keys

### Annually

- [ ] Comprehensive security audit
- [ ] Review and update security policies
- [ ] Security training for team members
- [ ] Update incident response procedures

## Security Incident Response

If a security issue is discovered:

1. **Immediate**: Assess severity and impact
2. **Contain**: Block affected access, rotate compromised keys
3. **Investigate**: Determine root cause and scope
4. **Fix**: Apply security patches, update configurations
5. **Communicate**: Notify affected users if necessary
6. **Document**: Record incident and lessons learned
7. **Prevent**: Update security measures to prevent recurrence

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [SSL Labs](https://www.ssllabs.com/ssltest/)
- [Security Headers Scanner](https://securityheaders.com/)
- [Content Security Policy Reference](https://content-security-policy.com/)

## Emergency Contacts

- GitHub Security Advisories: https://github.com/linshenkx/prompt-optimizer/security/advisories
- Email maintainers for sensitive issues: [See repository for contact information]

---

**Last Updated**: 2026-02-20  
**Version**: 1.0

This checklist should be reviewed and updated regularly as security best practices evolve.
