import React, { useState, useEffect, useCallback } from 'react'
import { MockApi } from '../../services/mockApi'
import { InvoiceTable } from './components/InvoiceTable'
import { RecordPaymentModal } from './components/RecordPaymentModal'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Badge } from '../../components/ui/Badge'
import { ErrorState } from '../../components/shared/ErrorState'
import { Search } from 'lucide-react'

export function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')

  // Payment Modal state
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await MockApi.getInvoices({ search, status })
      setInvoices(data)
    } catch (err) {
      setError(err.message || 'Failed to load invoices.')
    } finally {
      setLoading(false)
    }
  }, [search, status])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const handleOpenPaymentModal = (invoice) => {
    setSelectedInvoice(invoice)
    setIsPaymentModalOpen(true)
  }

  const handleRecordPayment = async (paymentData) => {
    try {
      setActionLoading(true)
      await MockApi.recordInvoicePayment(selectedInvoice.id, paymentData)
      setIsPaymentModalOpen(false)
      setSelectedInvoice(null)
      await fetchInvoices()
    } catch (err) {
      alert(err.message || 'Payment recording failed.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleResetFilters = () => {
    setSearch('')
    setStatus('ALL')
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Tax Invoices
            </h1>
            <Badge variant="primary" size="sm">
              {invoices.length} Total
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Issued tax invoices, receivables tracking, partial payments, and collections lifecycle.
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by invoice number or customer..."
            icon={Search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 text-xs"
          />
        </div>

        <div className="w-44">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Statuses' },
              { value: 'ISSUED', label: 'Issued (Unpaid)' },
              { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
              { value: 'PAID', label: 'Paid in Full' },
              { value: 'OVERDUE', label: 'Overdue' },
            ]}
            className="h-9 text-xs"
          />
        </div>
      </div>

      {/* Table / Error */}
      {error ? (
        <ErrorState
          title="Invoices Unavailable"
          message={error}
          onRetry={fetchInvoices}
        />
      ) : (
        <InvoiceTable
          invoices={invoices}
          loading={loading}
          onOpenPaymentModal={handleOpenPaymentModal}
          onResetFilters={handleResetFilters}
        />
      )}

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false)
          setSelectedInvoice(null)
        }}
        onRecordPayment={handleRecordPayment}
        invoice={selectedInvoice}
        loading={actionLoading}
      />
    </div>
  )
}
