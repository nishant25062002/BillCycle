import React from 'react'
import { Card, CardContent } from '../ui/Card'
import { Skeleton } from '../ui/Skeleton'
import { cn } from '../../utils/cn'

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  iconColor = 'text-indigo-600',
  iconBg = 'bg-indigo-50',
  loading = false,
  className = '',
}) {
  if (loading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
          <Skeleton className="h-7 w-36 mt-3" />
          <Skeleton className="h-3 w-44 mt-2" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('hover:border-slate-300/80 transition-all shadow-2xs', className)}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold tracking-wider text-slate-700 uppercase">
            {title}
          </span>
          {Icon && (
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg shrink-0 border border-slate-200/80',
                iconBg
              )}
            >
              <Icon className={cn('h-4.5 w-4.5', iconColor)} />
            </div>
          )}
        </div>

        <div className="mt-2.5">
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {value}
          </div>

          {(subtitle || trend) && (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
              {trend && (
                <span
                  className={cn(
                    'font-semibold',
                    trend > 0 ? 'text-emerald-700' : 'text-rose-700'
                  )}
                >
                  {trend > 0 ? `+${trend}%` : `${trend}%`}
                </span>
              )}
              {trendLabel && <span className="text-slate-600">{trendLabel}</span>}
              {!trend && subtitle && <span className="text-slate-600">{subtitle}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

