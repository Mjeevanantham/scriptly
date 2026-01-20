import { ConfigService } from './ConfigService'
import { LLMConfig, CompletionRequest, ChatRequest } from '../types'
import { ChatOpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatOllama } from '@langchain/community/chat_models/ollama'
import { HumanMessage } from '@langchain/core/messages'
import { Logger } from '../utils/Logger'

type LLMModel = any

export class LLMService {
  private configService: ConfigService
  private currentModel: LLMModel | null = null
  private cache: Map<string, string> = new Map()

  constructor(configService: ConfigService) {
    this.configService = configService
  }

  private async getModel(): Promise<LLMModel> {
    if (this.currentModel) {
      return this.currentModel
    }

    const config = await this.configService.getLLMConfig()
    this.currentModel = await this.createModel(config)
    return this.currentModel
  }

  private async createModel(config: LLMConfig): Promise<LLMModel> {
    switch (config.provider) {
      case 'openai': {
        if (!config.apiKey) {
          throw new Error('OpenAI API key not configured')
        }

        Logger.debug('LLMService', 'Creating ChatOpenAI model', {
          modelName: config.modelName,
          apiKeyLength: config.apiKey.length,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
        })

        try {
          const modelConfig: any = {
            openAIApiKey: config.apiKey,
            apiKey: config.apiKey,
            modelName: config.modelName,
            temperature: config.temperature,
            maxTokens: config.maxTokens || 4000,
          }

          if (typeof process !== 'undefined' && process.env) {
            process.env.OPENAI_API_KEY = config.apiKey
          }

          const model = new ChatOpenAI(modelConfig)
          Logger.info('LLMService', 'ChatOpenAI model created successfully')
          return model
        } catch (error) {
          Logger.error('LLMService', 'Failed to create ChatOpenAI model', error)
          throw error
        }
      }

      case 'claude': {
        if (!config.apiKey) {
          throw new Error('Claude API key not configured')
        }

        Logger.debug('LLMService', 'Creating ChatAnthropic model', {
          modelName: config.modelName,
          apiKeyLength: config.apiKey.length,
        })

        return new ChatAnthropic({
          apiKey: config.apiKey,
          modelName: config.modelName,
          temperature: config.temperature,
          maxTokens: config.maxTokens || 4000,
        } as any)
      }

      case 'ollama': {
        Logger.debug('LLMService', 'Creating ChatOllama model', {
          baseURL: config.baseURL || 'http://localhost:11434',
          modelName: config.modelName || 'llama2',
        })

        return new ChatOllama({
          baseUrl: config.baseURL || 'http://localhost:11434',
          model: config.modelName || 'llama2',
          temperature: config.temperature,
        } as any)
      }

      case 'custom': {
        if (!config.baseURL || !config.apiKey) {
          throw new Error('Custom endpoint requires baseURL and apiKey')
        }

        Logger.debug('LLMService', 'Creating ChatOpenAI model for custom endpoint', {
          baseURL: config.baseURL,
          modelName: config.modelName,
          apiKeyLength: config.apiKey.length,
        })

        try {
          const modelConfig: any = {
            openAIApiKey: config.apiKey,
            apiKey: config.apiKey,
            configuration: {
              baseURL: config.baseURL,
            },
            modelName: config.modelName,
            temperature: config.temperature,
            maxTokens: config.maxTokens || 4000,
          }

          if (typeof process !== 'undefined' && process.env) {
            process.env.OPENAI_API_KEY = config.apiKey
          }

          const model = new ChatOpenAI(modelConfig)
          Logger.info('LLMService', 'ChatOpenAI model created successfully for custom endpoint')
          return model
        } catch (error) {
          Logger.error('LLMService', 'Failed to create ChatOpenAI model for custom endpoint', error)
          throw error
        }
      }

      default:
        throw new Error(`Unsupported provider: ${config.provider}`)
    }
  }

  async generateCompletion(request: CompletionRequest): Promise<string> {
    try {
      const model = await this.getModel()
      const prompt = `Complete the following code:\n\n${request.code}\n\nProvide only the completion, no explanations.`

      const response = await model.invoke([new HumanMessage(prompt)])
      const completion = typeof response.content === 'string' ? response.content : String(response.content)

      Logger.debug('LLMService', 'Completion generated', {
        length: completion.length,
        provider: (await this.configService.getLLMConfig()).provider,
      })

      return completion
    } catch (error) {
      Logger.error('LLMService', 'Failed to generate completion', error)
      throw error
    }
  }

  async *streamChat(request: ChatRequest): AsyncGenerator<string, void, unknown> {
    try {
      const model = await this.getModel()
      const config = await this.configService.getLLMConfig()

      // Build context
      let contextMessage = request.message
      if (request.fileContext) {
        contextMessage = `File context:\n${request.fileContext}\n\nUser question: ${request.message}`
      }
      if (request.selectedCode) {
        contextMessage += `\n\nSelected code:\n${request.selectedCode}`
      }

      Logger.debug('LLMService', 'Streaming chat response', {
        provider: config.provider,
        modelName: config.modelName,
        messageLength: request.message.length,
      })

      // Stream response
      const stream = await model.stream([new HumanMessage(contextMessage)])

      for await (const chunk of stream) {
        const content = typeof chunk.content === 'string' ? chunk.content : String(chunk.content)
        if (content) {
          yield content
        }
      }

      Logger.debug('LLMService', 'Chat stream completed')
    } catch (error) {
      Logger.error('LLMService', 'Failed to stream chat', error)
      throw error
    }
  }

  async generateChat(request: ChatRequest): Promise<string> {
    let fullResponse = ''
    for await (const chunk of this.streamChat(request)) {
      fullResponse += chunk
    }
    return fullResponse
  }

  resetModel(): void {
    this.currentModel = null
    Logger.debug('LLMService', 'Model reset')
  }
}
