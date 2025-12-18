import React, { forwardRef, useState } from 'react'
import { Input as BaseInput, InputVariant, InputSize } from './Input'

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  hint?: string
  variant?: InputVariant
  size?: InputSize
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  containerClassName?: string
  showStrengthIndicator?: boolean
  strengthRequirements?: {
    minLength?: number
    uppercase?: boolean
    lowercase?: boolean
    numbers?: boolean
    symbols?: boolean
  }
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label,
      error,
      hint,
      variant = 'default',
      size = 'md',
      fullWidth = false,
      leftIcon,
      containerClassName = '',
      showStrengthIndicator = false,
      strengthRequirements = {},
      className = '',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const [strength, setStrength] = useState(0)

    const getPasswordStrength = (password: string) => {
      const requirements = {
        minLength: strengthRequirements.minLength || 8,
        uppercase: strengthRequirements.uppercase || false,
        lowercase: strengthRequirements.lowercase || false,
        numbers: strengthRequirements.numbers || false,
        symbols: strengthRequirements.symbols || false,
      }

      let score = 0
      const checks = {
        length: password.length >= requirements.minLength,
        uppercase: requirements.uppercase ? /[A-Z]/.test(password) : true,
        lowercase: requirements.lowercase ? /[a-z]/.test(password) : true,
        numbers: requirements.numbers ? /\d/.test(password) : true,
        symbols: requirements.symbols ? /[!@#$%^&*(),.?":{}|<>]/.test(password) : true,
      }

      Object.values(checks).forEach(check => {
        if (check) score += 20
      })

      return Math.min(score, 100)
    }

    const getStrengthColor = (strength: number) => {
      if (strength < 40) return 'error'
      if (strength < 80) return 'warning'
      return 'success'
    }

    const getStrengthText = (strength: number) => {
      if (strength < 40) return 'Weak'
      if (strength < 80) return 'Medium'
      return 'Strong'
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (showStrengthIndicator) {
        setStrength(getPasswordStrength(e.target.value))
      }
      props.onChange?.(e)
    }

    const toggleShowPassword = () => {
      setShowPassword(!showPassword)
    }

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
        {label && <label className="block text-sm font-medium text-foreground mb-1">{label}</label>}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          <BaseInput
            {...props}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`
            ${leftIcon ? 'pl-10 pr-10' : 'pr-10'}
            ${className}
          `}
          />

          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m3.121 3.121l4.242 4.242M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </button>
        </div>

        {showStrengthIndicator && !error && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Password strength:</span>
              <span className={`font-medium text-${getStrengthColor(strength)}`}>
                {getStrengthText(strength)}
              </span>
            </div>
            <div className="mt-1 w-full bg-border rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all duration-300 ${
                  strength < 40 ? 'bg-error' : strength < 80 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${strength}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <p className="mt-1 text-sm text-error" role="alert">
            {error}
          </p>
        )}

        {hint && !error && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
