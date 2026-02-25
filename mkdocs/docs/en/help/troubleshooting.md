# Troubleshooting Guide

Common issues and their solutions.

## Connection Issues

### Cannot connect to AI API

**Symptoms**: "Connection failed" or "Network error" messages

**Solutions**:

1. Check your internet connection
2. Verify API key is correct and active
3. Check if API service is operational (check provider status page)
4. Try a different AI model/provider

### CORS errors in browser

**Symptoms**: "CORS policy" errors in console

**Solutions**:

1. **Desktop App** - Use the desktop version (recommended)
2. **Chrome Extension** - Install the browser extension
3. **Self-hosted** - Deploy via Docker or Vercel

### API timeout errors

**Symptoms**: "Request timeout" or long waiting times

**Solutions**:

1. Reduce prompt length
2. Check API provider status
3. Try a different model
4. Check your network speed

## Interface Issues

### Page not loading

**Symptoms**: Blank page or loading spinner

**Solutions**:

1. Refresh the page (Ctrl+R / Cmd+R)
2. Clear browser cache
3. Disable browser extensions temporarily
4. Try a different browser

### Buttons not responding

**Symptoms**: Clicks have no effect

**Solutions**:

1. Check browser console for errors (F12)
2. Refresh the page
3. Clear browser cache
4. Ensure JavaScript is enabled

### Display issues

**Symptoms**: Layout broken, overlapping elements

**Solutions**:

1. Reset browser zoom to 100% (Ctrl+0)
2. Clear browser cache
3. Try a different browser
4. Check for browser updates

## Optimization Issues

### Optimization fails

**Symptoms**: Error during optimization process

**Solutions**:

1. Check API key validity
2. Verify API quota isn't exceeded
3. Simplify the input prompt
4. Try a different optimization template
5. Try a different AI model

### Poor quality results

**Symptoms**: Optimized prompts don't meet expectations

**Solutions**:

1. Provide more context in original prompt
2. Choose a more specific template
3. Use iterative optimization
4. Try a more capable AI model
5. Experiment with different optimization modes

### Slow optimization

**Symptoms**: Long wait times for results

**Solutions**:

1. Use a faster model (if available)
2. Reduce prompt complexity
3. Check network connection
4. Avoid peak usage times

## Data Issues

### History not saving

**Symptoms**: Previous optimizations missing

**Solutions**:

1. Check if browser allows local storage
2. Clear old data to free space
3. Check if in private/incognito mode
4. Try a different browser

### Data export fails

**Symptoms**: Export button doesn't work

**Solutions**:

1. Check browser download permissions
2. Clear browser cache
3. Try a different browser
4. Check available disk space

### Data import fails

**Symptoms**: Import doesn't restore data

**Solutions**:

1. Verify JSON file format is correct
2. Check file isn't corrupted
3. Ensure file is from a compatible version
4. Try importing in smaller batches

## Performance Issues

### High memory usage

**Symptoms**: Browser becomes slow

**Solutions**:

1. Close other browser tabs
2. Clear history and cache
3. Restart browser
4. Use desktop app for better performance

### Slow interface

**Symptoms**: UI lag or stuttering

**Solutions**:

1. Close unnecessary tabs
2. Clear browser cache
3. Disable unused browser extensions
4. Check system resources

## Desktop App Issues

### macOS "app is damaged" error

**Solution**:

```bash
xattr -rd com.apple.quarantine /Applications/PromptOptimizer.app
```

### App won't start

**Solutions**:

1. Reinstall the application
2. Check for antivirus interference
3. Run as administrator (Windows)
4. Check system requirements

### Auto-update not working

**Solutions**:

1. Check internet connection
2. Download latest version manually
3. Reinstall using installer (not zip)

## Still Having Issues?

If these solutions don't help:

1. [Contact Support](support.md)
2. [Report a Bug](https://github.com/linshenkx/prompt-optimizer/issues)
3. Check [Connection Issues](connection-issues.md) for detailed network troubleshooting
