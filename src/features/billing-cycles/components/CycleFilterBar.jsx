import React from 'react'
import { Search } from 'lucide-react'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'

export function CycleFilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  frequency,
  onFrequencyChange,
  sortBy,
  onSortByChange,
}) {
  const STATUS_OPTIONS = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'OPEN', label: 'Open' },
    { value: 'CLOSED', label: 'Closed' },
    { value: 'INVOICED', label: 'Invoiced' },
  ]

  const FREQUENCY_OPTIONS = [
    { value: 'ALL', label: 'All Frequencies' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'QUARTERLY', label: 'Quarterly' },
  ]

  const SORT_OPTIONS = [
    { value: 'date_desc', label: 'Period (Newest first)' },
    { value: 'date_asc', label: 'Period (Oldest first)' },
    { value: 'amount_desc', label: 'Amount (High to Low)' },
    { value: 'amount_asc', label: 'Amount (Low to High)' },
  ]

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
      {/* Search Input */}
      <div className="w-full md:w-80">
        <Input
          placeholder="Search by customer, code, or cycle..."
          icon={Search}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 text-xs"
        />
      </div>

      {/* Filter Selects */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="w-40">
          <Select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            options={STATUS_OPTIONS}
            className="h-9 text-xs"
          />
        </div>

        <div className="w-38">
          <Select
            value={frequency}
            onChange={(e) => onFrequencyChange(e.target.value)}
            options={FREQUENCY_OPTIONS}
            className="h-9 text-xs"
          />
        </div>

        <div className="w-44">
          <Select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            options={SORT_OPTIONS}
            className="h-9 text-xs"
          />
        </div>
      </div>
    </div>
  )
}
