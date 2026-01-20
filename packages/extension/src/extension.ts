import * as vscode from 'vscode'
import { ConfigService } from './services/ConfigService'
import { LLMService } from './services/LLMService'
import { Logger } from './utils/Logger'
import { IDEDetector } from './utils/IDEDetector'
import { ViewProvider } from './ui/ViewProvider'
import { CompletionProvider } from './providers/CompletionProvider'

let configService: ConfigService | null = null
let llmService: LLMService | null = null
let completionProvider: CompletionProvider | null = null

export function activate(context: vscode.ExtensionContext): void {
  try {
    // Detect IDE first
    const ideDetails = IDEDetector.detect()
    Logger.info('Extension', `Running on ${ideDetails.name} ${ideDetails.version}`, {
      ideKind: ideDetails.kind,
      isCompatible: ideDetails.isCompatible,
    })

    // Initialize logger
    Logger.initialize(context)
    const logPath = Logger.getLogFilePath()

    Logger.info('Extension', 'Scriptly extension activating...', {
      logFilePath: logPath,
      ide: ideDetails.name,
      ideVersion: ideDetails.version,
    })

    // Show output channel
    if (logPath) {
      setTimeout(() => {
        try {
          Logger.showOutputChannel()
        } catch (error) {
          console.error('Failed to show output channel:', error)
        }
      }, 100)
    }

    // Initialize services
    try {
      Logger.debug('Extension', 'Initializing ConfigService')
      configService = new ConfigService(context)
      Logger.debug('Extension', 'ConfigService initialized')

      Logger.debug('Extension', 'Initializing LLMService')
      llmService = new LLMService(configService)
      
      Logger.debug('Extension', 'Initializing CompletionProvider')
      completionProvider = new CompletionProvider(llmService)
      
      Logger.info('Extension', 'Services initialized', {
        hasConfigService: !!configService,
        hasLLMService: !!llmService,
        hasCompletionProvider: !!completionProvider,
      })
    } catch (error) {
      Logger.error('Extension', 'Failed to initialize services', error)
      vscode.window.showErrorMessage(
        'Scriptly: Failed to initialize services. Check the output panel for details.'
      )
      return
    }

    // Register webview provider
    try {
      Logger.debug('Extension', 'Registering ViewProvider')
      if (!configService || !llmService) {
        throw new Error('ConfigService or LLMService not initialized')
      }

      const viewProvider = new ViewProvider(context, configService, llmService)
      context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(ViewProvider.viewType, viewProvider, {
          webviewOptions: {
            retainContextWhenHidden: true,
          },
        })
      )
      Logger.info('Extension', 'ViewProvider registered')
    } catch (error) {
      Logger.error('Extension', 'Failed to register ViewProvider', error)
    }

    // Register completion provider
    try {
      Logger.debug('Extension', 'Registering CompletionProvider')
      if (completionProvider) {
        context.subscriptions.push(
          vscode.languages.registerInlineCompletionItemProvider(
            { pattern: '**' },
            completionProvider
          )
        )
        Logger.info('Extension', 'CompletionProvider registered')
      }
    } catch (error) {
      Logger.error('Extension', 'Failed to register CompletionProvider', error)
    }

    // Register commands (async import)
    Promise.all([
      import('./commands/configure'),
      import('./commands/git'),
      import('./commands/utils'),
    ])
      .then(([configureModule, gitModule, utilsModule]) => {
        try {
          Logger.debug('Extension', 'Registering commands')

          if (!configService) {
            throw new Error('ConfigService not initialized')
          }

          const configureCommand = vscode.commands.registerCommand('scriptly.configureAPI', () => {
            configureModule.configureAPI(configService!)
          })

          const gitCloneCommand = vscode.commands.registerCommand('scriptly.gitClone', () => {
            gitModule.gitClone()
          })

          const showLogsCommand = vscode.commands.registerCommand('scriptly.showLogs', () => {
            utilsModule.showLogs()
          })

          const clearStorageCommand = vscode.commands.registerCommand('scriptly.clearStorage', () => {
            utilsModule.clearStorage(configService!)
          })

          const startChatCommand = vscode.commands.registerCommand('scriptly.startChat', () => {
            vscode.commands.executeCommand('scriptly.chatView.focus')
          })

          context.subscriptions.push(
            configureCommand,
            gitCloneCommand,
            showLogsCommand,
            clearStorageCommand,
            startChatCommand
          )

          Logger.info('Extension', 'Commands registered successfully', { count: 5 })
        } catch (error) {
          Logger.error('Extension', 'Failed to register commands', error)
        }
      })
      .catch((error) => {
        Logger.error('Extension', 'Failed to import command modules', error)
      })

    // Check API key (non-blocking)
    setTimeout(() => {
      if (!configService) {
        Logger.warn('Extension', 'ConfigService not available for API key check')
        return
      }

      configService
        .getApiKey('openai')
        .then(
          (apiKey) => {
            if (!apiKey) {
              Logger.info('Extension', 'No API key found, prompting user to configure')
              vscode.window
                .showInformationMessage('Scriptly: Configure your API key to get started', 'Configure')
                .then(
                  (selection) => {
                    if (selection === 'Configure') {
                      Logger.debug('Extension', 'User chose to configure API key')
                      vscode.commands.executeCommand('scriptly.configureAPI').then(
                        () => {},
                        (err: unknown) => {
                          Logger.error('Extension', 'Error executing configureAPI command', err)
                        }
                      )
                    }
                  },
                  (error: unknown) => {
                    Logger.error('Extension', 'Error showing API key prompt', error)
                  }
                )
            } else {
              Logger.debug('Extension', 'API key found, extension ready to use')
            }
          },
          (error) => {
            Logger.error('Extension', 'Error checking API key on activation', error)
          }
        )
    }, 500)

    Logger.info('Extension', 'Scriptly extension activated successfully', {
      ide: ideDetails.name,
      ideVersion: ideDetails.version,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined

    console.error('[Scriptly Extension] Activation failed:', errorMessage, errorStack)

    try {
      Logger.error('Extension', 'Activation failed', {
        message: errorMessage,
        stack: errorStack,
      })
    } catch (logError) {
      console.error('[Scriptly Extension] Failed to log activation error:', logError)
    }

    vscode.window.showErrorMessage(
      `Scriptly extension failed to activate: ${errorMessage}. Please check the output panel for details.`
    )
  }
}

export function deactivate(): void {
  try {
    Logger.info('Extension', 'Scriptly extension deactivating...')
    Logger.dispose()
  } catch (error) {
    console.error('[Scriptly Extension] Deactivation error:', error)
  }
}

// Export services for use in other modules
export { configService, llmService }
