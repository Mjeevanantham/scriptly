import * as vscode from 'vscode'
import * as crypto from 'crypto'
import { LLMProvider, LLMConfig } from '../types'
import { Logger } from '../utils/Logger'

export class ConfigService {
  private context: vscode.ExtensionContext
  private algorithm = 'aes-256-gcm'
  private encryptionKey: Buffer

  constructor(context: vscode.ExtensionContext) {
    this.context = context
    // In production, derive key from user-specific secret
    this.encryptionKey = this.getOrCreateEncryptionKey()
  }

  private getOrCreateEncryptionKey(): Buffer {
    const secretStorage = this.context.secrets
    const keyName = 'scriptly.encryption.key'

    // For MVP, use a simple derivation
    // In production, use a more secure method
    const fallbackKey = crypto
      .createHash('sha256')
      .update(vscode.env.machineId || 'default')
      .digest()

    return fallbackKey
  }

  private encrypt(apiKey: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(
      this.algorithm,
      this.encryptionKey,
      iv
    ) as crypto.CipherGCM

    let encrypted = cipher.update(apiKey, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  }

  private decrypt(encryptedKey: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedKey.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')

    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.encryptionKey,
      iv
    ) as crypto.DecipherGCM
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  async setApiKey(provider: LLMProvider, apiKey: string): Promise<void> {
    const keyName = `scriptly.apiKey.${provider}`
    Logger.info('ConfigService', `Setting API key for provider: ${provider}`, {
      keyLength: apiKey.length,
      keyName,
    })
    
    if (!apiKey || apiKey.trim().length === 0) {
      Logger.error('ConfigService', `Cannot save empty API key for ${provider}`)
      throw new Error('API key cannot be empty')
    }

    const encrypted = this.encrypt(apiKey)
    Logger.debug('ConfigService', 'API key encrypted, storing in secrets')
    
    await this.context.secrets.store(keyName, encrypted)
    Logger.info('ConfigService', 'API key stored in secrets')
    
    // Also save the provider as the active provider in workspace settings
    // so getLLMConfig() will use the correct provider
    Logger.debug('ConfigService', `Updating workspace setting llmProvider to: ${provider}`)
    
    const config = vscode.workspace.getConfiguration('scriptly')
    await config.update('llmProvider', provider, vscode.ConfigurationTarget.Global)
    
    // Wait for configuration to be fully updated
    await new Promise((resolve) => setTimeout(resolve, 200))
    
    // Verify the configuration was updated
    const updatedConfig = vscode.workspace.getConfiguration('scriptly')
    const savedProvider = updatedConfig.get<LLMProvider>('llmProvider', 'openai')
    
    if (savedProvider !== provider) {
      Logger.error('ConfigService', `Provider setting mismatch! Expected: ${provider}, Got: ${savedProvider}`)
      // Try once more with a longer delay
      await new Promise((resolve) => setTimeout(resolve, 300))
      const retryConfig = vscode.workspace.getConfiguration('scriptly')
      const retryProvider = retryConfig.get<LLMProvider>('llmProvider', 'openai')
      Logger.info('ConfigService', `After retry, provider is: ${retryProvider}`)
    } else {
      Logger.info('ConfigService', `Provider setting confirmed: ${provider}`)
    }
    
    Logger.info('ConfigService', `API key saved and provider updated for: ${provider}`)
    
    // Verify it was saved correctly
    const verifyKey = await this.context.secrets.get(keyName)
    if (verifyKey) {
      Logger.info('ConfigService', `Verification: API key confirmed saved for ${provider}`, {
        encryptedLength: verifyKey.length,
      })
    } else {
      Logger.error('ConfigService', `Verification failed: API key not found after saving for ${provider}`)
    }
  }

  async getApiKey(provider: LLMProvider): Promise<string | null> {
    const keyName = `scriptly.apiKey.${provider}`
    Logger.debug('ConfigService', `Getting API key for provider: ${provider}`, { keyName })
    
    try {
      const encrypted = await this.context.secrets.get(keyName)
      if (!encrypted) {
        Logger.debug('ConfigService', `No encrypted API key found for ${provider}`, { keyName })
        return null
      }

      if (!encrypted.includes(':')) {
        Logger.error('ConfigService', `Invalid encrypted format for ${provider}`, {
          encryptedLength: encrypted.length,
          encryptedPreview: encrypted.substring(0, 20),
        })
        return null
      }

      const decrypted = this.decrypt(encrypted)
      if (!decrypted || decrypted.trim().length === 0) {
        Logger.warn('ConfigService', `Decrypted API key is empty for ${provider}`)
        return null
      }
      
      Logger.debug('ConfigService', `Successfully decrypted API key for ${provider}`, {
        length: decrypted.length,
        preview: decrypted.substring(0, 10) + '...',
      })
      return decrypted
    } catch (error) {
      Logger.error('ConfigService', `Failed to get/decrypt API key for ${provider}`, {
        error: error instanceof Error ? error.message : String(error),
        keyName,
      })
      return null
    }
  }

  async validateApiKey(provider: LLMProvider): Promise<boolean> {
    const apiKey = await this.getApiKey(provider)
    if (!apiKey || apiKey.trim().length === 0) {
      Logger.warn('ConfigService', `Validation failed: No API key found for ${provider}`)
      return false
    }
    
    Logger.info('ConfigService', `Validating API key for ${provider}`, {
      keyLength: apiKey.length,
    })

    // Test the API key by making a minimal API call
    try {
      if (provider === 'openai') {
        // Test OpenAI API with a simple models list call
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          Logger.warn('ConfigService', `OpenAI API validation failed`, {
            status: response.status,
            statusText: response.statusText,
          })
          return false
        }
        
        const data = await response.json()
        Logger.info('ConfigService', 'OpenAI API key validated successfully')
        return true
      } else if (provider === 'claude') {
        // Test Claude API with a simple message
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'test' }],
          }),
        })
        
        if (!response.ok) {
          Logger.warn('ConfigService', `Claude API validation failed`, {
            status: response.status,
            statusText: response.statusText,
          })
          return false
        }
        
        Logger.info('ConfigService', 'Claude API key validated successfully')
        return true
      } else if (provider === 'ollama') {
        // Ollama doesn't need API key validation
        return true
      } else if (provider === 'custom') {
        // For custom endpoints, just check if key exists (we don't know the endpoint)
        return apiKey.trim().length > 0
      }
      
      return false
    } catch (error) {
      Logger.error('ConfigService', `API validation error for ${provider}`, error)
      return false
    }
  }

  async getLLMConfig(): Promise<LLMConfig> {
    // Force a fresh read of configuration (don't use cached values)
    const config = vscode.workspace.getConfiguration('scriptly', null)
    const provider = config.get<LLMProvider>('llmProvider', 'openai')
    const modelName = config.get<string>('modelName', 'gpt-4')
    const temperature = config.get<number>('temperature', 0.3)

    Logger.debug('ConfigService', `Getting LLM config for provider: ${provider}`, {
      configSource: 'workspace',
      rawProviderValue: provider,
    })
    
    const apiKey = await this.getApiKey(provider)
    
    // Also check if we have API keys for other providers (for debugging)
    const allProviders: LLMProvider[] = ['openai', 'claude', 'ollama', 'custom']
    const providerStatus: Record<string, boolean> = {}
    for (const p of allProviders) {
      const key = await this.context.secrets.get(`scriptly.apiKey.${p}`)
      providerStatus[p] = !!key
    }
    
    Logger.debug('ConfigService', `Retrieved API key for ${provider}`, {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      providerStatus: providerStatus,
      selectedProvider: provider,
    })

    // If no API key found for the selected provider, try to find any provider with an API key
    if (!apiKey && provider !== 'ollama') {
      Logger.warn('ConfigService', `No API key found for selected provider: ${provider}`, {
        providerStatus,
      })
      
      // Try to find any provider that has an API key
      for (const p of allProviders) {
        if (p === 'ollama') continue
        const alternateKey = await this.getApiKey(p as LLMProvider)
        if (alternateKey) {
          Logger.info('ConfigService', `Found API key for alternate provider: ${p}, switching to it`)
          // Update the configuration to use this provider instead
          await vscode.workspace
            .getConfiguration('scriptly')
            .update('llmProvider', p, vscode.ConfigurationTarget.Global)
          
          return {
            provider: p as LLMProvider,
            apiKey: alternateKey,
            modelName,
            temperature,
            maxTokens: 2048,
          }
        }
      }
    }

    return {
      provider,
      apiKey: apiKey || undefined,
      modelName,
      temperature,
      maxTokens: 2048,
    }
  }

  setPreference(key: string, value: unknown): void {
    this.context.workspaceState.update(`scriptly.${key}`, value)
  }

  getPreference(key: string): unknown {
    return this.context.workspaceState.get(`scriptly.${key}`)
  }

  getWorkspacePath(): string {
    const workspaceFolders = vscode.workspace.workspaceFolders
    return workspaceFolders && workspaceFolders.length > 0
      ? workspaceFolders[0].uri.fsPath
      : ''
  }
}

