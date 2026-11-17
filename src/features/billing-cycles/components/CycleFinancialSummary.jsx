import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { formatINR } from '../../../utils/currencyUtils'
import { Plus, Trash2, Calculator, ShieldCheck } from 'lucide-react'

export function CycleFinancialSummary({
  financials,
  adjustments = [],
  customer: _customer = {},
  isCycleLocked = false,
  onOpenAdjustmentModal,
  onDeleteAdjustment,
  onRecalculate,
  recalculating = false,
}) {
  const {
    shipmentsSubtotal = 0,
    adjustmentsTotal = 0,
    taxableAmount = 0,
    taxes = [],
    totalTax: _totalTax = 0,
    grandTotal = 0,
    isIntraState,
    isInterState,
    isInternational,
  } = financials || {}

  return (
    <Card className="h-full flex flex-col shadow-xs border border-slate-200/90">
      <CardHeader className="py-3.5 px-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-indigo-600" />
          <CardTitle className="text-sm font-semibold text-slate-900">Financial Summary</CardTitle>
        </div>
        <Button
          variant="outline"
          size="xs"
          onClick={onRecalculate}
          loading={recalculating}
          title="Recalculate totals"
        >
          Recalculate
        </Button>
      </CardHeader>

      <CardContent className="p-4 space-y-4 text-xs flex-1">
        {/* Tax Jurisdiction */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
            <span>Jurisdiction</span>
          </div>
          {isIntraState && (
            <Badge variant="success" size="sm">
              Intra-State (CGST+SGST 18%)
            </Badge>
          )}
          {isInterState && (
            <Badge variant="purple" size="sm">
              Inter-State (IGST 18%)
            </Badge>
          )}
          {isInternational && (
            <Badge variant="info" size="sm">
              Cross-Border (GST 9%)
            </Badge>
          )}
        </div>

        {/* Financial Rows */}
        <div className="space-y-2.5 pt-1">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-slate-700 font-medium">
            <span>Shipments Subtotal</span>
            <span className="font-mono font-semibold text-slate-900">
              {formatINR(shipmentsSubtotal)}
            </span>
          </div>

          {/* Adjustments */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-800">
                Adjustments
              </span>
              {!isCycleLocked && (
                <button
                  type="button"
                  onClick={onOpenAdjustmentModal}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add</span>
                </button>
              )}
            </div>

            {adjustments.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-0.5">
                No adjustments applied.
              </p>
            ) : (
              <div className="space-y-1.5 my-2">
                {adjustments.map((adj) => (
                  <div
                    key={adj.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-xs"
                  >
                    <div className="truncate pr-2">
                      <div className="font-medium text-slate-900 truncate">
                        {adj.title}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`font-mono font-semibold ${
                          adj.type === 'CREDIT' ? 'text-emerald-700' : 'text-slate-900'
                        }`}
                      >
                        {adj.type === 'CREDIT' ? '-' : '+'}
                        {formatINR(adj.amount)}
                      </span>
                      {!isCycleLocked && (
                        <button
                          type="button"
                          onClick={() => onDeleteAdjustment(adj.id)}
                          className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors"
                          title="Remove adjustment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {adjustments.length > 0 && (
              <div className="flex items-center justify-between text-slate-600 pt-1 text-xs font-medium">
                <span>Net Adjustments</span>
                <span className="font-mono font-semibold text-slate-900">
                  {adjustmentsTotal < 0 ? '-' : '+'}
                  {formatINR(Math.abs(adjustmentsTotal))}
                </span>
              </div>
            )}
          </div>

          {/* Taxable Amount */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-semibold text-slate-800">
            <span>Taxable Amount</span>
            <span className="font-mono text-slate-900">{formatINR(taxableAmount)}</span>
          </div>

          {/* Taxes */}
          <div className="space-y-1.5 pt-1">
            {taxes.map((t) => (
              <div
                key={t.code}
                className="flex items-center justify-between text-slate-600 text-xs font-medium"
              >
                <span>
                  {t.name} ({t.rate}%)
                </span>
                <span className="font-mono font-semibold text-slate-800">
                  {formatINR(t.amount)}
                </span>
              </div>
            ))}
          </div>

          {/* Grand Total */}
          <div className="flex items-baseline justify-between pt-3 border-t-2 border-slate-200">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Total Billable
              </div>
            </div>
            <div className="font-mono text-xl font-bold text-slate-900">
              {formatINR(grandTotal)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
