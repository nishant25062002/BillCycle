import { format, parseISO, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter } from 'date-fns'

/**
 * Standard timezone mapping labels
 */
export const TIMEZONE_LABELS = {
  'Asia/Kolkata': 'IST (UTC+05:30)',
  'Asia/Singapore': 'SGT (UTC+08:00)',
  'UTC': 'UTC',
}

/**
 * Formats a date string to display format.
 * @param {string|Date} dateStr 
 * @param {string} pattern
 * @returns {string}
 */
export function formatDate(dateStr, pattern = 'dd MMM yyyy') {
  if (!dateStr) return '—'
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
    return format(d, pattern)
  } catch {
    return String(dateStr)
  }
}

/**
 * Formats a billing cycle period range.
 * @param {string} startAt 
 * @param {string} endAt 
 * @param {string} timezone 
 * @returns {string} e.g. "01 May 2026 – 31 May 2026"
 */
export function formatBillingPeriod(startAt, endAt, _timezone = 'Asia/Kolkata') {
  if (!startAt || !endAt) return '—'
  const startStr = formatDate(startAt, 'dd MMM yyyy')
  const endStr = formatDate(endAt, 'dd MMM yyyy')
  return `${startStr} – ${endStr}`
}

/**
 * Calculates start and end dates based on frequency and an anchor date.
 * @param {'WEEKLY'|'MONTHLY'|'QUARTERLY'} frequency
 * @param {Date|string} dateRef
 * @returns {{ startAt: string, endAt: string, durationDays: number }}
 */
export function calculateCycleBoundaries(frequency, dateRef = new Date()) {
  const ref = typeof dateRef === 'string' ? parseISO(dateRef) : dateRef
  let start
  let end

  switch (frequency) {
    case 'WEEKLY':
      start = startOfWeek(ref, { weekStartsOn: 1 }) // Monday
      end = endOfWeek(ref, { weekStartsOn: 1 }) // Sunday
      break
    case 'QUARTERLY':
      start = startOfQuarter(ref)
      end = endOfQuarter(ref)
      break
    case 'MONTHLY':
    default:
      start = startOfMonth(ref)
      end = endOfMonth(ref)
      break
  }

  const durationMs = end.getTime() - start.getTime()
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24))

  return {
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    durationDays,
  }
}

/**
 * Calculates invoice due date based on payment terms string.
 * @param {string|Date} issueDateStr 
 * @param {string} paymentTerms e.g. "NET_30", "NET_15", "NET_45", "DUE_ON_RECEIPT"
 * @returns {string} ISO Date string
 */
export function calculateDueDate(issueDateStr, paymentTerms = 'NET_30') {
  const issueDate = typeof issueDateStr === 'string' ? parseISO(issueDateStr) : issueDateStr
  let daysToAdd = 30
  if (paymentTerms === 'NET_15') daysToAdd = 15
  else if (paymentTerms === 'NET_45') daysToAdd = 45
  else if (paymentTerms === 'NET_60') daysToAdd = 60
  else if (paymentTerms === 'DUE_ON_RECEIPT') daysToAdd = 0

  const dueDate = addDays(issueDate, daysToAdd)
  return dueDate.toISOString()
}

/**
 * Checks if a date is overdue compared to current date.
 * @param {string|Date} dueDateStr 
 * @returns {boolean}
 */
export function isOverdue(dueDateStr) {
  if (!dueDateStr) return false
  const dueDate = typeof dueDateStr === 'string' ? parseISO(dueDateStr) : dueDateStr
  return dueDate.getTime() < Date.now()
}
