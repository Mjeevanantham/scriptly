import React from 'react'
import { Loader } from '../Loader'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
  children: React.ReactNode
}

const variantClasses = {
  primary:
    'bg-button-background text-button-foreground hover:bg-button-hover focus:ring-button-background',
  secondary:
    'bg-input-background text-foreground border border-border hover:bg-button-background hover:text-button-foreground',
  outline: 'bg-transparent text-foreground border border-border hover:bg-input-background',
  ghost: 'bg-transparent text-foreground hover:bg-input-background',
  danger: 'bg-error text-error-foreground hover:bg-error/90',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-md font-medium
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading && <Loader size="sm" />}
      {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
      <span className={loading || icon ? 'flex-1' : ''}>{children}</span>
    </button>
  )
}
