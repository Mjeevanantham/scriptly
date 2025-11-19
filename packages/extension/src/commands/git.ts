import * as vscode from 'vscode'
import * as git from 'isomorphic-git'
import * as fs from 'fs'
import * as http from 'isomorphic-git/http/node'
import { Logger } from '../utils/Logger'

export async function gitClone() {
  Logger.info('Git', 'Git clone command initiated')
  
  const repoUrl = await vscode.window.showInputBox({
    prompt: 'Enter Git repository URL',
    placeHolder: 'https://github.com/user/repo.git',
    ignoreFocusOut: true,
  })

  if (!repoUrl) {
    Logger.debug('Git', 'User cancelled git clone (no URL provided)')
    return
  }

  Logger.info('Git', 'Git clone requested', { repoUrl })

  const workspaceFolders = vscode.workspace.workspaceFolders
  if (!workspaceFolders || workspaceFolders.length === 0) {
    Logger.error('Git', 'No workspace folder open for git clone')
    vscode.window.showErrorMessage('No workspace folder open')
    return
  }

  const workspacePath = workspaceFolders[0].uri.fsPath
  const repoName = repoUrl.split('/').pop()?.replace('.git', '') || 'repo'
  const targetPath = vscode.Uri.joinPath(
    workspaceFolders[0].uri,
    repoName
  ).fsPath

  Logger.debug('Git', 'Git clone parameters', {
    workspacePath,
    repoName,
    targetPath,
  })

  try {
    Logger.info('Git', 'Starting git clone operation')
    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Cloning repository...',
        cancellable: false,
      },
      async (progress) => {
        progress.report({ increment: 0, message: 'Initializing clone...' })
        Logger.debug('Git', 'Executing git.clone', { url: repoUrl, dir: targetPath })
        
        await git.clone({
          fs,
          http,
          dir: targetPath,
          url: repoUrl,
          corsProxy: undefined,
        })

        Logger.info('Git', 'Repository cloned successfully', { repoName, targetPath })
        progress.report({ increment: 100, message: 'Clone complete!' })

        vscode.window.showInformationMessage(
          `Repository cloned to ${repoName}`
        )

        // Open the cloned folder
        Logger.debug('Git', 'Opening cloned folder in VS Code')
        const targetUri = vscode.Uri.file(targetPath)
        await vscode.commands.executeCommand('vscode.openFolder', targetUri, true)
        Logger.info('Git', 'Cloned folder opened successfully')
      }
    )
  } catch (error) {
    Logger.error('Git', 'Failed to clone repository', error)
    vscode.window.showErrorMessage(
      `Failed to clone repository: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

