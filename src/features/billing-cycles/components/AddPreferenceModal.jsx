import React, { useState, useEffect } from 'react'
import { Modal } from '../../../components/ui/Modal'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Button } from '../../../components/ui/Button'
import { MockApi } from '../../../services/mockApi'

const BILLING_TYPE_OPTIONS = [
  { value: 'USAGE_BASED', label: 'Usage Based' },
  { value: 'FIXED', label: 'Fixed Amount' },
  { value: 'WHICHEVER_IS_HIGHER', label: 'Whichever is Higher' },
]

const FREQUENCY_OPTIONS = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BI_WEEKLY', label: 'Bi-Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
]

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST, UTC+5:30)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT, UTC+8:00)' },
]

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
]

const INITIAL_FORM = {
  billToId: '',
  billToName: '',
  billToType: 'CUSTOMER',
  billingType: 'USAGE_BASED',
  fixedBillingAmount: '',
  frequency: 'MONTHLY',
  anchorDate: '',
  timezone: 'Asia/Kolkata',
  creditDays: '30',
  countryCode: 'IN',
  status: 'ACTIVE',
  notes: '',
}

export function AddPreferenceModal({
  isOpen,
  onClose,
  preference,
  existingPreferences = [],
  onSuccess,
}) {
  const isEdit = !!preference
  const [form, setForm] = useState(INITIAL_FORM)
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Map of customer IDs that already have a billing preference (excluding the one being edited)
  const configuredCustomerIds = new Set(
    existingPreferences
      .filter((p) => !isEdit || p.id !== preference?.id)
      .map((p) => p.billToId)
  )

  // Populate form when editing
  useEffect(() => {
    if (isOpen) {
      if (preference) {
        setForm({
          ...INITIAL_FORM,
          ...preference,
          fixedBillingAmount: preference.fixedBillingAmount?.toString() ?? '',
          creditDays: preference.creditDays?.toString() ?? '30',
          anchorDate: preference.anchorDate ?? '',
        })
      } else {
        setForm(INITIAL_FORM)
      }
      setError('')
    }
  }, [isOpen, preference])

  // Load customers once
  useEffect(() => {
    MockApi.getCustomers().then(setCustomers).catch(() => {})
  }, [])

  const handleField = (field) => (e) => {
    const val = e.target.value
    setForm((prev) => {
      const next = { ...prev, [field]: val }
      // Auto-set countryCode & timezone based on selected customer
      if (field === 'billToId') {
        const cust = customers.find((c) => c.id === val)
        if (cust) {
          next.billToName = cust.name
          next.countryCode = cust.countryCode
          next.timezone = cust.timezone || 'Asia/Kolkata'
        }
      }
      return next
    })
  }

  const isCustomerAlreadyConfigured = !isEdit && configuredCustomerIds.has(form.billToId)

  const isValid =
    form.billToId &&
    !isCustomerAlreadyConfigured &&
    form.billingType &&
    (form.billingType === 'USAGE_BASED' || form.fixedBillingAmount !== '')

  const handleSubmit = async () => {
    if (!isValid) return
    setLoading(true)
    setError('')
    try {
      const payload = {
        ...form,
        fixedBillingAmount:
          form.billingType !== 'USAGE_BASED' && form.fixedBillingAmount !== ''
            ? Number(form.fixedBillingAmount)
            : null,
        creditDays: Number(form.creditDays || 0),
        cycleDurationDays: 0,
      }
      if (isEdit) {
        await MockApi.updateBillingPreference(preference.id, payload)
      } else {
        await MockApi.createBillingPreference(payload)
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save preference.')
    } finally {
      setLoading(false)
    }
  }

  const customerOptions = [
    { value: '', label: 'Select customer…' },
    ...customers.map((c) => {
      const alreadyHas = !isEdit && configuredCustomerIds.has(c.id)
      return {
        value: c.id,
        label: alreadyHas ? `${c.name} (Already configured)` : c.name,
        disabled: alreadyHas,
      }
    }),
  ]

  const needsFixedAmount = form.billingType !== 'USAGE_BASED'
  const allCustomersConfigured =
    !isEdit && customers.length > 0 && customers.every((c) => configuredCustomerIds.has(c.id))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Billing Preference' : 'Add Billing Preference'}
      size="md"
    >
      <div className="space-y-5 p-1">
        {allCustomersConfigured && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 leading-relaxed">
            <strong>All companies already configured.</strong> In B2B billing operations, each company has exactly one active billing configuration. To change a company's frequency or terms, click <strong>Edit</strong> on their existing preference.
          </div>
        )}

        {/* Customer */}
        <Select
          label="Customer"
          options={customerOptions}
          value={form.billToId}
          onChange={handleField('billToId')}
          disabled={isEdit}
        />

        {/* Two-column grid */}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Billing Type"
            options={BILLING_TYPE_OPTIONS}
            value={form.billingType}
            onChange={handleField('billingType')}
          />

          <Select
            label="Billing Frequency"
            options={FREQUENCY_OPTIONS}
            value={form.frequency}
            onChange={handleField('frequency')}
          />
        </div>

        {/* Fixed amount — only shown when relevant */}
        {needsFixedAmount && (
          <Input
            label="Fixed Billing Amount (₹)"
            type="number"
            placeholder="e.g. 150000"
            value={form.fixedBillingAmount}
            onChange={handleField('fixedBillingAmount')}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Billing Start Date
            </label>
            <input
              type="date"
              value={form.anchorDate}
              onChange={handleField('anchorDate')}
              className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <Input
            label="Credit Days"
            type="number"
            placeholder="30"
            value={form.creditDays}
            onChange={handleField('creditDays')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Timezone"
            options={TIMEZONE_OPTIONS}
            value={form.timezone}
            onChange={handleField('timezone')}
          />

          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={handleField('status')}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Notes <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={form.notes}
            onChange={handleField('notes')}
            rows={2}
            placeholder="Any internal notes about this billing arrangement…"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            loading={loading}
            disabled={!isValid}
          >
            {isEdit ? 'Save Changes' : 'Create Preference'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

