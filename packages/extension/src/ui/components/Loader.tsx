import React from 'react'
import type { LoaderState } from '../../types/ui'

interface LoaderProps {
  state: LoaderState
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export const Loader: React.FC<LoaderProps> = ({
  state,
  size = 'medium',
  className = '',
}) => {
  if (!state.isLoading) return null

  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  }

  const spinnerSize = sizeClasses[size]

  return (
    <div
      className={`loader-container flex flex-col items-center justify-center ${className}`}
    >
      {state.type === 'spinner' || !state.type ? (
        <div className={`spinner ${spinnerSize}`}>
          <div className="spinner-inner"></div>
        </div>
      ) : state.type === 'progress' && state.progress !== undefined ? (
        <div className="progress-container w-full max-w-xs">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${state.progress}%` }}
            ></div>
          </div>
          {state.progress < 100 && (
            <div className="progress-text">{Math.round(state.progress)}%</div>
          )}
        </div>
      ) : (
        <div className={`pulse ${spinnerSize}`}>
          <div className="pulse-dot"></div>
          <div className="pulse-dot"></div>
          <div className="pulse-dot"></div>
        </div>
      )}
      {state.message && (
        <div className="loader-message mt-4 text-center text-sm opacity-70">
          {state.message}
        </div>
      )}
    </div>
  )
}

