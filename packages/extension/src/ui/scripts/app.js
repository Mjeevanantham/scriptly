// Main App Initialization
(function() {
  'use strict';

  let initializationComplete = false;
  const initStartTime = Date.now();
  const INIT_TIMEOUT = 5000; // 5 seconds

  // Show error overlay
  function showError(message, details) {
    const overlay = document.getElementById('error-overlay');
    const detailsEl = document.getElementById('error-details');
    if (overlay) {
      overlay.style.display = 'block';
      if (detailsEl && details) {
        detailsEl.textContent = details;
      }
    }
  }

  // Check initialization
  function checkInitialization() {
    if (!initializationComplete && Date.now() - initStartTime > INIT_TIMEOUT) {
      console.error('Initialization timeout - page did not render in time');
      showError('Initialization Timeout', 'The extension failed to initialize within 5 seconds.');
      return;
    }
    if (!initializationComplete) {
      setTimeout(checkInitialization, 500);
    }
  }

  // Start timeout check
  setTimeout(checkInitialization, INIT_TIMEOUT);

  // Error handlers
  window.addEventListener('error', (e) => {
    console.error('Script error:', e.error);
    const errorMsg = e.error?.message || e.message || 'Unknown error';
    const errorStack = e.error?.stack || '';
    showError('JavaScript Error', errorMsg + '\n\n' + errorStack);
    if (window.vscode && typeof window.vscode.postMessage === 'function') {
      window.vscode.postMessage({ command: 'error', error: errorMsg, stack: errorStack });
    }
  });

  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    const errorMsg = e.reason?.message || String(e.reason) || 'Unhandled promise rejection';
    showError('Promise Rejection', errorMsg);
    if (window.vscode && typeof window.vscode.postMessage === 'function') {
      window.vscode.postMessage({ command: 'error', error: errorMsg });
    }
  });

  // Setup reload button
  const reloadBtn = document.getElementById('reload-btn');
  if (reloadBtn) {
    reloadBtn.addEventListener('click', function() {
      if (window.vscode && typeof window.vscode.postMessage === 'function') {
        window.vscode.postMessage({ command: 'reloadExtension' });
      } else {
        location.reload();
      }
    });
  }

  // Initialize app
  try {
    const root = document.getElementById('root');
    if (!root) {
      throw new Error('Root element not found');
    }

    // Determine initial page
    const hasApiKey = window.initialState?.isAuthenticated || false;
    const initialPage = window.initialPage || (hasApiKey ? 'dashboard' : 'login');

    // Initialize router and navigate to initial page
    setTimeout(() => {
      if (window.router) {
        window.router.navigate(initialPage);
      }
      initializationComplete = true;
      console.log('[Scriptly] App initialized successfully');
    }, 100);

    // Send ready signal
    if (window.vscode && typeof window.vscode.postMessage === 'function') {
      window.vscode.postMessage({ command: 'ready' });
    }

  } catch (e) {
    console.error('Initialization error:', e);
    showError('Initialization Error', e.message + '\n\nStack: ' + (e.stack || 'No stack trace'));
    if (window.vscode && typeof window.vscode.postMessage === 'function') {
      window.vscode.postMessage({ command: 'error', error: e.message, stack: e.stack });
    }
    initializationComplete = true;
  }
})();
