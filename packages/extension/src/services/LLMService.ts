import { ConfigService } from './ConfigService'
import { LLMConfig, CompletionRequest, ChatRequest } from '../types'
import { ChatOpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatOllama } from '@langchain/community/chat_models/ollama'
import { HumanMessage } from '@langchain/core/messages'
import { Logger } from '../utils/Logger'

// Using any for MVP - LangChain types are complex and vary by version
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
        
        // Log the API key being used (preview only for security)
        const apiKeyPreview = config.apiKey.substring(0, 10) + '...'
        Logger.debug('LLMService', 'Creating ChatOpenAI model', {
          modelName: config.modelName,
          apiKeyLength: config.apiKey.length,
          apiKeyPreview,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
        })
        
        try {
          // ChatOpenAI expects openAIApiKey parameter or reads from OPENAI_API_KEY env var
          const modelConfig: any = {
            openAIApiKey: config.apiKey, // Primary parameter name
            apiKey: config.apiKey, // Alternative parameter name
            modelName: config.modelName,
            temperature: config.temperature,
            maxTokens: config.maxTokens,
          }
          
          // Also set environment variable as fallback
          if (typeof process !== 'undefined' && process.env) {
            process.env.OPENAI_API_KEY = config.apiKey
          }
          
          Logger.debug('LLMService', 'ChatOpenAI config prepared', {
            hasOpenAIApiKey: !!modelConfig.openAIApiKey,
            hasApiKey: !!modelConfig.apiKey,
            modelName: modelConfig.modelName,
          })
          
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
        return new ChatAnthropic({
          apiKey: config.apiKey,
          modelName: config.modelName,
          temperature: config.temperature,
          maxTokens: config.maxTokens,
        } as any)
      }

      case 'ollama': {
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
        // OpenAI-compatible endpoint
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

  async generateCompletion(
    request: CompletionRequest
  ): Promise<string> {
    const cacheKey = this.getCacheKey(request.code, request.cursorPosition)
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    const prompt = this.buildCompletionPrompt(request)
    const model = await this.getModel()

    try {
      // Use HumanMessage class from LangChain core
      const messages = [new HumanMessage(prompt)]
      const response = await model.invoke(messages)

      const suggestion = response.content as string
      this.cache.set(cacheKey, suggestion)
      return suggestion
    } catch (error) {
      Logger.error('LLMService', 'Completion generation failed', error)
      throw error
    }
  }

  async *streamCompletion(
    request: CompletionRequest
  ): AsyncIterable<string> {
    const prompt = this.buildCompletionPrompt(request)
    const model = await this.getModel()

    try {
      // Use HumanMessage class from LangChain core
      const messages = [new HumanMessage(prompt)]
      const stream = await model.stream(messages)

      for await (const chunk of stream) {
        if (chunk.content) {
          yield chunk.content as string
        }
      }
    } catch (error) {
      Logger.error('LLMService', 'Streaming completion failed', error)
      throw error
    }
  }

  async generateChatResponse(request: ChatRequest): Promise<string> {
    const prompt = this.buildChatPrompt(request)
    const model = await this.getModel()

    try {
      Logger.debug('LLMService', 'Generating chat response', {
        promptLength: prompt.length,
      })

      // Use HumanMessage class from LangChain core
      const messages = [new HumanMessage(prompt)]
      const response = await model.invoke(messages)

      Logger.debug('LLMService', 'Chat response generated successfully')
      return response.content as string
    } catch (error) {
      Logger.error('LLMService', 'Chat response generation failed', error)
      throw error
    }
  }

  async *streamChatResponse(
    request: ChatRequest
  ): AsyncIterable<string> {
    const prompt = this.buildChatPrompt(request)
    const model = await this.getModel()

    try {
      Logger.debug('LLMService', 'Streaming chat response', {
        promptLength: prompt.length,
        promptPreview: prompt.substring(0, 100) + '...',
      })

      // Use HumanMessage class from LangChain core
      const messages = [new HumanMessage(prompt)]
      
      Logger.debug('LLMService', 'Created HumanMessage, starting stream')
      const stream = await model.stream(messages)

      Logger.debug('LLMService', 'Stream started, iterating chunks')
      for await (const chunk of stream) {
        if (chunk.content) {
          yield chunk.content as string
        }
      }
      
      Logger.debug('LLMService', 'Stream completed successfully')
    } catch (error) {
      Logger.error('LLMService', 'Streaming chat response failed', error)
      throw error
    }
  }

  async switchModel(config: LLMConfig): Promise<void> {
    this.currentModel = null
    this.currentModel = await this.createModel(config)
  }

  private buildCompletionPrompt(request: CompletionRequest): string {
    return `You are an expert developer. Given the code context below, predict the NEXT LINE(S) of code that should logically follow.

Return ONLY the code to be inserted, NO explanation, NO markdown, NO code blocks.

File: ${request.filename}
Language: ${request.language}

---CODE CONTEXT---
${request.code}
---END CONTEXT---

Predict the next lines:`
  }

  private buildChatPrompt(request: ChatRequest): string {
    let systemPrompt = `You are an expert codebase analyst. Analyze the codebase and provide concise answers.

IMPORTANT:
- Keep responses SHORT (2-4 sentences max)
- Use bullet points for multiple items
- Focus on structure, patterns, and key functionality
- Format code blocks with proper language tags
- Be direct and actionable`

    let prompt = systemPrompt

    if (request.fileContext) {
      // Truncate context if it's too long (with some buffer for the rest of the prompt)
      const maxContextLength = 12000 // Leave room for system prompt and user message
      const truncatedContext = request.fileContext.length > maxContextLength
        ? request.fileContext.substring(0, maxContextLength) + '\n\n[... context truncated ...]'
        : request.fileContext
      
      prompt += `\n\n--- CODEBASE ---\n${truncatedContext}\n--- END CODEBASE ---\n\n`
    }

    prompt += `Question: ${request.message}`

    if (request.selectedCode) {
      // Limit selected code too
      const maxSelectionLength = 2000
      const truncatedSelection = request.selectedCode.length > maxSelectionLength
        ? request.selectedCode.substring(0, maxSelectionLength) + '\n[... truncated ...]'
        : request.selectedCode
      
      prompt += `\n\n--- SELECTED ---\n\`\`\`\n${truncatedSelection}\n\`\`\`\n--- END ---`
    }

    Logger.debug('LLMService', 'Built chat prompt', {
      totalLength: prompt.length,
      hasContext: !!request.fileContext,
      contextLength: request.fileContext?.length || 0,
      messageLength: request.message.length,
    })

    return prompt
  }

  private getCacheKey(code: string, position: number): string {
    // Simple hash-based cache key
    const hash = code.slice(Math.max(0, position - 100), position + 50)
    return `${hash}_${position}`
  }

  invalidateCache(): void {
    this.cache.clear()
  }

  // Invalidate the current model (useful when API key changes)
  invalidateModel(): void {
    this.currentModel = null
    this.cache.clear()
  }
}

