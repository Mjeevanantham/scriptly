/**
 * VSCodeActions - VS Code API integration for interactive elements
 * Handles file opening, URL opening, email handling, and git operations
 */

import * as vscode from 'vscode'
import * as path from 'path'
import { Logger } from './Logger'

export class VSCodeActions {
  /**
   * Open a file in VS Code editor at specified line and column
   */
  static async openFile(
    filePath: string,
    lineNumber?: number,
    column?: number,
    endLine?: number,
    workspacePath?: string
  ): Promise<void> {
    try {
      // Resolve file path relative to workspace if provided
      let resolvedPath = filePath
      if (workspacePath && !path.isAbsolute(filePath)) {
        resolvedPath = path.resolve(workspacePath, filePath)
      } else if (!path.isAbsolute(filePath)) {
        // Try to resolve relative to current workspace
        const workspaceFolders = vscode.workspace.workspaceFolders
        if (workspaceFolders && workspaceFolders.length > 0) {
          resolvedPath = path.resolve(
            workspaceFolders[0].uri.fsPath,
            filePath
          )
        }
      }

      Logger.debug('VSCodeActions', 'Opening file', {
        originalPath: filePath,
        resolvedPath,
        lineNumber,
        column,
        endLine,
      })

      // Check if file exists
      const uri = vscode.Uri.file(resolvedPath)
      try {
        await vscode.workspace.fs.stat(uri)
      } catch (error) {
        Logger.warn('VSCodeActions', 'File not found', {
          path: resolvedPath,
          error: error instanceof Error ? error.message : String(error),
        })
        vscode.window.showWarningMessage(
          `File not found: ${path.basename(resolvedPath)}`
        )
        return
      }

      // Open the document
      const document = await vscode.workspace.openTextDocument(uri)

      // Calculate selection range
      const line = lineNumber ? Math.max(0, lineNumber - 1) : 0 // Convert to 0-indexed
      const col = column ? Math.max(0, column - 1) : 0 // Convert to 0-indexed
      const end = endLine ? Math.max(0, endLine - 1) : line

      // Get line text to determine column bounds
      const lineText = document.lineAt(line).text
      const maxColumn = lineText.length

      // Create selection range
      const startPosition = new vscode.Position(
        line,
        Math.min(col, maxColumn)
      )
      const endPosition = new vscode.Position(
        end,
        Math.min(col, maxColumn)
      )

      // Show the document with selection
      await vscode.window.showTextDocument(document, {
        selection: new vscode.Range(startPosition, endPosition),
        preview: false, // Open in new editor tab, not preview
        preserveFocus: false, // Focus the editor
      })

      Logger.info('VSCodeActions', 'File opened successfully', {
        path: resolvedPath,
        lineNumber,
        column,
      })
    } catch (error) {
      Logger.error('VSCodeActions', 'Failed to open file', error)
      vscode.window.showErrorMessage(
        `Failed to open file: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Preview a file in a peek view (quick preview without opening)
   */
  static async previewFile(
    filePath: string,
    lineNumber?: number,
    workspacePath?: string
  ): Promise<void> {
    try {
      let resolvedPath = filePath
      if (workspacePath && !path.isAbsolute(filePath)) {
        resolvedPath = path.resolve(workspacePath, filePath)
      } else if (!path.isAbsolute(filePath)) {
        const workspaceFolders = vscode.workspace.workspaceFolders
        if (workspaceFolders && workspaceFolders.length > 0) {
          resolvedPath = path.resolve(
            workspaceFolders[0].uri.fsPath,
            filePath
          )
        }
      }

      const uri = vscode.Uri.file(resolvedPath)
      const document = await vscode.workspace.openTextDocument(uri)

      const line = lineNumber ? Math.max(0, lineNumber - 1) : 0

      await vscode.commands.executeCommand(
        'editor.action.peekDefinition',
        uri,
        new vscode.Position(line, 0)
      )

      Logger.info('VSCodeActions', 'File previewed', {
        path: resolvedPath,
        lineNumber,
      })
    } catch (error) {
      Logger.error('VSCodeActions', 'Failed to preview file', error)
      // Fallback to opening normally
      await this.openFile(filePath, lineNumber, undefined, undefined, workspacePath)
    }
  }

  /**
   * Open a URL in external browser
   */
  static async openURL(url: string): Promise<void> {
    try {
      // Normalize URL
      let normalizedUrl = url
      if (url.startsWith('www.')) {
        normalizedUrl = `https://${url}`
      }

      Logger.debug('VSCodeActions', 'Opening URL', { original: url, normalized: normalizedUrl })

      const uri = vscode.Uri.parse(normalizedUrl)
      await vscode.env.openExternal(uri)

      Logger.info('VSCodeActions', 'URL opened successfully', { url: normalizedUrl })
    } catch (error) {
      Logger.error('VSCodeActions', 'Failed to open URL', error)
      vscode.window.showErrorMessage(
        `Failed to open URL: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Open email client with mailto link
   */
  static async openEmail(email: string): Promise<void> {
    try {
      Logger.debug('VSCodeActions', 'Opening email', { email })

      const uri = vscode.Uri.parse(`mailto:${email}`)
      await vscode.env.openExternal(uri)

      Logger.info('VSCodeActions', 'Email opened successfully', { email })
    } catch (error) {
      Logger.error('VSCodeActions', 'Failed to open email', error)
      vscode.window.showErrorMessage(
        `Failed to open email: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Show git commit information
   */
  static async showGitCommit(hash: string): Promise<void> {
    try {
      Logger.debug('VSCodeActions', 'Showing git commit', { hash })

      const workspaceFolders = vscode.workspace.workspaceFolders
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showWarningMessage('No workspace folder found')
        return
      }

      // Try to use git extension commands if available
      try {
        // Show commit in source control view
        await vscode.commands.executeCommand(
          'git.openCommit',
          hash,
          workspaceFolders[0].uri
        )
      } catch (error) {
        // Fallback: show commit info in output
        Logger.warn('VSCodeActions', 'Git extension command not available', {
          error: error instanceof Error ? error.message : String(error),
        })

        // Try to get commit info using git command
        const { exec } = require('child_process')
        const util = require('util')
        const execAsync = util.promisify(exec)

        try {
          const { stdout } = await execAsync(
            `git show --stat ${hash}`,
            { cwd: workspaceFolders[0].uri.fsPath }
          )

          // Show in output channel
          const outputChannel = vscode.window.createOutputChannel('Scriptly Git')
          outputChannel.appendLine(`Git Commit: ${hash}`)
          outputChannel.appendLine('━'.repeat(50))
          outputChannel.appendLine(stdout)
          outputChannel.show()
        } catch (gitError) {
          // Final fallback: show hash in message
          vscode.window.showInformationMessage(
            `Git commit hash: ${hash}\n\nTo view commit details, use Git extension or run: git show ${hash}`
          )
        }
      }

      Logger.info('VSCodeActions', 'Git commit shown', { hash })
    } catch (error) {
      Logger.error('VSCodeActions', 'Failed to show git commit', error)
      vscode.window.showErrorMessage(
        `Failed to show git commit: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Copy text to clipboard
   */
  static async copyToClipboard(text: string): Promise<void> {
    try {
      await vscode.env.clipboard.writeText(text)
      Logger.info('VSCodeActions', 'Text copied to clipboard', {
        length: text.length,
      })
    } catch (error) {
      Logger.error('VSCodeActions', 'Failed to copy to clipboard', error)
    }
  }
}

