import { useState, useEffect } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Button } from '../../../components/ui/Button'
import { formatINR } from '../../../utils/currencyUtils'
import { IndianRupee } from 'lucide-react'

export function RecordPaymentModal({
  isOpen,
  onClose,
  onRecordPayment,
  invoice,
  loading = false,
}) {
  const remaining = Number(invoice?.remainingBalance || 0)
  const [amount, setAmount] = useState(String(remaining))
  const [method, setMethod] = useState('RTGS')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (invoice) {
      setAmount(String(invoice.remainingBalance || 0))
      setError('')
    }
  }, [invoice])

  if (!invoice) return null

  const handlePayFull = () => {
    setAmount(String(remaining))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const num = Number(amount)
    if (isNaN(num) || num <= 0) {
      setError('Payment amount must be greater than zero.')
      return
    }
    if (num > remaining + 0.01) {
      setError(`Payment cannot exceed remaining balance of ${formatINR(remaining)}.`)
      return
    }

    onRecordPayment({
      amount: num,
      method,
      reference: reference.trim() || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      paidAt: new Date().toISOString(),
      notes: notes.trim(),
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      title="Record Payment"
      description={`Record an incoming remittance for invoice ${invoice.invoiceNumber}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Outstanding Balance Banner */}
        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-slate-500 block">Remaining Balance Due</span>
            <span className="text-base font-bold font-mono text-slate-900">
              {formatINR(remaining)}
            </span>
          </div>
          <button
            type="button"
            onClick={handlePayFull}
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
          >
            Pay Full Balance
          </button>
        </div>

        <div>
          <Input
            label="Payment Amount (INR ₹)"
            type="number"
            step="any"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setError('')
            }}
            error={error}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Select
              label="Payment Method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              options={[
                { value: 'RTGS', label: 'RTGS (Real Time Gross Settlement)' },
                { value: 'NEFT', label: 'NEFT (National Electronic Fund)' },
                { value: 'TELEGRAPHIC_TRANSFER', label: 'Wire / Telegraphic Transfer' },
                { value: 'UPI', label: 'Corporate UPI' },
                { value: 'CORPORATE_CARD', label: 'Corporate Credit Card' },
              ]}
            />
          </div>

          <div>
            <Input
              label="UTR / Transaction Reference No."
              placeholder="e.g. HDFC00918204"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Internal Settlement Notes
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Client remittance advice received via email from AP controller"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
          />
        </div>

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
            type="submit"
            variant="primary"
            size="sm"
            icon={IndianRupee}
            loading={loading}
          >
            Record Payment
          </Button>
        </div>
      </form>
    </Modal>
  )
}
