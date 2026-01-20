---
name: Scriptly Extension Complete Rebuild
overview: Complete rebuild of Scriptly VS Code extension from scratch using vanilla HTML/CSS/JS, preserving all current features but with cleaner architecture and simpler implementation.
todos: []
---

# Scriptly Extension - Complete Rebuild Plan

## Project Scope & Requirements

### Business Requirements

**Product**: VS Code Extension for AI-powered code assistance

**Target Users**: Developers using VS Code, Cursor, Windsurf, Antigravity

**Value Proposition**: Unified AI coding assistant with multi-LLM support, code analysis, and intelligent features

### Core Features (All Must Be Rebuilt)

1. **AI Chat Interface** - Multi-LLM conversations with streaming responses
2. **Code Review** - Bug detection, refactoring suggestions, test generation
3. **Smart Research** - Semantic codebase search and documentation
4. **Settings Management** - API key configuration, provider selection
5. **Dashboard** - Overview and quick actions
6. **History** - Conversation and interaction history
7. **Profiles** - Multiple API key profiles
8. **Deployment** - Cloud deployment features (if implemented)

### Technical Requirements

- **UI Framework**: Vanilla HTML/CSS/JavaScript (no React)
- **Architecture**: Clean separation of concerns
- **LLM Support**: OpenAI, Claude, Ollama, Custom endpoints
- **IDE Compatibility**: VS Code, Cursor, Windsurf, Antigravity
- **Performance**: Fast startup, efficient memory usage
- **Error Handling**: Comprehensive error handling and recovery
- **Logging**: Structured logging for debugging

## Architecture Design

### High-Level Architecture

```
┌─────────────────────────────────────────┐
│         VS Code Extension Host          │
│  ┌───────────────────────────────────┐  │
│  │     Extension Entry Point         │  │
│  │       (extension.ts)              │  │
│  └──────────────┬────────────────────┘  │
│                 │                        │
│  ┌──────────────▼────────────────────┐  │
│  │     View Provider                 │  │
│  │  (MainViewProvider.ts)            │  │
│  │  - Webview management             │  │
│  │  - Message routing                │  │
│  └──────────────┬────────────────────┘  │
│                 │                        │
│  ┌──────────────▼────────────────────┐  │
│  │     Services Layer                │  │
│  │  - ConfigService                  │  │
│  │  - LLMService                     │  │
│  │  - CodeIndexer                    │  │
│  │  - SearchService                  │  │
│  │  - RefactorService                │  │
│  │  - TestService                    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │     Commands                      │  │
│  │  - configureAPI                   │  │
│  │  - gitClone                       │  │
│  │  - showLogs                       │  │
│  │  - clearStorage                   │  │
│  └───────────────────────────────────┘  │
└─────────────────┬───────────────────────┘
                  │
                  │ postMessage API
                  │
┌─────────────────▼───────────────────────┐
│         Webview (Browser Context)       │
│  ┌───────────────────────────────────┐  │
│  │     HTML/CSS/JS UI                │  │
│  │  - Dashboard                      │  │
│  │  - Chat Interface                 │  │
│  │  - Code Review                    │  │
│  │  - Research                       │  │
│  │  - Settings                       │  │
│  │  - History                        │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Communication Flow

```
Webview ──postMessage──> Extension Host
     <──postMessage──
     
Commands: sendMessage, configureAPI, navigate, etc.
Events: streamChunk, error, setAuth, etc.
```

## File Structure

```
packages/extension/
├── src/
│   ├── extension.ts                    # Entry point
│   ├── types/
│   │   └── index.ts                    # Type definitions
│   ├── services/
│   │   ├── ConfigService.ts            # API key management
│   │   ├── LLMService.ts               # LLM integration
│   │   ├── CodeIndexer.ts              # Codebase indexing
│   │   ├── SearchService.ts            # Semantic search
│   │   ├── RefactorService.ts          # Code refactoring
│   │   └── TestService.ts              # Test generation
│   ├── commands/
│   │   ├── configure.ts                # API configuration
│   │   ├── git.ts                      # Git operations
│   │   └── utils.ts                    # Command utilities
│   ├── ui/
│   │   ├── ViewProvider.ts             # Webview provider
│   │   ├── pages/
│   │   │   ├── login.html              # Login page
│   │   │   ├── dashboard.html          # Dashboard
│   │   │   ├── chat.html               # Chat interface
│   │   │   ├── code-review.html        # Code review
│   │   │   ├── research.html           # Research
│   │   │   ├── settings.html           # Settings
│   │   │   ├── history.html            # History
│   │   │   └── profiles.html           # Profiles
│   │   ├── scripts/
│   │   │   ├── app.js                  # Main app logic
│   │   │   ├── router.js               # Page routing
│   │   │   ├── chat.js                 # Chat functionality
│   │   │   ├── formatter.js            # Message formatting
│   │   │   └── utils.js                # UI utilities
│   │   └── styles/
│   │       ├── main.css                # Main styles
│   │       └── themes.css              # VS Code theme integration
│   ├── utils/
│   │   ├── Logger.ts                   # Logging utility
│   │   ├── IDEDetector.ts              # IDE detection
│   │   └── helpers.ts                  # Helper functions
│   └── providers/
│       └── CompletionProvider.ts       # Code completion
├── media/
│   └── icon.png                        # Extension icon
├── package.json                        # Extension manifest
├── tsconfig.json                       # TypeScript config
└── README.md                           # Documentation
```

## Implementation Phases

### Phase 1: Foundation & Core Services (Priority 1)

**Files to Create:**

- `src/extension.ts` - Main entry point with activation
- `src/types/index.ts` - All type definitions
- `src/services/ConfigService.ts` - API key encryption/storage
- `src/services/LLMService.ts` - LLM abstraction layer
- `src/utils/Logger.ts` - Logging system
- `src/utils/IDEDetector.ts` - IDE compatibility
- `package.json` - Extension manifest with all commands

**Key Features:**

- Extension activation and deactivation
- Secure API key storage using VS Code secrets
- LLM service supporting OpenAI, Claude, Ollama, Custom
- Structured logging to output channel
- IDE detection for compatibility

### Phase 2: Webview Infrastructure (Priority 1)

**Files to Create:**

- `src/ui/ViewProvider.ts` - Webview provider
- `src/ui/pages/login.html` - Login/API configuration page
- `src/ui/scripts/app.js` - Core app initialization
- `src/ui/scripts/router.js` - Client-side routing
- `src/ui/styles/main.css` - Base styles
- `src/ui/styles/themes.css` - VS Code theme variables

**Key Features:**

- Webview initialization and lifecycle
- Message passing between webview and extension
- Client-side routing system
- VS Code theme integration (light/dark mode)
- Error overlay for initialization failures

### Phase 3: Authentication & Settings (Priority 1)

**Files to Create:**

- `src/commands/configure.ts` - API configuration command
- `src/ui/pages/settings.html` - Settings page
- `src/ui/scripts/settings.js` - Settings management

**Key Features:**

- API key input and validation
- Provider selection (OpenAI, Claude, Ollama, Custom)
- Settings persistence
- API key encryption
- Provider-specific configuration

### Phase 4: Chat Interface (Priority 1)

**Files to Create:**

- `src/ui/pages/chat.html` - Chat interface
- `src/ui/scripts/chat.js` - Chat functionality
- `src/ui/scripts/formatter.js` - Message formatting

**Key Features:**

- Message input and display
- Streaming responses from LLM
- Message history
- Code block syntax highlighting
- Clickable file paths, URLs, git hashes
- Context-aware responses (include codebase context)

### Phase 5: Dashboard (Priority 2)

**Files to Create:**

- `src/ui/pages/dashboard.html` - Dashboard page
- `src/ui/scripts/dashboard.js` - Dashboard logic

**Key Features:**

- Quick action buttons
- Status indicators
- Recent activity
- Statistics

### Phase 6: Code Review (Priority 2)

**Files to Create:**

- `src/ui/pages/code-review.html` - Code review page
- `src/ui/scripts/code-review.js` - Review logic
- `src/services/RefactorService.ts` - Refactoring service
- `src/services/TestService.ts` - Test generation

**Key Features:**

- Bug detection
- Refactoring suggestions
- Test generation
- Code quality analysis

### Phase 7: Research & Search (Priority 2)

**Files to Create:**

- `src/ui/pages/research.html` - Research page
- `src/ui/scripts/research.js` - Research functionality
- `src/services/SearchService.ts` - Semantic search
- `src/services/CodeIndexer.ts` - Codebase indexing

**Key Features:**

- Semantic codebase search
- Natural language queries
- Cross-file relationship tracking
- Documentation generation

### Phase 8: Additional Features (Priority 3)

**Files to Create:**

- `src/ui/pages/history.html` - History page
- `src/ui/scripts/history.js` - History management
- `src/ui/pages/profiles.html` - Profiles page
- `src/ui/scripts/profiles.js` - Profile management
- `src/commands/git.ts` - Git clone command
- `src/commands/utils.ts` - Utility commands

**Key Features:**

- Conversation history
- Multiple API profiles
- Git repository cloning
- Log viewing
- Storage clearing

### Phase 9: Polish & Optimization (Priority 3)

**Tasks:**

- Error handling improvements
- Performance optimization
- Code cleanup and documentation
- Testing and bug fixes
- Icon optimization (square version)

## Technical Specifications

### VS Code Extension API Usage

- `vscode.ExtensionContext` - Extension lifecycle
- `vscode.WebviewViewProvider` - Webview management
- `vscode.SecretStorage` - Secure API key storage
- `vscode.workspace` - Workspace file access
- `vscode.commands` - Command registration
- `vscode.window` - UI notifications

### LLM Integration

- **OpenAI**: Direct API calls via LangChain
- **Claude**: Anthropic API via LangChain
- **Ollama**: Local HTTP API
- **Custom**: OpenAI-compatible endpoints
- **Streaming**: Real-time response streaming

### Security

- API keys encrypted using VS Code SecretStorage
- AES-256-GCM encryption
- No API keys in logs or webview HTML
- Secure postMessage validation

### Performance

- Lazy initialization of services
- Efficient codebase indexing
- Cached LLM responses where appropriate
- Minimal bundle size (no React overhead)

## Clean Implementation Approach

### Code Quality Standards

- TypeScript strict mode
- Clear separation of concerns
- Single responsibility principle
- Comprehensive error handling
- Detailed logging
- Type safety throughout

### No Legacy Code

- Complete wipe of `src/` directory
- Fresh implementation of all features
- No code reuse from old extension
- Clean dependency management

### Testing Strategy

- Manual testing in Extension Development Host
- Error scenario testing
- Cross-IDE compatibility testing
- Performance testing

## Success Criteria

1. All features from current extension working
2. Clean, maintainable codebase
3. Fast startup time (< 2 seconds)
4. No React dependency
5. Proper error handling
6. VS Code theme integration
7. Cross-IDE compatibility
8. Secure API key storage
9. Streaming LLM responses
10. Professional UI/UX

## Risk Mitigation

- **Complexity**: Break into phases, implement incrementally
- **LLM API Changes**: Use abstraction layer (LLMService)
- **VS Code API Changes**: Version pinning, compatibility checks
- **Performance**: Profile early, optimize critical paths
- **Security**: Follow VS Code security best practices

## Dependencies

**Runtime:**

- `@langchain/openai` - OpenAI integration
- `@langchain/anthropic` - Claude integration
- `@langchain/community` - Ollama support
- `langchain` - LLM abstraction
- `axios` - HTTP requests

**Development:**

- `typescript` - Type safety
- `@types/vscode` - VS Code types
- `@vscode/vsce` - Extension packaging

**Removed:**

- `react`, `react-dom` - Replaced with vanilla JS
- `zustand` - Not needed without React