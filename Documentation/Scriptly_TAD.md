# SCRIPTLY - Technical Architecture Document (TAD)

**Version:** 1.0  
**Date:** November 18, 2025  
**Product:** Scriptly  
**Audience:** Developers, DevOps, Technical Leads  

---

## Table of Contents
1. System Overview
2. Phase 1 Architecture (VS Code Extension)
3. Phase 2 Architecture (Desktop App)
4. Phase 3 Architecture (SaaS Platform)
5. Component Specifications
6. Data Flow & Integration
7. Security & Privacy
8. Performance Considerations
9. Scalability Plan
10. Deployment Strategy

---

## 1. System Overview

### 1.1 High-Level Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│              Presentation Layer                      │
│  (VS Code UI, Webviews, Desktop, Web Browser)      │
└─────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────┐
│            Extension/Application Layer               │
│  (Scriptly Core Logic, State Management)            │
└─────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────┐
│           Integration & Services Layer               │
│  (LLM, Git, File Ops, Deployment, Research)        │
└─────────────────────────────────────────────────────┘
                          ↓↑
┌─────────────────────────────────────────────────────┐
│              Data & Storage Layer                    │
│  (File System, LocalStorage, API Keys)              │
└─────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Editor Core** | VS Code / Monaco | Code editing, syntax highlighting |
| **Runtime** | Node.js (v18+) | Extension/backend runtime |
| **Language** | TypeScript | Type-safe development |
| **LLM** | LangChain + Multiple providers | AI orchestration |
| **UI Framework** | React (Webviews) | Interactive panels |
| **State** | Zustand | Lightweight state management |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Version Control** | isomorphic-git | Pure JS Git operations |
| **HTTP Client** | axios | API calls |
| **Local Storage** | VS Code memento + SQLite | Persistent storage |
| **Terminal** | node-pty | Terminal emulation |

---

## 2. Phase 1: VS Code Extension Architecture (Weeks 1-2)

### 2.1 Extension Structure

```
scriptly-extension/
├── src/
│   ├── extension.ts              # Entry point
│   ├── commands/                 # Command handlers
│   │   ├── completion.ts         # Tab completion logic
│   │   ├── chat.ts              # Chat panel command
│   │   ├── git.ts               # Git operations
│   │   └── deploy.ts            # Deployment helpers
│   ├── providers/                # VS Code providers
│   │   ├── CompletionProvider.ts # Inline completion
│   │   ├── HoverProvider.ts      # Hover hints
│   │   └── CodeActionProvider.ts # Quick fixes
│   ├── services/                 # Business logic
│   │   ├── LLMService.ts         # LLM integration
│   │   ├── CodeIndexer.ts        # Code analysis
│   │   ├── ContextManager.ts     # Context retrieval
│   │   ├── GitService.ts         # Git operations
│   │   └── ConfigService.ts      # Settings management
│   ├── webviews/                 # Webview panels
│   │   ├── ChatPanel.ts          # Chat UI controller
│   │   ├── ResearchPanel.ts      # Web research panel
│   │   ├── DeployPanel.ts        # Deployment helper
│   │   └── SettingsPanel.ts      # Configuration panel
│   ├── ui/                       # UI components
│   │   ├── chat-webview.html     # Chat HTML
│   │   ├── research-webview.html # Research HTML
│   │   └── styles.css            # Shared styles
│   ├── utils/                    # Utilities
│   │   ├── logger.ts             # Logging
│   │   ├── cache.ts              # Caching layer
│   │   └── crypto.ts             # Key encryption
│   └── types/                    # TypeScript types
│       └── index.ts              # Type definitions
├── package.json                  # Extension manifest
├── tsconfig.json                 # TypeScript config
└── README.md                     # Documentation
```

### 2.2 Core Components - Phase 1

#### 2.2.1 LLMService

**Purpose:** Orchestrate LLM calls with multiple providers

```typescript
interface LLMConfig {
  provider: 'openai' | 'claude' | 'ollama' | 'custom';
  apiKey?: string;
  modelName: string;
  temperature: number;
  maxTokens: number;
  baseURL?: string; // for custom endpoints
}

class LLMService {
  // Multi-model support
  async generateCompletion(code: string, context: string): Promise<string>
  async generateChatResponse(message: string): AsyncIterable<string>
  async switchModel(config: LLMConfig): void
  
  // Caching & optimization
  private cache: Map<string, string>
  private prompts: CachedPrompts
  
  // Error handling
  async handleRateLimit(): Promise<void>
  async handleAPIError(error: Error): void
}
```

**Key Features:**
- Support for OpenAI, Claude, Ollama, custom endpoints
- Streaming responses for real-time display
- Prompt caching for cost reduction
- Retry logic with exponential backoff
- Rate limit handling
- Error recovery

#### 2.2.2 CodeIndexer

**Purpose:** Fast retrieval and context awareness

```typescript
interface CodeChunk {
  id: string;
  filePath: string;
  content: string;
  startLine: number;
  language: string;
  hash: string;
  embedding?: number[]; // for semantic search later
}

class CodeIndexer {
  // Indexing
  async indexFile(filePath: string): Promise<void>
  async indexDirectory(dirPath: string): Promise<void>
  
  // Retrieval
  getContextByFile(filePath: string, lineNumber: number): CodeChunk[]
  getContextBySimilarity(code: string, topK: number): CodeChunk[]
  
  // Updates
  updateIndex(changes: FileChange[]): void
  invalidateCache(): void
}
```

**Features:**
- Semantic chunking (splits by functions, classes, etc.)
- Hash-based change detection
- Efficient lookup structures
- Workspace-wide indexing

#### 2.2.3 CompletionProvider

**Purpose:** Real-time code completion (Tab feature)

```typescript
class CompletionProvider implements vscode.InlineCompletionItemProvider {
  async provideInlineCompletionItems(
    document: TextDocument,
    position: Position,
    context: InlineCompletionContext
  ): Promise<InlineCompletionItem[]> {
    // 1. Get context from CodeIndexer
    // 2. Prepare prompt for LLM
    // 3. Stream response
    // 4. Return as InlineCompletionItem
    // 5. Cache result
  }
  
  private async getContext(position: Position): Promise<string>
  private async preparePrompt(code: string, context: string): Promise<string>
  private async streamCompletion(prompt: string): Promise<string>
}
```

#### 2.2.4 ChatPanel (Webview)

**Purpose:** Interactive chat interface

**Architecture:**
```
VS Code Extension
      ↓
ChatPanel (Webview Container)
      ↓
React Component (Chat UI)
      ↓
Message Handler (postMessage API)
      ↓
LLMService (streaming responses)
```

**Features:**
- Send/receive messages
- Show streaming responses in real-time
- Include code context
- Syntax highlighting in responses
- Copy response button

#### 2.2.5 GitService

**Purpose:** Git operations without requiring git CLI

```typescript
class GitService {
  async cloneRepository(url: string, path: string): Promise<void>
  async getCurrentBranch(): Promise<string>
  async getStatus(): Promise<GitStatus>
  async stageFiles(files: string[]): Promise<void>
  async commit(message: string): Promise<void>
  async push(branch: string): Promise<void>
  async pull(branch: string): Promise<void>
}
```

**Implementation:** Using isomorphic-git (pure JS, no CLI dependency)

#### 2.2.6 ConfigService

**Purpose:** Settings and API key management

```typescript
class ConfigService {
  // Secure storage for sensitive data
  setApiKey(provider: string, key: string): void // Encrypted
  getApiKey(provider: string): string | null      // Decrypted
  
  // User preferences
  setPreference(key: string, value: any): void
  getPreference(key: string): any
  
  // Model configuration
  setLLMConfig(config: LLMConfig): void
  getLLMConfig(): LLMConfig
  
  // Encryption for API keys
  private encrypt(text: string): string
  private decrypt(text: string): string
}
```

**Security:**
- API keys encrypted in storage using Node.js crypto
- Never logged or sent anywhere except to LLM provider
- Encrypted in VS Code's secure storage
- User confirmation for API calls

### 2.3 Data Flow - Phase 1

#### Flow 1: Code Completion (Tab Feature)

```
User presses Tab
     ↓
CompletionProvider.provideInlineCompletionItems()
     ↓
Get cursor context (50 chars before, 50 after)
     ↓
CodeIndexer.getContextByFile()
     ↓
Prepare LLM prompt with code + context
     ↓
LLMService.generateCompletion()
     ↓
Call user's LLM API (OpenAI/Claude/Ollama)
     ↓
Stream tokens in real-time
     ↓
Display as InlineCompletionItem
     ↓
User accepts (Tab) or rejects (Escape)
     ↓
Cache result for analytics
```

#### Flow 2: Chat Interaction

```
User types message in Chat Webview
     ↓
postMessage to Extension
     ↓
ChatPanel receives message
     ↓
Include current file context
     ↓
Include selected code (if any)
     ↓
LLMService.generateChatResponse()
     ↓
Stream response token by token
     ↓
postMessage back to Webview
     ↓
Display streamed response
```

#### Flow 3: Git Operations

```
User runs Git Command (Ctrl+Shift+P: Git Clone)
     ↓
GitService.cloneRepository()
     ↓
isomorphic-git clone
     ↓
Show progress notification
     ↓
Open cloned repo in VS Code
```

### 2.4 Configuration Files - Phase 1

#### package.json (Extension Manifest)

```json
{
  "name": "scriptly",
  "displayName": "Scriptly - AI Code Assistant",
  "description": "Free, unified IDE with AI-powered coding assistance",
  "version": "0.1.0",
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": ["Programming Languages", "AI", "Formatters"],
  "activationEvents": ["onStartupFinished"],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "scriptly.startChat",
        "title": "Open Scriptly Chat"
      },
      {
        "command": "scriptly.configureAPI",
        "title": "Configure API Keys"
      },
      {
        "command": "scriptly.gitClone",
        "title": "Clone Repository"
      }
    ],
    "keybindings": [
      {
        "command": "scriptly.startChat",
        "key": "ctrl+shift+l",
        "mac": "cmd+shift+l"
      }
    ],
    "configuration": {
      "title": "Scriptly",
      "properties": {
        "scriptly.llmProvider": {
          "type": "string",
          "default": "openai",
          "enum": ["openai", "claude", "ollama", "custom"]
        },
        "scriptly.modelName": {
          "type": "string",
          "default": "gpt-4"
        },
        "scriptly.temperature": {
          "type": "number",
          "default": 0.3,
          "minimum": 0,
          "maximum": 1
        }
      }
    }
  },
  "dependencies": {
    "langchain": "^0.1.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.0",
    "isomorphic-git": "^1.25.0"
  },
  "devDependencies": {
    "@types/vscode": "^1.80.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 3. Phase 2: Desktop App Architecture (Weeks 3-8)

### 3.1 Technology Stack Addition

| Component | Technology | Reason |
|-----------|-----------|---------|
| Desktop Framework | Electron | Cross-platform desktop app |
| Process Communication | IPC (Inter-Process Communication) | Main ↔ Renderer |
| Window Management | BrowserWindow | Native windows |
| Auto-updates | electron-updater | GitHub releases |
| Native Menus | Electron Menu | System integration |

### 3.2 Architecture

```
Electron Main Process (Node.js)
    ├── Window Management
    ├── File I/O
    ├── Extension Host
    └── IPC Handler

        ↓↑ IPC

Renderer Process (Chromium)
    ├── VS Code Fork
    ├── Monaco Editor
    └── UI Components
```

### 3.3 Key Features

- Native Windows, Mac, Linux installers
- Offline mode (non-AI features work without internet)
- Persistent workspace state
- Auto-update capability
- Native system tray integration
- Custom titlebar

---

## 4. Phase 3: SaaS Platform Architecture (Months 3-6)

### 4.1 Backend Architecture

```
┌──────────────────────────────────────────────┐
│           Web Browser (Next.js)              │
│    - Monaco Editor integrated                │
│    - Real-time collaboration UI              │
│    - Authentication (OAuth, Email)           │
└──────────────────────────────────────────────┘
                      ↓↑
┌──────────────────────────────────────────────┐
│        Vercel (Frontend Hosting)             │
│    - Next.js server-side rendering           │
│    - Static site generation                  │
│    - Built-in CI/CD                          │
└──────────────────────────────────────────────┘
                      ↓↑
┌──────────────────────────────────────────────┐
│        AWS API Gateway + Lambda              │
│    - REST endpoints                          │
│    - WebSocket support (collaboration)       │
│    - Authentication layer                    │
└──────────────────────────────────────────────┘
                      ↓↑
┌──────────────────────────────────────────────┐
│        Nest.js Backend (Docker on ECS)       │
│    - Core business logic                     │
│    - File storage & sync                     │
│    - Project management                      │
│    - User management                         │
│    - Team collaboration                      │
└──────────────────────────────────────────────┘
                      ↓↑
┌──────────────────────────────────────────────┐
│        Databases & Storage                   │
│    - PostgreSQL (RDS) - Relational data     │
│    - AWS S3 - Project files & backups       │
│    - Redis - Session & cache                │
│    - ElasticSearch - Code search            │
└──────────────────────────────────────────────┘
```

### 4.2 Real-Time Collaboration (Yjs + WebSockets)

```
User A edits code
    ↓
Yjs captures changes locally
    ↓
Send to WebSocket server
    ↓
Server broadcasts to other users in workspace
    ↓
User B receives changes
    ↓
Yjs applies changes locally
    ↓
Monaco Editor updates in real-time
```

### 4.3 Database Schema (PostgreSQL)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  name VARCHAR NOT NULL,
  git_url VARCHAR,
  storage_path VARCHAR,
  created_at TIMESTAMP
);

-- Files
CREATE TABLE files (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  path VARCHAR NOT NULL,
  content TEXT,
  version INT,
  updated_at TIMESTAMP,
  updated_by UUID REFERENCES users(id)
);

-- Collaboration Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  active_users TEXT[],
  created_at TIMESTAMP
);
```

---

## 5. Component Specifications

### 5.1 LLM Integration Details

**Supported Providers:**

1. **OpenAI**
   - Endpoint: https://api.openai.com/v1
   - Models: gpt-4, gpt-3.5-turbo, gpt-4-turbo
   - Auth: Bearer token

2. **Anthropic Claude**
   - Endpoint: https://api.anthropic.com/v1
   - Models: claude-3-opus, claude-3-sonnet, claude-2.1
   - Auth: x-api-key header

3. **Local Ollama**
   - Endpoint: http://localhost:11434
   - Models: Any local model
   - Auth: None

4. **Custom Endpoints**
   - OpenAI-compatible API
   - Custom headers support
   - Base URL configuration

### 5.2 Streaming Implementation

```typescript
async function* streamLLMResponse(prompt: string) {
  const response = await axios.post(
    `${llmEndpoint}/chat/completions`,
    {
      model: selectedModel,
      messages: [{ role: "user", content: prompt }],
      stream: true,
    },
    { responseType: 'stream' }
  );

  for await (const chunk of response.data) {
    const text = chunk.toString();
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const json = JSON.parse(line.slice(6));
        const content = json.choices[0].delta.content;
        if (content) yield content;
      }
    }
  }
}
```

### 5.3 Error Handling & Recovery

**Error Categories:**

1. **Network Errors**
   - Retry with exponential backoff
   - Show user-friendly message
   - Fallback to cached response if available

2. **API Rate Limits**
   - Queue requests
   - Show estimated wait time
   - Suggest paid tier

3. **Authentication Errors**
   - Prompt user to reconfigure API key
   - Clear invalid key from storage
   - Disable AI features temporarily

4. **Parsing Errors**
   - Log error details
   - Show raw response to user
   - Fallback gracefully

---

## 6. Security & Privacy

### 6.1 Data Security

**Phase 1 (Extension):**
- No data sent to Scriptly servers
- Code only sent to user's chosen LLM API
- API keys encrypted using Node.js crypto module
- All processing happens locally

**Phase 3 (SaaS):**
- TLS 1.3 encryption in transit
- AES-256 encryption at rest for code
- RBAC (Role-Based Access Control) for teams
- Audit logs for all access
- GDPR compliant data handling

### 6.2 API Key Management

```typescript
class KeyEncryption {
  private algorithm = 'aes-256-gcm';
  private masterKey = process.env.MASTER_KEY || generateFromUserPassword();
  
  encrypt(apiKey: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.masterKey, iv);
    const encrypted = cipher.update(apiKey, 'utf8', 'hex') + cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }
  
  decrypt(encryptedKey: string): string {
    const [iv, authTag, encrypted] = encryptedKey.split(':');
    const decipher = createDecipheriv(
      this.algorithm,
      this.masterKey,
      Buffer.from(iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
  }
}
```

### 6.3 Privacy Policy

- User code never leaves their machine (Phase 1)
- No telemetry or usage tracking without consent
- No code snippets in logs (Phase 3)
- Users can request data deletion anytime
- GDPR, CCPA compliant

---

## 7. Performance Considerations

### 7.1 Optimization Strategies

**Code Completion Latency:**
- Target: <500ms for first suggestion
- Implement character-level predictions first (fastest)
- Use caching for repeated patterns
- Batch API calls during typing pauses

**Indexing Performance:**
- Background indexing (doesn't block UI)
- Incremental updates (only changed files)
- Configurable index depth (whole workspace vs. current project)

**Memory Management:**
- Limit code index size (first 1M tokens)
- Lazy load large files (>500KB)
- Cache size limit (500MB default)
- Periodic cleanup of old cache entries

### 7.2 Caching Strategy

```typescript
interface CacheEntry {
  prompt: string;
  response: string;
  timestamp: number;
  model: string;
}

class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize = 500 * 1024 * 1024; // 500MB
  
  async getOrGenerate(
    prompt: string,
    generator: () => Promise<string>
  ): Promise<string> {
    const key = hash(prompt);
    if (this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      if (Date.now() - entry.timestamp < 24 * 60 * 60 * 1000) {
        return entry.response;
      }
    }
    
    const response = await generator();
    this.cache.set(key, { prompt, response, timestamp: Date.now(), model });
    this.evictIfNeeded();
    return response;
  }
}
```

---

## 8. Scalability Plan

### 8.1 Phase 1 Scalability
- No backend needed → infinite scalability
- Limited by user's machine resources
- VS Code Marketplace can handle 1M+ extensions

### 8.2 Phase 3 Scalability (SaaS)

**Expected Growth:**
- Month 1: 100 users
- Month 3: 5,000 users
- Month 6: 20,000 users
- Year 1: 50,000 users

**Infrastructure Scaling:**

| Users | Compute | Database | Cache | Storage |
|-------|---------|----------|-------|---------|
| 0-1K | 1x t3.small | 1x t3.small | 1x t3.micro | 50GB |
| 1K-10K | 2x t3.medium | 1x t3.medium | 1x t3.small | 500GB |
| 10K-50K | Auto-scaling (2-5x t3.large) | 1x db.t3.large + read replicas | Redis cluster | 2TB |
| 50K+ | Load balanced, multi-region | Aurora cluster | Redis cluster | S3 (unlimited) |

**Database Optimization:**
- Partitioning by user_id or project_id
- Read replicas for analytics
- Connection pooling
- Indexing on frequently queried columns

---

## 9. Deployment Strategy

### 9.1 Phase 1 Deployment

**VS Code Marketplace:**
```bash
# Build
npm run compile

# Package extension
vsce package

# Publish
vsce publish --pat <your-pat-token>
```

**GitHub Releases:**
- Automatic CI/CD via GitHub Actions
- Release on every tag
- Auto-update support for desktop phase

### 9.2 Phase 3 Deployment (SaaS)

**Architecture:**
```
GitHub (Code)
    ↓ (Push trigger)
GitHub Actions (CI/CD)
    ↓ (Build & Test)
ECR (Docker Registry)
    ↓ (Push image)
ECS (Container Orchestration)
    ↓
RDS (Database)
S3 (Storage)
```

**Deployment Process:**
1. Developer pushes to main branch
2. GitHub Actions runs tests
3. Build Docker image
4. Push to AWS ECR
5. ECS pulls new image
6. Blue-green deployment (zero downtime)
7. Rollback if health checks fail

---

## 10. Monitoring & Observability

### 10.1 Logging

**Levels:**
- ERROR: Critical issues
- WARN: Potential issues
- INFO: Important events
- DEBUG: Detailed debugging info (dev only)

**Tools:**
- Phase 1: VS Code console + local logs
- Phase 3: CloudWatch Logs + DataDog for monitoring

### 10.2 Metrics to Track

- API response times
- Error rates (by provider)
- Cache hit rates
- User session duration
- Feature usage (completion vs. chat)
- Cost per API call

---

## 11. Development Workflow

### 11.1 Local Development (Phase 1)

```bash
# Setup
git clone https://github.com/thejands/scriptly
cd scriptly
npm install

# Development
npm run watch      # Watch TypeScript files
npm run dev        # Launch VS Code with extension

# Testing
npm test           # Run unit tests

# Build
npm run compile    # Compile TypeScript
```

### 11.2 CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
name: CI/CD

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run compile

  publish:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run package
      - run: npm run publish
        env:
          VSCE_PAT: ${{ secrets.VSCE_PAT }}
```

---

## 12. Future Enhancements

### 12.1 Machine Learning Integration

- Fine-tune LLM on user's codebase
- Learn code patterns and styles
- Personalized completion suggestions
- Anomaly detection (unusual code patterns)

### 12.2 Advanced Features

- Multi-file refactoring agent
- Automated test generation
- Documentation generation
- Performance profiling
- Security vulnerability detection

### 12.3 Ecosystem

- Plugin marketplace
- Community models and prompts
- Integration with CI/CD platforms
- IDE theme marketplace

---

## Appendix: Technology Decisions

### Why LangChain?
- Multi-provider support out of the box
- Streaming, caching, retry logic built-in
- Large community and ecosystem
- Active maintenance

### Why TypeScript?
- Type safety prevents errors
- Better IDE support
- Large developer ecosystem
- Existing VS Code integration

### Why Nest.js (Phase 3)?
- Enterprise-grade architecture
- Built-in dependency injection
- Comprehensive module system
- Type-safe decorators
- Aligns with user's stack knowledge

### Why AWS (Phase 3)?
- Mature services (RDS, S3, Lambda, ECS)
- Cost-effective for startups
- Auto-scaling capabilities
- Global presence

---

**Document Version History:**
| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 18, 2025 | Initial TAD |

**Next Step:** Technical Specification Document (Dev Spec) for detailed API contracts and component interfaces.
