// VS Code theme integration
export const getThemeStyles = () => {
  return `
    :root {
      --vscode-font-family: var(--vscode-font-family);
      --vscode-font-size: var(--vscode-font-size);
      --vscode-foreground: var(--vscode-foreground);
      --vscode-background: var(--vscode-editor-background);
      --vscode-border: var(--vscode-input-border);
      --vscode-button-bg: var(--vscode-button-background);
      --vscode-button-fg: var(--vscode-button-foreground);
      --vscode-button-hover: var(--vscode-button-hoverBackground);
      --vscode-input-bg: var(--vscode-input-background);
      --vscode-input-fg: var(--vscode-input-foreground);
      --vscode-input-border: var(--vscode-input-border);
      --vscode-focus-border: var(--vscode-focusBorder);
      --vscode-scrollbar: var(--vscode-scrollbarSlider-background);
      --vscode-scrollbar-hover: var(--vscode-scrollbarSlider-hoverBackground);
    }

    /* Mode-specific colors */
    .mode-chat {
      --mode-accent: var(--vscode-textLink-foreground);
    }

    .mode-code {
      --mode-accent: var(--vscode-debugIcon-breakpointForeground);
    }

    .mode-research {
      --mode-accent: var(--vscode-textLink-activeForeground);
    }

    .mode-settings {
      --mode-accent: var(--vscode-inputOption-activeForeground);
    }
  `
}

// Utility classes
export const utilityClasses = `
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .justify-center { justify-content: center; }
  .gap-1 { gap: 4px; }
  .gap-2 { gap: 8px; }
  .gap-4 { gap: 16px; }
  .px-3 { padding-left: 12px; padding-right: 12px; }
  .px-4 { padding-left: 16px; padding-right: 16px; }
  .py-1 { padding-top: 4px; padding-bottom: 4px; }
  .py-1.5 { padding-top: 6px; padding-bottom: 6px; }
  .py-2 { padding-top: 8px; padding-bottom: 8px; }
  .mt-4 { margin-top: 16px; }
  .rounded { border-radius: 4px; }
  .rounded-md { border-radius: 6px; }
  .rounded-lg { border-radius: 8px; }
  .text-sm { font-size: 0.875rem; }
  .text-xs { font-size: 0.75rem; }
  .font-medium { font-weight: 500; }
  .font-semibold { font-weight: 600; }
  .opacity-60 { opacity: 0.6; }
  .opacity-70 { opacity: 0.7; }
  .border { border-width: 1px; }
  .border-b { border-bottom-width: 1px; }
  .border-t { border-top-width: 1px; }
  .h-full { height: 100%; }
  .w-full { width: 100%; }
  .flex-1 { flex: 1; }
  .overflow-auto { overflow: auto; }
  .overflow-hidden { overflow: hidden; }
  .text-center { text-align: center; }
  .hidden { display: none; }
  .fixed { position: fixed; }
  .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
  .z-50 { z-index: 50; }
  .transition-all { transition: all 0.2s ease; }
  .hover\\:bg-input-background:hover { background: var(--vscode-input-background); }
  .bg-input-background { background: var(--vscode-input-background); }
  .bg-button-background { background: var(--vscode-button-background); }
  .bg-background { background: var(--vscode-background); }
  .bg-opacity-90 { background-opacity: 0.9; }
  .text-foreground { color: var(--vscode-foreground); }
  .text-button-foreground { color: var(--vscode-button-foreground); }
  .border-border { border-color: var(--vscode-border); }
`

