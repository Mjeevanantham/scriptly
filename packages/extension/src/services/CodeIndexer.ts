import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import { CodeChunk } from '../types'
import { Logger } from '../utils/Logger'

export class CodeIndexer {
  private chunks: CodeChunk[] = []
  private isIndexed = false

  async indexWorkspace(): Promise<CodeChunk[]> {
    try {
      Logger.info('CodeIndexer', 'Starting workspace indexing')

      const workspaceFolders = vscode.workspace.workspaceFolders
      if (!workspaceFolders || workspaceFolders.length === 0) {
        Logger.warn('CodeIndexer', 'No workspace folders found')
        return []
      }

      this.chunks = []
      const workspaceRoot = workspaceFolders[0].uri.fsPath

      await this.indexDirectory(workspaceRoot, workspaceRoot)

      this.isIndexed = true
      Logger.info('CodeIndexer', 'Workspace indexing completed', {
        chunksCount: this.chunks.length,
      })

      return this.chunks
    } catch (error) {
      Logger.error('CodeIndexer', 'Error indexing workspace', error)
      throw error
    }
  }

  private async indexDirectory(dirPath: string, workspaceRoot: string): Promise<void> {
    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)
        const relativePath = path.relative(workspaceRoot, fullPath)

        // Skip common ignore patterns
        if (
          entry.name.startsWith('.') ||
          entry.name === 'node_modules' ||
          entry.name === 'dist' ||
          entry.name === 'build' ||
          entry.name === '.next' ||
          entry.name === 'out'
        ) {
          continue
        }

        if (entry.isDirectory()) {
          await this.indexDirectory(fullPath, workspaceRoot)
        } else if (entry.isFile()) {
          await this.indexFile(fullPath, relativePath)
        }
      }
    } catch (error) {
      Logger.debug('CodeIndexer', `Error indexing directory: ${dirPath}`, error)
    }
  }

  private async indexFile(filePath: string, relativePath: string): Promise<void> {
    try {
      // Only index code files
      const ext = path.extname(filePath)
      const codeExtensions = [
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
        '.py',
        '.java',
        '.cpp',
        '.c',
        '.cs',
        '.go',
        '.rs',
        '.php',
        '.rb',
        '.swift',
        '.kt',
        '.vue',
        '.svelte',
      ]

      if (!codeExtensions.includes(ext)) {
        return
      }

      const content = fs.readFileSync(filePath, 'utf8')
      const lines = content.split('\n')

      // Split large files into chunks
      const chunkSize = 100
      for (let i = 0; i < lines.length; i += chunkSize) {
        const chunkLines = lines.slice(i, i + chunkSize)
        const chunkContent = chunkLines.join('\n')

        const chunk: CodeChunk = {
          id: `${relativePath}-${i}`,
          filePath: relativePath,
          content: chunkContent,
          startLine: i + 1,
          language: ext.substring(1),
          hash: this.hashContent(chunkContent),
        }

        this.chunks.push(chunk)
      }

      Logger.debug('CodeIndexer', `Indexed file: ${relativePath}`, {
        lines: lines.length,
        chunks: Math.ceil(lines.length / chunkSize),
      })
    } catch (error) {
      Logger.debug('CodeIndexer', `Error indexing file: ${filePath}`, error)
    }
  }

  private hashContent(content: string): string {
    // Simple hash function
    let hash = 0
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return hash.toString(36)
  }

  getChunks(): CodeChunk[] {
    return this.chunks
  }

  isWorkspaceIndexed(): boolean {
    return this.isIndexed
  }

  async search(query: string): Promise<CodeChunk[]> {
    if (!this.isIndexed) {
      await this.indexWorkspace()
    }

    const lowerQuery = query.toLowerCase()
    const results: Array<{ chunk: CodeChunk; score: number }> = []

    for (const chunk of this.chunks) {
      let score = 0

      // Score based on filename match
      if (chunk.filePath.toLowerCase().includes(lowerQuery)) {
        score += 10
      }

      // Score based on content match
      const contentLower = chunk.content.toLowerCase()
      if (contentLower.includes(lowerQuery)) {
        score += 5
        // Boost score for multiple matches
        const matches = (contentLower.match(new RegExp(lowerQuery, 'g')) || []).length
        score += Math.min(matches, 5)
      }

      // Score based on language match
      if (chunk.language.toLowerCase() === lowerQuery) {
        score += 3
      }

      if (score > 0) {
        results.push({ chunk, score })
      }
    }

    // Sort by score and return top results
    results.sort((a, b) => b.score - a.score)
    return results.slice(0, 20).map((r) => r.chunk)
  }
}
