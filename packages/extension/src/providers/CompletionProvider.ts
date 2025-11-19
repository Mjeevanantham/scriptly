import * as vscode from 'vscode'
import { LLMService } from '../services/LLMService'
import { CodeIndexer } from '../services/CodeIndexer'
import { CompletionRequest } from '../types'
import { Logger } from '../utils/Logger'

export class CompletionProvider
  implements vscode.InlineCompletionItemProvider
{
  private llmService: LLMService
  private codeIndexer: CodeIndexer

  constructor(llmService: LLMService, codeIndexer: CodeIndexer) {
    Logger.debug('CompletionProvider', 'CompletionProvider initialized')
    this.llmService = llmService
    this.codeIndexer = codeIndexer
  }

  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.InlineCompletionList | null> {
    Logger.debug('CompletionProvider', 'Inline completion requested', {
      fileName: document.fileName,
      language: document.languageId,
      line: position.line,
      character: position.character,
      triggerKind: context.triggerKind,
    })
    
    try {
      // Get code context
      const code = document.getText()
      const codeBefore = code.slice(0, document.offsetAt(position))
      const codeAfter = code.slice(document.offsetAt(position))

      Logger.debug('CompletionProvider', 'Code context extracted', {
        codeBeforeLength: codeBefore.length,
        codeAfterLength: codeAfter.length,
        totalCodeLength: code.length,
      })

      // Get file context from indexer
      Logger.debug('CompletionProvider', 'Getting context from code indexer')
      const contextChunks = this.codeIndexer.getContextByFile(
        document.fileName,
        position.line
      )
      const contextCode = contextChunks
        .map((chunk) => chunk.content)
        .join('\n\n')

      Logger.debug('CompletionProvider', 'Context chunks retrieved', {
        chunkCount: contextChunks.length,
        contextCodeLength: contextCode.length,
      })

      const request: CompletionRequest = {
        code: codeBefore,
        cursorPosition: codeBefore.length,
        language: document.languageId,
        filename: document.fileName,
        contextLines: 100,
      }

      Logger.info('CompletionProvider', 'Generating completion', {
        language: request.language,
        cursorPosition: request.cursorPosition,
        codeLength: request.code.length,
      })

      // Generate completion (use streaming for better UX)
      const suggestion = await this.llmService.generateCompletion(request)

      if (!suggestion || token.isCancellationRequested) {
        Logger.debug('CompletionProvider', 'Completion cancelled or empty', {
          hasSuggestion: !!suggestion,
          isCancelled: token.isCancellationRequested,
        })
        return null
      }

      Logger.info('CompletionProvider', 'Completion generated successfully', {
        suggestionLength: suggestion.length,
        preview: suggestion.substring(0, 50) + '...',
      })

      const completionItem = new vscode.InlineCompletionItem(suggestion)
      return new vscode.InlineCompletionList([completionItem])
    } catch (error) {
      Logger.error('CompletionProvider', 'Completion generation failed', error)
      return null
    }
  }
}

