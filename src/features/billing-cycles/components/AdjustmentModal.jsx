import React, { useState } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Button } from '../../../components/ui/Button'

export function AdjustmentModal({ isOpen, onClose, onAddAdjustment, loading = false }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('CREDIT')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState({})

  const validate = () => {
    const errs = {}
    if (!title.trim()) errs.title = 'Title is required'
    const num = Number(amount)
    if (isNaN(num) || num <= 0) errs.amount = 'Amount must be greater than zero'
    if (!reason.trim()) errs.reason = 'Audit reason or SLA reference is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    onAddAdjustment({
      title: title.trim(),
      type,
      amount: Number(amount),
      reason: reason.trim(),
    })

    // Reset
    setTitle('')
    setType('CREDIT')
    setAmount('')
    setReason('')
    setErrors({})
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      title="Add Billing Adjustment"
      description="Record a manual credit rebate or ancillary operational charge to this cycle."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            label="Adjustment Title / Description"
            placeholder="e.g. Diesel Index Price Rebate"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Select
              label="Adjustment Type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={[
                { value: 'CREDIT', label: 'Credit / Rebate (Deduction -)' },
                { value: 'CHARGE', label: 'Charge / Surcharge (Addition +)' },
              ]}
            />
          </div>

          <div>
            <Input
              label="Amount (INR ₹)"
              type="number"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={errors.amount}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Operational Audit Reason / Contract Reference
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Volume discount tier 2 agreement or demurrage fee waiver approved by Ops Lead"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
          />
          {errors.reason && (
            <p className="mt-1 text-xs text-rose-600 font-medium">{errors.reason}</p>
          )}
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
            loading={loading}
          >
            Apply Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  )
}

