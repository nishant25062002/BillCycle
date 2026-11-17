import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { StatusBadge } from '../../../components/shared/StatusBadge'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DataTable } from '../../../components/ui/DataTable'
import { EmptyState } from '../../../components/shared/EmptyState'
import { formatINR } from '../../../utils/currencyUtils'
import { formatDate } from '../../../utils/dateUtils'
import { ChevronRight, Layers } from 'lucide-react'

// Column definitions: streamlined to single clear lines, eliminating visual clutter.
function buildColumns() {
  return [
    {
      key: 'customer',
      header: 'Customer',
      render: (cycle) => {
        const customer = cycle.customer || {}
        return (
          <div className="py-0.5">
            <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors whitespace-nowrap">
              {customer.name}
            </div>
            <div className="text-xs font-mono text-slate-500 mt-0.5">
              {cycle.cycleNumber}
            </div>
          </div>
        )
      },
    },
    {
      key: 'period',
      header: 'Billing Period',
      render: (cycle) => (
        <span className="text-slate-800 font-medium whitespace-nowrap">
          {formatDate(cycle.startAt, 'dd MMM')} – {formatDate(cycle.endAt, 'dd MMM yyyy')}
        </span>
      ),
    },
    {
      key: 'frequency',
      header: 'Frequency',
      render: (cycle) => (
        <Badge variant="neutral" size="sm">
          {cycle.frequency}
        </Badge>
      ),
    },
    {
      key: 'items',
      header: 'Shipments',
      render: (cycle) => (
        <span className="text-slate-800 font-medium">
          {cycle.eligibleItemsCount} {cycle.eligibleItemsCount === 1 ? 'item' : 'items'}
          {cycle.itemsCount > cycle.eligibleItemsCount && (
            <span className="text-slate-500 font-normal ml-1">
              ({cycle.itemsCount} total)
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Billable Amount',
      align: 'right',
      render: (cycle) => (
        <span className="font-bold text-slate-900 font-mono text-sm whitespace-nowrap">
          {formatINR(cycle.billableAmount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (cycle) => <StatusBadge status={cycle.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      className: 'w-24',
      render: (cycle) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Link to={`/cycles/${cycle.id}`}>
            <Button variant="outline" size="xs" iconRight={ChevronRight}>
              Review
            </Button>
          </Link>
        </div>
      ),
    },
  ]
}

export function CycleTable({ cycles = [], loading = false, onResetFilters }) {
  const navigate = useNavigate()
  const columns = buildColumns()

  const emptyState = (
    <EmptyState
      title="No billing cycles found"
      description="Try adjusting your search criteria, frequency filter, or status selection."
      icon={Layers}
      actionLabel="Reset Filters"
      onAction={onResetFilters}
    />
  )

  return (
    <div className="space-y-3">
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <DataTable
          columns={columns}
          data={cycles}
          keyFn={(cycle) => cycle.id}
          onRowClick={(cycle) => navigate(`/cycles/${cycle.id}`)}
          loading={loading}
          skeletonRows={5}
          emptyState={emptyState}
        />
      </div>

      {/* Mobile & Tablet Card Layout */}
      {!loading && cycles.length > 0 && (
        <div className="lg:hidden space-y-3">
          {cycles.map((cycle) => {
            const customer = cycle.customer || {}
            return (
              <div
                key={cycle.id}
                onClick={() => navigate(`/cycles/${cycle.id}`)}
                className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3 cursor-pointer hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-sm text-slate-900">
                      {customer.name}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {cycle.cycleNumber}
                    </div>
                  </div>
                  <StatusBadge status={cycle.status} />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Period</span>
                    <span className="font-medium text-slate-800">
                      {formatDate(cycle.startAt, 'dd MMM')} – {formatDate(cycle.endAt, 'dd MMM yyyy')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Frequency</span>
                    <Badge variant="neutral" size="sm">
                      {cycle.frequency}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <div className="text-xs text-slate-500">Billable Amount</div>
                    <div className="font-bold text-slate-900 font-mono text-base">
                      {formatINR(cycle.billableAmount)}
                    </div>
                  </div>
                  <Link to={`/cycles/${cycle.id}`} onClick={(e) => e.stopPropagation()}>
                    <Button variant="primary" size="xs" iconRight={ChevronRight}>
                      Open Cycle
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Mobile empty state */}
      {!loading && cycles.length === 0 && (
        <div className="lg:hidden">{emptyState}</div>
      )}

      {/* Mobile loading skeletons */}
      {loading && (
        <div className="lg:hidden space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 animate-pulse"
            >
              <div className="space-y-2">
                <div className="h-4 w-44 bg-slate-200 rounded" />
                <div className="h-3 w-64 bg-slate-100 rounded" />
              </div>
              <div className="h-6 w-24 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
