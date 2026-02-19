# Desktop Application

The Prompt Optimizer desktop application is the most feature-complete and best-performing version, offering unrestricted AI model access and full advanced functionality support.

## 🖥️ Core Advantages

The desktop application has significant advantages over other versions:

- ✅ **No CORS Limitations** - As a native desktop app, completely bypasses browser Cross-Origin Resource Sharing (CORS) issues
- ✅ **Perfect Local Model Support** - Direct connection to Ollama, LM Studio, and other locally deployed models
- ✅ **Automatic Updates** - Supports automatic checking and updating to the latest version
- ✅ **Independent Operation** - No browser dependency, providing faster response and better performance
- ✅ **Complete Features** - Supports all advanced features with no limitations
- ✅ **Stable and Reliable** - Not affected by browser environment changes

## 📋 System Requirements

### Windows

- Windows 10/11 (64-bit)
- At least 4GB RAM
- 100MB available disk space
- Visual C++ Redistributable (usually pre-installed)

### macOS

- macOS 10.15+ (Catalina or later)
- Intel or Apple Silicon processor
- At least 4GB RAM
- 100MB available disk space

### Linux

- Ubuntu 18.04+ / Debian 10+
- Or other mainstream Linux distributions
- X11 or Wayland display server
- At least 4GB RAM

## 📥 Download and Installation

### Official Download Source

**GitHub Releases (Recommended)**: [https://github.com/linshenkx/prompt-optimizer/releases](https://github.com/linshenkx/prompt-optimizer/releases)

### Installation Package Types

#### Recommended: Installer Version (Supports Auto-Update)

- **Windows**: `Prompt-Optimizer-Setup-[version].exe`
- **macOS**: `Prompt-Optimizer-[version].dmg`
- **Linux**: `Prompt-Optimizer-[version].AppImage`

#### Alternative: Archive Version (No Installation Required)

- **Windows**: `Prompt-Optimizer-[version]-win.zip`
- **macOS**: `Prompt-Optimizer-[version]-mac.zip`
- **Linux**: `Prompt-Optimizer-[version]-linux.zip`

### Windows Installation Steps

#### 1. Download the Installer

- Download `Prompt-Optimizer-Setup-[version].exe` from GitHub Releases
- Ensure downloading from official sources to avoid security risks

#### 2. Run the Installer

```bash
# If you encounter a Windows security prompt:
# 1. Click "More info"
# 2. Click "Run anyway"
# 3. Select installation location (default recommended)
# 4. Click "Install" button
```

#### 3. Complete Installation

- The application will start automatically after installation
- Shortcuts will be created on desktop and start menu
- First startup may take a few seconds to load

#### 4. Common Issues

**Installation Failed**:

```bash
# Run the installer with administrator privileges
# Right-click the installer -> "Run as administrator"
```

**Missing Runtime Libraries**:

```bash
# Download and install Visual C++ Redistributable
# Link: https://aka.ms/vs/17/release/vc_redist.x64.exe
```

### macOS Installation Steps

#### 1. Download and Mount

- Download the `.dmg` installer
- Double-click to mount the disk image

#### 2. Install the Application

- Drag Prompt Optimizer to the Applications folder
- Wait for copy to complete
- Eject the disk image

#### 3. First Launch

```bash
# If you see "cannot be opened" prompt:
# Method 1: Hold Control key and click app icon -> select "Open" -> "Open"
# Method 2: System Preferences -> Security & Privacy -> General -> "Open Anyway"
```

#### 4. Permission Settings

- First launch may require granting network access permission
- Allow the app to run in "Security & Privacy" settings
- If needed, allow network access in "Privacy" settings

### Linux Installation Steps

#### AppImage Version (Recommended)

```bash
# 1. Download the AppImage file
wget https://github.com/linshenkx/prompt-optimizer/releases/latest/download/Prompt-Optimizer-[version].AppImage

# 2. Add execute permission
chmod +x Prompt-Optimizer-[version].AppImage

# 3. Run the application
./Prompt-Optimizer-[version].AppImage

# 4. Optional: Integrate into system menu
# Installing AppImageLauncher will handle integration automatically
sudo apt install appimagelauncher
```

#### Archive Version

```bash
# 1. Download and extract
wget https://github.com/linshenkx/prompt-optimizer/releases/latest/download/Prompt-Optimizer-[version]-linux.zip
unzip Prompt-Optimizer-[version]-linux.zip

# 2. Enter the directory
cd Prompt-Optimizer-[version]-linux

# 3. Run the application
./prompt-optimizer
```

#### Dependency Installation

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0

# CentOS/RHEL
sudo yum install gtk3 libnotify nss libXScrnSaver libXtst xdg-utils at-spi2-atk

# Arch Linux
sudo pacman -S gtk3 libnotify nss libxss libxtst xdg-utils at-spi2-atk
```

## ⚙️ Feature Highlights

### Complete Feature Support

The desktop version supports all web version features:

- **Basic Optimization** - Complete prompt optimization capabilities
- **Advanced Variable Management** - Complex variable system and context management
- **Function Calling** - Full Function Calling support
- **Multi-turn Conversation Testing** - Complex dialogue scenario simulation
- **Complete Model Management** - Unlimited model configuration

### Desktop-Exclusive Features

#### Unrestricted API Access

```javascript
// Supports any API endpoint, no CORS limitations
API Base URL: http://localhost:11434/v1  // Ollama
API Base URL: https://internal-api.company.com/v1  // Enterprise intranet
API Base URL: http://192.168.1.100:1234/v1  // LAN service
```

#### Perfect Local Model Integration

**Ollama Configuration Example**:

```javascript
Model Provider: Custom
API Base URL: http://localhost:11434/v1
Model Name: qwen2.5:7b
API Key: dummy_key (any value, Ollama doesn't require it)
```

**LM Studio Configuration**:

```javascript
API Base URL: http://localhost:1234/v1
Model Name: Fill in according to the model loaded in LM Studio
API Key: lm-studio (or any value)
```

**Xinference Configuration**:

```javascript
API Base URL: http://localhost:9997/v1
Model Name: The specific model name deployed
API Key: Fill in according to Xinference configuration
```

## 🛠️ Configuration and Usage

### Initial Configuration Guide

#### 1. Model Configuration

```bash
Launch application -> Settings -> Model Management
1. Click "Add Model"
2. Select model provider (OpenAI, Gemini, etc.)
3. Enter API key
4. Click "Test Connection" to verify
5. Save configuration
```

#### 2. Interface Personalization

- **Theme Settings**: Light mode, dark mode, follow system
- **Font Adjustment**: Font size, font family selection
- **Language Settings**: Chinese/English interface switching
- **Layout Configuration**: Sidebar position, panel size

#### 3. Advanced Settings

- **Network Proxy**: HTTP/HTTPS proxy configuration
- **Auto Update**: Enable/disable automatic update checking
- **Data Storage**: Local data storage location
- **Performance Options**: GPU acceleration, memory usage limits

### Data Management

#### Data Storage Location

```bash
Windows: %APPDATA%\prompt-optimizer\
# Example path: C:\Users\Username\AppData\Roaming\prompt-optimizer\

macOS: ~/Library/Application Support/prompt-optimizer/
# Example path: /Users/Username/Library/Application Support/prompt-optimizer/

Linux: ~/.config/prompt-optimizer/
# Example path: /home/Username/.config/prompt-optimizer/
```

## 🔄 Automatic Updates

### Update Check Mechanism

The desktop version has a smart update system (installer versions only):

#### Automatic Checks

- **Startup Check** - Checks for new version on each launch
- **Periodic Check** - Background check every 24 hours
- **Manual Check** - Can manually check for updates in settings

### Update Flow

#### 1. Detection Phase

```bash
# Application checks GitHub Releases API
Check URL: https://api.github.com/repos/linshenkx/prompt-optimizer/releases/latest
Current version: v1.2.0
Latest version: v1.3.0
Status: New version found
```

#### 2. Download Phase

- Downloads update package to temp directory in background
- Shows download progress and speed
- Supports resume and retry mechanism
- Verifies download file integrity and signature

#### 3. Installation Phase

- **Windows**: Runs new installer for upgrade, auto-restarts
- **macOS**: Replaces app bundle in Applications, restarts
- **Linux**: Replaces AppImage file, restarts

## 🔧 Troubleshooting

### Windows Common Issues

#### Application Startup Problems

**Problem: Application won't start**

```bash
# Solution 1: Check runtime libraries
Download and install: Microsoft Visual C++ Redistributable
Link: https://aka.ms/vs/17/release/vc_redist.x64.exe

# Solution 2: Run as administrator
Right-click app icon -> "Run as administrator"

# Solution 3: Check antivirus software
Add Prompt Optimizer to antivirus whitelist
```

### macOS Common Issues

#### Security and Permission Issues

**Problem: "Cannot be opened because it is from an unidentified developer"**

```bash
# Solution 1: Temporary allow
Hold Control key and click app -> Open -> Open

# Solution 2: System settings allow
System Preferences -> Security & Privacy -> General -> "Open Anyway"

# Solution 3: Command line allow (advanced)
sudo spctl --master-disable  # Temporarily disable Gatekeeper
# Remember to re-enable after use
sudo spctl --master-enable
```

### Linux Common Issues

#### AppImage Running Problems

**Problem: AppImage won't run**

```bash
# Install FUSE support
sudo apt install fuse libfuse2  # Ubuntu/Debian
sudo yum install fuse           # CentOS/RHEL
sudo pacman -S fuse2           # Arch Linux

# Add execute permission
chmod +x Prompt-Optimizer-*.AppImage

# Run in terminal to see detailed errors
./Prompt-Optimizer-*.AppImage --verbose
```

---

**Related Links**:

- [Chrome Extension](extension.md) - Browser extension usage guide
- [Troubleshooting](../help/troubleshooting.md) - More problem solutions
