import type { AppPage } from '../types/ui'

export class Router {
  private currentPage: AppPage = 'login'
  private listeners: Array<(page: AppPage) => void> = []

  navigate(page: AppPage): void {
    if (this.currentPage !== page) {
      this.currentPage = page
      this.listeners.forEach((listener) => listener(page))
    }
  }

  getCurrentPage(): AppPage {
    return this.currentPage
  }

  subscribe(listener: (page: AppPage) => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  // Check if page requires authentication
  requiresAuth(page: AppPage): boolean {
    return page !== 'login'
  }

  // Get page title
  getPageTitle(page: AppPage): string {
    const titles: Record<AppPage, string> = {
      login: 'Login',
      dashboard: 'Dashboard',
      chat: 'Chat',
      'code-review': 'Code Review',
      deployment: 'Deployment',
      research: 'Research',
      settings: 'Settings',
      profiles: 'Profiles',
      history: 'History',
    }
    return titles[page] || 'Scriptly'
  }
}

export const router = new Router()

