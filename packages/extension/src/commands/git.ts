import * as vscode from 'vscode'
import * as git from 'isomorphic-git'
import * as http from 'isomorphic-git/http/node'
import * as fs from 'fs'
import * as path from 'path'
import { Logger } from '../utils/Logger'

export async function gitClone(): Promise<void> {
  try {
    Logger.info('Commands', 'Git clone initiated')

    const repoUrl = await vscode.window.showInputBox({
      prompt: 'Enter Git repository URL',
      placeHolder: 'https://github.com/user/repo.git',
      ignoreFocusOut: true,
    })

    if (!repoUrl) {
      Logger.debug('Commands', 'User cancelled git clone')
      return
    }

    // Extract repo name from URL
    const repoName = repoUrl.split('/').pop()?.replace('.git', '') || 'repository'

    // Show folder picker
    const folderUri = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: 'Select destination folder',
    })

    if (!folderUri || folderUri.length === 0) {
      Logger.debug('Commands', 'User cancelled folder selection')
      return
    }

    const destination = path.join(folderUri[0].fsPath, repoName)

    // Check if destination exists
    if (fs.existsSync(destination)) {
      const overwrite = await vscode.window.showWarningMessage(
        `Folder ${repoName} already exists. Overwrite?`,
        { modal: true },
        'Overwrite'
      )

      if (overwrite !== 'Overwrite') {
        return
      }

      // Remove existing folder
      fs.rmSync(destination, { recursive: true, force: true })
    }

    // Show progress
    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Cloning ${repoName}...`,
        cancellable: false,
      },
      async (progress) => {
        try {
          progress.report({ increment: 0, message: 'Starting clone...' })

          await git.clone({
            fs,
            http,
            dir: destination,
            url: repoUrl,
            onProgress: (event) => {
              if (event.phase === 'Receiving objects') {
                progress.report({
                  increment: event.loaded ? (event.loaded / (event.total || 1)) * 100 : 0,
                  message: `Receiving objects: ${event.loaded || 0}/${event.total || '?'}`,
                })
              }
            },
          })

          progress.report({ increment: 100, message: 'Clone complete' })

          const openFolder = await vscode.window.showInformationMessage(
            `Repository cloned successfully to ${destination}`,
            'Open Folder'
          )

          if (openFolder === 'Open Folder') {
            const uri = vscode.Uri.file(destination)
            await vscode.commands.executeCommand('vscode.openFolder', uri)
          }

          Logger.info('Commands', 'Git clone completed', { destination })
        } catch (error) {
          Logger.error('Commands', 'Error cloning repository', error)
          vscode.window.showErrorMessage(
            `Failed to clone repository: ${error instanceof Error ? error.message : String(error)}`
          )
        }
      }
    )
  } catch (error) {
    Logger.error('Commands', 'Error in git clone', error)
    vscode.window.showErrorMessage(
      `Git clone failed: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
