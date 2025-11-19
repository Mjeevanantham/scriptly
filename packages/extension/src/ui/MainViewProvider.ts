import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { LLMService } from '../services/LLMService'
import { ConfigService } from '../services/ConfigService'
import { Logger } from '../utils/Logger'
import { ChatRequest } from '../types'

export class MainViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'scriptly.chatView'

  private _view?: vscode.WebviewView
  private _llmService?: LLMService
  private _configService?: ConfigService

  constructor(
    private readonly _context: vscode.ExtensionContext,
    configService: ConfigService,
    llmService: LLMService
  ) {
    this._configService = configService
    this._llmService = llmService
  }

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._context.extensionUri],
    }

    // Check if API key is configured
    const hasApiKey = await this._checkApiKeyConfigured()

    webviewView.webview.html = this._getWebviewContent(webviewView.webview, hasApiKey)

    // Handle messages from webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      await this._handleMessage(message)
    })
  }

  private async _checkApiKeyConfigured(): Promise<boolean> {
    if (!this._configService) return false
    try {
      const config = await this._configService.getLLMConfig()
      return !!(config.apiKey || config.provider === 'ollama')
    } catch {
      return false
    }
  }

  private async _handleMessage(message: any) {
    if (!this._view) return

    switch (message.command) {
      case 'ready':
        // Webview is ready
        const hasApiKey = await this._checkApiKeyConfigured()
        this._view.webview.postMessage({
          command: 'setAuth',
          isAuthenticated: hasApiKey,
        })
        break

      case 'configureAPI':
        if (this._configService) {
          try {
            await this._configService.setApiKey(message.provider, message.apiKey)
            const valid = await this._configService.validateApiKey(
              message.provider
            )
            this._view.webview.postMessage({
              command: 'apiKeyConfigured',
              success: valid,
            })
            if (valid) {
              this._view.webview.postMessage({
                command: 'setAuth',
                isAuthenticated: true,
              })
            }
          } catch (error) {
            this._view.webview.postMessage({
              command: 'apiKeyConfigured',
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            })
          }
        }
        break

      case 'sendMessage':
        if (this._llmService && this._configService) {
          try {
            const config = await this._configService.getLLMConfig()
            if (!config.apiKey && config.provider !== 'ollama') {
              this._view.webview.postMessage({
                command: 'error',
                error: 'API key not configured',
              })
              return
            }

            // Switch provider if requested
            if (message.provider && message.provider !== config.provider) {
              await vscode.workspace
                .getConfiguration('scriptly')
                .update('llmProvider', message.provider, vscode.ConfigurationTarget.Workspace)
              // Invalidate model to force reload with new provider
              if (this._llmService) {
                this._llmService.invalidateModel()
              }
              // Get fresh config with new provider
              const newConfig = await this._configService.getLLMConfig()
              if (!newConfig.apiKey && newConfig.provider !== 'ollama') {
                this._view.webview.postMessage({
                  command: 'error',
                  error: `API key not configured for ${newConfig.provider}`,
                })
                return
              }
            }

            // Get workspace context
            const workspaceFolders = vscode.workspace.workspaceFolders
            let codebaseContext = ''

            if (workspaceFolders && workspaceFolders.length > 0) {
              codebaseContext = await this._getCodebaseContext(workspaceFolders[0].uri.fsPath)
            }

            const request: ChatRequest = {
              message: message.text,
              fileContext: codebaseContext,
              selectedCode: '',
              conversationId: message.conversationId || 'default',
            }

            // Stream response
            for await (const chunk of this._llmService.streamChatResponse(request)) {
              this._view.webview.postMessage({
                command: 'streamChunk',
                chunk,
              })
            }

            this._view.webview.postMessage({
              command: 'streamComplete',
            })
          } catch (error) {
            this._view.webview.postMessage({
              command: 'error',
              error: error instanceof Error ? error.message : 'Unknown error',
            })
          }
        }
        break

      case 'navigate':
        // Handle navigation requests - update webview
        if (this._view) {
          this._view.webview.postMessage({
            command: 'navigate',
            page: message.page,
          })
        }
        break

      case 'codeReview':
        // Handle code review requests
        if (this._llmService && this._configService) {
          // Placeholder for code review functionality
          setTimeout(() => {
            this._view?.webview.postMessage({
              command: 'reviewResults',
              results: { message: 'Code review feature coming soon' },
            })
          }, 500)
        }
        break

      case 'research':
        // Handle research requests
        if (this._llmService && this._configService) {
          // Placeholder for research functionality
          setTimeout(() => {
            this._view?.webview.postMessage({
              command: 'researchResults',
              results: [{ file: 'example.ts', content: 'Research results coming soon' }],
            })
          }, 500)
        }
        break

      case 'openSettings':
        // Open VS Code settings
        if (message.section === 'api') {
          vscode.commands.executeCommand('scriptly.configureAPI')
        }
        break

      case 'logout':
        // Handle logout
        if (this._view) {
          this._view.webview.postMessage({
            command: 'logout',
          })
        }
        // Clear API keys from secrets (optional - user might want to keep them)
        // For now, just reset auth state
        break

      default:
        Logger.warn('MainViewProvider', 'Unknown message command', { command: message.command })
    }
  }

  private async _getCodebaseContext(workspacePath: string): Promise<string> {
    try {
      const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs', '.sql', '.vue', '.svelte']
      const ignoreDirs = ['node_modules', '.git', 'dist', 'build', 'out', '.next', '.vscode', 'coverage', '.turbo', 'logs', 'log']
      const ignoreFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', '.gitignore', '.env', '.log']
      
      const priorityFiles = ['package.json', 'tsconfig.json', 'README.md', 'index.ts', 'index.js', 'main.ts', 'main.js', 'app.ts', 'app.js']
      
      const codeFiles: Array<{ path: string; content: string; name: string; priority: number }> = []
      const maxFileSize = 50000
      const maxFiles = 20
      const maxCharsPerFile = 800
      const maxTotalChars = 15000

      const getFilePriority = (fileName: string, filePath: string): number => {
        if (priorityFiles.includes(fileName)) return 10
        if (fileName.includes('config')) return 8
        if (fileName.startsWith('index') || fileName.startsWith('main') || fileName.startsWith('app')) return 7
        if (filePath.includes('src') || filePath.includes('lib') || filePath.includes('components')) return 6
        if (filePath.includes('test') || filePath.includes('spec')) return 2
        return 1
      }

      const walkDir = (dir: string, depth: number = 0): void => {
        if (depth > 4) return
        
        try {
          const entries = fs.readdirSync(dir, { withFileTypes: true })
          
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
            
            if (entry.isDirectory()) {
              if (!ignoreDirs.includes(entry.name) && !entry.name.startsWith('.') && !relativePath.includes('node_modules')) {
                walkDir(fullPath, depth + 1)
              }
            } else if (entry.isFile()) {
              const ext = path.extname(entry.name).toLowerCase()
              const isPriorityFile = priorityFiles.includes(entry.name)
              
              if ((codeExtensions.includes(ext) || isPriorityFile) && !ignoreFiles.includes(entry.name)) {
                try {
                  const stats = fs.statSync(fullPath)
                  if (stats.size <= maxFileSize) {
                    const content = fs.readFileSync(fullPath, 'utf8')
                    const priority = getFilePriority(entry.name, relativePath)
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

      codeFiles.sort((a, b) => b.priority - a.priority)

      let context = `Project Codebase (${codeFiles.length} key files):\n\n`
      let totalChars = context.length

      for (const file of codeFiles) {
        const fileContext = `[${file.path}]\n${file.content}\n\n`
        const fileContextLength = fileContext.length
        
        if (totalChars + fileContextLength > maxTotalChars) {
          break
        }
        
        context += fileContext
        totalChars += fileContextLength
      }

      return context
    } catch (error) {
      Logger.error('MainViewProvider', 'Failed to get codebase context', error)
      return ''
    }
  }

  private _getWebviewContent(webview: vscode.Webview, hasApiKey: boolean): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scriptly</title>
    <style>
        ${this._getStyles()}
    </style>
</head>
<body>
    <div id="root"></div>
    <script>
        (function() {
            try {
                const vscode = acquireVsCodeApi();
                window.vscode = vscode;
                window.initialState = { isAuthenticated: ${hasApiKey} };
                
                // Error handler
                window.addEventListener('error', (e) => {
                    console.error('Script error:', e.error);
                    const rootEl = document.getElementById('root');
                    if (rootEl) {
                        rootEl.innerHTML = '<div style="padding: 20px; color: var(--vscode-errorForeground);"><p>Error loading Scriptly</p><p style="font-size: 0.875rem; opacity: 0.7; margin-top: 8px;">' + (e.error?.message || 'Unknown error') + '</p></div>';
                    }
                });
                
                window.addEventListener('unhandledrejection', (e) => {
                    console.error('Unhandled promise rejection:', e.reason);
                });
                
                // Use fallback for now to ensure it works
                try {
                    ${this._getFallbackScript()}
                } catch (e) {
                    console.error('Fallback script error:', e);
                    const rootEl = document.getElementById('root');
                    if (rootEl) {
                        rootEl.innerHTML = '<div style="padding: 20px;"><h2 style="margin-bottom: 12px;">Scriptly</h2><p style="opacity: 0.7;">Initializing...</p></div>';
                    }
                }
                
                // Try to load React in background for enhanced UI
                setTimeout(() => {
                    try {
                        const reactScript = document.createElement('script');
                        reactScript.crossOrigin = 'anonymous';
                        reactScript.src = 'https://unpkg.com/react@18/umd/react.production.min.js';
                        reactScript.onload = () => {
                            const reactDOMScript = document.createElement('script');
                            reactDOMScript.crossOrigin = 'anonymous';
                            reactDOMScript.src = 'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js';
                            reactDOMScript.onload = () => {
                                const zustandScript = document.createElement('script');
                                zustandScript.src = 'https://unpkg.com/zustand@4.5.2/index.umd.js';
                                zustandScript.onload = () => {
                                    // React loaded successfully, can enhance UI later
                                    console.log('React loaded successfully');
                                };
                                document.head.appendChild(zustandScript);
                            };
                            document.head.appendChild(reactDOMScript);
                        };
                        document.head.appendChild(reactScript);
                    } catch (e) {
                        console.warn('Failed to load React:', e);
                    }
                }, 100);
            } catch (e) {
                console.error('Initialization error:', e);
                document.getElementById('root').innerHTML = '<div style="padding: 20px; color: var(--vscode-errorForeground);">Error: ' + e.message + '</div>';
            }
        })();
    </script>
</body>
</html>`
  }

  private _getFallbackScript(): string {
    // Fallback vanilla JS version if React fails to load
    // Use string concatenation to avoid template literal nesting issues
    return `
        const root = document.getElementById('root');
        const hasApiKey = window.initialState?.isAuthenticated || false;
        let currentPage = hasApiKey ? 'dashboard' : 'login';
        
        // Make functions globally accessible
        window.navigate = function(page) {
            currentPage = page;
            renderPage();
            vscode.postMessage({ command: 'navigate', page });
        };
        
        window.sendMessage = function() {
            const input = document.getElementById('chatInput');
            const messages = document.getElementById('messages');
            if (!input || !input.value.trim()) return;
            
            const userMsg = input.value;
            messages.innerHTML += '<div class="mb-4 text-right"><div class="inline-block p-3 bg-button-background text-button-foreground rounded-lg max-w-[80%]">' + escapeHtml(userMsg) + '</div></div>';
            input.value = '';
            messages.scrollTop = messages.scrollHeight;
            
            vscode.postMessage({ command: 'sendMessage', text: userMsg });
            
            let fullResponse = '';
            const listener = function(event) {
                const data = event.data;
                if (data.command === 'streamChunk') {
                    fullResponse += data.chunk;
                    const lastMsg = messages.lastElementChild;
                    if (lastMsg && lastMsg.classList.contains('assistant')) {
                        lastMsg.querySelector('.message-content').textContent = fullResponse;
                    } else {
                        messages.innerHTML += '<div class="mb-4 assistant"><div class="message-content p-3 bg-input-background border border-border rounded-lg max-w-[80%]">' + escapeHtml(fullResponse) + '</div></div>';
                    }
                    messages.scrollTop = messages.scrollHeight;
                } else if (data.command === 'streamComplete' || data.command === 'error') {
                    if (data.command === 'error') {
                        messages.innerHTML += '<div class="mb-4 assistant"><div class="message-content p-3 bg-error-bg text-error rounded-lg">Error: ' + escapeHtml(data.error || 'Unknown error') + '</div></div>';
                    }
                    window.removeEventListener('message', listener);
                }
            };
            window.addEventListener('message', listener);
        };
        
        window.logout = function() {
            vscode.postMessage({ command: 'logout' });
        };
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        function renderLogin() {
            root.innerHTML = '<div class="login-page flex items-center justify-center h-full p-8">' +
                '<div class="login-container w-full max-w-md">' +
                    '<div class="login-header text-center mb-8">' +
                        '<h1 class="text-3xl font-semibold mb-2" style="color: var(--text-primary); letter-spacing: 0.05em;">SCRIPTLY</h1>' +
                        '<p class="text-sm" style="color: var(--text-secondary);">Enter your API key to get started</p>' +
                    '</div>' +
                    '<form id="loginForm" class="login-form space-y-4">' +
                        '<div><label class="block text-sm mb-2" style="color: var(--text-primary);">Provider</label>' +
                        '<select id="provider" class="w-full p-2 bg-input-background border border-border rounded" style="color: var(--text-primary);">' +
                            '<option value="openai">OpenAI</option>' +
                            '<option value="claude">Anthropic Claude</option>' +
                            '<option value="ollama">Ollama (Local)</option>' +
                        '</select></div>' +
                        '<div><label class="block text-sm mb-2" style="color: var(--text-primary);">API Key</label>' +
                        '<input type="password" id="apiKey" placeholder="Enter your API key" ' +
                               'class="w-full p-2 bg-input-background border border-border rounded" style="color: var(--text-primary);" required></div>' +
                        '<button type="submit" class="w-full p-3 bg-button-background text-button-foreground rounded hover:bg-button-hover font-medium">Continue</button>' +
                    '</form>' +
                '</div>' +
            '</div>';
            document.getElementById('loginForm').addEventListener('submit', (e) => {
                e.preventDefault();
                const provider = document.getElementById('provider').value;
                const apiKey = document.getElementById('apiKey').value;
                vscode.postMessage({ command: 'configureAPI', provider, apiKey });
            });
        }
        
        function renderDashboard() {
            root.innerHTML = '<div class="dashboard-page p-8">' +
                '<div class="dashboard-header mb-8 flex items-center justify-between">' +
                    '<div><h1 class="text-2xl font-semibold mb-2" style="color: var(--text-primary);">Dashboard</h1>' +
                    '<p class="text-sm" style="color: var(--text-secondary);">Welcome back! What would you like to do?</p></div>' +
                    '<button onclick="window.logout()" class="logout-btn px-3 py-1.5 bg-input-background border border-border rounded text-sm hover:bg-button-background hover:text-button-foreground flex items-center gap-1.5">' +
                        '<span class="icon icon-logout"></span> Logout' +
                    '</button>' +
                '</div>' +
                '<div class="quick-actions grid grid-cols-2 gap-4">' +
                    '<button data-page="chat" class="action-card p-6 bg-input-background border border-border rounded-lg hover:border-focus-border text-left cursor-pointer transition-all mode-chat">' +
                        '<div class="flex items-center gap-3 mb-3">' +
                        '<span class="icon icon-chat text-xl" style="color: var(--mode-chat-accent);"></span>' +
                        '<h3 class="font-semibold" style="color: var(--text-primary);">Chat</h3>' +
                    '</div>' +
                        '<p class="text-sm" style="color: var(--text-secondary);">Ask questions about your code</p>' +
                    '</button>' +
                    '<button data-page="code-review" class="action-card p-6 bg-input-background border border-border rounded-lg hover:border-focus-border text-left cursor-pointer transition-all mode-code">' +
                        '<div class="flex items-center gap-3 mb-3">' +
                            '<span class="icon icon-code text-xl" style="color: var(--mode-code-accent);"></span>' +
                        '<h3 class="font-semibold" style="color: var(--text-primary);">Code Review</h3>' +
                    '</div>' +
                        '<p class="text-sm" style="color: var(--text-secondary);">Review and refactor code</p>' +
                    '</button>' +
                    '<button data-page="research" class="action-card p-6 bg-input-background border border-border rounded-lg hover:border-focus-border text-left cursor-pointer transition-all mode-research">' +
                        '<div class="flex items-center gap-3 mb-3">' +
                            '<span class="icon icon-research text-xl" style="color: var(--mode-research-accent);"></span>' +
                        '<h3 class="font-semibold" style="color: var(--text-primary);">Research</h3>' +
                    '</div>' +
                        '<p class="text-sm" style="color: var(--text-secondary);">Search your codebase</p>' +
                    '</button>' +
                    '<button data-page="deployment" class="action-card p-6 bg-input-background border border-border rounded-lg hover:border-focus-border text-left cursor-pointer transition-all">' +
                        '<div class="flex items-center gap-3 mb-3">' +
                            '<span class="icon icon-deployment text-xl" style="color: var(--link);"></span>' +
                            '<h3 class="font-semibold" style="color: var(--text-primary);">Deployment</h3>' +
                        '</div>' +
                        '<p class="text-sm" style="color: var(--text-secondary);">Deploy your application</p>' +
                    '</button>' +
                '</div>' +
            '</div>';
            // Add event listeners
            root.querySelectorAll('.action-card').forEach(btn => {
                btn.addEventListener('click', function() {
                    window.navigate(this.getAttribute('data-page'));
                });
            });
        }
        
        function renderChat() {
            document.body.setAttribute('data-mode', 'chat');
            root.innerHTML = '<div class="chat-page flex flex-col h-full">' +
                '<div class="chat-header border-b border-border p-3 flex items-center justify-between" style="border-bottom-color: var(--mode-chat-accent);">' +
                    '<div class="flex items-center gap-2">' +
                        '<span class="icon icon-chat text-lg" style="color: var(--mode-chat-accent);"></span>' +
                        '<h2 class="text-lg font-semibold" style="color: var(--text-primary);">Chat</h2>' +
                    '</div>' +
                    '<div class="flex gap-2">' +
                        '<button data-action="dashboard" class="back-btn px-3 py-1.5 bg-input-background border border-border rounded text-sm hover:bg-button-background hover:text-button-foreground cursor-pointer flex items-center gap-1.5">' +
                            '<span class="icon icon-back"></span> Back' +
                        '</button>' +
                        '<button onclick="window.logout()" class="logout-btn px-3 py-1.5 bg-input-background border border-border rounded text-sm hover:bg-button-background hover:text-button-foreground cursor-pointer flex items-center gap-1.5">' +
                            '<span class="icon icon-logout"></span> Logout' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                '<div class="messages-container flex-1 overflow-y-auto p-4" id="messages"><div class="welcome-message text-center mt-8"><p style="color: var(--text-secondary);">Welcome to Scriptly Chat! Ask me anything about your code.</p></div></div>' +
                '<div class="input-container border-t border-border p-4">' +
                    '<div class="input-wrapper flex gap-2">' +
                        '<input type="text" id="chatInput" placeholder="Ask about your code..." ' +
                               'class="flex-1 p-2 bg-input-background border border-border rounded" style="color: var(--text-primary);" />' +
                        '<button id="sendBtn" class="px-4 py-2 bg-button-background text-button-foreground rounded hover:bg-button-hover cursor-pointer">Send</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
            // Add event listeners
            const input = document.getElementById('chatInput');
            const sendBtn = document.getElementById('sendBtn');
            const backBtn = root.querySelector('.back-btn');
            if (input) {
                input.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') window.sendMessage();
                });
            }
            if (sendBtn) {
                sendBtn.addEventListener('click', window.sendMessage);
            }
            if (backBtn) {
                backBtn.addEventListener('click', function() {
                    window.navigate('dashboard');
                });
            }
        }
        
        function renderCodeReview() {
            document.body.setAttribute('data-mode', 'code');
            root.innerHTML = '<div class="code-review-page p-8">' +
                '<div class="page-header mb-6">' +
                    '<div class="flex items-center gap-2 mb-2">' +
                        '<span class="icon icon-code text-2xl" style="color: var(--mode-code-accent);"></span>' +
                        '<h1 class="text-2xl font-semibold" style="color: var(--text-primary);">Code Review</h1>' +
                    '</div>' +
                    '<p class="text-sm" style="color: var(--text-secondary);">Analyze, refactor, and improve your code</p>' +
                '</div>' +
                '<div class="actions flex gap-2 mb-6">' +
                    '<button data-action="findBugs" class="action-btn px-4 py-2 bg-button-background text-button-foreground rounded hover:bg-button-hover cursor-pointer flex items-center gap-2">' +
                        '<span class="icon icon-bug"></span> Find Bugs' +
                    '</button>' +
                    '<button data-action="refactor" class="action-btn px-4 py-2 bg-button-background text-button-foreground rounded hover:bg-button-hover cursor-pointer flex items-center gap-2">' +
                        '<span class="icon icon-refactor"></span> Suggest Refactoring' +
                    '</button>' +
                    '<button data-action="generateTests" class="action-btn px-4 py-2 bg-button-background text-button-foreground rounded hover:bg-button-hover cursor-pointer flex items-center gap-2">' +
                        '<span class="icon icon-test"></span> Generate Tests' +
                    '</button>' +
                '</div>' +
                '<div class="flex gap-2">' +
                    '<button data-action="dashboard" class="back-btn px-4 py-2 bg-input-background border border-border rounded cursor-pointer hover:bg-button-background hover:text-button-foreground flex items-center gap-1.5">' +
                        '<span class="icon icon-back"></span> Back' +
                    '</button>' +
                    '<button onclick="window.logout()" class="logout-btn px-4 py-2 bg-input-background border border-border rounded cursor-pointer hover:bg-button-background hover:text-button-foreground flex items-center gap-1.5">' +
                        '<span class="icon icon-logout"></span> Logout' +
                    '</button>' +
                '</div>' +
            '</div>';
            // Add event listeners
            root.querySelectorAll('.action-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    vscode.postMessage({ command: 'codeReview', action: this.getAttribute('data-action') });
                });
            });
            root.querySelectorAll('.back-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    window.navigate('dashboard');
                });
            });
        }
        
        function renderResearch() {
            document.body.setAttribute('data-mode', 'research');
            root.innerHTML = '<div class="research-page p-8">' +
                '<div class="page-header mb-6">' +
                    '<div class="flex items-center gap-2 mb-2">' +
                        '<span class="icon icon-research text-2xl" style="color: var(--mode-research-accent);"></span>' +
                        '<h1 class="text-2xl font-semibold" style="color: var(--text-primary);">Research</h1>' +
                    '</div>' +
                    '<p class="text-sm" style="color: var(--text-secondary);">Search your codebase with AI-powered semantic search</p>' +
                '</div>' +
                '<div class="search-container mb-6">' +
                    '<div class="search-input-wrapper flex gap-2">' +
                        '<input type="text" id="searchQuery" placeholder="Search codebase..." ' +
                               'class="flex-1 p-3 bg-input-background border border-border rounded" style="color: var(--text-primary);" />' +
                        '<button id="searchBtn" class="px-6 py-3 bg-button-background text-button-foreground rounded hover:bg-button-hover cursor-pointer flex items-center gap-2">' +
                            '<span class="icon icon-research"></span> Search' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                '<div class="flex gap-2">' +
                    '<button data-action="dashboard" class="back-btn px-4 py-2 bg-input-background border border-border rounded cursor-pointer hover:bg-button-background hover:text-button-foreground flex items-center gap-1.5">' +
                        '<span class="icon icon-back"></span> Back' +
                    '</button>' +
                    '<button onclick="window.logout()" class="logout-btn px-4 py-2 bg-input-background border border-border rounded cursor-pointer hover:bg-button-background hover:text-button-foreground flex items-center gap-1.5">' +
                        '<span class="icon icon-logout"></span> Logout' +
                    '</button>' +
                '</div>' +
            '</div>';
            // Add event listeners
            const searchInput = document.getElementById('searchQuery');
            const searchBtn = document.getElementById('searchBtn');
            if (searchInput) {
                searchInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        vscode.postMessage({ command: 'research', query: searchInput.value });
                    }
                });
            }
            if (searchBtn) {
                searchBtn.addEventListener('click', function() {
                    const query = document.getElementById('searchQuery').value;
                    if (query) vscode.postMessage({ command: 'research', query: query });
                });
            }
            root.querySelectorAll('.back-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    window.navigate('dashboard');
                });
            });
        }
        
        function renderSettings() {
            document.body.setAttribute('data-mode', 'settings');
            root.innerHTML = '<div class="settings-page p-8">' +
                '<div class="page-header mb-6">' +
                    '<div class="flex items-center gap-2 mb-2">' +
                        '<span class="icon icon-settings text-2xl" style="color: var(--mode-settings-accent);"></span>' +
                        '<h1 class="text-2xl font-semibold" style="color: var(--text-primary);">Settings</h1>' +
                    '</div>' +
                    '<p class="text-sm" style="color: var(--text-secondary);">Configure your Scriptly preferences</p>' +
                '</div>' +
                '<div class="setting-section mb-6 p-4 bg-input-background border border-border rounded">' +
                    '<h2 class="text-lg font-semibold mb-3" style="color: var(--text-primary);">API Keys</h2>' +
                    '<button id="configureApiBtn" class="px-4 py-2 bg-button-background text-button-foreground rounded hover:bg-button-hover cursor-pointer">Configure API Keys</button>' +
                '</div>' +
                '<div class="flex gap-2">' +
                    '<button data-action="dashboard" class="back-btn px-4 py-2 bg-input-background border border-border rounded cursor-pointer hover:bg-button-background hover:text-button-foreground flex items-center gap-1.5">' +
                        '<span class="icon icon-back"></span> Back' +
                    '</button>' +
                    '<button onclick="window.logout()" class="logout-btn px-4 py-2 bg-button-background text-button-foreground rounded hover:bg-button-hover cursor-pointer flex items-center gap-1.5">' +
                        '<span class="icon icon-logout"></span> Logout' +
                    '</button>' +
                '</div>' +
            '</div>';
            // Add event listeners
            const configureBtn = document.getElementById('configureApiBtn');
            if (configureBtn) {
                configureBtn.addEventListener('click', function() {
                    vscode.postMessage({ command: 'openSettings', section: 'api' });
                });
            }
            root.querySelectorAll('.back-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    window.navigate('dashboard');
                });
            });
        }
        
        function renderDeployment() {
            root.innerHTML = '<div class="deployment-page p-8">' +
                '<div class="page-header mb-6">' +
                    '<div class="flex items-center gap-2 mb-2">' +
                        '<span class="icon icon-deployment text-2xl" style="color: var(--link);"></span>' +
                        '<h1 class="text-2xl font-semibold" style="color: var(--text-primary);">Deployment</h1>' +
                    '</div>' +
                    '<p class="text-sm" style="color: var(--text-secondary);">Deploy your application to cloud platforms</p>' +
                '</div>' +
                '<div class="targets-grid grid grid-cols-3 gap-4 mb-6">' +
                    '<button class="target-card p-6 border rounded-lg text-center bg-input-background border-border hover:border-focus-border cursor-pointer transition-all">' +
                        '<div class="mb-2"><span class="icon icon-deployment text-3xl" style="color: var(--link);"></span></div>' +
                        '<div class="font-semibold" style="color: var(--text-primary);">Vercel</div>' +
                    '</button>' +
                    '<button class="target-card p-6 border rounded-lg text-center bg-input-background border-border hover:border-focus-border cursor-pointer transition-all">' +
                        '<div class="mb-2"><span class="icon icon-deployment text-3xl" style="color: var(--link);"></span></div>' +
                        '<div class="font-semibold" style="color: var(--text-primary);">AWS</div>' +
                    '</button>' +
                    '<button class="target-card p-6 border rounded-lg text-center bg-input-background border-border hover:border-focus-border cursor-pointer transition-all">' +
                        '<div class="mb-2"><span class="icon icon-deployment text-3xl" style="color: var(--link);"></span></div>' +
                        '<div class="font-semibold" style="color: var(--text-primary);">DigitalOcean</div>' +
                    '</button>' +
                '</div>' +
                '<div class="flex gap-2">' +
                    '<button data-action="dashboard" class="back-btn px-4 py-2 bg-input-background border border-border rounded cursor-pointer hover:bg-button-background hover:text-button-foreground flex items-center gap-1.5">' +
                        '<span class="icon icon-back"></span> Back' +
                    '</button>' +
                    '<button onclick="window.logout()" class="logout-btn px-4 py-2 bg-input-background border border-border rounded cursor-pointer hover:bg-button-background hover:text-button-foreground flex items-center gap-1.5">' +
                        '<span class="icon icon-logout"></span> Logout' +
                    '</button>' +
                '</div>' +
            '</div>';
            root.querySelectorAll('.back-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    window.navigate('dashboard');
                });
            });
        }
        
        function renderPage() {
            if (currentPage === 'login') {
                renderLogin();
            } else if (currentPage === 'dashboard') {
                renderDashboard();
            } else if (currentPage === 'chat') {
                renderChat();
            } else if (currentPage === 'code-review') {
                renderCodeReview();
            } else if (currentPage === 'research') {
                renderResearch();
            } else if (currentPage === 'settings') {
                renderSettings();
            } else if (currentPage === 'deployment') {
                renderDeployment();
            } else {
                root.innerHTML = '<div class="p-8"><h1 class="text-2xl font-bold mb-2">' + currentPage + '</h1><p class="text-sm opacity-70">Page coming soon</p><button data-action="dashboard" class="back-btn mt-4 px-4 py-2 bg-button-background text-button-foreground rounded cursor-pointer">← Back to Dashboard</button></div>';
                root.querySelectorAll('.back-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        window.navigate('dashboard');
                    });
                });
            }
        }
        
        
        window.addEventListener('message', (event) => {
            const message = event.data;
            if (message.command === 'setAuth') {
                window.initialState.isAuthenticated = message.isAuthenticated;
                currentPage = message.isAuthenticated ? 'dashboard' : 'login';
                renderPage();
            } else if (message.command === 'navigate') {
                currentPage = message.page || 'dashboard';
                renderPage();
            } else if (message.command === 'logout') {
                window.initialState.isAuthenticated = false;
                currentPage = 'login';
                renderPage();
            }
        });
        
        vscode.postMessage({ command: 'ready' });
        renderPage();
    `
  }

  private _getReactAppScript(): string {
    // This will be replaced with a proper bundler later
    // For now, return a simple React app that uses the components
    return `
        const { useState, useEffect, useRef } = React;
        const { create } = zustand;
        
        // Simple store
        const useAppStore = create((set) => ({
            isAuthenticated: window.initialState?.isAuthenticated || false,
            currentPage: window.initialState?.isAuthenticated ? 'dashboard' : 'login',
            currentMode: 'chat',
            isLoading: false,
            navigateTo: (page) => set({ currentPage: page }),
            setMode: (mode) => set({ currentMode: mode }),
            setAuthenticated: (auth) => set({ 
                isAuthenticated: auth,
                currentPage: auth ? 'dashboard' : 'login'
            }),
            setLoading: (loading) => set({ isLoading: loading }),
        }));

        // Simple App component
        function App() {
            const store = useAppStore();
            
            useEffect(() => {
                window.addEventListener('message', (event) => {
                    const message = event.data;
                    if (message.command === 'setAuth') {
                        store.setAuthenticated(message.isAuthenticated);
                    }
                });
                
                vscode.postMessage({ command: 'ready' });
            }, []);
            
            if (!store.isAuthenticated) {
                return React.createElement(LoginPage, { store });
            }
            
            switch (store.currentPage) {
                case 'dashboard': return React.createElement(DashboardPage, { store });
                case 'chat': return React.createElement(ChatPage, { store });
                case 'code-review': return React.createElement(CodeReviewPage, { store });
                case 'research': return React.createElement(ResearchPage, { store });
                case 'settings': return React.createElement(SettingsPage, { store });
                case 'deployment': return React.createElement(DeploymentPage, { store });
                case 'profiles': return React.createElement(ProfilesPage, { store });
                case 'history': return React.createElement(HistoryPage, { store });
                default: return React.createElement(DashboardPage, { store });
            }
        }
        
        // Simple page components
        function LoginPage({ store }) {
            const [apiKey, setApiKey] = useState('');
            const [provider, setProvider] = useState('openai');
            const [error, setError] = useState('');
            
            const handleSubmit = (e) => {
                e.preventDefault();
                vscode.postMessage({ command: 'configureAPI', provider, apiKey });
                
                const listener = (event) => {
                    const msg = event.data;
                    if (msg.command === 'apiKeyConfigured') {
                        if (msg.success) {
                            store.setAuthenticated(true);
                        } else {
                            setError(msg.error || 'Failed');
                        }
                        window.removeEventListener('message', listener);
                    }
                };
                window.addEventListener('message', listener);
            };
            
            return React.createElement('div', { className: 'login-page flex items-center justify-center h-full p-8' },
                React.createElement('div', { className: 'login-container w-full max-w-md' },
                    React.createElement('div', { className: 'login-header text-center mb-8' },
                        React.createElement('h1', { className: 'text-3xl font-bold mb-2' }, 'SCRIPTLY'),
                        React.createElement('p', { className: 'text-sm opacity-70' }, 'Enter your API key to get started')
                    ),
                    React.createElement('form', { onSubmit: handleSubmit, className: 'login-form space-y-4' },
                        React.createElement('div', null,
                            React.createElement('label', { className: 'block text-sm mb-2' }, 'Provider'),
                            React.createElement('select', {
                                value: provider,
                                onChange: (e) => setProvider(e.target.value),
                                className: 'w-full p-2 bg-input-background border border-border rounded'
                            },
                                React.createElement('option', { value: 'openai' }, 'OpenAI'),
                                React.createElement('option', { value: 'claude' }, 'Anthropic Claude'),
                                React.createElement('option', { value: 'ollama' }, 'Ollama (Local)')
                            )
                        ),
                        React.createElement('div', null,
                            React.createElement('label', { className: 'block text-sm mb-2' }, 'API Key'),
                            React.createElement('input', {
                                type: 'password',
                                value: apiKey,
                                onChange: (e) => setApiKey(e.target.value),
                                placeholder: 'Enter your API key',
                                className: 'w-full p-2 bg-input-background border border-border rounded',
                                required: true
                            })
                        ),
                        error && React.createElement('div', { className: 'error-message text-sm text-error bg-error-bg p-2 rounded' }, error),
                        React.createElement('button', {
                            type: 'submit',
                            disabled: !apiKey,
                            className: 'w-full p-3 bg-button-background text-button-foreground rounded hover:bg-button-hover disabled:opacity-50'
                        }, 'Continue')
                    )
                )
            );
        }
        
        function DashboardPage({ store }) {
            const actions = [
                { title: 'Chat', icon: '💬', page: 'chat', mode: 'chat' },
                { title: 'Code Review', icon: '💻', page: 'code-review', mode: 'code' },
                { title: 'Research', icon: '🔍', page: 'research', mode: 'research' },
                { title: 'Deployment', icon: '🚀', page: 'deployment' },
            ];
            
            return React.createElement('div', { className: 'dashboard-page p-8' },
                React.createElement('div', { className: 'dashboard-header mb-8' },
                    React.createElement('h1', { className: 'text-2xl font-bold mb-2' }, 'Dashboard'),
                    React.createElement('p', { className: 'text-sm opacity-70' }, 'Welcome back! What would you like to do?')
                ),
                React.createElement('div', { className: 'quick-actions grid grid-cols-2 gap-4' },
                    actions.map(action =>
                        React.createElement('button', {
                            key: action.title,
                            onClick: () => {
                                if (action.mode) store.setMode(action.mode);
                                store.navigateTo(action.page);
                            },
                            className: 'action-card p-6 bg-input-background border border-border rounded-lg hover:border-focus-border transition-all text-left'
                        },
                            React.createElement('div', { className: 'action-icon text-3xl mb-3' }, action.icon),
                            React.createElement('h3', { className: 'font-semibold mb-1' }, action.title)
                        )
                    )
                )
            );
        }
        
        function ChatPage({ store }) {
            const [message, setMessage] = useState('');
            const [messages, setMessages] = useState([]);
            const [isLoading, setIsLoading] = useState(false);
            const [selectedProvider, setSelectedProvider] = useState('openai');
            const [suggestions] = useState([
                'Analyze the codebase',
                'Analyze and document it',
                'Research and find the bugs',
                'Explain the architecture',
                'Suggest improvements',
                'Review code quality',
            ]);
            
            const handleSend = () => {
                if (!message.trim() || isLoading) return;
                const userMsg = { role: 'user', content: message };
                setMessages(prev => [...prev, userMsg]);
                setMessage('');
                setIsLoading(true);
                
                vscode.postMessage({ 
                    command: 'sendMessage', 
                    text: userMsg.content,
                    provider: selectedProvider
                });
                
                let fullResponse = '';
                const listener = (event) => {
                    const data = event.data;
                    if (data.command === 'streamChunk') {
                        fullResponse += data.chunk;
                        setMessages(prev => {
                            const newMsgs = [...prev];
                            const last = newMsgs[newMsgs.length - 1];
                            if (last?.role === 'assistant') {
                                last.content = fullResponse;
                            } else {
                                newMsgs.push({ role: 'assistant', content: fullResponse });
                            }
                            return newMsgs;
                        });
                    } else if (data.command === 'streamComplete' || data.command === 'error') {
                        setIsLoading(false);
                        window.removeEventListener('message', listener);
                    }
                };
                window.addEventListener('message', listener);
            };
            
            return React.createElement('div', { className: 'chat-page flex flex-col h-full' },
                React.createElement('div', { className: 'chat-header border-b border-border p-3 flex items-center justify-between' },
                    React.createElement('h2', { className: 'text-lg font-semibold' }, 'Chat'),
                    React.createElement('div', { className: 'provider-switcher flex items-center gap-2' },
                        React.createElement('label', { className: 'text-sm opacity-70' }, 'Provider:'),
                        React.createElement('select', {
                            value: selectedProvider,
                            onChange: (e) => setSelectedProvider(e.target.value),
                            className: 'px-2 py-1 bg-input-background border border-border rounded text-sm',
                            disabled: isLoading
                        },
                            React.createElement('option', { value: 'openai' }, 'OpenAI (GPT-4)'),
                            React.createElement('option', { value: 'claude' }, 'Anthropic (Claude)'),
                            React.createElement('option', { value: 'ollama' }, 'Ollama (Local)')
                        )
                    )
                ),
                React.createElement('div', { className: 'messages-container flex-1 overflow-y-auto p-4 space-y-4' },
                    messages.length === 0 && React.createElement('div', { className: 'welcome-message text-center opacity-70 mt-8' },
                        React.createElement('p', { className: 'mb-4' }, 'Welcome to Scriptly Chat! Ask me anything about your code.'),
                        React.createElement('div', { className: 'suggestions flex flex-wrap gap-2 justify-center' },
                            suggestions.map((suggestion, idx) =>
                                React.createElement('button', {
                                    key: idx,
                                    onClick: () => setMessage(suggestion),
                                    className: 'suggestion-button px-3 py-1.5 bg-input-background border border-border rounded text-sm hover:bg-button-background hover:text-button-foreground'
                                }, suggestion)
                            )
                        )
                    ),
                    messages.map((msg, idx) =>
                        React.createElement('div', {
                            key: idx,
                            className: \`message \${msg.role === 'user' ? 'user-message ml-auto' : 'assistant-message mr-auto'}\`
                        },
                            React.createElement('div', {
                                className: \`message-content p-3 rounded-lg \${msg.role === 'user' ? 'bg-button-background text-button-foreground' : 'bg-input-background border border-border'}\`
                            }, msg.content)
                        )
                    ),
                    isLoading && React.createElement('div', { className: 'loading-indicator flex items-center gap-2 opacity-70' },
                        React.createElement('div', { className: 'spinner w-4 h-4' }),
                        React.createElement('span', { className: 'text-sm' }, 'Thinking...')
                    )
                ),
                React.createElement('div', { className: 'input-container border-t border-border p-4' },
                    React.createElement('div', { className: 'input-wrapper flex gap-2' },
                        React.createElement('input', {
                            type: 'text',
                            value: message,
                            onChange: (e) => setMessage(e.target.value),
                            onKeyPress: (e) => e.key === 'Enter' && handleSend(),
                            placeholder: 'Ask about your code...',
                            className: 'flex-1 p-2 bg-input-background border border-border rounded',
                            disabled: isLoading
                        }),
                        React.createElement('button', {
                            onClick: handleSend,
                            disabled: isLoading || !message.trim(),
                            className: 'px-4 py-2 bg-button-background text-button-foreground rounded hover:bg-button-hover disabled:opacity-50'
                        }, 'Send')
                    )
                )
            );
        }
        
        function CodeReviewPage({ store }) {
            const [selectedFile, setSelectedFile] = useState('');
            const [reviewResults, setReviewResults] = useState(null);
            const [isReviewing, setIsReviewing] = useState(false);
            
            const handleFindBugs = () => {
                setIsReviewing(true);
                vscode.postMessage({ command: 'codeReview', action: 'findBugs', file: selectedFile });
                const listener = (event) => {
                    const data = event.data;
                    if (data.command === 'reviewResults') {
                        setReviewResults(data.results);
                        setIsReviewing(false);
                        window.removeEventListener('message', listener);
                    }
                };
                window.addEventListener('message', listener);
            };
            
            const handleRefactor = () => {
                setIsReviewing(true);
                vscode.postMessage({ command: 'codeReview', action: 'refactor', file: selectedFile });
                const listener = (event) => {
                    const data = event.data;
                    if (data.command === 'reviewResults') {
                        setReviewResults(data.results);
                        setIsReviewing(false);
                        window.removeEventListener('message', listener);
                    }
                };
                window.addEventListener('message', listener);
            };
            
            const handleGenerateTests = () => {
                setIsReviewing(true);
                vscode.postMessage({ command: 'codeReview', action: 'generateTests', file: selectedFile });
                const listener = (event) => {
                    const data = event.data;
                    if (data.command === 'reviewResults') {
                        setReviewResults(data.results);
                        setIsReviewing(false);
                        window.removeEventListener('message', listener);
                    }
                };
                window.addEventListener('message', listener);
            };
            
            return React.createElement('div', { className: 'code-review-page p-8' },
                React.createElement('div', { className: 'page-header mb-6' },
                    React.createElement('h1', { className: 'text-2xl font-bold mb-2' }, 'Code Review'),
                    React.createElement('p', { className: 'text-sm opacity-70' }, 'Analyze, refactor, and improve your code')
                ),
                React.createElement('div', { className: 'review-container grid grid-cols-2 gap-4' },
                    React.createElement('div', { className: 'file-selector' },
                        React.createElement('h2', { className: 'text-lg font-semibold mb-3' }, 'Select File'),
                        React.createElement('div', { className: 'file-list space-y-2' },
                            React.createElement('button', {
                                className: 'file-item w-full p-3 bg-input-background border border-border rounded text-left hover:bg-button-background hover:text-button-foreground',
                                onClick: () => setSelectedFile('current')
                            }, 'Current File')
                        )
                    ),
                    React.createElement('div', { className: 'review-panel' },
                        React.createElement('h2', { className: 'text-lg font-semibold mb-3' }, 'Review Results'),
                        React.createElement('div', { className: 'review-content p-4 bg-input-background border border-border rounded min-h-48' },
                            reviewResults ? React.createElement('pre', { className: 'text-sm whitespace-pre-wrap' }, JSON.stringify(reviewResults, null, 2)) :
                            React.createElement('p', { className: 'text-sm opacity-70' }, isReviewing ? 'Reviewing code...' : 'Select a file and choose an action to begin code review')
                        )
                    )
                ),
                React.createElement('div', { className: 'actions mt-6 flex gap-2' },
                    React.createElement('button', {
                        onClick: handleFindBugs,
                        disabled: isReviewing || !selectedFile,
                        className: 'px-4 py-2 bg-button-background text-button-foreground rounded hover:bg-button-hover disabled:opacity-50'
                    }, '🐛 Find Bugs'),
                    React.createElement('button', {
                        onClick: handleRefactor,
                        disabled: isReviewing || !selectedFile,
                        className: 'px-4 py-2 bg-button-background text-button-foreground rounded hover:bg-button-hover disabled:opacity-50'
                    }, '✨ Suggest Refactoring'),
                    React.createElement('button', {
                        onClick: handleGenerateTests,
                        disabled: isReviewing || !selectedFile,
                        className: 'px-4 py-2 bg-button-background text-button-foreground rounded hover:bg-button-hover disabled:opacity-50'
                    }, '✅ Generate Tests')
                )
            );
        }
        
        function ResearchPage({ store }) {
            const [query, setQuery] = useState('');
            const [results, setResults] = useState([]);
            const [isSearching, setIsSearching] = useState(false);
            
            const handleSearch = () => {
                if (!query.trim() || isSearching) return;
                setIsSearching(true);
                vscode.postMessage({ command: 'research', query: query.trim() });
                const listener = (event) => {
                    const data = event.data;
                    if (data.command === 'researchResults') {
                        setResults(data.results || []);
                        setIsSearching(false);
                        window.removeEventListener('message', listener);
                    }
                };
                window.addEventListener('message', listener);
            };
            
            return React.createElement('div', { className: 'research-page p-8' },
                React.createElement('div', { className: 'page-header mb-6' },
                    React.createElement('h1', { className: 'text-2xl font-bold mb-2' }, 'Research'),
                    React.createElement('p', { className: 'text-sm opacity-70' }, 'Search your codebase with AI-powered semantic search')
                ),
                React.createElement('div', { className: 'search-container mb-6' },
                    React.createElement('div', { className: 'search-input-wrapper flex gap-2' },
                        React.createElement('input', {
                            type: 'text',
                            value: query,
                            onChange: (e) => setQuery(e.target.value),
                            onKeyPress: (e) => e.key === 'Enter' && handleSearch(),
                            placeholder: 'Search codebase... (e.g., authentication logic, database connection)',
                            className: 'flex-1 p-3 bg-input-background border border-border rounded',
                            disabled: isSearching
                        }),
                        React.createElement('button', {
                            onClick: handleSearch,
                            disabled: isSearching || !query.trim(),
                            className: 'px-6 py-3 bg-button-background text-button-foreground rounded hover:bg-button-hover disabled:opacity-50'
                        }, isSearching ? 'Searching...' : '🔍 Search')
                    )
                ),
                React.createElement('div', { className: 'results-container' },
                    React.createElement('h2', { className: 'text-lg font-semibold mb-3' }, 'Results'),
                    React.createElement('div', { className: 'results-list space-y-2' },
                        results.length > 0 ? results.map((result, idx) =>
                            React.createElement('div', {
                                key: idx,
                                className: 'result-item p-4 bg-input-background border border-border rounded'
                            },
                                React.createElement('div', { className: 'font-semibold mb-1' }, result.file || result.title),
                                React.createElement('p', { className: 'text-sm opacity-70' }, result.content || result.description)
                            )
                        ) :
                        React.createElement('div', { className: 'result-item p-4 bg-input-background border border-border rounded' },
                            React.createElement('p', { className: 'text-sm opacity-70' }, isSearching ? 'Searching...' : 'Enter a search query to find code')
                        )
                    )
                )
            );
        }
        
        function SettingsPage({ store }) {
            const [theme, setTheme] = useState('system');
            const [offlineMode, setOfflineMode] = useState(false);
            
            const handleConfigureAPI = () => {
                vscode.postMessage({ command: 'openSettings', section: 'api' });
            };
            
            return React.createElement('div', { className: 'settings-page p-8' },
                React.createElement('div', { className: 'page-header mb-6' },
                    React.createElement('h1', { className: 'text-2xl font-bold mb-2' }, 'Settings'),
                    React.createElement('p', { className: 'text-sm opacity-70' }, 'Configure your Scriptly preferences')
                ),
                React.createElement('div', { className: 'settings-content space-y-6' },
                    React.createElement('div', { className: 'setting-section' },
                        React.createElement('h2', { className: 'text-lg font-semibold mb-3' }, 'API Keys'),
                        React.createElement('div', { className: 'setting-item p-4 bg-input-background border border-border rounded' },
                            React.createElement('p', { className: 'text-sm mb-2' }, 'Manage your API keys'),
                            React.createElement('button', {
                                onClick: handleConfigureAPI,
                                className: 'px-4 py-2 bg-button-background text-button-foreground rounded hover:bg-button-hover text-sm'
                            }, 'Configure API Keys')
                        )
                    ),
                    React.createElement('div', { className: 'setting-section' },
                        React.createElement('h2', { className: 'text-lg font-semibold mb-3' }, 'Preferences'),
                        React.createElement('div', { className: 'setting-item p-4 bg-input-background border border-border rounded space-y-3' },
                            React.createElement('div', { className: 'flex items-center justify-between' },
                                React.createElement('label', { className: 'text-sm' }, 'Theme'),
                                React.createElement('select', {
                                    value: theme,
                                    onChange: (e) => setTheme(e.target.value),
                                    className: 'px-3 py-1 bg-input-background border border-border rounded text-sm'
                                },
                                    React.createElement('option', { value: 'system' }, 'System'),
                                    React.createElement('option', { value: 'light' }, 'Light'),
                                    React.createElement('option', { value: 'dark' }, 'Dark')
                                )
                            ),
                            React.createElement('div', { className: 'flex items-center justify-between' },
                                React.createElement('label', { className: 'text-sm' }, 'Offline Mode'),
                                React.createElement('input', {
                                    type: 'checkbox',
                                    checked: offlineMode,
                                    onChange: (e) => setOfflineMode(e.target.checked),
                                    className: 'cursor-pointer'
                                })
                            )
                        )
                    ),
                    React.createElement('div', { className: 'setting-section' },
                        React.createElement('h2', { className: 'text-lg font-semibold mb-3' }, 'About'),
                        React.createElement('div', { className: 'setting-item p-4 bg-input-background border border-border rounded text-sm opacity-70' },
                            React.createElement('p', null, 'Scriptly v0.1.0'),
                            React.createElement('p', null, 'Free, unified IDE with AI-powered coding assistance')
                        )
                    )
                )
            );
        }
        
        function DeploymentPage({ store }) {
            const [selectedTarget, setSelectedTarget] = useState('');
            const targets = [
                { id: 'vercel', name: 'Vercel', icon: '▲' },
                { id: 'aws', name: 'AWS', icon: '☁️' },
                { id: 'digitalocean', name: 'DigitalOcean', icon: '🌊' },
            ];
            
            return React.createElement('div', { className: 'deployment-page p-8' },
                React.createElement('div', { className: 'page-header mb-6' },
                    React.createElement('h1', { className: 'text-2xl font-bold mb-2' }, 'Deployment'),
                    React.createElement('p', { className: 'text-sm opacity-70' }, 'Deploy your application to cloud platforms')
                ),
                React.createElement('div', { className: 'targets-grid grid grid-cols-3 gap-4 mb-6' },
                    targets.map(target =>
                        React.createElement('button', {
                            key: target.id,
                            onClick: () => setSelectedTarget(selectedTarget === target.id ? '' : target.id),
                            className: \`target-card p-6 border rounded-lg text-center transition-all \${selectedTarget === target.id ? 'bg-button-background text-button-foreground border-button-background' : 'bg-input-background border-border hover:border-focus-border'}\`
                        },
                            React.createElement('div', { className: 'target-icon text-4xl mb-2' }, target.icon),
                            React.createElement('div', { className: 'target-name font-semibold' }, target.name)
                        )
                    )
                ),
                selectedTarget && React.createElement('div', { className: 'deployment-config p-4 bg-input-background border border-border rounded' },
                    React.createElement('h2', { className: 'text-lg font-semibold mb-3' }, 'Configuration'),
                    React.createElement('p', { className: 'text-sm opacity-70' }, \`Configure deployment for \${targets.find(t => t.id === selectedTarget)?.name}\`)
                )
            );
        }
        
        function ProfilesPage({ store }) {
            return React.createElement('div', { className: 'profiles-page p-8' },
                React.createElement('h1', { className: 'text-2xl font-bold mb-2' }, 'Profiles'),
                React.createElement('p', { className: 'text-sm opacity-70' }, 'Manage your API key profiles')
            );
        }
        
        function HistoryPage({ store }) {
            const [activeTab, setActiveTab] = useState('all');
            const tabs = ['all', 'chat', 'code-review', 'deployment'];
            
            return React.createElement('div', { className: 'history-page p-8' },
                React.createElement('div', { className: 'page-header mb-6' },
                    React.createElement('h1', { className: 'text-2xl font-bold mb-2' }, 'History'),
                    React.createElement('p', { className: 'text-sm opacity-70' }, 'View your past conversations and activities')
                ),
                React.createElement('div', { className: 'history-tabs mb-4 flex gap-2 border-b border-border' },
                    tabs.map(tab =>
                        React.createElement('button', {
                            key: tab,
                            onClick: () => setActiveTab(tab),
                            className: \`tab-button px-4 py-2 border-b-2 \${activeTab === tab ? 'border-button-background font-semibold' : 'border-transparent opacity-70 hover:opacity-100'}\`
                        }, tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' '))
                    )
                ),
                React.createElement('div', { className: 'history-list space-y-2' },
                    React.createElement('div', { className: 'history-item p-4 bg-input-background border border-border rounded' },
                        React.createElement('p', { className: 'text-sm opacity-70' }, 'No history yet')
                    )
                )
            );
        }
        
        ReactDOM.render(React.createElement(App), document.getElementById('root'));
    `
  }

  private _getStyles(): string {
    return `
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        :root {
            --vscode-font-family: var(--vscode-font-family);
            --vscode-font-size: var(--vscode-font-size);
            --foreground: var(--vscode-foreground);
            --background: var(--vscode-editor-background);
            --border: var(--vscode-input-border);
            --button-bg: var(--vscode-button-background);
            --button-fg: var(--vscode-button-foreground);
            --button-hover: var(--vscode-button-hoverBackground);
            --input-bg: var(--vscode-input-background);
            --input-fg: var(--vscode-input-foreground);
            --input-border: var(--vscode-input-border);
            --focus-border: var(--vscode-focusBorder);
            --scrollbar: var(--vscode-scrollbarSlider-background);
            --scrollbar-hover: var(--vscode-scrollbarSlider-hoverBackground);
            --error: var(--vscode-errorForeground);
            --error-bg: var(--vscode-inputValidation-errorBackground);
            --link: var(--vscode-textLink-foreground);
            
            /* Mode-specific colors */
            --mode-chat-accent: #0E639C;
            --mode-code-accent: #D67E00;
            --mode-research-accent: #811F3F;
            --mode-settings-accent: #6A8759;
            
            /* Neutral colors for better visibility */
            --text-primary: var(--vscode-foreground);
            --text-secondary: var(--vscode-descriptionForeground);
            --surface: var(--vscode-editor-background);
            --surface-elevated: var(--vscode-list-hoverBackground);
            --border-subtle: var(--vscode-widget-border);
        }
        
        /* Mode-specific themes */
        body[data-mode="chat"] {
            --mode-accent: var(--mode-chat-accent);
        }
        body[data-mode="code"] {
            --mode-accent: var(--mode-code-accent);
        }
        body[data-mode="research"] {
            --mode-accent: var(--mode-research-accent);
        }
        body[data-mode="settings"] {
            --mode-accent: var(--mode-settings-accent);
        }

        html, body {
            height: 100%;
            overflow: hidden;
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--text-primary);
            background: var(--surface);
        }
        
        /* Ensure all text elements use proper colors */
        h1, h2, h3, h4, h5, h6, p, span, div, label, button, input, select, textarea, a {
            color: var(--text-primary);
        }
        
        /* Professional icon system using Unicode and symbols */
        .icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 1em;
            line-height: 1;
            width: 1em;
            height: 1em;
        }
        
        /* Clean icon characters - professional look without emojis */
        .icon-chat::before { content: '●'; font-weight: 400; font-size: 0.85em; }
        .icon-code::before { content: '</>'; font-weight: 600; letter-spacing: -0.05em; font-family: 'Consolas', 'Monaco', monospace; }
        .icon-research::before { content: '○'; font-weight: 300; font-size: 1.1em; }
        .icon-deployment::before { content: '▲'; font-weight: 600; font-size: 0.9em; }
        .icon-settings::before { content: '⚙'; font-size: 0.9em; font-weight: 400; }
        .icon-logout::before { content: '→'; transform: rotate(180deg); display: inline-block; font-weight: 600; }
        .icon-back::before { content: '←'; font-weight: 600; }
        .icon-bug::before { content: '●'; font-size: 0.75em; }
        .icon-refactor::before { content: '⟲'; font-weight: 600; }
        .icon-test::before { content: '✓'; font-weight: 600; }
        
        /* Alternative: Use clean text icons */
        .icon-text {
            font-family: var(--vscode-font-family);
            font-size: 1em;
            font-weight: 600;
        }

        #root {
            height: 100%;
            width: 100%;
            display: flex;
            flex-direction: column;
            overflow: auto;
        }
        
        .dashboard-page, .chat-page, .code-review-page, .research-page, .settings-page, .deployment-page, .login-page {
            min-height: 100%;
            width: 100%;
        }
        
        .action-card {
            min-height: 120px;
            display: flex;
            flex-direction: column;
            transition: all 0.2s ease;
        }
        
        .action-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .max-w-\\[80\\%\\] {
            max-width: 80%;
        }
        
        .inline-block {
            display: inline-block;
        }
        
        .text-right {
            text-align: right;
        }

        /* Utility classes */
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .justify-center { justify-content: center; }
        .gap-1 { gap: 4px; }
        .gap-2 { gap: 8px; }
        .gap-4 { gap: 16px; }
        .space-y-2 > * + * { margin-top: 8px; }
        .space-y-3 > * + * { margin-top: 12px; }
        .space-y-4 > * + * { margin-top: 16px; }
        .space-y-6 > * + * { margin-top: 24px; }
        .px-3 { padding-left: 12px; padding-right: 12px; }
        .px-4 { padding-left: 16px; padding-right: 16px; }
        .px-6 { padding-left: 24px; padding-right: 24px; }
        .py-1 { padding-top: 4px; padding-bottom: 4px; }
        .py-1.5 { padding-top: 6px; padding-bottom: 6px; }
        .py-2 { padding-top: 8px; padding-bottom: 8px; }
        .py-3 { padding-top: 12px; padding-bottom: 12px; }
        .p-2 { padding: 8px; }
        .p-3 { padding: 12px; }
        .p-4 { padding: 16px; }
        .p-6 { padding: 24px; }
        .p-8 { padding: 32px; }
        .mb-1 { margin-bottom: 4px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-3 { margin-bottom: 12px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-6 { margin-bottom: 24px; }
        .mb-8 { margin-bottom: 32px; }
        .mt-1 { margin-top: 4px; }
        .mt-4 { margin-top: 16px; }
        .mt-6 { margin-top: 24px; }
        .mt-8 { margin-top: 32px; }
        .rounded { border-radius: 4px; }
        .rounded-md { border-radius: 6px; }
        .rounded-lg { border-radius: 8px; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .text-lg { font-size: 1.125rem; }
        .text-2xl { font-size: 1.5rem; }
        .text-3xl { font-size: 1.875rem; }
        .text-4xl { font-size: 2.25rem; }
        .font-medium { font-weight: 500; }
        .font-semibold { font-weight: 600; }
        .font-bold { font-weight: 700; }
        .opacity-60 { opacity: 0.6; }
        .opacity-70 { opacity: 0.7; }
        .opacity-100 { opacity: 1; }
        .border { border: 1px solid var(--border); }
        .border-2 { border: 2px solid var(--border); }
        .border-t { border-top: 1px solid var(--border); }
        .border-b { border-bottom: 1px solid var(--border); }
        .border-b-2 { border-bottom: 2px solid var(--border); }
        .border-dashed { border-style: dashed; }
        .h-full { height: 100%; }
        .w-full { width: 100%; }
        .w-4 { width: 16px; }
        .h-4 { height: 16px; }
        .flex-1 { flex: 1; }
        .overflow-auto { overflow: auto; }
        .overflow-hidden { overflow: hidden; }
        .overflow-y-auto { overflow-y: auto; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }
        .hidden { display: none; }
        .fixed { position: fixed; }
        .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
        .z-50 { z-index: 50; }
        .transition-all { transition: all 0.2s ease; }
        .transition-opacity { transition: opacity 0.2s ease; }
        .cursor-pointer { cursor: pointer; }
        .bg-input-background { background: var(--input-bg); }
        .bg-button-background { background: var(--button-bg); }
        .bg-background { background: var(--background); }
        .bg-opacity-90 { background-color: rgba(0, 0, 0, 0.9); }
        .text-foreground { color: var(--foreground); }
        .text-button-foreground { color: var(--button-fg); }
        .text-error { color: var(--error); }
        .text-link { color: var(--link); }
        .border-border { border-color: var(--border); }
        .border-button-background { border-color: var(--button-bg); }
        .border-focus-border { border-color: var(--focus-border); }
        .bg-error-bg { background: var(--error-bg); }
        .hover\\:bg-button-background:hover { background: var(--button-bg); }
        .hover\\:bg-button-hover:hover { background: var(--button-hover); }
        .hover\\:text-button-foreground:hover { color: var(--button-fg); }
        .hover\\:border-focus-border:hover { border-color: var(--focus-border); }
        .hover\\:opacity-100:hover { opacity: 1; }
        .disabled\\:opacity-50:disabled { opacity: 0.5; }
        .disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .max-w-md { max-width: 28rem; }

        /* Spinner */
        @keyframes spinner {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .spinner {
            border: 2px solid var(--border);
            border-top-color: var(--button-bg);
            border-radius: 50%;
            animation: spinner 0.8s linear infinite;
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: var(--input-bg);
        }
        ::-webkit-scrollbar-thumb {
            background: var(--scrollbar);
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: var(--scrollbar-hover);
        }

        /* Layout */
        .layout-container {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        .layout-header {
            border-bottom: 1px solid var(--border);
        }
        .layout-main {
            flex: 1;
            overflow: auto;
        }
        .layout-footer {
            border-top: 1px solid var(--border);
            font-size: 0.75rem;
            opacity: 0.6;
        }

        /* Page transitions */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .page-enter {
            animation: fadeIn 0.2s ease-out;
        }

        /* Mode switch animations */
        @keyframes modeSwitch {
            0% { opacity: 0.5; transform: scale(0.98); }
            100% { opacity: 1; transform: scale(1); }
        }
        .mode-switch-active {
            animation: modeSwitch 0.3s ease-out;
        }

        /* Loader animations */
        @keyframes spinner {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .spinner {
            border: 2px solid var(--border);
            border-top-color: var(--button-bg);
            border-radius: 50%;
            animation: spinner 0.8s linear infinite;
        }
        
        .min-h-48 { min-height: 12rem; }
        .ml-auto { margin-left: auto; }
        .mr-auto { margin-right: auto; }
        .whitespace-pre-wrap { white-space: pre-wrap; }

        /* Input */
        input[type="text"],
        input[type="password"],
        select {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--input-fg);
            background: var(--input-bg);
            border: 1px solid var(--input-border);
            padding: 8px 12px;
            border-radius: 4px;
            outline: none;
        }
        input:focus,
        select:focus {
            outline: 1px solid var(--focus-border);
            outline-offset: -1px;
        }

        /* Button */
        button {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            cursor: pointer;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            transition: all 0.2s ease;
            outline: none;
        }
        button:hover {
            opacity: 0.9;
        }
        button:active {
            transform: scale(0.98);
        }
        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .cursor-pointer {
            cursor: pointer;
        }
    `
  }

  public refresh() {
    if (this._view) {
      this._checkApiKeyConfigured().then((hasApiKey) => {
        this._view!.webview.html = this._getWebviewContent(this._view!.webview, hasApiKey)
      })
    }
  }
}


