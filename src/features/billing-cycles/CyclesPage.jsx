import React, { useState, useEffect, useCallback } from 'react'
import { MockApi } from '../../services/mockApi'
import { CycleFilterBar } from './components/CycleFilterBar'
import { CycleTable } from './components/CycleTable'
import { ErrorState } from '../../components/shared/ErrorState'

export function CyclesPage() {
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [frequency, setFrequency] = useState('ALL')
  const [sortBy, setSortBy] = useState('date_desc')

  const fetchCycles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await MockApi.getBillingCycles({ search, status, frequency, sortBy })
      setCycles(data)
    } catch (err) {
      setError(err.message || 'Failed to load billing cycles.')
    } finally {
      setLoading(false)
    }
  }, [search, status, frequency, sortBy])

  useEffect(() => {
    fetchCycles()
  }, [fetchCycles])

  const handleResetFilters = () => {
    setSearch('')
    setStatus('ALL')
    setFrequency('ALL')
    setSortBy('date_desc')
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load cycles"
        message={error}
        onRetry={fetchCycles}
      />
    )
  }

  return (
    <div className="space-y-4">
      <CycleFilterBar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        frequency={frequency}
        onFrequencyChange={setFrequency}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      <CycleTable
        cycles={cycles}
        loading={loading}
        onResetFilters={handleResetFilters}
      />
    </div>
  )
}
