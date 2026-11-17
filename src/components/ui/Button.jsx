import React from 'react'
import { cn } from '../../utils/cn'
import { Loader2 } from 'lucide-react'

const BUTTON_VARIANTS = {
  primary:
    'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs focus-visible:ring-indigo-500 active:bg-indigo-800 disabled:bg-indigo-300',
  secondary:
    'bg-slate-900 hover:bg-slate-800 text-white shadow-xs focus-visible:ring-slate-500 active:bg-slate-950 disabled:bg-slate-400',
  outline:
    'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 shadow-2xs focus-visible:ring-slate-400 disabled:opacity-50 disabled:pointer-events-none',
  ghost:
    'text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-400 disabled:opacity-50 disabled:pointer-events-none',
  danger:
    'bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus-visible:ring-rose-500 active:bg-rose-800 disabled:bg-rose-300',
  dangerOutline:
    'border border-rose-200 bg-white hover:bg-rose-50 text-rose-700 focus-visible:ring-rose-400 disabled:opacity-50 disabled:pointer-events-none',
}

const BUTTON_SIZES = {
  xs: 'h-7 px-2.5 text-xs gap-1.5 rounded-md',
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-10 px-5 text-sm font-medium gap-2.5 rounded-lg',
  icon: 'h-8 w-8 p-0 rounded-md',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  type = 'button',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all select-none cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:pointer-events-none',
        BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary,
        BUTTON_SIZES[size] || BUTTON_SIZES.md,
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="h-4 w-4 shrink-0" />
      ) : null}
      {children}
      {!loading && IconRight && <IconRight className="h-4 w-4 shrink-0" />}
    </button>
  )
}

