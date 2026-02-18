# MCP Server User Guide

{% raw %}

<!-- Content source: Repository docs/user/mcp-server.md -->

{% endraw %}

Prompt Optimizer supports the Model Context Protocol (MCP), enabling integration with MCP-compatible AI applications like Claude Desktop.

## 🎯 Features

- **optimize-user-prompt**: Optimize user prompts to improve LLM performance
- **optimize-system-prompt**: Optimize system prompts to improve LLM performance
- **iterate-prompt**: Iteratively improve mature prompts based on specific requirements

## 🚀 Quick Start

### Docker Deployment (Recommended)

Docker is the simplest deployment method. The web interface and MCP server start simultaneously:

```bash
# Basic deployment
docker run -d -p 8081:80 \
  -e VITE_OPENAI_API_KEY=your-openai-key \
  -e MCP_DEFAULT_MODEL_PROVIDER=openai \
  --name prompt-optimizer \
  linshen/prompt-optimizer

# Access URLs
# Web Interface: http://localhost:8081
# MCP Server: http://localhost:8081/mcp
```

### Local Development Deployment

> **Note**: This method is intended for developers during development and debugging. Regular users should use Docker deployment.

```bash
# 1. Clone the project
git clone https://github.com/your-repo/prompt-optimizer.git
cd prompt-optimizer

# 2. Install dependencies
pnpm install

# 3. Configure environment variables (copy and edit .env.local)
cp env.local.example .env.local

# 4. Start MCP server
pnpm mcp:dev
```

The server will start at `http://localhost:3000/mcp`. Developers can view `packages/mcp-server/README.md` for more development-related information.

## ⚙️ Environment Variables

### API Key Configuration

At least one API key must be configured:

```bash
# Choose one or more API keys
VITE_OPENAI_API_KEY=your-openai-key
VITE_GEMINI_API_KEY=your-gemini-key
VITE_DEEPSEEK_API_KEY=your-deepseek-key
VITE_SILICONFLOW_API_KEY=your-siliconflow-key
VITE_ZHIPU_API_KEY=your-zhipu-key

# Custom API (e.g., Ollama)
VITE_CUSTOM_API_KEY=your-custom-key
VITE_CUSTOM_API_BASE_URL=http://localhost:11434/v1
VITE_CUSTOM_API_MODEL=qwen2.5:0.5b
```

### MCP Server Configuration

```bash
# Preferred model provider (when multiple API keys are configured)
# Options: openai, gemini, deepseek, siliconflow, zhipu, custom
MCP_DEFAULT_MODEL_PROVIDER=openai

# Log level (optional, default: debug)
# Options: debug, info, warn, error
MCP_LOG_LEVEL=info

# HTTP port (optional, default: 3000, not needed for Docker deployment)
MCP_HTTP_PORT=3000

# Default language (optional, default: zh)
# Options: zh, en
MCP_DEFAULT_LANGUAGE=en
```

## 🔗 Client Connection

### Claude Desktop Integration

1. **Locate the configuration directory**
   - Windows: `%APPDATA%\Claude\services`
   - macOS: `~/Library/Application Support/Claude/services`
   - Linux: `~/.config/Claude/services`

2. **Edit the configuration file `services.json`**:

```json
{
  "services": [
    {
      "name": "Prompt Optimizer",
      "url": "http://localhost:8081/mcp"
    }
  ]
}
```

> For local development (port 3000), change to `http://localhost:3000/mcp`.

## 🧪 Testing and Verification

Using MCP Inspector:

```bash
# 1. Start MCP server
pnpm mcp:dev

# 2. Start Inspector
npx @modelcontextprotocol/inspector
```

In the Inspector Web UI:

1. Select `Streamable HTTP`
2. Server URL: `http://localhost:3000/mcp`
3. Click "Connect" to connect to the server
4. Test available tools

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use

Change the port or stop the occupying process:

```bash
# Windows: Check port usage
netstat -ano | findstr :3000

# Change port
MCP_HTTP_PORT=3001 pnpm mcp:dev
```

#### Invalid API Key

Check if at least one valid key is configured:

```bash
# Ensure at least one valid API key is configured
echo $VITE_OPENAI_API_KEY
```

#### Model Provider Mismatch

Verify `MCP_DEFAULT_MODEL_PROVIDER`:

```bash
# Ensure provider name is correct
MCP_DEFAULT_MODEL_PROVIDER=openai  # Not "OpenAI"
```

#### Docker Deployment 401 Authentication Error

**Issue**: When using Docker deployment with `ACCESS_PASSWORD` enabled, MCP Inspector connection fails with a 401 error.

**Cause**: When password protection is enabled in Docker deployment, Nginx applies Basic authentication to all routes, including `/mcp`.

**Solutions**:

- **Fixed (v1.4.0+)**: The `/mcp` route is now configured to bypass Basic authentication.
- **Legacy workaround**:
  1. Don't set the `ACCESS_PASSWORD` environment variable
  2. Use network isolation (e.g., internal network only)
  3. Expose port 3000 directly: `docker run -p 3000:3000 ...`

**Technical Notes**:

- The MCP protocol itself doesn't support HTTP Basic authentication
- New versions have added `auth_basic off;` for the `/mcp` route in `docker/nginx.conf`
- Web application access remains password-protected

#### Claude Desktop Connection Failed

Check service status, URL, firewall settings, and logs.

**Resolution Steps**:

1. Confirm the MCP server is running
2. Check if the URL is correct
3. Verify firewall settings
4. Check Claude Desktop logs
