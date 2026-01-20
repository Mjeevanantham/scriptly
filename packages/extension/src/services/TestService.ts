import { LLMService } from './LLMService'
import { Logger } from '../utils/Logger'
import * as vscode from 'vscode'

export class TestService {
  constructor(private llmService: LLMService) {}

  async generateTests(uri: vscode.Uri): Promise<string> {
    try {
      const document = await vscode.workspace.openTextDocument(uri)
      const code = document.getText()
      const language = document.languageId

      Logger.debug('TestService', 'Generating tests', {
        file: uri.fsPath,
        language,
      })

      // Determine test framework based on language
      let testFramework = 'unit tests'
      if (language === 'typescript' || language === 'javascript') {
        testFramework = 'Jest'
      } else if (language === 'python') {
        testFramework = 'pytest'
      } else if (language === 'java') {
        testFramework = 'JUnit'
      }

      const prompt = `Generate comprehensive ${testFramework} tests for the following ${language} code.

Code:
\`\`\`${language}
${code}
\`\`\`

Requirements:
1. Test all public functions/methods
2. Include edge cases and error handling
3. Use descriptive test names
4. Follow ${testFramework} best practices
5. Provide setup/teardown if needed

Provide the complete test file code.`

      const response = await this.llmService.generateChat({
        message: prompt,
        fileContext: code,
        selectedCode: '',
        conversationId: 'test-' + Date.now(),
      })

      return response
    } catch (error) {
      Logger.error('TestService', 'Error generating tests', error)
      throw error
    }
  }

  async findBugs(uri: vscode.Uri): Promise<string> {
    try {
      const document = await vscode.workspace.openTextDocument(uri)
      const code = document.getText()
      const language = document.languageId

      Logger.debug('TestService', 'Finding bugs', {
        file: uri.fsPath,
        language,
      })

      const prompt = `Analyze the following ${language} code and identify all potential bugs.

Code:
\`\`\`${language}
${code}
\`\`\`

For each bug found:
1. Describe the bug clearly
2. Explain why it's a problem
3. Suggest how to fix it
4. Provide the fixed code if applicable

Focus on:
- Logic errors
- Type errors
- Null/undefined handling
- Race conditions
- Memory leaks
- Security vulnerabilities`

      const response = await this.llmService.generateChat({
        message: prompt,
        fileContext: code,
        selectedCode: '',
        conversationId: 'bugs-' + Date.now(),
      })

      return response
    } catch (error) {
      Logger.error('TestService', 'Error finding bugs', error)
      throw error
    }
  }
}
