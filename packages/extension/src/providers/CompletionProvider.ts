import * as vscode from 'vscode'
import { LLMService } from '../services/LLMService'
import { CodeIndexer } from '../services/CodeIndexer'
import { CompletionRequest } from '../types'

export class CompletionProvider
  implements vscode.InlineCompletionItemProvider
{
  private llmService: LLMService
  private codeIndexer: CodeIndexer

  constructor(llmService: LLMService, codeIndexer: CodeIndexer) {
    this.llmService = llmService
    this.codeIndexer = codeIndexer
  }

  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.InlineCompletionList | null> {
    try {
      // Get code context
      const code = document.getText()
      const codeBefore = code.slice(0, document.offsetAt(position))
      const codeAfter = code.slice(document.offsetAt(position))

      // Get file context from indexer
      const contextChunks = this.codeIndexer.getContextByFile(
        document.fileName,
        position.line
      )
      const contextCode = contextChunks
        .map((chunk) => chunk.content)
        .join('\n\n')

      const request: CompletionRequest = {
        code: codeBefore,
        cursorPosition: codeBefore.length,
        language: document.languageId,
        filename: document.fileName,
        contextLines: 100,
      }

      // Generate completion (use streaming for better UX)
      const suggestion = await this.llmService.generateCompletion(request)

      if (!suggestion || token.isCancellationRequested) {
        return null
      }

      const completionItem = new vscode.InlineCompletionItem(suggestion)
      return new vscode.InlineCompletionList([completionItem])
    } catch (error) {
      console.error('Completion generation failed:', error)
      return null
    }
  }
}

