/**
 * Formats a numeric amount to INR currency string.
 * @param {number} amount
 * @param {object} options
 * @returns {string} e.g. "₹1,24,500.00"
 */
export function formatINR(amount, options = {}) {
  const { showDecimals = true, compact = false } = options
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0

  if (compact && Math.abs(num) >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`
  }
  if (compact && Math.abs(num) >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(num)
}

/**
 * Rounds a number to 2 decimal places reliably.
 * @param {number} num
 * @returns {number}
 */
export function round2(num) {
  return Math.round((Number(num) + Number.EPSILON) * 100) / 100
}

