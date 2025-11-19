import React from 'react'
import { useAppStore } from '../store'
import type { AppMode } from '../../types/ui'

const modes: Array<{ value: AppMode; label: string; icon: string }> = [
  { value: 'chat', label: 'Chat', icon: '💬' },
  { value: 'code', label: 'Code', icon: '💻' },
  { value: 'research', label: 'Research', icon: '🔍' },
  { value: 'settings', label: 'Settings', icon: '⚙️' },
]

export const ModeSwitcher: React.FC = () => {
  const { currentMode, setMode, navigateTo } = useAppStore()

  const handleModeChange = (mode: AppMode) => {
    setMode(mode)
    // Navigate to appropriate page for mode
    const modePages: Record<AppMode, string> = {
      chat: 'chat',
      code: 'code-review',
      research: 'research',
      settings: 'settings',
    }
    navigateTo(modePages[mode] as any)
  }

  return (
    <div className="mode-switcher flex items-center gap-1 bg-input-background rounded-lg p-1">
      {modes.map((mode) => (
        <button
          key={mode.value}
          onClick={() => handleModeChange(mode.value)}
          className={`mode-button flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all ${
            currentMode === mode.value
              ? 'bg-button-background text-button-foreground'
              : 'text-foreground hover:bg-input-background'
          }`}
          title={mode.label}
        >
          <span className="mode-icon">{mode.icon}</span>
          <span className="mode-label hidden sm:inline">{mode.label}</span>
        </button>
      ))}
    </div>
  )
}

