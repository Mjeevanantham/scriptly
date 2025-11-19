/**
 * SyntaxHighlighter - Lightweight syntax highlighting for code blocks
 * Uses VS Code theme colors for consistency
 */

export class SyntaxHighlighter {
  private static readonly SUPPORTED_LANGUAGES = [
    'javascript',
    'js',
    'typescript',
    'ts',
    'jsx',
    'tsx',
    'python',
    'py',
    'java',
    'go',
    'rust',
    'rs',
    'html',
    'css',
    'scss',
    'json',
    'yaml',
    'yml',
    'markdown',
    'md',
    'sql',
    'xml',
    'bash',
    'sh',
    'shell',
    'powershell',
    'ps1',
  ]

  /**
   * Get list of supported languages
   */
  static getSupportedLanguages(): string[] {
    return [...this.SUPPORTED_LANGUAGES]
  }

  /**
   * Detect language from code content or filename
   */
  static detectLanguage(code: string, filename?: string): string {
    // Try to detect from filename first
    if (filename) {
      const ext = filename.split('.').pop()?.toLowerCase()
      if (ext) {
        const langMap: Record<string, string> = {
          js: 'javascript',
          ts: 'typescript',
          py: 'python',
          rs: 'rust',
          yml: 'yaml',
          md: 'markdown',
          sh: 'bash',
          ps1: 'powershell',
        }
        return langMap[ext] || ext
      }
    }

    // Try to detect from code patterns
    const patterns: Array<{ pattern: RegExp; language: string }> = [
      { pattern: /^(import|export|const|let|var|function|class|interface)\s/, language: 'typescript' },
      { pattern: /^(def|class|import|from|if __name__)/, language: 'python' },
      { pattern: /^(package|import|public class|private|protected)/, language: 'java' },
      { pattern: /^(func|package|import|type|struct)/, language: 'go' },
      { pattern: /^(fn|pub|use|mod|struct|enum)/, language: 'rust' },
      { pattern: /^(<html|<head|<body|<!DOCTYPE)/i, language: 'html' },
      { pattern: /^(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE)/i, language: 'sql' },
      { pattern: /^\{[\s\n]*"[^"]+":/, language: 'json' },
      { pattern: /^#![^\n]*\/(bin\/)?(bash|sh)/, language: 'bash' },
    ]

    for (const { pattern, language } of patterns) {
      if (pattern.test(code.trim())) {
        return language
      }
    }

    return 'text'
  }

  /**
   * Highlight code with basic syntax highlighting
   * Returns HTML with CSS classes for VS Code theme integration
   */
  static highlight(code: string, language: string): string {
    const normalizedLang = this.normalizeLanguage(language)

    if (normalizedLang === 'text' || !this.SUPPORTED_LANGUAGES.includes(normalizedLang)) {
      // Just escape and return plain text
      return this.escapeHtml(code)
    }

    // Apply basic syntax highlighting based on language
    switch (normalizedLang) {
      case 'javascript':
      case 'typescript':
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return this.highlightJavaScript(code, normalizedLang)
      case 'python':
      case 'py':
        return this.highlightPython(code)
      case 'html':
        return this.highlightHTML(code)
      case 'css':
      case 'scss':
        return this.highlightCSS(code)
      case 'json':
        return this.highlightJSON(code)
      case 'sql':
        return this.highlightSQL(code)
      case 'markdown':
      case 'md':
        return this.highlightMarkdown(code)
      default:
        return this.escapeHtml(code)
    }
  }

  /**
   * Normalize language name
   */
  private static normalizeLanguage(language: string): string {
    const lang = language.toLowerCase().trim()
    const map: Record<string, string> = {
      js: 'javascript',
      ts: 'typescript',
      py: 'python',
      rs: 'rust',
      yml: 'yaml',
      md: 'markdown',
      sh: 'bash',
      ps1: 'powershell',
    }
    return map[lang] || lang
  }

  /**
   * Escape HTML special characters
   */
  private static escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  /**
   * Highlight JavaScript/TypeScript code
   */
  private static highlightJavaScript(code: string, lang: string): string {
    let highlighted = this.escapeHtml(code)

    // Keywords
    const keywords = [
      'const', 'let', 'var', 'function', 'class', 'interface', 'type', 'enum',
      'import', 'export', 'from', 'default', 'async', 'await', 'return',
      'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
      'try', 'catch', 'finally', 'throw', 'new', 'this', 'super', 'extends',
      'static', 'private', 'protected', 'public', 'abstract', 'implements',
      'true', 'false', 'null', 'undefined', 'void', 'typeof', 'instanceof',
    ]

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g')
      highlighted = highlighted.replace(
        regex,
        `<span class="syntax-keyword">${keyword}</span>`
      )
    })

    // Strings
    highlighted = highlighted.replace(
      /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
      '<span class="syntax-string">$1$2$1</span>'
    )

    // Comments
    highlighted = highlighted.replace(
      /\/\/.*$/gm,
      '<span class="syntax-comment">$&</span>'
    )
    highlighted = highlighted.replace(
      /\/\*[\s\S]*?\*\//g,
      '<span class="syntax-comment">$&</span>'
    )

    // Numbers
    highlighted = highlighted.replace(
      /\b(\d+(?:\.\d+)?)\b/g,
      '<span class="syntax-number">$1</span>'
    )

    // Functions
    highlighted = highlighted.replace(
      /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g,
      '<span class="syntax-function">$1</span>'
    )

    return highlighted
  }

  /**
   * Highlight Python code
   */
  private static highlightPython(code: string): string {
    let highlighted = this.escapeHtml(code)

    const keywords = [
      'def', 'class', 'import', 'from', 'as', 'if', 'elif', 'else',
      'for', 'while', 'try', 'except', 'finally', 'raise', 'with',
      'return', 'yield', 'pass', 'break', 'continue', 'lambda',
      'and', 'or', 'not', 'in', 'is', 'None', 'True', 'False',
      'async', 'await', 'global', 'nonlocal', 'del',
    ]

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g')
      highlighted = highlighted.replace(
        regex,
        `<span class="syntax-keyword">${keyword}</span>`
      )
    })

    // Strings
    highlighted = highlighted.replace(
      /(["'"])((?:\\.|(?!\1)[^\\])*?)\1/g,
      '<span class="syntax-string">$1$2$1</span>'
    )

    // Comments
    highlighted = highlighted.replace(
      /#.*$/gm,
      '<span class="syntax-comment">$&</span>'
    )

    // Numbers
    highlighted = highlighted.replace(
      /\b(\d+(?:\.\d+)?)\b/g,
      '<span class="syntax-number">$1</span>'
    )

    // Functions
    highlighted = highlighted.replace(
      /\bdef\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
      '<span class="syntax-keyword">def</span> <span class="syntax-function">$1</span>('
    )

    return highlighted
  }

  /**
   * Highlight HTML code
   */
  private static highlightHTML(code: string): string {
    let highlighted = this.escapeHtml(code)

    // Tags
    highlighted = highlighted.replace(
      /(&lt;\/?)([a-zA-Z][a-zA-Z0-9]*)([^&]*?)(&gt;)/g,
      (match, open, tag, attrs, close) => {
        return `${open}<span class="syntax-keyword">${tag}</span>${attrs}${close}`
      }
    )

    // Attributes
    highlighted = highlighted.replace(
      /\s+([a-zA-Z-]+)(=)(["'][^"']*["'])/g,
      ' <span class="syntax-property">$1</span>$2<span class="syntax-string">$3</span>'
    )

    // Comments
    highlighted = highlighted.replace(
      /&lt;!--[\s\S]*?--&gt;/g,
      '<span class="syntax-comment">$&</span>'
    )

    return highlighted
  }

  /**
   * Highlight CSS code
   */
  private static highlightCSS(code: string): string {
    let highlighted = this.escapeHtml(code)

    // Selectors
    highlighted = highlighted.replace(
      /^([.#]?[a-zA-Z-][a-zA-Z0-9_-]*\s*\{)/gm,
      '<span class="syntax-keyword">$1</span>'
    )

    // Properties
    highlighted = highlighted.replace(
      /\s+([a-zA-Z-]+)(\s*:)/g,
      ' <span class="syntax-property">$1</span>$2'
    )

    // Values
    highlighted = highlighted.replace(
      /:\s*([^;]+);/g,
      ': <span class="syntax-string">$1</span>;'
    )

    // Comments
    highlighted = highlighted.replace(
      /\/\*[\s\S]*?\*\//g,
      '<span class="syntax-comment">$&</span>'
    )

    return highlighted
  }

  /**
   * Highlight JSON code
   */
  private static highlightJSON(code: string): string {
    let highlighted = this.escapeHtml(code)

    // Keys
    highlighted = highlighted.replace(
      /"([^"]+)"(\s*:)/g,
      '<span class="syntax-property">"$1"</span>$2'
    )

    // Strings
    highlighted = highlighted.replace(
      /:\s*"([^"]*)"/g,
      ': <span class="syntax-string">"$1"</span>'
    )

    // Numbers
    highlighted = highlighted.replace(
      /:\s*(\d+(?:\.\d+)?)/g,
      ': <span class="syntax-number">$1</span>'
    )

    // Booleans and null
    highlighted = highlighted.replace(
      /:\s*(true|false|null)/g,
      ': <span class="syntax-keyword">$1</span>'
    )

    return highlighted
  }

  /**
   * Highlight SQL code
   */
  private static highlightSQL(code: string): string {
    let highlighted = this.escapeHtml(code)

    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE',
      'ALTER', 'DROP', 'TABLE', 'INDEX', 'VIEW', 'DATABASE', 'SCHEMA',
      'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER', 'ON', 'AS', 'AND', 'OR',
      'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'UNION',
      'DISTINCT', 'NULL', 'NOT', 'IN', 'EXISTS', 'LIKE', 'BETWEEN',
      'VALUES', 'SET', 'INTO', 'DEFAULT', 'PRIMARY', 'KEY', 'FOREIGN',
      'REFERENCES', 'CONSTRAINT', 'UNIQUE', 'CHECK',
    ]

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      highlighted = highlighted.replace(
        regex,
        `<span class="syntax-keyword">${keyword.toUpperCase()}</span>`
      )
    })

    // Strings
    highlighted = highlighted.replace(
      /'([^']*)'/g,
      "<span class='syntax-string'>'$1'</span>"
    )

    // Numbers
    highlighted = highlighted.replace(
      /\b(\d+(?:\.\d+)?)\b/g,
      '<span class="syntax-number">$1</span>'
    )

    return highlighted
  }

  /**
   * Highlight Markdown code
   */
  private static highlightMarkdown(code: string): string {
    let highlighted = this.escapeHtml(code)

    // Headers
    highlighted = highlighted.replace(
      /^(#{1,6})\s+(.+)$/gm,
      '<span class="syntax-keyword">$1</span> <span class="syntax-function">$2</span>'
    )

    // Bold
    highlighted = highlighted.replace(
      /\*\*(.+?)\*\*/g,
      '<span class="syntax-keyword">**</span><span class="syntax-function">$1</span><span class="syntax-keyword">**</span>'
    )

    // Italic
    highlighted = highlighted.replace(
      /\*(.+?)\*/g,
      '<span class="syntax-keyword">*</span><span class="syntax-string">$1</span><span class="syntax-keyword">*</span>'
    )

    // Code blocks
    highlighted = highlighted.replace(
      /`([^`]+)`/g,
      '<span class="syntax-keyword">`</span><span class="syntax-property">$1</span><span class="syntax-keyword">`</span>'
    )

    // Links
    highlighted = highlighted.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<span class="syntax-keyword">[</span><span class="syntax-string">$1</span><span class="syntax-keyword">]</span><span class="syntax-keyword">(</span><span class="syntax-property">$2</span><span class="syntax-keyword">)</span>'
    )

    return highlighted
  }
}

