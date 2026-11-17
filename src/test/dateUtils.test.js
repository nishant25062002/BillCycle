import { describe, it, expect } from 'vitest'
import {
  calculateCycleBoundaries,
  calculateDueDate,
  isOverdue,
  formatDate,
} from '../utils/dateUtils'

describe('Date & Period Boundary Utilities', () => {
  it('calculates weekly cycle boundaries starting on Monday', () => {
    const ref = new Date('2026-05-13T10:00:00.000Z') // Wednesday
    const bounds = calculateCycleBoundaries('WEEKLY', ref)

    expect(bounds.durationDays).toBe(7)
    const startDate = new Date(bounds.startAt)
    // In local time, weekStartsOn: 1 is Monday (day 1)
    expect(startDate.getDay()).toBe(1)
  })

  it('calculates monthly cycle boundaries spanning full calendar month', () => {
    const ref = new Date('2026-05-15T12:00:00.000Z')
    const bounds = calculateCycleBoundaries('MONTHLY', ref)

    expect(bounds.durationDays).toBe(31) // May has 31 days
    expect(formatDate(bounds.startAt, 'yyyy-MM-dd')).toBe('2026-05-01')
  })

  it('calculates quarterly cycle boundaries for Q2', () => {
    const ref = new Date('2026-05-15T12:00:00.000Z')
    const bounds = calculateCycleBoundaries('QUARTERLY', ref)

    // Q2 starts April 1st
    expect(formatDate(bounds.startAt, 'yyyy-MM-dd')).toBe('2026-04-01')
    expect(bounds.durationDays).toBeGreaterThanOrEqual(90)
  })

  it('calculates invoice due date based on payment terms', () => {
    const issueDate = '2026-05-01T00:00:00.000Z'

    const dueNet30 = calculateDueDate(issueDate, 'NET_30')
    expect(dueNet30).toContain('2026-05-31')

    const dueNet15 = calculateDueDate(issueDate, 'NET_15')
    expect(dueNet15).toContain('2026-05-16')

    const dueImmediate = calculateDueDate(issueDate, 'DUE_ON_RECEIPT')
    expect(dueImmediate).toContain('2026-05-01')
  })

  it('correctly detects overdue invoices', () => {
    const pastDate = '2020-01-01T00:00:00.000Z'
    const futureDate = '2099-01-01T00:00:00.000Z'

    expect(isOverdue(pastDate)).toBe(true)
    expect(isOverdue(futureDate)).toBe(false)
  })
})
