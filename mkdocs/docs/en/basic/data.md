# Data Management (Import/Export/Privacy)

This guide covers Prompt Optimizer's data storage, backup, and privacy protection features.

## 💾 Data Storage

### Storage Locations

- **Web Version** - Data stored in browser's localStorage
- **Desktop Version** - Data stored in local file system
- **Chrome Extension** - Data stored in extension storage area

### Stored Content

- **Configuration Information** - Model settings, user preferences, etc.
- **History Records** - All optimization history and results
- **Custom Templates** - User-created optimization templates
- **Cache Data** - Temporary data and performance optimization cache

### Data Security

- **Local Storage** - All data is stored only on user devices
- **No Server Upload** - Data is not sent to any remote servers
- **Encrypted Protection** - Sensitive data is encrypted using browser encryption
- **API Key Protection** - API keys are separately encrypted and stored

## 📤 Data Export

### Export Features

1. **Complete Export**
   - Export all user data
   - Includes configuration, history, templates, etc.
   - Generate backup files in JSON format

2. **Selective Export**
   - Export only specific types of data
   - Select time range
   - Support multiple formats

### Export Operations

1. **Access Export Feature**
   - Enter settings page
   - Click "Data Management" tab
   - Find "Export Data" section

2. **Select Export Content**
   - ✅ Optimization history records
   - ✅ Custom templates
   - ✅ Model configuration (excluding API keys)
   - ✅ User preference settings

3. **Download Backup File**
   - Click "Export" button
   - Wait for data packaging to complete
   - Download the generated backup file

### Context Bundle Export (Linked with Context Editor)

- Export "context bundle" directly to file or clipboard from data management
- Export structure includes: `type/context-bundle`, `version`, `currentId`, `contexts[]`
- Single context can also be exported from "Context Editor → Export (Standard Format)" (includes messages/metadata.variables/tools)

## 📥 Data Import

### Import Features

1. **Restore from Backup**
   - Use previously exported backup files
   - Complete restoration of all data
   - Support incremental import

2. **Cross-Device Sync**
   - Sync data between different devices
   - Maintain configuration and history consistency
   - Support selective synchronization

### Import Operations

1. **Prepare Backup File**
   - Ensure backup file format is correct
   - Check file integrity
   - Backup current data (optional)

2. **Execute Import**
   - Click "Import Data" button
   - Select backup file
   - Choose import options

3. **Import Options**
   - **Replace Mode** - Completely replace existing data
   - **Merge Mode** - Merge with existing data
   - **Selective Import** - Import only specific types of data

### Context Bundle Import (Replace Mode)

- Support importing "context bundle" from file/clipboard, default replace mode
- Import statistics display: `imported/skipped/predefinedVariablesRemoved`
- Predefined variables (`currentPrompt/originalPrompt/lastOptimizedPrompt/iterateInput/userQuestion/conversationContext`) are removed and won't be saved as overrides

## 🧹 Data Cleaning

### Cleaning Options

1. **Clear History Records**
   - Delete all optimization history
   - Choose to keep favorited records
   - Free up storage space

2. **Reset User Settings**
   - Restore default configuration
   - Clear personalized settings
   - Keep API keys (optional)

3. **Delete Custom Templates**
   - Clear user-created templates
   - Restore built-in templates
   - Support selective deletion

### Cleaning Operations

1. **Access Cleaning Feature**
   - Enter data management section in settings page
   - Find "Data Cleaning" option

2. **Select Cleaning Scope**
   - Check data types to clean
   - Confirm cleaning scope and impact
   - Recommend exporting backup first

3. **Execute Cleaning**
   - Click "Start Cleaning"
   - Confirm cleaning operation
   - Wait for cleaning to complete

## 🔐 Privacy Protection

### Data Processing Principles

- **Minimized Collection** - Only collect necessary functional data
- **User Control** - Users have complete control over their data
- **Transparency** - Clear explanation of how data is used
- **Secure Transmission** - API calls use HTTPS encryption

### API Call Privacy

- **Direct Connection Mode** - Requests sent directly to AI providers
- **No Intermediate Servers** - Avoid data leakage risks
- **Temporary Processing** - API response content not permanently stored
- **User Control** - Complete user control over API keys

## 📋 Data Management Best Practices

### Regular Backups

1. **Backup Frequency**
   - Immediately backup important projects
   - Weekly backups for daily use
   - Daily backups for large amounts of data

2. **Backup Strategy**
   - Keep multiple backup versions
   - Use cloud storage or external devices
   - Periodically verify backup integrity

### Storage Optimization

1. **Regular Cleaning**
   - Delete unnecessary history records
   - Clear expired temporary data
   - Organize and archive important data

2. **Performance Maintenance**
   - Avoid storing too much data affecting performance
   - Regularly check storage space usage
   - Optimize data structure

---

**Related Links**:

- [Troubleshooting](../help/troubleshooting.md) - Resolve data-related issues
