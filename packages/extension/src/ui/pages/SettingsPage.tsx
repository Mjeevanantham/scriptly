import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useAppStore } from '../store'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Alert,
  Modal,
} from '../components/ui'

export const SettingsPage: React.FC = () => {
  const { logout, userProfile } = useAuth()
  const { setMode, currentMode } = useAppStore()
  const [activeTab, setActiveTab] = useState('general')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [settings, setSettings] = useState({
    defaultMode: currentMode,
    autoSave: true,
    offlineMode: false,
    theme: 'system',
    notifications: true,
    telemetry: false,
  })

  const tabs = [
    {
      id: 'general',
      label: 'General',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      id: 'api',
      label: 'API Configuration',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2L4.257 8.257a6 6 0 017.743-7.743L15 4a2 2 0 012 2z"
          />
        </svg>
      ),
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
          />
        </svg>
      ),
    },
    {
      id: 'privacy',
      label: 'Privacy',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
    {
      id: 'about',
      label: 'About',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ]

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))

    if (key === 'defaultMode') {
      setMode(value)
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Default Mode
                  </label>
                  <select
                    value={settings.defaultMode}
                    onChange={e => handleSettingChange('defaultMode', e.target.value)}
                    className="w-full p-2 bg-input-background border border-border rounded"
                  >
                    <option value="chat">Chat</option>
                    <option value="code">Code Review</option>
                    <option value="research">Research</option>
                    <option value="settings">Settings</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Auto-save conversations
                    </label>
                    <p className="text-xs text-muted-foreground">Automatically save chat history</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={e => handleSettingChange('autoSave', e.target.checked)}
                    className="h-4 w-4 text-focus-border focus:ring-focus-border border-border rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">Offline mode</label>
                    <p className="text-xs text-muted-foreground">
                      Use cached responses when offline
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.offlineMode}
                    onChange={e => handleSettingChange('offlineMode', e.target.checked)}
                    className="h-4 w-4 text-focus-border focus:ring-focus-border border-border rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 'api':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">API Configuration</h3>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">Current Provider</h4>
                        <p className="text-sm text-muted-foreground">
                          {userProfile?.apiKeyProfile || 'Not configured'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-sm text-success">Connected</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={() => {
                    // Trigger API reconfiguration
                    window.location.reload()
                  }}
                  fullWidth
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 17l-5-5m0 0l5-5m-5 5h12"
                      />
                    </svg>
                  }
                >
                  Reconfigure API
                </Button>

                <Alert variant="info">
                  <p className="text-sm">
                    Your API key is encrypted and stored locally. It's never transmitted to our
                    servers.
                  </p>
                </Alert>
              </div>
            </div>
          </div>
        )

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Appearance</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Theme</label>
                  <select
                    value={settings.theme}
                    onChange={e => handleSettingChange('theme', e.target.value)}
                    className="w-full p-2 bg-input-background border border-border rounded"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Follow your system's theme preference
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Privacy & Data</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">Notifications</label>
                    <p className="text-xs text-muted-foreground">
                      Receive notifications for important updates
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={e => handleSettingChange('notifications', e.target.checked)}
                    className="h-4 w-4 text-focus-border focus:ring-focus-border border-border rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-foreground">
                      Anonymous telemetry
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Help improve Scriptly by sharing usage statistics
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.telemetry}
                    onChange={e => handleSettingChange('telemetry', e.target.checked)}
                    className="h-4 w-4 text-focus-border focus:ring-focus-border border-border rounded"
                  />
                </div>

                <Button
                  variant="danger"
                  onClick={() => setShowResetConfirm(true)}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  }
                >
                  Reset All Data
                </Button>
              </div>
            </div>
          </div>
        )

      case 'about':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-info/10 text-info rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Scriptly</h3>
              <p className="text-muted-foreground mb-2">AI-powered development assistant</p>
              <p className="text-sm text-muted-foreground mb-4">Version 1.0.0</p>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Scriptly helps developers write better code with AI assistance.
                </p>
                <p className="text-sm text-muted-foreground">
                  Built with ❤️ for the developer community.
                </p>
              </div>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-foreground">10k+</div>
                    <div className="text-xs text-muted-foreground">Messages Processed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">500+</div>
                    <div className="text-xs text-muted-foreground">Code Reviews</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">99.9%</div>
                    <div className="text-xs text-muted-foreground">Uptime</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">24/7</div>
                    <div className="text-xs text-muted-foreground">Support</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="settings-page flex h-full">
      {/* Settings Sidebar */}
      <div className="settings-sidebar w-64 border-r border-border p-6 bg-input-background/50">
        <h2 className="text-xl font-semibold text-foreground mb-6">Settings</h2>
        <nav className="space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                activeTab === tab.id
                  ? 'bg-button-background text-button-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-input-background hover:text-foreground'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="settings-content flex-1 overflow-y-auto">
        <div className="max-w-4xl p-8">
          <Card>
            <CardContent className="p-8">{renderTabContent()}</CardContent>
          </Card>

          {/* Logout Section */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Sign out of Scriptly</h4>
                <p className="text-sm text-muted-foreground">
                  You'll need to re-enter your API key next time
                </p>
              </div>
              <Button
                variant="danger"
                onClick={() => setShowLogoutConfirm(true)}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                }
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Sign Out"
        size="sm"
      >
        <ModalBody>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to sign out? You'll need to reconfigure your API key to continue
            using Scriptly.
          </p>
        </ModalBody>
        <ModalFooter align="between">
          <Button variant="ghost" onClick={() => setShowLogoutConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={logout}>
            Sign Out
          </Button>
        </ModalFooter>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Reset All Data"
        size="sm"
      >
        <ModalBody>
          <Alert variant="warning" className="mb-4">
            <p className="text-sm font-medium">This action cannot be undone!</p>
            <p className="text-sm mt-1">
              This will permanently delete all your conversations, settings, and cached data.
            </p>
          </Alert>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to reset all data? You'll need to reconfigure everything from
            scratch.
          </p>
        </ModalBody>
        <ModalFooter align="between">
          <Button variant="ghost" onClick={() => setShowResetConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              // Reset all data logic here
              setShowResetConfirm(false)
              // Show success message
            }}
          >
            Reset Everything
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
