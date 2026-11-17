import React from 'react'
import { SELLER_PROFILE } from '../../../utils/taxCalculations'
import { formatINR } from '../../../utils/currencyUtils'
import { formatDate } from '../../../utils/dateUtils'
import { StatusBadge } from '../../../components/shared/StatusBadge'
import { Badge } from '../../../components/ui/Badge'
import { Boxes } from 'lucide-react'

export function InvoiceDocument({ invoice }) {
  if (!invoice) return null

  const customer = invoice.customer || {}
  const cycle = invoice.cycle || {}
  const items = invoice.items || []
  const payments = invoice.payments || []

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden print:border-none print:shadow-none p-6 sm:p-10 space-y-8 text-xs text-slate-700">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                Bill<span className="text-indigo-600">Cycle</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Logistics Operations</span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 max-w-sm space-y-0.5">
            <p className="font-semibold text-slate-800">{SELLER_PROFILE.name}</p>
            <p>{SELLER_PROFILE.address}</p>
            <p>
              GSTIN: <span className="font-mono font-medium text-slate-700">{SELLER_PROFILE.gstin}</span> | PAN: <span className="font-mono text-slate-700">{SELLER_PROFILE.pan}</span>
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right space-y-1.5">
          <div className="inline-block">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              Original Tax Invoice
            </span>
          </div>
          <h2 className="text-2xl font-bold font-mono text-slate-900">
            {invoice.invoiceNumber}
          </h2>
          <div className="flex items-center sm:justify-end gap-2 pt-1">
            <StatusBadge status={invoice.status} size="md" />
          </div>
        </div>
      </div>

      {/* Meta Grid: Bill To, Dates, Terms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 rounded-xl bg-slate-50/70 border border-slate-200">
        {/* Bill To */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
            Billed To Customer
          </span>
          <p className="font-bold text-slate-900 text-sm">{customer.name}</p>
          <p className="text-[11px] text-slate-600">{customer.address}, {customer.city}, {customer.state}</p>
          <p className="text-[11px] text-slate-700 pt-1">
            {customer.countryCode === 'SG' ? 'UEN' : 'GSTIN'}:{' '}
            <span className="font-mono font-semibold text-slate-900">{customer.gstin || 'N/A'}</span>
          </p>
          <p className="text-[11px] text-slate-600">
            State Code: <span className="font-medium text-slate-700">{customer.state || 'N/A'}</span>
          </p>
        </div>

        {/* Invoice Dates */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
            Invoice Dates & Terms
          </span>
          <div className="flex justify-between">
            <span className="text-slate-600">Issue Date:</span>
            <span className="font-semibold text-slate-800">
              {formatDate(invoice.issueDate, 'dd MMM yyyy')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Payment Due Date:</span>
            <span className="font-semibold text-slate-900">
              {formatDate(invoice.dueDate, 'dd MMM yyyy')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Credit Terms:</span>
            <span className="font-semibold text-indigo-700">
              {invoice.paymentTerms ? invoice.paymentTerms.replace('_', ' ') : 'NET 30'}
            </span>
          </div>
        </div>

        {/* Cycle & Place of Supply */}
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
            Billing Context
          </span>
          <div className="flex justify-between">
            <span className="text-slate-600">Billing Cycle:</span>
            <span className="font-mono font-medium text-slate-800">
              {cycle.cycleNumber || 'CYC-2026'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Period:</span>
            <span className="font-medium text-slate-800">
              {cycle.periodName || 'Monthly Settlement'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Place of Supply:</span>
            <span className="font-semibold text-slate-900">
              {customer.state || customer.countryCode}
            </span>
          </div>
        </div>
      </div>

      {/* Itemized Deliveries Table */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
          Itemized Deliveries & Transportation Charges
        </h3>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Waybill Reference</th>
                <th className="py-2.5 px-3">Service & Route</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Base Rate</th>
                <th className="py-2.5 px-3 text-right">Fuel & Addons</th>
                <th className="py-2.5 px-3 text-right">Taxable Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-slate-500">
                    Deliveries consolidated from approved billing cycle {cycle.cycleNumber}.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const net =
                    Number(item.amount || 0) +
                    Number(item.fuelSurcharge || 0) +
                    Number(item.addOns || 0) -
                    Number(item.discount || 0)
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 text-slate-500 font-medium">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono font-medium text-slate-900">
                        {item.trackingNumber}
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-medium text-slate-800">{item.serviceType}</span>
                        <span className="text-[11px] text-slate-600 block">
                          {item.origin} → {item.destination}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600 whitespace-nowrap">
                        {formatDate(item.completedAt, 'dd MMM yyyy')}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {formatINR(item.amount)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">
                        +{formatINR(Number(item.fuelSurcharge || 0) + Number(item.addOns || 0))}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        {formatINR(net)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financials & Tax Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Bank & Remittance Instructions */}
        <div className="space-y-3">
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-200/80 space-y-2">
            <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
              Remittance & Bank Details
            </span>
            <div className="space-y-1 text-slate-600">
              <p>Bank: <span className="font-semibold text-slate-800">{SELLER_PROFILE.bankName}</span></p>
              <p>Account No: <span className="font-mono font-semibold text-slate-900">{SELLER_PROFILE.accountNumber}</span></p>
              <p>IFSC Code: <span className="font-mono text-slate-800">{SELLER_PROFILE.ifscCode}</span></p>
              <p>SWIFT Code: <span className="font-mono text-slate-800">{SELLER_PROFILE.swiftCode}</span></p>
              <p className="text-[11px] text-slate-600 pt-1">
                Please quote invoice number <span className="font-mono font-semibold text-slate-900">{invoice.invoiceNumber}</span> in wire transfer remarks.
              </p>
            </div>
          </div>
        </div>

        {/* Totals & Tax Calculation Breakdown */}
        <div className="rounded-lg bg-slate-50 p-4 border border-slate-200/80 space-y-2.5">
          <div className="flex justify-between text-slate-600">
            <span>Deliveries Subtotal:</span>
            <span className="font-mono font-semibold text-slate-800">
              {formatINR(invoice.subtotal)}
            </span>
          </div>

          {invoice.adjustmentsTotal !== 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Adjustments & Rebates:</span>
              <span className="font-mono font-semibold text-slate-800">
                {invoice.adjustmentsTotal < 0 ? '-' : '+'}
                {formatINR(Math.abs(invoice.adjustmentsTotal))}
              </span>
            </div>
          )}

          <div className="flex justify-between font-semibold text-slate-800 pt-1 border-t border-slate-200">
            <span>Taxable Amount (SAC 9965):</span>
            <span className="font-mono">{formatINR(invoice.taxableAmount)}</span>
          </div>

          {/* Tax breakdown */}
          <div className="space-y-1">
            {(invoice.taxes || []).map((t) => (
              <div key={t.code} className="flex justify-between text-slate-500 text-[11px]">
                <span>{t.name} ({t.rate}%):</span>
                <span className="font-mono font-medium text-slate-700">{formatINR(t.amount)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t-2 border-slate-300">
            <span>Grand Total:</span>
            <span className="font-mono text-base">{formatINR(invoice.grandTotal)}</span>
          </div>

          <div className="flex justify-between text-emerald-700 font-semibold pt-1">
            <span>Amount Paid:</span>
            <span className="font-mono">-{formatINR(invoice.paidAmount || 0)}</span>
          </div>

          <div className="flex justify-between font-bold text-base text-indigo-900 pt-2 border-t border-slate-200 bg-white p-2.5 rounded border">
            <span>Balance Due:</span>
            <span className="font-mono text-indigo-700">
              {formatINR(invoice.remainingBalance || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment History Audit */}
      {payments.length > 0 && (
        <div className="space-y-2 pt-2">
          <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Recorded Remittances & Settlements
          </h3>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Receipt ID</th>
                  <th className="py-2 px-3">Payment Date</th>
                  <th className="py-2 px-3">Method</th>
                  <th className="py-2 px-3">Bank Reference / UTR</th>
                  <th className="py-2 px-3 text-right">Amount Settled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-mono font-medium text-slate-800">
                      {p.paymentNumber}
                    </td>
                    <td className="py-2 px-3 text-slate-600">
                      {formatDate(p.paidAt, 'dd MMM yyyy, HH:mm')}
                    </td>
                    <td className="py-2 px-3">
                      <Badge variant="neutral" size="sm">{p.method}</Badge>
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-600">
                      {p.reference}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-600">
                      {formatINR(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Signature & Legal Footer */}
      <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6 text-[11px] text-slate-600">
        <div>
          <p className="font-semibold text-slate-800">Declaration:</p>
          <p className="max-w-md mt-0.5 text-slate-600">
            This is a computer-generated tax invoice issued in accordance with applicable goods and services tax regulations. No physical signature required.
          </p>
        </div>
        <div className="text-right">
          <div className="font-semibold text-slate-900">For BillCycle Logistics Pvt. Ltd.</div>
          <div className="h-10"></div>
          <div className="text-slate-600 border-t border-slate-300 pt-1 font-medium">
            Authorized Financial Officer
          </div>
        </div>
      </div>
    </div>
  )
}
