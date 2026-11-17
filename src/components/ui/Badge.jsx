import React from 'react'
import { cn } from '../../utils/cn'

const VARIANT_STYLES = {
  default: 'bg-slate-100 text-slate-800 border-slate-200',
  primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-900 border-amber-200',
  danger: 'bg-rose-50 text-rose-800 border-rose-200',
  info: 'bg-sky-50 text-sky-800 border-sky-200',
  neutral: 'bg-slate-100 text-slate-800 border-slate-200',
  purple: 'bg-purple-50 text-purple-800 border-purple-200',
}

const DOT_COLORS = {
  default: 'bg-slate-500',
  primary: 'bg-indigo-600',
  success: 'bg-emerald-600',
  warning: 'bg-amber-600',
  danger: 'bg-rose-600',
  info: 'bg-sky-600',
  neutral: 'bg-slate-500',
  purple: 'bg-purple-600',
}

export function Badge({
  children,
  variant = 'default',
  withDot = false,
  size = 'md',
  className = '',
  icon: Icon,
}) {
  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5 font-medium rounded-full',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium rounded-full',
    lg: 'text-sm px-3 py-1 gap-2 font-medium rounded-full',
  }[size]

  return (
    <span
      className={cn(
        'inline-flex items-center border tracking-tight transition-colors select-none font-medium',
        VARIANT_STYLES[variant] || VARIANT_STYLES.default,
        sizeStyles,
        className
      )}
    >
      {withDot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full shrink-0',
            DOT_COLORS[variant] || DOT_COLORS.default
          )}
        />
      )}
      {Icon && <Icon className="h-3 w-3 shrink-0" />}
      <span>{children}</span>
    </span>
  )
}
