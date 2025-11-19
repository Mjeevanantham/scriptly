# Scriptly - AI Code Assistant

<div align="center">

**Free, unified IDE with AI-powered coding assistance**

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://marketplace.visualstudio.com/items?itemName=jeeva-dev.scriptly)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Marketplace](https://img.shields.io/badge/marketplace-jeeva--dev.scriptly-blue.svg)](https://marketplace.visualstudio.com/items?itemName=jeeva-dev.scriptly)

</div>

## 🚀 Features

### 💬 AI-Powered Chat
- Interactive chat panel with codebase context awareness
- Multi-LLM support (OpenAI, Claude, Ollama, Custom endpoints)
- Real-time streaming responses
- Context-aware code analysis
- Suggestion buttons for quick actions

### 🔧 Code Review & Refactoring
- Automated bug detection
- AI-powered refactoring suggestions
- Code quality metrics
- Test generation recommendations

### 🔍 Smart Research
- Semantic codebase search
- Natural language queries
- Cross-file relationship tracking
- Documentation generation

### ⚡ Intelligent Formatting
- Clickable file paths (opens in VS Code with line numbers)
- Formatted URLs, emails, and git hashes
- Syntax-highlighted code blocks
- Error message detection and formatting
- Stack trace highlighting

### 🎨 Professional UI
- Clean, modern interface
- Mode-specific theming
- VS Code theme integration
- Smooth animations and transitions

## 📦 Installation

1. Open VS Code
2. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac) to open Extensions
3. Search for "Scriptly"
4. Click **Install**

Or use the command line:

```bash
code --install-extension jeeva-dev.scriptly
```

## ⚙️ Quick Start

### 1. Configure Your API Key

After installation, you need to configure an API key for one of the supported LLM providers:

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) to open Command Palette
2. Type "Scriptly: Configure API Keys"
3. Select your provider (OpenAI, Claude, or Ollama)
4. Enter your API key

### 2. Access Scriptly

- Click the **Scriptly** icon in the Activity Bar (robot icon)
- Or press `Ctrl+Shift+L` (or `Cmd+Shift+L` on Mac)
- The Scriptly sidebar will open with the Chat panel

### 3. Start Chatting

- Type your questions in the chat input
- Use suggestion buttons for quick actions:
  - "Analyze the codebase"
  - "Analyze and document it"
  - "Research and find the bugs"
- Click on file paths in responses to open them in VS Code
- Click on URLs to open them in your browser

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
- Configure custom endpoint URL

## 📖 Usage Examples

### Chat Mode
Ask questions about your codebase:
```
How does authentication work in this project?
What are the main components in this file?
Explain this function
```

### Code Review Mode
- Click "Find Bugs" to detect potential issues
- Click "Suggest Refactoring" for improvement suggestions
- Click "Generate Tests" for automated test recommendations

### Research Mode
- Search your codebase semantically:
```
Where is the login function implemented?
Find all API endpoints
Show me error handling patterns
```

## 🎨 Features in Detail

### Interactive Formatting
- **File Paths**: Click any file path in responses to open it in VS Code
  - Supports line numbers: `file.ts:42`
  - Supports column numbers: `file.ts:42:10`
  - Supports ranges: `file.ts:10-20`

- **URLs**: Click URLs to open them in your default browser
- **Emails**: Click email addresses to open your email client
- **Git Hashes**: Click commit hashes to view commit details
- **Code Blocks**: Syntax-highlighted with language detection

### Context Awareness
Scriptly analyzes your workspace to provide relevant answers:
- Automatically scans your codebase
- Prioritizes important files (package.json, config files, etc.)
- Excludes logs and build artifacts
- Includes up to 20 relevant files in context

### Multi-Mode Interface
- **Chat**: General conversations and code questions
- **Code Review**: Bug detection, refactoring, and testing
- **Research**: Semantic search and documentation
- **Settings**: API key management and configuration
- **Deployment**: Deploy to cloud platforms (coming soon)

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

## 🔧 Commands

Available via Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`):

- **Scriptly: Configure API Keys** - Set up your LLM API keys
- **Scriptly: Open Scriptly Chat** - Open the chat panel
- **Scriptly: Focus Chat** - Focus on the chat input
- **Scriptly: Show Log File** - View extension logs for debugging

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

### Performance Issues
- The extension may include many files (bundling recommended)
- For better performance, exclude unnecessary files in `.vscodeignore`
- Reduce context size in settings if token limits are reached

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
- **Email**: mjeevanantham04@gmail.com

---

<div align="center">

**Made with ❤️ by Jeevanantham M**

⭐ Star us on GitHub if you find Scriptly helpful!

</div>

