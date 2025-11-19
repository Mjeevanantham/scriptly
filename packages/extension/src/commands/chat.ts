import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { LLMService } from '../services/LLMService'
import { CodeIndexer } from '../services/CodeIndexer'
import { ChatRequest } from '../types'
import { Logger } from '../utils/Logger'

export class ChatViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'scriptly.chatView'

  private _view?: vscode.WebviewView
  private _llmService?: LLMService
  private _configService?: any // ConfigService type
  private _codeIndexer?: CodeIndexer

  constructor(private readonly _context: vscode.ExtensionContext) {}

  public setLLMService(llmService: LLMService) {
    this._llmService = llmService
    // Access the configService from llmService
    this._configService = (llmService as any).configService
  }

  public setCodeIndexer(codeIndexer: CodeIndexer) {
    this._codeIndexer = codeIndexer
  }

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._context.extensionUri],
    }

    // Check if API key is configured and show welcome message
    const hasApiKey = await this._checkApiKeyConfigured()
    webviewView.webview.html = this._getWebviewContent(
      webviewView.webview,
      hasApiKey
    )

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case 'sendMessage': {
          if (!this._llmService) {
            webviewView.webview.postMessage({
              command: 'error',
              error: 'LLM Service not initialized',
            })
            return
          }

          // Check if API key is configured before attempting to use LLM
          if (!this._configService) {
            webviewView.webview.postMessage({
              command: 'error',
              error: 'Config service not initialized',
            })
            return
          }

          // Get fresh configuration
          Logger.debug('Chat', 'Getting LLM config before sending message')
          const config = await this._configService.getLLMConfig()
          
          // Also check directly from secrets to verify
          const directApiKey = await this._configService.getApiKey(config.provider)
          
          const apiKeyInfo = {
            provider: config.provider,
            hasApiKey: !!config.apiKey,
            apiKeyLength: config.apiKey?.length || 0,
            apiKeyPreview: config.apiKey ? `${config.apiKey.substring(0, 10)}...` : 'none',
            isOllama: config.provider === 'ollama',
            directApiKeyExists: !!directApiKey,
            directApiKeyLength: directApiKey?.length || 0,
          }
          
          Logger.info('Chat', 'Checking API key before sending message', apiKeyInfo)
          
          // If config says no API key but direct check finds one, there's a mismatch
          if (!config.apiKey && directApiKey) {
            Logger.error('Chat', 'API key mismatch detected! Config says no key but direct check found one', {
              provider: config.provider,
              directKeyLength: directApiKey.length,
            })
            // Use the direct key
            config.apiKey = directApiKey
          }
          
          // Check if API key is missing or empty
          if ((!config.apiKey || config.apiKey.trim().length === 0) && config.provider !== 'ollama') {
            Logger.error('Chat', `API key not configured for provider: ${config.provider}`, apiKeyInfo)
            
            webviewView.webview.postMessage({
              command: 'error',
              error: `API key not configured for ${config.provider}. Please configure your API key first using the Command Palette (Ctrl+Shift+P → "Configure API Keys"). Check logs for details.`,
            })
            
            vscode.window
              .showErrorMessage(
                `Scriptly: API key not configured for ${config.provider}. Please configure it to use the chat feature.`,
                'Configure API Key',
                'View Logs'
              )
              .then((selection) => {
                if (selection === 'Configure API Key') {
                  vscode.commands.executeCommand('scriptly.configureAPI')
                } else if (selection === 'View Logs') {
                  vscode.commands.executeCommand('scriptly.showLogs')
                }
              })
            return
          }

          Logger.debug('Chat', 'API key verified, proceeding with chat request', {
            provider: config.provider,
            messageLength: message.text.length,
          })

          // Get workspace folder context instead of just current file
          const workspaceFolders = vscode.workspace.workspaceFolders
          let codebaseContext = ''
          
          if (workspaceFolders && workspaceFolders.length > 0) {
            const workspacePath = workspaceFolders[0].uri.fsPath
            Logger.debug('Chat', 'Getting codebase context from workspace', {
              workspacePath,
            })
            
            codebaseContext = await this._getCodebaseContext(workspacePath)
          }

          // Also get current file context if available (for specific questions)
          const editor = vscode.window.activeTextEditor
          let currentFileContext = ''
          let selectedCode = ''

          if (editor) {
            const currentFilePath = editor.document.fileName
            const isCodeFile = /\.(ts|tsx|js|jsx|py|java|go|rs|sql|vue|svelte|html|css|scss)$/i.test(currentFilePath)
            
            // Only include code files, exclude logs and other text files
            if (isCodeFile) {
              currentFileContext = `\n\nCurrent file (${path.basename(currentFilePath)}):\n\`\`\`${editor.document.languageId}\n${editor.document.getText()}\n\`\`\``
              
              if (!editor.selection.isEmpty) {
                selectedCode = editor.document.getText(editor.selection)
              }
            }
          }

          const request: ChatRequest = {
            message: message.text,
            fileContext: codebaseContext + currentFileContext,
            selectedCode,
            conversationId: message.conversationId || 'default',
          }

          try {
            // Stream response
            let fullResponse = ''
            for await (const chunk of this._llmService.streamChatResponse(
              request
            )) {
              fullResponse += chunk
              this._view?.webview.postMessage({
                command: 'streamChunk',
                chunk,
              })
            }

            this._view?.webview.postMessage({
              command: 'streamComplete',
              fullResponse,
            })
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : 'Unknown error'
            
            Logger.error('Chat', 'Error during chat streaming', error)
            
            // Check if it's an API key error
            if (
              errorMessage.includes('API key') ||
              errorMessage.includes('api key') ||
              errorMessage.includes('not found') ||
              errorMessage.includes('not configured')
            ) {
              Logger.warn('Chat', 'API key error detected in stream response', { errorMessage })
              
              // Invalidate model to force re-check on next request
              if (this._llmService) {
                this._llmService.invalidateModel()
              }
              
              this._view?.webview.postMessage({
                command: 'error',
                error: `API key not configured. Please configure your API key using the Command Palette (Ctrl+Shift+P → "Configure API Keys")`,
              })
              // Also show a notification
              vscode.window
                .showErrorMessage(
                  'Scriptly: API key not configured. Please configure it to use the chat feature.',
                  'Configure API Key'
                )
                .then((selection) => {
                  if (selection === 'Configure API Key') {
                    vscode.commands.executeCommand('scriptly.configureAPI')
                  }
                })
            } else {
              this._view?.webview.postMessage({
                command: 'error',
                error: errorMessage,
              })
            }
          }
          break
        }
      }
    })
  }

  public reveal() {
    if (this._view) {
      this._view.show?.(true)
    }
  }

  public async refresh() {
    if (!this._view) {
      Logger.warn('Chat', 'Refresh called but view is not available')
      return
    }

    Logger.info('Chat', 'Refreshing chat view after API key configuration')

    // Invalidate LLM service model cache to force re-initialization with new API key
    if (this._llmService) {
      Logger.debug('Chat', 'Invalidating LLM service model cache')
      this._llmService.invalidateModel()
    }

    // Wait a bit to ensure API key is fully saved
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Re-check API key and refresh the webview content
    const hasApiKey = await this._checkApiKeyConfigured()
    
    // Double-check by getting the config directly
    if (this._configService) {
      const config = await this._configService.getLLMConfig()
      const logData = {
        provider: config.provider,
        hasApiKey: !!config.apiKey,
        apiKeyLength: config.apiKey?.length || 0,
        isOllama: config.provider === 'ollama',
      }
      Logger.debug('Chat', 'Refresh - Config check after wait', logData)
    }

    this._view.webview.html = this._getWebviewContent(
      this._view.webview,
      hasApiKey
    )
    
    // Add a message indicating the API key was configured
    if (hasApiKey) {
      this._view.webview.postMessage({
        command: 'refresh',
        message: 'API key configured! You can now start chatting.',
      })
    } else {
      // Even if we don't have an API key yet, send a message
      this._view.webview.postMessage({
        command: 'refresh',
        message: 'Please configure your API key to start chatting.',
      })
    }
  }

  private async _checkApiKeyConfigured(): Promise<boolean> {
    if (!this._configService) {
      Logger.warn('Chat', 'Config service not available for API key check')
      return false
    }
    try {
      const config = await this._configService.getLLMConfig()
      const hasApiKey = !!(config.apiKey || config.provider === 'ollama')
      
      Logger.debug('Chat', 'API key check result', {
        provider: config.provider,
        hasApiKey,
        apiKeyLength: config.apiKey?.length || 0,
        isOllama: config.provider === 'ollama',
      })
      
      return hasApiKey
    } catch (error) {
      Logger.error('Chat', 'Failed to check API key configuration', error)
      return false
    }
  }

  private async _getCodebaseContext(workspacePath: string): Promise<string> {
    try {
      const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs', '.sql', '.vue', '.svelte']
      const ignoreDirs = ['node_modules', '.git', 'dist', 'build', 'out', '.next', '.vscode', 'coverage', '.turbo', 'logs', 'log']
      const ignoreFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', '.gitignore', '.env', '.log']
      
      // Priority files (always include these first)
      const priorityFiles = ['package.json', 'tsconfig.json', 'README.md', 'index.ts', 'index.js', 'main.ts', 'main.js', 'app.ts', 'app.js']
      
      const codeFiles: Array<{ path: string; content: string; name: string; priority: number }> = []
      const maxFileSize = 50000 // 50KB per file
      const maxFiles = 20 // Limit to 20 files
      const maxCharsPerFile = 800 // Limit each file to 800 chars
      const maxTotalChars = 15000 // Limit total context to 15k chars (leaves room for prompt + response)

      const getFilePriority = (fileName: string, filePath: string): number => {
        // Higher priority = included first
        if (priorityFiles.includes(fileName)) return 10
        if (fileName.includes('config')) return 8
        if (fileName.startsWith('index') || fileName.startsWith('main') || fileName.startsWith('app')) return 7
        if (filePath.includes('src') || filePath.includes('lib') || filePath.includes('components')) return 6
        if (filePath.includes('test') || filePath.includes('spec')) return 2
        return 1
      }

      const walkDir = (dir: string, depth: number = 0): void => {
        if (depth > 4) return // Limit recursion depth
        
        try {
          const entries = fs.readdirSync(dir, { withFileTypes: true })
          
          // Sort entries to prioritize important files
          entries.sort((a, b) => {
            if (a.isDirectory() && !b.isDirectory()) return 1
            if (!a.isDirectory() && b.isDirectory()) return -1
            const aPriority = getFilePriority(a.name, path.join(dir, a.name))
            const bPriority = getFilePriority(b.name, path.join(dir, b.name))
            return bPriority - aPriority
          })
          
          for (const entry of entries) {
            if (codeFiles.length >= maxFiles) break
            
            const fullPath = path.join(dir, entry.name)
            const relativePath = path.relative(workspacePath, fullPath)
            
            // Skip ignored directories
            if (entry.isDirectory()) {
              if (!ignoreDirs.includes(entry.name) && !entry.name.startsWith('.') && !relativePath.includes('node_modules')) {
                walkDir(fullPath, depth + 1)
              }
            } else if (entry.isFile()) {
              const ext = path.extname(entry.name).toLowerCase()
              const isPriorityFile = priorityFiles.includes(entry.name)
              
              // Include code files and priority config files
              if ((codeExtensions.includes(ext) || isPriorityFile) && !ignoreFiles.includes(entry.name)) {
                try {
                  const stats = fs.statSync(fullPath)
                  if (stats.size <= maxFileSize) {
                    const content = fs.readFileSync(fullPath, 'utf8')
                    const priority = getFilePriority(entry.name, relativePath)
                    
                    // For priority files, take more content
                    const contentLimit = isPriorityFile ? 1200 : maxCharsPerFile
                    
                    codeFiles.push({
                      path: relativePath,
                      content: content.substring(0, contentLimit),
                      name: entry.name,
                      priority,
                    })
                  }
                } catch {
                  // Skip unreadable files
                }
              }
            }
          }
        } catch {
          // Skip inaccessible directories
        }
      }

      walkDir(workspacePath)

      if (codeFiles.length === 0) {
        return ''
      }

      // Sort by priority (highest first)
      codeFiles.sort((a, b) => b.priority - a.priority)

      // Build codebase summary
      let context = `Project Codebase (${codeFiles.length} key files):\n\n`
      let totalChars = context.length

      for (const file of codeFiles) {
        const fileContext = `[${file.path}]\n${file.content}\n\n`
        const fileContextLength = fileContext.length
        
        if (totalChars + fileContextLength > maxTotalChars) {
          Logger.debug('Chat', 'Reached context limit, truncating', {
            filesIncluded: codeFiles.indexOf(file),
            totalChars,
          })
          break
        }
        
        context += fileContext
        totalChars += fileContextLength
      }

      Logger.debug('Chat', 'Codebase context prepared', {
        fileCount: codeFiles.length,
        totalChars: context.length,
        filesList: codeFiles.slice(0, 10).map(f => f.path),
      })

      return context
    } catch (error) {
      Logger.error('Chat', 'Failed to get codebase context', error)
      return ''
    }
  }

  private _getWebviewContent(
    webview: vscode.Webview,
    hasApiKey: boolean = false
  ): string {
    const welcomeMessage = hasApiKey
      ? 'Welcome to Scriptly Chat! Ask me anything about your code.'
      : 'Welcome to Scriptly Chat! Please configure your API key first to start chatting. Use Command Palette (Ctrl+Shift+P) and search for "Configure API Keys".'
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scriptly Chat</title>
    <style>
        * {
            box-sizing: border-box;
        }
        html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
        }
        body {
            font-family: var(--vscode-font-family);
            padding: 16px;
            background: var(--vscode-editor-background);
            color: var(--vscode-foreground);
            display: flex;
            flex-direction: column;
        }
        #messages {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            margin-bottom: 16px;
            min-height: 0;
            scrollbar-width: thin;
        }
        #messages::-webkit-scrollbar {
            width: 8px;
        }
        #messages::-webkit-scrollbar-track {
            background: var(--vscode-scrollbarSlider-background);
        }
        #messages::-webkit-scrollbar-thumb {
            background: var(--vscode-scrollbarSlider-hoverBackground);
            border-radius: 4px;
        }
        .message {
            margin-bottom: 12px;
            padding: 12px;
            border-radius: 8px;
            word-wrap: break-word;
        }
        .user-message {
            background: var(--vscode-input-background);
            text-align: right;
            margin-left: 20px;
        }
        .assistant-message {
            background: var(--vscode-editor-background);
            border: 1px solid var(--vscode-input-border);
            margin-right: 20px;
        }
        .input-container {
            display: flex;
            gap: 8px;
            margin-top: auto;
        }
        #input {
            flex: 1;
            padding: 10px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 5px;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
        }
        #sendButton {
            padding: 10px 16px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
        }
        #sendButton:hover {
            background: var(--vscode-button-hoverBackground);
        }
        #input:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }
        .suggestions-container {
            margin-bottom: 12px;
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            opacity: 1;
            transition: opacity 0.2s ease;
        }
        .suggestions-container.hidden {
            display: none;
        }
        .suggestion-button {
            padding: 6px 12px;
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
            border: 1px solid var(--vscode-button-border);
            border-radius: 4px;
            cursor: pointer;
            font-family: var(--vscode-font-family);
            font-size: 11px;
            white-space: nowrap;
            transition: all 0.2s ease;
        }
        .suggestion-button:hover {
            background: var(--vscode-button-secondaryHoverBackground);
            border-color: var(--vscode-button-border);
        }
        .suggestion-button:active {
            transform: scale(0.98);
        }
    </style>
</head>
<body>
    <div id="messages"></div>
    <div id="suggestions" class="suggestions-container">
        <button class="suggestion-button" data-suggestion="Analyze the codebase">🔍 Analyze the codebase</button>
        <button class="suggestion-button" data-suggestion="Analyze and document it">📝 Analyze and document it</button>
        <button class="suggestion-button" data-suggestion="Research and find the bugs">🐛 Research and find the bugs</button>
        <button class="suggestion-button" data-suggestion="Explain the architecture">🏗️ Explain the architecture</button>
        <button class="suggestion-button" data-suggestion="Suggest improvements">✨ Suggest improvements</button>
        <button class="suggestion-button" data-suggestion="Review code quality">✅ Review code quality</button>
    </div>
    <div class="input-container">
        <input type="text" id="input" placeholder="Ask about your code..." autocomplete="off">
        <button id="sendButton">Send</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const messagesDiv = document.getElementById('messages');
        const input = document.getElementById('input');
        const sendButton = document.getElementById('sendButton');
        const suggestionsContainer = document.getElementById('suggestions');

        function addMessage(text, isUser) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ' + (isUser ? 'user-message' : 'assistant-message');
            messageDiv.textContent = text;
            messagesDiv.appendChild(messageDiv);
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
            
            // Hide suggestions after first message
            if (isUser) {
                suggestionsContainer.classList.add('hidden');
            }
        }

        function updateLastMessage(chunk) {
            const messages = messagesDiv.children;
            if (messages.length > 0 && messages[messages.length - 1].classList.contains('assistant-message')) {
                messages[messages.length - 1].textContent += chunk;
            } else {
                addMessage(chunk, false);
            }
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        function sendMessage() {
            const text = input.value.trim();
            if (!text) return;

            addMessage(text, true);
            input.value = '';

            vscode.postMessage({
                command: 'sendMessage',
                text: text
            });
        }

        // Handle suggestion clicks
        document.querySelectorAll('.suggestion-button').forEach(button => {
            button.addEventListener('click', () => {
                const suggestion = button.getAttribute('data-suggestion');
                if (suggestion) {
                    input.value = suggestion;
                    input.focus();
                    // Optionally auto-send
                    // sendMessage();
                }
            });
        });

        sendButton.addEventListener('click', sendMessage);

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Hide/show suggestions based on input state
        input.addEventListener('input', () => {
            if (input.value.trim().length > 0) {
                suggestionsContainer.classList.add('hidden');
            } else if (messagesDiv.children.length <= 1) {
                // Show suggestions when input is cleared (only if no messages yet)
                const hasOnlyWelcome = messagesDiv.children.length === 1 && 
                    messagesDiv.children[0].classList.contains('assistant-message');
                if (hasOnlyWelcome) {
                    suggestionsContainer.classList.remove('hidden');
                }
            }
        });

        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'streamChunk':
                    updateLastMessage(message.chunk);
                    break;
                case 'streamComplete':
                    // Stream complete
                    break;
                case 'error':
                    addMessage('Error: ' + message.error, false);
                    break;
                case 'refresh':
                    if (message.message) {
                        addMessage(message.message, false);
                    }
                    break;
            }
        });

        // Focus input on load
        input.focus();

        // Show welcome message on load
        const welcomeMessage = ${JSON.stringify(welcomeMessage)};
        if (welcomeMessage) {
            addMessage(welcomeMessage, false);
        }
    </script>
</body>
</html>`
  }
}

// Legacy function for backward compatibility (opens as command)
export async function startChat(
  context: vscode.ExtensionContext,
  llmService: LLMService
) {
  await vscode.commands.executeCommand('scriptly.chatView.focus')
}

