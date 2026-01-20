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
    this.encryptionKey = this.getOrCreateEncryptionKey()
  }

  private getOrCreateEncryptionKey(): Buffer {
    // Derive encryption key from machine ID for consistency
    const machineId = vscode.env.machineId || 'default-machine-id'
    return crypto.createHash('sha256').update(machineId).digest()
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
    if (!ivHex || !authTagHex || !encrypted) {
      throw new Error('Invalid encrypted key format')
    }

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

  async getApiKey(provider: LLMProvider): Promise<string | null> {
    try {
      const keyName = `scriptly.apiKey.${provider}`
      const encryptedKey = await this.context.secrets.get(keyName)

      if (!encryptedKey) {
        Logger.debug('ConfigService', `No API key found for ${provider}`)
        return null
      }

      const decryptedKey = this.decrypt(encryptedKey)
      Logger.debug('ConfigService', `API key retrieved for ${provider}`, {
        keyLength: decryptedKey.length,
      })
      return decryptedKey
    } catch (error) {
      Logger.error('ConfigService', `Failed to get API key for ${provider}`, error)
      return null
    }
  }

  async setApiKey(provider: LLMProvider, apiKey: string): Promise<void> {
    try {
      const keyName = `scriptly.apiKey.${provider}`
      const encryptedKey = this.encrypt(apiKey.trim())

      await this.context.secrets.store(keyName, encryptedKey)
      Logger.info('ConfigService', `API key stored for ${provider}`, {
        keyLength: apiKey.length,
      })
    } catch (error) {
      Logger.error('ConfigService', `Failed to store API key for ${provider}`, error)
      throw error
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

    try {
      if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/models', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${apiKey}`,
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

        Logger.info('ConfigService', 'OpenAI API key validated successfully')
        return true
      } else if (provider === 'claude') {
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
        // Ollama doesn't require API key validation
        return true
      } else if (provider === 'custom') {
        // Custom endpoint validation would need baseURL
        return true
      }

      return false
    } catch (error) {
      Logger.error('ConfigService', `Error validating API key for ${provider}`, error)
      return false
    }
  }

  async getLLMConfig(): Promise<LLMConfig> {
    const config = vscode.workspace.getConfiguration('scriptly')
    const provider = (config.get<LLMProvider>('llmProvider', 'openai')) || 'openai'
    const modelName = config.get<string>('modelName', 'gpt-4') || 'gpt-4'
    const temperature = config.get<number>('temperature', 0.3) || 0.3

    const apiKey = await this.getApiKey(provider)

    return {
      provider,
      apiKey: apiKey || undefined,
      modelName,
      temperature,
      maxTokens: 4000,
      baseURL: provider === 'custom' ? config.get<string>('baseURL') : undefined,
    }
  }

  async clearAllStorage(): Promise<void> {
    try {
      const providers: LLMProvider[] = ['openai', 'claude', 'ollama', 'custom']
      for (const provider of providers) {
        const keyName = `scriptly.apiKey.${provider}`
        await this.context.secrets.delete(keyName)
      }
      Logger.info('ConfigService', 'All storage cleared')
    } catch (error) {
      Logger.error('ConfigService', 'Failed to clear storage', error)
      throw error
    }
  }
}
