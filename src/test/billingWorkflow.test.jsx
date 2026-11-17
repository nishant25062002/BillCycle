import React from 'react'
import { describe, it, expect, beforeEach } from 'vitest'
import { MockApi } from '../services/mockApi'
import { Storage } from '../services/storage'

describe('End-to-End Billing Workflow (Mock Service Layer)', () => {
  beforeEach(() => {
    Storage.resetToDefault()
  })

  it('completes the full lifecycle: add adjustment -> close cycle -> generate invoice -> record payment', async () => {
    // 1. Fetch cycles and find an unclosed cycle (e.g. Apex Pharma Week 20)
    const cycles = await MockApi.getBillingCycles()
    const targetCycle = cycles.find((c) => c.status === 'OPEN')
    expect(targetCycle).toBeDefined()
    expect(targetCycle.status).toBe('OPEN')

    // 2. Add an eligible operational adjustment
    await MockApi.addCycleAdjustment(targetCycle.id, {
      title: 'Packaging Quality Audit Incentive',
      type: 'CREDIT',
      amount: 5000,
      reason: '100% compliance audit bonus',
    })

    const cycleWithAdj = await MockApi.getBillingCycleById(targetCycle.id)
    expect(cycleWithAdj.adjustments.some((a) => a.title === 'Packaging Quality Audit Incentive')).toBe(true)

    // 3. Close the billing cycle
    const closedCycle = await MockApi.closeBillingCycle(targetCycle.id)
    expect(closedCycle.status).toBe('CLOSED')
    expect(closedCycle.closedAt).toBeDefined()

    // 4. Verify cannot modify items once closed
    await expect(
      MockApi.toggleItemInclusion(targetCycle.id, cycleWithAdj.items[0].id, false)
    ).rejects.toThrow('Cannot modify items of a closed or invoiced billing cycle')

    // 5. Generate tax invoice from closed cycle
    const generatedInvoice = await MockApi.generateInvoiceForCycle(targetCycle.id)
    expect(generatedInvoice.invoiceNumber).toMatch(/^BC-INV-\d{4}-\d{4}$/)
    expect(generatedInvoice.cycleId).toBe(targetCycle.id)
    expect(generatedInvoice.grandTotal).toBeGreaterThan(0)
    expect(generatedInvoice.remainingBalance).toBe(generatedInvoice.grandTotal)
    expect(generatedInvoice.status).toBe('ISSUED')

    // 6. Verify duplicate invoice cannot be generated for the same cycle
    await expect(
      MockApi.generateInvoiceForCycle(targetCycle.id)
    ).rejects.toThrow('An invoice has already been generated')

    // 7. Verify cycle is marked INVOICED and has invoice reference
    const invoicedCycle = await MockApi.getBillingCycleById(targetCycle.id)
    expect(invoicedCycle.status).toBe('INVOICED')
    expect(invoicedCycle.invoiceId).toBe(generatedInvoice.id)

    // 8. Record a partial payment
    const partialPaymentAmount = 50000
    const updatedInvoice = await MockApi.recordInvoicePayment(generatedInvoice.id, {
      amount: partialPaymentAmount,
      method: 'RTGS',
      reference: 'UTR9817263541',
      notes: 'First tranche payment',
    })

    expect(updatedInvoice.paidAmount).toBe(partialPaymentAmount)
    expect(updatedInvoice.remainingBalance).toBe(generatedInvoice.grandTotal - partialPaymentAmount)
    expect(updatedInvoice.status).toBe('PARTIALLY_PAID')

    // 9. Settle the remaining balance in full
    const secondPayment = await MockApi.recordInvoicePayment(generatedInvoice.id, {
      amount: updatedInvoice.remainingBalance,
      method: 'RTGS',
      reference: 'UTR9817263599',
    })

    expect(secondPayment.remainingBalance).toBe(0)
    expect(secondPayment.status).toBe('PAID')
  })
})

