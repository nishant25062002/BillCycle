import { describe, it, expect } from 'vitest'
import {
  calculateCycleFinancials,
  calculatePaymentStatus,
  validateCycleClosure,
  validateInvoiceGeneration,
} from '../features/billing-cycles/utils/cycleCalculations'

describe('Cycle Financial Calculations & State Validation', () => {
  const customerKA = {
    id: 'cust-101',
    name: 'Nexus Retail',
    countryCode: 'IN',
    state: 'Karnataka',
  }

  const sampleItems = [
    {
      id: 'shp-1',
      amount: 100000,
      fuelSurcharge: 10000,
      addOns: 2000,
      discount: 0,
      status: 'ELIGIBLE',
      isIncluded: true,
    },
    {
      id: 'shp-2',
      amount: 50000,
      fuelSurcharge: 5000,
      addOns: 0,
      discount: 1000,
      status: 'ELIGIBLE',
      isIncluded: true,
    },
    {
      id: 'shp-3',
      amount: 25000,
      fuelSurcharge: 2000,
      addOns: 0,
      discount: 0,
      status: 'ELIGIBLE',
      isIncluded: false, // EXCLUDED by user
    },
    {
      id: 'shp-4',
      amount: 30000,
      fuelSurcharge: 1000,
      addOns: 0,
      discount: 0,
      status: 'INELIGIBLE', // Not eligible (damaged/unverified)
      isIncluded: true,
    },
  ]

  it('calculates shipments subtotal strictly from eligible and included items', () => {
    const res = calculateCycleFinancials({
      items: sampleItems,
      adjustments: [],
      customer: customerKA,
    })

    // shp-1: 100000 + 10000 + 2000 = 112000
    // shp-2: 50000 + 5000 - 1000 = 54000
    // Subtotal = 112000 + 54000 = 166000
    expect(res.eligibleItemsCount).toBe(2)
    expect(res.excludedItemsCount).toBe(2)
    expect(res.shipmentsSubtotal).toBe(166000)
    expect(res.taxableAmount).toBe(166000)
    expect(res.totalTax).toBe(29880) // 18% of 166,000 = 29,880
    expect(res.grandTotal).toBe(195880) // 166000 + 29880
  })

  it('incorporates manual adjustments (credits reduce base, charges increase base)', () => {
    const adjustments = [
      { id: 'adj-1', type: 'CREDIT', amount: 6000 },
      { id: 'adj-2', type: 'CHARGE', amount: 2000 },
    ]

    const res = calculateCycleFinancials({
      items: sampleItems,
      adjustments,
      customer: customerKA,
    })

    // Net adjustments: -6000 + 2000 = -4000
    // Taxable base = 166000 - 4000 = 162000
    expect(res.adjustmentsTotal).toBe(-4000)
    expect(res.taxableAmount).toBe(162000)
    expect(res.totalTax).toBe(29160) // 18% of 162,000 = 29,160
    expect(res.grandTotal).toBe(191160)
  })

  it('updates partial payments, remaining balance, and invoice status', () => {
    const total = 100000

    // Unpaid
    const s1 = calculatePaymentStatus(total, [], '2099-01-01')
    expect(s1.totalPaid).toBe(0)
    expect(s1.remainingBalance).toBe(100000)
    expect(s1.paymentStatus).toBe('UNPAID')

    // Partially Paid
    const s2 = calculatePaymentStatus(total, [{ amount: 40000 }], '2099-01-01')
    expect(s2.totalPaid).toBe(40000)
    expect(s2.remainingBalance).toBe(60000)
    expect(s2.paymentStatus).toBe('PARTIALLY_PAID')

    // Fully Paid
    const s3 = calculatePaymentStatus(total, [{ amount: 40000 }, { amount: 60000 }], '2099-01-01')
    expect(s3.totalPaid).toBe(100000)
    expect(s3.remainingBalance).toBe(0)
    expect(s3.paymentStatus).toBe('PAID')

    // Overdue
    const s4 = calculatePaymentStatus(total, [], '2020-01-01')
    expect(s4.paymentStatus).toBe('OVERDUE')
  })

  it('validates cycle closure rules', () => {
    // Open cycle with eligible items -> can close
    const cycleOpen = { id: 'c1', status: 'OPEN' }
    const v1 = validateCycleClosure(cycleOpen, [sampleItems[0]])
    expect(v1.canClose).toBe(true)

    // Already closed cycle -> cannot close
    const cycleClosed = { id: 'c2', status: 'CLOSED' }
    const v2 = validateCycleClosure(cycleClosed, [sampleItems[0]])
    expect(v2.canClose).toBe(false)
    expect(v2.reason).toContain('already closed')

    // Empty cycle with no items -> cannot close
    const cycleEmpty = { id: 'c3', status: 'OPEN', adjustments: [] }
    const v3 = validateCycleClosure(cycleEmpty, [])
    expect(v3.canClose).toBe(false)
    expect(v3.reason).toContain('no eligible items')
  })

  it('prevents duplicate invoice generation and enforces cycle closed state', () => {
    // Cycle not closed -> cannot generate invoice
    const cycleOpen = { id: 'c1', status: 'OPEN', invoiceId: null }
    const v1 = validateInvoiceGeneration(cycleOpen)
    expect(v1.canGenerate).toBe(false)
    expect(v1.reason).toContain('CLOSED before generating')

    // Closed cycle -> can generate invoice
    const cycleClosed = { id: 'c2', status: 'CLOSED', invoiceId: null }
    const v2 = validateInvoiceGeneration(cycleClosed)
    expect(v2.canGenerate).toBe(true)

    // Already invoiced cycle -> duplicate prevented
    const cycleInvoiced = { id: 'c3', status: 'CLOSED', invoiceId: 'inv-99' }
    const v3 = validateInvoiceGeneration(cycleInvoiced)
    expect(v3.canGenerate).toBe(false)
    expect(v3.reason).toContain('already been generated')
  })
})

