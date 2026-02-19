# Chrome Extension

The Prompt Optimizer Chrome extension provides quick access to prompt optimization directly from your browser.

## 📦 Installation

### From Chrome Web Store

Install directly from the Chrome Web Store:

**[Install from Chrome Web Store](https://chromewebstore.google.com/detail/prompt-optimizer/cakkkhboolfnadechdlgdcnjammejlna)**

> Note: The Chrome Web Store version may not be the latest due to approval delays.

### Manual Installation (Developer Mode)

1. Download the extension package from [GitHub Releases](https://github.com/linshenkx/prompt-optimizer/releases)
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extracted extension folder

## 🚀 Getting Started

### Initial Setup

1. Click the Prompt Optimizer icon in your browser toolbar
2. Configure your API keys:
   - Click **Settings** (⚙️) button
   - Navigate to **Model Management**
   - Enter your API key(s)
   - Click **Save**

### Supported API Providers

- **OpenAI** - Get API key from [platform.openai.com](https://platform.openai.com)
- **Gemini** - Get API key from [ai.google.dev](https://ai.google.dev)
- **DeepSeek** - Get API key from [platform.deepseek.com](https://platform.deepseek.com)
- **Zhipu AI** - Get API key from [open.bigmodel.cn](https://open.bigmodel.cn)
- **SiliconFlow** - Get API key from [cloud.siliconflow.cn](https://cloud.siliconflow.cn)
- **Custom API** - Configure your own OpenAI-compatible endpoints

## ✨ Features

### Core Features

- **Quick Optimization** - Optimize prompts with one click
- **Multiple Templates** - Choose from various optimization templates
- **History Tracking** - Access previous optimizations
- **Favorites** - Save and organize your best prompts

### Extension-Specific Benefits

- **Always Available** - Quick access from browser toolbar
- **Lightweight** - Minimal resource usage
- **Bypass Some CORS Restrictions** - Extension can bypass certain browser restrictions

## 🔧 Configuration

### API Key Configuration

Configure API keys through the extension's settings:

1. Click extension icon
2. Click **Settings** → **Model Management**
3. Select your preferred provider
4. Enter API key
5. Click **Test Connection** to verify
6. Save configuration

### Advanced Settings

- **Default Model** - Set your frequently used AI model
- **Default Template** - Choose preferred optimization template
- **Language** - Switch between English and Chinese

## 🛡️ Security

### Data Storage

- All data is stored locally in your browser
- No data is uploaded to external servers
- API calls connect directly to AI service providers

### Privacy

- API keys are stored locally
- No analytics or tracking
- You can clear all data at any time

## ⚠️ Known Limitations

### CORS Restrictions

Some API providers have strict CORS policies. If you encounter connection issues:

1. **Use Desktop App** - No CORS restrictions (recommended for local models)
2. **Use API Proxy** - Deploy services like OneAPI or NewAPI
3. **Use Supported Providers** - Some providers have CORS-friendly policies

### Mixed Content (HTTPS to HTTP)

If using the online version with local models (like Ollama):

- Browsers block HTTPS → HTTP requests
- Use the desktop app or Docker deployment for local models

## 🔧 Troubleshooting

### Extension Not Loading

1. Check if extension is enabled in `chrome://extensions/`
2. Try removing and reinstalling
3. Check browser console for errors

### API Connection Failed

1. Verify API key is correct
2. Check network connectivity
3. Ensure API quota is not exceeded
4. Try a different provider

### Optimization Timeout

1. Check network speed
2. Reduce prompt complexity
3. Try a faster model

## 📚 Related Documentation

- [Quick Start Guide](../user/quick-start.md) - Getting started with Prompt Optimizer
- [Desktop Application](desktop.md) - Desktop version with more features
- [Troubleshooting](../help/troubleshooting.md) - Common issues and solutions

---

**Need Help?**

- [Report an Issue](https://github.com/linshenkx/prompt-optimizer/issues)
- [Chrome Web Store](https://chromewebstore.google.com/detail/prompt-optimizer/cakkkhboolfnadechdlgdcnjammejlna)
