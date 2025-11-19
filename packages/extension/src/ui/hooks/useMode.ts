import { useAppStore } from '../store'
import type { AppMode } from '../../types/ui'

export const useMode = () => {
  const { currentMode, setMode } = useAppStore()

  const switchMode = (mode: AppMode) => {
    setMode(mode)
  }

  const isMode = (mode: AppMode) => {
    return currentMode === mode
  }

  return {
    currentMode,
    switchMode,
    isMode,
  }
}

