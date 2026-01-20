import * as vscode from 'vscode'
import { ConfigService } from '../services/ConfigService'
import { Logger } from '../utils/Logger'

export async function configureAPI(configService: ConfigService): Promise<void> {
  try {
    Logger.info('Commands', 'Configuring API keys')

    // Show provider selection
    const provider = await vscode.window.showQuickPick(
      [
        {
          label: 'OpenAI (GPT-4, GPT-3.5)',
          value: 'openai' as const,
          description: 'https://platform.openai.com/api-keys',
        },
        {
          label: 'Anthropic Claude',
          value: 'claude' as const,
          description: 'https://console.anthropic.com/',
        },
        {
          label: 'Ollama (Local)',
          value: 'ollama' as const,
          description: 'Local AI models',
        },
        {
          label: 'Custom Endpoint',
          value: 'custom' as const,
          description: 'OpenAI-compatible API',
        },
      ],
      {
        placeHolder: 'Select LLM provider',
      }
    )

    if (!provider) {
      Logger.debug('Commands', 'User cancelled provider selection')
      return
    }

    Logger.debug('Commands', `Selected provider: ${provider.value}`)

    // Get API key
    let apiKey = ''
    if (provider.value !== 'ollama') {
      apiKey = await vscode.window.showInputBox({
        prompt: `Enter your ${provider.label} API key`,
        password: true,
        placeHolder: 'sk-...',
        ignoreFocusOut: true,
      }) || ''

      if (!apiKey) {
        Logger.debug('Commands', 'User cancelled API key input')
        return
      }
    }

    // Get base URL for custom/ollama
    let baseURL: string | undefined
    if (provider.value === 'custom' || provider.value === 'ollama') {
      baseURL = await vscode.window.showInputBox({
        prompt: 'Enter base URL',
        placeHolder: provider.value === 'ollama' ? 'http://localhost:11434' : 'https://api.example.com',
        value: provider.value === 'ollama' ? 'http://localhost:11434' : '',
        ignoreFocusOut: true,
      }) || undefined

      if (!baseURL && provider.value === 'custom') {
        vscode.window.showWarningMessage('Base URL is required for custom endpoints')
        return
      }
    }

    // Store API key
    await configService.setApiKey(provider.value, apiKey || 'none')

    // Update workspace settings if needed
    const config = vscode.workspace.getConfiguration('scriptly')
    await config.update('llmProvider', provider.value, vscode.ConfigurationTarget.Global)

    // Validate API key
    vscode.window.showInformationMessage('Validating API key...')
    const valid = await configService.validateApiKey(provider.value)

    if (valid) {
      vscode.window.showInformationMessage(
        `✅ ${provider.label} API key configured successfully!`,
        'Open Scriptly'
      ).then((action) => {
        if (action === 'Open Scriptly') {
          vscode.commands.executeCommand('scriptly.startChat')
        }
      })
      Logger.info('Commands', `API key validated successfully for ${provider.value}`)
    } else {
      vscode.window.showErrorMessage(
        `❌ Failed to validate ${provider.label} API key. Please check your key and try again.`
      )
      Logger.warn('Commands', `API key validation failed for ${provider.value}`)
    }
  } catch (error) {
    Logger.error('Commands', 'Error configuring API', error)
    vscode.window.showErrorMessage(
      `Failed to configure API key: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
