import * as vscode from 'vscode'
import { LLMService } from '../services/LLMService'
import { Logger } from '../utils/Logger'
import { CompletionRequest } from '../types'

export class CompletionProvider implements vscode.InlineCompletionItemProvider {
  constructor(private llmService: LLMService) {}

  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList | null> {
    try {
      Logger.debug('CompletionProvider', 'Providing completion', {
        file: document.fileName,
        line: position.line,
      })

      // Get context around cursor
      const contextLines = 10
      const startLine = Math.max(0, position.line - contextLines)
      const endLine = Math.min(document.lineCount - 1, position.line + contextLines)
      const contextText = document.getText(
        new vscode.Range(
          new vscode.Position(startLine, 0),
          new vscode.Position(endLine, document.lineAt(endLine).text.length)
        )
      )

      // Get code up to cursor
      const textBeforeCursor = document.getText(
        new vscode.Range(
          new vscode.Position(0, 0),
          position
        )
      )

      const request: CompletionRequest = {
        code: textBeforeCursor,
        cursorPosition: textBeforeCursor.length,
        language: document.languageId,
        filename: document.fileName,
        contextLines,
      }

      const completion = await this.llmService.generateCompletion(request)

      if (completion && !token.isCancellationRequested) {
        Logger.debug('CompletionProvider', 'Completion generated', {
          length: completion.length,
        })

        return [
          new vscode.InlineCompletionItem(completion.trim(), new vscode.Range(position, position)),
        ]
      }

      return null
    } catch (error) {
      Logger.error('CompletionProvider', 'Error providing completion', error)
      return null
    }
  }
}
