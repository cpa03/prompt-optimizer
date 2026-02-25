# Docker Deployment Guide

This guide covers deploying Prompt Optimizer using Docker, suitable for self-hosted and production environments.

## 🚀 Quick Start

### Basic Deployment

```bash
# Run container (default configuration)
docker run -d -p 8081:80 --restart unless-stopped --name prompt-optimizer linshen/prompt-optimizer
```

### With API Key Configuration

```bash
# Run container (with API key configuration and password protection)
docker run -d -p 8081:80 \
  -e VITE_OPENAI_API_KEY=your_key \
  -e ACCESS_USERNAME=your_username \
  -e ACCESS_PASSWORD=your_password \
  --restart unless-stopped \
  --name prompt-optimizer \
  linshen/prompt-optimizer
```

## 📋 Prerequisites

- Docker installed on your system
- API keys from your preferred AI providers
- (Optional) Basic authentication credentials

## 🔧 Configuration

### Environment Variables

#### API Keys

```bash
# API Key Configuration
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
VITE_ZHIPU_API_KEY=your_zhipu_api_key
VITE_SILICONFLOW_API_KEY=your_siliconflow_api_key
```

#### Access Control

```bash
# Basic Authentication (Password Protection)
ACCESS_USERNAME=your_username  # Optional, defaults to "admin"
ACCESS_PASSWORD=your_password  # Set access password
```

#### MCP Server Configuration

```bash
# MCP Server Configuration
MCP_DEFAULT_MODEL_PROVIDER=openai  # Options: openai, gemini, deepseek, siliconflow, zhipu, custom
MCP_LOG_LEVEL=info                 # Log level
```

### Custom Models

```bash
# Multiple Custom Models Configuration (Unlimited Quantity)
-e VITE_CUSTOM_API_KEY_ollama=dummy_key
-e VITE_CUSTOM_API_BASE_URL_ollama=http://localhost:11434/v1
-e VITE_CUSTOM_API_MODEL_ollama=qwen2.5:7b
```

## 🐳 Docker Compose Deployment

### Using docker-compose.yml

1. Clone the repository:

   ```bash
   git clone https://github.com/linshenkx/prompt-optimizer.git
   cd prompt-optimizer
   ```

2. Create `.env` file for configuration:

   ```bash
   cat > .env << EOF
   # API Key Configuration
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
   VITE_ZHIPU_API_KEY=your_zhipu_api_key
   VITE_SILICONFLOW_API_KEY=your_siliconflow_api_key

   # Basic Authentication (Password Protection)
   ACCESS_USERNAME=your_username
   ACCESS_PASSWORD=your_password
   EOF
   ```

3. Start the service:

   ```bash
   docker compose up -d
   ```

4. View logs:

   ```bash
   docker compose logs -f
   ```

### Example docker-compose.yml

```yaml
services:
  prompt-optimizer:
    # Use Docker Hub image
    image: linshen/prompt-optimizer:latest
    container_name: prompt-optimizer
    restart: unless-stopped
    ports:
      - '8081:80' # Web application port (MCP server accessible via /mcp path)
    environment:
      - VITE_OPENAI_API_KEY=your_openai_key
      - VITE_GEMINI_API_KEY=your_gemini_key
      # Access Control (Optional)
      - ACCESS_USERNAME=admin
      - ACCESS_PASSWORD=your_password
```

## 🌐 Access Points

After deployment, access:

- **Web Interface**: `http://localhost:8081`
- **MCP Server**: `http://localhost:8081/mcp`

## 🔗 MCP Server Integration

When running via Docker, the MCP Server automatically starts and can be accessed via the `/mcp` path.

### Claude Desktop Integration

1. Locate Claude Desktop's configuration directory:
   - Windows: `%APPDATA%\Claude\services`
   - macOS: `~/Library/Application Support/Claude/services`
   - Linux: `~/.config/Claude/services`

2. Edit or create `services.json`:

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

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Use a different port
docker run -d -p 8082:80 ...
```

### Container Won't Start

```bash
# Check logs
docker logs prompt-optimizer

# Remove existing container
docker rm -f prompt-optimizer
```

### API Connection Issues

1. Verify environment variables are set correctly
2. Check API key validity
3. Ensure network connectivity to API endpoints

---

**Related Links**:

- [Desktop Application](desktop.md) - Desktop app deployment
- [Chrome Extension](extension.md) - Browser extension usage
- [MCP Server Guide](../user/mcp-server.md) - Detailed MCP configuration
