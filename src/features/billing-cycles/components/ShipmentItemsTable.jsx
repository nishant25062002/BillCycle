import React from 'react'
import { StatusBadge } from '../../../components/shared/StatusBadge'
import { formatINR } from '../../../utils/currencyUtils'
import { formatDate } from '../../../utils/dateUtils'
import { AlertCircle } from 'lucide-react'

// Helper to extract clean city name from full address string
function getCityFromAddress(addr = '') {
  // If format has city before state like "Apex Formulation Unit, Pune (MH)" -> "Pune"
  // If format is "Bengaluru Pharma Hub, Electronic City (KA)" -> "Bengaluru"
  const parts = addr.split(',')
  if (parts.length > 1) {
    // Check if middle or last part has city
    const candidate = parts[parts.length - 1].replace(/\s*\([A-Z]{2}\)/, '').trim()
    if (candidate.length < 15 && candidate.length > 2) return candidate
    const secondCandidate = parts[parts.length - 2].trim()
    if (secondCandidate.length < 15) return secondCandidate
  }
  return addr.split('(')[0].trim().slice(0, 16)
}

export function ShipmentItemsTable({
  items = [],
  isCycleLocked = false,
  onToggleInclusion,
}) {
  const eligibleCount = items.filter((i) => i.status === 'ELIGIBLE' && i.isIncluded !== false).length

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-xs">
      {/* Table Header Strip */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Billable Shipments
          </h3>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            Completed deliveries in this cycle's settlement window.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80">
          {eligibleCount} of {items.length} included
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 w-12 text-center">Include</th>
              <th className="py-3 px-4">Waybill & Date</th>
              <th className="py-3 px-4">Route</th>
              <th className="py-3 px-4">Service</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const isEligible = item.status === 'ELIGIBLE'
              const isIncluded = item.isIncluded !== false
              const netAmount =
                Number(item.amount || 0) +
                Number(item.fuelSurcharge || 0) +
                Number(item.addOns || 0) -
                Number(item.discount || 0)

              const originCity = getCityFromAddress(item.origin)
              const destCity = getCityFromAddress(item.destination)

              return (
                <tr
                  key={item.id}
                  className={`transition-colors ${
                    !isIncluded || !isEligible
                      ? 'bg-slate-50/50 opacity-60'
                      : 'hover:bg-slate-50/80'
                  }`}
                >
                  {/* Inclusion Checkbox */}
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isIncluded && isEligible}
                      disabled={isCycleLocked || !isEligible}
                      onChange={(e) => onToggleInclusion?.(item.id, e.target.checked)}
                      title={
                        isCycleLocked
                          ? 'Cycle is locked. Items cannot be changed.'
                          : !isEligible
                          ? 'Item is ineligible for billing.'
                          : 'Toggle inclusion in cycle'
                      }
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </td>

                  {/* Waybill & Date */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-slate-900">
                      {item.trackingNumber}
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Delivered {formatDate(item.completedAt, 'dd MMM yyyy')}
                    </div>
                  </td>

                  {/* Route (Clean City -> City) */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-medium text-slate-900">
                      {originCity} <span className="text-slate-400 mx-1">→</span> {destCity}
                    </div>
                    {item.weightKg && (
                      <div className="text-xs text-slate-500 font-medium mt-0.5">
                        {(item.weightKg / 1000).toFixed(1)} tons
                      </div>
                    )}
                  </td>

                  {/* Service */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-900">
                      {item.serviceType?.split('(')[0].trim() || item.serviceType}
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      {item.vehicleType?.split(' ')[0]} {item.vehicleType?.split(' ')[1] || ''}
                    </div>
                  </td>

                  {/* Net Amount */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="font-bold text-slate-900 font-mono text-sm">
                      {formatINR(netAmount)}
                    </div>
                    {(item.fuelSurcharge > 0 || item.addOns > 0) && (
                      <div className="text-[11px] text-slate-500 font-medium">
                        Base: {formatINR(item.amount)}
                      </div>
                    )}
                  </td>

                  {/* Eligibility */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {!isEligible ? (
                      <StatusBadge status="INELIGIBLE" size="sm" />
                    ) : !isIncluded ? (
                      <StatusBadge status="EXCLUDED" size="sm" />
                    ) : (
                      <StatusBadge status="ELIGIBLE" size="sm" />
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {isCycleLocked && (
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-slate-500" />
          <span>
            This billing cycle is locked. Shipment inclusions and exclusions cannot be modified.
          </span>
        </div>
      )}
    </div>
  )
}
