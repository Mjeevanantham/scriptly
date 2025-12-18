import React from 'react'
import { Spinner } from './ui/Spinner'
import type { LoaderState } from '../../types/ui'

interface LoaderProps {
  state: LoaderState
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export const Loader: React.FC<LoaderProps> = ({ state, size = 'medium', className = '' }) => {
  if (!state.isLoading) return null

  const sizeMap = {
    small: 'sm',
    medium: 'md',
    large: 'lg',
  }

  return (
    <div className={`loader-container flex flex-col items-center justify-center ${className}`}>
      {state.type === 'spinner' || !state.type ? (
        <Spinner size={sizeMap[size]} />
      ) : state.type === 'progress' && state.progress !== undefined ? (
        <div className="progress-container w-full max-w-xs">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${state.progress}%` }}></div>
          </div>
          {state.progress < 100 && (
            <div className="progress-text">{Math.round(state.progress)}%</div>
          )}
        </div>
      ) : (
        <div className="pulse flex gap-1">
          <div className="pulse-dot"></div>
          <div className="pulse-dot"></div>
          <div className="pulse-dot"></div>
        </div>
      )}
      {state.message && (
        <div className="loader-message mt-4 text-center text-sm text-muted-foreground">
          {state.message}
        </div>
      )}
    </div>
  )
}
