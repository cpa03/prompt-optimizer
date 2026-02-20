# Security Policy

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow responsible disclosure:

1. **Do NOT** open a public issue
2. Email security details to the maintainers privately
3. Allow reasonable time for response and fix before public disclosure

## Security Architecture

### Data Handling Principles

Prompt Optimizer follows these security principles:

1. **Client-Side Only**: All data processing happens in your browser - no data is sent to any intermediate server
2. **Direct API Communication**: API keys are used to communicate directly with AI service providers
3. **Local Storage**: All user data (API keys, settings, history) is stored locally in your browser
4. **No Server-Side Storage**: We do not store any user data on our servers

### API Key Security

#### How API Keys Are Stored

- **Web/Desktop**: Stored in browser's localStorage or Electron's secure storage
- **Never Transmitted**: API keys never pass through our servers
- **User Control**: Users have full control over their API keys

#### Best Practices for API Key Management

1. **Use Environment Variables** (Recommended for deployments):

   ```bash
   # Docker/Vercel deployment
   VITE_OPENAI_API_KEY=your_key_here
   VITE_GEMINI_API_KEY=your_key_here
   ```

2. **Rotate Keys Regularly**: Change your API keys periodically
3. **Use Minimal Permissions**: Only grant necessary permissions to your API keys
4. **Monitor Usage**: Regularly check API usage on provider dashboards
5. **Never Share Keys**: Keep your API keys private and never commit them to version control

### Environment Variable Security

#### Secure Configuration

1. **Never commit `.env` files**: The `.env` file is excluded from version control via `.gitignore`
2. **Use `.env.example`**: Template file shows available configuration options without exposing secrets
3. **Environment-Specific Configs**: Use different API keys for development/staging/production

#### Docker Deployment Security

```bash
# Recommended: Use secrets management
docker run -d \
  -e VITE_OPENAI_API_KEY_FILE=/run/secrets/openai_key \
  --secret openai_key \
  linshen/prompt-optimizer

# Alternative: Use environment variables (less secure)
docker run -d \
  -e VITE_OPENAI_API_KEY=your_key \
  linshen/prompt-optimizer
```

### Authentication & Access Control

#### Password Protection (Cloudflare Pages/Vercel)

When `ACCESS_PASSWORD` environment variable is set:

1. **Rate Limiting**: Implemented to prevent brute force attacks
   - Max 5 attempts per IP
   - 1-minute lockout window
   - 5-minute block duration after max attempts

2. **Secure Session Management**:
   - HTTP-only cookies
   - Secure flag enabled (HTTPS only)
   - SameSite=Strict policy
   - 24-hour session expiration

3. **Timing-Safe Comparison**: Password verification uses constant-time comparison to prevent timing attacks

### Content Security

#### XSS Prevention

1. **DOMPurify Integration**: All markdown content is sanitized before rendering
2. **No `innerHTML` with User Content**: User input is always sanitized
3. **Content Security Policy**: Recommended for production deployments

#### Input Validation

All user inputs are validated and sanitized:

- API endpoint URLs are validated for proper format
- Custom model suffixes follow strict naming conventions
- File uploads have size and type restrictions

### Network Security

#### CORS Configuration

The application handles CORS appropriately:

- Web version may encounter CORS issues with certain API providers
- Desktop app bypasses CORS completely (recommended for sensitive environments)
- Browser extension has special permissions to bypass certain CORS restrictions

#### Recommended for Production

1. **Use HTTPS**: Always deploy with HTTPS enabled
2. **Configure CSP Headers**: Add Content Security Policy headers
3. **Enable HSTS**: HTTP Strict Transport Security
4. **Use Secure Cookies**: Ensure cookies have Secure flag

### Content Security Policy (CSP) Configuration

For production deployments, add these headers:

```nginx
# Nginx example
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.openai.com https://api.anthropic.com https://generativelanguage.googleapis.com https://api.deepseek.com https://api.siliconflow.cn https://open.bigmodel.cn;" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

```javascript
// Vercel/Cloudflare Pages (vercel.json or _headers)
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" }
      ]
    }
  ]
}
```

### Dependency Security

#### Automated Vulnerability Scanning

We regularly scan dependencies for known vulnerabilities:

```bash
# Run security audit
npm audit

# Fix vulnerabilities
npm audit fix
```

#### Dependency Updates

- We regularly update dependencies to patch security vulnerabilities
- Security patches are prioritized over feature updates
- Dependabot alerts are monitored and addressed promptly

### File Upload Security

When using image-to-image features:

1. **File Size Limits**: Maximum 10MB per image (configurable)
2. **File Type Validation**: Only image files are accepted
3. **Image Dimension Limits**: Maximum 4096px (configurable)
4. **Client-Side Processing**: Images are processed locally, not uploaded to servers

### Data Privacy

#### What We Don't Collect

- No analytics or tracking
- No user data collection
- No API key logging
- No conversation history on our servers

#### User Data Ownership

- Users own all their data
- Data stays on user's device
- No cloud sync (unless self-hosted)
- Users can export/delete their data anytime

### Self-Hosting Security

When self-hosting Prompt Optimizer:

1. **Change Default Passwords**: Always set a strong `ACCESS_PASSWORD`
2. **Use HTTPS**: Configure SSL/TLS certificates
3. **Keep Updated**: Regularly update to latest version
4. **Monitor Logs**: Check for suspicious activity
5. **Network Isolation**: Consider running in isolated network
6. **Regular Backups**: Backup your configuration regularly

### Security Checklist

For production deployments:

- [ ] Set strong `ACCESS_PASSWORD` (if using password protection)
- [ ] Configure HTTPS with valid SSL certificate
- [ ] Add Content Security Policy headers
- [ ] Enable HSTS (HTTP Strict Transport Security)
- [ ] Set secure cookie flags
- [ ] Configure rate limiting (if using authentication)
- [ ] Regularly update dependencies
- [ ] Monitor security advisories
- [ ] Use environment variables for API keys (never commit to code)
- [ ] Restrict API key permissions to minimum required
- [ ] Regularly rotate API keys
- [ ] Set up monitoring and alerting

### Security Best Practices for Users

1. **Keep Software Updated**: Always use the latest version
2. **Use Strong Passwords**: If password protection is enabled
3. **Monitor API Usage**: Check provider dashboards regularly
4. **Report Issues**: Report any security concerns promptly
5. **Desktop App**: Use desktop version for maximum security (no CORS issues)
6. **Self-Host**: Consider self-hosting for full control

### Known Security Considerations

1. **Browser Storage**: API keys stored in localStorage are accessible to JavaScript running in the same origin. Desktop app provides better isolation.

2. **CORS Limitations**: Web version may have CORS issues with some API providers. Desktop app or browser extension recommended.

3. **Mixed Content**: When accessing local services (like Ollama) from HTTPS web version, mixed content security policies may block connections.

4. **Rate Limiting Limitation**: The in-memory rate limiting in Cloudflare Workers is not distributed across edge locations. For production use, implement distributed rate limiting using KV storage.

### Security Updates

Security updates are released as soon as vulnerabilities are discovered and fixed. We recommend:

1. **Automatic Updates**: Enable automatic updates for desktop app
2. **Watch Releases**: Watch the repository for security updates
3. **Subscribe to Advisories**: Monitor GitHub Security Advisories

### Compliance

While Prompt Optimizer is a client-side application that doesn't collect user data, organizations deploying it should:

1. **Review Data Flows**: Understand where API requests go (directly to AI providers)
2. **Configure Appropriately**: Set up proper security controls for your environment
3. **Train Users**: Ensure users understand security best practices
4. **Monitor Usage**: Monitor API usage and costs

### Contact

For security-related questions or concerns:

- Open a GitHub issue for general security questions
- Email maintainers privately for sensitive security vulnerabilities

---

**Last Updated**: 2026-02-20  
**Version**: 1.0

This security policy is reviewed and updated regularly as the project evolves.
