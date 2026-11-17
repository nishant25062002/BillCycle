import React from 'react'
import { Inbox } from 'lucide-react'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'

export function EmptyState({
  title = 'No records found',
  description = 'There are no items matching your criteria.',
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-slate-300 bg-white/60',
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mb-3.5 border border-slate-200">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-800 tracking-tight">
        {title}
      </h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}

