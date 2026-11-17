import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MockApi } from '../../services/mockApi'
import { InvoiceDocument } from './components/InvoiceDocument'
import { RecordPaymentModal } from './components/RecordPaymentModal'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/shared/ErrorState'
import {
  ArrowLeft,
  Printer,
  IndianRupee,
  Download,
  CheckCircle2,
  Layers,
} from 'lucide-react'

export function InvoiceDetailPage() {
  const { invoiceId } = useParams()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await MockApi.getInvoiceById(invoiceId)
      setInvoice(data)
    } catch (err) {
      setError(err.message || 'Failed to retrieve invoice.')
    } finally {
      setLoading(false)
    }
  }, [invoiceId])

  useEffect(() => {
    fetchInvoice()
  }, [fetchInvoice])

  const handlePrint = () => {
    window.print()
  }

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(invoice, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `${invoice.invoiceNumber}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const handleRecordPayment = async (paymentData) => {
    try {
      setActionLoading(true)
      await MockApi.recordInvoicePayment(invoice.id, paymentData)
      setIsPaymentModalOpen(false)
      const refreshed = await MockApi.getInvoiceById(invoice.id)
      setInvoice(refreshed)
      setSuccessMessage('Payment remittance recorded successfully.')
      setTimeout(() => setSuccessMessage(null), 4000)
    } catch (err) {
      alert(err.message || 'Payment recording failed.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-[600px] w-full rounded-xl" />
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="py-8">
        <ErrorState
          title="Invoice Not Found"
          message={error || 'Invoice could not be loaded.'}
          onRetry={fetchInvoice}
        />
      </div>
    )
  }

  const isFullyPaid = invoice.status === 'PAID'

  return (
    <div className="space-y-6">
      {/* Top Action Bar (Hidden during print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/invoices"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Invoices</span>
          </Link>
          {invoice.cycleId && (
            <>
              <span className="text-slate-300">|</span>
              <Link
                to={`/cycles/${invoice.cycleId}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>View Source Cycle</span>
              </Link>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportJSON}
          >
            Export JSON
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
          >
            Print Invoice
          </Button>

          {!isFullyPaid && (
            <Button
              variant="primary"
              size="sm"
              icon={IndianRupee}
              onClick={() => setIsPaymentModalOpen(true)}
            >
              Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="no-print p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Printable Invoice Document */}
      <InvoiceDocument invoice={invoice} />

      {/* Payment Modal */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onRecordPayment={handleRecordPayment}
        invoice={invoice}
        loading={actionLoading}
      />
    </div>
  )
}
