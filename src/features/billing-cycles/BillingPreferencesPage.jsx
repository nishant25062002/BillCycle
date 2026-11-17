import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { MockApi } from '../../services/mockApi'
import { DataTable } from '../../components/ui/DataTable'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/shared/EmptyState'
import { ErrorState } from '../../components/shared/ErrorState'
import { AddPreferenceModal } from './components/AddPreferenceModal'
import { PreferenceDetailDrawer } from './components/PreferenceDetailDrawer'
import { formatINR } from '../../utils/currencyUtils'

const TYPE_LABELS = {
  USAGE_BASED: 'Usage Based',
  FIXED: 'Fixed Amount',
  WHICHEVER_IS_HIGHER: 'Whichever is Higher',
}

const FREQ_LABELS = {
  WEEKLY: 'Weekly',
  BI_WEEKLY: 'Bi-Weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
}

function buildColumns(onEdit, onDelete) {
  return [
    {
      key: 'customer',
      header: 'Customer',
      render: (p) => (
        <div>
          <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {p.billToName}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{p.id}</div>
        </div>
      ),
    },
    {
      key: 'billingType',
      header: 'Billing Type',
      render: (p) => (
        <Badge variant="neutral" size="sm">
          {TYPE_LABELS[p.billingType] || p.billingType}
        </Badge>
      ),
    },
    {
      key: 'fixedAmount',
      header: 'Fixed Amount',
      align: 'right',
      render: (p) =>
        p.fixedBillingAmount != null ? (
          <span className="font-mono text-slate-800 font-medium">
            {formatINR(p.fixedBillingAmount)}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      key: 'frequency',
      header: 'Frequency',
      render: (p) => (
        <span className="text-slate-700 font-medium">
          {FREQ_LABELS[p.frequency] || p.frequency}
        </span>
      ),
    },
    {
      key: 'creditDays',
      header: 'Credit Days',
      align: 'center',
      render: (p) => (
        <span className="text-slate-700">{p.creditDays ?? 0} days</span>
      ),
    },
    {
      key: 'timezone',
      header: 'Timezone',
      render: (p) => (
        <span className="text-xs text-slate-600 font-mono">{p.timezone || '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (p) => (
        <Badge
          variant={p.status === 'ACTIVE' ? 'success' : 'neutral'}
          size="sm"
        >
          {p.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="xs"
            icon={Edit2}
            onClick={() => onEdit(p)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="xs"
            icon={Trash2}
            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            title="Delete preference"
            onClick={() => onDelete(p)}
          />
        </div>
      ),
    },
  ]
}

export function BillingPreferencesPage() {
  const [preferences, setPreferences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPreference, setEditingPreference] = useState(null)

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedPreference, setSelectedPreference] = useState(null)

  // Toast
  const [toast, setToast] = useState(null)

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await MockApi.getBillingPreferences({ search })
      setPreferences(data)
    } catch (err) {
      setError(err.message || 'Failed to load billing preferences.')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const handleAddNew = () => {
    setEditingPreference(null)
    setModalOpen(true)
  }

  const handleEdit = (pref) => {
    setEditingPreference(pref)
    setModalOpen(true)
    // Close drawer if open
    setDrawerOpen(false)
  }

  const handleRowClick = (pref) => {
    setSelectedPreference(pref)
    setDrawerOpen(true)
  }

  const handleDelete = async (pref) => {
    if (
      !window.confirm(
        `Delete billing preference for ${pref.billToName} (${pref.id})?`
      )
    ) {
      return
    }
    try {
      await MockApi.deleteBillingPreference(pref.id)
      if (selectedPreference?.id === pref.id) {
        setDrawerOpen(false)
        setSelectedPreference(null)
      }
      fetchPreferences()
      showToast('Billing preference deleted.')
    } catch (err) {
      showToast(err.message || 'Failed to delete preference.')
    }
  }

  const handleSuccess = () => {
    fetchPreferences()
    showToast(editingPreference ? 'Preference updated.' : 'Billing preference created.')
  }

  const columns = buildColumns(handleEdit, handleDelete)

  const emptyState = (
    <EmptyState
      title="No billing preferences"
      description={
        search
          ? 'No preferences match your search. Try a different query.'
          : 'Set up billing configurations for your customers to get started.'
      }
      actionLabel="Add Preference"
      onAction={handleAddNew}
    />
  )

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-72">
            <Input
              placeholder="Search customer or billing type…"
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          {!loading && (
            <span className="text-xs text-slate-400">
              {preferences.length} preference{preferences.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <Button variant="primary" size="sm" icon={Plus} onClick={handleAddNew}>
          Add Preference
        </Button>
      </div>

      {/* Table / Error */}
      {error ? (
        <ErrorState
          title="Unable to load preferences"
          message={error}
          onRetry={fetchPreferences}
        />
      ) : (
        <DataTable
          columns={columns}
          data={preferences}
          keyFn={(p) => p.id}
          onRowClick={handleRowClick}
          loading={loading}
          skeletonRows={5}
          emptyState={emptyState}
        />
      )}

      {/* Add / Edit Modal */}
      <AddPreferenceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        preference={editingPreference}
        existingPreferences={preferences}
        onSuccess={handleSuccess}
      />

      {/* Detail Drawer */}
      <PreferenceDetailDrawer
        isOpen={drawerOpen}
        preference={selectedPreference}
        onClose={() => setDrawerOpen(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  )
}
