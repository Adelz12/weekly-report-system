# Troubleshooting: Cannot Edit Files in Cursor

## Quick Fixes to Try:

### 1. Check Workspace Trust
- Press `Ctrl+Shift+P`
- Type "Manage Workspace Trust"
- Select "Manage Workspace Trust"
- Choose "Trust" or "Don't Prompt"

### 2. Check if Files are in Diff/Compare View
- Look at the file tab - if you see "Compare" or "Diff" in the title, close it
- Open the file normally from the file explorer

### 3. Disable Extensions Temporarily
- Press `Ctrl+Shift+P`
- Type "Disable All Installed Extensions"
- Try editing again
- If it works, re-enable extensions one by one to find the culprit

### 4. Check Keyboard Shortcuts
- Press `Ctrl+K Ctrl+S` to open keyboard shortcuts
- Search for "readonly" or "toggle read-only"
- Make sure no shortcut is accidentally toggling read-only mode

### 5. Check File Tab Context Menu
- Right-click on the file tab
- Look for "Read-only" option
- If it's checked, uncheck it

### 6. Try Command Palette Commands
- Press `Ctrl+Shift+P`
- Type "Toggle Read-only" and see if it's enabled
- If so, disable it

### 7. Reset Cursor Settings
- Close Cursor
- Backup: `cp ~/.config/Cursor/User/settings.json ~/.config/Cursor/User/settings.json.backup`
- Delete: `rm ~/.config/Cursor/User/settings.json`
- Restart Cursor (it will create a new default settings file)

### 8. Check if Running in Restricted Mode
- Look at the bottom-right corner of Cursor
- If you see "Restricted Mode" or a shield icon, click it and disable it

### 9. Try Opening File from Terminal
- Open terminal in Cursor
- Run: `cursor .github/workflows/docker.yml`
- See if you can edit it

### 10. Check Cursor Version
- Help → About
- Make sure you're running a recent version
- Consider updating if outdated

## If Nothing Works:

1. **Completely Reset Cursor:**
   ```bash
   # Close Cursor first!
   rm -rf ~/.config/Cursor/User/workspaceStorage
   rm -rf ~/.config/Cursor/User/History
   ```

2. **Reinstall Cursor:**
   - Uninstall Cursor
   - Delete `~/.config/Cursor` directory
   - Reinstall Cursor

3. **Check System Logs:**
   ```bash
   journalctl --user -u cursor -n 50
   ```

## Test if Files are Actually Editable:

Run this command to test:
```bash
echo "# Test edit" >> .github/workflows/docker.yml
```

If this works, the issue is definitely in Cursor, not the file system.






