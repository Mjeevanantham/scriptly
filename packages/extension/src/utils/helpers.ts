import * as vscode from 'vscode'

/**
 * Utility helper functions
 */

export function getWorkspacePath(): string {
  const workspaceFolders = vscode.workspace.workspaceFolders
  if (workspaceFolders && workspaceFolders.length > 0) {
    return workspaceFolders[0].uri.fsPath
  }
  return ''
}

export function getSelectedText(): string {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    return ''
  }

  const selection = editor.selection
  if (selection.isEmpty) {
    return ''
  }

  return editor.document.getText(selection)
}

export function getCurrentFileContext(): string {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    return ''
  }

  return editor.document.getText()
}
