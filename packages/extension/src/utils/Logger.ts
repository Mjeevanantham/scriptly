import * as vscode from 'vscode'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

export class Logger {
  private static logFile: string | null = null
  private static logStream: fs.WriteStream | null = null
  private static outputChannel: vscode.OutputChannel | null = null

  static initialize(context: vscode.ExtensionContext): void {
    try {
      // Create output channel once
      if (!this.outputChannel) {
        this.outputChannel = vscode.window.createOutputChannel('Scriptly')
      }
      
      // Use extension storage directory for logs
      const storageUri = context.globalStorageUri
      const logDir = path.join(storageUri.fsPath, 'logs')
      
      // Ensure directory exists
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      this.logFile = path.join(logDir, `scriptly-${timestamp}.log`)

      // Create write stream
      this.logStream = fs.createWriteStream(this.logFile, { flags: 'a' })
      
      // Write initial log with file location
      this.writeToFile(`[${this.getTimestamp()}] Logger initialized`)
      this.writeToFile(`[${this.getTimestamp()}] Log file location: ${this.logFile}`)
      
      // Log to console with clear message
      console.log(`[Scriptly Logger] Log file created at: ${this.logFile}`)
      console.log(`[Scriptly Logger] To view logs, use Command Palette: Ctrl+Shift+P → "Scriptly: Show Log File"`)
      
      // Show in output channel
      if (this.outputChannel) {
        this.outputChannel.clear()
        this.outputChannel.appendLine('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        this.outputChannel.appendLine('📋 SCRIPTLY LOG FILE LOCATION')
        this.outputChannel.appendLine('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        this.outputChannel.appendLine(`📁 ${this.logFile}`)
        this.outputChannel.appendLine('')
        this.outputChannel.appendLine('💡 QUICK ACCESS:')
        this.outputChannel.appendLine('   • Command Palette: Ctrl+Shift+P → "Scriptly: Show Log File"')
        this.outputChannel.appendLine('   • Or click "View Logs" when errors occur')
        this.outputChannel.appendLine('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        this.outputChannel.show()
      }
      
    } catch (error) {
      console.error('[Scriptly Logger] Failed to initialize logger:', error)
    }
  }

  private static getTimestamp(): string {
    return new Date().toISOString()
  }

  private static writeToFile(message: string): void {
    if (this.logStream) {
      this.logStream.write(`${message}${os.EOL}`)
    }
    // Also log to console
    console.log(message)
    // Append to output channel
    if (this.outputChannel) {
      this.outputChannel.appendLine(message)
    }
  }

  static log(level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR', component: string, message: string, data?: any): void {
    const timestamp = this.getTimestamp()
    const logMessage = `[${timestamp}] [${level}] [${component}] ${message}${data ? ` | Data: ${JSON.stringify(data)}` : ''}`
    
    this.writeToFile(logMessage)
  }

  static info(component: string, message: string, data?: any): void {
    this.log('INFO', component, message, data)
  }

  static debug(component: string, message: string, data?: any): void {
    this.log('DEBUG', component, message, data)
  }

  static warn(component: string, message: string, data?: any): void {
    this.log('WARN', component, message, data)
  }

  static error(component: string, message: string, error?: any): void {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : error
    this.log('ERROR', component, message, errorData)
  }

  static getLogFilePath(): string | null {
    return this.logFile
  }

  static dispose(): void {
    if (this.logStream) {
      this.logStream.end()
      this.logStream = null
    }
    if (this.outputChannel) {
      this.outputChannel.dispose()
      this.outputChannel = null
    }
  }

  static showOutputChannel(): void {
    if (this.outputChannel) {
      this.outputChannel.show()
    }
  }
}
