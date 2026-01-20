# Scriptly - AI Code Assistant

<div align="center">

**Free, unified IDE with AI-powered coding assistance**

[![Version](https://img.shields.io/badge/version-0.1.2-blue.svg)](https://marketplace.visualstudio.com/items?itemName=jeeva-dev.scriptly)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

</div>

## 🚀 Features

### 💬 AI-Powered Chat
- Interactive chat panel with codebase context awareness
- Multi-LLM support (OpenAI, Claude, Ollama, Custom endpoints)
- Real-time streaming responses
- Context-aware code analysis
- Clickable file paths, URLs, and code blocks

### 🔧 Code Review & Refactoring
- Automated bug detection
- AI-powered refactoring suggestions
- Code quality analysis
- Test generation recommendations

### 🔍 Smart Research
- Semantic codebase search
- Natural language queries
- Cross-file relationship tracking
- Workspace code indexing

### ⚡ Intelligent Formatting
- Clickable file paths (opens in VS Code with line numbers)
- Formatted URLs, emails, and git hashes
- Syntax-highlighted code blocks
- Error message detection and formatting

### 🎨 Professional UI
- Clean, modern vanilla JavaScript interface (no React)
- VS Code theme integration (light/dark mode)
- Smooth animations and transitions
- Multi-page navigation

## 📦 Installation

### From VS Code Marketplace
1. Open VS Code
2. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac) to open Extensions
3. Search for "Scriptly"
4. Click **Install**

### From Command Line
```bash
code --install-extension jeeva-dev.scriptly
```

## ⚙️ Quick Start

### 1. Configure API Key

After installation:
1. Click the **Scriptly** icon in the Activity Bar (left sidebar)
2. Or press `Ctrl+Shift+P` → "Scriptly: Configure API Keys"
3. Select your LLM provider (OpenAI, Claude, Ollama, Custom)
4. Enter your API key
5. Save and start using!

### 2. Use Features

- **Chat**: Click Scriptly icon → Chat tab
- **Code Review**: Dashboard → Code Review
- **Research**: Dashboard → Research
- **Settings**: Dashboard → Settings

## 🎯 Supported LLM Providers

### OpenAI
- Models: GPT-4, GPT-3.5-turbo
- Configuration: Enter your OpenAI API key
- Get API key: https://platform.openai.com/api-keys

### Anthropic Claude
- Models: Claude 3 (Opus, Sonnet, Haiku)
- Configuration: Enter your Anthropic API key
- Get API key: https://console.anthropic.com/

### Ollama (Local)
- Models: Any Ollama model (Llama, Mistral, etc.)
- Configuration: Enter your Ollama endpoint (default: http://localhost:11434)
- Install Ollama: https://ollama.ai/

### Custom Endpoints
- Support for any OpenAI-compatible API
- Configure custom endpoint URL and API key

## 📖 Usage Examples

### Chat Mode
Ask questions about your codebase:
```
How does authentication work in this project?
What are the main components in this file?
Explain this function
```

### Code Review Mode
- Select a file → Click "Analyze Code" to detect potential issues
- Click "Suggest Refactoring" for improvement suggestions
- Click "Generate Tests" for automated test recommendations
- Click "Find Bugs" for bug detection

### Research Mode
Search your codebase semantically:
```
Where is the login function implemented?
Find all API endpoints
Show me error handling patterns
```

## 🛠️ Development

### Prerequisites
- Node.js >= 18.0.0
- VS Code >= 1.80.0

### Setup
```bash
cd packages/extension
npm install
npm run build
```

### Development Mode
```bash
# Watch mode (auto-rebuild on changes)
npm run dev

# In VS Code:
# Press F5 to launch Extension Development Host
```

### Build
```bash
npm run build
```

### Package
```bash
npm run package
```

## 🏗️ Architecture

### Tech Stack
- **Language**: TypeScript
- **UI**: Vanilla HTML/CSS/JavaScript (no React)
- **LLM Integration**: LangChain
- **IDE Compatibility**: VS Code, Cursor, Windsurf, Antigravity

### File Structure
```
src/
├── extension.ts           # Entry point
├── types/                 # TypeScript definitions
├── services/              # Business logic
│   ├── ConfigService.ts  # API key management
│   ├── LLMService.ts     # LLM integration
│   ├── CodeIndexer.ts    # Workspace indexing
│   ├── SearchService.ts  # Semantic search
│   ├── RefactorService.ts # Code refactoring
│   └── TestService.ts    # Test generation
├── commands/              # VS Code commands
├── ui/                    # Webview UI
│   ├── ViewProvider.ts   # Webview provider
│   ├── pages/            # HTML pages
│   ├── scripts/          # JavaScript files
│   └── styles/           # CSS files
├── utils/                 # Utilities
└── providers/             # Language providers
```

## 🔧 Commands

Available via Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

- **Scriptly: Open Scriptly Chat** - Open the chat panel (`Ctrl+Shift+L`)
- **Scriptly: Configure API Keys** - Set up your LLM API keys
- **Scriptly: Clone Repository** - Clone a Git repository
- **Scriptly: Show Log File** - View extension logs for debugging
- **Scriptly: Clear Storage & Reset** - Clear all extension data

## ⚙️ Configuration

### VS Code Settings

Open Settings (`Ctrl+,` or `Cmd+,`) and search for "Scriptly":

- **LLM Provider**: Choose default provider (OpenAI, Claude, Ollama, Custom)
- **Model Name**: Select model (e.g., "gpt-4", "claude-3-opus")
- **Temperature**: Control response randomness (0.0 - 1.0, default: 0.3)

### Workspace Settings

You can configure Scriptly per workspace in `.vscode/settings.json`:

```json
{
  "scriptly.llmProvider": "openai",
  "scriptly.modelName": "gpt-4",
  "scriptly.temperature": 0.3
}
```

## 🐛 Troubleshooting

### API Key Not Working
1. Verify your API key is correct
2. Check the provider is selected in settings
3. View logs: Command Palette → "Scriptly: Show Log File"
4. Ensure you have sufficient API credits/quota

### Extension Not Loading
1. Reload VS Code window (`Ctrl+Shift+P` → "Developer: Reload Window")
2. Check VS Code version (requires 1.80.0 or higher)
3. View output: View → Output → Select "Scriptly"

### Chat Not Responding
1. Verify API key is configured
2. Check internet connection
3. View extension logs for error messages
4. Try switching to a different LLM provider

## 📝 Privacy & Security

- **API Keys**: Stored securely using VS Code's secret storage (encrypted)
- **Data**: Code context is sent to your chosen LLM provider for processing
- **No Telemetry**: Scriptly doesn't collect or send usage data
- **Local Processing**: Use Ollama for completely local AI processing

## 🤝 Contributing

We welcome contributions! Please see our [GitHub repository](https://github.com/Mjeevanantham/scriptly) for:
- Issue reporting
- Feature requests
- Pull requests
- Community discussions

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built with [VS Code Extension API](https://code.visualstudio.com/api)
- Powered by [LangChain](https://www.langchain.com/)
- UI inspired by modern IDE design patterns

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/Mjeevanantham/scriptly/issues)
- **Repository**: [https://github.com/Mjeevanantham/scriptly](https://github.com/Mjeevanantham/scriptly)

---

<div align="center">

**Made with ❤️ by Jeevanantham M**

⭐ Star us on GitHub if you find Scriptly helpful!

</div>
