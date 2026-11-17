import React from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { cn } from '../../utils/cn'

const TABS = [
  { label: 'Billing Cycles', path: '/cycles' },
  { label: 'Billing Preferences', path: '/cycles/preferences' },
]

export function BillingManagementPage() {
  const location = useLocation()

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="border-b border-slate-200/80 pb-0">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-3">
          Billing
        </h1>

        {/* Tab Bar */}
        <nav className="flex gap-0" aria-label="Billing tabs">
          {TABS.map((tab) => {
            const isActive =
              tab.path === '/cycles'
                ? location.pathname === '/cycles' ||
                  location.pathname === '/cycles/'
                : location.pathname.startsWith(tab.path)

            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                end={tab.path === '/cycles'}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  isActive
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                )}
              >
                {tab.label}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <Outlet />
    </div>
  )
}

