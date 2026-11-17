import React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { formatDate } from '../../../utils/dateUtils'
import { Clock, ArrowUpRight } from 'lucide-react'

export function RecentActivityFeed({ activities = [] }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-500" />
          <CardTitle>Recent Billing Activity</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <div className="divide-y divide-slate-100">
          {activities.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No recent activity recorded.
            </div>
          ) : (
            activities.map((act) => (
              <div
                key={act.id}
                className="p-4 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {act.title}
                    </span>
                    <Badge variant={act.badgeVariant || 'default'} size="sm">
                      {act.badge}
                    </Badge>
                  </div>
                  <p className="text-slate-600 font-medium leading-snug">{act.description}</p>
                  <p className="text-xs text-slate-500 font-medium">
                    {formatDate(act.timestamp, 'dd MMM yyyy, HH:mm')}
                  </p>
                </div>

                {act.entityType === 'CYCLE' && (
                  <Link
                    to={`/cycles/${act.entityId}`}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    title="View Cycle"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                )}
                {act.entityType === 'INVOICE' && (
                  <Link
                    to={`/invoices/${act.entityId}`}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    title="View Invoice"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

