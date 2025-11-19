import React, { useState } from 'react'

export const SettingsPage: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [offlineMode, setOfflineMode] = useState(false)

  return (
    <div className="settings-page p-8">
      <div className="page-header mb-6">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-sm opacity-70">Configure your Scriptly preferences</p>
      </div>

      <div className="settings-content space-y-6">
        <div className="setting-section">
          <h2 className="text-lg font-semibold mb-3">API Keys</h2>
          <div className="setting-item p-4 bg-input-background border border-border rounded">
            <p className="text-sm mb-2">Manage your API keys</p>
            <button className="px-4 py-2 bg-button-background text-button-foreground rounded hover:bg-button-hover text-sm">
              Configure API Keys
            </button>
          </div>
        </div>

        <div className="setting-section">
          <h2 className="text-lg font-semibold mb-3">Preferences</h2>
          <div className="setting-item p-4 bg-input-background border border-border rounded space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as any)}
                className="px-3 py-1 bg-input-background border border-border rounded text-sm"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Offline Mode</label>
              <input
                type="checkbox"
                checked={offlineMode}
                onChange={(e) => setOfflineMode(e.target.checked)}
                className="cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="setting-section">
          <h2 className="text-lg font-semibold mb-3">About</h2>
          <div className="setting-item p-4 bg-input-background border border-border rounded text-sm opacity-70">
            <p>Scriptly v0.1.0</p>
            <p>Free, unified IDE with AI-powered coding assistance</p>
          </div>
        </div>
      </div>
    </div>
  )
}

