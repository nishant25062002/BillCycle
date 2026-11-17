import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card'
import {
  AlertCircle,
  Clock,
  FileText,
  ChevronRight,
  CheckCircle2,
  Layers,
} from 'lucide-react'
import { cn } from '../../../utils/cn'

const TYPE_CONFIGS = {
  INVOICE_PENDING: {
    icon: FileText,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50 border border-indigo-100',
    badgeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80',
  },
  OVERDUE: {
    icon: AlertCircle,
    iconColor: 'text-rose-600',
    iconBg: 'bg-rose-50 border border-rose-100',
    badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200/80',
  },
  CYCLE_CLOSURE: {
    icon: Clock,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 border border-amber-100',
    badgeClass: 'bg-amber-50 text-amber-800 border border-amber-200/80',
  },
  CYCLE_ACTIVE: {
    icon: Layers,
    iconColor: 'text-slate-600',
    iconBg: 'bg-slate-100 border border-slate-200/80',
    badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200/80',
  },
}

export function AttentionList({ items = [] }) {
  return (
    <Card className="h-full flex flex-col border border-slate-200/90 shadow-2xs">
      <CardHeader className="flex flex-row items-center justify-between py-3.5 px-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-slate-700" />
          <CardTitle className="text-sm font-semibold text-slate-900">
            Attention Required
          </CardTitle>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          {items.length} pending
        </span>
      </CardHeader>

      <CardContent className="p-0 flex-1">
        <div className="divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 mb-2" />
              <span>All billing cycles and invoices are up to date!</span>
            </div>
          ) : (
            items.map((item) => {
              const config =
                TYPE_CONFIGS[item.type] || TYPE_CONFIGS.CYCLE_CLOSURE
              const Icon = config.icon

              return (
                <Link
                  key={item.id}
                  to={item.link}
                  className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                        config.iconBg
                      )}
                    >
                      <Icon className={cn('h-4 w-4', config.iconColor)} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <span className="font-semibold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {item.customerName}
                        </span>
                        <span
                          className={cn(
                            'text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0',
                            config.badgeClass
                          )}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium truncate">
                        {item.issue}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 group-hover:text-indigo-600 shrink-0 ml-2">
                    <span className="hidden sm:inline">
                      {item.actionLabel}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
