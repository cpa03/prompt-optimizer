# Quick Start Guide

Get started with Prompt Optimizer in minutes. This guide will help you set up and start optimizing your AI prompts.

## Web Version (Recommended)

The fastest way to get started:

1. **Visit the application**: Go to [https://prompt.always200.com](https://prompt.always200.com)
2. **Configure API keys**: Click the ⚙️ Settings button in the top right corner, select "Model Management", and enter your API key for your preferred AI model
3. **Start optimizing**: Choose between System Prompt or User Prompt optimization mode and begin crafting better prompts

### Supported AI Models

- **OpenAI**: GPT-4, GPT-3.5-turbo
- **Google Gemini**: Gemini Pro
- **DeepSeek**: DeepSeek Chat
- **Zhipu AI**: GLM models
- **SiliconFlow**: Various models
- **Custom API**: Any OpenAI-compatible endpoint

## Desktop Application

For the most complete experience without CORS limitations:

1. **Download**: Get the latest version from [GitHub Releases](https://github.com/linshenkx/prompt-optimizer/releases)
   - **Installers (Recommended)**: `.exe` (Windows), `.dmg` (macOS), `.AppImage` (Linux) - supports auto-update
   - **Archives**: `.zip` files - portable but no auto-update

2. **Install**: Run the downloaded installer or extract the archive

3. **Launch**: Open the application and configure your API keys in Settings

4. **Start optimizing**: Begin creating and optimizing prompts

### Desktop Advantages

- ✅ No CORS restrictions - connect to any API including local Ollama
- ✅ Automatic updates (installer versions only)
- ✅ Better performance with native desktop integration

## Chrome Extension

Quick access from your browser:

1. **Install**: Get it from [Chrome Web Store](https://chromewebstore.google.com/detail/prompt-optimizer/cakkkhboolfnadechdlgdcnjammejlna)

2. **Pin to toolbar**: Click the puzzle icon in Chrome and pin Prompt Optimizer for easy access

3. **Start using**: Click the extension icon to open Prompt Optimizer and optimize prompts on any webpage

## Docker Deployment

For self-hosted deployments:

```bash
# Quick start
docker run -d -p 8081:80 --restart unless-stopped --name prompt-optimizer linshen/prompt-optimizer

# With API key configuration
docker run -d -p 8081:80 \
  -e VITE_OPENAI_API_KEY=your_key \
  -e ACCESS_PASSWORD=your_password \
  --restart unless-stopped \
  --name prompt-optimizer \
  linshen/prompt-optimizer
```

Then visit `http://localhost:8081` to access the application.

## Next Steps

- Learn about [System vs User Prompt Optimization](../basic/optimization.md)
- Explore [Template Management](../basic/templates.md)
- Configure [Advanced Variables](../advanced/variables.md)
- Check [Troubleshooting](../help/troubleshooting.md) if you encounter issues

Ready to create better prompts? Start optimizing now!
