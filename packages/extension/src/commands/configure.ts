import * as vscode from 'vscode'
import { ConfigService } from '../services/ConfigService'
import { Logger } from '../utils/Logger'

export async function configureAPI(configService: ConfigService) {
  const provider = await vscode.window.showQuickPick(
    [
      { label: 'OpenAI', value: 'openai' },
      { label: 'Anthropic Claude', value: 'claude' },
      { label: 'Ollama (Local)', value: 'ollama' },
      { label: 'Custom Endpoint', value: 'custom' },
    ],
    { placeHolder: 'Select LLM Provider' }
  )

  if (!provider) {
    return
  }

  let apiKey: string | undefined
  if (provider.value !== 'ollama') {
    apiKey = await vscode.window.showInputBox({
      prompt: `Enter your ${provider.label} API key`,
      password: true,
      ignoreFocusOut: true,
    })

    if (!apiKey || apiKey.trim().length === 0) {
      vscode.window.showErrorMessage('API key cannot be empty.')
      return
    }
  }

  // Show progress while saving
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Configuring ${provider.label} API key...`,
      cancellable: false,
    },
    async (progress) => {
      progress.report({ increment: 0, message: 'Saving API key...' })
      
      try {
        Logger.info('Configure', `Starting API key configuration for ${provider.label}`, {
          provider: provider.value,
        })
        
        // Save the API key (now async)
        await configService.setApiKey(provider.value as any, apiKey || '')
        
        // Wait a moment to ensure secrets are fully saved
        await new Promise((resolve) => setTimeout(resolve, 300))
        
        progress.report({ increment: 50, message: 'Validating API key...' })
        
        Logger.info('Configure', `Validating API key for ${provider.label}`)
        
        // Test the API key with actual API call
        const isValid = await configService.validateApiKey(
          provider.value as any
        )
        
        if (isValid) {
          progress.report({ increment: 100, message: 'Validated successfully!' })
          Logger.info('Configure', `${provider.label} API key configured and validated successfully`)
          
          // Get log file path for debugging
          const { Logger: LoggerUtil } = await import('../utils/Logger')
          const logPath = LoggerUtil.getLogFilePath()
          
          vscode.window.showInformationMessage(
            `${provider.label} API key configured and validated successfully!`,
            'View Logs'
          ).then((selection) => {
            if (selection === 'View Logs') {
              vscode.commands.executeCommand('scriptly.showLogs')
            }
          })
          
          // Wait a bit more before refreshing to ensure everything is saved
          await new Promise((resolve) => setTimeout(resolve, 500))
          
          // Notify chat view to refresh if it's open
          Logger.debug('Configure', 'Triggering chat view refresh')
          await vscode.commands.executeCommand('scriptly.chatView.refresh')
        } else {
          progress.report({ increment: 100 })
          Logger.warn('Configure', `Failed to validate ${provider.label} API key`)
          
          const { Logger: LoggerUtil } = await import('../utils/Logger')
          const logPath = LoggerUtil.getLogFilePath()
          
          vscode.window.showErrorMessage(
            `Failed to validate ${provider.label} API key. The key may be incorrect or invalid. Please check and try again.`,
            'View Logs'
          ).then((selection) => {
            if (selection === 'View Logs') {
              vscode.commands.executeCommand('scriptly.showLogs')
            }
          })
        }
      } catch (error) {
        progress.report({ increment: 100 })
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        Logger.error('Configure', 'Error configuring API key', error)
        vscode.window.showErrorMessage(
          `Failed to configure API key: ${errorMessage}`
        )
      }
    }
  )
}

