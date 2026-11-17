import React from 'react'
import { cn } from '../../utils/cn'

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-200/90 shadow-xs transition-shadow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div
      className={cn(
        'px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3
      className={cn(
        'text-base font-semibold text-slate-900 tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={cn('text-xs text-slate-600 mt-0.5 font-medium', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={cn(
        'px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 rounded-b-xl flex items-center justify-between gap-3',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

