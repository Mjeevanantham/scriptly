import * as vscode from 'vscode'
import { ConfigService } from '../services/ConfigService'
import { Logger } from '../utils/Logger'

export async function showLogs(): Promise<void> {
  try {
    const logPath = Logger.getLogFilePath()
    if (!logPath) {
      vscode.window.showWarningMessage('Log file not available')
      return
    }

    const action = await vscode.window.showInformationMessage(
      `📋 Scriptly Log File\n${logPath}`,
      'Open Log File',
      'Copy Path',
      'Reveal in Explorer'
    )

    if (action === 'Open Log File') {
      const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(logPath))
      await vscode.window.showTextDocument(doc)
      Logger.info('Commands', 'Log file opened', { logPath })
    } else if (action === 'Copy Path') {
      await vscode.env.clipboard.writeText(logPath)
      vscode.window.showInformationMessage('Log file path copied to clipboard!')
      Logger.info('Commands', 'Log file path copied')
    } else if (action === 'Reveal in Explorer') {
      vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(logPath))
      Logger.info('Commands', 'Log file revealed in explorer')
    }
  } catch (error) {
    Logger.error('Commands', 'Error showing logs', error)
    vscode.window.showErrorMessage(
      `Failed to show logs: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

export async function clearStorage(configService: ConfigService): Promise<void> {
  try {
    const confirm = await vscode.window.showWarningMessage(
      'Are you sure you want to clear all Scriptly storage data (API keys, settings, etc.)?',
      { modal: true },
      'Yes, Clear All'
    )

    if (confirm === 'Yes, Clear All') {
      await configService.clearAllStorage()
      vscode.window.showInformationMessage(
        'Scriptly: All storage data cleared. Reloading extension...',
        'Reload Window'
      ).then((action) => {
        if (action === 'Reload Window') {
          vscode.commands.executeCommand('workbench.action.reloadWindow')
        }
      })
      Logger.info('Commands', 'Storage cleared')
    }
  } catch (error) {
    Logger.error('Commands', 'Error clearing storage', error)
    vscode.window.showErrorMessage(
      `Failed to clear storage: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
