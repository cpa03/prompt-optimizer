# Troubleshooting Guide

This guide provides systematic troubleshooting methods and solutions for Prompt Optimizer technical issues.

## 💾 Data Security and Privacy

### Q: Is my data safe? Will my API keys and optimization content be leaked?

#### Data Security Architecture

**Security by Design**:

```bash
# Pure frontend application architecture
✅ No backend server - No centralized data storage
✅ Local storage - All data stored on user's device
✅ Direct API connection - Requests sent directly to AI providers
✅ Open source - Code is fully transparent and auditable

# Data flow
User Device → AI Provider
    ↑              ↑
Local Storage   Encrypted (HTTPS)
```

**Specific Security Measures**:

**1. API Key Security**:

```javascript
// Storage details
Storage location: Browser localStorage
Encryption: Browser native encryption
Access permission: Only current domain
Transmission: HTTPS encrypted

// Security features
✅ Never uploaded to any server
✅ Never transmitted in plaintext
✅ Inaccessible to other websites
✅ Completely deletable via browser data clearing
```

**2. Optimization Content Security**:

```bash
# Data processing flow
User Input → Local Cache → Send to AI Provider → Receive Response → Local Storage

# Security highlights
✅ We never see your input content
✅ No intermediate server routing
✅ Direct communication with AI providers
✅ Follows each AI provider's data policy
```

**3. Privacy Protection**:

```bash
# Minimal data collection
❌ No personal information collected
❌ No device fingerprinting
❌ No third-party analytics
❌ No ads or tracking

# User data control
✅ Complete control over your data
✅ Export all data anytime
✅ Delete all data anytime
✅ Supports offline use (desktop version)
```

### Q: How do I backup and sync my data?

#### Data Backup Strategies

**Export via Application (Recommended)**:

```bash
# Export steps
1. Open Settings page
2. Find "Data Management" section
3. Click "Export Data" button
4. Select data types to export:
   ✅ Optimization history
   ✅ Custom templates
   ✅ Model configuration (excluding API keys)
   ✅ User preferences
5. Click "Export" button
6. Download the generated JSON backup file

# Backup file format
Filename: prompt-optimizer-backup-YYYYMMDD.json
Size: Usually a few KB to a few MB
Contents: All non-sensitive user data
```

#### Data Import and Recovery

```bash
# Standard import process
1. Find "Data Management" in Settings
2. Click "Import Data" button
3. Select previously exported JSON backup file
4. System displays backup details:
   - Backup time
   - Data types
   - Record count
5. Select import options:
   - Replace existing data (complete overwrite)
   - Merge data (keep existing, add new)
   - Import specific data types only
6. Confirm import operation
7. Restart application for changes to take effect

# Post-import verification
✅ Check model configuration
✅ Verify history records
✅ Confirm custom templates available
✅ Re-configure API keys (security requirement)
```

## 🔧 Technical Troubleshooting

### Q: Page loads slowly or becomes unresponsive?

#### Performance Diagnostics

**Step 1: Basic Environment Check**

```bash
# Recommended browser versions
✅ Chrome 88+
✅ Firefox 85+
✅ Safari 14+
✅ Edge 88+ (Chromium-based)

# System resource check
Available memory: Recommended > 2GB
CPU load: High load affects page responsiveness
Network: Check connection stability
```

**Step 2: Browser State Diagnosis**

```bash
# Tab management
Open tabs: Recommended < 20
Memory-intensive sites: Temporarily close videos, games
Background processes: Check for excessive background tasks

# Browser extension check
Disable non-essential extensions
Check ad blocker settings
Temporarily disable potentially conflicting extensions

# Cache and data cleanup
Clear browser cache: Ctrl+Shift+Delete
Clear localStorage: Dev Tools → Application → Storage
Reset browser settings: Last resort option
```

**Step 3: Application-Specific Checks**

```bash
# Data volume check
History record count: Too many records affect performance
Regular cleanup recommended: Keep important records, delete outdated content
Database size: Consider cleanup if over 100MB

# Feature usage check
Running functions: Avoid multiple optimization tasks simultaneously
Complex operations: Large data import/export operations
Background tasks: Check for incomplete tasks
```

#### Performance Optimization Solutions

**Immediate Optimization**:

```bash
# Quick fixes
1. Refresh page: Ctrl+F5 or Cmd+Shift+R
2. Close other tabs: Free up memory
3. Restart browser: Clear memory fragmentation
4. Check network: Ensure stable connection

# Temporary solutions
Use incognito mode: Avoid extension and cache interference
Try another browser: Rule out browser-specific issues
Use desktop version: Better performance
```

### Q: Interface display issues?

#### Common Display Problems

**1. Font and Text Issues**:

```bash
# Problem symptoms
Garbled text: Characters display incorrectly
Missing fonts: System doesn't support required fonts
Text overlap: Layout calculation errors

# Solutions
Check system fonts: Ensure common fonts are installed
Browser language: Set to English or Chinese
Encoding settings: Ensure page encoding is UTF-8
Zoom level: Reset browser zoom to 100%
```

**2. Layout and Style Issues**:

```bash
# Problem symptoms
Button misalignment: Interface elements out of place
Content overflow: Text or images exceed boundaries
Color anomalies: Theme colors display incorrectly

# Solutions
Clear style cache: Force refresh page
Check browser zoom: Ensure normal zoom level
Toggle theme: Switch between light and dark mode
Reset interface: Restore default interface configuration
```

### Q: API connection issues?

#### CORS (Cross-Origin) Issues

Most connection failures are caused by CORS restrictions. As this is a pure frontend application, browsers block direct API access from different origins.

**Solutions**:

```bash
# Option 1: Use Desktop Application (Most Recommended)
- Native application with no CORS restrictions
- Connect to any API including local Ollama
- Download from GitHub Releases

# Option 2: Use API Proxy Service
- Deploy OneAPI, NewAPI, or similar proxy tools
- Configure as custom API endpoint
- Request flow: Browser → Proxy → AI Provider

# Option 3: Configure CORS on Local Models
For Ollama:
- Set OLLAMA_ORIGINS=* to allow any origin
- Set OLLAMA_HOST=0.0.0.0:11434 for network access
```

#### Mixed Content Issues

If you correctly configured CORS for local models but still can't connect via the online version, this is due to browser **Mixed Content security policy**.

**Solutions**:

```bash
# Bypass the limitation
1. Use Desktop Version: No browser restrictions
2. Use Docker deployment (HTTP): Access via http://localhost:8081
3. Use Chrome Extension: Can bypass some restrictions
```

### Q: macOS shows "damaged" or "unverified developer"?

This occurs because the application isn't signed with an Apple Developer certificate.

**Solution**:

```bash
# Remove quarantine attribute
# For installed applications
xattr -rd com.apple.quarantine /Applications/PromptOptimizer.app

# For downloaded .dmg files (run before installation)
xattr -rd com.apple.quarantine ~/Downloads/PromptOptimizer-*.dmg
```

After running, open the application normally.

---

**Related Links**:

- [Technical Support](support.md) - Get more help and advanced usage
- [Common Questions](common-questions.md) - API configuration and basic issues
- [Connection Issues](connection-issues.md) - Detailed network troubleshooting
