import * as vscode from 'vscode'
import * as git from 'isomorphic-git'
import * as fs from 'fs'
import * as http from 'isomorphic-git/http/node'

export async function gitClone() {
  const repoUrl = await vscode.window.showInputBox({
    prompt: 'Enter Git repository URL',
    placeHolder: 'https://github.com/user/repo.git',
    ignoreFocusOut: true,
  })

  if (!repoUrl) {
    return
  }

  const workspaceFolders = vscode.workspace.workspaceFolders
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage('No workspace folder open')
    return
  }

  const workspacePath = workspaceFolders[0].uri.fsPath
  const repoName = repoUrl.split('/').pop()?.replace('.git', '') || 'repo'
  const targetPath = vscode.Uri.joinPath(
    workspaceFolders[0].uri,
    repoName
  ).fsPath

  try {
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Cloning repository...',
        cancellable: false,
      },
      async () => {
        await git.clone({
          fs,
          http,
          dir: targetPath,
          url: repoUrl,
          corsProxy: undefined,
        })

        vscode.window.showInformationMessage(
          `Repository cloned to ${repoName}`
        )

        // Open the cloned folder
        const targetUri = vscode.Uri.file(targetPath)
        vscode.commands.executeCommand('vscode.openFolder', targetUri, true)
      }
    )
  } catch (error) {
    vscode.window.showErrorMessage(
      `Failed to clone repository: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

