import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'

export function ErrorState({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while processing your request.',
  onRetry,
  className = '',
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-rose-200 bg-rose-50/60 p-6 sm:p-8 text-center',
        className
      )}
    >
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600 mb-3 border border-rose-200">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-rose-950">{title}</h3>
      <p className="mt-1 text-xs text-rose-700 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <div className="mt-4 flex justify-center">
          <Button
            variant="danger"
            size="sm"
            icon={RefreshCw}
            onClick={onRetry}
          >
            Retry Request
          </Button>
        </div>
      )}
    </div>
  )
}

