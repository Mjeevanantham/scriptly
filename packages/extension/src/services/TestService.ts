import * as vscode from 'vscode'
import { LLMService } from './LLMService'
import { Logger } from '../utils/Logger'
import type { TestSuggestion } from '../types/ui'

export class TestService {
  constructor(private readonly llmService: LLMService) {}

  async generateTests(filePath: string, code: string): Promise<TestSuggestion[]> {
    Logger.debug('TestService', 'Generating test suggestions', { filePath })

    try {
      // Detect test framework from file path or code
      const testFramework = this.detectTestFramework(filePath, code)

      // Use LLM to generate tests
      const suggestions: TestSuggestion[] = []

      Logger.debug('TestService', 'Test generation complete', {
        filePath,
        testFramework,
        suggestionCount: suggestions.length,
      })

      return suggestions
    } catch (error) {
      Logger.error('TestService', 'Test generation failed', error)
      return []
    }
  }

  private detectTestFramework(filePath: string, code: string): string {
    if (filePath.includes('.test.') || filePath.includes('.spec.')) {
      if (code.includes('describe') || code.includes('it(')) {
        return 'jest'
      }
      if (code.includes('test(')) {
        return 'vitest'
      }
    }
    return 'jest' // Default
  }
}

