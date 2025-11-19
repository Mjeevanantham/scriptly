import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { Logger } from '../utils/Logger'

export interface SearchResult {
  file: string
  title: string
  content: string
  description: string
  lineNumber?: number
  relevance: number
}

export class SearchService {
  constructor(private readonly workspacePath: string) {}

  async searchCodebase(query: string): Promise<SearchResult[]> {
    Logger.debug('SearchService', 'Starting codebase search', { query })

    try {
      const results: SearchResult[] = []
      const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs']
      const ignoreDirs = ['node_modules', '.git', 'dist', 'build', 'out']

      const walkDir = (dir: string): void => {
        try {
          const entries = fs.readdirSync(dir, { withFileTypes: true })

          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)

            if (entry.isDirectory()) {
              if (!ignoreDirs.includes(entry.name)) {
                walkDir(fullPath)
              }
            } else if (entry.isFile()) {
              const ext = path.extname(entry.name).toLowerCase()
              if (codeExtensions.includes(ext)) {
                try {
                  const content = fs.readFileSync(fullPath, 'utf8')
                  if (content.toLowerCase().includes(query.toLowerCase())) {
                    const relativePath = path.relative(this.workspacePath, fullPath)
                    results.push({
                      file: relativePath,
                      title: entry.name,
                      content: content.substring(0, 200),
                      description: `Found in ${relativePath}`,
                      relevance: this.calculateRelevance(content, query),
                    })
                  }
                } catch {
                  // Skip unreadable files
                }
              }
            }
          }
        } catch {
          // Skip inaccessible directories
        }
      }

      walkDir(this.workspacePath)

      // Sort by relevance
      results.sort((a, b) => b.relevance - a.relevance)

      return results.slice(0, 10) // Return top 10 results
    } catch (error) {
      Logger.error('SearchService', 'Search failed', error)
      return []
    }
  }

  private calculateRelevance(content: string, query: string): number {
    const lowerContent = content.toLowerCase()
    const lowerQuery = query.toLowerCase()
    let score = 0

    // Exact match
    if (lowerContent.includes(lowerQuery)) {
      score += 10
    }

    // Word matches
    const queryWords = lowerQuery.split(/\s+/)
    queryWords.forEach((word) => {
      if (lowerContent.includes(word)) {
        score += 2
      }
    })

    return score
  }
}

