import React, { useEffect } from 'react'
import { X, Edit2, Trash2, Calendar, Clock, CreditCard, Globe, Hash, FileText } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { StatusBadge } from '../../../components/shared/StatusBadge'
import { formatDate } from '../../../utils/dateUtils'
import { formatINR } from '../../../utils/currencyUtils'
import { cn } from '../../../utils/cn'

const FREQ_LABELS = {
  WEEKLY: 'Weekly',
  BI_WEEKLY: 'Bi-Weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
}

const TYPE_LABELS = {
  USAGE_BASED: 'Usage Based',
  FIXED: 'Fixed Amount',
  WHICHEVER_IS_HIGHER: 'Whichever is Higher',
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <Icon className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
          {label}
        </div>
        <div className="text-xs text-slate-800 font-medium mt-0.5">{children}</div>
      </div>
    </div>
  )
}

export function PreferenceDetailDrawer({ preference, isOpen, onClose, onEdit, onDelete }) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[1px] transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl border-l border-slate-200 flex flex-col transition-transform duration-250 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Billing Preference Details"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Billing Preference</h2>
            {preference && (
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{preference.id}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {onEdit && preference && (
              <Button variant="outline" size="xs" icon={Edit2} onClick={() => onEdit(preference)}>
                Edit
              </Button>
            )}
            {onDelete && preference && (
              <Button
                variant="ghost"
                size="xs"
                icon={Trash2}
                className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                title="Delete preference"
                onClick={() => onDelete(preference)}
              />
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        {preference ? (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
            {/* Customer block */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-1">
                Customer
              </div>
              <div className="text-sm font-semibold text-slate-900">{preference.billToName}</div>
              <div className="flex items-center gap-2 mt-1.5">
                <StatusBadge
                  status={preference.status === 'ACTIVE' ? 'ELIGIBLE' : 'INELIGIBLE'}
                />
                <span className="text-[11px] text-slate-400">{preference.billToType}</span>
              </div>
            </div>

            {/* Detail rows */}
            <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100 px-4">
              <InfoRow icon={CreditCard} label="Billing Type">
                {TYPE_LABELS[preference.billingType] || preference.billingType}
              </InfoRow>

              {preference.fixedBillingAmount != null && (
                <InfoRow icon={Hash} label="Fixed Amount">
                  {formatINR(preference.fixedBillingAmount)}
                </InfoRow>
              )}

              <InfoRow icon={Clock} label="Billing Frequency">
                {FREQ_LABELS[preference.frequency] || preference.frequency}
              </InfoRow>

              <InfoRow icon={Calendar} label="Billing Start Date">
                {preference.anchorDate
                  ? formatDate(preference.anchorDate, 'dd MMM yyyy')
                  : '—'}
              </InfoRow>

              <InfoRow icon={Globe} label="Timezone">
                {preference.timezone || '—'}
              </InfoRow>

              <InfoRow icon={Hash} label="Credit Days">
                {preference.creditDays ?? 0} days
              </InfoRow>

              <InfoRow icon={Hash} label="Country">
                {preference.countryCode || '—'}
              </InfoRow>
            </div>

            {/* Notes */}
            {preference.notes && (
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-1.5">
                  <FileText className="h-3 w-3" />
                  Notes
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{preference.notes}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="text-[11px] text-slate-400 text-center">
              Created {preference.createdAt
                ? formatDate(preference.createdAt, 'dd MMM yyyy')
                : '—'}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
            No preference selected.
          </div>
        )}
      </aside>
    </>
  )
}

