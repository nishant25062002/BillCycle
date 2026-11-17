import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MockApi } from '../../services/mockApi'
import { ShipmentItemsTable } from './components/ShipmentItemsTable'
import { CycleFinancialSummary } from './components/CycleFinancialSummary'
import { AdjustmentModal } from './components/AdjustmentModal'
import { CloseCycleModal } from './components/CloseCycleModal'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { ErrorState } from '../../components/shared/ErrorState'
import { formatDate, TIMEZONE_LABELS } from '../../utils/dateUtils'
import {
  ArrowLeft,
  FileText,
  Lock,
  Plus,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'

export function CycleDetailPage() {
  const { cycleId } = useParams()
  const navigate = useNavigate()

  const [cycle, setCycle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionSuccessMessage, setActionSuccessMessage] = useState(null)

  // Modals state
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [recalculating, setRecalculating] = useState(false)

  const fetchCycleData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await MockApi.getBillingCycleById(cycleId)
      setCycle(data)
    } catch (err) {
      setError(err.message || 'Failed to load billing cycle.')
    } finally {
      setLoading(false)
    }
  }, [cycleId])

  useEffect(() => {
    fetchCycleData()
  }, [fetchCycleData])

  // Item inclusion toggle
  const handleToggleItem = async (itemId, isIncluded) => {
    try {
      await MockApi.toggleItemInclusion(cycle.id, itemId, isIncluded)
      // Refresh cycle calculations
      const updated = await MockApi.getBillingCycleById(cycleId)
      setCycle(updated)
    } catch (err) {
      alert(err.message || 'Failed to update item inclusion.')
    }
  }

  // Add adjustment
  const handleAddAdjustment = async (adjustmentData) => {
    try {
      setActionLoading(true)
      await MockApi.addCycleAdjustment(cycle.id, adjustmentData)
      setIsAdjustmentModalOpen(false)
      const updated = await MockApi.getBillingCycleById(cycleId)
      setCycle(updated)
      setActionSuccessMessage('Adjustment applied to cycle successfully.')
      setTimeout(() => setActionSuccessMessage(null), 4000)
    } catch (err) {
      alert(err.message || 'Failed to add adjustment.')
    } finally {
      setActionLoading(false)
    }
  }

  // Delete adjustment
  const handleDeleteAdjustment = async (adjId) => {
    if (!window.confirm('Remove this manual adjustment?')) return
    try {
      await MockApi.deleteCycleAdjustment(cycle.id, adjId)
      const updated = await MockApi.getBillingCycleById(cycleId)
      setCycle(updated)
    } catch (err) {
      alert(err.message || 'Failed to remove adjustment.')
    }
  }

  // Close cycle
  const handleCloseCycle = async () => {
    try {
      setActionLoading(true)
      await MockApi.closeBillingCycle(cycle.id)
      setIsCloseModalOpen(false)
      const refreshed = await MockApi.getBillingCycleById(cycle.id)
      setCycle(refreshed)
      setActionSuccessMessage('Billing cycle successfully closed and locked.')
      setTimeout(() => setActionSuccessMessage(null), 4000)
    } catch (err) {
      alert(err.message || 'Failed to close billing cycle.')
    } finally {
      setActionLoading(false)
    }
  }

  // Generate invoice
  const handleGenerateInvoice = async () => {
    try {
      setActionLoading(true)
      const newInvoice = await MockApi.generateInvoiceForCycle(cycle.id)
      const refreshed = await MockApi.getBillingCycleById(cycle.id)
      setCycle(refreshed)
      setActionSuccessMessage(`Invoice ${newInvoice.invoiceNumber} generated successfully!`)
      setTimeout(() => {
        navigate(`/invoices/${newInvoice.id}`)
      }, 1200)
    } catch (err) {
      alert(err.message || 'Failed to generate invoice.')
    } finally {
      setActionLoading(false)
    }
  }

  // Manual recalculation trigger
  const handleRecalculate = async () => {
    setRecalculating(true)
    const refreshed = await MockApi.getBillingCycleById(cycle.id)
    setCycle(refreshed)
    setTimeout(() => setRecalculating(false), 300)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !cycle) {
    return (
      <div className="py-8">
        <ErrorState
          title="Cycle Not Available"
          message={error || 'Billing cycle could not be retrieved.'}
          onRetry={fetchCycleData}
        />
      </div>
    )
  }

  const customer = cycle.customer || {}
  const financials = cycle.financials || {}
  const isCycleLocked = cycle.status === 'CLOSED' || cycle.status === 'INVOICED'
  const isClosed = cycle.status === 'CLOSED'
  const isInvoiced = cycle.status === 'INVOICED'
  const tzLabel = TIMEZONE_LABELS[cycle.timezone] || cycle.timezone

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          to="/cycles"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Billing Cycles</span>
        </Link>
      </div>

      {/* Success Banner */}
      {actionSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="font-semibold">{actionSuccessMessage}</span>
          </div>
          {isInvoiced && cycle.invoiceId && (
            <Link
              to={`/invoices/${cycle.invoiceId}`}
              className="font-bold underline hover:text-emerald-900"
            >
              View Generated Invoice →
            </Link>
          )}
        </div>
      )}

      {/* Header & Status Bar */}
      <Card className="shadow-xs overflow-hidden">
        <div className="p-5 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {customer.name}
              </h1>
              <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {cycle.cycleNumber}
              </span>
              <StatusBadge status={cycle.status} />
              <Badge variant="neutral" size="sm">
                {cycle.frequency}
              </Badge>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium flex-wrap">
              <span>{formatDate(cycle.startAt, 'dd MMM')} – {formatDate(cycle.endAt, 'dd MMM yyyy')}</span>
              <span>•</span>
              <span>{customer.paymentTerms ? customer.paymentTerms.replace('_', ' ') : 'NET 30'}</span>
              <span>•</span>
              <span>{customer.gstin ? `GST: ${customer.gstin}` : `Jurisdiction: ${customer.countryCode}`}</span>
              <span>•</span>
              <span>{tzLabel}</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {!isCycleLocked && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  onClick={() => setIsAdjustmentModalOpen(true)}
                >
                  Add Adjustment
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Lock}
                  onClick={() => setIsCloseModalOpen(true)}
                >
                  Close Billing Cycle
                </Button>
              </>
            )}

            {isClosed && !isInvoiced && (
              <Button
                variant="primary"
                size="sm"
                icon={FileText}
                iconRight={ArrowRight}
                onClick={handleGenerateInvoice}
                loading={actionLoading}
              >
                Generate Tax Invoice
              </Button>
            )}

            {isInvoiced && cycle.invoiceId && (
              <Link to={`/invoices/${cycle.invoiceId}`}>
                <Button
                  variant="primary"
                  size="sm"
                  icon={FileText}
                  iconRight={ExternalLink}
                >
                  View Invoice ({cycle.invoiceNumber})
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>
      {/* Main Grid: Shipments Table + Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Shipment Items */}
        <div className="lg:col-span-2 space-y-4">
          <ShipmentItemsTable
            items={cycle.items || []}
            isCycleLocked={isCycleLocked}
            onToggleInclusion={handleToggleItem}
          />
        </div>

        {/* Right Column: Financial Summary Card */}
        <div className="lg:col-span-1 sticky top-20">
          <CycleFinancialSummary
            financials={financials}
            adjustments={cycle.adjustments || []}
            customer={customer}
            isCycleLocked={isCycleLocked}
            onOpenAdjustmentModal={() => setIsAdjustmentModalOpen(true)}
            onDeleteAdjustment={handleDeleteAdjustment}
            onRecalculate={handleRecalculate}
            recalculating={recalculating}
          />
        </div>
      </div>

      {/* Modals */}
      <AdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        onAddAdjustment={handleAddAdjustment}
        loading={actionLoading}
      />

      <CloseCycleModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        onConfirmClose={handleCloseCycle}
        cycle={cycle}
        financials={financials}
        loading={actionLoading}
      />
    </div>
  )
}
