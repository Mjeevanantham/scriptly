/**
 * MessageFormatter - Comprehensive content formatting utility
 * Detects and formats various content types in messages
 */

export interface FormatOptions {
  enableClickHandlers?: boolean
  enableSyntaxHighlighting?: boolean
  workspacePath?: string
}

export interface FormattedElement {
  html: string
  type: string
  original: string
  metadata?: Record<string, any>
}

export type ContentType =
  | 'filepath'
  | 'url'
  | 'email'
  | 'codeblock'
  | 'inlinecode'
  | 'error'
  | 'stacktrace'
  | 'githash'
  | 'linenumber'
  | 'text'

/**
 * Regex patterns for content detection
 */
const PATTERNS = {
  // File paths: supports absolute, relative, with line numbers and columns
  // Matches: /path/to/file.ts, ./src/file.ts, file.ts:42, file.ts:42:10, file.ts:10-20
  filepath:
    /(?:^|\s)([\/\\]?[\w\s\-\.\/\\]+\.\w{2,4})(?::(\d+))?(?::(\d+))?(?:-(\d+))?(?=\s|$|,|;|\)|])/g,

  // URLs: http, https, www, mailto
  url: /(https?:\/\/[^\s<>"{}|\\^`\[\]]+|www\.[^\s<>"{}|\\^`\[\]]+|mailto:[^\s<>"{}|\\^`\[\]]+)/gi,

  // Email addresses
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,

  // Code blocks: ```language\ncode\n```
  codeblock: /```(\w+)?\n([\s\S]*?)```/g,

  // Inline code: `code`
  inlinecode: /`([^`\n]+)`/g,

  // Git commit hashes (short: 7-12 chars, full: 40 chars)
  githash: /\b([a-f0-9]{7,40})\b/g,

  // Line number references: L42, L10-L20
  linenumber: /(?:^|\s)(L(\d+)(?:-L(\d+))?)(?=\s|$)/g,

  // Error patterns
  error: /(Error|Exception|Warning|Fatal):\s*([^\n]+(?:\n(?!\s+at\s)[^\n]+)*)/gi,

  // Stack traces: at function (file:line:col)
  stacktrace:
    /(\s+at\s+[^\s]+\s+\([^)]+:\d+:\d+\)|\s+at\s+[^\s]+\s+\([^)]+\)|\s+at\s+<anonymous>)/g,
}

/**
 * Escapes HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * MessageFormatter class - Main formatting engine
 */
export class MessageFormatter {
  /**
   * Format a complete message with all content types
   */
  static formatMessage(
    content: string,
    options: FormatOptions = {}
  ): string {
    const {
      enableClickHandlers = true,
      enableSyntaxHighlighting = true,
      workspacePath,
    } = options

    let formatted = content

    // First, protect code blocks from being processed
    const codeBlocks: string[] = []
    formatted = formatted.replace(PATTERNS.codeblock, (match, lang, code) => {
      const id = `__CODEBLOCK_${codeBlocks.length}__`
      codeBlocks.push(match)
      return id
    })

    // Protect inline code
    const inlineCodes: string[] = []
    formatted = formatted.replace(PATTERNS.inlinecode, (match, code) => {
      const id = `__INLINECODE_${inlineCodes.length}__`
      inlineCodes.push(match)
      return id
    })

    // Format URLs (before emails to avoid conflicts)
    formatted = formatted.replace(PATTERNS.url, (match) => {
      return this.formatURL(match, enableClickHandlers).html
    })

    // Format emails (only if not already formatted as URL)
    formatted = formatted.replace(
      PATTERNS.email,
      (match) => {
        if (!formatted.includes(`data-email="${match}"`)) {
          return this.formatEmail(match, enableClickHandlers).html
        }
        return match
      }
    )

    // Format file paths
    formatted = formatted.replace(
      PATTERNS.filepath,
      (match, filePath, lineNumber, column, endLine) => {
        const fullPath = filePath.trim()
        const line = lineNumber ? parseInt(lineNumber, 10) : undefined
        const col = column ? parseInt(column, 10) : undefined
        const end = endLine ? parseInt(endLine, 10) : undefined

        // Skip if it's part of a URL
        if (match.includes('://') || match.includes('www.')) {
          return match
        }

        return this.formatFilePath(
          fullPath,
          line,
          col,
          end,
          enableClickHandlers,
          workspacePath
        ).html
      }
    )

    // Format git hashes
    formatted = formatted.replace(PATTERNS.githash, (match) => {
      // Skip if it's part of a longer hex string or URL
      if (
        match.length < 7 ||
        match.length > 40 ||
        formatted.includes(`data-hash="${match}"`)
      ) {
        return match
      }
      return this.formatGitHash(match, enableClickHandlers).html
    })

    // Format line number references
    formatted = formatted.replace(
      PATTERNS.linenumber,
      (match, fullMatch, startLine, endLine) => {
        const start = parseInt(startLine, 10)
        const end = endLine ? parseInt(endLine, 10) : undefined
        return this.formatLineNumber(start, end).html
      }
    )

    // Format errors
    formatted = formatted.replace(PATTERNS.error, (match) => {
      return this.formatError(match).html
    })

    // Format stack traces
    formatted = formatted.replace(PATTERNS.stacktrace, (match) => {
      return this.formatStackTrace(match).html
    })

    // Restore inline code with formatting
    inlineCodes.forEach((code, index) => {
      const id = `__INLINECODE_${index}__`
      formatted = formatted.replace(
        id,
        this.formatInlineCode(code.replace(/^`|`$/g, '')).html
      )
    })

    // Restore code blocks with syntax highlighting
    codeBlocks.forEach((block, index) => {
      const id = `__CODEBLOCK_${index}__`
      const match = block.match(PATTERNS.codeblock)
      if (match) {
        const language = match[1] || ''
        const code = match[2]
        formatted = formatted.replace(
          id,
          this.formatCodeBlock(code, language, enableSyntaxHighlighting).html
        )
      }
    })

    // Convert newlines to <br> for remaining text
    formatted = formatted.replace(/\n/g, '<br>')

    return formatted
  }

  /**
   * Format a file path with optional line number and column
   */
  static formatFilePath(
    path: string,
    lineNumber?: number,
    column?: number,
    endLine?: number,
    enableClickHandlers = true,
    workspacePath?: string
  ): FormattedElement {
    const displayPath = path
    let display = displayPath

    if (lineNumber) {
      display += `:${lineNumber}`
      if (column) {
        display += `:${column}`
      }
      if (endLine) {
        display += `-${endLine}`
      }
    }

    const escaped = escapeHtml(display)

    if (enableClickHandlers) {
      return {
        html: `<span class="formatted-filepath" data-file-path="${escapeHtml(
          path
        )}" data-line-number="${lineNumber || ''}" data-column="${
          column || ''
        }" data-end-line="${endLine || ''}" data-workspace-path="${
          workspacePath || ''
        }">${escaped}</span>`,
        type: 'filepath',
        original: display,
        metadata: { path, lineNumber, column, endLine },
      }
    }

    return {
      html: `<span class="formatted-filepath-no-click">${escaped}</span>`,
      type: 'filepath',
      original: display,
      metadata: { path, lineNumber, column, endLine },
    }
  }

  /**
   * Format a URL
   */
  static formatURL(url: string, enableClickHandlers = true): FormattedElement {
    // Normalize www URLs
    let normalizedUrl = url
    if (url.startsWith('www.')) {
      normalizedUrl = `https://${url}`
    }

    const escaped = escapeHtml(url)

    if (enableClickHandlers) {
      return {
        html: `<a class="formatted-link" href="${escapeHtml(
          normalizedUrl
        )}" target="_blank" data-url="${escapeHtml(
          normalizedUrl
        )}">${escaped}</a>`,
        type: 'url',
        original: url,
        metadata: { url: normalizedUrl },
      }
    }

    return {
      html: `<span class="formatted-link-no-click">${escaped}</span>`,
      type: 'url',
      original: url,
      metadata: { url: normalizedUrl },
    }
  }

  /**
   * Format an email address
   */
  static formatEmail(
    email: string,
    enableClickHandlers = true
  ): FormattedElement {
    const escaped = escapeHtml(email)

    if (enableClickHandlers) {
      return {
        html: `<a class="formatted-email" href="mailto:${escapeHtml(
          email
        )}" data-email="${escapeHtml(email)}">${escaped}</a>`,
        type: 'email',
        original: email,
        metadata: { email },
      }
    }

    return {
      html: `<span class="formatted-email-no-click">${escaped}</span>`,
      type: 'email',
      original: email,
      metadata: { email },
    }
  }

  /**
   * Format a code block with optional syntax highlighting
   */
  static formatCodeBlock(
    code: string,
    language = '',
    enableSyntaxHighlighting = true
  ): FormattedElement {
    const escaped = escapeHtml(code)

    if (enableSyntaxHighlighting && language) {
      // Syntax highlighting will be applied by SyntaxHighlighter
      return {
        html: `<pre class="formatted-code-block" data-language="${escapeHtml(
          language.toLowerCase()
        )}"><code>${escaped}</code></pre>`,
        type: 'codeblock',
        original: code,
        metadata: { language },
      }
    }

    return {
      html: `<pre class="formatted-code-block"><code>${escaped}</code></pre>`,
      type: 'codeblock',
      original: code,
      metadata: { language: '' },
    }
  }

  /**
   * Format inline code
   */
  static formatInlineCode(code: string): FormattedElement {
    const escaped = escapeHtml(code)
    return {
      html: `<code class="formatted-inline-code">${escaped}</code>`,
      type: 'inlinecode',
      original: code,
    }
  }

  /**
   * Format an error message
   */
  static formatError(error: string): FormattedElement {
    const escaped = escapeHtml(error)
    return {
      html: `<div class="formatted-error">${escaped}</div>`,
      type: 'error',
      original: error,
    }
  }

  /**
   * Format a stack trace
   */
  static formatStackTrace(trace: string): FormattedElement {
    const escaped = escapeHtml(trace)
    return {
      html: `<div class="formatted-stack-trace">${escaped}</div>`,
      type: 'stacktrace',
      original: trace,
    }
  }

  /**
   * Format a git commit hash
   */
  static formatGitHash(
    hash: string,
    enableClickHandlers = true
  ): FormattedElement {
    const escaped = escapeHtml(hash)

    if (enableClickHandlers) {
      return {
        html: `<span class="formatted-git-hash" data-hash="${escapeHtml(
          hash
        )}">${escaped}</span>`,
        type: 'githash',
        original: hash,
        metadata: { hash },
      }
    }

    return {
      html: `<span class="formatted-git-hash-no-click">${escaped}</span>`,
      type: 'githash',
      original: hash,
      metadata: { hash },
    }
  }

  /**
   * Format a line number reference
   */
  static formatLineNumber(
    startLine: number,
    endLine?: number
  ): FormattedElement {
    const display = endLine ? `L${startLine}-L${endLine}` : `L${startLine}`
    const escaped = escapeHtml(display)

    return {
      html: `<span class="formatted-line-number" data-line-start="${startLine}" data-line-end="${
        endLine || ''
      }">${escaped}</span>`,
      type: 'linenumber',
      original: display,
      metadata: { startLine, endLine },
    }
  }

  /**
   * Detect all content types in a message
   */
  static detectContentTypes(content: string): ContentType[] {
    const types: Set<ContentType> = new Set()

    // Check for each pattern
    if (PATTERNS.filepath.test(content)) {
      types.add('filepath')
      PATTERNS.filepath.lastIndex = 0 // Reset regex
    }
    if (PATTERNS.url.test(content)) {
      types.add('url')
      PATTERNS.url.lastIndex = 0
    }
    if (PATTERNS.email.test(content)) {
      types.add('email')
      PATTERNS.email.lastIndex = 0
    }
    if (PATTERNS.codeblock.test(content)) {
      types.add('codeblock')
      PATTERNS.codeblock.lastIndex = 0
    }
    if (PATTERNS.inlinecode.test(content)) {
      types.add('inlinecode')
      PATTERNS.inlinecode.lastIndex = 0
    }
    if (PATTERNS.error.test(content)) {
      types.add('error')
      PATTERNS.error.lastIndex = 0
    }
    if (PATTERNS.stacktrace.test(content)) {
      types.add('stacktrace')
      PATTERNS.stacktrace.lastIndex = 0
    }
    if (PATTERNS.githash.test(content)) {
      types.add('githash')
      PATTERNS.githash.lastIndex = 0
    }
    if (PATTERNS.linenumber.test(content)) {
      types.add('linenumber')
      PATTERNS.linenumber.lastIndex = 0
    }

    return Array.from(types).length > 0 ? Array.from(types) : ['text']
  }
}

