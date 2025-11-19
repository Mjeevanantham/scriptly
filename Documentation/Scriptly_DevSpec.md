# SCRIPTLY - Product Development Specification (Dev Spec)

**Version:** 1.0  
**Date:** November 18, 2025  
**Phase:** 1 (MVP - VS Code Extension)  
**Duration:** 2 Weeks  

---

## Table of Contents
1. Feature Specifications
2. API Contracts
3. UI/UX Requirements
4. Acceptance Criteria
5. Testing Strategy
6. Development Checklist
7. Priority Levels

---

## 1. Feature Specifications

### 1.1 Feature: Code Completion (Tab Feature)

**Feature ID:** F001  
**Priority:** P0 (Critical)  
**Complexity:** Medium  
**Effort:** 3 days  

**Description:**
Provide real-time code completion when user presses Tab, similar to Cursor's Tab feature. The system predicts the next logical line(s) of code based on context and user's codebase.

**User Story:**
```
As a developer,
I want to get AI-powered code completion suggestions with Tab,
So that I can write code faster and reduce repetitive typing.
```

**Requirements:**

| # | Requirement | Details |
|---|-------------|---------|
| R1 | Activation | Tab key triggers completion at cursor position |
| R2 | Context | Send 100 lines before cursor, 50 after for context |
| R3 | LLM Integration | Support OpenAI, Claude, Ollama |
| R4 | Response Time | First token in <200ms, full completion in <2s |
| R5 | Streaming | Show suggestions character-by-character |
| R6 | Acceptance | Tab to accept, Escape to reject |
| R7 | Caching | Cache similar prompts to reduce API calls |
| R8 | Languages | Support: JS/TS, Python, Java, Go, Rust, SQL |
| R9 | Offline | Disable gracefully if no LLM configured |
| R10 | Error Handling | Show error message if API fails, fallback to empty |

**Prompt Template:**

```
You are an expert developer. Given the code context below, predict the NEXT LINE(S) of code that should logically follow.

Return ONLY the code to be inserted, NO explanation, NO markdown, NO code blocks.

File: {filename}
Language: {language}

---CODE CONTEXT---
{code_before}[CURSOR_HERE]{code_after}
---END CONTEXT---

Predict the next {num_lines} lines:
```

**API Contract:**

```typescript
interface CompletionRequest {
  code: string;
  cursorPosition: number;
  language: string;
  filename: string;
  contextLines: number; // how many lines to show before/after
}

interface CompletionResponse {
  suggestion: string;
  confidence: number; // 0-1
  executionTime: number; // ms
  tokensUsed: number;
}
```

**Acceptance Criteria:**
- ✅ Tab key shows completion suggestion within 500ms
- ✅ Suggestion is contextually relevant to the code
- ✅ Supports multiple LLM providers
- ✅ Caches results to reduce redundant API calls
- ✅ Handles API errors gracefully
- ✅ Works offline without LLM (no suggestion shown)

**Edge Cases:**
- Large files (>10K lines) - handle efficiently
- Files with mixed languages (e.g., .tsx files)
- When cursor is at EOF
- When cursor is inside string/comment

---

### 1.2 Feature: Chat Panel

**Feature ID:** F002  
**Priority:** P0 (Critical)  
**Complexity:** Medium  
**Effort:** 2.5 days  

**Description:**
Interactive chat panel where users can ask questions about their code and get AI-powered responses.

**User Story:**
```
As a developer,
I want to chat with an AI assistant about my code,
So that I can get help with debugging, refactoring, and understanding code.
```

**Requirements:**

| # | Requirement | Details |
|---|-------------|---------|
| R1 | Activation | Ctrl+Shift+L (Mac: Cmd+Shift+L) opens chat |
| R2 | Messages | Send/receive messages in conversation |
| R3 | Context | Include current file and selected code in context |
| R4 | History | Keep chat history for current session |
| R5 | Streaming | Stream responses token-by-token |
| R6 | Formatting | Support code blocks with syntax highlighting |
| R7 | Copy Button | Copy response to clipboard easily |
| R8 | Clear History | Button to clear chat history |
| R9 | Model Switch | Dropdown to switch between available LLMs |
| R10 | Settings | Show current model and temperature |

**UI Mockup:**
```
┌─────────────────────────────────┐
│  Scriptly Chat      [Settings]  │
├─────────────────────────────────┤
│                                 │
│  [System] Hello! I'm Scriptly   │
│           How can I help?       │
│                                 │
│  [User] How do I optimize this  │
│         function?               │
│                                 │
│  [Assistant] Based on your code,│
│              here are 3 ways... │
│              ```                │
│              // Code example    │
│              ```                │
│                                 │
│  [Copy] [Like] [Dislike]        │
│                                 │
├─────────────────────────────────┤
│ [Model: GPT-4 v] [Temp: 0.7 v] │
│                                 │
│ [Type your question...]      [↑]│
└─────────────────────────────────┘
```

**API Contract:**

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  codeContext?: string;
}

interface ChatRequest {
  message: string;
  fileContext: string;
  selectedCode: string;
  conversationId: string;
}

interface ChatResponse {
  messageId: string;
  content: string; // streamed chunks
  tokensUsed: number;
  model: string;
}
```

**Acceptance Criteria:**
- ✅ Chat panel opens with keyboard shortcut
- ✅ Messages send and receive properly
- ✅ Responses stream in real-time
- ✅ Code blocks render with syntax highlighting
- ✅ Can switch between LLM models
- ✅ Chat history persists during session
- ✅ Can clear history

---

### 1.3 Feature: API Key Management

**Feature ID:** F003  
**Priority:** P0 (Critical)  
**Complexity:** Low  
**Effort:** 1 day  

**Description:**
Secure storage and management of LLM API keys. Users can configure their own API keys for OpenAI, Claude, Ollama, or custom endpoints.

**User Story:**
```
As a developer,
I want to securely store my LLM API keys,
So that Scriptly can access LLMs on my behalf without exposing my keys.
```

**Requirements:**

| # | Requirement | Details |
|---|-------------|---------|
| R1 | Security | Encrypt keys in storage |
| R2 | Providers | Support OpenAI, Claude, Ollama, custom |
| R3 | Validation | Validate API key with test request |
| R4 | UI | Settings panel to add/edit/remove keys |
| R5 | Privacy | Never log or send keys anywhere |
| R6 | Fallback | Disable AI if no valid key configured |
| R7 | Multiple Keys | Support multiple API keys (switch between) |

**Settings Panel UI:**

```
Scriptly Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LLM Provider: [OpenAI v]
API Key: [••••••••••••] [Edit] [Test]
Status: ✅ Valid

Add Another Provider:
Provider: [Claude v]
API Key: [_______________]
[Add Key] [Cancel]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Default Model: [GPT-4 v]
Temperature: [0.3 ▮▮▮▮░░░░░░] 0.3
Completion Timeout: [2000 ms]

[Save] [Reset to Defaults]
```

**API Contract:**

```typescript
interface APIKeyConfig {
  provider: 'openai' | 'claude' | 'ollama' | 'custom';
  apiKey: string; // encrypted
  endpoint?: string; // custom endpoint URL
  modelName: string;
  isDefault: boolean;
}

interface APIKeyValidation {
  provider: string;
  isValid: boolean;
  message: string;
  tokensRemaining?: number;
}
```

**Acceptance Criteria:**
- ✅ API keys are encrypted in storage
- ✅ Settings panel allows add/edit/delete keys
- ✅ Can validate keys with test API call
- ✅ Multiple keys can be configured
- ✅ One can be marked as default
- ✅ Keys never appear in logs

---

### 1.4 Feature: File Explorer & Project Management

**Feature ID:** F004  
**Priority:** P1 (High)  
**Complexity:** Low  
**Effort:** 1.5 days  

**Description:**
File tree view to navigate project files, create/delete files and folders.

**Requirements:**

| # | Requirement | Details |
|---|-------------|---------|
| R1 | Display | Tree view of workspace files |
| R2 | Drag/Drop | Drag files between folders |
| R3 | Context Menu | Right-click menu (new file, delete, rename) |
| R4 | Open File | Double-click to open file in editor |
| R5 | Expand/Collapse | Folder expand/collapse |
| R6 | Icons | File type icons (JS, Python, etc) |
| R7 | Filters | Ignore node_modules, .git, .env |

**Acceptance Criteria:**
- ✅ File tree displays project structure
- ✅ Can create/delete/rename files and folders
- ✅ Opening file loads content in editor
- ✅ Drag-drop functionality works

---

### 1.5 Feature: Git Integration

**Feature ID:** F005  
**Priority:** P1 (High)  
**Complexity:** Medium  
**Effort:** 2 days  

**Description:**
Basic Git operations integrated into Scriptly without requiring git CLI.

**Requirements:**

| # | Requirement | Details |
|---|-------------|---------|
| R1 | Clone | Clone repository from GitHub/GitLab URL |
| R2 | Status | Show git status (modified files) |
| R3 | Commit | Stage files and commit with message |
| R4 | Push/Pull | Push commits and pull remote changes |
| R5 | Branches | Switch between branches |
| R6 | UI | Git panel showing current branch, changes |
| R7 | Auth | Support SSH keys and HTTPS tokens |

**Git Panel UI:**

```
Git (main)
━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Current Branch: main
🔄 Sync
━━━━━━━━━━━━━━━━━━━━━━━━━
Changes (3)
  ✏️ src/extension.ts
  ✏️ src/services/llm.ts
  ➕ README.md

[Stage All] [Discard All]

Commit Message:
[_____________________]

[Commit] [Cancel]
```

**Acceptance Criteria:**
- ✅ Can clone repository
- ✅ Shows modified files
- ✅ Can commit changes
- ✅ Can push/pull changes
- ✅ Can switch branches

---

### 1.6 Feature: Embedded Terminal

**Feature ID:** F006  
**Priority:** P2 (Medium)  
**Complexity:** Low  
**Effort:** 1 day  

**Description:**
Integrated terminal for running commands without leaving the IDE.

**Requirements:**

| # | Requirement | Details |
|---|-------------|---------|
| R1 | Display | Terminal panel at bottom of editor |
| R2 | Commands | Run bash/cmd commands |
| R3 | Resize | Resizable terminal panel |
| R4 | Clear | Clear terminal history button |
| R5 | Colors | Support terminal colors and styling |

**Acceptance Criteria:**
- ✅ Terminal opens at bottom
- ✅ Can type and execute commands
- ✅ Output displays in real-time
- ✅ Can resize terminal height

---

### 1.7 Feature: Theme Support

**Feature ID:** F007  
**Priority:** P2 (Medium)  
**Complexity:** Low  
**Effort:** 0.5 day  

**Description:**
Support dark and light themes for UI and syntax highlighting.

**Requirements:**

| # | Requirement | Details |
|---|-------------|---------|
| R1 | Themes | Dark and light themes |
| R2 | Toggle | Easy toggle in settings |
| R3 | Syntax | Syntax highlighting for all supported languages |
| R4 | Persistence | Remember theme selection |

**Acceptance Criteria:**
- ✅ Dark and light themes available
- ✅ Theme persists across sessions
- ✅ Syntax highlighting works in both themes

---

## 2. User Interface Requirements

### 2.1 Main Editor View

```
┌────────────────────────────────────────────────────────┐
│ Scriptly  [File] [Edit] [View] [Terminal] [Help]      │
├──────────────────┬──────────────────────────────────────┤
│  📁 Project      │ main.js                           ✕  │
│  ├─ src          │ 1  function greet() {                │
│  ├─ README.md    │ 2    console.log("Hello");           │
│  └─ package.json │ 3  }[CURSOR]                         │
│                  │    console.log("Done");              │
│                  │ 4                                    │
│                  │                                      │
│  🔗 Git (main)   │ [AI] Suggestion ready - press Tab    │
│  📝 Chat         │                                      │
│  🔧 Settings     │                                      │
├──────────────────┴──────────────────────────────────────┤
│ $ npm run dev                                           │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Chat Panel

- Sidebar panel, resizable
- Message list with timestamps
- Input box at bottom
- Model selector dropdown
- Settings button

### 2.3 Settings Panel

- API key management
- Model selection
- Temperature slider
- Timeout settings
- Theme toggle
- Clear cache button

---

## 3. API Contracts & Interfaces

### 3.1 LLMService Interface

```typescript
class LLMService {
  // Configuration
  setConfig(config: LLMConfig): void
  getConfig(): LLMConfig
  
  // Code completion
  async generateCompletion(
    code: string,
    position: number,
    context: string
  ): Promise<string>
  
  // Streaming completion
  streamCompletion(
    code: string,
    position: number,
    context: string
  ): AsyncIterable<string>
  
  // Chat
  async generateChatResponse(
    message: string,
    codeContext: string
  ): Promise<string>
  
  // Streaming chat
  streamChatResponse(
    message: string,
    codeContext: string
  ): AsyncIterable<string>
  
  // Model management
  switchModel(provider: string, modelName: string): void
  getAvailableModels(): Promise<Model[]>
  validateApiKey(provider: string, apiKey: string): Promise<boolean>
}
```

### 3.2 CodeIndexer Interface

```typescript
class CodeIndexer {
  // Indexing
  async indexWorkspace(workspacePath: string): Promise<void>
  async indexFile(filePath: string): Promise<void>
  
  // Retrieval
  getFileContext(
    filePath: string,
    lineNumber: number,
    contextLines: number
  ): Promise<string>
  
  searchByContent(query: string): Promise<FileMatch[]>
  
  // Updates
  onFileChanged(filePath: string): void
  invalidateCache(): void
  
  // Statistics
  getIndexStats(): IndexStats
}
```

### 3.3 ConfigService Interface

```typescript
class ConfigService {
  // API Keys (encrypted)
  setApiKey(provider: string, key: string): void
  getApiKey(provider: string): string | null
  validateApiKey(provider: string): Promise<boolean>
  
  // Preferences
  setPreference(key: string, value: any): void
  getPreference(key: string): any
  
  // Workspace
  getWorkspacePath(): string
  setWorkspacePath(path: string): void
  
  // Cache
  getCacheDirectory(): string
  clearCache(): void
}
```

---

## 4. Acceptance Criteria (Overall)

### 4.1 Functional

- ✅ Extension installs and activates in VS Code
- ✅ Code completion works with all supported languages
- ✅ Chat panel responds to user messages
- ✅ File explorer shows all files
- ✅ Git operations complete successfully
- ✅ Settings panel saves preferences
- ✅ API keys are securely stored

### 4.2 Performance

- ✅ Completion first token in <200ms
- ✅ Chat response starts within 500ms
- ✅ File explorer shows 1000+ files instantly
- ✅ No UI freezing during API calls
- ✅ Memory usage <500MB for typical project

### 4.3 User Experience

- ✅ Intuitive keyboard shortcuts
- ✅ Clear error messages
- ✅ Graceful degradation when features unavailable
- ✅ Responsive UI on all actions
- ✅ Documentation is clear and complete

### 4.4 Code Quality

- ✅ TypeScript with strict mode
- ✅ ESLint passes without warnings
- ✅ Unit test coverage >70%
- ✅ No security vulnerabilities
- ✅ Clear code documentation

### 4.5 Security

- ✅ API keys encrypted at rest
- ✅ No keys logged or exposed
- ✅ HTTPS for all external requests
- ✅ No sensitive data in localStorage
- ✅ User code never sent to Scriptly servers

---

## 5. Testing Strategy

### 5.1 Unit Tests

**Coverage targets:** >70%

```typescript
// Test LLMService
describe('LLMService', () => {
  test('should generate completion for given code', async () => {
    const service = new LLMService({ provider: 'openai', ... })
    const result = await service.generateCompletion('func', 0, '')
    expect(result).toBeTruthy()
  })
  
  test('should cache repeated requests', async () => {
    // Request twice, expect cache hit on second
  })
  
  test('should handle API errors gracefully', async () => {
    // Mock API error, expect graceful fallback
  })
})

// Test CodeIndexer
describe('CodeIndexer', () => {
  test('should index TypeScript files', async () => {
    const indexer = new CodeIndexer()
    await indexer.indexFile('test.ts')
    expect(indexer.getFileContext('test.ts', 1)).toBeDefined()
  })
})
```

### 5.2 Integration Tests

```typescript
// Test Extension activation
describe('Extension', () => {
  test('should activate and register providers', async () => {
    // Activate extension
    // Check all commands registered
    // Check all providers active
  })
})

// Test full flow
describe('Completion Flow', () => {
  test('should complete code from tab press', async () => {
    // Open file
    // Position cursor
    // Press Tab
    // Verify completion appears
  })
})
```

### 5.3 Manual Testing Checklist

- [ ] Test with small project (5 files)
- [ ] Test with large project (1000+ files)
- [ ] Test with each supported language
- [ ] Test with OpenAI, Claude, Ollama
- [ ] Test error scenarios (invalid API key, network down)
- [ ] Test on Windows, Mac, Linux
- [ ] Test with VS Code versions 1.80 - latest
- [ ] Load testing (1000 completions, measure memory)

---

## 6. Development Checklist (2 Weeks)

### Week 1

- [ ] Day 1-2: Setup, scaffolding
  - [ ] Create extension project
  - [ ] Configure TypeScript, ESLint, testing
  - [ ] Setup CI/CD pipeline
  
- [ ] Day 3-4: LLM Integration (F003)
  - [ ] Implement ConfigService
  - [ ] Add API key encryption
  - [ ] Settings panel UI
  - [ ] API key validation
  
- [ ] Day 5-6: Code Completion (F001, partial)
  - [ ] LLMService skeleton
  - [ ] Streaming implementation
  - [ ] Prompt template design
  - [ ] Basic UI
  
- [ ] Day 7: Code Completion Testing
  - [ ] Unit tests
  - [ ] Integration with VS Code
  - [ ] Test with multiple providers

### Week 2

- [ ] Day 1-2: Chat Panel (F002)
  - [ ] Webview implementation
  - [ ] Message UI
  - [ ] Streaming responses
  - [ ] Model selector
  
- [ ] Day 3: File Explorer & Git (F004, F005)
  - [ ] File tree UI
  - [ ] Git panel UI
  - [ ] Git operations
  
- [ ] Day 4: Terminal (F006)
  - [ ] Terminal panel
  - [ ] Command execution
  
- [ ] Day 5: Testing & Edge Cases
  - [ ] Comprehensive testing
  - [ ] Error handling
  - [ ] Performance optimization
  
- [ ] Day 6-7: Launch
  - [ ] Final documentation
  - [ ] Publish to VS Code Marketplace
  - [ ] GitHub release
  - [ ] Social media announcement

---

## 7. Priority Levels

### P0 - Critical (Launch Blocker)
- Code Completion (F001)
- Chat Panel (F002)
- API Key Management (F003)

**Must launch with these.**

### P1 - High (Should Have)
- File Explorer (F004)
- Git Integration (F005)

**Should include in MVP if time permits.**

### P2 - Medium (Nice to Have)
- Embedded Terminal (F006)
- Theme Support (F007)

**Can be added in patch releases.**

### P3 - Low (Future)
- Plugin marketplace
- Advanced refactoring
- Collaborative editing

---

## 8. Definition of Done

A feature is **Done** when:

1. ✅ **Code Complete** - All requirements implemented
2. ✅ **Tested** - Unit tests written and passing
3. ✅ **Documented** - README, comments, and user docs updated
4. ✅ **Reviewed** - Code review passed (if team available)
5. ✅ **Performance** - Meets performance criteria
6. ✅ **Security** - No security vulnerabilities
7. ✅ **UX** - Tested and feels responsive

---

## 9. Known Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| LLM API costs high | Medium | High | Implement caching, rate limiting |
| VS Code extension API changes | Low | Medium | Monitor VS Code updates |
| Performance issues with large files | Medium | Medium | Implement lazy loading, indexing optimization |
| Security vulnerability in dependencies | Low | High | Regular security audits, dependency scanning |

---

## 10. Next Steps After MVP Launch

1. Gather user feedback
2. Fix bugs and optimize performance
3. Start Phase 2 (Desktop App)
4. Build community
5. Plan Phase 3 (SaaS)
6. Implement P2 features (Terminal, Theme)

---

**Document Owner:** Jeeva (Thejands)  
**Last Updated:** November 18, 2025  
**Status:** Active Development
