import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { OverviewPage } from '../features/overview/OverviewPage'
import { BillingManagementPage } from '../features/billing-cycles/BillingManagementPage'
import { CyclesPage } from '../features/billing-cycles/CyclesPage'
import { BillingPreferencesPage } from '../features/billing-cycles/BillingPreferencesPage'
import { CycleDetailPage } from '../features/billing-cycles/CycleDetailPage'
import { InvoicesPage } from '../features/invoices/InvoicesPage'
import { InvoiceDetailPage } from '../features/invoices/InvoiceDetailPage'
import { CustomersPage } from '../features/customers/CustomersPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <OverviewPage />,
      },
      {
        // Tabbed billing shell — renders tabs + <Outlet>
        path: 'cycles',
        element: <BillingManagementPage />,
        children: [
          {
            // Default tab: Billing Cycles list
            index: true,
            element: <CyclesPage />,
          },
          {
            path: 'preferences',
            element: <BillingPreferencesPage />,
          },
        ],
      },
      {
        // Cycle detail is outside the tab shell (full-page)
        path: 'cycles/:cycleId',
        element: <CycleDetailPage />,
      },
      {
        path: 'invoices',
        element: <InvoicesPage />,
      },
      {
        path: 'invoices/:invoiceId',
        element: <InvoiceDetailPage />,
      },
      {
        path: 'customers',
        element: <CustomersPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])
