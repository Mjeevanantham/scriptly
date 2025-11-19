# Testing the Scriptly VS Code Extension

## Method 1: Extension Development Host (Recommended)

This is the easiest way to test during development:

### Steps:

1. **Open the extension folder in VS Code:**
   ```bash
   cd packages/extension
   code .
   ```

2. **Press F5** or go to **Run > Start Debugging**

   This will:
   - Compile the extension (if needed)
   - Launch a new VS Code window with "[Extension Development Host]" in the title
   - Load your extension in this new window

3. **In the Extension Development Host window:**
   - Open a folder/workspace (File > Open Folder)
   - Open a code file (e.g., `test.js` or `test.ts`)
   - Test the extension features

### Testing Commands:

#### 1. Open Chat Panel
- **Keyboard:** Press `Ctrl+Shift+L` (or `Cmd+Shift+L` on Mac)
- **Command Palette:** Press `Ctrl+Shift+P` → type "Scriptly: Open Scriptly Chat"
- **Expected:** Chat panel should open on the right side

#### 2. Configure API Keys
- **Command Palette:** `Ctrl+Shift+P` → "Scriptly: Configure API Keys"
- **Expected:** Quick pick menu should appear to select provider (OpenAI, Claude, Ollama, Custom)
- **Test:** Select a provider and enter an API key

#### 3. Git Clone
- **Command Palette:** `Ctrl+Shift+P` → "Scriptly: Clone Repository"
- **Expected:** Input box to enter Git repository URL
- **Test:** Enter a repository URL like `https://github.com/microsoft/vscode`

### Testing Features:

#### Code Completion (Tab Feature)
1. Open a TypeScript/JavaScript file
2. Start typing code
3. Press `Tab` at the cursor position
4. **Expected:** AI completion should appear (requires API key configured)

#### Chat Functionality
1. Open chat panel (`Ctrl+Shift+L`)
2. Type a question about your code
3. **Expected:** AI response should stream in (requires API key configured)

#### Settings
1. Go to File > Preferences > Settings
2. Search for "Scriptly"
3. **Expected:** Settings for LLM provider, model name, temperature should appear

### Debug Console

In the original VS Code window (where you pressed F5), you'll see:
- Extension activation logs
- Console output from `console.log()` statements
- Error messages if something goes wrong

**To view:** Look at the Debug Console panel at the bottom

---

## Method 2: Package and Install Manually

If you want to test it as an installed extension:

### Steps:

1. **Build the extension:**
   ```bash
   cd packages/extension
   npm run build
   ```

2. **Package it:**
   ```bash
   npm run package
   ```
   This creates a `.vsix` file in the extension directory

3. **Install in VS Code:**
   - Open VS Code
   - Go to Extensions view (`Ctrl+Shift+X`)
   - Click "..." menu → "Install from VSIX..."
   - Select the `.vsix` file (e.g., `scriptly-0.1.0.vsix`)
   - Reload VS Code when prompted

4. **Test as installed extension:**
   - All commands should be available
   - Extension should activate when VS Code starts

---

## Method 3: Watch Mode (Auto-reload during development)

1. **Start watch mode:**
   ```bash
   cd packages/extension
   npm run watch
   ```
   This will automatically recompile on file changes

2. **Launch Extension Development Host** (F5)

3. **When you make changes:**
   - Save the TypeScript file
   - Watch mode recompiles automatically
   - Press `Ctrl+R` in the Extension Development Host window to reload

---

## Testing Checklist

- [ ] Extension activates without errors
- [ ] Commands appear in Command Palette
- [ ] Keyboard shortcut (`Ctrl+Shift+L`) works
- [ ] Chat panel opens and displays correctly
- [ ] API key configuration works
- [ ] Settings are saved and persisted
- [ ] Git clone command works
- [ ] Code completion appears (if API key configured)
- [ ] Chat messages send and receive (if API key configured)
- [ ] Error handling works (test with invalid API key)

---

## Troubleshooting

### Extension doesn't activate
- Check Debug Console for errors
- Verify `out/extension.js` exists
- Ensure VS Code version is >= 1.80.0

### Commands not appearing
- Check `package.json` has correct `contributes.commands`
- Reload Extension Development Host window (`Ctrl+R`)
- Check activation events in `package.json`

### API calls failing
- Verify API key is configured correctly
- Check network connectivity
- Look at Debug Console for error messages
- Test API key with a simple request outside VS Code

### TypeScript compilation errors
- Run `npm run build` to see all errors
- Check `tsconfig.json` settings
- Ensure all dependencies are installed

---

## Quick Start

```bash
# 1. Navigate to extension
cd packages/extension

# 2. Build it
npm run build

# 3. Open in VS Code
code .

# 4. Press F5 to launch Extension Development Host

# 5. Test features in the new window!
```

