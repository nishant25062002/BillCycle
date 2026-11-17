import React from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { formatINR } from '../../../utils/currencyUtils'
import { Lock, AlertTriangle } from 'lucide-react'

export function CloseCycleModal({
  isOpen,
  onClose,
  onConfirmClose,
  cycle,
  financials,
  loading = false,
}) {
  if (!cycle) return null

  const customer = cycle.customer || {}

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      title="Close & Lock Billing Cycle"
      description="Closing this billing cycle approves its billable deliveries and prepares it for invoice generation."
    >
      <div className="space-y-4 text-xs">
        {/* Warning Banner */}
        <div className="p-3.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold block">Audit & Immutability Notice:</span>
            <p className="leading-snug">
              Closing locks all shipment line items and exclusions from further editing. Once closed, you can issue the final tax invoice.
            </p>
          </div>
        </div>

        {/* Cycle Summary Box */}
        <div className="rounded-lg bg-slate-50 p-4 border border-slate-200/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Customer:</span>
            <span className="font-semibold text-slate-900">{customer.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Cycle Reference:</span>
            <span className="font-mono font-medium text-slate-800">{cycle.cycleNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Locked Deliveries:</span>
            <span className="font-medium text-slate-800">
              {financials?.eligibleItemsCount || 0} eligible shipments
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="font-semibold text-slate-700">Total Approved Amount:</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {formatINR(financials?.grandTotal || 0)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Lock}
            onClick={onConfirmClose}
            loading={loading}
          >
            Confirm & Lock Cycle
          </Button>
        </div>
      </div>
    </Modal>
  )
}
