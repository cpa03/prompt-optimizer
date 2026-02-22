# Cloudflare Pages Deployment Guide

This guide explains how to deploy Prompt Optimizer to Cloudflare Pages.

## Why Cloudflare Pages

- 🚀 **Global Edge Network**: 300+ data centers worldwide, low latency access
- 💰 **Generous Free Tier**: 100,000 free requests per month
- 🔒 **Built-in Security**: DDoS protection, WAF, SSL/TLS
- 🔄 **Automatic CI/CD**: Connect to GitHub for automatic deployments

## Deployment Methods

### Method 1: Via Cloudflare Dashboard (Recommended)

1. **Fork the Project**
   - Fork this project to your GitHub account

2. **Login to Cloudflare**
   - Visit [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Go to Pages and click "Create a project"

3. **Connect GitHub**
   - Select "Connect to Git"
   - Authorize and select your forked repository

4. **Configure Build Settings**
   - **Framework preset**: None
   - **Build command**: `pnpm install && pnpm build`
   - **Build output directory**: `packages/web/dist`
   - **Root directory**: `/` (keep default)

5. **Add Environment Variables** (Optional)
   - `ACCESS_PASSWORD`: Set access password
   - `VITE_OPENAI_API_KEY`: OpenAI API Key
   - `VITE_GEMINI_API_KEY`: Gemini API Key
   - Other API keys...

6. **Click "Save and Deploy"**

### Method 2: Using Wrangler CLI

```bash
# 1. Install Wrangler
npm install -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Clone the project
git clone https://github.com/YOUR_USERNAME/prompt-optimizer.git
cd prompt-optimizer

# 4. Install dependencies
pnpm install

# 5. Build the project
pnpm build

# 6. Deploy to Cloudflare Pages
wrangler pages deploy packages/web/dist --project-name=prompt-optimizer
```

## Environment Variables

Configure the following environment variables in Cloudflare Dashboard:

| Variable Name                      | Description                         | Required |
| ---------------------------------- | ----------------------------------- | -------- |
| `ACCESS_PASSWORD`                  | Access password protection          | Optional |
| `VITE_VERCEL_DEPLOYMENT`           | Set to `false` (for Cloudflare)     | Optional |
| `VITE_CLOUDFLARE_DEPLOYMENT`       | Set to `true` for Cloudflare        | Optional |
| `VITE_CLOUDFLARE_WEB_ANALYTICS_TOKEN` | Cloudflare Web Analytics token   | Optional |
| `VITE_OPENAI_API_KEY`              | OpenAI API Key                      | Optional |
| `VITE_GEMINI_API_KEY`              | Gemini API Key                      | Optional |
| `VITE_DEEPSEEK_API_KEY`            | DeepSeek API Key                    | Optional |
| `VITE_ZHIPU_API_KEY`               | Zhipu AI Key                        | Optional |
| `VITE_SILICONFLOW_API_KEY`         | SiliconFlow API Key                 | Optional |

### Configuration Steps

1. Go to Cloudflare Dashboard > Pages > Your Project
2. Click "Settings" > "Environment variables"
3. Click "Add variable" to add environment variables
4. Select "Production" and/or "Preview" environment
5. Save and redeploy for changes to take effect

## Access Authentication

The project supports password protection:

- Set `ACCESS_PASSWORD` environment variable to enable
- Users need to enter correct password to access the app
- Supports login/logout functionality
- Uses HttpOnly Cookie for security

## Custom Domain

1. Go to Cloudflare Dashboard > Pages > Your Project
2. Click "Custom domains" > "Set up a custom domain"
3. Enter your domain and follow the DNS configuration guide

Cloudflare will automatically configure SSL certificates.

## Important Notes

### Differences from Vercel Deployment

1. **Platform-Aware Cookie Name**:
   - The application automatically detects the deployment platform
   - Vercel: `vercel_access_token`
   - Cloudflare: `cf_access_token`
   - Detection is based on `CF_PAGES` environment variable set by Cloudflare

2. **Environment Variables**:
   - Both support configuration in Dashboard
   - Same format and usage

3. **Function Runtime**:
   - Vercel: Node.js Runtime
   - Cloudflare: Edge Runtime (V8 isolates)

4. **Static Asset Configuration**:
   - Cloudflare: Uses `_headers` and `_redirects` files in public directory
   - These files provide caching rules and SPA routing support
   - Static assets cached for 1 year with immutable flag
   - HTML pages have no-cache to ensure fresh content

### Limitations

- Cloudflare Pages Functions have 50ms CPU time limit per request (free tier)
- Request body size limit: 100MB
- Response body size limit: 25MB

## Performance Best Practices

### Cloudflare Rate Limiting (Recommended for Production)

The built-in authentication rate limiting uses in-memory storage, which is per-isolate. For production deployments, consider:

1. **Cloudflare WAF Rate Limiting Rules** (Recommended)
   - Configure in Cloudflare Dashboard > Security > WAF > Rate Limiting Rules
   - More reliable than application-level rate limiting
   - Works across all edge locations
   - See: https://developers.cloudflare.com/waf/rate-limiting-rules/

2. **KV-based Rate Limiting**
   - Enable KV namespace in wrangler.toml
   - Implement distributed rate limiting using KV with TTL

### Early Hints (Automatic)

Cloudflare automatically generates 103 Early Hints responses for critical resources:
- Preloads CSS and JavaScript files referenced in HTML
- Improves page load performance by ~20%
- No configuration required

### HTTP/3 and QUIC

HTTP/3 and QUIC are automatically enabled for Cloudflare Pages:
- Faster connection establishment
- Better performance on unreliable networks
- No configuration required

## Monitoring and Analytics

### Cloudflare Analytics

Access detailed analytics in Cloudflare Dashboard:
- Request volume and error rates
- Performance metrics (TTFB, total request time)
- Geographic distribution of requests
- Security events and threats blocked

### Web Analytics

For client-side analytics, consider [Cloudflare Web Analytics](https://developers.cloudflare.com/analytics/):
- Privacy-focused analytics
- No cookie banner required in many jurisdictions
- Easy integration with your site

## Troubleshooting

### Build Failure

1. Confirm correct Node.js version (18/20/22)
2. Check error messages in build logs
3. Ensure `pnpm-lock.yaml` file exists

### Environment Variables Not Working

1. Confirm variable name spelling (case-sensitive)
2. Confirm added to correct environment (Production/Preview)
3. Redeploy for changes to take effect

### API Connection Issues

Cloudflare Pages runs on edge network, not subject to browser CORS restrictions. However, if calling APIs directly from browser:

- Recommend using desktop app to avoid CORS issues
- Or configure custom API proxy service

## Related Links

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
