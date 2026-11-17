import React from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { formatINR } from '../../../utils/currencyUtils'
import { TIMEZONE_LABELS } from '../../../utils/dateUtils'
import { Mail, Phone } from 'lucide-react'

export function CustomerModal({ isOpen, onClose, customer }) {
  if (!customer) return null

  const tzLabel = TIMEZONE_LABELS[customer.timezone] || customer.timezone

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer.name}
      description={`Customer Account Code: ${customer.code}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-5 text-xs text-slate-700">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary" size="sm">
            {customer.billingFrequency} Frequency
          </Badge>
          <Badge variant="success" size="sm">
            {customer.billingStatus}
          </Badge>
          <Badge variant="neutral" size="sm">
            {customer.industry}
          </Badge>
        </div>

        {/* Configuration Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div>
            <span className="text-slate-600 block font-medium">Billing Timezone</span>
            <div className="font-semibold text-slate-900 mt-0.5">{tzLabel}</div>
            <span className="text-[11px] text-slate-600 font-medium">
              {customer.timezone}
            </span>
          </div>

          <div>
            <span className="text-slate-600 block font-medium">GSTIN / Tax ID</span>
            <div className="font-mono font-bold text-slate-900 mt-0.5">
              {customer.gstin}
            </div>
            <span className="text-[11px] text-slate-600 font-medium">
              Jurisdiction: {customer.state || customer.countryCode}
            </span>
          </div>

          <div>
            <span className="text-slate-600 block font-medium">Standard Payment Terms</span>
            <div className="font-semibold text-slate-900 mt-0.5">
              {customer.paymentTerms ? customer.paymentTerms.replace('_', ' ') : 'NET 30'}
            </div>
            <span className="text-[11px] text-slate-600 font-medium">
              Commercial invoice default
            </span>
          </div>

          <div>
            <span className="text-slate-600 block font-medium">Approved Credit Limit</span>
            <div className="font-mono font-bold text-slate-900 mt-0.5">
              {formatINR(customer.creditLimit || 0)}
            </div>
            <span className="text-[11px] text-slate-600 font-medium">
              Corporate account revolving
            </span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 border-t border-slate-100 pt-3">
          <h4 className="font-semibold text-slate-800">Operational & Accounts Payable Contact</h4>
          <div className="space-y-1 text-slate-600">
            <p className="font-medium text-slate-900">{customer.contactPerson}</p>
            <div className="flex items-center gap-2 text-slate-500">
              <Mail className="h-3.5 w-3.5" />
              <span>{customer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Phone className="h-3.5 w-3.5" />
              <span>{customer.phone}</span>
            </div>
            <p className="pt-1 text-slate-500">
              {customer.address}, {customer.city}, {customer.state} {customer.postalCode}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
