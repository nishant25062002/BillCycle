import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { StatusBadge } from '../../../components/shared/StatusBadge'
import { Button } from '../../../components/ui/Button'
import { DataTable } from '../../../components/ui/DataTable'
import { EmptyState } from '../../../components/shared/EmptyState'
import { formatINR } from '../../../utils/currencyUtils'
import { formatDate } from '../../../utils/dateUtils'
import { Receipt, ChevronRight, IndianRupee } from 'lucide-react'

function buildColumns(onOpenPaymentModal) {
  return [
    {
      key: 'customer',
      header: 'Customer',
      render: (inv) => {
        const customer = inv.customer || {}
        return (
          <div className="py-0.5">
            <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors whitespace-nowrap">
              {customer.name}
            </div>
            <div className="text-xs font-mono text-slate-500 mt-0.5">
              {inv.invoiceNumber}
            </div>
          </div>
        )
      },
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (inv) => (
        <span className="text-slate-800 font-medium whitespace-nowrap">
          {formatDate(inv.dueDate, 'dd MMM yyyy')}
        </span>
      ),
    },
    {
      key: 'grandTotal',
      header: 'Total',
      align: 'right',
      render: (inv) => (
        <span className="font-mono font-semibold text-slate-900 whitespace-nowrap">
          {formatINR(inv.grandTotal)}
        </span>
      ),
    },
    {
      key: 'paid',
      header: 'Paid',
      align: 'right',
      render: (inv) => (
        <span className="font-mono text-emerald-700 font-medium whitespace-nowrap">
          {formatINR(inv.paidAmount || 0)}
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'Balance',
      align: 'right',
      render: (inv) => (
        <span className="font-mono font-bold text-indigo-900 whitespace-nowrap">
          {formatINR(inv.remainingBalance || 0)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (inv) => <StatusBadge status={inv.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (inv) => {
        const isFullyPaid = inv.status === 'PAID'
        return (
          <div
            className="flex items-center justify-end gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {!isFullyPaid && (
              <Button
                variant="outline"
                size="xs"
                icon={IndianRupee}
                onClick={() => onOpenPaymentModal?.(inv)}
              >
                Pay
              </Button>
            )}
            <Link to={`/invoices/${inv.id}`}>
              <Button variant="ghost" size="xs" iconRight={ChevronRight}>
                View
              </Button>
            </Link>
          </div>
        )
      },
    },
  ]
}

export function InvoiceTable({
  invoices = [],
  loading = false,
  onOpenPaymentModal,
  onResetFilters,
}) {
  const navigate = useNavigate()
  const columns = buildColumns(onOpenPaymentModal)

  const emptyState = (
    <EmptyState
      title="No invoices found"
      description="Try adjusting your status filter or search query."
      icon={Receipt}
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
          data={invoices}
          keyFn={(inv) => inv.id}
          onRowClick={(inv) => navigate(`/invoices/${inv.id}`)}
          loading={loading}
          skeletonRows={4}
          emptyState={emptyState}
        />
      </div>

      {/* Mobile Cards */}
      {!loading && invoices.length > 0 && (
        <div className="lg:hidden space-y-3">
          {invoices.map((inv) => {
            const customer = inv.customer || {}
            const isFullyPaid = inv.status === 'PAID'
            return (
              <div
                key={inv.id}
                onClick={() => navigate(`/invoices/${inv.id}`)}
                className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs space-y-3 cursor-pointer hover:border-slate-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono font-bold text-sm text-slate-900">
                      {inv.invoiceNumber}
                    </div>
                    <div className="text-xs text-slate-600">{customer.name}</div>
                  </div>
                  <StatusBadge status={inv.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Amount</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatINR(inv.grandTotal)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Balance Due</span>
                    <span className="font-mono font-bold text-indigo-700">
                      {formatINR(inv.remainingBalance || 0)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-500">
                    Due: {formatDate(inv.dueDate, 'dd MMM yyyy')}
                  </span>
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!isFullyPaid && (
                      <Button
                        variant="outline"
                        size="xs"
                        icon={IndianRupee}
                        onClick={() => onOpenPaymentModal?.(inv)}
                      >
                        Pay
                      </Button>
                    )}
                    <Link to={`/invoices/${inv.id}`}>
                      <Button variant="primary" size="xs" iconRight={ChevronRight}>
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Mobile empty state */}
      {!loading && invoices.length === 0 && (
        <div className="lg:hidden">{emptyState}</div>
      )}

      {/* Mobile loading skeletons */}
      {loading && (
        <div className="lg:hidden space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 animate-pulse"
            >
              <div className="space-y-2">
                <div className="h-4 w-40 bg-slate-200 rounded" />
                <div className="h-3 w-56 bg-slate-100 rounded" />
              </div>
              <div className="h-6 w-20 bg-slate-200 rounded" />
              <div className="h-8 w-20 bg-slate-100 rounded-lg" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
