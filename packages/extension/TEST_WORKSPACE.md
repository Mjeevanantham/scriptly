# Test Workspace Setup Guide

## Quick Setup for Testing

### 1. Create a Test Workspace

When you launch the Extension Development Host (F5), create or open a folder with test files:

```
test-workspace/
├── test.js          # JavaScript test file
├── test.ts          # TypeScript test file  
├── test.py          # Python test file
└── package.json     # Optional: for Node.js projects
```

### 2. Test Files Location

The test files have been created in `packages/extension/`:
- `test.js` - JavaScript test file
- `test.ts` - TypeScript test file
- `test.py` - Python test file

**You can:**
- Copy these files to a test workspace folder
- Or test directly in the extension folder

### 3. Recommended Test Workflow

1. **Press F5** to launch Extension Development Host
2. **In the Extension Host window:**
   - File > Open Folder
   - Navigate to `packages/extension` folder
   - Open `test.js` or `test.ts`
3. **Test Features:**
   - Place cursor at `[CURSOR HERE]` markers
   - Press `Tab` to test code completion
   - Press `Ctrl+Shift+L` to open chat
   - Select code and ask questions

### 4. What to Test

#### Code Completion (Tab Feature)
- Place cursor after function declarations
- Place cursor inside functions
- Press `Tab` key
- **Expected:** AI suggests next lines of code

#### Chat Panel
- Press `Ctrl+Shift+L`
- Type questions like:
  - "How can I optimize this function?"
  - "What does this code do?"
  - "How do I refactor this?"
- Select code and ask about it

#### API Configuration
- Command Palette → "Scriptly: Configure API Keys"
- Test with OpenAI, Claude, or Ollama
- Verify key is stored securely

#### Git Integration
- Command Palette → "Scriptly: Clone Repository"
- Test cloning a repository

---

## Copy Test Files to New Workspace

If you want to test in a separate folder:

```bash
# Create test workspace
mkdir test-workspace
cd test-workspace

# Copy test files
cp ../packages/extension/test.* .

# Open in Extension Development Host
code .
```

---

## Test Scenarios

### Scenario 1: Basic Completion
1. Open `test.js`
2. Go to line with `function processData(data) {`
3. Place cursor at `[CURSOR HERE]` comment
4. Press `Tab`
5. **Expected:** AI suggests implementation

### Scenario 2: Chat with Code Context
1. Select the `inefficientFunction` code block
2. Press `Ctrl+Shift+L` to open chat
3. Type: "How can I optimize this function?"
4. **Expected:** AI explains optimization strategies

### Scenario 3: Multi-file Context
1. Open multiple files (`test.js`, `test.ts`)
2. Ask chat: "How do these functions relate?"
3. **Expected:** AI understands context across files

### Scenario 4: TypeScript Type Awareness
1. Open `test.ts`
2. Place cursor in `getUserById` function
3. Press `Tab`
4. **Expected:** Completion respects TypeScript types

---

## Troubleshooting

### No completion appearing
- Check if API key is configured
- Verify extension is activated (check Debug Console)
- Ensure cursor is in a valid code position

### Chat not responding
- Verify API key is valid
- Check network connectivity
- Look at Debug Console for errors

### Extension not activating
- Check Debug Console in original VS Code window
- Verify `out/extension.js` exists
- Ensure VS Code version is >= 1.80.0

