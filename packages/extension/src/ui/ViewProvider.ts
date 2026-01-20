import * as vscode from 'vscode'
import { ConfigService } from '../services/ConfigService'
import { LLMService } from '../services/LLMService'
import { RefactorService } from '../services/RefactorService'
import { TestService } from '../services/TestService'
import { CodeIndexer } from '../services/CodeIndexer'
import { SearchService } from '../services/SearchService'
import { Logger } from '../utils/Logger'
import * as path from 'path'
import * as fs from 'fs'

export class ViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'scriptly.chatView'

  private _view?: vscode.WebviewView
  private _configService: ConfigService
  private _llmService: LLMService
  private _refactorService: RefactorService
  private _testService: TestService
  private _codeIndexer: CodeIndexer
  private _searchService: SearchService

  constructor(
    private readonly _context: vscode.ExtensionContext,
    configService: ConfigService,
    llmService: LLMService
  ) {
    this._configService = configService
    this._llmService = llmService
    this._refactorService = new RefactorService(llmService)
    this._testService = new TestService(llmService)
    this._codeIndexer = new CodeIndexer()
    this._searchService = new SearchService(this._codeIndexer, llmService)
  }

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): Promise<void> {
    try {
      Logger.info('ViewProvider', 'Resolving webview view', {
        viewType: ViewProvider.viewType,
      })

      this._view = webviewView

      webviewView.webview.options = {
        enableScripts: true,
        localResourceRoots: [this._context.extensionUri],
      }

      Logger.debug('ViewProvider', 'Webview options configured')

      // Check if API key is configured
      let hasApiKey = false
      try {
        const config = await this._configService.getLLMConfig()
        hasApiKey = !!config.apiKey
        Logger.info('ViewProvider', 'API key check completed', { hasApiKey })
      } catch (error) {
        Logger.error('ViewProvider', 'Error checking API key, defaulting to false', error)
        hasApiKey = false
      }

      // Get workspace path
      let workspacePath = ''
      try {
        const workspaceFolders = vscode.workspace.workspaceFolders
        if (workspaceFolders && workspaceFolders.length > 0) {
          workspacePath = workspaceFolders[0].uri.fsPath
        }
      } catch (error) {
        Logger.debug('ViewProvider', 'Error getting workspace path', error)
      }

      // Set initial HTML
      webviewView.webview.html = this._getWebviewContent(webviewView.webview, hasApiKey, workspacePath)

      // Handle messages from webview
      webviewView.webview.onDidReceiveMessage(async (message) => {
        await this._handleMessage(message)
      })

      Logger.info('ViewProvider', 'Webview resolved successfully')
    } catch (error) {
      Logger.error('ViewProvider', 'Failed to resolve webview', error)
    }
  }

  private async _handleMessage(message: any): Promise<void> {
    if (!this._view) {
      return
    }

    try {
      Logger.debug('ViewProvider', 'Received message', { command: message.command })

      switch (message.command) {
        case 'ready':
          Logger.debug('ViewProvider', 'Webview ready')
          // Send initial state
          const config = await this._configService.getLLMConfig()
          this._view.webview.postMessage({
            command: 'setAuth',
            isAuthenticated: !!config.apiKey,
          })
          break

        case 'sendMessage':
          await this._handleSendMessage(message.text || message.message)
          break

        case 'configureAPI':
          await this._handleConfigureAPI(message.provider, message.apiKey)
          break

        case 'navigate':
          Logger.debug('ViewProvider', 'Navigation requested', { page: message.page })
          break

        case 'logout':
          Logger.info('ViewProvider', 'Logout requested')
          // Clear API keys would be handled by clearStorage command
          this._view.webview.postMessage({
            command: 'setAuth',
            isAuthenticated: false,
          })
          break

        case 'getSettings':
          await this._handleGetSettings()
          break

        case 'getStatus':
          await this._handleGetStatus()
          break

        case 'saveSettings':
          await this._handleSaveSettings(message.provider, message.modelName, message.temperature)
          break

        case 'openConfigureDialog':
          vscode.commands.executeCommand('scriptly.configureAPI')
          break

        case 'clearStorage':
          await this._handleClearStorage()
          break

        case 'openFile':
          await this._handleOpenFile(message.filepath, message.line, message.col, message.range)
          break

        case 'selectFile':
          await this._handleSelectFile()
          break

        case 'codeReview':
          await this._handleCodeReview(message.action, message.filepath)
          break

        case 'research':
          await this._handleResearch(message.action, message.query)
          break

        case 'getHistory':
          await this._handleGetHistory()
          break

        case 'clearHistory':
          await this._handleClearHistory()
          break

        case 'loadHistoryItem':
          await this._handleLoadHistoryItem(message.id)
          break

        case 'getProfiles':
          await this._handleGetProfiles()
          break

        case 'switchProfile':
          await this._handleSwitchProfile(message.provider)
          break

        case 'deleteProfile':
          await this._handleDeleteProfile(message.provider)
          break

        case 'reloadExtension':
          vscode.commands.executeCommand('workbench.action.reloadWindow')
          break

        default:
          Logger.warn('ViewProvider', 'Unknown command', { command: message.command })
      }
    } catch (error) {
      Logger.error('ViewProvider', 'Error handling message', error)
      if (this._view) {
        this._view.webview.postMessage({
          command: 'error',
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }

  private async _handleSendMessage(text: string): Promise<void> {
    if (!this._view || !this._llmService) {
      return
    }

    try {
      const config = await this._configService.getLLMConfig()
      if (!config.apiKey) {
        this._view.webview.postMessage({
          command: 'error',
          error: 'API key not configured. Please configure your API key in settings.',
        })
        return
      }

      // Get codebase context if available
      const workspaceFolders = vscode.workspace.workspaceFolders
      let fileContext = ''
      let selectedCode = ''

      // Get selected text
      const editor = vscode.window.activeTextEditor
      if (editor) {
        const selection = editor.selection
        if (!selection.isEmpty) {
          selectedCode = editor.document.getText(selection)
        }
      }

      // Stream response
      const request = {
        message: text,
        fileContext,
        selectedCode,
        conversationId: Date.now().toString(),
      }

      for await (const chunk of this._llmService.streamChat(request)) {
        this._view.webview.postMessage({
          command: 'streamChunk',
          chunk,
        })
      }

      this._view.webview.postMessage({
        command: 'streamComplete',
      })
    } catch (error) {
      Logger.error('ViewProvider', 'Error sending message', error)
      if (this._view) {
        this._view.webview.postMessage({
          command: 'error',
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }

  private async _handleConfigureAPI(provider: string, apiKey: string): Promise<void> {
    if (!this._view) {
      return
    }

    try {
      await this._configService.setApiKey(provider as any, apiKey)
      const valid = await this._configService.validateApiKey(provider as any)

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
      Logger.error('ViewProvider', 'Error configuring API', error)
      this._view.webview.postMessage({
        command: 'apiKeyConfigured',
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  }

  private _getWebviewContent(webview: vscode.Webview, hasApiKey: boolean, workspacePath: string): string {
    // Load HTML pages
    const loginHtml = this._loadHtmlFile('login.html')
    const dashboardHtml = this._loadHtmlFile('dashboard.html')
    const chatHtml = this._loadHtmlFile('chat.html')
    const codeReviewHtml = this._loadHtmlFile('code-review.html')
    const researchHtml = this._loadHtmlFile('research.html')
    const historyHtml = this._loadHtmlFile('history.html')
    const profilesHtml = this._loadHtmlFile('profiles.html')
    const settingsHtml = this._loadHtmlFile('settings.html')

    // Load styles
    const mainCss = this._loadCssFile('main.css')
    const themesCss = this._loadCssFile('themes.css')

    // Load scripts
    const appJs = this._loadJsFile('app.js')
    const routerJs = this._loadJsFile('router.js')
    const formatterJs = this._loadJsFile('formatter.js')

    const cspSource = webview.cspSource
    const initialPage = hasApiKey ? 'dashboard' : 'login'

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'unsafe-inline'; script-src ${cspSource} 'unsafe-inline'; img-src ${cspSource} https:; font-src ${cspSource} https:;">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scriptly</title>
    <style>
        ${themesCss}
        ${mainCss}
    </style>
</head>
<body>
    <div id="error-overlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: var(--vscode-editor-background); z-index: 10000; padding: 40px; overflow-y: auto;">
        <div style="max-width: 600px; margin: 0 auto;">
            <h2 style="color: var(--vscode-errorForeground); margin-bottom: 16px; font-size: 1.5rem;">Something Went Wrong</h2>
            <p style="color: var(--vscode-foreground); margin-bottom: 24px; line-height: 1.6;">Scriptly encountered an error while loading.</p>
            <div id="error-details" style="background: var(--vscode-input-background); padding: 16px; border-radius: 6px; margin-bottom: 24px; font-family: monospace; font-size: 0.875rem; color: var(--vscode-foreground); white-space: pre-wrap; max-height: 200px; overflow-y: auto;"></div>
            <button id="reload-btn" style="padding: 10px 20px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 4px; cursor: pointer; font-weight: 500;">Reload</button>
        </div>
    </div>

    <div id="root">
        ${loginHtml}
        ${dashboardHtml}
        ${chatHtml}
        ${codeReviewHtml}
        ${researchHtml}
        ${historyHtml}
        ${profilesHtml}
        ${settingsHtml}
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        window.vscode = vscode;
        window.initialState = { isAuthenticated: ${hasApiKey} };
        window.workspacePath = ${JSON.stringify(workspacePath)};
        window.initialPage = '${initialPage}';

        ${formatterJs}
        ${routerJs}
        ${appJs}
    </script>
</body>
</html>`
  }

  private _loadHtmlFile(filename: string): string {
    try {
      const filePath = path.join(this._context.extensionPath, 'src', 'ui', 'pages', filename)
      return fs.readFileSync(filePath, 'utf8')
    } catch (error) {
      Logger.error('ViewProvider', `Failed to load HTML file: ${filename}`, error)
      return `<div>Error loading ${filename}</div>`
    }
  }

  private _loadCssFile(filename: string): string {
    try {
      const filePath = path.join(this._context.extensionPath, 'src', 'ui', 'styles', filename)
      return fs.readFileSync(filePath, 'utf8')
    } catch (error) {
      Logger.error('ViewProvider', `Failed to load CSS file: ${filename}`, error)
      return ''
    }
  }

  private _loadJsFile(filename: string): string {
    try {
      const filePath = path.join(this._context.extensionPath, 'src', 'ui', 'scripts', filename)
      return fs.readFileSync(filePath, 'utf8')
    } catch (error) {
      Logger.error('ViewProvider', `Failed to load JS file: ${filename}`, error)
      return ''
    }
  }

  private async _handleGetSettings(): Promise<void> {
    if (!this._view) {
      return
    }

    try {
      const config = await this._configService.getLLMConfig()
      const vscodeConfig = vscode.workspace.getConfiguration('scriptly')

      this._view.webview.postMessage({
        command: 'settings',
        provider: config.provider,
        modelName: config.modelName,
        temperature: config.temperature,
        hasApiKey: !!config.apiKey,
      })
    } catch (error) {
      Logger.error('ViewProvider', 'Error getting settings', error)
    }
  }

  private async _handleGetStatus(): Promise<void> {
    if (!this._view) {
      return
    }

    try {
      const config = await this._configService.getLLMConfig()
      this._view.webview.postMessage({
        command: 'status',
        isAuthenticated: !!config.apiKey,
      })
    } catch (error) {
      Logger.error('ViewProvider', 'Error getting status', error)
      if (this._view) {
        this._view.webview.postMessage({
          command: 'status',
          isAuthenticated: false,
        })
      }
    }
  }

  private async _handleSaveSettings(
    provider: string,
    modelName: string,
    temperature: number
  ): Promise<void> {
    if (!this._view) {
      return
    }

    try {
      const config = vscode.workspace.getConfiguration('scriptly')
      await config.update('llmProvider', provider, vscode.ConfigurationTarget.Global)
      await config.update('modelName', modelName, vscode.ConfigurationTarget.Global)
      await config.update('temperature', temperature, vscode.ConfigurationTarget.Global)

      // Reset LLM model to pick up new settings
      // This will be handled by LLMService when next used

      this._view.webview.postMessage({
        command: 'settingsSaved',
        success: true,
      })

      Logger.info('ViewProvider', 'Settings saved', { provider, modelName, temperature })
    } catch (error) {
      Logger.error('ViewProvider', 'Error saving settings', error)
      if (this._view) {
        this._view.webview.postMessage({
          command: 'settingsSaved',
          success: false,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }

  private async _handleOpenFile(
    filepath: string,
    line?: number,
    col?: number,
    range?: number
  ): Promise<void> {
    try {
      const uri = vscode.Uri.file(filepath)
      const document = await vscode.workspace.openTextDocument(uri)
      const editor = await vscode.window.showTextDocument(document)

      if (line !== undefined) {
        const position = new vscode.Position(line - 1, col ? col - 1 : 0)
        editor.selection = new vscode.Selection(position, position)
        editor.revealRange(
          new vscode.Range(
            position,
            new vscode.Position(range ? range - 1 : line - 1, 0)
          ),
          vscode.TextEditorRevealType.InCenter
        )
      }

      Logger.debug('ViewProvider', 'File opened', { filepath, line, col })
    } catch (error) {
      Logger.error('ViewProvider', 'Error opening file', error)
      vscode.window.showErrorMessage(`Failed to open file: ${filepath}`)
    }
  }

  private async _handleSelectFile(): Promise<void> {
    if (!this._view) {
      return
    }

    try {
      const files = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        openLabel: 'Select File',
      })

      if (files && files.length > 0) {
        this._view.webview.postMessage({
          command: 'fileSelected',
          filepath: files[0].fsPath,
        })
        Logger.debug('ViewProvider', 'File selected', { filepath: files[0].fsPath })
      }
    } catch (error) {
      Logger.error('ViewProvider', 'Error selecting file', error)
    }
  }

  private async _handleCodeReview(action: string, filepath: string): Promise<void> {
    if (!this._view) {
      return
    }

    try {
      const uri = vscode.Uri.file(filepath)
      let result = ''

      Logger.info('ViewProvider', 'Code review requested', { action, filepath })

      switch (action) {
        case 'analyze':
          result = await this._refactorService.analyzeCode(uri)
          break
        case 'refactor':
          result = await this._refactorService.suggestRefactoring(uri)
          break
        case 'test':
          result = await this._testService.generateTests(uri)
          break
        case 'bugs':
          result = await this._testService.findBugs(uri)
          break
        default:
          throw new Error(`Unknown action: ${action}`)
      }

      this._view.webview.postMessage({
        command: 'codeReviewResult',
        result,
      })

      Logger.info('ViewProvider', 'Code review completed', { action })
    } catch (error) {
      Logger.error('ViewProvider', 'Error performing code review', error)
      if (this._view) {
        this._view.webview.postMessage({
          command: 'codeReviewResult',
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }

  private async _handleResearch(action: string, query: string): Promise<void> {
    if (!this._view) {
      return
    }

    try {
      Logger.info('ViewProvider', 'Research requested', { action, query })

      // Show indexing progress
      if (!this._codeIndexer.isWorkspaceIndexed()) {
        if (this._view) {
          this._view.webview.postMessage({
            command: 'indexingProgress',
            message: 'Indexing codebase...',
          })
        }

        // Index in background
        this._codeIndexer.indexWorkspace().catch((error) => {
          Logger.error('ViewProvider', 'Error indexing workspace', error)
        })
      }

      let result = ''

      if (action === 'semantic') {
        // Stream semantic search
        const prompt = await this._searchService.semanticSearch(query)
        for await (const chunk of this._llmService.streamChat({
          message: prompt,
          fileContext: '',
          selectedCode: '',
          conversationId: 'research-' + Date.now(),
        })) {
          if (this._view) {
            this._view.webview.postMessage({
              command: 'researchChunk',
              chunk,
            })
          }
        }

        if (this._view) {
          this._view.webview.postMessage({
            command: 'researchComplete',
          })
        }
      } else if (action === 'references') {
        result = await this._searchService.findReferences(query)

        this._view.webview.postMessage({
          command: 'researchResult',
          result,
        })
      }

      Logger.info('ViewProvider', 'Research completed', { action })
    } catch (error) {
      Logger.error('ViewProvider', 'Error performing research', error)
      if (this._view) {
        this._view.webview.postMessage({
          command: 'researchResult',
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }

  private async _handleClearStorage(): Promise<void> {
    if (!this._view) {
      return
    }

    try {
      await this._configService.clearAllStorage()
      this._view.webview.postMessage({
        command: 'setAuth',
        isAuthenticated: false,
      })

      vscode.window.showInformationMessage(
        'Storage cleared. Please reload the window.',
        'Reload Window'
      ).then((action) => {
        if (action === 'Reload Window') {
          vscode.commands.executeCommand('workbench.action.reloadWindow')
        }
      })

      Logger.info('ViewProvider', 'Storage cleared')
    } catch (error) {
      Logger.error('ViewProvider', 'Error clearing storage', error)
      if (this._view) {
        this._view.webview.postMessage({
          command: 'error',
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }

  private async _handleGetHistory(): Promise<void> {
    if (!this._view) {
      return
    }

    try {
      // For now, return empty history - can be enhanced with persistence
      this._view.webview.postMessage({
        command: 'history',
        history: [],
      })
    } catch (error) {
      Logger.error('ViewProvider', 'Error getting history', error)
    }
  }

  private async _handleClearHistory(): Promise<void> {
    if (!this._view) {
      return
    }

    try {
      // History clearing logic can be added here
      this._view.webview.postMessage({
        command: 'history',
        history: [],
      })
      Logger.info('ViewProvider', 'History cleared')
    } catch (error) {
      Logger.error('ViewProvider', 'Error clearing history', error)
    }
  }

  private async _handleLoadHistoryItem(id: string): Promise<void> {
    // History item loading can be implemented here
    Logger.debug('ViewProvider', 'Load history item', { id })
  }

  private async _handleGetProfiles(): Promise<void> {
    if (!this._view) {
      return
    }

    try {
      const config = await this._configService.getLLMConfig()
      
      this._view.webview.postMessage({
        command: 'profiles',
        currentProfile: {
          provider: config.provider,
          modelName: config.modelName,
        },
        profiles: [
          // For now, return current profile as the only profile
          {
            provider: config.provider,
            modelName: config.modelName,
          },
        ],
      })
    } catch (error) {
      Logger.error('ViewProvider', 'Error getting profiles', error)
    }
  }

  private async _handleSwitchProfile(provider: string): Promise<void> {
    try {
      const config = vscode.workspace.getConfiguration('scriptly')
      await config.update('llmProvider', provider, vscode.ConfigurationTarget.Global)
      
      // Reset LLM model
      this._llmService.resetModel()
      
      vscode.window.showInformationMessage(`Switched to ${provider} profile`)
      Logger.info('ViewProvider', 'Profile switched', { provider })
    } catch (error) {
      Logger.error('ViewProvider', 'Error switching profile', error)
    }
  }

  private async _handleDeleteProfile(provider: string): Promise<void> {
    try {
      await this._configService.getApiKey(provider as any)
      await this._configService.clearAllStorage()
      
      vscode.window.showInformationMessage(`Deleted ${provider} profile`)
      Logger.info('ViewProvider', 'Profile deleted', { provider })
    } catch (error) {
      Logger.error('ViewProvider', 'Error deleting profile', error)
    }
  }

  public refresh(): void {
    if (this._view) {
      const config = this._configService.getLLMConfig()
      config.then((c) => {
        if (this._view) {
          this._view.webview.html = this._getWebviewContent(
            this._view.webview,
            !!c.apiKey,
            vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || ''
          )
        }
      })
    }
  }
}
