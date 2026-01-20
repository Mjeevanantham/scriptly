// Client-side Router
class Router {
  constructor() {
    this.currentPage = null;
    this.pages = new Map();
    this.init();
  }

  init() {
    // Listen for navigation messages from extension
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.command === 'navigate') {
        this.navigate(message.page);
      }
    });

    // Setup sidebar navigation if it exists
    setTimeout(() => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        const navItems = sidebar.querySelectorAll('[data-page]');
        navItems.forEach(item => {
          item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            if (page) {
              this.navigate(page);
            }
          });
        });
      }
    }, 100);
  }

  register(name, element) {
    this.pages.set(name, element);
  }

  navigate(pageName) {
    if (!pageName) {
      console.error('Router: navigate called without page name');
      return;
    }

    // Hide current page
    if (this.currentPage) {
      const currentEl = document.querySelector(`#page-${this.currentPage}`);
      if (currentEl) {
        currentEl.classList.remove('active');
      }
    }

    // Show new page
    const newEl = document.querySelector(`#page-${pageName}`);
    if (newEl) {
      newEl.classList.add('active');
      this.currentPage = pageName;
      
      // Notify extension
      if (window.vscode) {
        window.vscode.postMessage({ command: 'navigate', page: pageName });
      }

      // Trigger page-specific initialization if it exists
      if (window[`init${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Page`]) {
        window[`init${pageName.charAt(0).toUpperCase() + pageName.slice(1)}Page`]();
      }
    } else {
      console.error(`Router: Page element #page-${pageName} not found`);
    }
  }

  getCurrentPage() {
    return this.currentPage;
  }
}

// Initialize router
window.router = new Router();
