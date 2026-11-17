import {
  INITIAL_CUSTOMERS,
  INITIAL_CYCLES,
  INITIAL_ITEMS,
  INITIAL_INVOICES,
  INITIAL_ACTIVITIES,
} from '../data/initialData'
import { INITIAL_BILLING_PREFERENCES } from '../data/billingPreferencesData'

const STORAGE_KEYS = {
  CUSTOMERS: 'billcycle_customers_v1',
  CYCLES: 'billcycle_cycles_v1',
  ITEMS: 'billcycle_items_v1',
  INVOICES: 'billcycle_invoices_v1',
  ACTIVITIES: 'billcycle_activities_v1',
  SETTINGS: 'billcycle_settings_v1',
  BILLING_PREFERENCES: 'billcycle_billing_preferences_v1',
}

function loadOrInit(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback))
      return fallback
    }
    return JSON.parse(raw)
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage, using fallback:`, err)
    return fallback
  }
}

function save(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (err) {
    console.error(`Error saving ${key} to localStorage:`, err)
  }
}

export const Storage = {
  getCustomers: () => loadOrInit(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS),
  saveCustomers: (data) => save(STORAGE_KEYS.CUSTOMERS, data),

  getCycles: () => {
    const cycles = loadOrInit(STORAGE_KEYS.CYCLES, INITIAL_CYCLES)
    return cycles.map((c) => {
      if (c.status === 'IN_REVIEW' || c.status === 'READY_FOR_REVIEW' || c.status === 'DRAFT') {
        return { ...c, status: 'OPEN' }
      }
      return c
    })
  },
  saveCycles: (data) => save(STORAGE_KEYS.CYCLES, data),

  getItems: () => loadOrInit(STORAGE_KEYS.ITEMS, INITIAL_ITEMS),
  saveItems: (data) => save(STORAGE_KEYS.ITEMS, data),

  getInvoices: () => loadOrInit(STORAGE_KEYS.INVOICES, INITIAL_INVOICES),
  saveInvoices: (data) => save(STORAGE_KEYS.INVOICES, data),

  getActivities: () => loadOrInit(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES),
  saveActivities: (data) => save(STORAGE_KEYS.ACTIVITIES, data),

  getSettings: () =>
    loadOrInit(STORAGE_KEYS.SETTINGS, { simulateErrors: false }),
  saveSettings: (data) => save(STORAGE_KEYS.SETTINGS, data),

  getBillingPreferences: () =>
    loadOrInit(STORAGE_KEYS.BILLING_PREFERENCES, INITIAL_BILLING_PREFERENCES),
  saveBillingPreferences: (data) => save(STORAGE_KEYS.BILLING_PREFERENCES, data),

  resetToDefault: () => {
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS)
    localStorage.removeItem(STORAGE_KEYS.CYCLES)
    localStorage.removeItem(STORAGE_KEYS.ITEMS)
    localStorage.removeItem(STORAGE_KEYS.INVOICES)
    localStorage.removeItem(STORAGE_KEYS.ACTIVITIES)
    localStorage.removeItem(STORAGE_KEYS.SETTINGS)
    localStorage.removeItem(STORAGE_KEYS.BILLING_PREFERENCES)

    save(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS)
    save(STORAGE_KEYS.CYCLES, INITIAL_CYCLES)
    save(STORAGE_KEYS.ITEMS, INITIAL_ITEMS)
    save(STORAGE_KEYS.INVOICES, INITIAL_INVOICES)
    save(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES)
    save(STORAGE_KEYS.SETTINGS, { simulateErrors: false })
    save(STORAGE_KEYS.BILLING_PREFERENCES, INITIAL_BILLING_PREFERENCES)

    return true
  },
}

