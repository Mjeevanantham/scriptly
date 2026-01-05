# Scriptly Extension - Flow Diagrams & Mind Maps

This document provides comprehensive flow diagrams for all major flows in the Scriptly VS Code Extension.

---

## 1. Extension Activation Flow

```
VS Code Starts
    │
    ├─→ Extension Activates (extension.ts)
    │   │
    │   ├─→ Logger.initialize()
    │   │   └─→ Creates log file & output channel
    │   │
    │   ├─→ ConfigService.init()
    │   │   └─→ Creates encryption key
    │   │   └─→ Sets up VS Code secrets storage
    │   │
    │   ├─→ LLMService.init(ConfigService)
    │   │   └─→ Links to ConfigService
    │   │   └─→ Model = null (lazy initialization)
    │   │
    │   ├─→ MainViewProvider.init()
    │   │   ├─→ Registers webview view provider
    │   │   └─→ View Type: 'scriptly.chatView'
    │   │
    │   ├─→ ChatViewProvider.init() [Legacy/Backward Compat]
    │   │   └─→ Links to LLMService
    │   │
    │   ├─→ Register Commands
    │   │   ├─→ scriptly.startChat
    │   │   ├─→ scriptly.configureAPI
    │   │   ├─→ scriptly.gitClone
    │   │   ├─→ scriptly.chatView.refresh
    │   │   └─→ scriptly.showLogs
    │   │
    │   └─→ Check API Key
    │       ├─→ If NO API Key
    │       │   └─→ Show notification: "Configure API key"
    │       │       └─→ User clicks "Configure"
    │       │           └─→ Execute: scriptly.configureAPI
    │       │
    │       └─→ If API Key EXISTS
    │           └─→ Extension ready ✓
    │
    └─→ Extension Activated ✓
```

---

## 2. API Configuration Flow

```
User Triggers: Ctrl+Shift+P → "Configure API Keys"
    │
    ├─→ configureAPI() command executes
    │   │
    │   ├─→ Show QuickPick: Select Provider
    │   │   ├─→ OpenAI
    │   │   ├─→ Anthropic Claude
    │   │   ├─→ Ollama (Local)
    │   │   └─→ Custom Endpoint
    │   │
    │   ├─→ If NOT Ollama:
    │   │   └─→ Show InputBox (password mode)
    │   │       └─→ User enters API key
    │   │
    │   ├─→ Show Progress Indicator
    │   │   │
    │   │   ├─→ Progress: "Saving API key..."
    │   │   │   └─→ ConfigService.setApiKey()
    │   │   │       ├─→ Encrypt API key (AES-256-GCM)
    │   │   │       ├─→ Store in VS Code secrets
    │   │   │       ├─→ Update workspace config (llmProvider)
    │   │   │       └─→ Verify storage
    │   │   │
    │   │   ├─→ Progress: "Validating API key..."
    │   │   │   └─→ ConfigService.validateApiKey()
    │   │   │       │
    │   │   │       ├─→ If OpenAI:
    │   │   │       │   └─→ GET https://api.openai.com/v1/models
    │   │   │       │
    │   │   │       ├─→ If Claude:
    │   │   │       │   └─→ POST https://api.anthropic.com/v1/messages
    │   │   │       │
    │   │   │       ├─→ If Ollama:
    │   │   │       │   └─→ Skip validation (no API key)
    │   │   │       │
    │   │   │       └─→ If Custom:
    │   │   │           └─→ Check key exists (no network call)
    │   │   │
    │   │   └─→ Progress: "Validated successfully!"
    │   │
    │   ├─→ If Validation SUCCESS:
    │   │   ├─→ Show success message
    │   │   ├─→ Wait 500ms (ensure persistence)
    │   │   └─→ Execute: scriptly.chatView.refresh
    │   │       └─→ Refresh webview
    │   │
    │   └─→ If Validation FAILS:
    │       ├─→ Show error message
    │       └─→ Option to "View Logs"
    │
    └─→ Configuration Complete ✓
```

---

## 3. Chat Flow (MainViewProvider)

```
User Opens Chat Panel (Activity Bar → Scriptly)
    │
    ├─→ MainViewProvider.resolveWebviewView()
    │   │
    │   ├─→ Check API Key Configuration
    │   │   └─→ _checkApiKeyConfigured()
    │   │       ├─→ Get LLM config from ConfigService
    │   │       ├─→ Check if API key exists
    │   │       └─→ If Ollama: return true (no key needed)
    │   │
    │   ├─→ Get Workspace Path
    │   │
    │   ├─→ Generate Webview HTML
    │   │   └─→ Inject React app (App.tsx)
    │   │   └─→ Set hasApiKey flag
    │   │
    │   └─→ Register Message Handler
    │       └─→ onDidReceiveMessage()
    │
    ├─→ User Types Message & Clicks Send
    │   │
    │   └─→ Webview sends: { command: 'sendMessage', text: "..." }
    │
    ├─→ MainViewProvider._handleMessage()
    │   │
    │   ├─→ Validate Services
    │   │   ├─→ Check LLMService exists
    │   │   └─→ Check ConfigService exists
    │   │
    │   ├─→ Get API Key (with verification)
    │   │   ├─→ ConfigService.getLLMConfig()
    │   │   ├─→ Double-check API key exists
    │   │   └─→ If missing: Show error + Configure button
    │   │
    │   ├─→ Build Context
    │   │   ├─→ Get Workspace Context
    │   │   │   └─→ _getCodebaseContext()
    │   │   │       ├─→ Scan workspace files
    │   │   │       ├─→ Filter code files (.ts, .js, .py, etc.)
    │   │   │       ├─→ Ignore: node_modules, .git, dist, build
    │   │   │       ├─→ Prioritize: package.json, tsconfig.json, src/
    │   │   │       ├─→ Limit: 20 files, 15k chars total
    │   │   │       └─→ Build context string
    │   │   │
    │   │   └─→ Get Current File Context (if editor open)
    │   │
    │   ├─→ Create ChatRequest
    │   │   ├─→ message: user text
    │   │   ├─→ fileContext: workspace + current file
    │   │   ├─→ selectedCode: (if selection exists)
    │   │   └─→ conversationId: default
    │   │
    │   └─→ Stream Response
    │       └─→ LLMService.streamChatResponse(request)
    │           │
    │           ├─→ Build Prompt
    │           │   ├─→ System prompt
    │           │   ├─→ Codebase context (truncated to 12k chars)
    │           │   ├─→ User message
    │           │   └─→ Selected code (truncated to 2k chars)
    │           │
    │           ├─→ Get/Create Model
    │           │   └─→ getModel() → createModel()
    │           │       ├─→ Get config from ConfigService
    │           │       ├─→ Get API key (decrypted)
    │           │       └─→ Create LangChain model
    │           │           ├─→ OpenAI: ChatOpenAI
    │           │           ├─→ Claude: ChatAnthropic
    │           │           ├─→ Ollama: ChatOllama
    │           │           └─→ Custom: ChatOpenAI (custom baseURL)
    │           │
    │           ├─→ Stream from Model
    │           │   └─→ model.stream([HumanMessage(prompt)])
    │           │
    │           └─→ For each chunk:
    │               ├─→ yield chunk.content
    │               └─→ Post to webview: { command: 'streamChunk', chunk }
    │
    ├─→ Webview Receives Chunks
    │   ├─→ Display chunks in real-time
    │   └─→ Update UI with streaming text
    │
    └─→ Stream Complete ✓
```

---

## 4. Code Review Flow

```
User Navigates to Code Review Page
    │
    ├─→ CodeReviewPage.tsx renders
    │   ├─→ Shows action buttons:
    │   │   ├─→ Find Bugs
    │   │   ├─→ Suggest Refactorings
    │   │   └─→ Generate Tests
    │   │
    │   └─→ User clicks action button
    │
    ├─→ Webview sends message:
    │   └─→ { command: 'codeReview', action: 'findBugs' | 'refactor' | 'generateTests' }
    │
    ├─→ MainViewProvider._handleMessage()
    │   │
    │   ├─→ Route to appropriate service:
    │   │   │
    │   │   ├─→ If 'findBugs':
    │   │   │   └─→ RefactorService.findBugs()
    │   │   │       ├─→ Get workspace context
    │   │   │       ├─→ Build prompt: "Find bugs in codebase"
    │   │   │       ├─→ Call LLMService
    │   │   │       └─→ Stream response
    │   │   │
    │   │   ├─→ If 'refactor':
    │   │   │   └─→ RefactorService.suggestRefactorings()
    │   │   │       ├─→ Get workspace context
    │   │   │       ├─→ Build prompt: "Suggest refactorings"
    │   │   │       ├─→ Call LLMService
    │   │   │       └─→ Stream response
    │   │   │
    │   │   └─→ If 'generateTests':
    │   │       └─→ TestService.generateTests()
    │   │           ├─→ Get workspace context
    │   │           ├─→ Build prompt: "Generate test cases"
    │   │           ├─→ Call LLMService
    │   │           └─→ Stream response
    │   │
    │   └─→ Stream response to webview
    │
    ├─→ Webview displays results
    │   ├─→ Format as markdown
    │   ├─→ Highlight code blocks
    │   └─→ Show actionable suggestions
    │
    └─→ User reviews suggestions ✓
```

---

## 5. Research Flow

```
User Navigates to Research Page
    │
    ├─→ ResearchPage.tsx renders
    │   ├─→ Shows search input
    │   └─→ User enters query
    │
    ├─→ Webview sends message:
    │   └─→ { command: 'research', query: "..." }
    │
    ├─→ MainViewProvider._handleMessage()
    │   │
    │   ├─→ SearchService.search()
    │   │   │
    │   │   ├─→ Option 1: Semantic Search (if CodeIndexer available)
    │   │   │   ├─→ CodeIndexer.searchByContent(query)
    │   │   │   ├─→ Find matching code chunks
    │   │   │   └─→ Return top 10 results
    │   │   │
    │   │   └─→ Option 2: LLM-Powered Search
    │   │       ├─→ Get codebase context
    │   │       ├─→ Build prompt: "Search for: {query}"
    │   │       ├─→ Call LLMService
    │   │       └─→ Stream response
    │   │
    │   └─→ Stream results to webview
    │
    ├─→ Webview displays results
    │   ├─→ Show matching files/chunks
    │   ├─→ Highlight matches
    │   └─→ Allow user to open files
    │
    └─→ User explores results ✓
```

---

## 6. Settings Flow

```
User Navigates to Settings Page
    │
    ├─→ SettingsPage.tsx renders
    │   ├─→ Shows current configuration:
    │   │   ├─→ LLM Provider (dropdown)
    │   │   ├─→ Model Name (input)
    │   │   ├─→ Temperature (slider)
    │   │   └─→ API Key Status (button to configure)
    │   │
    │   └─→ User makes changes
    │
    ├─→ Webview sends message:
    │   └─→ { command: 'updateSettings', settings: { ... } }
    │
    ├─→ MainViewProvider._handleMessage()
    │   │
    │   ├─→ Update VS Code Configuration
    │   │   ├─→ workspace.getConfiguration('scriptly')
    │   │   ├─→ config.update('llmProvider', value)
    │   │   ├─→ config.update('modelName', value)
    │   │   └─→ config.update('temperature', value)
    │   │
    │   ├─→ If Provider Changed:
    │   │   ├─→ LLMService.invalidateModel()
    │   │   └─→ Clear model cache
    │   │
    │   ├─→ If API Key Configuration:
    │   │   └─→ Execute: scriptly.configureAPI
    │   │
    │   └─→ Send confirmation to webview
    │
    ├─→ Webview updates UI
    │   └─→ Shows "Settings saved" message
    │
    └─→ Settings Updated ✓
```

---

## 7. Git Clone Flow

```
User Triggers: Ctrl+Shift+P → "Clone Repository"
    │
    ├─→ gitClone() command executes
    │   │
    │   ├─→ Show InputBox: "Enter Git repository URL"
    │   │   └─→ User enters URL (e.g., https://github.com/user/repo.git)
    │   │
    │   ├─→ Validate Workspace
    │   │   └─→ Check workspace folder exists
    │   │
    │   ├─→ Extract Repository Name
    │   │   └─→ From URL: repo.git → repo
    │   │
    │   ├─→ Show Progress Indicator
    │   │   │
    │   │   └─→ Progress: "Cloning repository..."
    │   │       └─→ git.clone() [isomorphic-git]
    │   │           ├─→ fs: Node.js file system
    │   │           ├─→ http: Node.js HTTP client
    │   │           ├─→ dir: targetPath (workspace/repo)
    │   │           └─→ url: repository URL
    │   │
    │   ├─→ Progress: "Clone complete!"
    │   │
    │   ├─→ Show Success Message
    │   │
    │   └─→ Open Cloned Folder
    │       └─→ vscode.commands.executeCommand('vscode.openFolder', targetUri)
    │
    └─→ Repository Cloned & Opened ✓
```

---

## 8. LLM Service Flow

```
LLMService Method Called
    │
    ├─→ getModel() [Lazy Initialization]
    │   │
    │   ├─→ If currentModel exists:
    │   │   └─→ Return cached model
    │   │
    │   └─→ If currentModel is null:
    │       ├─→ Get config from ConfigService
    │       │   └─→ ConfigService.getLLMConfig()
    │       │       ├─→ Read workspace config
    │       │       ├─→ Get provider, modelName, temperature
    │       │       └─→ Decrypt API key from secrets
    │       │
    │       └─→ createModel(config)
    │           │
    │           ├─→ Switch on provider:
    │           │   │
    │           │   ├─→ Case 'openai':
    │           │   │   ├─→ Validate API key exists
    │           │   │   ├─→ new ChatOpenAI({ openAIApiKey, modelName, temperature })
    │           │   │   └─→ Set process.env.OPENAI_API_KEY (fallback)
    │           │   │
    │           │   ├─→ Case 'claude':
    │           │   │   ├─→ Validate API key exists
    │           │   │   └─→ new ChatAnthropic({ apiKey, modelName, temperature })
    │           │   │
    │           │   ├─→ Case 'ollama':
    │           │   │   └─→ new ChatOllama({ baseUrl, model, temperature })
    │           │   │
    │           │   └─→ Case 'custom':
    │           │       ├─→ Validate baseURL & apiKey
    │           │       └─→ new ChatOpenAI({ configuration: { baseURL }, ... })
    │           │
    │           └─→ Cache model in currentModel
    │
    ├─→ Generate Completion (Tab Feature)
    │   │
    │   ├─→ Check cache (cacheKey from code + position)
    │   │   └─→ If cached: return cached result
    │   │
    │   ├─→ Build completion prompt
    │   │   └─→ "Predict the next lines of code..."
    │   │
    │   ├─→ Get model (lazy init)
    │   │
    │   ├─→ model.invoke([HumanMessage(prompt)])
    │   │
    │   └─→ Cache & return result
    │
    ├─→ Stream Chat Response
    │   │
    │   ├─→ Build chat prompt
    │   │   ├─→ System prompt
    │   │   ├─→ Codebase context (truncated)
    │   │   ├─→ User message
    │   │   └─→ Selected code (if any)
    │   │
    │   ├─→ Get model (lazy init)
    │   │
    │   └─→ model.stream([HumanMessage(prompt)])
    │       └─→ Yield chunks as they arrive
    │
    └─→ Invalidate Model (on config change)
        ├─→ Clear currentModel cache
        └─→ Clear completion cache
```

---

## 9. Code Indexing Flow

```
CodeIndexer.indexWorkspace(workspacePath)
    │
    ├─→ getAllCodeFiles(workspacePath)
    │   │
    │   ├─→ Walk directory tree
    │   │   ├─→ Skip: node_modules, .git, dist, build, out
    │   │   ├─→ Filter: .ts, .tsx, .js, .jsx, .py, .java, .go, .rs, .sql
    │   │   └─→ Return array of file paths
    │   │
    │   └─→ Return files[]
    │
    ├─→ For each file:
    │   │
    │   └─→ indexFile(filePath)
    │       │
    │       ├─→ Read file content
    │       │
    │       ├─→ Compute hash (SHA-256)
    │       │
    │       ├─→ Check if file changed
    │       │   ├─→ Compare hash with fileHashes map
    │       │   └─→ If same hash: skip (unchanged)
    │       │
    │       ├─→ chunkFile(filePath, content)
    │       │   ├─→ Split file into logical chunks
    │       │   ├─→ Each chunk: { filePath, startLine, endLine, content }
    │       │   └─→ Store in chunks map: chunks.set(filePath, chunks[])
    │       │
    │       └─→ Update fileHashes map
    │
    ├─→ Indexing Complete
    │   └─→ chunks map contains all indexed code
    │
    └─→ Search Operations:
        │
        ├─→ searchByContent(query)
        │   ├─→ Iterate all chunks
        │   ├─→ Filter: content.includes(query)
        │   └─→ Return top 10 matches
        │
        └─→ getContextByFile(filePath, lineNumber)
            ├─→ Get chunks for file
            ├─→ Filter chunks around lineNumber
            └─→ Return context chunks
```

---

## 10. MainViewProvider - Complete Message Handling Flow

```
Webview sends message → MainViewProvider._handleMessage()
    │
    ├─→ Case 'ready'
    │   ├─→ Check API key
    │   └─→ Send: { command: 'setAuth', isAuthenticated: boolean }
    │
    ├─→ Case 'sendMessage'
    │   ├─→ Validate services (LLMService, ConfigService)
    │   ├─→ Check API key configured
    │   ├─→ Get codebase context
    │   ├─→ Build ChatRequest
    │   ├─→ Stream LLM response
    │   └─→ Post chunks to webview
    │
    ├─→ Case 'codeReview'
    │   ├─→ Route to RefactorService or TestService
    │   ├─→ Build specialized prompt
    │   ├─→ Stream response
    │   └─→ Post results to webview
    │
    ├─→ Case 'research'
    │   ├─→ Use SearchService or CodeIndexer
    │   ├─→ Search codebase
    │   └─→ Post results to webview
    │
    ├─→ Case 'updateSettings'
    │   ├─→ Update VS Code configuration
    │   ├─→ Invalidate model if provider changed
    │   └─→ Send confirmation
    │
    ├─→ Case 'configureAPI'
    │   └─→ Execute: scriptly.configureAPI command
    │
    ├─→ Case 'clearStorage'
    │   ├─→ Delete all API keys from secrets
    │   ├─→ Reset configuration
    │   └─→ Refresh webview
    │
    ├─→ Case 'navigate'
    │   └─→ Update page state (Chat, Code Review, Research, etc.)
    │
    ├─→ Case 'openFile'
    │   └─→ VSCodeActions.openFile(path, line, column)
    │
    ├─→ Case 'error'
    │   └─→ Log error from webview
    │
    └─→ Default
        └─→ Log unknown command
```

---

## 11. Webview → Extension Communication Pattern

```
Webview (React App)
    │
    ├─→ Uses: vscode.postMessage({ command, ...data })
    │
    └─→ Receives: window.addEventListener('message', handler)
        │
        ├─→ Commands FROM webview:
        │   ├─→ ready
        │   ├─→ sendMessage
        │   ├─→ codeReview
        │   ├─→ research
        │   ├─→ updateSettings
        │   ├─→ configureAPI
        │   ├─→ navigate
        │   ├─→ openFile
        │   └─→ clearStorage
        │
        └─→ Commands TO webview:
            ├─→ setAuth
            ├─→ streamChunk
            ├─→ streamComplete
            ├─→ error
            ├─→ refresh
            └─→ updatePage
```

---

## 12. Configuration & Secrets Management Flow

```
ConfigService Methods
    │
    ├─→ setApiKey(provider, apiKey)
    │   │
    │   ├─→ Encrypt API Key
    │   │   ├─→ Generate IV (16 random bytes)
    │   │   ├─→ Create cipher (AES-256-GCM)
    │   │   ├─→ Encrypt: cipher.update() + cipher.final()
    │   │   ├─→ Get auth tag
    │   │   └─→ Format: "IV:authTag:encrypted"
    │   │
    │   ├─→ Store in VS Code Secrets
    │   │   └─→ context.secrets.store(keyName, encrypted)
    │   │
    │   ├─→ Update Workspace Config
    │   │   └─→ config.update('llmProvider', provider)
    │   │
    │   └─→ Verify storage
    │
    ├─→ getApiKey(provider)
    │   │
    │   ├─→ Retrieve from VS Code Secrets
    │   │   └─→ context.secrets.get(keyName)
    │   │
    │   ├─→ Decrypt API Key
    │   │   ├─→ Split: [IV, authTag, encrypted]
    │   │   ├─→ Create decipher (AES-256-GCM)
    │   │   ├─→ Set auth tag
    │   │   ├─→ Decrypt: decipher.update() + decipher.final()
    │   │   └─→ Return plaintext
    │   │
    │   └─→ Return decrypted API key
    │
    ├─→ getLLMConfig()
    │   │
    │   ├─→ Read workspace config
    │   │   ├─→ provider (default: 'openai')
    │   │   ├─→ modelName (default: 'gpt-4')
    │   │   └─→ temperature (default: 0.3)
    │   │
    │   ├─→ Get API key for provider
    │   │   └─→ getApiKey(provider)
    │   │
    │   ├─→ If no API key:
    │   │   └─→ Try alternative providers
    │   │
    │   └─→ Return LLMConfig object
    │
    └─→ validateApiKey(provider)
        │
        ├─→ Get API key
        │
        ├─→ Make test API call:
        │   ├─→ OpenAI: GET /v1/models
        │   ├─→ Claude: POST /v1/messages (minimal)
        │   ├─→ Ollama: Skip (no key needed)
        │   └─→ Custom: Check key exists
        │
        └─→ Return validation result (boolean)
```

---

## Summary: Key Components & Their Relationships

```
Extension Context
    │
    ├─→ ConfigService
    │   ├─→ Manages API keys (encrypted storage)
    │   ├─→ Manages workspace configuration
    │   └─→ Validates API keys
    │
    ├─→ LLMService
    │   ├─→ Depends on: ConfigService
    │   ├─→ Creates/manages LangChain models
    │   ├─→ Generates completions (Tab feature)
    │   └─→ Streams chat responses
    │
    ├─→ CodeIndexer (optional)
    │   ├─→ Indexes workspace code
    │   └─→ Provides semantic search
    │
    ├─→ RefactorService
    │   ├─→ Depends on: LLMService
    │   └─→ Provides code review features
    │
    ├─→ TestService
    │   ├─→ Depends on: LLMService
    │   └─→ Generates test cases
    │
    ├─→ SearchService
    │   ├─→ Depends on: CodeIndexer, LLMService
    │   └─→ Provides research/search
    │
    ├─→ MainViewProvider
    │   ├─→ Depends on: ConfigService, LLMService
    │   ├─→ Manages webview UI
    │   └─→ Handles all user interactions
    │
    └─→ ChatViewProvider (legacy)
        ├─→ Depends on: LLMService
        └─→ Legacy chat interface (backward compat)
```

---

## Data Flow: User Message → LLM Response

```
1. User types message in webview
    │
2. Webview: vscode.postMessage({ command: 'sendMessage', text })
    │
3. Extension: MainViewProvider._handleMessage()
    │
4. Extension: Validate API key (ConfigService.getLLMConfig())
    │
5. Extension: Get codebase context (_getCodebaseContext())
    │
6. Extension: Build ChatRequest { message, fileContext, selectedCode }
    │
7. Extension: LLMService.streamChatResponse(request)
    │   │
    │   ├─→ Build prompt (system + context + message)
    │   ├─→ Get/create model (lazy init)
    │   └─→ model.stream([HumanMessage(prompt)])
    │
8. Extension: For each chunk → postMessage({ command: 'streamChunk', chunk })
    │
9. Webview: Receive chunks → Update UI in real-time
    │
10. User sees streaming response ✓
```

---

*Last Updated: Based on extension codebase analysis*
*File Structure: packages/extension/src/*

