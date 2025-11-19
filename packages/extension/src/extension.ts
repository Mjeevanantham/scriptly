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
  configService = new ConfigService(context)
  llmService = new LLMService(configService)
  
  Logger.info('Extension', 'Services initialized')

  // Register main view provider (new multi-page UI)
  mainViewProvider = new MainViewProvider(context, configService, llmService)
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      MainViewProvider.viewType,
      mainViewProvider
    )
  )

  // Keep old chat provider for backward compatibility
  chatViewProvider = new ChatViewProvider(context)
  chatViewProvider.setLLMService(llmService)

  // Register commands
  const chatCommand = vscode.commands.registerCommand(
    'scriptly.startChat',
    () => startChat(context, llmService)
  )

  const configureCommand = vscode.commands.registerCommand(
    'scriptly.configureAPI',
    () => configureAPI(configService)
  )

  const gitCloneCommand = vscode.commands.registerCommand(
    'scriptly.gitClone',
    () => gitClone()
  )

  const refreshChatCommand = vscode.commands.registerCommand(
    'scriptly.chatView.refresh',
    async () => {
      if (mainViewProvider) {
        mainViewProvider.refresh()
      } else if (chatViewProvider) {
        await chatViewProvider.refresh()
      }
    }
  )

  const showLogsCommand = vscode.commands.registerCommand(
    'scriptly.showLogs',
    async () => {
      const logPath = Logger.getLogFilePath()
      if (logPath) {
        // Show in notification
        const action = await vscode.window.showInformationMessage(
          `📋 Scriptly Log File\n${logPath}`,
          'Open Log File',
          'Copy Path',
          'Reveal in Explorer'
        )
        
        if (action === 'Open Log File') {
          const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(logPath))
          await vscode.window.showTextDocument(doc)
        } else if (action === 'Copy Path') {
          await vscode.env.clipboard.writeText(logPath)
          vscode.window.showInformationMessage('Log file path copied to clipboard!')
        } else if (action === 'Reveal in Explorer') {
          vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(logPath))
        }
      } else {
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
  configService.getApiKey('openai').then((apiKey) => {
    if (!apiKey) {
      vscode.window
        .showInformationMessage(
          'Scriptly: Configure your API key to get started',
          'Configure'
        )
        .then((selection) => {
          if (selection === 'Configure') {
            vscode.commands.executeCommand('scriptly.configureAPI')
          }
        })
    }
  })
}

export function deactivate() {
  Logger.info('Extension', 'Scriptly extension deactivating...')
  Logger.dispose()
}

