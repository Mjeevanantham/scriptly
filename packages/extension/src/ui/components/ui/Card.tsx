import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  clickable?: boolean
  onClick?: () => void
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  clickable = false,
  onClick,
}) => {
  const baseClasses = `
    bg-input-background border border-border rounded-lg
    transition-all duration-200 ease-in-out
  `

  const interactiveClasses =
    clickable || hover
      ? `
    hover:border-focus-border hover:shadow-md
    cursor-pointer
  `
      : ''

  const isInteractive = clickable || hover

  return (
    <div
      className={`
        ${baseClasses}
        ${paddingClasses[padding]}
        ${interactiveClasses}
        ${className}
      `}
      onClick={onClick}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick?.()
              }
            }
          : undefined
      }
      role={isInteractive ? 'button' : undefined}
      aria-pressed={isInteractive ? false : undefined}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
)

interface CardTitleProps {
  children: React.ReactNode
  className?: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '', level = 3 }) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements

  return <Component className={`font-semibold text-foreground ${className}`}>{children}</Component>
}

interface CardDescriptionProps {
  children: React.ReactNode
  className?: string
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = '' }) => (
  <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
)

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
)

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-border ${className}`}>{children}</div>
)
