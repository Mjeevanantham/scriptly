import * as vscode from 'vscode'
import { ConfigService } from './services/ConfigService'
import { LLMService } from './services/LLMService'
import { ChatViewProvider, startChat } from './commands/chat'
import { MainViewProvider } from './ui/MainViewProvider'
import { configureAPI } from './commands/configure'
import { gitClone } from './commands/git'
import { Logger } from './utils/Logger'

let configService: ConfigService
let llmService: LLMService
let chatViewProvider: ChatViewProvider
let mainViewProvider: MainViewProvider

export function activate(context: vscode.ExtensionContext) {
  // Initialize logger first
  Logger.initialize(context)
  const logPath = Logger.getLogFilePath()
  
  Logger.info('Extension', 'Scriptly extension activating...', {
    logFilePath: logPath,
  })

  // Show log file location on first activation (already shown by Logger)
  if (logPath) {
    Logger.showOutputChannel()
  }

  // Initialize services
  Logger.debug('Extension', 'Initializing ConfigService')
  configService = new ConfigService(context)
  Logger.debug('Extension', 'ConfigService initialized')
  
  Logger.debug('Extension', 'Initializing LLMService')
  llmService = new LLMService(configService)
  Logger.info('Extension', 'Services initialized', {
    hasConfigService: !!configService,
    hasLLMService: !!llmService,
  })

  // Register main view provider (new multi-page UI)
  Logger.debug('Extension', 'Creating MainViewProvider')
  mainViewProvider = new MainViewProvider(context, configService, llmService)
  Logger.debug('Extension', 'Registering MainViewProvider', {
    viewType: MainViewProvider.viewType,
  })
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      MainViewProvider.viewType,
      mainViewProvider
    )
  )
  Logger.info('Extension', 'MainViewProvider registered')

  // Keep old chat provider for backward compatibility
  Logger.debug('Extension', 'Creating ChatViewProvider for backward compatibility')
  chatViewProvider = new ChatViewProvider(context)
  chatViewProvider.setLLMService(llmService)
  Logger.debug('Extension', 'ChatViewProvider initialized')

  // Register commands
  Logger.debug('Extension', 'Registering commands')
  
  const chatCommand = vscode.commands.registerCommand(
    'scriptly.startChat',
    () => {
      Logger.info('Extension', 'Command executed: scriptly.startChat')
      startChat(context, llmService)
    }
  )

  const configureCommand = vscode.commands.registerCommand(
    'scriptly.configureAPI',
    () => {
      Logger.info('Extension', 'Command executed: scriptly.configureAPI')
      configureAPI(configService)
    }
  )

  const gitCloneCommand = vscode.commands.registerCommand(
    'scriptly.gitClone',
    () => {
      Logger.info('Extension', 'Command executed: scriptly.gitClone')
      gitClone()
    }
  )

  const refreshChatCommand = vscode.commands.registerCommand(
    'scriptly.chatView.refresh',
    async () => {
      Logger.info('Extension', 'Command executed: scriptly.chatView.refresh')
      if (mainViewProvider) {
        Logger.debug('Extension', 'Refreshing MainViewProvider')
        mainViewProvider.refresh()
      } else if (chatViewProvider) {
        Logger.debug('Extension', 'Refreshing ChatViewProvider')
        await chatViewProvider.refresh()
      } else {
        Logger.warn('Extension', 'No view provider available to refresh')
      }
    }
  )

  const showLogsCommand = vscode.commands.registerCommand(
    'scriptly.showLogs',
    async () => {
      Logger.info('Extension', 'Command executed: scriptly.showLogs')
      const logPath = Logger.getLogFilePath()
      if (logPath) {
        Logger.debug('Extension', 'Showing log file options', { logPath })
        // Show in notification
        const action = await vscode.window.showInformationMessage(
          `📋 Scriptly Log File\n${logPath}`,
          'Open Log File',
          'Copy Path',
          'Reveal in Explorer'
        )
        
        if (action === 'Open Log File') {
          Logger.debug('Extension', 'Opening log file in editor')
          const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(logPath))
          await vscode.window.showTextDocument(doc)
        } else if (action === 'Copy Path') {
          Logger.debug('Extension', 'Copying log file path to clipboard')
          await vscode.env.clipboard.writeText(logPath)
          vscode.window.showInformationMessage('Log file path copied to clipboard!')
        } else if (action === 'Reveal in Explorer') {
          Logger.debug('Extension', 'Revealing log file in file explorer')
          vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(logPath))
        }
      } else {
        Logger.warn('Extension', 'Log file not available')
        vscode.window.showWarningMessage('Log file not available. Logger may not be initialized.')
      }
    }
  )

  context.subscriptions.push(
    chatCommand,
    configureCommand,
    gitCloneCommand,
    refreshChatCommand,
    showLogsCommand
  )

  // Check if API key is configured
  Logger.debug('Extension', 'Checking if API key is configured on activation')
  configService.getApiKey('openai').then((apiKey) => {
    if (!apiKey) {
      Logger.info('Extension', 'No API key found, prompting user to configure')
      vscode.window
        .showInformationMessage(
          'Scriptly: Configure your API key to get started',
          'Configure'
        )
        .then((selection) => {
          if (selection === 'Configure') {
            Logger.debug('Extension', 'User chose to configure API key')
            vscode.commands.executeCommand('scriptly.configureAPI')
          } else {
            Logger.debug('Extension', 'User dismissed API key configuration prompt')
          }
        })
    } else {
      Logger.debug('Extension', 'API key found, extension ready to use')
    }
  }).catch((error) => {
    Logger.error('Extension', 'Error checking API key on activation', error)
  })
  
  Logger.info('Extension', 'Scriptly extension activated successfully', {
    commandsRegistered: 5,
    viewProvidersRegistered: 2,
  })
}

export function deactivate() {
  Logger.info('Extension', 'Scriptly extension deactivating...')
  Logger.dispose()
}

