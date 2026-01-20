import * as vscode from 'vscode'

export interface IDEDetails {
  name: string
  version: string
  kind: 'vscode' | 'cursor' | 'windsurf' | 'antigravity' | 'unknown'
  isCompatible: boolean
}

export class IDEDetector {
  public static detect(): IDEDetails {
    const appName = vscode.env.appName.toLowerCase()
    const appVersion = vscode.version

    // Detect specific IDE
    let ideName = 'VS Code'
    let ideKind: IDEDetails['kind'] = 'vscode'
    let isCompatible = true

    if (appName.includes('cursor')) {
      ideName = 'Cursor'
      ideKind = 'cursor'
    } else if (appName.includes('windsurf')) {
      ideName = 'Windsurf'
      ideKind = 'windsurf'
    } else if (appName.includes('antigravity')) {
      ideName = 'Antigravity'
      ideKind = 'antigravity'
    } else if (!appName.includes('code')) {
      ideName = appName || 'Unknown IDE'
      ideKind = 'unknown'
      // Check if it's VS Code compatible
      isCompatible = typeof vscode.workspace !== 'undefined'
    }

    return {
      name: ideName,
      version: appVersion,
      kind: ideKind,
      isCompatible,
    }
  }
}
