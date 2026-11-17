import { round2 } from './currencyUtils'

export const SELLER_PROFILE = {
  name: 'BillCycle Logistics Pvt. Ltd.',
  pan: 'AABCL9988K',
  gstin: '29AABCL9988K1Z5',
  state: 'Karnataka',
  stateCode: 'KA',
  country: 'IN',
  address: 'Level 4, Orion Tech Park, Outer Ring Road, Bangalore, Karnataka 560103',
  bankName: 'HDFC Bank Ltd',
  accountNumber: '50200084920194',
  ifscCode: 'HDFC0000240',
  swiftCode: 'HDFCINBBXXX',
  contactEmail: 'billing@billcycle.io',
  contactPhone: '+91 (80) 4920-8000',
}

/**
 * Calculates tax breakdown based on buyer jurisdiction and taxable amount.
 * @param {object} params
 * @param {string} params.country e.g. "IN" or "SG"
 * @param {string} params.buyerState e.g. "Karnataka", "Maharashtra", "Tamil Nadu"
 * @param {number} params.taxableAmount
 * @returns {{
 *   taxes: Array<{ name: string, code: string, rate: number, amount: number }>,
 *   totalTax: number,
 *   isIntraState: boolean,
 *   isInterState: boolean,
 *   isInternational: boolean
 * }}
 */
export function calculateTax({ country = 'IN', buyerState = 'Karnataka', taxableAmount = 0 }) {
  const safeTaxable = Math.max(0, taxableAmount)

  if (country === 'SG') {
    const rate = 9.0
    const amount = round2((safeTaxable * rate) / 100)
    return {
      taxes: [
        {
          name: 'Singapore GST',
          code: 'SG_GST',
          rate,
          amount,
        },
      ],
      totalTax: amount,
      isIntraState: false,
      isInterState: false,
      isInternational: true,
    }
  }

  // India GST
  const isIntraState =
    buyerState &&
    (buyerState.toLowerCase() === 'karnataka' || buyerState.toUpperCase() === 'KA')

  if (isIntraState) {
    const cgstRate = 9.0
    const sgstRate = 9.0
    const cgstAmount = round2((safeTaxable * cgstRate) / 100)
    const sgstAmount = round2((safeTaxable * sgstRate) / 100)
    const totalTax = round2(cgstAmount + sgstAmount)

    return {
      taxes: [
        {
          name: 'Central GST (CGST)',
          code: 'CGST',
          rate: cgstRate,
          amount: cgstAmount,
        },
        {
          name: 'State GST (SGST)',
          code: 'SGST',
          rate: sgstRate,
          amount: sgstAmount,
        },
      ],
      totalTax,
      isIntraState: true,
      isInterState: false,
      isInternational: false,
    }
  } else {
    // Inter-state IGST
    const igstRate = 18.0
    const igstAmount = round2((safeTaxable * igstRate) / 100)

    return {
      taxes: [
        {
          name: 'Integrated GST (IGST)',
          code: 'IGST',
          rate: igstRate,
          amount: igstAmount,
        },
      ],
      totalTax: igstAmount,
      isIntraState: false,
      isInterState: true,
      isInternational: false,
    }
  }
}

