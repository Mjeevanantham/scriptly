import { CodeIndexer } from './CodeIndexer'
import { LLMService } from './LLMService'
import { Logger } from '../utils/Logger'

export class SearchService {
  constructor(
    private codeIndexer: CodeIndexer,
    private llmService: LLMService
  ) {}

  async semanticSearch(query: string): Promise<string> {
    try {
      Logger.info('SearchService', 'Performing semantic search', { query })

      // First, do a basic text search
      const chunks = await this.codeIndexer.search(query)
      
      if (chunks.length === 0) {
        return `No results found for: "${query}"`
      }

      // Build context from top results
      const context = chunks
        .slice(0, 10)
        .map(
          (chunk) =>
            `File: ${chunk.filePath}:${chunk.startLine}\n\`\`\`${chunk.language}\n${chunk.content}\n\`\`\``
        )
        .join('\n\n')

      // Use LLM to provide semantic search results
      const prompt = `Based on the following codebase context, answer this query: "${query}"

Context from codebase:
${context}

Provide:
1. A direct answer to the query
2. Relevant code locations
3. Explanation of how the code relates to the query

If the query asks where something is implemented, provide file paths and line numbers.`

      const response = await this.llmService.generateChat({
        message: prompt,
        fileContext: context,
        selectedCode: '',
        conversationId: 'search-' + Date.now(),
      })

      return response
    } catch (error) {
      Logger.error('SearchService', 'Error performing semantic search', error)
      throw error
    }
  }

  async findReferences(query: string): Promise<string> {
    try {
      const chunks = await this.codeIndexer.search(query)
      
      if (chunks.length === 0) {
        return `No references found for: "${query}"`
      }

      // Group by file
      const byFile: Record<string, number[]> = {}
      for (const chunk of chunks) {
        if (!byFile[chunk.filePath]) {
          byFile[chunk.filePath] = []
        }
        byFile[chunk.filePath].push(chunk.startLine)
      }

      // Format results
      let result = `Found ${chunks.length} reference(s) for "${query}":\n\n`
      for (const [file, lines] of Object.entries(byFile)) {
        result += `${file}:${lines.join(', ')}\n`
      }

      return result
    } catch (error) {
      Logger.error('SearchService', 'Error finding references', error)
      throw error
    }
  }
}
