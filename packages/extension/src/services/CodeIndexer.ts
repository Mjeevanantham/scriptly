import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { CodeChunk } from '../types'
import { Logger } from '../utils/Logger'

export class CodeIndexer {
  private chunks: Map<string, CodeChunk[]> = new Map()
  private fileHashes: Map<string, string> = new Map()

  async indexWorkspace(workspacePath: string): Promise<void> {
    Logger.info('CodeIndexer', 'Starting workspace indexing', { workspacePath })
    const files = await this.getAllCodeFiles(workspacePath)
    Logger.info('CodeIndexer', 'Found code files to index', { fileCount: files.length })
    
    for (const file of files) {
      await this.indexFile(file)
    }
    
    Logger.info('CodeIndexer', 'Workspace indexing completed', {
      totalFiles: files.length,
      indexedFiles: this.chunks.size,
    })
  }

  async indexFile(filePath: string): Promise<void> {
    Logger.debug('CodeIndexer', 'Indexing file', { filePath })
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const hash = this.computeHash(content)

      // Skip if file hasn't changed
      const existingHash = this.fileHashes.get(filePath)
      if (existingHash === hash) {
        Logger.debug('CodeIndexer', 'File unchanged, skipping', { filePath })
        return
      }

      Logger.debug('CodeIndexer', 'File changed or new, indexing', {
        filePath,
        contentLength: content.length,
        hadPreviousHash: !!existingHash,
      })

      this.fileHashes.set(filePath, hash)
      const chunks = this.chunkFile(filePath, content)
      this.chunks.set(filePath, chunks)
      
      Logger.debug('CodeIndexer', 'File indexed successfully', {
        filePath,
        chunkCount: chunks.length,
      })
    } catch (error) {
      Logger.error('CodeIndexer', `Failed to index file ${filePath}`, error)
    }
  }

  getContextByFile(
    filePath: string,
    lineNumber: number,
    contextLines: number = 10
  ): CodeChunk[] {
    Logger.debug('CodeIndexer', 'Getting context by file', {
      filePath,
      lineNumber,
      contextLines,
    })
    
    const chunks = this.chunks.get(filePath) || []
    const filtered = chunks.filter((chunk) => {
      const start = chunk.startLine
      const end = start + chunk.content.split('\n').length
      return (
        lineNumber >= start - contextLines &&
        lineNumber <= end + contextLines
      )
    })
    
    Logger.debug('CodeIndexer', 'Context chunks retrieved', {
      filePath,
      totalChunks: chunks.length,
      filteredChunks: filtered.length,
    })
    
    return filtered
  }

  searchByContent(query: string): CodeChunk[] {
    Logger.info('CodeIndexer', 'Searching by content', {
      query,
      queryLength: query.length,
      indexedFiles: this.chunks.size,
    })
    
    const results: CodeChunk[] = []
    const lowerQuery = query.toLowerCase()

    for (const [filePath, chunks] of this.chunks.entries()) {
      for (const chunk of chunks) {
        if (chunk.content.toLowerCase().includes(lowerQuery)) {
          results.push(chunk)
        }
      }
    }

    const topResults = results.slice(0, 10) // Return top 10 matches
    Logger.info('CodeIndexer', 'Search completed', {
      totalMatches: results.length,
      returnedResults: topResults.length,
    })
    
    return topResults
  }

  onFileChanged(filePath: string): void {
    Logger.debug('CodeIndexer', 'File changed event received', { filePath })
    this.indexFile(filePath)
  }

  invalidateCache(): void {
    Logger.info('CodeIndexer', 'Invalidating cache', {
      filesInCache: this.chunks.size,
      hashesInCache: this.fileHashes.size,
    })
    this.chunks.clear()
    this.fileHashes.clear()
    Logger.debug('CodeIndexer', 'Cache invalidated')
  }

  private async getAllCodeFiles(
    rootPath: string
  ): Promise<string[]> {
    const files: string[] = []
    const codeExtensions = [
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
      '.py',
      '.java',
      '.go',
      '.rs',
      '.sql',
    ]
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
            const ext = path.extname(entry.name)
            if (codeExtensions.includes(ext)) {
              files.push(fullPath)
            }
          }
        }
      } catch (error) {
        // Skip inaccessible directories
      }
    }

    walkDir(rootPath)
    return files
  }

  private chunkFile(filePath: string, content: string): CodeChunk[] {
    const lines = content.split('\n')
    const chunks: CodeChunk[] = []
    const language = this.detectLanguage(filePath)

    // Simple chunking by functions/classes
    let currentChunk: string[] = []
    let startLine = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Simple heuristic: start new chunk on function/class definition
      if (
        /^(export\s+)?(function|class|const|let|var)\s+\w+/.test(line) &&
        currentChunk.length > 0
      ) {
        if (currentChunk.length > 0) {
          chunks.push({
            id: `${filePath}:${startLine}`,
            filePath,
            content: currentChunk.join('\n'),
            startLine,
            language,
            hash: this.computeHash(currentChunk.join('\n')),
          })
        }
        currentChunk = [line]
        startLine = i
      } else {
        currentChunk.push(line)
      }
    }

    // Add remaining chunk
    if (currentChunk.length > 0) {
      chunks.push({
        id: `${filePath}:${startLine}`,
        filePath,
        content: currentChunk.join('\n'),
        startLine,
        language,
        hash: this.computeHash(currentChunk.join('\n')),
      })
    }

    return chunks
  }

  private detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase()
    const langMap: Record<string, string> = {
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.py': 'python',
      '.java': 'java',
      '.go': 'go',
      '.rs': 'rust',
      '.sql': 'sql',
    }
    return langMap[ext] || 'text'
  }

  private computeHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex')
  }
}

