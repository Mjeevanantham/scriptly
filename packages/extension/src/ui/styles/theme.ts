// VS Code theme integration
export const getThemeStyles = () => {
  return `
    :root {
      --vscode-font-family: var(--vscode-font-family);
      --vscode-font-size: var(--vscode-font-size);
      
      /* Core colors */
      --vscode-foreground: var(--vscode-foreground);
      --vscode-background: var(--vscode-editor-background);
      --vscode-border: var(--vscode-input-border);
      --vscode-focus-border: var(--vscode-focusBorder);
      
      /* Button colors */
      --vscode-button-background: var(--vscode-button-background);
      --vscode-button-foreground: var(--vscode-button-foreground);
      --vscode-button-hover: var(--vscode-button-hoverBackground);
      
      /* Input colors */
      --vscode-input-background: var(--vscode-input-background);
      --vscode-input-foreground: var(--vscode-input-foreground);
      --vscode-input-border: var(--vscode-input-border);
      
      /* Scrollbar colors */
      --vscode-scrollbar: var(--vscode-scrollbarSlider-background);
      --vscode-scrollbar-hover: var(--vscode-scrollbarSlider-hoverBackground);
      
      /* Semantic colors for UI components */
      --info: var(--vscode-textLink-foreground);
      --success: #10b981;
      --warning: #f59e0b;
      --error: #ef4444;
      
      /* Additional UI colors */
      --muted-foreground: var(--vscode-descriptionForeground);
      --link: var(--vscode-textLink-foreground);
      --link-hover: var(--vscode-textLink-activeForeground);
      
      /* Shadow and effects */
      --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
      --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
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
    
    /* Semantic color variants with opacity */
    .bg-info\/5 { background-color: rgb(var(--vscode-textLink-foreground) / 0.05); }
    .bg-success\/5 { background-color: rgb(16 185 129 / 0.05); }
    .bg-warning\/5 { background-color: rgb(245 158 11 / 0.05); }
    .bg-error\/5 { background-color: rgb(239 68 68 / 0.05); }
    
    .text-info { color: var(--vscode-textLink-foreground); }
    .text-success { color: #10b981; }
    .text-warning { color: #f59e0b; }
    .text-error { color: #ef4444; }
    
    .border-info { border-color: var(--vscode-textLink-foreground); }
    .border-success { border-color: #10b981; }
    .border-warning { border-color: #f59e0b; }
    .border-error { border-color: #ef4444; }
    
    .focus\:ring-info:focus { --tw-ring-color: var(--vscode-textLink-foreground); }
    .focus\:ring-success:focus { --tw-ring-color: #10b981; }
    .focus\:ring-warning:focus { --tw-ring-color: #f59e0b; }
    .focus\:ring-error:focus { --tw-ring-color: #ef4444; }
  `
}

// Enhanced utility classes for consistent UI
export const utilityClasses = `
  /* Layout */
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .justify-center { justify-content: center; }
  .gap-1 { gap: 4px; }
  .gap-2 { gap: 8px; }
  .gap-3 { gap: 12px; }
  .gap-4 { gap: 16px; }
  
  /* Spacing */
  .p-1 { padding: 4px; }
  .p-2 { padding: 8px; }
  .p-3 { padding: 12px; }
  .p-4 { padding: 16px; }
  .p-5 { padding: 20px; }
  .p-6 { padding: 24px; }
  .px-3 { padding-left: 12px; padding-right: 12px; }
  .px-4 { padding-left: 16px; padding-right: 16px; }
  .px-6 { padding-left: 24px; padding-right: 24px; }
  .py-1 { padding-top: 4px; padding-bottom: 4px; }
  .py-1.5 { padding-top: 6px; padding-bottom: 6px; }
  .py-2 { padding-top: 8px; padding-bottom: 8px; }
  .py-3 { padding-top: 12px; padding-bottom: 12px; }
  .py-4 { padding-top: 16px; padding-bottom: 16px; }
  .mb-2 { margin-bottom: 8px; }
  .mb-3 { margin-bottom: 12px; }
  .mb-4 { margin-bottom: 16px; }
  .mb-6 { margin-bottom: 24px; }
  .mb-8 { margin-bottom: 32px; }
  .mt-2 { margin-top: 8px; }
  .mt-4 { margin-top: 16px; }
  .mt-6 { margin-top: 24px; }
  .mt-8 { margin-top: 32px; }
  .ml-auto { margin-left: auto; }
  .mr-auto { margin-right: auto; }
  
  /* Sizing */
  .h-full { height: 100%; }
  .w-full { width: 100%; }
  .flex-1 { flex: 1; }
  .flex-shrink-0 { flex-shrink: 0; }
  .max-w-md { max-width: 28rem; }
  .max-w-lg { max-width: 32rem; }
  .max-w-2xl { max-width: 42rem; }
  .max-w-4xl { max-width: 56rem; }
  .max-w-full { max-width: 100%; }
  .w-4 { width: 1rem; }
  .w-5 { width: 1.25rem; }
  .w-6 { width: 1.5rem; }
  .w-8 { width: 2rem; }
  .w-12 { width: 3rem; }
  .h-1 { height: 0.25rem; }
  .h-4 { height: 1rem; }
  .h-5 { height: 1.25rem; }
  .h-6 { height: 1.5rem; }
  .h-8 { height: 2rem; }
  .h-12 { height: 3rem; }
  
  /* Border radius */
  .rounded { border-radius: 4px; }
  .rounded-md { border-radius: 6px; }
  .rounded-lg { border-radius: 8px; }
  .rounded-full { border-radius: 9999px; }
  
  /* Typography */
  .text-xs { font-size: 0.75rem; }
  .text-sm { font-size: 0.875rem; }
  .text-base { font-size: 1rem; }
  .text-lg { font-size: 1.125rem; }
  .text-xl { font-size: 1.25rem; }
  .text-2xl { font-size: 1.5rem; }
  .text-3xl { font-size: 1.875rem; }
  .font-normal { font-weight: 400; }
  .font-medium { font-weight: 500; }
  .font-semibold { font-weight: 600; }
  .font-bold { font-weight: 700; }
  .text-center { text-align: center; }
  .text-left { text-align: left; }
  
  /* Opacity */
  .opacity-0 { opacity: 0; }
  .opacity-40 { opacity: 0.4; }
  .opacity-50 { opacity: 0.5; }
  .opacity-60 { opacity: 0.6; }
  .opacity-70 { opacity: 0.7; }
  .opacity-75 { opacity: 0.75; }
  
  /* Borders */
  .border { border-width: 1px; }
  .border-2 { border-width: 2px; }
  .border-b { border-bottom-width: 1px; }
  .border-t { border-top-width: 1px; }
  .border-l { border-left-width: 1px; }
  .border-r { border-right-width: 1px; }
  .border-border { border-color: var(--vscode-border); }
  .border-focus-border { border-color: var(--vscode-focus-border); }
  .border-info { border-color: var(--vscode-textLink-foreground); }
  .border-success { border-color: #10b981; }
  .border-warning { border-color: #f59e0b; }
  .border-error { border-color: #ef4444; }
  
  /* Background colors */
  .bg-input-background { background-color: var(--vscode-input-background); }
  .bg-button-background { background-color: var(--vscode-button-background); }
  .bg-background { background-color: var(--vscode-background); }
  .bg-info\\/5 { background-color: rgb(var(--vscode-textLink-foreground) / 0.05); }
  .bg-success\\/5 { background-color: rgb(16 185 129 / 0.05); }
  .bg-warning\\/5 { background-color: rgb(245 158 11 / 0.05); }
  .bg-error\\/5 { background-color: rgb(239 68 68 / 0.05); }
  .bg-opacity-90 { background-color: rgba(0, 0, 0, 0.9); }
  
  /* Text colors */
  .text-foreground { color: var(--vscode-foreground); }
  .text-button-foreground { color: var(--vscode-button-foreground); }
  .text-muted-foreground { color: var(--muted-foreground); }
  .text-link { color: var(--link); }
  .text-info { color: var(--vscode-textLink-foreground); }
  .text-success { color: #10b981; }
  .text-warning { color: #f59e0b; }
  .text-error { color: #ef4444; }
  
  /* Overflow and positioning */
  .overflow-auto { overflow: auto; }
  .overflow-hidden { overflow: hidden; }
  .overflow-y-auto { overflow-y: auto; }
  .scroll-smooth { scroll-behavior: smooth; }
  .hidden { display: none; }
  .fixed { position: fixed; }
  .absolute { position: absolute; }
  .relative { position: relative; }
  .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
  .top-1\\/2 { top: 50%; }
  .left-3 { left: 12px; }
  .right-3 { right: 12px; }
  .transform { transform: translateY(-50%); }
  .\\-translate-y-1\\/2 { transform: translateY(-50%); }
  .z-50 { z-index: 50; }
  
  /* Effects */
  .transition-all { transition: all 0.2s ease; }
  .transition-colors { transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease; }
  .ease-in-out { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
  .ease-out { transition-timing-function: cubic-bezier(0, 0, 0.2, 1); }
  .duration-200 { transition-duration: 200ms; }
  .duration-300 { transition-duration: 300ms; }
  
  /* Hover states */
  .hover\\:bg-input-background:hover { background-color: var(--vscode-input-background); }
  .hover\\:bg-button-background:hover { background-color: var(--vscode-button-background); }
  .hover\\:bg-button-hover:hover { background-color: var(--vscode-button-hover); }
  .hover\\:text-button-foreground:hover { color: var(--vscode-button-foreground); }
  .hover\\:text-foreground:hover { color: var(--vscode-foreground); }
  .hover\\:border-focus-border:hover { border-color: var(--vscode-focus-border); }
  .hover\\:border-focus:hover { border-color: var(--vscode-focusBorder); }
  .hover\\:shadow-md:hover { box-shadow: var(--shadow-md); }
  
  /* Focus states */
  .focus\\:outline-none:focus { outline: none; }
  .focus\\:ring-2:focus { box-shadow: 0 0 0 2px var(--vscode-focusBorder); }
  .focus\\:ring-offset-2:focus { box-shadow: 0 0 0 2px var(--vscode-background), 0 0 0 4px var(--vscode-focusBorder); }
  .focus\\:ring-offset-background:focus { box-shadow: 0 0 0 2px var(--vscode-focusBorder); }
  .focus\\:ring-button-background:focus { box-shadow: 0 0 0 2px var(--vscode-button-background); }
  .focus\\:border-focus-border:focus { border-color: var(--vscode-focusBorder); }
  .focus\\:border-focus:focus { border-color: var(--vscode-focusBorder); }
  
  /* Disabled states */
  .disabled\\:opacity-50:disabled { opacity: 0.5; }
  .disabled\\:cursor-not-allowed:disabled { cursor: not-allowed; }
  .disabled\\:pointer-events-none:disabled { pointer-events: none; }
  
  /* Grid */
  .grid { display: grid; }
  .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .grid-gap-4 { gap: 1rem; }
  .gap-4 { gap: 1rem; }
  
  /* Additional utilities */
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
  .animate-spin { animation: spin 1s linear infinite; }
  .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  .animate-in { animation-fill-mode: both; }
  .fade-in-0 { animation: fadeIn 0.2s ease-out; }
  .zoom-in-95 { animation: zoomIn 0.2s ease-out; }
  .backdrop-blur-sm { backdrop-filter: blur(4px); }
  .cursor-pointer { cursor: pointer; }
`
