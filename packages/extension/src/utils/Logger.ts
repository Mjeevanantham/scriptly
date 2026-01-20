import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'

export class Logger {
  private static outputChannel: vscode.OutputChannel | null = null
  private static logFilePath: string | null = null
  private static context: vscode.ExtensionContext | null = null

  public static initialize(context: vscode.ExtensionContext): void {
    this.context = context
    this.outputChannel = vscode.window.createOutputChannel('Scriptly')

    // Create log file in extension global storage
    const logDir = context.globalStorageUri.fsPath
    try {
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
      }
      this.logFilePath = path.join(logDir, 'scriptly.log')
      this.info('Logger', 'Initialized', { logFilePath: this.logFilePath })
    } catch (error) {
      this.error('Logger', 'Failed to create log directory', error)
    }
  }

  public static getLogFilePath(): string | null {
    return this.logFilePath
  }

  public static showOutputChannel(): void {
    if (this.outputChannel) {
      this.outputChannel.show(true)
    }
  }

  private static writeLog(level: string, component: string, message: string, data?: any): void {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      component,
      message,
      ...(data && { data }),
    }

    const logLine = `[${timestamp}] [${level}] [${component}] ${message}${data ? ' ' + JSON.stringify(data) : ''}`

    // Write to output channel
    if (this.outputChannel) {
      this.outputChannel.appendLine(logLine)
    }

    // Write to log file
    if (this.logFilePath) {
      try {
        fs.appendFileSync(this.logFilePath, logLine + '\n', 'utf8')
      } catch (error) {
        // Silently fail if log file write fails
        console.error('Failed to write to log file:', error)
      }
    }

    // Also log to console for development
    if (level === 'ERROR') {
      console.error(logLine)
    } else if (level === 'WARN') {
      console.warn(logLine)
    } else {
      console.log(logLine)
    }
  }

  public static info(component: string, message: string, data?: any): void {
    this.writeLog('INFO', component, message, data)
  }

  public static debug(component: string, message: string, data?: any): void {
    this.writeLog('DEBUG', component, message, data)
  }

  public static warn(component: string, message: string, data?: any): void {
    this.writeLog('WARN', component, message, data)
  }

  public static error(component: string, message: string, error?: any): void {
    const errorData = error instanceof Error
      ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        }
      : error
    this.writeLog('ERROR', component, error?.message || String(error), errorData)
  }

  public static dispose(): void {
    if (this.outputChannel) {
      this.outputChannel.dispose()
      this.outputChannel = null
    }
  }
}
