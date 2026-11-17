import React, { useState, useEffect } from 'react'
import { MockApi } from '../../services/mockApi'
import { CustomerModal } from './components/CustomerModal'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { DataTable } from '../../components/ui/DataTable'
import { ErrorState } from '../../components/shared/ErrorState'
import { EmptyState } from '../../components/shared/EmptyState'
import { TIMEZONE_LABELS } from '../../utils/dateUtils'
import { Search, Users, Eye } from 'lucide-react'

// Column definitions — built once at module level, referencing a stable callback ref.
function buildColumns(onInspect) {
  return [
    {
      key: 'name',
      header: 'Customer',
      render: (cust) => (
        <div>
          <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {cust.name}
          </div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">
            {cust.code} • {cust.city}
          </div>
        </div>
      ),
    },
    {
      key: 'frequency',
      header: 'Frequency',
      render: (cust) => (
        <Badge variant="neutral" size="sm">
          {cust.billingFrequency}
        </Badge>
      ),
    },
    {
      key: 'timezone',
      header: 'Timezone',
      render: (cust) => {
        const tzLabel = TIMEZONE_LABELS[cust.timezone] || cust.timezone
        return <span className="text-slate-700 font-medium">{tzLabel}</span>
      },
    },
    {
      key: 'gstin',
      header: 'GSTIN',
      className: 'font-mono text-slate-700',
      render: (cust) => cust.gstin,
    },
    {
      key: 'paymentTerms',
      header: 'Terms',
      className: 'text-slate-700 font-medium',
      render: (cust) =>
        cust.paymentTerms ? cust.paymentTerms.replace('_', ' ') : 'NET 30',
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (cust) => (
        <Badge variant="success" size="sm">
          {cust.billingStatus}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (cust) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="xs"
            icon={Eye}
            onClick={() => onInspect(cust)}
          >
            Inspect
          </Button>
        </div>
      ),
    },
  ]
}

export function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await MockApi.getCustomers()
      setCustomers(data)
    } catch (err) {
      setError(err.message || 'Failed to load customers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const handleInspectCustomer = (cust) => {
    setSelectedCustomer(cust)
    setIsModalOpen(true)
  }

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.gstin?.toLowerCase().includes(search.toLowerCase())
  )

  const columns = buildColumns(handleInspectCustomer)

  const emptyState = (
    <EmptyState
      title="No customers found"
      description="Try searching with a different customer name or code."
      icon={Users}
      actionLabel="Clear Search"
      onAction={() => setSearch('')}
    />
  )

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Customer Accounts
            </h1>
            <Badge variant="primary" size="sm">
              {customers.length} Accounts
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise clients, billing frequencies, timezone parameters, and tax jurisdictions.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="w-full sm:w-80">
        <Input
          placeholder="Search by customer name, code, or GSTIN..."
          icon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 text-xs"
        />
      </div>

      {/* Table / Error */}
      {error ? (
        <ErrorState
          title="Customers Unavailable"
          message={error}
          onRetry={fetchCustomers}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          keyFn={(cust) => cust.id}
          onRowClick={(cust) => handleInspectCustomer(cust)}
          loading={loading}
          skeletonRows={4}
          emptyState={emptyState}
        />
      )}

      {/* Customer Detail Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={selectedCustomer}
      />
    </div>
  )
}
