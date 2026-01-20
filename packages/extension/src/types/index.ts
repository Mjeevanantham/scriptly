export type LLMProvider = 'openai' | 'claude' | 'ollama' | 'custom'

export interface LLMConfig {
  provider: LLMProvider
  apiKey?: string
  modelName: string
  temperature: number
  maxTokens?: number
  baseURL?: string
}

export interface CompletionRequest {
  code: string
  cursorPosition: number
  language: string
  filename: string
  contextLines: number
}

export interface CompletionResponse {
  suggestion: string
  confidence: number
  executionTime: number
  tokensUsed: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  codeContext?: string
}

export interface ChatRequest {
  message: string
  fileContext: string
  selectedCode: string
  conversationId: string
}

export interface ChatResponse {
  messageId: string
  content: string
  tokensUsed: number
  model: string
}

export interface APIKeyConfig {
  provider: LLMProvider
  apiKey: string
  endpoint?: string
  modelName: string
  isDefault: boolean
}

export interface CodeChunk {
  id: string
  filePath: string
  content: string
  startLine: number
  language: string
  hash: string
  embedding?: number[]
}
