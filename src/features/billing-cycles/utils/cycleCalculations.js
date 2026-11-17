import { round2 } from '../../../utils/currencyUtils'
import { calculateTax } from '../../../utils/taxCalculations'
import { isOverdue } from '../../../utils/dateUtils'

/**
 * Calculates complete financial breakdown for a billing cycle.
 * @param {object} params
 * @param {Array} params.items - List of shipment/service items
 * @param {Array} params.adjustments - List of manual adjustments
 * @param {object} params.customer - Customer entity
 * @returns {object}
 */
export function calculateCycleFinancials({ items = [], adjustments = [], customer = {} }) {
  // Only include items that are explicitly eligible and not excluded by user
  const eligibleItems = items.filter(
    (item) => item.status === 'ELIGIBLE' && item.isIncluded !== false
  )

  const shipmentsSubtotal = round2(
    eligibleItems.reduce((acc, item) => {
      const base = Number(item.amount || 0)
      const fuelSurcharge = Number(item.fuelSurcharge || 0)
      const addOns = Number(item.addOns || 0)
      const discount = Number(item.discount || 0)
      return acc + (base + fuelSurcharge + addOns - discount)
    }, 0)
  )

  const adjustmentsTotal = round2(
    adjustments.reduce((acc, adj) => {
      const val = Number(adj.amount || 0)
      // Positive for debit/surcharge, negative for credit/discount
      return adj.type === 'CREDIT' ? acc - Math.abs(val) : acc + Math.abs(val)
    }, 0)
  )

  // Taxable amount cannot drop below zero
  const taxableAmount = Math.max(0, round2(shipmentsSubtotal + adjustmentsTotal))

  const taxDetails = calculateTax({
    country: customer.countryCode || 'IN',
    buyerState: customer.state || 'Karnataka',
    taxableAmount,
  })

  const grandTotal = round2(taxableAmount + taxDetails.totalTax)

  return {
    eligibleItemsCount: eligibleItems.length,
    totalItemsCount: items.length,
    excludedItemsCount: items.length - eligibleItems.length,
    shipmentsSubtotal,
    adjustmentsTotal,
    taxableAmount,
    taxes: taxDetails.taxes,
    totalTax: taxDetails.totalTax,
    grandTotal,
    isIntraState: taxDetails.isIntraState,
    isInterState: taxDetails.isInterState,
    isInternational: taxDetails.isInternational,
  }
}

/**
 * Calculates payment status and remaining balance for an invoice.
 * @param {number} grandTotal 
 * @param {Array} payments 
 * @param {string} dueDateStr 
 * @returns {{
 *   totalPaid: number,
 *   remainingBalance: number,
 *   paymentStatus: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE'
 * }}
 */
export function calculatePaymentStatus(grandTotal, payments = [], dueDateStr = null) {
  const totalPaid = round2(
    payments.reduce((acc, p) => acc + Number(p.amount || 0), 0)
  )
  const remainingBalance = Math.max(0, round2(grandTotal - totalPaid))

  let paymentStatus = 'UNPAID'
  if (totalPaid >= grandTotal && grandTotal > 0) {
    paymentStatus = 'PAID'
  } else if (totalPaid > 0) {
    paymentStatus = 'PARTIALLY_PAID'
  } else if (dueDateStr && isOverdue(dueDateStr)) {
    paymentStatus = 'OVERDUE'
  }

  return {
    totalPaid,
    remainingBalance,
    paymentStatus,
  }
}

/**
 * Validates if a cycle can be closed.
 * @param {object} cycle 
 * @param {Array} eligibleItems 
 * @returns {{ canClose: boolean, reason?: string }}
 */
export function validateCycleClosure(cycle, eligibleItems = []) {
  if (!cycle) {
    return { canClose: false, reason: 'Cycle does not exist' }
  }
  if (cycle.status === 'CLOSED' || cycle.status === 'INVOICED') {
    return { canClose: false, reason: 'Cycle is already closed or invoiced' }
  }
  if (eligibleItems.length === 0 && (!cycle.adjustments || cycle.adjustments.length === 0)) {
    return { canClose: false, reason: 'Cycle has no eligible items or adjustments to bill' }
  }
  return { canClose: true }
}

/**
 * Validates if an invoice can be generated from a cycle.
 * @param {object} cycle 
 * @returns {{ canGenerate: boolean, reason?: string }}
 */
export function validateInvoiceGeneration(cycle) {
  if (!cycle) {
    return { canGenerate: false, reason: 'Cycle does not exist' }
  }
  if (cycle.invoiceId) {
    return { canGenerate: false, reason: 'An invoice has already been generated for this cycle' }
  }
  if (cycle.status !== 'CLOSED') {
    return { canGenerate: false, reason: 'Cycle must be CLOSED before generating an invoice' }
  }
  return { canGenerate: true }
}
