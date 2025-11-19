import React from 'react'
import { useAppStore } from '../store'
import type { AppPage } from '../../types/ui'

const navItems: Array<{ page: AppPage; label: string; icon: string }> = [
  { page: 'dashboard', label: 'Dashboard', icon: '📊' },
  { page: 'chat', label: 'Chat', icon: '💬' },
  { page: 'code-review', label: 'Code', icon: '💻' },
  { page: 'research', label: 'Research', icon: '🔍' },
  { page: 'deployment', label: 'Deploy', icon: '🚀' },
  { page: 'profiles', label: 'Profiles', icon: '👤' },
  { page: 'history', label: 'History', icon: '📜' },
]

export const Navigation: React.FC = () => {
  const { currentPage, navigateTo, canGoBack, navigateBack } = useAppStore()

  return (
    <nav className="navigation flex items-center gap-2">
      {canGoBack && (
        <button
          onClick={navigateBack}
          className="nav-back-button p-1.5 rounded hover:bg-input-background"
          title="Go back"
        >
          ←
        </button>
      )}
      <div className="nav-items flex items-center gap-1">
        {navItems.map((item) => (
          <button
            key={item.page}
            onClick={() => navigateTo(item.page)}
            className={`nav-item flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
              currentPage === item.page
                ? 'bg-button-background text-button-foreground'
                : 'text-foreground hover:bg-input-background'
            }`}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label hidden md:inline">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

