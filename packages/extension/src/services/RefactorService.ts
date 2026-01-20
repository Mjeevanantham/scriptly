import { LLMService } from './LLMService'
import { Logger } from '../utils/Logger'
import * as vscode from 'vscode'

export class RefactorService {
  constructor(private llmService: LLMService) {}

  async analyzeCode(uri: vscode.Uri): Promise<string> {
    try {
      const document = await vscode.workspace.openTextDocument(uri)
      const code = document.getText()
      const language = document.languageId

      Logger.debug('RefactorService', 'Analyzing code', {
        file: uri.fsPath,
        language,
        codeLength: code.length,
      })

      const prompt = `Analyze the following ${language} code and identify:
1. Potential bugs or issues
2. Code smells and anti-patterns
3. Performance improvements
4. Security concerns
5. Best practices violations

Code:
\`\`\`${language}
${code}
\`\`\`

Provide a detailed analysis with specific recommendations.`

      const response = await this.llmService.generateChat({
        message: prompt,
        fileContext: code,
        selectedCode: '',
        conversationId: 'refactor-' + Date.now(),
      })

      return response
    } catch (error) {
      Logger.error('RefactorService', 'Error analyzing code', error)
      throw error
    }
  }

  async suggestRefactoring(uri: vscode.Uri): Promise<string> {
    try {
      const document = await vscode.workspace.openTextDocument(uri)
      const code = document.getText()
      const language = document.languageId

      Logger.debug('RefactorService', 'Suggesting refactoring', {
        file: uri.fsPath,
        language,
      })

      const prompt = `Suggest refactoring improvements for the following ${language} code.
Provide specific refactored code examples with explanations.

Original code:
\`\`\`${language}
${code}
\`\`\`

Focus on:
- Improving readability
- Reducing complexity
- Following best practices
- Maintaining functionality`

      const response = await this.llmService.generateChat({
        message: prompt,
        fileContext: code,
        selectedCode: '',
        conversationId: 'refactor-' + Date.now(),
      })

      return response
    } catch (error) {
      Logger.error('RefactorService', 'Error suggesting refactoring', error)
      throw error
    }
  }
}
