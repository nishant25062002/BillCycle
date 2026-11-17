import React from 'react'
import { Badge } from '../ui/Badge'

const STATUS_CONFIGS = {
  // Billing Cycle Statuses
  OPEN: {
    label: 'Open',
    variant: 'primary',
  },
  // Legacy / fallback mappings normalize to Open
  IN_REVIEW: {
    label: 'Open',
    variant: 'primary',
  },
  READY_FOR_REVIEW: {
    label: 'Open',
    variant: 'primary',
  },
  DRAFT: {
    label: 'Open',
    variant: 'primary',
  },
  CLOSED: {
    label: 'Closed',
    variant: 'neutral',
  },
  INVOICED: {
    label: 'Invoiced',
    variant: 'success',
  },
  EMPTY: {
    label: 'Empty',
    variant: 'neutral',
  },

  // Invoice Statuses
  ISSUED: {
    label: 'Issued',
    variant: 'primary',
  },
  PARTIALLY_PAID: {
    label: 'Partially Paid',
    variant: 'info',
  },
  PAID: {
    label: 'Paid',
    variant: 'success',
  },
  OVERDUE: {
    label: 'Overdue',
    variant: 'danger',
  },

  // Item Eligibility
  ELIGIBLE: {
    label: 'Eligible',
    variant: 'success',
  },
  INELIGIBLE: {
    label: 'Ineligible',
    variant: 'danger',
  },
  EXCLUDED: {
    label: 'Excluded',
    variant: 'neutral',
  },
}

export function StatusBadge({ status, size = 'sm', withDot = true, className = '' }) {
  const config = STATUS_CONFIGS[status] || {
    label: status,
    variant: 'default',
  }

  return (
    <Badge
      variant={config.variant}
      size={size}
      withDot={withDot}
      className={className}
    >
      {config.label}
    </Badge>
  )
}
