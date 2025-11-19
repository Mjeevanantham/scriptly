import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { CodeChunk } from '../types'

export class CodeIndexer {
  private chunks: Map<string, CodeChunk[]> = new Map()
  private fileHashes: Map<string, string> = new Map()

  async indexWorkspace(workspacePath: string): Promise<void> {
    const files = await this.getAllCodeFiles(workspacePath)
    for (const file of files) {
      await this.indexFile(file)
    }
  }

  async indexFile(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const hash = this.computeHash(content)

      // Skip if file hasn't changed
      if (this.fileHashes.get(filePath) === hash) {
        return
      }

      this.fileHashes.set(filePath, hash)
      const chunks = this.chunkFile(filePath, content)
      this.chunks.set(filePath, chunks)
    } catch (error) {
      console.error(`Failed to index file ${filePath}:`, error)
    }
  }

  getContextByFile(
    filePath: string,
    lineNumber: number,
    contextLines: number = 10
  ): CodeChunk[] {
    const chunks = this.chunks.get(filePath) || []
    return chunks.filter((chunk) => {
      const start = chunk.startLine
      const end = start + chunk.content.split('\n').length
      return (
        lineNumber >= start - contextLines &&
        lineNumber <= end + contextLines
      )
    })
  }

  searchByContent(query: string): CodeChunk[] {
    const results: CodeChunk[] = []
    const lowerQuery = query.toLowerCase()

    for (const chunks of this.chunks.values()) {
      for (const chunk of chunks) {
        if (chunk.content.toLowerCase().includes(lowerQuery)) {
          results.push(chunk)
        }
      }
    }

    return results.slice(0, 10) // Return top 10 matches
  }

  onFileChanged(filePath: string): void {
    this.indexFile(filePath)
  }

  invalidateCache(): void {
    this.chunks.clear()
    this.fileHashes.clear()
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

