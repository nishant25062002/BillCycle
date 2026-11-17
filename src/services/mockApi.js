import { Storage } from './storage'
import {
  calculateCycleFinancials,
  calculatePaymentStatus,
  validateCycleClosure,
  validateInvoiceGeneration,
} from '../features/billing-cycles/utils/cycleCalculations'
import { calculateDueDate, formatDate } from '../utils/dateUtils'
import { round2, formatINR } from '../utils/currencyUtils'

// Simulated network latency
const DEFAULT_DELAY_MS = 200

function delay(ms = DEFAULT_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function checkSimulatedError() {
  const settings = Storage.getSettings()
  if (settings.simulateErrors) {
    throw new Error('Simulated network failure. Please retry your operation.')
  }
}

/**
 * Generate a sequential invoice number based on year and existing count
 */
function generateNextInvoiceNumber(invoices) {
  const year = new Date().getFullYear()
  const existingCount = invoices.length
  const nextSeq = String(existingCount + 42).padStart(4, '0')
  return `BC-INV-${year}-${nextSeq}`
}

export const MockApi = {
  // --- Settings & Simulation ---
  getSettings: async () => {
    await delay(50)
    return Storage.getSettings()
  },

  updateSettings: async (newSettings) => {
    await delay(100)
    const current = Storage.getSettings()
    const updated = { ...current, ...newSettings }
    Storage.saveSettings(updated)
    return updated
  },

  resetDemoData: async () => {
    await delay(200)
    Storage.resetToDefault()
    return true
  },

  // --- Customers ---
  getCustomers: async () => {
    await delay()
    checkSimulatedError()
    return Storage.getCustomers()
  },

  getCustomerById: async (customerId) => {
    await delay()
    checkSimulatedError()
    const customers = Storage.getCustomers()
    const customer = customers.find((c) => c.id === customerId)
    if (!customer) throw new Error(`Customer with ID ${customerId} not found`)
    return customer
  },

  // --- Billing Preferences ---
  getBillingPreferences: async ({ search = '' } = {}) => {
    await delay()
    checkSimulatedError()
    let prefs = Storage.getBillingPreferences()
    if (search) {
      const q = search.toLowerCase()
      prefs = prefs.filter(
        (p) =>
          p.billToName.toLowerCase().includes(q) ||
          p.frequency.toLowerCase().includes(q) ||
          p.billingType.toLowerCase().includes(q)
      )
    }
    return prefs
  },

  createBillingPreference: async (payload) => {
    await delay(300)
    checkSimulatedError()
    const prefs = Storage.getBillingPreferences()

    // Strict 1-to-1 business rule: A customer can only have one billing preference
    const existing = prefs.find(
      (p) => p.billToId === payload.billToId && p.billToType === (payload.billToType || 'CUSTOMER')
    )
    if (existing) {
      throw new Error(
        `A billing preference already exists for ${payload.billToName || 'this company'}. Each company can only have one billing configuration. Please edit the existing preference instead.`
      )
    }

    const newPref = {
      ...payload,
      id: `pref-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    prefs.unshift(newPref)
    Storage.saveBillingPreferences(prefs)
    return newPref
  },

  deleteBillingPreference: async (id) => {
    await delay(200)
    checkSimulatedError()
    const prefs = Storage.getBillingPreferences()
    const filtered = prefs.filter((p) => p.id !== id)
    Storage.saveBillingPreferences(filtered)
    return true
  },

  updateBillingPreference: async (id, payload) => {
    await delay(300)
    checkSimulatedError()
    const prefs = Storage.getBillingPreferences()
    const idx = prefs.findIndex((p) => p.id === id)
    if (idx === -1) throw new Error(`Billing preference ${id} not found`)
    prefs[idx] = { ...prefs[idx], ...payload }
    Storage.saveBillingPreferences(prefs)
    return prefs[idx]
  },

  // --- Billing Cycles ---
  getBillingCycles: async (filters = {}) => {
    await delay()
    checkSimulatedError()

    const cycles = Storage.getCycles()
    const customers = Storage.getCustomers()
    const items = Storage.getItems()

    // Enrich cycles with customer information and computed item totals
    const enriched = cycles.map((cycle) => {
      const customer = customers.find((c) => c.id === cycle.customerId) || {}
      const cycleItems = items.filter((item) => item.cycleId === cycle.id)
      const financials = calculateCycleFinancials({
        items: cycleItems,
        adjustments: cycle.adjustments || [],
        customer,
      })

      return {
        ...cycle,
        customer,
        itemsCount: cycleItems.length,
        eligibleItemsCount: financials.eligibleItemsCount,
        financials,
        billableAmount: financials.grandTotal,
      }
    })

    // Apply filters
    let result = enriched

    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (c) =>
          c.cycleNumber.toLowerCase().includes(q) ||
          c.customer.name?.toLowerCase().includes(q) ||
          c.customer.code?.toLowerCase().includes(q) ||
          c.periodName.toLowerCase().includes(q)
      )
    }

    if (filters.status && filters.status !== 'ALL') {
      result = result.filter((c) => c.status === filters.status)
    }

    if (filters.frequency && filters.frequency !== 'ALL') {
      result = result.filter((c) => c.frequency === filters.frequency)
    }

    // Sort
    if (filters.sortBy) {
      result.sort((a, b) => {
        if (filters.sortBy === 'amount_desc') return b.billableAmount - a.billableAmount
        if (filters.sortBy === 'amount_asc') return a.billableAmount - b.billableAmount
        if (filters.sortBy === 'date_asc') return new Date(a.startAt) - new Date(b.startAt)
        // default date_desc
        return new Date(b.startAt) - new Date(a.startAt)
      })
    } else {
      // Default: latest startAt first
      result.sort((a, b) => new Date(b.startAt) - new Date(a.startAt))
    }

    return result
  },

  getBillingCycleById: async (cycleId) => {
    await delay()
    checkSimulatedError()

    const cycles = Storage.getCycles()
    const cycle = cycles.find((c) => c.id === cycleId)
    if (!cycle) throw new Error(`Billing cycle with ID ${cycleId} not found`)

    const customers = Storage.getCustomers()
    const customer = customers.find((c) => c.id === cycle.customerId) || {}

    const allItems = Storage.getItems()
    const cycleItems = allItems.filter((i) => i.cycleId === cycle.id)

    const financials = calculateCycleFinancials({
      items: cycleItems,
      adjustments: cycle.adjustments || [],
      customer,
    })

    return {
      ...cycle,
      customer,
      items: cycleItems,
      financials,
    }
  },

  // --- Cycle Actions ---
  toggleItemInclusion: async (cycleId, itemId, isIncluded) => {
    await delay(150)
    checkSimulatedError()

    const cycles = Storage.getCycles()
    const cycle = cycles.find((c) => c.id === cycleId)
    if (!cycle) throw new Error(`Cycle not found: ${cycleId}`)
    if (cycle.status === 'CLOSED' || cycle.status === 'INVOICED') {
      throw new Error('Cannot modify items of a closed or invoiced billing cycle.')
    }

    const items = Storage.getItems()
    const itemIndex = items.findIndex((i) => i.id === itemId && i.cycleId === cycleId)
    if (itemIndex === -1) throw new Error(`Item ${itemId} not found in cycle ${cycleId}`)

    items[itemIndex] = {
      ...items[itemIndex],
      isIncluded: Boolean(isIncluded),
    }

    Storage.saveItems(items)
    return items[itemIndex]
  },

  addCycleAdjustment: async (cycleId, adjustment) => {
    await delay(200)
    checkSimulatedError()

    const cycles = Storage.getCycles()
    const cycleIndex = cycles.findIndex((c) => c.id === cycleId)
    if (cycleIndex === -1) throw new Error(`Cycle not found: ${cycleId}`)

    const cycle = cycles[cycleIndex]
    if (cycle.status === 'INVOICED') {
      throw new Error('Cannot add adjustments to an already invoiced billing cycle.')
    }

    const newAdjustment = {
      id: `adj-${Date.now()}`,
      title: adjustment.title,
      type: adjustment.type || 'CREDIT', // CREDIT or CHARGE
      amount: Math.abs(Number(adjustment.amount) || 0),
      reason: adjustment.reason || '',
      createdAt: new Date().toISOString(),
    }

    const currentAdjustments = cycle.adjustments || []
    cycles[cycleIndex] = {
      ...cycle,
      adjustments: [...currentAdjustments, newAdjustment],
      status: cycle.status,
    }

    Storage.saveCycles(cycles)

    // Log activity
    const activities = Storage.getActivities()
    activities.unshift({
      id: `act-${Date.now()}`,
      type: 'ADJUSTMENT_ADDED',
      title: `Adjustment added (${newAdjustment.type === 'CREDIT' ? '-' : '+'}₹${newAdjustment.amount})`,
      description: `${newAdjustment.title} for cycle ${cycle.cycleNumber}`,
      timestamp: new Date().toISOString(),
      entityId: cycle.id,
      entityType: 'CYCLE',
      badge: 'Adjustment',
      badgeVariant: 'info',
    })
    Storage.saveActivities(activities)

    return cycles[cycleIndex]
  },

  deleteCycleAdjustment: async (cycleId, adjustmentId) => {
    await delay(150)
    checkSimulatedError()

    const cycles = Storage.getCycles()
    const cycleIndex = cycles.findIndex((c) => c.id === cycleId)
    if (cycleIndex === -1) throw new Error(`Cycle not found: ${cycleId}`)

    const cycle = cycles[cycleIndex]
    if (cycle.status === 'INVOICED') {
      throw new Error('Cannot delete adjustments from an invoiced billing cycle.')
    }

    const currentAdjustments = cycle.adjustments || []
    cycles[cycleIndex] = {
      ...cycle,
      adjustments: currentAdjustments.filter((a) => a.id !== adjustmentId),
    }

    Storage.saveCycles(cycles)
    return cycles[cycleIndex]
  },

  closeBillingCycle: async (cycleId) => {
    await delay(250)
    checkSimulatedError()

    const cycles = Storage.getCycles()
    const cycleIndex = cycles.findIndex((c) => c.id === cycleId)
    if (cycleIndex === -1) throw new Error(`Cycle not found: ${cycleId}`)

    const cycle = cycles[cycleIndex]
    const items = Storage.getItems().filter((i) => i.cycleId === cycleId)
    const eligibleItems = items.filter((i) => i.status === 'ELIGIBLE' && i.isIncluded !== false)

    const validation = validateCycleClosure(cycle, eligibleItems)
    if (!validation.canClose) {
      throw new Error(validation.reason)
    }

    const updatedCycle = {
      ...cycle,
      status: 'CLOSED',
      closedAt: new Date().toISOString(),
    }
    cycles[cycleIndex] = updatedCycle
    Storage.saveCycles(cycles)

    // Activity
    const activities = Storage.getActivities()
    activities.unshift({
      id: `act-${Date.now()}`,
      type: 'CYCLE_CLOSED',
      title: 'Cycle Closed & Locked',
      description: `Cycle ${cycle.cycleNumber} locked with ${eligibleItems.length} eligible shipments`,
      timestamp: new Date().toISOString(),
      entityId: cycle.id,
      entityType: 'CYCLE',
      badge: 'Closed',
      badgeVariant: 'neutral',
    })
    Storage.saveActivities(activities)

    return updatedCycle
  },

  generateInvoiceForCycle: async (cycleId) => {
    await delay(350)
    checkSimulatedError()

    const cycles = Storage.getCycles()
    const cycleIndex = cycles.findIndex((c) => c.id === cycleId)
    if (cycleIndex === -1) throw new Error(`Cycle not found: ${cycleId}`)

    const cycle = cycles[cycleIndex]
    const validation = validateInvoiceGeneration(cycle)
    if (!validation.canGenerate) {
      throw new Error(validation.reason)
    }

    const customers = Storage.getCustomers()
    const customer = customers.find((c) => c.id === cycle.customerId) || {}

    const items = Storage.getItems().filter((i) => i.cycleId === cycleId)
    const financials = calculateCycleFinancials({
      items,
      adjustments: cycle.adjustments || [],
      customer,
    })

    const invoices = Storage.getInvoices()
    const invoiceNumber = generateNextInvoiceNumber(invoices)
    const issueDate = new Date().toISOString()
    const dueDate = calculateDueDate(issueDate, customer.paymentTerms)

    const newInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      cycleId: cycle.id,
      customerId: customer.id,
      issueDate,
      dueDate,
      status: 'ISSUED',
      paymentTerms: customer.paymentTerms || 'NET_30',
      currency: 'INR',
      subtotal: financials.shipmentsSubtotal,
      adjustmentsTotal: financials.adjustmentsTotal,
      taxableAmount: financials.taxableAmount,
      taxes: financials.taxes,
      totalTax: financials.totalTax,
      grandTotal: financials.grandTotal,
      paidAmount: 0,
      remainingBalance: financials.grandTotal,
      payments: [],
      notes: `Invoice issued for ${cycle.periodName} (${customer.name}).`,
    }

    invoices.unshift(newInvoice)
    Storage.saveInvoices(invoices)

    // Mark cycle as INVOICED and attach invoice reference
    cycles[cycleIndex] = {
      ...cycle,
      status: 'INVOICED',
      invoiceId: newInvoice.id,
      invoiceNumber: newInvoice.invoiceNumber,
    }
    Storage.saveCycles(cycles)

    // Activity
    const activities = Storage.getActivities()
    activities.unshift({
      id: `act-${Date.now()}`,
      type: 'INVOICE_GENERATED',
      title: `Invoice Generated (${newInvoice.invoiceNumber})`,
      description: `Issued for ${customer.name} - ₹${newInvoice.grandTotal.toLocaleString('en-IN')}`,
      timestamp: new Date().toISOString(),
      entityId: newInvoice.id,
      entityType: 'INVOICE',
      badge: 'Issued',
      badgeVariant: 'primary',
    })
    Storage.saveActivities(activities)

    return newInvoice
  },

  // --- Invoices ---
  getInvoices: async (filters = {}) => {
    await delay()
    checkSimulatedError()

    const invoices = Storage.getInvoices()
    const customers = Storage.getCustomers()
    const cycles = Storage.getCycles()

    const enriched = invoices.map((inv) => {
      const customer = customers.find((c) => c.id === inv.customerId) || {}
      const cycle = cycles.find((c) => c.id === inv.cycleId) || {}

      // Recalculate live status if due date passed
      const paymentCalc = calculatePaymentStatus(inv.grandTotal, inv.payments, inv.dueDate)
      const currentStatus =
        paymentCalc.paymentStatus === 'PAID'
          ? 'PAID'
          : paymentCalc.paymentStatus === 'PARTIALLY_PAID'
          ? 'PARTIALLY_PAID'
          : paymentCalc.paymentStatus === 'OVERDUE'
          ? 'OVERDUE'
          : inv.status

      return {
        ...inv,
        customer,
        cycle,
        status: currentStatus,
        paidAmount: paymentCalc.totalPaid,
        remainingBalance: paymentCalc.remainingBalance,
      }
    })

    let result = enriched
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customer.name?.toLowerCase().includes(q) ||
          inv.customer.code?.toLowerCase().includes(q)
      )
    }

    if (filters.status && filters.status !== 'ALL') {
      result = result.filter((inv) => inv.status === filters.status)
    }

    result.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))
    return result
  },

  getInvoiceById: async (invoiceId) => {
    await delay()
    checkSimulatedError()

    const invoices = Storage.getInvoices()
    const inv = invoices.find((i) => i.id === invoiceId)
    if (!inv) throw new Error(`Invoice with ID ${invoiceId} not found`)

    const customers = Storage.getCustomers()
    const customer = customers.find((c) => c.id === inv.customerId) || {}

    const cycles = Storage.getCycles()
    const cycle = cycles.find((c) => c.id === inv.cycleId) || {}

    const items = Storage.getItems().filter(
      (i) => i.cycleId === inv.cycleId && i.status === 'ELIGIBLE' && i.isIncluded !== false
    )

    const paymentCalc = calculatePaymentStatus(inv.grandTotal, inv.payments, inv.dueDate)
    const currentStatus =
      paymentCalc.paymentStatus === 'PAID'
        ? 'PAID'
        : paymentCalc.paymentStatus === 'PARTIALLY_PAID'
        ? 'PARTIALLY_PAID'
        : paymentCalc.paymentStatus === 'OVERDUE'
        ? 'OVERDUE'
        : inv.status

    return {
      ...inv,
      status: currentStatus,
      paidAmount: paymentCalc.totalPaid,
      remainingBalance: paymentCalc.remainingBalance,
      customer,
      cycle,
      items,
    }
  },

  recordInvoicePayment: async (invoiceId, paymentData) => {
    await delay(250)
    checkSimulatedError()

    const invoices = Storage.getInvoices()
    const invIndex = invoices.findIndex((i) => i.id === invoiceId)
    if (invIndex === -1) throw new Error(`Invoice not found: ${invoiceId}`)

    const inv = invoices[invIndex]
    const amount = round2(Number(paymentData.amount) || 0)

    if (amount <= 0) {
      throw new Error('Payment amount must be greater than zero.')
    }
    if (amount > inv.remainingBalance + 0.01) {
      throw new Error(
        `Payment amount (₹${amount}) cannot exceed remaining balance (₹${inv.remainingBalance}).`
      )
    }

    const newPayment = {
      id: `pmt-${Date.now()}`,
      paymentNumber: `PAY-${new Date().getFullYear()}-${String(
        (inv.payments?.length || 0) + 1
      ).padStart(4, '0')}`,
      amount,
      paidAt: paymentData.paidAt || new Date().toISOString(),
      method: paymentData.method || 'NEFT',
      reference: paymentData.reference || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: paymentData.notes || '',
    }

    const updatedPayments = [...(inv.payments || []), newPayment]
    const paymentCalc = calculatePaymentStatus(inv.grandTotal, updatedPayments, inv.dueDate)

    const updatedInvoice = {
      ...inv,
      payments: updatedPayments,
      paidAmount: paymentCalc.totalPaid,
      remainingBalance: paymentCalc.remainingBalance,
      status: paymentCalc.paymentStatus,
    }

    invoices[invIndex] = updatedInvoice
    Storage.saveInvoices(invoices)

    // Activity
    const customers = Storage.getCustomers()
    const customer = customers.find((c) => c.id === inv.customerId)
    const activities = Storage.getActivities()
    activities.unshift({
      id: `act-${Date.now()}`,
      type: 'PAYMENT_RECEIVED',
      title: `Payment Received (₹${amount.toLocaleString('en-IN')})`,
      description: `${paymentData.method || 'Transfer'} received for ${inv.invoiceNumber} (${customer?.name || ''})`,
      timestamp: new Date().toISOString(),
      entityId: inv.id,
      entityType: 'INVOICE',
      badge: updatedInvoice.status === 'PAID' ? 'Paid in Full' : 'Partial Payment',
      badgeVariant: updatedInvoice.status === 'PAID' ? 'success' : 'info',
    })
    Storage.saveActivities(activities)

    return updatedInvoice
  },

  // --- Overview Dashboard Metrics ---
  getOverviewData: async () => {
    await delay()
    checkSimulatedError()

    const cycles = await MockApi.getBillingCycles()
    const invoices = await MockApi.getInvoices()
    const customers = Storage.getCustomers()
    const activities = Storage.getActivities()

    // 1. Total Billable Revenue (Sum of all completed cycles + invoiced amounts)
    const totalBillableRevenue = round2(
      cycles.reduce((acc, c) => acc + (c.billableAmount || 0), 0)
    )

    // 2. Unbilled Amount (Cycles that are DRAFT, IN_REVIEW, or READY_FOR_REVIEW)
    const unbilledAmount = round2(
      cycles
        .filter((c) => ['OPEN', 'DRAFT', 'IN_REVIEW', 'READY_FOR_REVIEW'].includes(c.status))
        .reduce((acc, c) => acc + (c.billableAmount || 0), 0)
    )

    // 3. Outstanding Balance (Invoices not yet paid)
    const outstandingBalance = round2(
      invoices.reduce((acc, inv) => acc + (inv.remainingBalance || 0), 0)
    )

    // 4. Invoices Generated
    const invoicesGeneratedCount = invoices.length

    // 5. Billing Cycle Completion %
    const closedOrInvoicedCount = cycles.filter((c) =>
      ['CLOSED', 'INVOICED'].includes(c.status)
    ).length
    const cycleCompletionRate =
      cycles.length > 0 ? Math.round((closedOrInvoicedCount / cycles.length) * 100) : 0

    // 6. Revenue Chart Data (by month / cycle breakdown)
    const revenueChartData = [
      { period: 'Jan 2026', billed: 380000, collected: 380000 },
      { period: 'Feb 2026', billed: 420000, collected: 420000 },
      { period: 'Mar 2026', billed: 740000, collected: 620000 },
      { period: 'Apr 2026', billed: 1120000, collected: 797177 },
      { period: 'May 2026', billed: 955000, collected: 485142 },
      { period: 'Jun 2026 (Est)', billed: 1250000, collected: 0 },
    ]

    // 7. Customers Requiring Attention (Action Items)
    const attentionList = []

    // A. Closed cycles awaiting invoice generation (action: Generate Invoice)
    cycles
      .filter((c) => c.status === 'CLOSED' && !c.invoiceId)
      .forEach((c) => {
        attentionList.push({
          id: `att-cls-${c.id}`,
          customerId: c.customerId,
          customerName: c.customer?.name || 'Customer',
          issue: 'Cycle closed • Invoice pending generation',
          badge: 'Invoice Pending',
          badgeVariant: 'primary',
          type: 'INVOICE_PENDING',
          link: `/cycles/${c.id}`,
          actionLabel: 'Generate Invoice',
        })
      })

    // B. Overdue unpaid invoices (action: Collect Payment)
    invoices
      .filter((inv) => inv.status === 'OVERDUE')
      .forEach((inv) => {
        attentionList.push({
          id: `att-ovd-${inv.id}`,
          customerId: inv.customerId,
          customerName: inv.customer?.name || 'Customer',
          issue: `Payment overdue by ${formatINR(inv.remainingBalance || 0)}`,
          badge: 'Overdue',
          badgeVariant: 'danger',
          type: 'OVERDUE',
          link: `/invoices/${inv.id}`,
          actionLabel: 'View Invoice',
        })
      })

    // C. Open cycles whose date period has completed (action: Review & Close)
    cycles
      .filter((c) => (c.status === 'OPEN' || c.status === 'READY_FOR_REVIEW') && new Date(c.endAt) <= new Date('2026-05-18T00:00:00.000Z'))
      .forEach((c) => {
        attentionList.push({
          id: `att-end-${c.id}`,
          customerId: c.customerId,
          customerName: c.customer?.name || 'Customer',
          issue: `Period ended (${formatDate(c.endAt, 'dd MMM')}) • Ready to close`,
          badge: 'Ready to Close',
          badgeVariant: 'warning',
          type: 'CYCLE_CLOSURE',
          link: `/cycles/${c.id}`,
          actionLabel: 'Review & Close',
        })
      })

    // D. Active open cycles currently accumulating deliveries
    cycles
      .filter((c) => (c.status === 'OPEN' || c.status === 'IN_REVIEW') && new Date(c.endAt) > new Date('2026-05-18T00:00:00.000Z'))
      .forEach((c) => {
        attentionList.push({
          id: `att-act-${c.id}`,
          customerId: c.customerId,
          customerName: c.customer?.name || 'Customer',
          issue: `Active cycle • ${c.itemsCount || 0} shipments logged`,
          badge: 'Open',
          badgeVariant: 'neutral',
          type: 'CYCLE_ACTIVE',
          link: `/cycles/${c.id}`,
          actionLabel: 'Review',
        })
      })

    return {
      metrics: {
        totalBillableRevenue,
        unbilledAmount,
        invoicesGeneratedCount,
        outstandingBalance,
        cycleCompletionRate,
        totalCyclesCount: cycles.length,
        closedCyclesCount: closedOrInvoicedCount,
      },
      revenueChartData,
      recentActivity: activities.slice(0, 7),
      attentionList,
      customersCount: customers.length,
    }
  },
}

