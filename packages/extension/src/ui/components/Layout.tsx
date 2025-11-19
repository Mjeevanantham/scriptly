import React from 'react'
import { useAppStore } from '../store'
import { Loader } from './Loader'
import { ModeSwitcher } from './ModeSwitcher'
import { Navigation } from './Navigation'
import type { LoaderState } from '../../types/ui'

interface LayoutProps {
  children: React.ReactNode
  showHeader?: boolean
  showFooter?: boolean
  loader?: LoaderState
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  showHeader = true,
  showFooter = true,
  loader,
}) => {
  const { currentPage, currentMode, isAuthenticated } = useAppStore()

  return (
    <div className="layout-container flex flex-col h-full">
      {showHeader && isAuthenticated && (
        <header className="layout-header border-b border-border">
          <div className="header-content flex items-center justify-between px-4 py-2">
            <div className="header-left flex items-center gap-4">
              <h1 className="app-title text-lg font-semibold">SCRIPTLY</h1>
              {currentPage !== 'login' && <Navigation />}
            </div>
            <div className="header-right flex items-center gap-4">
              {currentPage !== 'settings' && <ModeSwitcher />}
            </div>
          </div>
        </header>
      )}

      <main className="layout-main flex-1 overflow-auto">
        {loader && loader.isLoading && (
          <div className="loader-overlay fixed inset-0 bg-background bg-opacity-90 flex items-center justify-center z-50">
            <Loader state={loader} size="large" />
          </div>
        )}
        {children}
      </main>

      {showFooter && isAuthenticated && currentPage !== 'login' && (
        <footer className="layout-footer border-t border-border px-4 py-2">
          <div className="footer-content flex items-center justify-between text-xs opacity-60">
            <div className="footer-left">
              Mode: <span className="font-medium">{currentMode}</span>
            </div>
            <div className="footer-right">
              Page: <span className="font-medium">{currentPage}</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

