import * as vscode from 'vscode'
import { Logger } from '../utils/Logger'

export interface QueuedRequest {
  id: string
  command: string
  data: any
  timestamp: number
}

export class OfflineService {
  private queue: QueuedRequest[] = []
  private isOffline: boolean = false

  constructor(private readonly context: vscode.ExtensionContext) {
    this.checkOfflineStatus()
  }

  private async checkOfflineStatus(): Promise<void> {
    // Check if Ollama is available (local LLM)
    this.isOffline = false // Would check Ollama connection
  }

  async queueRequest(command: string, data: any): Promise<string> {
    const request: QueuedRequest = {
      id: Date.now().toString(),
      command,
      data,
      timestamp: Date.now(),
    }

    this.queue.push(request)
    Logger.debug('OfflineService', 'Request queued', { requestId: request.id, command })

    // Store queue in context
    await this.context.globalState.update('scriptly.offlineQueue', this.queue)

    return request.id
  }

  async processQueue(): Promise<void> {
    if (this.queue.length === 0) return

    Logger.debug('OfflineService', 'Processing queued requests', { count: this.queue.length })

    // Process queue when back online
    // Implementation would sync with LLM service
  }

  clearQueue(): void {
    this.queue = []
    this.context.globalState.update('scriptly.offlineQueue', [])
    Logger.debug('OfflineService', 'Queue cleared')
  }

  isOnline(): boolean {
    return !this.isOffline
  }
}

