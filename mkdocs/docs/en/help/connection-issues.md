# Connection Issues

Solve network and API connection problems.

## Common Connection Problems

### CORS Errors

**What is CORS?**

CORS (Cross-Origin Resource Sharing) is a browser security feature that blocks web pages from making requests to different domains. This can prevent Prompt Optimizer from connecting to AI APIs.

**Solutions**:

1. **Use Desktop App (Recommended)**

   The desktop application doesn't have CORS restrictions. Download from [GitHub Releases](https://github.com/linshenkx/prompt-optimizer/releases).

2. **Use Chrome Extension**

   The browser extension can bypass some CORS restrictions.

3. **Self-Host the Application**

   Deploy your own instance:
   - [Docker Deployment](../deployment/docker-basic.md)
   - [Vercel Deployment](../deployment/vercel.md)

4. **Configure API Provider**

   Some providers allow you to configure allowed origins. Check your provider's documentation.

### Mixed Content Errors

**Problem**: Browser blocks HTTP requests from HTTPS pages.

**Solution**:

When using the online version (HTTPS), you cannot connect to local HTTP services like Ollama. Solutions:

1. Use the desktop app
2. Use Docker deployment with HTTP
3. Configure your local service to use HTTPS

### Local Ollama Connection

**Problem**: Cannot connect to local Ollama instance.

**Solutions**:

1. **Enable CORS for Ollama**:

   ```bash
   OLLAMA_ORIGINS=* ollama serve
   ```

2. **Or set environment variable**:

   ```bash
   export OLLAMA_ORIGINS="*"
   ```

3. **Use desktop app** for direct connection without CORS issues.

### API Key Issues

**Invalid API Key**:

1. Verify the key is copied correctly (no extra spaces)
2. Check if the key is active in your provider dashboard
3. Ensure the key has necessary permissions

**Quota Exceeded**:

1. Check your usage in provider dashboard
2. Wait for quota reset (if applicable)
3. Upgrade your plan or add credits

### Network Issues

**Timeout Errors**:

1. Check your internet connection
2. Try a different network (VPN may help)
3. Check if the API service is operational

**Slow Connection**:

1. Check network speed
2. Use a server closer to your location
3. Reduce request frequency

## Provider-Specific Issues

### OpenAI

- **Status**: [status.openai.com](https://status.openai.com)
- **API Keys**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Common Issues**: Rate limits, quota exceeded

### Anthropic (Claude)

- **Status**: [status.anthropic.com](https://status.anthropic.com)
- **API Keys**: [console.anthropic.com](https://console.anthropic.com)
- **Common Issues**: Model availability, rate limits

### Google (Gemini)

- **Status**: [ai.google.dev](https://ai.google.dev)
- **API Keys**: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- **Common Issues**: Region restrictions, quota limits

### DeepSeek

- **Status**: Check [platform.deepseek.com](https://platform.deepseek.com)
- **Common Issues**: Service availability, rate limits

## Testing Your Connection

Use the built-in connection test:

1. Go to Model Management
2. Click on your configured model
3. Click "Test Connection"
4. Check the result message

## Still Can't Connect?

If you've tried everything:

1. [Check Troubleshooting Guide](troubleshooting.md)
2. [Contact Support](support.md)
3. [Report an Issue](https://github.com/linshenkx/prompt-optimizer/issues)

Include in your report:

- Error messages (exact text)
- Network environment (browser, OS)
- API provider and model
- Steps you've already tried
