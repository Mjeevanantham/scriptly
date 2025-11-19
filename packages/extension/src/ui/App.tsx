import React, { useEffect } from 'react'
import { useAppStore } from './store'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { ChatPage } from './pages/ChatPage'
import { CodeReviewPage } from './pages/CodeReviewPage'
import { ResearchPage } from './pages/ResearchPage'
import { SettingsPage } from './pages/SettingsPage'
import { DeploymentPage } from './pages/DeploymentPage'
import { ProfilesPage } from './pages/ProfilesPage'
import { HistoryPage } from './pages/HistoryPage'

declare global {
  interface Window {
    vscode: any
  }
}

export const App: React.FC = () => {
  const { currentPage, isAuthenticated, setLoading } = useAppStore()

  useEffect(() => {
    // Initialize VS Code API
    if (typeof window !== 'undefined') {
      const vscode = acquireVsCodeApi()
      window.vscode = vscode

      // Listen for messages from extension
      window.addEventListener('message', (event) => {
        const message = event.data
        handleMessage(message)
      })

      // Send ready signal
      vscode.postMessage({ command: 'ready' })
    }
  }, [])

  const handleMessage = (message: any) => {
    switch (message.command) {
      case 'setAuth':
        // Handle auth state from extension
        break
      case 'navigate':
        // Handle navigation from extension
        break
      case 'loading':
        setLoading(message.isLoading, message.message)
        break
      default:
        break
    }
  }

  const renderPage = () => {
    if (!isAuthenticated && currentPage !== 'login') {
      return <LoginPage />
    }

    switch (currentPage) {
      case 'login':
        return <LoginPage />
      case 'dashboard':
        return <DashboardPage />
      case 'chat':
        return <ChatPage />
      case 'code-review':
        return <CodeReviewPage />
      case 'research':
        return <ResearchPage />
      case 'settings':
        return <SettingsPage />
      case 'deployment':
        return <DeploymentPage />
      case 'profiles':
        return <ProfilesPage />
      case 'history':
        return <HistoryPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <Layout showHeader={currentPage !== 'login'} showFooter={isAuthenticated}>
      <div className="app-container h-full">{renderPage()}</div>
    </Layout>
  )
}

