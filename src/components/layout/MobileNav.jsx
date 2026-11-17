import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Layers,
  Receipt,
  Users,
  X,
  Boxes,
} from 'lucide-react'
import { cn } from '../../utils/cn'

const NAVIGATION_ITEMS = [
  {
    name: 'Overview',
    to: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Billing Cycles',
    to: '/cycles',
    icon: Layers,
    badge: 'Core',
  },
  {
    name: 'Invoices',
    to: '/invoices',
    icon: Receipt,
  },
  {
    name: 'Customers',
    to: '/customers',
    icon: Users,
  },
]

export function MobileNav({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
              <Boxes className="h-5 w-5" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-base">
              Bill<span className="text-indigo-600">Cycle</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 py-4 px-3 space-y-1">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'h-5 w-5',
                        isActive ? 'text-indigo-600' : 'text-slate-400'
                      )}
                    />
                    <span className="flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </div>
    </div>
  )
}

