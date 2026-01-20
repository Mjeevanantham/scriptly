// Message Formatter - Formats chat messages with clickable links, file paths, code blocks, etc.
const MessageFormatter = {
  formatMessage: function(content, options) {
    options = options || {};
    const enableClickHandlers = options.enableClickHandlers !== false;
    const workspacePath = options.workspacePath || '';

    let formatted = this.escapeHtml(content);

    // Format file paths (e.g., file.ts:42, ./path/to/file.js:10:5)
    formatted = formatted.replace(/(?:^|\s)([\/\\]?[\w\s\-\.\/\\]+\.\w{2,4})(?::(\d+))?(?::(\d+))?(?:-(\d+))?(?=\s|$|,|;|\)|\]|>)/g, function(match, filepath, line, col, endLine) {
      if (!enableClickHandlers) {
        return match;
      }
      
      const fullPath = filepath.startsWith('/') || filepath.startsWith('\\') 
        ? filepath 
        : (workspacePath ? workspacePath + '/' + filepath : filepath);
      
      const lineNum = line ? `:${line}` : '';
      const colNum = col ? `:${col}` : '';
      const range = endLine ? `-${endLine}` : '';
      
      return ` <a href="#" class="file-link" data-file="${this.escapeHtml(fullPath)}" data-line="${line || ''}" data-col="${col || ''}" data-range="${endLine || ''}" style="color: var(--link-fg); text-decoration: underline; cursor: pointer;">${this.escapeHtml(filepath)}${lineNum}${colNum}${range}</a>`;
    }.bind(this));

    // Format URLs
    formatted = formatted.replace(/(https?:\/\/[^\s\)\]\>]+)/g, function(match, url) {
      if (!enableClickHandlers) {
        return match;
      }
      return `<a href="${this.escapeHtml(url)}" target="_blank" style="color: var(--link-fg); text-decoration: underline;">${this.escapeHtml(url)}</a>`;
    }.bind(this));

    // Format email addresses
    formatted = formatted.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, function(match, email) {
      if (!enableClickHandlers) {
        return match;
      }
      return `<a href="mailto:${this.escapeHtml(email)}" style="color: var(--link-fg); text-decoration: underline;">${this.escapeHtml(email)}</a>`;
    }.bind(this));

    // Format git commit hashes (7-40 character hex strings)
    formatted = formatted.replace(/\b([0-9a-f]{7,40})\b/gi, function(match, hash) {
      if (!enableClickHandlers) {
        return match;
      }
      // This is a simple check - could be enhanced
      return `<code style="background-color: var(--code-bg); padding: 2px 4px; border-radius: 2px; font-family: monospace; font-size: 0.9em;">${this.escapeHtml(hash)}</code>`;
    }.bind(this));

    // Format code blocks (```language\ncode\n```)
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, lang, code) {
      const language = lang || 'text';
      return `<pre style="background-color: var(--code-bg); border: 1px solid var(--border-color); border-radius: 4px; padding: 12px; overflow-x: auto; margin: 12px 0;"><code style="font-family: 'Courier New', monospace; font-size: 0.9em;">${this.escapeHtml(code.trim())}</code></pre>`;
    }.bind(this));

    // Format inline code (`code`)
    formatted = formatted.replace(/`([^`\n]+)`/g, function(match, code) {
      return `<code style="background-color: var(--code-bg); padding: 2px 4px; border-radius: 2px; font-family: monospace; font-size: 0.9em;">${this.escapeHtml(code)}</code>`;
    }.bind(this));

    // Format line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
  },

  escapeHtml: function(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  attachClickHandlers: function(container) {
    if (!container) return;

    // Attach file link handlers
    const fileLinks = container.querySelectorAll('.file-link');
    fileLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const filepath = this.getAttribute('data-file');
        const line = this.getAttribute('data-line');
        const col = this.getAttribute('data-col');
        const range = this.getAttribute('data-range');

        if (window.vscode) {
          window.vscode.postMessage({
            command: 'openFile',
            filepath: filepath,
            line: line ? parseInt(line) : undefined,
            col: col ? parseInt(col) : undefined,
            range: range ? parseInt(range) : undefined,
          });
        }
      });
    });
  }
};

// Make available globally
window.MessageFormatter = MessageFormatter;
