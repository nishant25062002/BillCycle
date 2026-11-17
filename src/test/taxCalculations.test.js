import { describe, it, expect } from 'vitest'
import { calculateTax } from '../utils/taxCalculations'

describe('Tax Calculation Engine', () => {
  it('calculates CGST and SGST for India intra-state supply (Karnataka)', () => {
    const res = calculateTax({
      country: 'IN',
      buyerState: 'Karnataka',
      taxableAmount: 100000,
    })

    expect(res.isIntraState).toBe(true)
    expect(res.isInterState).toBe(false)
    expect(res.isInternational).toBe(false)
    expect(res.totalTax).toBe(18000) // 18%
    expect(res.taxes).toHaveLength(2)

    const cgst = res.taxes.find((t) => t.code === 'CGST')
    const sgst = res.taxes.find((t) => t.code === 'SGST')

    expect(cgst.rate).toBe(9.0)
    expect(cgst.amount).toBe(9000)
    expect(sgst.rate).toBe(9.0)
    expect(sgst.amount).toBe(9000)
  })

  it('calculates IGST for India inter-state supply (e.g. Maharashtra, Delhi)', () => {
    const res = calculateTax({
      country: 'IN',
      buyerState: 'Maharashtra',
      taxableAmount: 150000,
    })

    expect(res.isIntraState).toBe(false)
    expect(res.isInterState).toBe(true)
    expect(res.isInternational).toBe(false)
    expect(res.totalTax).toBe(27000) // 18% of 150,000
    expect(res.taxes).toHaveLength(1)

    const igst = res.taxes[0]
    expect(igst.code).toBe('IGST')
    expect(igst.rate).toBe(18.0)
    expect(igst.amount).toBe(27000)
  })

  it('calculates Singapore GST at 9% for cross-border transactions', () => {
    const res = calculateTax({
      country: 'SG',
      buyerState: 'Singapore',
      taxableAmount: 200000,
    })

    expect(res.isInternational).toBe(true)
    expect(res.totalTax).toBe(18000) // 9% of 200,000
    expect(res.taxes).toHaveLength(1)
    expect(res.taxes[0].code).toBe('SG_GST')
    expect(res.taxes[0].rate).toBe(9.0)
  })

  it('handles fractional amounts with accurate 2 decimal place rounding', () => {
    const res = calculateTax({
      country: 'IN',
      buyerState: 'Karnataka',
      taxableAmount: 33333.33,
    })

    // 9% of 33333.33 = 2999.9997 -> 3000.00
    expect(res.totalTax).toBe(6000)
  })
})

